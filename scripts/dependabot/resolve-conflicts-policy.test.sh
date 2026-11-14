#!/usr/bin/env bash
# Contraprova descartável da política do motor único Dependabot.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESOLVER="$REPO_ROOT/scripts/dependabot/resolve-conflicts.sh"
# Os repositórios fixture não contêm os helpers. O motor canônico deve ser chamado por caminhos absolutos.
export SEMANTIC_ALL_HELPER="${SEMANTIC_ALL_HELPER:-$REPO_ROOT/scripts/dependabot/semantic-all-resolver.mjs}"
export CONFLICT_CLASSIFIER="${CONFLICT_CLASSIFIER:-$REPO_ROOT/scripts/dependabot/classify-conflict.mjs}"
export STRUCTURED_CONFLICT_HELPER="${STRUCTURED_CONFLICT_HELPER:-$REPO_ROOT/scripts/dependabot/structured-conflict-resolver.mjs}"
TMP_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

REMOTE="$TMP_ROOT/remote.git"
SOURCE="$TMP_ROOT/source"
WORKTREES="$TMP_ROOT/worktrees"

git init --bare "$REMOTE" >/dev/null
git clone "$REMOTE" "$SOURCE" >/dev/null 2>&1

cd "$SOURCE"
git config user.name "CentralDark Test"
git config user.email "centraldark-test@example.invalid"
git checkout -b main >/dev/null 2>&1
mkdir -p scripts/dependabot docs/ARQUITETURA
cp "$REPO_ROOT/scripts/dependabot/known-conflict-patterns.json" scripts/dependabot/known-conflict-patterns.json
printf '{"name":"root","version":"1.0.0"}\n' > package.json
printf 'main-base\n' > CENTRALDARK_AI_BOOT.yaml
printf 'gateway-base\n' > docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md
git add .
git commit -m "base" >/dev/null
git push origin main >/dev/null 2>&1

git checkout -b dependabot/test-bump >/dev/null 2>&1
printf '{"name":"root","version":"1.0.1"}\n' > package.json
printf 'pr-change\n' > CENTRALDARK_AI_BOOT.yaml
printf 'gateway-pr-change\n' > docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md
git commit -am "dependabot bump and unsafe operational drift" >/dev/null
git push origin HEAD:refs/pull/1/head >/dev/null 2>&1
git push origin HEAD:dependabot/test-bump >/dev/null 2>&1

git checkout main >/dev/null 2>&1
printf '{"name":"root","version":"1.0.0","main":"kept"}\n' > package.json
printf 'main-change\n' > CENTRALDARK_AI_BOOT.yaml
printf 'gateway-main-change\n' > docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md
git commit -am "main advances" >/dev/null
git push origin main >/dev/null 2>&1

# --dry-run must not fetch, create a worktree, lock, commit, or push.
PR_SHA_BEFORE="$(git ls-remote "$REMOTE" refs/heads/dependabot/test-bump | awk '{print $1}')"
MAIN_SHA_BEFORE="$(git ls-remote "$REMOTE" refs/heads/main | awk '{print $1}')"
LOCAL_HEAD_BEFORE="$(git -C "$SOURCE" rev-parse HEAD)"
PR_HEAD_REF='dependabot/test-bump' REPO_DIR="$SOURCE" \
  CENTRALDARK_DEPENDABOT_WORKTREES="$WORKTREES" \
  bash "$RESOLVER" --dry-run 1 > "$TMP_ROOT/dry-run.log"
