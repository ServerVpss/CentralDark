#!/bin/bash
# prs-open-commits-cycle.sh — Verifica PRs abertos com commits recentes
# Executa a cada 30 min (every 30m)
# Modo: no-agent (script stdout delivered directly)

echo "[PRS-CYCLE] INICIANDO verificação de PRs abertos ($(date +%Y%m%dT%H%M%S))"

REPO="ServerVpss/CentralDark"

# 1. Listar PRs abertos
echo "[PRS-CYCLE] Listando PRs abertos em ${REPO}..."
gh pr list --repo "${REPO}" --state open --json number,title,headRefName,updatedAt,additions,deletions \
  --jq '.[] | "[PR #" + (.number|tostring) + "] " + .title + " | branch: " + .headRefName + " | updated: " + .updatedAt + " | +" + (.additions|tostring) + "/-" + (.deletions|tostring)' 2>&1 \
  || echo "[PRS-CYCLE] ERRO: não foi possível listar PRs"

# 2. Contagem
TOTAL_PRS=$(gh pr list --repo "${REPO}" --state open --json number --jq 'length' 2>/dev/null || echo "0")
echo "[PRS-CYCLE] Total de PRs abertos: ${TOTAL_PRS}"

# 3. Commits dos PRs principais (top 5)
echo "[PRS-CYCLE] Commits recentes dos PRs abertos (top 5):"
gh pr list --repo "${REPO}" --state open --limit 5 --json number,headRefName \
  --jq '.[] | "\(.headRefName)"' 2>/dev/null | while read branch; do
    if [ -n "$branch" ]; then
        echo "[PRS-CYCLE] Commits em ${branch}:"
        gh log origin/"${branch}" --oneline -5 2>/dev/null | while read commit; do
            echo "  - ${commit}"
        done
    fi
done

echo "[PRS-CYCLE] CONCLUÍDO — verificação concluída com sucesso ($(date +%Y%m%dT%H%M%S))"
exit 0
