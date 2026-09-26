# COMANDO - dev-develop-story.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\dev-develop-story.md
**SHA:** 9be22b14a1e7f6e2
**Timestamp:** 2026-08-28T02:02:05.731252
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Tests Run:** 8 tests

### Contratos
- constitutional_gate:
- constitutional_gate:

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Develop Story Task

## Purpose

Execute story development with selectable automation modes to accommodate different developer preferences, skill levels, and story complexity.

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

**Usage**:
```
*develop {story-id}           # Uses interactive mode (default)
*develop {story-id} yolo      # Uses YOLO mode
*develop {story-id} preflight # Uses pre-flight planning mode
```

**Edge Case Handling**:
- Invalid mode → Default to interactive with warning
- User cancellation → Exit gracefully with message
- Missing story file → Clear error message, halt execution
- Backward compatibility → Stories without mode parameter use interactive

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: devDevelopStory()
responsável: Dex (Builder)
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

## Constitutional Gates

> **Reference:** Constitution Articles I, III
> **Enforcement:** Automatic validation before execution

### Gate 1: Story-Driven Development (Article III)

```yaml
constitutional_gate:
  article: III
  name: Story-Driven Development
  severity: BLOCK

  validation:
    - Story file MUST exist at docs/stories/{storyId}/story.yaml
    - Story MUST have status != "Draft" (Ready, In Progress, or Done)
    - Story MUST have acceptance criteria defined
    - Story MUST have at least one task/subtask

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article III - Story-Driven Development
      Cannot develop without a valid story.

      Issue: {violation_details}

      Resolution: Create or update story via @sm *draft or @po *create-story
```

### Gate 2: CLI First (Article I)

```yaml
constitutional_gate:
  article: I
  name: CLI First
  severity: WARN

  validation:
    - If story involves new functionality:
      - CLI implementation SHOULD exist or be created first
      - UI components SHOULD NOT be created before CLI is functional

  on_violation:
    action: WARN
    message: |
      CONSTITUTIONAL WARNING: Article I - CLI First
      UI implementation detected without CLI foundation.

      Reminder: CLI First → Observability Second → UI Third

      Continue anyway? (This will be logged)
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Constitutional gates passed (Article III: Story exists, Article I: CLI First check)
    tipo: constitutional-gate
    blocker: true
    validação: |
      Verify story exists and has valid structure
    error_message: "Constitutional violation - see gate output above"

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

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects d
```