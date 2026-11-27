#!/bin/bash
clear
echo -e "\e[1;36m=======================================================\e[0m"
echo -e "\e[1;36m 🔍 VARREDURA CIRÚRGICA DE KEYS [TIPO: sk-lab] \e[0m"
echo -e "\e[1;36m=======================================================\e[0m"
echo -e " Ignorando tokens de sessão (sk-ant-ant01)..."
echo -e " Procurando apenas por chaves de proxy (sk-lab...)..."
echo -e "\e[1;36m=======================================================\e[0m"
echo ""

# O grep -v exclui os tokens de sessão (sk-ant-ant01)
# O awk organiza a saída em colunas bonitas
grep -rnE "sk-lab-[a-zA-Z0-9_-]{20,}" /root/ --exclude-dir={.git,node_modules,cache} | \
grep -v "sk-ant-ant01" | \
awk -F: '{ printf "\e[1;32m[ ARQUIVO ]\e[0m %s \n\e[1;33m[ CHAVE ]\e[0m %s\n\n", $1, $2 }'

echo -e "\e[1;36m=======================================================\e[0m"
