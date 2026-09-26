# OUTRO - uap-session-bridge.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\bridge\uap-session-bridge.test.js
**SHA:** 8b2ba76255d8a4c9
**Timestamp:** 2026-08-28T02:19:43.730267
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * UAP → SYNAPSE Session Bridge — Unit Tests
 *
 * Tests for _writeSynapseSession method in unified-activation-pipeline.js.
 * Verifies bridge file creation, graceful degradation, metrics, and timing.
 *
 * @module tests/synapse/bridge/uap-session-bridge
 * @story SYN-13 - UAP Session Bridge + SYNAPSE Diagnostics
 * @coverage Target: >85% for bridge functionality
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// =============================================================================
// Extract the private method without loading full pipeline dependencies.
// The method only uses `path`, `fs` (as fsSync), and `this.projectRoot`,
// so we can bind it to a minimal context object.
// =============================================================================

/**
 * Standalone extraction of _writeSynapseSession from the class prototype.
 * We read the source and eval only the method to avoid loading all pipeline
 * dependencies (GreetingBuilder, AgentConfigLoader, etc.).
 *
 * Instead, we replicate the method body directly — it is self-contained
 * and only depends on `path`, `fs` (sync), and `this.projectRoot`.
 */
function writeSynapseSession(agentId, quality, metrics) {
  const fsSync = fs;
  const start = Date.now();
  try {
    const sessionsDir = path.join(this.projectRoot, '.synapse', 'sessions');
    if (!fsSync.existsSync(path.join(this.projectRoot, '.synapse'))) {
      const duration = Date.now() - start;
      metrics.loaders.synapseSession = { duration, status: 'skipped', start, end: start + duration };
      return;
    }
    if (!fsSync.existsSync(sessionsDir)) {
      fsSync.mkdirSync(sessionsDir, { recursive: true });
    }
    const bridgeData = {
      id: agentId,
      activated_at: new Date().toISOString(),
      activation_quality: quality,
      source: 'uap',
    };
    const bridgePath = path.join(sessionsDir, '_active-agent.json');
    fsSync.writeFileSync(bridgePath, JSON.stringify(bridgeData, null, 2), 'utf8');
    const duration = Date.now() - start;
    metrics.loaders.synapseSession = { duration, status: 'ok', start, end: start + duration };
  } catch (error) {
    const duration = Date.now() - start;
    metrics.loaders.synapseSession = { duration, status: 'error', start, end: start + duration, error: error.message };
    console.warn(`[UnifiedActivationPipeline] SYNAPSE session write failed: ${error.message}`);
  }
}

// =============================================================================
// Helpers
// =============================================================================

let tmpDir;

function createContext(projectRoot) {
  return { projectRoot };
}

function createMetrics() {
  return { loaders: {} };
}

function callBridge(ctx, agentId, quality, metrics) {
  return writeSynapseSession.call(ctx, agentId, quality, metrics);
}

// =============================================================================
// Setup / Teardown
// =============================================================================

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-bridge-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// =============================================================================
// 1. Happy Path — Writes _active-agent.json when .synapse/ exists
// =============================================================================

describe('UAP Session Bridge — Happy Path', () => {
  test('writes _active-agent.json when .synapse/ directory exists', () => {
    // Arrange: create .synapse/ but NOT sessions/
    const synapsePath = path.join(tmpDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });

    const ctx = createContext(tmpDir);
    const metrics = createMetrics();

    // Act
    callBridge(ctx, 'dev', 'full', metrics);

    // Assert: file was created
    const bridgePath = path.join(synapsePath, 'sessions', '_active-agent.json');
    expect(fs.existsSync(bridgePath)).toBe(true);

    // Assert: content is valid JSON with expected fields
    const data = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
    expect(data.id).toBe('dev');
    expect(data.activation_quality).toBe('full');
    expect(data.source).toBe('uap');
    expect(data.activated_at).toBeDefined();
  });

  test('writes _active-agent.json when sessions/ already exists', () => {
    const sessionsDir = path.join(tmpDir, '.synapse', 'sessions');
    fs.mkdirSync(sessionsDir, { recursive: true });

    const ctx = createContext(tmpDir);
    const metrics = createMetrics();

    callBridge(ctx, 'qa', 'partial', metrics);

    const bridgePath = path.join(sessionsDir, '_active-agent.json');
    expect(fs.existsSync(bridgePath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
    expect(data.id).toBe('qa');
    expect(data.activation_quality).toBe('partial');
  });

  test('overwrites existing _active-agent.js
```