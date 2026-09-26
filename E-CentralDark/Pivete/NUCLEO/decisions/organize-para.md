# DECISAO - organize-para.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\organize-para.md
**SHA:** 275bc2c540ec5a98
**Timestamp:** 2026-08-28T13:25:13.355681
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- has_gap: true/false
- execution_gap:
- aspiration_gap:

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-008
name: Organize Repertoire with PARA Method
version: 1.0.0
executor: forte
purpose: >
  Organizar repertorio validado usando PARA Method (Projects, Areas,
  Resources, Archives) de Tiago Forte. Transformar itens brutos de
  repertorio em uma estrutura navegavel, hierarquica e orientada a acao
  que respeita o ciclo de vida natural do conhecimento.
squad: repertoire-mapper
phase: PHASE_5_ORGANIZATION
tier: 3

inputs:
  - name: validated_items
    type: list
    description: "Itens de repertorio validados (pos-Argyris gap analysis)"
    required: true
    format: "YAML array com id, content, type, confidence, dreyfus_level, seci_stage"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis gerado por argyris (TK-RM-007)"
    required: true
    format: "YAML com gaps classificados por tipo e severidade"
    location: "outputs/repertoire/{slug}/gap-analysis.yaml"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise gerado por collins (Tier 0)"
    required: true
    format: "Markdown com niveis de expertise por area"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: knowledge_graph_draft
    type: document
    description: "Draft do knowledge graph gerado por nonaka (Tier 2)"
    required: false
    format: "JSON com nodes e edges"
    location: "outputs/repertoire/{slug}/knowledge-graph-draft.json"

  - name: seci_classification
    type: document
    description: "Classificacao SECI de cada item por nonaka (Tier 2)"
    required: false
    format: "YAML com items e seus seci_stage"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

  - name: subject_active_projects
    type: list
    description: "Lista de projetos ativos do sujeito (se disponivel)"
    required: false
    format: "YAML array com nome, deadline, status"
    location: "inputs/repertoire/{slug}/active-projects.yaml"

preconditions:
  - "QG-005 passado (Final Validation por argyris)"
  - "Gap analysis completo e disponivel"
  - "Pelo menos 10 itens de repertorio validados"
  - "Expertise profile disponivel"
  - "Agente forte carregado com PARA Method e Progressive Summarization"

outputs:
  - name: repertoire_structure
    path: "outputs/repertoire/{slug}/para/"
    format: directory
    description: >
      Estrutura de diretorios PARA com itens organizados:
      para/projects/, para/areas/, para/resources/, para/archives/

  - name: repertoire_index
    path: "outputs/repertoire/{slug}/repertoire-index.md"
    format: markdown
    description: >
      Indice navegavel de todos os itens de repertorio com links,
      cross-references, e mini-resumos.

  - name: knowledge_graph_updated
    path: "outputs/repertoire/{slug}/knowledge-graph.json"
    format: json
    description: >
      Knowledge graph atualizado com metadata PARA (category, actionability,
      lifecycle_stage) em cada node.

  - name: para_summary
    path: "outputs/repertoire/{slug}/para-summary.yaml"
    format: yaml
    description: >
      Resumo estatistico da organizacao PARA com distribuicao de itens
      por categoria, areas mais densas, projetos ativos.

validation:
  success_criteria:
    - "100% dos itens classificados em P/A/R/A"
    - "Nenhum item orfao (sem categoria)"
    - "Repertoire-index.md gerado com links validos"
    - "Cross-references entre itens relacionados"
    - "Knowledge graph atualizado com metadata PARA"
    - "Progressive Summarization aplicada a itens chave"
    - "Distribuicao PARA plausivel (nao 90% em uma unica categoria)"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Organize Repertoire with PARA Method

## Executive Summary

Esta task transforma itens brutos de repertorio -- extraidos e validados pelos
agentes anteriores -- em uma estrutura organizada pelo PARA Method de Tiago Forte.
PARA classifica todo conhecimento em 4 categorias baseadas em ACTIONABILITY
(capacidade de gerar acao), nao em TIPO de conteudo.

**Posicao no Pipeline:** Task 8 -- Phase 5 (Organization) do Full Mapping Pipeline
**Definicao de Sucesso:** 100% dos itens classificados em PARA, indice navegavel gerado
**Execucao Paralela:** Roda em paralelo com TK-RM-009 (translate-output por chin)

---

## Purpose

Ate este ponto, o pipeline extraiu dezenas (ou centenas) de itens de repertorio:
mental models, decision frameworks, personal constructs, skills, patterns, values,
beliefs, rules of thumb, metaphors, deep smarts. Esses itens estao organizados
por METODO DE EXTRACAO (klein, leonard, kelly) e por TIPO EPISTEMOLOGICO
(tacito/explicito via polanyi, SECI via nonaka).

Mas o sujeito nao pensa assim. Ninguem abre uma pasta chamada
"Conhecimento Tacito Relacional" para resolver um problema. Pessoas pensam em
termos de: "o que preciso fazer agora?", "que areas sao minha responsabilidade?",
"que recursos posso consultar?", "o que nao uso mais?".

O PARA Method de Tiago Forte organiza conhe
```