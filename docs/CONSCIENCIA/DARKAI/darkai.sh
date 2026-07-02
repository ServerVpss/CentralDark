#!/usr/bin/env bash
# darkai — CLI que chama a edge function ai-proxy no Lovable Cloud
# Uso:
#   darkai "pergunta"
#   darkai --system "papel" "pergunta"
#   darkai --model openai/gpt-5-mini "pergunta"
#   cat arquivo | darkai "resume"

set -euo pipefail

DARKAI_URL="${DARKAI_URL:-https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy}"
DARKAI_ANON_KEY="${DARKAI_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ2VqcGdobndkZnltZGR3eHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTIwNzgsImV4cCI6MjA4NTA2ODA3OH0.47hoT1t4Vr1n-MaD3Vd9JWyjPMjMSJmz5Dat3zoAYdE}"
DARKAI_MODEL="${DARKAI_MODEL:-google/gemini-3-flash-preview}"

SYSTEM=""
MODEL="$DARKAI_MODEL"
PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --system) SYSTEM="$2"; shift 2 ;;
    --model)  MODEL="$2";  shift 2 ;;
    -h|--help)
      cat <<EOF
darkai — cérebro compartilhado da VPS
  darkai "pergunta"
  darkai --system "papel" "pergunta"
  darkai --model openai/gpt-5-mini "pergunta"
  cat arquivo | darkai "resume isso"
EOF
      exit 0
      ;;
    *) PROMPT="$1"; shift ;;
  esac
done

# se veio stdin (pipe), anexa ao prompt
if [ ! -t 0 ]; then
  STDIN="$(cat)"
  if [ -n "$STDIN" ]; then
    PROMPT="${PROMPT}

---
${STDIN}"
  fi
fi

if [ -z "$PROMPT" ]; then
  echo "erro: prompt vazio. use: darkai \"sua pergunta\"" >&2
  exit 1
fi

# monta payload JSON de forma segura (jq se tiver, senão python)
if command -v jq >/dev/null 2>&1; then
  PAYLOAD=$(jq -n --arg p "$PROMPT" --arg s "$SYSTEM" --arg m "$MODEL" \
    '{prompt:$p, model:$m} + (if $s == "" then {} else {system:$s} end)')
else
  PAYLOAD=$(python3 -c "
import json, sys
d = {'prompt': sys.argv[1], 'model': sys.argv[3]}
if sys.argv[2]: d['system'] = sys.argv[2]
print(json.dumps(d))
" "$PROMPT" "$SYSTEM" "$MODEL")
fi

RESP=$(curl -sS -X POST "$DARKAI_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "apikey: $DARKAI_ANON_KEY" \
  -d "$PAYLOAD")

# extrai .text (ou mostra erro cru)
if command -v jq >/dev/null 2>&1; then
  TEXT=$(echo "$RESP" | jq -r '.text // empty')
  ERR=$(echo "$RESP" | jq -r '.error // empty')
  if [ -n "$TEXT" ]; then
    echo "$TEXT"
  else
    echo "darkai erro: ${ERR:-$RESP}" >&2
    exit 2
  fi
else
  echo "$RESP" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('text'): print(d['text'])
else:
    print('darkai erro:', d.get('error') or d, file=sys.stderr)
    sys.exit(2)
"
fi
