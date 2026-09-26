#!/usr/bin/env bash
set -euo pipefail

ROOT="/e/CentralDark"
TARGET_ROOT="$ROOT"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
QUARANTINE="$ROOT/_QUARANTINE/repos-$TS"
RECEIPT_DIR="$ROOT/docs/RECEIPTS"
RECEIPT="$RECEIPT_DIR/${TS}-canonical-root-quarantine-dryrun.md"
APPLY="${APPLY:-0}"

mkdir -p "$QUARANTINE" "$RECEIPT_DIR" "$ROOT/scripts"

echo "⭕ CENTRALDARK · CANONICAL ROOT DISCOVERY"
echo "ts=$TS"
echo "root=$ROOT"
echo "target_root=$TARGET_ROOT"
echo "quarantine=$QUARANTINE"
echo "apply=$APPLY"

# ── 1. Descobre o repo canônico dinamicamente ──────────────────────────────
SOURCE_REPO=""
for candidate in \
  "." \
  "CentralDark" \
  "CentralDark/CentralDark" \
  "CentralDark/CentralDark/CentralDark"
do
  [ ! -d "$candidate" ] && continue
  if git -C "$candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    TOPLEVEL="$(git -C "$candidate" rev-parse --show-toplevel 2>/dev/null || true)"
    if [ -n "$TOPLEVEL" ]; then
      SOURCE_REPO="$TOPLEVEL"
      break
    fi
  fi
done

if [ -z "$SOURCE_REPO" ]; then
  echo "🔴 BLOCKED_REAL: nenhum repo Git canônico encontrado em $ROOT" | tee "$RECEIPT"
  exit 1
fi

echo "✅ SOURCE_REPO_DESCOBERADO=$SOURCE_REPO" | tee -a "$RECEIPT"
SOURCE_REMOTE="$(git -C "$SOURCE_REPO" remote get-url origin 2>/dev/null || true)"
SOURCE_BRANCH="$(git -C "$SOURCE_REPO" branch --show-current 2>/dev/null || true)"
SOURCE_HEAD="$(git -C "$SOURCE_REPO" rev-parse HEAD 2>/dev/null || true)"
echo "source_remote=$SOURCE_REMOTE" | tee -a "$RECEIPT"
echo "source_branch=$SOURCE_BRANCH" | tee -a "$RECEIPT"
echo "source_head=$SOURCE_HEAD" | tee -a "$RECEIPT"

# ── 2. Dirty status ─────────────────────────────────────────────────────────
echo "=== Dirty status do repo fonte ===" | tee -a "$RECEIPT"
git -C "$SOURCE_REPO" status --short | tee -a "$RECEIPT" || true
DIRTY_COUNT="$(git -C "$SOURCE_REPO" status --short | wc -l | tr -d ' ')"
echo "dirty_count=$DIRTY_COUNT" | tee -a "$RECEIPT"
TRACKED="$(git -C "$SOURCE_REPO" status --short | grep -v '^?? ' | wc -l | tr -d ' ')"
UNTRACKED="$(git -C "$SOURCE_REPO" status --short | grep '^?? ' | wc -l | tr -d ' ')"
echo "dirty_tracked=$TRACKED" | tee -a "$RECEIPT"
echo "dirty_untracked=$UNTRACKED" | tee -a "$RECEIPT"

# ── 3. Classifica repos conhecidos (não-worktrees) ──────────────────────────
echo "=== Classificando repos conhecidos (exclui worktrees) ===" | tee -a "$RECEIPT"

# Known directories to classify (not worktrees)
known_dirs=(
  "clean"
  "full"
  "hermes-webui"
  "hermes-webui/hermes-webui"
  "MOTOR-TESTE"
  "scratch/horn-caracol-gate-main-20260909-1788941710"
  "scratch/obsidian-center-main-20260909"
  "workspace"
  "workspace/CentralDark"
  "workspace/centraldark-main"
  "workspace/centraldark-squash-fixedpoint-20260909"
  "workspace/CentralDarkworkspaceCentralDark"
  "workspace/profile-index-20260909"
)

