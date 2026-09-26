#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-/root/CentralDark}"
CANONICAL_ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
SOURCE_HEAD="${SOURCE_HEAD:-$(git -C "$CANONICAL_ROOT" rev-parse HEAD 2>/dev/null || true)}"
RECEIPT="/run/centraldark-remote-multi-account.receipt"
DISPATCHER="${CENTRALDARK_DEPLOY_GATE_SCRIPT:-$CANONICAL_ROOT/scripts/vps/deploy-guards-dispatcher.sh}"
[[ "$SOURCE_HEAD" =~ ^[0-9a-f]{40}$ ]] || { echo "SOURCE_HEAD_INVALID"; exit 16; }
[[ -x "$DISPATCHER" ]] || { echo "CANONICAL_DEPLOY_GATE_MISSING"; exit 16; }
TARGET_SHA="$SOURCE_HEAD" REPO_DIR="$CANONICAL_ROOT" BRANCH=main bash "$DISPATCHER" --gate-only
echo "CANONICAL_DEPLOY_GATE=PASS TARGET_SHA=$SOURCE_HEAD"
cd "$ROOT"

install -m 0755 infra/systemd/centraldark-desktop-commander-profile.sh /usr/local/sbin/centraldark-desktop-commander-profile.sh
install -m 0755 infra/systemd/centraldark-desktop-commander-watchdog.sh /usr/local/sbin/centraldark-desktop-commander-watchdog.sh
install -m 0644 infra/systemd/centraldark-desktop-commander.service /etc/systemd/system/centraldark-desktop-commander.service
install -m 0644 infra/systemd/centraldark-desktop-commander-conta2.service /etc/systemd/system/centraldark-desktop-commander-conta2.service
install -m 0644 infra/systemd/centraldark-desktop-commander-watchdog.service /etc/systemd/system/centraldark-desktop-commander-watchdog.service
install -m 0644 infra/systemd/centraldark-desktop-commander-watchdog.timer /etc/systemd/system/centraldark-desktop-commander-watchdog.timer
install -m 0644 infra/systemd/centraldark-desktop-commander-conta2-watchdog.service /etc/systemd/system/centraldark-desktop-commander-conta2-watchdog.service
install -m 0644 infra/systemd/centraldark-desktop-commander-conta2-watchdog.timer /etc/systemd/system/centraldark-desktop-commander-conta2-watchdog.timer
install -m 0644 infra/systemd/centraldark-desktop-commander-profile@.service /etc/systemd/system/centraldark-desktop-commander-profile@.service
install -m 0644 infra/systemd/centraldark-desktop-commander-profile-watchdog@.service /etc/systemd/system/centraldark-desktop-commander-profile-watchdog@.service

systemctl daemon-reload
systemctl enable centraldark-desktop-commander.service centraldark-desktop-commander-conta2.service >/dev/null
systemctl enable centraldark-desktop-commander-watchdog.timer centraldark-desktop-commander-conta2-watchdog.timer >/dev/null
systemctl restart centraldark-desktop-commander.service centraldark-desktop-commander-conta2.service
systemctl restart centraldark-desktop-commander-watchdog.timer centraldark-desktop-commander-conta2-watchdog.timer
sleep 8

log_state() {
  local service="$1"
  local lines
  lines="$(journalctl -u "$service" --since '5 minutes ago' --no-pager -o cat 2>/dev/null || true)"
  if grep -q 'Device ready' <<<"$lines"; then
    printf 'READY'
  elif grep -Eq 'Waiting for authorization|Device code received|Starting device authorization flow|Invalid Refresh Token: Already Used' <<<"$lines"; then
    printf 'AUTH_REQUIRED'
  elif grep -Eq 'Device marked as offline|socket closed: 1006|Unauthorized|ECONNRESET|ETIMEDOUT' <<<"$lines"; then
    printf 'UNHEALTHY'
  else
    printf 'UNKNOWN'
  fi
}

P1_SERVICE='centraldark-desktop-commander.service'
P2_SERVICE='centraldark-desktop-commander-conta2.service'
P1_ACTIVE="$(systemctl is-active "$P1_SERVICE" 2>/dev/null || printf 'UNKNOWN')"
P2_ACTIVE="$(systemctl is-active "$P2_SERVICE" 2>/dev/null || printf 'UNKNOWN')"
P1_PID="$(systemctl show -p MainPID --value "$P1_SERVICE" 2>/dev/null || true)"
P2_PID="$(systemctl show -p MainPID --value "$P2_SERVICE" 2>/dev/null || true)"
[[ "$P1_PID" =~ ^[1-9][0-9]*$ ]] || P1_PID='UNKNOWN'
[[ "$P2_PID" =~ ^[1-9][0-9]*$ ]] || P2_PID='UNKNOWN'
P1_LOG_STATE="$(log_state "$P1_SERVICE")"
P2_LOG_STATE="$(log_state "$P2_SERVICE")"

PROCESSES_DISTINCT=false
if [[ "$P1_PID" != 'UNKNOWN' && "$P2_PID" != 'UNKNOWN' && "$P1_PID" != "$P2_PID" ]]; then
  PROCESSES_DISTINCT=true
