#!/bin/bash
clear
echo -e "\e[1;36m=======================================================\e[0m"
echo -e "\e[1;36m CENTRAL DARK - MONITOR DA API (GATEWAY ELITE)\e[0m"
echo -e "\e[1;36m=======================================================\e[0m"
echo -e "Lendo log em: \e[1;33m/var/log/centralldark/gateway.log\e[0m"
echo -e "Pressione \e[1;31m[CTRL+C]\e[0m para encerrar a visualização."
echo ""

# Puxa as últimas 50 linhas e acompanha em tempo real (cor ciano)
tail -n 50 -f /var/log/centralldark/gateway.log | sed -u 's/^/\x1b[1;36m[API-Gateway]\x1b[0m /'
