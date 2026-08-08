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

# Fronteira canônica da VPS. Tudo fora de /root/CentralDark é OUT_OF_SCOPE
# por padrão e não pode ser usado como fonte de verdade, runtime permanente ou
# fallback silencioso. Dependência externa real precisa ser transplantada para
# dentro da CentralDark por uma mudança separada e comprovada.
export CK_CENTRALDARK_ROOT="${CK_CENTRALDARK_ROOT:-/root/CentralDark}"
export CK_REPO_ROOT="${CK_REPO_ROOT:-$CK_CENTRALDARK_ROOT}"
export CK_EXTERNAL_ROOT_POLICY="OUT_OF_SCOPE"

is_canonical_path() {
  case "${1:-}" in
    "$CK_CENTRALDARK_ROOT"|"$CK_CENTRALDARK_ROOT"/*) return 0 ;;
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
