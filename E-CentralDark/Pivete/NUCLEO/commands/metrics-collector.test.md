# COMANDO - metrics-collector.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\quality\metrics-collector.test.js
**SHA:** ad290853c1fd03af
**Timestamp:** 2026-08-28T02:19:50.005521
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = await collector.recordRun(1, {
- const run = await collector.recordRun(2, {
- const run = await collector.recordRun(3, {
- const run = await collector.recordRun(1, {
- const run = await collector.recordPreCommit({
- const run = await collector.recordHumanReview({

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * MetricsCollector Unit Tests
 *
 * Tests for the quality gate metrics collector module.
 *
 * @module tests/unit/quality/metrics-collector.test.js
 * @story 3.11a - Quality Gates Metrics Collector
 */

const path = require('path');
const fs = require('fs').promises;
const {
  MetricsCollector,
  createEmptyMetrics,
  DEFAULT_RETENTION_DAYS,
} = require('../../../.aios-core/quality/metrics-collector');

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, '../../fixtures/quality');
const TEST_METRICS_FILE = path.join(TEST_DATA_DIR, 'test-metrics.json');

describe('MetricsCollector', () => {
  let collector;

  beforeAll(async () => {
    // Create test data directory
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore if file doesn't exist
    }

    collector = new MetricsCollector({
      dataFile: TEST_METRICS_FILE,
      retentionDays: 30,
    });
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.unlink(TEST_METRICS_FILE);
      await fs.unlink(`${TEST_METRICS_FILE}.lock`);
    } catch {
      // Ignore
    }
  });

  describe('createEmptyMetrics', () => {
    it('should create valid empty metrics structure', () => {
      const metrics = createEmptyMetrics();

      expect(metrics).toHaveProperty('version', '1.0');
      expect(metrics).toHaveProperty('lastUpdated');
      expect(metrics).toHaveProperty('retentionDays', DEFAULT_RETENTION_DAYS);
      expect(metrics).toHaveProperty('layers');
      expect(metrics).toHaveProperty('trends');
      expect(metrics).toHaveProperty('history');

      // Check layer structure
      expect(metrics.layers).toHaveProperty('layer1');
      expect(metrics.layers).toHaveProperty('layer2');
      expect(metrics.layers).toHaveProperty('layer3');

      // Check layer1 structure
      expect(metrics.layers.layer1).toHaveProperty('passRate', 0);
      expect(metrics.layers.layer1).toHaveProperty('avgTimeMs', 0);
      expect(metrics.layers.layer1).toHaveProperty('totalRuns', 0);

      // Check layer2 specific fields
      expect(metrics.layers.layer2).toHaveProperty('autoCatchRate', 0);
      expect(metrics.layers.layer2).toHaveProperty('coderabbit');
      expect(metrics.layers.layer2).toHaveProperty('quinn');
    });
  });

  describe('load/save', () => {
    it('should create empty metrics on first load', async () => {
      const metrics = await collector.load();

      expect(metrics.version).toBe('1.0');
      expect(metrics.history).toEqual([]);
    });

    it('should save and load metrics correctly', async () => {
      await collector.load();
      await collector.recordRun(1, { passed: true, durationMs: 1000 });

      // Create new collector instance
      const newCollector = new MetricsCollector({
        dataFile: TEST_METRICS_FILE,
      });
      const loadedMetrics = await newCollector.load();

      expect(loadedMetrics.history.length).toBe(1);
      expect(loadedMetrics.history[0].passed).toBe(true);
    });
  });

  describe('recordRun', () => {
    it('should record Layer 1 pre-commit run', async () => {
      const run = await collector.recordRun(1, {
        passed: true,
        durationMs: 3200,
        findingsCount: 0,
      });

      expect(run.layer).toBe(1);
      expect(run.passed).toBe(true);
      expect(run.durationMs).toBe(3200);
      expect(run.findingsCount).toBe(0);
      expect(run.timestamp).toBeDefined();
    });

    it('should record Layer 2 PR review run', async () => {
      const run = await collector.recordRun(2, {
        passed: false,
        durationMs: 120000,
        findingsCount: 5,
      });

      expect(run.layer).toBe(2);
      expect(run.passed).toBe(false);
      expect(run.findingsCount).toBe(5);
    });

    it('should record Layer 3 human review run', async () => {
      const run = await collector.recordRun(3, {
        passed: true,
        durationMs: 600000,
        findingsCount: 1,
      });

      expect(run.layer).toBe(3);
      expect(run.passed).toBe(true);
    });

    it('should reject invalid layer numbers', async () => {
      await expect(collector.recordRun(0, { passed: true }))
        .rejects.toThrow('Layer must be 1, 2, or 3');

      await expect(collector.recordRun(4, { passed: true }))
        .rejects.toThrow('Layer must be 1, 2, or 3');
    });

    it('should include metadata in run record', async () => {
      const run = await collector.recordRun(1, {
        passed: true,
        durationMs: 1000,
        metadata: {
          storyId: '3.11a',
          branchName: 'feature/test',
        },
      });

      expect(run.metadata.storyId).toBe('3.11a');
      expect(run.metadata.branchName).toBe('feature/test');
    });
  });

  describe('recordPreCommit', () => {
    it('should record pre-commit as Layer 1', asyn
```