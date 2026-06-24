#!/usr/bin/env bash
set -uo pipefail

ENV_FILE="/root/Multizap/secrets/wabot.env"
LOG_FILE="/var/log/guarda-env-normalizar.log"

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

if [ ! -f "$ENV_FILE" ]; then
  log "Arquivo ausente: $ENV_FILE"
  exit 0
fi

get_value(){
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2-
}

set_value(){
  local key="$1"
  local value="$2"
  [ -z "$value" ] && return 0
  if grep -qE "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

CHAT="$(get_value GUARDA_TELEGRAM_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_value GUARDA_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_value TELEGRAM_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_value TELEGRAM_ADMIN_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_value TELEGRAM_USER_ID)"

if [ -n "$CHAT" ]; then
  set_value GUARDA_TELEGRAM_CHAT_ID "$CHAT"
  set_value GUARDA_CHAT_ID "$CHAT"
  set_value TELEGRAM_CHAT_ID "$CHAT"
  log "Chat do Guarda normalizado."
else
  log "Nenhum chat_id encontrado para o Guarda."
fi

TOKEN="$(get_value TELEGRAM_BOT_TOKEN)"
[ -z "$TOKEN" ] && TOKEN="$(get_value GUARDA_TELEGRAM_BOT_TOKEN)"

if [ -n "$TOKEN" ]; then
  set_value TELEGRAM_BOT_TOKEN "$TOKEN"
  set_value GUARDA_TELEGRAM_BOT_TOKEN "$TOKEN"
  log "Token Telegram normalizado sem imprimir valor."
else
  log "Nenhum token Telegram encontrado."
fi

chmod 600 "$ENV_FILE" 2>/dev/null || true
exit 0
