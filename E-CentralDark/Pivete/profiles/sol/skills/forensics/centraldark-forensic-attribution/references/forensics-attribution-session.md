# Forensic Attribution — Session 2026-08-28

## Context

This was created during a deploy hardening session on 2026-08-28. The original deploy script (`scripts/vps/centraldark-deploy.sh`) was being used to deploy to the VPS, and there was a need to improve forensics and security around the deploy process.

## What was built

1. **Policy document**: `docs/GOVERNANCA/deploy-policy.md`
   - Principles: security first, provable deployment, forensics before diagnosis, health as body not just HTTP 200, stability as window not snapshot
   - Pre-flight security checks (chattr, dirty state)
   - Build pre-flight (isolated build, npm ci, typecheck, tests, build)
   - Runtime validation (health check with body, multi-sample stability window)
   - Provenance verification (VPS HEAD == main SHA)
   - Forensics protocol (T0 → worker/PID → code → state → cause)
   - Rollback protocol
   - Deployment logging requirements
   - Governance and audit requirements

2. **Forensic attribution script**: `scripts/vps/forensics-attribution.sh`
   - Captures event timestamp
   - Worker/PID attribution (if identifiable via pgrep)
   - Git HEAD at time of forensics
   - Dist mtime and hash
   - Port listening status (9100 for MCP)
   - Robust to missing tools (records UNKNOWN for unavailable tools)

## Verification done

- Bash syntax check: passed (`bash -n` exit 0)
- Shellcheck: not available in environment (limitation, not failure)
- Execution test: ran in /tmp with test event, no side effects, completed cleanly
- Script is executable: `chmod +x` applied

## Limitations known

- Script requires pgrep, ss, git, sha256sum, stat on target environment
- These tools may not be available in all environments
- Script gracefully handles missing tools by recording UNKNOWN
- Local testing cannot verify real VPS behavior without SSH access

## Integration

The forensic attribution script is designed to be called:
- During deploy failures to capture forensic state
- As part of diagnostic workflows when runtime issues occur
- Before declaring cause of any runtime/service failure
