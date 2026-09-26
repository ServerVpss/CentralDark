#!/usr/bin/env bash
# VPS Deploy script — roda na VPS via self-hosted runner ou SSH
# Requer: PM2, Docker, Caddy, configs já sincronizados

set -euo pipefail

TS=$(date +%Y%m%dT%H%M%S)
LOGDIR="/root/CentralDark/logs/deploy"
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/vps-deploy-$TS.log"

exec > >(tee -a "$LOGFILE") 2>&1

echo "=== VPS DEPLOY START $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Branch: ${1:-main}"
echo "SHA: ${2:-$(git rev-parse HEAD)}"

cd /root/CentralDark

# 1. Git sync
echo "[1/6] Git pull main..."
git fetch origin
git checkout main
git pull origin main

# 2. Install deps (root + workspaces)
echo "[2/6] npm install..."
npm ci --no-audit --no-fund 2>&1 | tail -20

# 3. Build modules (elite-gateway, hub, etc.)
echo "[3/6] Build modules..."
for mod in apps/modulos/elite-gateway apps/modulos/hub apps/modulos/mcp; do
  if [ -f "$mod/package.json" ]; then
    echo "  Building $mod..."
    (cd "$mod" && npm run build 2>&1 | tail -5)
  fi
done

# 4. PM2 reload com env atualizado
echo "[4/6] PM2 reload..."
if [ -f ecosystem.config.cjs ]; then
  pm2 reload all --update-env 2>&1 | tail -10
  pm2 save
else
  echo "  WARNING: ecosystem.config.cjs não encontrado"
fi

# 5. Caddy reload (se config mudou)
echo "[5/6] Caddy reload..."
if systemctl is-active --quiet caddy; then
  caddy fmt /etc/caddy/Caddyfile 2>/dev/null && systemctl reload caddy
  echo "  Caddy reloaded"
else
  echo "  Caddy not active"
fi

# 6. Health checks
echo "[6/6] Health checks..."
sleep 3

echo "  Omni Router :8099..."
curl -sf http://127.0.0.1:8099/health >/dev/null && echo "  ✅ Omni Router OK" || echo "  ❌ Omni Router FAIL"

echo "  Hub API..."
curl -sf https://api.centralldark.com/health >/dev/null && echo "  ✅ Hub API OK" || echo "  ❌ Hub API FAIL"

echo "  MCP..."
curl -sf https://mcp.centralldark.com/health >/dev/null && echo "  ✅ MCP OK" || echo "  ❌ MCP FAIL"

echo "  Screenpipe :3030..."
curl -sf http://127.0.0.1:3030/health >/dev/null && echo "  ✅ Screenpipe OK" || echo "  ❌ Screenpipe FAIL"

echo "=== VPS DEPLOY END $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Log salvo em: $LOGFILE"