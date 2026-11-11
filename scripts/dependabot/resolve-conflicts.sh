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

# COSTURA audit mode: validate an isolated index against an explicit base commit.
# Usage: resolve-conflicts.sh --audit-index BASE_SHA REMOTE_REF_OR_DASH -- PATH...
# Remote ref "-" is explicit offline/local-only mode; never pushes or writes.
if [[ "${1:-}" == "--audit-index" ]]; then
  shift
  if (( $# < 4 )); then
    echo "BLOCKED_AUDIT_USAGE: --audit-index <base-sha> <remote-ref|-> -- <paths...>"
    exit 2
  fi
  AUDIT_BASE="$1"
  AUDIT_REMOTE_REF="$2"
  shift 2
  if [[ "${1:-}" != "--" ]]; then
    echo "BLOCKED_AUDIT_SCOPE_SEPARATOR_REQUIRED"
    exit 2
  fi
  shift
  AUDIT_SCOPE=("$@")
  if (( ${#AUDIT_SCOPE[@]} == 0 )); then
    echo "BLOCKED_AUDIT_EMPTY_SCOPE"
    exit 2
  fi
  if ! [[ "$AUDIT_BASE" =~ ^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$ ]]; then
    echo "BLOCKED_AUDIT_BASE_NOT_PINNED_SHA"
    exit 2
  fi
  AUDIT_REPO="${REPO_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
  if [[ -z "$AUDIT_REPO" ]] || ! git -C "$AUDIT_REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "BLOCKED_AUDIT_REPO_UNAVAILABLE"
    exit 2
  fi
  if [[ -z "${GIT_INDEX_FILE:-}" ]]; then
    echo "BLOCKED_AUDIT_ISOLATED_INDEX_REQUIRED"
    exit 2
  fi
  AUDIT_DEFAULT_INDEX="$(env -u GIT_INDEX_FILE git -C "$AUDIT_REPO" rev-parse --path-format=absolute --git-path index)"
  if command -v cygpath >/dev/null 2>&1; then
    AUDIT_INDEX_NORMALIZED="$(cygpath -ml "$GIT_INDEX_FILE" 2>/dev/null || true)"
    AUDIT_DEFAULT_NORMALIZED="$(cygpath -ml "$AUDIT_DEFAULT_INDEX" 2>/dev/null || true)"
  else
    AUDIT_INDEX_NORMALIZED="$(realpath -m -- "$GIT_INDEX_FILE" 2>/dev/null || true)"
    AUDIT_DEFAULT_NORMALIZED="$(realpath -m -- "$AUDIT_DEFAULT_INDEX" 2>/dev/null || true)"
  fi
  if [[ -z "$AUDIT_INDEX_NORMALIZED" || -z "$AUDIT_DEFAULT_NORMALIZED" ]]; then
    echo "BLOCKED_AUDIT_INDEX_PATH_INVALID"
    exit 2
  fi
  if [[ "${AUDIT_INDEX_NORMALIZED,,}" == "${AUDIT_DEFAULT_NORMALIZED,,}" ]]; then
    echo "BLOCKED_AUDIT_DEFAULT_INDEX_FORBIDDEN"
    exit 2
  fi
  if ! git -C "$AUDIT_REPO" cat-file -e "${AUDIT_BASE}^{commit}" 2>/dev/null; then
    echo "BLOCKED_AUDIT_BASE_COMMIT_MISSING"
    exit 2
  fi
  if [[ "$AUDIT_REMOTE_REF" != "-" ]]; then
    if ! [[ "$AUDIT_REMOTE_REF" =~ ^refs/heads/[a-zA-Z0-9._/-]+$ ]]; then
      echo "BLOCKED_AUDIT_REMOTE_REF_INVALID"
      exit 2
    fi
    AUDIT_REMOTE_SHA="$(git -C "$AUDIT_REPO" ls-remote origin "$AUDIT_REMOTE_REF" | awk '{print $1}')"
    if [[ -z "$AUDIT_REMOTE_SHA" || "$AUDIT_REMOTE_SHA" != "$AUDIT_BASE" ]]; then
      echo "BLOCKED_AUDIT_REMOTE_DRIFT expected=$AUDIT_BASE actual=${AUDIT_REMOTE_SHA:-UNKNOWN}"
      exit 21
    fi
  fi
  if [[ -n "$(git -C "$AUDIT_REPO" ls-files -u)" ]]; then
    echo "BLOCKED_AUDIT_UNMERGED_INDEX"
    exit 3
  fi
  mapfile -d '' -t AUDIT_CHANGED < <(git -C "$AUDIT_REPO" diff --cached --name-only -z "$AUDIT_BASE")
  if (( ${#AUDIT_CHANGED[@]} == 0 )); then
    echo "BLOCKED_AUDIT_NO_DELTA"
    exit 3
  fi
  for AUDIT_PATH in "${AUDIT_CHANGED[@]}"; do
    FOUND=0
    for AUDIT_ALLOWED in "${AUDIT_SCOPE[@]}"; do
      if [[ "$AUDIT_PATH" == "$AUDIT_ALLOWED" ]]; then FOUND=1; break; fi
    done
    if (( ! FOUND )); then
      echo "BLOCKED_AUDIT_UNEXPECTED_PATH=$AUDIT_PATH"
      exit 3
    fi
  done
  if ! git -C "$AUDIT_REPO" diff --cached --check "$AUDIT_BASE" -- "${AUDIT_SCOPE[@]}"; then
    echo "BLOCKED_AUDIT_SCOPED_DIFF_CHECK"
    exit 4
  fi
  echo "COSTURA_AUDIT_INDEX=PASS"
  echo "COSTURA_AUDIT_BASE=$AUDIT_BASE"
  echo "COSTURA_AUDIT_LOCAL_HEAD=$(git -C "$AUDIT_REPO" rev-parse HEAD)"
  echo "COSTURA_AUDIT_REMOTE_REF=$AUDIT_REMOTE_REF"
  echo "COSTURA_AUDIT_CHANGED_COUNT=${#AUDIT_CHANGED[@]}"
  echo "COSTURA_AUDIT_WRITE=0"
  echo "COSTURA_AUDIT_PUSH=0"
  exit 0
fi

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
PR_HEAD_REF="${PR_HEAD_REF:-}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
FETCH_REF="refs/centraldark/pr/${PR_NUM}"
WORKTREE_ROOT="${CENTRALDARK_DEPENDABOT_WORKTREES:-${TMPDIR:-/tmp}/centraldark-dependabot}"
WORKTREE="${WORKTREE_ROOT}/pr-${PR_NUM}-$$"
# Roteamento fixo pelo checkout confiável que contém o motor; nunca executar
# helpers ou registry fornecidos pela branch de PR sob pull_request_target.
TRUSTED_OWNER_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
SEMANTIC_ALL_HELPER="$TRUSTED_OWNER_ROOT/scripts/dependabot/semantic-all-resolver.mjs"
CLASSIFIER="$TRUSTED_OWNER_ROOT/scripts/dependabot/classify-conflict.mjs"
STRUCTURED_HELPER="$TRUSTED_OWNER_ROOT/scripts/dependabot/structured-conflict-resolver.mjs"
SKILL_CONTRACT="$TRUSTED_OWNER_ROOT/.agents/skills/git-conflict-resolve-house-standard/SKILL.md"
export CONFLICT_REGISTRY="$TRUSTED_OWNER_ROOT/scripts/dependabot/known-conflict-patterns.json"

if ! [[ "$PR_NUM" =~ ^[1-9][0-9]*$ ]]; then
  echo "BLOCKED_INVALID_PR_NUMBER"
  exit 2
fi

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
echo "🪬 CONFLICT_DECISION_PER_FILE=1"
echo "🔘 GITHUB_UI_EQUIVALENT=CURRENT_OR_INCOMING_OR_BOTH_THEN_MARK_RESOLVED"
echo "⚖️ BLIND_ACCEPT_BOTH=0"
echo "🟡 UNKNOWN_POLICY=STOP_WITHOUT_PUSH"

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
if [ ! -f "$CLASSIFIER" ]; then
  echo "BLOCKED_CONFLICT_CLASSIFIER_MISSING=$CLASSIFIER"
  git merge --abort 2>/dev/null || true
  exit 6
fi
if [ ! -f "$STRUCTURED_HELPER" ]; then
  echo "BLOCKED_STRUCTURED_HELPER_MISSING=$STRUCTURED_HELPER"
  git merge --abort 2>/dev/null || true
  exit 6
fi

if [ ! -f "$SKILL_CONTRACT" ] || ! grep -Fq "PRIMARY_SOURCE_REQUIRED_BEFORE_RESOLUTION=true" "$SKILL_CONTRACT"; then
  echo "BLOCKED_PRIMARY_SOURCE_SKILL_CONTRACT_MISSING"
  git merge --abort 2>/dev/null || true
  exit 6
fi

PR_HEAD_SHA="$(git rev-parse HEAD)"
MAIN_SHA="$(git rev-parse origin/main)"
MERGE_BASE_SHA="$(git merge-base "$PR_HEAD_SHA" "$MAIN_SHA")"
if [ -z "$MERGE_BASE_SHA" ]; then
  echo "BLOCKED_MISSING_MERGE_BASE"
  git merge --abort 2>/dev/null || true
  exit 6
fi
echo "PRIMARY_SOURCE_SCOPE=CONFLICTED_FILE_HISTORY"
echo "SOURCE_PR_HEAD=$PR_HEAD_SHA"
echo "SOURCE_MAIN_HEAD=$MAIN_SHA"
echo "SOURCE_MERGE_BASE=$MERGE_BASE_SHA"

CURRENT_COUNT=0
INCOMING_COUNT=0
BOTH_COUNT=0
STRUCTURED_COUNT=0
YELLOW_COUNT=0

for f in "${CONFLICTS[@]}"; do
  # Primeiro ler a história dos dois lados; o diff isolado não representa intenção.
  # Histórico insuficiente ou hunk não textual permanece YELLOW, sem publicação.
  PR_SOURCE="$(git log -1 --format="%H|%s" "$PR_HEAD_SHA" -- "$f" || true)"
  MAIN_SOURCE="$(git log -1 --format="%H|%s" "$MAIN_SHA" -- "$f" || true)"
  HUNK_COUNT="$(grep -c "^<<<<<<< " -- "$f" 2>/dev/null || true)"
  echo "PRIMARY_SOURCE path=$f pr=$PR_SOURCE main=$MAIN_SOURCE hunks=$HUNK_COUNT"
  DECISION_JSON="$(node "$CLASSIFIER" "$f")"
  ACTION="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.action)" "$DECISION_JSON")"
  REASON="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.reason)" "$DECISION_JSON")"
  CONFLICT_ID="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.conflict_id)" "$DECISION_JSON")"
  STRUCTURED_STRATEGY="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.structured_strategy||'')" "$DECISION_JSON")"
  SEMANTIC_KEY="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.semantic_key||'')" "$DECISION_JSON")"
  SOURCE_REF="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.source_ref||'')" "$DECISION_JSON")"
  PRESERVE_RULE="$(node -e "const x=JSON.parse(process.argv[1]); process.stdout.write(x.preserve_rule||'')" "$DECISION_JSON")"
  if [ -z "$PR_SOURCE" ] || [ -z "$MAIN_SOURCE" ] || [ "${HUNK_COUNT:-0}" -eq 0 ]; then
    ACTION=YELLOW
    REASON=PRIMARY_SOURCE_OR_HUNK_UNPROVEN
  fi
  echo "PRIMARY_INTENT path=$f registry_source=$SOURCE_REF preserve_rule=$PRESERVE_RULE"
  case "$ACTION" in
    CURRENT) echo "INTENT_TRADEOFF path=$f kept=PR_HEAD discarded=MAIN reason=$REASON" ;;
    INCOMING) echo "INTENT_TRADEOFF path=$f kept=MAIN discarded=PR_HEAD reason=$REASON" ;;
    BOTH|STRUCTURED) echo "INTENT_TRADEOFF path=$f kept=PR_AND_MAIN rule=$PRESERVE_RULE" ;;
    YELLOW) echo "INTENT_TRADEOFF path=$f kept=UNDECIDED needs_discriminant=1" ;;
  esac
  echo "CONFLICT_DECISION path=$f action=$ACTION reason=$REASON conflict_id=$CONFLICT_ID strategy=$STRUCTURED_STRATEGY key=$SEMANTIC_KEY"

  case "$ACTION" in
    CURRENT)
      git checkout --ours -- "$f"
      CURRENT_COUNT=$((CURRENT_COUNT + 1))
      ;;
    INCOMING)
      git checkout --theirs -- "$f"
      INCOMING_COUNT=$((INCOMING_COUNT + 1))
      ;;
    BOTH)
      node "$SEMANTIC_ALL_HELPER" "$f"
      BOTH_COUNT=$((BOTH_COUNT + 1))
      ;;
    STRUCTURED)
      node "$STRUCTURED_HELPER" "$f" "$STRUCTURED_STRATEGY" "$SEMANTIC_KEY"
      STRUCTURED_COUNT=$((STRUCTURED_COUNT + 1))
      ;;
    YELLOW)
      echo "🟡 CONFLICT_NEEDS_DISCRIMINANT path=$f reason=$REASON"
      YELLOW_COUNT=$((YELLOW_COUNT + 1))
      ;;
    *)
      echo "BLOCKED_UNKNOWN_CLASSIFIER_ACTION path=$f action=$ACTION"
      git merge --abort 2>/dev/null || true
      exit 7
      ;;
  esac

  if [ "$ACTION" != "YELLOW" ]; then
    git add -- "$f"
  fi
