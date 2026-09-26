# 05 — Arquitetura conceitual (camadas)

> Arquitetura **de referência** para implementar no **seu** stack.  
> Não é diagrama do app de terceiros.

---

## Camadas (de cima para baixo)

```
┌──────────────────────────────────────────────────────────┐
│ L7  EXPERIÊNCIA     Landing, Auth UI, Dashboard, Cockpit │
├──────────────────────────────────────────────────────────┤
│ L6  ORQUESTRAÇÃO    Mission planner, role router, squads │
├──────────────────────────────────────────────────────────┤
│ L5  AGENTS RUNTIME  Sessions/panes, tools, MCP, shell    │
├──────────────────────────────────────────────────────────┤
│ L4  POLICY/SAFETY   Budgets, PDP, approvals, caps        │
├──────────────────────────────────────────────────────────┤
│ L3  METERING        Tokens, $, audit, timeline           │
├──────────────────────────────────────────────────────────┤
│ L2  MODEL GATEWAY   OpenAI-compat, modes, fallbacks      │
├──────────────────────────────────────────────────────────┤
│ L1  PROVIDERS       Abacus / OpenRouter / Anthropic…     │
├──────────────────────────────────────────────────────────┤
│ L0  PLATFORM        Auth, DB, billing, secrets, deploy   │
└──────────────────────────────────────────────────────────┘
```

---

## Responsabilidade por camada

### L7 — Experiência
- Login, onboarding, planos
- Cockpit: panes, status, chat do piloto
- Settings: providers, keys, preferências

### L6 — Orquestração
- Recebe goal do user
- Gera plano (lista de subtarefas)
- Atribui role + model + tools
- Decide quando parar / escalar / pedir humano

### L5 — Agents runtime
- Processos ou sessões por agent
- Tool calling (MCP, git, terminal)
- Isolamento (workdir, env, secrets)

### L4 — Policy / safety
- `max_cost_usd` por missão/agent
- Allowlist de tools
- Approvals para ações destrutivas
- Rate limits por plano

### L3 — Metering
- Conta tokens in/out por call
- Converte em $ por price table
- Timeline de eventos
- Export de relatório

### L2 — Model gateway
- `/v1/models`, `/v1/chat/completions`
- Modes: router, parallel, debate, hermes
- Fallbacks e aliases
- Auth de API key

### L1 — Providers
- Upstream real de LLM
- Pode oscilar catálogo (normal)

### L0 — Platform
- Supabase auth/DB
- Stripe / billing
- Vault de secrets
- PM2 / Caddy / CI

---

## Contratos (interfaces mínimas)

### MissionService
```
createMission(goal, squad_id, budget)
startMission(id)
cancelMission(id)
getMission(id) → status, agents, costs, artifacts
```

### Orchestrator
```
plan(goal, context) → steps[]
assign(step) → {role, model, tools}
replan(on_failure)
```

### AgentRunner
```
spawn(role, model, tools, budget)
send(message | tool_result)
stream(events)
stop()
```

### CostMeter
```
record(usage: {model, in, out, agent_id, mission_id})
getMissionCost(mission_id)
checkBudget(mission_id) → ok | exceeded
```

### GatewayClient
```
listModels()
chatCompletions(req)  // OpenAI-compat
```

### Entitlement
```
canUse(feature, user) → bool
limits(user) → {max_parallel, monthly_budget...}
```

---

## Fluxo de dados de uma chamada

```
UI Cockpit
  → Orchestrator.plan
  → AgentRunner.spawn
  → Gateway.chatCompletions
  → Provider
  → tokens volta
  → CostMeter.record
  → Policy.checkBudget
  → UI atualiza pane + $ live
```

---

## Estados da missão

```
draft → queued → running → (blocked_waiting_approval) → completed
                         ↘ failed
                         ↘ canceled
                         ↘ budget_exceeded
```

---

## Isolamento e multi-tenancy

| Recurso | Isolar por |
|---------|------------|
| API keys do user | user_id |
| Missions | user_id / org_id |
| Audit logs | user_id + mission_id |
| Secrets vault | user/org + encryption |
| Workdirs de agent | mission_id + agent_id |
| Rate limits | plan + user |

---

## Padrões de parallelismo

### A) Parallel workers (fan-out)
1 orchestrator → N builders em paralelo → merge/review

### B) Pipeline
scout → builder → reviewer → executor (sequencial com handoff)

### C) Debate / council
2+ models propõem → judge escolhe

### D) Hermes / autônomo
proposta + auto-crítica em loop limitado

> No Central Dark, A/C/D já têm ecos nos modos Arsenal.

---

## Observabilidade mínima

- structured logs por mission_id
- audit_log de API calls
- métricas: latency, cost, error rate, parallel count
- status page / health endpoints

---

## Segurança (não negociável)

- Nunca logar API keys completas
- Secrets só no vault / env
- Tools destrutivas com approval
- Budget hard-stop (não só alerta)
- Auth em gateway (não shadow eterno em prod pública)
- RLS no Supabase por user/org

---

## Mapa “camada → módulo Central Dark (alvo)”

| Camada | Módulo existente / alvo |
|--------|-------------------------|
| L7 | HUB frontend (`hub/`) |
| L6 | Hermes-core + novo Mission service |
| L5 | MCP (`:9100`), agents Hermes |
| L4 | `hub_policies`, `hub_approvals`, PDP |
| L3 | `audit_log_api`, `ai_requests`, cost views |
| L2 | `arsenal-openai-adapter` `:8090` |
| L1 | Abacus RouteLLM / OpenRouter switch |
| L0 | Supabase HUB + PM2 + Caddy + Stripe |
| Voz | `centraldark-voice` |
| Memória | `memoria-api` |
