# Hetzner Server Provisioning Checklist

> Complete checklist for Hetzner CX22 + Tailscale + OpenClaw deployment.
> Execution: Playwright MCP automates Hetzner console, SSH automates server config.
> Run after completing deploy-vps-infra task. ALL items must PASS.

---

## A. Hetzner Account & Server (via Playwright)

- [ ] User logged into https://console.hetzner.cloud/ (user handles login + 2FA)
- [ ] Playwright: `browser_snapshot` confirms logged-in state
- [ ] Playwright: Project created: `openclaw-{agent-name}`
- [ ] Playwright: `browser_take_screenshot` -> project creation proof
- [ ] Playwright: SSH key added to project (ed25519 preferred)
- [ ] Playwright: `browser_take_screenshot` -> SSH key added proof
- [ ] Playwright: Server created with correct specs:
  - [ ] Location: Helsinki (hel1) or Falkenstein (fsn1)
  - [ ] Image: Ubuntu 22.04 LTS
  - [ ] Type: CX22 (2 vCPU, 4GB RAM, 40GB NVMe)
  - [ ] Public IPv4 enabled
  - [ ] SSH key selected (no password)
  - [ ] Server name: `openclaw-{agent-name}`
- [ ] User confirmed cost (EUR 3.99/mo) before `Create & Buy now`
- [ ] Playwright: `browser_wait_for` -> server status **Running**
- [ ] Playwright: `browser_snapshot` -> extracted public IPv4: `_______________`
- [ ] Playwright: `browser_take_screenshot` -> server running proof

## B. OS & SSH Hardening

- [ ] System updated: `apt update && apt upgrade -y`
- [ ] Non-root user created: `openclaw`
- [ ] Non-root user added to sudo + docker groups
- [ ] SSH authorized_keys copied to non-root user
- [ ] SSH config hardened:
  - [ ] `PermitRootLogin no`
  - [ ] `PasswordAuthentication no`
  - [ ] `PubkeyAuthentication yes`
- [ ] sshd restarted after config change
- [ ] Can SSH as non-root user: `ssh openclaw@{ip}`
- [ ] CANNOT SSH as root: `ssh root@{ip}` -> **denied**
- [ ] CANNOT SSH with password: password prompt -> **denied**

## C. Firewall (UFW)

- [ ] UFW installed and enabled
- [ ] Default policy: deny incoming, allow outgoing
- [ ] Rules configured:
  - [ ] `22/tcp` (SSH) -> ALLOW
  - [ ] `41641/udp` (Tailscale) -> ALLOW
  - [ ] Port 18789 -> **NOT in rules** (loopback only)
- [ ] `ufw status` shows active with correct rules
- [ ] From external machine: `nc -zv {public-ip} 18789` -> **Connection refused** (CRITICAL)

## D. Runtime Stack

### Node.js
- [ ] Node.js installed: `node -v` -> `v22.x.x`
- [ ] npm available: `npm -v`

### pnpm
- [ ] pnpm installed globally: `pnpm -v`

### Docker
- [ ] Docker installed: `docker -v`
- [ ] Docker service running: `systemctl status docker` -> active
- [ ] Docker accessible by non-root user: `docker ps` (as openclaw user)
- [ ] docker-compose plugin available: `docker compose version`

### Essential Tools
- [ ] git installed: `git --version`
- [ ] curl installed: `curl --version`
- [ ] jq installed: `jq --version`
- [ ] htop installed: `htop --version`

## E. Tailscale Mesh VPN

### VPS Side
- [ ] Tailscale installed on VPS
- [ ] Tailscale authenticated and connected: `tailscale status` -> connected
- [ ] Hostname set: `openclaw-{agent-name}`
- [ ] Tailscale IPv4 noted: `100.___.___.___`
- [ ] Tailscale shows in same tailnet as desktop

### Desktop Side
- [ ] Tailscale installed on desktop
- [ ] Tailscale authenticated (same account as VPS)
- [ ] `tailscale ping openclaw-{agent-name}` -> **pong**
- [ ] Latency acceptable: < 100ms

### Connectivity Test
- [ ] From desktop: `curl http://100.x.x.x:18789/health` -> (will work after OpenClaw deploy)
- [ ] Tailscale Funnel: configured only if public HTTPS needed (default: NO)

## F. OpenClaw Deployment

### Build
- [ ] OpenClaw cloned to `/opt/openclaw`
- [ ] `pnpm install` completed without errors
- [ ] `pnpm ui:build` completed without errors
- [ ] `pnpm build` completed without errors
- [ ] `pnpm openclaw onboard --install-daemon` completed

### Systemd Service
- [ ] Service file at `/etc/systemd/system/openclaw.service`
- [ ] Service file uses non-root user (`User=openclaw`)
- [ ] Service file has `Restart=always`
- [ ] Service file has `RestartSec=5`
- [ ] `systemctl daemon-reload` executed
- [ ] `systemctl enable openclaw` -> enabled
- [ ] `systemctl start openclaw` -> started

### Health Verification
- [ ] `systemctl status openclaw` -> **active (running)**
- [ ] `journalctl -u openclaw --no-pager -n 20` -> no errors
- [ ] `curl http://localhost:18789/health` from VPS -> **OK**
- [ ] `curl http://100.x.x.x:18789/health` from desktop -> **OK**
- [ ] Gateway has been running for > 5 minutes without crash

## G. Resource Baseline

- [ ] Memory usage at idle: `free -h` -> used < 2GB of 4GB
- [ ] Disk usage: `df -h /` -> used < 50%
- [ ] CPU at idle: `top` -> < 10% average
- [ ] No OOM kills: `dmesg | grep -i oom` -> empty

## H. Backup & Recovery

- [ ] Know how to restart: `systemctl restart openclaw`
- [ ] Know how to check logs: `journalctl -u openclaw -f`
- [ ] Know how to check port: `ss -tlnp | grep 18789`
- [ ] Hetzner snapshot taken (optional but recommended for rollback)

---

## Summary

| Section | Items | Passed | Automation | Status |
|---------|-------|--------|------------|--------|
| A. Hetzner Account | 16 | __ /16 | Playwright | |
| B. SSH Hardening | 10 | __ /10 | SSH | |
| C. Firewall | 7 | __ /7 | SSH | |
| D. Runtime Stack | 11 | __ /11 | SSH | |
| E. Tailscale | 10 | __ /10 | SSH + Manual | |
| F. OpenClaw | 13 | __ /13 | SSH | |
| G. Resources | 4 | __ /4 | SSH | |
| H. Recovery | 4 | __ /4 | Manual | |
| **TOTAL** | **75** | **__ /75** | | |

**PASS:** 75/75 (100%)
**CONDITIONAL:** 71-74/75 (non-security items only)
**FAIL:** Any security item (B, C, or F health) fails -> VETO

## Veto Conditions

- **Root SSH enabled** -> VETO. Disable before proceeding.
- **Password auth enabled** -> VETO. Keys only.
- **Port 18789 reachable from internet** -> VETO. Loopback only.
- **Gateway health check fails** -> VETO. Fix before Phase 3.
- **Tailscale ping fails from desktop** -> VETO. No mesh = no access.
- **Docker not running** -> VETO. Required for sandbox in Phase 5b.

## Server Details (fill after completion)

```
Hetzner Project:  _______________
Server Name:      openclaw-_______________
Public IPv4:      ___.___.___.___
Tailscale IPv4:   100.___.___.___
Tailscale Host:   openclaw-_______________
Node.js Version:  v22.___
OpenClaw Path:    /opt/openclaw
Date Provisioned: 2026-__-__
```
