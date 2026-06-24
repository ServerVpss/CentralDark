#!/bin/bash
# ══════════════════════════════════════════════════════════════
# SETUP: Supabase Sync Bridge — usa wabot.env existente na VPS
# NÃO TOCAR em: 9001, 9002, whatsapp-server, Recargas
# ══════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

BRIDGE_DIR="/root/Multizap/apps/clone-deck/server/src/bridge"
WABOT_ENV="/root/Multizap/secrets/wabot.env"

echo ""
echo "══════════════════════════════════════════════"
echo " Setup: CloneDeck-Supabase-Sync"
echo "══════════════════════════════════════════════"
echo ""

# 1. Verificar wabot.env
if [ -f "$WABOT_ENV" ]; then
  echo -e "${GREEN}[OK] wabot.env encontrado${NC}"
  echo "  Variáveis disponíveis:"
  grep -oP '^[A-Z_]+' "$WABOT_ENV" 2>/dev/null | sed 's/^/    /'
else
  echo -e "${RED}[ERRO] $WABOT_ENV não encontrado${NC}"
  exit 1
fi

# 2. Instalar dotenv se necessário
cd "$BRIDGE_DIR"
if [ ! -d "node_modules/dotenv" ]; then
  echo "Instalando dotenv..."
  npm init -y > /dev/null 2>&1 || true
  npm install dotenv > /dev/null 2>&1
  echo -e "${GREEN}[OK] dotenv instalado${NC}"
else
  echo -e "${GREEN}[OK] dotenv já existe${NC}"
fi

# 3. Verificar se já roda no PM2
if pm2 list 2>/dev/null | grep -q 'CloneDeck-Supabase-Sync'; then
  echo "Reiniciando CloneDeck-Supabase-Sync..."
  pm2 restart CloneDeck-Supabase-Sync 2>&1
else
  echo "Iniciando CloneDeck-Supabase-Sync..."
  pm2 start ecosystem.config.js 2>&1
fi
pm2 save 2>&1

echo ""
echo -e "${GREEN}[OK] CloneDeck-Supabase-Sync ativo${NC}"
echo ""

# 4. Verificar
sleep 3
echo "=== PM2 ==="
pm2 list | grep -E 'CloneDeck-Supabase-Sync|CloneDeck'
echo ""
echo "=== LOGS (últimas 10 linhas) ==="
tail -10 /var/log/clone-deck-supabase-sync-out.log 2>/dev/null || echo "(sem logs ainda)"
echo ""
echo -e "${GREEN}Setup concluído!${NC}"
