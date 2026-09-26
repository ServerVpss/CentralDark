// Endpoint pra disparar um alerta de teste no Telegram (uso master).
import { createFileRoute } from "@tanstack/react-router";
import { requireCronSecret } from "@/lib/cron-auth.server";
import { sendTelegramAlert } from "@/lib/telegram-alerts.server";

export const Route = createFileRoute("/api/public/monitor/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        const r = await sendTelegramAlert({
          title: "🧪 Teste manual do monitoramento",
          friendlySummary: "Disparo manual via endpoint /api/public/monitor/test.",
          technicalReport: `ran_at=${new Date().toISOString()}`,
        });
        return new Response(JSON.stringify(r), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
