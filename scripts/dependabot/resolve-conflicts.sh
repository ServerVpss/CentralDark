#!/usr/bin/env bash
# Motor único da Casa para conflito de PR (Dependabot ou humano same-repo).
#
# Política:
#   - trabalha em worktree isolado: nunca troca a branch da Casa principal;
#   - manifestos/lockfiles: preserva o lado do PR (o bump é o delta útil);
#   - conflitos conhecidos não-manifesto: preserva main (fail-closed);
#   - conflito desconhecido: auto-review determinístico; texto preserva ambos, código preserva PR e CI/contraprova julga;
#   - nunca inventa branch de destino: o workflow fornece PR_HEAD_REF;
#   - nunca empurra para main;
#   - conflito/refutação vira receipt/minério; não some em silêncio.

set -euo pipefail

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
PR_HEAD_REF="${PR_HEAD_REF:-}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
FETCH_REF="refs/centraldark/pr/${PR_NUM}"
WORKTREE_ROOT="${CENTRALDARK_DEPENDABOT_WORKTREES:-${TMPDIR:-/tmp}/centraldark-dependabot}"
WORKTREE="${WORKTREE_ROOT}/pr-${PR_NUM}-$$"
KNOWN_CONFLICTS_FILE="${KNOWN_CONFLICTS_FILE:-scripts/dependabot/known-conflict-patterns.json}"

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
echo "🧾 KNOWN_CONFLICTS_FILE=$KNOWN_CONFLICTS_FILE"

if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_B64="$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\\n')"
  GIT_AUTH=(-c "http.https://github.com/.extraheader=AUTHORIZATION: basic $AUTH_B64")
else
  GIT_AUTH=()
fi

git "${GIT_AUTH[@]}" -C "$REPO_DIR" fetch --prune origin main
git "${GIT_AUTH[@]}" -C "$REPO_DIR" fetch --force origin "refs/pull/${PR_NUM}/head:${FETCH_REF}"
git -C "$REPO_DIR" worktree add --detach "$WORKTREE" "$FETCH_REF"

cd "$WORKTREE"

lookup_known_conflict() {
  local candidate="$1"
  local registry="$KNOWN_CONFLICTS_FILE"

  [ -f "$registry" ] || {
    echo "REGISTRY_MISSING"
    return 1
  }

  node - "$registry" "$candidate" <<'NODE'
const fs = require('node:fs');
const [registryPath, candidate] = process.argv.slice(2);

function escapeRegex(value) {
  return String(value).replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function patternToRegex(pattern) {
  const normalizedPattern = String(pattern).replace(/\\/g, '/');
  let out = '^';
  for (let i = 0; i < normalizedPattern.length;) {
    if (normalizedPattern.startsWith('**/', i)) {
      out += '(?:.*/)?';
      i += 3;
    } else if (normalizedPattern.startsWith('**', i)) {
      out += '.*';
      i += 2;
    } else if (normalizedPattern[i] === '*') {
      out += '[^/]*';
      i += 1;
    } else {
      out += escapeRegex(normalizedPattern[i]);
      i += 1;
    }
  }
  out += '$';
  return new RegExp(out);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const patterns = Array.isArray(registry.patterns) ? registry.patterns : [];
const normalized = candidate.replace(/\\/g, '/');
const match = patterns.find((entry) => patternToRegex(entry.PATH_PATTERN).test(normalized));

if (!match) {
  process.exitCode = 1;
} else {
  process.stdout.write(JSON.stringify(match));
}
NODE
}

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

declare -A RESOLUTION_BY_FILE=()
for f in "${CONFLICTS[@]}"; do
  if info="$(lookup_known_conflict "$f")"; then
    policy="$(node -e "const entry = JSON.parse(process.argv[1]); process.stdout.write(entry.SAFE_RESOLUTION);" "$info")"
    RESOLUTION_BY_FILE["$f"]="$policy"
    node - "$info" "$f" <<'NODE'
const entry = JSON.parse(process.argv[2]);
const actual = process.argv[3] || '';
console.log(`KNOWN_CONFLICT_PATH=true path=${entry.PATH_PATTERN} actual=${actual}`);
console.log(`CONFLICT_ID=${entry.CONFLICT_ID}`);
console.log(`OWNER=${entry.OWNER}`);
console.log(`CONFLICT_CLASS=${entry.CONFLICT_CLASS}`);
console.log(`RESOLUTION_POLICY=${entry.SAFE_RESOLUTION}`);
console.log(`SOURCE_REF=${entry.SOURCE_REF}`);
console.log(`RUNTIME_APPLICABLE=${entry.RUNTIME_APPLICABLE}`);
NODE
    continue
  fi

  case "$f" in
    *.md|*.txt|*.mmd|*.jsonl|*.csv|*.rst|*.adoc)
      RESOLUTION_BY_FILE["$f"]="AUTO_TEXT_BOTH"
      echo "UNKNOWN_CONFLICT_PATH path=$f action=AUTO_REVIEW_TEXT_BOTH"
      ;;
    *)
      RESOLUTION_BY_FILE["$f"]="USE_PR_SIDE"
      echo "UNKNOWN_CONFLICT_PATH path=$f action=AUTO_REVIEW_PR_SIDE_THEN_CI"
      ;;
  esac
