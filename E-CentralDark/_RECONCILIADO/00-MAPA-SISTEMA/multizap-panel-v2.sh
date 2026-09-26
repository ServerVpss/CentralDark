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
      || figlet -w "$w" "MULTIZAP" 2>/dev/null \
      || center "${C_BOLD}${C_GREEN}MULTIZAP — PAINEL V2${C_RESET}"
  elif [ "$w" -ge 50 ] && have figlet; then
    figlet -w "$w" -f small "MULTIZAP" 2>/dev/null
  else
    center "${C_BOLD}${C_GREEN}══ MULTIZAP — PAINEL V2 ══${C_RESET}"
  fi
  center "${C_DIM}Painel premium · Gateway + WuzAPI · $(date '+%Y-%m-%d %H:%M:%S')${C_RESET}"
  hr
}

# ─── Coletores rápidos ────────────────────────────────────────────────────
# Detecção robusta via jq (jlist real do PM2). Fallback Python.
# Retorna: "online" | "stopped" | "errored" | "" (= não encontrado)
get_pm2_status() {
  local out=""
  if have jq; then
    out=$(pm2 jlist 2>/dev/null \
      | jq -r --arg n "$PM2_NAME" \
          '[.[] | select(.name==$n) | .pm2_env.status] | first // ""' 2>/dev/null)
  fi
  if [ -z "$out" ] && have python3; then
    out=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
  for p in json.load(sys.stdin):
    if p.get('name')=='$PM2_NAME':
      print(p.get('pm2_env',{}).get('status','')); break
except: pass
" 2>/dev/null)
  fi
  printf '%s' "$out"
}
port_open() { ss -tulpn 2>/dev/null | grep -q ":$1 "; }
docker_wuzapi_running() {
  docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$DOCKER_WUZAPI_PATTERN"
}
get_pm2_uptime() {
  local out=""
  if have jq; then
    out=$(pm2 jlist 2>/dev/null \
      | jq -r --arg n "$PM2_NAME" \
          '[.[] | select(.name==$n) | .pm2_env.pm_uptime] | first // 0' 2>/dev/null \
      | awk '{t=$1/1000; now=systime(); s=now-t; if(s<=0){print "—"; exit} h=int(s/3600); m=int((s%3600)/60); printf "%dh%dm",h,m}')
  fi
  if [ -z "$out" ]; then
    out=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json,time
try:
  d=json.load(sys.stdin)
  for p in d:
    if p.get('name')=='$PM2_NAME':
      t=p.get('pm2_env',{}).get('pm_uptime',0)
      if t:
        s=int(time.time()-t/1000); h=s//3600; m=(s%3600)//60
        print(f'{h}h{m}m'); break
except: pass
" 2>/dev/null)
  fi
  [ -z "$out" ] && out="—"
  printf '%s' "$out"
}
get_last_commit() {
  if [ -d "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" log -1 --format='%h %s' 2>/dev/null | cut -c1-50
  else echo "—"; fi
}
get_last_deploy() {
  [ -f "$DEPLOY_LOG" ] || { echo "—"; return; }
  stat -c '%y' "$DEPLOY_LOG" 2>/dev/null | cut -c1-19
}
get_cpu()  { top -bn1 2>/dev/null | awk '/Cpu\(s\)/ {printf "%.1f%%",100-$8; exit}'; }
get_mem()  { free -h 2>/dev/null | awk '/Mem:/ {print $3"/"$2}'; }
get_disk() { df -h / 2>/dev/null | awk 'NR==2 {print $3"/"$2" ("$5")"}'; }

# ─── Card de status ───────────────────────────────────────────────────────
# Blocos grandes e legíveis. Pouco texto, só o essencial.
# COLS >=140 → 4 colunas · >=110 → 2x2 · <110 → empilhado
# LINES <35  → cards mais compactos (menos linhas em branco)
render_status_card() {
  local w h compact=0
  w=$(term_cols); h=$(term_rows)
  [ "$w" -gt 160 ] && w=160
  [ "$h" -lt 35 ] && compact=1

  local pm2_st pm2_line port3100 port8081 wuz_docker gw_health wuz_health gw_ok=0 pm2_inconsistent=0
  pm2_st=$(get_pm2_status)
  port_open 3100 && port3100="${C_GREEN}3100 OK${C_RESET}"   || port3100="${C_RED}3100 fechada${C_RESET}"
  port_open 8081 && port8081="${C_GREEN}8081 OK${C_RESET}"   || port8081="${C_RED}8081 fechada${C_RESET}"
  docker_wuzapi_running && wuz_docker="${C_GREEN}running${C_RESET}" || wuz_docker="${C_RED}parado${C_RESET}"
  if curl -sS --max-time 2 "$GATEWAY_URL/health" >/dev/null 2>&1; then
    gw_health="${C_GREEN}OK${C_RESET}"; gw_ok=1
  else gw_health="${C_RED}falhou${C_RESET}"; fi
  curl -sS --max-time 2 "$WUZAPI_URL/" >/dev/null 2>&1 \
    && wuz_health="${C_GREEN}OK${C_RESET}" || wuz_health="${C_RED}falhou${C_RESET}"

  # PM2 line + detecção de inconsistência
  if [ "$pm2_st" = "online" ]; then
    pm2_line="${C_GREEN}● ONLINE${C_RESET}"
  elif [ -z "$pm2_st" ]; then
    if [ "$gw_ok" -eq 1 ] && port_open 3100; then
      pm2_line="${C_YELLOW}● INCONSISTENTE${C_RESET}"; pm2_inconsistent=1
    else
      pm2_line="${C_RED}● não encontrado${C_RESET}"
    fi
  else
    if [ "$gw_ok" -eq 1 ] && port_open 3100; then
      pm2_line="${C_YELLOW}● INCONSISTENTE${C_RESET}"; pm2_inconsistent=1
    else
      pm2_line="${C_RED}● ${pm2_st}${C_RESET}"
    fi
  fi

  local commit deploy uptime cpu mem disk
  commit=$(get_last_commit); deploy=$(get_last_deploy); uptime=$(get_pm2_uptime)
  cpu=$(get_cpu); mem=$(get_mem); disk=$(get_disk)

  local b_gw b_wuz b_dep b_sis
  b_gw=$(cat <<EOF
${C_BOLD}${C_GREEN}🛰  GATEWAY${C_RESET}

PM2 ...... ${pm2_line}
Porta .... ${port3100}
Health ... ${gw_health}
Uptime ... ${C_BOLD}${uptime}${C_RESET}
EOF
)
  b_wuz=$(cat <<EOF
${C_BOLD}${C_CYAN}📡  WUZAPI${C_RESET}

Docker ... ${wuz_docker}
Porta .... ${port8081}
Health ... ${wuz_health}
EOF
)
  b_dep=$(cat <<EOF
${C_BOLD}${C_MAGENTA}🚀  DEPLOY${C_RESET}

Commit ... ${C_BOLD}${commit}${C_RESET}
Último ... ${deploy}
Branch ... main
EOF
)
  b_sis=$(cat <<EOF
${C_BOLD}${C_YELLOW}🖥  SISTEMA${C_RESET}

CPU ...... ${cpu:-?}
Memória .. ${mem:-?}
Disco .... ${disk:-?}
EOF
)

  if [ "$UI" = "gum" ]; then
    local pad="1 2"
    [ "$compact" -eq 1 ] && pad="0 2"
    local box_w
    # Sempre 2x2 (fileira de 2). Empilha só se terminal muito estreito (<70).
    if [ "$w" -ge 70 ]; then
      box_w=$(( (w-6) / 2 ))
      local r1 r2
      r1=$(gum join --horizontal \
        "$(echo "$b_gw"  | gum style --border thick --border-foreground 46  --padding "$pad" --width "$box_w")" \
        "$(echo "$b_wuz" | gum style --border thick --border-foreground 51  --padding "$pad" --width "$box_w")")
      r2=$(gum join --horizontal \
        "$(echo "$b_dep" | gum style --border thick --border-foreground 201 --padding "$pad" --width "$box_w")" \
        "$(echo "$b_sis" | gum style --border thick --border-foreground 226 --padding "$pad" --width "$box_w")")
      printf "%s\n%s\n" "$r1" "$r2"
    else
      box_w=$((w-4))
      echo "$b_gw"  | gum style --border thick --border-foreground 46  --padding "$pad" --width "$box_w"
      echo "$b_wuz" | gum style --border thick --border-foreground 51  --padding "$pad" --width "$box_w"
      echo "$b_dep" | gum style --border thick --border-foreground 201 --padding "$pad" --width "$box_w"
      echo "$b_sis" | gum style --border thick --border-foreground 226 --padding "$pad" --width "$box_w"
    fi
  else
    hr; echo "$b_gw"  | fade_in_lines 0.003
    hr; echo "$b_wuz" | fade_in_lines 0.003
    hr; echo "$b_dep" | fade_in_lines 0.003
    hr; echo "$b_sis" | fade_in_lines 0.003
    hr
  fi

  echo
  if [ "$pm2_inconsistent" -eq 1 ]; then
    warn "PM2 inconsistente — serviço responde na porta 3100 (health OK), mas pm2 jlist não reporta '$PM2_NAME' online."
    warn "Sugestão: 'pm2 status' para conferir; provavelmente o processo foi iniciado fora do PM2 ou com outro nome."
  elif [ "$pm2_st" != "online" ] && [ "$gw_ok" -eq 0 ]; then
    err "ALERTA: Gateway PM2 não está online"
  fi
  port_open 3100 || err "ALERTA: porta 3100 fechada"
  port_open 8081 || warn "ALERTA: porta 8081 (WuzAPI) fechada"
}

# ─── Rodapé com legenda de atalhos ───────────────────────────────────────
render_footer() {
  local w=$(term_cols)
  hr
  if [ "$w" -ge 80 ]; then
    printf "${C_DIM}↑/↓${C_RESET} navegar   ${C_DIM}Enter${C_RESET} executar   ${C_DIM}/${C_RESET} buscar   ${C_DIM}Esc${C_RESET} sair   ${C_DIM}Ctrl+C${C_RESET} forçar saída\n"
  else
    printf "${C_DIM}↑/↓ navegar · Enter executar · Esc sair${C_RESET}\n"
  fi
}

# ─── Ações (mantidas, com transições suaves) ─────────────────────────────
transition() {
  if [ "$UI" = "gum" ]; then
    gum spin --spinner dot --title "${1:-Carregando...}" -- sleep 0.25
  fi
}

act_status() {
  transition "Coletando status..."
  draw_header; render_status_card
  info "Recargas Brasil (porta 3000 — não tocado pelo MultiZap):"
  port_open 3000 && ok "porta 3000 aberta — intacta" || warn "porta 3000 fechada (verificar se é esperado)"
  pause_key
}

act_diag() {
  transition "Consultando diagnóstico..."
  draw_header
  printf "${C_BOLD}Instâncias QR — diagnóstico${C_RESET}\n"; hr
  local resp
  resp=$(load_token_subshell bash -c '
    curl -sS --max-time 8 \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/__diag/wuzapi"
  ' 2>/dev/null)
  if [ -z "$resp" ]; then err "Sem resposta do /__diag/wuzapi"; pause_key; return; fi
  if have jq; then
    printf "${C_BOLD}CONN     LOGGED  SESSION  WEBHOOK  EVENTS  ÚLTIMO                STATUS${C_RESET}\n"
    echo "$resp" | jq -r '.connections[]? |
      [(.connection_id // "—")[0:8],
       (.logged_in|tostring),(.session_connected|tostring),
       (.webhook_configured|tostring),(.events_configured|tostring),
       (.last_webhook_at // "nunca"),
       (if .logged_in==false then "🔴 inválido"
        elif (.webhook_configured==false or .events_configured==false) then "🟡 reconectar"
        elif (.logged_in==true and .session_connected==true) then "🟢 conectado"
        else "🟡 parcial" end)] | @tsv' | column -t -s $'\t'
  else
    echo "$resp" | jsonfmt
  fi
  pause_key
}

act_logs_live() {
  draw_header
  info "Logs ao vivo de $PM2_NAME (Ctrl+C pra sair)"; hr
  if have ccze; then pm2 logs "$PM2_NAME" --lines 0 --raw 2>&1 | ccze -A
  else pm2 logs "$PM2_NAME" --lines 0; fi
}

act_logs_recent() {
  transition "Carregando logs..."
  draw_header
  info "Últimos 80 logs"; hr
  if have bat; then pm2 logs "$PM2_NAME" --lines 80 --nostream 2>&1 | bat --paging=never --style=plain
  else pm2 logs "$PM2_NAME" --lines 80 --nostream; fi
  pause_key
}

act_logs_errors() {
  transition "Filtrando erros..."
  draw_header
  info "Logs com filtro de erro (últimas 500 linhas)"; hr
  local rg_cmd="grep -iE"; have rg && rg_cmd="rg -i"
  pm2 logs "$PM2_NAME" --lines 500 --nostream 2>&1 \
    | $rg_cmd "error|err|fail|exception|denied|timeout|ECONN|ENOTFOUND|5[0-9]{2}" \
    || info "Nenhum erro encontrado."
  pause_key
}

act_flush() {
  draw_header
  confirm_text "limpar logs do $PM2_NAME (pm2 flush)" || { info "Cancelado."; pause_key; return; }
  pm2 flush "$PM2_NAME" && ok "Logs limpos."
  pause_key
}

act_restart_gateway() {
  draw_header
  confirm_text "reiniciar Gateway ($PM2_NAME)" || { info "Cancelado."; pause_key; return; }
  if [ "$UI" = "gum" ]; then
    gum spin --spinner dot --title "Reiniciando $PM2_NAME..." -- pm2 restart "$PM2_NAME" --update-env >/dev/null
  else pm2 restart "$PM2_NAME" --update-env; fi
  ok "Gateway reiniciado."
  pause_key
}

act_restart_wuzapi() {
  draw_header
  [ -f "$WUZAPI_COMPOSE" ] || { err "Compose não encontrado em $WUZAPI_COMPOSE"; pause_key; return; }
  confirm_text "reiniciar container WuzAPI (docker compose restart wuzapi)" || { info "Cancelado."; pause_key; return; }
  if [ "$UI" = "gum" ]; then
    gum spin --spinner dot --title "Reiniciando WuzAPI..." -- docker compose -f "$WUZAPI_COMPOSE" restart wuzapi >/dev/null
  else docker compose -f "$WUZAPI_COMPOSE" restart wuzapi; fi
  ok "WuzAPI reiniciada."
  pause_key
}

act_reapply_webhooks() {
  transition "Reaplicando webhooks..."
  draw_header
  info "Reaplicando webhooks em todas as conexões"; hr
  load_token_subshell bash -c '
    curl -sS --max-time 30 -X POST \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/connections/repair-all-webhooks"
  ' | jsonfmt
  pause_key
}

act_validate_logs() {
  transition "Auditando logs..."
  draw_header
  info "Validando segurança dos logs (últimas 200 linhas)"; hr
  local logs leaks=0
  logs=$(pm2 logs "$PM2_NAME" --lines 200 --nostream 2>/dev/null)
  check() {
    local label="$1" pat="$2" count
    count=$(echo "$logs" | grep -Ec "$pat" 2>/dev/null || true); count=${count:-0}
    if [ "$count" -gt 0 ]; then warn "$label: $count ocorrência(s)"; leaks=$((leaks+count))
    else ok "$label: limpo"; fi
  }
  check "secret="              "secret="
  check "Bearer token bruto"   "Bearer [A-Za-z0-9_-]{20,}"
  check "URL de mídia WA"      "mmg\\.whatsapp\\.net"
  check "JID privado completo" "[0-9]{10,}:[0-9]+@s\\.whatsapp\\.net"
  echo
  [ "$leaks" -eq 0 ] && ok "Logs seguros." || warn "Possível vazamento — revisar logger."
  pause_key
}

act_health_gateway() {
  transition "Verificando Gateway..."
  draw_header; info "Healthcheck Gateway"; hr
  curl -sS --max-time 5 "$GATEWAY_URL/health" | jsonfmt
  pause_key
}

act_health_wuzapi() {
  transition "Verificando WuzAPI..."
  draw_header; info "Healthcheck WuzAPI (via Gateway)"; hr
  load_token_subshell bash -c '
    curl -sS --max-time 8 \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/api/system/wuzapi-health"
  ' | jsonfmt
  pause_key
}

act_deploy() {
  draw_header
  [ -x /usr/local/bin/multizap-gh-pull ] || { err "/usr/local/bin/multizap-gh-pull não encontrado."; pause_key; return; }
  confirm_text "deploy forçado (multizap-gh-pull --force)" || { info "Cancelado."; pause_key; return; }
  /usr/local/bin/multizap-gh-pull --force
  pause_key
}

act_disk() {
  transition "Lendo disco..."
  draw_header; info "Espaço em disco"; hr
  df -h | head -20
  echo; info "Top 10 pastas em /root/Multizap:"
  [ -d /root/Multizap ] && du -sh /root/Multizap/* 2>/dev/null | sort -hr | head -10
  pause_key
}

act_pm2() {
  transition "Listando processos..."
  draw_header; info "Processos PM2"; hr
  pm2 status
  pause_key
}

act_btop() {
  if have btop; then btop
  elif have htop; then htop
  else draw_header; err "btop/htop não instalado."; pause_key; fi
}

act_help() {
  draw_header
  cat <<EOF | fade_in_lines 0.006
${C_BOLD}AJUDA — MULTIZAP PANEL V2${C_RESET}

${C_BOLD}Atalhos:${C_RESET}
  ↑/↓ ........ navegar     Enter ...... executar
  /   ........ buscar      Esc ........ voltar / sair
  Ctrl+C ..... forçar saída

${C_BOLD}Menu principal:${C_RESET}
  ${C_GREEN}Status geral${C_RESET} ......... visão consolidada: PM2, portas, health, deploy
  ${C_GREEN}Diagnóstico QR${C_RESET} ....... conexões QR (logged/session/webhook)
  ${C_GREEN}Logs${C_RESET} .................. submenu: ao vivo · últimos 80 · filtro erro
                            validar segurança · limpar
  ${C_GREEN}Deploy${C_RESET} ................ submenu: healthcheck GW/Wuz · deploy forçado
                            atualizar painel V2
  ${C_GREEN}Manutenção${C_RESET} ........... submenu: recarregar GW · WuzAPI · webhooks
  ${C_GREEN}Sistema${C_RESET} .............. submenu: pm2 status · disco · btop/htop
  ${C_GREEN}Atualizar painel${C_RESET} ..... pull GitHub + reinstala + reabre (1 comando)

${C_BOLD}Ações destrutivas (pedem CONFIRMO):${C_RESET}
  · Limpar logs (pm2 flush)
  · Recarregar Gateway / WuzAPI
  · Deploy forçado (multizap-gh-pull --force)

${C_BOLD}Detecção PM2:${C_RESET}
  Usa 'pm2 jlist' + jq, filtrando por '$PM2_NAME'.
  Se pm2 disser offline mas health/porta OK → mostra ${C_YELLOW}INCONSISTENTE${C_RESET}
  (serviço está rodando, só não via PM2 ou com outro nome).

${C_BOLD}Segurança:${C_RESET}
  · NÃO toca: Recargas, /root/whatsapp-server, PM2 whatsapp-server, porta 3000
  · NÃO usa pm2 restart all nem docker compose down -v
  · Tokens e .env nunca são impressos

${C_BOLD}Responsivo:${C_RESET}
  · 4 cards lado a lado quando largura ≥ 140 colunas
  · 2x2 quando ≥ 110 colunas · empilhado abaixo disso
  · Compacto quando altura < 35 linhas

${C_BOLD}UI ativa:${C_RESET} $UI · ${C_BOLD}Terminal:${C_RESET} $(term_cols)x$(term_rows)
EOF
  pause_key
}

# ─── Auto-update do painel ───────────────────────────────────────────────
act_self_update() {
  draw_header
  printf "${C_BOLD}Atualizar painel (auto)${C_RESET}\n"; hr
  if [ ! -x /usr/local/bin/painel-atualizar ]; then
    err "/usr/local/bin/painel-atualizar não encontrado."
    info "Crie com: cp /root/Multizap/scripts/painel-atualizar.sh /usr/local/bin/painel-atualizar && chmod +x /usr/local/bin/painel-atualizar"
    pause_key; return
  fi
  confirm_text "atualizar painel V2 (pull + reinstalar + reabrir)" \
    || { info "Cancelado."; pause_key; return; }
  exec /usr/local/bin/painel-atualizar
}

# ─── Menu agrupado ────────────────────────────────────────────────────────
# Tela principal mostra só categorias grandes. Detalhes em submenus.
# Descrições completas só em Ajuda.

exit_panel() { clear; printf "${C_GREEN}Até a próxima.${C_RESET}\n"; exit 0; }
back_panel() { :; }  # marker: voltar pro menu anterior

# ─── LOGS E MONITORAMENTO (somente leitura) ───────────────────────────────
DEPLOY_LOG_FILE="/var/log/multizap-gh-pull.log"
WEBHOOK_PM2="MultiZap-GitHub-Webhook"
WUZAPI_CONTAINER="multizap-gateway-wuzapi-1"

# Mascara tokens/secrets antes de mostrar no terminal.
mask_secrets() {
  sed -E \
    -e 's/(token|secret|bearer|authorization|service_role|apikey|api_key|password)[[:space:]]*[:=][[:space:]]*"?[A-Za-z0-9._\-]+/\1=****/Ig' \
    -e 's/Bearer[[:space:]]+[A-Za-z0-9._\-]+/Bearer ****/Ig'
}

act_log_deploy_recent() {
  draw_header; info "Deploy automático — últimas atualizações pelo GitHub"; hr
  if [ -f "$DEPLOY_LOG_FILE" ]; then
    tail -n 120 "$DEPLOY_LOG_FILE" | mask_secrets
  else
    warn "Log de deploy ainda não existe ($DEPLOY_LOG_FILE)."
  fi
  pause_key
}
act_log_deploy_live() {
  draw_header; info "Deploy ao vivo (pressione Ctrl+C pra sair)"; hr
  if [ -f "$DEPLOY_LOG_FILE" ]; then
    tail -f "$DEPLOY_LOG_FILE" | mask_secrets
  else
    warn "Log de deploy não existe ($DEPLOY_LOG_FILE)."
    pause_key
  fi
}
act_log_webhook_github() {
  draw_header; info "GitHub Webhook — chamadas recebidas do GitHub"; hr
  pm2 logs "$WEBHOOK_PM2" --lines 120 --nostream 2>&1 | mask_secrets
  pause_key
}
act_log_gateway_recent() {
  draw_header; info "Gateway MultiZap — envio/recebimento de mensagens"; hr
  pm2 logs "$PM2_NAME" --lines 120 --nostream 2>&1 | mask_secrets
  pause_key
}
act_log_wuzapi_docker() {
  draw_header; info "WuzAPI — eventos diretos da conexão QR"; hr
  docker logs --tail 120 "$WUZAPI_CONTAINER" 2>&1 | mask_secrets
  pause_key
}
act_log_gateway_errors() {
  draw_header; info "Erros recentes do Gateway"; hr
  pm2 logs "$PM2_NAME" --err --lines 120 --nostream 2>&1 | mask_secrets
  pause_key
}
act_log_webhook_errors() {
  draw_header; info "Erros do deploy automático (webhook GitHub)"; hr
  pm2 logs "$WEBHOOK_PM2" --err --lines 120 --nostream 2>&1 | mask_secrets
  pause_key
}
act_pm2_list() {
  draw_header; info "Processos PM2 — serviços ligados/desligados"; hr
  pm2 list
  pause_key
}
act_ports_check() {
  draw_header; info "Portas importantes do MultiZap"; hr
  ss -tlnp 2>/dev/null | grep -E ':3100|:9002|:8081|:443|:80' \
    || warn "Nenhuma porta esperada encontrada."
  pause_key
}



# Renderiza um menu (label → fn) com gum/whiptail/numérico.
# Args: título, e depois pares "Label" funcao_nome.
render_menu() {
  local title="$1"; shift
  local labels=() fns=() i
  while [ "$#" -gt 0 ]; do
    labels+=("$1"); fns+=("$2"); shift 2
  done

  local n=${#labels[@]}
  if [ "$UI" = "gum" ]; then
    local h menu_h items=()
    h=$(term_rows); menu_h=$((h-22))
    [ "$menu_h" -lt 8 ] && menu_h=8
    [ "$menu_h" -gt 22 ] && menu_h=22
    for i in $(seq 0 $((n-1))); do
      items+=("  ${labels[$i]}")
    done
    local choice
    # Só flags básicas — versões antigas do gum quebram com --item.foreground
    # / --selected.foreground / --cursor.foreground; quando quebra, retorna
    # vazio e o submenu fechava sem executar nada.
    choice=$(printf '%s\n' "${items[@]}" \
      | gum choose --height "$menu_h" --cursor "▸  " \
          --header "$title")
    [ -z "$choice" ] && return 1
    for i in $(seq 0 $((n-1))); do
      [ "${items[$i]}" = "$choice" ] && { "${fns[$i]}"; return 0; }
    done
    return 1
  elif [ "$UI" = "whiptail" ]; then
    local w h items=()
    w=$(term_cols); h=$(term_rows)
    [ "$w" -gt 80 ] && w=80; [ "$h" -gt 28 ] && h=28
    for i in $(seq 0 $((n-1))); do
      items+=("$i" "${labels[$i]}")
    done
    local pick
    pick=$(whiptail --title "$title" --menu "" "$h" "$w" $((h-10)) "${items[@]}" 3>&1 1>&2 2>&3) || return 1
    "${fns[$pick]}"
  else
    echo
    printf "${C_BOLD}%s${C_RESET}\n" "$title"; hr
    for i in $(seq 0 $((n-1))); do
      printf "  ${C_BOLD}%2d)${C_RESET}  %s\n\n" "$i" "${labels[$i]}"
    done
    read -r -p "Opção: " pick
    [[ "$pick" =~ ^[0-9]+$ ]] || { warn "Opção inválida."; pause_key; return 0; }
    [ "$pick" -ge 0 ] && [ "$pick" -lt "$n" ] || { warn "Fora da faixa."; pause_key; return 0; }
    "${fns[$pick]}"
  fi
}

# ─── Submenus ────────────────────────────────────────────────────────────
sub_logs() {
  draw_header
  render_menu "📜  LOGS" \
    "Logs ao vivo"            act_logs_live \
    "Últimos 80 logs"         act_logs_recent \
    "Filtro de erro"          act_logs_errors \
    "Validar logs seguros"    act_validate_logs \
    "Limpar logs (CONFIRMA)"  act_flush \
    "← Voltar"                back_panel
}
sub_deploy() {
  draw_header
  render_menu "🚀  DEPLOY" \
    "Healthcheck Gateway"           act_health_gateway \
    "Healthcheck WuzAPI"            act_health_wuzapi \
    "Deploy forçado (CONFIRMA)"     act_deploy \
    "Atualizar painel V2 (AUTO)"    act_self_update \
    "← Voltar"                      back_panel
}
sub_manut() {
  draw_header
  render_menu "🛠   MANUTENÇÃO" \
    "Recarregar Gateway (CONFIRMA)" act_restart_gateway \
    "Recarregar WuzAPI (CONFIRMA)"  act_restart_wuzapi \
    "Reaplicar webhooks"            act_reapply_webhooks \
    "← Voltar"                      back_panel
}
sub_sistema() {
  draw_header
  render_menu "🖥   SISTEMA" \
    "Processos PM2 (pm2 status)"   act_pm2 \
    "Espaço em disco"              act_disk \
    "Monitor btop/htop"            act_btop \
    "← Voltar"                     back_panel
}

# ─── Menu principal (plano, com todas as opções visíveis) ──────────────────
# separador clicável que não executa nada
noop() { :; }

run_main_menu() {
  draw_header
  render_status_card
  echo
  render_menu "MENU PRINCIPAL" \
    "● Status geral"                       act_status \
    "● Diagnóstico QR"                     act_diag \
    "─── LOGS ───────────────────────"     noop \
    "  Logs ao vivo"                       act_logs_live \
    "  Últimos 80 logs"                    act_logs_recent \
    "  Filtro de erro"                     act_logs_errors \
    "  Validar logs seguros"               act_validate_logs \
    "  Limpar logs (CONFIRMA)"             act_flush \
    "─── DEPLOY ─────────────────────"     noop \
    "  Healthcheck Gateway"                act_health_gateway \
    "  Healthcheck WuzAPI"                 act_health_wuzapi \
    "  Deploy forçado (CONFIRMA)"          act_deploy \
    "  Atualizar painel V2 (AUTO)"         act_self_update \
    "─── MANUTENÇÃO ─────────────────"     noop \
    "  Recarregar Gateway (CONFIRMA)"      act_restart_gateway \
    "  Recarregar WuzAPI (CONFIRMA)"       act_restart_wuzapi \
    "  Reaplicar webhooks"                 act_reapply_webhooks \
    "─── SISTEMA ────────────────────"     noop \
    "  Processos PM2 (pm2 status)"         act_pm2 \
    "  Espaço em disco"                    act_disk \
    "  Monitor btop/htop"                  act_btop \
    "─── LOGS E MONITORAMENTO ───────"     noop \
    "  Deploy automático (últimos)"        act_log_deploy_recent \
    "  Deploy ao vivo"                     act_log_deploy_live \
    "  GitHub Webhook (chamadas)"          act_log_webhook_github \
    "  Gateway MultiZap (mensagens)"       act_log_gateway_recent \
    "  WuzAPI (eventos QR)"                act_log_wuzapi_docker \
    "  Erros do Gateway"                   act_log_gateway_errors \
    "  Erros do Webhook GitHub"            act_log_webhook_errors \
    "  Processos PM2 (ligados?)"           act_pm2_list \
    "  Portas importantes"                 act_ports_check \
    "─── AJUDA ──────────────────────"     noop \
    "  Ajuda / atalhos"                    act_help \
    "  Sair"                               exit_panel
}

main_loop() {
  while true; do
    run_main_menu || true   # Esc no menu apenas redesenha — só sai via "Sair"
  done
}

# Re-render quando a janela é redimensionada (SIGWINCH)
on_resize() { :; }   # próximo loop já vai redesenhar com novo tamanho
trap on_resize WINCH
trap exit_panel INT

pre_check
main_loop
