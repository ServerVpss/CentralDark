// Webhook receptor genérico do servidor Baileys próprio (self-hosted).
// O servidor Baileys do usuário deve postar aqui eventos no formato:
//
// {
//   type: "message" | "status" | "qr" | "error",
//   sessionId: "...",
//   message?: { id, from, to, text?, media?, timestamp },
//   status?: "connected" | "disconnected" | "qr_pending",
//   qr?: "data:image/png;base64,...",
//   error?: { code, message }
// }
//
// Autenticação: header "x-baileys-secret" deve bater com master_settings.baileys_webhook_secret.
// (Placeholder — sem servidor configurado, o webhook retorna 503 e não processa nada.)

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getBaileysServerConfig } from "@/lib/whatsapp/providers/baileys-selfhosted.server";

type BaileysEvent = {
  type?: "message" | "status" | "qr" | "error" | "presence";
  sessionId?: string;
  message?: {
    id?: string;
    from?: string;
    to?: string;
    text?: string;
    media?: { type: string; url?: string; mimeType?: string; caption?: string };
    timestamp?: number;
  };
  status?: string;
  qr?: string;
  error?: { code?: string; message?: string };
  // Eventos de presença do contato: online/offline/digitando/gravando
  presence?: {
    contact_phone?: string;
    state?: "online" | "offline" | "composing" | "recording" | "paused" | "available" | "unavailable";
    last_seen_at?: string; // ISO
  };
};

export const Route = createFileRoute("/api/public/baileys/webhook/$connectionId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const connectionId = params.connectionId;

        const cfg = await getBaileysServerConfig();
        if (!cfg) {
          return new Response(
            JSON.stringify({ error: "Servidor Baileys ainda não configurado." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }

        // Verifica segredo do webhook — OBRIGATÓRIO. Sem segredo configurado, o endpoint nega tudo.
        if (!cfg.webhookSecret) {
          return new Response(
            JSON.stringify({ error: "Webhook secret não configurado no master_settings." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        const incoming = request.headers.get("x-baileys-secret") ?? "";
        if (incoming !== cfg.webhookSecret) {
          return new Response("Invalid signature", { status: 401 });
        }

        const { data: conn } = await supabaseAdmin
          .from("whatsapp_connections")
          .select("id,workspace_id,baileys_session_id,provider")
          .eq("id", connectionId)
          .maybeSingle();
        if (!conn || conn.provider !== "baileys_selfhosted") {
          return new Response("Connection not found", { status: 404 });
        }

        let body: BaileysEvent = {};
        try {
          body = (await request.json()) as BaileysEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Sanity: sessionId do payload precisa bater (se vier)
        if (body.sessionId && conn.baileys_session_id && body.sessionId !== conn.baileys_session_id) {
          return new Response("Session mismatch", { status: 400 });
        }

        try {
          switch (body.type) {
            case "status": {
              await supabaseAdmin
                .from("whatsapp_connections")
                .update({
                  status: body.status ?? "disconnected",
                  last_webhook_at: new Date().toISOString(),
                })
                .eq("id", conn.id);
              break;
            }

            case "qr": {
              await supabaseAdmin
                .from("whatsapp_connections")
                .update({
                  status: "qr_pending",
                  qr_code: body.qr ?? null,
                  last_webhook_at: new Date().toISOString(),
                })
                .eq("id", conn.id);
              break;
            }

            case "error": {
              await supabaseAdmin
                .from("whatsapp_connections")
                .update({
                  status: "error",
                  last_error: body.error?.message ?? "Erro Baileys",
                  last_error_at: new Date().toISOString(),
                })
                .eq("id", conn.id);
              break;
            }

            case "message": {
              const msg = body.message;
              if (!msg?.from || !msg?.id) break;
              // Normaliza pra mesma tabela usada pelo Meta Cloud (inbox/chatbot/IA)
              await supabaseAdmin.from("whatsapp_message_log").insert({
                workspace_id: conn.workspace_id,
                connection_id: conn.id,
                direction: "inbound",
                contact_phone: msg.from,
                message_id: msg.id,
                body: msg.text ?? msg.media?.caption ?? null,
                message_type: msg.media?.type ?? "text",
                status: "received",
                is_template: false,
              });
              // TODO: chamar pipeline de tickets/chatbot/IA (mesmo do webhook Meta).
              break;
            }

            case "presence": {
              const p = body.presence;
              const phone = (p?.contact_phone ?? "").replace(/\D+/g, "");
              const state = p?.state ?? "offline";
              if (!phone) break;
              const isOnline = state === "online" || state === "available" || state === "composing" || state === "recording";
              await supabaseAdmin
                .from("whatsapp_presence")
                .upsert({
                  workspace_id: conn.workspace_id,
                  connection_id: conn.id,
                  contact_phone: phone,
                  state,
                  last_seen_at: isOnline ? new Date().toISOString() : (p?.last_seen_at ?? null),
                  updated_at: new Date().toISOString(),
                }, { onConflict: "connection_id,contact_phone" });
              break;
            }

            default:
              // ignora tipos desconhecidos
              break;
          }
        } catch (e) {
          // log e segue — webhook deve ser idempotente do lado do remetente
          console.error("[baileys-webhook] processing error", e);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
