#!/usr/bin/env bash
# ============================================================================
#  lib/online-check.sh — Testa se cada subdomínio oficial responde HTTPS.
#  Aceita 2xx/3xx/401/403 como "vivo" (auth pode estar protegendo).
#  Depende de: curl, lib/ui.sh
# ============================================================================

OC_RETRIES="${OC_RETRIES:-5}"
OC_SLEEP="${OC_SLEEP:-10}"
OC_TIMEOUT="${OC_TIMEOUT:-12}"

oc_alive_code() {
  case "$1" in
    2*|3*|401|403) return 0 ;;
    *) return 1 ;;
  esac
}

oc_check_one() {
  local fqdn="$1"
  local code i
  for i in $(seq 1 "$OC_RETRIES"); do
    code="$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 6 --max-time "$OC_TIMEOUT" "https://${fqdn}" 2>/dev/null || echo "000")"
    if oc_alive_code "$code"; then
      ui_ok "${fqdn} online (HTTP ${code})"
      return 0
    fi
    printf "  ${UI_DIM}tentativa %d/%d — %s respondeu %s, esperando...${UI_RST}\n" "$i" "$OC_RETRIES" "$fqdn" "$code"
    sleep "$OC_SLEEP"
  done
  ui_err "${fqdn} não respondeu (último HTTP=${code})"
  return 1
}

# Testa todos os subdomínios oficiais. Args: zona [subs...] (default = oficiais).
oc_check_all() {
  local zone="$1"; shift
  local subs=("$@")
  [ "${#subs[@]}" -eq 0 ] && subs=("${CA_OFFICIAL_SUBS[@]:-install mcp gateway webhook api bot status}")
  local fails=0 sub
  for sub in "${subs[@]}"; do
    oc_check_one "${sub}.${zone}" || fails=$((fails+1))
  done
  if [ "$fails" -gt 0 ]; then
    ui_err "${fails} subdomínio(s) offline — instalador não pode declarar pronto"
    return 1
  fi
  ui_ok "Todos os subdomínios oficiais respondendo"
}
