import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProviderPingResult {
  id: string;
  name: string;
  port: number | null;
  status: "online" | "offline";
  latency_ms: number | null;
  error?: string;
}

// Hardcoded providers as fallback
const defaultProviders = [
  { id: "nexfuture", name: "NexFuture", base_url: "http://nxf-2.nexfuture.com.br", port: 25589 },
  { id: "nexfuture_cpf", name: "NexFuture CPF", base_url: "http://nxf-2.nexfuture.com.br", port: 25594 },
  { id: "tconect_score", name: "TConect Score", base_url: "http://node.tconect.xyz", port: 3036 },
  { id: "tconect_placa", name: "TConect Placa", base_url: "http://node.tconect.xyz", port: 3041 },
  { id: "tconect_foto", name: "TConect Foto", base_url: "http://node.tconect.xyz", port: 3030 },
];

async function pingProvider(
  baseUrl: string,
  port: number | null,
  timeoutMs = 8000
): Promise<{ online: boolean; latency_ms: number | null; error?: string }> {
  const url = port ? `${baseUrl}:${port}/` : `${baseUrl}/`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    const latency = Math.round(performance.now() - start);
    clearTimeout(timeoutId);

    // Any response (even 404) means the server is reachable
    return { online: true, latency_ms: latency };
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    const latency = Math.round(performance.now() - start);

    if (error.name === "AbortError") {
      return { online: false, latency_ms: null, error: `Timeout (${timeoutMs}ms)` };
    }

    // Connection refused or DNS errors mean offline
    return { online: false, latency_ms: null, error: error.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to get providers from DB
    let providersList = defaultProviders;
    const { data: dbProviders } = await supabase
      .from("api_providers")
      .select("id, name, base_url, port")
      .eq("is_active", true);

    if (dbProviders && dbProviders.length > 0) {
      providersList = dbProviders;
    }

    // Ping all providers in parallel
    const results: ProviderPingResult[] = await Promise.all(
      providersList.map(async (provider) => {
        const pingResult = await pingProvider(provider.base_url, provider.port);
        return {
          id: provider.id,
          name: provider.name,
          port: provider.port,
          status: pingResult.online ? "online" as const : "offline" as const,
          latency_ms: pingResult.latency_ms,
          error: pingResult.error,
        };
      })
    );

    const summary = {
      total: results.length,
      online: results.filter((r) => r.status === "online").length,
      offline: results.filter((r) => r.status === "offline").length,
      checked_at: new Date().toISOString(),
    };

    console.log(`Provider ping: ${summary.online}/${summary.total} online`);

    return new Response(
      JSON.stringify({ providers: results, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Provider ping error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
