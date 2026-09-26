# COMANDO - story-syn-11-skills-docs.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\story-syn-11-skills-docs.md
**SHA:** b538929b3a0e302d
**Timestamp:** 2026-08-28T02:02:40.508453
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Quick Start: Como verificar se esta ativo, comandos basicos

### Contratos
- quality_gate: "@architect"
- Gate: **PASS** — `docs/qa/gates/syn-11-skills-docs.yml`

### Ouro Bruto (primeiros 5000 chars)
```
# Story SYN-11: Skills + Help Documentation

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-11
**Priority:** Medium
**Points:** 3
**Effort:** 4-6 hours
**Status:** Ready for Review
**Type:** Feature
**Lead:** @dev (Dex) + @architect (Aria)
**Depends On:** SYN-7 (Hook Entry Point — Done)
**Repository:** aios-core
**Wave:** 3 (Pro + Polish)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [manual-review, coderabbit-cli]
```

---

## User Story

**Como** usuario do AIOS,
**Quero** uma skill SYNAPSE com documentacao completa (overview, guias de referencia, troubleshooting) acessivel via `/synapse` no Claude Code,
**Para** entender como o motor SYNAPSE funciona, quais dominios existem, como criar/gerenciar dominios customizados, e como diagnosticar problemas — sem precisar ler codigo fonte.

---

## Objective

Criar a skill SYNAPSE em `.claude/skills/synapse/` com:

1. **SKILL.md** — Overview + router com frontmatter para discovery
2. **5 reference guides** — Documentacao detalhada por topico
3. **Assets** — Templates para usuario criar dominios customizados
4. **Integration** — Links para CRUD commands (SYN-9) e star-commands (SYN-7/L7)

---

## Scope

### IN Scope

- **`.claude/skills/synapse/SKILL.md`** — Main skill file
  - Frontmatter com `name: synapse` e `description` (third-person format)
  - Overview: O que e SYNAPSE, como funciona, arquitetura 4-layer
  - Quick Start: Como verificar se esta ativo, comandos basicos
  - Router: Links para references/ e commands/

- **`.claude/skills/synapse/references/domains.md`** — Domain Guide
  - O que sao dominios, tipos (L0-L7), formato KEY=VALUE
  - Como o manifest funciona
  - Como criar dominios customizados (link para `*synapse create`)
  - Exemplos de cada tipo de dominio

- **`.claude/skills/synapse/references/commands.md`** — Commands Reference
  - Todos os star-commands: *brief, *dev, *review, *plan, *discuss, *debug, *explain
  - Sub-commands: *synapse help/status/debug/domains/session/reload
  - CRUD commands: *synapse create/add/edit/toggle (links para SYN-9 tasks)
  - Exemplos de uso

- **`.claude/skills/synapse/references/manifest.md`** — Manifest Reference
  - Formato KEY=VALUE completo
  - Todas as keys validas (STATE, ALWAYS_ON, NON_NEGOTIABLE, AGENT_TRIGGER, etc.)
  - Como adicionar/modificar entries
  - Validacao e troubleshooting

- **`.claude/skills/synapse/references/brackets.md`** — Context Brackets Guide
  - 4 brackets: FRESH, MODERATE, DEPLETED, CRITICAL
  - Como sao calculados
  - Token budgets por bracket
  - Como afetam a injecao de regras e memorias

- **`.claude/skills/synapse/references/layers.md`** — 8-Layer Architecture Guide
  - L0 Constitution (NON_NEGOTIABLE, ALWAYS_ON)
  - L1 Global + Context
  - L2 Agent-scoped
  - L3 Workflow-scoped
  - L4 Task context
  - L5 Squad discovery
  - L6 Keyword (RECALL)
  - L7 Star-commands
  - Prioridade e conflito entre layers

- **`.claude/skills/synapse/assets/`** — Reference links to existing templates (IDS: REUSE)
  - `domain-template` and `manifest-entry-template` already exist at `.claude/commands/synapse/templates/`
  - Assets section in SKILL.md must link to the existing templates, NOT duplicate them
  - If user-facing copies are needed, create symlinks or a README pointing to `../../commands/synapse/templates/`

### OUT of Scope

- Engine implementation (SYN-1 through SYN-6)
- CRUD command implementation (SYN-9 — Done)
- Hook entry point (SYN-7 — Done)
- Memory bridge documentation (SYN-10 — will update after done)
- Performance benchmarks (SYN-12)
- Video tutorials or interactive guides
- Internationalization (documentation in Portuguese only where needed, English primary)

---

## Acceptance Criteria

1. **SKILL.md Exists and Discoverable**
   - `.claude/skills/synapse/SKILL.md` exists with valid frontmatter
   - `name: synapse` and `description` in third-person format
   - Claude Code can discover and load the skill via `/synapse`
   - Overview section explains SYNAPSE purpose and architecture
   - Quick Start section has actionable first steps

2. **5 Reference Guides Complete**
   - `references/domains.md` — Domain types (L0-L7), format, creation guide
   - `references/commands.md` — All star-commands and CRUD commands documented
   - `references/manifest.md` — Complete manifest format reference
   - `references/brackets.md` — 4 brackets, calculation, token budgets
   - `references/layers.md` — 8-layer hierarchy, priority, conflict resolution
   - Each guide is self-contained (can be read independently)

3. **Content Accuracy**
   - All domain types documented match actual `.synapse/` content (SYN-8)
   - All commands documented match actual CRUD tasks (SYN-9)
   - All star-commands documented match actual `.synapse/commands` file
   - Layer descriptions match engine implementation (SYN-4, SYN-5, SYN-6)
   - Bracket definitions match context-tracker (SYN-3)
   - No invented features or undocumented capabilities

4. **Asset Tem
```