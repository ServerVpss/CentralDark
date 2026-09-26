# COMANDO - map-deep-smarts.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\map-deep-smarts.md
**SHA:** 459ea07bfe19213e
**Timestamp:** 2026-08-28T13:25:12.421066
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Output Quality Gate:** Alimenta QG-004 (Tier 2 → Validation)

### Riscos
- retention_risk:
- **Priority:** CRITICAL | **Risk:** CRITICAL
- risk: {fatores, score, level}

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-005
name: Map Deep Smarts
version: 1.0.0
executor: leonard
purpose: >
  Identificar conhecimento critico usando o Deep Smarts framework de Dorothy
  Leonard. Avaliar cada item de repertorio nas 6 caracteristicas de Deep Smarts,
  construir priority matrix (uniqueness x urgency x impact), identificar
  conhecimento em risco de perda, e criar plano de transferencia com metodos
  adequados ao tipo de conhecimento.

inputs:
  - name: extracted_items
    type: list[file]
    description: >
      Itens de repertorio extraidos por TK-RM-002 (CDM passivo) e/ou
      construtos de TK-RM-003/TK-RM-004 (Repertory Grid). Sao os
      candidatos a avaliacao Deep Smarts.
    required: true
    location: "outputs/repertoire-mapper/{slug}/extractions/*-items.yaml"

  - name: construct_map
    type: file
    description: >
      Mapa de construtos de TK-RM-004. Construtos core sao candidatos
      prioritarios a Deep Smarts.
    required: false
    location: "outputs/repertoire-mapper/{slug}/grid/construct-map.yaml"

  - name: diagnosis_data
    type: file
    description: >
      Output do TK-RM-001. Tipo de conhecimento (Polanyi) e nivel de
      expertise (Collins) informam a avaliacao de criticidade.
    required: true
    location: "outputs/repertoire-mapper/{slug}/diagnosis-data.yaml"

  - name: organizational_context
    type: object
    description: >
      Contexto organizacional ou pessoal para calibrar urgencia
      e impacto. Para mapeamento pessoal, e o contexto de vida
      e carreira do especialista.
    required: false
    schema:
      role: string
      team_size: integer
      succession_plan: boolean
      critical_projects: list[string]
      knowledge_dependencies: list[string]
      timeline_pressure: enum[none, low, medium, high, critical]

  - name: assessment_scope
    type: enum
    description: >
      Escopo da avaliacao. 'all' avalia todos os itens. 'top_n' avalia
      os N itens com maior indicador de criticidade. 'domain' avalia
      itens de um dominio especifico.
    required: false
    options: ["all", "top_n", "domain"]
    default: "all"

  - name: top_n
    type: integer
    description: >
      Numero de itens a avaliar quando scope = 'top_n'. Os itens sao
      pre-ranqueados por indicadores de tacit ratio e expertise level.
    required: false
    default: 20

preconditions:
  - "Itens de repertorio extraidos (TK-RM-002 e/ou TK-RM-003 outputs)"
  - "Diagnostico TK-RM-001 completo (classificacao Polanyi + Collins)"
  - "Agente leonard acessivel e configurado"
  - "Pelo menos 10 itens de repertorio disponiveis para avaliacao"
  - "Contexto organizacional/pessoal informado (para calibrar urgencia)"

outputs:
  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/inventory.yaml"
    description: >
      Inventario completo de Deep Smarts — cada item avaliado nas 6
      caracteristicas com scores e justificativas.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/priority-matrix.yaml"
    description: >
      Matriz de prioridade Uniqueness x Urgency x Impact para
      todos os itens avaliados como Deep Smarts.
    format: yaml

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/risk-assessment.md"
    description: >
      Avaliacao de risco — conhecimentos em perigo de perda,
      vulnerabilidades, single points of failure.
    format: markdown

  - path: "outputs/repertoire-mapper/{slug}/deep-smarts/transfer-plan.md"
    description: >
      Plano de transferencia — metodos recomendados para cada tipo
      de conhecimento critico, seguindo o Knowledge Transfer Continuum.
    format: markdown

validation:
  success_criteria:
    - "Todos os itens avaliados nas 6 caracteristicas de Deep Smarts"
    - "Cada avaliacao tem score (1-5) E justificativa narrativa"
    - "Priority matrix construida com 3 dimensoes (uniqueness, urgency, impact)"
    - "Top 5 Deep Smarts identificados e descritos em detalhe"
    - "Riscos de perda de conhecimento identificados com probabilidade e impacto"
    - "Plano de transferencia com metodos adequados ao tipo de conhecimento"
    - "Recomendacoes acionaveis e especificas (nao genericas)"
  quality_threshold: "5/7 criterios acima"
---

# Task: Map Deep Smarts

**Task ID:** TK-RM-005
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-18
**Category:** Repertoire Mapper Pipeline
**Total Lines:** 500+

---

## Executive Summary

Deep Smarts sao o conhecimento profundo baseado em experiencia que permite julgamento superior em situacoes complexas e ambiguas. Dorothy Leonard identificou que esse tipo de conhecimento e simultaneamente o mais valioso e o mais vulneravel — valioso porque e o que diferencia especialistas de praticantes competentes, vulneravel porque e tacito, pessoal e frequentemente nao-documentado.

Esta task avalia cada item de repertorio nas 6 caracteristicas de Deep Smarts, constroi uma matriz de prioridade tridimensional (uniqueness x urgency x impact), identifica riscos de perda
```