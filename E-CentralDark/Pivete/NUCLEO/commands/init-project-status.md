# COMANDO - init-project-status.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\init-project-status.md
**SHA:** 31f85d85d8679a4d
**Timestamp:** 2026-08-28T02:02:06.436881
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Gaps
- **If missing:** Add entry to `.gitignore`

### Ouro Bruto (primeiros 5000 chars)
```
# init-project-status

**Task ID:** init-project-status
**Version:** 1.0
**Created:** 2025-01-14 (Story 6.1.2.4)
**Agent:** @devops (Gage)

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
task: initProjectStatus()
responsável: River (Facilitator)
responsavel_type: Agente
atomic_layer: Atom

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid directory path

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Initialization options

**Saída:**
- campo: initialized_project
  tipo: string
  destino: File system
  persistido: true

- campo: config_created
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Directory is empty or force flag set; config valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check directory is empty or force flag set; config valid
    error_message: "Pre-condition failed: Directory is empty or force flag set; config valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project initialized; config files created; structure valid
    tipo: post-condition
    blocker: true
    validação: |
      Verify project initialized; config files created; structure valid
    error_message: "Post-condition failed: Project initialized; config files created; structure valid"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure correct; all config files valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert project structure correct; all config files valid
    error_message: "Acceptance criterion not met: Project structure correct; all config files valid"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** project-scaffolder
  - **Purpose:** Generate project structure and config
  - **Source:** .aios-core/scripts/project-scaffolder.js

- **Tool:** config-manager
  - **Purpose:** Initialize configuration files
  - **Source:** .aios-core/utils/config-manager.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Directory Not Empty
   - **Cause:** Target directory already contains files
   - **Resolution:** Use force flag or choose empty directory
   - **Recovery:** Prompt for confirmation, merge or abort

2. **Error:** Initialization Failed
   - **Cause:** Error creating project structure
   - **Resolution:** Check permissions and disk space
   - **Recovery:** Cleanup partial initialization, log error

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 0.5-2 min (estimated)
cost_estimated: $0.0001-0.0005
token_usage: ~500-1,000 tokens
```

**Optimization Notes:**
- Minimize external dependencies; cache results if reusable; validate inputs early

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Description

Initialize dynamic project status tracking for agent activation context. This task sets up the project status feature that displays git state, recent work, and current story/epic information in agent greetings.

---

## Inputs

None (runs in current project directory)

---

## Elicitation

```yaml
elicit: false
```

This task runs autonomously without user interaction.

---

## Steps

### Step 1: Detect Git Repository

**Action:** Check if current directory is a git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

**Exit Condition:** If not a git repo, display message and exit gracefully:
```
⚠️  Project status feature requires a git repository.
    Initialize git first: git init
```

---

### Step 2: Check Current Configuration

**Action:** Read `.aios-core/core-config.yaml` and check `projectStatus.enabled`

**Logic:**
```javascript
const config = yaml.load(fs.readFileSync('.aios-core/core-config.yaml'));
const isEnabled = config?.projectStatus?.enabled === true;
```

**If already enabled:**
```
✅ Project status is already enabled in core-config.yaml
```

Skip 
```