grep -F "COSTURA_DRY_RUN=PASS" "$TMP_ROOT/dry-run.log" >/dev/null
grep -F "DRY_RUN_CONFLICT_DECISIONS=UNPROVEN_NO_MERGE" "$TMP_ROOT/dry-run.log" >/dev/null
grep -F "DRY_RUN_LOCAL_WRITES=0" "$TMP_ROOT/dry-run.log" >/dev/null
grep -F "DRY_RUN_REMOTE_WRITES=0" "$TMP_ROOT/dry-run.log" >/dev/null
test ! -e "$WORKTREES"
test "$(git -C "$SOURCE" rev-parse HEAD)" = "$LOCAL_HEAD_BEFORE"
test "$(git ls-remote "$REMOTE" refs/heads/main | awk '{print $1}')" = "$MAIN_SHA_BEFORE"
test "$(git ls-remote "$REMOTE" refs/heads/dependabot/test-bump | awk '{print $1}')" = "$PR_SHA_BEFORE"
echo "COSTURA_DRY_RUN_ZERO_WRITES=PASS"

# No implicit mutation: apply requires explicit authorization.
set +e
PR_HEAD_REF='dependabot/test-bump' REPO_DIR="$SOURCE" bash "$RESOLVER" 1 > "$TMP_ROOT/no-mode.log" 2>&1
NO_MODE_RC=$?
set -e
test "$NO_MODE_RC" -eq 2
grep -F "BLOCKED_EXPLICIT_MODE_REQUIRED" "$TMP_ROOT/no-mode.log" >/dev/null
echo "COSTURA_EXPLICIT_APPLY_REQUIRED=PASS"

# Single writer per worktree root; a held lock must block before any fetch.
mkdir -p "$WORKTREES/.costura-repo-writer.lock"
set +e
PR_HEAD_REF='dependabot/test-bump' REPO_DIR="$SOURCE" \
  CENTRALDARK_DEPENDABOT_WORKTREES="$WORKTREES" \
  bash "$RESOLVER" --apply 1 > "$TMP_ROOT/lock-busy.log" 2>&1
LOCK_BUSY_RC=$?
set -e
test "$LOCK_BUSY_RC" -eq 23
grep -F "BLOCKED_COSTURA_WRITER_LOCK_BUSY" "$TMP_ROOT/lock-busy.log" >/dev/null
test "$(git ls-remote "$REMOTE" refs/heads/dependabot/test-bump | awk '{print $1}')" = "$PR_SHA_BEFORE"
rmdir "$WORKTREES/.costura-repo-writer.lock"
echo "COSTURA_SINGLE_WRITER_LOCK=PASS"

PR_HEAD_REF='dependabot/test-bump' \
REPO_DIR="$SOURCE" \
CENTRALDARK_DEPENDABOT_WORKTREES="$WORKTREES" \
KNOWN_CONFLICTS_FILE='scripts/dependabot/known-conflict-patterns.json' \
bash "$RESOLVER" --apply 1 > "$TMP_ROOT/resolver.log"
grep -F "COSTURA_WRITER_LOCK=ACQUIRED" "$TMP_ROOT/resolver.log" >/dev/null
test ! -e "$WORKTREES/.costura-repo-writer.lock"
echo "COSTURA_LOCK_RELEASED=PASS"

git fetch origin dependabot/test-bump >/dev/null 2>&1
git checkout -q FETCH_HEAD

grep -F '"version":"1.0.1"' package.json >/dev/null
grep -F -x 'main-change' CENTRALDARK_AI_BOOT.yaml >/dev/null
grep -F -x 'gateway-main-change' docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md >/dev/null
grep -F 'CONFLICT_DECISION path=CENTRALDARK_AI_BOOT.yaml action=INCOMING reason=KNOWN_POLICY_USE_MAIN_SIDE conflict_id=BOOT_CENTRALDARK_AI' "$TMP_ROOT/resolver.log" >/dev/null
grep -F 'CONFLICT_DECISION path=docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md action=INCOMING reason=KNOWN_POLICY_USE_MAIN_SIDE conflict_id=REMOTE_MCP_GATEWAY_ARCHITECTURE' "$TMP_ROOT/resolver.log" >/dev/null
grep -F 'COSTURA_PYTHON_SELECTED=' "$TMP_ROOT/resolver.log" >/dev/null
echo 'COSTURA_PYTHON_RUNTIME_PROBED=PASS'

