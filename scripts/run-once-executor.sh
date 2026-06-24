#!/bin/bash
# Executa todos os scripts em scripts/run-once/*.sh (exceto README e done/)
# Cada script roda 1x e é movido para done/
set -uo pipefail

CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
RUN_DIR="$CLONE_DECK/scripts/run-once"
DONE_DIR="$RUN_DIR/done"
LOG="/var/log/clone-deck-run-once.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

[ -d "$RUN_DIR" ] || exit 0
mkdir -p "$DONE_DIR"

# Encontrar scripts pendentes
for script in "$RUN_DIR"/*.sh; do
  [ -f "$script" ] || continue
  BASENAME=$(basename "$script")
  
  # Pular o próprio executor
  [ "$BASENAME" = "run-once-executor.sh" ] && continue
  
  echo "[$(ts)] === RUN-ONCE: $BASENAME ===" >> "$LOG"
  
  # Executar com timeout de 5 minutos
  timeout 300 bash "$script" >> "$LOG" 2>&1
  EXIT_CODE=$?
  
  echo "[$(ts)] EXIT: $EXIT_CODE" >> "$LOG"
  echo "[$(ts)] === END: $BASENAME ===" >> "$LOG"
  echo "" >> "$LOG"
  
  # Mover para done/
  mv "$script" "$DONE_DIR/${BASENAME%.sh}-$(date +%Y%m%d%H%M%S).sh" 2>/dev/null
done
