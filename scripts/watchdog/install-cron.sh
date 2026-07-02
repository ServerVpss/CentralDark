#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Instalador do cron do watchdog do MCP
# Roda 1x na VPS pra registrar a entrada no cron do root.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

BASE_DIR="/root/CentralDark"
WATCHDOG="${BASE_DIR}/scripts/watchdog/mcp-watchdog.sh"
CRON_LINE="* * * * * ${WATCHDOG} >/dev/null 2>&1"

chmod +x "$WATCHDOG"
mkdir -p "${BASE_DIR}/scripts/logs"

# Remove entrada anterior (se existir) e adiciona a nova
( crontab -l 2>/dev/null | grep -v "mcp-watchdog.sh" ; echo "$CRON_LINE" ) | crontab -

echo "✅ Cron instalado:"
crontab -l | grep watchdog

echo ""
echo "🔧 Ajustes recomendados no PM2 (rodar 1x):"
echo "   pm2 restart CentralDark-MCP --max-memory-restart 500M --exp-backoff-restart-delay=100"
echo "   pm2 save"
