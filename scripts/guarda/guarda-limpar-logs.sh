#!/usr/bin/env bash
set -uo pipefail

# Guarda — limpeza segura de logs antigos
# Política: remover/truncar logs temporários e antigos com mais de 48 horas.
# Não remove secrets, código, banco de dados, sessões WhatsApp ou arquivos de configuração.

RETENTION_MINUTES="${GUARDA_LOG_RETENTION_MINUTES:-2880}"
LOG="/var/log/guarda-limpeza-logs.log"
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
DRY_RUN="${GUARDA_LOG_CLEAN_DRY_RUN:-0}"

mkdir -p /var/log 2>/dev/null || true

echo "[$STAMP] Iniciando limpeza Guarda: retenção ${RETENTION_MINUTES} minutos" >> "$LOG"

run_find_delete() {
  local target="$1"
  local pattern="$2"
  if [ ! -e "$target" ]; then
    return 0
  fi
  if [ "$DRY_RUN" = "1" ]; then
    find "$target" -type f -mmin +"$RETENTION_MINUTES" -name "$pattern" -print >> "$LOG" 2>/dev/null || true
  else
    find "$target" -type f -mmin +"$RETENTION_MINUTES" -name "$pattern" -print -delete >> "$LOG" 2>/dev/null || true
  fi
}

run_find_empty_dirs() {
  local target="$1"
  if [ -d "$target" ] && [ "$DRY_RUN" != "1" ]; then
    find "$target" -type d -empty -mmin +"$RETENTION_MINUTES" -print -delete >> "$LOG" 2>/dev/null || true
  fi
}

# 1) Logs comuns da VPS
run_find_delete /var/log "*.log.*"
run_find_delete /var/log "*.gz"
run_find_delete /var/log "*.old"
run_find_delete /var/log "*.1"

# 2) Logs PM2 rotacionados/antigos. Mantém arquivos .log atuais, trunca se ficarem grandes.
run_find_delete /root/.pm2/logs "*.log.*"
run_find_delete /root/.pm2/logs "*.gz"

if [ -d /root/.pm2/logs ] && [ "$DRY_RUN" != "1" ]; then
  find /root/.pm2/logs -type f -name "*.log" -size +50M -print >> "$LOG" 2>/dev/null | true
  find /root/.pm2/logs -type f -name "*.log" -size +50M -exec sh -c ': > "$1"' _ {} \; 2>/dev/null || true
fi

# 3) Revisões antigas: apaga só logs pesados dentro de revisões antigas, mantém resumo.md quando existir.
run_find_delete /root/Multizap/revisoes "*.log"
run_find_delete /root/Multizap/revisoes "*.txt"
run_find_delete /root/Multizap/revisoes "*.tmp"
run_find_empty_dirs /root/Multizap/revisoes

# 4) Logs do projeto/diagnósticos temporários
run_find_delete /root/Multizap/apps/clone-deck "*.log"
run_find_delete /root/Multizap/apps/clone-deck "npm-debug.log*"
run_find_delete /root/Multizap/apps/clone-deck ".DS_Store"

# 5) Cache npm antigo, sem remover pacote instalado em node_modules.
if [ -d /root/.npm/_logs ]; then
  run_find_delete /root/.npm/_logs "*.log"
fi

# 6) Journal systemd: compacta logs acima de 48h quando journalctl existir.
if command -v journalctl >/dev/null 2>&1 && [ "$DRY_RUN" != "1" ]; then
  journalctl --vacuum-time=48h >> "$LOG" 2>&1 || true
fi

END="$(date '+%Y-%m-%d %H:%M:%S')"
echo "[$END] Limpeza Guarda finalizada" >> "$LOG"
exit 0
