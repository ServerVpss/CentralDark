#!/usr/bin/env bash
set -euo pipefail

cd /root || exit 1

LOG_MONITOR="docs/tarefas/logs/monitor_tarefas.log"
mkdir -p docs/tarefas/logs
touch "$LOG_MONITOR"

RED='\033[1;31m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RESET='\033[0m'

clear
printf "${RED}🎬 CENTRALDARK IA LIVE${RESET}\n"
printf "${WHITE}ChatGPT ↔ GitHub ↔ VPS ↔ monitor_tarefas ↔ Grok${RESET}\n"
printf "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
printf "${GRAY}Feed limpo: fila + resultado final + alerta grande. Sem TUI bruto do Grok.${RESET}\n"
printf "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"
printf "${YELLOW}🟡 Aguardando tarefas...${RESET}\n\n"

mostrar_alerta_final() {
  local tarefa="$1"
  printf "\a\a\a"
  printf "\n${RED}████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗███████╗██╗${RESET}\n"
  printf "${RED}╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔════╝██║${RESET}\n"
  printf "${WHITE}   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║█████╗  ██║${RESET}\n"
  printf "${RED}   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══╝  ╚═╝${RESET}\n"
  printf "${WHITE}   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║███████╗██╗${RESET}\n"
  printf "${RED}   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝${RESET}\n"
  printf "\n${GREEN}✅ GROK FINALIZOU A TAREFA:${RESET} %s\n" "$tarefa"
  printf "${YELLOW}📣 AGUARDANDO CHATGPT REVISAR.${RESET}\n"
  printf "${WHITE}➡️  MANDE AQUI: verifica o resultado da tarefa %s${RESET}\n" "$tarefa"
  printf "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"
}

mostrar_resposta() {
  local tarefa="$1"
  local resultado="docs/tarefas/resultados/$tarefa"

  if [ -f "$resultado" ]; then
    printf "${CYAN}📌 RESULTADO LIMPO:${RESET}\n"
    awk '
      /^# Resultado/ {show=1; next}
      /^## Tarefa lida/ {show=0}
      show==1 {print}
    ' "$resultado" | sed '/^[[:space:]]*$/d' | head -70 | sed 's/^/  /'
    printf "\n${GRAY}Arquivo: %s${RESET}\n\n" "$resultado"
  else
    printf "${YELLOW}⚠️ Resultado ainda não encontrado:${RESET} %s\n\n" "$resultado"
  fi
}

tail -n 0 -F "$LOG_MONITOR" | while IFS= read -r line; do
  if [[ "$line" =~ pegando\ tarefa\ ([^[:space:]]+) ]]; then
    tarefa="${BASH_REMATCH[1]}"
    printf "${YELLOW}🟡 GROK/MONITOR PEGOU:${RESET} %s\n" "$tarefa"

  elif [[ "$line" =~ tarefa\ concluida\ ([^[:space:]]+) ]]; then
    tarefa="${BASH_REMATCH[1]}"
    printf "${GREEN}✅ TAREFA CONCLUÍDA:${RESET} %s\n" "$tarefa"
    sleep 1
    mostrar_alerta_final "$tarefa"
    mostrar_resposta "$tarefa"

  elif [[ "$line" =~ erro|falha|Error|Traceback ]]; then
    printf "${RED}❌ ERRO:${RESET} %s\n" "$line"

  else
    printf "${GRAY}📡 %s${RESET}\n" "$line"
  fi
done
