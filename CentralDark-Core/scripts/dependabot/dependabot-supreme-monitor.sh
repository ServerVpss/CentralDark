#!/usr/bin/env bash
# dependabot-supreme-monitor.sh
# Monitora o sistema dependabot em tempo real
# Executar: bash scripts/dependabot-supreme-monitor.sh

set -euo pipefail

echo "=== DEPENDABOT SUPREME MONITOR ==="
echo "Iniciado: $(date -Iseconds)"

REPO="ServerVpss/CentralDark"

# 1. Listar PRs do dependabot abertos
echo ""
echo "📋 PRs do Dependabot abertos:"
gh pr list \
  --repo "$REPO" \
  --state open \
  --json number,title,state,mergeable \
  --jq '.[] | select(.title | test("dependabot"; "i")) | "  [#\(.number)] \(.title) | Mergeável: \(.mergeable)"' 2>/dev/null || echo "  Nenhum PR encontrado"

echo ""
echo "🧮 Chance viva de reconciliação (último receipt do gate):"
mapfile -t DB_PRS < <(
  gh pr list \
    --repo "$REPO" \
    --state open \
    --json number,title,author \
    --jq '.[] | select(.author.login == "dependabot[bot]" or (.title | test("dependabot"; "i"))) | [.number,.title] | @tsv' 2>/dev/null || true
)
if [ "${#DB_PRS[@]}" -eq 0 ]; then
  echo "  Nenhum PR Dependabot aberto"
else
  for row in "${DB_PRS[@]}"; do
    IFS=$'\t' read -r pr title <<<"$row"
    receipt="$(gh api "repos/$REPO/issues/$pr/comments" --jq '[.[] | select(.body | contains("centraldark-dependabot-compatibility-gate"))][-1].body // ""' 2>/dev/null || true)"
    chance="$(grep -oE 'RECONCILIATION_CHANCE: \*\*[0-9]{1,3}%\*\* \([^)]*\)' <<<"$receipt" | head -1 || true)"
    decision="$(grep -oE 'DECISION: \*\*[A-Z_]+\*\*' <<<"$receipt" | head -1 || true)"
    blockers="$(grep -oE 'BLOCKERS: `[^`]*`' <<<"$receipt" | head -1 || true)"
    printf '  [#%s] %s\n    %s | %s | %s\n' "$pr" "$title" "${chance:-RECONCILIATION_CHANCE: UNKNOWN}" "${decision:-DECISION: UNKNOWN}" "${blockers:-BLOCKERS: UNKNOWN}"
  done
fi

# 2. Verificar workflow runs recentes
echo ""
echo "🔄 Últimos workflow runs do dependabot-auto-merge:"
gh run list \
  --workflow dependabot-auto-merge.yml \
  --limit 5 \
  --json name,conclusion,status,databaseId \
  --jq '.[] | "  Run #\(.databaseId): \(.conclusion)/\(.status) — \(.name)"' 2>/dev/null || echo "  Nenhum run encontrado"

# 3. Verificar runner status
echo ""
echo "🏃 Status do runner self-hosted:"
gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | "  \(.name): \(.status) (busy: \(.busy))"' 2>/dev/null || echo "  Não foi possível verificar"

# 4. Verificar se há PRs com conflitos pendentes
echo ""
echo "⚠️  PRs com conflitos (mergeable=false):"
gh pr list \
  --repo "$REPO" \
  --state open \
  --json number,title,mergeable \
  --jq '.[] | select(.mergeable == false) | "  [#\(.number)] \(.title) | CONFLITUANTE"' 2>/dev/null || echo "  Nenhum conflito pendente"

# 5. Resumo
echo ""
echo "=== RESUMO ==="
TOTAL_DB=$(gh pr list --repo "$REPO" --state all --json number,title --jq '.[] | select(.title | test("dependabot"; "i")) | .number' 2>/dev/null | wc -l || echo "0")
OPEN_DB=$(gh pr list --repo "$REPO" --state open --json number,title --jq '.[] | select(.title | test("dependabot"; "i")) | .number' 2>/dev/null | wc -l || echo "0")
echo "Total PRs dependabot (histórico): $TOTAL_DB"
echo "PRs abertos: $OPEN_DB"
echo "Status: TODO OPERACIONAL" 

echo ""
echo "Concluído: $(date -Iseconds)"
