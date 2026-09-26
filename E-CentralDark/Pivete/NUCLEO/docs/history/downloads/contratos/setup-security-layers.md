# Setup Security Layers

## Task Anatomy

```yaml
task_name: Setup Security Layers
status: active
responsible: "@devops (Gage)"
responsible_executor: "@devops (Gage)"
execution_type: Agent
deadline: "Phase 5b of wf-whitelabel-deploy (Day 2)"
estimated_time: "2-3h"
dependencies:
  - "install-skills (IMPLEMENTATION_COMPLETE gate must PASS)"
quality_gate: "SECURITY_HARDENED (wf-whitelabel-deploy.yaml)"
input:
  - "Running OpenClaw instance with identity and skills configured"
  - "Default blocklist.yaml from OpenClaw repo"
  - "Docker installed on VPS"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 7)"
output:
  - "Layer 1: Customized blocklist.yaml active"
  - "Layer 2: Docker sandbox configured and isolated"
  - "Layer 3: Audit logging with journald + logrotate"
  - "Security test results documented"
action_items:
  - "LAYER 1 - BLOCKLIST:"
  - "  Copy default blocklist.yaml"
  - "  Customize: add domain-specific dangerous commands"
  - "  Test: send blocked command, verify rejection"
  - "  Test minimum 50 blocked patterns"
  - "LAYER 2 - DOCKER SANDBOX:"
  - "  Create sandbox config (see templates/docker-sandbox-tmpl.yaml)"
  - "  Alpine base, non-root user, network=none"
  - "  Workspace isolation: scope per agent/session"
  - "  Test: verify container cannot reach network"
  - "  Test: verify container cannot access host filesystem"
  - "LAYER 3 - AUDIT:"
  - "  Configure journald for openclaw service"
  - "  Setup logrotate (7 days retention minimum)"
  - "  Enable sensitive data redaction in logs"
  - "  Configure detect-secrets scanning"
  - "  Verify redaction: send message with fake API key, check logs"
acceptance_criteria:
  - "Blocked commands are rejected with clear error message"
  - "Docker sandbox cannot reach external network (curl test fails inside container)"
  - "Docker sandbox runs as non-root"
  - "Logs are being written to journald"
  - "Logrotate config exists and is valid"
  - "Sensitive data is redacted in logs (API keys, passwords)"
  - "detect-secrets scan returns clean on workspace"
```

## Veto Conditions

- **Blocklist not blocking dangerous commands** -> STOP IMMEDIATELY. Security breach risk.
- **Docker sandbox not isolated** -> STOP. Container escape = full system access.
- **Logs contain unredacted secrets** -> STOP. Fix redaction before continuing.

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 7.
steipete: "Fail-closed security. Start locked, explicitly open. Never the reverse." [SOURCE: ST_002]
This is the most critical task in the pipeline. Security failures are non-negotiable VETOs.
