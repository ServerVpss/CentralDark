#!/usr/bin/env bash
# ============================================================================
#  sync-para-centraldark-monorepo.sh
#
#  Espelha o código deste projeto (editado no Lovable) para dentro do
#  monorepo ServerVpss/CentralDark, na pasta apps/web/.
#
#  Fluxo:
#    1. Atualiza o repo Lovable local  (git pull)
#    2. Clona/atualiza o monorepo CentralDark
#    3. rsync do código-fonte pra CentralDark/apps/web/
#    4. Commita + push se houve mudança
#    5. npm ci + npm run build dentro de apps/web/
#    6. Aponta /var/www/centralldark pro dist/
#
#  Pré-requisitos na VPS:
#    - SSH key autorizada no GitHub (git@github.com:ServerVpss/CentralDark.git)
#    - rsync, git, node/npm
#
#  Uso:
#    bash scripts/sync-para-centraldark-monorepo.sh
# ============================================================================

set -euo pipefail

# ---------- Config ----------------------------------------------------------
LOVABLE_REPO_DIR="${LOVABLE_REPO_DIR:-/root/Multizap/apps/clone-deck}"
MONOREPO_DIR="${MONOREPO_DIR:-/root/CentralDark-monorepo}"
MONOREPO_GIT="${MONOREPO_GIT:-git@github.com:ServerVpss/CentralDark.git}"
MONOREPO_BRANCH="${MONOREPO_BRANCH:-main}"
WEB_SUBPATH="${WEB_SUBPATH:-CentralDark/apps/web}"
WEB_TARGET="$MONOREPO_DIR/$WEB_SUBPATH"
PUBLIC_LINK="${PUBLIC_LINK:-/var/www/centralldark}"
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

log "Atualizando repo Lovable (git pull)…"
(cd "$LOVABLE_REPO_DIR" && git pull --ff-only || log "AVISO: git pull falhou — seguindo com o que tem em disco")

LOVABLE_HASH="$(cd "$LOVABLE_REPO_DIR" && git rev-parse --short HEAD)"
log "Commit atual do Lovable: $LOVABLE_HASH"

# ---------- 2. Clonar/atualizar monorepo -----------------------------------
if [ ! -d "$MONOREPO_DIR/.git" ]; then
  log "Clonando monorepo CentralDark em $MONOREPO_DIR"
  git clone --branch "$MONOREPO_BRANCH" "$MONOREPO_GIT" "$MONOREPO_DIR"
else
  log "Atualizando monorepo ($MONOREPO_BRANCH)"
  (cd "$MONOREPO_DIR" && git fetch origin "$MONOREPO_BRANCH" && git checkout "$MONOREPO_BRANCH" && git pull --ff-only)
fi

mkdir -p "$WEB_TARGET"

# ---------- 3. Sync via rsync ----------------------------------------------
log "Sincronizando arquivos → $WEB_TARGET"
rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.lovable/' \
  --exclude='*.log' \
  "$LOVABLE_REPO_DIR/" "$WEB_TARGET/"

# Marcador pra rastrear de qual commit veio
echo "$LOVABLE_HASH" > "$WEB_TARGET/.synced-from-lovable"

# ---------- 4. Commit + push se mudou --------------------------------------
cd "$MONOREPO_DIR"
if [ -z "$(git status --porcelain "$WEB_SUBPATH")" ]; then
  log "Nada mudou em $WEB_SUBPATH — pulando commit/push"
  NEED_BUILD=0
else
  log "Detectadas mudanças — commitando…"
  git add "$WEB_SUBPATH"
  git -c user.email="sync@centraldark.local" \
      -c user.name="CentralDark Sync Bot" \
      commit -m "sync(web): $LOVABLE_HASH do Lovable"
  log "Push para origin/$MONOREPO_BRANCH"
  git push origin "$MONOREPO_BRANCH"
  NEED_BUILD=1
fi

# ---------- 5. Build -------------------------------------------------------
LAST_BUILT_FILE="$WEB_TARGET/.last-built-hash"
LAST_BUILT="$(cat "$LAST_BUILT_FILE" 2>/dev/null || echo '')"

if [ "$NEED_BUILD" = "1" ] || [ "$LAST_BUILT" != "$LOVABLE_HASH" ] || [ ! -d "$WEB_TARGET/dist" ]; then
  log "Buildando $WEB_TARGET"
  cd "$WEB_TARGET"
  if [ -f package-lock.json ]; then
    npm ci --silent
  else
    npm install --silent
  fi
  npm run build
  echo "$LOVABLE_HASH" > "$LAST_BUILT_FILE"
else
  log "Build já está em $LOVABLE_HASH — pulando"
fi

# ---------- 6. Symlink público --------------------------------------------
mkdir -p "$(dirname "$PUBLIC_LINK")"
if [ -L "$PUBLIC_LINK" ] || [ ! -e "$PUBLIC_LINK" ]; then
  ln -sfn "$WEB_TARGET/dist" "$PUBLIC_LINK"
  log "Symlink $PUBLIC_LINK → $WEB_TARGET/dist"
else
  log "AVISO: $PUBLIC_LINK existe e não é symlink — não vou sobrescrever"
fi

log "OK — sync completo (commit $LOVABLE_HASH)"
