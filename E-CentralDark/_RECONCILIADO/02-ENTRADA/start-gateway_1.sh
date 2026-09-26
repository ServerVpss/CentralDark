#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT/gateway"

if [ ! -f .env ]; then
  echo "[start-gateway] .env não encontrado em gateway/. Copie de .env.example e configure."
  exit 1
fi

echo "[start-gateway] Instalando dependências..."
npm install --omit=dev

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[start-gateway] Instalando PM2 global..."
  npm install -g pm2
fi

pm2 start ecosystem.config.cjs --update-env
pm2 save
echo "[start-gateway] OK. Processo: atendimento-whatsapp-gateway"
pm2 status atendimento-whatsapp-gateway
