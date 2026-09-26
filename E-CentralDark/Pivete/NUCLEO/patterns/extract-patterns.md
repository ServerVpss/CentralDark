# PADRAO - extract-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\extract-patterns.md
**SHA:** a5ac155636da0421
**Timestamp:** 2026-08-28T02:02:05.873146
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Files using this pattern:** authStore.ts, userStore.ts, settingsStore.ts

### Riscos
- blocker: true
- blocker: true
- blocker: false
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# Extract Patterns

## Purpose

Extract and document code patterns from the codebase. Analyzes code via AST and regex to detect common patterns used in the project, generating a `patterns.md` file that serves as a reference for agents (especially the Spec Writer) when creating new features.

## Task Definition (AIOS Task Format V1.0)

```yaml
task: extract-patterns()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Workflow

elicit: false

inputs:
  - name: subcommand
    type: enum
    required: false
    default: extract
    options: [extract, json, save, merge]
    description: Action to perform

  - name: root
    type: string
    required: false
    default: "."
    description: Project root path

  - name: output
    type: string
    required: false
    description: Custom output file path

  - name: category
    type: string
    required: false
    description: Extract only specific category (e.g., "State Management")

  - name: quiet
    type: flag
    required: false
    default: false
    description: Suppress console output

  - name: help
    type: flag
    required: false
    default: false
    description: Show usage documentation

outputs:
  - name: patterns_markdown
    type: string
    destino: File (.aios/patterns.md)
    persistido: true

  - name: patterns_json
    type: object
    destino: Console or File
    persistido: false

  - name: summary
    type: object
    destino: Console
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Project root is a valid codebase
    tipo: pre-condition
    blocker: true
    validação: Check package.json or .aios-core exists
    error_message: "Could not find project root. Run from within a project directory."

  - [ ] Code files exist
    tipo: pre-condition
    blocker: true
    validação: At least one .ts/.tsx/.js/.jsx file exists
    error_message: "No code files found to analyze."
```

---

## Implementation Steps

### Step 1: Check Help Flag
```javascript
if (args.help) {
  displayHelp();
  return;
}
```

### Step 2: Initialize Pattern Extractor
```javascript
const PatternExtractor = require('.aios-core/infrastructure/scripts/pattern-extractor');
const extractor = new PatternExtractor(args.root);
```

### Step 3: Detect Patterns
```javascript
const patterns = await extractor.detectPatterns();
```

### Step 4: Execute Subcommand

#### Extract (Default)
```javascript
if (args.subcommand === 'extract' || !args.subcommand) {
  const markdown = extractor.generateMarkdown();

  if (args.output) {
    await fs.writeFile(args.output, markdown);
    console.log(`Patterns saved to: ${args.output}`);
  } else {
    console.log(markdown);
  }
}
```

#### JSON Output
```javascript
if (args.subcommand === 'json') {
  const json = extractor.toJSON();

  if (args.output) {
    await fs.writeFile(args.output, JSON.stringify(json, null, 2));
    console.log(`JSON saved to: ${args.output}`);
  } else {
    console.log(JSON.stringify(json, null, 2));
  }
}
```

#### Save to Default Location
```javascript
if (args.subcommand === 'save') {
  const savedPath = await extractor.savePatterns(args.output);
  console.log(`Patterns saved to: ${savedPath}`);
}
```

#### Merge with Existing
```javascript
if (args.subcommand === 'merge') {
  const mergedPath = await extractor.mergeWithExisting(args.output);
  console.log(`Patterns merged and saved to: ${mergedPath}`);
}
```

---

## Help Text

```text
Usage: *extract-patterns [subcommand] [options]

Extract and document code patterns from the codebase.

Subcommands:
  extract     Extract patterns and output as markdown (default)
  json        Output patterns as JSON
  save        Save to .aios/patterns.md
  merge       Merge with existing patterns file

Options:
  --root <path>       Project root (default: current directory)
  --output <path>     Custom output file path
  --category <name>   Extract specific category only
  --quiet             Suppress console output
  --help              Show this help message

Pattern Categories:
  - State Management  (Zustand, Redux, Context)
  - API Calls         (SWR, fetch, React Query)
  - Error Handling    (try-catch, ErrorBoundary, toast)
  - Components        (memo, compound, conditional classes)
  - Hooks             (custom hooks, useEffect cleanup)
  - Data Access       (Prisma, fs.promises)
  - Testing           (Jest structure, mocks)
  - Utilities         (class-based, functional)

Examples:
  *extract-patterns                           # Output to console
  *extract-patterns save                      # Save to .aios/patterns.md
  *extract-patterns json --output p.json      # Save as JSON
  *extract-patterns --category "State"        # Only state patterns
  *extract-patterns merge                     # Update existing file

Output File:
  Default location: .aios/patterns.md
  This file is referenced by the Spec Writer for consistent patterns.
```

---

## Output Formats

### Markdown Output (Default)
```markdown
#
```