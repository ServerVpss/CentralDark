# COMANDO - multizap-gh-pull.sh
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\multizap-gateway-deploy\deploy-hooks\multizap-gh-pull.sh
**SHA:** 88bce031bfae1c87
**Timestamp:** 2026-08-26T19:39:40.840258
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export GIT_TERMINAL_PROMPT=0

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# MultiZap — deploy automático com rollback seguro
# Instalar em: /usr/local/bin/multizap-gh-pull
#
# ISOLAMENTO OBRIGATÓRIO:
# - NÃO toca em /root/whatsapp-server
# - NÃO toca em PM2 whatsapp-server
# - NÃO usa porta 3000
# - NÃO mexe em Recargas Brasil, PIX, banco/RLS, WuzAPI Docker ou volumes

set -uo pipefail

export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=/bin/true

# ─────────────────────────────────────────────────────────────
# CONFIGURAÇÃO
# ─────────────────────────────────────────────────────────────

LOG="/var/log/multizap-gh-pull.log"
DEPLOY_LOG="/var/log/multizap-deploys.jsonl"
LAST_GOOD_FILE="/var/lib/multizap/last-good-commit"

TARGET="/root/Multizap"
REPO_DIR="/root/Multizap-repo"
REPO_FULLNAME="segredounlock/atendimentoo"
REPO_URL_PUBLIC="https://github.com/${REPO_FULLNAME}.git"
BRANCH="main"
PACKAGE_SUBDIR="multizap-gateway-deploy"

PM2_NAME="MultiZap-Gateway"
OFFICIAL_WEBHOOK_URL="https://multizap.dev/api/public/wuzapi/webhook"
FORBIDDEN_URL_REGEX="lovable\.app|lovable\.dev|lovableproject\.com|atendimentoo\.lovable"

DEPLOY_ENV_FILE="/root/.multizap-deploy.env"
if [ -f "$DEPLOY_ENV_FILE" ]; then
  set -a
  . "$DEPLOY_ENV_FILE"
  set +a
fi

FORCE_DEPLOY="${MULTIZAP_FORCE_DEPLOY:-}"
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE_DEPLOY=1 ;;
  esac
done

# ─────────────────────────────────────────────────────────────
# CORES / LOGS
# ─────────────────────────────────────────────────────────────

USE_COLOR=1
if [ -n "${NO_COLOR:-}" ] || [ ! -t 1 ]; then
  USE_COLOR=0
fi

if [ "$USE_COLOR" = "1" ]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'; C_CYAN=$'\033[36m'; C_GRAY=$'\033[90m'
else
  C_RESET=""; C_DIM=""; C_BOLD=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""; C_CYAN=""; C_GRAY=""
fi

_term() { printf '%b\n' "$*"; }

_file() {
  mkdir -p "$(dirname "$LOG")"
  printf '[%s] %s\n' "$(date '+%F %T')" "$*" >> "$LOG"
}

log_rule()  { _term "${C_DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"; }
log_step()  { _term "${C_CYAN}${C_BOLD}🔎 $*${C_RESET}"; _file "STEP: $*"; }
log_ok()    { _term "${C_GREEN}✅ $*${C_RESET}"; _file "OK: $*"; }
log_warn()  { _term "${C_YELLOW}⚠️  $*${C_RESET}"; _file "WARN: $*"; }
log_error() { _term "${C_RED}${C_BOLD}❌ $*${C_RESET}"; _file "ERROR: $*"; }
log_info()  { _term "${C_BLUE}ℹ️  $*${C_RESET}"; _file "INFO: $*"; }
log_action(){ _term "${C_CYAN}$*${C_RESET}"; _file "ACTION: $*"; }
log()       { _file "$*"; }

mask_sensitive_stream() {
  sed -E \
    -e 's/(Bearer[[:space:]]+)[A-Za-z0-9._~+\/:-]+/\1***/Ig' \
    -e 's/((authorization|secret|token|api[_-]?key|service[_-]?role|password|senha|cookie|GITHUB_PAT|WUZAPI_DB_URL)[^=:\n]{0,40}[=:][[:space:]]*)[^[:space:],}\"]+/\1***/Ig'
}

print_diag_cmd() {
  local title="$1"
  shift
  log "---- Diagnóstico: $title ----"
  _term ""
  _term "${C_BOLD}${title}${C_RESET}"
  "$@" 2>&1 | mask_sensitive_stream | tee -a "$LOG" || true
}

# ─────────────────────────────────────────────────────────────
# PM2 / ENV
# ─────────────────────────────────────────────────────────────

pm2_gateway_id() {
  pm2 jlist 2>/dev/null | node -e "
let s='';
process.stdin.on('data', d => s += d);
process.stdin.on('end', () => {
  try {
    const a = JSON.parse(s);
    const p = a.find(x => x && x.name === 'MultiZap-Gateway');
    if (p && p.pm_id !== undefined) console.log(p.pm_id);
  } catch(e) {}
});
" 2>/dev/null || true
}

pm2_gateway_pid() {
  pm2 pid "$PM2_NAME" 2>/dev/null | awk 'NF {print $1; exit}' || true
}

pm2_gateway_env_raw() {
  local pid
  pid="$(pm2_gateway_pid)"
  if [ -n "$pid" ] && [ -r "/proc/$pid/environ" ]; then
    tr '\0' '\n' < "/proc/$pid/environ"
    return 0
  fi

  local id
  id="$(pm2_gateway_id)"
  if [ -n "$id" ]; then
    pm2 env "$id" 2>/dev/null | sed -E 's/^([^:]+):[[:space:]]*/\1=/'
    return 0
  fi

  return 1
}

pm2_env_value() {
  local key="$1"
  pm2_gateway_env_raw 2>/dev/null \
    | awk -F= -v k="$key" '$1 == k {print substr($0, length(k)+2)}' \
    | tail -n1 \
    | tr -d '\r\n' \
    | sed -E 's/^[[:space:]]+|[[:space:]]+$//g'
}

get_gateway_port() {
  local port
  port="$(grep -E '^PORT=' "$TARGET/gateway/.env" 2>/dev/null | head -n1 | cut -d= -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || true)"
  echo "${port:-3100}"
}

GATEWAY_PORT="$(get_gateway_port)"
HEALTH_URL="http://127.0.0.1:${GATEWAY_PORT}/health"
CANARY_SCRIPT="$TARGET/scripts/multizap-canary-check.sh"
LEGACY_DIRS=( "$TARGET/multizap-gateway-deploy" "$TARGET/atendimento-whatsapp-gateway-deploy" )

mkdir -p "$(dirname "$LOG")" "$(dirname "$DEPLOY_LOG")" "$(dirname "$LAST_GOOD_FILE")"
mkdir -p "$TARGET" "$TARGET/gateway/data" "$TARGET/gateway/logs"

limpar_pastas_legadas() {
  for dir in "${LEGACY_DIRS[@]}"; do
    if [ -e "$dir" ]; then
      rm -rf "$dir"
    fi
  done
}

clean_pm2_dump_urls() {
  if [ -f /root/.pm2/dump.pm2 ]; then
    sed -i "s#https://[^\" ]*lovable[^\" ]*/api/public/wuzapi/webhook
```