done

resolve_text_both() {
  local file="$1"
  node - "$file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8').split('\n');
const out = [];
for (let i = 0; i < src.length; i += 1) {
  if (!src[i].startsWith('<<<<<<< ')) {
    out.push(src[i]);
    continue;
  }
  const ours = [];
  const theirs = [];
  i += 1;
  while (i < src.length && src[i] !== '=======') ours.push(src[i++]);
  if (i >= src.length) throw new Error(`conflict sem separador em ${file}`);
  i += 1;
  while (i < src.length && !src[i].startsWith('>>>>>>> ')) theirs.push(src[i++]);
  if (i >= src.length) throw new Error(`conflict sem fechamento em ${file}`);
  const same = ours.length === theirs.length && ours.every((line, idx) => line === theirs[idx]);
  out.push(...ours);
  if (!same) out.push(...theirs);
}
fs.writeFileSync(file, out.join('\n'));
NODE
}

# Estamos no HEAD do PR e fazemos merge de origin/main:
#   --ours   = PR
#   --theirs = main
for f in "${CONFLICTS[@]}"; do
  policy="${RESOLUTION_BY_FILE[$f]}"

  case "$policy" in
    USE_PR_SIDE)
      echo "RESOLVE path=$f winner=PR auto_review=1"
      git checkout --ours -- "$f"
      git add -- "$f"
      ;;
    USE_MAIN_SIDE)
      echo "RESOLVE path=$f winner=MAIN fail_closed=1"
      git checkout --theirs -- "$f"
      git add -- "$f"
      ;;
    AUTO_TEXT_BOTH)
      echo "RESOLVE path=$f winner=BOTH semantic=text-union"
      resolve_text_both "$f"
      git add -- "$f"
      ;;
    *)
      echo "BLOCKED_UNSUPPORTED_RESOLUTION_POLICY path=$f policy=$policy"
      git merge --abort 2>/dev/null || true
      exit 6
      ;;
  esac
done

echo "AUTO_REVIEW_CONFLICTS=${#CONFLICTS[@]}"
git diff --cached --check

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
  esac
done
echo "AUTO_REVIEW_COUNTERPROOF=PASS"

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
git "${GIT_AUTH[@]}" push origin "HEAD:refs/heads/${PR_HEAD_REF}"

echo "RESOLVED_AND_PUSHED pr=${PR_NUM} head_ref=${PR_HEAD_REF} head=${NEW_HEAD}"
echo "DIRECT_MAIN_WRITE=0"
echo "CASA_WORKTREE_MUTATED=0"
