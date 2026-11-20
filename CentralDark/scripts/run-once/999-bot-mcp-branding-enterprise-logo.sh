#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/mcp-branding-enterprise-logo"
mkdir -p "$OUT"

echo "== MCP branding enterprise logo ==" | tee "$OUT/resumo.txt"
echo "Relatorio: $OUT" | tee -a "$OUT/resumo.txt"

MCP_JSON="$(pm2 jlist)"
MCP_DIR="$(printf '%s' "$MCP_JSON" | node -e 'const fs=require("fs"); const path=require("path"); const data=JSON.parse(fs.readFileSync(0,"utf8")); const p=data.find(x=>x.name==="MCP-CentralDark"); if(!p){process.exit(2)} const env=p.pm2_env||{}; console.log(env.pm_cwd || path.dirname(env.pm_exec_path||""));')"

if [ -z "$MCP_DIR" ] || [ ! -d "$MCP_DIR" ]; then
  echo "ERRO: MCP_DIR invalido" | tee -a "$OUT/resumo.txt"
  exit 1
fi

cd "$MCP_DIR"

test -f src/index.ts
test -f src/oauth.ts

cp -a src/index.ts "$OUT/index.ts.bak"
cp -a src/oauth.ts "$OUT/oauth.ts.bak"

python3 <<'PY'
from pathlib import Path

ICON = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="panel" x1="60" y1="40" x2="460" y2="470" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e1493a"/><stop offset="0.48" stop-color="#b72422"/><stop offset="1" stop-color="#5b070c"/></linearGradient><radialGradient id="glow" cx="35%" cy="20%" r="70%"><stop offset="0" stop-color="#ff8a73" stop-opacity="0.45"/><stop offset="1" stop-color="#ff8a73" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" rx="112" fill="#07090d"/><rect x="36" y="36" width="440" height="440" rx="102" fill="url(#panel)"/><rect x="36" y="36" width="440" height="440" rx="102" fill="url(#glow)"/><path d="M92 130c0-23 15-38 38-38h252c23 0 38 15 38 38v252c0 23-15 38-38 38H130c-23 0-38-15-38-38V130Z" fill="none" stroke="#fff" stroke-opacity="0.10" stroke-width="2"/><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M230 174c-23-18-55-27-87-16-45 15-75 53-75 98s30 83 75 98c32 11 64 2 87-16" stroke-width="42"/><path d="M262 162v188" stroke-width="42"/><path d="M262 162h54c63 0 104 38 104 94s-41 94-104 94h-54" stroke-width="42"/></g><g fill="none" stroke="#ffd8d2" stroke-opacity="0.72" stroke-width="8" stroke-linecap="round"><path d="M126 256h-34"/><path d="M420 256h34"/><path d="M256 126V92"/><path d="M256 420v-34"/></g><circle cx="92" cy="256" r="10" fill="#ffd8d2"/><circle cx="454" cy="256" r="10" fill="#ffd8d2"/><circle cx="256" cy="92" r="10" fill="#ffd8d2"/><circle cx="256" cy="420" r="10" fill="#ffd8d2"/><circle cx="256" cy="256" r="13" fill="#fff"/></svg>'''

LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 360"><defs><linearGradient id="panel" x1="35" y1="24" x2="310" y2="326" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e1493a"/><stop offset="0.48" stop-color="#b72422"/><stop offset="1" stop-color="#5b070c"/></linearGradient><radialGradient id="glow" cx="35%" cy="20%" r="70%"><stop offset="0" stop-color="#ff8a73" stop-opacity="0.45"/><stop offset="1" stop-color="#ff8a73" stop-opacity="0"/></radialGradient></defs><rect width="1280" height="360" rx="52" fill="#07090d"/><rect x="42" y="42" width="276" height="276" rx="68" fill="url(#panel)"/><rect x="42" y="42" width="276" height="276" rx="68" fill="url(#glow)"/><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M172 127c-16-12-39-19-61-11-32 11-53 38-53 64s21 53 53 64c22 8 45 1 61-11" stroke-width="30" transform="translate(44 0)"/><path d="M194 118v124" stroke-width="30" transform="translate(44 0)"/><path d="M194 118h36c43 0 70 25 70 62s-27 62-70 62h-36" stroke-width="30" transform="translate(44 0)"/></g><circle cx="224" cy="180" r="9" fill="#fff"/><g font-family="Inter, Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="8"><text x="372" y="168" font-size="78" fill="#fff">CENTRAL</text><text x="828" y="168" font-size="78" fill="#e1493a">DARK</text></g><text x="378" y="224" font-family="Inter, Arial, Helvetica, sans-serif" font-size="25" font-weight="600" letter-spacing="5" fill="#aab3c2">MCP CONNECTOR  /  MULTIZAP OPERATIONS</text><path d="M376 258h742" stroke="#fff" stroke-opacity="0.12" stroke-width="2"/><text x="378" y="296" font-family="Inter, Arial, Helvetica, sans-serif" font-size="21" font-weight="500" fill="#788397">Secure automation, GitHub, VPS, Supabase and operational memory.</text></svg>'''

