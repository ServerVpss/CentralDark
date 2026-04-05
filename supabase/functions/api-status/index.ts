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

    // Use a lightweight query (CPF with dummy) just to extract account metadata
    // The API returns saldo, plano, limites etc. in every response
    const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=cpffull&string=00000000000`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    console.log("API status raw keys:", Object.keys(data));
    console.log("API status raw:", JSON.stringify(data).substring(0, 2000));

    // Extract account metadata from the response
    const result: Record<string, unknown> = {};

    // Direct fields
    const metaKeys = [
      "saldo", "creditos", "conta", "usuario", "plano", "tipo",
      "consumo_hoje", "consultas_hoje", "total_diario", "limite_diario",
      "vencimento", "expiracao", "ativo", "sucesso", "limites",
      "reset_em", "inicio_uso", "tempo_restante", "dias_totais_restantes",
    ];

    for (const key of metaKeys) {
      if (data[key] !== undefined) {
        result[key] = data[key];
      }
    }

    // Check nested "conta" or "plano" objects
    if (typeof data.conta === "object" && data.conta) {
      result.conta = data.conta;
    }
    if (typeof data.plano === "object" && data.plano) {
      result.plano = data.plano;
    }
    if (typeof data.limites === "object" && data.limites) {
      result.limites = data.limites;
    }

    return new Response(JSON.stringify({ success: true, data: result, raw_keys: Object.keys(data) }), {
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
