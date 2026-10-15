#!/usr/bin/env bash
# Contraprova descartável da política do motor único Dependabot.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESOLVER="$REPO_ROOT/scripts/dependabot/resolve-conflicts.sh"
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

PR_HEAD_REF='dependabot/test-bump' \
REPO_DIR="$SOURCE" \
CENTRALDARK_DEPENDABOT_WORKTREES="$WORKTREES" \
KNOWN_CONFLICTS_FILE='scripts/dependabot/known-conflict-patterns.json' \
bash "$RESOLVER" 1 > "$TMP_ROOT/resolver.log"

git fetch origin dependabot/test-bump >/dev/null 2>&1
git checkout -q FETCH_HEAD

grep -F '"version":"1.0.1"' package.json >/dev/null
grep -F -x 'main-change' CENTRALDARK_AI_BOOT.yaml >/dev/null
grep -F -x 'gateway-main-change' docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md >/dev/null
grep -F 'KNOWN_CONFLICT_PATH=true path=CENTRALDARK_AI_BOOT.yaml actual=CENTRALDARK_AI_BOOT.yaml' "$TMP_ROOT/resolver.log" >/dev/null
grep -F 'KNOWN_CONFLICT_PATH=true path=docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md actual=docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md' "$TMP_ROOT/resolver.log" >/dev/null

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

PR_HEAD_REF='dependabot/unknown-conflict' \
REPO_DIR="$UNKNOWN_SOURCE" \
CENTRALDARK_DEPENDABOT_WORKTREES="$UNKNOWN_WORKTREES" \
KNOWN_CONFLICTS_FILE='scripts/dependabot/known-conflict-patterns.json' \
bash "$RESOLVER" 2 > "$TMP_ROOT/unknown-resolver.log" 2>&1

git fetch origin dependabot/unknown-conflict >/dev/null 2>&1
git checkout -q FETCH_HEAD
grep -F -x 'unknown-pr' docs/unknown-conflict.md >/dev/null
grep -F -x 'unknown-main' docs/unknown-conflict.md >/dev/null
grep -F 'UNKNOWN_CONFLICT_PATH path=docs/unknown-conflict.md action=AUTO_REVIEW_TEXT_BOTH' "$TMP_ROOT/unknown-resolver.log" >/dev/null
grep -F 'AUTO_REVIEW_COUNTERPROOF=PASS' "$TMP_ROOT/unknown-resolver.log" >/dev/null

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

echo "RESOLVE_CONFLICTS_POLICY_TEST=PASS"
