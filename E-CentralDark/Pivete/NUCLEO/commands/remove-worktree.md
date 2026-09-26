# COMANDO - remove-worktree.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\remove-worktree.md
**SHA:** 969e7ee512c837ef
**Timestamp:** 2026-08-28T02:02:08.849309
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **If missing, prompt:**

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# remove-worktree

**Task ID:** remove-worktree
**Version:** 1.0
**Created:** 2026-01-28 (Story 1.3)
**Agent:** @devops (Gage)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Removes worktree without confirmation
- Only prompts if uncommitted changes exist
- **Best for:** Cleanup after merge

### 2. Interactive Mode - Safe, Confirming (2-3 prompts) **[DEFAULT]**

- Always confirms before removal
- Shows worktree details before deletion
- **Best for:** Production safety

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: removeWorktree()
responsável: Gage (DevOps)
responsavel_type: Agente
atomic_layer: Atom

inputs:
  - campo: story_id
    tipo: string
    origem: User Input
    obrigatório: true
    validação: Valid story identifier

  - campo: force
    tipo: boolean
    origem: User Input
    obrigatório: false
    default: false
    validação: Force removal even with uncommitted changes

outputs:
  - campo: removed
    tipo: boolean
    destino: Return value
    persistido: false

  - campo: story_id
    tipo: string
    destino: Return value
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Current directory is a git repository
    tipo: pre-condition
    blocker: true
    validação: git rev-parse --is-inside-work-tree
    error_message: "Not a git repository."

  - [ ] Worktree exists for story
    tipo: pre-condition
    blocker: true
    validação: manager.exists(storyId) === true
    error_message: "Worktree not found for this story."

  - [ ] Not currently in the worktree being removed
    tipo: pre-condition
    blocker: true
    validação: cwd !== worktreePath
    error_message: "Cannot remove worktree while inside it."
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Worktree directory removed
    tipo: post-condition
    blocker: true
    validação: Directory .aios/worktrees/{storyId} does not exist
    error_message: "Worktree directory still exists."

  - [ ] Branch deleted (unless --keep-branch)
    tipo: post-condition
    blocker: false
    validação: Branch auto-claude/{storyId} does not exist
    error_message: "Branch was not deleted (may be merged)."
```

---

## Description

Removes an AIOS-managed worktree and its associated branch. Includes safety checks for uncommitted changes and provides options for force removal.

**Safety Features:**

- Warns about uncommitted changes
- Confirms before deletion (interactive mode)
- Cannot remove while inside worktree
- Logs removal for audit trail

---

## Inputs

| Parameter  | Type    | Required | Default | Description                            |
| ---------- | ------- | -------- | ------- | -------------------------------------- |
| `story_id` | string  | Yes      | -       | Story identifier to remove             |
| `force`    | boolean | No       | `false` | Force removal with uncommitted changes |

---

## Elicitation

```yaml
elicit: true # Confirms before destructive operation
```

Prompts for confirmation in interactive mode.

---

## Steps

### Step 1: Validate Git Repository

**Action:** Verify current directory is a git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

---

### Step 2: Parse Story ID

**Action:** Extract and validate story ID from input

**If missing, prompt:**

```
📝 Enter story ID of worktree to remove:
   Run *list-worktrees to see available worktrees.
```

---

### Step 3: Check Worktree Exists

**Action:** Verify worktree exists

```javascript
const WorktreeManager = require('./.aios-core/infrastructure/scripts/worktree-manager.js');
const manager = new WorktreeManager();
const exists = await manager.exists(storyId);
```

**If not exists:**

```
❌ Worktree not found for story '{storyId}'.

Available worktrees:
{list from manager.list()}

Did you mean one of these?
```

---

### Step 4: Get Worktree Info

**Action:** Retrieve worktree details

```javascript
const worktree = await manager.get(storyId);
```

**Display:**

```
📁 Worktree Details

Story:              {storyId}
Path:               .aios/worktrees/{storyId}
Branch:             auto-claude/{storyId}
Created:            {createdAt}
Uncommitted:        {uncommittedChanges} files
Status:             {status}
```

---

### Step 5: Check Uncommitted Changes

**Action:** Warn if there are uncommitted changes

```javascript
if (worktree.uncommittedChanges > 0 && !force) {
  // Prompt for confirmation
}
```

**Warning:**

```
⚠️  WARNING: Uncommitted Changes Detected!

This worktree has {uncommittedChanges} uncommitted changes.
Removing it will PERMANENTLY DELETE these changes.

Files with changes:
  - src/component.tsx
  - src/utils.ts
  - ...

Options:
  1. Commit changes first    : cd .aios/worktrees/{storyId} && git commit
  2. Merge to base branch    : *merge-worktree {storyId}
  3. Force remove (lose data): *remove-worktree {storyId} --force

Proceed w
```