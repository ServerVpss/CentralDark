import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/quota-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("quota-reset", async () => {
        if (!(await jobIsEnabled("quota-reset"))) return { skipped: true };
        // Zera contadores cuja hora-bucket é diferente da hora atual.
        const { error, count } = await supabaseAdmin
          .from("whatsapp_rate_state")
          .delete({ count: "exact" })
          .lt("hour_bucket", new Date(new Date().setMinutes(0, 0, 0)).toISOString());
        if (error) throw new Error(error.message);
        return { reset: count ?? 0 };
      });
      },
    },
  },
});
