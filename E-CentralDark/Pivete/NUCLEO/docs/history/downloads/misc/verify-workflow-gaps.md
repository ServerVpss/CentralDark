# OUTRO - verify-workflow-gaps.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\verify-workflow-gaps.js
**SHA:** 57d23bfe52572c55
**Timestamp:** 2026-08-28T02:02:04.432422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = await mgr.loadState('nonexistent-instance');
- missing === null,
- const navMissing = nav.detectWorkflowStateFromFile('/nonexistent.yaml');
- navMissing === null,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Verification Script for Workflow Gap Fixes (GAP 1, 2, 3)
 *
 * Runs all verification checks and reports results.
 * Usage: node .aios-core/development/scripts/verify-workflow-gaps.js
 *
 * @version 1.0.0
 */

const fs = require('fs');
const _fsPromises = require('fs').promises; // Reserved for future async operations
const path = require('path');
const yaml = require('js-yaml');
const ROOT = path.resolve(__dirname, '..', '..', '..');

// ============ Test Infrastructure ============

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, reason) {
  totalTests++;
  failedTests++;
  failures.push({ name, reason });
  console.log(`  [FAIL] ${name}`);
  console.log(`         Reason: ${reason}`);
}

function assert(condition, name, reason) {
  if (condition) {
    pass(name);
  } else {
    fail(name, reason || 'Assertion failed');
  }
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// ============ GAP 1: Context Targeting ============

function verifyGap1() {
  section('GAP 1: Context Targeting');

  // 1.1 create-workflow.md has target_context and squad_name
  const createWf = fs.readFileSync(path.join(ROOT, '.aios-core/development/tasks/create-workflow.md'), 'utf-8');
  assert(
    createWf.includes('campo: target_context'),
    '1.1a create-workflow.md has target_context field',
    'Missing "campo: target_context" in Entrada',
  );
  assert(
    createWf.includes('campo: squad_name'),
    '1.1b create-workflow.md has squad_name field',
    'Missing "campo: squad_name" in Entrada',
  );
  assert(
    createWf.includes('target_context="squad"'),
    '1.1c create-workflow.md has squad pre-condition',
    'Missing squad existence pre-condition',
  );
  assert(
    createWf.includes('squads/{squad_name}/workflows/'),
    '1.1d create-workflow.md has squad path resolution',
    'Missing squad path in step 4',
  );
  assert(
    createWf.includes('Update Squad Manifest'),
    '1.1e create-workflow.md has step 4.5',
    'Missing step 4.5 for squad manifest update',
  );

  // 1.2 modify-workflow.md
  const modifyWf = fs.readFileSync(path.join(ROOT, '.aios-core/development/tasks/modify-workflow.md'), 'utf-8');
  assert(
    modifyWf.includes('campo: target_context'),
    '1.2a modify-workflow.md has target_context field',
    'Missing "campo: target_context" in Entrada',
  );
  assert(
    modifyWf.includes('campo: squad_name'),
    '1.2b modify-workflow.md has squad_name field',
    'Missing "campo: squad_name" in Entrada',
  );
  assert(
    modifyWf.includes('Resolve workflow path based on target_context'),
    '1.2c modify-workflow.md has conditional path resolution',
    'Missing path resolution in step 1',
  );

  // 1.3 workflow-elicitation.js
  const steps = require('../../../.aios-core/core/elicitation/workflow-elicitation.js');
  const firstStep = steps[0];
  assert(
    firstStep.title === 'Target Context',
    '1.3a Elicitation first step is Target Context',
    `First step title is "${firstStep.title}" instead of "Target Context"`,
  );

  const targetContextQ = firstStep.questions.find((q) => q.name === 'targetContext');
  assert(
    !!targetContextQ,
    '1.3b Elicitation has targetContext question',
    'Missing targetContext question',
  );
  assert(
    targetContextQ && targetContextQ.choices.length === 3,
    '1.3c targetContext has 3 choices (core/squad/hybrid)',
    'Expected 3 choices',
  );

  const squadNameQ = firstStep.questions.find((q) => q.name === 'squadName');
  assert(
    !!squadNameQ,
    '1.3d Elicitation has squadName question',
    'Missing squadName question',
  );
  assert(
    squadNameQ && typeof squadNameQ.when === 'function',
    '1.3e squadName has conditional when function',
    'Missing when condition',
  );
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'squad' }) === true,
    '1.3f squadName shows when targetContext=squad',
    'when() should return true for squad',
  );
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'core' }) === false,
    '1.3g squadName hidden when targetContext=core',
    'when() should return false for core',
  );
  assert(
    squadNameQ && squadNameQ.validate('my-squad') === true,
    '1.3h squadName accepts valid kebab-case',
    'Should accept "my-squad"',
  );
  assert(
    squadNameQ && squadNameQ.validate('INVALID') !== true,
    '1.3i squadName rejects non-kebab-case',
    'Should reject "INVALID"',
  );

  // 1.4 workflow-template.yaml
  const template = fs.readFileSync(path.join(ROOT, '.aios-core/product/templates/workflow-template.yaml'), 'utf-8');
  assert(
    template.includes('{{TARGET_CONTEXT}}'),
    '1.4a Template has TARGET_CONTEXT variable',
    'Missing {{TARGET_CONTEXT}}',
  );
  assert(
    template.includes('{{SQUAD_NAME}}'),
    '1.4b Template
```