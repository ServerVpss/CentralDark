#!/usr/bin/env bash
set -Eeuo pipefail

if [[ -z "${TERM:-}" || "${TERM:-}" == "dumb" ]]; then
  export TERM=xterm-256color
fi

clear || true

THEME_LOADED=0
for theme in /root/CentralDark/scripts/lib/theme.sh /root/scripts/lib/theme.sh; do
  if [[ -f "$theme" ]]; then
    # shellcheck source=/dev/null
    source "$theme"
    THEME_LOADED=1
    break
  fi
done

if [[ "$THEME_LOADED" != "1" ]]; then
  netflix_header() { clear || true; printf '== %s ==\n' "${1:-CentralDark}"; }
  netflix_step() { printf '[%s/%s] %s\n' "${1:-?}" "${2:-?}" "${3:-Executando}"; }
  netflix_info() { printf 'INFO %s\n' "${1:-}"; }
  netflix_success() { printf 'OK %s\n' "${1:-}"; }
  netflix_warning() { printf 'AVISO %s\n' "${1:-}"; }
  netflix_error() { printf 'ERRO %s\n' "${1:-}"; }
  netflix_done() { printf 'CONCLUIDO\n'; }
fi

APP_NAME="builder-bolt-caddy"
CONTAINER_NAME="centraldark-builder-bolt"
DOMAIN="builder.centralldark.com"
LOCAL_URL="http://127.0.0.1:5174"
PUBLIC_URL="https://builder.centralldark.com"
ROOT_DIR="${CENTRALDARK_ROOT:-$(git -C /root rev-parse --show-toplevel 2>/dev/null || printf '/root')}"
SOURCE_SNIPPET="${BUILDER_BOLT_CADDY_SNIPPET:-$ROOT_DIR/infra/caddy/builder.centralldark.com.Caddyfile}"
REAL_SNIPPET_DIR="${REAL_CADDY_SNIPPET_DIR:-/root/CentralDark/infra/caddy}"
REAL_SNIPPET="$REAL_SNIPPET_DIR/builder.centralldark.com.Caddyfile"
REAL_CADDYFILE="${REAL_CADDYFILE:-/etc/caddy/Caddyfile}"
IMPORT_LINE="import $REAL_SNIPPET"
REVISOES_ROOT="${CENTRALDARK_REVISOES:-/root/CentralDark/revisoes}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
REPORT_DIR="$REVISOES_ROOT/$STAMP-$APP_NAME"
LOG_FILE="$REPORT_DIR/ativacao.log"
REPORT_FILE="$REPORT_DIR/relatorio.md"
CONFIRM_PHRASE="${CD_CONFIRM_CADDY_BUILDER_BOLT_FRASE:-$*}"
REQUIRED_PHRASE="CONFIRMO CADDY BUILDER BOLT"
APPLY_REAL=0

mkdir -p "$REPORT_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

sanitize_stream() {
  sed -E \
    -e 's/(Authorization:[[:space:]]*Bearer[[:space:]]+)[^[:space:]]+/\1[REDACTED]/Ig' \
    -e 's/(token|secret|password|passwd|cookie|set-cookie)([=:][[:space:]]*)[^[:space:]]+/\1\2[REDACTED]/Ig'
}

write_report() {
  local status="$1"
  local detail="$2"
  {
    printf '# Relatorio Builder Bolt Caddy\n\n'
    printf -- '- Data UTC: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf -- '- Status: %s\n' "$status"
    printf -- '- Detalhe: %s\n' "$detail"
    printf -- '- Dominio: %s\n' "$DOMAIN"
    printf -- '- Proxy local: %s\n' "$LOCAL_URL"
    printf -- '- Snippet fonte: %s\n' "$SOURCE_SNIPPET"
    printf -- '- Snippet real planejado: %s\n' "$REAL_SNIPPET"
    printf -- '- Caddyfile real: %s\n' "$REAL_CADDYFILE"
    printf -- '- Log completo: %s\n\n' "$LOG_FILE"
    printf '## Travas\n\n'
    printf -- '- Sem CD_CONFIRM_CADDY_BUILDER_BOLT=1 e frase literal, nao copia snippet, nao altera Caddyfile real e nao faz reload.\n'
    printf -- '- Escopo limitado a builder.centralldark.com -> 127.0.0.1:5174.\n'
    printf -- '- Nao toca Open WebUI, porta 3000, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou containers antigos.\n'
  } > "$REPORT_FILE"
}