UNKNOWN_REMOTE="$TMP_ROOT/unknown-remote.git"
UNKNOWN_SOURCE="$TMP_ROOT/unknown-source"
UNKNOWN_WORKTREES="$TMP_ROOT/unknown-worktrees"

git init --bare "$UNKNOWN_REMOTE" >/dev/null
git clone "$UNKNOWN_REMOTE" "$UNKNOWN_SOURCE" >/dev/null 2>&1

cd "$UNKNOWN_SOURCE"
git config user.name "CentralDark Test"
git config user.email "centraldark-test@example.invalid"
git checkout -b main >/dev/null 2>&1
mkdir -p scripts/dependabot docs
cp "$REPO_ROOT/scripts/dependabot/known-conflict-patterns.json" scripts/dependabot/known-conflict-patterns.json
printf 'unknown-base\n' > docs/unknown-conflict.md
git add .
git commit -m "base unknown" >/dev/null
git push origin main >/dev/null 2>&1

git checkout -b dependabot/unknown-conflict >/dev/null 2>&1
printf 'unknown-pr\n' > docs/unknown-conflict.md
git commit -am "unknown conflict from pr" >/dev/null
git push origin HEAD:refs/pull/2/head >/dev/null 2>&1
git push origin HEAD:dependabot/unknown-conflict >/dev/null 2>&1

git checkout main >/dev/null 2>&1
printf 'unknown-main\n' > docs/unknown-conflict.md
git commit -am "unknown conflict from main" >/dev/null
git push origin main >/dev/null 2>&1

# Política desconhecida deve falhar fechada: saída 20, sem push da branch do PR.
set +e
PR_HEAD_REF='dependabot/unknown-conflict' \
REPO_DIR="$UNKNOWN_SOURCE" \
CENTRALDARK_DEPENDABOT_WORKTREES="$UNKNOWN_WORKTREES" \
KNOWN_CONFLICTS_FILE='scripts/dependabot/known-conflict-patterns.json' \
bash "$RESOLVER" --apply 2 > "$TMP_ROOT/unknown-resolver.log" 2>&1
UNKNOWN_EXIT=$?
set -e
test "$UNKNOWN_EXIT" -eq 20
grep -F 'CONFLICT_DECISION path=docs/unknown-conflict.md action=YELLOW reason=UNREGISTERED_CONFLICT_REQUIRES_PROVEN_PATTERN' "$TMP_ROOT/unknown-resolver.log" >/dev/null
grep -F 'NO_PUSH_ON_YELLOW=1' "$TMP_ROOT/unknown-resolver.log" >/dev/null
grep -F '"state":"YELLOW_NO_PUSH"' "$TMP_ROOT/unknown-resolver.log" >/dev/null
git fetch origin dependabot/unknown-conflict >/dev/null 2>&1
git checkout -q FETCH_HEAD
grep -F -x 'unknown-pr' docs/unknown-conflict.md >/dev/null
if grep -F -x 'unknown-main' docs/unknown-conflict.md >/dev/null; then
  echo 'BLOCKED_UNKNOWN_CONFLICT_WAS_PUSHED' >&2
  exit 1
fi
echo "UNREGISTERED_CONFLICT_FAIL_CLOSED=PASS"

# Both existing file writers must replace atomically, with verified readback.
SEMANTIC_ATOMIC="$TMP_ROOT/semantic-atomic.md"
printf '%s\n' 'prefix' '<<<<<<< HEAD' 'ours' '=======' 'theirs' '>>>>>>> main' > "$SEMANTIC_ATOMIC"
node "$REPO_ROOT/scripts/dependabot/semantic-all-resolver.mjs" "$SEMANTIC_ATOMIC" > "$TMP_ROOT/semantic-atomic.log"
grep -F -x 'ours' "$SEMANTIC_ATOMIC" >/dev/null
grep -F -x 'theirs' "$SEMANTIC_ATOMIC" >/dev/null
if grep -Eq '^(<<<<<<< |=======|>>>>>>> )' "$SEMANTIC_ATOMIC"; then
  echo "BLOCKED_SEMANTIC_ATOMIC_MARKERS_LEFT" >&2
  exit 1
