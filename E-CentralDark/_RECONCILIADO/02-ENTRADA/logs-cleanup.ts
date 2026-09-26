import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/logs-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("logs-cleanup", async () => {
        if (!(await jobIsEnabled("logs-cleanup"))) return { skipped: true };
        const { data, error } = await supabaseAdmin.rpc("cleanup_old_logs" as never);
        if (error) throw new Error(error.message);
        return { result: data };
      });
      },
    },
  },
});
