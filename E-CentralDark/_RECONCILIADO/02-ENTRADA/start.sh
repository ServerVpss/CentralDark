#!/bin/bash
set -euo pipefail

# Wrapper de boot do PM2 — carrega .env, garante deps e sobe o server.
# Sentry DSN: lido de SENTRY_DSN (env ou .env). Se faltar, o app sobe igual
# sem telemetria (não quebra). Detalhes em CentralDark/apps/install-callback/README.md.

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$APP_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

# Garante dependências instaladas (idempotente; só roda npm install se faltar
# node_modules ou se package.json mudou desde a última instalação).
if [ -f "$APP_DIR/package.json" ]; then
  NEEDS_INSTALL=0
  if [ ! -d "$APP_DIR/node_modules" ]; then
    NEEDS_INSTALL=1
  elif [ "$APP_DIR/package.json" -nt "$APP_DIR/node_modules/.install-stamp" ] 2>/dev/null; then
    NEEDS_INSTALL=1
  fi
  if [ "$NEEDS_INSTALL" = "1" ]; then
    echo "[start.sh] Instalando dependências do install-callback..."
    ( cd "$APP_DIR" && npm install --omit=dev --no-audit --no-fund ) || {
      echo "[start.sh] AVISO: npm install falhou — seguindo sem deps novas (Sentry pode ficar inativo)."
    }
    mkdir -p "$APP_DIR/node_modules"
    touch "$APP_DIR/node_modules/.install-stamp"
  fi
fi

exec node "$APP_DIR/server.js"
