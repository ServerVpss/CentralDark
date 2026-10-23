#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-<caminho-vps>}"
SCRATCH="${CENTRALDARK_SCRATCH:-$REPO/_worktrees/main-pinned-runtime-fastpath}"
LOCK="${CENTRALDARK_FASTPATH_LOCK:-/tmp/centraldark-main-pinned-fastpath.lock}"
OWNER=""
SOURCE=""
DRY_RUN=0
MCP_NEEDS_BUILD=0
# Atualizacao coerente src+dist do mesmo MCP; sem segundo executor.
MCP_BUILD_UNITS=(
  "mcp-server"
  "tools/core/mcp-admin"
  "tools/deploy/centraldark-capabilities"
  "tools/core/mcp-policy"
  "tools/github/github"
  "tools/github/github-tools"
  "tools/github/github-write"
)
FILES=()

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
    TARGET_ROOT="<caminho-vps>"
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
  # Receita do MCP atualizada na MESMA transacao de codigo; nao abrir docs inteiros.
  if [[ "$OWNER" == mcp && "$rel" == "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json" ]]; then return 0; fi
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
      # Promovido 2026-10-23: espelha o resultado da tool em structuredContent (leitura não chega vazia).
      # Módulo puro, sem imports; contrato medido em tests/tool-result-envelope.test.mjs (8/8).
      apps/modulos/mcp/src/tool-result-envelope.js|apps/modulos/mcp/dist/tool-result-envelope.js) ;;
      # Novas capacidades reutilizam o mesmo executor e compilam em worktree isolada na VPS.
      apps/modulos/mcp/src/tools/github/github-tools.js|apps/modulos/mcp/dist/tools/github/github-tools.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/tools/core/mcp-policy.js|apps/modulos/mcp/dist/tools/core/mcp-policy.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/mcp-server.js|apps/modulos/mcp/dist/mcp-server.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/tools/core/mcp-admin.js|apps/modulos/mcp/dist/tools/core/mcp-admin.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/tools/deploy/centraldark-capabilities.js|apps/modulos/mcp/dist/tools/deploy/centraldark-capabilities.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/tools/github/github.js|apps/modulos/mcp/dist/tools/github/github.js) MCP_NEEDS_BUILD=1 ;;
      apps/modulos/mcp/src/tools/github/github-write.js|apps/modulos/mcp/dist/tools/github/github-write.js) MCP_NEEDS_BUILD=1 ;;
      docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json) ;;
      *) echo "MCP_NATIVE_FILESET_NOT_APPROVED=$rel"; exit 6 ;;
    esac
  done
fi

has_file() {
  local match="$1" rel
  for rel in "${FILES[@]}"; do
    [[ "$rel" == "$match" ]] && return 0
  done
  return 1
}
# Para atualizacao MCP, source e artefato devem ser promovidos juntos.
if [[ "$MCP_NEEDS_BUILD" == 1 ]]; then
  for pair in "${MCP_BUILD_UNITS[@]}"; do
    if has_file "apps/modulos/mcp/src/$pair.js" || has_file "apps/modulos/mcp/dist/$pair.js"; then
      has_file "apps/modulos/mcp/src/$pair.js" && has_file "apps/modulos/mcp/dist/$pair.js" || {
        echo "MCP_SOURCE_DIST_PAIR_REQUIRED=$pair"; exit 8;
      }
    fi
  done
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

