import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/subscription-overdue")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("subscription-overdue", async () => {
        if (!(await jobIsEnabled("subscription-overdue"))) return { skipped: true };
        const now = new Date().toISOString();
        const { data: subs, error } = await supabaseAdmin
          .from("subscriptions")
          .select("id,workspace_id,current_period_end,status")
          .in("status", ["active", "trialing"])
          .lt("current_period_end", now);
        if (error) throw new Error(error.message);

        let updated = 0;
        for (const s of subs ?? []) {
          await supabaseAdmin.from("subscriptions")
            .update({ status: "past_due" } as never).eq("id", s.id);
          await supabaseAdmin.from("notifications").insert({
            workspace_id: s.workspace_id, user_id: null,
            level: "error",
            title: "Pagamento em atraso",
            body: "Sua assinatura está vencida. Regularize para continuar usando o sistema.",
            link: "/app/planos/gerenciar",
          } as never);
          updated++;
        }
        return { updated };
      });
      },
    },
  },
});
