import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Cada cold-start do worker = nova versão (acontece a cada deploy).
const BUILD_VERSION = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const Route = createFileRoute("/api/public/version")({
  server: {
    handlers: {
      GET: async () => {
        // Ler config da landing (toggle do banner + carimbo de força-refresh)
        const { data } = await supabaseAdmin
          .from("master_settings")
          .select("version_banner_enabled,version_check_interval_seconds,force_refresh_token")
          .eq("id", 1)
          .maybeSingle();
        return new Response(
          JSON.stringify({
            version: BUILD_VERSION,
            enabled: data?.version_banner_enabled ?? true,
            intervalSeconds: data?.version_check_interval_seconds ?? 60,
            forceToken: data?.force_refresh_token ?? "",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          },
        );
      },
    },
  },
});
