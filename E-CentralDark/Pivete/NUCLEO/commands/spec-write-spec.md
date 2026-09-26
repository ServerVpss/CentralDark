# COMANDO - spec-write-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\spec-write-spec.md
**SHA:** fe8f7d5ee6780b6b
**Timestamp:** 2026-08-28T02:02:08.825567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- ## Constitutional Gate: No Invention
- constitutional_gate:

### Gaps
- - missing: string[] (if any)

### Ouro Bruto (primeiros 5000 chars)
```
# Spec Pipeline: Write Specification

> **Phase:** 4 - Write
> **Owner Agent:** @pm
> **Pipeline:** spec-pipeline

---

## Purpose

Produzir especificação completa e executável a partir dos artefatos das fases anteriores. O spec.md é o documento definitivo que guia a implementação - nenhuma invenção, apenas derivação dos inputs.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-write

  elicit: false
  deterministic: true # Same inputs = same spec
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false # Optional for SIMPLE

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false # Optional for SIMPLE

  outputs:
    - name: spec.md
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      template: spec-tmpl.md

  verification:
    type: manual
    next_phase: critique

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: false
```

---

## Constitutional Gate: No Invention

> **Reference:** Constitution Article IV - No Invention (MUST)
> **Severity:** BLOCK
> **Enforcement:** Automatic validation before spec completion

```yaml
constitutional_gate:
  article: IV
  name: No Invention
  severity: BLOCK

  validation:
    - Every statement MUST trace to FR-*, NFR-*, CON-*, or research finding
    - No features not present in requirements.json
    - No technologies not validated in research.json
    - No acceptance criteria not derived from inputs

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article IV - No Invention
      Spec contains content not traceable to inputs.

      Violations found:
      {list_violations}

      Resolution: Remove invented content or add to Open Questions section.

  audit:
    log: true
    report_to: qa_critique_phase
```

### No Invention Rule Details

```yaml
no_invention_rule:
  description: |
    The spec writer MUST NOT invent or assume anything not present in inputs.
    Every statement in spec.md must trace back to:
    - A functional requirement (FR-*)
    - A non-functional requirement (NFR-*)
    - A constraint (CON-*)
    - A research finding (verified dependency)

  violations:
    - Adding features not in requirements
    - Assuming implementation details not researched
    - Specifying technologies not validated
    - Creating acceptance criteria not derived from requirements

  when_unclear:
    action: 'Add to Open Questions section instead of assuming'
```

---

## Spec Template Structure

````markdown
# Spec: {story-title}

> **Story ID:** {storyId}
> **Complexity:** {complexity.result}
> **Generated:** {timestamp}
> **Status:** Draft

---

## 1. Overview

{Brief description derived from functional requirements}

### 1.1 Goals

- {Goal derived from FR-\*}

### 1.2 Non-Goals

- {Explicitly out of scope items}

---

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID   | Description   | Priority | Source            |
| ---- | ------------- | -------- | ----------------- |
| FR-1 | {description} | P0       | requirements.json |

### 2.2 Non-Functional Requirements

| ID    | Category   | Requirement   | Metric       |
| ----- | ---------- | ------------- | ------------ |
| NFR-1 | {category} | {description} | {measurable} |

### 2.3 Constraints

| ID    | Type   | Constraint    | Impact   |
| ----- | ------ | ------------- | -------- |
| CON-1 | {type} | {description} | {impact} |

---

## 3. Technical Approach

### 3.1 Architecture Overview

{High-level architecture derived from requirements and research}

### 3.2 Component Design

{Components needed, derived from scope analysis}

### 3.3 Data Flow

{How data moves through the system}

---

## 4. Dependencies

### 4.1 External Dependencies

| Dependency | Version   | Purpose   | Verified |
| ---------- | --------- | --------- | -------- |
| {name}     | {version} | {purpose} | ✅/⚠️    |

### 4.2 Internal Dependencies

| Module   | Purpose      |
| -------- | ------------ |
| {module} | {why needed} |

---

## 5. Files to Modify/Create

### 5.1 New Files

| File Path | Purpose   | Template |
| --------- | --------- | -------- |
| {path}    | {purpose} | {if any} |

### 5.2 Modified Files

| File Path | Changes        | Risk         |
| --------- | -------------- | ------------ |
| {path}    | {what changes} | Low/Med/High |

---

## 6. Testing Strategy

### 6.1 Unit Tests

| Test        | Covers       | Priority |
| ----------- | ------------ | -------- |
| {test name} | {FR-_/NFR-_} | P0/P1/P2 |

### 6.2 Integration Tests

| Test        | Components   | Scenario   |
| ----------- | ------------ | ---------- |
| {test name} | {components}
```