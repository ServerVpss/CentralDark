#!/usr/bin/env bash
set -euo pipefail

SCRIPT_UNDER_TEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/auto-sync-main.sh"
FIXTURE="$(mktemp -d)"
trap 'rm -rf "$FIXTURE"' EXIT

ROOT="$FIXTURE/relocated-centraldark"
TARGET="$ROOT/CentralDark-Core/scripts/vps"
mkdir -p "$TARGET" "$ROOT"/{agent,gateway,tools,plugins,apps}
cp "$SCRIPT_UNDER_TEST" "$TARGET/auto-sync-main.sh"
chmod +x "$TARGET/auto-sync-main.sh"

git -C "$ROOT" init -q -b main
git -C "$ROOT" config user.email "test@centraldark.local"
git -C "$ROOT" config user.name "CentralDark test"
touch "$ROOT/.gitkeep"
git -C "$ROOT" add .gitkeep
git -C "$ROOT" commit -qm fixture

set +e
VPS_REPO_PATH="/stale/host/path" CENTRALDARK_REPO_ROOT="auto" \
  bash "$TARGET/auto-sync-main.sh" --manual >/dev/null 2>&1
set -e

[[ -f "$ROOT/logs/auto-sync.log" ]]
grep -q 'SOURCE_FETCH_FAILED\|CHECKOUT_SYNC_PASS\|fetch failed' "$ROOT/logs/auto-sync.log"
printf 'PASS auto-sync resolves relocated repository from script path\n'
