#!/bin/bash
# ══════════════════════════════════════════════════════════════
# SETUP: Configurar domínios bot.multizap.dev e proxy.multizap.dev
# Executar na VPS como root
# NÃO TOCAR em: 9001, 9002, whatsapp-server, Recargas
# ══════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo -e "${YELLOW} Setup: bot.multizap.dev + proxy.multizap.dev${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════${NC}"
echo ""

# 1. Backup do Caddyfile
CADDYFILE="/etc/caddy/Caddyfile"
if [ ! -f "$CADDYFILE" ]; then
  echo -e "${RED}Caddyfile não encontrado em $CADDYFILE${NC}"
  echo "Procurando..."
  CADDYFILE=$(find / -name "Caddyfile" -type f 2>/dev/null | head -1)
  if [ -z "$CADDYFILE" ]; then
    echo -e "${RED}Caddyfile não encontrado. Abortando.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Encontrado: $CADDYFILE${NC}"
fi

cp "$CADDYFILE" "${CADDYFILE}.backup.$(date +%Y%m%d%H%M%S)"
echo -e "${GREEN}[OK] Backup: ${CADDYFILE}.backup.*${NC}"

# 2. Verificar se bot.multizap.dev já existe
if grep -q "bot.multizap.dev" "$CADDYFILE"; then
  echo -e "${YELLOW}[SKIP] bot.multizap.dev já existe no Caddyfile${NC}"
else
  echo "" >> "$CADDYFILE"
  cat >> "$CADDYFILE" << 'CADDY_BOT'

bot.multizap.dev {
    root * /root/Multizap/apps/clone-deck/dist
    try_files {path} /index.html
    file_server
    encode gzip
}
CADDY_BOT
  echo -e "${GREEN}[OK] bot.multizap.dev adicionado${NC}"
fi

# 3. Verificar se proxy.multizap.dev já existe
if grep -q "proxy.multizap.dev" "$CADDYFILE"; then
  echo -e "${YELLOW}[SKIP] proxy.multizap.dev já existe no Caddyfile${NC}"
else
  echo "" >> "$CADDYFILE"
  cat >> "$CADDYFILE" << 'CADDY_PROXY'

proxy.multizap.dev {
    reverse_proxy localhost:3100
}
CADDY_PROXY
  echo -e "${GREEN}[OK] proxy.multizap.dev adicionado${NC}"
fi

# 4. Validar e recarregar Caddy
echo ""
echo "Validando Caddyfile..."
if caddy validate --config "$CADDYFILE" 2>&1; then
  echo -e "${GREEN}[OK] Caddyfile válido${NC}"
  caddy reload --config "$CADDYFILE" 2>&1 || systemctl reload caddy 2>&1
  echo -e "${GREEN}[OK] Caddy recarregado${NC}"
else
  echo -e "${RED}[ERRO] Caddyfile inválido. Restaurando backup...${NC}"
  cp "${CADDYFILE}.backup."* "$CADDYFILE" 2>/dev/null
  exit 1
fi

# 5. Build do clone-deck (se não existe dist/)
CLONE_DECK="/root/Multizap/apps/clone-deck"
if [ ! -d "${CLONE_DECK}/dist" ]; then
  echo ""
  echo "Build do clone-deck..."
  cd "$CLONE_DECK"
  npm install --silent 2>&1 | tail -1
  npm run build 2>&1 | tail -3
  echo -e "${GREEN}[OK] Build concluído${NC}"
else
  echo -e "${GREEN}[OK] dist/ já existe${NC}"
fi

# 6. Verificação
echo ""
echo "=== VERIFICAÇÃO ==="
echo "Portas:"
ss -tlnp | grep -E '80|443|3100' | head -5
echo ""
echo "Testando domínios..."
sleep 2
curl -s -o /dev/null -w "bot.multizap.dev → HTTP %{http_code}\n" --connect-timeout 5 https://bot.multizap.dev 2>/dev/null || echo "bot.multizap.dev → aguardando DNS"
curl -s -o /dev/null -w "proxy.multizap.dev → HTTP %{http_code}\n" --connect-timeout 5 https://proxy.multizap.dev/health 2>/dev/null || echo "proxy.multizap.dev → aguardando DNS"
echo ""
echo -e "${GREEN}Setup concluído!${NC}"
