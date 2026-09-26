# COMANDO - install.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\install.sh
**SHA:** 8ffb09d82732f1bf
**Timestamp:** 2026-08-26T19:30:40.297838
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- # teclado — `read` retorna na hora e o menu sai sozinho. Solução padrão:
- # 4) Locais padrão: CentralDark é a casa oficial. Repo fica clonado

### Gaps
- local missing=()

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Instalador Automático
# ----------------------------------------------------------------------------
#  Uso:
#    ./install.sh                       # abre wizard interativo
#    ./install.sh --check               # só verifica ambiente
#    ./install.sh --install             # instalação completa base
#    ./install.sh --cloudflare          # Cloudflare Connect Wizard
#    ./install.sh --cloudflare-check    # valida token + lista registros
#    ./install.sh --cloudflare-apply    # aplica DNS direto (não interativo)
#    ./install.sh --dns-check           # checker DNS+Caddy+HTTPS (read-only)
#    ./install.sh --domains             # --cloudflare + --dns-check
#    ./install.sh --mcp                 # prepara estrutura MCP
#    ./install.sh --restore             # restauração futura
#    ./install.sh --help
#
#  Regra de ouro: idempotente, seguro, nunca sobrescreve produção sem
#  confirmação, nunca expõe secrets em log.
# ============================================================================

set -euo pipefail

# Garante TERM válido + cor forçada (autostart no .bashrc roda antes do TERM ser setado direito)
if [ -z "${TERM:-}" ] || [ "${TERM:-}" = "dumb" ]; then
  export TERM=xterm-256color
fi
export CD_FORCE_COLOR="${CD_FORCE_COLOR:-1}"

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_URL="https://github.com/segredounlock/clone-deck.git"
readonly CENTRALDARK_ROOT="/root/CentralDark"
readonly CENTRALDARK_APPS="${CENTRALDARK_ROOT}/apps"
readonly MULTIZAP_DIR="${CENTRALDARK_APPS}/modulos/multizap"
readonly MCP_DIR="${CENTRALDARK_ROOT}/infra/mcp"
SECRETS_DIR="${CENTRALDARK_ROOT}/secrets"; export SECRETS_DIR
readonly LOGS_DIR="${CENTRALDARK_ROOT}/logs"
readonly REVISOES_DIR="${CENTRALDARK_ROOT}/revisoes"
readonly BACKUPS_DIR="${CENTRALDARK_ROOT}/backups"
readonly QUARANTINE_DIR="${CENTRALDARK_ROOT}/quarantine"
readonly LOG_DIR="${REVISOES_DIR}/$(date +%Y%m%d-%H%M%S)/instalador"
readonly NODE_MIN_MAJOR=20
readonly REQUIRED_PORTS_INTERNAL=(3100 9000 9100)
readonly REQUIRED_PORTS_EXTERNAL=(80 443)
readonly PROTECTED_HINTS=("Recargas Brasil" "WuzAPI" "whatsapp-server" "sessões WhatsApp")

if [ "${CD_FORCE_COLOR:-1}" = "1" ] || [ -t 1 ]; then
  C_OK='\033[0;32m'; C_WARN='\033[0;33m'; C_ERR='\033[0;31m'; C_INFO='\033[0;36m'; C_TITLE='\033[1;35m'; C_RST='\033[0m'
  AIO_RED_BG='\033[41m'; AIO_WHITE='\033[1;37m'; AIO_CYAN='\033[1;36m'
  AIO_GREEN='\033[1;32m'; AIO_RED='\033[1;31m'; AIO_BOLD='\033[1m'
  AIO_YEL_BG='\033[103m'; AIO_BLACK='\033[30m'; AIO_YELLOW='\033[1;33m'
  AIO_BLINK='\033[5m'; AIO_GREEN_BG='\033[42m'
else
  C_OK=''; C_WARN=''; C_ERR=''; C_INFO=''; C_TITLE=''; C_RST=''
  AIO_RED_BG=''; AIO_WHITE=''; AIO_CYAN=''; AIO_GREEN=''; AIO_RED=''; AIO_BOLD=''
  AIO_YEL_BG=''; AIO_BLACK=''; AIO_YELLOW=''; AIO_BLINK=''; AIO_GREEN_BG=''
fi

log()  { printf "${C_INFO}[info]${C_RST}  %s\n" "$*"; }
ok()   { printf "${C_OK}[ ok ]${C_RST}  %s\n" "$*"; }
warn() { printf "${C_WARN}[warn]${C_RST}  %s\n" "$*"; }
err()  { printf "${C_ERR}[err ]${C_RST}  %s\n" "$*" >&2; }
title(){ printf "\n${C_TITLE}%s${C_RST}\n" "$*"; }

# ============================================================================
#  UI estilo AutoScriptVPN-AIO (inspirado em github.com/praiman99/AutoScriptVPN-AIO)
#  Barras vermelhas com texto branco centralizado, separadores ciano,
#  status list com bullets verdes, menu em 2 colunas.
# ============================================================================
# Largura adapta ao terminal (mín 40, máx 78) pra não quebrar linha em telas pequenas.
_aio_detect_width() {
  local cols=""
  if [ -t 1 ]; then
    cols="$(tput cols 2>/dev/null || echo "")"
    [ -z "$cols" ] && cols="${COLUMNS:-}"
  fi
  [ -z "$cols" ] && cols=64
  [ "$cols" -lt 40 ] && cols=40
  [ "$cols" -gt 78 ] && cols=78
  AIO_WIDTH="$cols"
  # Barra de progresso também adapta (deixa espaço pro label e %).
  PROGRESS_WIDTH=$(( AIO_WIDTH - 24 ))
  [ "$PROGRESS_WIDTH" -lt 16 ] && PROGRESS_WIDTH=16
  return 0
}
_aio_detect_width
# Re-detecta quando o terminal for redimensionado.
trap _aio_detect_width WINCH 2>/dev/null || true

aio_repeat() { local n="$1" s="${2:-━}" out=""; while [ "$n" -gt 0 ]; do out+="$s"; n=$((n-1)); done; printf "%s" "$out"; }
aio_sep()    { printf "${AIO_CYAN}%s${C_RST}\n" "$(aio_repeat "$AIO_WIDTH")"; }

aio_bar_red() {
  local text="◉ $1 ◉"
  local len=${#text}
  local pad=$(( (AIO_WIDTH - len) / 2 )); [ "$pad" -lt 0 ] && pad=0
  local left right
  left="$(printf '%*s' "$pad" '')"
  right="$(printf '%*s' "$((AIO_WIDTH - pad - len))" '')"
  printf "${AIO_RED_BG}${AIO_WHITE}%s%s%s${C_RST}\n" "$left" "$text" "$right"
}

aio_tagline() {
  local a="${1:-SCRIPT}" b="${2:-FOR}" c="${3:-BEGINNER}"
  # Junta as 3 palavras com espaço duplo e centraliza o bloco inteiro,
  # pra não jogar nada na ponta da tela.
  local text="$a  $b  $c"
  local len=${#text}
  [ "$len" -gt "$AIO
```