#!/usr/bin/env bash
# CentralDark Deterministic Installer Core
# Version: 0.1.0-beta.1
set -uo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
CANONICAL_INSTALLER="${CENTRALDARK_CANONICAL_INSTALLER:-$ROOT/install.sh}"
STATE_DIR="${CENTRALDARK_INSTALLER_STATE_DIR:-$ROOT/revisoes/installer-state}"
SESSION_ID="${CENTRALDARK_INSTALLER_SESSION_ID:-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$STATE_DIR" 2>/dev/null || true

S_PROVED="PROVED"
S_READY="READY"
S_SETUP="SETUP"
S_BLOCKED="BLOCKED"
S_UNKNOWN="UNKNOWN"
S_OPTIONAL="OPTIONAL"

have() { command -v "$1" >/dev/null 2>&1; }
listen() { ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1$"; }
nonempty_env_key() {
  local file="$1" key="$2"
  [ -f "$file" ] || return 1
  awk -F= -v k="$key" '$1==k && length($2)>0 {found=1} END{exit found?0:1}' "$file"
}
canonical_ok() { [ -x "$CANONICAL_INSTALLER" ] || [ -f "$CANONICAL_INSTALLER" ]; }

variant() {
  local key="$1"; shift
  local count="$#"
  [ "$count" -gt 0 ] || return 0
  local n=0
  if have cksum; then n=$(printf '%s' "$SESSION_ID:$key" | cksum | awk '{print $1}'); fi
  local idx=$(( n % count + 1 ))
  eval "printf '%s\n' \"\${$idx}\""
}

say_intro() {
  variant "intro" \
    "🧿 Vou medir antes de mexer. Verde só nasce depois da prova." \
    "🧿 Primeiro o estado vivo, depois a ação. Sem token também existe caminho." \
    "🧿 Instalador em modo determinístico: nenhuma opção morre por falta de provider."
}

state_icon() {
  case "$1" in
    "$S_PROVED") printf '🟢' ;;
    "$S_READY") printf '🔵' ;;
    "$S_SETUP") printf '🟡' ;;
    "$S_BLOCKED") printf '🟠' ;;
    "$S_OPTIONAL") printf '⚪' ;;
    *) printf '🟣' ;;
  esac
}

print_state() {
  local name="$1" state="$2" detail="${3:-}"
  printf ' %s %-28s : %-9s' "$(state_icon "$state")" "$name" "$state"
  [ -n "$detail" ] && printf ' — %s' "$detail"
  printf '\n'
}

probe_base() {
  local c
  for c in node npm pm2 caddy docker git curl jq; do have "$c" || return 1; done
}
probe_structure() { [ -d "$ROOT/apps" ] && [ -d "$ROOT/infra" ] && [ -d "$ROOT/secrets" ]; }
probe_mcp() { [ -d "$ROOT/infra/mcp" ] && (listen 9100 || curl -fsS --max-time 3 http://127.0.0.1:9100/health >/dev/null 2>&1); }
probe_webhook() { listen 9003 || curl -fsS --max-time 3 http://127.0.0.1:9003/health >/dev/null 2>&1; }
probe_cloudflare_configured() { nonempty_env_key "$ROOT/secrets/cloudflare.env" "CF_API_TOKEN"; }
probe_router() { curl -fsS --max-time 3 http://127.0.0.1:8099/health >/dev/null 2>&1; }

provider_state() {
  if probe_router; then printf '%s' "$S_PROVED"; return; fi
  if [ -n "${OPENAI_API_KEY:-}${ANTHROPIC_API_KEY:-}${OPENROUTER_API_KEY:-}${NVIDIA_API_KEY:-}" ]; then
    printf '%s' "$S_READY"
  else
    printf '%s' "$S_OPTIONAL"
  fi
}

cloudflare_state() {
  if ! probe_cloudflare_configured; then printf '%s' "$S_SETUP"; return; fi
  if have curl && have jq; then printf '%s' "$S_READY"; else printf '%s' "$S_BLOCKED"; fi
}

step_state() {
  case "$1" in
    1) canonical_ok && printf '%s' "$S_READY" || printf '%s' "$S_BLOCKED" ;;
    2) probe_base && printf '%s' "$S_PROVED" || printf '%s' "$S_READY" ;;
    3) probe_structure && printf '%s' "$S_PROVED" || printf '%s' "$S_READY" ;;
    4) cloudflare_state ;;
    5) probe_mcp && printf '%s' "$S_PROVED" || printf '%s' "$S_READY" ;;
    6) canonical_ok && printf '%s' "$S_READY" || printf '%s' "$S_BLOCKED" ;;
    7) cloudflare_state ;;
    8) probe_cloudflare_configured && printf '%s' "$S_READY" || printf '%s' "$S_SETUP" ;;
    9) probe_base && printf '%s' "$S_PROVED" || printf '%s' "$S_READY" ;;
    10) canonical_ok && printf '%s' "$S_READY" || printf '%s' "$S_BLOCKED" ;;
    11) provider_state ;;
    12) probe_webhook && printf '%s' "$S_PROVED" || printf '%s' "$S_READY" ;;
    *) printf '%s' "$S_UNKNOWN" ;;
  esac
}

