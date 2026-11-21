#!/bin/bash
clear
echo -e "\e[1;36m=======================================================================\e[0m"
echo -e "\e[1;36m 👁️  CENTRAL DARK - PAINEL DE LEITURA EM TEMPO REAL \e[0m"
echo -e "\e[1;36m=======================================================================\e[0m"
echo -e " 📡 Lendo o que os Agentes escrevem na rede..."
echo -e "\e[1;36m=======================================================================\e[0m"
echo ""

trap 'kill 0' SIGINT

processar_log() {
    jq -r '
        if .choices[0].delta.content then 
            " 💬 \(.choices[0].delta.content)"
        elif .tool_calls then 
            " 🤖 [AGENTE] AÇÃO: \(.tool_calls[0].function.name)"
        elif .event == "request_in" then 
            " 📥 [REQUISIÇÃO] \(.method) \(.path)"
        else 
            empty
        end' | while read -r linha; do
            case "$linha" in
                *REQUISIÇÃO*) echo -e "\n\e[1;33m$linha\e[0m" ;;
                *AGENTE*)     echo -e "\n\e[1;35m$linha\e[0m" ;;
                *💬*)         echo -ne "\e[1;37m${linha:3}\e[0m" ;;
                *)            echo -ne "\e[1;37m$linha\e[0m" ;;
            esac
    done
}

tail -n 0 -F /var/log/centralldark/gateway.log | processar_log &
curl -s -N https://api.centralldark.com/v1/logs/tail | processar_log &

wait
