#!/usr/bin/env bash
# Roda DEPOIS que o skil.sh instala a skill no agente alvo.
# Faz uma checagem rápida e mostra mensagem de boas-vindas.

set -e

# Cores
if [ -t 1 ]; then
  BOLD=$(printf '\033[1m')
  GREEN=$(printf '\033[32m')
  CYAN=$(printf '\033[36m')
  YELLOW=$(printf '\033[33m')
  RESET=$(printf '\033[0m')
else
  BOLD=''; GREEN=''; CYAN=''; YELLOW=''; RESET=''
fi

echo
echo "${GREEN}${BOLD}✓ Consciência CentralDark instalada${RESET}"
echo
echo "${CYAN}A IA agora opera no padrão da casa:${RESET}"
echo "  - PT-BR sempre, tom conversacional, curto"
echo "  - Executa antes de perguntar (regras nas permissões)"
echo "  - Valida cadeia completa antes de declarar 'no ar'"
echo "  - Lê docs/PENDENCIAS.md ao ouvir gatilhos"
echo "  - Modo cientista em toda tarefa operacional"
echo
echo "${YELLOW}Próximo passo:${RESET} abra uma nova conversa com a IA — ela já responderá no padrão."
echo
echo "${CYAN}Documentação completa:${RESET} https://install.centralldark.com/docs/30-skill-consciencia"
echo
