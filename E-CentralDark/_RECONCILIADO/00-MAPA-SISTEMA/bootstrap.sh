#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Bootstrap (1 linha só)
# ----------------------------------------------------------------------------
#  Pra quem nunca mexeu na VPS. Cola UMA linha no terminal e o resto rola:
#
#    bash <(curl -fsSL https://raw.githubusercontent.com/segredounlock/clone-deck/main/bootstrap.sh)
#
#  Fluxo em 3 fases:
#    FASE 1 — Verifica se a máquina é compatível (SO, RAM, disco, rede, root)
#    FASE 2 — Instala o mínimo pra clonar (git, curl, ca-certificates)
#    FASE 3 — Clona/atualiza o repo e abre o menu do instalador
#
#  Se a FASE 1 falhar, para ali e mostra o que precisa ser ajustado.
#  Nada é instalado de verdade antes do usuário escolher no menu do instalador.
# ============================================================================

set -uo pipefail

readonly REPO_URL="https://github.com/segredounlock/clone-deck.git"
readonly REPO_BRANCH="${REPO_BRANCH:-main}"
readonly REPO_DIR="/root/Multizap/apps/clone-deck"
readonly REPO_PARENT="/root/Multizap/apps"
readonly LOG_FILE="/var/log/centraldark-bootstrap.log"

# Requisitos mínimos
readonly MIN_RAM_MB=900          # < 1 GB já avisa (sistema usa ~2 GB pleno)
readonly REC_RAM_MB=2000         # recomendado 2 GB
readonly MIN_DISK_GB=8           # mínimo absoluto
readonly REC_DISK_GB=20          # recomendado

if [ -t 1 ]; then
  C_OK='\033[0;32m'; C_WARN='\033[0;33m'; C_ERR='\033[0;31m'
  C_INFO='\033[0;36m'; C_TITLE='\033[1;35m'; C_DIM='\033[2m'; C_RST='\033[0m'
else
  C_OK=''; C_WARN=''; C_ERR=''; C_INFO=''; C_TITLE=''; C_DIM=''; C_RST=''
fi

log()   { printf "${C_INFO}[ info ]${C_RST} %s\n" "$*"; }
ok()    { printf "${C_OK}[  ok  ]${C_RST} %s\n" "$*"; }
warn()  { printf "${C_WARN}[ aviso ]${C_RST} %s\n" "$*"; }
err()   { printf "${C_ERR}[ erro ]${C_RST} %s\n" "$*" >&2; }
title() { printf "\n${C_TITLE}══ %s ══${C_RST}\n" "$*"; }
dim()   { printf "${C_DIM}%s${C_RST}\n" "$*"; }

# Garante o log
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/centraldark-bootstrap.log"
exec > >(tee -a "$LOG_FILE") 2>&1

banner() {
  cat <<'EOF'

   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   │     CentralDark — Bootstrap de Instalação                │
   │     (verifica → prepara → abre o instalador)             │
   │                                                          │
   └──────────────────────────────────────────────────────────┘

EOF
}

