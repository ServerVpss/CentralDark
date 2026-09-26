# COMANDO - analyze-project-structure.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\analyze-project-structure.md
**SHA:** 3336ea3c394e4746
**Timestamp:** 2026-08-28T02:02:04.719649
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Analyze Project Structure

**Purpose:** Analyze an existing AIOS project to understand its structure, services, patterns, and provide recommendations for implementing new features. This is Phase 1 of the Incremental Feature Workflow.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Quick scan with default recommendations
- Minimal user interaction
- **Best for:** Quick assessments, familiar projects

### 2. Interactive Mode - Balanced, Educational (3-5 prompts) **[DEFAULT]**
- Detailed analysis with explanation
- User input on feature requirements
- **Best for:** First-time analysis, new features

### 3. Comprehensive Mode - Full Analysis
- Complete project scan
- All patterns documented
- **Best for:** Large projects, major features

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: analyzeProjectStructure()
responsible: architect (Aria)
responsible_type: Agent
atomic_layer: Analysis
elicit: true

inputs:
- field: feature_description
  type: string
  source: User Input
  required: true
  validation: Non-empty string describing the feature to add

- field: project_path
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path with .aios-core/

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|comprehensive

outputs:
- field: project_analysis
  type: markdown
  destination: docs/architecture/project-analysis.md
  persisted: true

- field: recommended_approach
  type: markdown
  destination: docs/architecture/recommended-approach.md
  persisted: true

- field: service_inventory
  type: array
  destination: Memory
  persisted: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Project has .aios-core/ directory
    type: pre-condition
    blocker: true
    validation: |
      Check .aios-core/ directory exists in project root
    error_message: "Pre-condition failed: Not an AIOS project (.aios-core/ not found)"

  - [ ] Project path is accessible
    type: pre-condition
    blocker: true
    validation: |
      Verify project directory exists and is readable
    error_message: "Pre-condition failed: Project path not accessible"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project analysis document generated
    type: post-condition
    blocker: true
    validation: |
      Verify docs/architecture/project-analysis.md exists and is populated
    error_message: "Post-condition failed: Project analysis not generated"

  - [ ] Recommended approach document generated
    type: post-condition
    blocker: true
    validation: |
      Verify docs/architecture/recommended-approach.md exists and is populated
    error_message: "Post-condition failed: Recommended approach not generated"

  - [ ] Service inventory captured
    type: post-condition
    blocker: false
    validation: |
      Verify at least basic project structure was analyzed
    error_message: "Warning: Service inventory may be incomplete"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure scanned
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert .aios-core/ configuration analyzed
    error_message: "Acceptance criterion not met: Project structure not scanned"

  - [ ] Service inventory complete
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert services in infrastructure/services/ listed
    error_message: "Acceptance criterion not met: Service inventory incomplete"

  - [ ] Pattern analysis performed
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert language, testing, and configuration patterns identified
    error_message: "Acceptance criterion not met: Pattern analysis not performed"

  - [ ] Recommendations generated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert recommended_approach document has service type and implementation steps
    error_message: "Acceptance criterion not met: Recommendations not generated"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** filesystem
  - **Purpose:** Read project files and directory structure

- **Tool:** glob
  - **Purpose:** Find files matching patterns

- **Tool:** grep
  - **Purpose:** Search file contents for patterns

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No .aios-core/ Directory
   - **Cause:** Not an AIOS project
   - **Resolution:** Initialize AIOS first or check directory
   - **Recovery:** Exit with clear message

2. **Error:** No Services Found
   - **Cause
```