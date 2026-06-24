#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
THEME="${ROOT}/scripts/lib/theme.sh"
LOG_DIR="${WEBHOOK_DEPLOY_LOG_DIR:-/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/webhook-deploy}"
SUMMARY_FILE="${LOG_DIR}/summary.txt"
FULL_LOG="${LOG_DIR}/deploy.log"

mkdir -p "$LOG_DIR"

# shellcheck source=scripts/lib/theme.sh
if [ -f "$THEME" ]; then
  source "$THEME"
else
  netflix_header() { printf '== %s ==\n' "${1:-CentralDark}"; }
  netflix_step() { printf '[%s/%s] %s\n' "$1" "$2" "$3"; }
  netflix_success() { printf 'OK %s\n' "${1:-Concluido}"; }
  netflix_warning() { printf 'AVISO %s\n' "${1:-Atencao}"; }
  netflix_error() { printf 'ERRO %s\n' "${1:-Falha}"; }
  netflix_done() { printf 'CONCLUIDO\n'; }
fi

sanitize_stream() {
  sed -E 's/(token|password|authorization|apikey|api_key|secret|cookie|session)[=: ][^ ,"]+/\1=[REDACTED]/Ig'
}

log_run() {
  "$@" >>"$FULL_LOG" 2>&1
}

write_summary() {
  {
    printf 'webhook-deploy resumo\n'
    printf 'root=%s\n' "$ROOT"
    printf 'log=%s\n' "$LOG_DIR"
    printf 'data=%s\n' "$(date -Iseconds)"
  } >"$SUMMARY_FILE"
}

netflix_header "CentralDark Webhook Deploy"
netflix_step 1 6 "Registrando contexto"
write_summary
{
  printf 'pwd=%s\n' "$(pwd)"
  printf 'root=%s\n' "$ROOT"
  printf 'node=%s\n' "$(command -v node || true)"
  printf 'npm=%s\n' "$(command -v npm || true)"
  printf 'git=%s\n' "$(command -v git || true)"
} | sanitize_stream >>"$FULL_LOG"
netflix_success "Contexto registrado"

netflix_step 2 6 "Sincronizacao controlada"
if [ -d "$ROOT/.git" ]; then
  log_run git -C "$ROOT" status --short
  log_run git -C "$ROOT" rev-parse --abbrev-ref HEAD
  if [ "${WEBHOOK_DEPLOY_GIT_PULL:-0}" = "1" ]; then
    log_run git -C "$ROOT" pull --ff-only origin main
  else
    netflix_warning "git pull desativado neste lote preparatorio"
    printf 'git_pull=disabled\n' >>"$SUMMARY_FILE"
  fi
else
  netflix_warning "Repositorio git nao encontrado em ROOT"
fi

netflix_step 3 6 "Build apps/web quando existir"
WEB_DIR="$ROOT/apps/web"
if [ -f "$WEB_DIR/package.json" ]; then
  if [ -f "$WEB_DIR/package-lock.json" ]; then
    log_run npm --prefix "$WEB_DIR" ci --no-audit --no-fund
  else
    log_run npm --prefix "$WEB_DIR" install --no-audit --no-fund
  fi
  log_run npm --prefix "$WEB_DIR" run build
  netflix_success "Build apps/web solicitado"
else
  netflix_warning "apps/web/package.json ausente; build ignorado"
fi

netflix_step 4 6 "Validando dist/index.html"
DIST_INDEX="$ROOT/apps/web/dist/index.html"
if [ -f "$DIST_INDEX" ]; then
  printf 'dist_index=ok\n' >>"$SUMMARY_FILE"
  netflix_success "dist/index.html encontrado"
else
  printf 'dist_index=missing\n' >>"$SUMMARY_FILE"
  netflix_warning "dist/index.html nao encontrado neste ambiente"
fi

netflix_step 5 6 "Validando dominios principais"
for url in \
  "https://centralldark.com" \
  "https://www.centralldark.com" \
  "https://status.centralldark.com" \
  "https://bot.centralldark.com" \
  "https://multizap.dev" \
  "https://www.multizap.dev" \
  "https://bot.multizap.dev"; do
  code="$(curl -k -L -s -o /dev/null -w '%{http_code}' --max-time 15 "$url" || true)"
  printf '%s %s\n' "$code" "$url" | sanitize_stream >>"$FULL_LOG"
  printf 'http_%s=%s\n' "$(printf '%s' "$url" | tr -c 'A-Za-z0-9' '_')" "$code" >>"$SUMMARY_FILE"
done
netflix_success "Validacao HTTP registrada"

netflix_step 6 6 "Salvando resumo"
{
  printf '\nCOPIE-E-MANDE\n'
  printf 'Status: preparatorio\n'
  printf 'Log: %s\n' "$LOG_DIR"
  printf 'Caddy/Docker/PM2 sensivel/WuzAPI/WhatsApp/banco/CRM: nao tocados\n'
} | tee -a "$SUMMARY_FILE"
netflix_done
