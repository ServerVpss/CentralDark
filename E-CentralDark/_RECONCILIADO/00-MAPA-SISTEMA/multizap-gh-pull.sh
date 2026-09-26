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
    sed -i "s#https://[^\" ]*lovable[^\" ]*/api/public/wuzapi/webhook#${OFFICIAL_WEBHOOK_URL}#g" /root/.pm2/dump.pm2 2>/dev/null || true
    log "PM2 dump limpo contra URL Lovable"
  fi
}

ensure_gateway_env() {
  local env_file="$TARGET/gateway/.env"

  if [ ! -f "$env_file" ]; then
    log_error "Arquivo .env do Gateway não encontrado: $env_file"
    return 1
  fi

  log "Garantindo MULTIZAP_WEBHOOK_URL oficial no .env"

  grep -q '^MULTIZAP_WEBHOOK_URL=' "$env_file" \
    && sed -i "s#^MULTIZAP_WEBHOOK_URL=.*#MULTIZAP_WEBHOOK_URL=${OFFICIAL_WEBHOOK_URL}#" "$env_file" \
    || echo "MULTIZAP_WEBHOOK_URL=${OFFICIAL_WEBHOOK_URL}" >> "$env_file"

  grep -q '^NODE_ENV=' "$env_file" \
    && sed -i 's#^NODE_ENV=.*#NODE_ENV=production#' "$env_file" \
    || echo "NODE_ENV=production" >> "$env_file"

  unset MULTIZAP_WEBHOOK_URL || true
  unset NODE_ENV || true

  set -a
  . "$env_file"
  set +a

  export MULTIZAP_WEBHOOK_URL="$OFFICIAL_WEBHOOK_URL"
  export NODE_ENV="production"

  GATEWAY_PORT="$(get_gateway_port)"
  HEALTH_URL="http://127.0.0.1:${GATEWAY_PORT}/health"

  log_ok "ENV do Gateway carregado com URL oficial"
  return 0
}

print_gateway_crash_diagnostics() {
  log_rule
  log_warn "Diagnóstico automático do Gateway"

  print_diag_cmd "Último commit aplicado" git -C "$REPO_DIR" log -1 --oneline
  print_diag_cmd "pm2 logs MultiZap-Gateway --err --lines 100 --nostream" pm2 logs "$PM2_NAME" --err --lines 100 --nostream
  print_diag_cmd "pm2 logs MultiZap-Gateway --lines 100 --nostream" pm2 logs "$PM2_NAME" --lines 100 --nostream
  print_diag_cmd "pm2 describe MultiZap-Gateway" pm2 describe "$PM2_NAME"

  local pid
  pid="$(pm2_gateway_pid)"
  if [ -n "$pid" ] && [ -r "/proc/$pid/environ" ]; then
    print_diag_cmd "ENV real do PM2 via /proc (secrets mascarados)" bash -lc "tr '\0' '\n' < /proc/$pid/environ"
  else
    local pm2_id
    pm2_id="$(pm2_gateway_id)"
    if [ -n "$pm2_id" ]; then
      print_diag_cmd "ENV real do PM2 (secrets mascarados)" pm2 env "$pm2_id"
    else
      log_warn "Não consegui descobrir o ID do PM2 para imprimir o ENV real"
    fi
  fi

  print_diag_cmd "Porta ${GATEWAY_PORT} em uso" bash -lc "(ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null) | grep ':${GATEWAY_PORT}\\b' || echo 'porta ${GATEWAY_PORT} livre'"
  log_rule
}

# ─────────────────────────────────────────────────────────────
# DEPENDÊNCIAS / STARTUP
# ─────────────────────────────────────────────────────────────

install_gateway_deps() {
  local dir="$1"
  local label="$2"

  [ -f "$dir/package.json" ] || return 0

  if [ -f "$dir/package-lock.json" ]; then
    log "npm ci no Gateway (${label}, com package-lock.json)"
    (
      cd "$dir" && \
      npm ci --omit=dev --no-audit --no-fund || \
      npm install --omit=dev --no-audit --no-fund
    ) >>"$LOG" 2>&1
  else
    log "package-lock.json ausente — usando npm install no Gateway (${label})"
    (
      cd "$dir" && npm install --omit=dev --no-audit --no-fund
    ) >>"$LOG" 2>&1
  fi
}

