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

# Ao invés de checar DIRTY e falhar bloqueando a atualização, vamos apenas registrar
# se a branch está suja e prosseguir mesclando as atualizações do remote sem sobrescrever o trabalho
# não comitado (Evitando reset --hard) usando stashing inteligente.
DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)

BEFORE=$(git rev-parse --short HEAD)
git fetch origin "$BRANCH" >> "$LOG" 2>&1

if [ -n "$DIRTY" ]; then
  echo "[INFO] Alteracoes locais detectadas, fazendo stash antes do pull seguro..." >> "$LOG"
  git stash push -m "WIP before webhook auto-pull" >> "$LOG" 2>&1
  
  # Aqui o pull.rebase resolve commits remotos com a cabeça preservando histórico.
  git pull origin "$BRANCH" --rebase >> "$LOG" 2>&1 || {
     echo "[ERRO] Conflito crítico de rebase! Abortando e restaurando stash." >> "$LOG"
     git rebase --abort >> "$LOG" 2>&1
     git stash pop >> "$LOG" 2>&1
     exit 1
  }
  
  echo "[INFO] Restaurando alteracoes locais do stash..." >> "$LOG"
  # Retorna as alterações locais sem comitar (mascarando possíveis conflitos)
  git stash pop >> "$LOG" 2>&1 || echo "[AVISO] Stash pop gerou avisos. Resolva manualmente." >> "$LOG"
else
  # Se não estava sujo, fazemos o avanço rápido
  git pull origin "$BRANCH" --ff-only >> "$LOG" 2>&1 || git rebase origin/"$BRANCH" >> "$LOG" 2>&1
fi

AFTER=$(git rev-parse --short HEAD)

echo "[OK] $BEFORE -> $AFTER $(git log --oneline -1 2>/dev/null || echo '')" >> "$LOG"

# POST-DEPLOY automático
if [ -f "$REPO_DIR/scripts/post-deploy.sh" ]; then
  echo "[POST-DEPLOY] Executando..." >> "$LOG"
  bash "$REPO_DIR/scripts/post-deploy.sh" >> "$LOG" 2>&1 || echo "[WARN] post-deploy falhou" >> "$LOG"
fi

echo "" >> "$LOG"
echo "Pull OK: $BEFORE -> $AFTER"
