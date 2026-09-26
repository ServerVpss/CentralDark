# AI-SWARM-PROMPT — Orquestrador + enxame (paralelo)

Use este arquivo para rodar **vários agents/Sonnets em paralelo** na VPS com um conductor.

---

## CONDUCTOR (agent 0) — system

```
Você é o CONDUCTOR do Central Dark Mission Cockpit.
Leia AI-CONTEXT-MASTER.md + AI-SCHEMA.json.
NÃO implemente tudo sozinho. Decomponha em tasks paralelas.
Regras: anti-cópia, reusar módulos CD, OpenAI-compat, audit, budget.
Saída sempre em JSON:
{
  "plan": ["..."],
  "tasks": [
    {"id":"T1","owner":"schema","goal":"...","files":["..."],"depends_on":[],"dod":["..."]},
    {"id":"T2","owner":"gateway","goal":"...","files":["..."],"depends_on":[],"dod":["..."]}
  ],
  "parallel_waves": [["T1","T2"],["T3"]],
  "integration_order": ["..."]
}
```

---

## WAVE 1 (paralelo — sem dependência)

### Agent SCHEMA
```
CONTEXT: AI-CONTEXT-MASTER.md + AI-SCHEMA.json
TASK: Desenhar migrations Supabase HUB para:
missions, mission_agents, mission_events, cost_ledger, price_table, squad_templates, plans, entitlements
RULES: RLS por user_id; sem quebrar schemas api/hub existentes; SQL idempotente
OUTPUT: arquivos SQL + diagrama mermaid + rollback
```

### Agent GATEWAY-COST
```
CONTEXT: AI-CONTEXT-MASTER.md
TASK: Especificar/implementar cost_ledger a partir de usage do arsenal-openai-adapter
RULES: price_table versionada; não logar keys; compat /v1/chat/completions
OUTPUT: patch plan para server.mjs/auth-audit.mjs + exemplo de record
```

### Agent SQUAD-ORCH
```
CONTEXT: AI-CONTEXT-MASTER.md sections roles + parallelism
TASK: Definir 3 squad templates CD (bugfix, feature, research) + conductor assign algorithm
RULES: roles map to Arsenal modes when useful (parallel/debate/hermes)
OUTPUT: squad_templates JSON + pseudocode Orchestrator.plan/assign
```

### Agent PAGES-IA
```
CONTEXT: 10-mapa-paginas-site.md + AI-CONTEXT-MASTER pages
TASK: Spec UI HUB routes only: dashboard, plans, missions, help, roadmap
RULES: naming Central Dark only; web-first (download optional later)
OUTPUT: wireframe textual + component list + API calls
```

---

## WAVE 2 (depois da wave 1)

### Agent MISSION-API
```
depends_on: SCHEMA
TASK: CRUD mission + start/cancel endpoints no HUB/backend escolhido
DOD: curl create/start/get funciona; status machine correta
```

### Agent BUDGET-GUARD
```
depends_on: GATEWAY-COST
TASK: hard-stop quando spent_usd >= budget_usd
DOD: missão vai para budget_exceeded e para agents
```

### Agent ENTITLEMENTS
```
depends_on: SCHEMA
TASK: plan limits max_parallel_agents + feature flags
DOD: user free não sobe 6 agents se limit=2
```

### Agent HELP-SEED
```
depends_on: PAGES-IA
TASK: 5 artigos markdown: primeiros passos, keys arsenal, primeira missão, budget, modes arsenal
DOD: slugs prontos para /app/help
```

---

## WAVE 3 — integração

### Agent INTEGRATOR
```
depends_on: all wave2
TASK: ligar UI Mission Room → API → Arsenal → cost → budget
TEST: missão demo end-to-end
OUTPUT: checklist DoD + riscos
```

### Agent REVIEWER
```
TASK: review anti-cópia + segurança + RLS + secrets
FAIL if: third-party brand in UI, missing hard-stop, open gateway without plan
```

---

## FORMATO DE HANDOFF ENTRE AGENTS

```json
{
  "task_id": "T1",
  "status": "done|blocked",
  "artifacts": ["path1", "path2"],
  "api_contracts": {},
  "tests_run": [],
  "blockers": [],
  "next": ["T3"]
}
```

---

## COMANDO ÚNICO PRO CONDUCTOR

```
Orquestre o enxame WAVE1 em paralelo agora.
Anexe: AI-CONTEXT-MASTER.md, AI-SCHEMA.json, 07-mapa-conversao-central-dark.md, 10-mapa-paginas-site.md
Proibido copiar Overclock. Entregar só Central Dark.
```