fi
for helper in "$REPO_ROOT/scripts/dependabot/semantic-all-resolver.mjs" "$REPO_ROOT/scripts/dependabot/structured-conflict-resolver.mjs"; do
  grep -F 'fs.fsyncSync(fd)' "$helper" >/dev/null
  grep -F 'fs.renameSync(temp, target)' "$helper" >/dev/null
  grep -F 'COSTURA_ATOMIC_READBACK_MISMATCH' "$helper" >/dev/null
done
if find "$TMP_ROOT" -name '*.costura-*.tmp' -print -quit | grep -q .; then
  echo "BLOCKED_COSTURA_TEMPORARY_FILE_LEFT" >&2
  exit 1
fi
echo "COSTURA_ATOMIC_FILE_REPLACEMENT=PASS"

# Contraprova estruturada: CONFLICT_ID (catálogo canônico) e id (legado) são aliases.
echo ""
echo "🧪 Política 4.3: deduplicação CONFLICT_ID/id com precedência da main"
STRUCTURED_FIXTURE="$TMP_ROOT/structured-patterns"
mkdir -p "$STRUCTURED_FIXTURE"
(
  cd "$STRUCTURED_FIXTURE"
  git init -q
  cat > pr.json <<'JSON'
{"schema":"v1","owner":"pr","patterns":[{"id":"SAME","value":"PR"},{"CONFLICT_ID":"PR_ONLY","value":"pr-exclusive"},{"unkeyed":true}]}
JSON
  cat > main.json <<'JSON'
{"schema":"v1","owner":"main","refresh":{"pattern_count":0},"patterns":[{"CONFLICT_ID":"SAME","value":"MAIN"},{"id":"MAIN_ONLY","value":"main-exclusive"},{"unkeyed":true}]}
JSON
  pr_blob="$(git hash-object -w pr.json)"
  main_blob="$(git hash-object -w main.json)"
  printf '100644 %s 2\tregistry.json\n100644 %s 3\tregistry.json\n' "$pr_blob" "$main_blob" | git update-index --index-info
  node --check "$REPO_ROOT/scripts/dependabot/structured-conflict-resolver.mjs"
  node "$REPO_ROOT/scripts/dependabot/structured-conflict-resolver.mjs" registry.json MERGE_JSON_PATTERNS_BY_ID_MAIN_FIRST
  node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
assert.equal(d.owner, 'main', 'metadados main preservados');
assert.equal(d.patterns.length, 4, 'CONFLICT_ID/id equivalentes não duplicam');
assert.equal(d.refresh.pattern_count, 4, 'contador consistente');
assert.equal(d.patterns.find(p => (p.CONFLICT_ID ?? p.id) === 'SAME').value, 'MAIN', 'main vence padrão duplicado');
assert.ok(d.patterns.some(p => p.CONFLICT_ID === 'PR_ONLY'), 'padrão exclusivo PR preservado');
assert.ok(d.patterns.some(p => p.id === 'MAIN_ONLY'), 'padrão exclusivo main preservado');
assert.equal(d.patterns.filter(p => p.unkeyed === true).length, 1, 'fallback estrutural sem duplicação');
console.log('REGRESSION_CONFLICT_ID_ALIAS=PASS');
console.log('REGRESSION_MAIN_PRECEDENCE=PASS');
console.log('REGRESSION_COUNTER_AND_EXCLUSIVES=PASS');
NODE
)

