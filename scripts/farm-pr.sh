#!/usr/bin/env bash
# 🎖️  farm-pr.sh — abre PR fake, auto-mergeia e farma medalha do GitHub.
# Uso: bash scripts/farm-pr.sh [quantidade]   (padrão: 1)
# Requer: gh autenticado (gh auth status).
# #OBSERVACOES#
# @owner: scripts/farm-pr.sh
# @doc_ref: docs/CONSCIENCIA/BRANCHES-ESTACIONADAS-PR-MAE.md
# @last_updated: 2026-11-03T17:50:02.265Z
# @implementado: fonte do fluxo de squash preserva a branch; sync local apenas fast-forward.
# @pendente: consumo por executores/CI não comprovado; não executar farm neste escopo.
# @estado: SOURCE_ONLY; BRANCH_DELETE_ALLOWED=false; EXECUTION_NOT_TESTED
# @next_cursor: conferir diff e readback do PR #1977, sem VPS ou deploy.

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

  # Branch preservada (PR #1977): squash não autoriza exclusão da ref.
  if gh pr merge "$PR_NUM" --squash --auto >/dev/null 2>&1; then
    echo "🛡️ Auto-merge solicitado no PR #${PR_NUM}; branch preservada."
  elif gh pr merge "$PR_NUM" --squash >/dev/null 2>&1; then
    echo "🛡️ Squash aceito no PR #${PR_NUM}; branch preservada."
  else
    echo "🟠 PR #${PR_NUM}: merge não comprovado; branch preservada." >&2
  fi

  # Sincronização local somente fast-forward; nunca reset destrutivo.
  git checkout main --quiet
  git fetch origin main --quiet
  if ! git merge --ff-only origin/main --quiet; then
    echo "🟠 main local divergente: preservar alterações e interromper sem reset." >&2
    exit 1
  fi

  # Pequena pausa pra não estourar rate limit
  [ "$QTD" -gt 1 ] && sleep 3
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Farm concluído: ${QTD} PR(s) processado(s)"
echo "Veja em: https://github.com/segredounlock/clone-deck/pulls?q=is%3Apr+is%3Aclosed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
