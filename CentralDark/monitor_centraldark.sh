#!/bin/bash
clear
echo -e "\e[1;32m=======================================================\e[0m"
echo -e "\e[1;32m CENTRAL DARK - MONITORAMENTO DE API EM TEMPO REAL\e[0m"
echo -e "\e[1;32m=======================================================\e[0m"
echo -e "Escutando tráfego do Gateway. Pressione \e[1;31m[CTRL+C]\e[0m para parar."
echo ""

# Lê o log em tempo real e colore as linhas para depuração rápida
tail -n 30 -f /var/log/centralldark/gateway.log | awk '{
    if ($0 ~ /"status": 200/) { print "\033[1;32m[ SUCESSO ]\033[0m " $0 }
    else if ($0 ~ /"status": 404/ || $0 ~ /"status": 40/) { print "\033[1;31m[ ERRO ]\033[0m " $0 }
    else if ($0 ~ /request_in/) { print "\033[1;33m[ REQUISIÇÃO ]\033[0m " $0 }
    else { print "\033[1;36m[ INFO ]\033[0m " $0 }
}'
