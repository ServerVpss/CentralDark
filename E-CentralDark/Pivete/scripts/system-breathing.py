#!/usr/bin/env bash
# System Breathing - Memory Flush & Zombie Reaper
# Executa a cada 360min (6h)
# Modo: no-agent (script stdout delivered directly)

set -euo pipefail

echo "[SYSTEM-BREATHING] INICIANDO ($(date +%Y%m%dT%H%M%S))"

HERMES_HOME="${HERMES_HOME:-E:/CentralDark/Pivete}"
LOG_FILE="${HERMES_HOME}/scripts/system-breathing.log"

log() {
    echo "[SYSTEM-BREATHING] $1"
    echo "[$(date +%Y%m%dT%H%M%S)] $1" >> "$LOG_FILE"
}

# 1. Verificar memória disponível
log "Verificando memória do sistema..."
if command -v free > /dev/null 2>&1; then
    free -h 2>/dev/null | head -5 | while read line; do log "  $line"; done
elif command -v tasklist > /dev/null 2>&1; then
    TOTAL=$(tasklist /FO TABLE 2>/dev/null | grep -i "memória" | head -1 || echo "N/A")
    log "  tasklist disponível: $TOTAL"
else
    log "  Sistema Windows detectado — memória via WMIC"
    wmic OS get FreePhysicalMemory,TotalVisibleMemorySize 2>/dev/null | while read line; do log "  $line"; done || log "  WMIC não disponível"
fi

# 2. Listar processos com mais memória
log "Top processos por memória (Windows):"
if command -v tasklist > /dev/null 2>&1; then
    tasklist /FO CSV /NH /SORT:CO 2>/dev/null | head -6 | while IFS=, read name pid session mem rest; do
        log "  $name | PID: $pid | Mem: $mem"
    done || log "  tasklist sem memória"
fi

# 3. Zombie processes (Windows equivalente)
log "Verificando processos órfãos/zumbis..."
if command -v tasklist > /dev/null 2>&1; then
    ZOMBIES=$(tasklist /FI "STATUS eq Not Responding" /FO CSV /NH 2>/dev/null | wc -l || echo "0")
    log "  Processos 'Not Responding': $ZOMBIES"
fi

# 4. Verificar crons Hermes
log "Verificando status dos crons Hermes..."
cd "$HERMES_HOME"
if command -v hermes > /dev/null 2>&1; then
    CRON_OUTPUT=$(hermes cron list 2>&1 || echo "ERRO")
    log "  Crons Hermes: OK (listável)"
    # Contar falhas
    FAILED=$(echo "$CRON_OUTPUT" | grep -c "error:" || echo "0")
    log "  Crons com erro: $FAILED"
else
    log "  Hermes CLI não encontrado no PATH"
fi

# 5. Flush de logs antigos (se houver)
LOG_DIR="${HERMES_HOME}/logs"
if [ -d "$LOG_DIR" ]; then
    LOG_COUNT=$(ls -1 "$LOG_DIR" 2>/dev/null | wc -l || echo "0")
    log "  Logs em ${LOG_DIR}: $LOG_COUNT arquivos"
fi

log "[SYSTEM-BREATHING] CONCLUÍDO — $(date +%Y%m%dT%H%M%S)"
exit 0
