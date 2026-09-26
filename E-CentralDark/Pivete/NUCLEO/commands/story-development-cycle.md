# COMANDO - story-development-cycle.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\story-development-cycle.yaml
**SHA:** 91698470befba5ae
**Timestamp:** 2026-08-28T02:02:10.261698
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Story Development Cycle] --> B[sm: Criar próxima story]

### Contratos
- até a entrega com quality gate: create → validate → implement → QA review.
- QA Agent executa review final com quality gate:

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: story-development-cycle
  name: Story Development Cycle
  version: "1.0"
  description: >-
    Ciclo completo de desenvolvimento de stories. Automatiza o fluxo desde a criação
    até a entrega com quality gate: create → validate → implement → QA review.
    Aplicável a projetos greenfield e brownfield.
  type: generic
  project_types:
    - greenfield
    - brownfield
    - feature-development
    - bug-fix
    - enhancement

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
      description: Planejamento completo antes da execução - análise upfront de requisitos e dependências
      prompts: "10-15"

  phases:
    - phase_1: Story Creation
    - phase_2: Story Validation
    - phase_3: Implementation
    - phase_4: QA Review

  sequence:
    - step: create_story
      id: create
      phase: 1
      agent: sm
      action: Criar próxima story
      notes: |
        Scrum Master cria a próxima story do backlog:
        - Usa task create-next-story para stories de PRD shardado
        - Usa task brownfield-create-story para projetos brownfield
        - Define acceptance criteria claros
        - Estabelece escopo e dependências
        - Story inicia com status "Draft"

        Entrada requerida:
        - PRD shardado OU documentação do projeto
        - Contexto do epic/feature

        Critérios de sucesso:
        - [ ] Story criada com título descritivo
        - [ ] Acceptance criteria definidos
        - [ ] Escopo claro e delimitado
        - [ ] Dependências identificadas
      outputs:
        - story_file
        - story_id
      next: validate

    - step: validate_story
      id: validate
      phase: 2
      agent: po
      action: Validar story (10 checks)
      requires: create
      notes: |
        Product Owner valida a story com checklist de 10 pontos:

        Checklist de validação:
        - [ ] 1. Título claro e objetivo
        - [ ] 2. Descrição completa do problema/necessidade
        - [ ] 3. Acceptance criteria testáveis (Given/When/Then)
        - [ ] 4. Escopo bem definido (o que está IN e OUT)
        - [ ] 5. Dependências mapeadas
        - [ ] 6. Estimativa de complexidade adequada
        - [ ] 7. Valor de negócio identificado
        - [ ] 8. Riscos documentados
        - [ ] 9. Critérios de Done claros
        - [ ] 10. Alinhamento com PRD/Epic

        Resultado:
        - Aprovada → Status muda para "Ready"
        - Rejeitada → Retorna para SM com feedback

        Critérios de sucesso:
        - [ ] Todos os 10 checks passaram
        - [ ] Story marcada como "Ready"
      outputs:
        - validation_report
        - story_status
      next: implement
      on_failure: create

    - step: implement_story
      id: implement
      phase: 3
      agent: dev
      action: Implementar story
      requires: validate
      notes: |
        Dev Agent implementa a story validada:
        - Analisa acceptance criteria
        - Planeja implementação técnica
        - Escreve código seguindo padrões do projeto
        - Cria/atualiza testes unitários
        - Atualiza File List na story
        - Marca story como "In Review" ao finalizar

        Boas práticas:
        - Commits atômicos e bem descritos
        - Código limpo e documentado
        - Testes cobrindo acceptance criteria
        - Sem débito técnico novo

        Critérios de sucesso:
        - [ ] Todos os acceptance criteria implementados
        - [ ] Testes passando
        - [ ] File List atualizada
        - [ ] Código commitado
        - [ ] Story status = "In Review"
      outputs:
        - implementation_files
        - test_results
        - commit_hash
      next: review

    - step: qa_review
      id: review
      phase: 4
      agent: qa
      action: Review final + quality gate
      requires: implement
      notes: |
        QA Agent executa review final com quality gate:

        Quality Gate Checks:
        - [ ] Code review (padrões, legibilidade, manutenibilidade)
        - [ ] Testes unitários adequados e passando
        - [ ] Acceptance criteria atendidos
        - [ ] Sem regressões introduzidas
        - [ ] Performance aceitável
        - [ ] Segurança verificada (OWASP basics)
        - [ ] Documentação atualizada se necessário

        Ações do QA:
        - Corrige issues menores diretamente
        - Documenta issues maiores para Dev resolver
        - Aprova ou rejeita com feedback

        Resultado:
        - Aprovada → Status muda para "Done"
        - Rejeitada → Retorna para Dev com checklist de fixes

        Critérios de sucesso:
        - [ ] Quality gate passou
        - [ ] Story marcada como "Done"
      outputs:
        - qa_report
        - quality_gate_status
        - story_f
```