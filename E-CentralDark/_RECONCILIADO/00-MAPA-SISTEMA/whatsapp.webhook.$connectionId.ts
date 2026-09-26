import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { processInboundForFlows } from "@/lib/flows.functions";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";
import { tryHandleSegredoTrigger } from "@/lib/segredo-trigger.server";
import { forwardWebhookEvent } from "@/lib/webhook-forward.server";
import { dispatchAutoMessages } from "@/lib/whatsapp-auto-messages.server";
import { downloadAndStoreWhatsappMedia, mapMessageKind } from "@/lib/whatsapp-media.server";
import { sendPushOnNewMessage } from "@/lib/notifications.server";

const META_MESSAGE_TYPES = new Set([
  "text", "image", "video", "audio", "voice", "document", "sticker", "reaction", "button",
  "interactive", "location", "contacts", "order", "system", "unsupported",
]);

function sanitizeMetaPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeMetaPayload);
  if (!value || typeof value !== "object") return value;
  const blocked = /token|secret|authorization|bearer|app_secret|access_token|verify_token|password|key/i;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      blocked.test(key) ? "[removido]" : sanitizeMetaPayload(val),
    ]),
  );
}

function compactPayload(value: unknown) {
  return sanitizeMetaPayload(value ?? {}) as Record<string, unknown>;
}

function resolveMetaMessageType(msg: { type?: string } & Record<string, unknown>) {
  if (msg.type && META_MESSAGE_TYPES.has(msg.type)) {
    if (msg.type !== "unsupported") return msg.type;
  }
  for (const type of META_MESSAGE_TYPES) {
    if (type !== "unsupported" && msg[type] !== undefined) return type;
  }
  return msg.type && META_MESSAGE_TYPES.has(msg.type) ? msg.type : "unsupported";
}



async function logEvent(opts: {
  connection_id: string;
  workspace_id: string;
  phone_number_id?: string | null;
  event_type: string;
  signature_valid: boolean | null;
  http_method: string;
  status_code: number;
  raw_payload: unknown;
  error?: string | null;
}) {
  await supabaseAdmin.from("whatsapp_webhook_events").insert({
    connection_id: opts.connection_id,
    workspace_id: opts.workspace_id,
    phone_number_id: opts.phone_number_id ?? null,
    event_type: opts.event_type,
    signature_valid: opts.signature_valid ?? false,
    http_method: opts.http_method,
    status_code: opts.status_code,
    raw_payload: compactPayload(opts.raw_payload ?? {}) as never,
    error: opts.error ?? null,
  });
}

