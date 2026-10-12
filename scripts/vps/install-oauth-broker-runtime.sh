#!/usr/bin/env bash
# Same CentralDark OAuth Broker; no second vault, Hub or supervisor.
set -Eeuo pipefail
REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
APP="$REPO/apps/modulos/oauth-broker"
SERVICE="centraldark-oauth-broker.service"
UNIT_SRC="$REPO/scripts/vps/systemd/$SERVICE"
ENV_FILE="/etc/centraldark/oauth-broker.env"
HEALTH="http://127.0.0.1:8098/health"
[[ "$(id -u)" == 0 ]] || { echo "ROOT_REQUIRED"; exit 2; }
[[ -f "$APP/server.mjs" && -f "$APP/check-config.mjs" && -f "$APP/package-lock.json" && -f "$UNIT_SRC" ]] || { echo "BROKER_OWNER_FILES_MISSING"; exit 3; }
command -v node >/dev/null && command -v npm >/dev/null || { echo "NODE_RUNTIME_MISSING"; exit 4; }
node --check "$APP/server.mjs"
node --check "$APP/check-config.mjs"
(cd "$APP" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund)
mkdir -p /etc/centraldark "$REPO/apps/modulos/hub/logs"
chmod 0700 /etc/centraldark
install -m 0644 "$UNIT_SRC" "/etc/systemd/system/$SERVICE"
systemctl daemon-reload
systemctl enable "$SERVICE" >/dev/null
echo "OAUTH_BROKER_SYSTEMD_ENABLED=PASS; OAUTH_BROKER_NPM_CI=PASS"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "HUMAN_FRONTIER=ENV_FILE_MISSING; RUNTIME=NOT_STARTED"
  exit 0
fi
mode="$(stat -c '%a' "$ENV_FILE")"
[[ "$mode" == 600 || "$mode" == 400 ]] || { echo "ENV_PERMISSIONS_UNSAFE=$mode; RUNTIME=NOT_STARTED"; exit 6; }
# systemd itself parses the root-owned EnvironmentFile; never source secrets as shell.
systemctl restart "$SERVICE"
for _ in $(seq 1 20); do
 if systemctl is-active --quiet "$SERVICE" && curl -fsS --max-time 3 "$HEALTH" >/dev/null; then
  echo "BROKER_LOCAL_HEALTH=PASS; GOOGLE_DRIVE_AUTH=NOT_PROVEN"
  exit 0
 fi
 sleep 1
done
result="$(systemctl show "$SERVICE" --no-pager -p Result --value)"
if [[ "$result" == "exec-condition" ]]; then
 echo "HUMAN_FRONTIER=REQUIRED_ENV_INCOMPLETE; RUNTIME=NOT_STARTED"
 exit 0
fi
echo "BROKER_LOCAL_HEALTH=FAIL; UNIT_RESULT=$result"
exit 7
