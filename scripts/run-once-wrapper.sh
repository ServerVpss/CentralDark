#!/bin/bash
# Wrapper que GARANTE execução dos run-once scripts
# Chamado pelo post-deploy como primeira ação
CLONE_DECK="${1:-/root/Multizap/apps/clone-deck}"
RUN_DIR="$CLONE_DECK/scripts/run-once"
DONE_DIR="$RUN_DIR/done"
LOG="/var/log/clone-deck-run-once.log"

[ -d "$RUN_DIR" ] || exit 0
mkdir -p "$DONE_DIR"

for script in "$RUN_DIR"/*.sh; do
  [ -f "$script" ] || continue
  BASENAME=$(basename "$script")
  [ "$BASENAME" = "run-once-executor.sh" ] && continue
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] RUN: $BASENAME" >> "$LOG"
  timeout 300 bash "$script" >> "$LOG" 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] EXIT: $?" >> "$LOG"
  mv "$script" "$DONE_DIR/${BASENAME%.sh}-$(date +%Y%m%d%H%M%S).sh" 2>/dev/null
done
