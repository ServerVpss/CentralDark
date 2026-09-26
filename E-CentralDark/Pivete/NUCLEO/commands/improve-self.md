# COMANDO - improve-self.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\improve-self.md
**SHA:** 3a17a20467a966fc
**Timestamp:** 2026-08-28T02:02:06.382196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: false
- risk: "low"
- console.log(`  Impact: ${change.impact}, Risk: ${change.risk}`);

### Ouro Bruto (primeiros 5000 chars)
```
# improve-self

**Task ID:** `improve-self`  
**Version:** 2.0.0  
**Status:** Active

---

## Purpose

Enable the meta-agent to improve its own capabilities with comprehensive safeguards. This task allows self-modification with mandatory safety checks, backups, and user approval.

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

**Note:** For self-improvement tasks, interactive mode is strongly recommended to ensure user awareness and approval of changes.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: improveSelf()
responsável: Orion (Commander)
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

### Step 1: Request Validation

**Purpose:** Validate improvement request against safety rules

**Actions:**
1. Parse improvement request
2. Check against safety rules
3. Verify scope limitations
4. Detect recursive improvements

**Validation:**
- Request is valid
- No safety violations
- Scope within limits
- No recursive improvements detected

---

### Step 2: Capability Analysis

**Purpose:** Analyze current implementation and identify improvement opportunities

**Actions:**
1. Analyze current implementation
2. Identify improvement opportunities
3. Assess feasibility and risks
4. Generate capability report

**Validation:**
- Analysis completed
- Opportunities identified
- Risks assessed
- Report generated

---

### Step 3: Improvement Planning

**Purpose:** Generate specific improvement plan with implementation details

**Actions:**
1. Generate specific changes
2. Create implementation plan
3. Identify affected components
4. Estimate impact and benefits

**Validation:**
- Plan generated
- Changes specified
- Components identified
- Impact estimated

---

### Step 4: Safety Validation

**Purpose:** Validate improvement plan against safety constraints

**Actions:**
1. Check for breaking changes
2. Verify interface preservation
3. Validate security implications
4. Ensure rollback capability

**Validation:**
- No breaking changes
- Interfaces preserved
- Security validated
- Rollback available

---

### Step 5: Backup Creation

**Purpose:** Create full backup before applying changes

**Actions:**
1. Full backup of affected files
2. State snapshot for recovery
3. Version control checkpoint
4. Recovery plan documentation

**Validation:**
- Backup created
- State saved
- Checkpoint created
- Recovery plan documented

---

### Step 6: Sandbox Testing

**Purpose:** Test improvements in isolated environment

**Actions:**
1. Create isolated test environment
2. Apply changes in sandbox
3. Run comprehensive test suite
4. Validate functionality

**Validation:**
- Sandbox created
- Changes applied
- Tests passed
- Functionality validated

---

### Step 7: User Approval

**Purpose:** Request explicit user approval before applying changes

**Actions:**
1. Present improvement plan
2. Show test results
3. Display risk assessment
4. Request explicit approval

**Validation:**
- Plan presented
- Results shown
- Risks disclosed
- Approval obtained

---

### Step 8: Change Application

**Purpose:** Apply approved improvements to production

**Actions:**
1. Apply approved changes
2. Monitor for issues
3. Validate in production
4. Track performance metrics

**Validation:**
- Changes applied
- No issues detect
```