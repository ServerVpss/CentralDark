# DECISAO - translate-output.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\translate-output.md
**SHA:** 7eaea235dce39bde
**Timestamp:** 2026-08-28T13:25:14.071920
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- practitioner_title: "Regra: Primeiro corrigir retencao, depois investir em aquisicao"

### Gaps
- execution_gap:

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-009
name: Translate Outputs to Practitioner Language
version: 1.0.0
executor: chin
purpose: >
  Traduzir outputs academicos e tecnicos do pipeline de mapeamento para
  linguagem pratica usando a abordagem de Cedric Chin (Commoncog).
  Converter jargao em linguagem acessivel, adicionar exemplos do mundo
  real, e criar resumos acionaveis que qualquer praticante pode
  entender sem background academico.
squad: repertoire-mapper
phase: PHASE_5_ORGANIZATION
tier: 3

inputs:
  - name: repertoire_items
    type: list
    description: "Itens de repertorio validados e organizados por PARA"
    required: true
    format: "YAML array com items completos"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis gerado por argyris (TK-RM-007)"
    required: true
    format: "Markdown report"
    location: "outputs/repertoire/{slug}/gap-analysis.md"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise gerado por collins (Tier 0)"
    required: true
    format: "Markdown"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: cdm_extractions
    type: document
    description: "Extracoes CDM de klein (Tier 1)"
    required: false
    format: "YAML com heuristicas"
    location: "outputs/repertoire/{slug}/cdm-extractions.yaml"

  - name: deep_smarts_inventory
    type: document
    description: "Inventario de deep smarts de leonard (Tier 1)"
    required: false
    format: "YAML com items priorizados"
    location: "outputs/repertoire/{slug}/deep-smarts-inventory.yaml"

  - name: repertory_grid
    type: document
    description: "Resultados do Repertory Grid de kelly (Tier 1)"
    required: false
    format: "YAML com construtos e analise"
    location: "outputs/repertoire/{slug}/repertory-grid.yaml"

  - name: seci_classification
    type: document
    description: "Classificacao SECI de nonaka (Tier 2)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

preconditions:
  - "QG-005 passado (Final Validation por argyris)"
  - "Gap analysis completo e disponivel"
  - "Pelo menos 10 itens de repertorio validados"
  - "Agente chin carregado com framework de traducao Commoncog"

outputs:
  - name: practitioner_items
    path: "outputs/repertoire/{slug}/practitioner-items.yaml"
    format: yaml
    description: >
      Versao de cada item de repertorio traduzida para linguagem pratica,
      com jargao removido, exemplos adicionados, e formato if-then.

  - name: practitioner_gap_analysis
    path: "outputs/repertoire/{slug}/practitioner-gap-analysis.md"
    format: markdown
    description: >
      Versao do gap analysis em linguagem acessivel, sem jargao
      academico, com exemplos concretos do dominio do sujeito.

  - name: quick_reference
    path: "outputs/repertoire/{slug}/quick-reference.md"
    format: markdown
    description: >
      Guia rapido de 2-3 paginas com os repertorios mais importantes
      em formato de consulta rapida.

  - name: translation_log
    path: "outputs/repertoire/{slug}/translation-log.yaml"
    format: yaml
    description: >
      Log de todas as traducoes feitas: jargao original, versao
      traduzida, justificativa da traducao.

validation:
  success_criteria:
    - "100% dos itens traduzidos para linguagem pratica"
    - "Zero jargao academico remanescente sem explicacao"
    - "Cada item tem pelo menos 1 exemplo do mundo real"
    - "Formato if-then aplicado a heuristicas"
    - "Quick reference gerado com top items"
    - "Um praticante sem background academico pode entender cada item"
    - "Significado original preservado (fidelidade semantica)"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Translate Outputs to Practitioner Language

## Executive Summary

Esta task aplica a filosofia de Cedric Chin (Commoncog) de que conhecimento
tacito so tem valor quando e acessivel a praticantes. Os outputs do pipeline
de mapeamento -- gap analysis, decision frameworks, expertise profiles --
estao repletos de jargao academico (espoused theory, theory-in-use, RPD model,
SECI cycle, Dreyfus stages) que um praticante nao reconhece. Esta task traduz
TUDO para linguagem que o sujeito e seus pares entendem e podem aplicar.

**Posicao no Pipeline:** Task 9 -- Phase 5 (Organization) do Full Mapping Pipeline
**Definicao de Sucesso:** Um praticante sem formacao academica entende 100% dos outputs
**Execucao Paralela:** Roda em paralelo com TK-RM-008 (organize-para por forte)

---

## Purpose

O pipeline de mapeamento usa frameworks de 9 pensadores diferentes: Polanyi,
Collins, Klein, Leonard, Kelly, Nonaka, Argyris, Chin, Forte. Cada um
tem sua propria terminologia:

- **Polanyi:** tacit/explicit, proximal/distal, indwelling, subsidiary awareness
- **Collins:** interactional/contributory expertise, relational/somatic/collective
- **Klein:** RPD, CDM, cues, patterns, mental simulation, menta
```