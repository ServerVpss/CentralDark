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
  [ "$len" -gt "$AIO_WIDTH" ] && { text="${text:0:$AIO_WIDTH}"; len=$AIO_WIDTH; }
  local pad=$(( (AIO_WIDTH - len) / 2 )); [ "$pad" -lt 0 ] && pad=0
  printf "${AIO_BOLD}%*s%s${C_RST}\n" "$pad" "" "$text"
}

aio_kv() {
  local label="$1" value="$2"
  printf "${AIO_WHITE}%-22s${C_RST} ${AIO_GREEN}%s${C_RST}\n" "$label" "$value"
}

aio_status() {
  # aio_status NOME ESTADO [motivo curto]
  local name="$1" state="${2:-Running}" motivo="${3:-}"
  if [ "$state" = "Running" ]; then
    printf " ${AIO_GREEN}●${C_RST} ${AIO_WHITE}%-24s${C_RST}: ${AIO_GREEN}%s${C_RST}\n" "$name" "Ativo"
  else
    # Vermelho piscante + breve motivo entre parênteses
    local extra=""
    [ -n "$motivo" ] && extra="  ${AIO_YELLOW}— ${motivo}${C_RST}"
    printf " ${AIO_RED}${AIO_BLINK}●${C_RST} ${AIO_WHITE}%-24s${C_RST}: ${AIO_RED}${AIO_BOLD}%s${C_RST}%b\n" \
      "$name" "PARADO" "$extra"
  fi
}

# Painel de alertas inteligente: registra cada problema com motivo + como resolver.
declare -A AIO_ALERTAS_MOTIVO  AIO_ALERTAS_COMO  AIO_ALERTAS_OPC
AIO_ORDEM_ALERTAS=()

aio_check() {
  # aio_check NOME "comando_de_teste" "motivo curto" "como resolver" "opção do menu"
  local name="$1" check="$2" motivo="$3" como="$4" opc="$5"
  if eval "$check" >/dev/null 2>&1; then
    aio_status "$name" "Running"
  else
    aio_status "$name" "Stopped" "$motivo"
    AIO_ALERTAS_MOTIVO["$name"]="$motivo"
    AIO_ALERTAS_COMO["$name"]="$como"
    AIO_ALERTAS_OPC["$name"]="$opc"
    AIO_ORDEM_ALERTAS+=("$name")
  fi
}

