#!/bin/bash
# ══════════════════════════════════════════════════════════════
# SETUP: MultiZap Telegram Bot
# Usa tokens do /root/Multizap/secrets/wabot.env
# NÃO TOCAR em: 9001, 9002, whatsapp-server, Recargas
# ══════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

WABOT_ENV="/root/Multizap/secrets/wabot.env"
BOT_DIR="/root/Multizap/apps/clone-deck/integracoes/telegram"

echo ""
echo "══════════════════════════════════════════════"
echo " Setup: MultiZap-TelegramBot"
echo "══════════════════════════════════════════════"
echo ""

# 1. Verificar token
if [ -f "$WABOT_ENV" ]; then
  source "$WABOT_ENV" 2>/dev/null || true
  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
    echo -e "${RED}[ERRO] TELEGRAM_BOT_TOKEN não definido em $WABOT_ENV${NC}"
    echo "Adicione: TELEGRAM_BOT_TOKEN=seu_token_aqui"
    exit 1
  fi
  echo -e "${GREEN}[OK] TELEGRAM_BOT_TOKEN encontrado${NC}"
else
  echo -e "${RED}[ERRO] $WABOT_ENV não encontrado${NC}"
  exit 1
fi

# 2. Instalar dotenv
cd "$BOT_DIR"
if [ ! -d "node_modules/dotenv" ]; then
  npm init -y > /dev/null 2>&1 || true
  npm install dotenv > /dev/null 2>&1
  echo -e "${GREEN}[OK] dotenv instalado${NC}"
fi

# 3. PM2
if pm2 list 2>/dev/null | grep -q 'MultiZap-TelegramBot'; then
  echo "Reiniciando..."
  pm2 restart MultiZap-TelegramBot 2>&1
else
  echo "Iniciando..."
  pm2 start ecosystem.config.cjs 2>&1
fi
pm2 save 2>&1

echo ""
sleep 2
echo "=== PM2 ==="
pm2 list | grep -E 'MultiZap-TelegramBot'
echo ""
echo "=== LOGS ==="
tail -10 /var/log/multizap-telegram-bot-out.log 2>/dev/null || echo "(aguardando logs)"
echo ""
echo -e "${GREEN}Setup concluído! Bot deve estar respondendo.${NC}"
echo "Teste: mande /start no Telegram para o bot."
