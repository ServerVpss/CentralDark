#!/bin/bash
# on-notification.sh — Hook Notification do Claude Code
# Dispara quando Claude precisa de atenção do usuário (esperando input, etc.)
# Stdin: JSON com { "message": "..." }

INPUT=$(cat)
MSG=$(echo "$INPUT" | node -e "
  try {
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    process.stdout.write(d.message || 'Claude Code precisa da sua atenção.');
  } catch { process.stdout.write('Claude Code precisa da sua atenção.'); }
" 2>/dev/null || echo "Claude Code precisa da sua atenção.")

DIR_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR_SCRIPT/notify-telegram.sh" "🔔" "Claude Code — Aguardando você" "$MSG"
