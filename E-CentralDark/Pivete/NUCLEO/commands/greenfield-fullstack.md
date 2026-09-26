# COMANDO - greenfield-fullstack.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\greenfield-fullstack.yaml
**SHA:** 3149a9a794ade4a1
**Timestamp:** 2026-08-28T02:02:10.231475
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Greenfield Project] --> A1{Environment ready?}

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: greenfield-fullstack
  name: Greenfield Full-Stack Application Development
  description: >-
    Agent workflow for building full-stack applications from concept to development.
    Supports both comprehensive planning for complex projects and rapid prototyping for simple ones.
    Includes Phase 0 environment bootstrap for proper tooling setup.
  type: greenfield
  version: "1.0"
  project_types:
    - web-app
    - saas
    - enterprise-app
    - prototype
    - mvp

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_0: Environment Bootstrap
    - phase_1: Discovery & Planning
    - phase_2: Document Sharding
    - phase_3: Development Cycle

  sequence:
    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 0: ENVIRONMENT BOOTSTRAP
    # ═══════════════════════════════════════════════════════════════════════════
    - phase: 0
      name: Environment Bootstrap
      description: "Setup development environment before starting project planning"

    - id: devops-environment-bootstrap
      agent: devops
      action: environment_bootstrap
      duration_estimate: "15-30 min"
      creates:
        - .aios/config.yaml
        - .aios/environment-report.json
        - .gitignore
        - README.md
        - package.json
      task: environment-bootstrap.md
      optional: false
      notes: |
        CRITICAL FIRST STEP - Run before any planning:
        - @devops → *environment-bootstrap
        - Verifies/installs CLIs (git, gh, node, supabase, railway)
        - Authenticates services (GitHub, Supabase, Railway)
        - Creates Git repository locally and on GitHub
        - Scaffolds AIOS project structure
        - Generates environment report

        SKIP CONDITIONS:
        - Only skip if project already has .aios/environment-report.json
        - Re-run if switching machines or team members join

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 1: DISCOVERY & PLANNING
    # ═══════════════════════════════════════════════════════════════════════════
    - phase: 1
      name: Discovery & Planning
      description: "Create all planning artifacts (project brief, PRD, specs, architecture)"

    - id: analyst-project-brief
      agent: analyst
      creates: project-brief.md
      duration_estimate: "30-60 min"
      requires: environment_bootstrap_complete
      optional_steps:
        - brainstorming-session
        - market-research-prompt
      notes: "Can do brainstorming first, then optional deep research before creating project brief. SAVE OUTPUT: Copy final project-brief.md to your project's docs/ folder."

    - id: pm-create-prd
      agent: pm
      creates: prd.md
      duration_estimate: "30-60 min"
      requires: project-brief.md
      notes: "Creates PRD from project brief using prd-tmpl. SAVE OUTPUT: Copy final prd.md to your project's docs/ folder."

    - id: ux-create-frontend-spec
      agent: ux-design-expert
      creates: front-end-spec.md
      duration_estimate: "30-45 min"
      requires: prd.md
      optional_steps:
        - user-research-prompt
      notes: "Creates UI/UX specification using front-end-spec-tmpl. SAVE OUTPUT: Copy final front-end-spec.md to your project's docs/ folder."

    - id: ux-generate-v0-prompt
      agent: ux-design-expert
      creates: v0_prompt (optional)
      duration_estimate: "15-30 min"
      requires: front-end-spec.md
      condition: user_wants_ai_generation
      notes: "OPTIONAL BUT RECOMMENDED: Generate AI UI prompt for tools like v0, Lovable, etc. Use the generate-ai-frontend-prompt task. User can then generate UI in external tool and download project structure."

    - id: architect-create-architecture
      agent: architect
      creates: fullstack-architecture.md
      duration_estimate: "30-60 min"
      requires:
        - prd.md
        - front-end-spec.md
      optional_steps:
        - technical-research-prompt
        - review-generated-ui-structure
      notes: "Creates comprehensive architecture using fullstack-architecture-tmpl. If user generated UI with v0/Lovable, can incorporate the project structure into architecture. May suggest changes to PRD stories or new stories. SAVE OUTPUT: Copy final fullstack-architecture.md to your project's docs/ folder."

    - id: pm-update-prd
      agent: pm
      updates: prd.md
      duration_estimate: "15-30 min"
      requires: fullstack-architecture.md
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
      action: delegate_fixe
```