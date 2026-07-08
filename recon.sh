#!/bin/bash
TARGET="https://unlimited-ai-proxy.sportsmoments97.workers.dev"

paths=(
  "/" "/robots.txt" "/favicon.ico" "/health" "/healthz" "/ping" "/status" "/version" "/info" "/config" "/debug" "/env" "/vars" "/keys" "/secrets"
  "/v1/models" "/v1/chat/completions" "/v1/completions" "/v1/embeddings" "/v1/images/generations" "/v1/audio/transcriptions"
  "/v1/messages" "/anthropic/v1/messages"
  "/v1beta/models" "/v1/models/gemini-pro:generateContent"
  "/cdn-cgi/" "/cdn-cgi/trace" "/__scheduled" "/__cron" "/api" "/api/" "/api/index" "/api/handler"
  "/admin" "/dashboard" "/panel" "/api/admin" "/api/keys" "/api/usage" "/api/stats" "/api/logs" "/logs" "/metrics"
  "/wrangler.toml" "/package.json" "/src/index.js" "/dist/" "/worker.js" "/.dev.vars" "/.wrangler/"
)

echo "| Path | Método | Status | Tamanho | Trecho/Headers |"
echo "| :--- | :--- | :--- | :--- | :--- |"

for p in "${paths[@]}"; do
  # GET request
  resp=$(curl -s -L -w "%{http_code}|%{size_download}" -o /tmp/resp.txt "$TARGET$p")
  code=$(echo $resp | cut -d'|' -f1)
  size=$(echo $resp | cut -d'|' -f2)
  snippet=$(head -c 100 /tmp/resp.txt | tr -d '\n\r' | sed 's/|/-/g' | sed 's/\"/\\"/g')
  
  mark=""
  if [ "$code" != "404" ] && [ "$code" != "000" ]; then mark="🎯 "; fi
  
  echo "| $mark$p | GET | $code | $size | $snippet |"
done

# Special HEAD/OPTIONS
for p in "/api/chat" "/api/models"; do
  for m in "HEAD" "OPTIONS"; do
    headers=$(curl -s -I -X $m "$TARGET$p" | grep -Ei "x-|cf-worker|x-ratelimit|x-upstream|cache-status|server|access-control" | tr '\n' ' ' | tr '\r' ' ' | sed 's/  */ /g' | sed 's/|/-/g')
    code=$(curl -s -o /dev/null -w "%{http_code}" -X $m "$TARGET$p")
    mark=""
    if [ "$code" != "404" ] && [ "$code" != "000" ]; then mark="🎯 "; fi
    echo "| $mark$p | $m | $code | - | $headers |"
  done
done
