# COMANDO - validate-gaps.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\tasks\validate-gaps.md
**SHA:** 02effcc3ddd4029d
**Timestamp:** 2026-08-28T13:25:14.574129
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Audit Template por Framework de Decisao:**

### Padroes
- pattern: >
- pattern: >
- current_pattern: "descricao do single-loop"
- **Regra:** Antes de classificar como gap, pergunte: "Existe um contexto

### Contratos
- **Quality Gate:** QG-005 (Final Validation) -- BLOCKING

### Gaps
- execution_gap:
- aspiration_gap:

### Ouro Bruto (primeiros 5000 chars)
```
---
id: TK-RM-007
name: Validate Gaps (Espoused vs Theory-in-Use)
version: 1.0.0
executor: argyris
purpose: >
  Detectar gaps entre conhecimento declarado (espoused theory) e praticado
  (theory-in-use) usando frameworks de Argyris & Schon. Identificar pontos
  cegos, contradicoes, expertise oculta e oportunidades de double-loop
  learning no repertorio mapeado.
squad: repertoire-mapper
phase: PHASE_4_VALIDATION
tier: 2

inputs:
  - name: repertoire_items
    type: list
    description: "Itens de repertorio extraidos pelos agentes de Tier 1 (klein, leonard, kelly)"
    required: true
    format: "YAML array de items com id, source, content, confidence, dreyfus_level"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise do sujeito gerado por collins (Tier 0)"
    required: true
    format: "Markdown com niveis de expertise por area"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: epistemological_map
    type: document
    description: "Mapa epistemologico gerado por polanyi (Tier 0)"
    required: true
    format: "YAML com classificacao tacito/explicito por area"
    location: "outputs/repertoire/{slug}/epistemological-map.yaml"

  - name: qa_session_transcripts
    type: list
    description: "Transcricoes de sessoes Q&A com kelly (Tier 1)"
    required: false
    format: "Markdown files"
    location: "outputs/repertoire/{slug}/sessions/"

  - name: cdm_extractions
    type: document
    description: "Extracoes CDM de klein (Tier 1)"
    required: false
    format: "YAML com cues, patterns, mental_models, rules_of_thumb"
    location: "outputs/repertoire/{slug}/cdm-extractions.yaml"

  - name: deep_smarts_inventory
    type: document
    description: "Inventario de deep smarts de leonard (Tier 1)"
    required: false
    format: "YAML com itens priorizados"
    location: "outputs/repertoire/{slug}/deep-smarts-inventory.yaml"

preconditions:
  - "Tier 0 completo (polanyi + collins)"
  - "Pelo menos 10 itens de repertorio extraidos (QG-003 passado)"
  - "Pelo menos 2 metodos de extracao utilizados"
  - "SECI conversion completa por nonaka (Tier 2)"
  - "Agente argyris carregado com frameworks de validacao"

outputs:
  - name: gap_analysis
    path: "outputs/repertoire/{slug}/gap-analysis.md"
    format: markdown
    description: >
      Relatorio completo de gap analysis com gaps classificados por severidade,
      pontos cegos, contradicoes, expertise oculta, oportunidades de double-loop,
      e assessment Model I/II.

  - name: gap_analysis_structured
    path: "outputs/repertoire/{slug}/gap-analysis.yaml"
    format: yaml
    description: >
      Versao estruturada do gap analysis para consumo programatico e
      integracao com knowledge-graph.json.

  - name: validation_verdict
    path: "outputs/repertoire/{slug}/validation-verdict.yaml"
    format: yaml
    description: >
      Veredicto de validacao (PASS/CONCERNS/FAIL) com score e detalhamento.

validation:
  success_criteria:
    - "Gap analysis cobre todas as areas de expertise mapeadas"
    - "Cada gap tem evidencia de pelo menos 2 fontes"
    - "Ladder of Inference auditada para frameworks de decisao criticos"
    - "Double-loop opportunities documentadas com exemplos concretos"
    - "Model I/II assessment completo com exemplos"
    - "Nenhuma contradicao critica sem resolucao documentada"
    - "Validation verdict emitido com score >= 7/10 para PASS"
  quality_threshold: "10/13 no checklist completo"
---

# Task: Validate Gaps (Espoused Theory vs Theory-in-Use)

## Executive Summary

Esta task aplica os frameworks de Chris Argyris e Donald Schon para detectar
discrepancias entre o que o sujeito DECLARA saber/fazer (espoused theory) e o
que as evidencias mostram que ele REALMENTE sabe/faz (theory-in-use). Gaps entre
esses dois niveis revelam pontos cegos, contradicoes nao percebidas, expertise
oculta (que a pessoa pratica mas nao articula), e oportunidades de double-loop
learning.

**Posicao no Pipeline:** Task 7 -- Phase 4 (Validation) do Full Mapping Pipeline
**Definicao de Sucesso:** Gap analysis completa com zero contradicoes criticas nao resolvidas
**Quality Gate:** QG-005 (Final Validation) -- BLOCKING

---

## Purpose

O mapeamento de repertorio ate este ponto extraiu o que o sujeito DISSE (via Q&A
com kelly, narrativas com klein) e o que ele DEMONSTROU (via analise de fontes
digitais, padroes de comportamento observados por leonard). Mas extrair nao e o
mesmo que validar.

Argyris demonstrou que profissionais competentes frequentemente operam com uma
teoria declarada ("eu valorizo feedback honesto") que difere radicalmente da
sua teoria-em-uso ("eu evito dar feedback negativo para nao gerar conflito").
Esse gap nao e hipocrisia -- e uma falha cognitiva sistematica que Argyris
chamou de "skilled incompetence": a pessoa e tao habil em evitar o desconforto
que nao percebe a contradicao.

Sem esta validacao, o repertoi
```