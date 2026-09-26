# COMANDO - po-manage-story-backlog.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\po-manage-story-backlog.md
**SHA:** cf18517faca1fe37
**Timestamp:** 2026-08-28T02:02:06.656797
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - risk: 'LOW|MEDIUM|HIGH' # Risk if not done
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
tools:
  - git               # Track backlog file changes
  - context7          # Research backlog management best practices
checklists:
  - backlog-management-checklist.md
---

# manage-story-backlog

Manage the STORY-BACKLOG.md file to track follow-up tasks, technical debt, and optimization opportunities identified during story reviews, development, and QA processes.

## Purpose

The Story Backlog provides a centralized, structured way to:
- Track follow-up tasks identified during QA reviews
- Document technical debt from development
- Capture optimization opportunities
- Prioritize work across sprints
- Maintain visibility into deferred work

## Prerequisites

- Story review completed (for QA-sourced items)
- Story development completed (for dev-sourced items)
- Clear understanding of issue/opportunity being tracked

## Backlog File Location

**Location**: Configured in `core-config.yaml` as `storyBacklogLocation`
**Default**: `docs/STORY-BACKLOG.md`
**Format**: Markdown with YAML frontmatter for metadata

## Operations

### 1. Add New Backlog Item

**Trigger**: After QA review, during development, or PM prioritization

**Input Parameters**:
```yaml
required:
  - story_id: 'STORY-XXX' # Source story
  - item_type: 'F' # F=followup, O=optimization, T=technical-debt
  - priority: 'HIGH|MEDIUM|LOW' # Priority level
  - title: 'Brief title' # Concise description
  - description: 'Detailed description' # What needs to be done
  - effort: '1 hour' # Time estimate

optional:
  - source: 'QA Review' # Where it came from
  - assignee: 'Backend Developer' # Who should do it
  - sprint: 'Sprint 1' # When to do it
  - risk: 'LOW|MEDIUM|HIGH' # Risk if not done
  - success_criteria: [] # How to validate completion
  - acceptance: 'How to accept as done'
```

**Process**:
1. Read existing `STORY-BACKLOG.md`
2. Generate unique ID: `[{story_id}-{item_type}{sequential_number}]`
   - Example: `[STORY-013-F1]` (first follow-up from STORY-013)
   - Example: `[STORY-013-O2]` (second optimization from STORY-013)
3. Determine priority section (🔴 HIGH, 🟡 MEDIUM, 🟢 LOW)
4. Create item using template (see below)
5. Insert into appropriate priority section
6. Update statistics section
7. Write updated backlog file

**Item Template**:
```markdown
#### [{story_id}-{type}{num}] {title}
- **Source**: {source}
- **Priority**: {priority_emoji} {priority}
- **Effort**: {effort}
- **Status**: 📋 TODO
- **Assignee**: {assignee}
- **Sprint**: {sprint}
- **Description**: {description}
- **Success Criteria**:
  {for each criterion}
  - [ ] {criterion}
- **Acceptance**: {acceptance}

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: poManageStoryBacklog()
responsável: Pax (Balancer)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**


```