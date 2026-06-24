#!/bin/bash
set -o pipefail
source /root/Multizap/secrets/wabot.env 2>/dev/null
BOT="/root/Multizap/apps/clone-deck/apps/bot"
cd "$BOT" && npm install --silent 2>/dev/null && npm run build 2>&1 | tail -5
echo "dist exists: $([ -f $BOT/dist/index.html ] && echo YES || echo NO)"
echo "bot.multizap.dev: $(curl -sk -o /dev/null -w '%{http_code}' https://bot.multizap.dev 2>/dev/null)"
SUPA_URL="${SUPABASE_URL:-}"; SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
[ -n "$SUPA_URL" ] && curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" -H "Content-Type: application/json" -d "{\"action\":\"run-once.build-bot\",\"level\":\"info\",\"details\":{\"dist\":\"$([ -f $BOT/dist/index.html ] && echo true || echo false)\"}}" > /dev/null 2>&1
