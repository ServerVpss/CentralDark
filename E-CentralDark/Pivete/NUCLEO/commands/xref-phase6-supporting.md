# COMANDO - xref-phase6-supporting.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\xref-phase6-supporting.md
**SHA:** a2193abfa1a2ab79
**Timestamp:** 2026-08-28T02:02:37.765132
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- The hooks follow a standard event pattern: each hook enriches event data via `lib/enrich.py` and sends it to a monitor server via `lib/send_event.py`. Hooks correspond to Claude Code lifecycle events.

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Cross-Reference Phase 6: Supporting Systems Analysis

> **Generated:** 2026-02-05
> **Scope:** All supporting systems in `.aios-core/`
> **Total Files Analyzed:** ~130 files across 12 subsystems

---

## Table of Contents

1. [Workflow Intelligence System](#1-workflow-intelligence-system)
2. [Monitor Hooks System](#2-monitor-hooks-system)
3. [Quality Gates System](#3-quality-gates-system)
4. [Schemas System](#4-schemas-system)
5. [CLI Commands System](#5-cli-commands-system)
6. [Agent Teams System](#6-agent-teams-system)
7. [Tools Config System](#7-tools-config-system)
8. [Manifests System](#8-manifests-system)
9. [Elicitation System](#9-elicitation-system)
10. [Docs/Standards System](#10-docsstandards-system)
11. [Processes System](#11-processes-system)
12. [Root Config System](#12-root-config-system)
13. [Overall Supporting Systems Summary](#13-overall-supporting-systems-summary)
14. [Orphaned Files Across All Systems](#14-orphaned-files-across-all-systems)
15. [Supporting Systems Interconnection Map](#15-supporting-systems-interconnection-map)

---

## 1. Workflow Intelligence System

**Location:** `.aios-core/workflow-intelligence/`
**Total Files:** 19
**Purpose:** Provides intelligent workflow analysis, suggestions, pattern learning, and confidence scoring for the AIOS agent orchestration system.

### Architecture

The Workflow Intelligence System (WIS) is organized into three submodules:

- **engine/** -- Core analysis engines (confidence scoring, wave analysis, suggestion generation, output formatting)
- **learning/** -- Pattern capture, storage, validation, semantic search, QA feedback, and gotcha registry
- **registry/** -- Workflow registry for cataloging available workflows

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `workflow-intelligence/index.js` | Main entry point; exports all WIS modules | CLI commands, orchestration core, tests | `engine/*`, `learning/*`, `registry/*` | No |
| `engine/confidence-scorer.js` | Calculates confidence scores for workflow suggestions | `suggestion-engine.js`, tests | Consumes workflow data | No |
| `engine/suggestion-engine.js` | Generates workflow suggestions based on context | `index.js`, tests | Uses `confidence-scorer`, `workflow-registry` | No |
| `engine/wave-analyzer.js` | Analyzes wave-based execution patterns | `index.js`, wave-executor, tests | Used by `wave-executor.js` in core | No |
| `engine/output-formatter.js` | Formats WIS output for CLI display | `index.js`, CLI layer | Standalone formatting utility | No |
| `learning/index.js` | Entry point for pattern learning subsystem | `index.js`, tests | Exports `PatternCapture`, `PatternValidator`, `PatternStore` | No |
| `learning/pattern-capture.js` | Captures session patterns (commands, agent sequences) | `learning/index.js`, `capture-hook.js` | Unit tests in `tests/unit/workflow-intelligence/` | No |
| `learning/pattern-store.js` | Persists and retrieves captured patterns | `learning/index.js`, tests | Filesystem-based storage | No |
| `learning/pattern-validator.js` | Validates captured patterns before storage | `learning/index.js`, tests | Validates against schema rules | No |
| `learning/capture-hook.js` | Hook to automatically capture patterns during sessions | `index.js` | References `workflow-intelligence/learning` | No |
| `learning/gotcha-registry.js` | Stores common pitfalls and gotchas per workflow | `learning/index.js` | Referenced by QA feedback | No |
| `learning/qa-feedback.js` | Integrates QA feedback into learning system | `learning/index.js` | References `gotcha-registry` | No |
| `learning/semantic-search.js` | Semantic search over captured patterns | `learning/index.js` | Used by suggestion engine | No |
| `registry/workflow-registry.js` | Central registry of all available workflows | `index.js`, `suggestion-engine.js` | Loads from `.aios-core/development/workflows/` | No |
| `__tests__/confidence-scorer.test.js` | Unit tests for confidence scorer | Test runner | Tests `engine/confidence-scorer.js` | No |
| `__tests__/wave-analyzer.test.js` | Unit tests for wave analyzer | Test runner | Tests `engine/wave-analyzer.js` | No |
| `__tests__/workflow-registry.test.js` | Unit tests for workflow registry | Test runner | Tests `registry/workflow-registry.js` | No |
| `__tests__/suggestion-engine.test.js` | Unit tests for suggestion engine | Test runner | Tests `engine/suggestion-engine.js` | No |
| `__tests__/integration.test.js` | Integration tests for full WIS | Test runner | Tests cross-module interactions | No |

### External References (26 files reference this system)

- **Core orchestration:** `core/orchestration/executors/epic-7-executor.js`, `core/execution/wave-executor.js`
- **Tests:** `tests/core/build-orchestrator.test.js`, `tests/core/wave-executor.test.js`, multiple unit/integration tests
- **Architecture docs:** `docs/architecture/ade-architecture.md`, `docs/architecture/ADE-EPIC8-H
```