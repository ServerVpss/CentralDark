// Edge function: serve os arquivos do plugin Obsidian a partir do repo privado
// no GitHub. Uso: GET /plugin-release?arquivo=manifest.json (ou main.js,
// styles.css, checksums.json, changelog.json). Sem autenticação — endpoint
// público, só serve arquivos da allowlist na pasta do plugin.

const ARQUIVOS_PERMITIDOS = new Set([
  "manifest.json",
  "main.js",
  "styles.css",
  "checksums.json",
  "changelog.json",
]);
const REPO_OWNER = "ServerVpss";
const REPO_NAME = "CentralDark";
const BRANCH = "main";
const PASTA = "apps/modulos/obsidian-plugin-grafo-vivo";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function contentTypeDe(arquivo: string): string {
  if (arquivo.endsWith(".json")) return "application/json; charset=utf-8";
  if (arquivo.endsWith(".css")) return "text/css; charset=utf-8";
  return "application/javascript; charset=utf-8";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const arquivo = url.searchParams.get("arquivo") || "manifest.json";

  if (!ARQUIVOS_PERMITIDOS.has(arquivo)) {
    return new Response(JSON.stringify({ erro: "arquivo não permitido" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ erro: "GITHUB_TOKEN ausente na edge function" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const gh = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PASTA}/${arquivo}?ref=${BRANCH}`;

  try {
    const r = await fetch(gh, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw",
        "User-Agent": "centraldark-plugin-release",
      },
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(
        JSON.stringify({ erro: `GitHub ${r.status}`, detalhe: txt.slice(0, 300) }),
        { status: r.status, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const conteudo = await r.text();
    return new Response(conteudo, {
      headers: {
        ...CORS,
        "Content-Type": contentTypeDe(arquivo),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ erro: "falha buscando GitHub", detalhe: String(e) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
