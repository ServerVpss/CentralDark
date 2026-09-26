# COMANDO - greenfield-ui.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\greenfield-ui.yaml
**SHA:** 4924c52f75e09579
**Timestamp:** 2026-08-28T02:02:10.241152
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: UI Development] --> B[analyst: project-brief.md]

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: greenfield-ui
  name: Greenfield UI/Frontend Development
  description: >-
    Agent workflow for building frontend applications from concept to development.
    Supports both comprehensive planning for complex UIs and rapid prototyping for simple interfaces.
  type: greenfield
  version: "1.0"
  project_types:
    - spa
    - mobile-app
    - micro-frontend
    - static-site
    - ui-prototype
    - simple-interface

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Discovery & Planning
    - phase_2: Document Sharding
    - phase_3: Development Cycle

  sequence:
    - phase: 1
      name: Discovery & Planning
      description: "Create all planning artifacts (project brief, PRD, frontend spec, architecture)"

    - id: analyst-project-brief
      agent: analyst
      creates: project-brief.md
      optional_steps:
        - brainstorming_session
        - market_research_prompt
      notes: "Can do brainstorming first, then optional deep research before creating project brief. SAVE OUTPUT: Copy final project-brief.md to your project's docs/ folder."

    - id: pm-create-prd
      agent: pm
      creates: prd.md
      requires: project-brief.md
      notes: "Creates PRD from project brief using prd-tmpl, focused on UI/frontend requirements. SAVE OUTPUT: Copy final prd.md to your project's docs/ folder."

    - id: ux-create-frontend-spec
      agent: ux-design-expert
      creates: front-end-spec.md
      requires: prd.md
      optional_steps:
        - user_research_prompt
      notes: "Creates UI/UX specification using front-end-spec-tmpl. SAVE OUTPUT: Copy final front-end-spec.md to your project's docs/ folder."

    - id: ux-generate-v0-prompt
      agent: ux-design-expert
      creates: v0_prompt (optional)
      requires: front-end-spec.md
      condition: user_wants_ai_generation
      notes: "OPTIONAL BUT RECOMMENDED: Generate AI UI prompt for tools like v0, Lovable, etc. Use the generate-ai-frontend-prompt task. User can then generate UI in external tool and download project structure."

    - id: architect-create-architecture
      agent: architect
      creates: front-end-architecture.md
      requires: front-end-spec.md
      optional_steps:
        - technical_research_prompt
        - review_generated_ui_structure
      notes: "Creates frontend architecture using front-end-architecture-tmpl. If user generated UI with v0/Lovable, can incorporate the project structure into architecture. May suggest changes to PRD stories or new stories. SAVE OUTPUT: Copy final front-end-architecture.md to your project's docs/ folder."

    - id: pm-update-prd
      agent: pm
      updates: prd.md
      requires: front-end-architecture.md
      condition: architecture_suggests_prd_changes
      notes: "If architect suggests story changes, update PRD and re-export the complete unredacted prd.md to docs/ folder."

    - id: po-validate-artifacts
      agent: po
      validates: all_artifacts
      uses: po-master-checklist
      notes: "Validates all documents for consistency and completeness. May require updates to any document."

    - id: po-delegate-fixes
      agent: po
      action: delegate_fixes
      delegates_to: [analyst, pm, ux-design-expert, architect]
      updates: any_flagged_documents
      condition: po_checklist_issues
      notes: "If PO finds issues, PO delegates fixes to the relevant agent and re-validates updated documents in docs/ folder."

    - meta: guidance
      id: project-setup-guidance
      action: guide_project_structure
      condition: user_has_generated_ui
      notes: "If user generated UI with v0/Lovable: For polyrepo setup, place downloaded project in separate frontend repo. For monorepo, place in apps/web or frontend/ directory. Review architecture document for specific guidance."

    - phase: 2
      name: Document Sharding
      description: "Break down PRD and architecture into development-ready chunks"

    - id: po-shard-documents
      agent: po
      action: shard_documents
      creates: sharded_docs
      requires: all_artifacts_in_project
      notes: |
        Shard documents for IDE development:
        - Option A: Use PO agent to shard: @po then ask to shard docs/prd.md
        - Option B: Manual: Drag shard-doc task + docs/prd.md into chat
        - Creates docs/prd/ and docs/architecture/ folders with sharded content

    - phase: 3
      name: Development Cycle
      description: "Iterative story implementation with QA review"

    - id: sm-create-story
      agent: sm
      action: create_story
      creates: story.md
      requires: sharded_docs
      repeats: for_each_epic
      notes: |
        Story creation cycle:
        - SM Agent (New Chat): @sm → *create
        - Creates next story from sharded docs
        - Story starts in "Draft" status

    - id: pm-review-draft-story
      agent: pm
      alternative_agent: analyst
      action: review_draft_story
      updates: story.md
      requires: s
```