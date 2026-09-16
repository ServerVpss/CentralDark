# CentralDark Desktop Commander persistence

These units keep the VPS Remote Desktop Commander bridge online.

- `centraldark-desktop-commander.service` runs the pinned bridge version with `Restart=always`, no start-limit lockout, IPv4-first DNS, and a controlled 12-hour recycle to refresh long-lived remote sessions.
- `centraldark-desktop-commander-watchdog.timer` runs every minute.
- `centraldark-desktop-commander-watchdog.service` calls the watchdog script.
- `centraldark-desktop-commander-watchdog.sh` restarts the bridge when the service is inactive, the process disappears, or the recent journal shows an offline/closed/expired signal newer than the last online/ready signal.

Install on the VPS:

```bash
install -m 0644 infra/systemd/centraldark-desktop-commander.service /etc/systemd/system/centraldark-desktop-commander.service
install -m 0755 infra/systemd/centraldark-desktop-commander-watchdog.sh /usr/local/sbin/centraldark-desktop-commander-watchdog.sh
install -m 0644 infra/systemd/centraldark-desktop-commander-watchdog.service /etc/systemd/system/centraldark-desktop-commander-watchdog.service
install -m 0644 infra/systemd/centraldark-desktop-commander-watchdog.timer /etc/systemd/system/centraldark-desktop-commander-watchdog.timer
systemctl daemon-reload
systemctl enable --now centraldark-desktop-commander.service centraldark-desktop-commander-watchdog.timer
```
