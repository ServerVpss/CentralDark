# COMANDO - full-mapping-pipeline.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\workflows\full-mapping-pipeline.md
**SHA:** 9d4fc8997ef51c32
**Timestamp:** 2026-08-28T13:25:17.087938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: "Conte-me sobre uma vez em que você teve que tomar uma decisão
- prompt: "Liste 10 [projetos/decisões/etc] significativos na sua
- prompt: "Destes 3 elementos, quais 2 são mais parecidos?
- prompt: "Para cada [elemento], avalie de 1 a 5 neste critério:

### Contratos
- │  gate: QG-001, QG-002        │
- ▼  gate: QG-003
- │  gate: QG-004                 │
- │  gate: QG-005                 │
- **Gate:** QG-003 (Extraction Quality)
- **Gate:** QG-004 (Systematization Review)
- **Gate:** QG-005 (Final Validation)

### Ouro Bruto (primeiros 5000 chars)
```
---
id: WF-RM-001
name: Full Repertoire Mapping Pipeline
version: 1.0.0
description: >
  Pipeline completo de mapeamento de repertórios pessoais.
  Processa todas as fontes disponíveis (digitais + Q&A interativo)
  e produz outputs acionáveis: manifest, manual operacional,
  grafo de conhecimento e frameworks de decisão.
trigger: manual
phases:
  - PHASE_1_DIAGNOSIS
  - PHASE_2_EXTRACTION
  - PHASE_3_CONVERSION
  - PHASE_4_VALIDATION
  - PHASE_5_ORGANIZATION
  - PHASE_6_DELIVERY
agents_involved:
  - repertoire-chief
  - polanyi
  - collins
  - klein
  - leonard
  - kelly
  - nonaka
  - argyris
  - chin
  - forte
quality_gates:
  - QG-001: Source Classification
  - QG-002: Diagnosis Complete
  - QG-003: Extraction Quality
  - QG-004: Systematization Review
  - QG-005: Final Validation
estimated_duration: 2-6 hours (depends on source count)
input: >
  Fontes disponíveis (livro, vídeos, transcrições, redes sociais)
  + acesso ao sujeito para Q&A interativo
output: >
  repertoire-manifest.yaml, operating-manual.md, knowledge-graph.json,
  decision-frameworks.yaml, expertise-profile.md, gap-analysis.md
---

# Full Repertoire Mapping Pipeline

## Overview

Pipeline end-to-end para mapear todos os repertórios de uma pessoa.
Combina extração de fontes digitais com sessões de Q&A interativo
para capturar tanto conhecimento explícito quanto tácito.

## Pipeline Flow

```
INPUT: Fontes + Acesso ao Sujeito
    │
    ▼
┌──────────────────────────────┐
│  PHASE 1: DIAGNOSIS          │
│  agents: polanyi + collins    │
│  gate: QG-001, QG-002        │
│  output: expertise-profile    │
└──────────────┬───────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ PHASE 2A│ │PHASE 2B│ │PHASE 2C│
│ CDM     │ │Deep    │ │Reperto-│
│ Extract │ │Smarts  │ │ry Grid │
│ klein   │ │leonard │ │ kelly  │
└────┬───┘ └───┬────┘ └───┬────┘
     │         │           │
     └─────────┼───────────┘
               │
               ▼  gate: QG-003
┌──────────────────────────────┐
│  PHASE 3: CONVERSION (SECI)  │
│  agent: nonaka                │
│  gate: QG-004                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  PHASE 4: VALIDATION          │
│  agent: argyris               │
│  gate: QG-005                 │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌────────────┐ ┌────────────┐
│ PHASE 5A   │ │ PHASE 5B   │
│ Organize   │ │ Translate  │
│ forte      │ │ chin       │
└─────┬──────┘ └──────┬─────┘
      │               │
      └───────┬───────┘
              ▼
┌──────────────────────────────┐
│  PHASE 6: DELIVERY            │
│  agent: repertoire-chief      │
│  output: Final artifacts      │
└──────────────────────────────┘
```

---

## PHASE 1: DIAGNOSIS

**Duration:** 15-30 minutes
**Agents:** `polanyi` → `collins`
**Gates:** QG-001 (Source Classification), QG-002 (Diagnosis Complete)

### Step 1.1: Source Inventory

**Agent:** `repertoire-chief`

```yaml
actions:
  - inventory_sources:
      digital:
        - books: "Listar livros publicados, manuscritos"
        - videos: "YouTube, lives gravadas, webinars"
        - social: "Instagram, LinkedIn, Twitter posts"
        - transcriptions: "Mentorias, consultorias, podcasts"
        - documents: "Artigos, apresentações, frameworks escritos"
      interactive:
        - qa_sessions: "Disponibilidade para Q&A com Kelly Repertory Grid"
        - interviews: "Disponibilidade para CDM com Klein"

  - classify_sources:
      explicit_heavy: "Livros, artigos, apresentações"
      tacit_heavy: "Mentorias, consultorias, decisões"
      mixed: "Lives, vídeos, social media"
```

**QG-001 Check:**
- [ ] Pelo menos 3 fontes identificadas
- [ ] Pelo menos 1 fonte de conhecimento tácito
- [ ] Objetivo do mapeamento claro

### Step 1.2: Epistemological Classification

**Agent:** `polanyi`

```yaml
actions:
  - sample_sources:
      take: 2-3 representative sources
      analyze_for:
        - tacit_explicit_ratio: "Proporção estimada tácito/explícito"
        - proximal_distal_patterns: "O que é subsidiário vs focal"
        - personal_knowledge_markers: "Onde o compromisso pessoal é visível"
        - indwelling_evidence: "Ferramentas/conceitos em que a pessoa 'habita'"

  - produce:
      epistemological_map:
        knowledge_types:
          - type: "explicit_articulated"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_relational"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_somatic"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_collective"
            estimated_percentage: N%
            sources: ["..."]
```

### Step 1.3: Expertise Profiling

**Agent:** `collins`

```yaml
actions:
  - apply_periodic_table:
      for_each_domain_area:
        - identify_expertise_level:
            
```