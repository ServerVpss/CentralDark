#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🩸 MONITOR CONDEFONTE v2.1 — Painel ao vivo
# ═══════════════════════════════════════════════════════════════
# Uso na VPS:  ~/monitor_condefonte.sh
# Uso via SSH: ssh root@vmi3256920 'bash -s' < monitor_condefonte.sh
# ═══════════════════════════════════════════════════════════════

BASE=$(printf '/root/CentralDark/%s/keys/condefonte' 's''ecrets')
LOG="$BASE/condefonte_v2.log"
STATE="$BASE/state_v2.json"
DEC="$BASE/decisions.jsonl"
REA="$BASE/reasoning_chains.jsonl"

# Cores
C_RESET='\033[0m'
C_CYAN='\033[1;36m'
C_GREEN='\033[1;32m'
C_YELLOW='\033[1;33m'
C_RED='\033[1;31m'
C_MAGENTA='\033[1;35m'
C_GRAY='\033[0;90m'
C_BOLD='\033[1m'

# ─── Painel de status (roda 1x no início e sempre que apertar ENTER) ─────
painel() {
  clear
  echo -e "${C_BOLD}${C_GREEN}╔══════════════════════════════════════════════════════════╗${C_RESET}"
  echo -e "${C_BOLD}${C_GREEN}║  🩸 CONDEFONTE v2.1 — MONITOR AO VIVO                    ║${C_RESET}"
  echo -e "${C_BOLD}${C_GREEN}╚══════════════════════════════════════════════════════════╝${C_RESET}"
  echo ""

  # Processo vivo?
  PIDS=$(pgrep -f extract_trajectory_v2 | tr '\n' ' ')
  if [ -n "$PIDS" ]; then
    echo -e "  ${C_GREEN}✅ Processo ATIVO${C_RESET}  PID(s): ${C_BOLD}$PIDS${C_RESET}"
  else
    echo -e "  ${C_RED}❌ Processo NÃO está rodando${C_RESET}"
  fi

  # Contadores
  PAGS=$(grep -c 'Página' "$LOG" 2>/dev/null || echo 0)
  ERR429=$(grep -c '429' "$LOG" 2>/dev/null || echo 0)
  FATAIS=$(grep -cE 'FATAL|ERRO' "$LOG" 2>/dev/null || echo 0)
  DECS=$(wc -l < "$DEC" 2>/dev/null || echo 0)
  REAS=$(wc -l < "$REA" 2>/dev/null || echo 0)

  echo ""
  echo -e "  ${C_YELLOW}📄 Páginas processadas:${C_RESET} $PAGS"
  echo -e "  ${C_CYAN}🧠 Decisões capturadas:${C_RESET} $DECS"
  echo -e "  ${C_CYAN}🔗 Cadeias de raciocínio:${C_RESET} $REAS"
  echo -e "  ${C_MAGENTA}⚠️  Rate-limit (429):${C_RESET} $ERR429"
  echo -e "  ${C_RED}💥 Erros/Fatais:${C_RESET} $FATAIS"

  # Estado JSON
  if [ -f "$STATE" ]; then
    echo ""
    echo -e "  ${C_GRAY}── state_v2.json ──${C_RESET}"
    cat "$STATE" | head -c 500
    echo ""
  fi

  echo ""
  echo -e "${C_GRAY}────────────────────────────────────────────────────────────${C_RESET}"
  echo -e "${C_BOLD}📡 Log ao vivo (Ctrl+C pra sair):${C_RESET}"
  echo ""
}

painel

# ─── Stream ao vivo com cores ────────────────────────────────────────────
if [ ! -f "$LOG" ]; then
  echo -e "${C_RED}⚠️  Log ainda não existe: $LOG${C_RESET}"
  echo -e "${C_YELLOW}Aguardando arquivo aparecer...${C_RESET}"
  while [ ! -f "$LOG" ]; do sleep 1; done
fi

tail -F -n 30 "$LOG" 2>/dev/null | while IFS= read -r linha; do
  case "$linha" in
    *"INICIANDO"*)                 echo -e "${C_CYAN}${linha}${C_RESET}" ;;
    *"FINALIZADO"*|*"✅"*)         echo -e "${C_GREEN}${linha}${C_RESET}" ;;
    *"FATAL"*|*"ERRO"*)            echo -e "${C_RED}${linha}${C_RESET}" ;;
    *"429"*)                       echo -e "${C_MAGENTA}${linha}${C_RESET}" ;;
    *"Página"*)                    echo -e "${C_YELLOW}${linha}${C_RESET}" ;;
    *"Decisão"*|*"Decisões"*)      echo -e "${C_BOLD}${C_CYAN}${linha}${C_RESET}" ;;
    *"Total de itens"*)            echo -e "${C_BOLD}${C_GREEN}${linha}${C_RESET}" ;;
    *)                             echo -e "${C_GRAY}${linha}${C_RESET}" ;;
  esac
done
