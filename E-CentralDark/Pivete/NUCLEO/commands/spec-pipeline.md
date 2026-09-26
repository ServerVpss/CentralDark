# COMANDO - spec-pipeline.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\spec-pipeline.yaml
**SHA:** 38061398e5b16c47
**Timestamp:** 2026-08-28T02:02:10.256659
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- strictGate: true  # BLOCKED verdict halts pipeline
- gate: true  # Blocking gate
- gate: true

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: spec-pipeline
  name: Spec Pipeline - Requirements to Specification
  version: "1.0"
  description: >-
    Pipeline completo que transforma requisitos informais em especificações
    executáveis. Orquestra 5 fases: Gather → Assess → Research → Write → Critique.
    Adapta as fases baseado na complexidade do requisito.

    Part of the Auto-Claude ADE (Autonomous Development Engine) infrastructure.

  type: pipeline
  project_types:
    - aios-development
    - autonomous-development
    - spec-generation

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              TRIGGER CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════════════════

  triggers:
    # Primary trigger: Explicit command
    - event: command
      command: "*create-spec"
      action: run_pipeline

    # Secondary trigger: New story created
    - event: story_created
      condition: projectConfig.autoSpec.enabled === true
      action: run_pipeline

    # Agent-specific triggers
    - event: command
      command: "*gather-requirements"
      action: run_phase
      phase: gather

    - event: command
      command: "*assess-complexity"
      action: run_phase
      phase: assess

    - event: command
      command: "*research-deps"
      action: run_phase
      phase: research

    - event: command
      command: "*write-spec"
      action: run_phase
      phase: spec

    - event: command
      command: "*critique-spec"
      action: run_phase
      phase: critique

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════════════════

  config:
    # Auto-spec when story is created
    autoSpec:
      enabled: false
      trigger: story_created

    # Progress tracking
    showProgress: true
    verbose: true

    # Retry configuration
    maxRetries: 2
    retryDelay: 1000

    # Gate behavior
    strictGate: true  # BLOCKED verdict halts pipeline

    # Output directory pattern
    outputDir: docs/stories/{storyId}/spec/

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              COMPLEXITY-BASED PHASES
  # ═══════════════════════════════════════════════════════════════════════════════════

  phases:
    # SIMPLE: Minimal pipeline for straightforward tasks
    SIMPLE:
      description: "Tarefa direta, padrões existentes"
      steps:
        - gather
        - spec
        - critique
      estimated_time: "30-60 min"

    # STANDARD: Full pipeline for moderate complexity
    STANDARD:
      description: "Complexidade moderada, alguma pesquisa necessária"
      steps:
        - gather
        - assess
        - research
        - spec
        - critique
        - plan
      estimated_time: "2-4 hours"

    # COMPLEX: Extended pipeline with revision loop
    COMPLEX:
      description: "Alta complexidade, múltiplas iterações"
      steps:
        - gather
        - assess
        - research
        - spec
        - critique_1
        - revise
        - critique_2
        - plan
      estimated_time: "4-8 hours"
      flags:
        - "Architectural review recommended"
        - "Consider breaking into smaller stories"

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              PRE-FLIGHT CHECKS
  # ═══════════════════════════════════════════════════════════════════════════════════

  pre_flight:
    enabled: true

    checks:
      - id: story_exists
        description: "Verify story directory exists or can be created"
        script: |
          const fs = require('fs');
          const path = `docs/stories/${storyId}`;
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          return true;
        blocking: true
        error: "Cannot create story directory"

      - id: no_existing_spec
        description: "Check for existing spec (avoid overwrite)"
        script: |
          const fs = require('fs');
          const specPath = `docs/stories/${storyId}/spec/spec.md`;
          return !fs.existsSync(specPath);
        blocking: false
        warning: "Existing spec found - will iterate"

      - id: agents_available
        description: "Verify required agents are configured"
        check: "All spec pipeline agents have autoClaude.specPipeline defined"
        blocking: true

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              WORKFLOW SEQUENCE
  # ═══════════════════════════════════════════════════════════════════════════════════

  sequence:

    # ═════════════════════════════════════════════════════════════════════════════════
    # PHASE 1: GATHER REQUIREMENTS
    # ═══════════════════════════════════════════════════════
```