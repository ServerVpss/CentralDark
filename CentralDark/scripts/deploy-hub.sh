#!/usr/bin/env bash
# Auto-build do HUB CentralDark após git pull na VPS.
# Uso: bash scripts/deploy-hub.sh
# Ideal: chamar do webhook de deploy em scripts/webhook/ logo após o git pull.
set -euo pipefail

HUB_DIR="${HUB_DIR:-/root/CentralDark/apps/modulos/hub}"

CANONICAL_ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
DISPATCHER="$CANONICAL_ROOT/scripts/vps/deploy-guards-dispatcher.sh"
SOURCE_HEAD="${SOURCE_HEAD:-$(git -C "$CANONICAL_ROOT" rev-parse HEAD 2>/dev/null || true)}"
[[ "$SOURCE_HEAD" =~ ^[0-9a-f]{40}$ ]] || { echo "❌ [deploy-hub] SOURCE_HEAD_INVALID"; exit 16; }
[[ -x "$DISPATCHER" ]] || { echo "❌ [deploy-hub] CANONICAL_DEPLOY_GATE_MISSING"; exit 16; }
TARGET_SHA="$SOURCE_HEAD" REPO_DIR="$CANONICAL_ROOT" BRANCH=main bash "$DISPATCHER" --gate-only
echo "🧿 [deploy-hub] CANONICAL_DEPLOY_GATE=PASS target=$SOURCE_HEAD"

echo "🔨 [deploy-hub] entrando em $HUB_DIR"
cd "$HUB_DIR"

if [ -f package-lock.json ]; then
  echo "📦 [deploy-hub] npm ci (lock preservado)"
  npm ci --silent --no-audit --no-fund
else
  echo "📦 [deploy-hub] npm install (sem lockfile)"
  npm install --silent --no-audit --no-fund
fi

echo "⚙️  [deploy-hub] npm run build"
npm run build

# Caddy serve o dist/ direto — não precisa reload.
# Se o Caddyfile mudar, o webhook principal deve rodar: caddy reload --config /etc/caddy/Caddyfile

echo "✅ [deploy-hub] build ok — $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
ls -la dist/ | head -20
