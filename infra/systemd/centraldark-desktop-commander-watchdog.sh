#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-${SERVICE:-centraldark-desktop-commander.service}}"
LOG="/var/log/centraldark-desktop-commander-watchdog.log"
SAFE_SERVICE="${SERVICE//[^a-zA-Z0-9_.-]/_}"
STATE="/run/${SAFE_SERVICE}.watchdog.state"
PROCESS_PATTERN='desktop-commander.*remote|npm exec @wonderwhy-er/desktop-commander'

log() {
  printf '[%s] %s\n' "$(date -Is)" "$*" >> "$LOG"
}

join_words() {
  tr '\n' ' ' | xargs 2>/dev/null || true
}

census() {
  ENABLED="$(systemctl is-enabled "$SERVICE" 2>/dev/null || true)"
  ACTIVE="$(systemctl is-active "$SERVICE" 2>/dev/null || true)"
  MAIN_PID="$(systemctl show --property MainPID --value "$SERVICE" 2>/dev/null || true)"
  CONTROL_GROUP="$(systemctl show --property ControlGroup --value "$SERVICE" 2>/dev/null || true)"

  CGROUP_PIDS=""
  if [[ -n "$CONTROL_GROUP" && -r "/sys/fs/cgroup${CONTROL_GROUP}/cgroup.procs" ]]; then
    CGROUP_PIDS="$(cat "/sys/fs/cgroup${CONTROL_GROUP}/cgroup.procs" | join_words)"
  fi

  MATCHING_PIDS="$(pgrep -f "$PROCESS_PATTERN" 2>/dev/null | join_words)"
  IN_CGROUP_PIDS=""
  OUTSIDE_CGROUP_PIDS=""
  EXPECTED_IN_CGROUP=false
  MAIN_PID_IN_CGROUP=false

  if [[ "$MAIN_PID" =~ ^[1-9][0-9]*$ ]] && grep -qw -- "$MAIN_PID" <<<"$CGROUP_PIDS"; then
    MAIN_PID_IN_CGROUP=true
  fi

  for pid in $CGROUP_PIDS; do
    [[ -r "/proc/$pid/cmdline" ]] || continue
    cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
    if grep -Eq "$PROCESS_PATTERN" <<<"$cmdline"; then
      EXPECTED_IN_CGROUP=true
      IN_CGROUP_PIDS+="${IN_CGROUP_PIDS:+ }$pid"
    fi
  done

  for pid in $MATCHING_PIDS; do
    if grep -qw -- "$pid" <<<"$CGROUP_PIDS"; then
      :
    else
      OUTSIDE_CGROUP_PIDS+="${OUTSIDE_CGROUP_PIDS:+ }$pid"
    fi
  done
}

write_state() {
  local verdict="$1"
  local reason="${2:-none}"
  local tmp
  tmp="$(mktemp "${STATE}.XXXXXX")"
  {
    printf 'OBSERVED_AT=%q\n' "$(date -Is)"
    printf 'SERVICE=%q\n' "$SERVICE"
    printf 'ENABLED=%q\n' "$ENABLED"
    printf 'ACTIVE=%q\n' "$ACTIVE"
    printf 'MAIN_PID=%q\n' "$MAIN_PID"
    printf 'CONTROL_GROUP=%q\n' "$CONTROL_GROUP"
    printf 'CGROUP_PIDS=%q\n' "$CGROUP_PIDS"
    printf 'MATCHING_PIDS=%q\n' "$MATCHING_PIDS"
    printf 'IN_CGROUP_PIDS=%q\n' "$IN_CGROUP_PIDS"
    printf 'OUTSIDE_CGROUP_PIDS=%q\n' "$OUTSIDE_CGROUP_PIDS"
    printf 'MAIN_PID_IN_CGROUP=%q\n' "$MAIN_PID_IN_CGROUP"
    printf 'EXPECTED_IN_CGROUP=%q\n' "$EXPECTED_IN_CGROUP"
    printf 'VERDICT=%q\n' "$verdict"
    printf 'REASON=%q\n' "$reason"
  } > "$tmp"
  chmod 0644 "$tmp"
  mv -f "$tmp" "$STATE"
  log "PID_CENSUS SERVICE=$SERVICE ACTIVE=$ACTIVE MAIN_PID=$MAIN_PID CGROUP_PIDS=[$CGROUP_PIDS] MATCHING_PIDS=[$MATCHING_PIDS] IN_CGROUP_PIDS=[$IN_CGROUP_PIDS] OUTSIDE_CGROUP_PIDS=[$OUTSIDE_CGROUP_PIDS] VERDICT=$verdict REASON=$reason"
}

canonical_process_ok() {
  [[ "$ACTIVE" == "active" ]] \
    && [[ "$MAIN_PID_IN_CGROUP" == "true" ]] \
    && [[ "$EXPECTED_IN_CGROUP" == "true" ]]
}

recent_log_healthy() {
  WATCHDOG_SERVICE="$SERVICE" python3 - <<'PY'
import os
import subprocess
import sys

service = os.environ['WATCHDOG_SERVICE']
lines = subprocess.run(
    ['journalctl', '-u', service, '--since', '10 minutes ago', '--no-pager', '-o', 'cat'],
    text=True,
    capture_output=True,
    check=False,
).stdout.splitlines()

bad_terms = (
    'Device marked as offline',
    'Device shutdown complete',
    'MCP transport closed',
    'Channel closed',
    'socket closed: 1006',
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
}

restart_and_verify() {
  local reason="$1"
  write_state "RESTARTING" "$reason"
  log "ACTION=restart SERVICE=$SERVICE REASON=$reason"
  systemctl restart "$SERVICE"
  sleep 8
  census
  if canonical_process_ok && recent_log_healthy; then
    write_state "RECOVERED" "$reason"
    return 0
  fi
  write_state "FAIL_CLOSED" "${reason}_after_restart"
  return 1
}

if ! systemctl is-enabled --quiet "$SERVICE"; then
  systemctl enable "$SERVICE" >/dev/null 2>&1 || true
  log "ACTION=enable SERVICE=$SERVICE"
fi

census
if ! canonical_process_ok; then
  restart_and_verify "canonical_pid_invariant_failed"
  exit $?
fi

if ! recent_log_healthy; then
  restart_and_verify "recent_log_unhealthy"
  exit $?
fi

if [[ -n "$OUTSIDE_CGROUP_PIDS" ]]; then
  log "WARN=matching_pid_outside_canonical_cgroup SERVICE=$SERVICE PIDS=[$OUTSIDE_CGROUP_PIDS] ACTION=observe_only"
fi

write_state "PASS" "canonical_pid_set_valid"
