# COMANDO - story-syn-13-session-bridge-diagnostics.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\story-syn-13-session-bridge-diagnostics.md
**SHA:** aaebaeadc5accf3c
**Timestamp:** 2026-08-28T02:02:40.537259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: "@qa"

### Ouro Bruto (primeiros 5000 chars)
```
# Story SYN-13: UAP Session Bridge + SYNAPSE Diagnostics Command

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-13
**Priority:** Critical
**Points:** 8
**Effort:** 8-10 hours
**Status:** Ready for Review
**Type:** Feature + Fix
**Lead:** @dev (Dex)
**Depends On:** SYN-7 (Hook Entry Point — Done), SYN-12 (E2E Testing — Done)
**Repository:** aios-core
**Wave:** 4 (Post-Launch Hardening)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [manual-review, coderabbit-cli, unit-tests, e2e-tests]
```

---

## User Story

**Como** usuario do AIOS que ativa agentes via `@agent`,
**Quero** que o UAP escreva o `active_agent` na session SYNAPSE ao ativar um agente, e ter um comando `*synapse-diagnose` que gere um report completo comparando o que foi executado vs. o que deveria ter sido executado no pipeline SYNAPSE,
**Para** garantir que o L2 (Agent Layer) receba o agente ativo corretamente e poder diagnosticar e corrigir gaps no pipeline ate chegar a 100% de fidelidade.

---

## Problem Statement

### Gap Critico Identificado

O flowchart (SYNAPSE-FLOWCHARTS.md, Secao 7) documenta que o UAP **escreve** `active_agent` na session SYNAPSE:

```
UAP_SESSION -->|"escreve"| S_FILE
```

Porem na implementacao real:

1. **O UAP (`unified-activation-pipeline.js`) NAO escreve na session SYNAPSE** — nenhum codigo de escrita existe
2. **A pasta `.synapse/sessions/` permanece vazia** — nenhuma session e criada
3. **O L2 (Agent Layer) nao consegue fazer match** — sem `active_agent` na session, o layer nao sabe qual agente ativar
4. O flowchart admite isso com seta pontilhada `-.->|"futuro"|` mas nunca foi implementado

### Consequencia

Numa sessao nova com `@po`:
- L0 (Constitution): OK — ALWAYS_ON
- L1 (Global): OK — ALWAYS_ON
- **L2 (Agent @po): FALHA SILENCIOSA** — session sem `active_agent`, regras do `agent-po` domain nao injetadas
- L7 (Star-Command): OK — detecta `*commands` no prompt

O agente recebe Constitution e Global rules, mas **NAO recebe suas regras agent-specific**.

---

## Objective

### Workstream A: UAP → SYNAPSE Session Bridge

Implementar a ponte entre UAP e SYNAPSE session para que ao ativar um agente, a session SYNAPSE seja criada/atualizada com `active_agent`.

### Workstream B: `*synapse-diagnose` Command

Criar um comando/skill de diagnostico que, quando chamado em qualquer ponto da janela de contexto, gere um report completo mapeando:

1. **O que FOI executado** — scripts, layers, inputs, outputs, tools, tokens
2. **O que DEVERIA ter sido executado** — baseado no flowchart, manifest, session state
3. **Gaps encontrados** — diferencas entre esperado vs. real
4. **Recomendacoes** — acoes para corrigir cada gap

---

## Scope

### IN Scope

#### Workstream A: Session Bridge

- **Modificar `unified-activation-pipeline.js`** (UAP)
  - Apos `GreetingBuilder.buildGreeting()` retornar, chamar `updateSession()` do SYNAPSE session-manager
  - Escrever: `active_agent: { id: agentId, activated_at: timestamp, activation_quality: quality }`
  - Graceful degradation: se `.synapse/sessions/` nao existe ou session-manager falha, warn e continua (nunca bloqueia greeting)
  - Timeout budget: max 20ms para escrita de session
  - NAO adicionar o SYNAPSE como dependencia hard — usar dynamic require com try/catch

- **Modificar `synapse-engine.js` (hook entry)**
  - Quando `loadSession()` retorna session com `active_agent`, passar para engine normalmente (ja funciona)
  - Quando session NAO existe mas hook recebe prompt, criar session minima com `prompt_count: 0` (ja faz isso)

- **Atualizar session-manager.js** (se necessario)
  - Garantir que `createSession()` e `updateSession()` aceitam `active_agent` no payload
  - Garantir que `loadSession()` retorna `active_agent` quando presente

- **Atualizar SYNAPSE-FLOWCHARTS.md**
  - Mudar seta pontilhada `-.->` para seta solida `-->` no diagrama UAP → Session
  - Remover label "(futuro)" da conexao C_UAP → UPDATE

#### Workstream B: `*synapse-diagnose` Command

- **Criar `.synapse/diagnostics/` module**
  - `synapse-diagnostics.js` — Motor de diagnostico
  - Coleta dados de:
    - `.synapse/manifest` — domains registrados e seus triggers
    - `.synapse/sessions/{current}` — session atual (active_agent, prompt_count, bracket, etc.)
    - `.claude/settings.local.json` — hook registration status
    - `.claude/hooks/synapse-engine.js` — hook file existence e integridade
    - `.aios-core/core/synapse/` — engine modules existence
    - Git status do `.synapse/` directory
  - Executa pipeline simulado (dry-run) para gerar "expected state"
  - Compara "expected" vs. "actual" session/layers

- **Criar `.synapse/diagnostics/collectors/`**
  - `hook-collector.js` — Verifica hook registration, file integrity, settings.local.json
  - `session-collector.js` — Le session atual, valida schema, verifica active_agent/workflow/task
  - `manifest-collector.js` — Valida manifest integrity, domain files existence vs. manifest entries
  - `pipeline-co
```