#!/bin/bash
# system-diagnostic.sh — Diagnóstico do sistema (processos, memória, portas, health)
# Padrão de watchdog de diagnóstico do sistema
# Modo: no-agent (script stdout delivered directly)
#
# PURPOSE:
#   - Contagem de processos ativos
#   - Detecção de processos zombie
#   - Relatório de uso de memória (se disponível)
#   - Lista de portas TCP escutando
#   - Log de todos os resultados
#
# CUSTOMIZAÇÃO:
#   - Adicionar verificações de serviço específico (curl health check, etc.)
#   - Ajustar limites de alerta (zombies > 0, portas inesperadas, etc.)
#   - Adicionar integridade de disco (df -h, etc.)
#
# OUTPUT:
#   - Stdout + log em logs/system-diagnostic-<timestamp>.log
#   - Código de saída 0 (sucesso) ou 1 (erro real)
#
# ⚠️  PITFALL — PATH DO WORKER:
#   O worker do cron roda em subprocess isolado com PATH diferente do terminal.
#   Ferramentas como `bash`, `ps`, `free`, `ss`/`netstat` podem não estar no PATH
#   do worker. Verificar disponibilidade com `command -v` antes de usar.
#   Se indisponível, registrar "unavailable" em vez de falhar com set -e.
#
# ⚠️  PITFALL — SANITIZAR VALORES EXTERNOS:
#   Comandos como `grep -c` podem retornar valores com quebras de linha extras
#   (ex: "0\n0" em ambientes com ANSI color). Sanitizar antes de usar em testes
#   numéricos: ZOMBIES=$(ps ... | grep -c '^Z' 2>/dev/null) || ZOMBIES=0
#   e depois if [ "$ZOMBIES" -gt 0 ] 2>/dev/null
#
# ⚠️  PITFALL — SET -E VS FALLBACK:
#   set -euo pipefail mata execução no primeiro erro não-zero.
#   Para diagnóstico com ferramentas opcionais, preferir set -u ou lidar
#   explicitamente com cada fallthrough. Usar set -e apenas nos comandos
#   que realmente não devem falhar.
#
# ⚠️  PITFALL — WRITER CONCORENTE:
#   Se outro processo/agente modificar o script enquanto está sendo editado,
#   write_file pode retornar warning: "E:\\...\\script.sh was modified since
#   you last read it on disk". Re-ler o arquivo antes de reescrever após warning.
#   Em sessões com screenpipe ativo ou múltiplos agentes, confirmar que o
#   caminho correto foi modificado antes de assumir sucesso da edição.
#
# ⚠️  PITFALL — HERITANCE FROM PARENT:
#   Variáveis de ambiente do terminal (PATH, HOME, HERMES_UI_SESSION_ID, etc.)
#   podem não estar disponíveis no subprocess do worker. Usar valores absolutos
#   ou detectar ambiente antes de depender de variáveis externas.

set -u

LOG_TAG="SYSTEM_DIAGNOSTIC"
TIMESTAMP=$(date +%Y%m%dT%H%M%S)
LOG_DIR="/e/CentralDark/Pivete/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/system-diagnostic-${TIMESTAMP}.log"

log() {
    echo "[${LOG_TAG}] $*" | tee -a "$LOG_FILE"
}

log "INICIANDO system-diagnostic (timestamp: ${TIMESTAMP})"
log "WORKDIR: $(pwd 2>/dev/null || echo 'unknown')"

# 1. Contagem de processos
TOTAL_PROCS=$(ps aux 2>/dev/null | wc -l || tasklist 2>/dev/null | wc -l || echo "unknown")
log "Total de processos: ${TOTAL_PROCS}"

# 2. Zombie processes
ZOMBIES=0
if command -v ps > /dev/null 2>&1; then
    ZOMBIES=$(ps -eo stat 2>/dev/null | grep -c '^Z' 2>/dev/null || echo "0")
elif command -v tasklist > /dev/null 2>&1; then
    ZOMBIES=$(tasklist 2>/dev/null | grep -i "zombie" | wc -l || echo "0")
fi
log "Zombies detectados: ${ZOMBIES}"

if [ "$ZOMBIES" -gt 0 ] 2>/dev/null; then
    log "ALERTA: existem processos zombie — requer atenção manual"
fi

# 3. Memória (se disponível)
if command -v free > /dev/null 2>&1; then
    MEM_INFO=$(free -h 2>/dev/null | head -2 || echo "unavailable")
    log "Memória: ${MEM_INFO}"
else
    log "Ferramentas de memória não disponíveis neste sistema"
fi

# 4. Portas escutando
log "Portas escutando:"
if command -v ss > /dev/null 2>&1; then
    ss -tlnp 2>/dev/null | tail -n +2 | awk '{print $1, $5}' | sort -u | head -30 | tee -a "$LOG_FILE"
elif command -v netstat > /dev/null 2>&1; then
    netstat -ano 2>/dev/null | grep LISTEN | awk '{print $1, $4}' | sort -u | head -30 | tee -a "$LOG_FILE"
else
    log "Ferramentas de rede não disponíveis"
fi

# 5. Health check de serviços (customizável)
#    Ex: verificar se portas conhecidas respondem
# log "Health checks:"
# if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:8788/ 2>/dev/null | grep -q "200"; then
#     log "Hermes WebUI (8788): ONLINE"
# else
#     log "Hermes WebUI (8788): OFFLINE ou não respondendo"
# fi

log "CONCLUÍDO — system-diagnostic executado com sucesso"
log ""
