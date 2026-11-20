/**
 * pivete-mcp-bridge.js
 * ---------------------------------------------------------------
 * Ponte MCP dentro do Open WebUI. Quando o pivete tá acordado,
 * expõe as ~120 tools do MCP CentralDark direto no chat.
 *
 * Fluxo:
 *   1. Ao carregar, faz GET api.centralldark.com/pivete/mcp-catalog
 *   2. Guarda o catálogo em window.pivete.mcp.tools
 *   3. Expõe window.pivete.mcp.call(toolName, input)
 *      que faz POST /pivete/mcp/call/{tool} com o payload
 *   4. Injeta no system prompt uma seção listando as tools por categoria
 */

(function () {
  'use strict';

  const CATALOGO_URL = 'https://api.centralldark.com/pivete/mcp-catalog';
  const CALL_URL = (tool) => `https://api.centralldark.com/pivete/mcp/call/${encodeURIComponent(tool)}`;

  const state = {
    tools: [],
    porCategoria: {},
    carregando: null,
  };

  async function carregarCatalogo(forcar = false) {
    if (state.tools.length && !forcar) return state.tools;
    if (state.carregando) return state.carregando;

    state.carregando = fetch(CATALOGO_URL, { cache: forcar ? 'no-store' : 'default' })
      .then((r) => r.json())
      .then((data) => {
        state.tools = data.tools || [];
        state.porCategoria = agruparPorCategoria(state.tools);
        console.log(`%c🧠 pivete-mcp · ${state.tools.length} tools carregadas`, 'color:#10b981;font-weight:bold');
        return state.tools;
      })
      .finally(() => {
        state.carregando = null;
      });

    return state.carregando;
  }

  function agruparPorCategoria(tools) {
    const grupos = {};
    for (const t of tools) {
      const nome = t.name || t;
      const cat = nome.split('_')[0] || 'geral';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(nome);
    }
    return grupos;
  }

  async function chamar(tool, input = {}) {
    const res = await fetch(CALL_URL(tool), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`MCP ${res.status}: ${txt}`);
    }
    return res.json();
  }

  function montarSecaoSystemPrompt() {
    const linhas = ['## 🛠️ Tools MCP disponíveis (via api.centralldark.com/pivete/mcp/call/{tool})', ''];
    for (const [cat, lista] of Object.entries(state.porCategoria)) {
      linhas.push(`### ${cat} (${lista.length})`);
      linhas.push(lista.map((n) => `- \`${n}\``).join('\n'));
      linhas.push('');
    }
    return linhas.join('\n');
  }

  window.pivete = window.pivete || {};
  window.pivete.mcp = {
    carregar: carregarCatalogo,
    call: chamar,
    tools: () => state.tools,
    categorias: () => state.porCategoria,
    systemPrompt: montarSecaoSystemPrompt,
  };

  // Auto-carga ao startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => carregarCatalogo().catch(console.warn));
  } else {
    carregarCatalogo().catch(console.warn);
  }
})();
