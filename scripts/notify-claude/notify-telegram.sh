#!/bin/bash
# notify-telegram.sh — Disparado por hook do Claude Code para notificar Pivete no Telegram
# Uso: notify-telegram.sh "emoji" "titulo" "mensagem"
# Ex:  notify-telegram.sh "✅" "Claude concluiu" "Análise do issues-agent finalizada"

EMOJI="${1:-🤖}"
TITULO="${2:-Claude Code}"
MSG="${3:-Tarefa concluída.}"

TOKEN=""
ADMIN_ID=""

for COFRE in "/root/CentralDark/secrets/telegram-alerts.env" "/root/CentralDark/secrets/mcp.env"; do
  if [ -f "$COFRE" ]; then
    [ -z "$TOKEN" ] && TOKEN=$(grep -E '^(SRVER1_BOT_TOKEN|TELEGRAM_BOT_TOKEN)=' "$COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
    [ -z "$ADMIN_ID" ] && ADMIN_ID=$(grep -E '^(ADMIN_CHAT_ID|ADMIN_TELEGRAM_ID)=' "$COFRE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
  fi
done

if [ -z "$TOKEN" ] || [ -z "$ADMIN_ID" ]; then
  exit 0
fi

DATA=$(date '+%d/%m/%Y %H:%M')
TEXTO="${EMOJI} <b>${TITULO}</b>\n\n${MSG}\n\n🕐 ${DATA}"

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${ADMIN_ID}\",\"text\":\"${TEXTO}\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true}" \
  >/dev/null 2>&1 || true
