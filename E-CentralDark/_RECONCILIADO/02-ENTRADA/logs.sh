#!/usr/bin/env bash
set -uo pipefail
echo "Use Ctrl+C para sair."
echo "=== PM2 Gateway ==="
pm2 logs MultiZap-Gateway --lines 80 &
PM2_PID=$!
echo "=== Docker WuzAPI ==="
docker logs -f --tail 80 wuzapi-atendimento &
DOCKER_PID=$!
trap "kill $PM2_PID $DOCKER_PID 2>/dev/null" EXIT
wait
