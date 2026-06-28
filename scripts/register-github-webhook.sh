#!/usr/bin/env bash
# Cadastra webhook GitHub → deploy.centralldark.com/webhook (evento push)
# Lê GH_TOKEN de /root/CentralDark/secrets/.env sem expor valor.
set -euo pipefail

ENV_FILE="/root/CentralDark/secrets/.env"
[ -f "$ENV_FILE" ] || { echo "ERRO: $ENV_FILE não encontrado"; exit 1; }

set -a
source <(tr -d '\r' < "$ENV_FILE")
set +a

[ -n "${GH_TOKEN:-}" ] || { echo "ERRO: GH_TOKEN ausente em $ENV_FILE"; exit 1; }

OWNER="${GITHUB_OWNER:-ServerVpss}"
REPO="${GITHUB_REPO:-CentralDark}"
WEBHOOK_URL="https://deploy.centralldark.com/webhook"

echo "[webhook] Verificando webhooks existentes em $OWNER/$REPO ..."
EXISTING=$(curl -sfS \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$OWNER/$REPO/hooks" 2>/dev/null)

COUNT=$(echo "$EXISTING" | python3 -c "import sys,json; hooks=json.load(sys.stdin); found=[h for h in hooks if h['config'].get('url','')==sys.argv[1]]; print(len(found))" "$WEBHOOK_URL" 2>/dev/null || echo "0")

if [ "$COUNT" -gt 0 ]; then
  echo "[webhook] Webhook já existe para $WEBHOOK_URL — nada a fazer."
  echo "$EXISTING" | python3 -c "
import sys,json
for h in json.load(sys.stdin):
    print(f'  id={h[\"id\"]} url={h[\"config\"].get(\"url\",\"?\")} active={h[\"active\"]}')
" 2>/dev/null
  exit 0
fi

echo "[webhook] Cadastrando novo webhook ..."
RESULT=$(curl -sfS \
  -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$OWNER/$REPO/hooks" \
  -d "{
    \"name\": \"web\",
    \"active\": true,
    \"events\": [\"push\"],
    \"config\": {
      \"url\": \"$WEBHOOK_URL\",
      \"content_type\": \"json\",
      \"insecure_ssl\": \"0\"
    }
  }" 2>/dev/null)

ID=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('id','ERRO: '+str(r.get('message','?'))))" 2>/dev/null)

if echo "$ID" | grep -q '^[0-9]'; then
  echo "[webhook] ✅ Webhook cadastrado com sucesso (id=$ID)"
  echo "[webhook] URL: $WEBHOOK_URL"
  echo "[webhook] Evento: push"
else
  echo "[webhook] ❌ Falhou: $ID"
  echo "$RESULT" | python3 -m json.tool 2>/dev/null | head -10
  exit 1
fi
