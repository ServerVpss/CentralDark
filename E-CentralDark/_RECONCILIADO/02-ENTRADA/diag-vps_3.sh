#!/bin/bash
set -uo pipefail
[ -f "/root/Multizap/secrets/wabot.env" ] && set -a && source "/root/Multizap/secrets/wabot.env" 2>/dev/null && set +a
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a

SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"

# Verificar se patch existe no Gateway
GW_PATCHED="false"
WH_FILE="${GW_DIR}/src/services/webhookService.js"
[ -f "$WH_FILE" ] && grep -q "CLONE_DECK_FORWARD" "$WH_FILE" 2>/dev/null && GW_PATCHED="true"

# Verificar se porta 5000 está escutando
PORT_5000=$(ss -tlnp 2>/dev/null | grep ':5000' | head -1 || echo "")
PORT_5000_UP="false"
[ -n "$PORT_5000" ] && PORT_5000_UP="true"

# Teste direto porta 5000
TEST_5000=$(curl -s --connect-timeout 3 http://127.0.0.1:5000/health 2>/dev/null || echo "FAIL")

# Git
GIT_SHA=$(cd /root/Multizap/apps/clone-deck && git rev-parse --short HEAD 2>/dev/null || echo "?")

# PM2
PM2_JSON=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    r=[{'name':p['name'],'status':p['pm2_env']['status'],'restarts':p['pm2_env'].get('restart_time',0)} for p in d]
    print(json.dumps(r))
except: print('[]')
" 2>/dev/null || echo "[]")

# Salvar
if [ -n "$SUPA_URL" ] && [ -n "$SUPA_KEY" ]; then
  TEST_ESC=$(python3 -c "import json;print(json.dumps('$TEST_5000'))" 2>/dev/null || echo '""')
  curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
    -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"diag.vps.v4\",\"level\":\"info\",\"details\":{\"git_sha\":\"${GIT_SHA}\",\"gw_patched\":${GW_PATCHED},\"port_5000_up\":${PORT_5000_UP},\"test_5000\":${TEST_ESC},\"pm2\":${PM2_JSON}}}" > /dev/null 2>&1
fi
