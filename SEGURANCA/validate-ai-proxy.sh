#!/usr/bin/env bash
# =============================================================
# validate-ai-proxy.sh — Valida a cadeia VPS → ai-proxy → Gateway
# Uso: bash validate-ai-proxy.sh
# Requer: source /root/keys.env (ou variáveis exportadas)
# =============================================================

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
fail() { echo -e "${RED}❌ $*${NC}"; EXIT_CODE=1; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }

EXIT_CODE=0

echo "══════════════════════════════════════════"
echo " Validação ai-proxy — $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════"

# 1. Verificar variáveis locais (sem imprimir valores)
echo ""
echo "── 1. Variáveis de ambiente ──"

if [ -z "${WEBUI_LOVABLE_KEY:-}" ]; then
  fail "WEBUI_LOVABLE_KEY não definida. Execute: source /root/keys.env"
else
  KEY_LEN=${#WEBUI_LOVABLE_KEY}
  if [ "$KEY_LEN" -lt 32 ]; then
    warn "WEBUI_LOVABLE_KEY parece curta ($KEY_LEN chars). Recomendado: openssl rand -hex 32"
  else
    ok "WEBUI_LOVABLE_KEY presente (${KEY_LEN} chars) — valor não exibido"
  fi
fi

if [ -z "${DARKAI_URL:-}" ]; then
  warn "DARKAI_URL não definida — usando default"
  DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
fi
ok "DARKAI_URL = $DARKAI_URL"

# 2. Verificar que LOVABLE_API_KEY NÃO está na VPS
echo ""
echo "── 2. Checagem de segurança local ──"
if [ -n "${LOVABLE_API_KEY:-}" ]; then
  fail "LOVABLE_API_KEY está definida na VPS — REMOVA IMEDIATAMENTE (unset LOVABLE_API_KEY)"
else
  ok "LOVABLE_API_KEY não encontrada na VPS (correto)"
fi

if [ -f /root/keys.env ] && grep -q "LOVABLE_API_KEY" /root/keys.env 2>/dev/null; then
  fail "/root/keys.env contém LOVABLE_API_KEY — remova essa linha"
else
  ok "keys.env não contém LOVABLE_API_KEY"
fi

# 3. Testar acesso sem autenticação (deve rejeitar)
echo ""
echo "── 3. Teste de rejeição sem auth ──"
HTTP_NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" \
  "$DARKAI_URL/v1/models" 2>/dev/null || echo "000")

if [ "$HTTP_NO_AUTH" = "401" ]; then
  ok "Requisição sem Bearer rejeitada com 401"
elif [ "$HTTP_NO_AUTH" = "000" ]; then
  fail "Sem conectividade com $DARKAI_URL"
else
  warn "Resposta inesperada sem auth: HTTP $HTTP_NO_AUTH"
fi

# 4. Testar acesso com chave errada (deve rejeitar)
echo ""
echo "── 4. Teste de rejeição com chave inválida ──"
HTTP_BAD_KEY=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer chave_invalida_teste_12345" \
  "$DARKAI_URL/v1/models" 2>/dev/null || echo "000")

if [ "$HTTP_BAD_KEY" = "401" ]; then
  ok "Bearer inválido rejeitado com 401"
else
  warn "Resposta com bearer inválido: HTTP $HTTP_BAD_KEY"
fi

# 5. Testar acesso com WEBUI_LOVABLE_KEY (deve funcionar)
echo ""
echo "── 5. Teste de autenticação válida ──"
if [ -n "${WEBUI_LOVABLE_KEY:-}" ]; then
  MODELS_RESP=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $WEBUI_LOVABLE_KEY" \
    "$DARKAI_URL/v1/models" 2>/dev/null || echo "{}\n000")

  HTTP_MODELS=$(echo "$MODELS_RESP" | tail -1)
  BODY_MODELS=$(echo "$MODELS_RESP" | head -1)

  if [ "$HTTP_MODELS" = "200" ]; then
    MODEL_COUNT=$(echo "$BODY_MODELS" | grep -o '"id"' | wc -l || echo 0)
    ok "/v1/models retornou 200 ($MODEL_COUNT modelos)"
  else
    fail "/v1/models retornou HTTP $HTTP_MODELS com WEBUI_LOVABLE_KEY válida"
    echo "   Resposta: $(echo "$BODY_MODELS" | head -c 200)"
  fi
fi

# 6. Teste de chat mínimo
echo ""
echo "── 6. Teste de chat (modelo flash) ──"
if [ -n "${WEBUI_LOVABLE_KEY:-}" ]; then
  CHAT_RESP=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $WEBUI_LOVABLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"google/gemini-3-flash-preview","messages":[{"role":"user","content":"responda apenas: ok"}],"max_tokens":10}' \
    "$DARKAI_URL/v1/chat/completions" 2>/dev/null || echo "{}\n000")

  HTTP_CHAT=$(echo "$CHAT_RESP" | tail -1)
  BODY_CHAT=$(echo "$CHAT_RESP" | head -1)

  if [ "$HTTP_CHAT" = "200" ]; then
    ANSWER=$(echo "$BODY_CHAT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('choices',[{}])[0].get('message',{}).get('content','?'))" 2>/dev/null || echo "?")
    ok "Chat respondeu: \"$ANSWER\""
  elif [ "$HTTP_CHAT" = "402" ]; then
    warn "Gateway retornou 402 — sem créditos Lovable"
  elif [ "$HTTP_CHAT" = "429" ]; then
    warn "Gateway retornou 429 — rate limit"
  else
    fail "Chat retornou HTTP $HTTP_CHAT"
    echo "   Resposta: $(echo "$BODY_CHAT" | head -c 300)"
  fi
fi

# Resultado final
echo ""
echo "══════════════════════════════════════════"
if [ "$EXIT_CODE" -eq 0 ]; then
  ok "Todas as validações passaram."
else
  fail "Uma ou mais validações falharam. Revise acima."
fi
echo "══════════════════════════════════════════"
exit $EXIT_CODE
