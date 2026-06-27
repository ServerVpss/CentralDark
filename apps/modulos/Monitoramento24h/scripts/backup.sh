#!/usr/bin/env bash
# Monitoramento 24h — backup do modulo (sem segredos, sem node_modules).
set -euo pipefail
BK="/root/CentralDark/.backups/monitoramento24h-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BK"
tar czf "$BK/Monitoramento24h.tgz" \
  --exclude=node_modules --exclude='.env' \
  -C /root/CentralDark/apps/modulos Monitoramento24h
echo "backup criado em: $BK/Monitoramento24h.tgz"