# COSTURA also audits explicit-baseline isolated indexes (not only merge conflicts).
# A dirty/diverged local HEAD must never contaminate a remote-baseline check.
AUDIT_FIXTURE="$TMP_ROOT/costura-index-audit"
git init -q "$AUDIT_FIXTURE"
git -C "$AUDIT_FIXTURE" config user.name "CentralDark Audit Fixture"
git -C "$AUDIT_FIXTURE" config user.email "audit-fixture@example.invalid"
printf 'original note\n' > "$AUDIT_FIXTURE/note.md"
printf 'clean\n' > "$AUDIT_FIXTURE/unrelated.md"
git -C "$AUDIT_FIXTURE" add -- note.md unrelated.md
git -C "$AUDIT_FIXTURE" commit -qm 'audit baseline'
AUDIT_BASE="$(git -C "$AUDIT_FIXTURE" rev-parse HEAD)"
printf 'unrelated trailing   \n' > "$AUDIT_FIXTURE/unrelated.md"
git -C "$AUDIT_FIXTURE" commit -qam 'diverged local head unrelated whitespace'
AUDIT_LOCAL_HEAD="$(git -C "$AUDIT_FIXTURE" rev-parse HEAD)"
AUDIT_INDEX="$AUDIT_FIXTURE/.git/isolated-audit.index"
GIT_INDEX_FILE="$AUDIT_INDEX" git -C "$AUDIT_FIXTURE" read-tree "$AUDIT_BASE"
AUDIT_BLOB="$(printf 'new note\n' | git -C "$AUDIT_FIXTURE" hash-object -w --stdin)"
GIT_INDEX_FILE="$AUDIT_INDEX" git -C "$AUDIT_FIXTURE" update-index --add --cacheinfo "100644,$AUDIT_BLOB,note.md"
REPO_DIR="$AUDIT_FIXTURE" GIT_INDEX_FILE="$AUDIT_INDEX" \
  bash "$RESOLVER" --audit-index "$AUDIT_BASE" - -- note.md > "$TMP_ROOT/index-audit-pass.log"
grep -F 'COSTURA_AUDIT_INDEX=PASS' "$TMP_ROOT/index-audit-pass.log" >/dev/null
grep -F "COSTURA_AUDIT_LOCAL_HEAD=$AUDIT_LOCAL_HEAD" "$TMP_ROOT/index-audit-pass.log" >/dev/null
set +e
REPO_DIR="$AUDIT_FIXTURE" GIT_INDEX_FILE="$AUDIT_INDEX" \
  bash "$RESOLVER" --audit-index "$AUDIT_BASE" - -- unrelated.md > "$TMP_ROOT/index-audit-scope.log" 2>&1
AUDIT_SCOPE_RC=$?
REPO_DIR="$AUDIT_FIXTURE" GIT_INDEX_FILE="$AUDIT_FIXTURE/.git/index" \
  bash "$RESOLVER" --audit-index "$AUDIT_BASE" - -- note.md > "$TMP_ROOT/index-audit-default-index.log" 2>&1
AUDIT_DEFAULT_RC=$?
git -C "$AUDIT_FIXTURE" remote add origin "$REMOTE"
REPO_DIR="$AUDIT_FIXTURE" GIT_INDEX_FILE="$AUDIT_INDEX" \
  bash "$RESOLVER" --audit-index "$AUDIT_BASE" refs/heads/main -- note.md > "$TMP_ROOT/index-audit-remote-drift.log" 2>&1
AUDIT_DRIFT_RC=$?
set -e
test "$AUDIT_SCOPE_RC" -eq 3
test "$AUDIT_DEFAULT_RC" -eq 2
test "$AUDIT_DRIFT_RC" -eq 21
grep -F 'BLOCKED_AUDIT_UNEXPECTED_PATH=note.md' "$TMP_ROOT/index-audit-scope.log" >/dev/null
grep -F 'BLOCKED_AUDIT_DEFAULT_INDEX_FORBIDDEN' "$TMP_ROOT/index-audit-default-index.log" >/dev/null
grep -F 'BLOCKED_AUDIT_REMOTE_DRIFT' "$TMP_ROOT/index-audit-remote-drift.log" >/dev/null
# Remote drift must never rewrite or rebase the current local HEAD.
test "$(git -C "$AUDIT_FIXTURE" rev-parse HEAD)" = "$AUDIT_LOCAL_HEAD"
AUDIT_BAD_BLOB="$(printf 'bad whitespace   \n' | git -C "$AUDIT_FIXTURE" hash-object -w --stdin)"
GIT_INDEX_FILE="$AUDIT_INDEX" git -C "$AUDIT_FIXTURE" update-index --add --cacheinfo "100644,$AUDIT_BAD_BLOB,note.md"
set +e
REPO_DIR="$AUDIT_FIXTURE" GIT_INDEX_FILE="$AUDIT_INDEX" \
  bash "$RESOLVER" --audit-index "$AUDIT_BASE" - -- note.md > "$TMP_ROOT/index-audit-whitespace.log" 2>&1
