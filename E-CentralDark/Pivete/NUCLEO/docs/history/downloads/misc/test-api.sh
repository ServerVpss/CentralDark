#!/bin/bash
API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2)

curl -X POST https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":50,"messages":[{"role":"user","content":"Diga apenas: API OK"}]}'
