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
HOME="${HOME:-$(getent passwd "$(id -u)" 2>/dev/null | cut -d: -f6)}"
HOME="${HOME:-/root}"
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
  while IFS=$'\t' read -r key sha ch th ts; do
    [[ -n "$key" ]] || continue
    PREV_HASH["$key"]="$ch"
  done < "$STATE_FILE"
fi

hash_file() {
  sha256sum "$1" | awk '{print $1}'
}

target_is_main_ancestor_content() {
  local path="$1" target="$2" target_blob c blob
  [[ -f "$target" ]] || return 1
  target_blob="$(git hash-object "$target")"
  while read -r c; do
    [[ -n "$c" ]] || continue
    blob="$(git rev-parse "$c:$path" 2>/dev/null || true)"
    [[ -n "$blob" ]] || continue
    if [[ "$blob" == "$target_blob" ]]; then
      return 0
    fi
  done < <(git log --format=%H "$MAIN_SHA" -- "$path")
  return 1
}

safe_install() {
  local src="$1" dst="$2" backup_rel="$3"
  mkdir -p "$(dirname "$dst")"
  if [[ -f "$dst" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$backup_rel")"
    cp -a "$dst" "$BACKUP_DIR/$backup_rel"
  fi
  local tmpdst
  tmpdst="$(mktemp "$(dirname "$dst")/.skill-sync.XXXXXX")"
  cp "$src" "$tmpdst"
  chmod --reference="$src" "$tmpdst" 2>/dev/null || chmod 0644 "$tmpdst"
  mv -f "$tmpdst" "$dst"
}

AUTOSYNC=0
SYNCED=0
UPDATED=0
INSTALLED=0
ORACLE_REQUIRED=0
UNKNOWN=0
STATE_TMP="$TMP_DIR/state.tsv"
: > "$STATE_TMP"

record_state() {
  local key="$1" canon_hash="$2" target_hash="$3"
  printf '%s\t%s\t%s\t%s\t%s\n' "$key" "$MAIN_SHA" "$canon_hash" "$target_hash" "$STAMP" >> "$STATE_TMP"
}

process_target() {
  local kind="$1" path="$2" canon="$3" target="$4" canon_hash="$5"
  local key target_hash prev
  key="$kind:$path"
  target_hash=""
  prev="${PREV_HASH[$key]:-}"

  if [[ ! -f "$target" ]]; then
    echo "MISSING_$kind|$path|canonical=$canon_hash"
    if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
      safe_install "$canon" "$target" "$kind/$path"
      target_hash="$(hash_file "$target")"
      if [[ "$target_hash" != "$canon_hash" ]]; then
        echo "VERIFY_FAIL|$key|canonical=$canon_hash|target=$target_hash"
        exit 70
      fi
      INSTALLED=$((INSTALLED + 1))
      record_state "$key" "$canon_hash" "$target_hash"
      echo "INSTALLED_$kind|$path|hash=$target_hash"
    else
      UNKNOWN=$((UNKNOWN + 1))
    fi
    return
  fi

  target_hash="$(hash_file "$target")"

  if [[ "$target_hash" == "$canon_hash" ]]; then
    SYNCED=$((SYNCED + 1))
    record_state "$key" "$canon_hash" "$target_hash"
    echo "SYNCED_$kind|$path|hash=$target_hash"
    return
  fi

  if [[ -n "$prev" && "$target_hash" == "$prev" ]]; then
    echo "SAFE_FAST_FORWARD_$kind|$path|from=$target_hash|to=$canon_hash|basis=sealed"
    if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
      safe_install "$canon" "$target" "$kind/$path"
      target_hash="$(hash_file "$target")"
      [[ "$target_hash" == "$canon_hash" ]] || { echo "VERIFY_FAIL|$key"; exit 70; }
      UPDATED=$((UPDATED + 1))
      record_state "$key" "$canon_hash" "$target_hash"
      echo "UPDATED_$kind|$path|hash=$target_hash"
    else
      UNKNOWN=$((UNKNOWN + 1))
    fi
    return
  fi

  if target_is_main_ancestor_content "$path" "$target"; then
    echo "SAFE_FAST_FORWARD_$kind|$path|from=$target_hash|to=$canon_hash|basis=main_ancestor"
    if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
      safe_install "$canon" "$target" "$kind/$path"
      target_hash="$(hash_file "$target")"
      [[ "$target_hash" == "$canon_hash" ]] || { echo "VERIFY_FAIL|$key"; exit 70; }
      UPDATED=$((UPDATED + 1))
      record_state "$key" "$canon_hash" "$target_hash"
      echo "UPDATED_$kind|$path|hash=$target_hash"
    else
      UNKNOWN=$((UNKNOWN + 1))
    fi
    return
  fi

  ORACLE_REQUIRED=$((ORACLE_REQUIRED + 1))
  echo "ORACLE_REQUIRED_${kind}_DRIFT|$path|canonical=$canon_hash|target=$target_hash|sealed_previous=${prev:-none}"
}

mapfile -t SKILL_PATHS < <(
  git ls-tree -r --name-only "$MAIN_SHA" .agents/skills     | grep '/SKILL\.md$'     | sort
)

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
  canon_hash="$(hash_file "$canon")"

  # The current project skill tree can shadow ~/.hermes/skills, so it is a real
  # runtime consumer and must be locked to the same canonical main content.
  process_target "PROJECT" "$path" "$canon" "$ROOT/$path" "$canon_hash"
  process_target "RUNTIME" "$path" "$canon" "$RUNTIME_ROOT/$rel" "$canon_hash"
done

if [[ "$MODE" == "apply" || "$MODE" == "seal" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    while IFS=$'\t' read -r key sha ch th ts; do
      [[ -n "$key" ]] || continue
      if ! grep -Fq "$key"$'\t' "$STATE_TMP"; then
        printf '%s\t%s\t%s\t%s\t%s\n' "$key" "$sha" "$ch" "$th" "$ts" >> "$STATE_TMP"
      fi
    done < "$STATE_FILE"
  fi
  sort -u "$STATE_TMP" > "$STATE_FILE.tmp"
  mv -f "$STATE_FILE.tmp" "$STATE_FILE"
fi

# Hermes native catalog is separate from the opt-in hash seal.
# Registration does NOT imply that a skill was loaded or executed.
report_native_catalog_binding() {
  local catalog_root="$ROOT/.agents/skills" config="$HERMES_HOME/config.yaml"
  if [[ ! -d "$catalog_root" || -L "$catalog_root" ]]; then
    echo "HERMES_NATIVE_CATALOG_BINDING=SOURCE_UNAVAILABLE"
    return
  fi
  if [[ ! -f "$config" || -L "$config" ]]; then
    echo "HERMES_NATIVE_CATALOG_BINDING=CONFIG_UNAVAILABLE"
    return
  fi
  if awk -v target="$catalog_root" '
    /^skills:[[:space:]]*$/ { in_skills=1; next }
    in_skills && /^[^[:space:]#]/ { in_skills=0; in_dirs=0 }
    in_skills && /^  external_dirs:[[:space:]]*$/ { in_dirs=1; next }
    in_dirs && /^  [A-Za-z_][A-Za-z_0-9]*:/ { in_dirs=0 }
    in_dirs && /^    -[[:space:]]+/ {
      path=$0
      sub(/^    -[[:space:]]+/, "", path)
      gsub(/"/, "", path)
      if (path == target) found=1
    }
    END { exit(found ? 0 : 1) }
  ' "$config"; then
    echo "HERMES_NATIVE_CATALOG_BINDING=CONFIGURED"
  else
    echo "HERMES_NATIVE_CATALOG_BINDING=NOT_CONFIGURED"
  fi
}

report_native_catalog_binding
echo "MAIN_SOURCE_SKILL_FILES=$(git ls-tree -r --name-only "$MAIN_SHA" .agents/skills | grep -c '/SKILL\.md
echo "AUTOSYNC_SKILLS=$AUTOSYNC"
echo "TARGETS=$((AUTOSYNC * 2))"
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
)"
echo "HERMES_NATIVE_CATALOG_LOADED=UNKNOWN"
echo "HERMES_NATIVE_CATALOG_EXECUTED=UNKNOWN"

echo "MAIN_SHA=$MAIN_SHA"
echo "AUTOSYNC_SKILLS=$AUTOSYNC"
echo "TARGETS=$((AUTOSYNC * 2))"
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
