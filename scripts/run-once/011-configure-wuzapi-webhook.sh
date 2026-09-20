#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 011 (v2): Configurar webhook WuzAPI → Gateway
#
# Correções aplicadas:
#  - Testa endpoints REAIS do WuzAPI (/api, /login, /dashboard, /admin/users)
#    em vez de "/" (que sempre retorna 404).
#  - Busca WUZAPI_ADMIN_TOKEN em múltiplos .env + docker inspect,
#    sem nunca imprimir o valor no log.
#  - Usa "Authorization: $ADMIN_TOKEN" SOMENTE em /admin/*.
#  - Usa "Token: $USER_TOKEN" em /webhook, /session/*, /chat/*, /user/*.
#  - Se não houver usuário cadastrado, apenas avisa (NÃO cria automaticamente
#    para não gerar token forte sem supervisão humana).
# ══════════════════════════════════════════════════════════════
set -uo pipefail

WUZAPI_URL="${WUZAPI_URL:-http://127.0.0.1:8081}"
GATEWAY_PORT="${GATEWAY_PORT:-3100}"
GATEWAY_PUBLIC_URL="${GATEWAY_PUBLIC_URL:-https://proxy.multizap.dev}"
LOG_PREFIX="[run-once-011]"
TS="$(date +%Y%m%d-%H%M%S)"
REVISAO_DIR="/root/Multizap/revisoes/${TS}/011-configure-wuzapi-webhook"
mkdir -p "$REVISAO_DIR"
exec > >(tee -a "$REVISAO_DIR/comandos-executados.log") 2>&1

say() { echo "${LOG_PREFIX} $*"; }
mask() { sed -E 's/(token|password|authorization|apikey|api_key|secret|ADMIN_TOKEN|USER_TOKEN)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig'; }

say "=== 1) WuzAPI: endpoints reais ==="
for ep in /api /login /dashboard /admin/users; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${WUZAPI_URL}${ep}" || echo "ERR")
  say "GET ${ep} -> HTTP ${CODE}"
done

say ""
say "=== 2) Descobrir WUZAPI_ADMIN_TOKEN (sem expor) ==="
WUZAPI_ADMIN_TOKEN=""
SRC=""

for f in \
  /root/Multizap/wuzapi/.env \
  /root/Multizap/gateway/.env \
  /root/Multizap/.env \
  /root/Multizap/apps/clone-deck/.env \
  /root/Multizap/apps/clone-deck/apps/crm/atendimento-whatsapp-gateway-deploy/wuzapi/.env \
  /root/Multizap/apps/clone-deck/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/.env \
  /root/Multizap/apps/clone-deck/apps/crm/multizap-gateway-deploy/wuzapi/.env \
  /root/Multizap/apps/clone-deck/apps/crm/multizap-gateway-deploy/gateway/.env
do
  if [ -f "$f" ]; then
    LINE=$(grep -E '^WUZAPI_ADMIN_TOKEN=' "$f" | head -n1 || true)
    if [ -n "$LINE" ]; then
      WUZAPI_ADMIN_TOKEN="${LINE#WUZAPI_ADMIN_TOKEN=}"
      WUZAPI_ADMIN_TOKEN="${WUZAPI_ADMIN_TOKEN%\"}"
      WUZAPI_ADMIN_TOKEN="${WUZAPI_ADMIN_TOKEN#\"}"
      SRC="$f"
      break
    fi
  fi
done

if [ -z "$WUZAPI_ADMIN_TOKEN" ]; then
  for CT in multizap-gateway-wuzapi-1 wuzapi-atendimento wuzapi; do
    if docker inspect "$CT" >/dev/null 2>&1; then
      VAL=$(docker inspect "$CT" --format '{{range .Config.Env}}{{println .}}{{end}}' \
        | grep -E '^WUZAPI_ADMIN_TOKEN=' | head -n1 | cut -d= -f2- || true)
      if [ -n "$VAL" ]; then
        WUZAPI_ADMIN_TOKEN="$VAL"
        SRC="docker:$CT"
        break
      fi
    fi
  done
fi

if [ -z "$WUZAPI_ADMIN_TOKEN" ]; then
  say "ERRO: WUZAPI_ADMIN_TOKEN não encontrado em .env nem em docker inspect."
  say "Locais verificados (sem mostrar valores):"
  say " - /root/Multizap/wuzapi/.env, gateway/.env, .env, apps/clone-deck/.env"
  say " - containers: multizap-gateway-wuzapi-1, wuzapi-atendimento, wuzapi"
  exit 1
