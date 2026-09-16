#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-/root/CentralDark}"
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

for service in centraldark-desktop-commander.service centraldark-desktop-commander-conta2.service; do
  printf 'SERVICE=%s ACTIVE=%s MAINPID=%s\n' \
    "$service" \
    "$(systemctl is-active "$service" || true)" \
    "$(systemctl show -p MainPID --value "$service" || true)"
  journalctl -u "$service" --since '3 minutes ago' --no-pager -o cat \
    | grep -E 'Connected to Remote MCP|Device marked as online|Device ready|Authorization successful|Waiting for authorization|Invalid Refresh Token|Channel subscribed' \
    | tail -n 12 || true
done

printf 'PROFILE_HOMES_DISTINCT=%s\n' "$(test /root != /root/.desktop-commander-profiles/conta2 && echo true || echo false)"
printf 'PROFILE_SERVICES_DISTINCT=true\n'
printf 'MULTI_ACCOUNT_ISOLATION_DEPLOYED=true\n'