done

echo "AUTO_REVIEW_CONFLICTS=${#CONFLICTS[@]}"
echo "BUTTON_CURRENT_COUNT=$CURRENT_COUNT"
echo "BUTTON_INCOMING_COUNT=$INCOMING_COUNT"
echo "BUTTON_BOTH_COUNT=$BOTH_COUNT"
echo "BUTTON_STRUCTURED_COUNT=$STRUCTURED_COUNT"
echo "BUTTON_YELLOW_COUNT=$YELLOW_COUNT"

# Receipt estruturado no log do workflow existente: auditavel e contabilizavel.
# Nao promove padroes novos sem contraprova nem modifica registry sozinho.
emit_costura_metrics() {
  local state="$1"
  node -e 'const [pr, headRef, state, current, incoming, both, structured, yellow] = process.argv.slice(1); console.log("COSTURA_METRICS_JSON=" + JSON.stringify({schema:"centraldark.costura.metrics.v1",pr:Number(pr),head_ref:headRef,state,counts:{current:Number(current),incoming:Number(incoming),both:Number(both),structured:Number(structured),yellow:Number(yellow)},recorded_at:new Date().toISOString(),pattern_promotion:"REQUIRES_REPLAY_AND_SAME_HEAD"}))' \
    "$PR_NUM" "$PR_HEAD_REF" "$state" "$CURRENT_COUNT" "$INCOMING_COUNT" "$BOTH_COUNT" "$STRUCTURED_COUNT" "$YELLOW_COUNT"
}

