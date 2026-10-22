#!/usr/bin/env bash
# #OBSERVACOES# | MAIN_PINNED_MCP_SKILL_CATALOG_COUNTERPROOF
# @owner: scripts/vps/main-pinned-microdeploy.sh
# @doc_ref: docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md
# @last_updated: 2026-10-22T04:25:00.000Z
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SCRIPT="$ROOT/scripts/vps/main-pinned-microdeploy.sh"
bash -n "$SCRIPT"
for required in \
  'apps/modulos/mcp/src/tools/skills/skill.js' \
  'apps/modulos/mcp/dist/tools/skills/skill.js' \
  'apps/modulos/mcp/src/tools/skills/catalog-index.js' \
  'apps/modulos/mcp/dist/tools/skills/catalog-index.js'; do
  grep -Fq "$required" "$SCRIPT" || { echo "ALLOWLIST_MISSING=$required"; exit 10; }
done
grep -Fq 'MCP_SKILL_CATALOG_PRETEST=PASS' "$SCRIPT"
grep -Fq 'MCP_SKILL_CATALOG_TOOL_REGISTRY=PASS' "$SCRIPT"
# These two negative cases exit BEFORE git, network or a runtime restart.
set +e
rejected="$(bash "$SCRIPT" --owner mcp --file apps/modulos/mcp/src/tools/skills/unapproved.js 2>&1)"
reject_code=$?
partial="$(bash "$SCRIPT" --owner mcp --file apps/modulos/mcp/src/tools/skills/skill.js 2>&1)"
partial_code=$?
set -e
[[ "$reject_code" == 6 && "$rejected" == *'MCP_NATIVE_FILESET_NOT_APPROVED'* ]] || { echo "UNAPPROVED_FILE_ALLOWED"; exit 11; }
[[ "$partial_code" == 7 && "$partial" == *'MCP_SKILL_FILESET_INCOMPLETE'* ]] || { echo "PARTIAL_FILESET_ALLOWED"; exit 12; }
printf '%s\n' 'MCP_SKILL_CATALOG_ALLOWLIST_AND_COUNTERPROOF=PASS'
