# Desktop SSH Compatibility Verification Protocol

**Origin:** Session 2026-09-07 — Casa + VPS full reconciliation mission  
**Trigger:** Desktop SSH boot failure: "The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce"

## Problem

Hermes Desktop app connects to VPS via SSH and expects the remote Hermes to support two flags:
- `--ssh-session-token-file PATH` — read one-shot Desktop SSH session token
- `--ssh-owner-nonce NONCE` — verify ownership of the session

If the remote Hermes version is older than when these flags were added (pre-2026.8.31), the Desktop SSH connection fails with:
```
Desktop boot failed: The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce. Update Hermes on the remote host to continue using Desktop SSH mode.
```

## Solution Protocol

### Step 1: Measure Remote Hermes
```bash
ssh Segredo-VPS "hermes --version"
```
Check: version, install method, Python version.

### Step 2: Verify Flag Support
```bash
ssh Segredo-VPS "hermes serve --help | grep -A2 'ssh-session'"
```
Expected output:
```
  --ssh-session-token-file PATH
                        Read a one-shot Desktop SSH session token from PATH
  --ssh-owner-nonce NONCE
```

If missing → remote Hermes incompatible.

### Step 3: Repair via Official Update Path
**DO NOT** run `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh` blindly.

Instead:
```bash
# 1. Run doctor first (diagnoses + auto-fixes)
ssh Segredo-VPS "cd /root/CentralDark && hermes doctor --fix"

# 2. Run update (detects install method, updates correctly)
ssh Segredo-VPS "cd /root/CentralDark && hermes update"

# 3. Re-run doctor to confirm
ssh Segredo-VPS "cd /root/CentralDark && hermes doctor --fix"
```

### Step 4: Prove Compatibility
```bash
# Start serve in background
ssh Segredo-VPS "cd /root/CentralDark && nohup hermes serve --port 9119 --host 127.0.0.1 > /tmp/hermes-serve.log 2>&1 & sleep 5 && curl -s http://127.0.0.1:9119/status"
```

Expected response:
```json
{"error":"Headless backend (hermes serve): web UI disabled — use `hermes dashboard` for the browser UI."}
```

This confirms:
- Hermes serve starts successfully
- HTTP endpoint responds
- Flags are supported (otherwise serve wouldn't start with them)

### Step 5: Verify Desktop SSH Works
From Casa (Windows):
1. Open Hermes Desktop app
2. Select SSH connection to `Segredo-VPS`
3. Connect — should handshake and show remote session

## Version Compatibility Matrix

| Hermes Version | SSH Desktop Flags | Notes |
|----------------|-------------------|-------|
| < 0.21.0 (pre-2026.8.31) | ❌ Missing | Must update |
| 0.21.0 (2026.8.31) | ✅ Supported | Upstream 693641aa |
| > 0.21.0 | ✅ Supported | Forward compatible |

## Key Lessons

1. **Doctor first, update second** — `hermes doctor --fix` migrates config (v0→v41), creates symlinks, catches issues before update
2. **Update respects install method** — `hermes update` detects git/pip/other and applies correct update path
3. **Same version both sides** — Casa (v0.21.0) + VPS (v0.21.0) = compatibility guaranteed
4. **Config migration is automatic** — doctor handles v0→v41 migration with new curator, auxiliary settings
5. **Don't nuke and reinstall** — preserves config, memory, profiles, skills, sessions

## Related Files

- `centraldark-vps-operations/references/vps-git-cookbook.md` — VPS git cookbook
- `centraldark-operational-discipline/references/fixed-point-shared-pattern.md` — Fixed point protocol