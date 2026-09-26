# COMANDO - squads-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\squads-guide.md
**SHA:** d53b451ae274ac58
**Timestamp:** 2026-08-28T02:02:36.461093
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 3. Run: *validate-squad my-squad

### Gaps
- Legacy squads use `config.yaml` instead of `squad.yaml` and may be missing:

### Ouro Bruto (primeiros 5000 chars)
```
# Squad Development Guide

> **EN** | [PT](../pt/guides/squads-guide.md) | [ES](../es/guides/squads-guide.md)

---

Complete guide for creating, validating, publishing, and managing Squads in AIOS.

> **AIOS Squads:** Equipes de AI agents trabalhando com você

## Table of Contents

1. [What is a Squad?](#what-is-a-squad)
2. [Quick Start](#quick-start)
3. [Squad Architecture](#squad-architecture)
4. [Creating Squads](#creating-squads)
5. [Squad Designer](#squad-designer)
6. [Analyzing & Extending Squads](#analyzing--extending-squads) *(NEW)*
7. [Validating Squads](#validating-squads)
8. [Publishing & Distribution](#publishing--distribution)
9. [Migration from Legacy Format](#migration-from-legacy-format)
10. [Squad Loader & Resolution](#squad-loader--resolution)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## What is a Squad?

Squads are modular teams of AI agents that extend AIOS functionality. Each squad is a self-contained package containing:

| Component | Purpose |
|-----------|---------|
| **Agents** | Domain-specific AI personas |
| **Tasks** | Executable workflows (TASK-FORMAT-SPEC-V1) |
| **Workflows** | Multi-step orchestrations |
| **Config** | Coding standards, tech stack, source tree |
| **Templates** | Document generation templates |
| **Tools** | Custom tool integrations |

### Distribution Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    SQUAD DISTRIBUTION                        │
├─────────────────────────────────────────────────────────────┤
│  Level 1: LOCAL        → ./squads/           (Private)      │
│  Level 2: AIOS-SQUADS  → github.com/SynkraAI (Public/Free)  │
│  Level 3: SYNKRA API   → api.synkra.dev      (Marketplace)  │
└─────────────────────────────────────────────────────────────┘
```

### Official Squads

| Squad | Version | Description |
|-------|---------|-------------|
| [etl-squad](https://github.com/SynkraAI/aios-squads/tree/main/etl) | 2.0.0 | Data collection and transformation |
| [creator-squad](https://github.com/SynkraAI/aios-squads/tree/main/creator) | 1.0.0 | Content generation utilities |

---

## Quick Start

### Prerequisites

- Node.js 18+
- AIOS project initialized (`.aios-core/` exists)
- Git for version control

### Option 1: Guided Design (Recommended)

```bash
# Activate squad-creator agent
@squad-creator

# Design squad from your documentation
*design-squad --docs ./docs/prd/my-project.md

# Review recommendations, then create
*create-squad my-squad --from-design

# Validate before use
*validate-squad my-squad
```

### Option 2: Direct Creation

```bash
@squad-creator

# Create with interactive prompts
*create-squad my-domain-squad

# Or specify template
*create-squad my-squad --template etl
```

---

## Squad Architecture

### Directory Structure

```
./squads/my-squad/
├── squad.yaml              # Manifest (required)
├── README.md               # Documentation
├── LICENSE                 # License file
├── config/
│   ├── coding-standards.md # Code style rules
│   ├── tech-stack.md       # Technologies used
│   └── source-tree.md      # Directory structure
├── agents/
│   └── my-agent.md         # Agent definitions
├── tasks/
│   └── my-task.md          # Task definitions (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Multi-step workflows
├── checklists/
│   └── review-checklist.md # Validation checklists
├── templates/
│   └── report-template.md  # Document templates
├── tools/
│   └── custom-tool.js      # Custom tool integrations
├── scripts/
│   └── setup.js            # Utility scripts
└── data/
    └── reference-data.json # Static data files
```

### Squad Manifest (squad.yaml)

```yaml
# Required fields
name: my-squad                    # kebab-case, unique identifier
version: 1.0.0                    # Semantic versioning
description: What this squad does

# Metadata
author: Your Name <email@example.com>
license: MIT
slashPrefix: my                   # Command prefix for IDE

# AIOS compatibility
aios:
  minVersion: "2.1.0"
  type: squad

# Components declaration
components:
  agents:
    - my-agent.md
  tasks:
    - my-task.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

# Configuration inheritance
config:
  extends: extend                 # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependencies
dependencies:
  node: []                        # npm packages
  python: []                      # pip packages
  squads: []                      # Other squads

# Discovery tags
tags:
  - domain-specific
  - automation
```

### Task-First Architecture

Squads follow **task-first architecture** where tasks are the primary entry point:

```
User Request → Task → Agent Execution → Output
                ↓
           Workflow (if multi-step)
```

Tasks must follow [TASK-FORMAT-SPECIFICATION-V1](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICA
```