aio_painel_alertas() {
  local n=${#AIO_ORDEM_ALERTAS[@]}
  if [ "$n" -eq 0 ]; then
    # Tudo ok — faixa verde curta e bonita
    local msg="  ✓  TUDO CERTO — NENHUM PROBLEMA DETECTADO  "
    local pad=$(( (AIO_WIDTH - ${#msg}) / 2 )); [ "$pad" -lt 0 ] && pad=0
    printf "${AIO_GREEN_BG}${AIO_BOLD}%*s%s%*s${C_RST}\n" \
      "$pad" "" "$msg" "$((AIO_WIDTH - pad - ${#msg}))" ""
    return
  fi
  # Faixa amarela piscando com contagem de alertas
  local cabec="  ⚠  ATENÇÃO — ${n} PROBLEMA(S) NA SUA VPS  ⚠  "
  local pad=$(( (AIO_WIDTH - ${#cabec}) / 2 )); [ "$pad" -lt 0 ] && pad=0
  printf "${AIO_YEL_BG}${AIO_BLACK}${AIO_BOLD}${AIO_BLINK}%*s%s%*s${C_RST}\n" \
    "$pad" "" "$cabec" "$((AIO_WIDTH - pad - ${#cabec}))" ""
  echo
  local i=1
  for nome in "${AIO_ORDEM_ALERTAS[@]}"; do
    printf "  ${AIO_YEL_BG}${AIO_BLACK}${AIO_BOLD} %d ${C_RST}  ${AIO_RED}${AIO_BOLD}%s${C_RST}\n" \
      "$i" "$nome"
    printf "       ${AIO_WHITE}Por quê:${C_RST}   %s\n" "${AIO_ALERTAS_MOTIVO[$nome]}"
    printf "       ${AIO_GREEN}Resolver:${C_RST}  %s\n" "${AIO_ALERTAS_COMO[$nome]}"
    printf "       ${AIO_CYAN}Atalho:${C_RST}    Escolha a opção ${AIO_BOLD}[ %s ]${C_RST} no menu abaixo\n" \
      "${AIO_ALERTAS_OPC[$nome]}"
    echo
    i=$((i+1))
  done
}

aio_menu_row() {
  local n1="$1" l1="$2" n2="${3:-}" l2="${4:-}"
  local half=$(( AIO_WIDTH / 2 ))
  local left_plain="[ $n1 ] • $l1"
  local pad=$(( half - ${#left_plain} )); [ "$pad" -lt 2 ] && pad=2
  printf "  ${AIO_WHITE}[ %s ]${C_RST} ${AIO_GREEN}•${C_RST} ${AIO_WHITE}%s${C_RST}" "$n1" "$l1"
  if [ -n "$n2" ]; then
    printf "%*s${AIO_WHITE}[ %s ]${C_RST} ${AIO_GREEN}•${C_RST} ${AIO_WHITE}%s${C_RST}" "$pad" "" "$n2" "$l2"
  fi
  printf "\n"
}

aio_prompt() { printf "${AIO_GREEN}%s${C_RST} " "$*"; }

# ============================================================================
#  Barra de progresso verde bonita.
#    progress_run "Label" cmd args...   -> roda comando com barra animada
#    progress_step  N TOTAL "Label"     -> barra determinística passo a passo
#    progress_done  "Label"             -> finaliza com barra 100% verde
# ============================================================================
PROGRESS_WIDTH=40

_progress_render() {
  # $1 = percent (0-100), $2 = label
  local pct="$1" label="$2"
  [ "$pct" -lt 0 ] && pct=0; [ "$pct" -gt 100 ] && pct=100
  local filled=$(( pct * PROGRESS_WIDTH / 100 ))
  local empty=$(( PROGRESS_WIDTH - filled ))
  local bar_f bar_e
  bar_f="$(aio_repeat "$filled" "█")"
  bar_e="$(aio_repeat "$empty" "░")"
  printf "\r${AIO_GREEN}▶${C_RST} %-28s ${AIO_GREEN}%s${C_RST}${C_INFO}%s${C_RST} ${AIO_GREEN}%3d%%${C_RST}" \
    "$label" "$bar_f" "$bar_e" "$pct"
}

progress_step() {
  local n="$1" total="$2" label="${3:-Processando}"
  local pct=$(( n * 100 / total ))
  _progress_render "$pct" "$label"
  [ "$n" -ge "$total" ] && printf "\n"
}

progress_done() {
  _progress_render 100 "${1:-Concluído}"
  printf "  ${C_OK}✓${C_RST}\n"
}

progress_fail() {
  _progress_render 100 "${1:-Falhou}"
  printf "  ${C_ERR}✗${C_RST}\n"
}

# Roda um comando em background mostrando barra "indeterminada" que vai
# crescendo até 95% e completa em 100% quando o comando termina.
progress_run() {
  local label="$1"; shift
  if [ ! -t 1 ]; then
    "$@"
    return $?
  fi
  local logf; logf="$(mktemp /tmp/cd-progress.XXXXXX.log)"
  ( "$@" >"$logf" 2>&1 ) &
  local pid=$!
  local pct=0
  while kill -0 "$pid" 2>/dev/null; do
    pct=$(( pct + 3 ))
    [ "$pct" -gt 95 ] && pct=95
    _progress_render "$pct" "$label"
    sleep 0.18
  done
  wait "$pid"
  local rc=$?
  if [ "$rc" -eq 0 ]; then
    progress_done "$label"
  else
    progress_fail "$label"
    sed -n '1,20p' "$logf" | sed 's/^/    /'
  fi
  rm -f "$logf"
  return $rc
}

sanitize() {
  sed -E 's/(token|password|authorization|apikey|api_key|secret|bearer|key|client_secret)[=: ]+[A-Za-z0-9._\/+-]+/\1=***OCULTO***/Ig'
}

require_cmd() { command -v "$1" >/dev/null 2>&1; }

# ----------------------------------------------------------------------------
#  ensure_deps — instala automaticamente o que o instalador precisa pra rodar.
#  Idempotente: só instala o que falta. Cobre Debian/Ubuntu, RHEL/Alma/Rocky,
#  Alpine e macOS (Homebrew). Não falha o instalador se uma dep opcional não
#  estiver disponível na distro — só avisa.
# ----------------------------------------------------------------------------
# Mapa: comando -> pacote (apt). Para outros gerenciadores usamos o mesmo nome
# quando bate; ajustes específicos ficam dentro do case.
INSTALL_DEPS_REQUIRED=(curl jq git ca-certificates openssl qrencode dnsutils iproute2 coreutils gawk sed grep tar gzip)
INSTALL_DEPS_OPTIONAL=(unzip rsync netcat-openbsd)

ensure_deps() {
  local missing=()
  # mapeia comando real → nome do pacote
  declare -A CMD_TO_PKG=(
    [curl]=curl [jq]=jq [git]=git [openssl]=openssl [qrencode]=qrencode
    [dig]=dnsutils [ss]=iproute2 [awk]=gawk [sed]=sed [grep]=grep
    [tar]=tar [gzip]=gzip [date]=coreutils [unzip]=unzip [rsync]=rsync
    [nc]=netcat-openbsd
  )
  local checks=(curl jq git openssl qrencode dig ss awk sed grep tar gzip date)
  for c in "${checks[@]}"; do
    require_cmd "$c" || missing+=("${CMD_TO_PKG[$c]:-$c}")
  done

  if [ ${#missing[@]} -eq 0 ]; then
    ok "Dependências básicas: OK (curl jq git qrencode dig ss openssl ...)"
    return 0
  fi

  # dedup
  local uniq=()
  declare -A seen
  for p in "${missing[@]}"; do [ -z "${seen[$p]:-}" ] && uniq+=("$p") && seen[$p]=1; done
  warn "Instalando dependências faltando: ${uniq[*]}"

  if [ "$(id -u)" != "0" ] && ! require_cmd sudo; then
    err "Sem root e sem sudo — não consigo instalar: ${uniq[*]}"
    return 1
  fi
  local SUDO=""
  [ "$(id -u)" != "0" ] && SUDO="sudo"

  if require_cmd apt-get; then
    progress_run "Atualizando índice apt" bash -c "DEBIAN_FRONTEND=noninteractive $SUDO apt-get update -y -qq" || true
    progress_run "Instalando ${#uniq[@]} pacote(s)" bash -c "DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y --no-install-recommends ${uniq[*]}" \
      || $SUDO apt-get install -y --no-install-recommends "${uniq[@]}" || true
  elif require_cmd dnf; then
    # dnsutils no RHEL = bind-utils; iproute2 = iproute
    local rpm_pkgs=()
    for p in "${uniq[@]}"; do
      case "$p" in
        dnsutils) rpm_pkgs+=(bind-utils) ;;
        iproute2) rpm_pkgs+=(iproute) ;;
        netcat-openbsd) rpm_pkgs+=(nmap-ncat) ;;
        *) rpm_pkgs+=("$p") ;;
      esac
    done
    $SUDO dnf install -y "${rpm_pkgs[@]}" || true
  elif require_cmd yum; then
    local rpm_pkgs=()
    for p in "${uniq[@]}"; do
      case "$p" in
        dnsutils) rpm_pkgs+=(bind-utils) ;;
        iproute2) rpm_pkgs+=(iproute) ;;
        netcat-openbsd) rpm_pkgs+=(nmap-ncat) ;;
        *) rpm_pkgs+=("$p") ;;
      esac
    done
    $SUDO yum install -y "${rpm_pkgs[@]}" || true
  elif require_cmd apk; then
    local apk_pkgs=()
    for p in "${uniq[@]}"; do
      case "$p" in
        dnsutils) apk_pkgs+=(bind-tools) ;;
        iproute2) apk_pkgs+=(iproute2) ;;
        netcat-openbsd) apk_pkgs+=(netcat-openbsd) ;;
        gawk) apk_pkgs+=(gawk) ;;
        ca-certificates) apk_pkgs+=(ca-certificates) ;;
        *) apk_pkgs+=("$p") ;;
      esac
    done
    $SUDO apk add --no-cache "${apk_pkgs[@]}" || true
  elif require_cmd brew; then
    brew install "${uniq[@]}" || true
  else
    err "Gerenciador de pacotes não reconhecido. Instale manualmente: ${uniq[*]}"
    return 1
  fi

  # Recheca o que realmente entrou
  local still=()
  for c in "${checks[@]}"; do
    require_cmd "$c" || still+=("$c")
  done
  if [ ${#still[@]} -eq 0 ]; then
    ok "Todas as dependências instaladas."
  else
    warn "Ainda faltando após instalação: ${still[*]} (algumas podem ser opcionais)"
  fi
}

print_paths() {
  cat <<EOF
CentralDark paths:
  ROOT:        ${CENTRALDARK_ROOT}
  APPS:        ${CENTRALDARK_APPS}
  MULTIZAP:    ${MULTIZAP_DIR}
  MCP:         ${MCP_DIR}
  SECRETS:     ${SECRETS_DIR}
  LOGS:        ${LOGS_DIR}
  REVISOES:    ${REVISOES_DIR}
EOF
}

verify_environment() {
  title "===== Verificação do ambiente ====="
  local fails=0

  if [ -f /etc/os-release ]; then
    . /etc/os-release
    ok "SO: ${PRETTY_NAME:-desconhecido}"
    case "${ID:-}" in
      debian|ubuntu) ok "SO suportado" ;;
      *) warn "SO não testado oficialmente: ${ID:-desconhecido}" ;;
    esac
  else
    err "/etc/os-release não encontrado"
    fails=$((fails+1))
  fi

  if [ "$(id -u)" -eq 0 ]; then
    ok "Rodando como root"
  elif require_cmd sudo && sudo -n true 2>/dev/null; then
    ok "Usuário tem sudo sem senha"
  else
    err "Precisa rodar como root ou ter sudo sem senha"
    fails=$((fails+1))
  fi

  local public_ip
  public_ip="$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true)"
  [ -n "$public_ip" ] && ok "IP público detectado: ${public_ip}" || warn "Não consegui detectar IP público automaticamente"

  for c in git curl jq ss awk sed grep mkdir date; do
    require_cmd "$c" && ok "Comando disponível: $c" || warn "Comando AUSENTE: $c"
  done

  if require_cmd node; then
    local node_major
    node_major="$(node -v | sed 's/v//; s/\..*//')"
    if [ "${node_major:-0}" -ge "$NODE_MIN_MAJOR" ]; then
      ok "Node.js $(node -v) (>= v${NODE_MIN_MAJOR})"
    else
      warn "Node.js $(node -v) abaixo do mínimo v${NODE_MIN_MAJOR}"
    fi
  else
    warn "Node.js ausente"
  fi

  require_cmd npm  && ok "npm: $(npm -v)"               || warn "npm ausente"
  require_cmd pm2  && ok "PM2: $(pm2 -v)"               || warn "PM2 ausente"
  require_cmd caddy && ok "Caddy: $(caddy version | head -1)" || warn "Caddy ausente"
  require_cmd docker && ok "Docker presente"            || warn "Docker ausente"

  for p in "${REQUIRED_PORTS_EXTERNAL[@]}" "${REQUIRED_PORTS_INTERNAL[@]}"; do
    if ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${p}$"; then
      ok "Porta ${p}: em uso"
    else
      log "Porta ${p}: livre"
    fi
  done

  print_paths

  if [ -d "$CENTRALDARK_ROOT" ]; then
    ok "CentralDark detectado: ${CENTRALDARK_ROOT}"
  else
    warn "CentralDark ainda não existe: ${CENTRALDARK_ROOT}"
  fi

  if ss -ltnp 2>/dev/null | grep -qiE '(:3000|:8081|whatsapp|wuzapi)'; then
    warn "Serviço WhatsApp/WuzAPI pode estar ativo. Não será alterado por este instalador sem confirmação específica."
  fi

  [ "$fails" -eq 0 ] && ok "Verificação concluída" || err "Verificação encontrou ${fails} erro(s) fatal(is)"
  return "$fails"
}