validate_gateway_startup() {
  local dir="$1"

  [ -f "$dir/server.js" ] || return 0

  log "Validando sintaxe dos arquivos do Gateway"

  while IFS= read -r f; do
    node --check "$f" >>"$LOG" 2>&1 || return 1
  done < <(find "$dir" -type f -name "*.js" -not -path "*/node_modules/*")

  log "Validando imports/startup do Gateway sem abrir porta"

  (
    cd "$dir" && timeout 15s node -e "
const http = require('http');
const net = require('net');
http.Server.prototype.listen = function(){ return this; };
net.Server.prototype.listen = function(){ return this; };
try {
  require('./server.js');
  console.log('startup ok');
} catch(e) {
  console.error(e && e.stack || e);
  process.exit(1);
}
"
  ) >>"$LOG" 2>&1
}

# ─────────────────────────────────────────────────────────────
# ESTADO / RESUMO
# ─────────────────────────────────────────────────────────────

DEPLOY_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
STARTED_EPOCH=$(date +%s)
PREV_COMMIT=""
NEW_COMMIT=""
ROLLBACK_PERFORMED="false"
FINAL_STATUS="unknown"
FINAL_ERROR=""

SUM_GITHUB="pending"
SUM_SYNC="pending"
SUM_SMOKE="pending"
SUM_PM2="pending"
SUM_PORT="pending"
SUM_HEALTH="pending"
SUM_ROLLBACK="não necessário"

write_deploy_log() {
  printf '{"id":"%s","status":"%s","rollback":%s}\n' "$DEPLOY_ID" "$FINAL_STATUS" "$ROLLBACK_PERFORMED" >> "$DEPLOY_LOG"
}

_sum_line() {
  local label="$1"
  local status="$2"

  case "$status" in
    ok|OK)
      _term "  ${C_GREEN}✅${C_RESET} ${label}: ${C_GREEN}OK${C_RESET}"
      ;;
    fail|FAIL)
      _term "  ${C_RED}❌${C_RESET} ${label}: ${C_RED}FALHOU${C_RESET}"
      ;;
    *)
      _term "  ${C_YELLOW}•${C_RESET} ${label}: ${status}"
      ;;
  esac
}

print_summary() {
  log_rule
  _term "${C_BOLD}Resumo${C_RESET}"
  _sum_line "GitHub" "$SUM_GITHUB"
  _sum_line "Sync" "$SUM_SYNC"
  _sum_line "Smoke/startup" "$SUM_SMOKE"
  _sum_line "PM2" "$SUM_PM2"
  _sum_line "Porta ${GATEWAY_PORT}" "$SUM_PORT"
  _sum_line "Healthcheck" "$SUM_HEALTH"
  _sum_line "Rollback" "$SUM_ROLLBACK"
  log_rule
}

# ─────────────────────────────────────────────────────────────
# HEALTH / RESTART / VALIDAÇÃO
# ─────────────────────────────────────────────────────────────

healthcheck() {
  log "Aguardando porta ${GATEWAY_PORT}..."

  local up=0

  for i in $(seq 1 30); do
    if curl -fsS --max-time 2 "$HEALTH_URL" >/dev/null 2>&1; then
      up=1
      break
    fi

    local st
    st="$(pm2 show "$PM2_NAME" 2>/dev/null | grep "status" | awk '{print $4}' || true)"

    if [ "$st" = "errored" ] || [ "$st" = "stopped" ]; then
      log_error "PM2 status: $st"
      break
    fi

    sleep 2
  done

  if [ "$up" -ne 1 ]; then
    log "Porta ${GATEWAY_PORT} não abriu em 60s — imprimindo diagnóstico automático"
    SUM_PORT="fail"
    print_gateway_crash_diagnostics
    return 1
  fi

  SUM_PORT="ok"

  local ok=0
  for i in 1 2 3 4 5; do
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
      ok=$((ok + 1))
    fi
    sleep 1
  done

  if [ "$ok" -ge 3 ]; then
    SUM_HEALTH="ok"
    return 0
  fi

  SUM_HEALTH="fail"
  return 1
}

restart_gateway() {
  ensure_gateway_env || {
    SUM_PM2="fail"
    return 1
  }

  clean_pm2_dump_urls

  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_NAME" --update-env >>"$LOG" 2>&1 && SUM_PM2="ok" || SUM_PM2="fail"
  else
    pm2 start "$TARGET/gateway/server.js" --name "$PM2_NAME" --cwd "$TARGET/gateway" --update-env >>"$LOG" 2>&1 && SUM_PM2="ok" || SUM_PM2="fail"
  fi

  pm2 save >>"$LOG" 2>&1 || true
  clean_pm2_dump_urls

  [ "$SUM_PM2" = "ok" ]
}

