# 02 — Árvore do produto (estrutura funcional)

> Árvore **conceitual** de um multi-agent cockpit.  
> Use como checklist de módulos — **renomeie tudo** no Central Dark.

---

## Árvore raiz

```
PRODUTO MULTI-AGENT
│
├── 1. SUPERFÍCIE (o que o usuário toca)
│   ├── Landing / marketing site
│   ├── Auth (login Google/GitHub)
│   ├── Dashboard (assinatura, status, keys)
│   ├── Cockpit / workspace (coração)
│   ├── Catálogo (agents, skills, templates)
│   ├── Help / onboarding
│   └── Billing (checkout, planos, portal)
│
├── 2. COCKPIT (runtime multi-agent)
│   ├── Piloto / Orchestrator
│   ├── Pane Manager (N sessões paralelas)
│   ├── Role Router (papel → agent)
│   ├── Model Router (tarefa → modelo)
│   ├── Mission Room (estado da missão)
│   ├── Cost Engine (metering live)
│   ├── Cost Cap / Budget Guard
│   └── Event Stream (logs, tokens, status)
│
├── 3. PAPÉIS (roles) — não confundir com modelos
│   ├── Orchestrator  → decompõe missão
│   ├── Scout         → pesquisa / lê / mapeia
│   ├── Builder       → implementa
│   ├── Reviewer      → revisa / critica
│   ├── Executor      → roda comandos / bulk
│   └── (opcional) Judge / Debate / Hermes
│
├── 4. FERRAMENTAS (tool layer)
│   ├── CLI agents (Claude Code, Codex, Gemini…)
│   ├── MCP tools
│   ├── Terminal / shell
│   ├── Git / PR
│   └── Connectors (Notion, GitHub, browser…)
│
├── 5. PROVIDERS (model layer)
│   ├── Provider A (flagship / caro)
│   ├── Provider B (barato / bulk)
│   ├── Provider C (rápido)
│   └── Gateway unificado (OpenAI-compat)
│
├── 6. CRESCIMENTO / VALUE-ADD
│   ├── Playbooks (como aplicar grants)
│   ├── Comunidade (Discord)
│   ├── Build-in-public / lives
│   └── Templates de squad por caso de uso
│
└── 7. PLATAFORMA (ops)
    ├── Auth + identity
    ├── Billing + entitlements
    ├── Telemetria + auditoria
    ├── Updates / releases
    └── Suporte / status page
```

---

## Subárvore: Mission (unidade de trabalho)

```
MISSION
├── goal (texto do usuário)
├── status (idle | running | blocked | done | failed)
├── budget_usd (teto)
├── spent_usd (atual)
├── plan[] (subtarefas do orchestrator)
├── agents[]
│   ├── agent_id
│   ├── role
│   ├── model_id
│   ├── pane_id
│   ├── status
│   ├── tokens_in / tokens_out
│   └── cost_usd
├── artifacts[] (diff, arquivos, PRs, logs)
└── timeline[] (eventos)
```

---

## Subárvore: Squad (time configurável)

```
SQUAD_TEMPLATE
├── name (ex: "feature-full", "bugfix-fast", "research")
├── roles[]
│   ├── role
│   ├── default_model
│   ├── fallback_model
│   ├── max_cost_usd
│   └── tools_allowed[]
└── policy
    ├── max_parallel
    ├── stop_on_review_fail
    └── escalate_to_flagship_when
```

---

## Subárvore: Monetização (produto)

```
ENTITLEMENT
├── plan_id (free | pro | team | enterprise)
├── features[]
│   ├── max_parallel_agents
│   ├── cost_tracker
│   ├── voice
│   ├── private_squads
│   └── priority_support
├── billing_period (monthly | yearly)
└── status (active | past_due | canceled)
```

---

## Mapa visual simplificado (runtime)

```
[Usuário]
    │  "Faz X"
    ▼
[Orchestrator] ── decompõe ──► subtarefas
    │
    ├──► [Scout]     model barato
    ├──► [Builder1]  model médio
    ├──► [Builder2]  model médio
    ├──► [Reviewer]  model médio/caro
    └──► [Executor]  model barato
           │
           ▼
      [Cost Engine] ◄── tokens de todos
           │
           ▼
      [Mission Done / Budget Hit]
```

---

## O que NÃO precisa copiar

| Referência de mercado | Seu equivalente (conceito) |
|-----------------------|----------------------------|
| “Boost / Boost Pro” | Seus planos Central Dark |
| “ClockVoice” | Seu módulo `centraldark-voice` |
| “MIMO grant playbook” | Seu growth (Abacus, packs, convites) |
| Branding / copy PT do site | Copy 100% Central Dark |
| Desktop Electron deles | HUB web + desktop se **você** quiser |

---

## Checklist de árvore mínima viável (MVP)

- [ ] Auth
- [ ] 1 Orchestrator + 2 workers paralelos
- [ ] Seletor de modelo por agent
- [ ] Cost meter por missão
- [ ] Budget cap
- [ ] Log/timeline da missão
- [ ] 1 squad template
- [ ] Billing ou feature-flag por plano
