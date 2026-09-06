#!/usr/bin/env bash
# Motor único da Casa para conflito de PR — Dependabot ou humano.
#
# Política:
#   - trabalha em worktree isolado: nunca troca a branch da Casa principal;
#   - PR_KIND=dependabot: manifestos/lockfiles preservam o lado do PR; resto preserva main;
#   - PR_KIND=human: o motor mede/lista o conflito e BLOQUEIA resolução cega de conteúdo;
#   - nunca inventa branch de destino;
#   - nunca empurra para main;
#   - conflito/refutação vira receipt/minério; não some em silêncio.

set -euo pipefail

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
PR_HEAD_REF="${PR_HEAD_REF:-}"
PR_KIND="${PR_KIND:-UNKNOWN}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
FETCH_REF="refs/centraldark/pr/${PR_NUM}"
WORKTREE_ROOT="${CENTRALDARK_DEPENDABOT_WORKTREES:-${TMPDIR:-/tmp}/centraldark-dependabot}"
WORKTREE="${WORKTREE_ROOT}/pr-${PR_NUM}-$$"

if [ -z "$PR_HEAD_REF" ]; then
  echo "BLOCKED_MISSING_PR_HEAD_REF"
  exit 2
fi

if [ "$PR_HEAD_REF" = "main" ]; then
  echo "BLOCKED_DIRECT_MAIN_TARGET"
  exit 2
fi

case "$PR_KIND" in
  dependabot|human) ;;
  *)
    echo "BLOCKED_UNKNOWN_PR_KIND=$PR_KIND"
    exit 2
    ;;
esac

git check-ref-format "refs/heads/$PR_HEAD_REF" >/dev/null || {
  echo "BLOCKED_INVALID_PR_HEAD_REF=$PR_HEAD_REF"
  exit 2
}

[ -d "$REPO_DIR/.git" ] || [ -f "$REPO_DIR/.git" ] || {
  echo "BLOCKED_REPO_NOT_FOUND=$REPO_DIR"
  exit 2
}

mkdir -p "$WORKTREE_ROOT"

cleanup() {
  set +e
  git -C "$REPO_DIR" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  git -C "$REPO_DIR" worktree prune >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "🧭 RESOLVER_PR=$PR_NUM"
echo "🧬 PR_KIND=$PR_KIND"
echo "🔄 PR_HEAD_REF=$PR_HEAD_REF"
echo "🏠 CASA_WORKTREE_MUTATED=0"
echo "🧱 ISOLATED_WORKTREE=$WORKTREE"

git -C "$REPO_DIR" fetch --prune origin main
git -C "$REPO_DIR" fetch --force origin "refs/pull/${PR_NUM}/head:${FETCH_REF}"
git -C "$REPO_DIR" worktree add --detach "$WORKTREE" "$FETCH_REF"

cd "$WORKTREE"

set +e
MERGE_OUTPUT="$(git merge --no-commit --no-ff origin/main 2>&1)"
MERGE_STATUS=$?
set -e
printf '%s\n' "$MERGE_OUTPUT"

if [ "$MERGE_STATUS" -eq 0 ]; then
  echo "NO_CONFLICT_UPDATE_BRANCH_CAN_HANDLE"
  git merge --abort 2>/dev/null || true
  exit 0
fi

if ! grep -q "CONFLICT" <<<"$MERGE_OUTPUT"; then
  echo "MERGE_FAILED_WITHOUT_CONFLICT status=$MERGE_STATUS"
  git merge --abort 2>/dev/null || true
  exit "$MERGE_STATUS"
fi

echo "CONFLICT_DETECTED"
mapfile -t CONFLICTS < <(git diff --name-only --diff-filter=U)

if [ "${#CONFLICTS[@]}" -eq 0 ]; then
  echo "BLOCKED_CONFLICT_WITHOUT_UNMERGED_PATHS"
  git merge --abort 2>/dev/null || true
  exit 3
fi

printf 'CONFLICT_COUNT=%s\n' "${#CONFLICTS[@]}"
printf 'CONFLICT_PATH=%s\n' "${CONFLICTS[@]}"

# PR humano passa pelo MESMO radar/motor, mas sem resolução semântica cega.
# O Writer do escopo deve reconciliar os arquivos conscientemente; o motor apenas
# prova a lista, preserva a branch e devolve cursor determinístico.
if [ "$PR_KIND" = "human" ]; then
  echo "HUMAN_CONFLICT_AUTO_RESOLUTION=BLOCKED_FAIL_CLOSED"
  echo "NEXT_CURSOR=SEMANTIC_WRITER_RECONCILE"
  echo "DIRECT_MAIN_WRITE=0"
  echo "PR_BRANCH_WRITE=0"
  git merge --abort 2>/dev/null || true
  exit 5
fi

# Dependabot: estamos no HEAD do PR e fazemos merge de origin/main:
#   --ours   = PR
#   --theirs = main
for f in "${CONFLICTS[@]}"; do
  case "$f" in
    package.json|package-lock.json|pnpm-lock.yaml|yarn.lock|\
    */package.json|*/package-lock.json|*/pnpm-lock.yaml|*/yarn.lock)
      echo "RESOLVE path=$f winner=PR"
      git checkout --ours -- "$f"
      git add -- "$f"
      ;;
    *)
      echo "RESOLVE path=$f winner=MAIN fail_closed=1"
      git checkout --theirs -- "$f"
      git add -- "$f"
      ;;
  esac
done

if git diff --name-only --diff-filter=U | grep -q .; then
  echo "BLOCKED_UNRESOLVED_CONFLICTS"
  git diff --name-only --diff-filter=U
  git merge --abort 2>/dev/null || true
  exit 4
fi

git -c user.name='CentralDark Dependabot Resolver' \
    -c user.email='actions@users.noreply.github.com' \
    commit --no-edit

NEW_HEAD="$(git rev-parse HEAD)"
git push origin "HEAD:refs/heads/${PR_HEAD_REF}"

echo "RESOLVED_AND_PUSHED pr=${PR_NUM} kind=${PR_KIND} head_ref=${PR_HEAD_REF} head=${NEW_HEAD}"
echo "DIRECT_MAIN_WRITE=0"
echo "CASA_WORKTREE_MUTATED=0"
echo "ONE_CONFLICT_ENGINE=1"
