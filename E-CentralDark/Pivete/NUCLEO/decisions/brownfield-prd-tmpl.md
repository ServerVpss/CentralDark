# DECISAO - brownfield-prd-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\brownfield-prd-tmpl.yaml
**SHA:** bc1852d15e3a383c
**Timestamp:** 2026-08-28T02:02:20.156047
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- If document-project was run:
- - If document-project was already run: "Using existing project analysis from document-project output."

### Ouro Bruto (primeiros 5000 chars)
```
template:
  id: brownfield-prd-template-v2
  name: Brownfield Enhancement PRD
  version: 2.0
  output:
    format: markdown
    filename: docs/prd.md
    title: "{{project_name}} Brownfield Enhancement PRD"

workflow:
  mode: interactive
  elicitation: advanced-elicitation

sections:
  - id: intro-analysis
    title: Intro Project Analysis and Context
    instruction: |
      IMPORTANT - SCOPE ASSESSMENT REQUIRED:
      
      This PRD is for SIGNIFICANT enhancements to existing projects that require comprehensive planning and multiple stories. Before proceeding:
      
      1. **Assess Enhancement Complexity**: If this is a simple feature addition or bug fix that could be completed in 1-2 focused development sessions, STOP and recommend: "For simpler changes, consider using the brownfield-create-epic or brownfield-create-story task with the Product Owner instead. This full PRD process is designed for substantial enhancements that require architectural planning and multiple coordinated stories."
      
      2. **Project Context**: Determine if we're working in an IDE with the project already loaded or if the user needs to provide project information. If project files are available, analyze existing documentation in the docs folder. If insufficient documentation exists, recommend running the document-project task first.
      
      3. **Deep Assessment Requirement**: You MUST thoroughly analyze the existing project structure, patterns, and constraints before making ANY suggestions. Every recommendation must be grounded in actual project analysis, not assumptions.
      
      Gather comprehensive information about the existing project. This section must be completed before proceeding with requirements.
      
      CRITICAL: Throughout this analysis, explicitly confirm your understanding with the user. For every assumption you make about the existing project, ask: "Based on my analysis, I understand that [assumption]. Is this correct?"
      
      Do not proceed with any recommendations until the user has validated your understanding of the existing system.
    sections:
      - id: existing-project-overview
        title: Existing Project Overview
        instruction: Check if document-project analysis was already performed. If yes, reference that output instead of re-analyzing.
        sections:
          - id: analysis-source
            title: Analysis Source
            instruction: |
              Indicate one of the following:
              - Document-project output available at: {{path}}
              - IDE-based fresh analysis
              - User-provided information
          - id: current-state
            title: Current Project State
            instruction: |
              - If document-project output exists: Extract summary from "High Level Architecture" and "Technical Summary" sections
              - Otherwise: Brief description of what the project currently does and its primary purpose
      - id: documentation-analysis
        title: Available Documentation Analysis
        instruction: |
          If document-project was run:
          - Note: "Document-project analysis available - using existing technical documentation"
          - List key documents created by document-project
          - Skip the missing documentation check below
          
          Otherwise, check for existing documentation:
        sections:
          - id: available-docs
            title: Available Documentation
            type: checklist
            items:
              - Tech Stack Documentation [[LLM: If from document-project, check ✓]]
              - Source Tree/Architecture [[LLM: If from document-project, check ✓]]
              - Coding Standards [[LLM: If from document-project, may be partial]]
              - API Documentation [[LLM: If from document-project, check ✓]]
              - External API Documentation [[LLM: If from document-project, check ✓]]
              - UX/UI Guidelines [[LLM: May not be in document-project]]
              - Technical Debt Documentation [[LLM: If from document-project, check ✓]]
              - "Other: {{other_docs}}"
            instruction: |
              - If document-project was already run: "Using existing project analysis from document-project output."
              - If critical documentation is missing and no document-project: "I recommend running the document-project task first..."
      - id: enhancement-scope
        title: Enhancement Scope Definition
        instruction: Work with user to clearly define what type of enhancement this is. This is critical for scoping and approach.
        sections:
          - id: enhancement-type
            title: Enhancement Type
            type: checklist
            instruction: Determine with user which applies
            items:
              - New Feature Addition
              - Major Feature Modification
              - Integration with New Systems
              - Performance/Scalability Improvements
         
```