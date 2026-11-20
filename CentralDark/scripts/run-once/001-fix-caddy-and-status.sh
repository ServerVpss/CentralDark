#!/bin/bash
set -uo pipefail
source /root/Multizap/secrets/wabot.env 2>/dev/null
SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

# 1. Iniciar Caddy se parado
CADDY=$(systemctl is-active caddy 2>/dev/null || echo "inactive")
if [ "$CADDY" != "active" ]; then
  systemctl start caddy 2>/dev/null || caddy start --config /etc/caddy/Caddyfile 2>/dev/null
  sleep 3
  CADDY=$(systemctl is-active caddy 2>/dev/null || echo "inactive")
fi

# 2. Build bot se dist não existe
CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIST="MISSING"
if [ ! -d "${CLONE_DECK}/apps/bot/dist" ]; then
  cd "${CLONE_DECK}/apps/bot" && npm install --silent 2>/dev/null && npm run build 2>/dev/null
fi
[ -f "${CLONE_DECK}/apps/bot/dist/index.html" ] && BOT_DIST="EXISTS"

# 3. Caddyfile info
HAS_BOT=$(grep -c "bot.multizap.dev" /etc/caddy/Caddyfile 2>/dev/null || echo "0")
HAS_CRM=$(grep -c "crm.multizap.dev" /etc/caddy/Caddyfile 2>/dev/null || echo "0")
CADDYFILE_CONTENT=$(cat /etc/caddy/Caddyfile 2>/dev/null | head -60)

# 4. PM2 + Docker + Portas
PM2_JSON=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps([{'name':p['name'],'status':p['pm2_env']['status'],'restarts':p['pm2_env'].get('restart_time',0)} for p in d]))" 2>/dev/null || echo "[]")
DOCKER=$(docker ps --format "{{.Names}}:{{.Status}}" 2>/dev/null | tr '\n' ',' | sed 's/,$//')
PORTAS=$(ss -tlnp 2>/dev/null | grep -E '80|443|3000|3100|5000|8081|9003' | head -10)

# 5. HTTPS test
HTTPS_RESULTS=""
for d in multizap.dev bot.multizap.dev crm.multizap.dev hook.multizap.dev; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://${d}" 2>/dev/null)
  HTTPS_RESULTS="${HTTPS_RESULTS}${d}:${CODE},"
done

# 6. Salvar no Supabase
if [ -n "$SUPA_URL" ] && [ -n "$SUPA_KEY" ]; then
  CF_ESC=$(python3 -c "import json;print(json.dumps('''${CADDYFILE_CONTENT}'''[:500]))" 2>/dev/null || echo '""')
  PORT_ESC=$(python3 -c "import json;print(json.dumps('''${PORTAS}'''[:300]))" 2>/dev/null || echo '""')
  curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
    -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"run-once.caddy-fix\",\"level\":\"info\",\"details\":{\"caddy\":\"${CADDY}\",\"has_bot\":${HAS_BOT},\"has_crm\":${HAS_CRM},\"bot_dist\":\"${BOT_DIST}\",\"docker\":\"${DOCKER}\",\"https\":\"${HTTPS_RESULTS}\",\"caddyfile\":${CF_ESC},\"ports\":${PORT_ESC},\"pm2\":${PM2_JSON}}}" > /dev/null 2>&1
fi
