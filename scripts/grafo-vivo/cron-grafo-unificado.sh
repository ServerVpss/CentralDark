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
  echo "[1] graphify update incremental (sem LLM)..."
  if graphify update "$REPO"; then
    echo "GRAPHIFY_UPDATE=PASS"
  else
    echo "GRAPHIFY_UPDATE=FAIL"
    exit 20
  fi
else
  echo "GRAPHIFY_UPDATE=UNKNOWN (graphify ausente)"
  exit 21
fi

echo "[2] import → panel..."
node "$REPO/scripts/grafo-vivo/import-graphify-to-panel.mjs" --max-nodes=2500
echo "GRAPH_IMPORT=PASS"

echo "[3] overlay PM2 (grafo vivo)..."
node "$REPO/scripts/grafo-vivo/gerar-grafo-vivo.mjs"
echo "GRAPH_OVERLAY=PASS"
echo "[4] GRAPH_CONTEXT_MAP=UPDATED $(date -Is)"
