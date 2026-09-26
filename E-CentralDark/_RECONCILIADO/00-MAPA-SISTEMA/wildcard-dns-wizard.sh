#!/usr/bin/env bash
# ============================================================================
#  wildcard-dns-wizard.sh — Wizard oficial de DNS wildcard.
#
#  Fluxo:
#    [1] pré-check da VPS
#    [2] detecta IP público
#    [3] pergunta domínio principal
#    [4] mostra os 3 registros (@, www, *) e espera o usuário cadastrar
#    [5] valida propagação (incluindo probe wildcard)
#    [6] gera snippets Caddy dos subdomínios oficiais
#    [7] valida Caddyfile (reload só com CONFIRMO)
#    [8] online-check dos subdomínios
#    [9] relatório
#
#  Uso:
#    ./wildcard-dns-wizard.sh [--check-only] [--no-precheck]
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="${SCRIPT_DIR}/lib"

# shellcheck disable=SC1091
. "${LIB_DIR}/ui.sh"
# shellcheck disable=SC1091
. "${LIB_DIR}/precheck.sh"
# shellcheck disable=SC1091
. "${LIB_DIR}/wildcard.sh"
# shellcheck disable=SC1091
. "${LIB_DIR}/caddy-auto.sh"
# shellcheck disable=SC1091
. "${LIB_DIR}/online-check.sh"

WW_REPORT_BASE="${WW_REPORT_BASE:-/root/CentralDark/revisoes}"
WW_ZONE_DEFAULT="${WW_ZONE_DEFAULT:-centralldark.com}"
WW_MODE="full"

for arg in "$@"; do
  case "$arg" in
    --check-only) WW_MODE="check" ;;
    --no-precheck) WW_NO_PRECHECK=1 ;;
  esac
done

ww_detect_ip() {
  curl -4 -fsS --max-time 5 https://api.ipify.org 2>/dev/null \
    || curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null \
    || ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}'
}

ww_ask_zone() {
  local ans
  printf "Domínio principal [%s]: " "$WW_ZONE_DEFAULT"
  read -r ans || ans=""
  echo "${ans:-$WW_ZONE_DEFAULT}"
}

ww_init_report() {
  local ts dir
  ts="$(date +%Y%m%d-%H%M%S)"
  dir="${WW_REPORT_BASE}/${ts}/instalador-wildcard"
  mkdir -p "$dir" 2>/dev/null || dir="/tmp/instalador-wildcard-${ts}"
  mkdir -p "$dir"
  echo "$dir"
}

ww_main() {
  ui_banner "Wildcard DNS Wizard — instala domínios sem dor"

  if [ -z "${WW_NO_PRECHECK:-}" ] && [ "$WW_MODE" = "full" ]; then
    pc_run_all || { ui_err "Pré-check falhou — corrija antes de seguir"; exit 2; }
  fi

  ui_title "===== [2/6] IP público da VPS ====="
  local ip
  ip="$(ww_detect_ip)"
  if [ -z "$ip" ]; then ui_err "Não consegui detectar IP público"; exit 2; fi
  ui_ok "IP detectado: ${ip}"

  ui_title "===== [3/6] Domínio principal ====="
  local zone
  zone="$(ww_ask_zone)"
  ui_ok "Domínio: ${zone}"

  ui_title "===== [4/6] DNS wildcard (@, www, *) ====="
  wc_show_records_box "$zone" "$ip"
  if [ "$WW_MODE" = "full" ]; then
    if ui_confirm "Já cadastrou os 3 registros no painel?" "S"; then
      :
    else
      ui_warn "Sem problema — cadastre e rode de novo: ./install.sh --wildcard"
      exit 0
    fi
  fi
  wc_validate_wildcard "$zone" "$ip" || { ui_err "DNS não propagou. Tenta de novo daqui a pouco."; exit 3; }

  if [ "$WW_MODE" = "check" ]; then
    ui_ok "Modo check-only concluído"
    exit 0
  fi

  ui_title "===== [5/6] Caddy (rotas automáticas) ====="
  ca_generate_all "$zone" || ui_warn "Geração Caddy teve avisos — revise"
  ca_reload_with_confirm

  ui_title "===== [5b/6] Subdomínios online ====="
  ui_info "Pode levar 1-2 min pro Let's Encrypt emitir cert na primeira vez..."
  oc_check_all "$zone" || ui_warn "Alguns subdomínios ainda offline — pode ser SSL emitindo. Tente: ./install.sh --online-check"

  ui_title "===== [6/6] Relatório ====="
  local report_dir
  report_dir="$(ww_init_report)"
  {
    echo "# Instalador Wildcard DNS — resumo"
    echo
    echo "- Data: $(date -Iseconds)"
    echo "- Zona: ${zone}"
    echo "- IP VPS: ${ip}"
    echo
    echo "## Registros DNS configurados"
    echo "- @ → ${ip}"
    echo "- www → ${ip}"
    echo "- * → ${ip}"
    echo
    echo "## Subdomínios oficiais gerados"
    for s in "${CA_OFFICIAL_SUBS[@]}"; do echo "- ${s}.${zone}"; done
  } > "${report_dir}/resumo.md"
  ui_ok "Relatório: ${report_dir}/resumo.md"
  echo
  ui_ok "Instalação de DNS concluída. Tudo verde."
}

ww_main "$@"