run_capture() {
  "$@" 2>&1 | sanitize_stream
}

fail() {
  netflix_error "$*"
  write_report "erro" "$*"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatorio ausente: $1"
}

precheck_container() {
  require_cmd docker
  local state health restarting exit_code
  state="$(docker inspect "$CONTAINER_NAME" --format '{{.State.Status}}' 2>/dev/null || true)"
  health="$(docker inspect "$CONTAINER_NAME" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)"
  restarting="$(docker inspect "$CONTAINER_NAME" --format '{{.State.Restarting}}' 2>/dev/null || true)"
  exit_code="$(docker inspect "$CONTAINER_NAME" --format '{{.State.ExitCode}}' 2>/dev/null || true)"

  printf 'STATUS=%s\nHEALTH=%s\nRESTARTING=%s\nEXIT=%s\n' "$state" "$health" "$restarting" "$exit_code" | sanitize_stream

  [[ "$state" == "running" ]] || fail "Container $CONTAINER_NAME nao esta running."
  [[ "$health" == "healthy" ]] || fail "Container $CONTAINER_NAME nao esta healthy."
  [[ "$restarting" == "false" ]] || fail "Container $CONTAINER_NAME esta reiniciando."
  [[ "$exit_code" == "0" ]] || fail "Container $CONTAINER_NAME tem exit code diferente de 0."
}

precheck_local_http() {
  require_cmd curl
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$LOCAL_URL" || true)"
  printf 'HTTP_CODE=%s\n' "$code"
  [[ "$code" == "200" ]] || fail "HTTP local do Builder Bolt nao retornou 200."

  curl -sS -D - -o /dev/null --max-time 10 "$LOCAL_URL" \
    | awk 'BEGIN{IGNORECASE=1} /^HTTP\// || /^cross-origin-(opener|embedder)-policy:/ || /^content-type:/ {print}' \
    | sanitize_stream
}

validate_source_snippet() {
  [[ -f "$SOURCE_SNIPPET" ]] || fail "Snippet versionado ausente: $SOURCE_SNIPPET"
  grep -Fq "reverse_proxy 127.0.0.1:5174" "$SOURCE_SNIPPET" || fail "Snippet nao aponta para 127.0.0.1:5174."
  grep -Fq "$DOMAIN" "$SOURCE_SNIPPET" || fail "Snippet nao contem dominio $DOMAIN."
  if grep -Eq 'Cross-Origin-(Opener|Embedder)-Policy' "$SOURCE_SNIPPET"; then
    fail "Snippet nao deve sobrescrever COOP/COEP; esses headers devem vir do upstream Builder Bolt."
  fi
}

confirm_or_dry_run() {
  if [[ "${CD_CONFIRM_CADDY_BUILDER_BOLT:-}" == "1" && "$CONFIRM_PHRASE" == "$REQUIRED_PHRASE" ]]; then
    APPLY_REAL=1
    netflix_success "Confirmacao humana literal recebida."
    return 0
  fi

  APPLY_REAL=0
  netflix_warning "Dry-run/precheck concluido. Sem confirmacao literal, nada sera aplicado no Caddy real."
  write_report "bloqueado" "Aguardando CD_CONFIRM_CADDY_BUILDER_BOLT=1 e frase literal CONFIRMO CADDY BUILDER BOLT."
  netflix_info "Relatorio: $REPORT_FILE"
  netflix_done
  exit 0
}

backup_real_caddy() {
  [[ -f "$REAL_CADDYFILE" ]] || fail "Caddyfile real ausente: $REAL_CADDYFILE"
  local backup="$REPORT_DIR/Caddyfile.backup"
  cp -a "$REAL_CADDYFILE" "$backup"
  netflix_success "Backup do Caddyfile real salvo em $backup"

  if [[ -f "$REAL_SNIPPET" ]]; then
    cp -a "$REAL_SNIPPET" "$REPORT_DIR/builder.centralldark.com.Caddyfile.backup"
    netflix_success "Backup do snippet real existente salvo."
  fi
}

