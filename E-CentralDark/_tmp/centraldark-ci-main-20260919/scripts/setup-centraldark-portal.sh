#!/usr/bin/env bash
# ============================================================================
# setup-centraldark-portal.sh
# Owner existente do build do Portal + TelePainel.
#
# centralldark.com / www.centralldark.com -> /root/CentralDark/apps/portal
# telepainel.centralldark.com             -> /root/CentralDark/apps/Telepanel
#
# Idempotente: atualiza os repos, builda e reconcilia o snippet Caddy.
# A validação/reload do Caddy pertence ao workflow/caller.
# ============================================================================

set -Eeuo pipefail
umask 022

REPO_URL="https://github.com/segredounlock/clone-deck.git"
CENTRALDARK_ROOT="/root/CentralDark"
PORTAL_DIR="$CENTRALDARK_ROOT/apps/portal"
TELEPANEL_DIR="$CENTRALDARK_ROOT/apps/Telepanel"
CADDY_SNIPPET="$CENTRALDARK_ROOT/infra/caddy/portal.Caddyfile"

log() { echo "[centraldark-portal] $*"; }

log "Preparando estrutura existente em $CENTRALDARK_ROOT"
mkdir -p "$CENTRALDARK_ROOT/apps" \
         "$CENTRALDARK_ROOT/infra/caddy" \
         "$CENTRALDARK_ROOT/logs" \
         "$CENTRALDARK_ROOT/revisoes"

for TARGET in "$PORTAL_DIR" "$TELEPANEL_DIR"; do
  if [ ! -d "$TARGET/.git" ]; then
    log "Clonando fonte existente em $TARGET"
    git clone "$REPO_URL" "$TARGET"
  else
    log "Atualizando $TARGET por fast-forward"
    git -C "$TARGET" pull --ff-only
  fi

  log "Buildando $TARGET"
  (
    cd "$TARGET"
    npm ci --silent
    npm run build
    test -f dist/index.html
  )
done

TMP_SNIPPET="$(mktemp)"
trap 'rm -f "$TMP_SNIPPET"' EXIT
cat > "$TMP_SNIPPET" <<'CADDY'
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

if [ ! -f "$CADDY_SNIPPET" ] || ! cmp -s "$TMP_SNIPPET" "$CADDY_SNIPPET"; then
  log "Atualizando snippet Caddy canônico"
  install -m 0644 "$TMP_SNIPPET" "$CADDY_SNIPPET"
else
  log "Snippet Caddy já está reconciliado"
fi

log "BUILD_PORTAL=PASS path=$PORTAL_DIR/dist"
log "BUILD_TELEPANEL=PASS path=$TELEPANEL_DIR/dist"
log "CADDY_SNIPPET=$CADDY_SNIPPET"
