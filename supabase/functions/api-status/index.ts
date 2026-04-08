import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VEICULOS_API_BASE = "https://veiculosapi.com/api/proxy";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ISEEK_API_KEY") || Deno.env.get("CONSULTAS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use a lightweight query to extract account metadata
    const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=iseek-cpf&string=00000000000`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(20000),
    });

    const data = await response.json();

    console.log("API raw response keys:", Object.keys(data));

    // New structure: api_info contains usage data
    const apiInfo = data.api_info || {};
    // Legacy structure fallback
    const limites = data.limites || {};
    const plano = data.plano || {};

    // Determine if API is active based on available data
    const hasApiInfo = Object.keys(apiInfo).length > 0;
    const dailyLimit = apiInfo.daily_limit ?? limites.total_diario ?? 0;
    const requestsUsed = apiInfo.requests_used ?? limites.consumo_hoje ?? 0;
    const requestsRemaining = apiInfo.requests_remaining ?? 0;

    // API is active if we got a valid response with api_info or plano status
    const isActive = hasApiInfo
      ? dailyLimit > 0
      : plano.status === "Ativo";

    const result = {
      ativo: isActive,
      plano_tipo: plano.tipo || (hasApiInfo ? "VeiculosAPI" : "Desconhecido"),
      plano_status: plano.status || (isActive ? "Ativo" : "Inativo"),
      vencimento: plano.vencimento || null,
      dias_restantes: plano.dias_totais_restantes ?? null,
      tempo_restante: plano.tempo_restante_detalhado || null,
      consumo_hoje: requestsUsed,
      total_diario: dailyLimit,
      reset_em: limites.reset_em || null,
      usuario: data.usuario || null,
      restante: requestsRemaining,
    };

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API status error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