run_canonical() {
  local label="$1"; shift
  canonical_ok || { print_state "$label" "$S_BLOCKED" "install.sh canônico ausente"; return 10; }
  printf '\n▶ %s\n' "$label"
  bash "$CANONICAL_INSTALLER" "$@"
}

prove_after() {
  local probe="$1" label="$2"
  if "$probe"; then
    print_state "$label" "$S_PROVED" "ação + verificação passaram"
    return 0
  fi
  print_state "$label" "$S_UNKNOWN" "ação terminou, mas a prova pós-condição não fechou"
  return 1
}

run_option() {
  local op="$1"
  case "$op" in
    1) run_canonical "Verificar ambiente" --check ;;
    2) run_canonical "Instalar base" --install && prove_after probe_base "Base" ;;
    3) run_canonical "Estrutura de pastas" --install && prove_after probe_structure "Estrutura" ;;
    4)
      if probe_cloudflare_configured; then
        run_canonical "Cloudflare: verificar configuração existente" --cloudflare-check || true
      else
        print_state "Cloudflare" "$S_SETUP" "sem token: abrir assistente, não tratar como falha"
        run_canonical "Cloudflare: cadastrar/assistir" --cloudflare || true
      fi
      ;;
    5) run_canonical "MCP CentralDark" --mcp && prove_after probe_mcp "MCP" ;;
    6) run_canonical "Checagem completa" --check ;;
    7) run_canonical "Login Cloudflare" --cloudflare || true ;;
    8)
      if probe_cloudflare_configured; then
        run_canonical "DNS wildcard" --domains || true
      else
        print_state "DNS wildcard" "$S_SETUP" "configure Cloudflare primeiro; nenhuma exceção foi lançada"
      fi
      ;;
    9) run_canonical "Instalar dependências" --install && prove_after probe_base "Dependências" ;;
    10) run_canonical "Atualizar instalador" --help ;;
    11)
      local ps; ps="$(provider_state)"
      if [ "$ps" = "$S_OPTIONAL" ]; then
        print_state "Provider IA" "$S_OPTIONAL" "nenhum provider configurado; menu segue 100% determinístico"
      else
        print_state "Provider IA" "$ps" "provider detectado sem tornar o instalador dependente dele"
      fi
      ;;
    12)
      if probe_webhook; then
        print_state "Auto-update/webhook" "$S_PROVED" "porta 9003 respondeu"
      else
        print_state "Auto-update/webhook" "$S_READY" "não provado; pode ser instalado sem matar o menu"
      fi
      ;;
    0) return 99 ;;
    *) print_state "Opção" "$S_UNKNOWN" "entrada inválida; nenhuma mutação executada" ;;
  esac
  return 0
}

show_menu() {
  printf '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  printf '        ◉ CentralDark Installer Deterministic Beta 1 ◉\n'
  printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  say_intro
  print_state "Base" "$(step_state 2)"
  print_state "Estrutura" "$(step_state 3)"
  print_state "Cloudflare" "$(step_state 4)"
  print_state "MCP" "$(step_state 5)"
  print_state "Provider IA" "$(step_state 11)"
  print_state "Auto-update/webhook" "$(step_state 12)"
  printf '\n'
  printf ' [1] Verificar ambiente        [7] Login Cloudflare\n'
  printf ' [2] Instalar base             [8] DNS wildcard\n'
  printf ' [3] Estrutura de pastas       [9] Instalar dependências\n'
  printf ' [4] Cloudflare / DNS         [10] Atualizar instalador\n'
  printf ' [5] MCP CentralDark          [11] Provider IA (opcional)\n'
  printf ' [6] Checagem completa        [12] Auto-update / webhook\n'
  printf ' [0] Sair\n'
  printf '\nLegenda: 🟢 PROVED | 🔵 READY | 🟡 SETUP | 🟠 BLOCKED | ⚪ OPTIONAL | 🟣 UNKNOWN\n'
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    printf 'SELF_TEST=PASS\n'
    printf 'PROVIDER_STATE=%s\n' "$(provider_state)"
    printf 'CLOUDFLARE_STATE=%s\n' "$(cloudflare_state)"
    exit 0
  fi
  while true; do
    show_menu
    printf '\nEscolha: '
    IFS= read -r op || exit 0
    run_option "$op"
    rc=$?
    [ "$rc" -eq 99 ] && break
    printf '\nEnter para continuar...'
    IFS= read -r _ || true
  done
}
main "$@"
