#!/bin/bash
clear
echo -e "\e[1;35m=======================================================\e[0m"
echo -e "\e[1;35m CENTRAL DARK - MAPEAMENTO DE FERRAMENTAS\e[0m"
echo -e "\e[1;35m=======================================================\e[0m"
echo -e "\e[1;33mBuscando endpoints/tools ativas na API...\e[0m"
echo ""

# Faz a requisição e formata a saída. (Ajuste '/tools' ou '/docs' conforme a rota que mapeia sua API)
curl -s https://api.centralldark.com/tools | jq '.' || curl -s https://api.centralldark.com/ | jq '.'
