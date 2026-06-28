#!/usr/bin/env bash
# Reinicia o MCP-CentralDark injetando GH_TOKEN/GITHUB_TOKEN do secrets/.env.
# Necessário porque PM2 snapshota env na criação e não re-lê automaticamente.
set -euo pipefail

ENV_FILE="/root/CentralDark/secrets/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não encontrado" >&2
  exit 1
fi

# Exportar todas as vars do secrets/.env para o processo corrente
# set -a exporta automaticamente; set +a desliga
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "[mcp-restart] GH_TOKEN presente: $([ -n "${GH_TOKEN:-}" ] && echo 'sim' || echo 'NÃO')"
echo "[mcp-restart] GITHUB_TOKEN presente: $([ -n "${GITHUB_TOKEN:-}" ] && echo 'sim' || echo 'NÃO')"

# PM2 restart --update-env absorve o env do shell atual (sem expor no cmd line)
pm2 restart MCP-CentralDark --update-env 2>&1
sleep 5

echo "[mcp-restart] Status:"
pm2 describe MCP-CentralDark 2>&1 | grep -E 'status|restart' | head -2

# Salvar estado
pm2 save 2>&1 | tail -1
echo "[mcp-restart] Concluído."
