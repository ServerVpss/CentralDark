# OUTRO - baileys.webhook.$connectionId.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\routes\api\public\baileys.webhook.$connectionId.ts
**SHA:** 77f9aaee94309a4b
**Timestamp:** 2026-08-26T19:31:18.182477
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: chamar pipeline de tickets/chatbot/IA (mesmo do webhook Meta).

### Ouro Bruto (primeiros 5000 chars)
```
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
                body: msg.text ?? msg.media
```