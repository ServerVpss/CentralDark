#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

RED='\033[1;31m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
RESET='\033[0m'

list_dir() {
  local d="$1"
  if [ -d "$d" ]; then
    find "$d" -maxdepth 1 -type f -name "*.md" -printf "%f\n" 2>/dev/null | sort | tail -8 | sed "s/^/  • /"
  else
    echo "  pasta não existe"
  fi
}

while true; do
  clear
  printf "${RED}██████╗ ███████╗███╗   ██╗████████╗██████╗  █████╗ ██╗     ██████╗  █████╗ ██████╗ ██╗  ██╗${RESET}\n"
  printf "${WHITE}CENTRALDARK IA AO VIVO  •  CHATGPT ↔ GITHUB ↔ VPS ↔ MONITOR_TAREFAS ↔ GROK${RESET}\n"
  printf "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

  printf "${WHITE}▶ STATUS PM2 DO MONITOR${RESET}\n"
  pm2 list 2>/dev/null | grep -E "monitor_tarefas|name" || echo "  monitor_tarefas não encontrado"

  printf "\n${WHITE}▶ SAÚDE RÁPIDA DA VPS${RESET}\n"
  uptime 2>/dev/null | sed "s/^/  /" || true
  free -h 2>/dev/null | awk 'NR==1 || NR==2 {print "  "$0}' || true
  df -h / 2>/dev/null | awk 'NR==1 || NR==2 {print "  "$0}' || true

  printf "\n${YELLOW}▶ 📥 TAREFAS ABERTAS${RESET}\n"
  list_dir docs/tarefas/abertas

  printf "\n${BLUE}▶ ⚙️ EM ANDAMENTO${RESET}\n"
  list_dir docs/tarefas/em_andamento

  printf "\n${GREEN}▶ ✅ CONCLUÍDAS${RESET}\n"
  list_dir docs/tarefas/concluidas

  printf "\n${RED}▶ ❌ COM ERRO${RESET}\n"
  list_dir docs/tarefas/com_erro

  printf "\n${WHITE}▶ 📌 RESULTADOS MAIS RECENTES${RESET}\n"
  list_dir docs/tarefas/resultados

  printf "\n${WHITE}▶ ÚLTIMO RESULTADO${RESET}\n"
  ultimo="$(find docs/tarefas/resultados -maxdepth 1 -type f -name "*.md" -printf "%T@ %p\n" 2>/dev/null | sort -nr | head -1 | cut -d" " -f2- || true)"
  if [ -n "${ultimo:-}" ] && [ -f "$ultimo" ]; then
    printf "  ${GRAY}%s${RESET}\n\n" "$ultimo"
    head -35 "$ultimo" | sed "s/^/  /"
  else
    echo "  nenhum resultado ainda"
  fi

  printf "\n${WHITE}▶ 📜 LOG AO VIVO${RESET}\n"
  tail -18 docs/tarefas/logs/monitor_tarefas.log 2>/dev/null | sed "s/^/  /" || echo "  sem log ainda"

  printf "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
  printf "${GRAY}Atualiza a cada 2s • Ctrl+C para sair • Nunca use git add . em /root${RESET}\n"

  sleep 2
done