prepare_structure() {
  title "===== Criando estrutura CentralDark ====="
  local dirs=(
    "$CENTRALDARK_ROOT"
    "$CENTRALDARK_APPS"
    "$CENTRALDARK_APPS/web"
    "$CENTRALDARK_APPS/portal"
    "$CENTRALDARK_APPS/modulos"
    "$MULTIZAP_DIR"
    "$CENTRALDARK_APPS/modulos/telepainel"
    "$CENTRALDARK_APPS/modulos/financeiro"
    "$CENTRALDARK_ROOT/infra"
    "$CENTRALDARK_ROOT/infra/caddy"
    "$CENTRALDARK_ROOT/infra/docker"
    "$CENTRALDARK_ROOT/infra/pm2"
    "$CENTRALDARK_ROOT/infra/cloudflare"
    "$MCP_DIR"
    "$CENTRALDARK_ROOT/scripts"
    "$CENTRALDARK_ROOT/scripts/installer"
    "$CENTRALDARK_ROOT/scripts/deploy"
    "$CENTRALDARK_ROOT/scripts/run-once"
    "$CENTRALDARK_ROOT/docs"
    "$CENTRALDARK_ROOT/security"
    "$SECRETS_DIR"
    "$LOGS_DIR"
    "$LOGS_DIR/mcp"
    "$REVISOES_DIR"
    "$BACKUPS_DIR"
    "$QUARANTINE_DIR"
  )

  for d in "${dirs[@]}"; do
    mkdir -p "$d"
    ok "ok: $d"
  done

  chmod 700 "$SECRETS_DIR" 2>/dev/null || true
  ok "Permissão segura aplicada em ${SECRETS_DIR}"
}

CF_SYNC_SCRIPT="${SCRIPT_DIR}/scripts/cloudflare/cf-sync.sh"
CF_ENV_FILE="${SECRETS_DIR}/cloudflare.env"

ensure_cf_env_file() {
  mkdir -p "$SECRETS_DIR"
  chmod 700 "$SECRETS_DIR" 2>/dev/null || true
  if [ ! -f "$CF_ENV_FILE" ]; then
    cat > "$CF_ENV_FILE" <<'EOF'
# Cloudflare API — gerenciado pelo install.sh
CF_API_TOKEN=
CF_ZONE_NAME=centralldark.com
CF_TARGET_IP=
CF_SUBDOMAINS="@ www app api bot crm mcp gateway webhook status"
CF_PROXIED=true
EOF
  fi
  chmod 600 "$CF_ENV_FILE" 2>/dev/null || true
}

cf_env_get() { grep -E "^$1=" "$CF_ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | sed 's/^"//; s/"$//'; }

cf_env_set() {
  local key="$1" val="$2"
  local tmp="${CF_ENV_FILE}.tmp"
  if grep -qE "^${key}=" "$CF_ENV_FILE"; then
    awk -v k="$key" -v v="$val" -F= 'BEGIN{OFS="="} $1==k{print k"="v; next} {print}' "$CF_ENV_FILE" > "$tmp"
  else
    cp "$CF_ENV_FILE" "$tmp" && echo "${key}=${val}" >> "$tmp"
  fi
  mv "$tmp" "$CF_ENV_FILE"
  chmod 600 "$CF_ENV_FILE"
}

detect_public_ip() { curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true; }

prompt_cf_wizard() {
  ensure_cf_env_file
  local current_token current_zone current_ip detected_ip ans
  current_token="$(cf_env_get CF_API_TOKEN)"
  current_zone="$(cf_env_get CF_ZONE_NAME)"
  current_ip="$(cf_env_get CF_TARGET_IP)"
  detected_ip="$(detect_public_ip)"

  title "===== Wizard Cloudflare ====="
  cat <<EOF
Vou te guiar passo a passo. Tudo fica salvo em ${CF_ENV_FILE} (perm 0600).

Como pegar o token (1 minuto):
  1) Abre: https://dash.cloudflare.com/profile/api-tokens
  2) Create Token -> template "Edit zone DNS" (ou um token com Zone:Read + DNS:Edit)
  3) Em Zone Resources escolhe sua zona (ex: centralldark.com)
  4) Continue -> Create Token -> COPIA o token (CF só mostra uma vez)

EOF

  # Token
  if [ -n "$current_token" ]; then
    printf "Já tem token salvo (****%s). Trocar? (s/N): " "${current_token: -4}"
    read -r ans
    if [ "${ans,,}" = "s" ]; then current_token=""; fi
  fi
  while [ -z "$current_token" ]; do
    printf "Cola o token Cloudflare aqui (não fica em log): "
    stty -echo 2>/dev/null; read -r current_token; stty echo 2>/dev/null; echo
    [ -z "$current_token" ] && warn "Token vazio, tenta de novo." && continue
    cf_env_set CF_API_TOKEN "$current_token"
  done

  # Zona
  printf "Domínio principal [%s]: " "${current_zone:-centralldark.com}"
  read -r ans
  [ -n "$ans" ] && current_zone="$ans"
  cf_env_set CF_ZONE_NAME "${current_zone:-centralldark.com}"

  # IP
  if [ -z "$current_ip" ] && [ -n "$detected_ip" ]; then current_ip="$detected_ip"; fi
  printf "IP público da VPS [%s]: " "${current_ip:-detectar}"
  read -r ans
  [ -n "$ans" ] && current_ip="$ans"
  [ -z "$current_ip" ] && current_ip="$detected_ip"
  if [ -z "$current_ip" ]; then err "Não consegui detectar IP. Informa manualmente."; return 1; fi
  cf_env_set CF_TARGET_IP "$current_ip"

  ok "Config salva: zona=${current_zone}  ip=${current_ip}  token=****${current_token: -4}"
}

