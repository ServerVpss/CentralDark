# COMANDO - EPIC-SYN-INDEX.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-synapse-context-engine\EPIC-SYN-INDEX.md
**SHA:** 7ae19e2b1053131c
**Timestamp:** 2026-08-28T02:02:40.477489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Feature Gate:** `pro.memory.synapse` — controls memory integration. Without pro, SYNAPSE operates fully on static domain rules only.

### Riscos
- **Risk:** ZERO. Creates only new files in `.aios-core/core/synapse/`. No modifications to existing code.
- **Risk:** LOW. Consumes UAP session data as read-only.
- **Risk:** LOW. SYN-7 registers hook in settings (CARL disabled). SYN-8 creates `.synapse/` content.
- **Risk:** MEDIUM for SYN-10 (external dep on PRO-6). LOW for SYN-11/12.
- **Risk:** MEDIUM. Modifies UAP (cross-epic change). Diagnostics are new module.

### Ouro Bruto (primeiros 5000 chars)
```
# Epic SYN: SYNAPSE Context Engine

**Epic ID:** EPIC-SYN
**Status:** Active (12/13 stories done — Wave 4 in progress)
**Created:** 2026-02-10
**Author:** @pm (Morgan)
**Architect:** @architect (Aria)
**Architecture Model:** Open Core — 8-layer engine em `aios-core`, memoria inteligente feature-gated em `aios-pro`

**Architecture Documents:**
- [Architecture Recommendation](../../../architecture/SYNAPSE/SYNAPSE-ARCHITECTURE-RECOMMENDATION.md)
- [Hook/Skill/Command Analysis](../../../architecture/SYNAPSE/SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md)
- [ADR-001: 32 Architectural Decisions](../../../architecture/SYNAPSE/docs/ADR-001-SYNAPSE-UNIFIED-CONTEXT-ENGINE.md)
- [Design Document (API Spec)](../../../architecture/SYNAPSE/docs/DESIGN-SYNAPSE-ENGINE.md)
- [Epic Conflict Analysis](../../../architecture/SYNAPSE/docs/HANDOFF-SYNAPSE-EPIC-ANALYSIS.md)

---

## Overview

### Problem Statement

> **"Agents receive zero contextual rules at prompt time — every interaction starts from scratch"**

The AIOS currently has three disconnected context systems:

- **CARL** (external Python hook) — Per-prompt rule injection via KEY=VALUE domains, but monolithic (1073-line single file), Python-based (misaligned with Node.js stack), no agent/workflow awareness
- **MIS** (aios-pro) — Memory Intelligence System captures and retrieves persistent knowledge, but has no per-prompt injection mechanism beyond pipeline activation
- **UAP** (aios-core) — UnifiedActivationPipeline activates agents one-time, but provides no ongoing context during the conversation

**Result:** After activation, agents have no dynamic rules, no bracket-aware filtering, no domain-specific knowledge injection. The conversation degrades as context fills up without mitigation.

### Solution

Implement **SYNAPSE (Synkra Adaptive Processing & State Engine)** — a unified context engine that:

1. **Injects rules per-prompt** via 8-layer hierarchy (L0 Constitution through L7 Star-Commands)
2. **Adapts to context usage** via bracket tracking (FRESH/MODERATE/DEPLETED/CRITICAL)
3. **Integrates with agent state** via session management (active agent, workflow, task, squad)
4. **Consumes existing APIs** — reads from UAP (session state) and MIS (memory retrieval) without rewriting either
5. **Provides CRUD operations** for user-managed domains, rules, and star-commands
6. **Migrates from CARL** with full feature parity plus 8 new capabilities

### Consumer Architecture (NON-NEGOTIABLE)

SYNAPSE operates as a **consumer** of existing systems, NOT a substitute:

```
           CONSUMES (read-only)                    CONSUMES (read-only, pro-gated)
UAP ──────────────────────► SYNAPSE ◄──────────────────────── MIS
(session state)              (8-layer engine)                  (memory retrieval)
                                │
                                ▼ PRODUCES
                         <synapse-rules> XML
                         (injected per-prompt)
```

---

## Stories

| Story | Title | Priority | Complexity | Wave | Estimated | Status |
|-------|-------|----------|------------|------|-----------|--------|
| [SYN-1](story-syn-1-domain-loader.md) | Domain Loader + Manifest Parser | Critical | Medium | 0 | 6-8h | ✅ Done |
| [SYN-2](story-syn-2-session-manager.md) | Session Manager | Critical | Medium | 0 | 6-8h | ✅ Done |
| [SYN-3](story-syn-3-context-bracket.md) | Context Bracket Tracker | Critical | Medium | 0 | 4-6h | ✅ Done |
| [SYN-4](story-syn-4-layers-l0-l3.md) | Layer Processors L0-L3 (Constitution, Global, Agent, Workflow) | Critical | High | 1 | 8-10h | ✅ Done |
| [SYN-5](story-syn-5-layers-l4-l7.md) | Layer Processors L4-L7 (Task, Squad, Keyword, Star-Command) | Critical | High | 1 | 8-10h | ✅ Done |
| [SYN-6](story-syn-6-engine-orchestrator.md) | SynapseEngine Orchestrator + Output Formatter | Critical | High | 1 | 6-8h | ✅ Done |
| [SYN-7](story-syn-7-hook-entry.md) | Hook Entry Point + Registration | High | Medium | 2 | 4-6h | ✅ Done |
| [SYN-8](story-syn-8-domain-content.md) | Domain Content Files (.synapse/ population) | High | Medium | 2 | 6-8h | ✅ Done |
| [SYN-9](story-syn-9-crud-commands.md) | CRUD Commands (.claude/commands/synapse/) | High | Medium | 2 | 6-8h | ✅ Done |
| [SYN-10](story-syn-10-memory-bridge.md) | Pro Memory Bridge (feature-gated MIS consumer) | Medium | High | 3 | 8-10h | ✅ Done |
| [SYN-11](story-syn-11-skills-docs.md) | Skills + Help Documentation | Medium | Low | 3 | 4-6h | ✅ Done |
| [SYN-12](story-syn-12-performance-e2e.md) | Performance Optimization + E2E Testing | Medium | High | 3 | 6-8h | ✅ Done |
| [SYN-13](story-syn-13-session-bridge-diagnostics.md) | UAP Session Bridge + SYNAPSE Diagnostics | Critical | High | 4 | 8-10h | 🔄 InProgress |

**Total Estimated:** 80-106 hours (13 stories across 5 waves)

---

## Waves

### Wave 0: Foundation
**Risk:** ZERO. Creates only new files in `.aios-core/core/synapse/`. No modifications to existing code.
**Parallelizable:** SYN-1, SYN-2, SYN-3 are fully independent.

| Story | Delive
```