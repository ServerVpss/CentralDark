# COMANDO - ADE-ARCHITECT-HANDOFF.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\ADE-ARCHITECT-HANDOFF.md
**SHA:** 1dd3c70646e0cb9c
**Timestamp:** 2026-08-28T02:02:34.157661
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Después de completar cada epic, active @qa para ejecutar el quality gate:

### Ouro Bruto (primeiros 5000 chars)
```
# ADE Architect Handoff

> **De:** Quinn (@qa) - QA Agent
> **Para:** Sage (@architect) - Solution Architect
> **Fecha:** 2026-01-28
> **Proyecto:** AIOS Autonomous Development Engine (ADE)

---

## Resumen Ejecutivo

El ADE es un proyecto de **Prompt Engineering + Infraestructura** para habilitar ejecución autónoma de desarrollo en AIOS. Aproximadamente **60% del trabajo es creación de tasks .md, workflows .yaml y templates** - no código tradicional.

**Usted es el líder técnico de este proyecto.** @dev será convocado únicamente para scripts JS específicos.

---

## Análisis de Dependencias

### Ruta Crítica (Secuencial Obligatorio)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRITICAL PATH                                      │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  BLOCKING: Cada epic depende de que el anterior esté COMPLETO               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Oportunidades de Paralelismo (Después del Epic 4)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 y Epic 6 pueden ejecutarse en PARALELO** después de que Epic 4 esté completo.

---

## Matriz de Dependencias

| Epic                 | Requiere | Bloquea    | Paralelo Con |
| -------------------- | -------- | ---------- | ------------ |
| **1. Worktree**      | -        | 2, 4       | -            |
| **2. Migration**     | 1        | 3, 4, 5, 6 | -            |
| **3. Spec Pipeline** | 2        | 4          | -            |
| **4. Execution**     | 3        | 5, 6       | -            |
| **5. Recovery**      | 4        | 7          | **6**        |
| **6. QA Evolution**  | 4        | 7          | **5**        |
| **7. Memory**        | 5, 6     | -          | -            |

---

## Paralelismo de Preparación

Aunque los epics tienen dependencias de **implementación**, puede **preparar** epics futuros mientras el actual está en desarrollo:

| Mientras ejecuta | Puede preparar (sin implementar)           |
| ---------------- | ------------------------------------------ |
| Epic 1           | Schemas V3 del Epic 2 (diseño)             |
| Epic 2           | Estructura de las tasks del Epic 3         |
| Epic 3           | Estructura del implementation.yaml del Epic 4 |
| Epic 4           | Diseño del Epic 5 y 6 en paralelo          |

---

## Desglose de Epics por Tipo de Trabajo

### Epic 1: Worktree Manager (P0) - 5 stories

**Tipo:** 70% Código, 30% Prompt Engineering

| Story | Entregable                            | Tipo        |
| ----- | ------------------------------------- | ----------- |
| 1.1   | worktree-manager.js                   | JS Script   |
| 1.2   | Merge operations                      | JS Script   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger                   | Workflow    |
| 1.5   | status.json integration               | JS + Schema |

**@dev necesario:** Stories 1.1, 1.2, 1.5 (scripts)
**@architect lidera:** Stories 1.3, 1.4 (prompts/workflows)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**Tipo:** 60% Código, 40% Prompt Engineering

| Story | Entregable                  | Tipo                |
| ----- | --------------------------- | ------------------- |
| 2.1   | asset-inventory.js          | JS Script           |
| 2.2   | path-analyzer.js            | JS Script           |
| 2.3   | V3 Schemas (agent, task)    | JSON Schema         |
| 2.4   | migrate-agent.js            | JS Script           |
| 2.5   | Pilot migration (@dev, @qa) | Manual + Validación |
| 2.6   | Batch migration             | Orquestación        |

**@dev necesario:** Stories 2.1, 2.2, 2.4 (scripts)
**@architect lidera:** Stories 2.3, 2.5, 2.6 (schemas/orquestación)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregable                    | Tipo           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md    
```