run_cf_sync() {
  local mode="${1:-}"
  [ -x "$CF_SYNC_SCRIPT" ] || chmod +x "$CF_SYNC_SCRIPT" 2>/dev/null || true
  CF_CONFIG_FILE="$CF_ENV_FILE" "$CF_SYNC_SCRIPT" $mode
}

write_links_file() {
  local zone="$1"
  local out_dir="${REVISOES_DIR}/$(date +%Y%m%d-%H%M%S)/cloudflare"
  mkdir -p "$out_dir"
  local out="${out_dir}/links-do-usuario.md"
  cat > "$out" <<EOF
# Links do CentralDark — ${zone}

Gerado em $(date -Iseconds) pelo install.sh após sincronização Cloudflare.

## Pra salvar e acessar
- Site / Landing: https://${zone}  ·  https://www.${zone}
- Painel / Login: https://app.${zone}
- CRM: https://crm.${zone}
- Bot Telegram (painel): https://bot.${zone}
- Gateway / API: https://api.${zone}  ·  https://gateway.${zone}
- MCP (IA externa): https://mcp.${zone}  (status: https://mcp.${zone}/status)
- Webhook GitHub -> VPS: https://webhook.${zone}/webhook
- Status público: https://status.${zone}

> HTTPS pode levar alguns minutos pra ficar verde após o DNS propagar.
EOF
  ok "Lista de links salva em: ${out}"
  echo
  cat "$out"
}

cloudflare_apply() {
  title "===== Cloudflare APPLY (não-interativo) ====="
  [ -f "$CF_ENV_FILE" ] || { err "Config ausente. Roda ./install.sh --cloudflare antes."; exit 2; }
  local tok zone ip
  tok="$(cf_env_get CF_API_TOKEN)"
  [ -n "$tok" ] || { err "Token vazio. Roda ./install.sh --cloudflare."; exit 2; }
  zone="$(cf_env_get CF_ZONE_NAME)"
  ip="$(cf_env_get CF_TARGET_IP)"
  # Detectar zona automaticamente (caso veio do OAuth, que só salva token+account)
  if [ -z "$zone" ]; then
    log "Detectando zona Cloudflare via API..."
    local zones_json zone_count
    zones_json="$(curl -fsS -H "Authorization: Bearer $tok" "https://api.cloudflare.com/client/v4/zones?per_page=50" 2>/dev/null || echo '{}')"
    zone_count="$(echo "$zones_json" | jq -r '.result | length' 2>/dev/null || echo 0)"
    if [ "$zone_count" = "1" ]; then
      zone="$(echo "$zones_json" | jq -r '.result[0].name')"
      ok "Zona detectada automaticamente: $zone"
    elif [ "$zone_count" -gt 1 ] 2>/dev/null; then
      echo "Zonas disponíveis:"
      echo "$zones_json" | jq -r '.result[] | "  - " + .name'
      printf "Digita o nome da zona pra usar: "
      read -r zone
    else
      err "Nenhuma zona encontrada nessa conta Cloudflare."; exit 2
    fi
    [ -n "$zone" ] && cf_env_set CF_ZONE_NAME "$zone"
  fi
  # Detectar IP público se faltar
  if [ -z "$ip" ]; then
    ip="$(curl -fsS https://api.ipify.org 2>/dev/null || curl -fsS https://ifconfig.me 2>/dev/null || echo '')"
    [ -n "$ip" ] && { cf_env_set CF_TARGET_IP "$ip"; ok "IP público detectado: $ip"; }
  fi
  [ -n "$ip" ] || { err "Não consegui detectar IP público. Define CF_TARGET_IP no cofre."; exit 2; }
  run_cf_sync
  write_links_file "$zone"
}


cloudflare_check() {
  title "===== Cloudflare CHECK ====="
  [ -f "$CF_ENV_FILE" ] || { err "Config ausente. Roda ./install.sh --cloudflare antes."; exit 2; }
  [ -n "$(cf_env_get CF_API_TOKEN)" ] || { err "Token vazio. Roda ./install.sh --cloudflare."; exit 2; }
  run_cf_sync --check
}

cloudflare_full_flow() {
  title "===== Cloudflare/DNS (fluxo completo) ====="
  prompt_cf_wizard || { err "Wizard cancelado."; return 1; }
  echo
  log "[1/3] Validando token + listando registros atuais..."
  run_cf_sync --check || { err "Token inválido ou zona não encontrada."; return 1; }
  echo
  log "[2/3] Simulação (dry-run) — nada será alterado:"
  run_cf_sync --dry-run
  echo
  printf "Aplicar de verdade agora? (digita SIM em maiúsculas): "
  read -r ans
  if [ "$ans" = "SIM" ]; then
    log "[3/3] Aplicando..."
    run_cf_sync && ok "Cloudflare sincronizado com sucesso."
    write_links_file "$(cf_env_get CF_ZONE_NAME)"
  else
    warn "Cancelado. Nada foi alterado."
  fi
}

configure_cloudflare() {
  while true; do
    title "===== Cloudflare/DNS ====="
    local saved_zone saved_ip saved_token
    saved_zone="$(cf_env_get CF_ZONE_NAME 2>/dev/null || true)"
    saved_ip="$(cf_env_get CF_TARGET_IP 2>/dev/null || true)"
    saved_token="$(cf_env_get CF_API_TOKEN 2>/dev/null || true)"
    cat <<EOF
Config atual:
  zona  : ${saved_zone:-(vazia)}
  IP    : ${saved_ip:-(vazio)}
  token : ${saved_token:+****${saved_token: -4}}${saved_token:-(vazio)}

1. Conectar pelo celular (QR no terminal) ★ recomendado
2. Configurar VPS manual (token + zona + IP)
3. Verificar token e listar registros (somente leitura)
4. Simular mudanças (dry-run)
5. Aplicar mudanças de verdade
6. Fluxo completo (configurar -> verificar -> simular -> aplicar)
0. Voltar
EOF
    printf "Escolha: "
    read -r cf_choice
    case "$cf_choice" in
      1) run_install_connect || warn "Conexão cancelada." ;;
      2) prompt_cf_wizard || warn "Cancelado." ;;
      3) cloudflare_check || true ;;
      4) run_cf_sync --dry-run || true ;;
      5) cloudflare_apply || true ;;
      6) cloudflare_full_flow || true ;;
      0) return 0 ;;
      *) warn "Opção inválida" ;;
    esac
  done
}



cloudflare_check() {
  title "===== Cloudflare CHECK ====="
  ensure_cf_env || { err "Config incompleta."; exit 2; }
  run_cf_sync --check
}

