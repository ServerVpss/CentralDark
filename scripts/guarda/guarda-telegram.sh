#!/usr/bin/env bash
set -uo pipefail
# Guarda — alerta Telegram (CentralDark secrets)
# Preferência: GUARDA_* → SRVER1 → TELEGRAM_*  |  resolve ${VAR}

LOG_FILE="/var/log/guarda-alertas.log"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

ENV_FILES=(
  "/root/CentralDark/secrets/telegram-alerts.env"
  "/root/CentralDark/secrets/.env"
)

get_raw() {
  local key="$1" f val=""
  for f in "${ENV_FILES[@]}"; do
    [ -f "$f" ] || continue
    val=$(grep -E "^${key}=" "$f" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
    [ -n "$val" ] && break
  done
  printf '%s' "$val"
}

get_env() {
  local key="$1" val="" i=0
  val="$(get_raw "$key")"
  while [ $i -lt 5 ]; do
    case "$val" in
      \$\{*\}) val="$(get_raw "${val:2:-1}")" ;;
      *) break ;;
    esac
    i=$((i+1))
  done
  case "$val" in \$\{*\}) val="" ;; esac
  printf '%s' "$val"
}

TOKEN="$(get_env GUARDA_TELEGRAM_BOT_TOKEN)"
[ -z "$TOKEN" ] && TOKEN="$(get_env SRVER1_BOT_TOKEN)"
[ -z "$TOKEN" ] && TOKEN="$(get_env TELEGRAM_BOT_TOKEN)"

CHAT_ID="$(get_env GUARDA_TELEGRAM_CHAT_ID)"
[ -z "$CHAT_ID" ] && CHAT_ID="$(get_env TELEGRAM_ALERTS_CHAT_ID)"
[ -z "$CHAT_ID" ] && CHAT_ID="$(get_env ADMIN_CHAT_ID)"
[ -z "$CHAT_ID" ] && CHAT_ID="$(get_env TELEGRAM_CHANNEL_ID)"

TEXT="${1:-🛡️ Guarda: alerta sem mensagem.}"
stamp() { date '+%Y-%m-%d %H:%M:%S'; }

if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then
  echo "[$(stamp)] Telegram não enviado: token/chat ausente." >> "$LOG_FILE"
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