classified=0
for d in "${known_dirs[@]}"; do
  repo="$ROOT/$d"
  [ ! -d "$repo" ] && continue
  [ ! -d "$repo/.git" ] && [ ! -f "$repo/.git" ] && continue

  repo_top="$(timeout 5 git -C "$repo" rev-parse --show-toplevel 2>/dev/null || echo TIMEOUT)"
  [ -z "$repo_top" ] && continue
  [ "$repo_top" = "TIMEOUT" ] && echo "TIMEOUT on $repo" | tee -a "$RECEIPT" && continue

  if [ "$repo_top" = "$SOURCE_REPO" ]; then
    echo "🧊 CANONICAL_CURRENT $repo_top" | tee -a "$RECEIPT"
    continue
  fi

  remote="$(timeout 5 git -C "$repo_top" remote get-url origin 2>/dev/null || echo UNKNOWN)"
  head="$(timeout 5 git -C "$repo_top" rev-parse --short HEAD 2>/dev/null || echo NO_HEAD)"
  branch="$(timeout 5 git -C "$repo_top" branch --show-current 2>/dev/null || echo NO_BRANCH)"
  size="$(timeout 10 du -sh "$repo" 2>/dev/null | awk '{print $1}' || echo UNKNOWN_SIZE)"

  if [ "$remote" = "$SOURCE_REMOTE" ]; then
    class="DUPLICATE_SAME_REMOTE"
  elif [ "$remote" = "UNKNOWN" ]; then
    class="UNKNOWN_REPO_NO_REMOTE"
  else
    class="EXTERNAL_REPO_QUARANTINE_NOT_DELETE"
  fi

  echo "FOUND path=$repo class=$class size=$size branch=$branch head=$head remote=$remote" | tee -a "$RECEIPT"
  classified=$((classified+1))

  if [ "$APPLY" = "1" ]; then
    safe_name="$(basename "$repo")"
    dest="$QUARANTINE/$safe_name"
    echo "MOVE $repo -> $dest" | tee -a "$RECEIPT"
    mkdir -p "$(dirname "$dest")"
    mv "$repo" "$dest"
  else
    echo "DRY_RUN would_move=$repo -> $QUARANTINE/$(basename "$repo")" | tee -a "$RECEIPT"
  fi
done

echo "TOTAL_CLASSIFIED=$classified" | tee -a "$RECEIPT"

# ── 4. Raiz atual é repo? ───────────────────────────────────────────────────
echo "=== Raiz atual: é repo? ===" | tee -a "$RECEIPT"
if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ROOT_ALREADY_GIT_REPO=true" | tee -a "$RECEIPT"
  git -C "$ROOT" status --short | tee -a "$RECEIPT" || true
else
  echo "ROOT_ALREADY_GIT_REPO=false" | tee -a "$RECEIPT"
fi

# ── 5. Mede GitHub: main remoto + PR-mãe #1562 ─────────────────────────────
echo "=== PR-mãe #1562 e main remoto ===" | tee -a "$RECEIPT"
MAIN_HEAD="$(gh api repos/ServerVpss/CentralDark/commits/main --jq '.sha' 2>/dev/null || echo UNKNOWN_MAIN)"
echo "main_head=$MAIN_HEAD" | tee -a "$RECEIPT"
PR_DATA="$(gh pr view 1562 --repo ServerVpss/CentralDark --json number,state,title,headRefOid,baseRefName,headRefName,mergeable,mergeStateStatus,url,additions,deletions,changedFiles 2>/dev/null || echo NULL)"
echo "pr_1562=$PR_DATA" | tee -a "$RECEIPT"

# ── 6. Decisão ──────────────────────────────────────────────────────────────
echo "=== Decisão de migração física ===" | tee -a "$RECEIPT"
echo "MIGRATION_PHYSICAL_MOVE=NOT_EXECUTED" | tee -a "$RECEIPT"
echo "REASON=requires_atomic_phase_after_quarantine_and_dirty_classification" | tee -a "$RECEIPT"
echo "NEXT_PHASE=reposicionar_e_quearentar_com_APPLY=1" | tee -a "$RECEIPT"

{
  echo
  echo "🎯 PRÓXIMO PASSO"
  echo "- Se o DRY_RUN estiver correto, rodar:"
  echo
  echo "\`\`\`bash"
  echo "cd /e/CentralDark && APPLY=1 bash scripts/centraldark-canonical-root-quarantine.sh"
  echo "\`\`\`"
  echo
  echo "- Depois: fase separada para promover \`E:\\CentralDark\` como repo root canônico."
  echo
  echo "📌 PROVA"
  echo "- Receipt: \`$RECEIPT\`"
  echo
  echo "<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>"
} >> "$RECEIPT"

echo "✅ RECEIPT=$RECEIPT"
echo "🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF"