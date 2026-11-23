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

  const startedAt = Date.now();

  try {
    const apiKey = Deno.env.get("ISEEK_API_KEY") || Deno.env.get("CONSULTAS_API_KEY");
    if (!apiKey) {
      console.error("[api-status] chave da API não configurada (ISEEK_API_KEY/CONSULTAS_API_KEY)");
      return new Response(JSON.stringify({ success: false, error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consulta leve pra extrair metadados da conta
    const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=iseek-cpf&string=00000000000`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(20000),
      });
    } catch (netErr) {
      const latency = Date.now() - startedAt;
      console.error(`[api-status] upstream=veiculosapi network_error=${(netErr as Error).message} latencyMs=${latency}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "upstream indisponível (falha de rede)",
          upstream: "veiculosapi",
          detail: (netErr as Error).message,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const latency = Date.now() - startedAt;
    const contentType = response.headers.get("content-type") || "";
    console.log(`[api-status] upstream=veiculosapi status=${response.status} contentType=${contentType} latencyMs=${latency}`);

    // Se upstream não OK ou não devolveu JSON, tratamos de forma amigável (sem estourar 500)
    if (!response.ok || !contentType.toLowerCase().includes("application/json")) {
      const bodyPreview = (await response.text().catch(() => "")).slice(0, 200);
      console.warn(`[api-status] upstream fora do padrão. preview="${bodyPreview.replace(/\s+/g, " ")}"`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "upstream indisponível ou fora do formato esperado",
          upstream: "veiculosapi",
          upstream_status: response.status,
          upstream_content_type: contentType || null,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();

    console.log("[api-status] resposta ok, keys:", Object.keys(data));

    const apiInfo = data.api_info || {};
    const limites = data.limites || {};
    const plano = data.plano || {};
    const dadosGlobal = (data.dados && typeof data.dados === "object") ? data.dados : {};

    const hasApiInfo = Object.keys(apiInfo).length > 0;

    const dailyLimit =
      apiInfo.daily_limit ??
      dadosGlobal.daily_limit ??
      limites.total_diario ??
      0;

    const requestsUsed =
      apiInfo.requests_used ??
      dadosGlobal.requests_used ??
      limites.consumo_hoje ??
      0;

    const requestsRemaining =
      apiInfo.requests_remaining ??
      (dailyLimit > 0 ? Math.max(0, dailyLimit - requestsUsed) : 0);

    const isActive = (dailyLimit > 0) || plano.status === "Ativo";

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
    console.error("[api-status] erro inesperado:", (err as Error).message);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
