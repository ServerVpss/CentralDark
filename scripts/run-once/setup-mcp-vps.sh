#!/usr/bin/env bash
# setup-mcp-vps.sh — Prepara o MCP CentralDark na VPS de forma idempotente.
#
# O QUE FAZ:
#   - cria a árvore /root/CentralDark/{apps/mcp,logs/mcp,secrets}
#   - copia o código do MCP do repo pra /root/CentralDark/apps/mcp/
#   - roda npm install + build
#   - gera modelo de mcp.env (sem valores reais) se não existir
#   - gera relatório em /root/CentralDark/revisoes/
#
# O QUE NÃO FAZ (precisa ação humana):
#   - preencher GITHUB_CLIENT_SECRET e MCP_SESSION_SECRET reais
#   - editar Caddy real
#   - subir PM2
#
# Pode rodar várias vezes — é idempotente.

set -euo pipefail

# === Configuração ===
REPO_DIR="/root/Multizap/apps/clone-deck"
MCP_SRC="$REPO_DIR/CentralDark/apps/mcp"
PM2_SRC="$REPO_DIR/CentralDark/infra/pm2/mcp.pm2.json"
SECRET_EXAMPLE="$REPO_DIR/CentralDark/secrets/mcp.env.example"

CD_BASE="/root/CentralDark"
APP_DIR="$CD_BASE/apps/mcp"
LOG_DIR="$CD_BASE/logs/mcp"
SECRETS_DIR="$CD_BASE/secrets"
PM2_DIR="$CD_BASE/infra/pm2"
CADDY_DIR="$CD_BASE/infra/caddy"

TS="$(date +%Y%m%d-%H%M%S)"
REV="$CD_BASE/revisoes/$TS/setup-mcp-vps"
mkdir -p "$REV"
RESUMO="$REV/resumo.md"

log()  { echo -e "[$(date +%H:%M:%S)] $*" | tee -a "$RESUMO"; }
fail() { echo -e "❌ $*" | tee -a "$RESUMO"; exit 1; }

log "# Setup MCP CentralDark — $TS"
log ""

# === 1. Validações ===
log "## 1. Validações"
command -v node >/dev/null || fail "Node.js não instalado"
command -v npm  >/dev/null || fail "npm não instalado"
NODE_VER="$(node -v)"
log "- Node: $NODE_VER"

[ -d "$MCP_SRC" ] || fail "Código do MCP não encontrado em $MCP_SRC. Faça git pull primeiro."
log "- Código do MCP OK em $MCP_SRC"
log ""

# === 2. Criar pastas ===
log "## 2. Pastas"
for d in "$APP_DIR" "$LOG_DIR" "$SECRETS_DIR" "$PM2_DIR" "$CADDY_DIR"; do
  mkdir -p "$d"
  log "- ✅ $d"
done
chmod 700 "$SECRETS_DIR"
log "- 🔒 chmod 700 em $SECRETS_DIR"
log ""

# === 3. Copiar código (rsync, sem node_modules) ===
log "## 3. Copiar código do MCP"
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  "$MCP_SRC/" "$APP_DIR/"
log "- ✅ Código sincronizado em $APP_DIR"

# Copiar PM2 e Caddy snippets para a árvore CentralDark
rsync -a "$PM2_SRC" "$PM2_DIR/mcp.pm2.json"
log "- ✅ PM2 snippet em $PM2_DIR/mcp.pm2.json"
rsync -a "$REPO_DIR/CentralDark/infra/caddy/mcp.Caddyfile" "$CADDY_DIR/mcp.Caddyfile"
log "- ✅ Caddy snippet em $CADDY_DIR/mcp.Caddyfile"
log ""

# === 4. Build ===
log "## 4. Build"
cd "$APP_DIR"
npm install --no-audit --no-fund 2>&1 | tail -20 | tee -a "$REV/npm-install.log" >/dev/null
log "- ✅ npm install"
npm run build 2>&1 | tee -a "$REV/npm-build.log" >/dev/null
log "- ✅ npm run build"
[ -f "$APP_DIR/dist/index.js" ] || fail "Build não gerou dist/index.js"
log "- ✅ dist/index.js gerado"
log ""

# === 5. Modelo de secret ===
log "## 5. Secret"
if [ ! -f "$SECRETS_DIR/mcp.env" ]; then
  cp "$SECRET_EXAMPLE" "$SECRETS_DIR/mcp.env"
  chmod 600 "$SECRETS_DIR/mcp.env"
  log "- ⚠️  $SECRETS_DIR/mcp.env CRIADO COMO MODELO. Preencher os valores reais manualmente:"
  log "      - GITHUB_CLIENT_SECRET (do GitHub OAuth App)"
  log "      - MCP_SESSION_SECRET   (gerar com: openssl rand -hex 32)"
else
  log "- ✅ $SECRETS_DIR/mcp.env já existe (não sobrescrito)"
fi
log ""

# === 6. Próximos passos manuais ===
log "## 6. Próximos passos (AÇÃO HUMANA — não automatizado)"
log ""
log "### Preencher secret:"
log '```'
log "nano $SECRETS_DIR/mcp.env"
log '```'
log ""
log "### Ativar Caddy (PRECISA CONFIRMAÇÃO):"
log '```'
log "# Adicionar no Caddyfile principal:"
log "import $CADDY_DIR/mcp.Caddyfile"
log "caddy validate --config /etc/caddy/Caddyfile"
log "systemctl reload caddy"
log '```'
log ""
log "### Subir PM2:"
log '```'
log "pm2 start $PM2_DIR/mcp.pm2.json"
log "pm2 save"
log '```'
log ""
log "### Testar:"
log '```'
log "curl -s https://mcp.centralldark.com/health | jq"
log '```'
log ""

log "✅ Setup base concluído. Relatório completo em: $REV"
echo "$REV"
