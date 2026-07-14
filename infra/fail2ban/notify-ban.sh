#!/usr/bin/env bash
# CentralDark — fail2ban → Telegram (módulo segurança)
# Destino preferido: @Guardiaonotify_bot (GUARDA_TELEGRAM_BOT_TOKEN)
# Fallback: SRVER1_BOT_TOKEN → ADMIN (até token Guardião ser renovado)
# Uso: notify-ban.sh <ban|unban> <jail> <ip> [failures] [bantime]
set -uo pipefail

EVENT="${1:-ban}"
JAIL="${2:-unknown}"
IP="${3:-?}"
FAILURES="${4:-?}"
BANTIME="${5:-?}"
HOST="$(hostname -s 2>/dev/null || echo vps)"
TS="$(date -u +%Y-%m-%dT%H:%MZ)"
LOG="/var/log/centraldark-fail2ban-telegram.log"
ENVF="/root/CentralDark/secrets/.env"

mkdir -p "$(dirname "$LOG")" 2>/dev/null || true

get_env() {
  local key="$1" val=""
  [ -f "$ENVF" ] || return 0
  val=$(grep -E "^${key}=" "$ENVF" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  # ignora interpolação quebrada ${...}
  if [[ "$val" == \$\{* ]]; then val=""; fi
  printf '%s' "$val"
}

token_ok() {
  local t="$1"
  [ -n "$t" ] || return 1
  local code
  code=$(curl -sS -m 6 -o /tmp/f2b-tg-me.json -w "%{http_code}" "https://api.telegram.org/bot${t}/getMe" 2>/dev/null || echo 000)
  [ "$code" = "200" ]
}

GUARDA_TOKEN="$(get_env GUARDA_TELEGRAM_BOT_TOKEN)"
SRVER1_TOKEN="$(get_env SRVER1_BOT_TOKEN)"
[ -z "$SRVER1_TOKEN" ] && SRVER1_TOKEN="$(get_env TELEGRAM_BOT_TOKEN)"

CHAT="$(get_env GUARDA_TELEGRAM_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_env TELEGRAM_ALERTS_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_env ADMIN_CHAT_ID)"
[ -z "$CHAT" ] && CHAT="$(get_env TELEGRAM_CHANNEL_ID)"

TOKEN=""
VIA=""
if token_ok "$GUARDA_TOKEN"; then
  TOKEN="$GUARDA_TOKEN"
  VIA="@Guardiaonotify_bot"
elif token_ok "$SRVER1_TOKEN"; then
  TOKEN="$SRVER1_TOKEN"
  VIA="@srver1bot (fallback — renove GUARDA_TELEGRAM_BOT_TOKEN)"
else
  echo "[$TS] FAIL sem token válido event=$EVENT jail=$JAIL ip=$IP" >>"$LOG"
  exit 0
fi

if [ -z "$CHAT" ]; then
  echo "[$TS] FAIL sem chat_id event=$EVENT jail=$JAIL ip=$IP" >>"$LOG"
  exit 0
fi

if [ "$EVENT" = "unban" ]; then
  ICON="🟢"
  TITLE="FAIL2BAN UNBAN"
else
  ICON="🚨"
  TITLE="FAIL2BAN BAN — INVASOR"
fi

# whois leve (timeout curto)
GEO="$(curl -sS -m 3 "http://ip-api.com/line/${IP}?fields=status,country,city,isp,org,as,query" 2>/dev/null | tr '\n' '|' | head -c 200)"
[ -z "$GEO" ] && GEO="n/a"

TEXT=$(printf '%s\n' \
  "${ICON} ${TITLE}" \
  "" \
  "host=${HOST}" \
  "jail=${JAIL}" \
  "ip=${IP}" \
  "failures=${FAILURES}" \
  "bantime=${BANTIME}s" \
  "geo=${GEO}" \
  "via=${VIA}" \
  "ts=${TS}" \
  "" \
  "Módulo segurança CentralDark · fail2ban")

# HTML <pre> monoespaçado
ESC=$(printf '%s' "$TEXT" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
BODY=$(printf '{"chat_id":"%s","text":"<pre>%s</pre>","parse_mode":"HTML","disable_web_page_preview":true}' "$CHAT" "$ESC")

CODE=$(curl -sS -m 12 -o /tmp/f2b-tg-send.json -w "%{http_code}" \
  -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$BODY" 2>/dev/null || echo 000)

if [ "$CODE" = "200" ]; then
  echo "[$TS] OK $EVENT jail=$JAIL ip=$IP via=$VIA chat=*** code=$CODE" >>"$LOG"
  exit 0
fi

echo "[$TS] FAIL send code=$CODE event=$EVENT jail=$JAIL ip=$IP via=$VIA body=$(head -c 180 /tmp/f2b-tg-send.json 2>/dev/null)" >>"$LOG"
exit 0
