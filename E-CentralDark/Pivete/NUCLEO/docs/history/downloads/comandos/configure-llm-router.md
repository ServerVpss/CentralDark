# Configure LLM Router

## Task Anatomy

```yaml
task_name: Configure LLM Router
status: active
responsible: "@architect (Aria)"
responsible_executor: "@architect (Aria)"
execution_type: Agent
deadline: "Phase 4 of wf-whitelabel-deploy (Day 1-2)"
estimated_time: "1-2h"
dependencies:
  - "create-whitelabel-identity (IDENTITY_CREATED gate must PASS)"
quality_gate: "ARCHITECTURE_VALID (wf-whitelabel-deploy.yaml)"
input:
  - "API keys (OpenRouter, Anthropic, OpenAI - user provides)"
  - "Cost constraints (monthly budget)"
  - "Skills inventory (which skills need which model tier)"
  - "squads/autoclaw/data/OPENCLAW-WHITELABEL-INSTALL-GUIDE.md (Phase 5)"
output:
  - "llm-router-config.yaml with tier definitions"
  - ".env populated with API keys"
  - "Fallback chain configured"
  - "Cost estimation per tier"
action_items:
  - "Copy base llm-router-config.yaml from apps/clawdbot/"
  - "Define 3 tiers: budget (DeepSeek/Haiku), standard (Sonnet), premium (Opus)"
  - "Map each skill to appropriate tier based on complexity"
  - "Configure fallback chain: premium -> standard -> budget"
  - "Set rate limits per tier"
  - "Create .env with API keys (NEVER commit to git)"
  - "Test each tier: openclaw agent --message 'test' --tier budget|standard|premium"
  - "Calculate estimated monthly cost at projected usage"
acceptance_criteria:
  - "llm-router-config.yaml is valid YAML"
  - "All 3 tiers respond to test messages"
  - "Fallback chain works (disable premium, verify standard handles)"
  - ".env has all required API keys"
  - "Skills correctly mapped to tiers"
  - "Estimated cost within user's budget"
```

## Veto Conditions

- **No API keys configured** -> STOP. Router without keys = dead system.
- **Invalid YAML** -> STOP. Parse error means no routing.
- **Premium tier uses cheap model** -> STOP. [SOURCE: steipete ST_013 - "Cheap models are DANGEROUS"]

## Notes

Source: OPENCLAW-WHITELABEL-INSTALL-GUIDE.md Phase 5.
steipete achieved 85% cost reduction with tier routing. Budget tier handles ~70% of queries.
