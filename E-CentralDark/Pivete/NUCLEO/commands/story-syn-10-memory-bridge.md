# COMANDO - story-syn-10-memory-bridge.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\story-syn-10-memory-bridge.md
**SHA:** 3a168578b5573849
**Timestamp:** 2026-08-28T02:02:40.496091
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: "@qa"
- - Mock feature gate: `jest.mock('../../pro/license/feature-gate')`
- Gate: PASS -> docs/qa/gates/syn-10-memory-bridge.yml
- Gate: PASS -> docs/qa/gates/syn-10-memory-bridge.yml

### Ouro Bruto (primeiros 5000 chars)
```
# Story SYN-10: Pro Memory Bridge (Feature-Gated MIS Consumer)

**Epic:** SYNAPSE Context Engine (SYN)
**Story ID:** SYN-10
**Priority:** Medium
**Points:** 8
**Effort:** 8-10 hours
**Status:** Ready for Review
**Type:** Feature
**Lead:** @dev (Dex)
**Depends On:** SYN-6 (SynapseEngine Orchestrator), MIS-6 (Pipeline Integration — Done), PRO-6 (feature-gate.js — In Progress)
**Repository:** aios-core + pro (single PR in aios-core with pro submodule update)
**Wave:** 3 (Pro + Polish)

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [manual-review, coderabbit-cli, unit-tests]
```

---

## User Story

**Como** motor SYNAPSE em modo Pro,
**Quero** um memory bridge que consuma a API do MIS (Memory Intelligence System) para injetar memorias relevantes no contexto per-prompt via feature gate,
**Para** que agentes tenham acesso a conhecimento persistente (gotchas, padroes, decisoes passadas) adaptado ao bracket de contexto, com graceful degradation quando pro nao esta disponivel.

---

## Objective

Implementar o memory bridge que conecta o SynapseEngine ao MIS existente:

1. **memory-bridge.js** — Modulo em `.aios-core/core/synapse/memory/` que consome `MemoryLoader` API
2. **synapse-memory-provider.js** — Provider em `pro/memory/` que implementa a logica de retrieval pro-gated
3. **Feature gate integration** — Usa `featureGate.isAvailable('pro.memory.synapse')` para ativar/desativar
4. **Bracket-aware retrieval** — Seleciona layer de memoria (metadata/chunks/full) baseado no bracket
5. **Agent-scoped memories** — Filtra memorias por sector preferences do agente ativo
6. **Engine integration** — Substitui o placeholder no `engine.js` (linhas 286-289)

---

## Scope

### IN Scope

- **Memory Bridge** (`.aios-core/core/synapse/memory/memory-bridge.js`)
  - Consumer-only: chama `MemoryLoader.loadForAgent()` e `MemoryLoader.queryMemories()`
  - Bracket-aware layer selection: FRESH → skip, MODERATE → metadata, DEPLETED → chunks, CRITICAL → full + handoff
  - Token budget respect: nunca excede o budget alocado pelo bracket
  - Graceful no-op: retorna array vazio quando pro indisponivel
  - Timeout: <15ms per engine.js layer budget
  - Error handling: catch-all, warn-and-proceed

- **Synapse Memory Provider** (`pro/memory/synapse-memory-provider.js`)
  - Feature-gated via `featureGate.require('pro.memory.synapse')`
  - Implementa `SynapseMemoryProvider.getMemories(agentId, bracket, tokenBudget)`
  - Uses `AGENT_SECTOR_PREFERENCES` from `memory-loader.js` for agent-scoped retrieval
  - Progressive disclosure: Layer 1 (~50 tokens), Layer 2 (~200 tokens), Layer 3 (~1000+ tokens)
  - Caches results per session to avoid repeated MIS queries

- **Engine Integration**
  - Replace placeholder at `engine.js` lines 286-289 with actual memory bridge call
  - Add memory hints to `previousLayers` for downstream layer access
  - Include memory section in `<synapse-rules>` XML output via formatter

- **Feature Registry Entry**
  - Add `pro.memory.synapse` to `pro/feature-registry.yaml`
  - Available in: Enterprise (all), Team (memory.*), Individual (explicit)

- **Unit Tests**
  - Memory bridge: feature gate mock, bracket selection, timeout, graceful degradation
  - Provider: retrieval, caching, agent-scoped filtering
  - Engine integration: memory hints in output, no-op without pro

### OUT of Scope

- Modifying MIS internals (MemoryLoader, MemoryRetriever, MemoryIndex)
- Modifying MemoryLoader API signature
- Creating new memory storage formats
- UI for memory management
- Self-learning integration (MIS-5 — separate, optional)
- Auto-evolution (MIS-7 — separate, optional)

---

## Acceptance Criteria

1. **Memory Bridge Module Exists**
   - `.aios-core/core/synapse/memory/memory-bridge.js` exists
   - Exports `MemoryBridge` class with `getMemoryHints(agentId, bracket, tokenBudget)` method
   - Returns array of memory hint objects `{ content, source, relevance, tokens }`
   - Returns empty array when pro is not available (graceful no-op)

2. **Feature Gate Integration**
   - Uses `featureGate.isAvailable('pro.memory.synapse')` to check availability
   - When feature unavailable: returns `[]` immediately, no error
   - When feature available: delegates to `SynapseMemoryProvider`
   - Feature gate check executes in <1ms

3. **Bracket-Aware Retrieval**
   - FRESH bracket: returns `[]` (no memory injection needed)
   - MODERATE bracket: Layer 1 metadata only (~50 tokens max)
   - DEPLETED bracket: Layer 2 relevant chunks (~200 tokens max)
   - CRITICAL bracket: Layer 3 full content + handoff context (~1000 tokens max)
   - Token count never exceeds `tokenBudget` parameter

4. **Agent-Scoped Memory**
   - Uses `AGENT_SECTOR_PREFERENCES` from `pro/memory/memory-loader.js` as source of truth
   - @dev gets procedural + semantic memories
   - @qa gets reflective + episodic memories
   - @architect gets semantic + reflective memories
   - Unknown agents get default (semantic) sector

5. **Synapse Memory 
```