# COMANDO - AIOS-COMPLETE-CROSS-REFERENCE-ANALYSIS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\AIOS-COMPLETE-CROSS-REFERENCE-ANALYSIS.md
**SHA:** e2373682ccd18907
**Timestamp:** 2026-08-28T02:02:37.269432
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Tasks are the atomic unit of work. The framework uses a strict pattern:

### Gaps
- | `agent-assignment-resolver.js` | Resolve `{TODO: Agent Name}` placeholders |
- | `task-identifier-resolver.js` | Resolve `{TODO: task identifier}` placeholders |

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Complete Cross-Reference Analysis

**Story:** AIOS-XREF-001
**Generated:** 2026-02-05
**Owners:** @analyst (Atlas) + @architect (Aria)
**Scope:** All ~881 framework artifacts across 25 entity types
**Status:** COMPLETE

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Aggregate Statistics](#2-aggregate-statistics)
3. [Per-Agent Ecosystem Diagrams](#3-per-agent-ecosystem-diagrams)
4. [Phase Summaries](#4-phase-summaries)
5. [Complete Orphan Analysis](#5-complete-orphan-analysis)
6. [Complete Broken Reference Report](#6-complete-broken-reference-report)
7. [Architectural Observations](#7-architectural-observations)
8. [Recommendations](#8-recommendations)
9. [Phase Detail Files](#9-phase-detail-files)

---

## 1. Executive Summary

This document is the result of a comprehensive cross-reference analysis of every artifact in the Synkra AIOS framework. The analysis was conducted in 7 phases, examining 25 entity types totaling approximately 745 tracked files.

### Key Findings

| Finding | Severity | Details |
|---------|----------|---------|
| **@qa agent has 9 broken task references** | CRITICAL | Task dependency names in `agents/qa.md` don't match actual filenames (missing `qa-` prefix) |
| **3 duplicate task file pairs** | MEDIUM | `create-next-story`/`sm-create-next-story`, `apply-qa-fixes`/`dev-apply-qa-fixes`, `validate-next-story`/`dev-validate-next-story` |
| **3 elicitation file duplicates** | MEDIUM | Identical files in `core/elicitation/` and `elicitation/` |
| **3 phantom/missing core modules** | MEDIUM | `memory-query.js`, `session-memory.js`, `security-checker` referenced but don't exist (try/catch guarded) |
| **19 confirmed orphaned files** | LOW | Files with no active consumers (7 SQL templates, 5 infra scripts, 5 deprecated standards, 2 core modules) |
| **3 missing/empty directories** | LOW | `agent-teams/`, `tools/` (empty), `processes/` do not exist |
| **5 deprecated standards docs** | LOW | Old Livro de Ouro versions superseded by V2.1-COMPLETE |
| **31 weak-reference files** | INFO | Referenced only in passive registries, not actively consumed |
| **Config system in transition** | INFO | Migrating from monolithic `core-config.yaml` to 4-level L1-L4 hierarchy |

### Health Score

| Domain | Score | Notes |
|--------|-------|-------|
| Workflows (12) | **95%** | All workflows well-structured with clear agent assignments |
| Tasks (191) | **90%** | 36 in workflows + 155 on-demand. @qa refs broken. |
| Templates (92) | **92%** | 7 SQL orphans, 27 weak refs (most are runtime-loaded) |
| Checklists (16) | **100%** | All connected to consuming agents/tasks |
| Scripts (37) | **86%** | 5 dead migration scripts, all others active |
| Infrastructure (115) | **92%** | 5 confirmed + 4 likely orphans, clean layering |
| Core Modules (130) | **94%** | 7 orphaned/partial, 3 phantom deps, health-check well-contained |
| Supporting Systems (111) | **90%** | 3 empty dirs, 3 duplicates, 5 deprecated docs |

---

## 2. Aggregate Statistics

### Total Artifact Counts

| Entity Type | Count | Location |
|-------------|-------|----------|
| Agents | 12 | `.aios-core/development/agents/` |
| Tasks | 191 | `.aios-core/development/tasks/` |
| Workflows | 12 | `.aios-core/development/workflows/` |
| Product Templates | 92 | `.aios-core/product/templates/` |
| Development Templates | 29 | `.aios-core/development/templates/` |
| Product Checklists | 16 | `.aios-core/product/checklists/` |
| Product Data | 16 | `.aios-core/product/data/` |
| Framework Data | 8 | `.aios-core/data/` |
| Dev Scripts | 37 | `.aios-core/development/scripts/` |
| Infra Scripts | 90 | `.aios-core/infrastructure/scripts/` |
| Infra Integrations | 5 | `.aios-core/infrastructure/integrations/` |
| Infra Tools | 15 | `.aios-core/infrastructure/tools/` |
| Infra Templates | 15 | `.aios-core/infrastructure/templates/` |
| Core Modules | 130 | `.aios-core/core/` |
| CLI Commands | 37 | `.aios-core/cli/commands/` |
| Schemas | 6 | `.aios-core/schemas/` |
| Manifests | 4 | `.aios-core/manifests/` |
| Monitor Hooks | 10 | `.aios-core/monitor/hooks/` |
| Quality Gates | 10 | `.aios-core/core/quality-gates/` |
| Quality Metrics | 4 | `.aios-core/quality/` |
| Workflow Intelligence | 19 | `.aios-core/workflow-intelligence/` |
| Docs/Standards | 16 | `.aios-core/docs/standards/` |
| Root Config | 8 | `.aios-core/` root |
| Elicitation | 8 | `.aios-core/core/elicitation/` + `.aios-core/elicitation/` |
| **TOTAL** | **~745** | |

### Cross-Reference Metrics

| Metric | Count |
|--------|-------|
| Total unique tasks in workflows | 36 |
| Total on-demand-only tasks | 155 |
| Total agent commands | ~180 |
| Agent-to-task connections | 280+ |
| Template-to-task connections | 127 |
| Most-connected file | `po-master-checklist.md` (12+ task refs, 6 workflow refs) |
| Most-connected agent | @dev (10 scripts, 25+ tasks) |
| Largest subsystem | health-check (35 files) |

---

## 3. Per-Agent Ecosystem Diagrams

### 3.1 @dev (Dex) -
```