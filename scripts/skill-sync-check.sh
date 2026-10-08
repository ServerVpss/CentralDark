#!/usr/bin/env bash
set -euo pipefail

MODE="check"
case "${1:-}" in
  --check|"") MODE="check" ;;
  --apply) MODE="apply" ;;
  --seal) MODE="seal" ;;
  *) echo "usage: $0 [--check|--apply|--seal]" >&2; exit 64 ;;
esac

ROOT="${CENTRALDARK_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
RUNTIME_ROOT="${CENTRALDARK_SKILL_RUNTIME_ROOT:-$HERMES_HOME/skills}"
STATE_DIR="${CENTRALDARK_SKILL_SYNC_STATE_DIR:-$HERMES_HOME/state}"
STATE_FILE="$STATE_DIR/centraldark-skill-sync.tsv"
LOCK_FILE="$STATE_DIR/centraldark-skill-sync.lock"
BACKUP_ROOT="$HERMES_HOME/backups/skill-sync"
REF="${CENTRALDARK_SKILL_SYNC_REF:-origin/main}"

mkdir -p "$STATE_DIR" "$RUNTIME_ROOT" "$BACKUP_ROOT"
touch "$LOCK_FILE"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "SKILL_SYNC=BLOCKED_WRITER_LOCK"
  exit 75
fi

cd "$ROOT"
if [[ "$REF" == "origin/main" ]]; then
  git fetch -q origin main
fi
MAIN_SHA="$(git rev-parse "$REF")"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$BACKUP_ROOT/$STAMP"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

declare -A PREV_HASH
if [[ -f "$STATE_FILE" ]]; then
  while IFS=$'\t' read -r p sha ch rh ts; do
    [[ -n "$p" ]] || continue
    PREV_HASH["$p"]="$ch"
  done < "$STATE_FILE"
fi

hash_file() {
  sha256sum "$1" | awk '{print $1}'
}

safe_install() {
  local src="$1" dst="$2" rel="$3"
  mkdir -p "$(dirname "$dst")"
  if [[ -f "$dst" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
    cp -a "$dst" "$BACKUP_DIR/$rel"
  fi
  local tmpdst
  tmpdst="$(mktemp "$(dirname "$dst")/.skill-sync.XXXXXX")"
  cp "$src" "$tmpdst"
  chmod --reference="$src" "$tmpdst" 2>/dev/null || chmod 0644 "$tmpdst"
  mv -f "$tmpdst" "$dst"
}

mapfile -t SKILL_PATHS < <(
  git ls-tree -r --name-only "$MAIN_SHA" .agents/skills     | grep '/SKILL\.md$'     | sort
)

AUTOSYNC=0
SYNCED=0
UPDATED=0
INSTALLED=0
ORACLE_REQUIRED=0
UNKNOWN=0
STATE_TMP="$TMP_DIR/state.tsv"
: > "$STATE_TMP"

for path in "${SKILL_PATHS[@]}"; do
  canon="$TMP_DIR/canonical"
  if ! git show "$MAIN_SHA:$path" > "$canon" 2>/dev/null; then
    continue
  fi
  if ! grep -Eq '^centraldark_autosync:[[:space:]]*true[[:space:]]*$' "$canon"; then
    continue
  fi

  AUTOSYNC=$((AUTOSYNC + 1))
  rel="${path#.agents/skills/}"
  runtime="$RUNTIME_ROOT/$rel"
  canon_hash="$(hash_file "$canon")"
  runtime_hash=""
  prev="${PREV_HASH[$path]:-}"

  if [[ ! -f "$runtime" ]]; then
    echo "MISSING_RUNTIME|$path|canonical=$canon_hash"
    if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
      safe_install "$canon" "$runtime" "$rel"
      runtime_hash="$(hash_file "$runtime")"
      INSTALLED=$((INSTALLED + 1))
      if [[ "$runtime_hash" != "$canon_hash" ]]; then
        echo "VERIFY_FAIL|$path|canonical=$canon_hash|runtime=$runtime_hash"
        exit 70
      fi
      printf '%s\t%s\t%s\t%s\t%s\n' "$path" "$MAIN_SHA" "$canon_hash" "$runtime_hash" "$STAMP" >> "$STATE_TMP"
      echo "INSTALLED|$path|hash=$runtime_hash"
    else
      UNKNOWN=$((UNKNOWN + 1))
    fi
    continue
  fi

  runtime_hash="$(hash_file "$runtime")"

  if [[ "$runtime_hash" == "$canon_hash" ]]; then
    SYNCED=$((SYNCED + 1))
    printf '%s\t%s\t%s\t%s\t%s\n' "$path" "$MAIN_SHA" "$canon_hash" "$runtime_hash" "$STAMP" >> "$STATE_TMP"
    echo "SYNCED|$path|hash=$runtime_hash"
    continue
  fi

  if [[ -n "$prev" && "$runtime_hash" == "$prev" ]]; then
    echo "SAFE_FAST_FORWARD|$path|from=$runtime_hash|to=$canon_hash"
    if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
      safe_install "$canon" "$runtime" "$rel"
      runtime_hash="$(hash_file "$runtime")"
      if [[ "$runtime_hash" != "$canon_hash" ]]; then
        echo "VERIFY_FAIL|$path|canonical=$canon_hash|runtime=$runtime_hash"
        exit 70
      fi
      UPDATED=$((UPDATED + 1))
      printf '%s\t%s\t%s\t%s\t%s\n' "$path" "$MAIN_SHA" "$canon_hash" "$runtime_hash" "$STAMP" >> "$STATE_TMP"
      echo "UPDATED|$path|hash=$runtime_hash"
    else
      UNKNOWN=$((UNKNOWN + 1))
    fi
    continue
  fi

  ORACLE_REQUIRED=$((ORACLE_REQUIRED + 1))
  echo "ORACLE_REQUIRED_RUNTIME_DRIFT|$path|canonical=$canon_hash|runtime=$runtime_hash|sealed_previous=${prev:-none}"
done

if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    while IFS=$'\t' read -r p sha ch rh ts; do
      [[ -n "$p" ]] || continue
      if ! grep -Fq "$p"$'\t' "$STATE_TMP"; then
        printf '%s\t%s\t%s\t%s\t%s\n' "$p" "$sha" "$ch" "$rh" "$ts" >> "$STATE_TMP"
      fi
    done < "$STATE_FILE"
  fi
  sort -u "$STATE_TMP" > "$STATE_FILE.tmp"
  mv -f "$STATE_FILE.tmp" "$STATE_FILE"
fi

echo "MAIN_SHA=$MAIN_SHA"
echo "AUTOSYNC_SKILLS=$AUTOSYNC"
echo "SYNCED=$SYNCED"
echo "INSTALLED=$INSTALLED"
echo "UPDATED=$UPDATED"
echo "ORACLE_REQUIRED=$ORACLE_REQUIRED"
echo "UNKNOWN=$UNKNOWN"

if [[ "$ORACLE_REQUIRED" -eq 0 && "$UNKNOWN" -eq 0 ]]; then
  echo "MAIN_RUNTIME_LOCK=PASS"
else
  echo "MAIN_RUNTIME_LOCK=PARTIAL"
fi

if [[ "$MODE" == "seal" && "$ORACLE_REQUIRED" -ne 0 ]]; then
  exit 20
fi
