# OUTRO - deploy-operational-guards.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\vps\deploy-operational-guards.sh
**SHA:** 9b9532952a156494
**Timestamp:** 2026-08-28T02:57:39.401724
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- local pattern="$3"

### Ouro Bruto (primeiros 5000 chars)
```
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
[[ -n "$PM2_JSON" ]] || { echo "VERIFIER_PM2_APP_NOT
```