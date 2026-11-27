#!/usr/bin/env bash
# ============================================================================
#  sync-para-centraldark-monorepo.sh
#
#  Espelha o código deste projeto (editado no Lovable) para duas pastas
#  locais no VPS:
#
#    /root/CentralDark/apps/web     → landing page + /auth
#    /root/CentralDark/apps/portal  → portal pós-login (todas as outras rotas)
#
#  O código-fonte é o MESMO nos dois lugares. O que muda é a variável
#  VITE_APP_MODE injetada no build:
#
#    VITE_APP_MODE=web      → só mostra landing + auth (resto vira NotFound)
#    VITE_APP_MODE=portal   → só mostra portal + rotas internas
#
#  Fluxo:
#    1. Atualiza o repo Lovable local (git pull)
#    2. rsync do código pras duas pastas
#    3. npm ci + npm run build em cada uma (com VITE_APP_MODE diferente)
#
#  O build web é publicado em /var/www/centralldark porque o serviço Caddy
#  não deve depender de atravessar /root (0700). O source/build permanece
#  em /root/CentralDark/apps/web; /var/www é somente artefato de deploy.
#  Portal permanece no owner atual até medição específica.
#
#  Uso:
#    bash scripts/sync-para-centraldark-monorepo.sh
# ============================================================================

set -euo pipefail

# ---------- Config ----------------------------------------------------------
LOVABLE_REPO_DIR="${LOVABLE_REPO_DIR:-/root/Multizap/apps/clone-deck}"
WEB_TARGET="${WEB_TARGET:-/root/CentralDark/apps/web}"
PORTAL_TARGET="${PORTAL_TARGET:-/root/CentralDark/apps/portal}"
PUBLIC_WEB_ROOT="${PUBLIC_WEB_ROOT:-/var/www/centralldark}"
LOG_PREFIX="[sync-centraldark]"

log() { echo "$LOG_PREFIX $*"; }
die() { echo "$LOG_PREFIX ERRO: $*" >&2; exit 1; }

# ---------- 1. Localizar o repo Lovable ------------------------------------
if [ ! -d "$LOVABLE_REPO_DIR/.git" ]; then
  for guess in \
      /root/Multizap/apps/clone-deck \
      /root/CentralDark/apps/clone-deck \
      /root/clone-deck \
      "$PWD"; do
    if [ -d "$guess/.git" ]; then
      LOVABLE_REPO_DIR="$guess"
      break
    fi
  done
fi
[ -d "$LOVABLE_REPO_DIR/.git" ] || die "Repo Lovable não encontrado. Defina LOVABLE_REPO_DIR=..."
log "Repo Lovable: $LOVABLE_REPO_DIR"

log "Atualizando referência do repo Lovable sem destruir estado local…"
(
  cd "$LOVABLE_REPO_DIR"
  git fetch origin main
  if git diff --quiet && git diff --cached --quiet; then
    git merge --ff-only origin/main
  else
    log "AVISO: repo Lovable está dirty; preservando estado local e usando o conteúdo atual"
  fi
) || log "AVISO: atualização fast-forward falhou — preservando o que já existe em disco"

LOVABLE_HASH="$(cd "$LOVABLE_REPO_DIR" && git rev-parse --short HEAD)"
log "Commit atual do Lovable: $LOVABLE_HASH"

# ---------- 2. Função de sync + build pra uma pasta -------------------------
sync_and_build() {
  local target="$1"
  local mode="$2"
  local last_built_file="$target/.last-built-hash"

  log "==== $mode → $target ===="
  mkdir -p "$target"

  log "[$mode] Sincronizando arquivos via rsync…"
  rsync -a --delete \
    --exclude='.git/' \
    --exclude='node_modules/' \
    --exclude='dist/' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.lovable/' \
    --exclude='.last-built-hash' \
    --exclude='.synced-from-lovable' \
    --exclude='*.log' \
    "$LOVABLE_REPO_DIR/" "$target/"

  echo "$LOVABLE_HASH" > "$target/.synced-from-lovable"

  local last_built
  last_built="$(cat "$last_built_file" 2>/dev/null || echo '')"

  if [ "$last_built" != "$LOVABLE_HASH" ] || [ ! -d "$target/dist" ]; then
    log "[$mode] Buildando com VITE_APP_MODE=$mode…"
    (
      cd "$target"
      if [ -f package-lock.json ]; then
        npm ci --silent
      else
        npm install --silent
      fi
      VITE_APP_MODE="$mode" npm run build
    )
    echo "$LOVABLE_HASH" > "$last_built_file"
  else
    log "[$mode] Build já está em $LOVABLE_HASH — pulando"
  fi
}

# ---------- 3. Roda pras duas pastas ---------------------------------------
sync_and_build "$WEB_TARGET"    "web"
sync_and_build "$PORTAL_TARGET" "portal"

# ---------- 4. Publica somente o build web no root legível pelo Caddy -------
[ -f "$WEB_TARGET/dist/index.html" ] || die "Build web ausente: $WEB_TARGET/dist/index.html"
install -d -m 0755 "$PUBLIC_WEB_ROOT"
rsync -a --delete "$WEB_TARGET/dist/" "$PUBLIC_WEB_ROOT/"
find "$PUBLIC_WEB_ROOT" -type d -exec chmod 0755 {} +
find "$PUBLIC_WEB_ROOT" -type f -exec chmod 0644 {} +
log "[web] Publicado em $PUBLIC_WEB_ROOT (artefato; source continua em $WEB_TARGET)"

log "OK — sync completo (commit $LOVABLE_HASH)"
log "    web source/build → $WEB_TARGET/dist"
log "    web publicado    → $PUBLIC_WEB_ROOT"
log "    portal           → $PORTAL_TARGET/dist"
