#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${TARGET_SHA:?TARGET_SHA ausente}"
: "${REPO_DIR:=/root/CentralDark}"
: "${RUNNER_TEMP:=/tmp}"
: "${GITHUB_OUTPUT:=/dev/null}"

MAP_DIR="$REPO_DIR/apps/modulos/mapeamento"
VERIFIER_DIR="$REPO_DIR/apps/modulos/HERMES-CORE/agents/Log-Verificador"
PM2_APP="CentralDark-HermesVerificador"

[[ "$TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "TARGET_SHA_INVALID"; exit 61; }
[[ -d "$REPO_DIR/.git" ]] || { echo "REPO_DIR_INVALID"; exit 62; }

exec 8>/tmp/centraldark-operational-guards-deploy.lock
flock -w 90 8 || { echo "GUARDS_DEPLOY_LOCK_TIMEOUT"; exit 63; }

cd "$REPO_DIR"
ORIGIN_URL="$(git remote get-url origin)"
[[ "$ORIGIN_URL" =~ github\.com[:/]ServerVpss/CentralDark(\.git)?$ ]] || { echo "ORIGIN_REPOSITORY_MISMATCH"; exit 64; }
git fetch --prune origin main
ORIGIN_SHA="$(git rev-parse origin/main)"
git merge-base --is-ancestor "$TARGET_SHA" "$ORIGIN_SHA" || { echo "EVENT_SHA_NOT_IN_MAIN"; exit 65; }
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
map_promoted=0
verifier_promoted=0
restart_attempted=0

cleanup() {
  rc=$?
  trap - EXIT ERR
  set +e
  if [[ "$rc" -ne 0 && "$verifier_promoted" == "1" && -d "$VERIFIER_BACKUP" ]]; then
    failed="$VERIFIER_DIR.failed.${TARGET_SHA:0:12}.${BASHPID}"
    rollback_ok=false
    [[ -e "$failed" ]] || mv -- "$VERIFIER_DIR" "$failed"
    mv -- "$VERIFIER_BACKUP" "$VERIFIER_DIR"
    if pm2 restart "$PM2_APP" >/dev/null; then
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
    failed="$MAP_DIR.failed.${TARGET_SHA:0:12}.${BASHPID}"
    [[ -e "$failed" ]] || mv -- "$MAP_DIR" "$failed"
    mv -- "$MAP_BACKUP" "$MAP_DIR"
    echo "MAP_ROLLBACK_OK"
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

MAP_BACKUP="$MAP_PARENT/.mapeamento-backup.${TARGET_SHA:0:12}.${BASHPID}"
VERIFIER_BACKUP="$VERIFIER_PARENT/.Log-Verificador-backup.${TARGET_SHA:0:12}.${BASHPID}"
[[ ! -e "$MAP_BACKUP" && ! -e "$VERIFIER_BACKUP" ]] || { echo "GUARDS_BACKUP_COLLISION"; exit 74; }

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
