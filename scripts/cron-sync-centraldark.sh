#!/usr/bin/env bash
# ============================================================================
#  cron-sync-centraldark.sh — wrapper pro cron
#  Uso no crontab:
#    */2 * * * * /root/Multizap/apps/clone-deck/scripts/cron-sync-centraldark.sh
# ============================================================================

set -euo pipefail

LOCK_FILE="/tmp/centraldark-sync.lock"
LOG_FILE="/var/log/centraldark-sync.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYNC_SCRIPT="$SCRIPT_DIR/sync-para-centraldark-monorepo.sh"

# Garante log gravável
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/centraldark-sync.log"

# flock previne execução paralela
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date '+%F %T')] já tem outro sync rodando — saindo" >> "$LOG_FILE"
  exit 0
fi

{
  echo "============================================================"
  echo "[$(date '+%F %T')] iniciando sync"
  bash "$SYNC_SCRIPT" 2>&1 || echo "[$(date '+%F %T')] FALHOU com código $?"
  echo "[$(date '+%F %T')] fim"
} >> "$LOG_FILE"
