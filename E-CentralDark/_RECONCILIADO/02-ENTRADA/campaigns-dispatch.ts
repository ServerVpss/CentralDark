import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";
import { logAction } from "@/lib/audit.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

// Cron: roda 1x por minuto. Procura campanhas "scheduled" cujo horário já passou
// e também continua campanhas "running" que ainda têm destinatários pendentes.
// Limite de 50 mensagens por execução pra respeitar anti-ban (250/h por conexão).
export const Route = createFileRoute("/api/public/cron/campaigns-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        const now = new Date().toISOString();

        // 1) Promover scheduled -> running quando der o horário
        await supabaseAdmin
          .from("campaigns")
          .update({ status: "running", started_at: now })
          .eq("status", "scheduled")
          .lte("scheduled_at", now);

        // 2) Pegar campanhas em execução
        const { data: running } = await supabaseAdmin
          .from("campaigns")
          .select("id, connection_id, message_body, template_name, template_lang, total_sent, total_failed")
          .eq("status", "running")
          .limit(10);

        let totalDispatched = 0;
        const PER_RUN_CAP = 50;

        for (const c of running ?? []) {
          if (totalDispatched >= PER_RUN_CAP) break;
          if (!c.connection_id) continue;

          const remaining = PER_RUN_CAP - totalDispatched;
          const { data: rcpts } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id, phone")
            .eq("campaign_id", c.id)
            .eq("status", "pending")
            .limit(remaining);

          let sent = 0, failed = 0;
          for (const r of rcpts ?? []) {
            const res = await dispatchWhatsAppMessage({
              connectionId: c.connection_id,
              to: r.phone,
              text: c.message_body ?? undefined,
              templateName: c.template_name ?? undefined,
              templateLang: c.template_lang ?? "pt_BR",
            });
            totalDispatched++;
            if (res.ok) {
              sent++;
              await supabaseAdmin.from("campaign_recipients").update({
                status: "sent", message_id: res.messageId, sent_at: new Date().toISOString(),
              }).eq("id", r.id);
            } else {
              failed++;
              await supabaseAdmin.from("campaign_recipients").update({
                status: "failed", error: res.message,
              }).eq("id", r.id);
              if (res.code === "COOLDOWN" || res.code === "RATE_LIMIT") break;
            }
          }

          // Atualiza contadores e status
          const { count: pendingLeft } = await supabaseAdmin
            .from("campaign_recipients")
            .select("id", { count: "exact", head: true })
            .eq("campaign_id", c.id).eq("status", "pending");

          const finished = (pendingLeft ?? 0) === 0;
          await supabaseAdmin.from("campaigns").update({
            total_sent: (c.total_sent ?? 0) + sent,
            total_failed: (c.total_failed ?? 0) + failed,
            status: finished ? "completed" : "running",
            finished_at: finished ? new Date().toISOString() : null,
          }).eq("id", c.id);

          await logAction({
            category: "cron",
            action: "campaign_tick",
            entity: "campaign",
            entityId: c.id,
            payload: { sent, failed, finished, dispatched_total: totalDispatched },
          });
        }

        return new Response(JSON.stringify({
          ok: true, dispatched: totalDispatched, campaigns: running?.length ?? 0,
        }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
