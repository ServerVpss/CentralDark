#!/usr/bin/env bash
# ============================================================================
#  setup-centraldark-portal.sh
#  Migração: serve o mesmo build em dois domínios separados.
#
#    centralldark.com / www.centralldark.com  → /root/CentralDark/apps/portal
#    telepainel.centralldark.com              → /root/CentralDark/apps/Telepanel
#
#  Isolado do install.sh principal (que ficou intocado).
#  Idempotente: pode rodar várias vezes.
#
#  Uso:
#    bash scripts/setup-centraldark-portal.sh
# ============================================================================

set -euo pipefail

REPO_URL="https://github.com/segredounlock/clone-deck.git"
CENTRALDARK_ROOT="/root/CentralDark"
PORTAL_DIR="$CENTRALDARK_ROOT/apps/portal"
TELEPANEL_DIR="$CENTRALDARK_ROOT/apps/Telepanel"
CADDY_SNIPPET="$CENTRALDARK_ROOT/infra/caddy/portal.Caddyfile"

log() { echo "[centraldark-portal] $*"; }

log "Criando estrutura em $CENTRALDARK_ROOT"
mkdir -p "$CENTRALDARK_ROOT/apps" \
         "$CENTRALDARK_ROOT/infra/caddy" \
         "$CENTRALDARK_ROOT/logs" \
         "$CENTRALDARK_ROOT/revisoes"

for TARGET in "$PORTAL_DIR" "$TELEPANEL_DIR"; do
  if [ ! -d "$TARGET/.git" ]; then
    log "Clonando repo em $TARGET"
    git clone "$REPO_URL" "$TARGET"
  else
    log "Atualizando repo em $TARGET"
    (cd "$TARGET" && git pull --ff-only)
  fi
  log "Buildando $TARGET"
  (cd "$TARGET" && npm ci --silent && npm run build)
done

if [ ! -f "$CADDY_SNIPPET" ]; then
  log "Gerando snippet Caddy em $CADDY_SNIPPET"
  cat > "$CADDY_SNIPPET" <<'CADDY'
centralldark.com, www.centralldark.com {
    root * /root/CentralDark/apps/portal/dist
    try_files {path} /index.html
    file_server
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
    }
}

telepainel.centralldark.com {
    root * /root/CentralDark/apps/Telepanel/dist
    try_files {path} /index.html
    file_server
    encode gzip
}
CADDY
else
  log "Snippet Caddy já existe — mantendo"
fi

cat <<'AVISO'

================================================================
Snippet Caddy pronto em:
  /root/CentralDark/infra/caddy/portal.Caddyfile

Próximo passo (REQUER CONFIRMAÇÃO MANUAL — Caddy é sensível):
  1. Adicionar no Caddyfile principal:
       import /root/CentralDark/infra/caddy/portal.Caddyfile
  2. Validar:   caddy validate --config /etc/caddy/Caddyfile
  3. Recarregar: systemctl reload caddy

Garantir que o DNS dos 3 hostnames já aponte pro IP da VPS antes do reload.
================================================================
AVISO
