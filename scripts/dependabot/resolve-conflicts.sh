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
WORKTREE_ROOT="${CENTRALDARK_DEPENDABOT_WORKTREES:-${CENTRALDARK_WORKTREE_ROOT:-${TMPDIR:-/tmp}/centraldark-worktrees}}"
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
  if [ -d "$WORKTREE" ]; then
    node "$TRUSTED_OWNER_ROOT/scripts/lupa/worktree-teardown-gate.mjs" \
      --repo "$REPO_DIR" --target "$WORKTREE" \
      --allowed-root "$WORKTREE_ROOT" --published-ref "$PR_HEAD_REF" --apply \
      || echo "RESOLVER_WORKTREE_KEEP_ACTIVE=$WORKTREE"
  fi
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
# Preflight leve no mesmo motor: nao criar 12 mil arquivos antes de saber
# se o historico existe e se os conflitos ja exigem um discriminante humano.
# Clone shallow/partial nao significa historicos independentes (Git 128).
if ! git -C "$REPO_DIR" merge-base "$FETCH_REF" origin/main >/dev/null 2>&1; then
  if [ "$(git -C "$REPO_DIR" rev-parse --is-shallow-repository)" = "true" ]; then
    echo "PREFLIGHT_SHALLOW_HISTORY=DEEPEN_BOUNDED"
    for depth in 64 256; do
      git "${GIT_AUTH[@]}" -C "$REPO_DIR" fetch "--deepen=$depth" origin main "refs/pull/${PR_NUM}/head:${FETCH_REF}" || {
        echo "BLOCKED_SHALLOW_FETCH_FAILED depth=$depth"
        exit 22
      }
      if git -C "$REPO_DIR" merge-base "$FETCH_REF" origin/main >/dev/null 2>&1; then
        break
      fi
    done
  fi
  if ! git -C "$REPO_DIR" merge-base "$FETCH_REF" origin/main >/dev/null 2>&1; then
    echo "BLOCKED_MERGE_BASE_UNAVAILABLE shallow=$(git -C "$REPO_DIR" rev-parse --is-shallow-repository)"
    echo "NO_WORKTREE_NO_PUSH=1"
    exit 22
  fi
fi

# merge-tree examina a mesma fonte e base sem checkout, branch ou push.
# --name-only devolve SHA da arvore, caminhos conflitantes e, depois de
# uma linha vazia, diagnosticos. UNKNOWN bloqueia ANTES do checkout caro.
set +e
PREFLIGHT_MERGE_TREE="$(git -C "$REPO_DIR" merge-tree --write-tree --name-only "$FETCH_REF" origin/main 2>&1)"
PREFLIGHT_STATUS=$?
set -e
if [ "$PREFLIGHT_STATUS" -gt 1 ]; then
  echo "BLOCKED_PREFLIGHT_MERGE_TREE status=$PREFLIGHT_STATUS"
  exit 23
fi
if [ "$PREFLIGHT_STATUS" -eq 1 ]; then
  PREFLIGHT_PATHS="$(printf '%s\n' "$PREFLIGHT_MERGE_TREE" | awk 'NR == 1 { next } NF == 0 { exit } { print }')"
  if [ -z "$PREFLIGHT_PATHS" ]; then
    echo "BLOCKED_PREFLIGHT_CONFLICT_PATHS_MISSING"
    exit 23
  fi
  PREFLIGHT_YELLOW=0
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    RESULT="$(node "$CLASSIFIER" "$path")" || {
      echo "BLOCKED_PREFLIGHT_CLASSIFIER_FAILED path=$path"
      exit 23
    }
    ACTION="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).action)' "$RESULT")"
    echo "PREFLIGHT_CONFLICT path=$path action=$ACTION"
    if [ "$ACTION" = "YELLOW" ]; then
      PREFLIGHT_YELLOW=$((PREFLIGHT_YELLOW + 1))
    fi
  done <<< "$PREFLIGHT_PATHS"
  if [ "$PREFLIGHT_YELLOW" -gt 0 ]; then
    echo "PREFLIGHT_UNREGISTERED_CONFLICTS=$PREFLIGHT_YELLOW"
    echo "NO_WORKTREE_NO_PUSH=1"
    exit 20
  fi
fi

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
# Scan Git type signatures and the unmerged index: string matching never authorizes resolution.
CONFLICT_DIAGNOSIS="$(printf '%s\n' "$MERGE_OUTPUT" | node "$CLASSIFIER" --diagnose)" || {
  echo "BLOCKED_CONFLICT_DIAGNOSIS_FAILED"
  git merge --abort 2>/dev/null || true
  exit 20
}
echo "CONFLICT_DIAGNOSIS_JSON=$CONFLICT_DIAGNOSIS"
SCAN_ALLOWED="$(node -e 'const d=JSON.parse(process.argv[1]);process.stdout.write(d.auto_resolve_allowed===true?"yes":"no")' "$CONFLICT_DIAGNOSIS")"
if [ "$SCAN_ALLOWED" != "yes" ]; then
  echo "BLOCKED_COMPLEX_CONFLICT_NEEDS_INDEPENDENT_REVIEW=1"
  echo "NO_PUSH_ON_YELLOW=1"
  git merge --abort 2>/dev/null || true
  exit 20
fi
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
