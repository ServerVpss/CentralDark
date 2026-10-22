#!/usr/bin/env bash
# #OBSERVACOES# | MAIN_PINNED_MCP_SKILL_CATALOG_ONLY
# @owner: scripts/vps/main-pinned-microdeploy.sh
# @doc_ref: docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md
# @last_updated: 2026-10-22T04:25:00.000Z
# @scope: allowlisted full skill-catalog quartet; no broad native MCP promotion.
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
SCRATCH="${CENTRALDARK_SCRATCH:-$REPO/_worktrees/main-pinned-runtime-fastpath}"
LOCK="${CENTRALDARK_FASTPATH_LOCK:-/tmp/centraldark-main-pinned-fastpath.lock}"
OWNER=""
SOURCE=""
DRY_RUN=0
FILES=()
MCP_SKILL_CATALOG_DELTA=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owner) OWNER="${2:-}"; shift 2 ;;
    --source) SOURCE="${2:-}"; shift 2 ;;
    --file) FILES+=("${2:-}"); shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

[[ "${#FILES[@]}" -gt 0 ]] || { echo "FILESET_EMPTY"; exit 3; }

TARGET_ROOT="$REPO"
SYSTEMD_SERVICE=""
RUNTIME_DIR=""
EXPECTED_EXEC=""
HEALTH=""
HEARTBEAT=""
TOOLS=""
APPS=()
PREFIXES=()
case "$OWNER" in
  mcp)
    PREFIXES=("apps/modulos/mcp/")
    TARGET_ROOT="/root/CentralDark_MCP_RUNTIME"
    RUNTIME_DIR="$TARGET_ROOT/apps/modulos/mcp"
    SYSTEMD_SERVICE="centraldark-native-mcp-http.service"
    EXPECTED_EXEC="$RUNTIME_DIR/dist/index.js"
    HEALTH="http://127.0.0.1:9100/health"
    HEARTBEAT="http://127.0.0.1:9100/heartbeat"
    TOOLS="http://127.0.0.1:9100/tools.json"
    ;;
  hub_bot) PREFIXES=("apps/bot-telegram/"); APPS=("CentralDark-HubBot-Srver1" "CentralDark-HubBot-Guardiao") ;;
  hermes)
    PREFIXES=("apps/modulos/HERMES-CORE/" "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/" ".agents/skills/centraldark-operational-method/")
    SYSTEMD_SERVICE="centraldark-hermes-core.service"
    EXPECTED_EXEC="$TARGET_ROOT/apps/modulos/HERMES-CORE/core/orchestrator.mjs"
    HEALTH="http://127.0.0.1:8899/health"
    ;;
  oauth_broker) PREFIXES=("apps/modulos/oauth-broker/"); SYSTEMD_SERVICE="centraldark-oauth-broker.service"; EXPECTED_EXEC="$TARGET_ROOT/apps/modulos/oauth-broker/server.mjs"; HEALTH="http://127.0.0.1:8098/health" ;;
  *) echo "OWNER_UNKNOWN"; exit 4 ;;
esac