---

# COMANDO - ADE-ARCHITECT-HANDOFF.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\ADE-ARCHITECT-HANDOFF.md
**SHA:** bc754525c99d3a18
**Timestamp:** 2026-08-28T02:02:38.581450
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Após completar cada epic, acione @qa para executar o quality gate:

### Ouro Bruto (primeiros 5000 chars)
```
# ADE Architect Handoff

> **De:** Quinn (@qa) - QA Agent
> **Para:** Sage (@architect) - Solution Architect
> **Data:** 2026-01-28
> **Projeto:** AIOS Autonomous Development Engine (ADE)

---

## Resumo Executivo

O ADE é um projeto de **Prompt Engineering + Infraestrutura** para habilitar execução autônoma de desenvolvimento no AIOS. Aproximadamente **60% do trabalho é criação de tasks .md, workflows .yaml e templates** - não código tradicional.

**Você é o líder técnico deste projeto.** @dev será acionado apenas para scripts JS específicos.

---

## Análise de Dependências

### Caminho Crítico (Sequencial Obrigatório)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMINHO CRÍTICO                                   │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  BLOQUEANTE: Cada epic depende do anterior estar COMPLETO                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Oportunidades de Paralelismo (Após Epic 4)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 e Epic 6 podem rodar em PARALELO** após Epic 4 completo.

---

## Matriz de Dependências

| Epic                 | Requer   | Bloqueia   | Paralelo Com  |
| -------------------- | -------- | ---------- | ------------- |
| **1. Worktree**      | -        | 2, 4       | -             |
| **2. Migration**     | 1        | 3, 4, 5, 6 | -             |
| **3. Spec Pipeline** | 2        | 4          | -             |
| **4. Execution**     | 3        | 5, 6       | -             |
| **5. Recovery**      | 4        | 7          | **6**         |
| **6. QA Evolution**  | 4        | 7          | **5**         |
| **7. Memory**        | 5, 6     | -          | -             |

---

## Paralelismo de Preparação

Embora os épicos tenham dependências de **implementação**, você pode **preparar** épicos futuros enquanto o atual está em desenvolvimento:

| Enquanto executa | Pode preparar (sem implementar)            |
| ---------------- | ------------------------------------------ |
| Epic 1           | Schemas V3 do Epic 2 (design)              |
| Epic 2           | Estrutura das tasks do Epic 3              |
| Epic 3           | Estrutura do implementation.yaml do Epic 4 |
| Epic 4           | Design do Epic 5 e 6 em paralelo           |

---

## Detalhamento dos Epics por Tipo de Trabalho

### Epic 1: Worktree Manager (P0) - 5 stories

**Tipo:** 70% Código, 30% Prompt Engineering

| Story | Entregável                            | Tipo        |
| ----- | ------------------------------------- | ----------- |
| 1.1   | worktree-manager.js                   | JS Script   |
| 1.2   | Merge operations                      | JS Script   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger                   | Workflow    |
| 1.5   | status.json integration               | JS + Schema |

**@dev necessário:** Stories 1.1, 1.2, 1.5 (scripts)
**@architect lidera:** Stories 1.3, 1.4 (prompts/workflows)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**Tipo:** 60% Código, 40% Prompt Engineering

| Story | Entregável                  | Tipo                |
| ----- | --------------------------- | ------------------- |
| 2.1   | asset-inventory.js          | JS Script           |
| 2.2   | path-analyzer.js            | JS Script           |
| 2.3   | V3 Schemas (agent, task)    | JSON Schema         |
| 2.4   | migrate-agent.js            | JS Script           |
| 2.5   | Pilot migration (@dev, @qa) | Manual + Validação  |
| 2.6   | Batch migration             | Orquestração        |

**@dev necessário:** Stories 2.1, 2.2, 2.4 (scripts)
**@architect lidera:** Stories 2.3, 2.5, 2.6 (schemas/orquestração)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregável                    | Tipo           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md     | Task .md       |
| 
```