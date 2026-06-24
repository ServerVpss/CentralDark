#!/usr/bin/env bash
# ============================================================================
# Checker END-TO-END do instalador CentralDark / MultiZap
# Roda os 11 blocos de validação, agrega resultado e gera relatório final
# em /root/Multizap/revisoes/YYYYMMDD-HHMMSS/checker-final/
# ============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

TS=$(date +%Y%m%d-%H%M%S)
SAIDA_DIR="${CK_MULTIZAP_ROOT}/revisoes/${TS}/checker-final"
mkdir -p "$SAIDA_DIR" 2>/dev/null || SAIDA_DIR="/tmp/checker-${TS}"
mkdir -p "$SAIDA_DIR"

BRUTO="${SAIDA_DIR}/bruto.txt"
RELATORIO="${SAIDA_DIR}/relatorio.md"

# Executa cada bloco em ordem
MODULOS=(
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
)

: > "$BRUTO"
for m in "${MODULOS[@]}"; do
  if [ -x "$SCRIPT_DIR/$m" ]; then
    bash "$SCRIPT_DIR/$m" 2>&1 | sanitize_log >> "$BRUTO" || true
  else
    echo "ALERTA|geral|Módulo não executável: $m" >> "$BRUTO"
  fi
done

# Conta resultados
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

# Monta relatório bloco a bloco
{
  echo "# Relatório Final — Checker CentralDark"
  echo
  echo "**Data:** $(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "**Host:** $(hostname 2>/dev/null || echo "${HOSTNAME:-desconhecido}")"
  echo "**STATUS FINAL:** \`$STATUS_FINAL\`"
  echo
  echo "## Resumo"
  echo "- ✅ OK: $TOTAL_OK"
  echo "- ⚠️ ALERTA: $TOTAL_AL"
  echo "- ❌ ERRO: $TOTAL_ER"
  echo
  echo "## Detalhes por bloco"
  echo

  # Lista blocos únicos
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
    echo "2. Revisar os itens ⚠️ ALERTA — muitos são pendências conhecidas e esperadas."
  fi
  echo "3. Log bruto sanitizado: \`$BRUTO\`"
} > "$RELATORIO"

# Imprime no terminal (resumo)
echo
printf "${CK_INFO}===== RESUMO DO CHECKER =====${CK_RST}\n"
case "$STATUS_FINAL" in
  OK)     printf "${CK_OK}STATUS FINAL: OK${CK_RST}\n" ;;
  ALERTA) printf "${CK_WARN}STATUS FINAL: ALERTA${CK_RST}\n" ;;
  ERRO)   printf "${CK_ERR}STATUS FINAL: ERRO${CK_RST}\n" ;;
esac
echo "OK=$TOTAL_OK  ALERTA=$TOTAL_AL  ERRO=$TOTAL_ER"
echo "Relatório: $RELATORIO"

# Exit code: 0 OK, 1 ALERTA, 2 ERRO (instalador usa pra bloquear)
case "$STATUS_FINAL" in
  OK)     exit 0 ;;
  ALERTA) exit 1 ;;
  ERRO)   exit 2 ;;
esac