emit_costura_metrics "CLASSIFIED"

if [ "$YELLOW_COUNT" -gt 0 ]; then
  echo "🟡 CONFLICT_RESOLUTION_YELLOW count=$YELLOW_COUNT"
  echo "🟡 YELLOW_IS_PROGRESS_BOUNDARY=1"
  echo "NO_PUSH_ON_YELLOW=1"
  emit_costura_metrics "YELLOW_NO_PUSH"
  git merge --abort 2>/dev/null || true
  exit 20
fi

git diff --cached --check -- "${CONFLICTS[@]}"

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

echo "AUTO_REVIEW_LOCAL_SYNTAX=PASS"
echo "PROJECT_BEHAVIOR_TESTS=AWAIT_UNPRIVILEGED_SAME_HEAD_CI"
echo "AUTO_REVIEW_COUNTERPROOF=PENDING_SAME_HEAD_CI"

# Não gravar um merge em PR se outro escritor avançou a branch ou a main.
REMOTE_PR_SHA="$(git "${GIT_AUTH[@]}" ls-remote origin "refs/heads/${PR_HEAD_REF}" | awk '{print $1}')"
REMOTE_MAIN_SHA="$(git "${GIT_AUTH[@]}" ls-remote origin "refs/heads/main" | awk '{print $1}')"
if [ "$REMOTE_PR_SHA" != "$PR_HEAD_SHA" ] || [ "$REMOTE_MAIN_SHA" != "$MAIN_SHA" ]; then
  echo "BLOCKED_SOURCE_HEAD_CHANGED pr_current=$REMOTE_PR_SHA pr_expected=$PR_HEAD_SHA main_current=$REMOTE_MAIN_SHA main_expected=$MAIN_SHA"
  git merge --abort 2>/dev/null || true
  exit 21
fi

git -c user.name='CentralDark COSTURA Resolver' \
    -c user.email='actions@users.noreply.github.com' \
    commit --no-edit

NEW_HEAD="$(git rev-parse HEAD)"
git "${GIT_AUTH[@]}" push origin "HEAD:refs/heads/${PR_HEAD_REF}"

emit_costura_metrics "PUSHED_AWAITING_SAME_HEAD_CI"
echo "RESOLVED_AND_PUSHED pr=${PR_NUM} head_ref=${PR_HEAD_REF} head=${NEW_HEAD}"
echo "DIRECT_MAIN_WRITE=0"
echo "CASA_WORKTREE_MUTATED=0"
echo "SAME_HEAD_CI_REQUIRED=1"
echo "UNKNOWN_IS_PASS=0"
