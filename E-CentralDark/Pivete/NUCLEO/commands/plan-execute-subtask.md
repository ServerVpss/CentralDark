# COMANDO - plan-execute-subtask.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\plan-execute-subtask.md
**SHA:** fcce92949e2d35b0
**Timestamp:** 2026-08-28T02:02:06.730957
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- testsRun: array
- testsRun: array
- **Tests Run:** {testsRun.length} passed
- **Tests Run:** 4 passed

### Ouro Bruto (primeiros 5000 chars)
```
# Execute Subtask (Coder Agent)

> **Phase:** Execution - Subtask
> **Owner Agent:** @dev
> **Pipeline:** execution-pipeline

---

## Purpose

Execute a single subtask from an implementation.yaml plan following the 13-step Coder Agent workflow. Includes mandatory self-critique phases (5.5 and 6.5) to catch bugs, edge cases, and pattern violations before committing. No steps can be skipped.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-subtask

  deterministic: true
  elicit: false
  composable: true

  selfCritique:
    enabled: true
    checklistRef: self-critique-checklist.md
    phases:
      - '5.5'
      - '6.5'

  recovery:
    trackAttempts: true
    maxRetries: 3
    rollbackOnFailure: true

  inputs:
    - name: subtaskId
      type: string
      required: true
      description: "Subtask ID from implementation.yaml (e.g., 'ST-1.1')"

    - name: storyId
      type: string
      required: true
      description: 'Story ID for context loading'

    - name: implementationPlan
      type: file
      path: docs/stories/{storyId}/implementation.yaml
      required: true

    - name: projectContext
      type: file
      path: .aios/project-context.yaml
      required: false

    - name: filesContext
      type: file
      path: docs/stories/{storyId}/files-context.yaml
      required: false

  outputs:
    - name: subtaskResult
      type: object
      schema:
        subtaskId: string
        status: completed|failed|blocked
        attempt: integer
        filesModified: array
        testsRun: array
        selfCritiqueResults: object

    - name: implementationPlanUpdate
      type: file
      path: docs/stories/{storyId}/implementation.yaml
      action: update

  verification:
    type: command
    command: "npm run test -- --grep '{subtaskId}'"
    timeout: 120

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: true
    spec: false
```

---

## Command Integration (@dev)

```yaml
command:
  name: '*execute-subtask'
  syntax: '*execute-subtask {subtask-id}'
  agent: dev

  examples:
    - '*execute-subtask ST-1.1'
    - '*execute-subtask ST-2.3'

  aliases:
    - '*subtask'
    - '*exec-subtask'
```

---

## The 13 Steps of the Coder Agent

### CRITICAL RULE: No Step Skipping

```yaml
step_enforcement:
  description: |
    ALL 13 steps MUST be executed in sequence.
    No skipping, no shortcuts, no "optimization" by combining steps.
    Each step has a specific purpose in the quality pipeline.

  violations:
    - Skipping self-critique phases (5.5, 6.5)
    - Combining multiple steps into one
    - Skipping tests "because code is simple"
    - Not running linter "because it passed before"

  on_violation:
    action: halt
    message: 'Step {step} cannot be skipped. Execute all 13 steps.'
```

---

## Step-by-Step Execution Flow

### Step 1: Load Context

```yaml
step_1:
  id: '1'
  name: 'Load Context'
  description: 'Load project-context.yaml and files-context.yaml'

  actions:
    - action: load_file
      path: .aios/project-context.yaml
      required: false
      fallback: 'Use codebase defaults'

    - action: load_file
      path: docs/stories/{storyId}/files-context.yaml
      required: false
      fallback: 'Generate minimal context from implementation.yaml'

  validation:
    check: 'Context files loaded or fallbacks applied'
    onFailure: continue # Non-blocking

  output:
    projectContext: object
    filesContext: object
```

### Step 2: Read Implementation Plan

```yaml
step_2:
  id: '2'
  name: 'Read Implementation Plan'
  description: 'Load and parse implementation.yaml for current subtask'

  actions:
    - action: load_file
      path: docs/stories/{storyId}/implementation.yaml
      required: true

    - action: parse_yaml
      extract:
        - subtasks
        - dependencies
        - currentStatus

  validation:
    check: 'implementation.yaml exists and is valid YAML'
    onFailure: halt

  output:
    plan: object
    subtasks: array
    dependencies: object
```

### Step 3: Understand Current Subtask

```yaml
step_3:
  id: '3'
  name: 'Understand Current Subtask'
  description: 'Extract and comprehend the specific subtask requirements'

  actions:
    - action: find_subtask
      subtaskId: '{subtaskId}'
      in: plan.subtasks

    - action: extract
      fields:
        - title
        - description
        - acceptanceCriteria
        - files
        - dependencies
        - estimatedComplexity

    - action: verify_dependencies
      check: 'All dependency subtasks are completed'

  validation:
    check: 'Subtask found and dependencies met'
    onFailure: halt

  error_cases:
    - condition: 'Subtask not found'
      action: halt
      message: 'Subtask {subtaskId} not found in implementation.yaml'

    - condition: 'Dependencies not met'
      action: halt
      message: 'Subtask depends on incomplete subtasks: {unmet_deps}'

  output:
    subtask: object
    dependenciesMet: b
```