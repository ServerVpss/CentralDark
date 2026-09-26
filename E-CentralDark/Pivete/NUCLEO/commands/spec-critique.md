# COMANDO - spec-critique.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\spec-critique.md
**SHA:** 01c88a49688139c1
**Timestamp:** 2026-08-28T02:02:09.056579
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- gate: true  # Blocking gate

### Ouro Bruto (primeiros 5000 chars)
```
# Spec Pipeline: Critique Specification

> **Phase:** 5 - Critique
> **Owner Agent:** @qa
> **Pipeline:** spec-pipeline

---

## Purpose

Validar e criticar a especificação antes da implementação. Avalia accuracy, completeness, consistency, feasibility e alignment. Produz verdict (APPROVED/NEEDS_REVISION/BLOCKED) e pode sugerir correções.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-critique

  elicit: false
  deterministic: true
  composable: true

  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md

  inputs:
    - name: storyId
      type: string
      required: true

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false

  outputs:
    - name: critique.json
      type: file
      path: docs/stories/{storyId}/spec/critique.json
      schema: critique-schema

  verification:
    type: gate
    blocking: true
    verdict_field: verdict

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: true
```

---

## Critique Dimensions

### Dimension 1: Accuracy

```yaml
accuracy:
  description: 'Spec accurately reflects requirements'
  weight: 25%

  checks:
    - id: acc-1
      name: 'Requirement Coverage'
      question: 'Every FR-* from requirements.json is addressed in spec?'
      severity: HIGH

    - id: acc-2
      name: 'No Phantom Requirements'
      question: "Spec doesn't include features not in requirements?"
      severity: HIGH

    - id: acc-3
      name: 'Correct Priority Mapping'
      question: 'P0 requirements are prominent, P2 are optional?'
      severity: MEDIUM

    - id: acc-4
      name: 'NFR Addressed'
      question: 'All NFR-* have corresponding spec sections?'
      severity: MEDIUM

  scoring:
    5: 'All requirements accurately represented'
    4: 'Minor omissions, no misrepresentations'
    3: 'Some requirements unclear or incomplete'
    2: 'Significant gaps or misrepresentations'
    1: 'Major accuracy issues'
```

### Dimension 2: Completeness

```yaml
completeness:
  description: 'Spec has all necessary sections filled'
  weight: 25%

  checks:
    - id: comp-1
      name: 'All Sections Present'
      question: 'Overview, Requirements, Approach, Dependencies, Files, Testing, Risks all present?'
      severity: HIGH

    - id: comp-2
      name: 'Testing Coverage'
      question: 'Every FR has at least one test scenario?'
      severity: HIGH

    - id: comp-3
      name: 'Dependencies Listed'
      question: 'All external dependencies identified with versions?'
      severity: MEDIUM

    - id: comp-4
      name: 'Files Identified'
      question: 'New and modified files listed with purposes?'
      severity: MEDIUM

    - id: comp-5
      name: 'Risks Documented'
      question: 'At least potential risks considered?'
      severity: LOW

  scoring:
    5: 'Comprehensive, nothing missing'
    4: 'Minor gaps in non-critical sections'
    3: 'Some sections incomplete'
    2: 'Multiple sections missing or empty'
    1: 'Severely incomplete'
```

### Dimension 3: Consistency

```yaml
consistency:
  description: 'Spec is internally consistent'
  weight: 20%

  checks:
    - id: con-1
      name: 'ID References Valid'
      question: 'All FR-*/NFR-* references exist in requirements?'
      severity: HIGH

    - id: con-2
      name: 'Dependency Consistency'
      question: 'Dependencies in approach match dependencies section?'
      severity: MEDIUM

    - id: con-3
      name: 'Complexity Alignment'
      question: 'Spec depth matches complexity level?'
      severity: LOW

    - id: con-4
      name: 'No Contradictions'
      question: 'No conflicting statements between sections?'
      severity: HIGH

  scoring:
    5: 'Fully consistent throughout'
    4: 'Minor inconsistencies'
    3: 'Some contradictions or mismatches'
    2: 'Multiple inconsistencies'
    1: 'Fundamentally inconsistent'
```

### Dimension 4: Feasibility

```yaml
feasibility:
  description: 'Spec is technically feasible'
  weight: 15%

  checks:
    - id: feas-1
      name: 'Dependencies Available'
      question: 'All listed dependencies exist and are compatible?'
      severity: HIGH

    - id: feas-2
      name: 'Technical Approach Sound'
      question: 'Proposed architecture is achievable?'
      severity: HIGH

    - id: feas-3
      name: 'Reasonable Scope'
      question: 'Work fits within typical story scope?'
      severity: MEDIUM

    - id: feas-4
      name: 'No Impossible Requirements'
      question: 'All requirements are technically possible?'
      severity: HIGH

  scoring:
    5
```