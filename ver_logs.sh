#!/bin/bash
clear
echo -e "\e[1;35m=======================================================\e[0m"
echo -e "\e[1;35m CENTRAL DARK - MONITORAMENTO DUPLO EM TEMPO REAL\e[0m"
echo -e "\e[1;35m=======================================================\e[0m"
echo -e "Monitorando: \e[1;34m[WebUI]\e[0m e \e[1;32m[Builder]\e[0m simultaneamente."
echo -e "Pressione \e[1;31m[CTRL+C]\e[0m para encerrar a visualização."
echo ""

# Garante que ao apertar CTRL+C, os dois processos de log parem juntos de forma segura
trap 'kill 0' SIGINT

# Puxa o log do WebUI (Azul) - modo unbuffered para tempo real
docker logs -f --tail 30 CentralDark-WebUI | sed -u 's/^/\x1b[1;34m[WebUI]\x1b[0m /' &

# Puxa o log do Builder (Verde) - modo unbuffered para tempo real
docker logs -f --tail 30 CentralDark-Builder | sed -u 's/^/\x1b[1;32m[Builder]\x1b[0m /' &

wait