export const Route = createFileRoute("/api/public/whatsapp/webhook/$connectionId")({
  server: {
    handlers: {
      // Verification handshake from Meta
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const { data: conn } = await supabaseAdmin
          .from("whatsapp_connections")
          .select("id,workspace_id,verify_token,phone_number_id")
          .eq("id", params.connectionId)
          .maybeSingle();
        if (!conn) return new Response("Not found", { status: 404 });

        const ok = mode === "subscribe" && token === conn.verify_token;
        await logEvent({
          connection_id: conn.id, workspace_id: conn.workspace_id,
          phone_number_id: conn.phone_number_id,
          event_type: ok ? "verify_ok" : "verify_failed",
          signature_valid: ok, http_method: "GET",
          status_code: ok ? 200 : 403,
          raw_payload: { mode, token_provided: !!token, challenge },
          error: ok ? null : "Verify token inválido ou modo incorreto",
        });
        if (!ok) {
          return new Response("Invalid verify token", {
            status: 403,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });
        }
        return new Response(challenge ?? "", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
      },

      // Inbound messages / status updates
      POST: async ({ request, params }) => {
        const { data: conn } = await supabaseAdmin
          .from("whatsapp_connections")
          .select("id,workspace_id,app_secret,phone_number_id,waba_id,webhook_signature_mode,default_sector_id,default_assignee_id,access_token")
          .eq("id", params.connectionId)
          .maybeSingle();
        if (!conn) return new Response("Not found", { status: 404 });

        const raw = await request.text();
        const sig = (request.headers.get("x-hub-signature-256") ?? "").trim();
        const secret = (conn.app_secret ?? "").trim();
        const mode = (conn.webhook_signature_mode ?? "optional") as "optional" | "required";

        let parsed: unknown = {};
        try { parsed = JSON.parse(raw); } catch { /* keep empty */ }

        // Estilo TypeSend: App Secret é opcional. Se não tiver, aceitamos pelo
        // modo compatível (connectionId + verify_token no GET + estrutura
        // válida + waba/phone batendo com a conexão). Se tiver, validamos
        // a assinatura X-Hub-Signature-256.
        let signatureValid: boolean | null = null;

        if (secret) {
          const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
          try {
            const a = Buffer.from(sig);
            const b = Buffer.from(expected);
            signatureValid = a.length === b.length && timingSafeEqual(a, b);
          } catch {
            signatureValid = false;
          }

          if (!signatureValid) {
            await logEvent({
              connection_id: conn.id, workspace_id: conn.workspace_id,
              phone_number_id: conn.phone_number_id,
              event_type: "signature_invalid",
              signature_valid: false, http_method: "POST", status_code: 403,
              raw_payload: parsed,
              error: "x-hub-signature-256 não confere — o App Secret salvo aqui não é o mesmo do app na Meta.",
            });
            return new Response("Invalid signature", { status: 403 });
          }
        } else if (mode === "required") {
          await logEvent({
            connection_id: conn.id, workspace_id: conn.workspace_id,
            phone_number_id: conn.phone_number_id,
            event_type: "signature_invalid",
            signature_valid: false, http_method: "POST", status_code: 403,
            raw_payload: parsed,
            error: "Modo de segurança 'required' está ativo, mas o App Secret não foi configurado.",
          });
          return new Response("App Secret required", { status: 403 });
        } else {
          // Modo compatível: valida estrutura mínima da Meta + bate IDs da conexão.
          const p = parsed as { object?: string; entry?: Array<{ id?: string; changes?: Array<{ value?: { metadata?: { phone_number_id?: string } } }> }> };
          const looksLikeMeta = p && (p.object === "whatsapp_business_account" || Array.isArray(p.entry));
          if (!looksLikeMeta) {
            await logEvent({
              connection_id: conn.id, workspace_id: conn.workspace_id,
              phone_number_id: conn.phone_number_id,
              event_type: "payload_invalid",
              signature_valid: null, http_method: "POST", status_code: 400,
              raw_payload: parsed,
              error: "Payload não tem estrutura de webhook da Meta.",
            });
            return new Response("Invalid payload", { status: 400 });
          }
          // Confere se algum entry/change bate com waba_id ou phone_number_id da conexão.
          const wabaMatches = (p.entry ?? []).some((e) => !e.id || !conn.waba_id || e.id === conn.waba_id);
          const phoneMatches = (p.entry ?? []).some((e) =>
            (e.changes ?? []).some((c) => {
              const pid = c.value?.metadata?.phone_number_id;
              return !pid || !conn.phone_number_id || pid === conn.phone_number_id;
            }),
          );
          if (!wabaMatches && !phoneMatches) {
            await logEvent({
              connection_id: conn.id, workspace_id: conn.workspace_id,
              phone_number_id: conn.phone_number_id,
              event_type: "id_mismatch",
              signature_valid: null, http_method: "POST", status_code: 403,
              raw_payload: parsed,
              error: "WABA ID e Phone Number ID do payload não batem com a conexão.",
            });
            return new Response("ID mismatch", { status: 403 });
          }
          // Aceita — registra aviso de modo compatível.
          await logEvent({
            connection_id: conn.id, workspace_id: conn.workspace_id,
            phone_number_id: conn.phone_number_id,
            event_type: "accepted_no_signature",
            signature_valid: null, http_method: "POST", status_code: 200,
            raw_payload: { security_mode: mode, warning: "App Secret ausente — webhook aceito pelo modo compatível." },
          });
        }

        await supabaseAdmin.from("whatsapp_connections")
          .update({ last_webhook_at: new Date().toISOString() }).eq("id", conn.id);

        // 🔁 Reenvia o evento bruto pra destinos externos (n8n, outro Supabase, etc.)
        // Fire-and-forget: erros aqui NÃO afetam a resposta pra Meta.
        forwardWebhookEvent({
          connectionId: conn.id,
          phoneNumberId: conn.phone_number_id,
          rawBody: raw,
          metaSignature: sig,
        }).catch(() => { /* engolido — já loga internamente */ });

        type InteractiveReply = {
          button_reply?: { id: string; title: string };
          list_reply?: { id: string; title: string; description?: string };
        };
        type MediaPayload = { id: string; mime_type?: string; sha256?: string; caption?: string; filename?: string; voice?: boolean; animated?: boolean };
        type WebhookBody = {
          entry?: Array<{
            changes?: Array<{
              field?: string;
              value?: {
                metadata?: { phone_number_id?: string };
                messages?: Array<{
                  id: string;
                  from: string;
                  timestamp: string;
                  type: string;
                  text?: { body?: string };
                  image?: MediaPayload;
                  video?: MediaPayload;
                  audio?: MediaPayload & { voice?: boolean };
                  voice?: MediaPayload;
                  document?: MediaPayload;
                  sticker?: MediaPayload;
                  location?: { latitude: number; longitude: number; name?: string; address?: string };
                  contacts?: Array<{ name?: { formatted_name?: string }; phones?: Array<{ phone?: string; wa_id?: string }> }>;
                  reaction?: { message_id: string; emoji: string };
                  button?: { text: string; payload: string };
                  interactive?: InteractiveReply;
                  order?: Record<string, unknown>;
                  system?: Record<string, unknown>;
                  errors?: Array<{ code: number; title?: string; message: string }>;
                  context?: { from?: string; id?: string };
                }>;
                statuses?: Array<{ id: string; status: string; recipient_id: string; errors?: Array<{ code: number; message: string }> }>;
                contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
              };
            }>;
          }>;
        };
        const payload = parsed as WebhookBody;

        let summary = "delivered";
        let inboundCount = 0;
        let statusCount = 0;
        let dedupedCount = 0;

        for (const entry of payload.entry ?? []) {
          for (const change of entry.changes ?? []) {
            const v = change.value;
            if (!v) continue;
            const phoneNumberId = v.metadata?.phone_number_id ?? conn.phone_number_id;

            // 🛡️ Filtro defensivo: se a conexão tem um phone_number_id definido e
            // a Meta enviou um evento de OUTRO número (mesma WABA, número diferente),
            // descarta sem criar contato/ticket/mensagem. Loga pra ficar visível.
            if (
              conn.phone_number_id &&
              phoneNumberId &&
              phoneNumberId !== conn.phone_number_id
            ) {
              await logEvent({
                connection_id: conn.id,
                workspace_id: conn.workspace_id,
                phone_number_id: phoneNumberId,
                event_type: "filtered_other_number",
                signature_valid: true,
                http_method: "POST",
                status_code: 200,
                raw_payload: { received_phone_number_id: phoneNumberId, expected: conn.phone_number_id },
                error: `Evento de outro número da mesma WABA (recebido=${phoneNumberId}, esperado=${conn.phone_number_id}) — descartado`,
              });
              continue;
            }

            // Mensagens recebidas
            for (const msg of v.messages ?? []) {
              // Extrai corpo legível, texto efetivo p/ chatbot e mídia (id Meta).
              let body: string;
              let effectiveText: string | null = null;
              let mediaIdToFetch: string | null = null;
              let mediaDirectUrl: string | null = null;
              let mediaMimeHint: string | null = null;
              let mediaFilenameHint: string | undefined;
              let mediaCaption: string | undefined;
              const metaType = resolveMetaMessageType(msg as never);
              const sanitizedMessagePayload = compactPayload({
                message: msg,
                timestamp: msg.timestamp,
                from: msg.from,
                metadata: { phone_number_id: phoneNumberId },
              });

              switch (metaType) {
                case "text":
                  body = msg.text?.body ?? "";
                  effectiveText = msg.text?.body ?? null;
                  break;
                case "interactive":
                  if (msg.interactive?.button_reply) {
                    body = `Botão selecionado: ${msg.interactive.button_reply.title}`;
                    effectiveText = msg.interactive.button_reply.id;
                  } else if (msg.interactive?.list_reply) {
                    body = `Opção selecionada: ${msg.interactive.list_reply.title}`;
                    effectiveText = msg.interactive.list_reply.id;
                  } else {
                    body = "Mensagem interativa recebida";
                  }
                  break;
                case "button":
                  body = `Resposta de botão: ${msg.button?.text ?? "—"}`;
                  effectiveText = msg.button?.payload ?? msg.button?.text ?? null;
                  break;
                case "image":
                  body = msg.image?.caption ?? "📷 Imagem";
                  mediaIdToFetch = msg.image?.id ?? null;
                  mediaDirectUrl = (msg.image as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.image?.mime_type ?? null;
                  mediaCaption = msg.image?.caption;
                  break;
                case "sticker":
                  body = msg.sticker?.animated ? "💫 Figurinha animada" : "🩹 Figurinha";
                  mediaIdToFetch = msg.sticker?.id ?? null;
                  mediaDirectUrl = (msg.sticker as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.sticker?.mime_type ?? null;
                  break;
                case "video":
                  body = msg.video?.caption ?? "🎥 Vídeo";
                  mediaIdToFetch = msg.video?.id ?? null;
                  mediaDirectUrl = (msg.video as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.video?.mime_type ?? null;
                  mediaCaption = msg.video?.caption;
                  break;
                case "audio":
                  body = msg.audio?.voice ? "🎙️ Mensagem de voz" : "🎵 Áudio";
                  mediaIdToFetch = msg.audio?.id ?? null;
                  mediaDirectUrl = (msg.audio as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.audio?.mime_type ?? null;
                  break;
                case "voice":
                  body = "🎙️ Mensagem de voz";
                  mediaIdToFetch = msg.voice?.id ?? null;
                  mediaDirectUrl = (msg.voice as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.voice?.mime_type ?? null;
                  break;
                case "document": {
                  const fname = msg.document?.filename;
                  body = fname ? `📎 ${fname}` : "📎 Documento";
                  mediaIdToFetch = msg.document?.id ?? null;
                  mediaDirectUrl = (msg.document as MediaPayload & { url?: string } | undefined)?.url ?? null;
                  mediaMimeHint = msg.document?.mime_type ?? null;
                  mediaFilenameHint = fname;
                  mediaCaption = msg.document?.caption;
                  break;
                }
                case "location": {
                  const loc = msg.location;
                  if (loc) {
                    const label = [loc.name, loc.address].filter(Boolean).join(" — ");
                    body = `📍 ${label || `Localização (${loc.latitude}, ${loc.longitude})`}\nhttps://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
                  } else {
                    body = "📍 Localização";
                  }
                  break;
                }
                case "contacts": {
                  const list = (msg.contacts ?? []).map((c) => {
                    const n = c.name?.formatted_name ?? "Contato";
                    const ph = c.phones?.[0]?.phone ?? c.phones?.[0]?.wa_id ?? "";
                    return ph ? `👤 ${n} — ${ph}` : `👤 ${n}`;
                  });
                  body = list.length ? list.join("\n") : "👤 Contato";
                  break;
                }
                case "reaction":
                  body = msg.reaction?.emoji ? `${msg.reaction.emoji} Reação` : "❤️ Reação recebida";
                  break;
                case "order":
                  body = "Pedido recebido pelo WhatsApp";
                  break;
                case "system":
                  body = "Mensagem de sistema recebida";
                  break;
                case "unsupported":
                  body = "Mensagem recebida, mas este tipo ainda não é exibido no MultiZap.";
                  break;
                default:
                  body = "Mensagem recebida, mas este tipo ainda não é exibido no MultiZap.";
              }

              // 🛡️ Idempotência: tenta gravar primeiro no whatsapp_message_log
              // (índice único parcial em connection_id + message_id pra inbound).
              // Se já existir, ignora silenciosamente — a Meta reenviou.
              const { error: logErr } = await supabaseAdmin
                .from("whatsapp_message_log")
                .insert({
                  workspace_id: conn.workspace_id, connection_id: conn.id,
                  direction: "inbound", contact_phone: msg.from,
                  message_id: msg.id, body, message_type: msg.type, status: "delivered",
                  raw_payload_sanitized: sanitizedMessagePayload as never,
                  meta_timestamp: msg.timestamp,
                  meta_from: msg.from,
                  meta_phone_number_id: phoneNumberId,
                });
              if (logErr) {
                // 23505 = unique_violation (duplicado)
                const code = (logErr as { code?: string }).code;
                if (code === "23505") {
                  dedupedCount++;
                  continue;
                }
                // Outro erro: loga e segue sem duplicar trabalho
                await logEvent({
                  connection_id: conn.id, workspace_id: conn.workspace_id,
                  phone_number_id: conn.phone_number_id,
                  event_type: "log_insert_error", signature_valid: true,
                  http_method: "POST", status_code: 200,
                  raw_payload: { message_id: msg.id }, error: logErr.message,
                });
                continue;
              }

              if (metaType === "unsupported" || !META_MESSAGE_TYPES.has(msg.type)) {
                await logEvent({
                  connection_id: conn.id, workspace_id: conn.workspace_id,
                  phone_number_id: phoneNumberId,
                  event_type: "unsupported_message_received",
                  signature_valid: true, http_method: "POST", status_code: 200,
                  raw_payload: sanitizedMessagePayload,
                  error: `Tipo recebido: ${msg.type || "desconhecido"}`,
                });
              }

              inboundCount++;
              const contactName = v.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name ?? null;

              // Upsert contato
              let contactId: string | null = null;
              const { data: existing } = await supabaseAdmin
                .from("contacts").select("id")
                .eq("workspace_id", conn.workspace_id).eq("phone", msg.from).maybeSingle();
              if (existing) {
                contactId = existing.id;
              } else {
                const { data: ins } = await supabaseAdmin.from("contacts")
                  .insert({ workspace_id: conn.workspace_id, phone: msg.from, name: contactName ?? msg.from })
                  .select("id").single();
                contactId = ins?.id ?? null;
              }
              if (!contactId) continue;

              // ─── Histórico único por contato ──────────────────────────
              // Procura ticket aberto desse contato (qualquer conexão/setor).
              // Se vier de outro canal, atualiza tickets.connection_id (último canal usado).
              const { data: openTicket } = await supabaseAdmin
                .from("tickets").select("id, status, connection_id")
                .eq("workspace_id", conn.workspace_id)
                .eq("contact_id", contactId)
                .in("status", ["open", "in_progress", "waiting_client"])
                .order("last_message_at", { ascending: false }).limit(1).maybeSingle();
              let ticketId = openTicket?.id;
              const isFirstMessageInTicket = !ticketId;
              if (ticketId) {
                if (openTicket?.connection_id !== conn.id) {
                  await supabaseAdmin.from("tickets")
                    .update({ connection_id: conn.id, phone_number_id: phoneNumberId })
                    .eq("id", ticketId);
                }
              } else {
                // Tenta reabrir o último fechado/resolvido (mesmo de outro canal).
                const { data: lastClosed } = await supabaseAdmin
                  .from("tickets").select("id")
                  .eq("workspace_id", conn.workspace_id)
                  .eq("contact_id", contactId)
                  .order("created_at", { ascending: false }).limit(1).maybeSingle();
                if (lastClosed?.id) {
                  ticketId = lastClosed.id;
                  await supabaseAdmin.from("tickets")
                    .update({
                      status: "open", resolved_at: null, closed_at: null,
                      connection_id: conn.id, phone_number_id: phoneNumberId,
                    })
                    .eq("id", ticketId);
                } else {
                  const { data: t } = await supabaseAdmin.from("tickets")
                    .insert({
                      workspace_id: conn.workspace_id,
                      contact_id: contactId,
                      channel: "whatsapp",
                      status: "open",
                      connection_id: conn.id,
                      phone_number_id: phoneNumberId,
                      sector_id: conn.default_sector_id ?? null,
                      assignee_id: conn.default_assignee_id ?? null,
                    })
                    .select("id").single();
                  ticketId = t?.id;
                }
              }
              if (!ticketId) continue;


              // Vincula a mensagem (já gravada) ao ticket que acabamos de descobrir/criar
              await supabaseAdmin.from("whatsapp_message_log")
                .update({ ticket_id: ticketId })
                .eq("message_id", msg.id)
                .eq("connection_id", conn.id);

              // Saudação/ausente em fire-and-forget — não trava o webhook
              dispatchAutoMessages({
                connectionId: conn.id,
                workspaceId: conn.workspace_id,
                contactPhone: msg.from,
                ticketId,
                isFirstMessageInTicket,
              }).catch(() => { /* já loga internamente */ });

              // ⚡ Webhook rápido: insere a mensagem JÁ (sem mídia) pra o Realtime
              // entregar no painel sem esperar o download da Meta. A mídia desce
              // em background e dá UPDATE na mesma linha quando termina.
              const finalBody = mediaCaption || body;
              const hasMediaToFetch = !!((mediaIdToFetch || mediaDirectUrl) && conn.access_token);
              const { data: insertedMsg } = await supabaseAdmin
                .from("ticket_messages")
                .insert({
                  workspace_id: conn.workspace_id, ticket_id: ticketId,
                  author: "contact",
                  kind: mapMessageKind(msg.type),
                  body: finalBody,
                  media_url: null,
                  media_mime: mediaMimeHint ?? null,
                  meta_message_type: metaType,
                  raw_payload_sanitized: sanitizedMessagePayload as never,
                  external_id: msg.id, delivery: "delivered",
                  connection_id: conn.id,
                  provider: "meta_cloud",
                  channel_type: "private",
                })
                .select("id")
                .single();

              const insertedMessageId = insertedMsg?.id ?? null;

              if (hasMediaToFetch && insertedMessageId) {
                // 🚀 Fire-and-forget: baixa da Meta, sobe no Storage e atualiza
                // a mensagem. NÃO segura a resposta pra Meta (evita timeout 10s).
                void (async () => {
                  try {
                    const dl = await downloadAndStoreWhatsappMedia({
                      mediaId: mediaIdToFetch,
                      directUrl: mediaDirectUrl,
                      mimeHint: mediaMimeHint,
                      accessToken: conn.access_token!,
                      workspaceId: conn.workspace_id,
                      ticketId,
                      filenameHint: mediaFilenameHint,
                    });
                    if (dl) {
                      await supabaseAdmin
                        .from("ticket_messages")
                        .update({ media_url: dl.url, media_mime: dl.mime })
                        .eq("id", insertedMessageId);
                      await logEvent({
                        connection_id: conn.id, workspace_id: conn.workspace_id,
                        phone_number_id: phoneNumberId,
                        event_type: "media_render_success",
                        signature_valid: true, http_method: "POST", status_code: 200,
                        raw_payload: { message_id: msg.id, type: msg.type, mime: dl.mime, filename: dl.filename ?? mediaFilenameHint ?? null, background: true },
                      });
                    } else {
                      await logEvent({
                        connection_id: conn.id, workspace_id: conn.workspace_id,
                        phone_number_id: phoneNumberId,
                        event_type: "media_download_failed",
                        signature_valid: true, http_method: "POST", status_code: 200,
                        raw_payload: { message_id: msg.id, media_id: mediaIdToFetch, type: msg.type, background: true },
                        error: "Falha ao baixar mídia da Meta (background)",
                      });
                    }
                  } catch (err) {
                    await logEvent({
                      connection_id: conn.id, workspace_id: conn.workspace_id,
                      phone_number_id: phoneNumberId,
                      event_type: "media_download_failed",
                      signature_valid: true, http_method: "POST", status_code: 200,
                      raw_payload: { message_id: msg.id, media_id: mediaIdToFetch, type: msg.type, background: true },
                      error: `Erro inesperado no download em background: ${String(err)}`,
                    });
                  }
                })();
              }

              // 🔔 Dispara push pros atendentes (fire-and-forget — não trava o webhook).
              sendPushOnNewMessage({
                workspaceId: conn.workspace_id,
                conversationId: ticketId,
                connectionId: conn.id,
                contactName: contactName ?? msg.from,
                preview: finalBody,
                assigneeUserId: conn.default_assignee_id ?? null,
              }).catch(() => { /* erros ficam em notification_events */ });

              // Auto-reply via chatbot — texto puro OU clique de botão/lista
              if (effectiveText) {
                // 💸 Parser financeiro inbound (cliente). Roda ANTES do chatbot —
                // se o cliente mandou "pix 50" / "status pagamento" / "paguei",
                // o robô responde e pulamos chatbot pra não duplicar reply.
                try {
                  const { runChatPaymentCommandInternal } = await import("@/lib/chat-payments.functions");
                  const cmd = await runChatPaymentCommandInternal({
                    ticketId,
                    body: effectiveText,
                    mode: "customer",
                    messageExternalId: msg.id,
                  });
                  if (cmd.kind === "reply") {
                    const dispatch = await dispatchWhatsAppMessage({
                      connectionId: conn.id,
                      to: msg.from,
                      text: cmd.message,
                      ticketId,
                    });
                    // Grava resposta do robô no chat (autor system) pra aparecer no painel
                    await supabaseAdmin.from("ticket_messages").insert({
                      workspace_id: conn.workspace_id,
                      ticket_id: ticketId,
                      author: "system",
                      kind: "text",
                      body: cmd.message,
                      delivery: dispatch.ok ? "sent" : "failed",
                      external_id: dispatch.ok ? dispatch.messageId : null,
                    });
                    await supabaseAdmin.from("audit_log").insert({
                      workspace_id: conn.workspace_id,
                      action: "system:chat_payment_inbound",
                      category: "system",
                      payload: {
                        ticket_id: ticketId,
                        command: cmd.commandName,
                        pix_id: cmd.pixId ?? null,
                        dispatch_ok: dispatch.ok,
                        dispatch_error: dispatch.ok ? null : dispatch.message,
                        message_id: msg.id,
                      } as never,
                    });
                    continue; // não cai no chatbot
                  }
                } catch (e) {
                  await supabaseAdmin.from("audit_log").insert({
                    workspace_id: conn.workspace_id,
                    action: "system:chat_payment_inbound_error",
                    category: "system",
                    payload: { error: String(e), contact: msg.from, ticket_id: ticketId } as never,
                  });
                  // segue pra chatbot — não trava o webhook
                }

                // 🔐 Gatilho global do Modo Segredo (super admin via Zap)
                try {
                  const consumed = await tryHandleSegredoTrigger({
                    fromPhone: msg.from,
                    body: effectiveText,
                    connectionId: conn.id,
                  });
                  if (consumed) continue;
                } catch (e) {
                  await supabaseAdmin.from("audit_log").insert({
                    action: "admin:segredo_trigger_error",
                    payload: { error: String(e), from: msg.from } as never,
                    category: "system",
                  });
                }
                try {
                  const proc = await processInboundForFlows(conn.workspace_id, msg.from, effectiveText);
                  if (proc) {
                    const result = await dispatchWhatsAppMessage({
                      connectionId: conn.id,
                      to: msg.from,
                      text: proc.reply,
                      ticketId,
                    });
                    await supabaseAdmin.from("chatbot_flows").update({
                      hits_count: (proc.flow.hits_count ?? 0) + 1,
                      last_triggered_at: new Date().toISOString(),
                    }).eq("id", proc.flow.id);
                    await supabaseAdmin.from("audit_log").insert({
                      workspace_id: conn.workspace_id,
                      action: proc.sessionAdvanced ? "system:chatbot_step_advanced" : "system:chatbot_flow_triggered",
                      payload: {
                        flow_id: proc.flow.id, flow_name: proc.flow.name,
                        contact: msg.from, matched_text: effectiveText.slice(0, 200),
                        multi_step: proc.flow.is_multi_step ?? false,
                        dispatch_ok: result.ok,
                        dispatch_error: result.ok ? null : result.message,
                      } as never,
                    });
                  }
                } catch (e) {
                  await supabaseAdmin.from("audit_log").insert({
                    workspace_id: conn.workspace_id,
                    action: "system:chatbot_flow_error",
                    payload: { error: String(e), contact: msg.from } as never,
                  });
                }
              }
            }


            // Delivery / read / failed status updates
            for (const st of v.statuses ?? []) {
              statusCount++;
              await supabaseAdmin.from("whatsapp_message_log").update({
                status: st.status,
                error_code: st.errors?.[0]?.code ? String(st.errors[0].code) : null,
                error_message: st.errors?.[0]?.message ?? null,
              }).eq("message_id", st.id).eq("connection_id", conn.id);
            }
          }
        }

        if (inboundCount > 0 && statusCount > 0) summary = "message+status";
        else if (inboundCount > 0) summary = "message";
        else if (statusCount > 0) summary = "status";
        else if (dedupedCount > 0) summary = "deduped";

        await logEvent({
          connection_id: conn.id, workspace_id: conn.workspace_id,
          phone_number_id: conn.phone_number_id,
          event_type: summary, signature_valid: true,
          http_method: "POST", status_code: 200,
          raw_payload: dedupedCount > 0 ? { ...(parsed as object), _deduped: dedupedCount } : parsed,
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
