#!/bin/bash

# Verificar status das rotas do gateway
echo "== Teste de Health =="
curl -s http://127.0.0.1:3100/health

echo -e "\n== Lista de Conexões no Gateway (Sem token, deve falhar) =="
curl -s http://127.0.0.1:3100/connections

echo -e "\n== Lista de Conexões no Gateway (Com token) =="
# Buscando token no env para testar
if [ -f "/root/Multizap/gateway/.env" ]; then
    TOKEN=$(grep "GATEWAY_SERVER_TOKEN=" /root/Multizap/gateway/.env | cut -d '=' -f2-)
    if [ -n "$TOKEN" ]; then
        curl -s http://127.0.0.1:3100/connections -H "Authorization: Bearer $TOKEN"
    else
        echo "Token não encontrado no .env"
    fi
else
    echo "Env não encontrado"
fi
