#!/usr/bin/env bash
# ============================================================================
# setup-centraldark-portal.sh
# Owner existente do build do Portal + TelePainel.
#
# centralldark.com / www.centralldark.com -> <caminho-vps>
# telepainel.centralldark.com             -> <caminho-vps>
#
# Idempotente: atualiza os repos, builda e reconcilia o snippet Caddy.
# A validação/reload do Caddy pertence ao workflow/caller.
# ============================================================================

set -Eeuo pipefail
umask 022

REPO_URL="https://github.com/segredounlock/clone-deck.git"
CENTRALDARK_ROOT="<caminho-vps>"
DEPLOY_GATE_REPO_DIR="${DEPLOY_GATE_REPO_DIR:-$CENTRALDARK_ROOT}"
DISPATCHER="${CENTRALDARK_DEPLOY_GATE_SCRIPT:-$DEPLOY_GATE_REPO_DIR/scripts/vps/deploy-guards-dispatcher.sh}"
SOURCE_HEAD="${SOURCE_HEAD:-$(git -C "$CENTRALDARK_ROOT" rev-parse HEAD 2>/dev/null || true)}"
[[ "$SOURCE_HEAD" =~ ^[0-9a-f]{40}$ ]] || { echo "[centraldark-portal] SOURCE_HEAD_INVALID"; exit 16; }
[[ -x "$DISPATCHER" ]] || { echo "[centraldark-portal] CANONICAL_DEPLOY_GATE_MISSING"; exit 16; }
TARGET_SHA="$SOURCE_HEAD" REPO_DIR="$DEPLOY_GATE_REPO_DIR" BRANCH=main bash "$DISPATCHER" --gate-only
echo "[centraldark-portal] CANONICAL_DEPLOY_GATE=PASS target=$SOURCE_HEAD"

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
    if command -v bun >/dev/null 2>&1; then
      bun install --no-progress
      bun run build
    elif [ -f package-lock.json ]; then
      npm ci --silent
      npm run build
    else
      echo "[centraldark-portal] PACKAGE_MANAGER_LOCK_MISSING"
      exit 24
    fi
    test -f dist/index.html
  )
done

TMP_SNIPPET="$(mktemp)"
trap 'rm -f "$TMP_SNIPPET"' EXIT
cat > "$TMP_SNIPPET" <<'CADDY'
centralldark.com, www.centralldark.com {
    root * <caminho-vps>
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
    root * <caminho-vps>
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
