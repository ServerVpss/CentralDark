# COMANDO - greenfield-service.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\greenfield-service.yaml
**SHA:** 01afcb15290eeb3e
**Timestamp:** 2026-08-28T02:02:10.214904
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Service Development] --> B[analyst: project-brief.md]

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: greenfield-service
  name: Greenfield Service/API Development
  version: "1.0"
  description: >-
    Agent workflow for building backend services from concept to development.
    Supports both comprehensive planning for complex services and rapid prototyping for simple APIs.
  type: greenfield
  project_types:
    - rest-api
    - graphql-api
    - microservice
    - backend-service
    - api-prototype
    - simple-service

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Discovery & Planning
    - phase_2: Document Sharding
    - phase_3: Development Cycle

  sequence:
    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 1: DISCOVERY & PLANNING
    # ═══════════════════════════════════════════════════════════════════════════
    - phase: 1
      name: Discovery & Planning
      description: "Create all planning artifacts (project brief, PRD, architecture)"

    - id: analyst-project-brief
      agent: analyst
      creates: project-brief.md
      duration_estimate: "30-60 min"
      optional_steps:
        - brainstorming-session
        - market-research-prompt
      notes: "Can do brainstorming first, then optional deep research before creating project brief. SAVE OUTPUT: Copy final project-brief.md to your project's docs/ folder."

    - id: pm-create-prd
      agent: pm
      creates: prd.md
      duration_estimate: "30-60 min"
      requires: project-brief.md
      notes: "Creates PRD from project brief using prd-tmpl, focused on API/service requirements. SAVE OUTPUT: Copy final prd.md to your project's docs/ folder."

    - id: architect-create-architecture
      agent: architect
      creates: architecture.md
      duration_estimate: "30-60 min"
      requires: prd.md
      optional_steps:
        - technical-research-prompt
      notes: "Creates backend/service architecture using architecture-tmpl. May suggest changes to PRD stories or new stories. SAVE OUTPUT: Copy final architecture.md to your project's docs/ folder."

    - id: pm-update-prd
      agent: pm
      updates: prd.md
      duration_estimate: "15-30 min"
      requires: architecture.md
      condition: architecture_suggests_prd_changes
      notes: "If architect suggests story changes, update PRD and re-export the complete unredacted prd.md to docs/ folder."

    - id: po-validate-artifacts
      agent: po
      validates: all_artifacts
      uses: po-master-checklist
      duration_estimate: "15-30 min"
      notes: "Validates all documents for consistency and completeness. May require updates to any document."

    - id: po-delegate-fixes
      agent: po
      action: delegate_fixes
      delegates_to: [analyst, pm, architect]
      updates: any_flagged_documents
      duration_estimate: "15-30 min"
      condition: po_checklist_issues
      returns_to: po-validate-artifacts
      notes: "If PO finds issues, PO delegates fixes to the relevant agent. After fixes are applied, returns to po-validate-artifacts for re-validation before proceeding to Phase 2."

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 2: DOCUMENT SHARDING
    # ═══════════════════════════════════════════════════════════════════════════
    - phase: 2
      name: Document Sharding
      description: "Break down PRD and architecture into development-ready chunks"

    - id: po-shard-documents
      agent: po
      action: shard_documents
      creates: sharded_docs
      duration_estimate: "15-30 min"
      requires:  # all validated artifacts must be saved in project docs/ folder
        - prd.md
        - architecture.md
      notes: |
        Shard documents for IDE development:
        - Option A: Use PO agent to shard: @po then ask to shard docs/prd.md
        - Option B: Manual: Drag shard-doc task + docs/prd.md into chat
        - Creates docs/prd/ and docs/architecture/ folders with sharded content

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 3: DEVELOPMENT CYCLE
    # ═══════════════════════════════════════════════════════════════════════════
    - phase: 3
      name: Development Cycle
      description: "Iterative story implementation with QA review"

    - id: sm-create-story
      agent: sm
      action: create_story
      creates: story.md
      duration_estimate: "15-30 min"
      requires: sharded_docs
      repeats: for_each_epic
      notes: |
        Story creation cycle:
        - SM Agent (New Chat): @sm → *create
        - Creates next story from sharded docs
        - Story starts in "Draft" status

    - id: pm-review-draft-story
      agent: pm
      action: review_draft_story
      alternative_agent: analyst
      updates: story.md
      duration_estimate: "10-20 min"
      requires: story.md
      optional: true
      condition: user_wants_story_review
      notes: |
        OPTIONAL: Review and approve draft story
        - NOTE: story-review task comi
```