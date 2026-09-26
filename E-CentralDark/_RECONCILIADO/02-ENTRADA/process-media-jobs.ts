// Cron de fallback: pega jobs de mídia pendentes/atrasados e dispara o worker.
// Chamado pelo pg_cron a cada 2 minutos. Worker tem lock de concorrência próprio.
import { createFileRoute } from "@tanstack/react-router";
import { processPendingMediaJobsInternal } from "@/lib/whatsapp-media-jobs.functions";

export const Route = createFileRoute("/api/public/cron/process-media-jobs")({
  server: {
    handlers: {
      POST: async () => {
        const started = Date.now();
        try {
          const res = await processPendingMediaJobsInternal(30);
          const ms = Date.now() - started;
          console.log("[cron:media-jobs] tick", { picked: res.picked, ms });
          return new Response(
            JSON.stringify({ ok: true, picked: res.picked, ms }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[cron:media-jobs] failed", { error: msg });
          return new Response(
            JSON.stringify({ ok: false, error: msg }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