# Trava ANTES de qualquer reset/clean. Nao apagar paths nao registrados como worktree.
[[ "$SCRATCH" == /* && "$REPO" == /* && "$TARGET_ROOT" == /* ]] || { echo "SCRATCH_ABSOLUTE_PATH_REQUIRED"; exit 24; }
[[ ! -L "$SCRATCH" ]] || { echo "SCRATCH_SYMLINK_BLOCKED"; exit 24; }
REPO_REAL="$(readlink -f "$REPO")"
TARGET_REAL="$(readlink -f "$TARGET_ROOT")"
SCRATCH_REAL="$(readlink -m "$SCRATCH")"
[[ -n "$REPO_REAL" && -n "$TARGET_REAL" && "$SCRATCH_REAL" != "/" ]] || { echo "SCRATCH_REALPATH_INVALID"; exit 24; }
[[ "$SCRATCH_REAL" == "$SCRATCH" ]] || { echo "SCRATCH_PATH_MISMATCH"; exit 24; }
for protected in "$REPO_REAL" "$TARGET_REAL"; do
  [[ "$SCRATCH_REAL" != "$protected" && "$protected" != "$SCRATCH_REAL"/* ]] || {
    echo "SCRATCH_TOUCHES_PROTECTED_ROOT"; exit 25;
  }
done
mkdir -p "$(dirname "$SCRATCH")"
if git worktree list --porcelain | grep -Fx "worktree $SCRATCH" >/dev/null 2>&1; then
  [[ -d "$SCRATCH" ]] || { echo "REGISTERED_SCRATCH_MISSING"; exit 26; }
else
  # Diretório nao registrado pode conter dados de outro owner: nunca rm -rf.
  [[ ! -e "$SCRATCH" ]] || { echo "UNREGISTERED_SCRATCH_KEEP_ACTIVE"; exit 26; }
  git worktree add --detach "$SCRATCH" "$SOURCE" >/dev/null
fi
[[ "$(readlink -f "$SCRATCH")" == "$SCRATCH_REAL" ]] || { echo "SCRATCH_REALPATH_CHANGED"; exit 27; }
git -C "$SCRATCH" reset --hard "$SOURCE" >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null

# BUILD NA VPS: somente worktree versionada. Nunca npm install ou build no runtime dirty.
if [[ "$MCP_NEEDS_BUILD" == 1 ]]; then
  MCP_MODULES="$REPO/apps/modulos/mcp/node_modules"
  MCP_TSC="$MCP_MODULES/.bin/tsc"
  [[ -d "$MCP_MODULES" && -x "$MCP_TSC" ]] || { echo "MCP_BUILD_DEPS_MISSING"; exit 28; }
  [[ ! -e "$SCRATCH/apps/modulos/mcp/node_modules" ]] || { echo "SCRATCH_BUILD_DEPS_COLLISION"; exit 28; }
  ln -s "$MCP_MODULES" "$SCRATCH/apps/modulos/mcp/node_modules"
  # Compila todas as dependencias no scratch; --noResolve deixava imports sem prova.
  for unit in "${MCP_BUILD_UNITS[@]}"; do
    node --check "$SCRATCH/apps/modulos/mcp/src/$unit.js"
  done
  "$MCP_TSC" --project "$SCRATCH/apps/modulos/mcp/tsconfig.json"
  for unit in "${MCP_BUILD_UNITS[@]}"; do
    node --check "$SCRATCH/apps/modulos/mcp/dist/$unit.js"
  done
  node --test \
    "$SCRATCH/apps/modulos/mcp/tests/admin-ssh-microdeploy.test.mjs" \
    "$SCRATCH/apps/modulos/mcp/tests/centraldark-capabilities.test.mjs"
  echo "MCP_BUILD_VPS_TEST=PASS"
fi

mcp_tool_count() {
  curl -fsS --max-time 3 "$TOOLS" | python3 -c 'import json,sys; x=json.load(sys.stdin); print(len(x.get("tools",x) if isinstance(x,dict) else x))'
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
    for app in "${APPS[@]}"; do PM2_HOME=<caminho-vps> pm2 restart "$app" --update-env >/dev/null; done
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
        PM2_HOME=<caminho-vps> pm2 jlist | python3 -c 'import json,sys; a=sys.argv[1]; x=json.load(sys.stdin); sys.exit(0 if any(i.get("name")==a and i.get("pm2_env",{}).get("status")=="online" for i in x) else 1)' "$app" || state=0
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
else
  PRE_PID=""
  PRE_TOOLS=""
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="<caminho-vps>$OWNER/$STAMP"
RECEIPT="$REPO/logs/receipts/main-pinned-$OWNER-$STAMP.json"
mkdir -p "$(dirname "$RECEIPT")"
TMP_MERGE="$(mktemp -d "${TMPDIR:-<caminho-vps>}/main-pinned-merge.XXXXXX")"
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

# Fase 1: snapshot COMPLETO. Nenhum arquivo do runtime foi mutado ainda.
mkdir -p "$BACKUP"
for rel in "${FILES[@]}"; do
  mkdir -p "$BACKUP/$(dirname "$rel")"
  cp -a "$TARGET_ROOT/$rel" "$BACKUP/$rel"
done
# Fase 2: ativar rollback ANTES da primeira cópia; falha parcial restaura todos.
promoted=1
for rel in "${FILES[@]}"; do
  TARGET_FILE="$TARGET_ROOT/$rel"
  cp -a "$SCRATCH/$rel" "$TARGET_FILE"
  cmp -s "$SCRATCH/$rel" "$TARGET_FILE" || { echo "PROMOTION_HASH_MISMATCH=$rel"; exit 41; }
done
restart_runtime
wait_runtime || { echo "RUNTIME_NOT_HEALTHY_AFTER_RESTART"; exit 42; }

POST_PID=""
POST_TOOLS=""
if [[ "$OWNER" == "mcp" ]]; then
  POST_PID="$(systemctl show "$SYSTEMD_SERVICE" --no-pager -p MainPID --value)"
  curl -fsS --max-time 3 "$HEARTBEAT" | python3 -c 'import json,sys; x=json.load(sys.stdin); assert x.get("ok") is True and "operational" in x' || { echo "MCP_NATIVE_HEARTBEAT_FAILED"; exit 43; }
  POST_TOOLS="$(mcp_tool_count)"
  if [[ "$POST_TOOLS" != "$PRE_TOOLS" ]]; then
    # Nova tool aprovada pode acrescentar UM item; queda ou salto fora do escopo = rollback.
    if [[ "$MCP_NEEDS_BUILD" == 1 ]] && (( POST_TOOLS == PRE_TOOLS + 1 )); then
      echo "MCP_TOOL_COUNT_EXTENDED_BY_ONE_REQUIRES_ADMIN_CATALOG_READBACK"
    else
      echo "MCP_NATIVE_TOOL_COUNT_CHANGED=$PRE_TOOLS:$POST_TOOLS"; exit 44
    fi
  fi
fi

SOURCE="$SOURCE" MAIN_SHA="$MAIN_SHA" OWNER="$OWNER" BACKUP="$BACKUP" RECEIPT="$RECEIPT" TARGET_ROOT="$TARGET_ROOT" PRE_PID="$PRE_PID" POST_PID="$POST_PID" PRE_TOOLS="$PRE_TOOLS" POST_TOOLS="$POST_TOOLS" MCP_NEEDS_BUILD="$MCP_NEEDS_BUILD" python3 - <<'PY'
import json, os
payload = {
  "schema": "centraldark.main-pinned-runtime-fast-path.receipt.v2",
  "source_sha": os.environ["SOURCE"], "main_sha": os.environ["MAIN_SHA"],
  "owner": os.environ["OWNER"], "target_root": os.environ["TARGET_ROOT"],
  "backup": os.environ["BACKUP"], "pid_before": os.environ["PRE_PID"] or None,
  "pid_after": os.environ["POST_PID"] or None, "tool_count_before": os.environ["PRE_TOOLS"] or None,
  "tool_count_after": os.environ["POST_TOOLS"] or None,
  "build_vps": os.environ.get("MCP_NEEDS_BUILD") == "1",
  "result": "PASS", "secrets_exposed": False,
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
