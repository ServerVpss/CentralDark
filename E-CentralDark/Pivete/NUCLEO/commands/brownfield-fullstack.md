# COMANDO - brownfield-fullstack.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\brownfield-fullstack.yaml
**SHA:** 73eaa8c5d7813415
**Timestamp:** 2026-08-28T02:02:10.161772
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Brownfield Enhancement] --> B[analyst: classify enhancement scope]

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: brownfield-fullstack
  name: Brownfield Full-Stack Enhancement
  description: >-
    Agent workflow for enhancing existing full-stack applications with new features,
    modernization, or significant changes. Handles existing system analysis and safe integration.
  type: brownfield
  version: "1.0"
  project_types:
    - feature-addition
    - refactoring
    - modernization
    - integration-enhancement

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Enhancement Classification & Routing
    - phase_2: Planning & Documentation
    - phase_3: Document Sharding
    - phase_4: Development Cycle

  sequence:
    - phase: 1
      name: Enhancement Classification & Routing

    - id: analyst-classify-enhancement
      step: enhancement_classification
      agent: analyst
      action: classify enhancement scope
      duration_estimate: "10-15 min"
      elicit: true
      notes: |
        Determine enhancement complexity to route to appropriate path:
        - Single story (< 4 hours) → Use brownfield-create-story task
        - Small feature (1-3 stories) → Use brownfield-create-epic task
        - Major enhancement (multiple epics) → Continue with full workflow

        Ask user: "Can you describe the enhancement scope? Is this a small fix, a feature addition, or a major enhancement requiring architectural changes?"

    - id: routing-decision
      step: routing_decision
      meta: routing
      duration_estimate: "5 min"
      condition: based_on_classification
      routes:
        single_story:
          agent: pm
          uses: brownfield-create-story
          notes: "Create single story for immediate implementation. Exit workflow after story creation."
        small_feature:
          agent: pm
          uses: brownfield-create-epic
          notes: "Create focused epic with 1-3 stories. Exit workflow after epic creation."
        major_enhancement:
          continue: to_next_step
          notes: "Continue with comprehensive planning workflow below."

    - phase: 2
      name: Planning & Documentation

    - id: analyst-check-documentation
      step: documentation_check
      agent: analyst
      action: check existing documentation
      duration_estimate: "10-20 min"
      condition: major_enhancement_path
      notes: |
        Check if adequate project documentation exists:
        - Look for existing architecture docs, API specs, coding standards
        - Assess if documentation is current and comprehensive
        - If adequate: Skip document-project, proceed to PRD
        - If inadequate: Run document-project first

    - id: architect-analyze-project
      step: project_analysis
      agent: architect
      action: analyze existing project and use task document-project
      creates: [brownfield-architecture.md]
      duration_estimate: "30-60 min"
      condition: documentation_inadequate
      notes: "Run document-project to capture current system state, technical debt, and constraints. Pass findings to PRD creation."

    - id: pm-create-prd
      agent: pm
      creates: prd.md
      uses: brownfield-prd-tmpl
      duration_estimate: "30-60 min"
      requires: existing_documentation_or_analysis
      notes: |
        Creates PRD for major enhancement. If document-project was run, reference its output to avoid re-analysis.
        If skipped, use existing project documentation.
        SAVE OUTPUT: Copy final prd.md to your project's docs/ folder.

    - id: pm-architecture-decision
      step: architecture_decision
      agent: pm
      alternative_agent: architect
      action: determine if architecture document needed
      duration_estimate: "10-15 min"
      condition: after_prd_creation
      notes: |
        Review PRD to determine if architectural planning is needed:
        - New architectural patterns → Create architecture doc
        - New libraries/frameworks → Create architecture doc
        - Platform/infrastructure changes → Create architecture doc
        - Following existing patterns → Skip to story creation

    - id: architect-create-architecture
      agent: architect
      creates: architecture.md
      uses: brownfield-architecture-tmpl
      duration_estimate: "30-60 min"
      requires: prd.md
      condition: architecture_changes_needed
      notes: "Creates architecture ONLY for significant architectural changes. SAVE OUTPUT: Copy final architecture.md to your project's docs/ folder."

    - id: po-validate-artifacts
      agent: po
      validates: all_artifacts
      uses: po-master-checklist
      duration_estimate: "15-30 min"
      notes: "Validates all documents for integration safety and completeness. May require updates to any document."

    - id: po-delegate-fixes
      agent: po
      action: delegate_fixes
      delegates_to: [analyst, pm, architect]
      updates: any_flagged_documents
      duration_estimate: "15-30 min"
      condition: po_checklist_issues
      notes: "If PO finds issues,
```