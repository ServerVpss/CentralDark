#!/bin/bash
cd apps/crm/atendimento-whatsapp-gateway-deploy/gateway
export WUZAPI_WEBHOOK_SECRET=dev_secret
export GATEWAY_SERVER_TOKEN=dummy
export WUZAPI_BASE_URL="http://127.0.0.1:8081"
export WUZAPI_ADMIN_TOKEN="dummyadmin"

node server.js > gateway_create.log 2>&1 &
PID=$!
sleep 2

echo "--- TESTE DE STATUS DA CONEXAO ---"
# Tenta ver como o gateway retorna sem wuzapi running
curl -s -X GET "http://127.0.0.1:3100/connections" -H "Authorization: Bearer dummy" | jq

sleep 1
kill $PID