configure_mcp() {
  title "===== MCP ====="
  prepare_structure
  cat > "${MCP_DIR}/README.instalacao.md" <<EOF
# MCP CentralDark

Destino: ${MCP_DIR}
Logs: ${LOGS_DIR}/mcp
Secrets: ${SECRETS_DIR}/mcp.env
Domínio: mcp.centralldark.com
Porta local: 9100

Preencher ${SECRETS_DIR}/mcp.env com secrets reais fora do Git.
EOF
  ok "Base MCP preparada em ${MCP_DIR}"
}

install_fallback_shortcuts() {
  # Cria atalhos globais pros scripts de fallback Lovable↔GitHub.
  local bin="/usr/local/bin"
  local base
  base="$(cd "$(dirname "$0")" && pwd)/CentralDark/scripts/deploy"
  [ -d "$base" ] || { warn "scripts de deploy não encontrados em $base"; return 0; }
  chmod +x "$base"/lovable-*.sh 2>/dev/null || true
  for cmd in check sync-fallback report; do
    local src="${base}/lovable-${cmd}.sh"
    local dest_name="centraldark-lovable-${cmd%-fallback}"
    [ "$cmd" = "sync-fallback" ] && dest_name="centraldark-lovable-sync"
    if [ -w "$bin" ] || [ "$(id -u)" = "0" ]; then
      ln -sf "$src" "${bin}/${dest_name}" 2>/dev/null && ok "atalho: ${dest_name}"
    else
      warn "sem permissão pra criar ${bin}/${dest_name} — rode como root"
    fi
  done
}

install_base() {
  ensure_deps || warn "Algumas dependências falharam — seguindo mesmo assim."
  verify_environment
  prepare_structure
  install_fallback_shortcuts
  write_report
  ok "Base CentralDark preparada"
  title "===== Rodando checker end-to-end ====="
  if run_check_final; then
    ok "Instalação concluída e validada."
  else
    local rc=$?
    if [ "$rc" = "1" ]; then
      warn "Instalação concluída com ALERTAS — revise o relatório."
    else
      err "Instalação NÃO pode ser declarada concluída — há ERROS no checker."
      return 2
    fi
  fi
}

run_check_final() {
  local runner="${SCRIPT_DIR}/scripts/checker/run-all.sh"
  if [ ! -x "$runner" ]; then
    err "Checker não encontrado em $runner"
    return 2
  fi
  bash "$runner"
}


write_report() {
  mkdir -p "$LOG_DIR"
  {
    echo "# Relatório do instalador CentralDark"
    echo
    echo "Data: $(date -Iseconds)"
    echo "Modo: ${MODE:-?}"
    echo "Host: $(hostname)"
    echo
    echo "## Caminhos"
    echo
    echo "- Root: ${CENTRALDARK_ROOT}"
    echo "- Apps: ${CENTRALDARK_APPS}"
    echo "- Multizap: ${MULTIZAP_DIR}"
    echo "- MCP: ${MCP_DIR}"
    echo "- Secrets: ${SECRETS_DIR}"
    echo "- Logs: ${LOGS_DIR}"
    echo
    echo "## Proteção"
    echo
    echo "Serviços relacionados a Recargas Brasil/WhatsApp/WuzAPI não são alterados por padrão."
  } > "${LOG_DIR}/resumo.md"
  ok "Relatório em ${LOG_DIR}/resumo.md"
}

aio_collect_sysinfo() {
  AIO_OS="$( . /etc/os-release 2>/dev/null; echo "${PRETTY_NAME:-Unknown} ( $(uname -m) )" )"
  AIO_CPU="$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2- | sed 's/^ *//')"
  [ -z "$AIO_CPU" ] && AIO_CPU="$(uname -p 2>/dev/null || echo unknown)"
  AIO_CORES="$(nproc 2>/dev/null || echo ?)"
  AIO_FREQ="$(grep -m1 'cpu MHz' /proc/cpuinfo 2>/dev/null | awk -F: '{printf "%.3f MHz",$2}')"
  [ -z "$AIO_FREQ" ] && AIO_FREQ="—"
  AIO_RAM="$(free -m 2>/dev/null | awk '/^Mem:/{print $2" MB"}')"
  [ -z "$AIO_RAM" ] && AIO_RAM="—"
  AIO_UPTIME="$(uptime -p 2>/dev/null | sed 's/^up //')"
  [ -z "$AIO_UPTIME" ] && AIO_UPTIME="—"
  AIO_DOMAIN="$(cf_env_get CF_ZONE_NAME 2>/dev/null || echo centralldark.com)"
}

aio_service_state() {
  # devolve "Running" ou "Stopped"
  local check="$1"
  eval "$check" >/dev/null 2>&1 && echo Running || echo Stopped
}

aio_show_status_list() {
  # Zera registro de alertas a cada repaint
  AIO_ALERTAS_MOTIVO=(); AIO_ALERTAS_COMO=(); AIO_ALERTAS_OPC=(); AIO_ORDEM_ALERTAS=()

  # Dependências de sistema (resolvem todas com a opção 9)
  aio_check "Node.js"            "require_cmd node"     "Node.js não instalado"        "Instalar Node 20 LTS via apt"     "9"
  aio_check "PM2 (gerenciador)"  "require_cmd pm2"      "PM2 ausente (gerenciador)"     "npm i -g pm2"                     "9"
  aio_check "Caddy (proxy web)"  "require_cmd caddy"    "Servidor web Caddy ausente"   "Instalar Caddy (proxy HTTPS)"     "9"
  aio_check "Docker"             "require_cmd docker"   "Docker não instalado"          "Instalar via script oficial"      "9"
  aio_check "Git"                "require_cmd git"      "Git não instalado"             "apt install git"                  "9"
  aio_check "Curl"               "require_cmd curl"     "Curl ausente"                  "apt install curl"                 "9"
  aio_check "Jq (leitor JSON)"   "require_cmd jq"       "Jq ausente (parse JSON)"       "apt install jq"                   "9"
  aio_check "Qrencode (QR Code)" "require_cmd qrencode" "qrencode ausente (gera QR)"    "apt install qrencode"             "9"
  aio_check "Dig (teste de DNS)" "require_cmd dig"      "dig ausente (testes de DNS)"   "apt install dnsutils"             "9"
  aio_check "Openssl"            "require_cmd openssl"  "openssl ausente"               "apt install openssl"              "9"

  # Estrutura e configuração da CentralDark
  aio_check "Pastas CentralDark"    "[ -d \"$CENTRALDARK_ROOT\" ]" \
    "Pasta /root/CentralDark ainda não foi criada" \
    "Criar a estrutura padrão de pastas" "3"
  aio_check "Cloudflare (token)"    "[ -s \"$CF_ENV_FILE\" ] && [ -n \"\$(cf_env_get CF_API_TOKEN 2>/dev/null)\" ]" \
    "Falta cadastrar o token do Cloudflare em ${CF_ENV_FILE}" \
    "Rodar o assistente do Cloudflare e colar seu API Token" "4"
  aio_check "MCP (cérebro da IA)"   "[ -d \"$MCP_DIR\" ]" \
    "Módulo MCP CentralDark ainda não foi instalado" \
    "Instalar o MCP (cérebro da IA)" "5"
  aio_check "Cofre de Segredos"     "[ -d \"$SECRETS_DIR\" ]" \
    "Pasta de cofre de credenciais ausente" \
    "Criar estrutura (cria a pasta secrets/)" "3"
  aio_check "Atualização Automática" "ss -ltn 2>/dev/null | grep -q ':9003'" \
    "Webhook de deploy não está escutando na porta 9003" \
    "Subir o webhook-bot via PM2 (parte da instalação base)" "2"
}

