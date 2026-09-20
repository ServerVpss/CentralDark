#!/bin/bash
set -e

echo "=== CentralDark Elite V2 - Instalador Completo ==="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}[1/6]${NC} Atualizando sistema..."
apt update -qq && apt upgrade -y -qq

echo -e "${YELLOW}[2/6]${NC} Instalando dependências..."
apt install -y -qq python3 python3-pip python3-venv git curl wget xvfb \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 fonts-liberation

# Instala Chrome
if ! command -v google-chrome &> /dev/null; then
    echo -e "${YELLOW}[3/6]${NC} Instalando Google Chrome..."
    wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    apt install -y ./google-chrome-stable_current_amd64.deb
    rm -f google-chrome-stable_current_amd64.deb
fi

# Instala PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}[4/6]${NC} Instalando PM2..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs -qq
    npm install -g pm2 --silent
fi

echo -e "${YELLOW}[5/6]${NC} Criando estrutura de pastas..."
mkdir -p /root/CentralDark/apps/modulos/elite-gateway/{config,scripts,logs}
mkdir -p /root/.config/zendriver_chatgpt_profile

echo -e "${YELLOW}[6/6]${NC} Criando arquivo .env..."
cat > /root/CentralDark/apps/modulos/elite-gateway/config/.env << 'EOF'
ZENDRIVER_PROFILE=/root/.config/zendriver_chatgpt_profile
HEALTH_CHECK_INTERVAL=45
MAX_LATENCY_SECONDS=15
EOF

echo ""
echo -e "${GREEN}=== Instalação base concluída com sucesso! ===${NC}"
echo ""
echo "Próximos passos:"
echo "1. Rode: cd /root/CentralDark/apps/modulos/elite-gateway"
echo "2. Rode: python3 -m venv venv"
echo "3. Rode: source venv/bin/activate"
echo "4. Rode: pip install zendriver python-dotenv httpx fastapi uvicorn"
echo "5. Me avise quando terminar que eu te passo os scripts (humanizer.py, etc)"
