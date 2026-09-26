// Helper server-only pra disparar mensagens.
// Roteia por connection.provider entre:
//   - meta_cloud         → Meta Cloud API oficial (graph.facebook.com)
//   - wuzapi_gateway     → MultiZap QR / WuzAPI (via MULTIZAP_GATEWAY_URL)
//   - baileys_selfhosted → Adapter Baileys self-hosted (master_settings.baileys_*)
// NUNCA roteia pra Recargas Brasil (/root/whatsapp-server, porta 3000, PM2 whatsapp-server).
// Usado por sendWhatsAppMessage (workspace) e tickets.sendMessage (inbox).
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { metaCloudBreaker } from "@/lib/circuit-breaker";
import { sendBaileysMessage } from "@/lib/whatsapp/providers/baileys-selfhosted.server";

import { formatTimeBR } from "@/lib/datetime";
const META_API = "https://graph.facebook.com/v22.0";
const HOURLY_LIMIT = 250;
const META_REQUEST_TIMEOUT_MS = 8_000;

export type MediaInput = {
  type: "image" | "video" | "audio" | "document";
  link: string;
  caption?: string;
  filename?: string;
};

export type InteractiveButton = { id: string; title: string };

export type DispatchInput = {
  connectionId: string;
  to: string;
  text?: string;
  templateName?: string;
  templateLang?: string;
  ticketId?: string | null;
  /** Envio de mídia (imagem/vídeo/áudio/documento) por link público. */
  media?: MediaInput;
  /** Mensagem interativa com botões de resposta (até 3). */
  interactive?: { bodyText: string; buttons: InteractiveButton[] };
};

export type DispatchResult =
  | { ok: true; messageId: string | null; usedConnectionId?: string; fallback?: boolean }
  | { ok: false; code: "OUT_OF_WINDOW" | "COOLDOWN" | "RATE_LIMIT" | "META_ERROR" | "NOT_FOUND" | "BLOCKED" | "CIRCUIT_OPEN" | "TIMEOUT" | "NETWORK" | "NO_CHANNEL_AVAILABLE"; message: string };

/**
 * Roteador inteligente de canal de envio.
 *
 * Regra (histórico único por contato):
 *   1. Conexão atual do ticket é QR/Baileys conectado → usa.
 *   2. Conexão atual é Meta e está dentro da janela 24h → usa Meta.
 *   3. Conexão atual é Meta fora da janela 24h → procura QR ativo no workspace; se achar, usa QR.
 *   4. Conexão atual não existe/desconectada → procura QR ativo no workspace.
 *   5. Nenhum canal disponível → erro NO_CHANNEL_AVAILABLE.
 *
 * Meta Cloud NÃO é fallback livre. QR pode assumir atendimento antigo.
 */
export type ResolvedChannel =
  | { ok: true; connectionId: string; reason: "primary" | "fallback_qr"; previousConnectionId?: string }
  | { ok: false; code: "OUT_OF_WINDOW" | "NO_CHANNEL_AVAILABLE"; message: string };

