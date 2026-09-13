#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="${REPO_ROOT:-/root/CentralDark}"
HERMES_HOME="${HERMES_HOME:-/root/.hermes}"
SOURCE="$REPO_ROOT/.agents/skills/skill-workshop"
DEST_ROOT="$HERMES_HOME/skills"
DEST="$DEST_ROOT/skill-workshop"

[[ -f "$SOURCE/SKILL.md" ]] || { echo "SOURCE_MISSING=$SOURCE"; exit 10; }
mkdir -p "$DEST_ROOT"

if [[ -L "$DEST" ]]; then
  [[ "$(readlink -f "$DEST")" == "$(readlink -f "$SOURCE")" ]] || { echo "DRIFT_SYMLINK=$DEST"; exit 11; }
  echo "SKILL_WORKSHOP_BIND=PASS_NO_CHANGE"
  exit 0
fi
if [[ -e "$DEST" ]]; then
  echo "DRIFT_EXISTING_DEST=$DEST"
  exit 12
fi

ln -s "$SOURCE" "$DEST"
[[ -f "$DEST/SKILL.md" ]] || { echo "BIND_PROOF_FAILED"; exit 13; }

echo "SKILL_WORKSHOP_BIND=PASS"
echo "OWNER=$SOURCE"
echo "HERMES_BIND=$DEST"
echo "MODE=LOAD_REFERENCE"
echo "COPY_BRAIN=false"
