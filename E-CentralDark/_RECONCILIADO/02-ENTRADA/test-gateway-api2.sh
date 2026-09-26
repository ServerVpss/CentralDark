#!/bin/bash
# Buscando do wabot.env
if [ -f "/root/Multizap/secrets/wabot.env" ]; then
    TOKEN=$(grep "GATEWAY_SERVER_TOKEN=" /root/Multizap/secrets/wabot.env | cut -d '=' -f2-)
    if [ -n "$TOKEN" ]; then
        curl -s http://127.0.0.1:3100/connections -H "Authorization: Bearer $TOKEN"
    else
        echo "Token não encontrado no wabot.env"
    fi
else
    echo "wabot.env não encontrado. Não posso testar o gateway local."
fi
