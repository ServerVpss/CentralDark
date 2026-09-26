# COMANDO - story-syn-8-domain-content.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\story-syn-8-domain-content.md
**SHA:** ac233ec5f71ab011
**Timestamp:** 2026-08-28T02:02:40.569248
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Run:** `npx jest tests/synapse/generate-constitution.test.js --coverage`

### Contratos
- quality_gate: "@qa"

### Ouro Bruto (primeiros 5000 chars)
```
# Story SYN-8: Domain Content Files (.synapse/ population)

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-8
**Priority:** High
**Points:** 5
**Effort:** 6-8 hours
**Status:** Ready for Review
**Type:** Feature
**Lead:** @dev (Dex) + @architect (Aria)
**Depends On:** SYN-1 (Domain Loader — manifest KEY=VALUE format)
**Repository:** aios-core
**Wave:** 2 (Integration + Content)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [manual-review, coderabbit-cli, unit-tests]
```

---

## User Story

**Como** motor SYNAPSE,
**Quero** um diretorio `.synapse/` populado com todos os domain content files (manifest, constitution, global, context, commands, agent domains, workflow domains),
**Para** que o engine tenha conteudo real para processar nas 8 layers em vez de fixtures de teste — completando o runtime data layer da arquitetura.

---

## Objective

Popular o diretorio `.synapse/` com todos os domain content files necessarios para o SYNAPSE Engine operar:

1. **manifest** — Central domain registry no formato KEY=VALUE (SYN-1 format)
2. **constitution** — L0 domain auto-gerado a partir de `.aios-core/constitution.md`
3. **global** — L1 universal rules (ALWAYS_ON)
4. **context** — L1 bracket-specific rules para FRESH/MODERATE/DEPLETED/CRITICAL
5. **commands** — L7 star-command definitions (*brief, *dev, *review, *plan, *discuss, *debug, *explain, *synapse)
6. **agent-*** — L2 per-agent domain files (12 agentes)
7. **workflow-*** — L3 per-workflow domain files (3 workflows)
8. **sessions/** — directory for session state (gitignored)
9. **cache/** — directory for optional performance cache (gitignored)

Inclui tambem um script de geracao da constitution para automatizar a conversao `.aios-core/constitution.md` → `.synapse/constitution`.

---

## Scope

### IN Scope

- **`.synapse/manifest`** — Complete domain registry
  - All L0-L7 domain entries no formato KEY=VALUE (DESIGN doc section 3)
  - DEVMODE=false por padrao
  - State, ALWAYS_ON, NON_NEGOTIABLE, AGENT_TRIGGER, WORKFLOW_TRIGGER, RECALL, EXCLUDE keys
  - Conforme ao parser do domain-loader (SYN-1)

- **`.synapse/constitution`** — L0 domain (auto-generated)
  - Script que le `.aios-core/constitution.md` e extrai os 6 artigos
  - Gera formato KEY=VALUE: `CONSTITUTION_RULE_ART{N}_{M}=text`
  - **CRITICAL (Review Note #2):** Auto-gerado, nao copiado manualmente
  - Script: `.aios-core/core/synapse/scripts/generate-constitution.js`

- **`.synapse/global`** — L1 universal rules
  - Regras que se aplicam a TODOS os prompts (quando GLOBAL_STATE=active)
  - Coding standards, import rules, error handling patterns
  - Derivadas de `.claude/CLAUDE.md` e `docs/framework/coding-standards.md`

- **`.synapse/context`** — L1 bracket-specific rules
  - Regras por bracket: FRESH, MODERATE, DEPLETED, CRITICAL
  - Formato: `CONTEXT_RULE_{BRACKET}_{N}=text`
  - Token budget awareness, context management hints

- **`.synapse/commands`** — L7 star-command definitions
  - Formato: `[*command] COMMAND:` blocks com regras numeradas
  - Commands: *brief, *dev, *review, *plan, *discuss, *debug, *explain
  - *synapse sub-commands: status, debug, domains, session, reload
  - Conforme ao DESIGN doc section 15

- **`.synapse/agent-*`** — L2 per-agent domain files (12 arquivos)
  - `agent-dev`, `agent-qa`, `agent-architect`, `agent-pm`, `agent-po`, `agent-sm`
  - `agent-devops`, `agent-analyst`, `agent-data-engineer`, `agent-ux`
  - `agent-aios-master`, `agent-squad-creator`
  - Cada arquivo: authority boundaries + domain rules
  - Derivados dos agent definitions em `.aios-core/development/agents/`

- **`.synapse/workflow-*`** — L3 per-workflow domain files (3 arquivos)
  - `workflow-story-dev` — Story Development Cycle rules
  - `workflow-epic-create` — Epic creation workflow rules
  - `workflow-arch-review` — Architecture review workflow rules
  - Phase-aware rules conforme DESIGN doc section 8

- **`.synapse/sessions/`** — Empty directory (gitignored)
- **`.synapse/cache/`** — Empty directory (gitignored)

- **Constitution Generator Script**
  - `.aios-core/core/synapse/scripts/generate-constitution.js`
  - Le `.aios-core/constitution.md`, extrai artigos
  - Gera `.synapse/constitution` no formato KEY=VALUE
  - Pode ser executado manualmente: `node .aios-core/core/synapse/scripts/generate-constitution.js`

- **Unit Tests** para o constitution generator

### OUT of Scope

- Hook entry point (SYN-7)
- SynapseEngine implementation (SYN-6)
- CRUD commands for domain management (SYN-9) — content files sao criados manualmente/via script, nao via CRUD
- Skills/documentation (SYN-11)
- Memory bridge content (SYN-10)
- Squad domain files — squads criam seus proprios `.synapse/` (SYN-5 discovery)
- Custom user domains — usuarios criam via CRUD (SYN-9)

---

## Acceptance Criteria

1. **Manifest Complete and Valid**
   - `.synapse/manifest` existe e contem entries para ALL domains
   - Formato KEY=VALUE conforme SYN-1 domain-loader parser
   - Include
```