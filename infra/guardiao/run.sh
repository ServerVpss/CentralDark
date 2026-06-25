#!/usr/bin/env bash
# Instalação + execução do Guardião da Consciência via PM2.
# IMPORTANTE: roda pytest antes de subir — se algum teste falhar, aborta.
set -euo pipefail
cd "$(dirname "$0")"

echo "🛡️  Guardião da Consciência — instalação"

# 1. venv + dependências
if [ ! -d .venv ]; then
  echo "→ Criando venv..."
  python3 -m venv .venv
fi
source .venv/bin/activate
echo "→ Instalando dependências..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# 2. valida secrets obrigatórios
echo "→ Validando secrets..."
: "${CENTRALDARK_MCP_TOKEN:?ERRO: exporte CENTRALDARK_MCP_TOKEN no /root/.env}"
: "${NOTIFY_API_KEY:?ERRO: exporte NOTIFY_API_KEY no /root/.env}"
echo "  ✓ CENTRALDARK_MCP_TOKEN presente"
echo "  ✓ NOTIFY_API_KEY presente"

# 3. roda testes ANTES de subir (aborta se falhar — set -e ativo)
echo "→ Rodando testes unitários do classificador..."
pytest tests/ -v

# 4. PM2
echo "→ Subindo no PM2..."
pm2 delete guardiao-consciencia 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Guardião online em modo 'propor' (travado até 08/07/2026)"
echo "   Logs:    pm2 logs guardiao-consciencia"
echo "   Status:  pm2 status guardiao-consciencia"
