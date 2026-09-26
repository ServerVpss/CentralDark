# COMANDO - create-worktree.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\create-worktree.md
**SHA:** 2a181b87bdc2cb3f
**Timestamp:** 2026-08-28T02:02:05.503868
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **If missing, prompt:**

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# create-worktree

**Task ID:** create-worktree
**Version:** 1.0
**Created:** 2026-01-28 (Story 1.3)
**Agent:** @devops (Gage)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts) **[DEFAULT]**

- Autonomous worktree creation
- Minimal user interaction
- **Best for:** Quick story setup

### 2. Interactive Mode - Balanced, Educational (2-3 prompts)

- Confirms story ID and options
- Shows worktree path before creation
- **Best for:** First-time users

**Parameter:** `mode` (optional, default: `yolo`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: createWorktree()
responsável: Gage (DevOps)
responsavel_type: Agente
atomic_layer: Atom

inputs:
  - campo: story_id
    tipo: string
    origem: User Input
    obrigatório: true
    validação: Valid story identifier (e.g., 'STORY-42', '1.3', 'fix-auth')

  - campo: options
    tipo: object
    origem: User Input
    obrigatório: false
    validação: Optional configuration overrides

outputs:
  - campo: worktree_info
    tipo: WorktreeInfo
    destino: Return value
    persistido: false

  - campo: worktree_path
    tipo: string
    destino: File system
    persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

```yaml
pre-conditions:
  - [ ] Current directory is a git repository
    tipo: pre-condition
    blocker: true
    validação: git rev-parse --is-inside-work-tree
    error_message: "Not a git repository. Initialize git first."

  - [ ] WorktreeManager is available
    tipo: pre-condition
    blocker: true
    validação: Script exists at .aios-core/infrastructure/scripts/worktree-manager.js
    error_message: "WorktreeManager not found. Ensure AIOS is properly installed."

  - [ ] Max worktrees limit not reached
    tipo: pre-condition
    blocker: true
    validação: Current worktrees < maxWorktrees (default: 10)
    error_message: "Maximum worktrees limit reached. Remove stale worktrees first."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

```yaml
post-conditions:
  - [ ] Worktree directory exists
    tipo: post-condition
    blocker: true
    validação: Directory exists at .aios/worktrees/{storyId}
    error_message: "Worktree directory was not created."

  - [ ] Branch exists
    tipo: post-condition
    blocker: true
    validação: Branch auto-claude/{storyId} exists
    error_message: "Worktree branch was not created."
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Worktree created with isolated git state
    tipo: acceptance-criterion
    blocker: true

  - [ ] Branch follows naming convention auto-claude/{storyId}
    tipo: acceptance-criterion
    blocker: true

  - [ ] Worktree appears in list
    tipo: acceptance-criterion
    blocker: true
```

---

## Tools

**External resources used by this task:**

- **Tool:** WorktreeManager
  - **Purpose:** Git worktree operations
  - **Source:** .aios-core/infrastructure/scripts/worktree-manager.js

- **Tool:** git
  - **Purpose:** Version control operations
  - **Source:** System git installation

---

## Description

Creates an isolated Git worktree for developing a story in parallel. Each worktree has its own working directory and branch, enabling multiple stories to be worked on simultaneously without conflicts.

**Use cases:**

- Start working on a new story in isolation
- Enable Auto-Claude to develop stories autonomously
- Run parallel development tracks

---

## Inputs

| Parameter  | Type   | Required | Default | Description                                |
| ---------- | ------ | -------- | ------- | ------------------------------------------ |
| `story_id` | string | Yes      | -       | Story identifier (e.g., 'STORY-42', '1.3') |

---

## Elicitation

```yaml
elicit: false
```

This task runs autonomously. If story_id is not provided, prompt once.

---

## Steps

### Step 1: Validate Git Repository

**Action:** Verify current directory is a git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

**Exit Condition:** If not a git repo:

```
❌ Not a git repository.
   Initialize git first: git init
```

---

### Step 2: Parse Story ID

**Action:** Extract and validate story ID from input

**Validation:**

- Must be non-empty string
- Can contain alphanumeric, hyphens, dots, underscores
- Examples: `STORY-42`, `1.3`, `fix-auth-bug`

**If missing, prompt:**

```
📝 Enter story ID for the worktree:
   Example: STORY-42, 1.3, fix-auth-bug
```

---

### Step 3: Check Existing Worktree

**Action:** Verify worktree doesn't already exist

```javascript
const WorktreeManager = require('./.aios-core/infrastructure/scripts/worktree-manager.js');
const manager = new WorktreeManager();
const exists = await manager.exists(storyId);
```

**If exists:**

```
⚠️  Worktree for '{storyId}' already exists.
    Path: .aios/worktrees/{storyId}
    Branch: auto-claude/{storyId}

    Use *list-worktree
```