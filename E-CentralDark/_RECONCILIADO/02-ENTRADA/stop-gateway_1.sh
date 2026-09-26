#!/usr/bin/env bash
# Para SOMENTE o stack Atendimento. NUNCA toca em whatsapp-server (Recargas Brasil).
set -uo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "[stop-gateway] Parando PM2 atendimento-whatsapp-gateway..."
pm2 stop atendimento-whatsapp-gateway || true

echo "[stop-gateway] Parando containers WuzAPI Atendimento..."
cd "$ROOT/wuzapi"
docker compose down

echo "[stop-gateway] Pronto. whatsapp-server (Recargas Brasil) NÃO foi tocado."
pm2 status || true
