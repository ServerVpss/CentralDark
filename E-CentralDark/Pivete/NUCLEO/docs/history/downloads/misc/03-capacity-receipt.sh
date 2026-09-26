#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-capacity-receipt.txt}"
{
  date -u +"TIME_UTC=%Y-%m-%dT%H:%M:%SZ"
  echo "CPU_COUNT=$(nproc 2>/dev/null || echo UNKNOWN)"
  free -b 2>/dev/null || true
  df -B1
  docker system df 2>/dev/null || true
  ps -eo pid,comm,rss,%cpu --sort=-rss | head -30
} | tee "$OUT"
echo "CAPACITY_RECEIPT=$OUT"
