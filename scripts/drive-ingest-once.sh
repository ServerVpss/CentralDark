#!/usr/bin/env bash
set -uo pipefail

REPO_ROOT="${CENTRALDARK_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REMOTE_ROOT="${CENTRALDARK_DRIVE_REMOTE_ROOT:-gdrive:CentralDark}"
DELTA_PREFIX="${CENTRALDARK_DRIVE_DELTA_PREFIX:-DELTAUNIFICADOCENTRALDARK}"
INBOX_DIR="${CENTRALDARK_DRIVE_INGEST_INBOX_DIR:-$REPO_ROOT/scripts/memory-linker/inbox}"
STATE_DIR="${CENTRALDARK_DRIVE_INGEST_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/centraldark/drive-ingest}"
RUN_SENTINEL="${CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL:-1}"
REQUIRE_DELTA="${CENTRALDARK_DRIVE_INGEST_REQUIRE:-0}"

for bin in rclone jq sha256sum python3; do
  command -v "$bin" >/dev/null 2>&1 || {
    echo "DRIVE_INGEST_STATUS=MISSING_DEPENDENCY"
    echo "DRIVE_INGEST_DEPENDENCY=$bin"
    exit 20
  }
done

mkdir -p "$INBOX_DIR" "$STATE_DIR"
chmod 700 "$STATE_DIR" 2>/dev/null || true

remote_json="$(mktemp)"
payload_tmp="$(mktemp)"
cleanup() { rm -f "$remote_json" "$payload_tmp"; }
trap cleanup EXIT

if ! rclone lsjson "$REMOTE_ROOT" --max-depth 1 --files-only --drive-export-formats txt >"$remote_json"; then
  echo "DRIVE_INGEST_STATUS=REMOTE_LIST_FAILED"
  exit 21
fi

mapfile -t candidates < <(
  jq -r --arg prefix "$DELTA_PREFIX" '
    .[]
    | (.Path // .Name // "") as $p
    | select($p | startswith($prefix))
    | $p
  ' "$remote_json" | sort -u
)

if [[ ${#candidates[@]} -eq 0 ]]; then
  echo "DRIVE_INGEST_STATUS=NO_CANDIDATE"
  [[ "$REQUIRE_DELTA" == "1" ]] && exit 22
  exit 0
fi

selected=""
for preferred in "$DELTA_PREFIX.md" "$DELTA_PREFIX.md.txt" "$DELTA_PREFIX.txt" "$DELTA_PREFIX"; do
  for candidate in "${candidates[@]}"; do
    if [[ "$candidate" == "$preferred" ]]; then
      if [[ -n "$selected" && "$selected" != "$candidate" ]]; then
        echo "DRIVE_INGEST_STATUS=AMBIGUOUS_CANDIDATE"
        exit 23
      fi
      selected="$candidate"
    fi
  done
done

if [[ -z "$selected" ]]; then
  if [[ ${#candidates[@]} -eq 1 ]]; then
    selected="${candidates[0]}"
  else
    echo "DRIVE_INGEST_STATUS=AMBIGUOUS_CANDIDATE"
    echo "DRIVE_INGEST_CANDIDATE_COUNT=${#candidates[@]}"
    exit 23
  fi
fi

if ! rclone cat "$REMOTE_ROOT/$selected" --drive-export-formats txt >"$payload_tmp"; then
  echo "DRIVE_INGEST_STATUS=REMOTE_READ_FAILED"
  exit 24
fi

if [[ ! -s "$payload_tmp" ]]; then
  echo "DRIVE_INGEST_STATUS=EMPTY_REMOTE_DOCUMENT"
  exit 25
fi

secret_scan="$({ python3 - "$REPO_ROOT/scripts/lupa/pr_secret_scan.py" "$payload_tmp" <<'PY'
import importlib.util
import pathlib
import sys

scanner_path = pathlib.Path(sys.argv[1])
payload_path = pathlib.Path(sys.argv[2])
spec = importlib.util.spec_from_file_location("centraldark_pr_secret_scan", scanner_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
text = payload_path.read_text(encoding="utf-8", errors="replace")
print("true" if module.has_literal_secret(text) else "false")
PY
} 2>/dev/null)" || {
  echo "DRIVE_INGEST_STATUS=SECRET_SCAN_FAILED"
  exit 26
}

sha="$(sha256sum "$payload_tmp" | awk '{print $1}')"
observed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
last_hash_file="$STATE_DIR/last.sha256"

if [[ "$secret_scan" == "true" ]]; then
  jq -n \
    --arg observed_at "$observed_at" \
    --arg source "$REMOTE_ROOT/$selected" \
    --arg sha256 "$sha" \
    '{schema:"centraldark.drive-ingest-receipt.v1",status:"BLOCKED_SECRET",observed_at:$observed_at,source:$source,sha256:$sha256,content_persisted:false,canonical_mutation:false}' \
    >"$STATE_DIR/last-blocked.json"
  chmod 600 "$STATE_DIR/last-blocked.json" 2>/dev/null || true
  echo "DRIVE_INGEST_STATUS=BLOCKED_SECRET"
  echo "DRIVE_INGEST_SHA256=$sha"
  exit 27
fi

if [[ -f "$last_hash_file" ]] && [[ "$(tr -d '\r\n' <"$last_hash_file")" == "$sha" ]]; then
  echo "DRIVE_INGEST_STATUS=NO_CHANGE"
  echo "DRIVE_INGEST_SHA256=$sha"
  exit 0
fi

stamp="$(date -u +%Y-%m-%d)"
base="$stamp-drive-chefe-deltaunificadocentraldark-${sha:0:12}"
payload_dest="$INBOX_DIR/$base.txt"
receipt_dest="$INBOX_DIR/$base.provenance.json"

install -m 0600 "$payload_tmp" "$payload_dest"
jq -n \
  --arg observed_at "$observed_at" \
  --arg source "$REMOTE_ROOT/$selected" \
  --arg sha256 "$sha" \
  --arg payload "$(basename "$payload_dest")" \
  '{
    schema:"centraldark.drive-ingest-provenance.v1",
    source_kind:"GOOGLE_DRIVE",
    source:$source,
    observed_at:$observed_at,
    sha256:$sha256,
    payload:$payload,
    classification:"CANDIDATE",
    destination_owner:"scripts/memory-linker/inbox",
    raw_material_is_canonical:false,
    direct_canonical_mutation:false,
    dedupe_required:true,
    meta_lupa_required:true,
    counterproof_required:true,
    reality_judge_required:true,
    fixed_point_required:true
  }' >"$receipt_dest"
chmod 600 "$receipt_dest" 2>/dev/null || true

printf '%s\n' "$sha" >"$last_hash_file.tmp"
chmod 600 "$last_hash_file.tmp" 2>/dev/null || true
mv "$last_hash_file.tmp" "$last_hash_file"

if [[ "$RUN_SENTINEL" == "1" ]] && command -v node >/dev/null 2>&1 && [[ -f "$REPO_ROOT/scripts/memory-linker/inbox-sentinel.mjs" ]]; then
  if ! (cd "$REPO_ROOT" && node scripts/memory-linker/inbox-sentinel.mjs --kanban >/dev/null); then
    echo "DRIVE_INGEST_SENTINEL=FAILED"
  else
    echo "DRIVE_INGEST_SENTINEL=PASS"
  fi
fi

echo "DRIVE_INGEST_STATUS=INGESTED"
echo "DRIVE_INGEST_SHA256=$sha"
echo "DRIVE_INGEST_PAYLOAD=$(basename "$payload_dest")"
echo "DRIVE_INGEST_PROVENANCE=$(basename "$receipt_dest")"