# ────────────────────────────────────────────────────────────────────────────
# FASE 1 — VERIFICAÇÃO DE COMPATIBILIDADE (não instala nada)
# ────────────────────────────────────────────────────────────────────────────
fase1_verificar() {
  title "FASE 1/3 — Verificando se a máquina é compatível"
  local fatais=0
  local avisos=0

  # 1.1 — Root
  if [ "$(id -u)" -ne 0 ]; then
    err "Precisa rodar como root. Tenta: sudo bash <(curl -fsSL https://raw.githubusercontent.com/segredounlock/clone-deck/main/bootstrap.sh)"
    fatais=$((fatais+1))
  else
    ok "Usuário root confirmado"
  fi

  # 1.2 — Sistema operacional
  if [ -f /etc/os-release ]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    case "${ID:-}" in
      ubuntu|debian)
        ok "Sistema: ${PRETTY_NAME:-$ID} (suportado)"
        ;;
      *)
        warn "Sistema: ${PRETTY_NAME:-$ID} — não testado oficialmente. Pode rolar, mas sem garantia."
        avisos=$((avisos+1))
        ;;
    esac
  else
    err "Não consegui detectar o sistema operacional (sem /etc/os-release)."
    fatais=$((fatais+1))
  fi

  # 1.3 — Arquitetura
  local arch
  arch="$(uname -m 2>/dev/null || echo desconhecido)"
  case "$arch" in
    x86_64|amd64|aarch64|arm64) ok "Arquitetura: $arch (suportada)" ;;
    *) warn "Arquitetura: $arch — pode não ter binários prontos."; avisos=$((avisos+1)) ;;
  esac

  # 1.4 — Memória
  local ram_total_mb
  ram_total_mb="$(awk '/MemTotal/{printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)"
  if [ "$ram_total_mb" -ge "$REC_RAM_MB" ]; then
    ok "Memória RAM: ${ram_total_mb} MB (ótimo)"
  elif [ "$ram_total_mb" -ge "$MIN_RAM_MB" ]; then
    warn "Memória RAM: ${ram_total_mb} MB (recomendado ≥ ${REC_RAM_MB} MB). Vai rodar, mas apertado."
    avisos=$((avisos+1))
  else
    err "Memória RAM: ${ram_total_mb} MB (mínimo ${MIN_RAM_MB} MB). Vai travar."
    fatais=$((fatais+1))
  fi

  # 1.5 — Disco
  local disk_free_gb
  disk_free_gb="$(df -BG --output=avail / 2>/dev/null | tail -1 | tr -dc '0-9' || echo 0)"
  if [ "$disk_free_gb" -ge "$REC_DISK_GB" ]; then
    ok "Disco livre: ${disk_free_gb} GB (ótimo)"
  elif [ "$disk_free_gb" -ge "$MIN_DISK_GB" ]; then
    warn "Disco livre: ${disk_free_gb} GB (recomendado ≥ ${REC_DISK_GB} GB)."
    avisos=$((avisos+1))
  else
    err "Disco livre: ${disk_free_gb} GB (mínimo ${MIN_DISK_GB} GB)."
    fatais=$((fatais+1))
  fi

  # 1.6 — Conexão com a internet
  if curl -fsSL --connect-timeout 5 https://github.com >/dev/null 2>&1; then
    ok "Internet OK (alcançou github.com)"
  else
    err "Sem conexão com github.com. Verifica DNS/firewall."
    fatais=$((fatais+1))
  fi

  # 1.7 — Portas críticas livres (só avisa, instalador trata depois)
  for port in 80 443; do
    if ss -tln 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${port}\$"; then
      warn "Porta ${port} já está em uso. O instalador vai tentar reaproveitar (Caddy)."
      avisos=$((avisos+1))
    else
      ok "Porta ${port} livre"
    fi
  done

  # 1.8 — Resumo
  echo
  if [ "$fatais" -gt 0 ]; then
    err "Encontrei ${fatais} problema(s) que impedem a instalação. Resolve e roda de novo."
    exit 1
  fi
  if [ "$avisos" -gt 0 ]; then
    warn "Tem ${avisos} aviso(s), mas dá pra seguir."
  else
    ok "Tudo certo na verificação."
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# FASE 2 — INSTALAR O MÍNIMO PRA CLONAR
# ────────────────────────────────────────────────────────────────────────────
fase2_preparar() {
  title "FASE 2/3 — Preparando o mínimo (git + curl + ca-certificates)"

  local faltando=()
  for pkg in git curl ca-certificates; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
      faltando+=("$pkg")
    fi
  done

  if [ ${#faltando[@]} -eq 0 ]; then
    ok "Tudo que precisa pra clonar já está instalado"
    return 0
  fi

  log "Vou instalar: ${faltando[*]}"
  export DEBIAN_FRONTEND=noninteractive
  if ! apt-get update -y >/dev/null 2>&1; then
    warn "apt-get update teve algum aviso, seguindo mesmo assim"
  fi
  if apt-get install -y "${faltando[@]}" >/dev/null 2>&1; then
    ok "Pacotes instalados"
  else
    err "Falhou instalar: ${faltando[*]}. Roda manual: apt-get install -y ${faltando[*]}"
    exit 1
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# FASE 3 — CLONAR REPO E ABRIR O INSTALADOR
# ────────────────────────────────────────────────────────────────────────────
pedir_token() {
  # Repo principal é privado — precisa de um GitHub PAT (scope "repo") pra clonar.
  # Aceita via env var GITHUB_TOKEN, ou pergunta interativamente.
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    printf '%s' "$GITHUB_TOKEN"
    return 0
  fi
  # Mensagens vão pra stderr pra não poluir o stdout que devolve o token
  {
    echo
    warn "O repositório principal é privado. Preciso de um GitHub Personal Access Token (PAT)."
    dim "Como criar: https://github.com/settings/tokens → Generate new (classic) → marca 'repo' → copia."
    echo
  } >&2
  local tok=""
  if [ -r /dev/tty ]; then
    read -r -s -p "Cola aqui seu GitHub PAT (fica invisível): " tok < /dev/tty
  else
    read -r -s -p "Cola aqui seu GitHub PAT (fica invisível): " tok
  fi
  echo >&2
  if [ -z "$tok" ]; then
    err "Token vazio. Abortando."
    exit 1
  fi
  printf '%s' "$tok"
}

fase3_clonar_e_abrir() {
  title "FASE 3/3 — Baixando o repositório e abrindo o instalador"

  mkdir -p "$REPO_PARENT"

  local GH_TOKEN AUTH_URL
  GH_TOKEN="$(pedir_token)"
  AUTH_URL="https://x-access-token:${GH_TOKEN}@github.com/segredounlock/clone-deck.git"

  if [ -d "$REPO_DIR/.git" ]; then
    log "Repositório já existe em $REPO_DIR — atualizando"
    git -C "$REPO_DIR" remote set-url origin "$AUTH_URL" >/dev/null 2>&1 || true
    if git -C "$REPO_DIR" fetch --depth=1 origin "$REPO_BRANCH" >/dev/null 2>&1 \
       && git -C "$REPO_DIR" reset --hard "origin/${REPO_BRANCH}" >/dev/null 2>&1; then
      ok "Repositório atualizado (branch ${REPO_BRANCH})"
    else
      warn "Update falhou — seguindo com o que já tem"
    fi
    git -C "$REPO_DIR" remote set-url origin "$REPO_URL" >/dev/null 2>&1 || true
  else
    log "Clonando repositório em $REPO_DIR (branch ${REPO_BRANCH})"
    if git clone --depth=1 --branch "$REPO_BRANCH" "$AUTH_URL" "$REPO_DIR" >/dev/null 2>&1; then
      ok "Repositório clonado"
      git -C "$REPO_DIR" remote set-url origin "$REPO_URL" >/dev/null 2>&1 || true
    else
      err "Falhou clonar (token errado, sem internet ou sem permissão?)"
      exit 1
    fi
  fi

  # Limpa o token da memória do shell
  unset GH_TOKEN AUTH_URL

  chmod +x "$REPO_DIR/install.sh" 2>/dev/null || true

  if [ ! -x "$REPO_DIR/install.sh" ]; then
    err "install.sh não encontrado em $REPO_DIR após o clone."
    exit 1
  fi

  title "Tudo pronto — abrindo o menu do instalador"
  dim "Daqui pra frente você navega pelo menu. Pra Cloudflare, escolhe a opção 4."
  echo

  # Passa controle TOTAL pro install.sh (sem subshell, mantém stdin pra read)
  exec "$REPO_DIR/install.sh" "$@"
}

# ────────────────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────────────────
main() {
  banner
  log "Log salvo em: $LOG_FILE"
  fase1_verificar
  fase2_preparar
  fase3_clonar_e_abrir "$@"
}

main "$@"
