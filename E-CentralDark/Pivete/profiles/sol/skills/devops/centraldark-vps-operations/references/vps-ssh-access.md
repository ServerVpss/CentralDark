# VPS Direct SSH Access — proven pattern

## Connection
Hermes terminal (git-bash, Windows) reaches VPS via local SSH config:
- Config: `C:\Users\danda\.ssh\config`
- Host `Segredo-VPS` → `HostName 89.117.78.124`, `User root`, `Port 22`,
  `IdentityFile C:\Users\danda\.ssh\segredo_vps_ed25519`, `IdentitiesOnly yes`
- Tested working: `ssh Segredo-VPS 'echo SSH_OK; hostname; uname -a; pm2 -v'`
  → returned `SSH_OK`, `vmi3256920`, `Linux ... x86_64`, `7.0.1`

NOTE: the host alias `vmi3256920-centraldark` does NOT resolve on this host;
use `Segredo-VPS` (the configured alias). Anonymous `curl` to the private
GitHub repo 404s — use `gh` (authenticated as `segredounlock`) or `git ls-remote`.

SSH AUTH FACTS (measured 2026-08-26, session #1189 reconcile):
- Key `~/.ssh/segredo_vps_ed25519` (ed25519) works for **root@89.117.78.124**
- `danda@89.117.78.124` → Permission denied (publickey) — key NOT authorized for danda
- `git@89.117.78.124` → Permission denied
- If `Segredo-VPS` alias missing from config, use explicit:
  `ssh -i ~/.ssh/segredo_vps_ed25519 -o StrictHostKeyChecking=no root@89.117.78.124`
- Use `-o BatchMode=yes -o ConnectTimeout=15` to fail fast (not hang 180s)

VPS INTERMITTENCY (measured 2026-08-26):
- SSH connected ONCE (ROOT_OK), then 3 consecutive timeouts (Connection timed out)
- Runner API showed status flip online→offline within seconds
- Conclusion: VPS network/runtime UNSTABLE — not an auth problem
- If SSH fails repeatedly: don't loop forever; report VPS unreachable, recommend
  CHEFE check provider panel / reboot. Don't fake "connected" state.
- GitHub self-hosted runner `vmi3256920-centraldark` shares this instability:
  when it dies, PR CI jobs stay `queued` forever (no proof). Prefer direct SSH
  for VPS state; if both down, say so.

## Run housekeeping scan on VPS (report-only)
```bash
ssh -o BatchMode=yes -o ConnectTimeout=15 Segredo-VPS 'bash -s' <<'REMOTE'
set -e
cd /root/CentralDark
mkdir -p /root/CentralDark/logs/housekeeping
REPORT="/root/CentralDark/logs/housekeeping/$(date -u +%Y%m%dT%H%M%SZ).jsonl"
node scripts/vps/vps-housekeeping-scan.mjs --repo-dir /root/CentralDark --report "$REPORT"
cat "$REPORT"
REMOTE
```
Produces JSONL with `lixo | ouro | neutro` per finding. Never removes anything.

## Measured VPS state (2026-08-26)
- CentralDark-Hermes: online, 0 restarts, PID 3583219 ✅
- CentralDark-MCP: HTTP 200 `{"ok":true,"service":"mcp-centraldark","toolCount":110}`,
  port 9100 bound to 127.0.0.1 only ✅
- 3 stopped (lixo): CentralDark-AiDiag, CentralDark-WebhookDeploy (crashloop 278 restarts)
- /tmp/r.tgz 208.9 MB (candidate junk)
- CentralDark-WebUI (OpenWebUI) Docker bind 0.0.0.0:3000 → PUBLIC EXPOSURE
  (UFW only allows 22; Docker bypasses UFW). CHEFE rule: DEPLOY≠PUBLICAÇÃO.
  Close via `127.0.0.1` bind + SSH tunnel, never leave 0.0.0.0 on public IP.

## Git state on VPS (do NOT force-align)
- Repo at `/root/CentralDark` was DETACHED HEAD (`6b93c5d1`), divergent from
  `origin/main` and from branch `feat/vps-housekeeping` (`947bbf64f`).
- `decisor.mjs` had `chattr +i` (immutable) → `git reset --hard` failed
  "Operation not permitted".
- Active git process (GitKraken CLI hook + `git push origin main`) was running.
- Lesson: the VPS repo is the LIVE runtime. Do not `reset --hard` / `checkout -f`
  against it. Reconcile only with explicit CHEFE authorization + idle git proc.
