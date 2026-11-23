#!/usr/bin/env bash
# 🎖️  farm-pr.sh — abre PR fake, auto-mergeia e farma medalha do GitHub.
# Uso: bash scripts/farm-pr.sh [quantidade]   (padrão: 1)
# Requer: gh autenticado (gh auth status).

set -euo pipefail

QTD="${1:-1}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Verifica gh
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ gh CLI não instalado. Instala com: sudo apt install gh"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ gh não autenticado. Roda: gh auth login"
  exit 1
fi

# Garante main atualizada
git fetch origin main --quiet
git checkout main --quiet
git pull --rebase origin main --quiet

CO_AUTHOR="Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>"

for i in $(seq 1 "$QTD"); do
  STAMP="$(date +%Y%m%d-%H%M%S)"
  BRANCH="farm/medalha-${STAMP}-${i}"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎖️  Farm PR ${i}/${QTD} — branch ${BRANCH}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  git checkout -b "$BRANCH" --quiet

  # Garante arquivo de log existindo
  if [ ! -f docs/FARM_LOG.md ]; then
    mkdir -p docs
    cat > docs/FARM_LOG.md <<'EOF'
# 🎖️ FARM LOG — Histórico de PRs de medalha

Registro automático dos PRs abertos pelo `scripts/farm-pr.sh`.

| Data (BRT) | PR | Branch | Medalha alvo |
|---|---|---|---|
EOF
  fi

  DATA_BRT="$(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S')"
  echo "| ${DATA_BRT} | (pending) | ${BRANCH} | Pull Shark + YOLO + Quickdraw + Pair Extraordinaire |" >> docs/FARM_LOG.md

  git add docs/FARM_LOG.md
  git commit --quiet -m "chore(farm): registra PR de medalha ${STAMP}-${i}

${CO_AUTHOR}"

  git push --quiet -u origin "$BRANCH"

  PR_URL=$(gh pr create \
    --base main \
    --head "$BRANCH" \
    --title "chore(farm): medalha ${STAMP}-${i}" \
    --body "PR automatizado pelo script \`scripts/farm-pr.sh\` para farm de medalhas do GitHub.

Só atualiza \`docs/FARM_LOG.md\`. Zero impacto operacional.

${CO_AUTHOR}")

  PR_NUM=$(echo "$PR_URL" | grep -oE '[0-9]+$')
  echo "✅ PR aberto: ${PR_URL}"

  # Reação ❤️ no PR (Heart On Your Sleeve reforço)
  gh api -X POST "repos/{owner}/{repo}/issues/${PR_NUM}/reactions" \
    -H "Accept: application/vnd.github.squirrel-girl-preview+json" \
    -f content='heart' >/dev/null 2>&1 || true

  # Auto-merge (tolerante a falhas — branch pode já ter sido deletada por auto-merge anterior)
  gh pr merge "$PR_NUM" --squash --delete-branch --auto >/dev/null 2>&1 || \
    gh pr merge "$PR_NUM" --squash --delete-branch >/dev/null 2>&1 || true

  echo "🚀 Auto-merge ativado no PR #${PR_NUM}"

  # Volta pra main e força sincronia (evita conflito com auto-merge em andamento)
  git checkout main --quiet 2>/dev/null || true
  git fetch origin main --quiet 2>/dev/null || true
  git reset --hard origin/main --quiet 2>/dev/null || true

  # Pequena pausa pra não estourar rate limit
  [ "$QTD" -gt 1 ] && sleep 3
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Farm concluído: ${QTD} PR(s) processado(s)"
echo "Veja em: https://github.com/segredounlock/clone-deck/pulls?q=is%3Apr+is%3Aclosed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
