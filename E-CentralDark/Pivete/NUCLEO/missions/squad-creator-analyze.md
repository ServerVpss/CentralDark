# MISSAO - squad-creator-analyze.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\squad-creator-analyze.md
**SHA:** 5e1c24c1474e77a5
**Timestamp:** 2026-08-28T02:02:09.098919
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
---
task: analyzeSquad()
responsavel: "@squad-creator"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: squad_name
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Squad must exist in ./squads/ directory

  - campo: output_format
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "console | markdown | json (default: console)"

  - campo: verbose
    tipo: boolean
    origem: User Input
    obrigatorio: false
    validacao: "Include file details (default: false)"

  - campo: suggestions
    tipo: boolean
    origem: User Input
    obrigatorio: false
    validacao: "Include improvement suggestions (default: true)"

Saida:
  - campo: analysis_report
    tipo: object
    destino: Console or file
    persistido: false

  - campo: component_inventory
    tipo: object
    destino: Return value
    persistido: false

  - campo: coverage_metrics
    tipo: object
    destino: Return value
    persistido: false

  - campo: suggestions
    tipo: array
    destino: Return value
    persistido: false

Checklist:
  - "[ ] Validate squad exists"
  - "[ ] Load squad.yaml manifest"
  - "[ ] Inventory components by type"
  - "[ ] Calculate coverage metrics"
  - "[ ] Generate improvement suggestions"
  - "[ ] Format and display report"
---

# Analyze Squad Task

## Purpose

Analyze an existing squad's structure, components, and coverage to provide insights and improvement suggestions. This task enables developers to understand what a squad contains and identify opportunities for enhancement.

## Story Reference

- **Story:** SQS-11 - Squad Analyze & Extend
- **Epic:** SQS - Squad System Enhancement

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Squad exists in ./squads/ directory
    tipo: pre-condition
    blocker: true
    validacao: |
      Check if squad directory exists with valid manifest
    error_message: "Squad not found. Use *list-squads to see available squads."
```

## Elicitation Flow

```
@squad-creator

*analyze-squad

? Squad name: _________________
  (Tab to autocomplete from available squads)

? Output format:
  > 1. console (default) - Display in terminal
    2. markdown - Save to file
    3. json - Machine readable

? Include suggestions? (Y/n): Y

Analyzing squad...
```

## Execution Steps

### Step 1: Validate Squad Exists

```javascript
const { SquadLoader } = require('../scripts/squad/squad-loader');
const loader = new SquadLoader();

const squadPath = path.join('./squads', squadName);
const exists = await loader.squadExists(squadName);

if (!exists) {
  throw new Error(`Squad "${squadName}" not found. Use *list-squads to see available squads.`);
}
```

### Step 2: Load Squad Manifest

```javascript
const manifest = await loader.loadManifest(squadName);

// Extract overview
const overview = {
  name: manifest.name,
  version: manifest.version,
  author: manifest.author,
  license: manifest.license,
  aiosMinVersion: manifest.aios?.minVersion || 'N/A',
  description: manifest.description
};
```

### Step 3: Inventory Components

```javascript
const { SquadAnalyzer } = require('../scripts/squad/squad-analyzer');
const analyzer = new SquadAnalyzer();

const inventory = await analyzer.inventoryComponents(squadPath);

// Expected structure:
// {
//   agents: ['lead-agent.md', 'helper-agent.md'],
//   tasks: ['lead-agent-task1.md', 'lead-agent-task2.md'],
//   workflows: [],
//   checklists: [],
//   templates: ['report-template.md'],
//   tools: [],
//   scripts: [],
//   data: []
// }
```

### Step 4: Calculate Coverage Metrics

```javascript
const coverage = analyzer.calculateCoverage(inventory, manifest);

// Expected structure:
// {
//   agents: { total: 2, withTasks: 2, percentage: 100 },
//   tasks: { total: 3, percentage: 75 },
//   config: { hasReadme: true, hasTechStack: false, percentage: 60 },
//   directories: { populated: 3, empty: 5, percentage: 37.5 }
// }
```

### Step 5: Generate Suggestions

```javascript
const suggestions = analyzer.generateSuggestions(inventory, coverage);

// Expected structure:
// [
//   { priority: 'high', message: 'Add tasks for helper-agent (currently has only 1)' },
//   { priority: 'medium', message: 'Create workflows for common sequences' },
//   { priority: 'low', message: 'Add checklists for validation' }
// ]
```

### Step 6: Format and Display Report

```javascript
const report = analyzer.formatReport({
  overview,
  inventory,
  coverage,
  suggestions
}, outputFormat);

if (outputFormat === 'console') {
  console.log(report);
} else if (outputFormat === 'markdown') {
  const outputPath = path.join(squadPath, 'ANALYSIS.md');
  await fs.writeFile(outputPath, report);
  console.log(`Analysis saved to: ${outputPath}`);
} else if (outputFormat === 'json') {
  console.log(JSON.stringify({ overview, inventory, coverage, suggestions }, null, 2));
}
```

## Output Format (Console)

```
=== Squad Analysis: {squad-name} ===

Overview
  Name: {name}
  Version: {version}
  Author: {au
```