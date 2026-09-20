#!/bin/bash
set -uo pipefail
WABOT_ENV="/root/Multizap/secrets/wabot.env"
LOG="/var/log/clone-deck-sync-connections.log"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

# Carregar e EXPORTAR
[ -f "$WABOT_ENV" ] && set -a && source "$WABOT_ENV" 2>/dev/null && set +a
GW_DIR="${GATEWAY_DIR:-/root/Multizap/gateway}"
[ -f "${GW_DIR}/.env" ] && set -a && source "${GW_DIR}/.env" 2>/dev/null && set +a

export SUPABASE_URL="${SUPABASE_URL:-}"
export SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"
export WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
export WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
export WORKSPACE_ID="468167fc-8e84-4795-ab56-4e066b4f0f4f"

[ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] && { echo "[$(ts)] ERRO: Supabase vars" >> "$LOG"; exit 1; }

echo "[$(ts)] SYNC v4 START" >> "$LOG"

# Buscar sessões WuzAPI
RESP=$(curl -s --connect-timeout 10 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null)
[ -z "$RESP" ] && { echo "[$(ts)] ERRO: WuzAPI vazio" >> "$LOG"; exit 1; }

python3 -c "
import sys, json, urllib.request, datetime, os

SUPA = os.environ['SUPABASE_URL']
KEY = os.environ['SUPABASE_KEY']
WS = os.environ['WORKSPACE_ID']
now = datetime.datetime.utcnow().isoformat() + 'Z'

def supa(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(SUPA+'/rest/v1/'+path, data=data,
        headers={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'},
        method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r: return json.loads(r.read())
    except: return None

raw = json.loads(sys.argv[1])
users = raw.get('data',[]) if isinstance(raw,dict) else raw
print(f'WuzAPI: {len(users)} sessões')

for u in users:
    name = u.get('name',u.get('Name',''))
    phone = (u.get('phone','') or u.get('Jid','')).replace('@s.whatsapp.net','')
    connected = u.get('connected', u.get('Connected', False))
    status = 'connected' if connected else 'disconnected'
    
    print(f'  {name} | {status} | {phone}')
    
    body = {'workspace_id':WS,'name':name or 'WhatsApp','phone':phone,'status':status,
            'wuzapi_instance_id':name,'updated_at':now,'qr_code_base64':''}
    if connected: body['last_seen_at'] = now
    
    # Update existente
    r = supa('PATCH', f'instances?wuzapi_instance_id=eq.{name}', body)
    if not r or (isinstance(r,list) and not r):
        r = supa('PATCH', 'instances?name=eq.WhatsApp%20Principal', body)
    if not r or (isinstance(r,list) and not r):
        r = supa('POST', 'instances', body)
    print(f'    Supabase: {\"OK\" if r else \"FALHOU\"}')
    
    supa('POST','system_logs',{'action':'sync.v4.ok','level':'info','details':{'name':name,'status':status,'phone':phone,'connected':connected}})

print('DONE')
" "$RESP" 2>&1 | tee -a "$LOG"

echo "[$(ts)] SYNC v4 DONE" >> "$LOG"
