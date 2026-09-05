#!/usr/bin/env bash
# scripts/dependabot/resolve-conflicts.sh
# Motor único da Casa para conflito de PR de bump.
#
# Política:
#   - manifestos/lockfiles: preserva o lado do PR (o bump é o delta útil);
#   - qualquer outro conflito: preserva main (fail-closed);
#   - nunca inventa branch de destino: o workflow fornece PR_HEAD_REF;
#   - nunca empurra para main.

set -euo pipefail

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
PR_HEAD_REF="${PR_HEAD_REF:-}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
LOCAL="${LOCAL_REPO:-$REPO_DIR}"
FETCH_REF="refs/centraldark/pr/${PR_NUM}"
WORK_BRANCH="pr_resolve_${PR_NUM}"

if [ -z "$PR_HEAD_REF" ]; then
  echo "BLOCKED_MISSING_PR_HEAD_REF"
  exit 2
fi

if [ "$PR_HEAD_REF" = "main" ]; then
  echo "BLOCKED_DIRECT_MAIN_TARGET"
  exit 2
fi

git check-ref-format "refs/heads/$PR_HEAD_REF" >/dev/null || {
  echo "BLOCKED_INVALID_PR_HEAD_REF=$PR_HEAD_REF"
  exit 2
}

cd "$LOCAL"

git fetch --prune origin main
git fetch --force origin "refs/pull/${PR_NUM}/head:${FETCH_REF}"
git checkout -B "$WORK_BRANCH" "$FETCH_REF"

# Não usar `git merge | grep` com pipefail: merge conflitado retorna != 0 e a
# pipeline seria classificada como falsa mesmo contendo CONFLICT.
set +e
MERGE_OUTPUT="$(git merge --no-commit --no-ff origin/main 2>&1)"
MERGE_STATUS=$?
set -e
printf '%s\n' "$MERGE_OUTPUT"

if [ "$MERGE_STATUS" -eq 0 ]; then
  echo "NO_CONFLICT"
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

# Estamos na branch do PR e fazemos merge de origin/main:
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
      echo "RESOLVE path=$f winner=MAIN"
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

git commit --no-edit

git push origin "HEAD:refs/heads/${PR_HEAD_REF}"
echo "RESOLVED_AND_PUSHED pr=${PR_NUM} head_ref=${PR_HEAD_REF}"