install_snippet() {
  mkdir -p "$REAL_SNIPPET_DIR"
  cp -a "$SOURCE_SNIPPET" "$REAL_SNIPPET"
  netflix_success "Snippet instalado em $REAL_SNIPPET"
}

ensure_import_line() {
  grep -Fxq "$IMPORT_LINE" "$REAL_CADDYFILE" && {
    netflix_info "Import do Builder Bolt ja existe no Caddyfile real."
    return 0
  }

  python3 - "$REAL_CADDYFILE" "$IMPORT_LINE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
line = sys.argv[2]
text = path.read_text(encoding="utf-8")
if line in text.splitlines():
    raise SystemExit(0)

lines = text.splitlines()
last_import = -1
for index, value in enumerate(lines):
    stripped = value.strip()
    if stripped.startswith("import ") and "infra/caddy" in stripped:
        last_import = index

insert_at = last_import + 1 if last_import >= 0 else len(lines)
lines.insert(insert_at, line)
path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
  netflix_success "Import do Builder Bolt adicionado ao Caddyfile real."
}

validate_caddy() {
  require_cmd caddy
  if ! run_capture caddy validate --config "$REAL_CADDYFILE"; then
    fail "caddy validate falhou; reload bloqueado."
  fi
  netflix_success "caddy validate OK."
}

reload_caddy() {
  if command -v systemctl >/dev/null 2>&1; then
    if ! run_capture systemctl reload caddy; then
      fail "systemctl reload caddy falhou."
    fi
  else
    if ! run_capture caddy reload --config "$REAL_CADDYFILE"; then
      fail "caddy reload falhou."
    fi
  fi
  netflix_success "Reload do Caddy executado."
}

validate_public() {
  local code
  for _ in $(seq 1 20); do
    code="$(curl -k -sS -o /dev/null -w '%{http_code}' --max-time 20 "$PUBLIC_URL" || true)"
    printf 'PUBLIC_HTTP_CODE=%s\n' "$code"
    case "$code" in
      200|301|302) break ;;
      *) sleep 3 ;;
    esac
  done

  case "$code" in
    200|301|302) ;;
    *) fail "HTTPS publico nao retornou 200/301/302 apos reload." ;;
  esac

  curl -k -sS -I --max-time 20 "$PUBLIC_URL" \
    | awk 'BEGIN{IGNORECASE=1} /^HTTP\// || /^server:/ || /^location:/ || /^cross-origin-(opener|embedder)-policy:/ {print}' \
    | sanitize_stream || true
}

main() {
  netflix_header "Builder Bolt Caddy"

  netflix_step 1 9 "Validando escopo"
  [[ "$DOMAIN" == "builder.centralldark.com" ]] || fail "Dominio fora do escopo."
  [[ "$LOCAL_URL" == "http://127.0.0.1:5174" ]] || fail "Proxy local fora do escopo."
  netflix_success "Escopo limitado ao Builder Bolt."

  netflix_step 2 9 "Validando container"
  precheck_container

  netflix_step 3 9 "Validando HTTP local e headers upstream"
  precheck_local_http

  netflix_step 4 9 "Validando snippet versionado"
  validate_source_snippet
  netflix_success "Snippet versionado OK."

  netflix_step 5 9 "Checando confirmacao humana"
  confirm_or_dry_run

  netflix_step 6 9 "Backup do Caddy real"
  backup_real_caddy

  netflix_step 7 9 "Instalando snippet e import"
  install_snippet
  ensure_import_line

  netflix_step 8 9 "Validando e recarregando Caddy"
  validate_caddy
  reload_caddy

  netflix_step 9 9 "Validando HTTPS publico e container final"
  validate_public
  precheck_container

  write_report "ok" "Caddy do Builder Bolt aplicado e recarregado com confirmacao humana literal."
  netflix_info "Relatorio: $REPORT_FILE"
  netflix_done
}

main "$@"
