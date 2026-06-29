#!/usr/bin/env bash
# Testa o proxy Anthropic (claude.ap7.site) com a key — SEM imprimir a key.
# Uso (a key fica no TEU comando, não no script):
#   ANTHROPIC_AUTH_TOKEN='sk-lab-...' bash scripts/test-proxy-anthropic.sh
# ou apontando outra base:
#   ANTHROPIC_BASE_URL='https://claude.ap7.site' ANTHROPIC_AUTH_TOKEN='sk-lab-...' bash scripts/test-proxy-anthropic.sh
set -uo pipefail

BASE="${ANTHROPIC_BASE_URL:-https://claude.ap7.site}"
KEY="${ANTHROPIC_AUTH_TOKEN:-${ANTHROPIC_API_KEY:-}}"
BASE="${BASE%/}"

if [ -z "$KEY" ]; then
  echo "❌ Sem key. Rode:  ANTHROPIC_AUTH_TOKEN='sua-key' bash $0"
  exit 1
fi

echo "Base: $BASE   (key recebida: ${#KEY} caracteres, não será exibida)"
echo

probe() {  # $1 = rótulo do header, $2..= args de header
  local label="$1"; shift
  local body='{"model":"MODELO","max_tokens":16,"messages":[{"role":"user","content":"responda só: pong"}]}'
  for MODELO in claude-sonnet-4-6 claude-opus-4-8 claude-haiku-4-5-20251001 claude-sonnet-4-5-20250929 claude-3-5-sonnet-20241022 claude-3-haiku-20240307; do
    local payload="${body/MODELO/$MODELO}"
    local resp code
    resp=$(curl -sS -m 25 -w $'\n%{http_code}' "$BASE/v1/messages" \
      -H "content-type: application/json" -H "anthropic-version: 2023-06-01" \
      "$@" -d "$payload" 2>&1)
    code=$(printf '%s' "$resp" | tail -1)
    echo "[$label · $MODELO] HTTP $code"
    if [ "$code" = "200" ]; then
      printf '%s' "$resp" | sed '$d' | python3 -c "import sys,json; d=json.load(sys.stdin); print('   ✅ resposta:', ''.join(b.get('text','') for b in d.get('content',[]))[:60])" 2>/dev/null
      echo "   → FUNCIONA com header '$label' e modelo '$MODELO'"
      return 0
    elif [ "$code" = "401" ] || [ "$code" = "403" ]; then
      echo "   ❌ auth rejeitada (key inválida pra esse header)"
      return 2
    else
      printf '%s' "$resp" | sed '$d' | head -c 200; echo
    fi
  done
  return 3
}

echo "=== Teste 1: Authorization: Bearer (ANTHROPIC_AUTH_TOKEN) ==="
probe "Bearer" -H "Authorization: Bearer $KEY" && exit 0
echo
echo "=== Teste 2: x-api-key (padrão Anthropic SDK / ANTHROPIC_API_KEY) ==="
probe "x-api-key" -H "x-api-key: $KEY" && exit 0
echo
echo "⚠️ Nenhuma combinação retornou 200 — ver status acima."
exit 1
