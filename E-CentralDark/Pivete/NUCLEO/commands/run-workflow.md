# COMANDO - run-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\run-workflow.md
**SHA:** 4bcf004039db4675
**Timestamp:** 2026-08-28T02:02:09.082898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- When done, run: *run-workflow {workflow_name} continue
- When done, run: *run-workflow {workflow_name} continue

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
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
task: runWorkflow()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must match an existing workflow YAML file

- campo: target_context
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "core", "squad", or "hybrid". Default: "core"

- campo: squad_name
  tipo: string
  origem: User Input
  obrigatório: false (required when target_context="squad" or "hybrid")
  validação: Must be kebab-case, squad must exist in squads/

- campo: action
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "start", "continue", "status", "skip", or "abort". Default: "continue"

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "guided" or "engine". Default: "guided"

**Saída:**
- campo: workflow_state
  tipo: object
  destino: File system (.aios/{instance-id}-state.yaml)
  persistido: true

- campo: next_steps
  tipo: array
  destino: Output
  persistido: false

- campo: handoff_prompt
  tipo: string
  destino: Output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] workflow_name must resolve to an existing YAML file
    tipo: pre-condition
    blocker: true
    validação: |
      Check workflow file exists at resolved path
    error_message: "Pre-condition failed: Workflow '{workflow_name}' not found"
  - [ ] For action=continue/status/skip/abort, an active state file must exist
    tipo: pre-condition
    blocker: true
    validação: |
      Check .aios/{instance-id}-state.yaml exists with status=active
    error_message: "Pre-condition failed: No active workflow instance found"
  - [ ] When target_context="squad" or "hybrid", squad directory must exist
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad" or "hybrid", verify squads/{squad_name}/ exists
    error_message: "Pre-condition failed: Squad '{squad_name}' not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] State file created/updated and next steps displayed
    tipo: post-condition
    blocker: true
    validação: |
      Verify state file exists and output was generated
    error_message: "Post-condition failed: State file not written or output missing"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Action executed correctly; state persisted; next steps shown
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert action was completed and state reflects the change
    error_message: "Acceptance criterion not met: Action execution failed"
```

---

## Tools

**External/shared resources used by this task:**

> **Note:** The tools below are conceptual patterns executed by the AI agent at runtime (file reads, YAML parsing, state management). They are NOT standalone JS scripts — the agent implements this logic inline using its native tools (Read, Write, Glob, etc.).

- **Tool:** workflow-state-manager
  - **Purpose:** Create, load, save, and query workflow state
  - **Implementation:** AI agent reads/writes `.aios/{instance-id}-state.yaml` files directly

- **Tool:** workflow-validator
  - **Purpose:** Validate workflow YAML before starting
  - **Implementation:** AI agent validates structure, sequence, and references inline

- **Tool:** file-system
  - **Purpose:** YAML file reading and state persistence
  - **Implementation:** Native Read/Write/Glob tools

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Workflow Not Found
   - **Cause:** Specified workflow_name doesn't resolve to a YAML file
   - **Resolution:** Check name and target context
   - **Recovery:** List available workflows

2. **Error:** No Active Instance
   - **Cause:** Trying to continue/status/skip/abort without an active state
   - **Resolution:** Start the workflow first with action=start
   - **Recovery:** Show available state files

3. **Error:** Step Not Optional
   - *
```