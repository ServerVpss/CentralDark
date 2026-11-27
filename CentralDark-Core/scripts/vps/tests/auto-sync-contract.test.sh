#!/usr/bin/env bash
set -euo pipefail

SCRIPT_UNDER_TEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/auto-sync-main.sh"
CONFIG_UNDER_TEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../apps/modulos/mcp/src" && pwd)/config.js"
FIXTURE="$(mktemp -d)"
trap 'rm -rf "$FIXTURE"' EXIT

fail() { echo "FAIL $*" >&2; exit 1; }
make_root() {
  local root="$1"
  mkdir -p "$root"/{agent,gateway,tools,plugins,apps}
  touch "$root"/{agent,gateway,tools,plugins,apps}/.keep
  mkdir -p "$root/CentralDark-Core"/{scripts/vps,apps/modulos/mcp/src}
  : > "$root/CentralDark-Core/CENTRALDARK_AI_BOOT.yaml"
  : > "$root/CentralDark-Core/LEIA-ME-IA.md"
  cp "$SCRIPT_UNDER_TEST" "$root/CentralDark-Core/scripts/vps/auto-sync-main.sh"
  cp "$CONFIG_UNDER_TEST" "$root/CentralDark-Core/apps/modulos/mcp/src/config.js"
  chmod +x "$root/CentralDark-Core/scripts/vps/auto-sync-main.sh"
}
probe_js() {
  local root="$1"; shift
  env "$@" node -e "import(process.argv[1]).then(m => process.stdout.write(m.config.vps.repoPath)).catch(e => { console.error(e.message); process.exit(2); })" "file://$root/CentralDark-Core/apps/modulos/mcp/src/config.js"
}
probe_bash() {
  local root="$1"; shift
  env "$@" bash "$root/CentralDark-Core/scripts/vps/auto-sync-main.sh" --print-resolved-root
}

ROOT="$FIXTURE/relocated-centraldark"
make_root "$ROOT"
git -C "$ROOT" init -q -b main
git -C "$ROOT" config user.email "test@centraldark.local"
git -C "$ROOT" config user.name "CentralDark test"
touch "$ROOT/.gitkeep"
printf 'logs/\n' > "$ROOT/.gitignore"
git -C "$ROOT" add .
git -C "$ROOT" commit -qm fixture

for mode in auto valid-root valid-core relative invalid; do
  case "$mode" in
    auto) envs=(CENTRALDARK_REPO_ROOT=auto VPS_REPO_PATH=auto) ;;
    valid-root) envs=(CENTRALDARK_REPO_ROOT="$ROOT" VPS_REPO_PATH=auto) ;;
    valid-core) envs=(CENTRALDARK_REPO_ROOT="$ROOT/CentralDark-Core" VPS_REPO_PATH=auto) ;;
    relative) envs=(CENTRALDARK_REPO_ROOT=. VPS_REPO_PATH=auto) ;;
    invalid) envs=(CENTRALDARK_REPO_ROOT=/stale/host/path VPS_REPO_PATH=auto) ;;
  esac
  bash_root="$(probe_bash "$ROOT" "${envs[@]}")"
  js_root="$(probe_js "$ROOT" "${envs[@]}")"
  [[ "$bash_root" == "$ROOT" ]] || fail "bash $mode resolved $bash_root"
  [[ "$js_root" == "$ROOT" ]] || fail "js $mode resolved $js_root"
done

BROKEN="$FIXTURE/broken"
mkdir -p "$BROKEN/CentralDark-Core/scripts/vps" "$BROKEN/CentralDark-Core/apps/modulos/mcp/src"
cp "$SCRIPT_UNDER_TEST" "$BROKEN/CentralDark-Core/scripts/vps/auto-sync-main.sh"
cp "$CONFIG_UNDER_TEST" "$BROKEN/CentralDark-Core/apps/modulos/mcp/src/config.js"
if env CENTRALDARK_REPO_ROOT=auto VPS_REPO_PATH=auto bash "$BROKEN/CentralDark-Core/scripts/vps/auto-sync-main.sh" --print-resolved-root >/dev/null 2>&1; then
  fail "bash accepted missing markers"
fi
if env CENTRALDARK_REPO_ROOT=auto VPS_REPO_PATH=auto node -e "import(process.argv[1])" "file://$BROKEN/CentralDark-Core/apps/modulos/mcp/src/config.js" >/dev/null 2>&1; then
  fail "js accepted missing markers"
fi

REMOTE="$FIXTURE/remote.git"
git init -q --bare "$REMOTE"
git --git-dir="$REMOTE" symbolic-ref HEAD refs/heads/main
git -C "$ROOT" remote add origin "$REMOTE"
git -C "$ROOT" push -q -u origin main
WRITER="$FIXTURE/writer"
git clone -q "$REMOTE" "$WRITER"
git -C "$WRITER" config user.email "test@centraldark.local"
git -C "$WRITER" config user.name "CentralDark test"
printf 'remote-v2\n' > "$WRITER/apps/revision.txt"
git -C "$WRITER" add apps/revision.txt
git -C "$WRITER" commit -qm remote-v2
git -C "$WRITER" push -q origin main
REMOTE_HEAD="$(git -C "$WRITER" rev-parse HEAD)"
printf 'preserve-me\n' > "$ROOT/runtime-local.txt"

