#!/bin/bash
set -uo pipefail
[ -f "/root/Multizap/secrets/wabot.env" ] && set -a && source "/root/Multizap/secrets/wabot.env" 2>/dev/null && set +a
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a

SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"
WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"

PHONE=""
USERS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null)
SESSION_TOKEN=$(echo "$USERS" | python3 -c "import sys,json;d=json.load(sys.stdin);u=d.get('data',d) if isinstance(d,dict) else d;print(u[0].get('token',u[0].get('Token','')) if u else '')" 2>/dev/null)
SESSION_NAME=$(echo "$USERS" | python3 -c "import sys,json;d=json.load(sys.stdin);u=d.get('data',d) if isinstance(d,dict) else d;print(u[0].get('name',u[0].get('Name','')) if u else '')" 2>/dev/null)

if [ -n "$SESSION_TOKEN" ]; then
  STATUS=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/session/status" -H "Token: ${SESSION_TOKEN}" 2>/dev/null)
  PHONE=$(echo "$STATUS" | python3 -c "import sys,json;d=json.load(sys.stdin);j=d.get('Jid','') or d.get('jid','');print(j.split('@')[0].split(':')[0] if j else '')" 2>/dev/null)
fi

GIT_SHA=$(cd /root/Multizap/apps/clone-deck && git rev-parse --short HEAD 2>/dev/null || echo "?")
PM2_JSON=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps([{'name':p['name'],'status':p['pm2_env']['status'],'restarts':p['pm2_env'].get('restart_time',0)} for p in d]))" 2>/dev/null || echo "[]")
PORT5=$(ss -tlnp 2>/dev/null | grep -c ':5000')

if [ -n "$SUPA_URL" ] && [ -n "$SUPA_KEY" ]; then
  curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" -H "Content-Type: application/json" \
    -d "{\"action\":\"diag.vps.v6\",\"level\":\"info\",\"details\":{\"git_sha\":\"${GIT_SHA}\",\"phone\":\"${PHONE:-?}\",\"session\":\"${SESSION_NAME:-?}\",\"port_5000\":${PORT5:-0},\"pm2\":${PM2_JSON}}}" > /dev/null 2>&1

  if [ -n "$PHONE" ]; then
    curl -s -X PATCH "${SUPA_URL}/rest/v1/instances?select=id&limit=1" -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" -H "Content-Type: application/json" \
      -d "{\"phone\":\"${PHONE}\",\"name\":\"WhatsApp ${PHONE}\"}" > /dev/null 2>&1
  fi
fi
