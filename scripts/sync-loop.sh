#!/usr/bin/env bash
set -uo pipefail

REPO_ROOT="${CENTRALDARK_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
INTERVAL_SECONDS="${CENTRALDARK_DRIVE_SYNC_INTERVAL_SECONDS:-120}"
REMOTE_DOCS="${CENTRALDARK_DRIVE_DOCS_REMOTE:-gdrive:CentralDark/docs}"

while true; do
  if rclone sync "$REPO_ROOT/docs" "$REMOTE_DOCS" --transfers=1 --bwlimit=2M; then
    echo "DRIVE_DOCS_SYNC=PASS"
  else
    echo "DRIVE_DOCS_SYNC=FAIL"
  fi

  if [[ -x "$REPO_ROOT/scripts/drive-ingest-once.sh" ]]; then
    if "$REPO_ROOT/scripts/drive-ingest-once.sh"; then
      echo "DRIVE_DELTA_INGEST=PASS"
    else
      rc=$?
      echo "DRIVE_DELTA_INGEST=FAIL rc=$rc"
    fi
  else
    echo "DRIVE_DELTA_INGEST=SKIPPED_MISSING_SCRIPT"
  fi

  sleep "$INTERVAL_SECONDS"
done
