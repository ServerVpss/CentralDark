# COMANDO - quick-qa-session.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\repertoire-mapper\workflows\quick-qa-session.md
**SHA:** e08aa9a913cda263
**Timestamp:** 2026-08-28T13:25:16.811045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: "Liste 10 decisões importantes que você tomou nos últimos 2 anos"
- prompt: "Liste 10 pessoas que você liderou ou influenciou"
- prompt: "Liste 10 problemas significativos que você resolveu"
- prompt: "Liste 10 conceitos ou habilidades que você ensina"
- prompt: "Liste 10 [situações/projetos/pessoas] marcantes na área de {domain}"
- prompt: "Pode pensar em mais exemplos? Especificamente de [tipo que falta]"
- prompt: "Alguns parecem muito parecidos. Pode substituir X por algo mais diferente?"
- prompt: |
- prompt: "Por que isso é importante para você?"
- prompt: "Pode dar um exemplo concreto disso?"

### Contratos
- ▼  gate: QG-QA-001
- ▼  gate: QG-QA-002

### Ouro Bruto (primeiros 5000 chars)
```
---
id: WF-RM-002
name: Quick Q&A Session
version: 1.0.0
description: >
  Sessão de Q&A de baixa fricção usando Repertory Grid de George Kelly.
  Projetada para extrair construtos pessoais em 15-30 minutos via
  comparações simples — sem entrevistas longas ou perguntas abertas.
trigger: manual
phases:
  - SETUP
  - ELEMENT_SELECTION
  - TRIAD_ELICITATION
  - RATING
  - ANALYSIS
  - INTEGRATION
agents_involved:
  - kelly
  - forte
quality_gates:
  - QG-QA-001: Elements Validated
  - QG-QA-002: Minimum Constructs Elicited
estimated_duration: 15-30 minutes
input: >
  Área de domínio para explorar + acesso interativo ao sujeito
output: >
  Repertory grid matrix, core constructs, construct map,
  novos itens para repertoire-manifest.yaml
---

# Quick Q&A Session — Repertory Grid

## Overview

Esta é a **feature diferenciadora** do squad. Enquanto entrevistas CDM (Klein)
exigem 1-2 horas de entrevista profunda, a sessão Q&A com Repertory Grid
extrai construtos pessoais em **15-30 minutos** através de um mecanismo simples:

> **Comparação por tríades:** "Destes 3, quais 2 são mais parecidos? Em quê?
> Como o 3º é diferente?"

Este formato funciona porque:
1. **Não exige introspecção** — a pessoa compara, não explica
2. **Usa a própria linguagem** — construtos emergem naturalmente
3. **É rápido** — cada tríade leva 1-2 minutos
4. **Revela o implícito** — construtos que a pessoa não sabia que tinha

---

## Formats Disponíveis

### Mini-Session (5 minutos)
- 6 elementos, 4 tríades
- Output: 4-6 construtos iniciais
- Uso: exploração rápida, warm-up

### Standard Session (15-20 minutos)
- 8-10 elementos, 8-12 tríades
- Output: 8-15 construtos + grid matrix
- Uso: mapeamento de uma área específica

### Deep Session (30 minutos)
- 12 elementos, 15+ tríades + laddering
- Output: 15-25 construtos + hierarchy + cluster analysis
- Uso: mapeamento profundo com análise de hierarquia

---

## Pipeline Flow

```
SETUP (2 min)
    │ Definir domínio + formato
    ▼
ELEMENT SELECTION (3-5 min)
    │ Sujeito lista 8-12 elementos
    ▼  gate: QG-QA-001
TRIAD ELICITATION (8-15 min)
    │ Apresentar tríades → extrair construtos
    ▼  gate: QG-QA-002
RATING (3-5 min)
    │ Avaliar elementos em cada construto (1-5)
    ▼
ANALYSIS (2-3 min, automática)
    │ Cluster + PCA + core constructs
    ▼
INTEGRATION (2 min)
    │ Adicionar ao repertoire-manifest
    ▼
OUTPUT: Grid + Constructs + Insights
```

---

## PHASE: SETUP

**Agent:** `kelly`
**Duration:** 2 minutos

### Definir Domínio

```yaml
setup:
  domain_question: "Qual área você quer explorar hoje?"
  examples:
    - "Como tomo decisões de negócio"
    - "Meu estilo de liderança"
    - "Como avalio oportunidades"
    - "Minha abordagem de ensino"
    - "Como resolvo problemas técnicos"

  format_selection:
    based_on:
      - time_available
      - depth_needed
      - previous_sessions

  context_load:
    if_previous_sessions_exist:
      - load_existing_constructs
      - identify_gaps_to_explore
      - suggest_complementary_domains
```

---

## PHASE: ELEMENT SELECTION

**Agent:** `kelly`
**Duration:** 3-5 minutos

### Solicitar Elementos

```yaml
element_types_by_domain:
  decision_making:
    prompt: "Liste 10 decisões importantes que você tomou nos últimos 2 anos"
    examples: ["Contratação do João", "Pivô do produto", "Parceria com X"]

  leadership:
    prompt: "Liste 10 pessoas que você liderou ou influenciou"
    examples: ["Membro A da equipe", "Cliente B", "Sócio C"]

  problem_solving:
    prompt: "Liste 10 problemas significativos que você resolveu"
    examples: ["Bug crítico em produção", "Conflito de equipe", "Queda de receita"]

  teaching:
    prompt: "Liste 10 conceitos ou habilidades que você ensina"
    examples: ["Gestão de tempo", "Programação", "Negociação"]

  generic:
    prompt: "Liste 10 [situações/projetos/pessoas] marcantes na área de {domain}"
```

### Validar Elementos

```yaml
validation:
  minimum: 6
  ideal: 8-12
  maximum: 15

  checks:
    - variety: "Elementos devem ser diversos (não todos positivos ou negativos)"
    - concreteness: "Elementos devem ser específicos, não abstratos"
    - familiarity: "Sujeito deve conhecer bem cada elemento"
    - relevance: "Todos no mesmo domínio"

  if_insufficient:
    prompt: "Pode pensar em mais exemplos? Especificamente de [tipo que falta]"

  if_too_similar:
    prompt: "Alguns parecem muito parecidos. Pode substituir X por algo mais diferente?"
```

**QG-QA-001 Check:**
- [ ] Mínimo 6 elementos listados
- [ ] Elementos são diversos
- [ ] Elementos são concretos e específicos

---

## PHASE: TRIAD ELICITATION

**Agent:** `kelly`
**Duration:** 8-15 minutos

### Apresentar Tríades

```yaml
triad_selection_strategy:
  method: "balanced_incomplete_block"
  goal: "Cada elemento aparece em pelo menos 3 tríades"
  avoid: "Repetir a mesma combinação"

per_triad:
  present:
    prompt: |
      Considere estes 3:
        A) {elemento_1}
        B) {elemento_2}
        C) {elemento_3}

      Quais 2 são mai
```