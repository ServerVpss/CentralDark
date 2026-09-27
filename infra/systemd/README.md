# CentralDark Desktop Commander persistence

These units keep the VPS Remote Desktop Commander bridge online.

The canonical account model is `MULTI_ACCOUNT_ISOLATED_HOME`: one Remote Desktop Commander process per account profile, each with an isolated `HOME`, device state, systemd unit and watchdog. The profiles share the same CentralDark owner/control plane but never share refresh-token state.

- `centraldark-desktop-commander.service` is the principal profile and runs through `/usr/local/sbin/centraldark-desktop-commander-profile.sh principal /root`.
- `centraldark-desktop-commander-conta2.service` is the second fixed profile and runs through `/usr/local/sbin/centraldark-desktop-commander-profile.sh conta2 /root/.desktop-commander-profiles/conta2`.
- `centraldark-desktop-commander-profile@.service` is the scalable template for additional isolated profiles: `systemctl enable --now centraldark-desktop-commander-profile@<profile>.service`.
- `centraldark-desktop-commander-profile.sh` serializes one canonical process per profile with a profile-specific lock and the pinned package.
- `centraldark-desktop-commander-watchdog.timer` and `centraldark-desktop-commander-conta2-watchdog.timer` run every minute.
- `centraldark-desktop-commander-watchdog.sh` measures `MainPID`, cgroup membership and recent connection state for the selected service.
- `AUTH_PENDING` is observable and does not trigger a restart storm. A stale/used refresh token may fall into device authorization; the service stays alive so the human can complete the one-time provider login.
- Similar Desktop Commander PIDs outside the selected service cgroup are observed but never killed automatically.

Canonical VPS deployment:

```bash
bash scripts/vps/deploy-desktop-commander-multi-account.sh /root/CentralDark
```

Manual equivalent installs the profile runner, watchdog, fixed units and templates into systemd, then enables/restarts the principal and `conta2` bridges.

Proof boundary:

```text
TWO_ACTIVE_ISOLATED_PROCESSES = transport capacity for >=2 profiles
AUTH_REQUIRED                = process healthy, provider login not yet completed
DEVICE_READY                 = provider session authenticated for that profile
TWO_DEVICE_READY_PROFILES    = >=2 authenticated Remote MCP account profiles proven concurrently
SOURCE_PATCH                 != VPS_DEPLOYED
SERVICE_ACTIVE               != DEVICE_READY
UNKNOWN                      != PASS
```
