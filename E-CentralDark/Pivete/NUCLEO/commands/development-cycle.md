# COMANDO - development-cycle.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\development-cycle.yaml
**SHA:** 498c20a5340140b5
**Timestamp:** 2026-08-28T02:02:10.172484
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: "30m"
- 4_quality_gate:
- return_to_quality_gate:

### Ouro Bruto (primeiros 5000 chars)
```
# ============================================
# Development Cycle Workflow
# Story 11.3: Projeto Bob - Orquestração de Agentes
#
# Ciclo completo: PO → Executor → Quality Gate → DevOps → Push
# com checkpoints humanos e self-healing integrado.
#
# @version 1.0.0
# @author @dev (Dex) for Story 11.3
# ============================================

workflow:
  id: development-cycle
  name: "Development Cycle (Projeto Bob)"
  version: "1.0.0"
  description: >-
    Workflow orquestrado para ciclo de desenvolvimento por story.
    Implementa o fluxo PO → Executor → Quality Gate → DevOps → Push
    com suporte a executor dinâmico, self-healing e checkpoints humanos.
  orchestrator: "@po"

  # ============================================
  # Triggers
  # ============================================
  triggers:
    - type: story_approved
      description: "Story aprovada pelo PO via validate-story-draft"
    - type: manual
      description: "Execução manual via *workflow development-cycle"

  # ============================================
  # Configuration
  # ============================================
  config:
    # Dynamic executor from Story 11.1
    use_dynamic_executor: true
    executor_assignment_module: ".aios-core/core/orchestration/executor-assignment.js"

    # Terminal spawning from Story 11.2
    use_terminal_spawning: true
    terminal_spawner_module: ".aios-core/core/orchestration/terminal-spawner.js"

    # Self-healing configuration
    self_healing:
      enabled: "${config.coderabbit_integration.enabled}"
      max_iterations: 3
      severity_filter: [CRITICAL, HIGH]

    # Checkpoint configuration
    checkpoint:
      enabled: true
      require_human_decision: true
      timeout_minutes: 30

    # Timeouts
    timeouts:
      validation: "10m"
      development: "2h"
      self_healing: "30m"
      quality_gate: "30m"
      push: "10m"

  # ============================================
  # Inputs
  # ============================================
  inputs:
    story_file:
      type: path
      required: true
      description: "Path to story file (.story.md)"
    epic_context:
      type: object
      required: false
      description: "Epic context with accumulated story info"

  # ============================================
  # Phases
  # ============================================
  phases:
    # ----------------------------------------
    # Phase 1: Story Validation
    # ----------------------------------------
    1_validation:
      id: validation
      name: "Story Validation"
      agent: "@po"
      task: "validate-story-draft"
      description: >-
        PO valida a story com Epic Context antes de iniciar desenvolvimento.
        Garante que a story tem executor e quality_gate atribuídos.

      inputs:
        - story_file
        - epic_context

      outputs:
        - validation_result:
            type: object
            properties:
              passed: boolean
              score: number
              issues: array

      validations:
        - check: "story.executor != null"
          error: "Story must have an executor assigned"
        - check: "story.quality_gate != null"
          error: "Story must have a quality_gate assigned"
        - check: "story.executor != story.quality_gate"
          error: "Executor and Quality Gate must be different agents"

      on_success: 2_development
      on_failure: reject_with_feedback

    # ----------------------------------------
    # Phase 2: Development (Dynamic Executor)
    # ----------------------------------------
    2_development:
      id: development
      name: "Development"
      agent: "${story.executor}"  # Dynamic from Story 11.1
      task: "develop"
      description: >-
        Executor dinâmico desenvolve a story baseado na atribuição.
        Usa terminal spawning para contexto limpo (Story 11.2).

      spawn_in_terminal: true  # Use TerminalSpawner

      inputs:
        - validated_story:
            from: 1_validation.validation_result
        - story_file

      outputs:
        - implementation:
            type: object
            properties:
              files_created: array
              files_modified: array
              tests_added: array
        - test_results:
            type: object
            properties:
              passed: number
              failed: number
              skipped: number

      timeout: "${config.timeouts.development}"

      on_success: 3_self_healing
      on_failure: return_to_po

    # ----------------------------------------
    # Phase 3: Self-Healing (Conditional)
    # ----------------------------------------
    3_self_healing:
      id: self_healing
      name: "Self-Healing"
      agent: "@dev"
      task: "self-heal"
      description: >-
        Self-healing com CodeRabbit para corrigir issues automaticamente.
        Só executa se coderabbit_integration.enabled == true.

      condition: "${config.coderabbit_integration.enabled} == true"

      inpu
```