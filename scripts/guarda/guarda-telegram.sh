#!/usr/bin/env bash
set -uo pipefail

# Guarda — envio de alerta Telegram
# Usa secrets fora do repo. Nunca imprime token.

ENV_FILE="/root/Multizap/secrets/wabot.env"
LOG_FILE="/var/log/guarda-alertas.log"

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE" 2>/dev/null || true
fi

TOKEN="${GUARDA_TELEGRAM_BOT_TOKEN:-${TELEGRAM_BOT_TOKEN:-}}"
CHAT_ID="${GUARDA_TELEGRAM_CHAT_ID:-${TELEGRAM_CHAT_ID:-${TELEGRAM_ADMIN_CHAT_ID:-${TELEGRAM_USER_ID:-}}}}"
TEXT="${1:-🛡️ Guarda: alerta sem mensagem.}"

stamp() { date '+%Y-%m-%d %H:%M:%S'; }

if [ -z "$TOKEN" ]; then
  echo "[$(stamp)] Telegram não enviado: TELEGRAM_BOT_TOKEN/GUARDA_TELEGRAM_BOT_TOKEN ausente. Mensagem: $TEXT" >> "$LOG_FILE"
  exit 0
fi

if [ -z "$CHAT_ID" ]; then
  echo "[$(stamp)] Telegram não enviado: CHAT_ID ausente. Configure GUARDA_TELEGRAM_CHAT_ID em $ENV_FILE. Mensagem: $TEXT" >> "$LOG_FILE"
  exit 0
fi

curl -fsS --max-time 10 \
  -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${TEXT}" \
  -d "parse_mode=HTML" \
  -d "disable_web_page_preview=true" >/dev/null 2>&1 \
  && echo "[$(stamp)] Telegram enviado com sucesso." >> "$LOG_FILE" \
  || echo "[$(stamp)] Falha ao enviar Telegram." >> "$LOG_FILE"

exit 0