wizard() {
  while true; do
    clear 2>/dev/null || true
    aio_collect_sysinfo
    aio_sep
    aio_bar_red "Instalador CentralDark (V1.0)"
    aio_sep
    aio_tagline "INSTALADOR" "PARA" "INICIANTE"
    aio_sep
    aio_kv "Sistema:"        "$AIO_OS"
    aio_kv "Processador:"    "$AIO_CPU"
    aio_kv "Núcleos:"        "$AIO_CORES"
    aio_kv "Frequência:"     "$AIO_FREQ"
    aio_kv "Memória RAM:"    "$AIO_RAM"
    aio_kv "Tempo ligado:"   "$AIO_UPTIME"
    aio_kv "Domínio:"        "$AIO_DOMAIN"
    aio_sep
    aio_show_status_list
    aio_sep
    aio_painel_alertas
    aio_sep
    aio_bar_red "MENU DO PAINEL CENTRALDARK"
    aio_sep
    aio_menu_row 1 "VERIFICAR AMBIENTE"   6 "CHECAGEM COMPLETA"
    aio_menu_row 2 "INSTALAR BASE"        7 "LOGIN CLOUDFLARE (QR NO CEL)"
    aio_menu_row 3 "ESTRUTURA DE PASTAS"  8 "ASSISTENTE DNS WILDCARD"
    aio_menu_row 4 "CLOUDFLARE / DNS"     9 "INSTALAR DEPENDÊNCIAS"
    aio_menu_row 5 "MCP CENTRALDARK"     10 "ATUALIZAR INSTALADOR"
    aio_menu_row 0 "SAIR DO MENU"         ""  ""
    aio_sep
    aio_bar_red "Feito por CentralDark · IA Ops"
    aio_sep
    echo
    # Quando rodado via `curl ... | bash`, o stdin é o pipe do curl e não o
    # teclado — `read` retorna na hora e o menu sai sozinho. Solução padrão:
    # reabrir o stdin a partir de /dev/tty (o teclado real do terminal).
    if [ ! -t 0 ] && [ -r /dev/tty ]; then
      exec </dev/tty
    fi
    if [ ! -t 0 ]; then
      warn "Sem terminal interativo (sem /dev/tty). Rode em SSH direto: bash <(curl -fsSL https://install.centralldark.com)"
      exit 0
    fi

    aio_prompt "Escolha uma opção (0-10):"
    # -r evita escape, timeout 300s evita travar sessão SSH abandonada
    if ! read -r -t 300 choice; then
      echo
      warn "Tempo esgotado ou input encerrado. Saindo do menu."
      exit 0
    fi
    # Tira espaços e quebras pra não estourar o case
    choice="$(printf '%s' "$choice" | tr -d '[:space:]')"
    case "$choice" in
      1)  verify_environment ;;
      2)  install_base ;;
      3)  prepare_structure ;;
      4)  configure_cloudflare ;;
      5)  configure_mcp ;;
      6)  run_check_final || true ;;
      7)  run_install_connect || true ;;
      8)  run_wildcard_wizard || true ;;
      9)  ensure_deps ;;
      10) update_repo ;;
      0)  clear 2>/dev/null || true; ok "Até a próxima!"; exit 0 ;;
      "") warn "Nenhuma opção digitada." ;;
      *)  warn "Opção inválida: '$choice' — digite um número de 0 a 10." ;;
    esac
    echo
    aio_prompt "Pressione ENTER pra voltar ao menu..."
    read -r _ || true
  done
}


CF_WIZARD="${SCRIPT_DIR}/CentralDark/scripts/installer/cloudflare-wizard.sh"
INSTALL_CONNECT="${SCRIPT_DIR}/CentralDark/scripts/installer/install-connect.sh"

run_cf_wizard() {
  if [ -x "$CF_WIZARD" ] || [ -f "$CF_WIZARD" ]; then
    chmod +x "$CF_WIZARD" 2>/dev/null || true
    bash "$CF_WIZARD" "$@"
  else
    warn "Wizard novo não encontrado em $CF_WIZARD — usando fluxo antigo."
    return 1
  fi
}

run_install_connect() {
  [ -f "$INSTALL_CONNECT" ] || { err "Script ausente: $INSTALL_CONNECT"; return 2; }
  ensure_deps || warn "Dependências não 100% — tentando mesmo assim."
  chmod +x "$INSTALL_CONNECT" 2>/dev/null || true
  bash "$INSTALL_CONNECT" "$@"
}


WW_WIZARD="${SCRIPT_DIR}/CentralDark/scripts/installer/wildcard-dns-wizard.sh"

run_wildcard_wizard() {
  [ -f "$WW_WIZARD" ] || { err "Wildcard wizard ausente: $WW_WIZARD"; return 2; }
  chmod +x "$WW_WIZARD" 2>/dev/null || true
  bash "$WW_WIZARD" "$@"
}

run_online_check_only() {
  local zone="${1:-}"
  [ -z "$zone" ] && zone="$(cf_env_get CF_ZONE_NAME 2>/dev/null || echo centralldark.com)"
  local lib="${SCRIPT_DIR}/CentralDark/scripts/installer/lib"
  # shellcheck disable=SC1091
  . "${lib}/ui.sh"; . "${lib}/caddy-auto.sh"; . "${lib}/online-check.sh"
  oc_check_all "$zone"
}

usage() {
  cat <<EOF
Uso: $0 <modo>

Modos:
  sem argumento         Abre wizard interativo
  --check               Verifica ambiente (rápido) — abre painel automático se OK
  --no-menu             Combina com --check: não abre o painel no fim
  --check-final         Roda o checker END-TO-END (12 blocos + relatório)
  --install             Instala base CentralDark + checker no final
  --wildcard            Wizard DNS wildcard (@, www, *) — caminho oficial
  --wildcard-check      Só valida DNS wildcard (não toca Caddy)
  --online-check        Testa se subdomínios oficiais estão online
  --cloudflare          Atalho: cria @, www, * via API Cloudflare
  --cloudflare-check    Só valida token + lista registros
  --cloudflare-apply    Aplica DNS sem interação (CI / re-run)
  --dns-check           Checker DNS+Caddy+HTTPS (read-only)
  --domains             Atalho: --wildcard + --dns-check
  --mcp                 Prepara base MCP
  --connect             Conectar Cloudflare pelo celular (QR no terminal)
  --deps                Instala só as dependências do instalador (curl, jq, qrencode, dig, ...)
  --menu                Instala menu colorido da VPS (cdmenu / cdstatus / menu)
  --update              Atualiza install.sh + repo local (git pull main)
  --no-update           Pula o auto-update desta execução
  --link                Cria atalho global (centraldark / clonedeck em /usr/local/bin)
  --where               Mostra onde o repo foi localizado
  --restore             Futuro
  --help                Esta tela
EOF
}

run_install_menu() {
  local script_path="${SCRIPT_DIR}/scripts/installer/install-menu.sh"
  if [ ! -x "$script_path" ]; then
    err "scripts/installer/install-menu.sh não encontrado ou sem permissão."
    exit 2
  fi
  bash "$script_path"
}

