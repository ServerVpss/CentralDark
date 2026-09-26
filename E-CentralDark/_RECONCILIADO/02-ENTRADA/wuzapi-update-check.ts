import { createFileRoute } from "@tanstack/react-router";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";
import { runWuzapiUpdateCheckForCron } from "@/lib/wuzapi-update.functions";

export const Route = createFileRoute(
  "/api/public/cron/wuzapi-update-check",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("wuzapi-update-check", async () => {
          if (!(await jobIsEnabled("wuzapi-update-check"))) return { skipped: true };
          const status = await runWuzapiUpdateCheckForCron();
          return {
            update_available: status.update_available,
            current: status.current_short,
            latest: status.latest_short,
            error: status.check_error,
          };
        });
      },
    },
  },
});
