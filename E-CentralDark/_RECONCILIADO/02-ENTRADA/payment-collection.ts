// Endpoint público chamado pelo pg_cron para rodar a cobrança automática de PIX.
// Auth: header x-cron-secret OU bearer com CRON_SECRET (env).
// Idempotente: pode ser chamado a cada minuto sem efeitos colaterais ruins.

import { createFileRoute } from "@tanstack/react-router";
import { runPaymentCollection } from "@/lib/payments/collection-runner.server";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const h1 = req.headers.get("x-cron-secret");
  const h2 = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return h1 === secret || h2 === secret;
}

export const Route = createFileRoute("/api/public/cron/payment-collection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) {
          return new Response("unauthorized", { status: 401 });
        }
        const started = Date.now();
        try {
          const r = await runPaymentCollection();
          return Response.json({ ok: true, duration_ms: Date.now() - started, ...r });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
