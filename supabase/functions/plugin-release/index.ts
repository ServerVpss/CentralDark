// Edge function: proxy seguro que serve arquivos do plugin CentralDark Grafo Vivo
// a partir do repositório privado no GitHub, usando GITHUB_TOKEN server-side.
// Query param: ?arquivo=main.js|manifest.json|styles.css|checksums.json|changelog.json

const REPO = "ServerVpss/CentralDark";
const BRANCH = "main";
const BASE_PATH = "apps/modulos/obsidian-plugin-grafo-vivo";

const ARQUIVOS_PERMITIDOS = new Set([
  "main.js",
  "manifest.json",
  "styles.css",
  "checksums.json",
  "changelog.json",
]);

const TIPOS: Record<string, string> = {
  "main.js": "application/javascript; charset=utf-8",
  "manifest.json": "application/json; charset=utf-8",
  "styles.css": "text/css; charset=utf-8",
  "checksums.json": "application/json; charset=utf-8",
  "changelog.json": "application/json; charset=utf-8",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const arquivo = url.searchParams.get("arquivo") ?? "manifest.json";

    if (!ARQUIVOS_PERMITIDOS.has(arquivo)) {
      return json({ error: `Arquivo não permitido: ${arquivo}` }, 400);
    }

    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) return json({ error: "GITHUB_TOKEN não configurado" }, 500);

    if (arquivo === "checksums.json") {
      const checksums: Record<string, string> = {};
      for (const nome of ["main.js", "manifest.json", "styles.css"]) {
        const bruto = await buscarArquivoGithub(token, nome);
        checksums[nome] = await sha256(aplicarPatchRelease(nome, bruto));
      }
      return json(checksums);
    }

    const bruto = await buscarArquivoGithub(token, arquivo);
    const conteudo = aplicarPatchRelease(arquivo, bruto);
    return new Response(conteudo, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": TIPOS[arquivo] ?? "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function buscarArquivoGithub(token: string, arquivo: string) {
  const ghUrl = `https://api.github.com/repos/${REPO}/contents/${BASE_PATH}/${arquivo}?ref=${BRANCH}`;
  const resp = await fetch(ghUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw",
      "User-Agent": "centraldark-plugin-release",
    },
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`GitHub ${resp.status}: ${txt.slice(0, 500)}`);
  }

  return await resp.text();
}

function aplicarPatchRelease(arquivo: string, conteudo: string) {
  if (arquivo === "manifest.json") {
    const manifest = JSON.parse(conteudo);
    manifest.version = "0.4.5";
    return JSON.stringify(manifest, null, 2) + "\n";
  }

  if (arquivo === "changelog.json") {
    const changelog = JSON.parse(conteudo);
    return JSON.stringify({
      "0.4.5": "🛠️ v0.4.5 — Fix real do grafo no Obsidian\n- Corrige o envio interno para o force-graph: agora o plugin entrega links em vez de edges\n- Mantém compatibilidade com graph-data.json usando edges, links, source/target e from/to\n- Blindagem extra contra mutação interna do force-graph\n- Resolve o erro Cannot read properties of undefined (reading 'filter') na renderização",
      ...changelog,
    }, null, 2) + "\n";
  }

  if (arquivo === "main.js") {
    const alvo = "this.grafo.graphData(i),this.ajustarTamanho()";
    const fix = "this.grafo.graphData({nodes:i.nodes.map(o=>({...o})),links:i.edges.map(o=>({...o}))}),this.ajustarTamanho()";
    if (conteudo.includes(fix)) return conteudo;
    if (!conteudo.includes(alvo)) {
      throw new Error("Patch 0.4.5 não aplicado: ponto graphData não encontrado");
    }
    return conteudo.replace(alvo, fix);
  }

  return conteudo;
}

async function sha256(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
