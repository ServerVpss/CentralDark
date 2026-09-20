#!/usr/bin/env bash
# ============================================================================
#  Checker 12 — DNS wildcard + subdomínios oficiais
#  Saída no formato do _lib.sh: OK|bloco|msg / ALERTA|bloco|msg / ERRO|bloco|msg
# ============================================================================
set -uo pipefail

BLOCO="wildcard-dns"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/_lib.sh" 2>/dev/null || true

CF_ENV="${CF_ENV_FILE:-/root/CentralDark/secrets/cloudflare.env}"
ZONE=""
IP=""
if [ -f "$CF_ENV" ]; then
  # shellcheck disable=SC1090
  ZONE="$(grep -E '^CF_ZONE_NAME=' "$CF_ENV" | tail -1 | cut -d= -f2- | tr -d '"')"
  IP="$(grep -E '^CF_TARGET_IP=' "$CF_ENV" | tail -1 | cut -d= -f2- | tr -d '"')"
fi
ZONE="${ZONE:-centralldark.com}"
[ -z "$IP" ] && IP="$(curl -4 -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true)"

if [ -z "$IP" ]; then
  echo "ALERTA|${BLOCO}|Não foi possível detectar IP esperado da VPS"
  exit 0
fi

check_one() {
  local fqdn="$1" label="$2"
  local got
  got="$(dig +short +time=3 +tries=1 A "$fqdn" @1.1.1.1 2>/dev/null | grep -E '^[0-9.]+$' | head -1)"
  if [ -z "$got" ]; then
    echo "ERRO|${BLOCO}|${label} (${fqdn}) não resolve"
  elif [ "$got" = "$IP" ]; then
    echo "OK|${BLOCO}|${label} (${fqdn}) → ${got}"
  else
    # Pode ser proxy CF — aceita como ALERTA
    echo "ALERTA|${BLOCO}|${label} (${fqdn}) → ${got} (esperado ${IP} — pode ser proxy CF)"
  fi
}

check_one "$ZONE"        "@"
check_one "www.${ZONE}"  "www"

PROBE="probe-$(openssl rand -hex 4 2>/dev/null || date +%s).${ZONE}"
check_one "$PROBE" "* (wildcard probe)"

for sub in install mcp gateway webhook api bot status; do
  check_one "${sub}.${ZONE}" "${sub}"
done

exit 0
