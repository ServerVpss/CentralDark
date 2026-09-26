# AI-CONTEXT-MASTER — Central Dark Mission Cockpit
<!-- Optimized for LLM ingestion. No marketing fluff. No third-party branding to copy. -->

## ROLE
You implement Central Dark's multi-agent Mission Cockpit on the existing VPS stack.
You convert a MARKET PATTERN into Central Dark modules. You never clone third-party apps.

## MARKET PATTERN (abstract only)
```
PROBLEM: flagship LLM cost + serial work + rate limits
PRODUCT: orchestration cockpit (not token resale)
VALUE: parallel roles + right model per task + live $ metering + budget hard-stop
REVENUE: subscription for cockpit (+ optional gateway usage margin)
FUNNEL: Landing → Plans/Checkout → Dashboard → Deliver runtime → Help activate → Roadmap retain
```

## SITE PAGE PATTERN → SYSTEM RESPONSIBILITY
| Page | Responsibility | CD target |
|------|----------------|-----------|
| DASHBOARD | home, entitlement status, CTAs | HUB `/dashboard` |
| PLANOS | pricing, checkout, billing portal | plans + Stripe/EFI + entitlements |
| BAIXAR APP | deliver runtime binaries | optional; MVP = web Mission Room |
| DIREÇÃO | roadmap/sprints transparency | HUB roadmap / changelog |
| AJUDA | install, providers, playbooks | HUB help articles |

## PRODUCT TREE (functional)
```
MissionCockpit
├── Surface: auth, dashboard, plans, help, roadmap, missions UI
├── Orchestrator: plan(goal) → steps[] → assign(role, model, tools)
├── Runtime: N agent sessions (parallel or pipeline)
├── Roles: conductor | scout | builder | reviewer | executor | judge
├── Gateway: OpenAI-compat modes (router/parallel/debate/hermes)
├── Metering: tokens → USD cost_ledger; mission totals
├── Policy: budget hard-stop, tool approvals, plan limits
└── Platform: Supabase, PM2, secrets, audit
```

## CENTRAL DARK EXISTING ASSETS (reuse)
- `arsenal-openai-adapter` :8090 → `api.centralldark.com` (OpenAI-compat)
- Abacus RouteLLM upstream (100+ models); OpenRouter switch exists
- HUB Supabase: roles, hub_policies, hub_approvals, api audit tables
- MCP :9100, HERMES-CORE, hermes-thinker, memoria-api, centraldark-voice, oauth-broker
- VPS path: `/root/CentralDark/apps/modulos/`

## GAPS TO BUILD
1. Mission Room UI + mission domain tables
2. Squad templates first-class
3. Cost meter USD (not only raw audit)
4. Budget hard-stop
5. Entitlements (plan → max_parallel, features)
6. Activation docs (first mission <10 min)
7. Gateway auth enforce path (leave shadow carefully)

## BUSINESS MODEL (CD hybrid)
```
Revenue = HUB_subscription + Arsenal_usage_margin + addons(voice/memory/seats)
COGS = upstream tokens + VPS
NOT sold as core: third-party grants
User may BYOK optionally; prefer Arsenal gateway for platform moat
```

## DATA MODEL (minimal)
```
plans(id, name, limits_json, stripe_price_id)
entitlements(user_id, plan_id, status, period_end)
missions(id, user_id, goal, status, budget_usd, spent_usd, squad_id)
mission_agents(id, mission_id, role, model_id, status, cost_usd)
mission_events(id, mission_id, ts, type, payload_json)
cost_ledger(id, mission_id, agent_id, model, tokens_in, tokens_out, usd, created_at)
price_table(model_id, usd_per_1m_in, usd_per_1m_out, version, effective_at)
squad_templates(id, name, roles_json, policy_json)
help_articles(id, category, slug, body_md)
roadmap_items(id, sprint, status, title, body)
```

## INTERFACES
```
MissionService: create|start|cancel|get
Orchestrator: plan|assign|replan
AgentRunner: spawn|send|stream|stop
CostMeter: record|getMissionCost|checkBudget
GatewayClient: listModels|chatCompletions
Entitlement: canUse|limits
Policy: evaluateTool|requestApproval
```

## MISSION STATES
`draft → queued → running → blocked_waiting_approval → completed|failed|canceled|budget_exceeded`

## PARALLELISM MODES
- fan-out: N workers then merge/review
- pipeline: scout → builder → reviewer → executor
- council: parallel proposals + judge (maps to Arsenal parallel/debate)
- autonomous loop: hermes-like bounded iterations

## IMPLEMENTATION ORDER
**NOW = MVP only** → see `../03-central-dark/12-MVP-MINIMO-VIABLE.md` (12 IN items).
Later (not now): P2+ squads UI, voice, desktop, billing bank, full roadmap page.
Fatias: A backend core → B UI mínima → C endurecer (timeout, erros, 10 checks).

## HARD RULES
1. No third-party product names in UI
2. No cloning layouts/copy/binaries
3. Extend existing modules first
4. Keep OpenAI-compat clients working
5. Audit every billable call
6. Never commit secrets
7. Budget hard-stop required for MVP
8. Branding: Central Dark / Arsenal / Hermes / HUB only

## MVP DEFINITION OF DONE
User logs into HUB → creates Mission → ≥2 roles/agents run via Arsenal → live cost updates → budget stop works → help article for first mission exists → no third-party clone artifacts

## RESPONSE FORMAT FOR IMPLEMENTER AI
1. 10-line restatement
2. files/modules to touch
3. small testable slice
4. test plan (curl + UI)
5. risks + rollback
