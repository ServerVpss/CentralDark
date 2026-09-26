// Endpoint chamado a cada 2min pelo pg_cron pra checar saúde geral
// e disparar alertas no Telegram quando algo se degrada.
import { createFileRoute } from "@tanstack/react-router";
import { requireCronSecret } from "@/lib/cron-auth.server";
import { runAllChecks, persistAndAlert } from "@/lib/monitor.server";

export const Route = createFileRoute("/api/public/cron/monitor-heartbeat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        const checks = await runAllChecks();
        await persistAndAlert(checks);
        return new Response(
          JSON.stringify({
            ok: true,
            ran_at: new Date().toISOString(),
            checks: checks.map((c) => ({
              target: c.target,
              status: c.status,
              latency_ms: c.latency_ms,
            })),
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
