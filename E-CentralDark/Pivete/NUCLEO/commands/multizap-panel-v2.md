# COMANDO - multizap-panel-v2.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\multizap-gateway-deploy\scripts\multizap-panel-v2.sh
**SHA:** 2cff82cf65a9feb1
**Timestamp:** 2026-08-26T19:31:32.956956
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- DOCKER_WUZAPI_PATTERN="wuzapi"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# multizap-panel-v2 — Painel premium do MultiZap (gum > whiptail > numérico)
# Responsivo: detecta largura/altura do terminal a cada render.
# Teste de deploy automático — commit simples para validar webhook GitHub (sem efeito funcional).
# Compatível: xterm, gnome-terminal, iTerm, PuTTY, MobaXterm, GitBash, CMD (via SSH).
#
# Atalhos no menu (gum):
#   ↑/↓ navegar  ·  Enter executar  ·  / buscar  ·  Esc/Ctrl+C sair
#
set -uo pipefail

# ─── Configuração ─────────────────────────────────────────────────────────
ENV_FILE="/root/Multizap/gateway/.env"
GATEWAY_URL="http://127.0.0.1:3100"
WUZAPI_URL="http://127.0.0.1:8081"
WUZAPI_COMPOSE="/root/Multizap/wuzapi/docker-compose.yml"
PM2_NAME="MultiZap-Gateway"
DOCKER_WUZAPI_PATTERN="wuzapi"
REPO_DIR="/root/Multizap-repo"
DEPLOY_LOG="/var/log/multizap-gh-pull.log"

# ─── Detecção de UI ───────────────────────────────────────────────────────
UI="num"
if command -v gum >/dev/null 2>&1; then UI="gum"
elif command -v whiptail >/dev/null 2>&1; then UI="whiptail"
fi
have() { command -v "$1" >/dev/null 2>&1; }

# ─── Cores (com fallback) ─────────────────────────────────────────────────
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && have tput; then
  C_RESET=$(tput sgr0); C_BOLD=$(tput bold); C_DIM=$(tput dim)
  C_GREEN=$(tput setaf 2); C_RED=$(tput setaf 1); C_YELLOW=$(tput setaf 3)
  C_BLUE=$(tput setaf 4); C_CYAN=$(tput setaf 6); C_MAGENTA=$(tput setaf 5)
else
  C_RESET=""; C_BOLD=""; C_DIM=""; C_GREEN=""; C_RED=""
  C_YELLOW=""; C_BLUE=""; C_CYAN=""; C_MAGENTA=""
fi

ok()   { printf "${C_GREEN}✓${C_RESET} %s\n" "$*"; }
warn() { printf "${C_YELLOW}⚠${C_RESET} %s\n" "$*"; }
err()  { printf "${C_RED}✗${C_RESET} %s\n" "$*"; }
info() { printf "${C_BLUE}ℹ${C_RESET} %s\n" "$*"; }

# ─── Tamanho do terminal (recalculado sempre) ────────────────────────────
term_cols() { tput cols 2>/dev/null || echo 80; }
term_rows() { tput lines 2>/dev/null || echo 24; }

# linha horizontal com a largura atual
hr() {
  local w=$(term_cols) i=0 line=""
  [ "$w" -gt 120 ] && w=120
  while [ "$i" -lt "$w" ]; do line="${line}─"; i=$((i+1)); done
  printf "${C_DIM}%s${C_RESET}\n" "$line"
}

# centraliza texto na largura atual
center() {
  local text="$1" w pad
  w=$(term_cols); [ "$w" -gt 120 ] && w=120
  local len=${#text}
  pad=$(( (w - len) / 2 )); [ "$pad" -lt 0 ] && pad=0
  printf "%*s%s\n" "$pad" "" "$text"
}

# animação leve: aparece linha a linha
fade_in_lines() {
  local delay="${1:-0.01}"
  while IFS= read -r line; do
    printf "%s\n" "$line"
    sleep "$delay" 2>/dev/null || true
  done
}

# ─── Util ─────────────────────────────────────────────────────────────────
jsonfmt() {
  if have jq; then jq .
  elif have python3; then python3 -m json.tool
  else cat
  fi
}

# Token nunca escapa do subshell.
# Aceita as 3 variantes encontradas em ambientes diferentes do .env:
#   MULTIZAP_GATEWAY_TOKEN  (padrão novo)
#   ULTIZAP_GATEWAY_TOKEN   (typo histórico em produção)
#   GATEWAY_SERVER_TOKEN    (legado)
# Normaliza tudo para MULTIZAP_GATEWAY_TOKEN antes de executar o comando.
# Nunca imprime token, Bearer, .env nem secrets.
load_token_subshell() {
  (
    set +x
    local _tok=""
    if [ -f "$ENV_FILE" ]; then
      _tok=$(grep -E '^(MULTIZAP_GATEWAY_TOKEN|ULTIZAP_GATEWAY_TOKEN|GATEWAY_SERVER_TOKEN)=' "$ENV_FILE" \
        | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
    fi
    if [ -z "$_tok" ]; then
      echo "ERRO: token do Gateway não encontrado em $ENV_FILE (esperado MULTIZAP_GATEWAY_TOKEN, ULTIZAP_GATEWAY_TOKEN ou GATEWAY_SERVER_TOKEN)" >&2
      return 1
    fi
    export MULTIZAP_GATEWAY_TOKEN="$_tok"
    "$@"
  )
}

pre_check() {
  [ -f "$ENV_FILE" ] || { err "Arquivo $ENV_FILE não encontrado."; exit 1; }
  have pm2    || warn "pm2 ausente no PATH."
  have curl   || warn "curl ausente no PATH."
  have docker || warn "docker ausente no PATH."
}

# ─── Confirmação textual ─────────────────────────────────────────────────
confirm_text() {
  local action="$1"
  echo
  if [ "$UI" = "gum" ]; then
    gum style --foreground 226 --bold "Ação sensível: $action"
    gum style --foreground 244 "Digite exatamente: CONFIRMO"
    local typed
    typed=$(gum input --placeholder "CONFIRMO" --prompt "> ")
    [ "$typed" = "CONFIRMO" ]
  else
    printf "${C_YELLOW}${C_BOLD}Ação sensível:${C_RESET} %s\n" "$action"
    printf "${C_YELLOW}Digite exatamente: ${C_BOLD}CONFIRMO${C_RESET}\n"
    local typed; read -r -p "> " typed
    [ "$typed" = "CONFIRMO" ]
  fi
}

pause_key() {
  echo
  if [ "$UI" = "gum" ]; then
    gum input --placeholder "ENTER para voltar..." --prompt "" >/dev/null 2>&1 || true
  else
    read -r -p "Pressione ENTER para voltar..." _ || true
  fi
}

# ─── Cabeçalho ────────────────────────────────────────────────────────────
draw_header() {
  clear
  local w=$(term_cols)
  if [ "$w" -ge 70 ] && have figlet && have lolcat; then
    figlet -w "$w" -f standard "MULTIZAP" 2>/dev/null | lolcat -f 2>/dev/null \
      || figlet -w "$w" "MULTIZAP" 2>/dev
```