readonly RAW_INSTALLER_URL="${CD_INSTALL_URL:-https://install.centralldark.com/raw/install.sh}"
readonly RAW_INSTALLER_FALLBACK="https://raw.githubusercontent.com/segredounlock/clone-deck/main/install.sh"

self_update() {
  # Auto-update do install.sh a partir do repo. Re-exec quando há versão nova.
  [ "${CD_NO_UPDATE:-0}" = "1" ] && return 0
  [ "${CD_SELF_UPDATED:-0}" = "1" ] && return 0
  command -v curl >/dev/null 2>&1 || return 0

  local script_file="${BASH_SOURCE[0]}"
  [ -f "$script_file" ] || return 0
  [ -w "$script_file" ] || return 0

  local tmp
  tmp="$(mktemp /tmp/centraldark-install.XXXXXX.sh)" || return 0
  if ! progress_run "Baixando install.sh do repo" \
        bash -c "curl -fsSL --max-time 15 '$RAW_INSTALLER_URL' -o '$tmp' 2>/dev/null" \
    && ! progress_run "Baixando install.sh (fallback)" \
        bash -c "curl -fsSL --max-time 15 '$RAW_INSTALLER_FALLBACK' -o '$tmp' 2>/dev/null"; then
    rm -f "$tmp"; return 0
  fi
  [ -s "$tmp" ] || { rm -f "$tmp"; return 0; }
  if ! bash -n "$tmp" 2>/dev/null; then
    warn "Update baixado tem erro de sintaxe — ignorado."; rm -f "$tmp"; return 0
  fi

  local cur_hash new_hash
  cur_hash="$(sha256sum "$script_file" | awk '{print $1}')"
  new_hash="$(sha256sum "$tmp" | awk '{print $1}')"
  if [ "$cur_hash" = "$new_hash" ]; then
    rm -f "$tmp"; return 0
  fi

  log "Nova versão do instalador detectada — atualizando…"
  cp -f "$script_file" "${script_file}.bak.$(date +%s)" 2>/dev/null || true
  if mv "$tmp" "$script_file"; then
    chmod +x "$script_file" 2>/dev/null || true
    printf "${C_OK}[ok]${C_RST}    install.sh atualizado. Reiniciando…\n"
    export CD_SELF_UPDATED=1
    exec bash "$script_file" "$@"
  else
    rm -f "$tmp"
    warn "Falhou ao aplicar update — seguindo com a versão atual."
  fi
}

update_repo() {
  # Atualiza repo local (se já clonado) e força re-download do install.sh.
  local repo_dir="${CENTRALDARK_ROOT}/repo/clone-deck"
  title "Atualizando instalador (auto-update do repo)"
  if [ -d "$repo_dir/.git" ]; then
    progress_run "Buscando alterações no repo" \
      bash -c "cd '$repo_dir' && git fetch --all --prune" \
      || warn "git fetch falhou em $repo_dir"
    progress_run "Aplicando última versão (main)" \
      bash -c "cd '$repo_dir' && git reset --hard origin/main" \
      || warn "git reset falhou em $repo_dir"
  else
    log "Repo local ainda não existe ($repo_dir) — só atualizando install.sh."
  fi
  unset CD_SELF_UPDATED
  self_update "$@"
  progress_done "Atualização concluída"
}

# ============================================================================
#  Localizador universal — permite rodar `centraldark` / `clonedeck` de qualquer
#  pasta, achando o repo sozinho. Se SCRIPT_DIR não for o repo (ex.: chamado
#  via symlink em /usr/local/bin), procura nos locais conhecidos e re-executa
#  a partir de lá pra manter caminhos relativos certos.
# ============================================================================
locate_repo() {
  # Sem caminho hardcoded — detecta dinamicamente.
  # 1) SCRIPT_DIR (quando chamado direto via ./install.sh)
  if [ -f "$SCRIPT_DIR/install.sh" ] && [ -d "$SCRIPT_DIR/docs/INSTALADOR" ]; then
    printf "%s" "$SCRIPT_DIR"; return 0
  fi
  # 2) Resolve symlink global (centraldark/clonedeck → install.sh real)
  local self real
  for self in /usr/local/bin/centraldark /usr/local/bin/clonedeck \
              "$HOME/.local/bin/centraldark" "$HOME/.local/bin/clonedeck"; do
    [ -L "$self" ] || continue
    real="$(readlink -f "$self" 2>/dev/null)" || continue
    local dir; dir="$(dirname "$real")"
    if [ -d "$dir/docs/INSTALADOR" ]; then printf "%s" "$dir"; return 0; fi
  done
  # 3) Estamos dentro de um clone (git)? Sobe até a raiz.
  if command -v git >/dev/null 2>&1; then
    local top; top="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || true)"
    if [ -n "$top" ] && [ -f "$top/install.sh" ] && [ -d "$top/docs/INSTALADOR" ]; then
      printf "%s" "$top"; return 0
    fi
  fi
  # 4) Locais padrão: CentralDark é a casa oficial. Repo fica clonado
  #    dentro de /root/CentralDark/ espelhando a estrutura do GitHub.
  local cand
  for cand in \
    "${CENTRALDARK_ROOT}" \
    "${CENTRALDARK_ROOT}/clone-deck" \
    "${CENTRALDARK_ROOT}/repo/clone-deck" \
    "${CENTRALDARK_ROOT}/apps/clone-deck" \
    "$PWD" "$HOME/clone-deck" "$HOME/CentralDark"; do
    if [ -f "$cand/install.sh" ] && [ -d "$cand/docs/INSTALADOR" ]; then
      printf "%s" "$cand"; return 0
    fi
  done
  # 5) Fallback: varredura ampla (sem assumir nome de pasta).
  local root c
  for root in "${CENTRALDARK_ROOT}" "$PWD" "$HOME" /root /opt /srv; do
    [ -d "$root" ] || continue
    while IFS= read -r c; do
      local d; d="$(dirname "$c")"
      if [ -d "$d/docs/INSTALADOR" ]; then printf "%s" "$d"; return 0; fi
    done < <(find "$root" -maxdepth 5 -type f -name install.sh 2>/dev/null)
  done
  return 1
}


install_launcher() {
  # Instala symlinks globais apontando pro install.sh real. Idempotente.
  # Nomes: centraldark, clonedeck (oficiais) + menu, MENU, cd-menu (atalhos
  # curtos pra abrir o wizard rapidão na VPS).
  local repo="${1:-$SCRIPT_DIR}"
  local target="$repo/install.sh"
  [ -f "$target" ] || { warn "install.sh não encontrado em $repo"; return 1; }
  local bin_dir="/usr/local/bin"
  [ -w "$bin_dir" ] || bin_dir="$HOME/.local/bin"
  mkdir -p "$bin_dir" 2>/dev/null || true
  local name
  for name in centraldark clonedeck cdinstall menu MENU cd-menu; do
    ln -sfn "$target" "$bin_dir/$name" 2>/dev/null \
      && ok "Comando '$name' disponível em $bin_dir/$name" \
      || warn "Não consegui criar $bin_dir/$name (rode como root pra atalho global)"
  done
  neutralize_legacy_menu_alias
}

