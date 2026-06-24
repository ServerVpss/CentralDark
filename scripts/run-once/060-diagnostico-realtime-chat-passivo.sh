#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 060: Diagnóstico Passivo de Chat/Realtime e Banco
#
# Objetivo: Atestar integridade do banco (messages, ticket_messages)
# e mapear se a API Gateway e o Supabase estão registrando e 
# processando eventos de mensageria real sem alterar absolutamente NADA.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/060-diagnostico-realtime-chat"

mkdir -p "$REV"/{logs,diagnostico,raw}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 060 - DIAGNÓSTICO PASSIVO DO CHAT E BANCO"
echo "=================================================="

GW_ENV="/root/Multizap/gateway/.env"
S_URL=""
S_KEY=""

if [ -f "$GW_ENV" ]; then
    S_URL=$(grep "SUPABASE_URL=" "$GW_ENV" | cut -d '=' -f2- || true)
    S_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" "$GW_ENV" | cut -d '=' -f2- || true)
fi

echo -e "\n[1] TESTE DE COMUNICAÇÃO HTTP COM AS TABELAS ALVO (Supabase)"
if [ -n "$S_URL" ] && [ -n "$S_KEY" ]; then
    for TABLE in messages ticket_messages contacts whatsapp_connections; do
        RES=$(curl -s -w "\nHTTP:%{http_code}" -H "apikey: $S_KEY" -H "Authorization: Bearer $S_KEY" -H "Accept-Profile: api" "$S_URL/rest/v1/$TABLE?select=id,created_at&order=created_at.desc&limit=5" || echo -e "[]\nHTTP:000")
        CODE=$(echo "$RES" | grep "HTTP:" | cut -d: -f2)
        BODY=$(echo "$RES" | sed '/HTTP:/d')
        
        if [ "$CODE" = "200" ]; then
            COUNT=$(echo "$BODY" | jq '. | length' 2>/dev/null || echo "0")
            echo " ✅ Tabela '$TABLE' OK. Últimos registros encontrados: $COUNT."
            echo "$BODY" > "$REV/raw/${TABLE}_sample.json"
        else
            echo " ❌ Erro ao ler '$TABLE'. HTTP Status: $CODE."
        fi
    done
else
    echo " ⚠️ Variáveis de banco vazias ou ausentes. Impossível testar Supabase via script."
fi

echo -e "\n[2] VASCULHANDO LOGS RECENTES DO GATEWAY (PM2)"
echo "Buscando assinaturas de webhook e 'message.received' nas últimas 200 linhas..."
if pm2 logs MultiZap-Gateway --lines 200 --nostream > "$REV/raw/pm2_gateway.log" 2>/dev/null; then
    EVENTS_COUNT=$(grep -i "message_saved_to_supabase\|message.received" "$REV/raw/pm2_gateway.log" | wc -l || echo "0")
    if [ "$EVENTS_COUNT" -gt 0 ]; then
        echo " ✅ ENCONTRADOS $EVENTS_COUNT registros/eventos de mensagem no Gateway!"
        grep -i "message_saved_to_supabase\|message.received" "$REV/raw/pm2_gateway.log" | tail -n 5 | sed -E 's/"to":"[0-9]+/"to":"[MASCARADO]/g' | sed -E 's/"from":"[0-9]+/"from":"[MASCARADO]/g' > "$REV/diagnostico/latest_events.txt"
        cat "$REV/diagnostico/latest_events.txt"
    else
        echo " ⚠️ Nenhum evento de 'message.received' processado pelo Gateway nas últimas 200 linhas de log."
    fi
else
    echo " ❌ Não foi possível extrair logs do PM2 para o Gateway."
fi

echo -e "\n[3] VASCULHANDO O ARQUIVO DE BANCO DE DADOS LOCAL DO GATEWAY"
if [ -f "/root/Multizap/gateway/data/connections.json" ]; then
    echo " ✅ connections.json encontrado."
    # Exibe IDs truncados para segurança
    cat /root/Multizap/gateway/data/connections.json | grep "connection_id" | awk '{print $2}' | cut -c 2-10 | sed 's/.*/&.../' > "$REV/diagnostico/conn_ids.txt"
    echo "  Total de conexões mapeadas no JSON: $(wc -l < "$REV/diagnostico/conn_ids.txt")"
else
    echo " ⚠️ connections.json ausente."
fi

cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 060-diagnostico-realtime-chat-passivo
📍 FASE: Diagnóstico de Eventos Inbox

🧭 PROGRESSO:
Verificação em tempo real de mensagens ativas e saúde do log.

✅ PRINCIPAIS PROVAS:
- Banco de dados responde às chamadas (messages, ticket_messages, contacts)? VERIFICAR OUTPUT
- O Gateway está logando recebimento na via \`/webhooks/wuzapi\`? $( [ "${EVENTS_COUNT:-0}" -gt 0 ] && echo "SIM ($EVENTS_COUNT)" || echo "NÃO" )
- Últimos Eventos Registrados:
$(cat "$REV/diagnostico/latest_events.txt" 2>/dev/null || echo "(Vazio)")

⚠️ PROBLEMAS CRÍTICOS:
N/A (Nenhuma mutação realizada. Apenas leitura).

🎯 PRÓXIMA DECISÃO:
(Aguardando IA validar a consistência com o Frontend.)
==================================================
RESUMO
cat "$REV/reports/RESUMO_PARA_CHATGPT.txt"
