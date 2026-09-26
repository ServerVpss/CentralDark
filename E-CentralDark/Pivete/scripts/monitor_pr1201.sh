#!/usr/bin/env bash
set -e
max_attempts=${1:-120}
for i in $(seq 1 "$max_attempts"); do
  info=$(gh pr view 1201 --json state,merged,headRefOid --jq '{state,merged,headRefOid}' 2>/dev/null || true)
  echo "[$(date)] attempt $i/$max_attempts: $info"
  if echo "$info" | jq -e 'select(.state == "closed" or .state == "merged")' >/dev/null 2>&1; then
    echo "PR 1201 reached final state: $info"
    exit 0
  fi
  sleep 30
done
echo "Timed out after $max_attempts attempts"
exit 1
