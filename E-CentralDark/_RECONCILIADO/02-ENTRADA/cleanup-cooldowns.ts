import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/cleanup-cooldowns")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("cleanup-cooldowns", async () => {
        if (!(await jobIsEnabled("cleanup-cooldowns"))) return { skipped: true };
        const { error, count } = await supabaseAdmin
          .from("whatsapp_rate_state")
          .delete({ count: "exact" })
          .lt("cooldown_until", new Date().toISOString());
        if (error) throw new Error(error.message);
        return { cleared: count ?? 0 };
      });
      },
    },
  },
});
