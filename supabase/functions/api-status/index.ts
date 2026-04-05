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
    const apiKey = Deno.env.get("CONSULTAS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try "saldo" module to get account balance/plan info
    const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=saldo&string=0`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    console.log("API status raw:", JSON.stringify(data));

    // Extract relevant account info
    const result: Record<string, unknown> = {
      saldo: data.saldo ?? data.creditos ?? null,
      plano: data.plano ?? data.tipo ?? null,
      consumo_hoje: data.consumo_hoje ?? data.consultas_hoje ?? null,
      total_diario: data.total_diario ?? data.limite_diario ?? null,
      vencimento: data.vencimento ?? data.expiracao ?? null,
      ativo: data.ativo ?? data.sucesso ?? null,
      raw: data, // include raw for debugging
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
