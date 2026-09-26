# COMANDO - story-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\story-tmpl.yaml
**SHA:** 3fa85f0ebef9e8ee
**Timestamp:** 2026-08-28T02:02:21.450416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- quality_gate: "{{quality_gate}}"

### Riscos
- Predicted CodeRabbit validation checkpoints based on story type and risk:

### Ouro Bruto (primeiros 5000 chars)
```
template:
  id: story-template-v2
  name: Story Document
  version: 2.0
  output:
    format: markdown
    filename: docs/stories/{{epic_num}}.{{story_num}}.{{story_title_short}}.md
    title: "Story {{epic_num}}.{{story_num}}: {{story_title_short}}"

workflow:
  mode: interactive
  elicitation: advanced-elicitation

agent_config:
  editable_sections:
    - Status
    - Story
    - Acceptance Criteria
    - CodeRabbit Integration
    - Tasks / Subtasks
    - Dev Notes
    - Testing
    - Change Log

sections:
  - id: community-origin
    title: Community Origin
    type: optional
    instruction: |
      **For stories originating from community ideas:**
      Complete this section if this story was created from a community idea discussion.
      Leave blank for internally-planned stories.
    template: |
      **Discussion URL**: {{discussion_url}}
      **Author**: @{{author_username}}
      **Approved Date**: {{approved_date}}
      **Approved By**: @{{approver_username}}
    owner: scrum-master
    editors: [scrum-master, po]

  - id: status
    title: Status
    type: choice
    choices: [Draft, Approved, InProgress, Review, Done]
    instruction: Select the current status of the story
    owner: scrum-master
    editors: [scrum-master, dev-agent]

  # Story 11.1: Dynamic Executor Assignment (Projeto Bob)
  - id: executor-assignment
    title: Executor Assignment
    type: metadata
    required: true
    instruction: |
      **REQUIRED FIELDS** - Automatically populated by PM during epic creation.

      Uses dynamic executor assignment based on story type analysis.
      See: PRD AIOS v2.0 "Projeto Bob" - Section 5

      **Work Type → Executor Mapping:**
      | Work Type | Executor | Quality Gate |
      |-----------|----------|--------------|
      | Code/Features/Logic | @dev | @architect |
      | Schema/DB/RLS/Migrations | @data-engineer | @dev |
      | Infra/CI/CD/Deploy | @devops | @architect |
      | Design/UI Components | @ux-design-expert | @dev |
      | Research/Investigation | @analyst | @pm |
      | Architecture Decisions | @architect | @pm |

      **VALIDATION RULES:**
      - executor != quality_gate (ALWAYS)
      - quality_gate_tools must not be empty
    template: |
      executor: "{{executor}}"
      quality_gate: "{{quality_gate}}"
      quality_gate_tools: {{quality_gate_tools}}
    validation:
      - rule: executor != quality_gate
        error: "Executor cannot be the same as Quality Gate"
      - rule: quality_gate_tools.length > 0
        error: "Quality gate tools cannot be empty"
    owner: pm
    editors: [pm, scrum-master]

  - id: story
    title: Story
    type: template-text
    template: |
      **As a** {{role}},
      **I want** {{action}},
      **so that** {{benefit}}
    instruction: Define the user story using the standard format with role, action, and benefit
    elicit: true
    owner: scrum-master
    editors: [scrum-master]
    
  - id: acceptance-criteria
    title: Acceptance Criteria
    type: numbered-list
    instruction: Copy the acceptance criteria numbered list from the epic file
    elicit: true
    owner: scrum-master
    editors: [scrum-master]

  - id: coderabbit-integration
    title: 🤖 CodeRabbit Integration
    # CONDITIONAL SECTION - Story 6.3.3 Self-Healing Integration
    conditional:
      config_path: ".aios-core/core-config.yaml"
      config_key: "coderabbit_integration.enabled"
      behavior:
        when_true: render_full_section
        when_false: render_skip_notice
      skip_notice: |
        > **CodeRabbit Integration**: Disabled
        >
        > CodeRabbit CLI is not enabled in `core-config.yaml`.
        > Quality validation will use manual review process only.
        > To enable, set `coderabbit_integration.enabled: true` in core-config.yaml
    instruction: |
      **CONDITIONAL SECTION** - Check core-config.yaml `coderabbit_integration.enabled`

      **IF enabled=true:**
        Populate this section with story type analysis, quality gates,
        specialized agent assignments, and self-healing configuration.
        This section is auto-generated during story creation.

      **IF enabled=false:**
        SKIP this entire section. Render only the skip_notice above.
        Quality validation falls back to manual review process.

      Based on story type analysis, document the predicted quality gates and
      specialized agent assignments. This section is auto-generated during story
      creation but can be manually adjusted if needed.
    elicit: true
    owner: scrum-master
    editors: [scrum-master, po]
    sections:
      - id: story-type-analysis
        title: Story Type Analysis
        instruction: |
          Categorize story based on technical characteristics:
          - Database: Schema changes, migrations, RLS policies
          - API: REST endpoints, services, business logic
          - Frontend: Components, UX, accessibility
          - Deployment: CI/CD, infrastructure, configuration
        
```