validate_post_deploy() {
  log_step "Validação pós-deploy (ENV/URL/health)"

  local ok=1
  local webhook_url node_env env_dump health_body

  webhook_url="$(pm2_env_value MULTIZAP_WEBHOOK_URL)"
  node_env="$(pm2_env_value NODE_ENV)"
  env_dump="$(pm2_gateway_env_raw 2>/dev/null || true)"

  if [ "$webhook_url" = "$OFFICIAL_WEBHOOK_URL" ]; then
    log_ok "MULTIZAP_WEBHOOK_URL correto no PM2: $webhook_url"
  else
    log_error "MULTIZAP_WEBHOOK_URL inesperado no PM2: ${webhook_url:-vazio}"
    log_error "Esperado: $OFFICIAL_WEBHOOK_URL"
    ok=0
  fi

  if [ "$node_env" = "production" ]; then
    log_ok "NODE_ENV correto no PM2: $node_env"
  else
    log_error "NODE_ENV inesperado no PM2: ${node_env:-vazio}"
    log_error "Esperado: production"
    ok=0
  fi

  if printf '%s\n' "$env_dump" | grep -Eiq "$FORBIDDEN_URL_REGEX"; then
    log_error "ENV do PM2 ainda contém URL Lovable — PROIBIDO em produção"
    ok=0
  else
    log_ok "Nenhuma URL Lovable no ENV do PM2"
  fi

  health_body="$(curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null || true)"

  if [ -z "$health_body" ]; then
    log_error "Healthcheck não respondeu na validação final"
    ok=0
  else
    log "Health body: $health_body"

    if printf '%s\n' "$health_body" | grep -Eiq "$FORBIDDEN_URL_REGEX|URL_PROIBIDA|ENV_DIVERGENTE|degraded"; then
      log_error "Healthcheck retornou configuração inválida/degraded"
      ok=0
    elif printf '%s\n' "$health_body" | grep -Eq '"ok"[[:space:]]*:[[:space:]]*true'; then
      log_ok "Healthcheck OK"
    else
      log_error "Healthcheck não confirmou ok:true"
      ok=0
    fi
  fi

  if [ "$ok" = "1" ]; then
    return 0
  fi

  return 1
}

# ─────────────────────────────────────────────────────────────
# ROLLBACK
# ─────────────────────────────────────────────────────────────

rollback() {
  ROLLBACK_PERFORMED="true"

  local target_commit="${1:-$(cat "$LAST_GOOD_FILE" 2>/dev/null || echo '')}"

  log_action "🔁 Rollback para $target_commit"

  if [ -z "$target_commit" ]; then
    log_error "Sem commit para rollback"
    return 1
  fi

  git -C "$REPO_DIR" reset --hard "$target_commit" >>"$LOG" 2>&1

  rsync -a --delete \
    --exclude 'gateway/.env' \
    --exclude 'wuzapi/.env' \
    --exclude 'gateway/data/' \
    --exclude 'gateway/logs/' \
    "$REPO_DIR/$PACKAGE_SUBDIR/" "$TARGET/" >>"$LOG" 2>&1

  ensure_gateway_env || {
    log_error "Falha ao preparar ENV oficial durante rollback"
    SUM_ROLLBACK="fail"
    return 1
  }

  clean_pm2_dump_urls

  install_gateway_deps "$TARGET/gateway" "rollback" || {
    log_error "Dependências falharam durante o rollback"
    SUM_ROLLBACK="fail"
    return 1
  }

  validate_gateway_startup "$TARGET/gateway" || {
    log_error "Startup do Gateway falhou durante rollback"
    SUM_ROLLBACK="fail"
    print_gateway_crash_diagnostics
    return 1
  }

  restart_gateway || {
    log_error "PM2 falhou durante rollback"
    SUM_ROLLBACK="fail"
    print_gateway_crash_diagnostics
    return 1
  }

  if healthcheck && validate_post_deploy; then
    log_ok "Rollback sucesso"
    SUM_ROLLBACK="ok"
    return 0
  fi

  log_error "Rollback FALHOU"
  SUM_ROLLBACK="fail"
  return 1
}

# ─────────────────────────────────────────────────────────────
# GIT
# ─────────────────────────────────────────────────────────────

fetch_or_clone_repo() {
  local git_auth_ok=0

  if [ ! -d "$REPO_DIR/.git" ]; then
    log_info "Repo local não existe. Clonando..."

    if git clone --branch "$BRANCH" "$REPO_URL_PUBLIC" "$REPO_DIR" >>"$LOG" 2>&1; then
      git_auth_ok=1
    elif [ -n "${GITHUB_PAT:-}" ]; then
      log_warn "Clone público falhou — tentando com GITHUB_PAT sem imprimir token"
      git clone --branch "$BRANCH" "https://x-access-token:${GITHUB_PAT}@github.com/${REPO_FULLNAME}.git" "$REPO_DIR" >>"$LOG" 2>&1 \
        && git_auth_ok=1
    fi
  else
    if git -C "$REPO_DIR" fetch origin "$BRANCH" >>"$LOG" 2>&1; then
      git_auth_ok=1
    elif [ -n "${GITHUB_PAT:-}" ]; then
      log_warn "git fetch falhou — tentando fallback com GITHUB_PAT sem salvar token no remote"
      git -C "$REPO_DIR" fetch "https://x-access-token:${GITHUB_PAT}@github.com/${REPO_FULLNAME}.git" "$BRANCH:refs/remotes/origin/$BRANCH" >>"$LOG" 2>&1 \
        && git_auth_ok=1
    fi

    if [ "$git_auth_ok" = "1" ]; then
      git -C "$REPO_DIR" reset --hard "origin/$BRANCH" >>"$LOG" 2>&1
    fi
  fi

  [ "$git_auth_ok" = "1" ]
}

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

