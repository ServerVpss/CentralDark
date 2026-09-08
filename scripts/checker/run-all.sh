#!/usr/bin/env bash
# ============================================================================
# Checker END-TO-END da CentralDark
# Roda estado inicial + blocos 01..14, agrega resultado e gera relatório final
# exclusivamente em /root/CentralDark/revisoes/...
# ============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

TS=$(date +%Y%m%d-%H%M%S)
SAIDA_DIR="${CK_CENTRALDARK_ROOT}/revisoes/${TS}/checker-final"
require_canonical_path "run-all" "$SAIDA_DIR" || exit 2
mkdir -p "$SAIDA_DIR" || {
  echo "ERRO|run-all|Não foi possível criar saída canônica: $SAIDA_DIR" >&2
  exit 2
}

BRUTO="${SAIDA_DIR}/bruto.txt"
RELATORIO="${SAIDA_DIR}/relatorio.md"

MODULOS=(
  00-state.sh
  01-estrutura.sh
  02-logs.sh
  03-github-deploy.sh
  04-pm2.sh
  05-telegram-bot.sh
  06-supabase-sync.sh
  07-whatsapp-wuzapi.sh
  08-chat-ao-vivo.sh
  09-caddy.sh
  10-crm.sh
  11-seguranca.sh
  12-wildcard-dns.sh
  13-install-https.sh
  14-checker-contract.sh
)

: > "$BRUTO"
echo "OK|run-all|[CHECKER] DELTA ÚTIL aplicado, fluxo anterior continua" >> "$BRUTO"
for m in "${MODULOS[@]}"; do
  if [ -f "$SCRIPT_DIR/$m" ]; then
    bash "$SCRIPT_DIR/$m" 2>&1 | sanitize_log >> "$BRUTO" || true
  else
    echo "ERRO|geral|Módulo ausente: $m" >> "$BRUTO"
  fi
done

TOTAL_OK=$(grep -c '^OK|'     "$BRUTO" || true)
TOTAL_AL=$(grep -c '^ALERTA|' "$BRUTO" || true)
TOTAL_ER=$(grep -c '^ERRO|'   "$BRUTO" || true)

if [ "$TOTAL_ER" -gt 0 ]; then
  STATUS_FINAL="ERRO"
elif [ "$TOTAL_AL" -gt 0 ]; then
  STATUS_FINAL="ALERTA"
else
  STATUS_FINAL="OK"
fi

{
  echo "# Relatório Final — Checker CentralDark"
  echo
  echo "**Data:** $(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "**Host:** $(hostname 2>/dev/null || echo "${HOSTNAME:-desconhecido}")"
  echo "**Raiz canônica:** \`$CK_CENTRALDARK_ROOT\`"
  echo "**Política externa:** \`$CK_EXTERNAL_ROOT_POLICY\`"
  echo "**STATUS FINAL:** \`$STATUS_FINAL\`"
  echo "**Contrato:** \`DELTA ÚTIL aplicado, fluxo anterior continua\`"
  echo
  echo "## Resumo"
  echo "- ✅ OK: $TOTAL_OK"
  echo "- ⚠️ ALERTA: $TOTAL_AL"
  echo "- ❌ ERRO: $TOTAL_ER"
  echo
  echo "## Detalhes por bloco"
  echo

  BLOCOS=$(awk -F'|' '{print $2}' "$BRUTO" | sort -u)
  for b in $BLOCOS; do
    echo "### $b"
    echo
    grep "^ERRO|$b|"   "$BRUTO" | awk -F'|' '{print "- ❌ " $3}'
    grep "^ALERTA|$b|" "$BRUTO" | awk -F'|' '{print "- ⚠️ " $3}'
    grep "^OK|$b|"     "$BRUTO" | awk -F'|' '{print "- ✅ " $3}'
    echo
  done

  echo "## Próximos passos sugeridos"
  echo
  if [ "$TOTAL_ER" -gt 0 ]; then
    echo "1. Corrigir os itens marcados como ❌ ERRO antes de declarar instalação concluída."
  fi
  if [ "$TOTAL_AL" -gt 0 ]; then
    echo "2. Revisar os itens ⚠️ ALERTA — sem usar árvore externa como fallback silencioso."
  fi
  echo "3. Log bruto sanitizado: \`$BRUTO\`"
  echo "4. Se ainda houver trabalho material, preservar NEXT_CURSOR e continuar o fluxo anterior."
} > "$RELATORIO"

echo
printf "${CK_INFO}===== RESUMO DO CHECKER =====${CK_RST}\n"
case "$STATUS_FINAL" in
  OK)     printf "${CK_OK}STATUS FINAL: OK${CK_RST}\n" ;;
  ALERTA) printf "${CK_WARN}STATUS FINAL: ALERTA${CK_RST}\n" ;;
  ERRO)   printf "${CK_ERR}STATUS FINAL: ERRO${CK_RST}\n" ;;
esac
echo "OK=$TOTAL_OK  ALERTA=$TOTAL_AL  ERRO=$TOTAL_ER"
echo "Relatório: $RELATORIO"

case "$STATUS_FINAL" in
  OK)     exit 0 ;;
  ALERTA) exit 1 ;;
  ERRO)   exit 2 ;;
esac
