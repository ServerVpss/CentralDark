#!/usr/bin/env bash
# CentralDark / MultiZap - Tema Netflix Centralizado.
#
# Fonte oficial para scripts de VPS e rotinas operacionais.
# Uso:
#   # shellcheck source=scripts/lib/theme.sh
#   source "/root/CentralDark/scripts/lib/theme.sh"
#   netflix_header "Minha tarefa"
#
# Para carregar no terminal do root, adicionar ao /root/.bashrc:
#   [ -f /root/CentralDark/scripts/lib/theme.sh ] && source /root/CentralDark/scripts/lib/theme.sh

if [ -z "${TERM:-}" ] || [ "${TERM:-}" = "dumb" ]; then
  export TERM=xterm-256color
fi

_netflix_use_color() {
  [ "${NO_COLOR:-}" = "1" ] && return 1
  [ "${CD_FORCE_COLOR:-0}" = "1" ] && return 0
  [ -t 1 ]
}

if _netflix_use_color; then
  NETFLIX_NC=$'\033[0m'
  NETFLIX_BOLD=$'\033[1m'
  NETFLIX_DIM=$'\033[2m'
  NETFLIX_RED=$'\033[38;2;229;9;20m'
  NETFLIX_GREEN=$'\033[38;2;0;210;106m'
  NETFLIX_YELLOW=$'\033[38;2;255;193;7m'
  NETFLIX_BLUE=$'\033[38;2;67;160;255m'
  NETFLIX_CYAN=$'\033[38;2;0;229;255m'
  NETFLIX_PURPLE=$'\033[38;2;178;102;255m'
  NETFLIX_GRAY=$'\033[38;2;148;163;184m'
  NETFLIX_WHITE=$'\033[38;2;245;245;245m'
else
  NETFLIX_NC=''
  NETFLIX_BOLD=''
  NETFLIX_DIM=''
  NETFLIX_RED=''
  NETFLIX_GREEN=''
  NETFLIX_YELLOW=''
  NETFLIX_BLUE=''
  NETFLIX_CYAN=''
  NETFLIX_PURPLE=''
  NETFLIX_GRAY=''
  NETFLIX_WHITE=''
fi

netflix_line() {
  printf '%s%s%s\n' "$NETFLIX_RED" "============================================================" "$NETFLIX_NC"
}

netflix_header() {
  local title="${1:-CentralDark / MultiZap}"
  clear || true
  netflix_line
  printf '%s%s%s%s\n' "$NETFLIX_RED" "$NETFLIX_BOLD" "  $title" "$NETFLIX_NC"
  printf '%s%s%s\n' "$NETFLIX_GRAY" "  Tema Netflix Centralizado" "$NETFLIX_NC"
  netflix_line
}

netflix_step() {
  local current="${1:-?}"
  local total="${2:-?}"
  local message="${3:-Executando etapa}"
  printf '%s[%s/%s]%s %s%s%s\n' \
    "$NETFLIX_BLUE" "$current" "$total" "$NETFLIX_NC" \
    "$NETFLIX_WHITE" "$message" "$NETFLIX_NC"
}

netflix_success() {
  printf '%sOK%s %s\n' "$NETFLIX_GREEN" "$NETFLIX_NC" "${1:-Concluido}"
}

netflix_info() {
  printf '%sINFO%s %s\n' "$NETFLIX_CYAN" "$NETFLIX_NC" "${1:-Informacao}"
}

netflix_warning() {
  printf '%sAVISO%s %s\n' "$NETFLIX_YELLOW" "$NETFLIX_NC" "${1:-Atencao}"
}

netflix_error() {
  printf '%sERRO%s %s\n' "$NETFLIX_RED" "$NETFLIX_NC" "${1:-Falha}"
}

netflix_done() {
  netflix_line
  printf '%s%sCONCLUIDO%s\n' "$NETFLIX_GREEN" "$NETFLIX_BOLD" "$NETFLIX_NC"
}

netflix_confirm() {
  local prompt="${1:-Digite SIM para confirmar}"
  local answer
  printf '%s%s%s ' "$NETFLIX_YELLOW" "$prompt" "$NETFLIX_NC"
  read -r answer
  [ "$answer" = "SIM" ]
}

netflix_progress_bar() {
  local current="${1:-0}"
  local total="${2:-100}"
  local width="${3:-24}"
  local filled=0
  local empty=0

  if [ "$total" -gt 0 ] 2>/dev/null; then
    filled=$(( current * width / total ))
  fi
  [ "$filled" -lt 0 ] && filled=0
  [ "$filled" -gt "$width" ] && filled="$width"
  empty=$(( width - filled ))

  printf '%s[' "$NETFLIX_GRAY"
  printf '%*s' "$filled" '' | tr ' ' '#'
  printf '%s' "$NETFLIX_DIM"
  printf '%*s' "$empty" '' | tr ' ' '-'
  printf '%s] %s/%s%s\n' "$NETFLIX_GRAY" "$current" "$total" "$NETFLIX_NC"
}

netflix_loading() {
  local message="${1:-Processando}"
  local seconds="${2:-1}"
  printf '%s%s%s' "$NETFLIX_PURPLE" "$message" "$NETFLIX_NC"
  while [ "$seconds" -gt 0 ] 2>/dev/null; do
    printf '%s.%s' "$NETFLIX_PURPLE" "$NETFLIX_NC"
    sleep 1
    seconds=$((seconds - 1))
  done
  printf '\n'
}
