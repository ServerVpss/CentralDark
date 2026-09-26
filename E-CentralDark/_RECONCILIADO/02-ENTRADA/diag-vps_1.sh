#!/bin/bash
set -uo pipefail
[ -f "/root/Multizap/secrets/wabot.env" ] && set -a && source "/root/Multizap/secrets/wabot.env" 2>/dev/null && set +a
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a

SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"

WH_FILE="${GW_DIR}/src/services/webhookService.js"
GW_PATCH_LINES=""
if [ -f "$WH_FILE" ]; then
  GW_PATCH_LINES=$(grep -c "CLONE_DECK_FORWARD" "$WH_FILE" 2>/dev/null || echo "0")
fi

PORT_5000=$(ss -tlnp 2>/dev/null | grep ':5000' | head -c 100 || echo "")
TEST_5000=$(curl -s --connect-timeout 3 http://127.0.0.1:5000/health 2>/dev/null || echo "FAIL")

# Ler a linha do patch no Gateway
PATCH_CONTENT=""
if [ -f "$WH_FILE" ]; then
  PATCH_CONTENT=$(grep "CLONE_DECK" "$WH_FILE" 2>/dev/null | head -5)
fi

# Ler o trecho ao redor do forward
FORWARD_CONTEXT=""
if [ -f "$WH_FILE" ]; then
  FORWARD_CONTEXT=$(grep -A2 -B2 "127.0.0.1:5000" "$WH_FILE" 2>/dev/null | head -10)
fi

GIT_SHA=$(cd /root/Multizap/apps/clone-deck && git rev-parse --short HEAD 2>/dev/null || echo "?")

PM2_JSON=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    r=[{'name':p['name'],'status':p['pm2_env']['status'],'restarts':p['pm2_env'].get('restart_time',0)} for p in d]
    print(json.dumps(r))
except: print('[]')
" 2>/dev/null || echo "[]")

if [ -n "$SUPA_URL" ] && [ -n "$SUPA_KEY" ]; then
  PATCH_ESC=$(python3 -c "import json,sys;print(json.dumps(sys.argv[1]))" "$PATCH_CONTENT" 2>/dev/null || echo '""')
  FWD_ESC=$(python3 -c "import json,sys;print(json.dumps(sys.argv[1]))" "$FORWARD_CONTEXT" 2>/dev/null || echo '""')
  TEST_ESC=$(python3 -c "import json,sys;print(json.dumps(sys.argv[1]))" "$TEST_5000" 2>/dev/null || echo '""')

  curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
    -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"diag.vps.v5\",\"level\":\"info\",\"details\":{\"git_sha\":\"${GIT_SHA}\",\"gw_patch_lines\":${GW_PATCH_LINES},\"patch_content\":${PATCH_ESC},\"forward_context\":${FWD_ESC},\"port_5000\":$([ -n \"$PORT_5000\" ] && echo true || echo false),\"test_5000\":${TEST_ESC},\"pm2\":${PM2_JSON}}}" > /dev/null 2>&1
fi
