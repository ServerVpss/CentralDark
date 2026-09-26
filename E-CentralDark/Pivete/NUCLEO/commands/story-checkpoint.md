# COMANDO - story-checkpoint.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\story-checkpoint.md
**SHA:** 5c73caf196c6900b
**Timestamp:** 2026-08-28T02:02:09.161623
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: |
- prompt: |
- To resume later, run:
- Or activate @po and run:
- prompt: |
- To restart:

### Contratos
- quality_gate: "${story.quality_gate}"
- quality_gate:
- ✅ Quality Gate: ${review_result.verdict} (${review_result.score}/100)
- Quality Gate: ${next_story.quality_gate}

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Story Checkpoint

## Story 11.3: Development Cycle Workflow

Task de checkpoint entre stories no Development Cycle.
Requer decisão humana para continuar, pausar, revisar ou abortar.

---

## Metadata

```yaml
task_id: story-checkpoint
version: "1.0.0"
agent: "@po"
elicit: true  # REQUIRES human interaction
epic: "11 - Projeto Bob"
story: "11.3"
```

---

## Purpose

Pausar o workflow de desenvolvimento entre stories para perguntar ao usuário qual ação tomar. Garante que o usuário mantém controle sobre o fluxo de trabalho.

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `story_file` | path | Yes | Path to completed story file |
| `pr_url` | string | No | URL of created PR (if push succeeded) |
| `implementation` | object | No | Implementation details from development phase |
| `review_result` | object | No | Quality gate review result |

---

## Execution

### Step 1: Generate Summary

```yaml
summary:
  story_completed:
    file: "${story_file}"
    executor: "${story.executor}"
    quality_gate: "${story.quality_gate}"

  implementation:
    files_created: "${implementation.files_created.length}"
    files_modified: "${implementation.files_modified.length}"
    tests_added: "${implementation.tests_added.length}"

  quality_gate:
    verdict: "${review_result.verdict}"
    score: "${review_result.score}"

  pr:
    url: "${pr_url}"
    status: "${pr_url ? 'Created' : 'Pending'}"
```

### Step 2: Display Summary

```
═══════════════════════════════════════════════════════════════════
                    📋 STORY CHECKPOINT
═══════════════════════════════════════════════════════════════════

Story Completed: ${story_file}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Implementation Summary:
   • Files Created:  ${implementation.files_created.length}
   • Files Modified: ${implementation.files_modified.length}
   • Tests Added:    ${implementation.tests_added.length}

✅ Quality Gate: ${review_result.verdict} (${review_result.score}/100)

🔗 PR: ${pr_url || 'Not created yet'}

═══════════════════════════════════════════════════════════════════
```

### Step 3: Elicit Decision

```yaml
elicitation:
  type: single_choice
  required: true
  timeout: 30m

  prompt: |
    Story completed! What would you like to do next?

  options:
    - id: GO
      label: "🚀 GO - Continue to next story"
      description: |
        Continue the development cycle with the next story in the epic.
        The workflow will automatically load and validate the next story.
      action: suggest_next_story

    - id: PAUSE
      label: "⏸️ PAUSE - Save state and stop"
      description: |
        Save the current workflow state and stop execution.
        You can resume later with *workflow resume development-cycle.
      action: save_session_state

    - id: REVIEW
      label: "🔍 REVIEW - Show what was done"
      description: |
        Display a detailed summary of all changes made in this story.
        Includes file diffs, test results, and quality gate findings.
      action: show_detailed_summary

    - id: ABORT
      label: "⛔ ABORT - Stop the epic"
      description: |
        Stop working on this epic entirely.
        All progress is saved but the workflow will not continue.
      action: abort_epic

  display_format: |
    ┌─────────────────────────────────────────────────────────────┐
    │                   What's next?                              │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │   [1] 🚀 GO     - Continue to next story                   │
    │   [2] ⏸️ PAUSE  - Save state and stop                      │
    │   [3] 🔍 REVIEW - Show what was done                       │
    │   [4] ⛔ ABORT  - Stop the epic                            │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘

    Enter your choice (1-4):
```

---

## Actions

### GO Action: Suggest Next Story

```yaml
action: suggest_next_story
steps:
  1_find_next:
    description: "Find next story in epic"
    logic: |
      - Read epic file to get story list
      - Find current story position
      - Get next story (status = Draft or Approved)
      - If no more stories, report "Epic complete"

  2_validate_next:
    description: "Validate next story is ready"
    checks:
      - Has executor assigned
      - Has quality_gate assigned
      - Status is Draft or Approved
      - Dependencies are met

  3_confirm:
    description: "Confirm with user"
    prompt: |
      Next story: ${next_story.title}
      Executor: ${next_story.executor}
      Quality Gate: ${next_story.quality_gate}

      Start development? (Y/n)

  4_transition:
    description: "Transition to next story"
    actions:
      - Update workflow state with new story
      - Reset phase to 1_validation
      - Continu
```