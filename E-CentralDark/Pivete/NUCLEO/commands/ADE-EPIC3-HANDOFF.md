# COMANDO - ADE-EPIC3-HANDOFF.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\ADE-EPIC3-HANDOFF.md
**SHA:** 1171c205bbff793d
**Timestamp:** 2026-08-28T02:02:34.217864
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Pattern:**
- **Pattern:**
- **Pattern:**
- **Pattern:**
- **Pattern:**

### Contratos
- gate: true # Debe pasar para continuar

### Ouro Bruto (primeiros 5000 chars)
```
# ADE Epic 3 Handoff - Spec Pipeline

> **De:** Quinn (@qa) - QA Agent
> **Para:** Aria (@architect) - Solution Architect
> **Fecha:** 2026-01-28
> **Estado:** Epic 1+2 COMPLETO → Epic 3 DESBLOQUEADO

---

## Resumen Ejecutivo

Epic 1 (Worktree) y Epic 2 (Migration V3) estan **100% completos** y aprobados por el QA Gate. El Epic 3 (Spec Pipeline) esta **desbloqueado** para inicio inmediato.

**Epic 3 es 100% Prompt Engineering** - @architect lidera las 6 stories.

---

## Prerequisitos Validados ✅

| Dependencia       | Estado            | Evidencia                                     |
| ----------------- | ----------------- | --------------------------------------------- |
| WorktreeManager   | ✅ Funcional      | `manager.list()` ejecuta sin errores          |
| V3 Schemas        | ✅ Completo       | `agent-v3-schema.json`, `task-v3-schema.json` |
| Todos Agents V3   | ✅ 12/12 migrados | `autoClaude:` section en todos                |
| Migration Scripts | ✅ Listos         | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Vision General del Spec Pipeline

**Tipo:** 10% Codigo, **90% Prompt Engineering**

El Spec Pipeline transforma requisitos vagos en especificaciones ejecutables a traves de 5 fases secuenciales:

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

---

## Desglose de Stories

| Story | Entregable                      | Tipo           | Agent      |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**@dev necesario:** Ninguno
**@architect lidera:** TODAS las stories

---

## Story 3.1: Gather Requirements

**Objetivo:** Recolectar y estructurar requisitos del usuario

**Task:** `spec-gather-requirements.md`

**Inputs:**

- User request (texto o voz)
- Contexto del proyecto (desde status.json)
- Specs existentes (si se esta iterando)

**Outputs:**

- Documento de requisitos estructurado
- Preguntas de clarificacion (si hay ambiguedad)
- Definicion inicial del scope

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # Se necesita creatividad del LLM
```

---

## Story 3.2: Assess Complexity

**Objetivo:** Evaluar complejidad y estimar esfuerzo

**Task:** `spec-assess-complexity.md`

**Inputs:**

- Requisitos recolectados (de 3.1)
- Analisis del codebase
- Restricciones tecnicas

**Outputs:**

- Puntuacion de complejidad (simple/standard/complex)
- Estimacion de esfuerzo
- Factores de riesgo
- Desglose sugerido (si es complex)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # La evaluacion es consultiva
```

---

## Story 3.3: Research Dependencies

**Objetivo:** Investigar bibliotecas, APIs y patrones necesarios

**Task:** `spec-research-dependencies.md`

**Herramientas Requeridas:**

- EXA (busqueda web)
- Context7 (documentacion de bibliotecas)
- Busqueda en codebase

**Inputs:**

- Requisitos + Evaluacion
- Preferencias del tech stack (desde technical-preferences.md)

**Outputs:**

- Bibliotecas recomendadas con justificacion
- Enlaces a documentacion de APIs
- Ejemplos de codigo
- Notas de compatibilidad

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: Write Specification

**Objetivo:** Producir especificacion ejecutable

**Task:** `spec-write-spec.md`

**Inputs:**

- Todos los outputs anteriores (requisitos, evaluacion, investigacion)
- Template de spec

**Outputs:**

- Documento de especificacion completo
- Checklist de implementacion
- Escenarios de prueba (Given-When-Then)
- Criterios de aceptacion

**Template:** Usar `spec-tmpl.yaml` existente o crear nuevo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # Mismos inputs = misma spec
  composable: true
```

---

## Story 3.5: Critique Specification

**Objetivo:** Validar y mejorar la spec antes de la ejecucion

**Task:** `spec-critique.md`

**Inputs:**

- Especificacion escrita (de 3.4)
- Checklist de calidad

**Outputs:**

- Reporte de critica
- Sugerencias de mejora
- Decision PASS/NEEDS_REVISION
- Spec revisada (si se corrigio automaticamente)

**Agent:** Capacidades de @qa (canCritique: true)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Pipeline Orchestration

**Objetivo:** Orquestar las 5 fases en un workflow unico

**Workflow:** `spec-pipeline.yaml`

**Estructura:**

