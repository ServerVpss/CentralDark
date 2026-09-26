# COMANDO - xref-phase3-scripts.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\xref-phase3-scripts.md
**SHA:** 18bfc30ebe4662a9
**Timestamp:** 2026-08-28T02:02:37.620342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- | 9 | `agent-assignment-resolver.js` | Resolves `{TODO: Agent Name}` placeholders in task files based on prefix mapping | `fs`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
- | 21 | `task-identifier-resolver.js` | Resolves `{TODO: task identifier}` placeholders in 114 task files | `fs`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
- | `agent-assignment-resolver.js` | Resolve `{TODO: Agent Name}` in 114 tasks (Story 6.1.7.1) | **No** -- one-time bulk fix |
- | `task-identifier-resolver.js` | Resolve `{TODO: task identifier}` in 114 tasks (Story 6.1.7.1) | **No** -- one-time bulk fix |

### Ouro Bruto (primeiros 5000 chars)
```
# Cross-Reference Phase 3: Development Scripts & Greeting System

> **Generated:** 2026-02-05
> **Scope:** `.aios-core/development/scripts/` (38 files)
> **Methodology:** Full source reading + codebase-wide grep for each script filename

---

## Table of Contents

1. [Complete Script Inventory](#1-complete-script-inventory)
2. [Greeting System Architecture](#2-greeting-system-architecture)
3. [Dependency Tree Diagram](#3-dependency-tree-diagram)
4. [Orphaned Scripts Analysis](#4-orphaned-scripts-analysis)
5. [Script Categories & Agent Mapping](#5-script-categories--agent-mapping)

---

## 1. Complete Script Inventory

### 1.1 Top-Level Scripts (28 files)

| # | File | Purpose | Dependencies (imports) | Callers / References | Agent(s) | Orphan? |
|---|------|---------|----------------------|---------------------|----------|---------|
| 1 | `greeting-builder.js` | Core GreetingBuilder class -- builds contextual greetings based on session type, git config, project status, command visibility | `context-detector`, `git-config-detector`, `workflow-navigator`, `greeting-preference-manager`, `project-status-loader`, `PermissionMode`, `js-yaml` | 46 files: all 12 agent .md files, `generate-greeting.js`, `test-greeting-system.js`, `/greet` slash command, tests, docs, `install-manifest.yaml` | ALL agents (12/12) | No |
| 2 | `generate-greeting.js` | CLI wrapper/orchestrator for greeting generation -- loads context from filesystem then delegates to GreetingBuilder | `greeting-builder`, `session-context-loader`, `project-status-loader`, `agent-config-loader`, `js-yaml` | 13 files: agent .md files (devops, data-engineer, ux-design-expert), tests, docs, `install-manifest.yaml` | @devops, @data-engineer, @ux-design-expert | No |
| 3 | `greeting-preference-manager.js` | Manages user greeting preference (auto/minimal/named/archetypal) via `core-config.yaml` | `js-yaml` | 13 files: `greeting-builder.js`, `greeting-config-cli.js`, `generate-greeting.js`, tests, docs | All (via greeting-builder) | No |
| 4 | `greeting-config-cli.js` | Standalone CLI for get/set greeting preferences | `greeting-preference-manager` | Self-referencing only in docs | CLI users | No |
| 5 | `apply-inline-greeting-all-agents.js` | Batch script to apply inline greeting logic to all 11 agents (Story 6.1.2.5-T1) | `fs`, `path` | `install-manifest.yaml`, coverage reports | One-time migration tool | Low-use |
| 6 | `test-greeting-system.js` | Manual test script for greeting system with mock agents | `greeting-builder`, `js-yaml` | `install-manifest.yaml`, coverage | Testing/debugging | Low-use |
| 7 | `agent-config-loader.js` | Loads agent-specific config with lazy loading, performance tracking, and cache | `js-yaml`, `config-cache`, `performance-tracker` | 20 files: `generate-greeting.js`, `config-loader.js`, `service-registry.json`, tests, docs | All (via generate-greeting pipeline) | No |
| 8 | `audit-agent-config.js` | Audit script analyzing which `core-config.yaml` sections each agent requires | `js-yaml` | `install-manifest.yaml`, docs | DevOps/analysis tool | Low-use |
| 9 | `agent-assignment-resolver.js` | Resolves `{TODO: Agent Name}` placeholders in task files based on prefix mapping | `fs`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
| 10 | `agent-exit-hooks.js` | Defines hook system for workflow context persistence on command completion | `context-detector` | `install-manifest.yaml`, docs | Framework integration (Story 6.1.6) | Low-use |
| 11 | `batch-update-agents-session-context.js` | Batch updates 8 agents with session context loader integration (Story 6.1.2.6.2) | `fs.promises`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
| 12 | `backlog-manager.js` | Manages technical debt, follow-ups, and enhancements backlog with prioritization | `fs.promises` | 28 files: `po-backlog-add.md`, `dev-backlog-debt.md`, `qa-backlog-add-followup.md`, story tasks, docs | @po, @dev, @qa | No |
| 13 | `decision-context.js` | DecisionContext class tracking decisions, files, tests during yolo mode execution | `child_process`, `path` | 17 files: `decision-recorder.js`, `decision-log-generator.js`, `dev-develop-story.md`, agent dev.md, tests | @dev (yolo mode) | No |
| 14 | `decision-log-generator.js` | Generates markdown decision logs from DecisionContext data | `fs.promises`, `path` | 17 files: `decision-recorder.js`, dev tasks, tests | @dev (yolo mode) | No |
| 15 | `decision-log-indexer.js` | Maintains index file of all decision logs for discovery | `fs.promises`, `path`, `js-yaml` | `decision-recorder.js`, tests | @dev (yolo mode) | No |
| 16 | `decision-recorder.js` | Singleton API for recording decisions during yolo mode -- manages global context | `decision-context`, `decision-log-generator`, `js-yaml` | `dev-develop-story.md`, tests | @dev (yolo mode) | No |
| 17 | `dev-context-loader.js` | Optimized file loading for @dev agent with smart caching and summarization | `fs.promises`, `path`, `js-yaml` | 9 f
```