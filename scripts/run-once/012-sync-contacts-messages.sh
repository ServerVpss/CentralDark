#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 012: Sincronizar contatos e mensagens do WhatsApp
#
# Objetivo: Puxar contatos e mensagens recentes do WuzAPI
#           e salvar no Supabase via Gateway.
#
# Requer:
#   - Gateway rodando na porta 3100
#   - Webhook configurado (run-once 011)
#   - Conexão WhatsApp ativa
#
# Segurança:
#   - Não expõe tokens em logs
# ══════════════════════════════════════════════════════════════
set -uo pipefail

GATEWAY_URL="http://127.0.0.1:3100"
LOG_PREFIX="[run-once-012]"
REVISAO_DIR="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/012-sync-contacts-messages"

say() { echo "${LOG_PREFIX} $*"; }

mkdir -p "$REVISAO_DIR"
exec > >(tee -a "$REVISAO_DIR/comandos-executados.log") 2>&1

say "=== Iniciando sincronização de contatos e mensagens ==="
say "Gateway: ${GATEWAY_URL}"
say ""

# 1. Verificar Gateway
say "=== Teste Gateway ==="
curl -fsS "${GATEWAY_URL}/health" 2>&1 || {
  say "ERRO: Gateway offline"
  exit 1
}
echo ""

# 2. Listar conexões e pegar a primeira conectada
say "=== Listando conexões ==="
CONNECTIONS=$(curl -s "${GATEWAY_URL}/connections")
echo "${CONNECTIONS}" | python3 -m json.tool 2>/dev/null || echo "${CONNECTIONS}"

# Pega o connection_id da primeira conexão conectada
CONN_ID=$(echo "${CONNECTIONS}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
connections = data.get('data', data.get('connections', [])) if isinstance(data, dict) else data
for c in connections:
    if c.get('status') == 'connected':
        print(c.get('connection_id', ''))
        break
" 2>/dev/null)

if [ -z "$CONN_ID" ]; then
  say "AVISO: Nenhuma conexão conectada encontrada"
  echo "Nenhuma conexão ativa" > "$REVISAO_DIR/resumo.md"
  exit 0
fi

say "Conexão ativa encontrada: ${CONN_ID}"
echo ""

# 3. Sincronizar contatos
say "=== Sincronizando contatos ==="
CONTACTS_RESULT=$(curl -s "${GATEWAY_URL}/sync/contacts/${CONN_ID}")
echo "${CONTACTS_RESULT}" | python3 -m json.tool 2>/dev/null || echo "${CONTACTS_RESULT}"
echo ""

# 4. Sincronizar mensagens recentes
say "=== Sincronizando mensagens recentes ==="
MESSAGES_RESULT=$(curl -s "${GATEWAY_URL}/sync/messages/${CONN_ID}")
echo "${MESSAGES_RESULT}" | python3 -m json.tool 2>/dev/null || echo "${MESSAGES_RESULT}"
echo ""

# 5. Sincronização completa
say "=== Sincronização completa ==="
FULL_RESULT=$(curl -s -X POST "${GATEWAY_URL}/sync/full/${CONN_ID}")
echo "${FULL_RESULT}" | python3 -m json.tool 2>/dev/null || echo "${FULL_RESULT}"
echo ""

# 6. Verificar dados no Supabase
say "=== Verificando dados no Supabase ==="
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY:-}"

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
  CONTACT_COUNT=$(curl -s \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept-Profile: public" \
    "${SUPABASE_URL}/rest/v1/contacts?select=count" 2>/dev/null)
  say "Contatos no Supabase: ${CONTACT_COUNT:-erro}"
  
  MSG_COUNT=$(curl -s \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept-Profile: public" \
    "${SUPABASE_URL}/rest/v1/messages?select=count" 2>/dev/null)
  say "Mensagens no Supabase: ${MSG_COUNT:-erro}"
else
  say "Supabase não configurado nesta sessão"
fi

echo ""

# 7. Salvar resumo
say "=== Gerando resumo ===" > "$REVISAO_DIR/resumo.md"
echo "# Run-Once 012: Sincronizar Contatos e Mensagens" >> "$REVISAO_DIR/resumo.md"
echo "Data: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REVISAO_DIR/resumo.md"
echo "" >> "$REVISAO_DIR/resumo.md"
echo "## Resultado" >> "$REVISAO_DIR/resumo.md"
echo "- Conexão: ${CONN_ID}" >> "$REVISAO_DIR/resumo.md"
echo "- Contatos sync: $(echo ${CONTACTS_RESULT} | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get(\"data\",{}).get(\"synced\",\"?\"))' 2>/dev/null || echo 'ver log')" >> "$REVISAO_DIR/resumo.md"
echo "- Mensagens sync: $(echo ${MESSAGES_RESULT} | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get(\"data\",{}).get(\"synced\",\"?\"))' 2>/dev/null || echo 'ver log')" >> "$REVISAO_DIR/resumo.md"
echo "" >> "$REVISAO_DIR/resumo.md"
echo "## Próximo passo" >> "$REVISAO_DIR/resumo.md"
echo "- Verificar mensagens chegando em tempo real via webhook" >> "$REVISAO_DIR/resumo.md"
echo "- Configurar chat UI para exibir mensagens reais" >> "$REVISAO_DIR/resumo.md"

say "✅ Run-Once 012 concluído"
say "Revisão salva em: $REVISAO_DIR"