neutralize_legacy_menu_alias() {
  # Aliases/funções 'menu' antigos apontando pro Multizap legado quebram a UX
  # ("Arquivo /root/Multizap/gateway/.env não encontrado"). Comenta as linhas
  # ofensivas em ~/.bashrc e /etc/bash.bashrc, preservando histórico.
  local stamp
  stamp="$(date +%Y%m%d-%H%M%S)"
  local rc
  for rc in "$HOME/.bashrc" "/etc/bash.bashrc"; do
    [ -f "$rc" ] || continue
    [ -w "$rc" ] || continue
    if grep -qE '^[[:space:]]*(alias[[:space:]]+menu=|menu[[:space:]]*\(\))' "$rc" 2>/dev/null; then
      cp "$rc" "${rc}.bak-${stamp}" 2>/dev/null || true
      sed -i -E 's|^([[:space:]]*alias[[:space:]]+menu=.*)$|# [CentralDark] alias legado neutralizado: \1|; s|^([[:space:]]*menu[[:space:]]*\(\).*)$|# [CentralDark] função legada neutralizada: \1|' "$rc"
      ok "alias/função 'menu' legado neutralizado em $rc (backup .bak-$stamp)"
    fi
  done
}



migrate_autostart_cdmenu_to_cdinstall() {
  # Se o usuário tinha ligado o painel fixo numa versão antiga (que abria 'cdmenu'
  # e perdia cor, ou que usava 'curl | bash'), reescreve o bloco pra abrir
  # 'cdinstall' local (wizard colorido). Idempotente.
  local brc="$HOME/.bashrc"
  [ -f "$brc" ] || return 0
  [ -w "$brc" ] || return 0
  # Tem algum bloco antigo (cdmenu ou bootstrap-via-curl)?
  grep -qE "centraldark (cdmenu|bootstrap) autostart" "$brc" 2>/dev/null || return 0
  # Já migrou pra cdinstall? (procura marca nova)
  if grep -q "CDINSTALL_RUNNING" "$brc" 2>/dev/null && ! grep -q "CD_BOOTSTRAP_RUNNING" "$brc" 2>/dev/null; then
    return 0
  fi
  local stamp; stamp="$(date +%Y%m%d-%H%M%S)"
  cp "$brc" "${brc}.bak-migrate-${stamp}" 2>/dev/null || true
  # Remove blocos antigos (cdmenu e bootstrap-via-curl)
  sed -i '/# >>> centraldark cdmenu autostart >>>/,/# <<< centraldark cdmenu autostart <<</d' "$brc"
  sed -i '/# >>> centraldark bootstrap autostart >>>/,/# <<< centraldark bootstrap autostart <<</d' "$brc"
  {
    echo ""
    echo "# >>> centraldark cdmenu autostart >>>"
    echo "# Abre o INSTALADOR (wizard colorido local) em sessões SSH interativas."
    echo "# Pra desligar: rode 'cdmenu' → opção 20, OU apague ~/.cdmenu-autostart."
    echo "if [ -n \"\$PS1\" ] && [ -n \"\$SSH_CONNECTION\" ] && [ -f \"\$HOME/.cdmenu-autostart\" ] && [ -z \"\$CDINSTALL_RUNNING\" ] && command -v cdinstall >/dev/null 2>&1; then"
    echo "  export CDINSTALL_RUNNING=1 CD_FORCE_COLOR=1"
    echo "  export TERM=\"\${TERM:-xterm-256color}\""
    echo "  exec cdinstall"
    echo "fi"
    echo "# <<< centraldark cdmenu autostart <<<"
  } >> "$brc"
  ok "Painel fixo no SSH migrado pro instalador colorido local (backup .bak-migrate-${stamp})" 2>/dev/null || true
}

main() {
  # Se a gente foi chamado fora do repo (via symlink global, curl|bash, etc.),
  # localiza o repo correto e re-executa de lá.
  if [ ! -f "$SCRIPT_DIR/docs/INSTALADOR/README.md" ] && [ "${CD_LOCATED:-0}" != "1" ]; then
    local found
    if found="$(locate_repo)"; then
      export CD_LOCATED=1
      cd "$found"
      exec bash "$found/install.sh" "$@"
    fi
    # Sem repo local: segue (pode ser primeira instalação via curl|bash).
  fi

  # Garante que comandos relativos funcionem mesmo se rodaram de outra pasta.
  cd "$SCRIPT_DIR" 2>/dev/null || true

  # Auto-update no início (pula com CD_NO_UPDATE=1 ou flag --no-update)
  case "${1:-}" in
    --no-update) export CD_NO_UPDATE=1; shift ;;
  esac
  self_update "$@"

  # Instala launcher global na primeira vez (silencioso se já existe).
  # Re-linka também se algum atalho novo (menu/MENU/cd-menu) ainda faltar.
  if [ ! -e /usr/local/bin/centraldark ] || [ ! -e /usr/local/bin/cdinstall ] \
     || [ ! -e /usr/local/bin/menu ] || [ ! -e /usr/local/bin/MENU ]; then
    install_launcher "$SCRIPT_DIR" >/dev/null 2>&1 || true
  fi

  # Migração silenciosa: blocos antigos do painel fixo (cdmenu/cdinstall local)
  # viram chamada pro bootstrap oficial em install.centralldark.com.
  migrate_autostart_cdmenu_to_cdinstall




  MODE="${1:-wizard}"
  case "$MODE" in
    wizard) wizard ;;
    --check)
      verify_environment
      # Se ambiente OK e tem terminal interativo (mesmo via curl|bash),
      # abre o painel automaticamente. CD_NO_MENU=1 ou --no-menu pula.
      if [ "${CD_NO_MENU:-0}" != "1" ] && [ "${2:-}" != "--no-menu" ]; then
        if [ -t 1 ] && [ -r /dev/tty ]; then
          log "Ambiente OK — abrindo painel CentralDark..."
          exec </dev/tty
          wizard
        fi
      fi
      ;;
    --check-final) run_check_final ;;
    --install) install_base ;;
    --wildcard) run_wildcard_wizard ;;
    --wildcard-check) run_wildcard_wizard --check-only ;;
    --online-check) shift || true; run_online_check_only "${1:-}" ;;
    --cloudflare) run_cf_wizard --wizard || configure_cloudflare ;;
    --cloudflare-check) run_cf_wizard --check || cloudflare_check ;;
    --cloudflare-apply) run_cf_wizard --apply || cloudflare_apply ;;
    --connect) run_install_connect ;;
    --deps) ensure_deps ;;
    --dns-check) run_cf_wizard --dns-check || { err "Checker DNS indisponível"; exit 2; } ;;
    --domains) run_wildcard_wizard && run_cf_wizard --dns-check ;;
    --mcp) configure_mcp ;;
    --menu) run_install_menu ;;
    --update|--self-update) update_repo "$@" ;;
    --link|--install-launcher) install_launcher "$SCRIPT_DIR" ;;
    --where) locate_repo && echo "" || { err "Repo não localizado"; exit 2; } ;;
    --restore) err "Modo --restore ainda não implementado"; exit 2 ;;
    --help|-h) usage ;;
    *) usage; exit 1 ;;
  esac
}


main "$@" 2> >(sanitize >&2) | tee >(sanitize > "/tmp/centraldark-install-$(date +%s).log")
