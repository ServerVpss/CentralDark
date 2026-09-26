# COMANDO - qa-create-fix-request.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-create-fix-request.md
**SHA:** 8ee4f0fbd4b00a6b
**Timestamp:** 2026-08-28T02:02:07.338982
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Create Fix Request Task

Generate a structured fix request document (`QA_FIX_REQUEST.md`) for @dev based on QA review findings.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaCreateFixRequest()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: severity_filter
  tipo: array
  origem: config
  obrigatorio: false
  validacao: Default ["CRITICAL", "MAJOR"]

- campo: include_minor
  tipo: boolean
  origem: User Input
  obrigatorio: false
  validacao: Default false

**Saida:**
- campo: fix_request_path
  tipo: string
  destino: Return value
  persistido: false

- campo: issues_count
  tipo: number
  destino: Memory
  persistido: false

- campo: fix_request_file
  tipo: file
  destino: docs/stories/{story-id}/qa/QA_FIX_REQUEST.md
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] QA report exists for the story
    tipo: pre-condition
    blocker: true
    validacao: |
      Check docs/stories/{story-id}/qa/qa_report.md exists
    error_message: "Pre-condition failed: QA report not found. Run *review {story-id} first."

  - [ ] Story is in Review or Rejected status
    tipo: pre-condition
    blocker: false
    validacao: |
      Story should be in Review status for fix request
    error_message: "Warning: Story may not need fix request if not in Review status."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] QA_FIX_REQUEST.md created with all issues
    tipo: post-condition
    blocker: true
    validacao: |
      Verify file created at docs/stories/{story-id}/qa/QA_FIX_REQUEST.md
    error_message: "Post-condition failed: QA_FIX_REQUEST.md was not created."

  - [ ] All CRITICAL and MAJOR issues included
    tipo: post-condition
    blocker: true
    validacao: |
      Verify issue count matches source report
    error_message: "Post-condition failed: Not all issues were included in fix request."
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Fix request generated with proper structure
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert fix request follows template structure
    error_message: "Acceptance criterion not met: Fix request structure invalid."

  - [ ] Each issue has location, problem, expected, verification
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert all required fields present for each issue
    error_message: "Acceptance criterion not met: Missing required issue fields."

  - [ ] Constraints section included
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert constraints checklist present
    error_message: "Acceptance criterion not met: Constraints section missing."
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-reader
  - **Purpose:** Read qa_report.md source file
  - **Source:** Native file system

- **Tool:** markdown-parser
  - **Purpose:** Parse QA report structure
  - **Source:** Native markdown processing

---

## Scripts

**Agent-specific code for this task:**

- **Script:** parse-qa-report.js
  - **Purpose:** Extract issues from QA report
  - **Language:** JavaScript
  - **Location:** .aios-core/development/scripts/parse-qa-report.js (optional)

---

## Error Handling

**Strategy:** fail-fast

**Common Errors:**

1. **Error:** QA Report Not Found
   - **Cause:** Story has not been reviewed yet
   - **Resolution:** Run \*review {story-id} first
   - **Recovery:** Provide clear instruction to user

2. **Error:** No Issues to Report
   - **Cause:** QA report shows all PASS
   - **Resolution:** No fix request needed
   - **Recovery:** Inform user story is ready for merge

3. **Error:** Invalid QA Report Format
   - **Cause:** QA report doesn't follow expected structure
   - **Resolution:** Re-run QA review
   - **Recovery:** List expected sections

---

## Performance

**Expected Metrics:**

```yaml
duration_expected:
```