# COMANDO - validate-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\validate-workflow.md
**SHA:** c108be047ae1ed53
**Timestamp:** 2026-08-28T02:02:09.624429
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
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
task: validateWorkflow()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: workflow_path
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Path to specific workflow YAML file

- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Resolves to workflow file by name

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

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false. When true, warnings become errors

- campo: all
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false. When true, validate all workflows in context

**Saída:**
- campo: validation_result
  tipo: object
  destino: Memory
  persistido: false

- campo: report
  tipo: string
  destino: Output
  persistido: false

- campo: exit_code
  tipo: number
  destino: Return value
  persistido: false
  validação: 0=valid, 1=invalid
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] At least one of workflow_path, workflow_name, or all flag must be provided
    tipo: pre-condition
    blocker: true
    validação: |
      Check that workflow_path OR workflow_name OR all=true is provided
    error_message: "Pre-condition failed: Must specify workflow_path, workflow_name, or --all flag"
  - [ ] When target_context="squad", squad directory must exist
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad", verify squads/{squad_name}/ exists
    error_message: "Pre-condition failed: Squad '{squad_name}' not found in squads/"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation report generated and displayed
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation report was generated with errors/warnings/result
    error_message: "Post-condition failed: Validation report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All specified workflow files validated; report displayed; exit code returned
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert each workflow file was validated and results consolidated
    error_message: "Acceptance criterion not met: Validation incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** workflow-validator
  - **Purpose:** Validate workflow YAML files
  - **Source:** .aios-core/development/scripts/workflow-validator.js

- **Tool:** file-system
  - **Purpose:** File discovery and reading
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** workflow-validator.js
  - **Purpose:** WorkflowValidator class with sub-validators
  - **Language:** JavaScript
  - **Location:** .aios-core/development/scripts/workflow-validator.js

---

## Error Handling

**Strategy:** continue (validate all files even if some fail)

**Common Errors:**

1. **Error:** Workflow File Not Found
   - **Cause:** Specified workflow path or name does not resolve to a file
   - **Resolution:** Check the path/name and target context
   - **Recovery:** List available workflows and suggest correct name

2. **Error:** YAML Parse Error
   - **Cause:** Invalid YAML syntax in workflow file
   - **Resolution:** Fix YAML syntax issues
   - **Recovery:** Show line/column of syntax error

3. **Error:** Missing Required Fields
   - **Cause:** Workflow missing workflow.id, workflow.name, or sequence
   - **Resolution:** Add missing fields to workflow YAML
   - **Recovery:** Show which fields are missing with examples

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-5 min (estimated)
cost_estimated: $0.001-0.005
to
```