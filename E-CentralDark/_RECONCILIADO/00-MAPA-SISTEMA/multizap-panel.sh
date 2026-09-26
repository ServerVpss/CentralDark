#!/usr/bin/env bash
# multizap-panel — Painel interativo do MultiZap Gateway + WuzAPI
# Regras de ouro:
#   - NUNCA toca em /root/whatsapp-server, PM2 whatsapp-server, porta 3000, webhook 9001
#   - NUNCA imprime tokens/secrets/.env
#   - Ações destrutivas exigem confirmação textual exata
set -uo pipefail

ENV_FILE="/root/Multizap/gateway/.env"
GATEWAY_URL="http://127.0.0.1:3100"
WUZAPI_URL="http://127.0.0.1:8081"
WUZAPI_COMPOSE="/root/Multizap/wuzapi/docker-compose.yml"
PM2_NAME="MultiZap-Gateway"
DOCKER_WUZAPI="multizap-gateway-wuzapi-1"

# Cores
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RESET=$'\033[0m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
  C_RED=$'\033[31m'; C_BLUE=$'\033[34m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'
else
  C_RESET=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_BLUE=""; C_BOLD=""; C_DIM=""
fi

ok()    { echo "${C_GREEN}✓ $*${C_RESET}"; }
warn()  { echo "${C_YELLOW}⚠ $*${C_RESET}"; }
err()   { echo "${C_RED}✗ $*${C_RESET}"; }
info()  { echo "${C_BLUE}ℹ $*${C_RESET}"; }
title() { echo; echo "${C_BOLD}${C_BLUE}══ $* ══${C_RESET}"; }

have() { command -v "$1" >/dev/null 2>&1; }

# JSON pretty (fallback se python3 faltar)
jsonfmt() {
  if have jq; then jq .
  elif have python3; then python3 -m json.tool
  else cat
  fi
}

# Carrega .env só em subshell — token NUNCA escapa para o ambiente do menu
load_token_subshell() {
  # uso: load_token_subshell <comando que usa $MULTIZAP_GATEWAY_TOKEN>
  ( set +x; set -a; . "$ENV_FILE" >/dev/null 2>&1; set +a; "$@" )
}

pre_check() {
  if [ ! -f "$ENV_FILE" ]; then
    err "Arquivo $ENV_FILE não encontrado. Painel abortado."
    exit 1
  fi
  have pm2    || warn "pm2 não encontrado no PATH."
  have curl   || warn "curl não encontrado no PATH."
  have docker || warn "docker não encontrado no PATH."
}

confirm() {
  # uso: confirm "FRASE EXATA"
  local phrase="$1" typed
  echo "${C_YELLOW}Digite exatamente: ${C_BOLD}${phrase}${C_RESET}"
  read -r -p "> " typed
  [ "$typed" = "$phrase" ]
}

pause() {
  echo
  read -r -p "Pressione ENTER para voltar ao menu..." _ || true
}

# ─── Opções ────────────────────────────────────────────────────────────────

opt_status() {
  title "Status geral"

  # PM2
  if pm2 jlist 2>/dev/null | grep -q "\"name\":\"$PM2_NAME\""; then
    local st
    st=$(pm2 jlist 2>/dev/null | grep -o "\"name\":\"$PM2_NAME\"[^}]*\"status\":\"[a-z]*\"" | grep -o '"status":"[a-z]*"' | head -1 | cut -d'"' -f4)
    if [ "$st" = "online" ]; then ok "PM2 $PM2_NAME: online"
    else err "PM2 $PM2_NAME: $st"; fi
  else
    err "PM2 $PM2_NAME não encontrado"
  fi

  # Portas
  if ss -tulpn 2>/dev/null | grep -q ":3100 "; then ok "Porta 3100 (Gateway): aberta"
  else err "Porta 3100 (Gateway): fechada"; fi

  if ss -tulpn 2>/dev/null | grep -q ":8081 "; then ok "Porta 8081 (WuzAPI): aberta"
  else err "Porta 8081 (WuzAPI): fechada"; fi

  # Docker WuzAPI
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$DOCKER_WUZAPI"; then
    ok "Docker $DOCKER_WUZAPI: running"
  else
    warn "Docker $DOCKER_WUZAPI: não está em execução (verifique nome do container)"
  fi

  # Healthcheck
  title "Healthcheck Gateway"
  curl -sS --max-time 4 "$GATEWAY_URL/health" 2>/dev/null | jsonfmt || err "Sem resposta do /health"

  # Recargas intacto (informativo, só checa porta)
  title "Recargas Brasil (não tocado)"
  if ss -tulpn 2>/dev/null | grep -q ":3000 "; then ok "Porta 3000 (Recargas): aberta — intacta"
  else warn "Porta 3000 (Recargas): fechada — verificar se isso é esperado"; fi
}

