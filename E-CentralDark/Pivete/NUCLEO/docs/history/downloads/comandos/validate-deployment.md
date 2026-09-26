# Validate Deployment

## Task Anatomy

```yaml
task_name: Validate Deployment
status: active
responsible: "@qa (Quinn)"
responsible_executor: "@qa (Quinn)"
execution_type: Agent
deadline: "Phase 6 of wf-whitelabel-deploy (Day 3)"
estimated_time: "1-2h"
dependencies:
  - "connect-channels (at least 1 channel connected)"
  - "setup-security-layers (SECURITY_HARDENED gate must PASS)"
quality_gate: "DEPLOYMENT_VALIDATED (wf-whitelabel-deploy.yaml)"
input:
  - "Fully deployed OpenClaw instance (all phases complete)"
  - "squads/autoclaw/checklists/post-deployment-validation.md"
  - "squads/autoclaw/checklists/security-audit-checklist.md"
output:
  - "Validation report with PASS/FAIL per item"
  - "Performance baseline measurements"
  - "Security audit results"
  - "Final deployment status: READY or BLOCKED"
action_items:
  - "INFRASTRUCTURE:"
  - "  curl http://localhost:18789/health -> OK"
  - "  tailscale ping from desktop -> success"
  - "  systemctl status openclaw -> active"
  - "LLM ROUTER:"
  - "  Test budget tier: simple query"
  - "  Test standard tier: normal query"
  - "  Test premium tier: complex query"
  - "  Test fallback: disable premium, verify standard handles"
  - "SKILLS:"
  - "  Test each installed skill individually"
  - "  Verify progressive disclosure (context window check)"
  - "SECURITY:"
  - "  Send blocked command -> rejected"
  - "  Verify Docker sandbox isolation"
  - "  Check audit logs exist and are redacted"
  - "  Attempt unauthorized DM -> blocked"
  - "CHANNELS:"
  - "  Send message via each connected channel"
  - "  Verify response formatting"
  - "  Test reconnection after brief disconnect"
  - "PERFORMANCE:"
  - "  Measure response latency (target: <5s for standard tier)"
  - "  Check memory usage (target: <2GB steady state)"
  - "  Verify no memory leaks over 10-message sequence"
  - "Generate final validation report"
acceptance_criteria:
  - "All infrastructure checks PASS"
  - "All 3 LLM tiers respond correctly"
  - "Fallback chain works"
  - "All security tests PASS (zero tolerance)"
  - "At least 1 channel fully operational"
  - "Response latency < 5 seconds (standard tier)"
  - "Memory usage < 2GB steady state"
  - "Final status: READY"
```

## Veto Conditions

- **Any security test fails** -> STOP. Non-negotiable. Fix and re-validate.
- **Gateway not responding** -> STOP. Infrastructure regression.
- **LLM Router returns errors** -> STOP. Core functionality broken.

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 11.
This is the final gate. Nothing ships until @qa signs off.
steipete: "Close the loop - verify your own work." [SOURCE: ST_004]