AUDIT_WHITESPACE_RC=$?
set -e
test "$AUDIT_WHITESPACE_RC" -eq 4
grep -F 'BLOCKED_AUDIT_SCOPED_DIFF_CHECK' "$TMP_ROOT/index-audit-whitespace.log" >/dev/null
echo "COSTURA_INDEX_AUDIT_DIVERGED_HEAD=PASS"
echo "COSTURA_INDEX_AUDIT_SCOPE_GUARD=PASS"
echo "COSTURA_INDEX_AUDIT_DEFAULT_INDEX_GUARD=PASS"
echo "COSTURA_INDEX_AUDIT_REMOTE_FAIL_CLOSED=PASS"
echo "COSTURA_INDEX_AUDIT_WHITESPACE_GUARD=PASS"

# Regression: source HEAD can ALREADY contain committed conflict markers.
# That is not the same as a merge-index conflict and must block before push.
cd "$UNKNOWN_SOURCE"
mkdir -p apps/modulos/mcp/src/tools/core
printf '%s\n' 'const route = [' '<<<<<<< HEAD' '  "legacy",' '=======' '  "native",' '>>>>>>> origin/main' '];' > apps/modulos/mcp/src/tools/core/mcp-admin.js
printf '%s\n' '<<<<<<< HEAD' 'const broken = 1;' > scripts/dependabot/incomplete-committed-marker.js
git add -- apps/modulos/mcp/src/tools/core/mcp-admin.js scripts/dependabot/incomplete-committed-marker.js
git -c user.name='CentralDark Test' -c user.email='centraldark-test@example.invalid' commit -qm 'fixture for committed conflict markers'
git push -f origin HEAD:refs/pull/2/head >/dev/null 2>&1
git push -f origin HEAD:refs/heads/dependabot/unknown-conflict >/dev/null 2>&1
MARKER_PR_SHA_BEFORE="$(git ls-remote "$UNKNOWN_REMOTE" refs/heads/dependabot/unknown-conflict | awk '{print $1}')"
CONFLICT_REGISTRY="$REPO_ROOT/scripts/dependabot/known-conflict-patterns.json" \
  node "$REPO_ROOT/scripts/dependabot/classify-conflict.mjs" apps/modulos/mcp/src/tools/core/mcp-admin.js > "$TMP_ROOT/committed-marker-classifier.json"
grep -F '"committed_marker_state":"COMMITTED_BLOCKS"' "$TMP_ROOT/committed-marker-classifier.json" >/dev/null
grep -F '"committed_marker_blocks":1' "$TMP_ROOT/committed-marker-classifier.json" >/dev/null
grep -F '"action":"YELLOW"' "$TMP_ROOT/committed-marker-classifier.json" >/dev/null
grep -F '"conflict_id":"PR_HEAD_EMBEDDED_MERGE_MARKERS"' "$TMP_ROOT/committed-marker-classifier.json" >/dev/null
CONFLICT_REGISTRY="$REPO_ROOT/scripts/dependabot/known-conflict-patterns.json" \
  node "$REPO_ROOT/scripts/dependabot/classify-conflict.mjs" scripts/dependabot/incomplete-committed-marker.js > "$TMP_ROOT/malformed-marker-classifier.json"
