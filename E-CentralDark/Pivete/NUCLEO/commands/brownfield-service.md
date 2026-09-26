# COMANDO - brownfield-service.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\brownfield-service.yaml
**SHA:** 86aa706579543728
**Timestamp:** 2026-08-28T02:02:10.199669
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Service Enhancement] --> B[architect: analyze existing service]

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: brownfield-service
  name: Brownfield Service/API Enhancement
  description: >-
    Agent workflow for enhancing existing backend services and APIs with new features,
    modernization, or performance improvements. Handles existing system analysis and safe integration.
  type: brownfield
  version: "1.0"
  project_types:
    - service-modernization
    - api-enhancement
    - microservice-extraction
    - performance-optimization
    - integration-enhancement

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Service Analysis & Planning
    - phase_2: Document Sharding
    - phase_3: Development Cycle

  sequence:
    - phase: 1
      name: Service Analysis & Planning
      description: "Analyze existing service and create planning artifacts"

    - id: architect-service-analysis
      step: service_analysis
      agent: architect
      action: document-project  # task-reference
      creates: [project-documentation.md]
      duration_estimate: "30-60 min"
      notes: "Review existing service documentation, codebase, performance metrics, and identify integration dependencies."

    - id: pm-create-prd
      agent: pm
      creates: prd.md
      uses: brownfield-prd-tmpl
      duration_estimate: "30-60 min"
      requires: existing_service_analysis
      notes: "Creates comprehensive PRD focused on service enhancement with existing system analysis. SAVE OUTPUT: Copy final prd.md to your project's docs/ folder."

    - id: architect-create-architecture
      agent: architect
      creates: architecture.md
      uses: brownfield-architecture-tmpl
      duration_estimate: "30-60 min"
      requires: prd.md
      notes: "Creates architecture with service integration strategy and API evolution planning. SAVE OUTPUT: Copy final architecture.md to your project's docs/ folder."

    - id: po-validate-artifacts
      agent: po
      validates: all_artifacts
      uses: po-master-checklist
      duration_estimate: "15-30 min"
      notes: "Validates all documents for service integration safety and API compatibility. May require updates to any document."

    - id: po-delegate-fixes
      agent: po
      action: delegate_fixes
      delegates_to: [analyst, pm, architect]
      updates: any_flagged_documents
      duration_estimate: "15-30 min"
      condition: po_checklist_issues
      notes: "If PO finds issues, PO delegates fixes to the relevant agent and re-validates updated documents in docs/ folder."

    - phase: 2
      name: Document Sharding
      description: "Break down PRD and architecture into development-ready chunks"

    - id: po-shard-documents
      agent: po
      action: shard_documents
      creates: sharded_docs
      duration_estimate: "15-30 min"
      requires:
        - prd.md
        - architecture.md
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
      alternative_agent: analyst
      action: review_draft_story
      updates: story.md
      duration_estimate: "10-20 min"
      requires: story.md
      optional: true
      condition: user_wants_story_review
      notes: |
        OPTIONAL: Review and approve draft story
        - NOTE: story-review task coming soon
        - Review story completeness and alignment
        - Update story status: Draft → Approved

    - id: dev-implement-story
      agent: dev
      action: implement_story
      creates: implementation_files
      duration_estimate: "1-4 hours"
      requires: story.md
      notes: |
        Dev Agent (New Chat): @dev
        - Implements approved story
        - Updates File List with all changes
        - Marks story as "Review" when complete

    - id: qa-review-implementation
      agent: qa
      action: review_implementation
      updates: implementation_files
      duration_estimate: "20-40 min"
      requires: implementation_files
      optional: true
      notes: |
        OPTIONAL: QA Agent (New Chat): @qa → review-story
        - Senior dev review with refactoring ability
        - Fixes small issues directly
        - Leaves checklist for remaining items
        - Updates story status (Review → Done or stays Review)

    - id: dev-address-qa-feedback
      agent: dev
      action: address_qa_feedback
      
```