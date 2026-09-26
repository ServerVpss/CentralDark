# COMANDO - brownfield-discovery.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\brownfield-discovery.yaml
**SHA:** ebd0dccd86138a05
**Timestamp:** 2026-08-28T02:02:10.192611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- COMANDO: @architect → *document-project
- COMANDO: @ux-design-expert → *create-front-end-spec
- COMANDO: @architect (prompt manual)
- PROMPT:
- COMANDO: @data-engineer (prompt manual)
- PROMPT:
- COMANDO: @ux-design-expert (prompt manual)
- PROMPT:
- COMANDO: @qa (prompt manual)
- PROMPT:

### Gaps
- ⚠️ PENDENTE: Revisão do @data-engineer
- ⚠️ PENDENTE: Revisão do @ux-design-expert

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: brownfield-discovery
  name: Brownfield Discovery - Complete Technical Debt Assessment
  version: "2.0"
  description: >-
    Comprehensive multi-agent discovery workflow for existing projects.
    Includes specialist validation cycles and executive awareness report.
    Designed for projects migrating from Lovable, v0.dev, or legacy codebases.
  type: brownfield
  project_types:
    - technical-debt-resolution
    - legacy-modernization
    - project-migration
    - codebase-audit
    - lovable-migration

  metadata:
    elicit: true
    confirmation_required: true
    action_types:
      task-reference: "Action references an existing task file in .aios-core/development/tasks/"
      agent-command: "Action references an agent-level command (e.g., *create-front-end-spec)"
      workflow-action: "Action is a workflow orchestration step executed via manual prompt"

  # ═══════════════════════════════════════════════════════════════════════════════════════
  #                              WORKFLOW SEQUENCE
  # ═══════════════════════════════════════════════════════════════════════════════════════

  sequence:

    # ═════════════════════════════════════════════════════════════════════════════════════
    # FASE 1-3: COLETA DE DADOS (pode ser paralelo)
    # ═════════════════════════════════════════════════════════════════════════════════════

    - step: system_documentation
      phase: 1
      phase_name: "Coleta: Sistema"
      agent: architect
      action: document-project
      creates: docs/architecture/system-architecture.md
      elicit: true
      duration_estimate: "30-60 min"
      notes: |
        @architect analisa e documenta o sistema completo:

        ANÁLISE:
        - Stack tecnológico (React, Vite, Tailwind, etc.)
        - Estrutura de pastas e componentes
        - Dependências e versões
        - Padrões de código existentes
        - Pontos de integração
        - Configurações (env, build, deploy)

        DÉBITOS IDENTIFICADOS (nível sistema):
        - Dependências desatualizadas
        - Código duplicado
        - Falta de testes
        - Configurações hardcoded
        - Acoplamento excessivo

        COMANDO: @architect → *document-project

        OUTPUT: docs/architecture/system-architecture.md

    - step: database_documentation
      phase: 2
      phase_name: "Coleta: Database"
      agent: data-engineer
      action: db-schema-audit  # task-reference: db-schema-audit.md + security-audit.md
      creates:
        - supabase/docs/SCHEMA.md
        - supabase/docs/DB-AUDIT.md
      condition: project_has_database
      elicit: true
      duration_estimate: "20-40 min"
      notes: |
        @data-engineer analisa o banco de dados:

        ANÁLISE:
        - Schema completo (tabelas, colunas, tipos)
        - Relacionamentos e foreign keys
        - Índices existentes e faltantes
        - RLS policies (cobertura e qualidade)
        - Views e functions
        - Performance (queries lentas conhecidas)

        DÉBITOS IDENTIFICADOS (nível dados):
        - Tabelas sem RLS
        - Índices faltantes
        - Normalização inadequada
        - Constraints ausentes
        - Migrations não versionadas
        - Dados órfãos

        COMANDOS:
        @data-engineer → *db-schema-audit
        @data-engineer → *security-audit

        Se não houver banco, pular para FASE 3.

        OUTPUT:
        - supabase/docs/SCHEMA.md
        - supabase/docs/DB-AUDIT.md

    - step: frontend_documentation
      phase: 3
      phase_name: "Coleta: Frontend/UX"
      agent: ux-design-expert
      action: create-front-end-spec  # agent-command: @ux-design-expert → *create-front-end-spec
      creates: docs/frontend/frontend-spec.md
      elicit: true
      duration_estimate: "30-45 min"
      notes: |
        @ux-design-expert analisa o frontend:

        ANÁLISE:
        - Componentes UI existentes
        - Design system/tokens utilizados
        - Padrões de layout
        - Fluxos de usuário
        - Responsividade
        - Acessibilidade (a11y)
        - Consistência visual
        - Performance percebida

        DÉBITOS IDENTIFICADOS (nível UX/UI):
        - Inconsistências visuais
        - Componentes duplicados
        - Falta de design system
        - Problemas de acessibilidade
        - Mobile não otimizado
        - Estados de loading/error faltando
        - Feedback de usuário ausente

        COMANDO: @ux-design-expert → *create-front-end-spec

        OUTPUT: docs/frontend/frontend-spec.md

    # ═════════════════════════════════════════════════════════════════════════════════════
    # FASE 4: CONSOLIDAÇÃO INICIAL (DRAFT)
    # ═════════════════════════════════════════════════════════════════════════════════════

    - step: initial_consolidation
      phase: 4
      phase_name: "Consolidação Inicial"
      agent: architect
      action: consolidate_findings_draft  # workflow-action: manual prompt
      creates: docs/prd/technical-debt-DRAFT.md
      req
```