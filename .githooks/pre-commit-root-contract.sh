#!/usr/bin/env bash
set -euo pipefail

MD="ROOT-FILE-REGISTRY.md"
JSON_REG="ROOT-FILE-REGISTRY.json"
YAML_BINDING="root-file-binding.yaml"
SKILL=".agents/skills/root-file-contract-router/SKILL.md"
HOOK=".githooks/pre-commit-root-contract.sh"
LIBRARY=".agents/library-index.json"

fail() {
  echo "$1=FAIL" >&2
  echo "ROOT_FILE_CONTRACT=FAIL_CLOSED" >&2
  exit 1
}

[ -f "$MD" ] || fail ROOT_FILE_REGISTRY_MD
echo "ROOT_FILE_REGISTRY_MD=PASS"

[ -f "$JSON_REG" ] || fail ROOT_FILE_REGISTRY_JSON
python3 -m json.tool "$JSON_REG" >/dev/null 2>&1 || fail ROOT_FILE_REGISTRY_JSON
echo "ROOT_FILE_REGISTRY_JSON=PASS"

[ -f "$YAML_BINDING" ] || fail ROOT_FILE_BINDING_YAML
python3 - "$YAML_BINDING" <<'PY' >/dev/null 2>&1 || exit 41
import sys,yaml
y=yaml.safe_load(open(sys.argv[1],encoding='utf-8'))
assert y['enforcement']['json_registry']=='ROOT-FILE-REGISTRY.json'
assert y['enforcement']['markdown_doc']=='ROOT-FILE-REGISTRY.md'
assert y['enforcement']['skill']=='.agents/skills/root-file-contract-router/SKILL.md'
assert y['enforcement']['git_hook']=='.githooks/pre-commit-root-contract.sh'
PY
rc=$?
[ "$rc" -eq 0 ] || fail ROOT_FILE_BINDING_YAML
echo "ROOT_FILE_BINDING_YAML=PASS"

[ -f "$SKILL" ] || fail ROOT_FILE_ROUTER_SKILL
grep -q 'REGISTRY_JSON=ROOT-FILE-REGISTRY.json' "$SKILL" || fail ROOT_FILE_ROUTER_SKILL
grep -q 'YAML_BINDING=root-file-binding.yaml' "$SKILL" || fail ROOT_FILE_ROUTER_SKILL
grep -q 'GIT_HOOK=.githooks/pre-commit-root-contract.sh' "$SKILL" || fail ROOT_FILE_ROUTER_SKILL
echo "ROOT_FILE_ROUTER_SKILL=PASS"

[ -x "$HOOK" ] || fail ROOT_FILE_PRECOMMIT_HOOK
grep -q 'NEW_ROOT_FILE_REQUIRES_REGISTRY=true' "$SKILL" || fail ROOT_FILE_PRECOMMIT_HOOK
echo "ROOT_FILE_PRECOMMIT_HOOK=PASS"

[ -f "$LIBRARY" ] || fail LIBRARY_INDEX_V1_2_0
python3 - "$LIBRARY" <<'PY' >/dev/null 2>&1 || exit 42
import json,sys
lib=json.load(open(sys.argv[1],encoding='utf-8'))
assert lib.get('version')=='1.2.0'
paths={x.get('path') for x in lib.get('canonical_sources',[])}
for p in ['ROOT-FILE-REGISTRY.md','ROOT-FILE-REGISTRY.json','root-file-binding.yaml']:
    assert p in paths
skills={x.get('id'):x.get('path') for x in lib.get('skills',[])}
assert skills.get('root-file-contract-router')=='.agents/skills/root-file-contract-router/SKILL.md'
contract=lib.get('root_file_contract',{})
assert contract.get('version')=='1.2.0'
assert contract.get('surfaces',{}).get('hook')=='.githooks/pre-commit-root-contract.sh'
PY
rc=$?
[ "$rc" -eq 0 ] || fail LIBRARY_INDEX_V1_2_0
echo "LIBRARY_INDEX_V1_2_0=PASS"

ROOT_FILES="$(git diff --cached --name-only --diff-filter=A | grep -v '/' || true)"
if [ -n "$ROOT_FILES" ]; then
  ERRORS=0
  for FILE in $ROOT_FILES; do
    case "$FILE" in .*|package*) continue ;; esac
    if ! python3 - "$JSON_REG" "$FILE" <<'PY' >/dev/null 2>&1
import json,sys
reg=json.load(open(sys.argv[1],encoding='utf-8'))
target=sys.argv[2]
for cat in reg.get('categories',{}).values():
    if target in cat.get('files',{}): raise SystemExit(0)
raise SystemExit(1)
PY
    then
      echo "BLOCKED: root file não registrado: $FILE" >&2
      ERRORS=$((ERRORS+1))
    fi
  done
  [ "$ERRORS" -eq 0 ] || exit 1
fi

echo "ROOT_FILE_CONTRACT=PASS"
