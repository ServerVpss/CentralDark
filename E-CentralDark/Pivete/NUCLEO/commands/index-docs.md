# COMANDO - index-docs.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\index-docs.md
**SHA:** 73e45d712845db09
**Timestamp:** 2026-08-28T02:02:06.404337
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
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
task: indexDocs()
responsável: Morgan (Strategist)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: source
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or URL

- campo: format
  tipo: string
  origem: User Input
  obrigatório: false
  validação: markdown|html|json

- campo: template
  tipo: string
  origem: config
  obrigatório: false
  validação: Template name

**Saída:**
- campo: generated_doc
  tipo: string
  destino: File (docs/*)
  persistido: true

- campo: metadata
  tipo: object
  destino: File (frontmatter)
  persistido: true

- campo: toc
  tipo: array
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Template exists; source data available
    tipo: pre-condition
    blocker: true
    validação: |
      Check template exists; source data available
    error_message: "Pre-condition failed: Template exists; source data available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Documentation generated; format valid; links working
    tipo: post-condition
    blocker: true
    validação: |
      Verify documentation generated; format valid; links working
    error_message: "Post-condition failed: Documentation generated; format valid; links working"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Documentation readable; examples work; links valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert documentation readable; examples work; links valid
    error_message: "Acceptance criterion not met: Documentation readable; examples work; links valid"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** markdown-renderer
  - **Purpose:** Markdown parsing and rendering
  - **Source:** npm: marked or similar

- **Tool:** template-engine
  - **Purpose:** Document template processing
  - **Source:** .aios-core/product/templates/

---

## Scripts

**Agent-specific code for this task:**

- **Script:** generate-docs.js
  - **Purpose:** Documentation generation from templates
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/generate-docs.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Template Not Found
   - **Cause:** Specified template does not exist
   - **Resolution:** Verify template path in config
   - **Recovery:** Use default template, log warning

2. **Error:** Invalid Markdown
   - **Cause:** Source contains invalid markdown syntax
   - **Resolution:** Validate markdown before processing
   - **Recovery:** Sanitize markdown, continue processing

3. **Error:** Generation Failed
   - **Cause:** Template rendering error or missing data
   - **Resolution:** Check template syntax and data availability
   - **Recovery:** Fallback to simple template, log error

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

# No checklists needed - this task maintains documentation index, validation is through file system checks
tools:
  - github-cli
---

# Index Documentation Task

## Purpose

This task maintains the integrity and completeness of the `docs/index.md` file by scanning all documentation files and ensuring they are properly indexed with descriptions. It handles both root-level documents and documents within subfolders, organizing them hierarchically.

## Task Instructions

You are now operating as a Documentation Indexer. Your goal is to ensure all documentation files are properly cataloged in the central index with proper organization for subfolders.

### Required Steps

1. First, locate and scan:

   - The `docs/` directory and all subdirectories
   - The existing `docs/index.
```