export async function resolveSendChannel(input: {
  workspaceId: string;
  ticketConnectionId: string | null;
  contactPhone: string;
}): Promise<ResolvedChannel> {
  const { workspaceId, ticketConnectionId, contactPhone } = input;

  const findActiveQr = async () => {
    const { data } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,provider,status")
      .eq("workspace_id", workspaceId)
      .in("provider", ["wuzapi_gateway", "multizap_qr", "baileys_selfhosted"])
      .eq("status", "connected")
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  };

  // 1) Conexão atual do ticket
  if (ticketConnectionId) {
    const { data: cur } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,provider,status")
      .eq("id", ticketConnectionId)
      .maybeSingle();

    if (cur) {
      const isQr = cur.provider === "wuzapi_gateway" || cur.provider === "multizap_qr" || cur.provider === "baileys_selfhosted";
      const isMeta = cur.provider === "meta_cloud";

      if (isQr && cur.status === "connected") {
        return { ok: true, connectionId: cur.id, reason: "primary" };
      }

      if (isMeta) {
        // Janela 24h
        const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
        const { data: lastIn } = await supabaseAdmin
          .from("whatsapp_message_log")
          .select("id")
          .eq("connection_id", cur.id)
          .eq("contact_phone", contactPhone)
          .eq("direction", "inbound")
          .gte("created_at", since)
          .limit(1)
          .maybeSingle();
        if (lastIn) {
          return { ok: true, connectionId: cur.id, reason: "primary" };
        }
        // Meta fora da janela: tenta QR ativo
        const qrId = await findActiveQr();
        if (qrId) {
          return { ok: true, connectionId: qrId, reason: "fallback_qr", previousConnectionId: cur.id };
        }
        return {
          ok: false,
          code: "OUT_OF_WINDOW",
          message: "Fora da janela de 24h do WhatsApp Meta e nenhum QR ativo disponível.",
        };
      }
    }
    // Conexão atual sumiu ou está desconectada (QR caído etc): tenta QR ativo
    const qrId = await findActiveQr();
    if (qrId) {
      return { ok: true, connectionId: qrId, reason: "fallback_qr", previousConnectionId: ticketConnectionId };
    }
  } else {
    // Ticket sem conexão: qualquer QR ativo serve
    const qrId = await findActiveQr();
    if (qrId) {
      return { ok: true, connectionId: qrId, reason: "primary" };
    }
  }

  return {
    ok: false,
    code: "NO_CHANNEL_AVAILABLE",
    message: "Nenhum canal WhatsApp disponível pra enviar (sem QR ativo nem Meta dentro da janela).",
  };
}

/**
 * Envio inteligente: descobre o melhor canal pra responder este ticket e dispara.
 * Faz fallback automático Meta→QR quando estiver fora da janela 24h e houver QR ativo.
 * Loga em audit_log quando faz fallback (visibilidade pro master).
 */
export async function dispatchByTicket(
  ticketId: string,
  payload: Omit<DispatchInput, "connectionId">,
): Promise<DispatchResult> {
  const { data: t } = await supabaseAdmin
    .from("tickets")
    .select("id, workspace_id, connection_id, contact:contacts(phone)")
    .eq("id", ticketId)
    .maybeSingle();
  if (!t) return { ok: false, code: "NOT_FOUND", message: "Ticket não encontrado." };

  const phone = (t.contact as { phone?: string } | null)?.phone ?? payload.to ?? "";
  const resolved = await resolveSendChannel({
    workspaceId: t.workspace_id,
    ticketConnectionId: t.connection_id,
    contactPhone: phone,
  });

  if (!resolved.ok) {
    return { ok: false, code: resolved.code, message: resolved.message };
  }

  // Auditoria de fallback Meta→QR
  if (resolved.reason === "fallback_qr" && resolved.previousConnectionId) {
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: t.workspace_id,
      action: "system:send_channel_fallback",
      payload: {
        ticket_id: ticketId,
        from_connection: resolved.previousConnectionId,
        to_connection: resolved.connectionId,
        reason: "out_of_window_or_disconnected",
      } as never,
    });
  }

  const result = await dispatchWhatsAppMessage({
    ...payload,
    ticketId,
    connectionId: resolved.connectionId,
  });

  if (result.ok) {
    return { ...result, usedConnectionId: resolved.connectionId, fallback: resolved.reason === "fallback_qr" };
  }
  return result;
}



