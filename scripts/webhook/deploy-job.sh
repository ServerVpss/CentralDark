#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
case "$ROOT" in
  /root/CentralDark) ;;
  *) printf 'ROOT_FORA_DA_CENTRALDARK=%s\n' "$ROOT" >&2; exit 20 ;;
esac

THEME="${ROOT}/scripts/lib/theme.sh"
LOG_DIR="${WEBHOOK_DEPLOY_LOG_DIR:-${ROOT}/revisoes/$(date +%Y%m%d-%H%M%S)/webhook-deploy}"
RESOLVED_LOG_DIR="$(realpath -m -- "$LOG_DIR" 2>/dev/null || true)"
case "$RESOLVED_LOG_DIR" in
  "$ROOT/revisoes"|"$ROOT/revisoes"/*) ;;
  *) printf 'LOG_DIR_FORA_DA_CENTRALDARK=%s\n' "$LOG_DIR" >&2; exit 24 ;;
esac
LOG_DIR="$RESOLVED_LOG_DIR"
SUMMARY_FILE="${LOG_DIR}/summary.txt"
FULL_LOG="${LOG_DIR}/deploy.log"
EXPECTED_ORIGIN_RE='^(git@github\.com:|https://github\.com/|ssh://git@github\.com/)ServerVpss/CentralDark(\.git)?$'

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

is_runtime_generated_dirty() {
  case "$1" in
    apps/modulos/status/graph-data.json|\
    apps/modulos/graph-panel/data/graph.json|\
    apps/modulos/hub/src/generated/houseInventory.ts)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

material_dirty_from_status() {
  local line path
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    path="${line:3}"
    if is_runtime_generated_dirty "$path"; then
      printf 'generated_dirty_allowed=%s\n' "$path" >>"$SUMMARY_FILE"
      continue
    fi
    printf '%s\n' "$line"
  done
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
netflix_step 1 7 "Registrando contexto"
write_summary
{
  printf 'pwd=%s\n' "$(pwd)"
  printf 'root=%s\n' "$ROOT"
  printf 'node=%s\n' "$(command -v node || true)"
  printf 'npm=%s\n' "$(command -v npm || true)"
  printf 'git=%s\n' "$(command -v git || true)"
} | sanitize_stream >>"$FULL_LOG"
netflix_success "Contexto registrado"

netflix_step 2 7 "Sincronizacao controlada"
if [ -d "$ROOT/.git" ]; then
  ORIGIN="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
  if ! printf '%s' "$ORIGIN" | grep -Eq "$EXPECTED_ORIGIN_RE"; then
    netflix_error "Origin não é ServerVpss/CentralDark"
    exit 21
  fi
  log_run git -C "$ROOT" status --short
  CURRENT_BRANCH="$(git -C "$ROOT" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
  if [ "$CURRENT_BRANCH" != "main" ]; then
    netflix_error "BRANCH_NAO_CANONICA=${CURRENT_BRANCH:-DETACHED}"
    exit 25
  fi
  printf 'branch=%s\n' "$CURRENT_BRANCH" >>"$SUMMARY_FILE"
  if [ "${WEBHOOK_DEPLOY_GIT_PULL:-0}" = "1" ]; then
    DIRTY_TRACKED="$(git -C "$ROOT" status --porcelain=v1 --untracked-files=no)"
    MATERIAL_DIRTY="$(printf '%s\n' "$DIRTY_TRACKED" | material_dirty_from_status)"
    if [ -n "$MATERIAL_DIRTY" ]; then
      printf '%s\n' "$MATERIAL_DIRTY" >>"$FULL_LOG"
      netflix_error "BLOCKED_LOCAL_DIRTY"
      exit 22
    fi
    [ -z "$DIRTY_TRACKED" ] || netflix_warning "dirty rastreado apenas em churn gerado; seguindo fail-closed no git pull"
    log_run git -C "$ROOT" pull --ff-only origin main
  else
    netflix_warning "git pull desativado; workflow canônico controla sincronização"
    printf 'git_pull=disabled\n' >>"$SUMMARY_FILE"
  fi
else
  netflix_error "Repositorio canônico não encontrado em ROOT"
  exit 23
fi

netflix_step 3 7 "Build apps/web quando existir"
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

netflix_step 4 7 "Build HUB (apps/modulos/hub) quando existir"
HUB_DIR="$ROOT/apps/modulos/hub"
if [ -f "$HUB_DIR/package.json" ]; then
  log_run bash "$ROOT/scripts/deploy-hub.sh"
  if [ -f "$HUB_DIR/dist/index.html" ]; then
    printf 'hub_dist=ok\n' >>"$SUMMARY_FILE"
    netflix_success "HUB dist gerado (hub.centralldark.com)"
  else
    printf 'hub_dist=missing\n' >>"$SUMMARY_FILE"
    netflix_warning "HUB build rodou mas dist/index.html sumiu"
  fi
else
  netflix_warning "apps/modulos/hub/package.json ausente; build HUB ignorado"
fi

netflix_step 5 7 "Validando dist/index.html"
DIST_INDEX="$ROOT/apps/web/dist/index.html"
if [ -f "$DIST_INDEX" ]; then
  printf 'dist_index=ok\n' >>"$SUMMARY_FILE"
  netflix_success "dist/index.html encontrado"
else
  printf 'dist_index=missing\n' >>"$SUMMARY_FILE"
  netflix_warning "dist/index.html nao encontrado neste ambiente"
fi

netflix_step 6 7 "Validando dominios principais"
for url in \
  "https://centralldark.com" \
  "https://www.centralldark.com" \
  "https://status.centralldark.com" \
  "https://bot.centralldark.com" \
  "https://hub.centralldark.com" \
  "https://multizap.dev" \
  "https://www.multizap.dev" \
  "https://bot.multizap.dev"; do
  code="$(curl -k -L -s -o /dev/null -w '%{http_code}' --max-time 15 "$url" || true)"
  printf '%s %s\n' "$code" "$url" | sanitize_stream >>"$FULL_LOG"
  printf 'http_%s=%s\n' "$(printf '%s' "$url" | tr -c 'A-Za-z0-9' '_')" "$code" >>"$SUMMARY_FILE"
done
netflix_success "Validacao HTTP registrada"

netflix_step 7 7 "Salvando resumo"
{
  printf '\nCOPIE-E-MANDE\n'
  printf 'Status: preparatorio\n'
  printf 'Root canônico: %s\n' "$ROOT"
  printf 'Log: %s\n' "$LOG_DIR"
  printf 'Árvores externas: OUT_OF_SCOPE\n'
  printf 'Caddy/Docker/PM2 sensivel/WuzAPI/WhatsApp/banco/CRM: nao tocados\n'
} | tee -a "$SUMMARY_FILE"
netflix_done
