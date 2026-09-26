#!/usr/bin/env bash
set -uo pipefail
echo "=== PM2 ==="
pm2 status || true
echo
echo "=== Docker (atendimento) ==="
docker ps --filter "name=wuzapi-atendimento" --filter "name=postgres-wuzapi-atendimento" || true
echo
echo "=== Health Gateway ==="
curl -s http://127.0.0.1:3100/health || echo "Gateway não respondeu"
echo
echo "=== WuzAPI local ==="
curl -s http://127.0.0.1:8081/ || echo "WuzAPI não respondeu"
echo
