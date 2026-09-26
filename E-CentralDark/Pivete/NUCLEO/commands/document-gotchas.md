# COMANDO - document-gotchas.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\document-gotchas.md
**SHA:** 23620283f08576d0
**Timestamp:** 2026-08-28T02:02:05.922241
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = `

### Riscos
- blocker: false
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Document Gotchas Task

## Purpose

Extract and consolidate gotchas from session insights into a searchable knowledge base. Triggered automatically after session-insights capture or manually via `*list-gotchas`.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: documentGotchas()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Service

**Entrada:**
- campo: command
  tipo: string
  origem: User Input
  obrigatório: false
  validação: update|list|search|category
  default: update

- campo: query
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Free text for search/category

- campo: severity
  tipo: string
  origem: User Input
  obrigatório: false
  validação: high|medium|low

- campo: format
  tipo: string
  origem: User Input
  obrigatório: false
  validação: md|json
  default: md

**Saída:**
- campo: gotchas_file
  tipo: string
  destino: .aios/gotchas.md
  persistido: true

- campo: gotchas_json
  tipo: string
  destino: .aios/gotchas.json
  persistido: true

- campo: statistics
  tipo: object
  destino: Console
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Project has .aios directory initialized
    tipo: pre-condition
    blocker: false
    validação: |
      Check if .aios/ directory exists, create if not
    error_message: "Creating .aios/ directory"

  - [ ] Node.js available for script execution
    tipo: pre-condition
    blocker: true
    validação: |
      Check node --version returns valid version
    error_message: "Node.js required for gotchas-documenter.js"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] gotchas.md file generated/updated
    tipo: post-condition
    blocker: true
    validação: |
      Check .aios/gotchas.md exists and has content
    error_message: "Failed to generate gotchas.md"

  - [ ] gotchas.json schema valid
    tipo: post-condition
    blocker: false
    validação: |
      Validate .aios/gotchas.json against schema
    error_message: "gotchas.json schema validation failed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Gotchas extracted from session insights (AC1)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      At least one insights file scanned

  - [ ] gotchas.md generated with proper format (AC2, AC3)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      File contains Wrong/Right/Reason format

  - [ ] Gotchas categorized by area (AC4)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Categories present in output
```

---

## Workflow

### Command: `*list-gotchas` (AC7)

**Alias for**: `*document-gotchas list`

**Quick reference for all gotchas with optional filtering.**

### Command: `*document-gotchas [command] [options]`

**Available Commands:**

1. **update** (default)
   - Scans all session insights files
   - Extracts gotchas from `gotchasFound`, `discoveries`, `patternsLearned`
   - Deduplicates based on content similarity
   - Categorizes by area
   - Merges with existing gotchas
   - Generates `.aios/gotchas.md` and `.aios/gotchas.json`

2. **list**
   - Lists all gotchas
   - Options: `--severity high|medium|low`, `--format md|json`

3. **search \<query\>**
   - Searches gotchas by keyword
   - Searches in title, wrong, right, reason fields

4. **category \<name\>**
   - Lists gotchas by category
   - Categories: State Management, API, Database, Frontend/React, Testing, Build/Deploy, TypeScript, Authentication, Performance, Security, Other

---

## Execution Steps

### 1. Initialize

```javascript
const { GotchasDocumenter } = require('.aios-core/infrastructure/scripts/gotchas-documenter');

const documenter = new GotchasDocumenter(rootPath, {
  outputPath: '.aios/gotchas.md',
  quiet: false
});
```

### 2. Load Existing (if update)

```javascript
// Merge with existing gotchas to preserve manually added ones
documenter.mergeWithExisting('.aios/gotchas.json');
```

### 3. Scan Insights Files

```javascript
// Scans:
// - docs/stories/**/insights/*.json
// - docs/stories/**/session-*.json
// - .aios/insights/*.json
await documenter.scanInsightsFiles();
```

### 4. Process and Deduplicate

```javascript
// Remove duplicates based on content similarity
documenter.deduplicateGotchas();

// Categorize by area
documenter.categorizeGotchas();
```

### 5. Generate Output

```javascript
// Save markdown and JSON
const outputPath = documenter.saveGotchas();

// Display statistics
const stats = documenter.stats;
console.log(`Total: ${documenter.gotchas.size} gotchas`);
console.log(`Categories: ${stats.categoriesFound}`);
console.log(`Duplicates merged: ${stats.gotchasDeduplicated}`);
```

---

## Integration Points

### 1. Session Insight
```