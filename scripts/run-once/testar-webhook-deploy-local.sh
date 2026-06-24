#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
THEME="${ROOT}/scripts/lib/theme.sh"
LOG_DIR="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/testar-webhook-deploy-local"
URL="${WEBHOOK_TEST_URL:-http://127.0.0.1:9300/github}"
HEALTH_URL="${WEBHOOK_HEALTH_URL:-http://127.0.0.1:9300/health}"
SECRET="${GITHUB_WEBHOOK_SECRET:-}"

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

sign_payload() {
  local payload="$1"
  printf '%s' "$payload" | openssl dgst -sha256 -hmac "$SECRET" -binary | xxd -p -c 256 | sed 's/^/sha256=/'
}

post_payload() {
  local event="$1"
  local payload="$2"
  local signature="$3"
  curl -s -o "${LOG_DIR}/${event}.json" -w '%{http_code}' \
    -X POST "$URL" \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ${event}" \
    -H "X-Hub-Signature-256: ${signature}" \
    --data "$payload"
}

netflix_header "Teste Webhook Deploy Local"
netflix_step 1 5 "Testando health"
health_code="$(curl -s -o "${LOG_DIR}/health.json" -w '%{http_code}' --max-time 10 "$HEALTH_URL" || true)"
printf 'health=%s\n' "$health_code" >"${LOG_DIR}/summary.txt"

netflix_step 2 5 "Testando assinatura invalida"
invalid_code="$(post_payload push '{"ref":"refs/heads/main"}' 'sha256=invalid' || true)"
printf 'invalid_signature=%s\n' "$invalid_code" >>"${LOG_DIR}/summary.txt"

if [ -z "$SECRET" ]; then
  netflix_warning "GITHUB_WEBHOOK_SECRET ausente; testes assinados ignorados"
  printf 'signed_tests=skipped_no_secret\n' >>"${LOG_DIR}/summary.txt"
else
  netflix_step 3 5 "Testando ping valido"
  ping_payload='{"zen":"centraldark"}'
  ping_code="$(post_payload ping "$ping_payload" "$(sign_payload "$ping_payload")")"
  printf 'ping=%s\n' "$ping_code" >>"${LOG_DIR}/summary.txt"

  netflix_step 4 5 "Testando branch nao main"
  dev_payload='{"ref":"refs/heads/dev","after":"0000000"}'
  dev_code="$(post_payload push "$dev_payload" "$(sign_payload "$dev_payload")")"
  printf 'branch_dev=%s\n' "$dev_code" >>"${LOG_DIR}/summary.txt"

  netflix_step 5 5 "Testando push main fake"
  main_payload='{"ref":"refs/heads/main","after":"0000000"}'
  main_code="$(post_payload push "$main_payload" "$(sign_payload "$main_payload")")"
  printf 'branch_main=%s\n' "$main_code" >>"${LOG_DIR}/summary.txt"
fi

printf '\nCOPIE-E-MANDE\n'
cat "${LOG_DIR}/summary.txt"
printf 'Log: %s\n' "$LOG_DIR"
netflix_done