allowed_file() {
  local rel="$1" p
  [[ "$rel" != /* && "$rel" != *".."* && -n "$rel" ]] || return 1
  [[ ! "$rel" =~ (^|/)(\.env|secrets?|credentials?|tokens?|sessions?)(/|$) ]] || return 1
  for p in "${PREFIXES[@]}"; do [[ "$rel" == "$p"* ]] && return 0; done
  return 1
}
for rel in "${FILES[@]}"; do allowed_file "$rel" || { echo "FILE_OUTSIDE_OWNER_SCOPE=$rel"; exit 5; }; done

# The native systemd runtime is intentionally narrow until each additional
# runtime dependency receives its own measured promotion contract.
if [[ "$OWNER" == "mcp" ]]; then
  for rel in "${FILES[@]}"; do
    case "$rel" in
      apps/modulos/mcp/src/index.js|apps/modulos/mcp/dist/index.js) ;;
      # Promovido 2026-10-08: F1_GIT do One Heart (teste tests/operational-telemetry.test.mjs).
      apps/modulos/mcp/src/operational-telemetry.js|apps/modulos/mcp/dist/operational-telemetry.js) ;;
      # Mesma skill existente: os dois módulos e seus dist devem viajar juntos.
      apps/modulos/mcp/src/tools/skills/skill.js|apps/modulos/mcp/dist/tools/skills/skill.js|apps/modulos/mcp/src/tools/skills/catalog-index.js|apps/modulos/mcp/dist/tools/skills/catalog-index.js)
        MCP_SKILL_CATALOG_DELTA=1 ;;
      *) echo "MCP_NATIVE_FILESET_NOT_APPROVED=$rel"; exit 6 ;;
    esac
  done
fi

# Skill imports catalog-index; never promote a partial src/dist dependency graph.
if [[ "$OWNER" == "mcp" && "$MCP_SKILL_CATALOG_DELTA" == 1 ]]; then
  for required in \
    apps/modulos/mcp/src/tools/skills/skill.js \
    apps/modulos/mcp/dist/tools/skills/skill.js \
    apps/modulos/mcp/src/tools/skills/catalog-index.js \
    apps/modulos/mcp/dist/tools/skills/catalog-index.js; do
    found=0
    for candidate in "${FILES[@]}"; do
      if [[ "$candidate" == "$required" ]]; then found=1; break; fi
    done
    [[ "$found" == 1 ]] || { echo "MCP_SKILL_FILESET_INCOMPLETE=$required"; exit 7; }
  done
  [[ "${#FILES[@]}" == 4 ]] || { echo "MCP_SKILL_FILESET_MUST_BE_EXACT_QUARTET"; exit 7; }
fi

exec 9>"$LOCK"
flock -w 90 9 || { echo "LOCK_TIMEOUT"; exit 21; }
cd "$REPO"
export HOME="${HOME:-/root}"
git fetch --prune origin main >/dev/null
MAIN_SHA="$(git rev-parse origin/main)"
SOURCE="${SOURCE:-$MAIN_SHA}"
[[ "$SOURCE" =~ ^[0-9a-f]{40}$ ]] || { echo "SOURCE_SHA_INVALID"; exit 22; }
git merge-base --is-ancestor "$SOURCE" "$MAIN_SHA" || { echo "SOURCE_NOT_IN_MAIN"; exit 23; }

mkdir -p "$(dirname "$SCRATCH")"
if ! git worktree list --porcelain | grep -F "worktree $SCRATCH" >/dev/null 2>&1; then
  rm -rf "$SCRATCH"
  git worktree add --detach "$SCRATCH" "$SOURCE" >/dev/null
fi
[[ "$(readlink -f "$SCRATCH")" == "$SCRATCH" ]] || { echo "SCRATCH_PATH_MISMATCH"; exit 24; }
[[ "$(readlink -f "$SCRATCH")" != "$(readlink -f "$REPO")" ]] || { echo "RUNTIME_IS_SCRATCH"; exit 25; }
git -C "$SCRATCH" reset --hard "$SOURCE" >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null

# Gate isolated in the canonical scratch, before touching the live native runtime.
if [[ "$MCP_SKILL_CATALOG_DELTA" == 1 ]]; then
  command -v node >/dev/null 2>&1 || { echo "MCP_SKILL_NODE_MISSING"; exit 8; }
  for rel in "${FILES[@]}"; do node --check "$SCRATCH/$rel" || { echo "MCP_SKILL_SYNTAX_FAIL=$rel"; exit 8; }; done
  node --test "$SCRATCH/apps/modulos/mcp/tests/skill-catalog-unificado.test.mjs" \
    "$SCRATCH/apps/modulos/mcp/tests/centraldark-hermes-delegacao-contract.test.mjs" \
    || { echo "MCP_SKILL_TESTS_FAIL"; exit 8; }
  echo "MCP_SKILL_CATALOG_PRETEST=PASS"
fi

mcp_tool_count() {
  curl -fsS --max-time 3 "$TOOLS" | python3 -c 'import json,sys; x=json.load(sys.stdin); print(len(x.get("tools",x) if isinstance(x,dict) else x))'
}
mcp_tool_names() {
  curl -fsS --max-time 3 "$TOOLS" | python3 -c 'import json,sys; x=json.load(sys.stdin); items=x.get("tools",[]) if isinstance(x,dict) else x; print(chr(10).join(sorted(z["name"] for z in items if isinstance(z,dict) and isinstance(z.get("name"),str))))'
}
require_mcp_runtime_owner() {
  [[ -d "$RUNTIME_DIR" ]] || { echo "MCP_NATIVE_RUNTIME_MISSING"; exit 31; }
  git -C "$TARGET_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "MCP_NATIVE_RUNTIME_NOT_GIT"; exit 31; }
  local show
  show="$(systemctl show "$SYSTEMD_SERVICE" --no-pager -p ActiveState -p WorkingDirectory -p ExecStart -p FragmentPath -p MainPID)"
  grep -qx 'ActiveState=active' <<<"$show" || { echo "MCP_NATIVE_SERVICE_NOT_ACTIVE"; exit 32; }
  grep -Fqx "WorkingDirectory=$RUNTIME_DIR" <<<"$show" || { echo "MCP_NATIVE_WORKDIR_MISMATCH"; exit 33; }
  grep -Fq "$EXPECTED_EXEC" <<<"$show" || { echo "MCP_NATIVE_EXEC_MISMATCH"; exit 34; }
  curl -fsS --max-time 3 "$HEALTH" >/dev/null || { echo "MCP_NATIVE_PRE_HEALTH_FAILED"; exit 35; }
}
restart_runtime() {
  if [[ -n "$SYSTEMD_SERVICE" ]]; then
    systemctl restart "$SYSTEMD_SERVICE"
    systemctl is-active --quiet "$SYSTEMD_SERVICE"
  else
    local app
    for app in "${APPS[@]}"; do PM2_HOME=/root/.pm2 pm2 restart "$app" --update-env >/dev/null; done
  fi
}
wait_runtime() {
  local tries="${1:-20}" _ app state
  for _ in $(seq 1 "$tries"); do
    if [[ -n "$SYSTEMD_SERVICE" ]]; then
      systemctl is-active --quiet "$SYSTEMD_SERVICE" && { curl -fsS --max-time 3 "$HEALTH" >/dev/null 2>&1 && return 0; }
    else
      state=1
      for app in "${APPS[@]}"; do
        PM2_HOME=/root/.pm2 pm2 jlist | python3 -c 'import json,sys; a=sys.argv[1]; x=json.load(sys.stdin); sys.exit(0 if any(i.get("name")==a and i.get("pm2_env",{}).get("status")=="online" for i in x) else 1)' "$app" || state=0
      done
      [[ "$state" == 1 ]] && { [[ -z "$HEALTH" ]] || curl -fsS --max-time 3 "$HEALTH" >/dev/null 2>&1; } && return 0
    fi
    sleep 1
  done
  return 1
}

if [[ "$OWNER" == "mcp" ]]; then
  require_mcp_runtime_owner
  PRE_PID="$(systemctl show "$SYSTEMD_SERVICE" --no-pager -p MainPID --value)"
  PRE_TOOLS="$(mcp_tool_count)"
  PRE_TOOL_NAMES=""
  if [[ "$MCP_SKILL_CATALOG_DELTA" == 1 ]]; then PRE_TOOL_NAMES="$(mcp_tool_names)"; fi
else
  PRE_PID=""
  PRE_TOOLS=""
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/root/CentralDark-Recovery/main-pinned/$OWNER/$STAMP"
RECEIPT="$REPO/logs/receipts/main-pinned-$OWNER-$STAMP.json"
mkdir -p "$(dirname "$RECEIPT")"
TMP_MERGE="$(mktemp -d "${TMPDIR:-/root/.hermes/cache/scratch}/main-pinned-merge.XXXXXX")"
promoted=0

rollback() {
  local rc=$?
  trap - EXIT ERR
  set +e
  if [[ "$rc" -ne 0 && "$promoted" == "1" ]]; then
    echo "ROLLBACK_BEGIN"
    rollback_ok=1
    for rel in "${FILES[@]}"; do
      if [[ -e "$BACKUP/$rel" ]]; then
        mkdir -p "$TARGET_ROOT/$(dirname "$rel")"
        cp -a "$BACKUP/$rel" "$TARGET_ROOT/$rel" || rollback_ok=0
      elif [[ -e "$BACKUP/.absent/$rel" ]]; then
        rm -f -- "$TARGET_ROOT/$rel" || rollback_ok=0
      else
        echo "ROLLBACK_STATE_UNKNOWN=$rel"
        rollback_ok=0
      fi
    done
    restart_runtime || rollback_ok=0
    wait_runtime || rollback_ok=0
    [[ "$rollback_ok" == 1 ]] && echo "ROLLBACK_STATE=PASS" || echo "ROLLBACK_STATE=FAIL"
    echo "ROLLBACK_END"
  fi
  rm -rf "$TMP_MERGE"
  git -C "$SCRATCH" reset --hard origin/main >/dev/null 2>&1 || true
  git -C "$SCRATCH" clean -fdx >/dev/null 2>&1 || true
  exit "$rc"
}
trap rollback EXIT ERR

for rel in "${FILES[@]}"; do
  git -C "$SCRATCH" cat-file -e "$SOURCE:$rel" 2>/dev/null || { echo "SOURCE_FILE_MISSING=$rel"; exit 36; }
  SOURCE_FILE="$SCRATCH/$rel"
  TARGET_FILE="$TARGET_ROOT/$rel"
  [[ -e "$TARGET_FILE" ]] || { echo "TARGET_FILE_MISSING=$rel"; exit 37; }
  if [[ "$OWNER" == "mcp" ]]; then
    BASE_FILE="$TMP_MERGE/base-${rel//\//_}"
    MERGED_FILE="$TMP_MERGE/merged-${rel//\//_}"
    git -C "$TARGET_ROOT" show "HEAD:$rel" > "$BASE_FILE" || { echo "MCP_NATIVE_BASE_MISSING=$rel"; exit 38; }
    set +e
    git merge-file -p "$TARGET_FILE" "$BASE_FILE" "$SOURCE_FILE" > "$MERGED_FILE"
    merge_rc=$?
    set -e
    [[ "$merge_rc" == 0 ]] || { echo "BLOCKED_DIRTY_TARGET_OVERLAP=$rel"; exit 39; }
    cmp -s "$MERGED_FILE" "$SOURCE_FILE" || { echo "BLOCKED_DIRTY_TARGET_OVERLAP=$rel"; exit 40; }
  fi
  echo "PLAN_FILE=$rel"
  echo "PLAN_TARGET_SHA256=$(sha256sum "$TARGET_FILE" | cut -d' ' -f1)"
  echo "PLAN_SOURCE_SHA256=$(sha256sum "$SOURCE_FILE" | cut -d' ' -f1)"
done

echo "PLAN_OWNER=$OWNER"
echo "PLAN_TARGET_ROOT=$TARGET_ROOT"
echo "PLAN_BACKUP=$BACKUP"
echo "PLAN_RECEIPT=$RECEIPT"
echo "PLAN_RESTART=${SYSTEMD_SERVICE:-pm2}"
echo "PLAN_ROLLBACK=restore_files_then_restart_same_owner"
if [[ "$DRY_RUN" == 1 ]]; then
  echo "MAIN_PINNED_MICRODEPLOY_DRY_RUN=PASS"
  exit 0
fi

mkdir -p "$BACKUP"
for rel in "${FILES[@]}"; do
  TARGET_FILE="$TARGET_ROOT/$rel"
  mkdir -p "$BACKUP/$(dirname "$rel")"
  cp -a "$TARGET_FILE" "$BACKUP/$rel"
  cp -a "$SCRATCH/$rel" "$TARGET_FILE"
  cmp -s "$SCRATCH/$rel" "$TARGET_FILE" || { echo "PROMOTION_HASH_MISMATCH=$rel"; exit 41; }
done
promoted=1
restart_runtime
wait_runtime || { echo "RUNTIME_NOT_HEALTHY_AFTER_RESTART"; exit 42; }

POST_PID=""
POST_TOOLS=""
if [[ "$OWNER" == "mcp" ]]; then
  POST_PID="$(systemctl show "$SYSTEMD_SERVICE" --no-pager -p MainPID --value)"
  curl -fsS --max-time 3 "$HEARTBEAT" | python3 -c 'import json,sys; x=json.load(sys.stdin); assert x.get("ok") is True and "operational" in x' || { echo "MCP_NATIVE_HEARTBEAT_FAILED"; exit 43; }
  POST_TOOLS="$(mcp_tool_count)"
  if [[ "$MCP_SKILL_CATALOG_DELTA" == 1 ]]; then
    POST_TOOL_NAMES="$(mcp_tool_names)"
    python3 - "$PRE_TOOL_NAMES" "$POST_TOOL_NAMES" <<'PY'
import sys
previous, current = (set(value.splitlines()) for value in sys.argv[1:])
required = {"skill_listar", "skill_buscar", "skill_instalar", "skill_status", "skill_atualizar"}
if not required.issubset(current):
    print("MCP_SKILL_CATALOG_REQUIRED_TOOLS_MISSING=" + ",".join(sorted(required - current)))
    raise SystemExit(44)
if not previous.issubset(current):
    print("MCP_SKILL_CATALOG_REGRESSION=" + ",".join(sorted(previous - current)))
    raise SystemExit(44)
if current - previous - {"skill_buscar"}:
    print("MCP_SKILL_CATALOG_UNRELATED_TOOL_ADDED=" + ",".join(sorted(current - previous - {"skill_buscar"})))
    raise SystemExit(44)
print("MCP_SKILL_CATALOG_TOOL_REGISTRY=PASS")
PY
  else
    [[ "$POST_TOOLS" == "$PRE_TOOLS" ]] || { echo "MCP_NATIVE_TOOL_COUNT_CHANGED=$PRE_TOOLS:$POST_TOOLS"; exit 44; }
  fi
fi

SOURCE="$SOURCE" MAIN_SHA="$MAIN_SHA" OWNER="$OWNER" BACKUP="$BACKUP" RECEIPT="$RECEIPT" TARGET_ROOT="$TARGET_ROOT" PRE_PID="$PRE_PID" POST_PID="$POST_PID" PRE_TOOLS="$PRE_TOOLS" POST_TOOLS="$POST_TOOLS" python3 - <<'PY'
import json, os
payload = {
  "schema": "centraldark.main-pinned-runtime-fast-path.receipt.v2",
  "source_sha": os.environ["SOURCE"], "main_sha": os.environ["MAIN_SHA"],
  "owner": os.environ["OWNER"], "target_root": os.environ["TARGET_ROOT"],
  "backup": os.environ["BACKUP"], "pid_before": os.environ["PRE_PID"] or None,
  "pid_after": os.environ["POST_PID"] or None, "tool_count_before": os.environ["PRE_TOOLS"] or None,
  "tool_count_after": os.environ["POST_TOOLS"] or None, "result": "PASS", "secrets_exposed": False,
}
with open(os.environ["RECEIPT"], "w", encoding="utf-8") as f: json.dump(payload, f, sort_keys=True); f.write("\n")
PY

echo "RECEIPT=$RECEIPT"
echo "MAIN_PINNED_MICRODEPLOY=PASS"
echo "SOURCE_SHA=$SOURCE"
echo "OWNER=$OWNER"
echo "FILESET_COUNT=${#FILES[@]}"
promoted=0
rm -rf "$TMP_MERGE"
git -C "$SCRATCH" reset --hard origin/main >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null
[[ -z "$(git -C "$SCRATCH" status --porcelain)" ]] || { echo "SCRATCH_DIRTY_AFTER"; exit 45; }
trap - EXIT ERR
