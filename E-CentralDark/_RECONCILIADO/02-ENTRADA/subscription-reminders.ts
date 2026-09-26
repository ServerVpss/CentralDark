import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

import { formatDateBR } from "@/lib/datetime";
export const Route = createFileRoute("/api/public/cron/subscription-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("subscription-reminders", async () => {
        if (!(await jobIsEnabled("subscription-reminders"))) return { skipped: true };
        const now = new Date();
        const in3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const { data: subs, error } = await supabaseAdmin
          .from("subscriptions")
          .select("id,workspace_id,current_period_end,status")
          .in("status", ["active", "trialing"])
          .gte("current_period_end", now.toISOString())
          .lte("current_period_end", in3.toISOString());
        if (error) throw new Error(error.message);

        let notified = 0;
        for (const s of subs ?? []) {
          const due = formatDateBR(s.current_period_end!);
          await supabaseAdmin.from("notifications").insert({
            workspace_id: s.workspace_id, user_id: null,
            level: "warning",
            title: "Sua assinatura vence em breve",
            body: `Sua assinatura vence em ${due}. Renove para evitar interrupção.`,
            link: "/app/planos/gerenciar",
          } as never);
          notified++;
        }
        return { notified };
      });
      },
    },
  },
});