export async function dispatchWhatsAppMessage(input: DispatchInput): Promise<DispatchResult> {
  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,phone_number_id,access_token,status,provider")
    .eq("id", input.connectionId).single();
  if (!conn) return { ok: false, code: "NOT_FOUND", message: "Conexão não encontrada." };

  // 🔀 Roteador por provider.
  // MultiZap QR / WuzAPI: usa o adapter dedicado, que fala HTTPS com o
  // MultiZap-Gateway (MULTIZAP_GATEWAY_URL). NUNCA cai no Meta Cloud nem no
  // Baileys antigo do Recargas Brasil (/root/whatsapp-server, porta 3000).
  if (conn.provider === "wuzapi_gateway" || conn.provider === "multizap_qr") {
    const { sendWuzapiMessage } = await import("@/lib/whatsapp/providers/wuzapi-gateway.server");
    return sendWuzapiMessage(input);
  }
  // Baileys self-hosted (genérico): delega pro dispatcher próprio configurado
  // em master_settings.baileys_server_url (NUNCA pra /root/whatsapp-server do Recargas).
  if (conn.provider === "baileys_selfhosted") {
    if (input.templateName) {
      return {
        ok: false,
        code: "BLOCKED",
        message: "Templates Meta só funcionam em conexões oficiais. Use texto livre no Baileys.",
      };
    }
    return sendBaileysMessage(input);
  }
  // Default: Meta Cloud API. Só atingível por provider 'meta_cloud'.
  if (conn.provider !== "meta_cloud") {
    return {
      ok: false,
      code: "BLOCKED",
      message: `Provider '${conn.provider}' não suportado pra envio. Providers válidos: meta_cloud, wuzapi_gateway, baileys_selfhosted.`,
    };
  }
  const { data: ctrl } = await supabaseAdmin
    .from("workspace_controls")
    .select("is_paused,block_whatsapp_send,block_whatsapp_media,block_whatsapp_interactive,paused_reason")
    .eq("workspace_id", conn.workspace_id).maybeSingle();
  if (ctrl?.is_paused) {
    return { ok: false, code: "BLOCKED", message: ctrl.paused_reason ? `Conta pausada pelo administrador: ${ctrl.paused_reason}` : "Conta pausada pelo administrador." };
  }
  if (ctrl?.block_whatsapp_send) {
    return { ok: false, code: "BLOCKED", message: "Envio de WhatsApp bloqueado pelo administrador." };
  }
  if (input.media && ctrl?.block_whatsapp_media) {
    return { ok: false, code: "BLOCKED", message: "Envio de mídia bloqueado pelo administrador." };
  }
  if (input.interactive && ctrl?.block_whatsapp_interactive) {
    return { ok: false, code: "BLOCKED", message: "Envio de mensagens com botões bloqueado pelo administrador." };
  }

  const now = new Date();
  const isTemplate = !!input.templateName;
  const isMedia = !!input.media;
  const isInteractive = !!input.interactive;

  // Rate / cooldown
  const { data: rate } = await supabaseAdmin
    .from("whatsapp_rate_state").select("*").eq("connection_id", conn.id).maybeSingle();
  if (rate?.cooldown_until && new Date(rate.cooldown_until) > now) {
    return { ok: false, code: "COOLDOWN", message: `Em cooldown anti-ban até ${formatTimeBR(rate.cooldown_until)}.` };
  }
  const currentHour = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000).toISOString();
  const hourCount = rate && rate.hour_bucket === currentHour ? rate.hour_count : 0;
  if (hourCount >= HOURLY_LIMIT) {
    return { ok: false, code: "RATE_LIMIT", message: `Limite anti-ban atingido (${HOURLY_LIMIT}/h).` };
  }

  // Verificação da janela de 24h: vale pra qualquer envio livre (texto, mídia ou interativo).
  // Templates são liberados sempre.
  if (!isTemplate) {
    const since = new Date(now.getTime() - 24 * 3_600_000).toISOString();
    const { data: lastIn } = await supabaseAdmin
      .from("whatsapp_message_log")
      .select("id,created_at")
      .eq("connection_id", conn.id)
      .eq("contact_phone", input.to)
      .eq("direction", "inbound")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1).maybeSingle();
    if (!lastIn) {
      const reason = "Fora da janela de 24h. Envie um template aprovado para reabrir a conversa.";
      await supabaseAdmin.from("whatsapp_message_log").insert({
        workspace_id: conn.workspace_id, connection_id: conn.id,
        direction: "outbound", contact_phone: input.to, ticket_id: input.ticketId ?? null,
        body: input.text ?? input.media?.caption ?? input.interactive?.bodyText ?? null,
        message_type: isMedia ? input.media!.type : isInteractive ? "interactive" : "text",
        status: "blocked", error_code: "OUT_OF_WINDOW",
        error_message: reason, is_template: false,
      });
      return { ok: false, code: "OUT_OF_WINDOW", message: reason };
    }
  }

  // Monta payload conforme tipo de mensagem
  let payload: Record<string, unknown>;
  let logMessageType = "text";

  if (isTemplate) {
    payload = {
      messaging_product: "whatsapp",
      to: input.to,
      type: "template",
      template: { name: input.templateName, language: { code: input.templateLang ?? "pt_BR" } },
    };
    logMessageType = "template";
  } else if (isMedia) {
    const m = input.media!;
    payload = {
      messaging_product: "whatsapp",
      to: input.to,
      type: m.type,
      [m.type]: {
        link: m.link,
        ...(m.caption && m.type !== "audio" ? { caption: m.caption } : {}),
        ...(m.filename && m.type === "document" ? { filename: m.filename } : {}),
      },
    };
    logMessageType = m.type;
  } else if (isInteractive) {
    const it = input.interactive!;
    payload = {
      messaging_product: "whatsapp",
      to: input.to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: it.bodyText.slice(0, 1024) },
        action: {
          buttons: it.buttons.slice(0, 3).map((b) => ({
            type: "reply",
            reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
          })),
        },
      },
    };
    logMessageType = "interactive";
  } else {
    payload = {
      messaging_product: "whatsapp",
      to: input.to,
      type: "text",
      text: { preview_url: false, body: input.text ?? "" },
    };
    logMessageType = "text";
  }

  // Circuit breaker: se a Meta tá quebrada (várias falhas seguidas), corta cedo.
  if (!metaCloudBreaker.canProceed()) {
    return { ok: false, code: "CIRCUIT_OPEN", message: "Meta Cloud API instável no momento. Tente em alguns segundos." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), META_REQUEST_TIMEOUT_MS);
  let res: Response;
  let respBody: Record<string, unknown>;
  try {
    res = await fetch(`${META_API}/${conn.phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    respBody = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  } catch (e) {
    clearTimeout(timeoutId);
    metaCloudBreaker.recordFailure();
    const isTimeout = (e as { name?: string })?.name === "AbortError";
    const errMsg = isTimeout ? "Timeout ao contatar a Meta Cloud API." : `Falha de rede ao enviar: ${String(e).slice(0, 200)}`;
    const consec = (rate?.consecutive_errors ?? 0) + 1;
    const cooldownUntil = new Date(now.getTime() + Math.min(consec * 2, 60) * 60_000).toISOString();
    await supabaseAdmin.from("whatsapp_rate_state").upsert({
      connection_id: conn.id, workspace_id: conn.workspace_id,
      hour_bucket: currentHour, hour_count: hourCount,
      cooldown_until: cooldownUntil,
      consecutive_errors: consec, updated_at: now.toISOString(),
    });
    await supabaseAdmin.from("whatsapp_message_log").insert({
      workspace_id: conn.workspace_id, connection_id: conn.id,
      direction: "outbound", contact_phone: input.to, ticket_id: input.ticketId ?? null,
      body: input.text ?? input.media?.caption ?? input.interactive?.bodyText ?? null,
      message_type: logMessageType,
      status: "failed", error_code: isTimeout ? "TIMEOUT" : "NETWORK", error_message: errMsg,
      is_template: isTemplate, template_name: input.templateName ?? null,
    });
    return { ok: false, code: isTimeout ? "TIMEOUT" : "NETWORK", message: errMsg };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    metaCloudBreaker.recordFailure();
    const err = (respBody as { error?: { message?: string; code?: number } })?.error;
    const errMsg = err?.message ?? `HTTP ${res.status}`;
    const errCode = err?.code ? String(err.code) : String(res.status);
    const consec = (rate?.consecutive_errors ?? 0) + 1;
    const cooldownMin = res.status === 429 ? 30 : Math.min(consec * 2, 60);
    const cooldownUntil = new Date(now.getTime() + cooldownMin * 60_000).toISOString();
    await supabaseAdmin.from("whatsapp_rate_state").upsert({
      connection_id: conn.id, workspace_id: conn.workspace_id,
      hour_bucket: currentHour, hour_count: hourCount,
      cooldown_until: cooldownUntil,
      last_429_at: res.status === 429 ? now.toISOString() : rate?.last_429_at ?? null,
      consecutive_errors: consec, updated_at: now.toISOString(),
    });
    await supabaseAdmin.from("whatsapp_connections").update({
      last_error: errMsg, last_error_at: now.toISOString(),
      status: res.status === 429 ? "throttled" : "error",
    }).eq("id", conn.id);
    await supabaseAdmin.from("whatsapp_message_log").insert({
      workspace_id: conn.workspace_id, connection_id: conn.id,
      direction: "outbound", contact_phone: input.to, ticket_id: input.ticketId ?? null,
      body: input.text ?? input.media?.caption ?? input.interactive?.bodyText ?? null,
      message_type: logMessageType,
      status: "failed", error_code: errCode, error_message: errMsg,
      is_template: isTemplate, template_name: input.templateName ?? null,
    });
    return { ok: false, code: "META_ERROR", message: errMsg };
  }

  metaCloudBreaker.recordSuccess();
  const messageId = ((respBody.messages as Array<{ id: string }>) ?? [])[0]?.id ?? null;
  await supabaseAdmin.from("whatsapp_rate_state").upsert({
    connection_id: conn.id, workspace_id: conn.workspace_id,
    hour_bucket: currentHour, hour_count: hourCount + 1,
    cooldown_until: null, consecutive_errors: 0, updated_at: now.toISOString(),
  });
  await supabaseAdmin.from("whatsapp_message_log").insert({
    workspace_id: conn.workspace_id, connection_id: conn.id,
    direction: "outbound", contact_phone: input.to, ticket_id: input.ticketId ?? null,
    message_id: messageId,
    body: input.text ?? input.media?.caption ?? input.interactive?.bodyText ?? null,
    message_type: logMessageType,
    status: "sent", is_template: isTemplate, template_name: input.templateName ?? null,
  });
  if (conn.status !== "connected") {
    await supabaseAdmin.from("whatsapp_connections").update({ status: "connected" }).eq("id", conn.id);
  }
  return { ok: true, messageId };
}

/**
 * Marca uma mensagem inbound como lida na Meta e (opcionalmente) mostra "digitando…"
 * pro contato. Fire-and-forget: falhas aqui não devem quebrar a UI.
 * Endpoint: POST /{phone_number_id}/messages com status=read.
 */
export async function markAsReadAndTyping(
  connectionId: string,
  metaMessageId: string,
  options: { typing?: boolean } = { typing: true },
): Promise<{ ok: boolean; error?: string }> {
  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("phone_number_id,access_token")
    .eq("id", connectionId).maybeSingle();
  if (!conn?.phone_number_id || !conn.access_token) {
    return { ok: false, error: "Conexão sem credenciais." };
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: metaMessageId,
  };
  if (options.typing) {
    payload.typing_indicator = { type: "text" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(`${META_API}/${conn.phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 200) };
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Returns 24h window info for a ticket: status + lastInboundAt + minutesRemaining. */
export async function getTicketWindow(ticketId: string) {
  const { data: ticket } = await supabaseAdmin
    .from("tickets")
    .select("id,workspace_id,connection_id,contact:contacts(phone)")
    .eq("id", ticketId).single();
  if (!ticket) return { status: "unknown" as const, hasConnection: false, lastInboundAt: null, minutesRemaining: 0 };
  const phone = (ticket.contact as { phone?: string } | null)?.phone ?? null;

  const isQrProvider = (p: string | null | undefined) =>
    p === "wuzapi_gateway" || p === "multizap_qr" || p === "baileys_selfhosted";

  let connectionId = ticket.connection_id as string | null;
  let provider: string | null = null;

  if (connectionId) {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("provider")
      .eq("id", connectionId)
      .maybeSingle();
    provider = conn?.provider ?? null;
  }

  // Se a conexão do ticket não é QR ativo, procura qualquer QR ativo no workspace.
  if (!isQrProvider(provider) && ticket.workspace_id) {
    const { data: qr } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,provider")
      .eq("workspace_id", ticket.workspace_id)
      .in("provider", ["wuzapi_gateway", "multizap_qr", "baileys_selfhosted"])
      .eq("status", "connected")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (qr?.id) {
      connectionId = qr.id;
      provider = qr.provider;
    }
  }

  // QR/WuzAPI/Baileys NÃO tem janela 24h da Meta — sempre pode mandar.
  if (isQrProvider(provider)) {
    return { status: "open" as const, hasConnection: true, lastInboundAt: null, minutesRemaining: 24 * 60 };
  }

  if (!connectionId || !phone) {
    return { status: "no_channel" as const, hasConnection: false, lastInboundAt: null, minutesRemaining: 0 };
  }

  // Meta Cloud: aplica janela 24h.
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data: lastIn } = await supabaseAdmin
    .from("whatsapp_message_log")
    .select("created_at")
    .eq("connection_id", connectionId)
    .eq("contact_phone", phone)
    .eq("direction", "inbound")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (!lastIn) {
    return { status: "closed" as const, hasConnection: true, lastInboundAt: null, minutesRemaining: 0 };
  }
  const minutesRemaining = Math.max(
    0,
    Math.floor((new Date(lastIn.created_at).getTime() + 24 * 3_600_000 - Date.now()) / 60_000),
  );
  const status = minutesRemaining <= 60 ? ("warning" as const) : ("open" as const);
  return { status, hasConnection: true, lastInboundAt: lastIn.created_at, minutesRemaining };
}

