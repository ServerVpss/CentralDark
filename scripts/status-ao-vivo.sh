#!/bin/bash
# ============================================================================
# STATUS AO VIVO — CentralDark
# Painel de monitoramento em tempo real da VPS
# Uso: ./scripts/status-ao-vivo.sh   ou   status   (se configurar alias)
# ============================================================================

# Localiza o Python e executa o painel
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON=$(command -v python3 || command -v python)

if [ -z "$PYTHON" ]; then
  echo "ERRO: Python não encontrado. Instale python3."
  exit 1
fi

exec "$PYTHON" "$SCRIPT_DIR/status-ao-vivo.py"
