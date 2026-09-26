#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="${REPO_ROOT:-/root/CentralDark}"
HERMES_HOME="${HERMES_HOME:-/root/.hermes}"
SOURCE="$REPO_ROOT/.agents/skills/skill-workshop"
DEST_ROOT="$HERMES_HOME/skills"
DEST="$DEST_ROOT/skill-workshop"
BACKUP_ROOT="$HERMES_HOME/backups/skill-workshop"

[[ -f "$SOURCE/SKILL.md" ]] || { echo "SOURCE_MISSING=$SOURCE"; exit 10; }
mkdir -p "$DEST_ROOT"

if [[ -L "$DEST" ]]; then
  [[ "$(readlink -f "$DEST")" == "$(readlink -f "$SOURCE")" ]] || { echo "DRIFT_SYMLINK=$DEST"; exit 11; }
  echo "SKILL_WORKSHOP_BIND=PASS_NO_CHANGE"
  exit 0
fi

manifest() {
  local root="$1"
  (cd "$root" && find . -type f -not -path './.git/*' -print0 | sort -z | xargs -0 sha256sum)
}

if [[ -d "$DEST" ]]; then
  src_manifest="$(mktemp)"
  dst_manifest="$(mktemp)"
  trap 'rm -f "$src_manifest" "$dst_manifest"' EXIT
  manifest "$SOURCE" >"$src_manifest"
  manifest "$DEST" >"$dst_manifest"
  if ! cmp -s "$src_manifest" "$dst_manifest"; then
    echo "DRIFT_EXISTING_DEST=$DEST"
    echo "DRIFT_POLICY=NO_BLIND_OVERWRITE"
    diff -u "$src_manifest" "$dst_manifest" | sed -n '1,80p' || true
    exit 12
  fi
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$BACKUP_ROOT"
  backup="$BACKUP_ROOT/$stamp"
  mv "$DEST" "$backup"
  echo "IDENTICAL_COPY_BACKUP=$backup"
elif [[ -e "$DEST" ]]; then
  echo "DRIFT_NON_DIRECTORY_DEST=$DEST"
  exit 13
fi

ln -s "$SOURCE" "$DEST"
[[ -L "$DEST" ]] || { echo "BIND_NOT_SYMLINK"; exit 14; }
[[ "$(readlink -f "$DEST")" == "$(readlink -f "$SOURCE")" ]] || { echo "BIND_TARGET_MISMATCH"; exit 15; }
[[ -f "$DEST/SKILL.md" ]] || { echo "BIND_PROOF_FAILED"; exit 16; }

echo "SKILL_WORKSHOP_BIND=PASS"
echo "OWNER=$SOURCE"
echo "HERMES_BIND=$DEST"
echo "MODE=LOAD_REFERENCE"
echo "COPY_BRAIN=false"