grep -F '"committed_marker_state":"COMMITTED_MALFORMED"' "$TMP_ROOT/malformed-marker-classifier.json" >/dev/null
grep -F '"reason":"PR_HEAD_MALFORMED_CONFLICT_MARKERS"' "$TMP_ROOT/malformed-marker-classifier.json" >/dev/null
set +e
PR_HEAD_REF='dependabot/unknown-conflict' REPO_DIR="$UNKNOWN_SOURCE" \
  CENTRALDARK_DEPENDABOT_WORKTREES="$UNKNOWN_WORKTREES" \
  bash "$RESOLVER" --apply 2 > "$TMP_ROOT/committed-marker-block.log" 2>&1
MARKER_BLOCK_RC=$?
set -e
test "$MARKER_BLOCK_RC" -eq 20
grep -F 'BLOCKED_PR_COMMITTED_CONFLICT_MARKERS path=apps/modulos/mcp/src/tools/core/mcp-admin.js' "$TMP_ROOT/committed-marker-block.log" >/dev/null
grep -F 'NO_PUSH_ON_COMMITTED_MARKERS=1' "$TMP_ROOT/committed-marker-block.log" >/dev/null
test "$(git ls-remote "$UNKNOWN_REMOTE" refs/heads/dependabot/unknown-conflict | awk '{print $1}')" = "$MARKER_PR_SHA_BEFORE"
test ! -e "$UNKNOWN_WORKTREES/.costura-repo-writer.lock"
echo "PR_HEAD_COMMITTED_MARKERS_CLASSIFIER_AND_FAIL_CLOSED=PASS"

