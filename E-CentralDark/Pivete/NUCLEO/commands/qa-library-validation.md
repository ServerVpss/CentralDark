# COMANDO - qa-library-validation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-library-validation.md
**SHA:** 9ba60c41af7efbc8
**Timestamp:** 2026-08-28T02:02:08.344865
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Library Validation Task

Validate third-party library usage against official documentation using Context7.

**Absorbed from:** Auto-Claude PR Review Phase 6.0

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous validation with logging
- Minimal user interaction
- **Best for:** CI/CD integration, automated pipelines

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations of findings
- **Best for:** Learning, understanding library issues

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full library inventory before validation
- Zero ambiguity execution
- **Best for:** Large PRs with many dependencies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaLibraryValidation()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: file_paths
  tipo: array
  origem: git diff or explicit list
  obrigatorio: false
  validacao: If empty, extracts from uncommitted changes

- campo: skip_stdlib
  tipo: boolean
  origem: config
  obrigatorio: false
  validacao: Default true (skip Node.js/Python stdlib)

**Saida:**
- campo: validation_report
  tipo: object
  destino: Return value
  persistido: false

- campo: issues_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/library_validation.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Context7 MCP is available
    tipo: pre-condition
    blocker: true
    validacao: |
      Test: mcp__context7__resolve-library-id with test query
    error_message: "Pre-condition failed: Context7 MCP not available."

  - [ ] Modified files exist (git diff or explicit)
    tipo: pre-condition
    blocker: true
    validacao: |
      At least one file to analyze
    error_message: "Pre-condition failed: No files to validate."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation report generated
    tipo: post-condition
    blocker: true
    validacao: |
      library_validation.json exists with results
    error_message: "Post-condition failed: Validation report not generated."

  - [ ] All imports processed
    tipo: post-condition
    blocker: false
    validacao: |
      processed_count >= imports_found
    error_message: "Warning: Some imports were not processed."
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Each library validated against Context7 docs
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      For each import: resolve-library-id + query-docs executed
    error_message: "Acceptance criterion not met: Libraries not validated."

  - [ ] API usage verified for correctness
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Function signatures, parameters, return types checked
    error_message: "Acceptance criterion not met: API usage not verified."

  - [ ] Deprecated methods flagged
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Deprecated APIs identified and reported
    error_message: "Acceptance criterion not met: Deprecated methods not checked."
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** Context7 MCP
  - **Purpose:** Resolve library IDs and query documentation
  - **Source:** mcp**context7**resolve-library-id, mcp**context7**query-docs

- **Tool:** Grep
  - **Purpose:** Extract imports from source files
  - **Source:** Native Claude Code tool

- **Tool:** Read
  - **Purpose:** Read source files for analysis
  - **Source:** Native Claude Code tool

---

## Error Handling

**Strategy:** continue-on-error (log and continue)

**Common Errors:**

1. **Error:** Library Not Found in Context7
   - **Cause:** Uncommon or private library
   - **Resolution:** Log as "unvalidated", continue
   - **Recovery:** Manual review recommended

2. **Error:** Context7 Rate Limit
   - **Cause:** Too many requests
   - **Resolution:** Batch requests, add delay
   - **Recovery:** Retry with exponential backoff

3. **Error:** Import Parse Failure
   - **Cause:** Complex import syntax
   - **Resolution:** Log and skip
   - **Recovery:** Manual inspection

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (depends on import count)
cost_estimated: $0.01-0.05 (Context7 queries)
token_usage: ~2,000-5,000 tokens
```

**Optimization Notes:**

- Batch similar libraries

```