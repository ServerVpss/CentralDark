#!/usr/bin/env bash
# ============================================================================
#  lib/precheck.sh — Pré-check da VPS antes de qualquer instalação.
#  Verifica SO, disco, memória, portas 80/443 e dependências mínimas.
#  Oferece instalar o que faltar (apt + npm + caddy oficial).
#  Depende de: lib/ui.sh
# ============================================================================

PC_MIN_DISK_GB="${PC_MIN_DISK_GB:-5}"
PC_MIN_MEM_MB="${PC_MIN_MEM_MB:-900}"
PC_REQUIRED_CMDS=(bash curl jq git dig openssl)
PC_RUNTIME_CMDS=(node npm pm2 caddy)

pc_so_check() {
  if [ ! -f /etc/os-release ]; then
    ui_err "SO não identificado (/etc/os-release ausente)"; return 1
  fi
  # shellcheck disable=SC1091
  . /etc/os-release
  case "${ID:-}" in
    debian|ubuntu) ui_ok "SO suportado: ${PRETTY_NAME}" ;;
    *) ui_warn "SO não testado oficialmente: ${PRETTY_NAME:-desconhecido} — siga com cautela" ;;
  esac
}

pc_disk_check() {
  local avail_gb
  avail_gb="$(df -BG --output=avail / 2>/dev/null | tail -1 | tr -dc '0-9')"
  if [ -z "$avail_gb" ]; then ui_warn "Não consegui medir o disco"; return 0; fi
  if [ "$avail_gb" -ge "$PC_MIN_DISK_GB" ]; then
    ui_ok "Disco livre: ${avail_gb}GB (>= ${PC_MIN_DISK_GB}GB)"
  else
    ui_err "Disco baixo: ${avail_gb}GB (mínimo ${PC_MIN_DISK_GB}GB)"; return 1
  fi
}

pc_mem_check() {
  local mem_mb
  mem_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null)"
  if [ -z "$mem_mb" ]; then ui_warn "Não consegui medir memória"; return 0; fi
  if [ "$mem_mb" -ge "$PC_MIN_MEM_MB" ]; then
    ui_ok "Memória: ${mem_mb}MB (>= ${PC_MIN_MEM_MB}MB)"
  else
    ui_warn "Memória baixa: ${mem_mb}MB — pode dar swap pesado"
  fi
}

pc_ports_check() {
  local ports=(80 443) p occupant
  for p in "${ports[@]}"; do
    occupant="$(ss -ltnp 2>/dev/null | awk -v port=":${p}" '$4 ~ port {print $0}' | head -1)"
    if [ -z "$occupant" ]; then
      ui_ok "Porta ${p}: livre"
    elif echo "$occupant" | grep -qi 'caddy'; then
      ui_ok "Porta ${p}: ocupada pelo Caddy (esperado)"
    else
      ui_warn "Porta ${p}: ocupada por outro processo — pode conflitar com Caddy"
    fi
  done
}

pc_internet_check() {
  if curl -fsS --max-time 5 -o /dev/null https://1.1.1.1; then
    ui_ok "Internet: ok"
  else
    ui_err "Sem internet — não dá pra seguir"; return 1
  fi
}

pc_dep_status() {
  local missing=()
  local c
  for c in "${PC_REQUIRED_CMDS[@]}" "${PC_RUNTIME_CMDS[@]}"; do
    if command -v "$c" >/dev/null 2>&1; then
      ui_ok "Dep: $c"
    else
      ui_warn "Dep faltando: $c"
      missing+=("$c")
    fi
  done
  printf '%s\n' "${missing[@]}"
}

pc_install_missing() {
  local missing=("$@")
  [ "${#missing[@]}" -eq 0 ] && return 0
  ui_warn "Faltam: ${missing[*]}"
  if ! ui_confirm "Quer que eu tente instalar agora?" "S"; then
    ui_warn "Ok, segue sem instalar — mas o instalador pode falhar mais à frente."
    return 0
  fi

  local apt_pkgs=()
  local need_node=0 need_pm2=0 need_caddy=0
  local c
  for c in "${missing[@]}"; do
    case "$c" in
      bash|curl|jq|git|openssl) apt_pkgs+=("$c") ;;
      dig) apt_pkgs+=(dnsutils) ;;
      node|npm) need_node=1 ;;
      pm2) need_pm2=1 ;;
      caddy) need_caddy=1 ;;
    esac
  done

  if [ "${#apt_pkgs[@]}" -gt 0 ]; then
    ui_info "Instalando via apt: ${apt_pkgs[*]}"
    apt-get update -y >/dev/null 2>&1 || true
    apt-get install -y "${apt_pkgs[@]}" || ui_warn "apt falhou em algum pacote — confere manualmente"
  fi

  if [ "$need_node" -eq 1 ]; then
    ui_info "Instalando Node.js 20.x (NodeSource)..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || ui_warn "NodeSource falhou"
    apt-get install -y nodejs || ui_warn "Node não instalou"
  fi

  if [ "$need_pm2" -eq 1 ]; then
    ui_info "Instalando PM2 global..."
    npm install -g pm2 >/dev/null 2>&1 || ui_warn "PM2 não instalou"
  fi

  if [ "$need_caddy" -eq 1 ]; then
    ui_info "Instalando Caddy (repo oficial)..."
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https >/dev/null 2>&1 || true
    curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
      | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null || true
    curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
      > /etc/apt/sources.list.d/caddy-stable.list 2>/dev/null || true
    apt-get update -y >/dev/null 2>&1 || true
    apt-get install -y caddy || ui_warn "Caddy não instalou — instale manualmente"
  fi
}

pc_run_all() {
  ui_title "===== [1/6] Pré-check da VPS ====="
  local fails=0
  pc_so_check       || fails=$((fails+1))
  pc_internet_check || fails=$((fails+1))
  pc_disk_check     || fails=$((fails+1))
  pc_mem_check
  pc_ports_check
  local missing
  mapfile -t missing < <(pc_dep_status | grep -v '^$' || true)
  if [ "${#missing[@]}" -gt 0 ]; then
    pc_install_missing "${missing[@]}"
  fi
  [ "$fails" -eq 0 ]
}
