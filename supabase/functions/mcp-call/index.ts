// Edge function-ponte: proxia chamadas JSON-RPC pro MCP CentralDark
// usando o token salvo nas secrets. Uso interno do agente Lovable.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const MCP_URL = "https://mcp.centralldark.com/mcp";
  const token =
    Deno.env.get("CENTRALDARK_MCP_TOKEN") ||
    Deno.env.get("MCP_CENTRALDARK_TOKEN") ||
    Deno.env.get("MCP_TOKEN");

  if (!token) {
    return new Response(JSON.stringify({ error: "token MCP ausente" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const r = await fetch(MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": r.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
