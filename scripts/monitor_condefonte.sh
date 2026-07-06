#!/bin/bash
# Monitor Condefonte v2 — roda no Git Bash do PC, puxa log da VPS em tempo real

VPS="root@vmi3256920"
LOG="/root/CentralDark/secrets/keys/condefonte/condefonte_v2.log"
STATE="/root/CentralDark/secrets/keys/condefonte/state_v2.json"

C_RESET='\033[0m'
C_CYAN='\033[1;36m'
C_GREEN='\033[1;32m'
C_RED='\033[1;31m'
C_YELLOW='\033[1;33m'
C_MAGENTA='\033[1;35m'
C_BLUE='\033[1;34m'

clear
echo -e "${C_CYAN}╔══════════════════════════════════════════════════════╗${C_RESET}"
echo -e "${C_CYAN}║   🚀 CONDEFONTE v2 — MONITOR AO VIVO (VPS)          ║${C_RESET}"
echo -e "${C_CYAN}╚══════════════════════════════════════════════════════╝${C_RESET}"
echo -e "${C_BLUE}VPS:${C_RESET} $VPS"
echo -e "${C_BLUE}Log:${C_RESET} $LOG"
echo -e "${C_YELLOW}Ctrl+C para sair${C_RESET}"
echo ""

echo -e "${C_MAGENTA}--- STATUS INICIAL ---${C_RESET}"
ssh "$VPS" "
  echo '📊 Processo:'
  ps aux | grep -v grep | grep extract_trajectory_v2 | head -3 || echo '  (nenhum processo ativo)'
  echo ''
  echo '📈 Últimas 5 linhas do log:'
  tail -n 5 $LOG 2>/dev/null || echo '  (log ainda não existe)'
  echo ''
  echo '📦 Estado atual:'
  if [ -f $STATE ]; then
    cat $STATE | grep -E 'total_items|decisions_found|reasoning_found|errors_429'
  else
    echo '  (state_v2.json ainda não existe)'
  fi
"
echo ""
echo -e "${C_MAGENTA}--- STREAM AO VIVO ---${C_RESET}"
echo ""

ssh "$VPS" "tail -F $LOG 2>/dev/null" | while IFS= read -r line; do
  case "$line" in
    *INICIANDO*)   echo -e "${C_CYAN}${line}${C_RESET}" ;;
    *FINALIZADO*)  echo -e "${C_GREEN}${line}${C_RESET}" ;;
    *FATAL*)       echo -e "${C_RED}${line}${C_RESET}" ;;
    *ERRO*)        echo -e "${C_RED}${line}${C_RESET}" ;;
    *429*)         echo -e "${C_MAGENTA}${line}${C_RESET}" ;;
    *Página*)      echo -e "${C_YELLOW}${line}${C_RESET}" ;;
    *🚀*|*✅*)     echo -e "${C_GREEN}${line}${C_RESET}" ;;
    *)             echo "$line" ;;
  esac
done
