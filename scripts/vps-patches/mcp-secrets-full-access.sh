#!/bin/bash
# ============================================================
# Patch MCP: acesso total a /root/CentralDark/secrets
# ============================================================
# Adiciona 3 tools no /admin/mcp que leem QUALQUER arquivo dentro
# de /root/CentralDark/secrets (.env, .txt, .json, .password, etc):
#
#   - list_secrets       → lista todos os arquivos
#   - read_secret        → lê 1 arquivo pelo nome (retorna conteúdo cru + parse .env se aplicar)
#   - read_all_secrets   → lê TODOS de uma vez (dump completo)
#
# Segurança:
#   - Só aceita chamadas com escopo `admin`
#   - Trava path traversal (bloqueia ../, /, etc.)
#   - Loga tudo em /root/CentralDark/logs/mcp-secrets-audit.log
#
# Uso na VPS:
#   bash /root/CentralDark/scripts/vps-patches/mcp-secrets-full-access.sh
# ============================================================

set -euo pipefail

MCP_DIR="/root/mcp-server"                  # <-- ajustar se o path do dist for outro
DIST_FILE="$MCP_DIR/dist/index.js"
SECRETS_DIR="/root/CentralDark/secrets"
LOG_DIR="/root/CentralDark/logs"
INJECT_FILE="$MCP_DIR/dist/secrets-tools.js"
PM2_ID="${PM2_ID:-17}"

TS=$(date +%Y%m%d-%H%M%S)

echo "🛠️  Patch MCP → acesso total aos secrets"
echo "   dist: $DIST_FILE"
echo "   dir:  $SECRETS_DIR"

# 1. Backup
cp "$DIST_FILE" "$DIST_FILE.bak.$TS"
echo "🟢 backup: $DIST_FILE.bak.$TS"

# 2. Garante pasta de log
mkdir -p "$LOG_DIR"
touch "$LOG_DIR/mcp-secrets-audit.log"

# 3. Cria módulo com as 3 tools (arquivo separado, mais limpo)
cat > "$INJECT_FILE" <<'INJECT_EOF'
// AUTO-GERADO pelo patch mcp-secrets-full-access.sh
const fs = require("fs");
const path = require("path");
const SECRETS_DIR = "/root/CentralDark/secrets";
const AUDIT = "/root/CentralDark/logs/mcp-secrets-audit.log";

function audit(action, name, meta = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), action, name, ...meta }) + "\n";
  try { fs.appendFileSync(AUDIT, line); } catch (_) {}
}

function safeResolve(name) {
  // bloqueia path traversal
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error("nome de arquivo inválido");
  }
  const full = path.join(SECRETS_DIR, name);
  if (!full.startsWith(SECRETS_DIR + path.sep) && full !== SECRETS_DIR) {
    throw new Error("path fora do diretório permitido");
  }
  return full;
}

function parseIfEnv(name, content) {
  // se parece com .env, também devolve parseado
  if (!/\.env$|\.env\.|\.password$|\.token$/i.test(name)) return null;
  const parsed = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    parsed[k] = v;
  }
  return Object.keys(parsed).length ? parsed : null;
}

const SECRETS_TOOLS = [
  {
    name: "list_secrets",
    description: "Lista todos os arquivos de segredo em /root/CentralDark/secrets (só nomes).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "read_secret",
    description: "Lê o conteúdo de UM arquivo de /root/CentralDark/secrets. Aceita qualquer formato (.env, .txt, .password, .json, .token, etc). Se for .env, também devolve parseado.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "nome do arquivo (ex: mcp.env, telegram-alerts.env, mcp-admin.password)" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "read_all_secrets",
    description: "Lê TODOS os arquivos de /root/CentralDark/secrets de uma vez. Retorna objeto { nome_arquivo: { raw, parsed? } }.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

async function handleSecretsTool(toolName, args, ctx = {}) {
  const clientId = ctx.clientId || "unknown";
  if (toolName === "list_secrets") {
    const files = fs.readdirSync(SECRETS_DIR).filter((f) => {
      try { return fs.statSync(path.join(SECRETS_DIR, f)).isFile(); } catch { return false; }
    });
    audit("list_secrets", null, { clientId, count: files.length });
    return { content: [{ type: "text", text: JSON.stringify({ files }, null, 2) }] };
  }
  if (toolName === "read_secret") {
    const name = args?.name;
    const full = safeResolve(name);
    const raw = fs.readFileSync(full, "utf8");
    const parsed = parseIfEnv(name, raw);
    audit("read_secret", name, { clientId, bytes: raw.length });
    return { content: [{ type: "text", text: JSON.stringify({ name, raw, parsed }, null, 2) }] };
  }
  if (toolName === "read_all_secrets") {
    const out = {};
    for (const f of fs.readdirSync(SECRETS_DIR)) {
      const full = path.join(SECRETS_DIR, f);
      try {
        if (!fs.statSync(full).isFile()) continue;
        const raw = fs.readFileSync(full, "utf8");
        out[f] = { raw, parsed: parseIfEnv(f, raw) };
      } catch (e) {
        out[f] = { error: e.message };
      }
    }
    audit("read_all_secrets", null, { clientId, count: Object.keys(out).length });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  }
  return null;
}

module.exports = { SECRETS_TOOLS, handleSecretsTool };
INJECT_EOF

echo "🟢 módulo criado: $INJECT_FILE"

# 4. Injeta hook no dist/index.js (uma vez só — idempotente)
if grep -q "SECRETS_TOOLS_LOADED" "$DIST_FILE"; then
  echo "🟡 hook já presente no dist/index.js — pulando injeção"
else
  cat >> "$DIST_FILE" <<'HOOK_EOF'

// === SECRETS_TOOLS_LOADED ===
try {
  const { SECRETS_TOOLS, handleSecretsTool } = require("./secrets-tools.js");
  globalThis.__SECRETS_TOOLS__ = SECRETS_TOOLS;
  globalThis.__handleSecretsTool__ = handleSecretsTool;
  console.log("[mcp] secrets tools loaded:", SECRETS_TOOLS.map(t => t.name).join(", "));
} catch (e) {
  console.error("[mcp] falha carregando secrets-tools:", e.message);
}
HOOK_EOF
  echo "🟢 hook injetado em $DIST_FILE"
fi

echo ""
echo "⚠️  ATENÇÃO: pra as tools aparecerem no tools/list e responderem no tools/call,"
echo "   você precisa referenciar globalThis.__SECRETS_TOOLS__ e __handleSecretsTool__"
echo "   dentro do handler do /admin/mcp. Se o Hermes já sabe, ele completa sozinho."
echo ""

# 5. Restart PM2
pm2 restart "$PM2_ID" --update-env
echo "🟢 pm2 restart id=$PM2_ID"

# 6. Smoke test
sleep 2
echo ""
echo "🧪 Teste rápido (list_secrets):"
curl -s -X POST http://127.0.0.1:8811/admin/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat /root/CentralDark/secrets/mcp-admin.password 2>/dev/null | tr -d '\n')" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_secrets","arguments":{}}}' \
  | head -c 500
echo ""
echo ""
echo "✅ Patch aplicado. Logs de auditoria em: $LOG_DIR/mcp-secrets-audit.log"
