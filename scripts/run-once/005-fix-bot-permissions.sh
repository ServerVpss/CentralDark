#!/bin/bash
BOT_DIST="/root/Multizap/apps/clone-deck/apps/bot/dist"
if [ -d "$BOT_DIST" ]; then
  chmod -R 755 "$BOT_DIST"
  echo "Permissões corrigidas: $BOT_DIST"
  ls -la "$BOT_DIST/" | head -5
fi
# Rebuild se necessário
BOT="/root/Multizap/apps/clone-deck/apps/bot"
if [ ! -f "$BOT_DIST/index.html" ]; then
  cd "$BOT" && npm install --silent 2>/dev/null && npm run build 2>&1 | tail -3
  chmod -R 755 "$BOT_DIST" 2>/dev/null
fi
# Testar
CODE=$(curl -sk -o /dev/null -w "%{http_code}" https://bot.multizap.dev 2>/dev/null)
echo "bot.multizap.dev: $CODE"
source /root/Multizap/secrets/wabot.env 2>/dev/null
[ -n "$SUPABASE_URL" ] && curl -s -X POST "${SUPABASE_URL}/rest/v1/system_logs" -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" -H "Content-Type: application/json" -d "{\"action\":\"run-once.fix-permissions\",\"level\":\"info\",\"details\":{\"bot_https\":\"${CODE}\"}}" > /dev/null 2>&1
