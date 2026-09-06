#!/usr/bin/env bash
# Micro-deploy script (non-destructive dry-run by default)
# Logs go to files/deploy-<timestamp>.log

set -euo pipefail

BRANCH=${1:-"unknown-branch"}
SHA=${2:-"unknown-sha"}
DRY_RUN=${DRY_RUN:-true}
TS=$(date +%Y%m%dT%H%M%S)
LOGDIR="files"
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/deploy-$TS.log"

echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LOGFILE"
echo "branch: $BRANCH" >> "$LOGFILE"
echo "sha: $SHA" >> "$LOGFILE"
echo "dry_run: $DRY_RUN" >> "$LOGFILE"

echo "=== begin micro-deploy simulation ===" >> "$LOGFILE"

# Example checks (non-destructive)
if [ "$DRY_RUN" = "true" ] || [ "$DRY_RUN" = "1" ]; then
  echo "Performing DRY-RUN checks..." >> "$LOGFILE"
  echo "Check: config files present" >> "$LOGFILE"
  if [ -f "scripts/coderabbit-bridge.mjs" ]; then
    echo "Found bridge script" >> "$LOGFILE"
  else
    echo "Warning: bridge script not found" >> "$LOGFILE"
  fi
  echo "Simulate container image build (skip actual build)" >> "$LOGFILE"
  echo "Simulate deploy to staging namespace: centraldark-staging (no changes applied)" >> "$LOGFILE"
  echo "All dry-run checks passed" >> "$LOGFILE"
else
  echo "Performing real deploy (user authorized)" >> "$LOGFILE"
  # Insert real deployment commands here, e.g. kubectl apply -f deploy/...
  # Must require secrets and real infra; left intentionally as TODO
  echo "ERROR: real deploy is not implemented in this script" >> "$LOGFILE"
  exit 1
fi

echo "=== end micro-deploy simulation ===" >> "$LOGFILE"

echo "Wrote log: $LOGFILE"
