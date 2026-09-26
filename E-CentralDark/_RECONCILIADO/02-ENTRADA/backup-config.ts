// Endpoint consumido pelo script de backup da VPS.
// Devolve os segredos guardados no cofre apenas se o header x-cron-secret bater.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/backup-config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = request.headers.get("x-cron-secret") ?? "";
        if (!cronSecret || cronSecret.length < 16) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data, error } = await supabaseAdmin.rpc("get_backup_secrets_for_cron", {
          _cron_secret: cronSecret,
        });
        if (error) {
          return new Response("Unauthorized", { status: 401 });
        }
        return new Response(JSON.stringify(data ?? {}), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
