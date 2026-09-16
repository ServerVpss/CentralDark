#!/usr/bin/env bash
set -euo pipefail

SERVICE="centraldark-desktop-commander.service"
LOG="/var/log/centraldark-desktop-commander-watchdog.log"

log() {
  printf '[%s] %s\n' "$(date -Is)" "$*" >> "$LOG"
}

restart() {
  log "ACTION=restart REASON=$1"
  systemctl restart "$SERVICE"
  exit 0
}

if ! systemctl is-enabled --quiet "$SERVICE"; then
  systemctl enable "$SERVICE" >/dev/null 2>&1 || true
  log "ACTION=enable"
fi

if ! systemctl is-active --quiet "$SERVICE"; then
  restart "service_not_active"
fi

if ! pgrep -f 'desktop-commander.*remote|npm exec @wonderwhy-er/desktop-commander' >/dev/null; then
  restart "process_missing"
fi

python3 - <<'PY' || restart "recent_log_unhealthy"
import subprocess
import sys

cmd = [
    'journalctl',
    '-u',
    'centraldark-desktop-commander.service',
    '--since',
    '10 minutes ago',
    '--no-pager',
    '-o',
    'cat',
]
lines = subprocess.run(cmd, text=True, capture_output=True, check=False).stdout.splitlines()

bad_terms = (
    'Device marked as offline',
    'Device shutdown complete',
    'MCP transport closed',
    'Channel closed',
    'SIGTERM received',
    'ECONNRESET',
    'ETIMEDOUT',
    'Unauthorized',
    '401',
    '403',
    'expired',
)
good_terms = (
    'Device marked as online',
    'Device ready',
    'Session restored',
    'Channel subscribed',
    'Connected to Remote MCP',
)

last_bad = -1
last_good = -1
for index, line in enumerate(lines):
    if any(term in line for term in good_terms):
        last_good = index
    if any(term in line for term in bad_terms):
        last_bad = index

sys.exit(1 if last_bad > last_good else 0)
PY

log "STATUS=ok"
