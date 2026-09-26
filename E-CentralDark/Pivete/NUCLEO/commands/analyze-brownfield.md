# COMANDO - analyze-brownfield.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\analyze-brownfield.md
**SHA:** 56da9046b12a44e5
**Timestamp:** 2026-08-28T02:02:04.676878
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Quick scan with default recommendations
- Minimal user interaction
- **Best for:** Initial assessment, quick checks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Detailed analysis with explanation
- User confirmation on recommendations
- **Best for:** First-time brownfield integration

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full conflict analysis
- Manual review items prioritized
- **Best for:** Large existing projects, enterprise codebases

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: analyzeBrownfield()
responsible: architect (Architect)
responsible_type: Agent
atomic_layer: Analysis

inputs:
- field: targetDir
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path with existing project

- field: outputFormat
  type: string
  source: User Input
  required: false
  validation: report|json|summary

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|pre-flight

outputs:
- field: analysis
  type: BrownfieldAnalysis
  destination: Memory/Console
  persisted: false

- field: report
  type: string
  destination: Console or File
  persisted: optional

- field: recommendations
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
  - [ ] Target directory exists and contains a project
    type: pre-condition
    blocker: true
    validation: |
      Check target directory exists and has project markers (package.json, go.mod, etc.)
    error_message: "Pre-condition failed: No project found in target directory"

  - [ ] Brownfield Analyzer module is available
    type: pre-condition
    blocker: true
    validation: |
      Verify .aios-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js exists
    error_message: "Pre-condition failed: Brownfield Analyzer module not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis completed with tech stack detection
    type: post-condition
    blocker: true
    validation: |
      Verify analysis.techStack is populated
    error_message: "Post-condition failed: Tech stack detection incomplete"

  - [ ] Merge strategy determined
    type: post-condition
    blocker: true
    validation: |
      Verify analysis.mergeStrategy is set
    error_message: "Post-condition failed: Merge strategy not determined"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All project markers analyzed
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert tech stack, frameworks, standards, workflows analyzed
    error_message: "Acceptance criterion not met: Incomplete analysis"

  - [ ] Recommendations generated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert analysis.recommendations has at least one item
    error_message: "Acceptance criterion not met: No recommendations generated"

  - [ ] Conflicts identified if present
    type: acceptance-criterion
    blocker: false
    validation: |
      Assert potential conflicts flagged for review
    error_message: "Warning: Conflict detection may be incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** brownfield-analyzer
  - **Purpose:** Analyze existing project structure and standards
  - **Source:** .aios-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js

- **Tool:** mode-detector
  - **Purpose:** Collect project markers for analysis
  - **Source:** .aios-core/infrastructure/scripts/documentation-integrity/mode-detector.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** brownfield-analyzer.js
  - **Purpose:** Core analysis functions
  - **Language:** JavaScript
  - **Location:** .aios-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No Project Markers Found
   - **Cause:** Empty directory or unrecognized project type
   - **Resolution:** Check directory contains project files
   - **Recovery:** Return minimal analysis with recommendations

2. **Error:** Config Parse Error
   - **Cause:** Malformed config file (package.json, tsconfig.json, etc.)
   - **Resolution:** Skip problematic file, continue analysis
   - **Recovery:** Log warning, proceed with partial analysis

3. **Error:** Permission Denied
   - **Cause:** Cannot read certain directories
   - **Resolution:** Request elevated permissions
```