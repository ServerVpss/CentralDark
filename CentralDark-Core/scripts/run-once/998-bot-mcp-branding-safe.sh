#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/mcp-branding-safe"
mkdir -p "$OUT"

echo "== MCP branding safe run-once ==" | tee "$OUT/resumo.txt"
echo "Relatorio: $OUT" | tee -a "$OUT/resumo.txt"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERRO: pm2 nao encontrado" | tee -a "$OUT/resumo.txt"
  exit 1
fi

MCP_JSON="$(pm2 jlist)"
MCP_DIR="$(printf '%s' "$MCP_JSON" | node -e 'const fs=require("fs"); const path=require("path"); const data=JSON.parse(fs.readFileSync(0,"utf8")); const p=data.find(x=>x.name==="MCP-CentralDark"); if(!p){process.exit(2)} const env=p.pm2_env||{}; console.log(env.pm_cwd || path.dirname(env.pm_exec_path||""));')"

if [ -z "$MCP_DIR" ] || [ ! -d "$MCP_DIR" ]; then
  echo "ERRO: MCP_DIR invalido" | tee -a "$OUT/resumo.txt"
  exit 1
fi

echo "MCP_DIR=$MCP_DIR" | tee -a "$OUT/resumo.txt"
cd "$MCP_DIR"

if [ ! -f src/index.ts ] || [ ! -f src/oauth.ts ] || [ ! -f package.json ]; then
  echo "ERRO: arquivos MCP esperados nao encontrados em $MCP_DIR" | tee -a "$OUT/resumo.txt"
  exit 1
fi

cp -a src/index.ts "$OUT/index.ts.bak"
cp -a src/oauth.ts "$OUT/oauth.ts.bak"

python3 <<'PY'
from pathlib import Path

index_path = Path('src/index.ts')
s = index_path.read_text(encoding='utf-8')

marker = 'app.get("/tools.json", (_req, res) => {'
block = r'''
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

if '/brand.json' not in s:
    if marker not in s:
        raise SystemExit('marker tools.json nao encontrado em src/index.ts')
    s = s.replace(marker, block + marker, 1)
    index_path.write_text(s, encoding='utf-8')

oauth_path = Path('src/oauth.ts')
o = oauth_path.read_text(encoding='utf-8')
if 'logo_uri' not in o:
    o = o.replace(
        'bearer_methods_supported: ["header"],',
        'bearer_methods_supported: ["header"],\n    resource_name: "CentralDark MCP Connector",\n    logo_uri: `${config.publicUrl}/icon.svg`,',
        1,
    )
    o = o.replace(
        'scopes_supported: ["mcp"],',
        'scopes_supported: ["mcp"],\n    service_documentation: `${config.publicUrl}/brand.json`,\n    op_policy_uri: `${config.publicUrl}/privacy`,\n    op_tos_uri: `${config.publicUrl}/terms`,\n    logo_uri: `${config.publicUrl}/icon.svg`,',
        1,
    )
    oauth_path.write_text(o, encoding='utf-8')
PY

echo "== Build MCP ==" | tee -a "$OUT/resumo.txt"
npm run build > "$OUT/npm-build.log" 2>&1

echo "== Restart MCP-CentralDark ==" | tee -a "$OUT/resumo.txt"
pm2 restart MCP-CentralDark --update-env > "$OUT/pm2-restart.log" 2>&1
sleep 2

echo "== Validacoes locais ==" | tee -a "$OUT/resumo.txt"
curl -fsS http://127.0.0.1:9100/brand.json > "$OUT/brand.local.json"
curl -fsS http://127.0.0.1:9100/icon.svg | head -c 120 > "$OUT/icon-head.txt"
curl -fsS http://127.0.0.1:9100/tools.json > "$OUT/tools.local.json"

python3 <<PY
import json, pathlib
out=pathlib.Path('$OUT')
brand=json.loads((out/'brand.local.json').read_text())
tools=json.loads((out/'tools.local.json').read_text())
print('brand_ok=', bool(brand.get('ok')))
print('brand_name=', brand.get('name'))
print('tool_count=', len(tools.get('tools', [])) if isinstance(tools, dict) else 'unknown')
PY

echo "OK: branding MCP aplicado" | tee -a "$OUT/resumo.txt"
