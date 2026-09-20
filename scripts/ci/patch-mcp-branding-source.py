from pathlib import Path

INDEX = Path("CentralDark/apps/mcp/src/index.ts")
OAUTH = Path("CentralDark/apps/mcp/src/oauth.ts")

index = INDEX.read_text(encoding="utf-8")

brand_block = r'''
const BRAND_NAME = "CentralDark";
const BRAND_PRODUCT = "CentralDark MCP Connector";
const BRAND_DESCRIPTION = "Conector operacional seguro para MultiZap / clone-deck";
const BRAND_COMPANY = "CentralDark Operacoes Digitais";

function sendBrandIcon(res: any) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#0b0b0f"/><rect x="48" y="48" width="416" height="416" rx="92" fill="#c9342c"/><path d="M315 160c-18-16-42-25-68-25-64 0-113 50-113 121s49 121 113 121c27 0 52-9 70-26l-30-42c-10 9-23 15-39 15-34 0-59-28-59-68s25-68 59-68c15 0 28 5 38 14l29-42Z" fill="#fff"/><circle cx="347" cy="256" r="29" fill="#fff"/></svg>';
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.type("image/svg+xml").send(svg);
}

app.get("/icon.svg", (_req, res) => sendBrandIcon(res));
app.get("/logo.svg", (_req, res) => sendBrandIcon(res));

app.get("/brand.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ok: true,
    name: BRAND_NAME,
    product: BRAND_PRODUCT,
    company: BRAND_COMPANY,
    description: BRAND_DESCRIPTION,
    logo_uri: `${config.publicUrl}/icon.svg`,
    privacy_uri: `${config.publicUrl}/privacy`,
    terms_uri: `${config.publicUrl}/terms`,
    catalogVersion: CATALOG_VERSION,
    toolCount: getCatalogSummary().toolCount,
    security: {
      sanitized_output: true,
      returns_secrets: false,
      blocks_private_values: true
    }
  });
});

app.get("/privacy", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("text/plain").send("CentralDark MCP Connector Privacy\n\nConector privado e operacional. Saidas devem ser sanitizadas. Tokens, senhas, chaves, cookies, connection strings e sessoes nao devem ser retornados.");
});

app.get("/terms", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("text/plain").send("CentralDark MCP Connector Terms\n\nUso restrito a operacao autorizada do projeto MultiZap / clone-deck. Acoes sensiveis exigem confirmacao explicita.");
});

'''

if '/brand.json' not in index:
    marker = 'app.get("/tools.json", (_req, res) => {'
    if marker not in index:
        raise SystemExit('marker tools.json nao encontrado')
    index = index.replace(marker, brand_block + marker, 1)
    INDEX.write_text(index, encoding="utf-8")

oauth = OAUTH.read_text(encoding="utf-8")
if 'logo_uri' not in oauth:
    oauth = oauth.replace(
        'bearer_methods_supported: ["header"],',
        'bearer_methods_supported: ["header"],\n    resource_name: "CentralDark MCP Connector",\n    logo_uri: `${config.publicUrl}/icon.svg`,',
        1,
    )
    oauth = oauth.replace(
        'scopes_supported: ["mcp"],',
        'scopes_supported: ["mcp"],\n    service_documentation: `${config.publicUrl}/brand.json`,\n    op_policy_uri: `${config.publicUrl}/privacy`,\n    op_tos_uri: `${config.publicUrl}/terms`,\n    logo_uri: `${config.publicUrl}/icon.svg`,',
        1,
    )
    OAUTH.write_text(oauth, encoding="utf-8")

print("patch-mcp-branding-source ok")
