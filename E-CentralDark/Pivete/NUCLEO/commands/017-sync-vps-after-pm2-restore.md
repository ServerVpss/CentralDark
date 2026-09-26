# COMANDO - 017-sync-vps-after-pm2-restore.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\run-once\done\017-sync-vps-after-pm2-restore.sh
**SHA:** 63c8493889fadac7
**Timestamp:** 2026-08-26T19:32:52.901558
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- say "Status após restart: $GW_STATUS"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 017: Sync VPS após restore do PM2
#
# Objetivo: Atualizar código, landing page, bot, gateway e caddy
#           após pm2 resurrect na VPS.
#
# Regras:
#   - Não usar pm2 restart all
#   - Não apagar secrets
#   - Não imprimir tokens
#   - Fazer backup antes de alterar
#   - Validar Caddy antes de recarregar
#   - Usar rsync para gateway (não cp -a)
# ══════════════════════════════════════════════════════════════
set -uo pipefail

# ══════════════════════════════════════════════════════════════
# CONFIGURAÇÕES
# ══════════════════════════════════════════════════════════════
CLONE_DECK="/root/Multizap/apps/clone-deck"
GATEWAY_SRC="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway"
GATEWAY_DST="/root/Multizap/gateway"
PUBLIC_ROOT="/var/www/multizap"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/sync-vps-after-pm2-restore"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_PREFIX="[017]"

mkdir -p "$REV"/{antes,depois,backups,logs}

# ══════════════════════════════════════════════════════════════
# FUNÇÕES
# ══════════════════════════════════════════════════════════════
say()  { echo "$LOG_PREFIX $*"; }
log()  { echo "[$TIMESTAMP] $*" >> "$REV/resumo.md"; }
ts()   { echo "[$(date '+%H:%M:%S')] $*"; }
hr()   { echo "──────────────────────────────────────────────"; }

# Só loga que a variável existe, nunca o valor
safe_var() {
  local varname="$1"
  local val="${!varname:-}"
  if [ -n "$val" ]; then
    echo "$varname=EXISTE (${#val} caracteres)"
  else
    echo "$varname=NAO_DEFINIDA"
  fi
}

# ══════════════════════════════════════════════════════════════
# INÍCIO
# ══════════════════════════════════════════════════════════════
exec > >(tee -a "$REV/logs/execucao-completa.log") 2>&1

say "══════════════════════════════════════════════════"
say " RUN-ONCE 017: Sync VPS após restore do PM2"
say " Data: $(date)"
say "══════════════════════════════════════════════════"
say ""

# ══════════════════════════════════════════════════════════════
# 1. SALVAR ESTADO ANTES
# ══════════════════════════════════════════════════════════════
say ">> [1/9] Salvando estado ANTES das alterações..."

cd "$CLONE_DECK" 2>/dev/null || {
  say "ERRO: $CLONE_DECK não encontrado"
  exit 1
}

hr > "$REV/antes/estado-antes.md"
echo "# Estado Antes das Alterações" >> "$REV/antes/estado-antes.md"
echo "Data: $TIMESTAMP" >> "$REV/antes/estado-antes.md"
echo "" >> "$REV/antes/estado-antes.md"

echo "## Commit atual" >> "$REV/antes/estado-antes.md"
git log --oneline -3 >> "$REV/antes/estado-antes.md" 2>&1
git log --oneline -1 > "$REV/antes/commit-atual.txt" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Git status" >> "$REV/antes/estado-antes.md"
git status --short --branch >> "$REV/antes/estado-antes.md" 2>&1
git status --short > "$REV/antes/git-status-antes.txt" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Mudanças locais não commitadas" >> "$REV/antes/estado-antes.md"
git diff HEAD > "$REV/antes/diff-local-antes.patch" 2>&1
wc -l < "$REV/antes/diff-local-antes.patch" | xargs echo "Linhas no diff:" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## PM2 list" >> "$REV/antes/estado-antes.md"
pm2 list --no-color >> "$REV/antes/pm2-list-antes.txt" 2>&1
cat "$REV/antes/pm2-list-antes.txt" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Portas" >> "$REV/antes/estado-antes.md"
ss -ltnp >> "$REV/antes/portas-antes.txt" 2>&1
ss -ltnp | grep -E ':80|:443|:3000|:3010|:3100|:5000|:8081|:9003' >> "$REV/antes/estado-antes.md" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Caddy status" >> "$REV/antes/estado-antes.md"
systemctl status caddy --no-pager -l >> "$REV/antes/caddy-status-antes.txt" 2>&1
head -10 "$REV/antes/caddy-status-antes.txt" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Caddyfile" >> "$REV/antes/estado-antes.md"
cat /etc/caddy/Caddyfile > "$REV/antes/Caddyfile.backup" 2>&1
wc -l < "$REV/antes/Caddyfile.backup" | xargs echo "Linhas no Caddyfile:" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Landing page atual" >> "$REV/antes/estado-antes.md"
if [ -f "$PUBLIC_ROOT/web/index.html" ]; then
  LANDING_SIZE=$(wc -c < "$PUBLIC_ROOT/web/index.html")
  LANDING_LINES=$(wc -l < "$PUBLIC_ROOT/web/index.html")
  LANDING_HAS_SCRIPT=$(grep -c "ALLOWED_PATHS" "$PUBLIC_ROOT/web/index.html" 2>/dev/null || echo "0")
  echo "Tamanho: $LANDING_SIZE bytes, $LANDING_LINES linhas" >> "$REV/antes/estado-antes.md"
  echo "Script seguro (ALLOWED_PATHS): $LANDING_HAS_SCRIPT ocorrências" >> "$REV/antes/estado-antes.md"
  cp "$PUBLIC_ROOT/web/index.html" "$REV/antes/landing-page-atual.html"
else
  echo "Landing page AUSENTE em $PUBLIC_ROOT/web/" >> "$REV/antes/estado-antes.md"
fi

echo "" >> "$REV/antes/estado-antes.md"
echo "## Bot dist" >> "$REV/antes/estado-antes.md"
if [ -d "$PUBLIC_ROOT/bot" ]; then
  BOT
```