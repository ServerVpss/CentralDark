# OUTRO - validate-registry.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\registry\validate-registry.js
**SHA:** 48f2408386a565e9
**Timestamp:** 2026-08-28T02:02:00.803444
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Gaps
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Service Registry Validator
 *
 * Validates the service registry against schema and checks file paths.
 * Runs smoke tests REG-01 to REG-06.
 *
 * @module validate-registry
 * @version 1.0.0
 * @created Story 2.6 - Service Registry Creation
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Smoke test definitions
 */
const SMOKE_TESTS = {
  'REG-01': {
    name: 'Registry Loads',
    description: 'Registry file loads without errors',
    priority: 'P0',
    test: async (ctx) => {
      try {
        JSON.parse(ctx.registryContent);
        return { passed: true };
      } catch (error) {
        return { passed: false, error: `JSON parse failed: ${error.message}` };
      }
    },
  },
  'REG-02': {
    name: 'Schema Valid',
    description: 'Registry validates against schema',
    priority: 'P0',
    test: async (ctx) => {
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(ctx.schema);
      const valid = validate(ctx.registry);
      if (!valid) {
        return {
          passed: false,
          error: 'Schema validation failed',
          details: validate.errors.slice(0, 5),
        };
      }
      return { passed: true };
    },
  },
  'REG-03': {
    name: 'Worker Count',
    description: 'Registry has 97+ workers',
    priority: 'P0',
    test: async (ctx) => {
      const count = ctx.registry.workers?.length || 0;
      if (count >= 97) {
        return { passed: true, details: `Found ${count} workers` };
      }
      return {
        passed: false,
        error: `Expected 97+ workers, found ${count}`,
      };
    },
  },
  'REG-04': {
    name: 'Paths Exist',
    description: 'All worker paths point to existing files',
    priority: 'P1',
    test: async (ctx) => {
      const missing = [];
      for (const worker of ctx.registry.workers || []) {
        const fullPath = path.join(ctx.baseDir, worker.path);
        try {
          await fs.access(fullPath);
        } catch {
          missing.push({ id: worker.id, path: worker.path });
        }
      }
      if (missing.length === 0) {
        return { passed: true };
      }
      return {
        passed: false,
        error: `${missing.length} paths not found`,
        details: missing.slice(0, 10),
      };
    },
  },
  'REG-05': {
    name: 'IDs Unique',
    description: 'All worker IDs are unique',
    priority: 'P1',
    test: async (ctx) => {
      const ids = ctx.registry.workers?.map(w => w.id) || [];
      const seen = new Set();
      const duplicates = [];
      for (const id of ids) {
        if (seen.has(id)) {
          duplicates.push(id);
        }
        seen.add(id);
      }
      if (duplicates.length === 0) {
        return { passed: true };
      }
      return {
        passed: false,
        error: `${duplicates.length} duplicate IDs found`,
        details: duplicates,
      };
    },
  },
  'REG-06': {
    name: 'Load Performance',
    description: 'Registry loads in < 500ms',
    priority: 'P1',
    test: async (ctx) => {
      const start = Date.now();
      JSON.parse(ctx.registryContent);
      const loadTime = Date.now() - start;
      if (loadTime < 500) {
        return { passed: true, details: `Load time: ${loadTime}ms` };
      }
      return {
        passed: false,
        error: `Load time ${loadTime}ms exceeds 500ms limit`,
      };
    },
  },
};

/**
 * Run all smoke tests
 */
async function runSmokeTests(registryPath, schemaPath, baseDir) {
  console.log('Running Registry Smoke Tests');
  console.log('='.repeat(50));

  // Load registry content
  let registryContent, registry, schema;
  try {
    registryContent = await fs.readFile(registryPath, 'utf8');
    registry = JSON.parse(registryContent);
    schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load files:', error.message);
    return { allPassed: false, p0Failed: true, results: {} };
  }

  const ctx = { registryContent, registry, schema, baseDir };
  const results = {};
  let p0Failed = false;
  let p1Failed = false;

  for (const [testId, testDef] of Object.entries(SMOKE_TESTS)) {
    console.log(`\n[${testId}] ${testDef.name} (${testDef.priority})`);
    console.log(`  ${testDef.description}`);

    try {
      const result = await testDef.test(ctx);
      results[testId] = {
        ...testDef,
        ...result,
      };

      if (result.passed) {
        console.log('  Result: PASSED');
        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details)}`);
        }
      } else {
        console.log('  Result: FAILED');
        console.log(`  Error: ${result.error}`);
        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details).slice(0, 200)}`);
        }

        if (testDef.priority === 'P0') {
          p0Failed = true;
        } else 
```