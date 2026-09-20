// Edge function `graph-data` — retorna o grafo vivo do ecossistema CentralDark
// consumido pelo plugin Obsidian "CentralDark Grafo Vivo".
// Formato: { nodes: [{id, label, category, obsidian_path?}], edges: [{source, target, ativa?}] }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Nós fixos do ecossistema (baseado em CLAUDE.md + PM2 canônico da VPS).
const NODES = [
  // IAs
  { id: "ia-lovable", label: "Lovable", category: "ia", obsidian_path: "IAs/Lovable" },
  { id: "ia-claude", label: "Claude", category: "ia" },
  { id: "ia-gemini", label: "Gemini", category: "ia" },
  { id: "ia-gpt5", label: "GPT-5", category: "ia" },
  { id: "ia-darkai", label: "darkai CLI", category: "ia", obsidian_path: "IAs/DarkAI" },

  // Bots
  { id: "bot-srver1", label: "@srver1bot", category: "bot", obsidian_path: "Bots/srver1bot" },

  // MCP + orquestração
  { id: "mcp-dispatcher", label: "MCP Dispatcher", category: "mcp", obsidian_path: "MCP/Dispatcher" },
  { id: "mcp-cognitivas", label: "Ferramentas Cognitivas", category: "mcp" },

  // Edge functions Supabase
  { id: "edge-ai-proxy", label: "ai-proxy", category: "edge" },
  { id: "edge-graph-data", label: "graph-data", category: "edge" },

  // Supabase / Cloud
  { id: "supabase-db", label: "Supabase DB", category: "supabase", obsidian_path: "Infra/Supabase" },

  // VPS (PM2 canônicos)
  { id: "vps", label: "VPS CentralDark", category: "vps", obsidian_path: "Infra/VPS" },
  { id: "pm2-zentinel", label: "Zentinel", category: "vps" },
  { id: "pm2-multizap", label: "MultiZap", category: "vps" },
  { id: "pm2-clonedeck", label: "CloneDeck", category: "vps" },
  { id: "pm2-eliteWS", label: "EliteWS", category: "vps" },
  { id: "pm2-eliteHTTP", label: "EliteHTTP", category: "vps" },
  { id: "pm2-eliteAnthropic", label: "EliteAnthropic", category: "vps" },
  { id: "pm2-graphPanel", label: "GraphPanel", category: "vps" },

  // Módulos do repo
  { id: "mod-status", label: "status.centralldark.com", category: "modulo" },
  { id: "mod-bolt", label: "Bolt", category: "modulo" },
  { id: "mod-webui", label: "WebUI", category: "modulo" },
  { id: "mod-obsidian", label: "Obsidian Plugin", category: "modulo", obsidian_path: "Plugins/GrafoVivo" },

  // Docs / Cérebro
  { id: "doc-consciencia", label: "docs/CONSCIENCIA", category: "doc", obsidian_path: "Consciencia/README" },
  { id: "doc-lembrancas", label: "LEMBRANCAS", category: "doc", obsidian_path: "Consciencia/Lembrancas" },
];

const EDGES = [
  // Fluxo Lovable → GitHub → VPS
  { source: "ia-lovable", target: "supabase-db", ativa: true },
  { source: "ia-lovable", target: "edge-graph-data", ativa: true },
  { source: "ia-lovable", target: "vps", ativa: true },

  // darkai orquestra as IAs
  { source: "ia-darkai", target: "edge-ai-proxy", ativa: true },
  { source: "edge-ai-proxy", target: "ia-claude" },
  { source: "edge-ai-proxy", target: "ia-gemini" },
  { source: "edge-ai-proxy", target: "ia-gpt5" },

  // MCP + cognitivas
  { source: "mcp-dispatcher", target: "mcp-cognitivas", ativa: true },
  { source: "mcp-dispatcher", target: "vps", ativa: true },
  { source: "mcp-dispatcher", target: "supabase-db" },
  { source: "ia-claude", target: "mcp-dispatcher", ativa: true },

  // Bot
  { source: "bot-srver1", target: "vps", ativa: true },
  { source: "bot-srver1", target: "supabase-db" },

  // VPS processos
  { source: "vps", target: "pm2-zentinel" },
  { source: "vps", target: "pm2-multizap" },
  { source: "vps", target: "pm2-clonedeck" },
  { source: "vps", target: "pm2-eliteWS", ativa: true },
  { source: "vps", target: "pm2-eliteHTTP", ativa: true },
  { source: "vps", target: "pm2-eliteAnthropic", ativa: true },
  { source: "vps", target: "pm2-graphPanel", ativa: true },
  { source: "vps", target: "mod-status", ativa: true },

  // Obsidian plugin lê da edge
  { source: "mod-obsidian", target: "edge-graph-data", ativa: true },

  // Cérebro
  { source: "doc-consciencia", target: "doc-lembrancas" },
  { source: "ia-lovable", target: "doc-consciencia" },
  { source: "mcp-dispatcher", target: "doc-lembrancas", ativa: true },
];

// Marca aleatoriamente 3 arestas extras como "ativas" a cada request pra dar
// sensação de movimento vivo (particles pulsando) até plugarmos telemetria real.
function pulsarAleatorio(edges: typeof EDGES) {
  const pool = edges.filter((e) => !e.ativa);
  const escolhidas = new Set<number>();
  while (escolhidas.size < Math.min(3, pool.length)) {
    escolhidas.add(Math.floor(Math.random() * pool.length));
  }
  return edges.map((e, i) => {
    const idxInPool = pool.indexOf(e);
    if (idxInPool >= 0 && escolhidas.has(idxInPool)) return { ...e, ativa: true };
    return e;
  });
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const payload = {
    nodes: NODES,
    edges: pulsarAleatorio(EDGES),
    gerado_em: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "content-type": "application/json", "cache-control": "no-store" },
  });
});
