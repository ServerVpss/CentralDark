#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/inbox" "$TMP/state"

cat >"$TMP/bin/rclone" <<'FAKE'
#!/usr/bin/env bash
set -euo pipefail
case "${1:-}" in
  lsjson)
    printf '[{"Name":"DELTAUNIFICADOCENTRALDARK.md","Path":"DELTAUNIFICADOCENTRALDARK.md"}]\n'
    ;;
  cat)
    if [[ "${FAKE_SECRET:-0}" == "1" ]]; then
      printf 'password=%s\n' "$(printf 'A%.0s' {1..20})"
    else
      printf '%s\n' '# DELTA UNIFICADO' 'BOOT-FORJA-TOTAL' 'fixed point com provenance'
    fi
    ;;
  *)
    echo "fake rclone: comando inesperado: $1" >&2
    exit 90
    ;;
esac
FAKE
chmod +x "$TMP/bin/rclone"

export PATH="$TMP/bin:$PATH"
export CENTRALDARK_REPO_ROOT="$ROOT"
export CENTRALDARK_DRIVE_INGEST_INBOX_DIR="$TMP/inbox"
export CENTRALDARK_DRIVE_INGEST_STATE_DIR="$TMP/state"
export CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL=0
export CENTRALDARK_DRIVE_INGEST_REQUIRE=1

first="$($ROOT/scripts/drive-ingest-once.sh)"
grep -q '^DRIVE_INGEST_STATUS=INGESTED$' <<<"$first"
test "$(find "$TMP/inbox" -maxdepth 1 -type f -name '*.txt' | wc -l)" -eq 1
test "$(find "$TMP/inbox" -maxdepth 1 -type f -name '*.provenance.json' | wc -l)" -eq 1

second="$($ROOT/scripts/drive-ingest-once.sh)"
grep -q '^DRIVE_INGEST_STATUS=NO_CHANGE$' <<<"$second"
test "$(find "$TMP/inbox" -maxdepth 1 -type f -name '*.txt' | wc -l)" -eq 1

rm -f "$TMP/state/last.sha256"
export FAKE_SECRET=1
set +e
third="$($ROOT/scripts/drive-ingest-once.sh 2>&1)"
rc=$?
set -e
test "$rc" -eq 27
grep -q '^DRIVE_INGEST_STATUS=BLOCKED_SECRET$' <<<"$third"
test "$(find "$TMP/inbox" -maxdepth 1 -type f -name '*.txt' | wc -l)" -eq 1

echo "DRIVE_INGEST_SELF_TEST=PASS"
