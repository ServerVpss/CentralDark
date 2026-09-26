# Install Skills

## Task Anatomy

```yaml
task_name: Install Skills
status: active
responsible: "@dev (Dex)"
responsible_executor: "@dev (Dex)"
execution_type: Agent
deadline: "Phase 5a of wf-whitelabel-deploy (Day 2)"
estimated_time: "1-2h"
dependencies:
  - "configure-llm-router (ARCHITECTURE_VALID gate must PASS)"
quality_gate: "IMPLEMENTATION_COMPLETE (wf-whitelabel-deploy.yaml)"
input:
  - "Skills list from apps/clawdbot/skills/ (reference)"
  - "User's desired skill set"
  - "LLM tier mapping from configure-llm-router task"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 6)"
output:
  - "Skills copied/adapted in apps/{agent-name}/skills/"
  - "Each skill tested individually"
  - "Skills registered in agent config"
action_items:
  - "List available skills from apps/clawdbot/skills/"
  - "User selects which skills to enable"
  - "Copy selected skills to apps/{agent-name}/skills/"
  - "Customize skill configs for new agent context"
  - "Map each skill to appropriate LLM tier"
  - "Test each skill individually: openclaw skill --test {skill-name}"
  - "Verify progressive disclosure works (only inject needed skills per turn)"
  - "Document installed skills in agent's README"
acceptance_criteria:
  - "All selected skills copied to agent's skills directory"
  - "Each skill passes individual test"
  - "Skills are mapped to correct LLM tiers"
  - "Progressive skill disclosure verified (not all skills loaded at once)"
  - "No orphan skill references in config"
```

## Veto Conditions

- **Skill test fails** -> STOP. Broken skill = broken agent experience.
- **Skill references nonexistent tool** -> STOP. Fix dependency before enabling.

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 6.
steipete has 100+ skills. Progressive disclosure is key - only inject what's needed per turn.
