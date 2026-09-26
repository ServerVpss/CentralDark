# COMANDO - execute-epic-plan.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\execute-epic-plan.md
**SHA:** 6665f240d809fdb8
**Timestamp:** 2026-08-28T02:02:05.928583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: |
- prompt: |
- prompt: |
- prompt: |

### Contratos
- quality_gate: {story.quality_gate}
- Gate: APPROVED by @{agent}
- Gate: PENDING
- "--- Wave {wave.number} Gate: Integration Review ---"
- "Gate: {verdict}"
- "=== FINAL GATE: Epic {epicId} ==="

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Autonomous (0-2 prompts)
- Waves auto-proceed after gate approval
- Checkpoints default to GO
- **Best for:** Well-tested epics with low conflict risk

### 2. Interactive Mode - Balanced (5-10 prompts) **[DEFAULT]**
- Human checkpoint between waves
- Gate review before merge
- **Best for:** First epic execution, medium-high complexity

### 3. Pre-Flight Planning - Comprehensive Analysis
- Full dependency analysis before execution
- Dry-run wave structure validation
- **Best for:** Very high complexity epics, unknown conflict risk

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: executeEpicPlan()
responsavel: Morgan (PM)
responsavel_type: Agente
atomic_layer: Orchestration

**Entrada:**
- campo: execution_plan_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be a valid path to an EXECUTION.yaml file (typically in docs/stories/epics/{epic}/)

- campo: action
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "start", "continue", "status", "skip-story", or "abort". Default: "start"

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "yolo", "interactive", or "preflight". Default: "interactive"

- campo: wave
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Wave number to resume from (only with action=continue). Default: auto-detect from state.

**Saída:**
- campo: epic_state
  tipo: object
  destino: File system (.aios/epic-{epicId}-state.yaml)
  persistido: true

- campo: wave_report
  tipo: object
  destino: Output
  persistido: false

- campo: next_steps
  tipo: string
  destino: Output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] execution_plan_path must resolve to an existing YAML file
    tipo: pre-condition
    blocker: true
    validação: |
      File must exist and contain execution.epicId, execution.stories, execution.waves
    error_message: "Pre-condition failed: Execution plan not found at '{execution_plan_path}'"

  - [ ] All story files referenced in the plan must exist
    tipo: pre-condition
    blocker: true
    validação: |
      For each story in execution.stories, verify {storyBasePath}/{story.file} exists
    error_message: "Pre-condition failed: Story file '{story.file}' not found"

  - [ ] Template workflow must exist
    tipo: pre-condition
    blocker: true
    validação: |
      execution.template must resolve to .aios-core/development/workflows/{template}.yaml
    error_message: "Pre-condition failed: Template '{template}' not found"

  - [ ] For action=continue, state file must exist
    tipo: pre-condition
    blocker: true
    validação: |
      .aios/epic-{epicId}-state.yaml must exist with status=active
    error_message: "Pre-condition failed: No active state found. Use action=start first."

  - [ ] Git working tree must be clean (no uncommitted changes)
    tipo: pre-condition
    blocker: true
    validação: |
      git status --porcelain returns empty or only untracked files
    error_message: "Pre-condition failed: Uncommitted changes detected. Commit or stash first."
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] State file updated with current wave progress
    tipo: post-condition
    blocker: true
    validação: |
      .aios/epic-{epicId}-state.yaml exists and reflects completed waves/stories
    error_message: "Post-condition failed: State file not persisted"

  - [ ] All completed stories have branches pushed
    tipo: post-condition
    blocker: false
    validação: |
      For each completed story, git branch {story.branch} exists
    error_message: "Warning: Some story branches may not have been pushed"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Each story in each wave was executed via development-cycle
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Each story spawned a subagent that followed the full development-cycle
      (PO validate -> Executor develop -> Self-healing -> Quality gate -> DevOps push)
    error_message: "Acceptance criterion not met: Stories did not follow development-cycle"

  - [ ] Wave gates were executed between waves
    tipo: acceptance-criterion
    blocker: true
    validação: |
      After each wave, the gate agent reviewed cross-story integration
    error_message: "Acceptance criterion not met: Wave gates skipped"

  - [ ] State supports resume across sessions
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Aborting and running action=continue resumes from last completed wave
    error_message: "Acceptance criterion not met: Resume not working"
```

---

## Tools

- **Tool:** Task tool (Claude Code built-in)
  - **Purpose:** Spawn subagents for story development-cycle and wave gates
  - **Source:** Claude Code runtime

- **Tool:** Read tool (
```