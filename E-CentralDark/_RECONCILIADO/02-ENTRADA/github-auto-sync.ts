import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";
import { runGithubAutoSync } from "@/lib/github-sync.server";

export const Route = createFileRoute("/api/public/cron/github-auto-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("github-auto-sync", async () => {
          if (!(await jobIsEnabled("github-auto-sync"))) return { skipped: true };
          const result = await runGithubAutoSync();

          // Auditoria: só registra quando REALMENTE houve commit.
          if (result.commit) {
            await supabaseAdmin.from("audit_log").insert({
              category: "admin",
              action: "github_auto_sync_committed",
              payload: {
                commit: result.commit,
                changed_count: result.changed.length,
                changed: result.changed.slice(0, 20),
                scanned: result.scanned,
              } as never,
            });
          }
          return result as unknown as Record<string, unknown>;
        });
      },
    },
  },
});
