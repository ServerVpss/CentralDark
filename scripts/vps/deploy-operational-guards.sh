#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${TARGET_SHA:?TARGET_SHA ausente}"
: "${REPO_DIR:=/root/CentralDark}"
: "${RUNNER_TEMP:=/tmp}"
: "${GITHUB_OUTPUT:=/dev/null}"
: "${BACKUP_ROOT:=/root/CentralDark-Recovery/operational-guards}"

MAP_DIR="$REPO_DIR/apps/modulos/mapeamento"
VERIFIER_DIR="$REPO_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador"
PM2_APP="CentralDark-HermesVerificador"
GLOBAL_GATE_RECEIPT_DIR="${GLOBAL_GATE_RECEIPT_DIR:-/tmp/centraldark-global-contract}"
# CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED
POLICY_PATH=".agents/skills/centraldark-esteira-motor/SKILL.md"
SOURCE_DEPLOY_PATH="scripts/vps/centraldark-deploy.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DISPATCHER="$SCRIPT_DIR/deploy-guards-dispatcher.sh"

[[ "$TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "TARGET_SHA_INVALID"; exit 61; }
[[ -d "$REPO_DIR/.git" ]] || { echo "REPO_DIR_INVALID"; exit 62; }
[[ "$BACKUP_ROOT" == /* ]] || { echo "BACKUP_ROOT_NOT_ABSOLUTE"; exit 80; }
[[ ! -L "$BACKUP_ROOT" ]] || { echo "BACKUP_ROOT_SYMLINK_BLOCKED"; exit 81; }
REPO_REAL="$(realpath -e "$REPO_DIR")"
BACKUP_ROOT_REAL="$(realpath -m "$BACKUP_ROOT")"
[[ "$BACKUP_ROOT_REAL" == "$BACKUP_ROOT" ]] || { echo "BACKUP_ROOT_NOT_CANONICAL"; exit 87; }
case "$BACKUP_ROOT_REAL" in
  "$REPO_REAL"|"$REPO_REAL"/*) echo "BACKUP_ROOT_INSIDE_REPOSITORY"; exit 82 ;;
esac
[[ -x "$DISPATCHER" ]] || { echo "CANONICAL_DEPLOY_GATE_UNAVAILABLE"; exit 90; }
TARGET_SHA="$TARGET_SHA" REPO_DIR="$REPO_DIR" BRANCH=main bash "$DISPATCHER" --gate-only || {
  echo "CANONICAL_TLC23_DEPLOY_GATE=BLOCK"
  exit 91
}
echo "CANONICAL_TLC23_DEPLOY_GATE=PASS"

mkdir -p -- "$BACKUP_ROOT_REAL"
chmod 700 -- "$BACKUP_ROOT_REAL"
[[ ! -L "$BACKUP_ROOT" ]] || { echo "BACKUP_ROOT_SYMLINK_BLOCKED"; exit 81; }
[[ "$(stat -c '%d' "$REPO_REAL")" == "$(stat -c '%d' "$BACKUP_ROOT_REAL")" ]] || {
  echo "BACKUP_ROOT_CROSS_DEVICE"
  exit 86
}

exec 8>/tmp/centraldark-operational-guards-deploy.lock
flock -w 90 8 || { echo "GUARDS_DEPLOY_LOCK_TIMEOUT"; exit 63; }

cd "$REPO_DIR"
ORIGIN_URL="$(git remote get-url origin)"
[[ "$ORIGIN_URL" =~ github\.com[:/]ServerVpss/CentralDark(\.git)?$ ]] || { echo "ORIGIN_REPOSITORY_MISMATCH"; exit 64; }
git fetch --prune origin main
ORIGIN_SHA="$(git rev-parse origin/main)"
git merge-base --is-ancestor "$TARGET_SHA" "$ORIGIN_SHA" || { echo "EVENT_SHA_NOT_IN_MAIN"; exit 65; }

# Micro-deploy de fonte/policy. Usa o script do SHA do evento, não uma cópia
# potencialmente velha da VPS. Não reinicia runtime: apenas sincroniza a fonte
# canônica e prova HEAD/dirty/proof-guards.
SOURCE_SYNC_REQUIRED=0
if [[ "${GITHUB_EVENT_NAME:-}" == "workflow_dispatch" ]]; then
  SOURCE_SYNC_REQUIRED=1
elif [[ "${GITHUB_EVENT_NAME:-}" == "push" && "${BEFORE_SHA:-}" =~ ^[0-9a-f]{40}$ && ! "${BEFORE_SHA}" =~ ^0{40}$ ]]; then
  if git cat-file -e "$BEFORE_SHA^{commit}" 2>/dev/null && ! git diff --quiet "$BEFORE_SHA" "$TARGET_SHA" -- \
    "$POLICY_PATH" \
    "$SOURCE_DEPLOY_PATH" \
    scripts/vps/deploy-operational-guards.sh \
    .github/workflows/vps-exec-selfhosted.yml; then
    SOURCE_SYNC_REQUIRED=1
  fi
fi

if [[ "$SOURCE_SYNC_REQUIRED" -eq 1 ]]; then
  REPO_DIR="$REPO_DIR" BRANCH=main bash "$DISPATCHER" --apply --source-only
  echo "source_synced=true" >> "$GITHUB_OUTPUT"
  echo "MICRO_DEPLOY_SOURCE_SYNC=PROVED"
else
  echo "source_synced=false" >> "$GITHUB_OUTPUT"
  echo "MICRO_DEPLOY_SOURCE_SYNC=NOT_REQUIRED"
fi

git fetch --prune origin main
ORIGIN_SHA="$(git rev-parse origin/main)"
git merge-base --is-ancestor "$TARGET_SHA" "$ORIGIN_SHA" || { echo "EVENT_SHA_LEFT_MAIN"; exit 89; }
git diff --quiet "$TARGET_SHA" "$ORIGIN_SHA" -- \
  apps/modulos/mapeamento \
  apps/modulos/HERMES-CORE/agents/Log-Verificador \
  scripts/vps/deploy-operational-guards.sh \
  .github/workflows/vps-exec-selfhosted.yml || { echo "GUARDS_SCOPE_ADVANCED_AFTER_EVENT"; exit 66; }

if [[ "${GITHUB_EVENT_NAME:-}" == "push" && "${BEFORE_SHA:-}" =~ ^[0-9a-f]{40}$ && ! "${BEFORE_SHA}" =~ ^0{40}$ ]]; then
  if git cat-file -e "$BEFORE_SHA^{commit}" 2>/dev/null && git diff --quiet "$BEFORE_SHA" "$TARGET_SHA" -- \
    apps/modulos/mapeamento \
    apps/modulos/HERMES-CORE/agents/Log-Verificador \
    scripts/vps/deploy-operational-guards.sh \
    .github/workflows/vps-exec-selfhosted.yml; then
    echo "GUARDS_SCOPE_UNCHANGED"
    echo "deployed=false" >> "$GITHUB_OUTPUT"
    exit 0
  fi
fi

BUILD_DIR="$(mktemp -d "$RUNNER_TEMP/centraldark-guards-build.XXXXXX")"
MAP_STAGE=""
MAP_BACKUP=""
VERIFIER_STAGE=""
VERIFIER_BACKUP=""
RELEASE_BACKUP_DIR=""
map_promoted=0
verifier_promoted=0
restart_attempted=0

cleanup() {
  rc=$?
  trap - EXIT ERR
  set +e
  if [[ "$rc" -ne 0 && "$verifier_promoted" == "1" && -d "$VERIFIER_BACKUP" ]]; then
    failed="$RELEASE_BACKUP_DIR/failed/Log-Verificador"
    rollback_ok=false
    mkdir -p -- "$(dirname "$failed")"
    if [[ ! -e "$failed" ]] && \
      mv -- "$VERIFIER_DIR" "$failed" && \
      mv -- "$VERIFIER_BACKUP" "$VERIFIER_DIR" && \
      pm2 restart "$PM2_APP" >/dev/null; then
      for _ in $(seq 1 20); do
        if pm2 jlist | jq -e --arg app "$PM2_APP" \
          'any(.[]; .name == $app and .pm2_env.status == "online" and (.pid | tonumber) > 0)' >/dev/null; then
          rollback_ok=true
          break
        fi
        sleep 1
      done
    fi
    if [[ "$rollback_ok" == "true" ]]; then echo "VERIFIER_ROLLBACK_OK"; else echo "VERIFIER_ROLLBACK_FAILED"; fi
  fi
  if [[ "$rc" -ne 0 && "$map_promoted" == "1" && -d "$MAP_BACKUP" ]]; then
    failed="$RELEASE_BACKUP_DIR/failed/mapeamento"
    map_rollback_ok=false
    mkdir -p -- "$(dirname "$failed")"
    if [[ ! -e "$failed" ]] && \
      mv -- "$MAP_DIR" "$failed" && \
      mv -- "$MAP_BACKUP" "$MAP_DIR" && \
      node "$MAP_DIR/core/validar-mapa.mjs" --repo-root "$REPO_DIR" >/dev/null; then
      map_rollback_ok=true
    fi
    if [[ "$map_rollback_ok" == "true" ]]; then echo "MAP_ROLLBACK_OK"; else echo "MAP_ROLLBACK_FAILED"; fi
  fi
  git -C "$REPO_DIR" worktree remove --force "$BUILD_DIR" >/dev/null 2>&1 || true
  [[ "$rc" -eq 0 ]] || echo "GUARDS_DEPLOY_BLOCKED"
  exit "$rc"
}
trap cleanup EXIT ERR

rmdir "$BUILD_DIR"
git worktree add --detach "$BUILD_DIR" "$TARGET_SHA" >/dev/null

node --test "$BUILD_DIR/apps/modulos/mapeamento/tests/validar-mapa.test.mjs"
node --test "$BUILD_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador/provider-health.test.mjs"
node --check "$BUILD_DIR/apps/modulos/mapeamento/core/validar-mapa.mjs"
node --check "$BUILD_DIR/apps/modulos/mapeamento/core/scanner.mjs"
node --check "$BUILD_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador/agent.mjs"
node --check "$BUILD_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador/daemon.mjs"

PM2_JSON="$(pm2 jlist | jq -c --arg app "$PM2_APP" '.[] | select(.name == $app)' | head -n1)"
[[ -n "$PM2_JSON" ]] || { echo "VERIFIER_PM2_APP_NOT_FOUND"; exit 67; }
[[ "$(jq -r '.pm2_env.pm_exec_path // ""' <<<"$PM2_JSON")" == "$VERIFIER_DIR/daemon.mjs" ]] || {
  echo "VERIFIER_PM2_EXEC_MISMATCH"
  exit 68
}
[[ "$(jq -r '.pm2_env.status // ""' <<<"$PM2_JSON")" == "online" ]] || { echo "VERIFIER_NOT_ONLINE_BEFORE_DEPLOY"; exit 69; }

MAP_PARENT="$(dirname "$MAP_DIR")"
VERIFIER_PARENT="$(dirname "$VERIFIER_DIR")"

migrate_legacy_backups() {
  local parent="$1"
  local prefix="$2"
  local pattern="$3"
  local group="$4"
  local candidate base destination
  mkdir -p -- "$BACKUP_ROOT_REAL/legacy-layout/$group"
  for candidate in "$parent"/"$prefix"*; do
    [[ -e "$candidate" ]] || continue
    base="${candidate##*/}"
    [[ "$base" =~ $pattern ]] || { echo "LEGACY_BACKUP_NAME_INVALID $group"; exit 83; }
    [[ -d "$candidate" && ! -L "$candidate" ]] || { echo "LEGACY_BACKUP_TYPE_INVALID $group"; exit 84; }
    destination="$BACKUP_ROOT_REAL/legacy-layout/$group/$base"
    [[ ! -e "$destination" ]] || { echo "LEGACY_BACKUP_COLLISION $group"; exit 85; }
    mv -- "$candidate" "$destination"
    echo "LEGACY_BACKUP_MIGRATED $group/$base"
  done
}

migrate_legacy_backups \
  "$MAP_PARENT" ".mapeamento-backup." \
  '^\.mapeamento-backup\.[0-9a-f]{12}\.[0-9]+$' \
  "mapeamento"
migrate_legacy_backups \
  "$VERIFIER_PARENT" ".Log-Verificador-backup." \
  '^\.Log-Verificador-backup\.[0-9a-f]{12}\.[0-9]+$' \
  "Log-Verificador"

MAP_STAGE="$(mktemp -d "$MAP_PARENT/.mapeamento-release.${TARGET_SHA:0:12}.XXXXXX")"
VERIFIER_STAGE="$(mktemp -d "$VERIFIER_PARENT/.Log-Verificador-release.${TARGET_SHA:0:12}.XXXXXX")"
cp -a -- "$MAP_DIR/." "$MAP_STAGE/"
cp -a -- "$VERIFIER_DIR/." "$VERIFIER_STAGE/"

map_files=(
  README.md
  config/mapa-canonico.json
  core/scanner.mjs
  core/validar-mapa.mjs
  tests/validar-mapa.test.mjs
)
verifier_files=(
  README.md
  agent.mjs
  daemon.mjs
  provider-health.mjs
  provider-health.test.mjs
)

for rel in "${map_files[@]}"; do
  src="$BUILD_DIR/apps/modulos/mapeamento/$rel"
  dst="$MAP_STAGE/$rel"
  [[ -f "$src" ]] || { echo "MAP_RELEASE_FILE_MISSING $rel"; exit 70; }
  mkdir -p "$(dirname "$dst")"
  cp -a -- "$src" "$dst"
  cmp -s "$src" "$dst" || { echo "MAP_STAGE_MISMATCH $rel"; exit 71; }
done

for rel in "${verifier_files[@]}"; do
  src="$BUILD_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador/$rel"
  dst="$VERIFIER_STAGE/$rel"
  [[ -f "$src" ]] || { echo "VERIFIER_RELEASE_FILE_MISSING $rel"; exit 72; }
  cp -a -- "$src" "$dst"
  cmp -s "$src" "$dst" || { echo "VERIFIER_STAGE_MISMATCH $rel"; exit 73; }
done

RELEASE_BACKUP_DIR="$BACKUP_ROOT_REAL/releases/${TARGET_SHA:0:12}.${BASHPID}"
GLOBAL_CONTRACT_GATE="$BUILD_DIR/scripts/agent-call.mjs"
mkdir -p "$GLOBAL_GATE_RECEIPT_DIR"; chmod 700 "$GLOBAL_GATE_RECEIPT_DIR"
GLOBAL_TRACE="$(printf '%s' "$TARGET_SHA|$ORIGIN_SHA|$RELEASE_BACKUP_DIR|ENTRY" | sha256sum | awk '{print $1}' | cut -c1-24)"
GLOBAL_ENTRY_JSON="$(mktemp "$GLOBAL_GATE_RECEIPT_DIR/guards-entry.XXXXXX.json")"
GLOBAL_ENTRY_RECEIPT="$GLOBAL_GATE_RECEIPT_DIR/guards-entry-$GLOBAL_TRACE.receipt.json"
VPS_T0_HEAD="$(git rev-parse HEAD)"
cat >"$GLOBAL_ENTRY_JSON" <<JSON
{
  "scope_id":"canon/centraldark-universal-contract-20260919",
  "contract_schema":6,
  "phase":"ENTRY",
  "observed_head":"$TARGET_SHA",
  "trace_id":"$GLOBAL_TRACE",
  "github_t0":{"status":"PASS","head_sha":"$ORIGIN_SHA"},
  "vps_t0":{"status":"PASS","head_sha":"$VPS_T0_HEAD"},
  "cross_surface_drift_classified":true,
  "owner_proof":{"status":"PASS","owner":"scripts/vps/deploy-operational-guards.sh"},
  "writer_scope_proof":{"status":"PASS","scope":"mapeamento+Log-Verificador"},
  "preflight":{"status":"PASS","evidence_ref":"BUILD_DIR_TESTS_AND_SYNTAX"},
  "counterproof_plan":{"status":"READY","evidence_ref":"PID_CHANGE+STABILITY+FINAL_MAIN_SCOPE"},
  "rollback":{"status":"PREPARED","evidence_ref":"dir:$RELEASE_BACKUP_DIR"},
  "next_cursor":"PROMOTE_SCOPED_FILES_RESTART_OWNER_THEN_T1",
  "fixed_point":false
}
JSON
node "$GLOBAL_CONTRACT_GATE" --global-contract-gate ENTRY "$GLOBAL_ENTRY_JSON" | tee "$GLOBAL_ENTRY_RECEIPT"
rm -f "$GLOBAL_ENTRY_JSON"
echo "GLOBAL_ENTRY_GATE=PASS receipt=$GLOBAL_ENTRY_RECEIPT"
MAP_BACKUP="$RELEASE_BACKUP_DIR/mapeamento"
VERIFIER_BACKUP="$RELEASE_BACKUP_DIR/Log-Verificador"
[[ ! -e "$RELEASE_BACKUP_DIR" ]] || { echo "GUARDS_BACKUP_COLLISION"; exit 74; }
mkdir -p -- "$RELEASE_BACKUP_DIR"

mv -- "$MAP_DIR" "$MAP_BACKUP"
map_promoted=1
mv -- "$MAP_STAGE" "$MAP_DIR"
MAP_STAGE=""

mv -- "$VERIFIER_DIR" "$VERIFIER_BACKUP"
verifier_promoted=1
mv -- "$VERIFIER_STAGE" "$VERIFIER_DIR"
VERIFIER_STAGE=""

node "$MAP_DIR/core/validar-mapa.mjs" --repo-root "$REPO_DIR"

OLD_PID="$(pm2 pid "$PM2_APP" | tail -n1)"
restart_attempted=1
pm2 restart "$PM2_APP" >/dev/null

NEW_PID=""
for _ in $(seq 1 30); do
  NEW_PID="$(pm2 pid "$PM2_APP" | tail -n1)"
  if [[ "$NEW_PID" =~ ^[0-9]+$ && "$NEW_PID" -gt 0 && "$NEW_PID" != "$OLD_PID" ]] && \
    pm2 jlist | jq -e --arg app "$PM2_APP" --argjson pid "$NEW_PID" \
      'any(.[]; .name == $app and .pm2_env.status == "online" and .pid == $pid)' >/dev/null; then
    break
  fi
  sleep 1
done
[[ "$NEW_PID" =~ ^[0-9]+$ && "$NEW_PID" -gt 0 && "$NEW_PID" != "$OLD_PID" ]] || { echo "VERIFIER_PID_NOT_REPLACED"; exit 75; }

for _ in $(seq 1 5); do
  sleep 4
  [[ "$(pm2 pid "$PM2_APP" | tail -n1)" == "$NEW_PID" ]] || { echo "VERIFIER_PID_CHANGED_DURING_STABILITY"; exit 76; }
  pm2 jlist | jq -e --arg app "$PM2_APP" --argjson pid "$NEW_PID" \
    'any(.[]; .name == $app and .pm2_env.status == "online" and .pid == $pid)' >/dev/null || {
      echo "VERIFIER_PM2_UNSTABLE"
      exit 77
    }
done

git fetch --prune origin main
FINAL_MAIN_SHA="$(git rev-parse origin/main)"
git merge-base --is-ancestor "$TARGET_SHA" "$FINAL_MAIN_SHA" || { echo "VALIDATED_SHA_LEFT_MAIN"; exit 78; }
git diff --quiet "$TARGET_SHA" "$FINAL_MAIN_SHA" -- \
  apps/modulos/mapeamento \
  apps/modulos/HERMES-CORE/agents/Log-Verificador || { echo "GUARDS_ADVANCED_DURING_DEPLOY"; exit 79; }

GLOBAL_EXIT_TRACE="$(printf '%s' "$TARGET_SHA|$FINAL_MAIN_SHA|$NEW_PID|EXIT" | sha256sum | awk '{print $1}' | cut -c1-24)"
GLOBAL_HUD_HASH="$(printf '%s' "$TARGET_SHA|$FINAL_MAIN_SHA|$NEW_PID|PASS" | sha256sum | awk '{print $1}')"
GLOBAL_EXIT_JSON="$(mktemp "$GLOBAL_GATE_RECEIPT_DIR/guards-exit.XXXXXX.json")"
GLOBAL_EXIT_RECEIPT="$GLOBAL_GATE_RECEIPT_DIR/guards-exit-$GLOBAL_EXIT_TRACE.receipt.json"
cat >"$GLOBAL_EXIT_JSON" <<JSON
{
  "scope_id":"canon/centraldark-universal-contract-20260919",
  "contract_schema":6,
  "phase":"EXIT",
  "observed_head":"$TARGET_SHA",
  "trace_id":"$GLOBAL_EXIT_TRACE",
  "github_t1":{"status":"PASS","head_sha":"$FINAL_MAIN_SHA"},
  "vps_t1":{"status":"PASS","head_sha":"$(git rev-parse HEAD)"},
  "counterproof":{"status":"PASS","evidence_ref":"PID_CHANGED+STABILITY+SCOPE_NOT_ADVANCED"},
  "receipt_ref":"file:$GLOBAL_ENTRY_RECEIPT",
  "hud":{"status":"PASS","state_hash":"$GLOBAL_HUD_HASH"},
  "runtime_mutated":true,
  "runtime_proof":{"status":"PASS","evidence_ref":"pm2:$PM2_APP:$NEW_PID"},
  "promotion_requested":false,
  "fixed_point":false,
  "next_cursor":"REGISTER_DEPLOY_RECEIPT_AND_CONTINUE_MASTER_CYCLE"
}
JSON
node "$GLOBAL_CONTRACT_GATE" --global-contract-gate EXIT "$GLOBAL_EXIT_JSON" | tee "$GLOBAL_EXIT_RECEIPT"
rm -f "$GLOBAL_EXIT_JSON"
echo "GLOBAL_EXIT_GATE=PASS receipt=$GLOBAL_EXIT_RECEIPT"

map_promoted=0
verifier_promoted=0
restart_attempted=0
echo "deployed=true" >> "$GITHUB_OUTPUT"
echo "DEPLOYED_OPERATIONAL_GUARDS"
echo "validated_sha=$TARGET_SHA"
echo "map_source=apps/modulos/mapeamento/config/mapa-canonico.json"
echo "pm2_app=$PM2_APP"
echo "pm2_pid=$NEW_PID"
echo "map_backup=$MAP_BACKUP"
echo "verifier_backup=$VERIFIER_BACKUP"