bash "$ROOT/CentralDark-Core/scripts/vps/auto-sync-main.sh"
[[ "$(git -C "$ROOT" rev-parse HEAD)" == "$REMOTE_HEAD" ]] || fail "fast-forward did not reach remote commit"
[[ "$(cat "$ROOT/runtime-local.txt")" == "preserve-me" ]] || fail "untracked local file not restored"
[[ -z "$(git -C "$ROOT" status --porcelain --untracked-files=no)" ]] || fail "auto-sync changed tracked Git state"
git -C "$ROOT" check-ignore -q logs/.auto-sync.lock || fail "checkout lock is not ignored"

printf 'remote-v3\n' > "$WRITER/apps/revision.txt"
git -C "$WRITER" add apps/revision.txt
git -C "$WRITER" commit -qm remote-v3
git -C "$WRITER" push -q origin main
HEAD_BEFORE_LOCK="$(git -C "$ROOT" rev-parse HEAD)"
flock "$ROOT/logs/.auto-sync.lock" sleep 2 &
LOCK_HOLDER=$!
sleep 0.2
bash "$ROOT/CentralDark-Core/scripts/vps/auto-sync-main.sh"
[[ "$(git -C "$ROOT" rev-parse HEAD)" == "$HEAD_BEFORE_LOCK" ]] || fail "second runner bypassed checkout lock"
wait "$LOCK_HOLDER"
bash "$ROOT/CentralDark-Core/scripts/vps/auto-sync-main.sh"
[[ "$(git -C "$ROOT" rev-parse HEAD)" == "$(git -C "$WRITER" rev-parse HEAD)" ]] || fail "sync after lock release did not fast-forward"
[[ -z "$(git -C "$ROOT" status --porcelain --untracked-files=no)" ]] || fail "lock/log artifacts changed tracked Git state"
git -C "$ROOT" check-ignore -q logs/.auto-sync.lock || fail "checkout lock is not ignored after rerun"

FAKE_BIN="$FIXTURE/fake-bin"
FAKE_LOG="$FIXTURE/systemctl.log"
mkdir -p "$FAKE_BIN"
cat > "$FAKE_BIN/systemctl" <<'SH'
#!/usr/bin/env bash
case "$1" in
  show) printf 'ExecStart=%s\nWorkingDirectory=%s\n' "$FAKE_UNIT_EXEC" "$FAKE_UNIT_CWD" ;;
  restart) printf '%s\n' "$2" >> "$FAKE_SYSTEMCTL_LOG" ;;
  is-active) exit 0 ;;
  *) exit 64 ;;
esac
SH
chmod +x "$FAKE_BIN/systemctl"
printf 'restart-v4\n' > "$WRITER/CentralDark-Core/apps/modulos/mcp/restart-probe.txt"
git -C "$WRITER" add CentralDark-Core/apps/modulos/mcp/restart-probe.txt
git -C "$WRITER" commit -qm restart-v4
git -C "$WRITER" push -q origin main
PATH="$FAKE_BIN:$PATH" FAKE_UNIT_EXEC="$ROOT/CentralDark-Core/apps/modulos/mcp/dist/index.js" \
  FAKE_UNIT_CWD="$ROOT" FAKE_SYSTEMCTL_LOG="$FAKE_LOG" \
  bash "$ROOT/CentralDark-Core/scripts/vps/auto-sync-main.sh" --restart-service centraldark-native-mcp-http.service
[[ "$(cat "$FAKE_LOG")" == "centraldark-native-mcp-http.service" ]] || fail "authorized exact service was not restarted"

: > "$FAKE_LOG"
printf 'restart-v5\n' >> "$WRITER/CentralDark-Core/apps/modulos/mcp/restart-probe.txt"
git -C "$WRITER" add CentralDark-Core/apps/modulos/mcp/restart-probe.txt
git -C "$WRITER" commit -qm restart-v5
git -C "$WRITER" push -q origin main
set +e
PATH="$FAKE_BIN:$PATH" FAKE_UNIT_EXEC="/outside/checkout/index.js" FAKE_UNIT_CWD="/outside/checkout" FAKE_SYSTEMCTL_LOG="$FAKE_LOG" \
  bash "$ROOT/CentralDark-Core/scripts/vps/auto-sync-main.sh" --restart-service centraldark-native-mcp-http.service >/dev/null 2>&1
restart_rc=$?
set -e
[[ "$restart_rc" -ne 0 ]] || fail "out-of-checkout service unit was accepted"
[[ ! -s "$FAKE_LOG" ]] || fail "out-of-checkout service was restarted"

printf 'PASS resolver matrix, isolated remote fast-forward, preservation, mutual exclusion, scoped restart and clean Git\n'
