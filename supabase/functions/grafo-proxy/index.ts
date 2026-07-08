// Proxy CORS para o grafo da VPS
// Contorna bloqueio do navegador buscando o JSON no servidor
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const r = await fetch("https://grafo.centralldark.com/api/graph", {
      headers: { "accept": "application/json" },
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        ...corsHeaders,
        "content-type": "application/json",
        "cache-control": "public, max-age=30",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
