#!/bin/bash
# on-stop.sh — Hook Stop do Claude Code
# Dispara quando Claude Code termina de trabalhar numa sessão.
# Lê stdin (JSON do hook) para extrair o motivo/contexto.

INPUT=$(cat)

# Extrair se houve erro ou não
HAS_ERROR=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.stdout.write(d.stop_hook_active ? 'sim' : 'nao')" 2>/dev/null || echo "nao")

DIR_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$HAS_ERROR" = "sim" ]; then
  "$DIR_SCRIPT/notify-telegram.sh" "⏸️" "Claude Code — Pausado" "A sessão foi interrompida. Use /stop ou reinicie para continuar."
else
  "$DIR_SCRIPT/notify-telegram.sh" "✅" "Claude Code — Concluído" "Tarefa finalizada. Pode verificar o resultado e dar os próximos comandos."
fi