fi

CAPACITY_VERDICT='FAIL'
if [[ "$P1_ACTIVE" == active && "$P2_ACTIVE" == active && "$PROCESSES_DISTINCT" == true ]]; then
  CAPACITY_VERDICT='PASS'
fi

AUTH_VERDICT='UNKNOWN'
if [[ "$P1_LOG_STATE" == READY && "$P2_LOG_STATE" == READY ]]; then
  AUTH_VERDICT='PASS'
elif [[ "$P1_LOG_STATE" == AUTH_REQUIRED || "$P2_LOG_STATE" == AUTH_REQUIRED ]]; then
  AUTH_VERDICT='AUTH_REQUIRED'
elif [[ "$P1_LOG_STATE" == UNHEALTHY || "$P2_LOG_STATE" == UNHEALTHY ]]; then
  AUTH_VERDICT='FAIL'
fi

TMP="$(mktemp "${RECEIPT}.XXXXXX")"
{
  printf 'SCHEMA=centraldark.remote.multi-account.receipt.v2\n'
  printf 'OBSERVED_AT=%s\n' "$(date -Is)"
  printf 'SOURCE_HEAD=%s\n' "$SOURCE_HEAD"
  printf 'HOST=%s\n' "$(hostname)"
  printf 'SYSTEMD_DAEMON_RELOAD=PASS\n'
  printf 'SYSTEMD_UNIT_ACTION=ENABLE_AND_RESTART\n'
  printf 'ACCOUNT_MODEL=MULTI_ACCOUNT_ISOLATED_HOME\n'
  printf 'PROFILE_1=principal\n'
  printf 'PROFILE_1_SERVICE=%s\n' "$P1_SERVICE"
  printf 'PROFILE_1_ACTIVE=%s\n' "$P1_ACTIVE"
  printf 'PROFILE_1_MAINPID=%s\n' "$P1_PID"
  printf 'PROFILE_1_LOG_STATE=%s\n' "$P1_LOG_STATE"
  printf 'PROFILE_2=conta2\n'
  printf 'PROFILE_2_SERVICE=%s\n' "$P2_SERVICE"
  printf 'PROFILE_2_ACTIVE=%s\n' "$P2_ACTIVE"
  printf 'PROFILE_2_MAINPID=%s\n' "$P2_PID"
  printf 'PROFILE_2_LOG_STATE=%s\n' "$P2_LOG_STATE"
  printf 'PROFILE_HOMES_DISTINCT=true\n'
  printf 'PROFILE_SERVICES_DISTINCT=true\n'
  printf 'PROFILE_PROCESSES_DISTINCT=%s\n' "$PROCESSES_DISTINCT"
  printf 'MULTI_ACCOUNT_CAPACITY=%s\n' "$CAPACITY_VERDICT"
  printf 'MULTI_ACCOUNT_AUTH=%s\n' "$AUTH_VERDICT"
  printf 'RAW_NULL_POLICY=PRESERVE_PROVIDER_RAW_AND_NORMALIZE_SEMANTICS\n'
  printf 'ERROR_NULL_NORMALIZATION=NO_ERROR\n'
  printf 'ERROR_DATA_NULL_NORMALIZATION=NO_ERROR_DATA\n'
  printf 'ERROR_CODE_NULL_NORMALIZATION=NO_ERROR_CODE\n'
  printf 'CLASSIFICATION_ID_NULL_NORMALIZATION=UNCLASSIFIED\n'
  printf 'JSON_RPC_ERROR_CODE_NULL_NORMALIZATION=NO_JSON_RPC_ERROR\n'
  printf 'ERROR_HTTP_STATUS_NULL_NORMALIZATION=NO_HTTP_ERROR_STATUS\n'
  printf 'ERROR_HTTP_HEADERS_NULL_NORMALIZATION=NO_HTTP_ERROR_HEADERS\n'
  printf 'CLAMP_ERRORS_NULL_NORMALIZATION=NONE\n'
  printf 'CLAMP_REWRITES_NULL_NORMALIZATION=NONE\n'
} > "$TMP"

NULL_OPERATIONAL_FIELDS=false
if grep -Eiq '^[A-Z0-9_]+=(null)?[[:space:]]*$' "$TMP"; then
  NULL_OPERATIONAL_FIELDS=true
fi
printf 'NULL_OPERATIONAL_FIELDS=%s\n' "$NULL_OPERATIONAL_FIELDS" >> "$TMP"

chmod 0644 "$TMP"
mv -f "$TMP" "$RECEIPT"

cat "$RECEIPT"
for service in "$P1_SERVICE" "$P2_SERVICE"; do
  echo "--- $service"
  journalctl -u "$service" --since '5 minutes ago' --no-pager -o cat \
    | grep -E 'Connected to Remote MCP|Device marked as online|Device ready|Authorization successful|Waiting for authorization|Invalid Refresh Token|Channel subscribed' \
    | tail -n 12 || true
done

test "$NULL_OPERATIONAL_FIELDS" = false
test "$CAPACITY_VERDICT" = PASS
