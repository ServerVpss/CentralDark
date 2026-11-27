#!/bin/bash
# Auditoria de Chaves - Foco: sk-lab (Proxy) | Zero Ruído
# ========================================================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# Limpa tela para focar no relatório
clear
printf "${BLUE}>>> RELATÓRIO DE AUDITORIA: MODO PRODUÇÃO${NC}\n"
printf "${BLUE}------------------------------------------------------${NC}\n"

# Busca focada: grep -r (recursivo), -n (número linha), -I (ignora binários)
# Filtra ruídos conhecidos (sk-ant, etc) e formata a saída
grep -rnI "sk-lab-" /root/ --exclude-dir={.git,node_modules,cache,.local,.cache} 2>/dev/null | \
grep -v "sk-ant-ant01" | \
while IFS=: read -r file line content; do
    # Captura a chave inteira na linha encontrada
    key=$(echo "$content" | grep -oE "sk-lab-[a-zA-Z0-9_-]+")
    # Mostra só o início para conferência rápida
    masked="${key:0:15}..."
    
    # Saída estruturada: Arquivo | Linha | Chave Mascarada
    printf "${GREEN}%-35s${NC} | ${BLUE}Linha:%-4s${NC} | ${YELLOW}%-20s${NC}\n" "$(basename "$file")" "$line" "$masked"
done

printf "${BLUE}------------------------------------------------------${NC}\n"
printf "${BLUE}>>> FIM DA VARREDURA.${NC}\n"
