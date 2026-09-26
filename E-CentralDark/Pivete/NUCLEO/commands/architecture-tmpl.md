# COMANDO - architecture-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\architecture-tmpl.yaml
**SHA:** 34bdfeb7add08618
**Timestamp:** 2026-08-28T02:02:19.199947
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- List the key high-level patterns that will guide the architecture. For each pattern:
- - "**Repository Pattern:** Abstract data access logic - _Rationale:_ Enables testing and future database migration flexibility"

### Ouro Bruto (primeiros 5000 chars)
```
template:
  id: architecture-template-v2
  name: Architecture Document
  version: 2.0
  output:
    format: markdown
    filename: docs/architecture.md
    title: "{{project_name}} Architecture Document"

workflow:
  mode: interactive
  elicitation: advanced-elicitation

sections:
  - id: introduction
    title: Introduction
    instruction: |
      If available, review any provided relevant documents to gather all relevant context before beginning. If at a minimum you cannot locate docs/prd.md ask the user what docs will provide the basis for the architecture.
    sections:
      - id: intro-content
        content: |
          This document outlines the overall project architecture for {{project_name}}, including backend systems, shared services, and non-UI specific concerns. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, ensuring consistency and adherence to chosen patterns and technologies.
          
          **Relationship to Frontend Architecture:**
          If the project includes a significant user interface, a separate Frontend Architecture Document will detail the frontend-specific design and MUST be used in conjunction with this document. Core technology stack choices documented herein (see "Tech Stack") are definitive for the entire project, including any frontend components.
      - id: starter-template
        title: Starter Template or Existing Project
        instruction: |
          Before proceeding further with architecture design, check if the project is based on a starter template or existing codebase:
          
          1. Review the PRD and brainstorming brief for any mentions of:
          - Starter templates (e.g., Create React App, Next.js, Vue CLI, Angular CLI, etc.)
          - Existing projects or codebases being used as a foundation
          - Boilerplate projects or scaffolding tools
          - Previous projects to be cloned or adapted
          
          2. If a starter template or existing project is mentioned:
          - Ask the user to provide access via one of these methods:
            - Link to the starter template documentation
            - Upload/attach the project files (for small projects)
            - Share a link to the project repository (GitHub, GitLab, etc.)
          - Analyze the starter/existing project to understand:
            - Pre-configured technology stack and versions
            - Project structure and organization patterns
            - Built-in scripts and tooling
            - Existing architectural patterns and conventions
            - Any limitations or constraints imposed by the starter
          - Use this analysis to inform and align your architecture decisions
          
          3. If no starter template is mentioned but this is a greenfield project:
          - Suggest appropriate starter templates based on the tech stack preferences
          - Explain the benefits (faster setup, best practices, community support)
          - Let the user decide whether to use one
          
          4. If the user confirms no starter template will be used:
          - Proceed with architecture design from scratch
          - Note that manual setup will be required for all tooling and configuration
          
          Document the decision here before proceeding with the architecture design. If none, just say N/A
        elicit: true
      - id: changelog
        title: Change Log
        type: table
        columns: [Date, Version, Description, Author]
        instruction: Track document versions and changes

  - id: high-level-architecture
    title: High Level Architecture
    instruction: |
      This section contains multiple subsections that establish the foundation of the architecture. Present all subsections together at once.
    elicit: true
    sections:
      - id: technical-summary
        title: Technical Summary
        instruction: |
          Provide a brief paragraph (3-5 sentences) overview of:
          - The system's overall architecture style
          - Key components and their relationships
          - Primary technology choices
          - Core architectural patterns being used
          - Reference back to the PRD goals and how this architecture supports them
      - id: high-level-overview
        title: High Level Overview
        instruction: |
          Based on the PRD's Technical Assumptions section, describe:
          
          1. The main architectural style (e.g., Monolith, Microservices, Serverless, Event-Driven)
          2. Repository structure decision from PRD (Monorepo/Polyrepo)
          3. Service architecture decision from PRD
          4. Primary user interaction flow or data flow at a conceptual level
          5. Key architectural decisions and their rationale
      - id: project-diagram
        title: High Level Project Diagram
        type: mermaid
        mermaid_type: graph
        instruction: |
          Create a Mermaid diagram that visua
```