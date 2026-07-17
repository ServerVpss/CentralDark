#!/usr/bin/env bash
# Smoke test OpenAI-compatible do Gateway CentralDark. Nunca imprime a key.
set -euo pipefail

BASE="${CENTRALDARK_GATEWAY_URL:-https://api.centralldark.com/v1}"
KEY="${CENTRALDARK_GATEWAY_KEY:-}"
MODEL="${CENTRALDARK_TEST_MODEL:-arsenal-router}"
BASE="${BASE%/}"

if [ -z "$KEY" ]; then
  echo "ERRO: CENTRALDARK_GATEWAY_KEY ausente" >&2
  exit 1
fi

payload="$(jq -n --arg model "$MODEL" '{
  model: $model,
  stream: false,
  max_tokens: 32,
  messages: [{role: "user", content: "responda somente: pong"}]
}')"
response="$(mktemp)"
trap 'rm -f "$response"' EXIT

status="$(curl -sS --max-time 45 -o "$response" -w '%{http_code}' +  -H "Authorization: Bearer ${KEY}" +  -H "Content-Type: application/json" +  -d "$payload" "$BASE/chat/completions")"

if [ "$status" != "200" ]; then
  echo "ERRO: Gateway CentralDark retornou HTTP $status" >&2
  exit 1
fi

jq -e '.choices[0].message.content | strings | select(length > 0)' "$response" >/dev/null
echo "OK: Gateway CentralDark respondeu pelo modelo $MODEL"
