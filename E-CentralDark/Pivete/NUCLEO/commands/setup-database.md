# COMANDO - setup-database.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\setup-database.md
**SHA:** d8464742d881feb3
**Timestamp:** 2026-08-28T02:02:08.999751
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Setup Database

**Purpose**: Interactive database project setup (Supabase, PostgreSQL, MongoDB, MySQL, SQLite)

**Elicit**: true

**Renamed From (Story 6.1.2.3):**
- `db-supabase-setup.md` - Now database-agnostic (supports 5+ DB types)

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
task: setupDatabase()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Config

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

## Scripts

**Agent-specific code for this task:**

- **Script:** init-project.js
  - **Purpose:** Project initialization workflow
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/init-project.js

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
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

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


## Elicitation

**Step 1: Detect or prompt for database type**

```bash
# Auto-detect from PRD or tech stack if available
if grep -qiE "supabase|postgres" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="postgresql"
  echo "📊 Detected database: PostgreSQL/Supabase"
elif grep -qiE "mongodb|mongo" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="mongodb"
  echo "📊 Detected database: MongoDB"
elif grep -qiE "mysql|mariadb" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="mysql"
  echo "📊 Detected database: MySQL"
elif grep -qiE "sqlite" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="sqlite"
  echo "📊 Detected database: SQLite"
else
  DETECTED_DB=""
fi
```

**Prompt user:**

```
Select database type:


```