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
  local inner=$((max_width + 6))

  # Topo
  printf "%s╔" "$GREEN"
  repeat_char "═" "$inner"
  printf "╗%s\n" "$RST"

  # Linha em branco de respiro superior
  printf "%s║%s%*s%s║%s\n" "$GREEN" "$RST" "$inner" '' "$GREEN" "$RST"

  for line in "${qr_lines[@]}"; do
    pad=$((max_width - $(line_width "$line")))
    printf "%s║%s   %s%s%s%*s   %s║%s\n" \
      "$GREEN" "$RST" "$WHITE" "$line" "$RST" "$pad" '' "$GREEN" "$RST"
  done

  # Linha em branco de respiro inferior
  printf "%s║%s%*s%s║%s\n" "$GREEN" "$RST" "$inner" '' "$GREEN" "$RST"

  # Base
  printf "%s╚" "$GREEN"
  repeat_char "═" "$inner"
  printf "╝%s\n" "$RST"
}

print_waiting_line() {
  local restante="$1" frame="$2"
  # Cicla a cor da frase pra dar sensação de "respirando / aguardando"
  local -a cores=("$CYAN" "$MAGENTA" "$ORANGE" "$YEL" "$PINK")
  local cor_idx=$((restante % ${#cores[@]}))
  local cor_atual="${cores[$cor_idx]}"
  printf "  %s%s%s %s%s%s %sAguardando autorização no celular%s %s· renova em %ss · sessão %s%s\r" \
    "$YEL" "$frame" "$RST" "$cor_atual" "$frame" "$RST" "$WHITE" "$RST" "$DIM" "$restante" "${SID:0:8}" "$RST"
}

open_session() {
  # Cria uma sessão nova e popula as variáveis globais SID/CONNECT_URL/OAUTH_URL/TTL.
  # Tenta detectar o IP público da VPS pra já mandar pro backend — assim a página
  # de escolha de zona já mostra "DNS vai apontar pra <ip>" e o cofre fica pronto
  # pro --cloudflare-apply rodar sem intervenção manual.
  local ip resp
  ip="${INSTALL_TARGET_IP:-}"
  if [ -z "$ip" ]; then
    ip="$(curl -fsS --max-time 4 https://api.ipify.org 2>/dev/null || true)"
  fi
  if [ -z "$ip" ]; then
    ip="$(curl -fsS --max-time 4 https://ifconfig.me 2>/dev/null || true)"
  fi
  local body='{}'
  [ -n "$ip" ] && body="{\"target_ip\":\"$ip\"}"
  resp="$(curl -fsS -X POST "${PUBLIC_URL}/session/new" \
            -H 'Content-Type: application/json' -d "$body" )" \
    || die "Não consegui falar com ${PUBLIC_URL}. DNS/Caddy ok?"
  SID="$(json_field session_id  "$resp")"
  CONNECT_URL="$(json_field connect_url "$resp")"
  OAUTH_URL="$(json_field oauth_url   "$resp")"
  TTL="$(json_field ttl_seconds "$resp")"
  [ -n "$SID" ]         || die "Resposta sem session_id: $resp"
  [ -n "$CONNECT_URL" ] || die "Resposta sem connect_url: $resp"
}


print_qr_screen() {
  # Limpa só o miolo (mantém o banner do topo se o terminal não suportar clear).
  if [ -t 1 ]; then printf "\033[2J\033[H"; fi
  # Frame do ponto animado no título, varia a cada redraw
  local -a dots=('●' '◐' '◑' '◒' '◓' '○')
  local dot_idx=$(( ($(date +%s) ) % ${#dots[@]} ))
  banner "${dots[$dot_idx]}"
  printf "\n%s%s✦ %sEscaneie %scom o %scelular%s ✦%s\n\n" \
    "$BOLD" "$CYAN" "$MAGENTA" "$YEL" "$ORANGE" "$CYAN" "$RST"
  if ! print_qr_box "$CONNECT_URL"; then
    print_qr "$CONNECT_URL"
  fi
  echo
  printf "%sLink curto:%s %s%s%s\n" "$GREEN" "$RST" "$WHITE" "$CONNECT_URL" "$RST"
  [ -n "$OAUTH_URL" ] && printf "%sOAuth direto:%s %s%s%s\n" "$CYAN" "$RST" "$WHITE" "$OAUTH_URL" "$RST"
  printf "%sSessão:%s %s%s…%s  %sTTL:%s %ss  %sQR:%s gira a cada %ss\n" \
    "$DIM" "$RST" "$WHITE" "${SID:0:10}" "$RST" "$DIM" "$RST" "${TTL:-600}" "$DIM" "$RST" "$REFRESH_QR_SECONDS"
  echo
  printf "%s%s⌛ %sAguardando %svocê %sautorizar %spelo %scelular%s...%s\n" \
    "$BOLD" "$YEL" "$CYAN" "$MAGENTA" "$ORANGE" "$PINK" "$BLUE" "$YEL" "$RST"
}

main() {
  require_curl
  local start now elapsed cycle_start status_resp status_val token_fp account_id kind restante
  local -a frames=('◜' '◝' '◞' '◟')
  local frame_idx=0
  start="$(date +%s)"

  while :; do
    now="$(date +%s)"; elapsed=$((now - start))
    [ "$elapsed" -ge "$TIMEOUT_TOTAL" ] \
      && die "Sessão expirou sem autorização (>${TIMEOUT_TOTAL}s)."

    open_session
    print_qr_screen
    cycle_start="$(date +%s)"

    # Polling do ciclo atual: faz long-poll curto (wait=5) até estourar o REFRESH.
    while :; do
      now="$(date +%s)"
      if [ $((now - cycle_start)) -ge "$REFRESH_QR_SECONDS" ]; then
        printf "%s· renovando QR ...%s\n" "$DIM" "$RST"
        break
      fi
      if [ $((now - start)) -ge "$TIMEOUT_TOTAL" ]; then
        die "Sessão expirou sem autorização (>${TIMEOUT_TOTAL}s)."
      fi
      status_resp="$(curl -fsS --max-time 8 "${PUBLIC_URL}/session/${SID}?wait=5" || echo '')"
      status_val="$(json_field status "$status_resp")"
      case "$status_val" in
        done)
          token_fp="$(json_field fingerprint "$status_resp")"
          account_id="$(json_field account_id "$status_resp")"
          kind="$(json_field kind "$status_resp")"
          echo
          ok "Cloudflare conectada (${kind:-token})"
          printf "  %sToken:%s %s\n"   "$DIM" "$RST" "${token_fp:-???}"
          printf "  %sAccount:%s %s\n" "$DIM" "$RST" "${account_id:-(detectar depois)}"
          printf "  %sCofre:%s /root/CentralDark/secrets/cloudflare.env (chmod 600)\n" "$DIM" "$RST"
          echo
          # Pula passo manual: já roda o próximo estágio (DNS apply + sync) sozinho.
          # Pra desligar: export CD_NO_AUTO_APPLY=1 antes de chamar.
          if [ "${CD_NO_AUTO_APPLY:-0}" = "1" ]; then
            ok "Pronto — pode rodar:  ./install.sh --cloudflare-apply"
            exit 0
          fi
          local installer_sh="${INSTALL_SH:-./install.sh}"
          if [ ! -x "$installer_sh" ] && [ -x "/root/install.sh" ]; then
            installer_sh="/root/install.sh"
          fi
          if [ -x "$installer_sh" ]; then
            printf "%s▶ continuando instalação automaticamente (Ctrl+C cancela em 3s)...%s\n" "$DIM" "$RST"
            sleep 3
            exec "$installer_sh" --cloudflare-apply
          else
            ok "Pronto — pode rodar:  ./install.sh --cloudflare-apply"
            exit 0
          fi
          ;;
        pending|"")
          restante=$((REFRESH_QR_SECONDS - (now - cycle_start)))
          [ "$restante" -lt 0 ] && restante=0
          print_waiting_line "$restante" "${frames[$frame_idx]}"
          frame_idx=$(((frame_idx + 1) % ${#frames[@]}))
          ;;
        *)
          # Sessão sumiu (404 etc) — quebra o ciclo pra abrir nova.
          printf "%s· sessão perdida (%s), abrindo nova ...%s\n" "$DIM" "$status_val" "$RST"
          break
          ;;
      esac
    done
  done
}

main "$@"
