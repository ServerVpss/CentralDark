# OUTRO - install-connect.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\installer\install-connect.sh
**SHA:** 12327d971f33468c
**Timestamp:** 2026-08-26T19:32:46.714399
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start="$(date +%s)"
- cycle_start="$(date +%s)"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================================
#  install-connect.sh — Conectar Cloudflare pelo celular via QR no terminal
# ----------------------------------------------------------------------------
#  Fluxo:
#    1) POST https://install.centralldark.com/session/new
#    2) Imprime URL grande + QR code no terminal SSH
#    3) Você escaneia com o celular -> autoriza (OAuth ou 1-Click Token)
#    4) Script fica em long-poll GET /session/<id>?wait=25 até concluir
#    5) Backend já grava o cofre em /root/CentralDark/secrets/cloudflare.env
#
#  Sem dependências obrigatórias. Usa `qrencode` se existir (apt install qrencode),
#  caso contrário cai num QR ASCII via API pública goqr.me só pra visualização —
#  mas o link curto sempre é impresso pra você abrir manual também.
# ============================================================================
set -uo pipefail

PUBLIC_URL="${INSTALL_PUBLIC_URL:-https://install.centralldark.com}"
TIMEOUT_TOTAL="${INSTALL_CONNECT_TIMEOUT:-600}"   # 10 min — bate com TTL da sessão
REFRESH_QR_SECONDS="${INSTALL_CONNECT_REFRESH:-600}"  # NÃO rotacionar SID — bate com TIMEOUT_TOTAL. Renovar SID no meio do OAuth descarta a autorização que tava sendo feita no celular.

# Cores (só se terminal)
if [ -t 1 ]; then
  GREEN=$'\033[1;32m'; CYAN=$'\033[1;36m'; YEL=$'\033[1;33m'
  RED=$'\033[1;31m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; WHITE=$'\033[1;97m'; RST=$'\033[0m'
  MAGENTA=$'\033[1;35m'; BLUE=$'\033[1;34m'; ORANGE=$'\033[38;5;208m'; PINK=$'\033[38;5;213m'
else
  GREEN=""; CYAN=""; YEL=""; RED=""; DIM=""; BOLD=""; WHITE=""; RST=""
  MAGENTA=""; BLUE=""; ORANGE=""; PINK=""
fi

say()  { printf "%s%s%s\n" "$CYAN" "$*" "$RST"; }
ok()   { printf "%s✔%s %s\n" "$GREEN" "$RST" "$*"; }
warn() { printf "%s!%s %s\n" "$YEL" "$RST" "$*"; }
die()  { printf "%s✗%s %s\n" "$RED" "$RST" "$*" >&2; exit 1; }

banner() {
  # Título colorido palavra por palavra + ponto de "loading" animado no fim.
  # O ponto recebe um frame diferente a cada chamada pra dar sensação de carregando.
  local dot="${1:-●}"
  printf "%s╔══════════════════════════════════════════════════════════════╗%s\n" "$GREEN" "$RST"
  printf "%s║%s        " "$GREEN" "$RST"
  printf "%sCENTRALDARK%s " "$GREEN" "$RST"
  printf "%s·%s " "$DIM" "$RST"
  printf "%sCONNECT%s " "$CYAN" "$RST"
  printf "%sWIZARD%s " "$MAGENTA" "$RST"
  printf "%s(%s%sQR%s%s · %sCELULAR%s%s)%s " "$DIM" "$RST" "$YEL" "$RST" "$DIM" "$ORANGE" "$RST" "$DIM" "$RST"
  printf "%s%s%s" "$PINK" "$dot" "$RST"
  printf "  %s║%s\n" "$GREEN" "$RST"
  printf "%s╠══════════════════════════════════════════════════════════════╣%s\n" "$GREEN" "$RST"
  printf "%s║%s  %sVocê vai conectar a Cloudflare sem digitar nada no SSH.%s     %s║%s\n" \
    "$GREEN" "$RST" "$WHITE" "$RST" "$GREEN" "$RST"
  printf "%s║%s  %sEscaneie o QR abaixo com a câmera do celular e autorize.%s    %s║%s\n" \
    "$GREEN" "$RST" "$WHITE" "$RST" "$GREEN" "$RST"
  printf "%s╚══════════════════════════════════════════════════════════════╝%s\n" "$GREEN" "$RST"
}

require_curl() { command -v curl >/dev/null 2>&1 || die "curl é obrigatório"; }

# Extrai um campo JSON simples ("foo":"bar") sem jq.
json_field() {
  local key="$1" body="$2"
  printf '%s' "$body" \
    | sed -n 's/.*"'"$key"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
    | head -n 1
}

print_qr_local() {
  local url="$1"
  # qrencode é leve (pacote `qrencode` no apt). Modo UTF8 fica lindo no SSH.
  qrencode -t UTF8 -m 1 "$url"
}

print_qr_remote() {
  local url="$1"
  # Fallback: pede um SVG/PNG não rola no terminal, mas a goqr.me devolve
  # ASCII bem decente em /api/v1/?... text. Quando não tem qrencode nem internet,
  # mostramos só o link.
  local enc
  enc="$(printf '%s' "$url" | sed -e 's/ /%20/g' -e 's/:/%3A/g' -e 's|/|%2F|g' -e 's/?/%3F/g' -e 's/=/%3D/g' -e 's/&/%26/g')"
  curl -fsS --max-time 8 "https://qrcode.show/${url}" 2>/dev/null \
    || curl -fsS --max-time 8 -H "Accept: text/plain" "https://qrenco.de/${enc}" 2>/dev/null \
    || return 1
}

print_qr() {
  local url="$1"
  if command -v qrencode >/dev/null 2>&1; then
    print_qr_local "$url"
  else
    warn "qrencode não instalado (apt install qrencode) — tentando QR remoto."
    print_qr_remote "$url" || warn "Sem QR. Use o link logo abaixo."
  fi
}

repeat_char() {
  local char="$1" count="$2"
  [ "$count" -le 0 ] && return 0
  printf '%*s' "$count" '' | tr ' ' "$char"
}

line_width() {
  printf '%s' "$1" | wc -m | tr -d ' '
}

print_qr_box() {
  local url="$1" qr_text line max_width pad
  local -a qr_lines=()

  command -v qrencode >/dev/null 2>&1 || return 1
  qr_text="$(print_qr "$url" 2>/dev/null || true)"
  [ -n "$qr_text" ] || return 1

  while IFS= read -r line; do
    qr_lines+=("$line")
    pad="$(line_width "$line")"
    [ "$pad" -gt "${max_width:-0}" ] && max_width="$pad"
  done <<< "$qr_text"

  max_width="${max_width:-0}"
  # 3 espaços de respiro de cada lado pra moldura não grudar nos blocos do QR
  local inner=$((m
```