``
```

---

# COMANDO - ADE-EPIC3-HANDOFF.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\ADE-EPIC3-HANDOFF.md
**SHA:** 619a75e198df4028
**Timestamp:** 2026-08-28T02:02:38.599826
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Após completar o Epic 3, execute:

### Padroes
- **Pattern:**
- **Pattern:**
- **Pattern:**
- **Pattern:**
- **Pattern:**

### Contratos
- gate: true # Deve passar para continuar

### Ouro Bruto (primeiros 5000 chars)
```
# ADE Epic 3 Handoff - Spec Pipeline

> **De:** Quinn (@qa) - QA Agent
> **Para:** Aria (@architect) - Solution Architect
> **Data:** 2026-01-28
> **Status:** Epic 1+2 COMPLETOS → Epic 3 DESBLOQUEADO

---

## Resumo Executivo

Epic 1 (Worktree) e Epic 2 (Migration V3) estão **100% completos** e aprovados pelo QA Gate. O Epic 3 (Spec Pipeline) está **desbloqueado** para início imediato.

**Epic 3 é 100% Prompt Engineering** - @architect lidera todas as 6 stories.

---

## Pré-requisitos Validados ✅

| Dependência       | Status            | Evidência                                     |
| ----------------- | ----------------- | --------------------------------------------- |
| WorktreeManager   | ✅ Funcional      | `manager.list()` executa sem erros            |
| V3 Schemas        | ✅ Completo       | `agent-v3-schema.json`, `task-v3-schema.json` |
| Todos Agents V3   | ✅ 12/12 migrados | Seção `autoClaude:` em todos                  |
| Scripts Migração  | ✅ Prontos        | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Visão Geral do Spec Pipeline

**Tipo:** 10% Código, **90% Prompt Engineering**

O Spec Pipeline transforma requisitos vagos em especificações executáveis através de 5 fases sequenciais:

```
Solicitação Usuário → Gather → Assess → Research → Write → Critique → Spec Pronta
```

---

## Detalhamento das Stories

| Story | Entregável                      | Tipo           | Agent      |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**@dev necessário:** Nenhum
**@architect lidera:** TODAS as stories

---

## Story 3.1: Coletar Requisitos (Gather Requirements)

**Objetivo:** Coletar e estruturar requisitos do usuário

**Task:** `spec-gather-requirements.md`

**Entradas:**

- Solicitação do usuário (texto ou voz)
- Contexto do projeto (de status.json)
- Specs existentes (se iterando)

**Saídas:**

- Documento de requisitos estruturado
- Perguntas de esclarecimento (se ambíguo)
- Definição inicial de escopo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # Criatividade do LLM necessária
```

---

## Story 3.2: Avaliar Complexidade (Assess Complexity)

**Objetivo:** Avaliar complexidade e estimar esforço

**Task:** `spec-assess-complexity.md`

**Entradas:**

- Requisitos coletados (de 3.1)
- Análise do codebase
- Restrições técnicas

**Saídas:**

- Score de complexidade (simple/standard/complex)
- Estimativa de esforço
- Fatores de risco
- Sugestão de divisão (se complexo)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # Assessment é consultivo
```

---

## Story 3.3: Pesquisar Dependências (Research Dependencies)

**Objetivo:** Pesquisar bibliotecas, APIs e padrões necessários

**Task:** `spec-research-dependencies.md`

**Ferramentas Necessárias:**

- EXA (busca web)
- Context7 (docs de bibliotecas)
- Busca no codebase

**Entradas:**

- Requisitos + Avaliação
- Preferências de tech stack (de technical-preferences.md)

**Saídas:**

- Bibliotecas recomendadas com justificativa
- Links de documentação de API
- Exemplos de código
- Notas de compatibilidade

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: Escrever Especificação (Write Specification)

**Objetivo:** Produzir especificação executável

**Task:** `spec-write-spec.md`

**Entradas:**

- Todas as saídas anteriores (requisitos, avaliação, pesquisa)
- Template de spec

**Saídas:**

- Documento de especificação completo
- Checklist de implementação
- Cenários de teste (Given-When-Then)
- Critérios de aceitação

**Template:** Usar `spec-tmpl.yaml` existente ou criar novo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # Mesmas entradas = mesma spec
  composable: true
```

---

## Story 3.5: Criticar Especificação (Critique Specification)

**Objetivo:** Validar e melhorar a spec antes da execução

**Task:** `spec-critique.md`

**Entradas:**

- Especificação escrita (de 3.4)
- Checklist de qualidade

**Saídas:**

- Relatório de crítica
- Sugestões de melhoria
- Decisão PASS/NEEDS_REVISION
- Spec revisada (se auto-corrigida)

**Agent:** Capacidades do @qa (canCritique: true)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Orquestração do Pipeline (Pipeline Orchestration)

**Objetivo:** Orquestrar as 5 fases em workfl
```