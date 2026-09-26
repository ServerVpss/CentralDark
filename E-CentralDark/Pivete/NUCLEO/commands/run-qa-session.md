# COMANDO - run-qa-session.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\run-qa-session.md
**SHA:** 1186174226a0ab21
**Timestamp:** 2026-08-28T13:25:13.824459
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- rating_scale: "1-5"  # Padrao: 1 = polo esquerdo, 5 = polo direito

### Contratos
- **Output Quality Gate:** Contribui para QG-003 (10+ itens de repertorio extraidos)

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-003
name: Run Q&A Session
version: 1.0.0
executor: kelly
purpose: >
  Executar sessao Q&A de baixa friccao usando Repertory Grid Technique (RepGrid)
  de George Kelly. Tres formatos disponiveis: mini (5min, 1 triad), standard
  (15-20min, 4-5 triads), deep (30min, full grid). Extrai construtos pessoais
  bipolares que revelam como o especialista categoriza, avalia e decide dentro
  de um dominio.

inputs:
  - name: domain
    type: string
    description: >
      Dominio de conhecimento para a sessao Q&A. Pode ser generico
      ("marketing digital") ou especifico ("precificacao de SaaS B2B").
    required: true

  - name: session_format
    type: enum
    description: >
      Formato da sessao. Determina duracao, numero de triads e profundidade.
    required: true
    options: ["mini", "standard", "deep"]
    defaults:
      mini:
        duration: "5 min"
        triads: 1
        elements: 3
        constructs_expected: "2-3"
      standard:
        duration: "15-20 min"
        triads: "4-5"
        elements: "6-9"
        constructs_expected: "8-12"
      deep:
        duration: "30 min"
        triads: "6-8"
        elements: "9-12"
        constructs_expected: "12-20"

  - name: elements_predefined
    type: list[string]
    description: >
      Elementos pre-definidos para usar na sessao. Elementos sao instancias
      concretas do dominio (ex: para "marketing digital", elementos podem ser
      campanhas especificas, ferramentas, canais). Se nao fornecido, Kelly
      elicita os elementos com o especialista.
    required: false

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Informa o tipo de conhecimento e nivel de expertise
      para calibrar a sessao.
    required: false
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: prior_extractions
    type: list[file]
    description: >
      Itens ja extraidos (TK-RM-002 ou sessoes Q&A anteriores).
      Usados para evitar redundancia e aprofundar em areas novas.
    required: false

  - name: prior_grids
    type: list[file]
    description: >
      Grids de sessoes anteriores do mesmo especialista no mesmo dominio.
      Usados para expandir o grid existente em vez de comecar do zero.
    required: false

preconditions:
  - "Dominio de conhecimento definido"
  - "Formato de sessao selecionado (mini, standard, deep)"
  - "Agente kelly acessivel e configurado"
  - "Especialista disponivel para interacao (sessao e interativa)"
  - "Diagnostico TK-RM-001 disponivel (recomendado para calibracao)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-grid.yaml"
    description: >
      Repertory Grid matrix da sessao em formato YAML. Contem elementos,
      construtos com polos, ratings e metadados da sessao.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-constructs.yaml"
    description: >
      Construtos extraidos com analise detalhada — polos, laddering,
      nivel de implicacao e dominio.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/sessions/{session-id}-session-log.md"
    description: >
      Log narrativo da sessao — fluxo, decisoes, observacoes de Kelly.
    format: markdown

validation:
  success_criteria:
    - "Numero minimo de construtos extraidos conforme formato (mini: 2, standard: 8, deep: 12)"
    - "Cada construto tem polo emergente e polo implicito (bipolar)"
    - "Cada construto tem rating para todos os elementos (sem cells vazias)"
    - "Laddering aplicado a pelo menos 50% dos construtos (up e/ou down)"
    - "Grid matrix completa e valida (sem inconsistencias)"
    - "Construtos nao sao tautologicos (polo A != inverso direto de polo B)"
    - "Sessao completada dentro do tempo-alvo do formato"
  quality_threshold: "5/7 criterios acima"
---

# Task: Run Q&A Session

**Task ID:** TK-RM-003
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

A sessao Q&A usando Repertory Grid Technique (RepGrid) e a tecnica de extracao de MENOR friccao do Repertoire Mapper. Em vez de perguntar diretamente "o que voce sabe sobre X?" (que produz respostas genericas e incompletas), Kelly apresenta TRIADS — tres elementos concretos do dominio — e pede ao especialista para comparar: "quais dois sao mais parecidos? como? como o terceiro e diferente?"

Essa abordagem funciona porque:
1. Comparar e mais facil que descrever (menor carga cognitiva)
2. A diferenciacao revela CRITERIOS implicitos (construtos pessoais)
3. Os construtos sao bipolares — revelam tanto o que o especialista valoriza quanto o que rejeita
4. A tecnica produz dados quantificaveis (ratings) alem de qualitativos (construtos)

**Workflow Position:** Task 3 no pipeline — pode executar apos diagnostico (TK-RM-001) ou independentemente
**Success Definition:** Construtos pessoais extraidos com qualidade suficiente para analise esta
```