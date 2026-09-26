# COMANDO - engine.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\engine.test.js
**SHA:** 57564b8a94b7f512
**Timestamp:** 2026-08-28T02:19:43.535551
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- metrics.totalStart = 1000;
- // First call: totalStart = 1000

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SynapseEngine + PipelineMetrics Tests
 *
 * Tests for the 8-layer pipeline orchestrator, bracket-aware filtering,
 * fallback strategies, pipeline timeout, and PipelineMetrics class.
 *
 * @module tests/synapse/engine
 * @story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

jest.setTimeout(30000);

// ---------------------------------------------------------------------------
// Mocks — must be set BEFORE require
// ---------------------------------------------------------------------------

// Mock context-tracker (SYN-3)
jest.mock('../../.aios-core/core/synapse/context/context-tracker', () => ({
  estimateContextPercent: jest.fn(() => 85),
  calculateBracket: jest.fn(() => 'FRESH'),
  getActiveLayers: jest.fn(() => ({ layers: [0, 1, 2, 7], memoryHints: false, handoffWarning: false })),
  getTokenBudget: jest.fn(() => 800),
  needsMemoryHints: jest.fn(() => false),
  needsHandoffWarning: jest.fn(() => false),
}));

// Mock formatter
jest.mock('../../.aios-core/core/synapse/output/formatter', () => ({
  formatSynapseRules: jest.fn(() => '<synapse-rules>\nmocked\n</synapse-rules>'),
}));

// Mock layer modules — provide fake layer classes
const mockLayerModules = {};

jest.mock('../../.aios-core/core/synapse/layers/l0-constitution', () => {
  const cls = class MockL0 {
    constructor() { this.name = 'constitution'; this.layer = 0; this.timeout = 5; }
    _safeProcess(ctx) { return { rules: ['ART.I: CLI First'], metadata: { layer: 0, source: 'constitution' } }; }
  };
  mockLayerModules.L0 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l1-global', () => {
  const cls = class MockL1 {
    constructor() { this.name = 'global'; this.layer = 1; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Global rule 1'], metadata: { layer: 1, source: 'global' } }; }
  };
  mockLayerModules.L1 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l2-agent', () => {
  const cls = class MockL2 {
    constructor() { this.name = 'agent'; this.layer = 2; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Agent rule 1'], metadata: { layer: 2, source: 'agent' } }; }
  };
  mockLayerModules.L2 = cls;
  return cls;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l3-workflow', () => {
  const cls = class MockL3 {
    constructor() { this.name = 'workflow'; this.layer = 3; this.timeout = 10; }
    _safeProcess(ctx) { return { rules: ['Workflow rule 1'], metadata: { layer: 3, source: 'workflow' } }; }
  };
  mockLayerModules.L3 = cls;
  return cls;
}, { virtual: true });

// L4-L7: simulate missing modules (MODULE_NOT_FOUND with proper code)
jest.mock('../../.aios-core/core/synapse/layers/l4-task', () => {
  const err = new Error("Cannot find module './layers/l4-task'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l5-squad', () => {
  const err = new Error("Cannot find module './layers/l5-squad'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l6-keyword', () => {
  const err = new Error("Cannot find module './layers/l6-keyword'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

jest.mock('../../.aios-core/core/synapse/layers/l7-star-command', () => {
  const err = new Error("Cannot find module './layers/l7-star-command'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}, { virtual: true });

// Mock memory bridge (SYN-10)
const mockGetMemoryHints = jest.fn(() => Promise.resolve([]));
jest.mock('../../.aios-core/core/synapse/memory/memory-bridge', () => ({
  MemoryBridge: jest.fn().mockImplementation(() => ({
    getMemoryHints: mockGetMemoryHints,
    clearCache: jest.fn(),
    _reset: jest.fn(),
  })),
  BRACKET_LAYER_MAP: { FRESH: { layer: 0, maxTokens: 0 }, MODERATE: { layer: 1, maxTokens: 50 } },
  BRIDGE_TIMEOUT_MS: 15,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

const { SynapseEngine, PipelineMetrics, PIPELINE_TIMEOUT_MS } = require('../../.aios-core/core/synapse/engine');
const contextTracker = require('../../.aios-core/core/synapse/context/context-tracker');
const formatter = require('../../.aios-core/core/synapse/output/formatter');

// =============================================================================
// PipelineMetrics
// =============================================================================

describe('PipelineMetrics', () => {
  let metrics;

  beforeEach(() => {
    metrics = new PipelineMetrics();
  });

  test('should initialize with empty state', () => {
    expect(metrics.layers).toEqual({});
    expect(metrics.totalStart).toBeNull();
    expect(metrics.totalEnd).toBeNull();
  });

  test('startLayer() should record start time and running sta
```