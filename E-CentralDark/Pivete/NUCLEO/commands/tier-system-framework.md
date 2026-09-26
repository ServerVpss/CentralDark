# COMANDO - tier-system-framework.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\data\tier-system-framework.md
**SHA:** 0f2dded0302d1233
**Timestamp:** 2026-08-28T02:02:03.418972
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - pattern: 'audit|analyze|diagnose|assess'
- - pattern: 'create|write|build|design'
- - pattern: 'systematize|process|framework'
- - pattern: 'adapt|format|optimize for'
- - pattern: 'validate|check|review'
- pattern: 'Tier 1 requests framework from Tier 2'
- pattern: 'Primary output adapted for specific format'

### Contratos
- gate: 'diagnosis-complete'
- gate: 'primary-output-complete'
- gate: 'system-validated'
- gate: 'format-optimized'

### Ouro Bruto (primeiros 5000 chars)
```
# Tier System Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for organizing agents by expertise level and orchestrating their collaboration.

---

## 1. Overview

The Tier System organizes agents hierarchically based on their role in the workflow:

```text
┌─────────────────────────────────────────┐
│  ORCHESTRATOR (coordinates all tiers)    │
├─────────────────────────────────────────┤
│  TIER 0: Foundation & Diagnosis          │
│  - ALWAYS runs first                     │
│  - Establishes baseline understanding    │
├─────────────────────────────────────────┤
│  TIER 1: Core Execution                  │
│  - Primary domain experts                │
│  - Highest proven results                │
├─────────────────────────────────────────┤
│  TIER 2: Systematizers                   │
│  - Framework creators                    │
│  - Process specialists                   │
├─────────────────────────────────────────┤
│  TIER 3: Format Specialists              │
│  - Channel-specific experts              │
│  - Output format specialists             │
├─────────────────────────────────────────┤
│  TOOLS: Utility Functions                │
│  - Checklists, validators                │
│  - Not agents, applied after creation    │
└─────────────────────────────────────────┘
```

---

## 2. Tier Definitions

### Orchestrator

**Role:** Coordinates all tiers, routes requests, manages workflow.

```yaml
orchestrator:
  role: 'Workflow coordinator and router'
  responsibilities:
    - 'Route requests to appropriate tier'
    - 'Manage handoffs between agents'
    - 'Ensure quality gates are applied'
    - 'Maintain workflow state'
  when_to_activate: 'Always - serves as entry point'
```

### Tier 0: Foundation & Diagnosis

**Role:** Always runs first. Establishes baseline understanding.

```yaml
tier_0:
  name: 'Foundation & Diagnosis'
  purpose: 'Establish baseline before any execution'
  characteristics:
    - 'ALWAYS runs first in workflow'
    - 'Diagnostic and analytical focus'
    - 'Creates shared understanding'
    - 'Identifies constraints and opportunities'
  examples:
    - 'Auditor: Assesses current state'
    - 'Diagnostician: Identifies problems'
    - 'Researcher: Gathers foundational data'
    - 'Analyst: Segments and categorizes'
```

### Tier 1: Core Execution

**Role:** Primary domain experts with proven track record.

```yaml
tier_1:
  name: 'Core Execution'
  purpose: 'Primary experts for main deliverables'
  characteristics:
    - 'Highest proven results in domain'
    - 'Deep expertise, documented frameworks'
    - 'Used for primary output creation'
    - 'Strong authority and credibility'
  selection_criteria:
    - 'Documented track record'
    - 'Verifiable results'
    - 'Well-documented methodology'
    - 'Industry recognition'
```

### Tier 2: Systematizers

**Role:** Framework creators and process specialists.

```yaml
tier_2:
  name: 'Systematizers'
  purpose: 'Create systems and processes'
  characteristics:
    - 'Framework and methodology creators'
    - 'Process-oriented thinking'
    - 'Replicable, teachable approaches'
    - 'Bridge theory and practice'
  examples:
    - 'Process architect'
    - 'Methodology developer'
    - 'System designer'
    - 'Framework specialist'
```

### Tier 3: Format Specialists

**Role:** Channel and format-specific experts.

```yaml
tier_3:
  name: 'Format Specialists'
  purpose: 'Optimize for specific channels/formats'
  characteristics:
    - 'Deep expertise in specific format'
    - 'Channel-specific optimization'
    - 'Applied after core content exists'
    - 'Enhancement and adaptation focus'
  examples:
    - 'Video script specialist'
    - 'Email sequence specialist'
    - 'Landing page specialist'
    - 'Social media specialist'
```

### Tools

**Role:** Utility functions applied after creation.

```yaml
tools:
  name: 'Tools'
  purpose: 'Post-creation validation and enhancement'
  characteristics:
    - 'NOT agents, just utilities'
    - 'Applied AFTER main work is done'
    - 'Checklist-based validation'
    - 'Enhancement triggers'
  usage: 'Run via *tool-name command after creation'
  examples:
    - 'Quality checklist'
    - 'Trigger library'
    - 'Validation framework'
    - 'Enhancement patterns'
```

---

## 3. Config.yaml Structure

Standard configuration for tier-based squads:

```yaml
# Squad Configuration Template
pack:
  name: '{squad-name}'
  title: '{Human-Readable Title}'
  version: 'X.Y.Z'
  author: '{Team}'
  description: 'Brief description (< 200 chars)'
  icon: '{emoji}'
  slash_prefix: '{prefix}'

# Changelog (document all changes)
# Format: vX.Y.Z (YYYY-MM-DD) - Description

# Integration settings
integration:
  enabled: false
  log_source: true
  fallback_behavior: 'graceful'

# Agents organized by tier
agents:
  # Orchestrator
  - id: '{prefix}-chief'
    name: '{Role} Chief'
    role: 'Orchestrator - routing and coordination'
    tier: orchestrator
    version: 'X.Y.Z'

  # Tier 0 - Foun
```