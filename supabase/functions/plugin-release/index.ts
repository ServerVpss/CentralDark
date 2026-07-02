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
      return json({ error: `GitHub ${resp.status}`, detalhes: txt.slice(0, 500) }, resp.status);
    }

    const conteudo = await resp.text();
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

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
