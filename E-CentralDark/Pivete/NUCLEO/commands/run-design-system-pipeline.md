# COMANDO - run-design-system-pipeline.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\run-design-system-pipeline.md
**SHA:** 89482d6d061afa53
**Timestamp:** 2026-08-28T02:02:08.899990
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: "Project directory path"
- prompt: "Execution mode (yolo|interactive|preflight)"
- prompt: "Steps to skip (build|document|a11y|roi)"
- prompt: "Output directory for artifacts"
- run: npx aios-core task run-design-system-pipeline --mode=yolo

### Riscos
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# Run Design System Pipeline

> Task ID: run-design-system-pipeline
> Agent: @ux-design-expert (Brad - Design System Architect)
> Version: 1.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Executa pipeline completo automaticamente
- Minimal user interaction
- **Best for:** Pipelines de CI/CD, releases automatizados

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Checkpoint entre cada step
- Mostra resultados e pede confirmação
- **Best for:** Primeira execução, validação manual

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Analisa projeto antes de executar
- Identifica potenciais problemas
- **Best for:** Projetos complexos, primeira migração

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: run-design-system-pipeline
responsável: Brad (Design System Architect)
responsavel_type: Agente
atomic_layer: Pipeline

inputs:
  - name: project_path
    type: string
    required: false
    default: "."
    prompt: "Project directory path"

  - name: mode
    type: string
    required: false
    default: "interactive"
    prompt: "Execution mode (yolo|interactive|preflight)"

  - name: skip_steps
    type: array
    required: false
    default: []
    prompt: "Steps to skip (build|document|a11y|roi)"

  - name: output_dir
    type: string
    required: false
    default: "outputs/design-system/"
    prompt: "Output directory for artifacts"

outputs:
  - name: pipeline_report
    type: object
    destination: file_system
    persisted: true

  - name: build_artifacts
    type: object
    destination: file_system
    persisted: true

  - name: documentation
    type: object
    destination: file_system
    persisted: true

  - name: a11y_report
    type: object
    destination: file_system
    persisted: true

  - name: roi_metrics
    type: object
    destination: file_system
    persisted: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Design System project exists with components
    tipo: pre-condition
    blocker: true
    validação: |
      Check for design-system/ or components/ui/ directory
    error_message: "Pre-condition failed: No Design System found in project"

  - [ ] Package.json exists with required dependencies
    tipo: pre-condition
    blocker: false
    validação: |
      Check for React, TypeScript, Tailwind dependencies
    error_message: "Warning: Some dependencies may be missing"

  - [ ] Build tools configured (vite, webpack, or similar)
    tipo: pre-condition
    blocker: true
    validação: |
      Check for build configuration files
    error_message: "Pre-condition failed: No build configuration found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All pipeline steps completed without critical errors
    tipo: post-condition
    blocker: true
    validação: |
      Verify each step exit code = 0 or has acceptable warnings
    error_message: "Post-condition failed: Pipeline had critical errors"

  - [ ] Output artifacts generated in expected locations
    tipo: post-condition
    blocker: true
    validação: |
      Check outputs/design-system/ contains expected files
    error_message: "Post-condition failed: Missing output artifacts"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Build step: Components compiled successfully
    tipo: acceptance-criterion
    blocker: true

  - [ ] Document step: Pattern Library documentation generated
    tipo: acceptance-criterion
    blocker: false

  - [ ] A11y step: WCAG AA audit completed (warnings OK, errors block)
    tipo: acceptance-criterion
    blocker: true

  - [ ] ROI step: Metrics calculated and report generated
    tipo: acceptance-criterion
    blocker: false
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** build-component
  - **Purpose:** Build individual components
  - **Source:** .aios-core/development/tasks/build-component.md

- **Tool:** generate-documentation
  - **Purpose:** Generate Pattern Library docs
  - **Source:** .aios-core/development/tasks/generate-documentation.md

- **Tool:** accessibility-audit
  - **Purpose:** Run WCAG compliance checks
  - **Source:** External: axe-core, pa11y, or similar

- **Tool:** calculate-roi
  - **Purpose:** Calculate ROI metrics
  - **Source:** .aios-core/development/tasks/calculate-roi.md

---

## Error Handling

**Strategy:** continue-on-warning

**Common Errors:**

1. **Error:** Build Failure
   - **Cause:** TypeScript errors, missing dependencies, invalid imports
   - **Resolution:** Fix errors and re-run build step only
   - **Recovery:** Show error details, suggest fixes, off
```