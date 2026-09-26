# COMANDO - full-pipeline.e2e.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\e2e\full-pipeline.e2e.test.js
**SHA:** b2c3236e8d205572
**Timestamp:** 2026-08-28T02:19:43.485240
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = 'Create the notification service';

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SYNAPSE E2E: Full Pipeline
 *
 * End-to-end tests for the SYNAPSE context engine pipeline.
 * Uses REAL .synapse/ files at project root — no mocks.
 *
 * @module tests/synapse/e2e/full-pipeline.e2e.test
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SYNAPSE_PATH = path.join(PROJECT_ROOT, '.synapse');
const MANIFEST_PATH = path.join(SYNAPSE_PATH, 'manifest');

// Guard: skip entire suite if .synapse/ is missing
const synapseExists = fs.existsSync(SYNAPSE_PATH) && fs.existsSync(MANIFEST_PATH);

const { SynapseEngine } = require(path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'engine.js'));
const { parseManifest } = require(path.join(PROJECT_ROOT, '.aios-core', 'core', 'synapse', 'domain', 'domain-loader.js'));

/**
 * Build a default session object for testing.
 *
 * @param {object} [overrides] - Fields to override
 * @returns {object} Session object matching SYN-2 schema
 */
function buildSession(overrides = {}) {
  return {
    prompt_count: 5,
    active_agent: { id: 'dev', activated_at: new Date().toISOString() },
    active_workflow: null,
    active_squad: null,
    active_task: null,
    context: {
      last_bracket: 'FRESH',
      last_tokens_used: 0,
      last_context_percent: 96,
    },
    ...overrides,
  };
}

const describeIfSynapse = synapseExists ? describe : describe.skip;

describeIfSynapse('SYNAPSE E2E: Full Pipeline', () => {
  /** @type {object} */
  let manifest;

  /** @type {SynapseEngine} */
  let engine;

  /** @type {SynapseEngine} */
  let engineDevmode;

  beforeAll(() => {
    manifest = parseManifest(MANIFEST_PATH);

    engine = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: false,
    });

    engineDevmode = new SynapseEngine(SYNAPSE_PATH, {
      manifest,
      devmode: true,
    });
  });

  // -----------------------------------------------------------------------
  // 1. Engine processes prompt and returns xml string
  // -----------------------------------------------------------------------
  test('processes a prompt and returns an object with xml string and metrics', async () => {
    const session = buildSession();
    const result = await engine.process('Implement the login feature', session);

    expect(result).toBeDefined();
    expect(typeof result.xml).toBe('string');
    expect(result.xml.length).toBeGreaterThan(0);
    expect(result.metrics).toBeDefined();
    expect(typeof result.metrics).toBe('object');
  });

  // -----------------------------------------------------------------------
  // 2. XML contains <synapse-rules> wrapper tags
  // -----------------------------------------------------------------------
  test('XML output is wrapped in <synapse-rules> tags', async () => {
    const session = buildSession();
    const { xml } = await engine.process('Build the dashboard component', session);

    expect(xml).toMatch(/^<synapse-rules>/);
    expect(xml).toMatch(/<\/synapse-rules>$/);
  });

  // -----------------------------------------------------------------------
  // 3. XML contains CONTEXT BRACKET section
  // -----------------------------------------------------------------------
  test('XML contains CONTEXT BRACKET section with bracket name and percentage', async () => {
    const session = buildSession({ prompt_count: 5 });
    const { xml } = await engine.process('Create a new service', session);

    expect(xml).toContain('[CONTEXT BRACKET]');
    expect(xml).toContain('CONTEXT BRACKET:');
    // With prompt_count=5, contextPercent = 100 - (5*1500/200000*100) = 96.25 -> FRESH
    expect(xml).toContain('[FRESH]');
  });

  // -----------------------------------------------------------------------
  // 4. XML contains CONSTITUTION section (NON-NEGOTIABLE)
  // -----------------------------------------------------------------------
  test('XML contains CONSTITUTION section marked as NON-NEGOTIABLE', async () => {
    const session = buildSession();
    const { xml } = await engine.process('Refactor the auth module', session);

    // The constitution layer is ALWAYS_ON and NON_NEGOTIABLE per manifest
    expect(xml).toContain('[CONSTITUTION]');
    expect(xml).toContain('NON-NEGOTIABLE');
  });

  // -----------------------------------------------------------------------
  // 5. Metrics contains expected structure
  // -----------------------------------------------------------------------
  test('metrics object contains total_ms, layers_loaded, total_rules, and per_layer', async () => {
    const session = buildSession();
    const { metrics } = await engine.process('Add unit tests', session);

    expect(metrics).toHaveProperty('total_ms');
    expect(typeof metrics.total_ms).toBe('number');
    expect(metrics.total_ms).toBeGreaterThanOrEqual(0);

    expect(metrics).toHaveProperty('layers_loaded');
    expect(typeof metrics.layers_loaded).toBe('number');

    expect(metrics).toHaveProperty('layers_skipped');
    expect(typeof
```