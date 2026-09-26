# COMANDO - plan-create-implementation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\plan-create-implementation.md
**SHA:** 6d794e93bf32fcfd
**Timestamp:** 2026-08-28T02:02:06.701708
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^[A-Z]+-\\d+$|^story-\\d+(\\.\\d+)?$"
- pattern: "^phase-\\d+$"
- pattern: "^\\d+\\.\\d+$"

### Ouro Bruto (primeiros 5000 chars)
```
# Execution Pipeline: Create Implementation Plan

> **Phase:** 1 - Plan
> **Owner Agent:** @architect
> **Pipeline:** execution-pipeline

---

## Purpose

Gerar planos de implementacao executaveis a partir de specs aprovados. Transforma o spec.md em uma sequencia de subtasks atomicas, cada uma com verificacao, formando um roadmap deterministico para o coder.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-plan

  elicit: true # User approval for plan before execution
  deterministic: true # Same spec should yield same plan structure
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: ID da story sendo planejada

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true
      description: Spec aprovado para implementacao

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false
      description: Resultado da avaliacao de complexidade

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false
      description: Dependencias pesquisadas

  outputs:
    - name: implementation.yaml
      type: file
      path: docs/stories/{storyId}/plan/implementation.yaml
      schema: implementation-schema

  verification:
    type: schema
    schemaRef: implementation-schema

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: true
```

---

## Core Rules

```yaml
rules:
  subtask_isolation:
    description: 'Cada subtask deve ser atomica e verificavel'
    constraints:
      - '1 servico por subtask (frontend, backend, infra, database)'
      - 'Maximo 3 arquivos por subtask'
      - 'Cada subtask DEVE ter verificacao definida'

  service_types:
    - frontend: 'UI components, stores, hooks, pages'
    - backend: 'API routes, services, controllers'
    - database: 'Migrations, seeds, schema changes'
    - infra: 'Config files, CI/CD, environment'

  verification_types:
    - command: 'Shell command that returns exit code 0 on success'
    - api: 'HTTP request with expected response'
    - browser: 'Visual/interaction verification via Playwright'
    - e2e: 'End-to-end test suite'
    - manual: 'Human verification required'

  phase_structure:
    description: 'Fases agrupam subtasks logicamente'
    typical_phases:
      - setup: 'Initial configuration, dependencies'
      - implementation: 'Core feature code'
      - testing: 'Unit and integration tests'
      - integration: 'Connecting components'
      - polish: 'Documentation, cleanup'
```

---

## Output Schema

```yaml
# implementation.yaml schema
$schema: 'http://json-schema.org/draft-07/schema#'
type: object
required:
  - storyId
  - createdAt
  - createdBy
  - status
  - complexity
  - phases

properties:
  storyId:
    type: string
    pattern: "^[A-Z]+-\\d+$|^story-\\d+(\\.\\d+)?$"
    description: 'Story identifier'

  createdAt:
    type: string
    format: date-time
    description: 'Plan creation timestamp'

  createdBy:
    type: string
    default: '@architect'
    description: 'Agent that created the plan'

  status:
    type: string
    enum: [pending, in_progress, completed, blocked]
    default: pending
    description: 'Overall plan status'

  complexity:
    type: string
    enum: [SIMPLE, STANDARD, COMPLEX]
    description: 'From complexity assessment or inferred'

  estimatedEffort:
    type: string
    description: 'Total estimated time'

  dependencies:
    type: array
    items:
      type: object
      properties:
        name:
          type: string
        version:
          type: string
        purpose:
          type: string
    description: 'External dependencies to install'

  phases:
    type: array
    minItems: 1
    items:
      $ref: '#/definitions/phase'

definitions:
  phase:
    type: object
    required: [id, name, subtasks]
    properties:
      id:
        type: string
        pattern: "^phase-\\d+$"
      name:
        type: string
        minLength: 2
      description:
        type: string
      subtasks:
        type: array
        minItems: 1
        items:
          $ref: '#/definitions/subtask'

  subtask:
    type: object
    required: [id, description, service, files, verification, status]
    properties:
      id:
        type: string
        pattern: "^\\d+\\.\\d+$"
        description: 'Phase.Subtask number (e.g., 1.1, 2.3)'
      description:
        type: string
        minLength: 10
        description: 'Clear description of what to implement'
      service:
        type: string
        enum: [frontend, backend, database, infra]
      files:
        type: array
        minItems: 1
        maxItems: 3
        items:
          type: string
        description: 'Files to create or modify'
      verification:
        $ref: '#/definitions/verification'
      status:
        type: string
        enum: [pending
```