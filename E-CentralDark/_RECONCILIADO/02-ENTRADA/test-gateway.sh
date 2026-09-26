#!/bin/bash
cd apps/crm/atendimento-whatsapp-gateway-deploy/gateway
export WUZAPI_WEBHOOK_SECRET=dev_secret
node server.js > gateway.log 2>&1 &
PID=$!
sleep 2

echo "--- TESTE A (JSON) ---"
curl -s -X POST "http://127.0.0.1:3100/webhooks/wuzapi?connection_id=TEST&secret=dev_secret" \
  -H "Content-Type: application/json" \
  -d '{"event":"message.received","from":"5511999999999@s.whatsapp.net","text":"teste json","is_from_me":false}'

echo -e "\n--- TESTE B (Form-urlencoded com jsonData) ---"
curl -s -X POST "http://127.0.0.1:3100/webhooks/wuzapi?connection_id=TEST&secret=dev_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'jsonData={"event":"message.received","from":"5511999999999@s.whatsapp.net","text":"teste form","is_from_me":false}'

echo -e "\n--- TESTE C (Form-urlencoded direto) ---"
curl -s -X POST "http://127.0.0.1:3100/webhooks/wuzapi?connection_id=TEST&secret=dev_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'event=message.received' \
  --data-urlencode 'from=5511999999999@s.whatsapp.net' \
  --data-urlencode 'text=teste direto' \
  --data-urlencode 'is_from_me=false'

sleep 2
kill $PID
echo -e "\n--- LOGS DO GATEWAY ---"
cat gateway.log
