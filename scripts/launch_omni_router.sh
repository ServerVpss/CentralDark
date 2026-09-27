#!/bin/bash
# Launcher para CentralDark Omni Router com Hermes
# Exporta explicitamente as variáveis de ambiente ANTES de iniciar o Python

export HERMES_BASE_URL="http://127.0.0.1:8645"
export CENTRALDARK_DEFAULT_ENGINE="hermes"
export CENTRALDARK_ROUTER_TOKEN=""

cd "e:/CentralDark/Pivete/CentralDark"

# Usar o Python do venv do Hermes que tem requests e todas as dependências
exec "/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe" \
     apps/modulos/elite-gateway/scripts/centraldark_omni_router.py \
     --host 127.0.0.1 --port 8099
