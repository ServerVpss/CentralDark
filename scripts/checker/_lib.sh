#!/usr/bin/env bash
# ============================================================================
# Lib comum do checker — funções compartilhadas pelos módulos 01..12
# ============================================================================
# Cada módulo é executado pelo run-all.sh e deve printar linhas no formato:
#   STATUS|BLOCO|MENSAGEM
# Onde STATUS é OK, ALERTA ou ERRO. O run-all.sh agrega tudo.
# ============================================================================

set -uo pipefail

# Cores (só se for terminal)
if [ -t 1 ]; then
  CK_OK='\033[0;32m'; CK_WARN='\033[0;33m'; CK_ERR='\033[0;31m'
  CK_INFO='\033[0;36m'; CK_RST='\033[0m'
else
  CK_OK=''; CK_WARN=''; CK_ERR=''; CK_INFO=''; CK_RST=''
fi

# Cada módulo chama esses helpers
emit_ok()     { printf "OK|%s|%s\n"     "$1" "$2"; }
emit_alerta() { printf "ALERTA|%s|%s\n" "$1" "$2"; }
emit_erro()   { printf "ERRO|%s|%s\n"   "$1" "$2"; }

# Sanitiza qualquer log antes de incluir no relatório
sanitize_log() {
  sed -E 's/(token|password|authorization|apikey|api_key|secret|bearer|client_secret|BOT_TOKEN|SUPABASE[^=]*=)[=: ]+[A-Za-z0-9._\/+-]+/\1=***OCULTO***/Ig'
}

# Verifica se um comando existe sem quebrar o set -e do chamador
has_cmd() { command -v "$1" >/dev/null 2>&1; }

# Roda comando e retorna saída (best-effort, não quebra em erro)
safe_run() { "$@" 2>&1 || true; }

# Fronteira canônica da VPS. A raiz é fixa: override externo não muda autoridade.
# Caminho candidato é resolvido antes da comparação para bloquear ../ e symlink escape.
CK_CANONICAL_ROOT='/root/CentralDark'
CK_REQUESTED_REPO_ROOT="${CK_REPO_ROOT:-$CK_CANONICAL_ROOT}"
export CK_CENTRALDARK_ROOT="$CK_CANONICAL_ROOT"
export CK_REPO_ROOT="$CK_CANONICAL_ROOT"
export CK_EXTERNAL_ROOT_POLICY="OUT_OF_SCOPE"

canonicalize_path() {
  realpath -m -- "${1:-}" 2>/dev/null
}

is_canonical_path() {
  local requested_root resolved_root resolved_path
  requested_root="$(canonicalize_path "$CK_REQUESTED_REPO_ROOT")" || return 1
  resolved_root="$(canonicalize_path "$CK_CANONICAL_ROOT")" || return 1
  resolved_path="$(canonicalize_path "${1:-}")" || return 1

  [ "$requested_root" = "$resolved_root" ] || return 1

  case "$resolved_path" in
    "$resolved_root"|"$resolved_root"/*) return 0 ;;
    *) return 1 ;;
  esac
}

require_canonical_path() {
  local bloco="$1"
  local path="$2"
  if is_canonical_path "$path"; then
    return 0
  fi
  emit_erro "$bloco" "Caminho fora da fronteira CentralDark bloqueado: $path"
  return 1
}
