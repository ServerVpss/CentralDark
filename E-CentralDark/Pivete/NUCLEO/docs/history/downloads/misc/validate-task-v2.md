# OUTRO - validate-task-v2.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\validate-task-v2.js
**SHA:** 5beacac341075d9a
**Timestamp:** 2026-08-28T02:02:04.392721
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- const hasBlocker = content.includes('blocker:');

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Task Format V2.0 Validation Script
 * 
 * Validates task files against the V2.0 specification with 11 compliance rules.
 * 
 * Usage:
 *   node validate-task-v2.js <task-file>          # Validate single task
 *   node validate-task-v2.js --all                # Validate all tasks
 * 
 * Exit codes:
 *   0 = All tasks compliant
 *   1 = Some tasks non-compliant
 *   2 = Error during validation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * Validation rules for V2.0 compliance
 */
const validationRules = [
  {
    id: 1,
    name: 'Execution Modes section',
    check: (content) => {
      return content.includes('## Execution Modes') || 
             content.includes('# Execution Modes');
    },
    message: 'Missing "Execution Modes" section',
  },
  {
    id: 2,
    name: 'Task Definition YAML format',
    check: (content) => {
      return content.includes('task:') && 
             content.includes('responsável:') &&
             content.includes('responsavel_type:') &&
             content.includes('atomic_layer:');
    },
    message: 'Task Definition incomplete (missing task, responsável, responsavel_type, or atomic_layer)',
  },
  {
    id: 3,
    name: 'Entrada and Saída defined',
    check: (content) => {
      return content.includes('**Entrada:**') && 
             content.includes('**Saída:**');
    },
    message: 'Missing Entrada or Saída sections',
  },
  {
    id: 4,
    name: 'Checklist restructured',
    check: (content) => {
      return content.includes('pre-conditions:') && 
             content.includes('post-conditions:') &&
             content.includes('acceptance-criteria:');
    },
    message: 'Checklist not restructured (missing pre-conditions, post-conditions, or acceptance-criteria)',
  },
  {
    id: 5,
    name: 'Checklist items have required fields',
    check: (content) => {
      const hasType = content.includes('tipo:');
      const hasBlocker = content.includes('blocker:');
      const hasValidation = content.includes('validação:') || content.includes('validation:');
      return hasType && hasBlocker && hasValidation;
    },
    message: 'Checklist items missing required fields (tipo, blocker, validação)',
  },
  {
    id: 6,
    name: 'Tools section present',
    check: (content) => {
      return content.includes('## Tools') || 
             content.includes('**Tools:**') ||
             content.includes('- N/A') && content.toLowerCase().includes('tool');
    },
    message: 'Missing Tools section',
  },
  {
    id: 7,
    name: 'Scripts section present',
    check: (content) => {
      return content.includes('## Scripts') || 
             content.includes('**Scripts:**') ||
             content.includes('- N/A') && content.toLowerCase().includes('script');
    },
    message: 'Missing Scripts section',
  },
  {
    id: 8,
    name: 'Performance section present',
    check: (content) => {
      return content.includes('## Performance') ||
             content.includes('**Performance:**') ||
             (content.includes('duration_expected:') && content.includes('cost_estimated:'));
    },
    message: 'Missing Performance section or required metrics (duration_expected, cost_estimated)',
  },
  {
    id: 9,
    name: 'Error Handling section present',
    check: (content) => {
      return (content.includes('## Error Handling') || content.includes('**Error Handling:**')) &&
             (content.includes('strategy:') || content.includes('Strategy:'));
    },
    message: 'Missing Error Handling section or strategy not defined',
  },
  {
    id: 10,
    name: 'Metadata section present',
    check: (content) => {
      return (content.includes('## Metadata') || content.includes('**Metadata:**')) &&
             content.includes('story:') &&
             content.includes('version:');
    },
    message: 'Missing Metadata section or required fields (story, version)',
  },
  {
    id: 11,
    name: 'Standardized output template',
    check: (content) => {
      // Check for output template markers (less strict as this might be in separate template file)
      return content.includes('Duration:') || 
             content.includes('Tokens Used:') ||
             content.includes('Metrics') ||
             content.includes('task-execution-report');
    },
    message: 'Output template markers not found (Duration, Tokens, Metrics)',
  },
];

/**
 * Validate a single task file
 * @param {string} filePath - Path to the task file
 * @returns {Object} Validation result
 */
function validateTask(filePath) {
  const fileName = path.basename(filePath);
  const result = {
    file: fileName,
    path: filePath,
    compliant: true,
    passed: [],
    failed: [],
  };

  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Run all validation rules
    for (
```