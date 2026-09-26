# COMANDO - fullstack-architecture-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\fullstack-architecture-tmpl.yaml
**SHA:** 1ac74304138be53d
**Timestamp:** 2026-08-28T02:02:20.765129
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - "**Repository Pattern:** Abstract data access logic - _Rationale:_ Enables testing and future database migration flexibility"
- - "**API Gateway Pattern:** Single entry point for all API calls - _Rationale:_ Centralized auth, rate limiting, and monitoring"

### Ouro Bruto (primeiros 5000 chars)
```
template:
  id: fullstack-architecture-template-v2
  name: Fullstack Architecture Document
  version: 2.0
  output:
    format: markdown
    filename: docs/architecture.md
    title: "{{project_name}} Fullstack Architecture Document"

workflow:
  mode: interactive
  elicitation: advanced-elicitation

sections:
  - id: introduction
    title: Introduction
    instruction: |
      If available, review any provided relevant documents to gather all relevant context before beginning. At minimum, you should have access to docs/prd.md and docs/front-end-spec.md. Ask the user for any documents you need but cannot locate. This template creates a unified architecture that covers both backend and frontend concerns to guide AI-driven fullstack development.
    elicit: true
    content: |
      This document outlines the complete fullstack architecture for {{project_name}}, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.
      
      This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.
    sections:
      - id: starter-template
        title: Starter Template or Existing Project
        instruction: |
          Before proceeding with architecture design, check if the project is based on any starter templates or existing codebases:
          
          1. Review the PRD and other documents for mentions of:
          - Fullstack starter templates (e.g., T3 Stack, MEAN/MERN starters, Django + React templates)
          - Monorepo templates (e.g., Nx, Turborepo starters)
          - Platform-specific starters (e.g., Vercel templates, AWS Amplify starters)
          - Existing projects being extended or cloned
          
          2. If starter templates or existing projects are mentioned:
          - Ask the user to provide access (links, repos, or files)
          - Analyze to understand pre-configured choices and constraints
          - Note any architectural decisions already made
          - Identify what can be modified vs what must be retained
          
          3. If no starter is mentioned but this is greenfield:
          - Suggest appropriate fullstack starters based on tech preferences
          - Consider platform-specific options (Vercel, AWS, etc.)
          - Let user decide whether to use one
          
          4. Document the decision and any constraints it imposes
          
          If none, state "N/A - Greenfield project"
      - id: changelog
        title: Change Log
        type: table
        columns: [Date, Version, Description, Author]
        instruction: Track document versions and changes

  - id: high-level-architecture
    title: High Level Architecture
    instruction: This section contains multiple subsections that establish the foundation. Present all subsections together, then elicit feedback on the complete section.
    elicit: true
    sections:
      - id: technical-summary
        title: Technical Summary
        instruction: |
          Provide a comprehensive overview (4-6 sentences) covering:
          - Overall architectural style and deployment approach
          - Frontend framework and backend technology choices
          - Key integration points between frontend and backend
          - Infrastructure platform and services
          - How this architecture achieves PRD goals
      - id: platform-infrastructure
        title: Platform and Infrastructure Choice
        instruction: |
          Based on PRD requirements and technical assumptions, make a platform recommendation:
          
          1. Consider common patterns (not an exhaustive list, use your own best judgement and search the web as needed for emerging trends):
          - **Vercel + Supabase**: For rapid development with Next.js, built-in auth/storage
          - **AWS Full Stack**: For enterprise scale with Lambda, API Gateway, S3, Cognito
          - **Azure**: For .NET ecosystems or enterprise Microsoft environments
          - **Google Cloud**: For ML/AI heavy applications or Google ecosystem integration
          
          2. Present 2-3 viable options with clear pros/cons
          3. Make a recommendation with rationale
          4. Get explicit user confirmation
          
          Document the choice and key services that will be used.
        template: |
          **Platform:** {{selected_platform}}
          **Key Services:** {{core_services_list}}
          **Deployment Host and Regions:** {{regions}}
      - id: repository-structure
        title: Repository Structure
        instruction: |
          Define the repository approach based on PRD requirements and platform choice, explain your rationale or ask questions to the user if unsure:
          
          1. For 
```