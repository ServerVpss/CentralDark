import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/misticpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any = {};
        try {
          payload = await request.json();
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        try {
          // MED webhook
          if (payload?.event === "INFRACTION") {
            const txExt = String(payload?.transaction?.transactionId ?? "");
            if (txExt) {
              await supabaseAdmin
                .from("pix_transactions")
                .update({
                  webhook_payload: payload,
                  status: `MED_${payload?.infraction?.status ?? "UNKNOWN"}`,
                })
                .or(`external_transaction_id.eq.${txExt},client_transaction_id.eq.${txExt}`);
            }
            return Response.json({ ok: true });
          }

          // Depósito / Saque
          const extId = String(payload?.transactionId ?? "");
          if (!extId) return new Response("missing transactionId", { status: 400 });

          const status = String(payload?.status ?? "PENDENTE");
          const fee = payload?.fee != null ? Number(payload.fee) / 100 : null;
          const e2e = payload?.e2e ?? null;

          const updates: any = {
            status,
            webhook_payload: payload,
            end_to_end_id: e2e,
          };
          if (fee != null) updates.fee = fee;
          if (status === "COMPLETO") updates.paid_at = new Date().toISOString();

          const { data, error } = await supabaseAdmin
            .from("pix_transactions")
            .update(updates)
            .eq("external_transaction_id", extId)
            .select("id");

          if (error) {
            console.error("misticpay webhook db error", error);
            return new Response("db error", { status: 500 });
          }
          if (!data || data.length === 0) {
            console.warn("misticpay webhook: tx not found", extId);
          }
          return Response.json({ ok: true, updated: data?.length ?? 0 });
        } catch (e) {
          console.error("misticpay webhook fatal", e);
          return new Response("error", { status: 500 });
        }
      },
      GET: async () => Response.json({ ok: true, service: "misticpay-webhook" }),
    },
  },
});
