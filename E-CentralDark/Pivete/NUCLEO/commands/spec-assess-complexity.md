# COMANDO - spec-assess-complexity.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\spec-assess-complexity.md
**SHA:** 860d6c4641282a42
**Timestamp:** 2026-08-28T02:02:09.019466
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- risk:
- Risk:        3 (affects all users)

### Ouro Bruto (primeiros 5000 chars)
```
# Spec Pipeline: Assess Complexity

> **Phase:** 2 - Assess
> **Owner Agent:** @architect
> **Pipeline:** spec-pipeline

---

## Purpose

Avaliar a complexidade de uma story/requisito para determinar quais fases do pipeline são necessárias. Classifica em SIMPLE, STANDARD ou COMPLEX, cada um ativando diferentes conjuntos de fases.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-assess

  elicit: false
  deterministic: true # Same inputs should yield same complexity
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: overrideComplexity
      type: enum
      values: [SIMPLE, STANDARD, COMPLEX]
      required: false
      description: Manual override for complexity

  outputs:
    - name: complexity.json
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      schema: complexity-schema

  verification:
    type: none # Assessment is advisory

  contextRequirements:
    projectContext: true
    filesContext: true # Need to analyze codebase
    implementationPlan: false
    spec: false
```

---

## Complexity Dimensions

### Dimension 1: Scope

```yaml
scope:
  description: 'Quantos arquivos/componentes serão afetados?'

  scoring:
    1: '1-2 arquivos, mudança localizada'
    2: '3-5 arquivos, um módulo'
    3: '6-10 arquivos, múltiplos módulos'
    4: '11-20 arquivos, cross-cutting'
    5: '20+ arquivos, arquitetura inteira'

  analysis:
    - Count files mentioned in requirements
    - Estimate based on feature type
    - Check existing patterns for similar features
```

### Dimension 2: Integration

```yaml
integration:
  description: 'Quantas integrações externas são necessárias?'

  scoring:
    1: 'Nenhuma integração externa'
    2: '1 API interna existente'
    3: '1-2 APIs externas ou nova API interna'
    4: '3+ APIs ou integração complexa (webhooks, eventos)'
    5: 'Orquestração de múltiplos sistemas'

  analysis:
    - Identify external services mentioned
    - Check for authentication requirements
    - Assess data flow complexity
```

### Dimension 3: Infrastructure

```yaml
infrastructure:
  description: 'Mudanças de infraestrutura necessárias?'

  scoring:
    1: 'Nenhuma mudança de infra'
    2: 'Configuração simples (env vars)'
    3: 'Nova dependência ou serviço'
    4: 'Mudança de banco de dados / schema'
    5: 'Nova infraestrutura (servidor, container, etc)'

  analysis:
    - Check for database changes
    - Identify new services needed
    - Assess deployment impact
```

### Dimension 4: Knowledge

```yaml
knowledge:
  description: 'Conhecimento necessário para implementar'

  scoring:
    1: 'Padrões existentes no codebase'
    2: 'Tecnologia conhecida, novo padrão'
    3: 'Nova biblioteca, documentação clara'
    4: 'Tecnologia nova para o time'
    5: 'Área de domínio desconhecida, pesquisa necessária'

  analysis:
    - Check existing patterns in codebase
    - Identify new technologies mentioned
    - Assess learning curve
```

### Dimension 5: Risk

```yaml
risk:
  description: 'Risco de impacto negativo'

  scoring:
    1: 'Baixo risco, feature isolada'
    2: 'Risco moderado, afeta poucos usuários'
    3: 'Risco médio, feature importante'
    4: 'Risco alto, afeta muitos usuários'
    5: 'Risco crítico, core do sistema'

  analysis:
    - Assess user impact
    - Check for security implications
    - Evaluate reversibility
```

---

## Classification Thresholds

```yaml
thresholds:
  SIMPLE:
    max_total: 8
    description: 'Tarefa direta, padrões existentes'
    pipeline_phases: [gather, spec, critique]
    typical_time: '< 1 dia'

  STANDARD:
    min_total: 9
    max_total: 15
    description: 'Complexidade moderada, alguma pesquisa'
    pipeline_phases: [gather, assess, research, spec, critique, plan]
    typical_time: '1-3 dias'

  COMPLEX:
    min_total: 16
    description: 'Alta complexidade, múltiplas iterações'
    pipeline_phases: [gather, assess, research, spec, critique_1, revise, critique_2, plan]
    typical_time: '3+ dias'

    flags:
      - Requires architectural review
      - Consider breaking into smaller stories
      - Spike may be needed
```

---

## Execution Flow

### Step 1: Load Requirements

```yaml
load:
  action: read_requirements_json
  path: docs/stories/{storyId}/spec/requirements.json
  validate: true
```

### Step 2: Analyze Codebase (if needed)

```yaml
codebase_analysis:
  enabled: true

  actions:
    - id: count_affected_files
      description: 'Estimate files that will be modified'
      method: |
        1. Parse functional requirements
        2. Identify components/modules mentioned
        3. Search codebase for related files
        4. Count unique files

    - id: check_patterns
      description: 'Check if similar patterns exist'
      method: |
        1. Extract key concepts from requirements
        2. Sear
```