#!/bin/bash
# Auto-Sync Incremental — Sincronização Contínua para Main
# Executa em background; cada mudança = novo commit

set -e

REPO_ROOT="/k/apps/instinto-superior"
BRANCH="main"
SYNC_INTERVAL=30  # segundos
LOG_FILE="${REPO_ROOT}/.claude-logs/auto-sync-incremental.log"

mkdir -p "${REPO_ROOT}/.claude-logs"

echo "[$(date)] ▶️ Auto-Sync Incremental INICIADO" >> "$LOG_FILE"

while true; do
  cd "$REPO_ROOT"

  # 1. Fetch latest
  git fetch origin main 2>/dev/null || true

  # 2. Check for changes
  UNCOMMITTED=$(git status --short | grep -E '^[^?]' | wc -l)
  UNTRACKED=$(git status --short | grep -E '^\?' | wc -l)

  if [ "$UNCOMMITTED" -gt 0 ] || [ "$UNTRACKED" -gt 0 ]; then
    echo "[$(date)] 📝 Detectadas mudanças (uncommitted: $UNCOMMITTED, untracked: $UNTRACKED)" >> "$LOG_FILE"

    # 3. Stage all changes
    git add -A

    # 4. Generate incremental commit message
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    CHANGED_FILES=$(git diff --cached --name-only | head -5 | tr '\n' ',' | sed 's/,$//')

    COMMIT_MSG="🔄 Incremental sync: $CHANGED_FILES... [$TIMESTAMP]"

    # 5. Commit
    git commit -m "$COMMIT_MSG" 2>/dev/null || echo "  → nada para commitar" >> "$LOG_FILE"

    # 6. Push to main
    if git push origin HEAD:main 2>/dev/null; then
      echo "[$(date)] ✅ Sincronizado para main" >> "$LOG_FILE"
    else
      echo "[$(date)] ⚠️  Push falhou, tentando rebase" >> "$LOG_FILE"
      git fetch origin main
      git rebase origin/main
      git push origin HEAD:main || echo "[$(date)] ❌ Push falhou após rebase" >> "$LOG_FILE"
    fi
  else
    echo "[$(date)] ✓ Sem mudanças" >> "$LOG_FILE"
  fi

  # 7. Sleep and loop
  sleep $SYNC_INTERVAL
done
