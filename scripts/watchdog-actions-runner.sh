#!/bin/bash
# Watchdog: se o self-hosted runner cair, reinicia. Roda via cron a cada 5min.
SVC=actions.runner.ServerVpss-CentralDark.vmi3256920-centraldark.service
if ! systemctl is-active --quiet "$SVC"; then
  echo "[$(date -Is)] runner offline, restart" >> /var/log/actions-runner-watchdog.log
  systemctl restart "$SVC"
fi
