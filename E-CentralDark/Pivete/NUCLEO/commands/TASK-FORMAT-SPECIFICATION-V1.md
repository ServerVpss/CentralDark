# COMANDO - TASK-FORMAT-SPECIFICATION-V1.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\docs\standards\TASK-FORMAT-SPECIFICATION-V1.md
**SHA:** f46e020f07b11f64
**Timestamp:** 2026-08-28T02:02:10.665629
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- padrão: [default value] (optional)
- padrão: [default value] (optional)
- padrão: null
- padrão: null
- padrão: "portrait"
- padrão: ["brand_alignment", "text_legibility", "visual_appeal", "no_face_coverage"]

### Riscos
- blocker: [true|false]
- blocker: [true|false]
- blocker: [false]
- blocker: [true|false]
- blocker: [true|false]
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Task Format Specification V1.0

**Date:** 2025-11-13  
**Version:** 1.0.0  
**Status:** Standard  
**Author:** Brad Frost Cognitive Clone

---

## Purpose

This document defines the UNIVERSAL format for AIOS Tasks, ensuring consistency, scalability, and reusability across workflows, executors, and teams.

---

## Task Format Overview

Every AIOS Task MUST follow this structure:

```yaml
#### Step X: [Task Name]

task: taskIdentifier()
responsável: [Role or Service Name]
responsavel_type: Agente | Worker | Humano | Clone
atomic_layer: [Atom | Molecule | Organism | Template | Page | Config | Strategy | Content | Media | Layout | Analysis]

**Entrada:**
- campo: [name]
  tipo: [type]
  origem: [source step]
  obrigatório: [true|false]
  padrão: [default value] (optional)

**Saída:**
- campo: [name]
  tipo: [type]
  destino: [destination step(s)]
  persistido: [true|false]

**Checklist:**
  pre-conditions:
    - [ ] [condition description]
      tipo: pre-condition
      blocker: [true|false]
      validação: [validation logic or test path]
  
  post-conditions:
    - [ ] [condition description]
      tipo: post-condition
      blocker: [true|false]
      validação: [validation logic or test path]
  
  acceptance-criteria:
    - [ ] [acceptance description]
      tipo: acceptance
      blocker: [false]
      story: [STORY-XXX]
      manual_check: [true|false]

**Template:** (optional)
- path: [relative path to template file]
- type: [input|output|prompt|ui|script]
- version: [X.Y.Z]
- variables: [array of variable names]

**Tools:** (optional)
- [tool_name]:
    version: [X.Y.Z]
    used_for: [description]
    shared_with: [array of step IDs]

**Scripts:** (optional)
- [script_path]:
    description: [what it does]
    language: [javascript|python|bash|etc]

**Performance:**
- duration_expected: [X]ms
- cost_estimated: $[Y] (for AI executors)
- cacheable: [true|false]
- cache_key: [cache identifier] (if cacheable)
- parallelizable: [true|false]
- parallel_with: [array of step IDs] (if parallelizable)
- skippable_when: [array of conditions]

**Error Handling:**
- strategy: [retry|fallback|abort]
- fallback: [description or default value] (if strategy=fallback)
- retry:
    max_attempts: [N]
    backoff: [linear|exponential]
    backoff_ms: [initial backoff in milliseconds]
- abort_workflow: [true|false]
- notification: [log|email|slack|etc]

**Metadata:**
- story: [STORY-XXX]
- version: [X.Y.Z]
- dependencies: [array of step IDs]
- breaking_changes: [array of changes from previous version]
- author: [name]
- created_at: [YYYY-MM-DD]
- updated_at: [YYYY-MM-DD]
```

---

## Field Definitions

### Required Fields

#### 1. `task`

**Type:** `string` (function name)  
**Required:** ✅ Yes  
**Format:** `camelCase()` with parentheses

**Purpose:** Unique identifier for the task function.

**Validation:**
- Must be unique across workflow
- Must be valid JavaScript function name
- Must end with `()`

**Examples:**
```yaml
task: loadFormatConfig()
task: analyzeBrief()
task: designCTAComponent()
```

---

#### 2. `responsável`

**Type:** `string`  
**Required:** ✅ Yes  
**Format:** Free text (role or service name)

**Purpose:** Human-readable name of the responsible entity.

**Examples:**
```yaml
responsável: Creative Director
responsável: format-loader.js
responsável: OpenRouter Vision Model
responsável: Brad Frost Clone
```

---

#### 3. `responsavel_type`

**Type:** `enum`  
**Required:** ✅ Yes  
**Values:** `Agente | Worker | Humano | Clone`

**Purpose:** Defines the executor type for orchestration, cost tracking, and error handling.

**Validation:**
- Must be one of the 4 allowed values
- Determines execution environment

**Decision Tree:** See `EXECUTOR-DECISION-TREE.md`

**Examples:**
```yaml
responsavel_type: Agente  # AI-powered execution
responsavel_type: Worker  # Script-based execution
responsavel_type: Humano  # Manual human execution
responsavel_type: Clone   # Mind emulation with heuristics
```

---

#### 4. `atomic_layer`

**Type:** `enum`  
**Required:** ✅ Yes (for design-related tasks), ⚠️ Optional (for config/strategy)  
**Values:**
- **Atomic Design:** `Atom | Molecule | Organism | Template | Page`
- **Other Layers:** `Config | Strategy | Content | Media | Layout | Analysis`

**Purpose:** Maps task to Atomic Design layer for architecture validation.

**Validation:**
- Design tasks MUST specify Atomic Design layer
- Non-design tasks SHOULD specify functional layer

**Examples:**
```yaml
atomic_layer: Atom       # Step 7a: Design CTA (single component)
atomic_layer: Molecule   # Step 8a: Compose Text Group (title + body + cta)
atomic_layer: Organism   # Step 8c: Content Area (complete section)
atomic_layer: Template   # Step 13: Render HTML (structure)
atomic_layer: Page       # Step 14: Export PNG (final instance)
atomic_layer: Config     # Step 1: Load Format Config
atomic_layer: Strategy   # Step 3: Analyze Brief
```

---

#### 5. `Entrada` (Inputs)

**Type:** `array of objects`  
**Required:** 
```