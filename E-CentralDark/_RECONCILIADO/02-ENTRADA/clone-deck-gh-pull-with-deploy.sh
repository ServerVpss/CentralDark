#!/bin/bash
set -euo pipefail

REPO_DIR="/root/Multizap/apps/clone-deck"
BRANCH="main"
LOG="/var/log/clone-deck-webhook.log"
LOCK="/tmp/clone-deck-gh-pull.lock"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

exec 200>"$LOCK"
if ! flock -n 200; then
  echo "[$(ts)] [LOCK] Outro pull em andamento" >> "$LOG"
  echo "LOCK: outro pull em andamento"
  exit 0
fi

echo "===== $(ts) =====" >> "$LOG"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[ERRO] $REPO_DIR nao e repo git" >> "$LOG"
  exit 1
fi

cd "$REPO_DIR"

CURRENT=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT" != "$BRANCH" ]; then
  git checkout "$BRANCH" >> "$LOG" 2>&1
fi

DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)
if [ -n "$DIRTY" ]; then
  echo "[BLOQUEADO] Alteracoes tracked" >> "$LOG"
  echo "$DIRTY" >> "$LOG"
  exit 1
fi

UNTRACKED=$(git status --porcelain 2>/dev/null | grep '^??' || true)
if [ -n "$UNTRACKED" ]; then
  echo "[INFO] Untracked preservados:" >> "$LOG"
  echo "$UNTRACKED" >> "$LOG"
fi

BEFORE=$(git rev-parse --short HEAD)
git fetch origin "$BRANCH" >> "$LOG" 2>&1
git reset --hard "origin/$BRANCH" >> "$LOG" 2>&1
AFTER=$(git rev-parse --short HEAD)

echo "[OK] $BEFORE -> $AFTER $(git log --oneline -1)" >> "$LOG"

# POST-DEPLOY automático
if [ -f "$REPO_DIR/scripts/post-deploy.sh" ]; then
  echo "[POST-DEPLOY] Executando..." >> "$LOG"
  bash "$REPO_DIR/scripts/post-deploy.sh" >> "$LOG" 2>&1 || echo "[WARN] post-deploy falhou" >> "$LOG"
fi

echo "" >> "$LOG"
echo "Pull OK: $BEFORE -> $AFTER"
