#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT/wuzapi"

if [ ! -f .env ]; then
  echo "[start-wuzapi] .env não encontrado em wuzapi/. Copie de .env.example e configure."
  exit 1
fi

docker compose up -d
echo "[start-wuzapi] Containers:"
docker ps --filter "name=wuzapi-atendimento" --filter "name=postgres-wuzapi-atendimento"
