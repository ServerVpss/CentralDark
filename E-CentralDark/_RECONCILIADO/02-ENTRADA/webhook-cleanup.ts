import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/webhook-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("webhook-cleanup", async () => {
        if (!(await jobIsEnabled("webhook-cleanup"))) return { skipped: true };
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error, count } = await supabaseAdmin
          .from("whatsapp_webhook_events")
          .delete({ count: "exact" })
          .lt("created_at", cutoff);
        if (error) throw new Error(error.message);
        return { deleted: count ?? 0 };
      });
      },
    },
  },
});
