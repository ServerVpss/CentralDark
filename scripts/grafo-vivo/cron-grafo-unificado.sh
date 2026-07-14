#!/usr/bin/env bash
# Mantém o grafo no padrão 2026: Graphify (estrutura) + import painel + overlay PM2 (GrafoVivo já roda em loop).
# Cron: 0 */6 * * * root /root/CentralDark/scripts/grafo-vivo/cron-grafo-unificado.sh
set -euo pipefail
export PATH="/root/.local/bin:/usr/local/bin:$PATH"
REPO="/root/CentralDark"
LOG="$REPO/logs/grafo-unificado-$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$LOG")"
exec >>"$LOG" 2>&1
echo "==== $(date -Is) grafo unificado ===="

cd "$REPO"
if command -v graphify >/dev/null 2>&1; then
  echo "[1] graphify update (sem LLM)..."
  graphify update "$REPO" --force || graphify update "$REPO" || echo "graphify update falhou (segue com graphify-out existente)"
else
  echo "[1] graphify ausente — usa graphify-out atual"
fi

echo "[2] import → panel..."
node "$REPO/scripts/grafo-vivo/import-graphify-to-panel.mjs" --max-nodes=2500

echo "[3] overlay PM2 (grafo vivo)..."
node "$REPO/scripts/grafo-vivo/gerar-grafo-vivo.mjs" || true

echo "[4] ok $(date -Is)"
