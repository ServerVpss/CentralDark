#!/usr/bin/env bash

RESET="\033[0m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
CYAN="\033[1;36m"
WHITE="\033[1;37m"

ok(){ printf "${GREEN}🟢 [PASS]${RESET} %s\n" "$1"; }
warn(){ printf "${YELLOW}🟡 [WARN]${RESET} %s\n" "$1"; }
fail(){ printf "${RED}🔴 [FAIL]${RESET} %s\n" "$1"; }
title(){ printf "\n${CYAN}%s${RESET}\n" "$1"; }

trap 'printf "\n${YELLOW}HUD encerrado.${RESET}\n"; exit 0' INT TERM

while true; do
  printf "\033[H\033[2J"
  printf "${CYAN}============================================================${RESET}\n"
  printf "${CYAN}       🪬 CENTRALDARK · HERMES LIVE JUDGE 🧿${RESET}\n"
  printf "${CYAN}============================================================${RESET}\n"
  date -u "+UTC: %Y-%m-%d %H:%M:%S"

  title "🧠 01 · GATEWAY"
  GATEWAY_PID=$(pgrep -f "hermes.*gateway run" | head -1)
  if [ -n "$GATEWAY_PID" ]; then
    ok "Hermes Gateway ONLINE · PID=$GATEWAY_PID · CWD=$(readlink -f /proc/$GATEWAY_PID/cwd 2>/dev/null)"
  else
    fail "Hermes Gateway OFFLINE"
  fi

  title "🌐 02 · HERMES SERVE"
  SERVE_PID=$(pgrep -f "hermes.*serve.*9119" | head -1)
  if [ -n "$SERVE_PID" ]; then ok "Hermes Serve ONLINE · PID=$SERVE_PID"; else fail "Hermes Serve 9119 nao encontrado"; fi

  title "🚪 03 · PORTAS"
  for PORT in 9119 9900 8644; do
    LINE=$(ss -ltnp 2>/dev/null | grep ":$PORT " | head -1)
    if [ -n "$LINE" ]; then
      OWNER=$(printf "%s" "$LINE" | sed -n "s/.*pid=\([0-9]*\).*/\1/p")
      ok "porta $PORT LISTEN · pid=${OWNER:-UNKNOWN}"
    else
      fail "porta $PORT OFFLINE"
    fi
  done

  title "🔌 04 · MCP CENTRALDARK"
  MCP_PID=$(pgrep -f "CentralDark_MCP_RUNTIME.*mcp-server" | head -1)
  [ -n "$MCP_PID" ] && ok "MCP CentralDark ativo · PID=$MCP_PID" || fail "MCP CentralDark ausente"
  SUP_PID=$(pgrep -f "mcp_death_supervisor" | head -1)
  [ -n "$SUP_PID" ] && ok "MCP supervisor ativo · PID=$SUP_PID" || warn "MCP supervisor nao encontrado"

  title "⚙️ 05 · WORKERS"
  CRON=$(pgrep -af "cron.scheduler")
  if [ -n "$CRON" ]; then
    COUNT=$(printf "%s\n" "$CRON" | wc -l)
    ok "$COUNT worker(s) ativo(s)"
    printf "%s\n" "$CRON" | head -6
  else
    warn "nenhum worker ativo"
  fi

  title "🤖 06 · DELEGACOES / MISSOES"
  DELEG=$(pgrep -af "hermes.*-z ")
  if [ -n "$DELEG" ]; then
    COUNT=$(printf "%s\n" "$DELEG" | wc -l)
    ok "Hermes trabalhando · $COUNT missao(oes)"
    printf "%s\n" "$DELEG" | while read -r LINE; do
      PID=$(printf "%s" "$LINE" | awk '{print $1}')
      ETIME=$(ps -p "$PID" -o etime= 2>/dev/null | xargs)
      CPU=$(ps -p "$PID" -o %cpu= 2>/dev/null | xargs)
      MEM=$(ps -p "$PID" -o %mem= 2>/dev/null | xargs)
      printf "🤖 PID=%s · ⏱ %s · CPU=%s%% · MEM=%s%%\n" "$PID" "${ETIME:-?}" "${CPU:-?}" "${MEM:-?}"
    done
  else
    warn "💤 Hermes sem delegacao ativa"
  fi

  title "🧬 07 · PROCESSOS"
  ps -eo pid,ppid,etime,%cpu,%mem,stat,cmd | grep -E "hermes|mcp-server|cron.scheduler" | grep -v grep | head -18

  title "🔗 08 · CONEXOES"
  if [ -n "$GATEWAY_PID" ]; then
    EST=$(lsof -Pan -p "$GATEWAY_PID" -iTCP -sTCP:ESTABLISHED 2>/dev/null)
    if [ -n "$EST" ]; then ok "conexoes ESTABLISHED"; printf "%s\n" "$EST" | tail -6; else warn "sem conexao externa neste instante"; fi
  else
    fail "gateway offline"
  fi

  title "📊 09 · RECURSOS"
  if [ -n "$GATEWAY_PID" ]; then
    CPU=$(ps -p "$GATEWAY_PID" -o %cpu= | xargs)
    MEM=$(ps -p "$GATEWAY_PID" -o %mem= | xargs)
    STATE=$(ps -p "$GATEWAY_PID" -o stat= | xargs)
    ETIME=$(ps -p "$GATEWAY_PID" -o etime= | xargs)
    printf "⏱ %s · CPU=%s%% · MEM=%s%% · STATE=%s\n" "$ETIME" "$CPU" "$MEM" "$STATE"
    if awk "BEGIN {exit !($CPU >= 80)}"; then fail "CPU muito alta"; elif awk "BEGIN {exit !($CPU >= 40)}"; then warn "CPU elevada"; else ok "CPU normal"; fi
  fi

  title "📜 10 · LOGS"
  LOG="$HOME/.hermes/logs/agent.log"
  if [ -f "$LOG" ]; then
    ERRORS=$(tail -n 200 "$LOG" | grep -Eic "error|exception|failed|fatal")
    WARNINGS=$(tail -n 200 "$LOG" | grep -Eic "warn|warning|timeout|retry")
    [ "$ERRORS" -eq 0 ] && ok "0 erros / 200 eventos" || fail "$ERRORS erro(s) / 200 eventos"
    [ "$WARNINGS" -eq 0 ] && ok "0 warnings / 200 eventos" || warn "$WARNINGS warning(s) / 200 eventos"
    tail -n 8 "$LOG"
  else
    warn "agent.log nao encontrado"
  fi

  title "⚖️ 11 · REALITY JUDGE"
  FAILS=0
  [ -z "$GATEWAY_PID" ] && FAILS=$((FAILS+1))
  [ -z "$SERVE_PID" ] && FAILS=$((FAILS+1))
  [ -z "$MCP_PID" ] && FAILS=$((FAILS+1))
  for PORT in 9119 9900 8644; do ss -ltn 2>/dev/null | grep -q ":$PORT " || FAILS=$((FAILS+1)); done
  if [ "$FAILS" -eq 0 ]; then
    printf "\n${GREEN}🏆 CORE HERMES HEALTHY 🏆${RESET}\n"
  else
    printf "\n${RED}💀 %s INVARIANTE(S) QUEBRADA(S) 💀${RESET}\n" "$FAILS"
  fi

  title "🫀 12 · ONE HEART / MCP CENTRALDARK (MESMO HUB)"
  HEART_JSON=$(curl --silent --show-error --fail --max-time 4 http://127.0.0.1:9100/heartbeat 2>/dev/null || true)
  if [ -z "$HEART_JSON" ]; then
    fail "One Heart /heartbeat indisponivel em 127.0.0.1:9100"
    warn "🪧 VER PENDENCIA: medir owner MCP, porta 9100, logs e health; nao declarar verde por processo."
  else
    HEART_STATE=$(printf "%s" "$HEART_JSON" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(str(d.get("self","UNKNOWN")).lower())' 2>/dev/null || echo UNKNOWN)
    HEART_LAG=$(printf "%s" "$HEART_JSON" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("lag_ms","UNKNOWN"))' 2>/dev/null || echo UNKNOWN)
    SYNC_STATE=$(printf "%s" "$HEART_JSON" | python3 -c 'import json,sys; d=json.load(sys.stdin); f=next((x for x in d.get("operational",{}).get("fronts",[]) if x.get("id")=="F1_GIT"),{}); print(str(f.get("state","UNKNOWN")).split(":")[0])' 2>/dev/null || echo UNKNOWN)
    if [ "$HEART_STATE" = "alive" ] && [ "$HEART_LAG" != "UNKNOWN" ] && [ "${HEART_LAG:-999999}" -lt 60000 ] 2>/dev/null; then
      ok "One Heart ALIVE · lag=${HEART_LAG}ms · hub MCP 9100"
    else
      warn "One Heart ${HEART_STATE} · lag=${HEART_LAG}ms · HEART NAO SELADO"
      warn "🪧 VER PENDENCIA: heartbeat stale/unknown; consultar owner existente, sem outro coração."
    fi
    if [ "$SYNC_STATE" = "BLOCKED" ] || [ "$SYNC_STATE" = "FAIL" ] || [ "$SYNC_STATE" = "ERROR" ]; then
      warn "🪧 GIT VPS ↔ MAIN: ${SYNC_STATE}; proteger edits locais e reconciliar owner"
    else
      printf "↔ GitHub sync: %s (prova separada do heartbeat)\n" "$SYNC_STATE"
    fi
  fi

  printf "\n${WHITE}Atualiza a cada 1s · Ctrl+C para sair${RESET}\n"
  sleep 1
done
