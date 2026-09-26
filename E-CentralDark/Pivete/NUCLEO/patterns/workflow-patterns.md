# PADRAO - workflow-patterns.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\data\workflow-patterns.yaml
**SHA:** 3c3625a5d9eb6eca
**Timestamp:** 2026-08-28T02:02:02.358436
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: "Creates state file, validates workflow, shows step 1"

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow Patterns Definition
# Defines common AIOS workflow sequences for context detection
#
# Version: 1.0
# Created: 2025-01-15
# Story: 6.1.2.5 - Contextual Agent Load System
#
# Format:
# - workflow_name: Unique identifier
# - description: Human-readable workflow description
# - agent_sequence: Expected sequence of agents used
# - key_commands: Commands that signal this workflow
# - trigger_threshold: Minimum matching commands to detect pattern (default: 2)

workflows:
  # Story Development Workflow (Most Common)
  story_development:
    description: "Complete story lifecycle from validation to deployment"
    agent_sequence:
      - po         # Story validation
      - dev        # Implementation
      - qa         # Quality assurance
      - devops     # Deployment
    key_commands:
      - validate-story-draft
      - validate-next-story
      - develop
      - develop-yolo
      - develop-interactive
      - develop-preflight
      - review-qa
      - apply-qa-fixes
      - pre-push-quality-gate
      - github-pr-automation
    trigger_threshold: 2
    typical_duration: "1-5 days"
    success_indicators:
      - "Story status: Ready for Review"
      - "All tests passing"
      - "PR created and merged"
    # Workflow transitions (Story 6.1.2.5 - Workflow Navigation)
    transitions:
      validated:
        trigger: "validate-story-draft completed"
        confidence: 0.90
        greeting_message: "Story validated! Ready to implement."
        next_steps:
          - command: develop-yolo
            args_template: "${story_path}"
            description: "Autonomous YOLO mode (no interruptions)"
            priority: 1
          - command: develop-interactive
            args_template: "${story_path}"
            description: "Interactive mode with checkpoints (default)"
            priority: 2
          - command: develop-preflight
            args_template: "${story_path}"
            description: "Plan everything upfront, then execute"
            priority: 3
      in_development:
        trigger: "develop completed"
        confidence: 0.85
        greeting_message: "Development complete! Ready for QA review."
        next_steps:
          - command: review-qa
            args_template: "${story_path}"
            description: "Run QA review and tests"
            priority: 1
          - command: run-tests
            args_template: ""
            description: "Execute test suite manually"
            priority: 2
      qa_reviewed:
        trigger: "review-qa completed"
        confidence: 0.80
        greeting_message: "QA review complete!"
        next_steps:
          - command: apply-qa-fixes
            args_template: ""
            description: "Apply QA feedback and fixes"
            priority: 1
          - command: pre-push-quality-gate
            args_template: ""
            description: "Run final quality checks before push"
            priority: 2

  # Epic Creation Workflow
  epic_creation:
    description: "Create and organize epics with initial stories"
    agent_sequence:
      - po         # Epic planning
      - sm         # Story creation
      - architect  # Technical review
    key_commands:
      - create-epic
      - brownfield-create-epic
      - create-story
      - brownfield-create-story
      - create-next-story
      - validate-story-draft
      - analyze-impact
    trigger_threshold: 2
    typical_duration: "0.5-2 days"
    success_indicators:
      - "Epic documented"
      - "Initial stories created"
      - "Stories validated"
    transitions:
      epic_drafted:
        trigger: "create-epic completed"
        confidence: 0.90
        next_steps:
          - command: analyze-epic
            args_template: "${epic_path}"
            description: "Analyze epic for completeness"
            priority: 1
          - command: create-story
            args_template: "${epic_path}"
            description: "Create first story from epic"
            priority: 2
      stories_created:
        trigger: "create-story completed"
        confidence: 0.85
        next_steps:
          - command: validate-story-draft
            args_template: "${story_path}"
            description: "Validate story structure"
            priority: 1
          - command: create-next-story
            args_template: "${epic_path}"
            description: "Create additional stories"
            priority: 2
      validated:
        trigger: "validate-story-draft completed"
        confidence: 0.80
        next_steps:
          - command: analyze-impact
            args_template: "${story_path}"
            description: "Analyze technical impact"
            priority: 1
          - command: develop
            args_template: "${story_path}"
            description: "Begin story development"
            priority: 2

  # Backlog Management Workflow
  backlog_management:
    description: "Review, prioritize, and schedule backlog items"
    agent_sequence:
      - qa         # Backlog review
```