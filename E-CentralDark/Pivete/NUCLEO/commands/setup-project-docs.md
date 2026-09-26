# COMANDO - setup-project-docs.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\setup-project-docs.md
**SHA:** 61ddcbba5e783648
**Timestamp:** 2026-08-28T02:02:09.008754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: false,  // Set true to preview

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Greenfield projects, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Brownfield projects, complex configurations

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Critical projects, enterprise setups

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: setupProjectDocs()
responsible: dev (Developer)
responsible_type: Agent
atomic_layer: Documentation

inputs:
- field: targetDir
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path

- field: projectName
  type: string
  source: User Input or package.json
  required: false
  validation: Non-empty string

- field: mode
  type: string
  source: User Input
  required: false
  validation: greenfield|brownfield|framework-dev

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|pre-flight

outputs:
- field: docs_generated
  type: array
  destination: docs/architecture/
  persisted: true

- field: core_config
  type: file
  destination: .aios-core/core-config.yaml
  persisted: true

- field: gitignore
  type: file
  destination: .gitignore
  persisted: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target directory exists and is writable
    type: pre-condition
    blocker: true
    validation: |
      Check target directory exists and has write permissions
    error_message: "Pre-condition failed: Target directory not accessible"

  - [ ] Documentation Integrity module is available
    type: pre-condition
    blocker: true
    validation: |
      Verify .aios-core/infrastructure/scripts/documentation-integrity/index.js exists
    error_message: "Pre-condition failed: Documentation Integrity module not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project docs created in docs/architecture/
    type: post-condition
    blocker: true
    validation: |
      Verify source-tree.md, coding-standards.md, tech-stack.md exist in docs/architecture/
    error_message: "Post-condition failed: Documentation files not created"

  - [ ] core-config.yaml created with valid deployment section
    type: post-condition
    blocker: true
    validation: |
      Verify .aios-core/core-config.yaml exists and has deployment configuration
    error_message: "Post-condition failed: core-config.yaml not properly configured"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All documentation files generated from templates
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert docs contain project-specific content, not placeholders
    error_message: "Acceptance criterion not met: Docs contain unresolved placeholders"

  - [ ] .gitignore properly configured for project
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert .gitignore includes AIOS ignores and tech stack ignores
    error_message: "Acceptance criterion not met: .gitignore incomplete"

  - [ ] Configuration-Driven Architecture pattern applied
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert core-config.yaml contains project-specific values
    error_message: "Acceptance criterion not met: core-config.yaml not configuration-driven"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** documentation-integrity
  - **Purpose:** Mode detection, doc generation, config generation
  - **Source:** .aios-core/infrastructure/scripts/documentation-integrity/index.js

- **Tool:** deployment-config-loader
  - **Purpose:** Load and validate deployment configuration
  - **Source:** .aios-core/infrastructure/scripts/documentation-integrity/deployment-config-loader.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** mode-detector.js
  - **Purpose:** Detect installation mode from project markers
  - **Language:** JavaScript
  - **Location:** .aios-core/infrastructure/scripts/documentation-integrity/mode-detector.js

- **Script:** doc-generator.js
  - **Purpose:** Generate project documentation from templates
  - **Language:** JavaScript
  - **Location:** .aios-core/infrastructure/scripts/documentation-integrity/doc-generator.js

- **Script:** config-generator.js
  - **Purpose:** Generate core-config.yaml
  - **Language:** JavaScript
  - **Locatio
```