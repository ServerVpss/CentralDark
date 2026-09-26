#!/bin/bash
# Launcher do CentralDark Omni Router sem reclassificar Hermes como engine.
# Preserva engine externa válida; configuração legada hermes migra para nous.

case "${CENTRALDARK_DEFAULT_ENGINE:-nous}" in
  hermes|HERMES|"") export CENTRALDARK_DEFAULT_ENGINE="nous" ;;
  *) export CENTRALDARK_DEFAULT_ENGINE ;;
esac

cd "e:/CentralDark/Pivete/CentralDark"

# Usa o Python já instalado no ambiente Hermes apenas como runtime Python.
exec "/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe" \
     apps/modulos/elite-gateway/scripts/centraldark_omni_router.py \
     --host 127.0.0.1 --port 8099
