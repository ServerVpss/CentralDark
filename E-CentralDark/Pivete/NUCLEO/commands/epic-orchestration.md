# COMANDO - epic-orchestration.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\epic-orchestration.yaml
**SHA:** 2f4e375bfa55b0bf
**Timestamp:** 2026-08-28T02:02:10.222938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- wave_pattern:

### Contratos
- wave_gate:

### Ouro Bruto (primeiros 5000 chars)
```
# ============================================
# Epic Orchestration Workflow Template
#
# Generic, reusable template for executing epics
# with wave-based parallel execution and quality gates.
#
# Each story within a wave runs the full development-cycle
# (PO validates → Executor develops → Self-healing → Quality Gate → DevOps push)
#
# Project-specific execution plans reference this template
# and live in docs/stories/epics/{epic-name}/
#
# @version 1.0.0
# @author @pm (Bob) + @architect (Aria)
# ============================================

workflow:
  id: epic-orchestration
  name: "Epic Wave Orchestration"
  version: "1.0.0"
  description: >-
    Reusable template for executing epics with wave-based parallel development.
    Stories within each wave run the full development-cycle workflow
    (PO → Executor → Self-Healing → Quality Gate → DevOps → Checkpoint).
    Wave gates validate integration before proceeding to next wave.
    Supports worktree isolation for conflict-free parallel development.

  type: epic-orchestration
  project_types:
    - greenfield
    - brownfield
    - aios-development
    - epic-execution

  metadata:
    elicit: true
    confirmation_required: true

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              EXECUTION MODES
  # ═══════════════════════════════════════════════════════════════════════════════════

  execution_modes:
    - mode: yolo
      description: Autonomous - waves run with minimal interaction, checkpoints auto-GO
      prompts: 0-2
    - mode: interactive
      description: Human checkpoints between waves and at quality gates
      prompts: 5-10
      default: true
    - mode: preflight
      description: Full dependency analysis before execution begins
      prompts: 10-15

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              CONFIGURATION (overridden by project execution plan)
  # ═══════════════════════════════════════════════════════════════════════════════════

  config:
    # These values are OVERRIDDEN by the project-specific execution plan
    epicId: "${epicId}"
    epicIndex: "${epicIndex}"
    storyBasePath: "${storyBasePath}"

    # Parallel execution defaults
    maxConcurrency: 4
    worktreeIsolation: true

    # Timeouts
    storyTimeout: 7200000       # 2 hours per story (development-cycle total)
    gateTimeout: 1800000        # 30 min per wave gate
    totalTimeout: 43200000      # 12 hours total

    # Quality gates
    gatePolicy: strict          # strict | lenient | skip
    requireIntegrationReview: true

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              INNER WORKFLOW
  # ═══════════════════════════════════════════════════════════════════════════════════
  #
  # Each story within a wave executes the full development-cycle:
  #
  #   Phase 1: @po validates story (validate-story-draft)
  #   Phase 2: ${story.executor} develops (dynamic executor)
  #   Phase 3: @dev self-healing (CodeRabbit, conditional)
  #   Phase 4: ${story.quality_gate} reviews (agent != executor)
  #   Phase 5: @devops push & PR
  #   Phase 6: @po checkpoint (AUTO-GO in wave mode, human in interactive)
  #
  # Reference: .aios-core/development/workflows/development-cycle.yaml

  inner_workflow:
    ref: development-cycle
    per_story: true
    checkpoint_mode:
      in_wave: auto_go           # Don't pause between parallel stories
      between_waves: interactive  # Pause for human decision between waves

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              WAVE EXECUTION PATTERN
  # ═══════════════════════════════════════════════════════════════════════════════════
  #
  # Waves are defined in the project-specific execution plan.
  # This template defines the PATTERN each wave follows:
  #
  #   ┌─────────────────────────────────────────────────────┐
  #   │  WAVE N                                              │
  #   │                                                      │
  #   │  Story A ──→ development-cycle ──→ branch pushed     │
  #   │  Story B ──→ development-cycle ──→ branch pushed     │ PARALLEL
  #   │  Story C ──→ development-cycle ──→ branch pushed     │
  #   │                                                      │
  #   │  ──→ WAVE GATE (integration review) ──→ merge        │
  #   └─────────────────────────────────────────────────────┘

  wave_pattern:

    # Step 1: Per-story development (parallel within wave)
    story_execution:
      parallel: true
      max_concurrency: "${config.maxConcurrency}"
      worktree_isolation: "${config.worktreeIsolation}"
      workflow: development-cycle
      inputs:
        story_file: "${story.file}"
        epic_context:
          epicId: "${config.epicId}"
          waveNumber: "${wave.number}"
          totalWaves: "${wave.total}"

    # 
```