#!/bin/bash
# system-breathing.sh — Memory Flush & Zombie Reaper (minimalista)
# Executa a cada 360 min (6h)
# Modo: no-agent (script stdout delivered directly)
#
# PURPOSE:
#   Relatório simples de salud do sistema

LOG_TAG="SYSTEM_BREATHING"
TS=$(date +%Y%m%dT%H%M%S)
LOG_DIR="/e/CentralDark/Pivete/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/system-breathing-${TS}.log"

log() { echo "[${LOG_TAG}] $*" | tee -a "$LOG_FILE"; }

log "INICIANDO (timestamp: ${TS})"
log "WORKDIR: $(pwd)"

# Processos: usar tasklist (Windows nativo, mais estável que ps no MSYS)
TOTAL=$(tasklist 2>/dev/null | grep -c "." || echo "0")
log "Total de processos: ${TOTAL}"

# Zombies: tasklist não tem conceito de zombie no Windows — reportar 0
log "Zombies detectados: 0 (Windows não usa zombie como Unix)"

# Memória: free não disponível nativamente no Windows
log "Ferramentas de memória: não disponíveis (não é Linux)"

# Portas: netstat nativo Windows, timeout 5s
log "Portas escutando:"
PORTS=$(timeout 5 netstat -ano 2>/dev/null | grep "LISTENING" | awk '{print $2}' | sort -u | head -30 || echo "")
if [ -n "$PORTS" ]; then
    echo "$PORTS" | tee -a "$LOG_FILE"
    log "Total de portas: $(echo "$PORTS" | grep -c "." || echo 0)"
else
    log "Nenhuma porta escutando detectada"
fi

log "CONCLUÍDO — sistema-breathing executado com sucesso"
log ""
