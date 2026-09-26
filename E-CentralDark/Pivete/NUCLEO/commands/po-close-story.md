# COMANDO - po-close-story.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\po-close-story.md
**SHA:** 63a024dd0f64a0cf
**Timestamp:** 2026-08-28T02:02:06.698694
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# PO Task: Close Story

**Agent:** @po
**Command:** `*close-story`
**Purpose:** Close a completed story, update epic/backlog, and suggest next story
**Created:** 2026-02-05 (Story PRO-5 retrospective)

---

## Overview

This task closes the PO story lifecycle that begins with `*validate-story-draft`. After a story is implemented, tested, and merged, this task:

1. Marks the story as **Done**
2. Updates the **Epic index** with completion status
3. Adds **changelog entry** with merge/PR info
4. Updates **backlog** counts and statistics
5. **Suggests next story** from the same epic or backlog

**Lifecycle:**
```
*validate-story-draft (START) --> Development --> PR/Merge --> *close-story (END)
        |                                                            |
        v                                                            v
   Story: Draft -> Approved                              Story: Done + Next suggested
```

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous updates with logging
- Minimal user interaction
- **Best for:** Simple story closures with clear PR info

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Confirms each update before applying
- Educational explanations
- **Best for:** Learning, first-time users

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Analyzes story, epic, and backlog state first
- Shows complete plan before execution
- **Best for:** Complex epics, critical milestones

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: poCloseStory()
responsável: Pax (Balancer)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: story_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be valid story file path

- campo: pr_number
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Valid PR number if provided

- campo: commit_sha
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid git SHA (7+ chars)

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: story_updated
  tipo: boolean
  destino: Story file
  persistido: true

- campo: epic_updated
  tipo: boolean
  destino: Epic index file
  persistido: true

- campo: next_story_suggestion
  tipo: object
  destino: User output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story file exists at provided path
    tipo: pre-condition
    blocker: true
    validação: File exists and is readable
    error_message: "Story file not found at: {story_path}"

  - [ ] Story status is NOT already 'Done'
    tipo: pre-condition
    blocker: false
    validação: Status field != Done
    error_message: "Story already marked as Done"

  - [ ] Epic index file exists (if story belongs to epic)
    tipo: pre-condition
    blocker: false
    validação: EPIC-*-INDEX.md exists in same directory
    error_message: "Epic index not found - story updates only"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Story Status field updated to 'Done'
    tipo: post-condition
    blocker: true
    validação: Status: Done in story frontmatter
    error_message: "Failed to update story status"

  - [ ] Changelog entry added with date and author
    tipo: post-condition
    blocker: true
    validação: New row in Change Log table
    error_message: "Failed to add changelog entry"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Story marked as Done with PR/commit reference
    tipo: acceptance-criterion
    blocker: true

  - [ ] Epic index updated (if applicable)
    tipo: acceptance-criterion
    blocker: false

  - [ ] Next story suggestion provided
    tipo: acceptance-criterion
    blocker: false
```

---

## Task Flow

### 1. Elicit Story and Merge Info

```yaml
elicit: true
questions:
  - Story path (relative to docs/stories/):
    input: text
    validation: File must exist
    example: "epics/epic-pro-aios-pro-architecture/story-pro-5-repo-bootstrap.md"

  - PR number (optional):
    input: text
    validation: Numeric or empty
    example: "84"

  - Merge commit SHA (optional):
    input: text
    validation: 7+ hex chars or empty
    example: "ce19c81a"

  - Additional notes for changelog (optional):
    input: textarea
    example: "CodeRabbit approved with 0 findings"
```

### 2. Read and Parse Story

```javascript
// Load story file
const storyPath = path.join('docs/stories', userInput.storyPath);
const storyContent = fs.readFileSync(storyPath, 'utf8');

// Extract metadata
const metadata = parseStoryFrontma
```