index_path = Path('src/index.ts')
s = index_path.read_text(encoding='utf-8')

# Remove bloco anterior simples se existir só pelo conteúdo SVG antigo não é seguro. Em vez disso,
# se as rotas existem, troca o corpo das strings pelo logo enterprise.
if '/brand.json' not in s:
    marker = 'app.get("/tools.json", (_req, res) => {'
    if marker not in s:
        raise SystemExit('marker tools.json nao encontrado')
    block = f'''
const BRAND_ICON_SVG = {ICON!r};
const BRAND_LOGO_SVG = {LOGO!r};
const BRAND_NAME = "CentralDark";
const BRAND_PRODUCT = "CentralDark MCP Connector";
const BRAND_DESCRIPTION = "Conector operacional seguro para MultiZap / clone-deck";
const BRAND_COMPANY = "CentralDark Operacoes Digitais";

app.get("/icon.svg", (_req, res) => {{
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.type("image/svg+xml").send(BRAND_ICON_SVG);
}});
app.get("/logo.svg", (_req, res) => {{
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.type("image/svg+xml").send(BRAND_LOGO_SVG);
}});
app.get("/brand.json", (_req, res) => {{
  res.setHeader("Cache-Control", "no-store");
  res.json({{
    ok: true,
    name: BRAND_NAME,
    product: BRAND_PRODUCT,
    company: BRAND_COMPANY,
    description: BRAND_DESCRIPTION,
    logo_uri: `${{config.publicUrl}}/icon.svg`,
    wordmark_uri: `${{config.publicUrl}}/logo.svg`,
    privacy_uri: `${{config.publicUrl}}/privacy`,
    terms_uri: `${{config.publicUrl}}/terms`,
    catalogVersion: CATALOG_VERSION,
    toolCount: getCatalogSummary().toolCount,
    security: {{ sanitized_output: true, returns_secrets: false, blocks_private_values: true }}
  }});
}});
app.get("/privacy", (_req, res) => {{
  res.setHeader("Cache-Control", "no-store");
  res.type("text/plain").send("CentralDark MCP Connector Privacy\\n\\nConector privado e operacional. Saidas devem ser sanitizadas. Tokens, senhas, chaves, cookies, connection strings e sessoes nao devem ser retornados.");
}});
app.get("/terms", (_req, res) => {{
  res.setHeader("Cache-Control", "no-store");
  res.type("text/plain").send("CentralDark MCP Connector Terms\\n\\nUso restrito a operacao autorizada do projeto MultiZap / clone-deck. Acoes sensiveis exigem confirmacao explicita.");
}});

'''
    s = s.replace(marker, block + marker, 1)
else:
    # Atualiza constantes se o bloco anterior já existe.
    import re
    s = re.sub(r"const BRAND_ICON_SVG = .*?;", f"const BRAND_ICON_SVG = {ICON!r};", s)
    s = re.sub(r"const BRAND_LOGO_SVG = .*?;", f"const BRAND_LOGO_SVG = {LOGO!r};", s)
    if 'wordmark_uri' not in s:
        s = s.replace('logo_uri: `${config.publicUrl}/icon.svg`,', 'logo_uri: `${config.publicUrl}/icon.svg`,\n    wordmark_uri: `${config.publicUrl}/logo.svg`,', 1)

index_path.write_text(s, encoding='utf-8')

oauth_path = Path('src/oauth.ts')
o = oauth_path.read_text(encoding='utf-8')
if 'logo_uri' not in o:
    o = o.replace('bearer_methods_supported: ["header"],', 'bearer_methods_supported: ["header"],\n    resource_name: "CentralDark MCP Connector",\n    logo_uri: `${config.publicUrl}/icon.svg`,', 1)
    o = o.replace('scopes_supported: ["mcp"],', 'scopes_supported: ["mcp"],\n    service_documentation: `${config.publicUrl}/brand.json`,\n    op_policy_uri: `${config.publicUrl}/privacy`,\n    op_tos_uri: `${config.publicUrl}/terms`,\n    logo_uri: `${config.publicUrl}/icon.svg`,', 1)
    oauth_path.write_text(o, encoding='utf-8')
PY

npm run build > "$OUT/npm-build.log" 2>&1
pm2 restart MCP-CentralDark --update-env > "$OUT/pm2-restart.log" 2>&1
sleep 2

curl -fsS http://127.0.0.1:9100/icon.svg > "$OUT/icon.svg"
curl -fsS http://127.0.0.1:9100/logo.svg > "$OUT/logo.svg"
curl -fsS http://127.0.0.1:9100/brand.json > "$OUT/brand.json"

python3 <<PY
import json, pathlib
out=pathlib.Path('$OUT')
brand=json.loads((out/'brand.json').read_text())
print('brand_ok=', brand.get('ok'))
print('logo_uri=', brand.get('logo_uri'))
print('wordmark_uri=', brand.get('wordmark_uri'))
PY

echo "OK: logo enterprise aplicado" | tee -a "$OUT/resumo.txt"
