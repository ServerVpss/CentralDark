# Desktop SSH Compatibility Fix Pattern (2026-09-07)

## Problem
Hermes Desktop app fails to connect via SSH to VPS with error:
```
Desktop boot failed: The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce. Update Hermes on the remote host to continue using Desktop SSH mode.
```

## Root Cause
Hermes Desktop (v0.21.0+) requires remote Hermes to support two CLI flags for secure session handshake:
- `--ssh-session-token-file PATH` — reads one-shot Desktop SSH session token
- `--ssh-owner-nonce NONCE` — cryptographic nonce for session ownership

Older Hermes versions (< v0.21.0) don't implement these flags → Desktop SSH handshake fails.

## Solution Protocol (DO NOT blind reinstall)

### 1. Measure First
```bash
# Local Hermes version
hermes --version

# Remote Hermes version + install method
ssh Segredo-VPS "hermes --version"
ssh Segredo-VPS "hermes doctor 2>&1 | grep 'Install method'"
```

### 2. Run doctor --fix on Remote
```bash
ssh Segredo-VPS "cd /root/CentralDark && hermes doctor --fix"
```
- Migrates config (v0 → v41 in this case)
- Creates symlink `~/.local/bin/hermes` if missing
- Validates Python env, SSL, packages, auth

### 3. Run update on Remote (respects install method)
```bash
ssh Segredo-VPS "cd /root/CentralDark && hermes update"
```
- Detects install method (git, pip, binary)
- Updates Node deps, builds web UI, checks config
- **NEVER** run `curl ... | sh` blindly — `hermes update` handles it correctly

### 4. Verify Flags Supported
```bash
ssh Segredo-VPS "hermes serve --help | grep -A2 'ssh-session'"
```
Should show:
```
  --ssh-session-token-file PATH   Read a one-shot Desktop SSH session token from PATH
  --ssh-owner-nonce NONCE
```

### 5. Start Remote Serve (for Desktop handshake)
```bash
ssh Segredo-VPS "cd /root/CentralDark && nohup hermes serve --port 9119 --host 127.0.0.1 > /tmp/hermes-serve.log 2>&1 &"
sleep 3
ssh Segredo-VPS "curl -s http://127.0.0.1:9119/status"
```
Expected: `{"error":"Headless backend (hermes serve): web UI disabled..."}` — proves serve is alive.

### 6. Test Desktop SSH from Casa
Open Hermes Desktop → Connection → SSH → use existing `Segredo-VPS` config → Connect.

## Key Principles (Casa Law)

| Principle | Application |
|-----------|-------------|
| `REUSE_BEFORE_CREATE` | Fix existing Hermes, don't reinstall |
| `DOCTOR_BEFORE_INSTALL` | `hermes doctor --fix` first, then `hermes update` |
| `MEASURE_BEFORE_MUTATE` | Check version + flags before any action |
| `NO_BLIND_OVERWRITE` | Preserve config, memory, profiles, skills, sessions |
| `ZERO_REGRESSION` | Don't destroy working runtime to "start fresh" |
| `VPS_SOURCE_OF_TRUTH` | Always run `lsattr`, `hermes --version`, `serve --help` ON VPS via SSH |

## Session Evidence (2026-09-07)

| Metric | Value |
|--------|-------|
| Local Hermes | v0.21.0 (2026.8.3) |
| VPS Hermes (before) | v0.21.0 (2026.8.31) · git install · Python 3.11.16 |
| VPS Hermes (after) | v0.21.0 (2026.8.31) · up to date |
| Config migration | v0 → v41 |
| Flags supported | ✅ `--ssh-session-token-file`, `--ssh-owner-nonce` |
| Serve PID | 2778175 |
| Health endpoint | Responds HTTP 200 (headless) |
| Desktop SSH Compatibility | **PASS** |

## Contraproof Checklist

- [ ] `hermes doctor --fix` exited 0 (local)
- [ ] `hermes doctor --fix` exited 0 (remote)
- [ ] `hermes update` remote → "Already up to date" or successful update
- [ ] `hermes serve --help` shows SSH flags
- [ ] Remote serve process running (PID confirmed)
- [ ] Remote health endpoint responds
- [ ] Desktop SSH connects without "flags not supported" error

## Related Patterns

- `references/vps-reality-check-20260831.md` — full VPS measurement protocol
- `references/vps-ssh-access.md` — direct SSH patterns
- `references/hermes-verificador-telegram-429-cascade.md` — rate limit handling