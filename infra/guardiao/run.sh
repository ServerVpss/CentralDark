#!/usr/bin/env bash
# Instalação + execução do Guardião + Analista via PM2.
set -euo pipefail
cd "$(dirname "$0")"

echo "🛡️  Guardião + 🧠 Analista — instalação"

# 1. venv + dependências
if [ ! -d .venv ]; then
  echo "→ Criando venv..."
  python3 -m venv .venv
fi
source .venv/bin/activate
echo "→ Instalando dependências..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# 2. carrega secrets
if [ -f /etc/centraldark/notify.env ]; then
  echo "→ Carregando /etc/centraldark/notify.env ..."
  set -a; source /etc/centraldark/notify.env; set +a
fi

# valida secrets obrigatórios
echo "→ Validando secrets..."
: "${CENTRALDARK_MCP_TOKEN:?ERRO: exporte CENTRALDARK_MCP_TOKEN no ambiente}"
: "${NOTIFY_API_KEY:?ERRO: NOTIFY_API_KEY ausente — confira /etc/centraldark/notify.env}"
echo "  ✓ CENTRALDARK_MCP_TOKEN presente"
echo "  ✓ NOTIFY_API_KEY presente"

# 3. testes
echo "→ Rodando testes..."
pytest tests/ -v

# 4. PM2 — Guardião + Analista
echo "→ Subindo no PM2..."
pm2 delete guardiao-consciencia 2>/dev/null || true
pm2 delete guardiao-analista 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ Guardião + Analista online"
echo "   pm2 logs guardiao-consciencia"
echo "   pm2 logs guardiao-analista"
