#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Painel de status dos serviços (estilo cabrata)
# ----------------------------------------------------------------------------
#  Suporta tema via $CDMENU_THEME (default | netflix).
#  Mostra Hostname, OS, RAM, Domínio + status PM2 de cada serviço importante.
#  IP é OMITIDO (regra de sigilo).
# ============================================================================

set -u

THEME="${CDMENU_THEME:-netflix}"
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
THEME_DIR="$SCRIPT_DIR/themes"
THEME_FILE="$THEME_DIR/${THEME}.sh"
[ -f "$THEME_FILE" ] || THEME_FILE="$THEME_DIR/default.sh"
# shellcheck disable=SC1090
source "$THEME_FILE"

HOSTNAME_STR="$(hostname)"
OS_NAME="$(hostnamectl 2>/dev/null | awk -F': ' '/Operating System/ {print $2}')"
[ -z "${OS_NAME:-}" ] && OS_NAME="$(uname -srm)"
TRAM="$(free -m | awk 'NR==2 {print $2}')"
URAM="$(free -m | awk 'NR==2 {print $3}')"

DOMAIN_FILE="/root/CentralDark/secrets/domain.txt"
if [ -f "$DOMAIN_FILE" ]; then
  DOMAIN="$(head -n1 "$DOMAIN_FILE")"
else
  DOMAIN="${CENTRALDARK_DOMAIN:-centralldark.com}"
fi

CLIENT_NAME="${CLIENT_NAME:-CentralDark}"
EXPIRED="Lifetime"
VERSION_FILE="/root/CentralDark/VERSION"
VERSAO="$( [ -f "$VERSION_FILE" ] && head -n1 "$VERSION_FILE" || echo 'rolling-main')"

SERVICOS=(
  "MCP-CentralDark"
  "CloneDeck-Supabase-Sync"
  "MultiZap-TelegramBot"
  "MultiZap-Gateway"
  "MultiZap-GitHub-Webhook"
  "CloneDeck-CRM"
  "wabot-bridge"
  "whatsapp-server"
  "webhook-bot"
  "github-webhook"
)

SYS_SERVICOS=(
  "caddy"
  "docker"
  "cron"
)

pm2_status() {
  local svc="$1"
  pm2 jlist 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
for p in data:
    if p.get('name')=='$svc':
        s=p.get('pm2_env',{}).get('status','?')
        r=p.get('pm2_env',{}).get('restart_time',0)
        print(f'{s}|{r}')
        sys.exit(0)
print('missing|0')
" 2>/dev/null
}

render_pm2() {
  local svc="$1"
  local raw status restarts label color
  raw="$(pm2_status "$svc")"
  status="${raw%%|*}"
  restarts="${raw##*|}"
  case "$status" in
    online)
      if [ "${restarts:-0}" -gt 20 ]; then
        label="Running ( restarts=$restarts )"; color="$WARN"
      else
        label="Running ( No Error )"; color="$OK"
      fi
      ;;
    stopped) label="Stopped ( ERROR )"; color="$ERR" ;;
    errored) label="Errored ( ERROR )"; color="$ERR" ;;
    missing) label="Não instalado"; color="$ERR" ;;
    *) label="$status"; color="$WARN" ;;
  esac
  printf "${LABEL} %-28s${NC} : ${color}%s${NC}\n" "$svc" "$label"
}

render_sys() {
  local svc="$1" label color
  if systemctl is-active --quiet "$svc" 2>/dev/null; then
    label="Running ( No Error )"; color="$OK"
  elif systemctl list-unit-files "${svc}.service" 2>/dev/null | grep -q "$svc"; then
    label="Stopped ( ERROR )"; color="$ERR"
  else
    label="Não instalado"; color="$WARN"
  fi
  printf "${LABEL} %-28s${NC} : ${color}%s${NC}\n" "$svc" "$label"
}

clear
print_banner
echo -e "${RULE} ${LINE}${NC}"
echo -e "${HEAD}                 INFORMAÇÕES DO SISTEMA            ${NC}"
echo -e "${RULE} ${LINE}${NC}"
echo -e "${LABEL} Hostname    ${NC}: ${HOSTNAME_STR}"
echo -e "${LABEL} OS          ${NC}: ${OS_NAME}"
echo -e "${LABEL} RAM Total   ${NC}: ${TRAM} MB"
echo -e "${LABEL} RAM Usada   ${NC}: ${URAM} MB"
echo -e "${LABEL} Domínio     ${NC}: ${DOMAIN}"
echo -e "${RULE} ${LINE}${NC}"
echo -e "${HEAD}                 ASSINATURA / VERSÃO               ${NC}"
echo -e "${RULE} ${LINE}${NC}"
echo -e "${LABEL} Cliente     ${NC}: ${CLIENT_NAME}"
echo -e "${LABEL} Expira em   ${NC}: ${EXPIRED}"
echo -e "${LABEL} Versão      ${NC}: ${VERSAO}"
echo -e "${LABEL} Tema        ${NC}: ${THEME_NAME:-$THEME}"
echo -e "${RULE} ${LINE}${NC}"
echo -e "${HEAD}              SERVIÇOS PM2 (CentralDark)           ${NC}"
echo -e "${RULE} ${LINE}${NC}"
for s in "${SERVICOS[@]}"; do render_pm2 "$s"; done
echo -e "${RULE} ${LINE}${NC}"
echo -e "${HEAD}               SERVIÇOS DE SISTEMA                 ${NC}"
echo -e "${RULE} ${LINE}${NC}"
for s in "${SYS_SERVICOS[@]}"; do render_sys "$s"; done
echo -e "${RULE} ${LINE}${NC}"
echo
echo -e "${ITEM}        centralldark.com  ·  mcp.centralldark.com${NC}"
echo
read -rp " Pressione ENTER pra voltar... " _
