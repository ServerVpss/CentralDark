#!/usr/bin/env bash
# dependabot-monitor.sh — Monitora atualizações do Dependabot
# Executa a cada minuto (* * * * *)
# Modo: no-agent (script stdout delivered directly)
#
# PURPOSE:
#   - Listar PRs criados pelo dependabot
#   - Verificar se há PRs aprovados/mergeáveis
#   - Alertar sobre dependências críticas atualizáveis

set -euo pipefail

echo "[DEPENDABOT-MONITOR] INICIANDO monitoramento ($(date +%Y%m%dT%H%M%S))"

REPO="ServerVpss/CentralDark"

# 1. PRs criados pelo dependabot (últimos 10)
echo "[DEPENDABOT-MONITOR] PRs do dependabot (últimos 10):"
gh pr list --repo "${REPO}" --state all --json number,title,state,mergedAt,updatedAt --jq '.[] | select(.title | test("dependabot"; "i")) | "[PR #\(.number)] \(.title) | \(.state) | updated: \(.updatedAt)"' 2>&1 | head -10 || echo "[DEPENDABOT-MONITOR] Nenhum PR do dependabot encontrado ou erro"

# 2. Verificar se há PRs que podem ser mergeados (sem conflitos)
echo ""
echo "[DEPENDABOT-MONITOR] PRs mergeáveis:"
gh pr list --repo "${REPO}" --state open --json number,title,mergeable --jq '.[] | select(.mergeable == true) | "[PR #\(.number)] \(.title) | MERGEÁVEL"' 2>&1 || echo "[DEPENDABOT-MONITOR] Erro ao verificar mergeabilidade"

# 3. Resumo
TOTAL_DB=$(gh pr list --repo "${REPO}" --state all --json number,title --jq '.[] | select(.title | test("dependabot"; "i")) | .number' 2>/dev/null | wc -l || echo "0")
echo ""
echo "[DEPENDABOT-MONITOR] Total de PRs do dependabot (history): ${TOTAL_DB}"
echo "[DEPENDABOT-MONITOR] CONCLUÍDO — $(date +%Y%m%dT%H%M%S)"
exit 0
