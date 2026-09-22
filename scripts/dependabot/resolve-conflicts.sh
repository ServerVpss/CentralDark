#!/usr/bin/env bash
# Motor único da Casa para conflito de PR (Dependabot ou humano same-repo).
#
# PADRÃO SAME/ALL:
#   - funciona no self-hosted Linux da VPS;
#   - trabalha em worktree isolado: nunca troca a branch da Casa principal;
#   - faz o equivalente ao botão GitHub "Accept both changes" para blocos textuais;
#   - ALL não é PASS: depois remove marcadores, valida sintaxe/formato aplicável,
#     contraprova e deixa SAME_HEAD CI julgar;
#   - conflito binário ou composição inválida falha fechado;
#   - nunca empurra para main.

set -euo pipefail

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
PR_HEAD_REF="${PR_HEAD_REF:-}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
FETCH_REF="refs/centraldark/pr/${PR_NUM}"
WORKTREE_ROOT="${CENTRALDARK_DEPENDABOT_WORKTREES:-${TMPDIR:-/tmp}/centraldark-dependabot}"
WORKTREE="${WORKTREE_ROOT}/pr-${PR_NUM}-$$"
SEMANTIC_ALL_HELPER="${SEMANTIC_ALL_HELPER:-scripts/dependabot/semantic-all-resolver.mjs}"

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
echo "🔄 PR_HEAD_REF=$PR_HEAD_REF"
echo "🏠 CASA_WORKTREE_MUTATED=0"
echo "🧱 ISOLATED_WORKTREE=$WORKTREE"
echo "🪬 SEMANTIC_ALL_DEFAULT=1"
echo "🔘 GITHUB_UI_EQUIVALENT=ACCEPT_BOTH_ALL_BLOCKS_THEN_MARK_RESOLVED"
echo "⚖️ BLIND_ACCEPT_BOTH=0"

if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_B64="$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
  GIT_AUTH=(-c "http.https://github.com/.extraheader=AUTHORIZATION: basic $AUTH_B64")
else
  GIT_AUTH=()
fi

git "${GIT_AUTH[@]}" -C "$REPO_DIR" fetch --prune origin main
git "${GIT_AUTH[@]}" -C "$REPO_DIR" fetch --force origin "refs/pull/${PR_NUM}/head:${FETCH_REF}"
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

if [ ! -f "$SEMANTIC_ALL_HELPER" ]; then
  echo "BLOCKED_SEMANTIC_ALL_HELPER_MISSING=$SEMANTIC_ALL_HELPER"
  git merge --abort 2>/dev/null || true
  exit 5
fi

for f in "${CONFLICTS[@]}"; do
  echo "RESOLVE path=$f policy=SEMANTIC_ALL_ACCEPT_BOTH_THEN_VALIDATE"
  node "$SEMANTIC_ALL_HELPER" "$f"
  git add -- "$f"
done

echo "AUTO_REVIEW_CONFLICTS=${#CONFLICTS[@]}"
echo "SEMANTIC_ALL_APPLIED=1"

git diff --cached --check

if git grep -n -E '^(<<<<<<< |=======|>>>>>>> )' -- "${CONFLICTS[@]}"; then
  echo "BLOCKED_CONFLICT_MARKERS_LEFT"
  git merge --abort 2>/dev/null || true
  exit 4
fi

for f in "${CONFLICTS[@]}"; do
  case "$f" in
    *.json)
      node -e "JSON.parse(require('node:fs').readFileSync(process.argv[1], 'utf8'))" "$f"
      ;;
    *.js|*.mjs|*.cjs)
      node --check "$f"
      ;;
    *.sh)
      bash -n "$f"
      ;;
    *.py)
      python3 -m py_compile "$f"
      ;;
    *.yml|*.yaml)
      python3 - <<'PY' "$f"
import sys
from pathlib import Path
text = Path(sys.argv[1]).read_text()
for marker in ('<<<<<<< ', '=======', '>>>>>>> '):
    if marker in text:
        raise SystemExit(f'YAML_CONFLICT_MARKER_LEFT:{sys.argv[1]}')
PY
      ;;
  esac
done

echo "AUTO_REVIEW_COUNTERPROOF=PASS"

git -c user.name='CentralDark Semantic ALL Resolver' \
    -c user.email='actions@users.noreply.github.com' \
    commit --no-edit

NEW_HEAD="$(git rev-parse HEAD)"
git "${GIT_AUTH[@]}" push origin "HEAD:refs/heads/${PR_HEAD_REF}"

echo "RESOLVED_AND_PUSHED pr=${PR_NUM} head_ref=${PR_HEAD_REF} head=${NEW_HEAD}"
echo "DIRECT_MAIN_WRITE=0"
echo "CASA_WORKTREE_MUTATED=0"
echo "SAME_HEAD_CI_REQUIRED=1"
echo "UNKNOWN_IS_PASS=0"
