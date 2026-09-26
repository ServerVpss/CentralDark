# COMANDO - design-system-build-quality.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\design-system-build-quality.yaml
**SHA:** 03c655c8665166fd
**Timestamp:** 2026-08-28T02:02:10.176490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Design System Quality Pipeline] --> B[ux-design-expert: Build componentes atômicos]

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: design-system-build-quality
  name: Design System Build Quality Pipeline
  version: "1.0"
  description: >-
    Pipeline pós-migração para Design System. Encadeia sequencialmente as etapas de
    build, documentação, auditoria de acessibilidade e cálculo de ROI para garantir
    qualidade e mensurar valor entregue.
  type: brownfield
  project_types:
    - design-system
    - component-library
    - pattern-library
    - ui-migration

  metadata:
    elicit: true
    confirmation_required: true

  execution_modes:
    - mode: yolo
      description: Execução autônoma com mínima interação
      prompts: 0-1
    - mode: interactive
      description: Checkpoints de decisão e feedback educacional
      prompts: 5-10
      default: true
    - mode: preflight
      description: Planejamento completo antes da execução - análise upfront de todos os componentes e dependências
      prompts: "10-15"

  phases:
    - phase_1: Build & Compile
    - phase_2: Documentation
    - phase_3: Quality Assurance
    - phase_4: ROI Analysis

  sequence:
    - step: build_atomic_components
      id: build
      phase: 1
      agent: ux-design-expert
      action: Build de componentes atômicos
      notes: |
        Executa build dos componentes do Design System:
        - Compila tokens de design (cores, tipografia, espaçamentos)
        - Gera componentes atômicos (buttons, inputs, cards, etc.)
        - Valida estrutura de arquivos e nomenclatura
        - Verifica dependências e imports

        Critérios de sucesso:
        - [ ] Build completo sem erros
        - [ ] Todos os tokens compilados
        - [ ] Componentes exportados corretamente
      outputs:
        - build_report
        - compiled_tokens
        - component_bundle

    - step: generate_documentation
      id: document
      phase: 2
      agent: ux-design-expert
      action: Gerar documentação do Pattern Library
      requires: build
      notes: |
        Gera documentação completa do Pattern Library:
        - Documenta cada componente com props e variantes
        - Cria exemplos de uso e code snippets
        - Gera guia de estilo visual
        - Atualiza changelog de componentes

        Critérios de sucesso:
        - [ ] Todos os componentes documentados
        - [ ] Exemplos de código funcionais
        - [ ] Guia de estilo atualizado
      outputs:
        - pattern_library_docs
        - component_api_reference
        - style_guide

    - step: accessibility_audit
      id: a11y-check
      phase: 3
      agent: ux-design-expert
      action: Auditoria de acessibilidade (WCAG AA)
      requires: document
      notes: |
        Executa auditoria de acessibilidade WCAG 2.1 AA:
        - Verifica contraste de cores (4.5:1 texto, 3:1 UI)
        - Valida navegação por teclado
        - Checa atributos ARIA e roles
        - Testa com screen readers
        - Verifica focus states e indicadores visuais

        Critérios de sucesso:
        - [ ] Contraste de cores aprovado
        - [ ] Navegação por teclado funcional
        - [ ] ARIA labels corretos
        - [ ] Zero violações críticas WCAG AA
      outputs:
        - a11y_audit_report
        - violations_list
        - remediation_plan

    - step: calculate_roi
      id: calculate-roi
      phase: 4
      agent: ux-design-expert
      action: Cálculo de ROI e savings
      requires: a11y-check
      notes: |
        Calcula retorno sobre investimento do Design System:
        - Tempo economizado em desenvolvimento
        - Redução de inconsistências visuais
        - Velocidade de entrega de features
        - Custo de manutenção reduzido
        - Métricas de reuso de componentes

        Métricas a calcular:
        - [ ] Horas dev economizadas/mês
        - [ ] % de reuso de componentes
        - [ ] Tempo médio para nova feature
        - [ ] Redução de bugs visuais
      outputs:
        - roi_report
        - savings_metrics
        - adoption_dashboard

    - workflow_end:
      action: pipeline_complete
      notes: |
        Pipeline de qualidade completo!

        Artefatos gerados:
        - Build report e bundle de componentes
        - Documentação do Pattern Library
        - Relatório de acessibilidade WCAG AA
        - Dashboard de ROI e métricas

        Próximos passos sugeridos:
        - Revisar violações de a11y identificadas
        - Publicar nova versão do Design System
        - Compartilhar métricas de ROI com stakeholders

  flow_diagram: |
    ```mermaid
    graph TD
        A[Start: Design System Quality Pipeline] --> B[ux-design-expert: Build componentes atômicos]
        B --> C{Build OK?}
        C -->|Sim| D[ux-design-expert: Gerar documentação Pattern Library]
        C -->|Não| E[Corrigir erros de build]
        E --> B

        D --> F{Docs completas?}
        F -->|Sim| G[ux-design-expert: Auditoria a11y WCAG AA]
        F -->|Não| H[Completar documentação]
        H --> D

        G --> I{a11y aprovado?}
        I -->|Sim| J[ux-design-
```