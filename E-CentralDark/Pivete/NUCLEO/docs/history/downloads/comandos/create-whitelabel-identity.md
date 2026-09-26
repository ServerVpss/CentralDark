# Create Whitelabel Identity

## Task Anatomy

```yaml
task_name: Create Whitelabel Identity
status: active
responsible: "@aios-master (Orion)"
responsible_executor: "@aios-master (Orion)"
execution_type: Agent
deadline: "Phase 3 of wf-whitelabel-deploy (Day 1)"
estimated_time: "30min-1h"
dependencies:
  - "deploy-vps-infra (INFRA_READY gate must PASS)"
quality_gate: "IDENTITY_CREATED (wf-whitelabel-deploy.yaml)"
input:
  - "Agent name (chosen by user)"
  - "Agent icon/emoji"
  - "Agent persona description"
  - "Running OpenClaw instance (Phase 1-2 complete)"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 4)"
output:
  - "apps/{agent-name}/ directory with full structure"
  - "Agent definition files (AGENTS.md, SOUL.md)"
  - "Registered in AIOS system"
action_items:
  - "Confirm agent name with user (follow steipete's rule: accept natural names)"
  - "Create directory: apps/{agent-name}/"
  - "Create subdirectories: skills/, tools/, docs/"
  - "Generate AGENTS.md with persona, capabilities, tool permissions"
  - "Generate SOUL.md with personality, values, communication style"
  - "Copy base TOOLS.md from apps/clawdbot/ as starting point"
  - "Register agent in OpenClaw config"
  - "Verify agent loads: openclaw agent --list"
acceptance_criteria:
  - "apps/{agent-name}/ directory exists with all required subdirs"
  - "AGENTS.md contains valid agent definition"
  - "SOUL.md contains personality definition"
  - "openclaw agent --list shows new agent"
  - "No name conflicts with existing agents"
```

## Veto Conditions

- **Directory structure incomplete** -> STOP. Agent won't load without proper structure.
- **Name conflicts with existing agent** -> STOP. Resolve naming before proceeding.
- **No SOUL.md** -> STOP. Agent without personality produces generic slop. [SOURCE: steipete ST_024]

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 4.
steipete principle: "Don't fight the name the agent chooses - they're in the weights."