opt_instancias() {
  title "Instâncias QR (diagnóstico)"
  local resp
  resp=$(load_token_subshell bash -c '
    curl -sS --max-time 6 \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/__diag/wuzapi"
  ' 2>/dev/null)

  if [ -z "$resp" ]; then err "Sem resposta do /__diag/wuzapi"; return; fi

  if have jq; then
    echo "${C_BOLD}CONN_ID   LOGGED  SESSION  WEBHOOK  EVENTS  ÚLTIMO EVENTO         STATUS${C_RESET}"
    echo "$resp" | jq -r '.connections[]? |
      [
        (.connection_id // "—")[0:8],
        (.logged_in|tostring),
        (.session_connected|tostring),
        (.webhook_configured|tostring),
        (.events_configured|tostring),
        (.last_webhook_at // "nunca"),
        (if (.logged_in==false) then "🔴 inválido"
         elif (.webhook_configured==false or .events_configured==false) then "🟡 reconectar"
         elif (.logged_in==true and .session_connected==true) then "🟢 conectado"
         else "🟡 parcial" end)
      ] | @tsv' | column -t -s $'\t'
  else
    echo "$resp" | jsonfmt
  fi
}

opt_logs_live() {
  title "Logs ao vivo (Ctrl+C pra sair)"
  pm2 logs "$PM2_NAME" --lines 0
}

opt_logs_recent() {
  title "Últimos 80 logs"
  pm2 logs "$PM2_NAME" --lines 80 --nostream
}

opt_flush() {
  title "Limpando logs"
  pm2 flush "$PM2_NAME" && ok "Logs limpos."
}

opt_restart_gateway() {
  title "Reiniciar Gateway"
  if confirm "CONFIRMO REINICIAR GATEWAY"; then
    pm2 restart "$PM2_NAME" --update-env && ok "Gateway reiniciado."
  else
    info "Cancelado."
  fi
}

opt_restart_wuzapi() {
  title "Reiniciar WuzAPI"
  if [ ! -f "$WUZAPI_COMPOSE" ]; then
    err "Compose não encontrado em $WUZAPI_COMPOSE"; return
  fi
  if confirm "CONFIRMO REINICIAR WUZAPI"; then
    docker compose -f "$WUZAPI_COMPOSE" restart wuzapi && ok "WuzAPI reiniciada."
  else
    info "Cancelado."
  fi
}

opt_reapply_webhooks() {
  title "Reaplicando webhooks em todas as conexões"
  load_token_subshell bash -c '
    curl -sS --max-time 30 -X POST \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/connections/repair-all-webhooks"
  ' | jsonfmt
}

opt_validate_logs() {
  title "Validando segurança dos logs (últimas 100 linhas)"
  local logs leaks=0
  logs=$(pm2 logs "$PM2_NAME" --lines 100 --nostream 2>/dev/null)

  check_pattern() {
    local label="$1" pattern="$2" mode="${3:-i}" count
    if [ "$mode" = "E" ]; then
      count=$(echo "$logs" | grep -Ec "$pattern" 2>/dev/null || true)
    else
      count=$(echo "$logs" | grep -ic "$pattern" 2>/dev/null || true)
    fi
    count=${count:-0}
    if [ "$count" -gt 0 ]; then
      warn "$label: $count ocorrência(s)"
      leaks=$((leaks + count))
    else
      ok "$label: limpo"
    fi
  }

  check_pattern "secret="           "secret="        i
  check_pattern "Bearer (token)"    "Bearer"         i
  check_pattern "mmg.whatsapp.net"  "mmg.whatsapp.net" i
  check_pattern "JID @s.whatsapp.net" '[0-9]{10,}:[0-9]+@s\.whatsapp\.net' E

  echo
  if [ "$leaks" -eq 0 ]; then
    ok "Logs seguros. Nenhum vazamento encontrado."
  else
    warn "Atenção: possível vazamento encontrado. Revisar logger/sanitização."
  fi
}

opt_health_gateway() {
  title "Healthcheck Gateway"
  curl -sS --max-time 5 "$GATEWAY_URL/health" | jsonfmt
}

opt_health_wuzapi() {
  title "Healthcheck WuzAPI (via Gateway)"
  load_token_subshell bash -c '
    curl -sS --max-time 8 \
      -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
      "'"$GATEWAY_URL"'/api/system/wuzapi-health"
  ' | jsonfmt
}

opt_deploy() {
  title "Deploy forçado (multizap-gh-pull --force)"
  if [ ! -x /usr/local/bin/multizap-gh-pull ]; then
    err "/usr/local/bin/multizap-gh-pull não encontrado ou sem execução."; return
  fi
  if confirm "CONFIRMO DEPLOY"; then
    /usr/local/bin/multizap-gh-pull --force
  else
    info "Cancelado."
  fi
}

# ─── Menu ──────────────────────────────────────────────────────────────────

menu() {
  clear
  echo "${C_BOLD}${C_GREEN}============================================${C_RESET}"
  echo "${C_BOLD}${C_GREEN}   MULTIZAP PANEL — Gateway + WuzAPI${C_RESET}"
  echo "${C_BOLD}${C_GREEN}============================================${C_RESET}"
  echo " 1) Status geral"
  echo " 2) Instâncias QR (diagnóstico)"
  echo " 3) Logs ao vivo"
  echo " 4) Últimos logs (80 linhas)"
  echo " 5) Limpar logs (pm2 flush)"
  echo " 6) Reiniciar Gateway          ${C_YELLOW}[confirma]${C_RESET}"
  echo " 7) Reiniciar WuzAPI           ${C_YELLOW}[confirma]${C_RESET}"
  echo " 8) Reaplicar webhooks"
  echo " 9) Validar logs seguros (4 testes)"
  echo "10) Healthcheck Gateway"
  echo "11) Healthcheck WuzAPI"
  echo "12) Deploy forçado (gh-pull)   ${C_YELLOW}[confirma]${C_RESET}"
  echo " 0) Sair"
  echo "${C_DIM}--------------------------------------------${C_RESET}"
  read -r -p "Opção: " opt
  case "$opt" in
    1)  opt_status ;;
    2)  opt_instancias ;;
    3)  opt_logs_live ;;
    4)  opt_logs_recent ;;
    5)  opt_flush ;;
    6)  opt_restart_gateway ;;
    7)  opt_restart_wuzapi ;;
    8)  opt_reapply_webhooks ;;
    9)  opt_validate_logs ;;
    10) opt_health_gateway ;;
    11) opt_health_wuzapi ;;
    12) opt_deploy ;;
    0)  echo "Tchau."; exit 0 ;;
    *)  warn "Opção inválida." ;;
  esac
  pause
}

pre_check
while true; do menu; done
