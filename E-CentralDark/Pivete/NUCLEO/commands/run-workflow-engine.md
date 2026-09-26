# COMANDO - run-workflow-engine.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\run-workflow-engine.md
**SHA:** 1bb5e57add5e1be6
**Timestamp:** 2026-08-28T02:02:08.963440
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "Run: *run-workflow {name} continue --mode=engine"
- prompt: {built prompt from Subagent Prompt Builder}

### Riscos
- blocker: true
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
---

## Execution Modes

**This task always runs in Engine Mode** — real subagent spawning via Task tool.

For guided automation (persona-switching), use `run-workflow.md` directly.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: runWorkflowEngine()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: workflow_name
  tipo: string
  origem: Delegated from run-workflow.md
  obrigatório: true
  validação: Must match an existing workflow YAML file

- campo: target_context
  tipo: string
  origem: Delegated from run-workflow.md
  obrigatório: false
  validação: Must be "core", "squad", or "hybrid". Default: "core"

- campo: squad_name
  tipo: string
  origem: Delegated from run-workflow.md
  obrigatório: false (required when target_context="squad" or "hybrid")
  validação: Must be kebab-case, squad must exist in squads/

- campo: action
  tipo: string
  origem: Delegated from run-workflow.md
  obrigatório: false
  validação: Must be "start", "continue", "status", "skip", or "abort". Default: "continue"

**Saída:**
- campo: workflow_state
  tipo: object
  destino: File system (.aios/{instance-id}-engine-state.yaml)
  persistido: true

- campo: execution_report
  tipo: object
  destino: Output
  persistido: false

- campo: step_outputs
  tipo: map
  destino: In-memory state (passed between steps)
  persistido: true (in state file)
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] workflow_name must resolve to an existing YAML file
    tipo: pre-condition
    blocker: true
    validação: |
      Check workflow file exists at resolved path
    error_message: "Pre-condition failed: Workflow '{workflow_name}' not found"
  - [ ] When target_context="squad" or "hybrid", squad directory must exist
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad" or "hybrid", verify squads/{squad_name}/ exists
    error_message: "Pre-condition failed: Squad '{squad_name}' not found"
  - [ ] For action=continue/status/skip/abort, an active engine state file must exist
    tipo: pre-condition
    blocker: true
    validação: |
      Check .aios/{instance-id}-engine-state.yaml exists with status=active
    error_message: "Pre-condition failed: No active engine workflow instance found. Use action=start first."
  - [ ] Task tool must be available for subagent spawning
    tipo: pre-condition
    blocker: true
    validação: |
      Verify Task tool is accessible in the current Claude Code session
    error_message: "Pre-condition failed: Task tool not available"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] All non-optional steps completed or workflow aborted with report
    tipo: post-condition
    blocker: true
    validação: |
      Verify all required steps have status: completed in state
    error_message: "Post-condition failed: Not all steps completed"
  - [ ] State file created with all step outputs
    tipo: post-condition
    blocker: true
    validação: |
      Verify .aios/{instance-id}-engine-state.yaml exists and contains outputs
    error_message: "Post-condition failed: State file not written"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Each action step spawned a real subagent via Task tool
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Each step with an agent was executed as a separate Task tool call
    error_message: "Acceptance criterion not met: Steps were not spawned as real subagents"
  - [ ] Outputs from previous steps were correctly passed to subsequent steps
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Verify requires chain: each step received the outputs it depends on
    error_message: "Acceptance criterion not met: Output chain broken"
  - [ ] Decision routing evaluated correctly based on thresholds
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Verify routing decisions match the conditions defined in the workflow
    error_message: "Acceptance criterion not met: Routing decisions incorrect"
```

---

## Tools

- **Tool:** Task tool (Claude Code built-in)
  - **Purpose:** Spawn real subagents with isolated context
  - **Source:** Claude Code runtime

- **Tool:** AskUserQuestion (Claude Code built-in)
  - **Purpose:** Collect elicitation inputs before spawning subagents
  - **Source:** Claude Code runtime

- **Tool:** Read tool (Claude Code built-in)
  - **Purpose:** Read agent files, task files, data files, workflow YAML
  - **Source:** Claude Code runtime

- **Tool:** workflow-state-manager
  - **Purpose:** Create and manage workflow state
  - **Source:** .aios-core/development/scripts/workflow-state-manager.js

- **Tool:** workflow-validator
  - **Purpose:** Validate workflow before starting
  - **Source:** .aios-core/development/scripts/workflow-validator.js

---

## Error Handling

**Strategy:** retry-then-fallback

**Common Errors:**

1. **Error:** Subagent returns no YAML b
```