# COSTURA checkout: one-sided insertion is resolved only in an isolated Git tree.
# Never touch the checkout's index/HEAD or write to main.
CHECKOUT_REMOTE="$TMP_ROOT/checkout-remote.git"
CHECKOUT_WORK="$TMP_ROOT/checkout-work"
CHECKOUT_PEER="$TMP_ROOT/checkout-peer"
git init -q --bare "$CHECKOUT_REMOTE"
git -C "$CHECKOUT_REMOTE" symbolic-ref HEAD refs/heads/main
git init -q -b main "$CHECKOUT_WORK"
git -C "$CHECKOUT_WORK" config user.name "Costura Checkout Test"
git -C "$CHECKOUT_WORK" config user.email "costura-checkout@example.invalid"
printf 'top\nowner:\nbottom\n' > "$CHECKOUT_WORK/note.md"
git -C "$CHECKOUT_WORK" add note.md
git -C "$CHECKOUT_WORK" commit -qm "base"
git -C "$CHECKOUT_WORK" remote add origin "$CHECKOUT_REMOTE"
git -C "$CHECKOUT_WORK" push -q -u origin main
printf 'top\nowner:\nlocal_note: yes\nbottom\n' > "$CHECKOUT_WORK/note.md"
CHECKOUT_SNAPSHOT="$(git -C "$CHECKOUT_WORK" stash create checkout-tracked-snapshot)"
CHECKOUT_HEAD_BEFORE="$(git -C "$CHECKOUT_WORK" rev-parse HEAD)"
CHECKOUT_BLOB_BEFORE="$(git -C "$CHECKOUT_WORK" hash-object -- note.md)"
git clone -q "$CHECKOUT_REMOTE" "$CHECKOUT_PEER"
git -C "$CHECKOUT_PEER" config user.name "Costura Checkout Test"
git -C "$CHECKOUT_PEER" config user.email "costura-checkout@example.invalid"
printf 'top\nowner:\n\nbottom\n' > "$CHECKOUT_PEER/note.md"
git -C "$CHECKOUT_PEER" add note.md
git -C "$CHECKOUT_PEER" commit -qm "main one-sided change"
git -C "$CHECKOUT_PEER" push -q origin main
git -C "$CHECKOUT_WORK" fetch -q origin main
CHECKOUT_MAIN="$(git -C "$CHECKOUT_WORK" rev-parse refs/remotes/origin/main)"
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-dry-run "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-dry.log"
grep -Fq 'CHECKOUT_DECISION=SAFE_ONE_SIDED_INSERT' "$TMP_ROOT/checkout-dry.log"
grep -Fq 'CHECKOUT_CANDIDATE_WRITE=0' "$TMP_ROOT/checkout-dry.log"
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-apply "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-apply.log"
grep -Fq 'CHECKOUT_READBACK=PASS' "$TMP_ROOT/checkout-apply.log"
grep -Fq 'CHECKOUT_RESOLVED_PATHS=1' "$TMP_ROOT/checkout-apply.log"
grep -Fq 'CHECKOUT_REMAINING_CONFLICTS=0' "$TMP_ROOT/checkout-apply.log"
test "$(git -C "$CHECKOUT_WORK" rev-parse HEAD)" = "$CHECKOUT_HEAD_BEFORE"
test "$(git -C "$CHECKOUT_WORK" hash-object -- note.md)" = "$CHECKOUT_BLOB_BEFORE"
test -z "$(git -C "$CHECKOUT_WORK" diff --cached --name-only)"
CHECKOUT_REF="refs/centraldark/checkpoints/costura-${CHECKOUT_MAIN:0:12}-${CHECKOUT_SNAPSHOT:0:12}-tree"
git -C "$CHECKOUT_WORK" cat-file -e "$CHECKOUT_REF:note.md"
test "$(git -C "$CHECKOUT_WORK" rev-parse "$CHECKOUT_REF:note.md")" = "$CHECKOUT_BLOB_BEFORE"
set +e
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-apply "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-again.log" 2>&1
CHECKOUT_AGAIN_RC=$?
set -e
test "$CHECKOUT_AGAIN_RC" -eq 20
grep -Fq 'CHECKOUT_BLOCKED=REQUIRES_EXACTLY_ONE_CONFLICT_HUNK' "$TMP_ROOT/checkout-again.log"
git -C "$CHECKOUT_WORK" add note.md
set +e
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-dry-run "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-staged.log" 2>&1
CHECKOUT_STAGED_RC=$?
set -e
test "$CHECKOUT_STAGED_RC" -eq 20
grep -Fq 'CHECKOUT_BLOCKED=STAGED_OWNER_PROTECTED' "$TMP_ROOT/checkout-staged.log"
# The worktree may already match main while its pinned checkpoint is older.
# Such a path can be marked resolved in the candidate tree without --theirs.
git -C "$CHECKOUT_WORK" reset -q HEAD -- note.md
git -C "$CHECKOUT_WORK" update-ref -d "$CHECKOUT_REF"
git -C "$CHECKOUT_WORK" show "$CHECKOUT_MAIN:note.md" > "$CHECKOUT_WORK/note.md"
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-dry-run "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-identical-dry.log"
grep -Fq 'CHECKOUT_DECISION=SAFE_CURRENT_EQUALS_MAIN' "$TMP_ROOT/checkout-identical-dry.log"
REPO_DIR="$CHECKOUT_WORK" bash "$RESOLVER" \
  --checkout-apply "$CHECKOUT_MAIN" "$CHECKOUT_SNAPSHOT" -- note.md > "$TMP_ROOT/checkout-identical-apply.log"
grep -Fq 'CHECKOUT_READBACK=PASS' "$TMP_ROOT/checkout-identical-apply.log"
test "$(git -C "$CHECKOUT_WORK" rev-parse "$CHECKOUT_REF:note.md")" = "$(git -C "$CHECKOUT_WORK" rev-parse "$CHECKOUT_MAIN:note.md")"
test "$(git -C "$CHECKOUT_WORK" rev-parse HEAD)" = "$CHECKOUT_HEAD_BEFORE"
test -z "$(git -C "$CHECKOUT_WORK" diff --cached --name-only)"
echo "COSTURA_CHECKOUT_ISOLATED_CANDIDATE=PASS"
echo "COSTURA_CHECKOUT_STAGE_HEAD_GUARDS=PASS"
echo "COSTURA_CHECKOUT_MAIN_IDENTICAL=PASS"

echo "RESOLVE_CONFLICTS_POLICY_TEST=PASS"
