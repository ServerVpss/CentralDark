#!/usr/bin/env bash
# ============================================================================
#  Sincroniza o bootstrap.sh do repo PRIVADO (clone-deck) para o repo
#  PÚBLICO (centraldark-install), que é quem o curl do one-liner alcança.
#
#  Roda na VPS, usa o gh CLI já autenticado lá. Idempotente.
#  Uso:  bash scripts/sync-bootstrap-public.sh
# ============================================================================
set -euo pipefail

REPO_PRIV_DIR="/root/Multizap/apps/clone-deck"
PUB_DIR="/tmp/centraldark-install-sync"
PUB_REPO="https://github.com/segredounlock/centraldark-install.git"
BOOTSTRAP_REL="bootstrap.sh"

if [ ! -f "$REPO_PRIV_DIR/$BOOTSTRAP_REL" ]; then
  echo "[sync-bootstrap] bootstrap.sh não encontrado em $REPO_PRIV_DIR" >&2
  exit 1
fi

# Clona/atualiza o público via HTTPS (gh auth setup-git já configurou o helper)
if [ -d "$PUB_DIR/.git" ]; then
  git -C "$PUB_DIR" fetch --depth=1 origin main >/dev/null
  git -C "$PUB_DIR" reset --hard origin/main >/dev/null
else
  rm -rf "$PUB_DIR"
  git clone --depth=1 "$PUB_REPO" "$PUB_DIR" >/dev/null
fi

# Copia o bootstrap mais novo
cp "$REPO_PRIV_DIR/$BOOTSTRAP_REL" "$PUB_DIR/$BOOTSTRAP_REL"
chmod +x "$PUB_DIR/$BOOTSTRAP_REL"

cd "$PUB_DIR"

if git diff --quiet -- "$BOOTSTRAP_REL"; then
  echo "[sync-bootstrap] já está em dia, nada a fazer"
  exit 0
fi

git -c user.email="segredounlock@users.noreply.github.com" \
    -c user.name="SegredoiDev" \
    add "$BOOTSTRAP_REL"

git -c user.email="segredounlock@users.noreply.github.com" \
    -c user.name="SegredoiDev" \
    commit -m "Atualiza bootstrap (sync automático do repo privado)" >/dev/null

git push origin main >/dev/null
echo "[sync-bootstrap] espelho público atualizado com sucesso"
