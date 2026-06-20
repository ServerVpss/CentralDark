// Teste rápido da ponte MCP CentralDark
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const nomes = ["CENTRALDARK_MCP_TOKEN", "MCP_CENTRALDARK_TOKEN", "MCP_TOKEN"];
  const resultados: any[] = [];

  for (const nome of nomes) {
    const tk = Deno.env.get(nome);
    if (!tk) {
      resultados.push({ nome, status: "secret_vazio" });
      continue;
    }
    try {
      const r = await fetch("https://mcp.centralldark.com/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "Authorization": `Bearer ${tk}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
      });
      const txt = await r.text();
      let toolCount: number | null = null;
      try {
        const j = JSON.parse(txt);
        toolCount = j?.result?.tools?.length ?? null;
      } catch {}
      resultados.push({
        nome,
        prefixo_token: tk.slice(0, 8) + "...",
        http: r.status,
        tool_count: toolCount,
        resposta: txt.slice(0, 300),
      });
    } catch (e) {
      resultados.push({ nome, erro: String(e) });
    }
  }

  return new Response(JSON.stringify({ resultados }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
