// Rota pública SEM connectionId — usada quando o cliente cola
// https://multizap.dev/api/public/whatsapp/webhook na Meta sem o sufixo.
// Tenta validar o handshake casando o verify_token recebido com qualquer
// conexão ativa do sistema. NÃO processa POSTs (sem connectionId não dá
// pra saber a qual workspace/conexão o evento pertence) — para POST
// continue usando /api/public/whatsapp/webhook/:connectionId.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PLAIN = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode !== "subscribe" || !token) {
          return new Response("Invalid verify token", { status: 403, headers: PLAIN });
        }

        // Casa pelo verify_token (gerado por nós, único por conexão)
        const { data: conn } = await supabaseAdmin
          .from("whatsapp_connections")
          .select("id, workspace_id, phone_number_id")
          .eq("verify_token", token)
          .maybeSingle();

        if (!conn) {
          await supabaseAdmin.from("whatsapp_webhook_events").insert({
            connection_id: null as never,
            workspace_id: null as never,
            event_type: "verify_failed",
            signature_valid: false,
            http_method: "GET",
            status_code: 403,
            raw_payload: { mode, token_provided: true, scope: "root" } as never,
            error: "Verify token não corresponde a nenhuma conexão",
          } as never);
          return new Response("Invalid verify token", { status: 403, headers: PLAIN });
        }

        await supabaseAdmin.from("whatsapp_webhook_events").insert({
          connection_id: conn.id,
          workspace_id: conn.workspace_id,
          phone_number_id: conn.phone_number_id,
          event_type: "verify_ok",
          signature_valid: true,
          http_method: "GET",
          status_code: 200,
          raw_payload: { mode, scope: "root" } as never,
        });

        return new Response(challenge ?? "", { status: 200, headers: PLAIN });
      },

      POST: async () => {
        // Sem connectionId não dá pra rotear o evento. Avisa o cliente
        // pra colar a URL completa com /:connectionId.
        return new Response(
          "Use /api/public/whatsapp/webhook/{connectionId} for event delivery",
          { status: 400, headers: PLAIN },
        );
      },
    },
  },
});
