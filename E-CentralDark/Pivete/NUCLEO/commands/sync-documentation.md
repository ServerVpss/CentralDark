# COMANDO - sync-documentation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\sync-documentation.md
**SHA:** caa2077e7a5bbbba
**Timestamp:** 2026-08-28T02:02:09.198720
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# sync-documentation

**Task ID:** `sync-documentation`  
**Version:** 2.0.0  
**Status:** Active

---

## Purpose

Automatically synchronize documentation with code changes to ensure documentation stays up-to-date with implementation.

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

**Valid values:** `yolo`, `interactive`, `preflight`

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: syncDocumentation()
responsável: Morgan (Strategist)
responsavel_type: Agente
atomic_layer: Molecule

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

## Step-by-Step Execution

### Step 1: Parse Parameters

**Purpose:** Parse and validate command-line parameters

**Actions:**
1. Parse command-line options (--component, --all, --check, etc.)
2. Validate sync strategies
3. Set default values
4. Validate file paths if provided

**Validation:**
- Parameters are valid
- Strategies are supported
- File paths exist (if specified)

---

### Step 2: Initialize Dependencies

**Purpose:** Set up documentation synchronizer and required tools

**Actions:**
1. Load DocumentationSynchronizer module
2. Initialize synchronizer with root path
3. Set up event listeners
4. Verify all dependencies available

**Validation:**
- Synchronizer initialized successfully
- Event listeners registered
- Dependencies available

---

### Step 3: Execute Requested Action

**Purpose:** Execute the requested synchronization action

**Actions:**
1. Determine action type (check, sync, auto-sync, report)
2. Execute corresponding method
3. Handle errors gracefully
4. Return results

**Validation:**
- Action executed successfully
- Results returned
- Errors handled appropriately

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
    rollback: false
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Validate story requirements AFTER workflow (non-blocking, can be manual)

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: false
    story: N/A
    manual_check: false
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools (External/Shared)

**Purpose:** Catalog reusable tools used by multiple agents

```yaml
**Tools:**
- task-runner:
    version: latest
    used_for: Task execution and orchestration
    shared_with: [dev, qa, po]
    cost: $0

- logger:
    version: latest
    used_for: Execution logging and error tracking
    shared_with: [dev, qa, po, sm]
    cost: $0
```

---

## Scripts (Agent-Specific)

**Purpose:** Agent-specific code for this task

```yaml
**Scripts:**
- execute-task.js:
    description: Generic task execution wrapper
    language: JavaScript
    location: .aios-core/scripts/execute-task.js

- documentation-synchronizer.js:
    description: Core documentation synchronization engine
    language: JavaScript
    location: .aios-core/scripts/documenta
```