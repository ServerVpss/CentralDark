#!/usr/bin/env bash
# Auto-build do HUB CentralDark após git pull na VPS.
# Uso: bash scripts/deploy-hub.sh
# Ideal: chamar do webhook de deploy em scripts/webhook/ logo após o git pull.
set -euo pipefail

HUB_DIR="${HUB_DIR:-/root/CentralDark/apps/modulos/hub}"

echo "🔨 [deploy-hub] entrando em $HUB_DIR"
cd "$HUB_DIR"

echo "📦 [deploy-hub] npm install (silencioso)"
npm install --silent --no-audit --no-fund

echo "⚙️  [deploy-hub] npm run build"
npm run build

# Caddy serve o dist/ direto — não precisa reload.
# Se o Caddyfile mudar, o webhook principal deve rodar: caddy reload --config /etc/caddy/Caddyfile

echo "✅ [deploy-hub] build ok — $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
ls -la dist/ | head -20