fi
say "OK token admin localizado em: ${SRC} (valor mascarado)"

say ""
say "=== 3) Listar usuários (admin) ==="
USERS_JSON=$(curl -s --max-time 10 -H "Authorization: $WUZAPI_ADMIN_TOKEN" "${WUZAPI_URL}/admin/users" || echo "[]")
echo "$USERS_JSON" | python3 -m json.tool 2>/dev/null | mask || echo "$USERS_JSON" | mask

COUNT=$(echo "$USERS_JSON" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  if isinstance(d, list): print(len(d))
  elif isinstance(d, dict):
    for k in ('users','data','Users'):
      if isinstance(d.get(k), list):
        print(len(d[k])); sys.exit(0)
    print(0)
  else: print(0)
except Exception:
  print(0)
" 2>/dev/null || echo 0)

say "Total de usuários WuzAPI: ${COUNT}"

if [ "$COUNT" = "0" ]; then
  say "AVISO: nenhum usuário cadastrado. Crie manualmente com:"
  cat <<'HINT'

  curl -s -X POST \
    -H "Authorization: $WUZAPI_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{
      "name":"multizap",
      "token":"<USER_TOKEN_FORTE>",
      "webhook":"https://proxy.multizap.dev/webhook/wuzapi",
      "events":"Message,ReadReceipt,Presence,HistorySync,ChatPresence"
    }' \
    "$WUZAPI_URL/admin/users"

HINT
  say "Script encerrado SEM configurar webhook (não há usuário)."
  exit 0
fi

say ""
say "=== 4) Configurar webhook (Token de usuário) ==="
WEBHOOK_SECRET="${WUZAPI_WEBHOOK_SECRET:-}"
CALLBACK_BASE="${GATEWAY_PUBLIC_URL%/}/webhooks/wuzapi"

export WUZAPI_URL WEBHOOK_SECRET CALLBACK_BASE
echo "$USERS_JSON" | python3 <<'PY' 2>&1 | mask
import json, os, sys, urllib.request

raw = sys.stdin.read()
try: d = json.loads(raw)
except Exception: d = []

if isinstance(d, dict):
  for k in ('users','data','Users'):
    if isinstance(d.get(k), list):
      d = d[k]; break
  else:
    d = [d] if d.get('token') or d.get('Token') else []

WUZAPI_URL = os.environ['WUZAPI_URL']
SECRET = os.environ.get('WEBHOOK_SECRET','')
BASE = os.environ['CALLBACK_BASE']
EVENTS = ['Message','ReadReceipt','HistorySync','ChatPresence']

for inst in d:
  user_token = inst.get('token') or inst.get('Token')
  name = inst.get('name') or inst.get('Name') or 'unknown'
  iid  = inst.get('id') or inst.get('ID') or name
  if not user_token:
    print(f"  SKIP {name}: usuário sem token")
    continue

  qs = f"?connection_id={iid}"
  if SECRET: qs += f"&secret={SECRET}"
  url = BASE + qs

  body = json.dumps({
    'webhookURL': url,
    'Subscribe': EVENTS,
    'events': ','.join(EVENTS),
  }).encode()

  req = urllib.request.Request(
    f"{WUZAPI_URL}/webhook",
    data=body,
    headers={'Content-Type':'application/json','Token': user_token},
    method='POST',
  )
  try:
    with urllib.request.urlopen(req, timeout=10) as r:
      print(f"  OK  {name}: webhook configurado (HTTP {r.status})")
  except Exception as e:
    print(f"  ERR {name}: {e}")
PY

say ""
say "=== 5) Resumo ==="
cat > "$REVISAO_DIR/resumo.md" <<MD
# Run-Once 011 (v2) — Configurar Webhook WuzAPI
Data: $(date '+%Y-%m-%d %H:%M:%S')

## O que foi feito
- Testou endpoints reais do WuzAPI (não mais "/").
- Localizou WUZAPI_ADMIN_TOKEN em: ${SRC}
- Listou usuários: total=${COUNT}
- Configurou webhook por usuário usando header \`Token:\` (user token), não admin.

## Próximos passos
- Se total=0, criar usuário manualmente (ver hint no log).
- Validar entrega: gerar mensagem de teste e checar Gateway :${GATEWAY_PORT}.
MD

say "✅ Concluído. Relatório: $REVISAO_DIR/resumo.md"
