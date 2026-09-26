# COMANDO - migrate-task-to-v2.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\migrate-task-to-v2.js
**SHA:** 50d0affb4b69de22
**Timestamp:** 2026-08-28T02:02:03.893495
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Gaps
- task: {TODO: task identifier}
- responsável: {TODO: Agent Name}
- atomic_layer: {TODO: Atom|Molecule|Organism}
- - campo: {TODO: fieldName}
- tipo: {TODO: string|number|boolean}
- origem: {TODO: User Input | config | Step X}
- validação: {TODO: validation rule}
- - campo: {TODO: fieldName}
- tipo: {TODO: type}
- destino: {TODO: output | state | Step Y}

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Task Migration Helper - V1.0 to V2.0
 * 
 * Semi-automated migration helper that adds missing V2.0 sections to tasks.
 * Requires manual review and content filling.
 * 
 * Usage:
 *   node migrate-task-to-v2.js <task-file>     # Migrate single task
 * 
 * Process:
 *   1. Reads existing task
 *   2. Identifies missing V2.0 sections
 *   3. Adds section templates with TODO markers
 *   4. Creates backup of original
 *   5. Saves migrated version
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * V2.0 Section Templates
 */
const sectionTemplates = {
  executionModes: `## Execution Modes

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

**Parameter:** \`mode\` (optional, default: \`interactive\`)

---
`,

  taskDefinition: `## Task Definition (AIOS Task Format V1.0)

\`\`\`yaml
task: {TODO: task identifier}
responsável: {TODO: Agent Name}
responsavel_type: Agente
atomic_layer: {TODO: Atom|Molecule|Organism}

**Entrada:**
- campo: {TODO: fieldName}
  tipo: {TODO: string|number|boolean}
  origem: {TODO: User Input | config | Step X}
  obrigatório: true
  validação: {TODO: validation rule}

**Saída:**
- campo: {TODO: fieldName}
  tipo: {TODO: type}
  destino: {TODO: output | state | Step Y}
  persistido: true
\`\`\`

---
`,

  preConditions: `## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

\`\`\`yaml
pre-conditions:
  - [ ] {TODO: condition description}
    tipo: pre-condition
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  postConditions: `## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

\`\`\`yaml
post-conditions:
  - [ ] {TODO: verification step}
    tipo: post-condition
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  acceptanceCriteria: `## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

\`\`\`yaml
acceptance-criteria:
  - [ ] {TODO: acceptance criterion}
    tipo: acceptance-criterion
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  tools: `## Tools

**External/shared resources used by this task:**

- **Tool:** N/A
  - **Purpose:** {TODO: what this tool does}
  - **Source:** {TODO: where to find it}

---
`,

  scripts: `## Scripts

**Agent-specific code for this task:**

- **Script:** N/A
  - **Purpose:** {TODO: what this script does}
  - **Language:** {TODO: JavaScript | Python | Bash}
  - **Location:** {TODO: file path}

---
`,

  errorHandling: `## Error Handling

**Strategy:** {TODO: Fail-fast | Graceful degradation | Retry with backoff}

**Common Errors:**

1. **Error:** {TODO: error type}
   - **Cause:** {TODO: why it happens}
   - **Resolution:** {TODO: how to fix}
   - **Recovery:** {TODO: automated recovery steps}

---
`,

  performance: `## Performance

**Expected Metrics:**

\`\`\`yaml
duration_expected: {TODO: X minutes}
cost_estimated: {TODO: $X}
token_usage: {TODO: ~X tokens}
\`\`\`

**Optimization Notes:**
- {TODO: performance tips}

---
`,

  metadata: `## Metadata

\`\`\`yaml
story: {TODO: Story ID or N/A}
version: 1.0.0
dependencies:
  - {TODO: dependency file or N/A}
tags:
  - {TODO: tag1}
  - {TODO: tag2}
updated_at: ${new Date().toISOString().split('T')[0]}
\`\`\`

---
`,
};

/**
 * Check which sections are missing in the task
 */
function analyzeMissingSections(content) {
  const checks = {
    executionModes: !content.includes('## Execution Modes') && !content.includes('# Execution Modes'),
    taskDefinition: !(content.includes('responsável:') && content.includes('atomic_layer:')),
    entrada: !content.includes('**Entrada:**'),
    saida: !content.includes('**Saída:**'),
    preConditions: !content.includes('pre-conditions:'),
    postConditions: !content.includes('post-conditions:'),
    acceptanceCriteria: !content.includes('acceptance-criteria:'),
    tools: !(content.includes('## Tools') || content.includes('**Tools:**')),
    scripts: !(content.includes('## Scripts') || content.includes('**Scripts:**')),
    errorHandling: !(content.includes('## Error Handling') && content.includes('strategy:')),
    performance: !(content.includes('d
```