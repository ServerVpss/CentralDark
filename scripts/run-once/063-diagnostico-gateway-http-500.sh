#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 063: Diagnosticar Erro HTTP 500 no Gateway
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/063-diagnostico-gateway-http-500"

mkdir -p "$REV"/{logs,diagnostico,raw}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 063 - DIAGNÓSTICO GATEWAY HTTP 500"
echo "=================================================="

echo "Verificando as últimas 50 linhas de erro do Gateway (MultiZap-Gateway)..."
pm2 logs MultiZap-Gateway --lines 50 --nostream > "$REV/raw/gateway-pm2.log" 2>/dev/null || echo "Falha ao ler pm2 logs"

echo "Filtrando stack traces e exceptions..."
grep -iE "error|exception|fail|TypeError|ReferenceError|500" "$REV/raw/gateway-pm2.log" > "$REV/diagnostico/erros-filtrados.txt" || true

echo "Conteúdo dos erros encontrados (Sanitizado):"
# Mascarar qualquer potencial IP, JWT ou secret
sed -E 's/ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/\[TOKEN_MASCARADO\]/g' "$REV/diagnostico/erros-filtrados.txt" | sed -E 's/"token":"[^"]+"/"token":"\[MASCARADO\]"/g'

cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 063-diagnostico-gateway-http-500
📍 FASE: Diagnóstico Causa Raiz do Erro 500.

🧭 PROGRESSO:
antes: Gateway respondendo 500 Internal Server Error ao chamar /qr.
depois: Logs extraídos e sanitizados.

✅ PRINCIPAIS PROVAS:
$(cat "$REV/diagnostico/erros-filtrados.txt" | head -n 10 | sed -E 's/ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/\[TOKEN_MASCARADO\]/g')

⚠️ PROBLEMAS CRÍTICOS:
Exibir o log de erro real do Node.js.

🎯 PRÓXIMA DECISÃO:
Avaliar stack trace para correção imediata do Gateway.
==================================================
RESUMO