/**
 * Read-only: descobre qual canal seria usado pra responder este ticket — SEM enviar nada.
 * Usado pelo composer pra exigir confirmação antes de cair em fallback Meta→QR.
 */
export async function previewSendChannel(
  ticketId: string,
): Promise<ResolvedChannel & { currentProvider?: string | null; resolvedProvider?: string | null }> {
  const { data: t } = await supabaseAdmin
    .from("tickets")
    .select("workspace_id, connection_id, contact:contacts(phone), connection:whatsapp_connections(provider)")
    .eq("id", ticketId)
    .maybeSingle();
  if (!t) return { ok: false, code: "NO_CHANNEL_AVAILABLE", message: "Ticket não encontrado." };
  const phone = (t.contact as { phone?: string } | null)?.phone ?? "";
  const currentProvider = (t.connection as { provider?: string } | null)?.provider ?? null;
  const r = await resolveSendChannel({
    workspaceId: t.workspace_id,
    ticketConnectionId: t.connection_id,
    contactPhone: phone,
  });
  if (!r.ok) return { ...r, currentProvider };
  const { data: rc } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("provider")
    .eq("id", r.connectionId)
    .maybeSingle();
  const resolvedProvider = (rc as { provider?: string } | null)?.provider ?? null;
  return { ...r, currentProvider, resolvedProvider };
}

