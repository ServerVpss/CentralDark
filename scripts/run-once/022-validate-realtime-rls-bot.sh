#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 022: Validação de Deploy e Segurança RLS (Bot/Chat)
# Objetivo: Validar se o hook useRealtimeMessages está rodando 
# e se a tabela 'messages' do Supabase vaza dados sem RLS.
# ══════════════════════════════════════════════════════════════
set -uo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REV="/root/Multizap/revisoes/${TIMESTAMP}/022-validate-realtime-rls"
mkdir -p "$REV"/{logs,diagnostico}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "══════════════════════════════════════════════════"
echo " RUN-ONCE 022: Validação Realtime e RLS (Bot)"
echo " Data: $(date)"
echo " Revisão: $REV"
echo " ⚠️ APENAS LEITURA — NENHUMA ALTERAÇÃO DE DADOS"
echo "══════════════════════════════════════════════════"

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"

echo ""
echo "[1] VERIFICANDO DEPLOY NA VPS..."
if [ -d "$CLONE_DECK" ]; then
    cd "$CLONE_DECK" || exit 1
    echo "- Último commit local na VPS:"
    git log -1 --oneline || echo "Erro ao ler git log"
    
    echo "- Sincronização do Hook:"
    if [ -f "$BOT_DIR/src/hooks/useRealtimeMessages.ts" ]; then
        echo "  ✅ Hook useRealtimeMessages.ts ENCONTRADO."
    else
        echo "  ❌ Hook NÃO ENCONTRADO. (Webhook não rodou ou pull falhou)"
    fi
else
    echo "❌ Diretório $CLONE_DECK não encontrado."
fi

echo ""
echo "[2] VERIFICANDO PM2 E URLs..."
pm2 list --no-color | grep -E "online|errored|stopped" || echo "Sem output do PM2"

for u in https://bot.multizap.dev https://proxy.multizap.dev/health https://hook.multizap.dev/health; do
  HTTP_STATUS=$(curl -sk -o /dev/null -w '%{http_code}' --connect-timeout 5 "$u" || echo '000')
  echo "  -> $u : HTTP $HTTP_STATUS"
done

echo ""
echo "[3] VERIFICANDO BUILD DO BOT..."
if [ -d "/var/www/multizap/bot" ]; then
    echo "  Arquivos recentes em /var/www/multizap/bot:"
    ls -la /var/www/multizap/bot | head -n 5
    
    echo "  Procurando vestígios do Hook no Bundle JS:"
    if grep -q "realtime:messages:" /var/www/multizap/bot/assets/*.js 2>/dev/null; then
        echo "  ✅ Código do channel WebSocket compilado no JS de produção."
    else
        echo "  ⚠️ Assinatura do canal não encontrada no JS. (Build pode estar desatualizado)"
    fi
else
    echo "  ⚠️ Diretório de build /var/www/multizap/bot não encontrado."
fi

echo ""
echo "[4] TESTE DE VAZAMENTO RLS (SUPABASE)..."
# Lê as configurações direto do source sem expor no log
SBASE_URL=$(grep "supabaseUrl =" "$BOT_DIR/src/lib/supabase.ts" 2>/dev/null | cut -d"'" -f2 || echo "")
ANON_KEY=$(grep "supabaseAnonKey =" "$BOT_DIR/src/lib/supabase.ts" 2>/dev/null | cut -d"'" -f2 || echo "")

if [ -n "$SBASE_URL" ] && [ -n "$ANON_KEY" ]; then
    echo "  -> Configurações extraídas com sucesso (Valores mascarados)."
    echo "  -> Testando acesso ANÔNIMO à tabela 'messages'..."
    
    TEST_RLS=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" "$SBASE_URL/rest/v1/messages?select=id&limit=1" || echo "HTTP_STATUS:000")
    STATUS_CODE=$(echo "$TEST_RLS" | grep "HTTP_STATUS:" | cut -d":" -f2)
    BODY=$(echo "$TEST_RLS" | grep -v "HTTP_STATUS:")
    
    if [ "$STATUS_CODE" = "200" ]; then
        if [ "$BODY" = "[]" ]; then
            echo "  ✅ RLS SEGURO: Retornou array vazio para usuário não autenticado (anon key)."
        else
            echo "  ❌ CRÍTICO: RLS VAZADO! O banco retornou registros reais para chamada anônima. Dados expostos."
        fi
    elif [ "$STATUS_CODE" = "401" ] || [ "$STATUS_CODE" = "403" ]; then
        echo "  ✅ RLS SEGURO: Acesso negado pelo banco (HTTP $STATUS_CODE)."
    else
        echo "  ⚠️ Código inesperado (HTTP $STATUS_CODE). Verifique o endpoint."
    fi
else
    echo "  ⚠️ Não foi possível extrair URL/Anon Key para testar RLS automaticamente."
fi

echo ""
echo "══════════════════════════════════════════════════"
echo " Relatório salvo em: $REV"
echo " Fim do Diagnóstico."
