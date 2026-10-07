#!/usr/bin/env bash
# CENTRALDARK Auto-Sync — keeps VPS /root/CentralDark in sync with origin/main
# Owner: scripts/vps/auto-sync-main.sh
# Runs via cron every 5 minutes
# Rule: NO force-push, NO blind reset, NO restart all, NO secret echo

set -euo pipefail

REPO="/root/CentralDark"
LOG="/root/CentralDark/scripts/vps/auto-sync.log"
LOCKFILE="/tmp/centraldark-auto-sync.lock"

# Prevent concurrent runs
exec 200>"$LOCKFILE"
flock -n 200 || { echo "$(date -Iseconds) [SKIP] another sync running" >> "$LOG"; exit 0; }

cd "$REPO"

# Capture state before
BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Stash any local changes
STASHED=false
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    git stash -u -m "auto-sync-$(date +%s)" 2>/dev/null && STASHED=true
fi

# Fetch and pull
git fetch origin main 2>/dev/null
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "unknown")

if [ "$BEFORE" = "$REMOTE" ]; then
    echo "$(date -Iseconds) [OK] already up-to-date at $BEFORE" >> "$LOG"
else
    if git pull --ff-only origin main 2>>"$LOG"; then
        AFTER=$(git rev-parse HEAD)
        COUNT=$(git rev-list --count "$BEFORE".."$AFTER" 2>/dev/null || echo "?")
        echo "$(date -Iseconds) [SYNC] $BEFORE -> $AFTER ($COUNT commits)" >> "$LOG"
    else
        echo "$(date -Iseconds) [WARN] ff-only pull failed, attempting rebase" >> "$LOG"
        git pull --rebase origin main 2>>"$LOG" && {
            AFTER=$(git rev-parse HEAD)
            echo "$(date -Iseconds) [SYNC-REBASE] $BEFORE -> $AFTER" >> "$LOG"
        } || {
            echo "$(date -Iseconds) [ERROR] sync failed, aborting rebase" >> "$LOG"
            git rebase --abort 2>/dev/null || true
        }
    fi
fi

# Restore stashed changes
if [ "$STASHED" = true ]; then
    git stash pop 2>/dev/null || {
        echo "$(date -Iseconds) [WARN] stash pop conflict, keeping stash" >> "$LOG"
    }
fi

# Trim log to last 500 lines
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 500 ]; then
    tail -300 "$LOG" > "${LOG}.tmp" && mv "${LOG}.tmp" "$LOG"
fi