log_rule
log_step "1/4 GitHub"

if fetch_or_clone_repo; then
  SUM_GITHUB="ok"
else
  log_error "Não consegui falar com o GitHub. Verifique deploy key SSH, remote ou GITHUB_PAT."
  SUM_GITHUB="fail"
  FINAL_STATUS="failed"
  print_summary
  write_deploy_log
  exit 1
fi

PREV_COMMIT="$(cat "$LAST_GOOD_FILE" 2>/dev/null || echo "")"
NEW_COMMIT="$(git -C "$REPO_DIR" rev-parse HEAD)"

if [ -z "$FORCE_DEPLOY" ] && [ "$PREV_COMMIT" = "$NEW_COMMIT" ]; then
  log_info "Sem novo commit para aplicar. Validando/fixando ENV atual."

  ensure_gateway_env || {
    FINAL_STATUS="failed"
    print_summary
    write_deploy_log
    exit 1
  }

  clean_pm2_dump_urls

  if ! validate_post_deploy; then
    log_warn "ENV/health atual inválido. Reiniciando Gateway com ENV oficial."

    restart_gateway
    healthcheck

    validate_post_deploy || {
      FINAL_STATUS="failed"
      print_summary
      write_deploy_log
      exit 1
    }
  fi

  FINAL_STATUS="success"
  log_ok "Nada a fazer. Configuração atual validada."
  print_summary
  write_deploy_log
  exit 0
fi

log_step "2/4 Sync"

limpar_pastas_legadas

rsync -a --delete \
  --exclude 'gateway/.env' \
  --exclude 'wuzapi/.env' \
  --exclude 'gateway/data/' \
  --exclude 'gateway/logs/' \
  "$REPO_DIR/$PACKAGE_SUBDIR/" "$TARGET/" >>"$LOG" 2>&1

ensure_gateway_env || {
  SUM_SYNC="fail"
  FINAL_STATUS="failed"
  FINAL_ERROR="falha ao preparar ENV oficial do Gateway"
  rollback "$PREV_COMMIT"
  print_summary
  write_deploy_log
  exit 1
}

clean_pm2_dump_urls

if ! install_gateway_deps "$TARGET/gateway" "deploy"; then
  SUM_SMOKE="fail"
  FINAL_STATUS="failed"
  FINAL_ERROR="dependências do Gateway falharam"
  rollback "$PREV_COMMIT"
  print_summary
  write_deploy_log
  exit 1
fi

if ! validate_gateway_startup "$TARGET/gateway"; then
  SUM_SMOKE="fail"
  FINAL_STATUS="failed"
  FINAL_ERROR="startup do Gateway falhou antes do PM2"
  log_error "Validação do Gateway falhou antes do restart — deploy bloqueado"
  print_gateway_crash_diagnostics
  rollback "$PREV_COMMIT"
  print_summary
  write_deploy_log
  exit 1
fi

SUM_SMOKE="ok"
SUM_SYNC="ok"

log_step "3/4 Restart"

if ! restart_gateway; then
  FINAL_STATUS="failed"
  FINAL_ERROR="PM2 falhou ao reiniciar Gateway"
  print_gateway_crash_diagnostics
  rollback "$PREV_COMMIT"
  print_summary
  write_deploy_log
  exit 1
fi

log_step "4/4 Healthcheck"

if healthcheck && validate_post_deploy; then
  echo "$NEW_COMMIT" > "$LAST_GOOD_FILE"
  FINAL_STATUS="success"
  log_ok "Deploy sucesso"
else
  log_error "Healthcheck/validação pós-deploy falhou — iniciando rollback"

  if rollback "$PREV_COMMIT"; then
    validate_post_deploy || true
    FINAL_STATUS="rolled_back"
  else
    FINAL_STATUS="failed"
  fi
fi

print_summary
write_deploy_log

[ "$FINAL_STATUS" = "success" ] && exit 0 || exit 1
