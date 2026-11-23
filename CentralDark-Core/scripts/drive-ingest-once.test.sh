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
    if [[ "${FAKE_FLAG:-0}" == "1" ]]; then
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

cat >"$TMP/bin/node" <<'FAKE'
#!/usr/bin/env bash
set -euo pipefail
printf 'fake inbox sentinel pass\n' >/dev/null
FAKE
chmod +x "$TMP/bin/rclone" "$TMP/bin/node"

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

# Contraprova do bug histórico: um probe com sentinel desligado NÃO pode impedir
# a mesma SHA de ser roteada quando o daemon ligar o sentinel depois.
export CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL=1
routed="$($ROOT/scripts/drive-ingest-once.sh)"
grep -q '^DRIVE_INGEST_STATUS=NO_CHANGE$' <<<"$routed"
grep -q '^DRIVE_INGEST_SENTINEL=PASS$' <<<"$routed"

routed_again="$($ROOT/scripts/drive-ingest-once.sh)"
grep -q '^DRIVE_INGEST_SENTINEL=NO_CHANGE$' <<<"$routed_again"

rm -f "$TMP/state/last-ingested.sha256" "$TMP/state/last-payload-name" "$TMP/state/last-routed.sha256"
export CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL=0
export FAKE_FLAG=1
set +e
blocked="$($ROOT/scripts/drive-ingest-once.sh 2>&1)"
rc=$?
set -e
test "$rc" -eq 27
grep -q '^DRIVE_INGEST_STATUS=BLOCKED_SECRET$' <<<"$blocked"
test "$(find "$TMP/inbox" -maxdepth 1 -type f -name '*.txt' | wc -l)" -eq 1

echo "DRIVE_INGEST_SELF_TEST=PASS"
