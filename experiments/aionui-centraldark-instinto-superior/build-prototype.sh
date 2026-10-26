#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${1:-/tmp/aionui-v2.2.2}"
TARGET="${2:-linux}"
EXPECTED_HEAD="6744099b279b991c17e31c243f0920477bd31cb6"

if [[ ! -d "$SOURCE/.git" ]]; then
  git clone --depth 1 --branch v2.2.2 https://github.com/iOfficeAI/AionUi.git "$SOURCE"
fi

actual="$(git -C "$SOURCE" rev-parse HEAD)"
[[ "$actual" == "$EXPECTED_HEAD" ]] || {
  echo "AIONUI_HEAD_MISMATCH expected=$EXPECTED_HEAD actual=$actual"
  exit 20
}

# Safety: never reset, clean, or overwrite an occupied checkout. The caller
# must supply a fresh disposable staging directory on the approved F: storage.
# If it exists and has data, we preserve it and stop instead of destroying work.
if [[ -n "$(git -C "$SOURCE" status --porcelain --untracked-files=normal)" ]]; then
  echo "BLOCKED AIONUI_STAGE_DIR_NOT_CLEAN source=$SOURCE"
  exit 23
fi
if [[ "$TARGET" == "win" && "${CENTRALDARK_KF_STORAGE_VERIFIED:-}" != "true" ]]; then
  echo "BLOCKED AIONUI_WINDOWS_STORAGE_UNVERIFIED: prove K: workspace and F: caches first"
  exit 24
fi

python3 "$HERE/apply-overlay.py" "$SOURCE"

if [[ -n "${CENTRALDARK_SEED_DIR:-}" ]]; then
  test -f "$CENTRALDARK_SEED_DIR/apps/modulos/HERMES-CORE/core/orchestrator.mjs"
  rm -rf "$SOURCE/resources/centraldark-seed"
  mkdir -p "$SOURCE/resources/centraldark-seed"
  cp -a "$CENTRALDARK_SEED_DIR" "$SOURCE/resources/centraldark-seed/CentralDark"
  echo "CENTRALDARK_SEED=FULL"
else
  echo "CENTRALDARK_SEED=THIN_RUNTIME_BINDING"
fi

cd "$SOURCE"

if ! command -v bun >/dev/null 2>&1; then
  echo "BLOCKED bun_missing"
  exit 21
fi

bun install --frozen-lockfile

case "$TARGET" in
  linux) bun run dist:linux ;;
  win) bun run dist:win ;;
  mac) bun run dist:mac ;;
  dev) bun run dev ;;
  *) echo "unsupported target=$TARGET"; exit 22 ;;
esac

echo "BUILD_TARGET=$TARGET"
echo "AIONUI_BASE=$EXPECTED_HEAD"
echo "CENTRALDARK_OVERLAY=PASS"
