# COMANDO - update-knowledge-graph.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\update-knowledge-graph.md
**SHA:** 1a2f817f97ba23ab
**Timestamp:** 2026-08-28T13:25:14.274975
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern:

### Gaps
- step_2_classify_if_missing:

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-012
name: Update Knowledge Graph
version: 1.0.0
executor: nonaka + forte
purpose: >
  Atualizar o grafo de conhecimento incrementalmente apos cada sessao de
  mapeamento. Adicionar novos nodes (itens de repertorio), estabelecer
  conexoes (edges) com nodes existentes, verificar integridade do grafo,
  e gerar delta report mostrando o que mudou. O grafo e a representacao
  relacional de todo o repertorio mapeado.
squad: repertoire-mapper
phase: PHASE_3_CONVERSION + incremental
tier: 2 + 3

inputs:
  - name: new_items
    type: list
    description: "Novos itens de repertorio extraidos na sessao atual"
    required: true
    format: "YAML array com id, type, content, confidence, source_agent"
    location: "outputs/repertoire/{slug}/session-{N}/new-items.yaml"

  - name: existing_graph
    type: document
    description: "Knowledge graph atual (pode nao existir na primeira sessao)"
    required: false
    format: "JSON com nodes e edges arrays"
    location: "outputs/repertoire/{slug}/knowledge-graph.json"

  - name: seci_classification
    type: document
    description: "Classificacao SECI dos novos itens por nonaka"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis por argyris (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/gap-analysis.yaml"

  - name: para_classification
    type: document
    description: "Classificacao PARA por forte (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/para-summary.yaml"

  - name: cross_references
    type: document
    description: "Cross-references identificadas por forte (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/cross-references.yaml"

preconditions:
  - "Novos itens extraidos e disponíveis"
  - "Agentes nonaka e forte carregados"
  - "Se grafo existente: arquivo JSON valido e parseavel"
  - "Cada novo item tem id, type, e content preenchidos"

outputs:
  - name: knowledge_graph
    path: "outputs/repertoire/{slug}/knowledge-graph.json"
    format: json
    description: >
      Knowledge graph atualizado com novos nodes e edges.
      Formato: { nodes: [...], edges: [...], metadata: {...} }

  - name: delta_report
    path: "outputs/repertoire/{slug}/deltas/delta-{timestamp}.yaml"
    format: yaml
    description: >
      Relatorio de mudancas: nodes adicionados, edges adicionados,
      nodes modificados, edges removidos, estatisticas.

  - name: graph_validation
    path: "outputs/repertoire/{slug}/graph-validation.yaml"
    format: yaml
    description: >
      Resultado da validacao de integridade do grafo:
      orphan nodes, broken edges, inconsistencies.

validation:
  success_criteria:
    - "Todos os novos itens adicionados como nodes"
    - "Cada novo node tem tipo classificado corretamente"
    - "Conexoes com nodes existentes identificadas"
    - "Zero orphan nodes (nodes sem nenhuma edge)"
    - "Zero broken edges (edges apontando para nodes inexistentes)"
    - "Metadata atualizada em todos os nodes"
    - "Delta report gerado com mudancas detalhadas"
    - "Grafo JSON valido e parseavel"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Update Knowledge Graph

## Executive Summary

O knowledge graph e a representacao relacional do repertorio do sujeito. Cada
item de repertorio e um NODE no grafo, e as relacoes entre itens sao EDGES.
O grafo cresce incrementalmente a cada sessao de mapeamento e e a base para
visualizacoes, analises de cluster, e deteccao de lacunas.

Esta task pode ser executada:
1. **Durante o pipeline completo** (Phase 3, apos SECI conversion por nonaka)
2. **Incrementalmente** (apos qualquer sessao de extracao, mesmo parcial)

**Posicao no Pipeline:** Task 12 -- Phase 3 (initial) + incremental updates
**Definicao de Sucesso:** Grafo atualizado, validado, com delta report
**Execucao Dual:** nonaka (classificacao SECI e conexoes conceituais) + forte (metadata PARA e cross-references)

---

## Purpose

Um inventario (lista) de itens de repertorio responde "O QUE a pessoa sabe."
Um grafo de conhecimento responde "COMO as coisas que a pessoa sabe se
RELACIONAM entre si."

Esse "como se relacionam" e crucial porque:

1. **Clusters revelam identidade** -- Um cluster denso de nodes conectados
   revela uma area de expertise profunda
2. **Gaps revelam oportunidades** -- Areas do grafo com poucos nodes ou
   poucos edges indicam conhecimento fragmentado
3. **Contradicoes sao visiveis** -- Edges tipo "contradicts" tornam
   conflitos internos explicitos
4. **Transferencia e possivel** -- O grafo mostra caminhos de transferencia
   de conhecimento (via edges "derived_from" e "extends")
5. **Evolucao e rastreavel** -- Delta reports mostram como o repertorio muda

---

## Executor Type

**Agents: nonaka + forte (dual execution)**

- **nonaka's Ro
```