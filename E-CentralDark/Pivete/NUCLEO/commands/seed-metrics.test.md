# COMANDO - seed-metrics.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\quality\seed-metrics.test.js
**SHA:** adbf337d464eed62
**Timestamp:** 2026-08-28T02:19:50.009556
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = generateLayer1Run(timestamp);
- const run = generateLayer2Run(timestamp);
- const run = generateLayer2Run(new Date());
- const run = generateLayer3Run(timestamp);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Seed Metrics Unit Tests
 *
 * Tests for the quality gate metrics seed data generator.
 *
 * @module tests/unit/quality/seed-metrics.test.js
 * @story 3.11a - Quality Gates Metrics Collector
 */

const {
  generateSeedData,
  generateLayer1Run,
  generateLayer2Run,
  generateLayer3Run,
} = require('../../../.aios-core/quality/seed-metrics');

describe('Seed Metrics Generator', () => {
  describe('generateLayer1Run', () => {
    it('should generate valid Layer 1 run', () => {
      const timestamp = new Date();
      const run = generateLayer1Run(timestamp);

      expect(run.layer).toBe(1);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
      expect(run.findingsCount).toBeGreaterThanOrEqual(0);
      expect(run.timestamp).toBe(timestamp.toISOString());
    });

    it('should generate realistic duration range', () => {
      const runs = [];
      for (let i = 0; i < 100; i++) {
        runs.push(generateLayer1Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      // Layer 1 should be 2-8 seconds
      expect(minDuration).toBeGreaterThanOrEqual(2000);
      expect(maxDuration).toBeLessThanOrEqual(8000);
    });

    it('should have high pass rate (~92%)', () => {
      const runs = [];
      for (let i = 0; i < 1000; i++) {
        runs.push(generateLayer1Run(new Date()));
      }

      const passRate = runs.filter((r) => r.passed).length / runs.length;
      // Allow for statistical variation
      expect(passRate).toBeGreaterThan(0.85);
      expect(passRate).toBeLessThan(0.98);
    });
  });

  describe('generateLayer2Run', () => {
    it('should generate valid Layer 2 run', () => {
      const timestamp = new Date();
      const run = generateLayer2Run(timestamp);

      expect(run.layer).toBe(2);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
      expect(run.metadata).toBeDefined();
    });

    it('should include CodeRabbit metadata', () => {
      const runs = [];
      for (let i = 0; i < 100; i++) {
        runs.push(generateLayer2Run(new Date()));
      }

      const withCoderabbit = runs.filter((r) => r.metadata?.coderabbit !== null);
      // CodeRabbit active 95% of time
      expect(withCoderabbit.length).toBeGreaterThan(85);
    });

    it('should include Quinn metadata', () => {
      const run = generateLayer2Run(new Date());

      expect(run.metadata.quinn).toBeDefined();
      expect(run.metadata.quinn.findingsCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(run.metadata.quinn.topCategories)).toBe(true);
    });

    it('should have realistic duration (2-10 minutes)', () => {
      const runs = [];
      for (let i = 0; i < 50; i++) {
        runs.push(generateLayer2Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      expect(minDuration).toBeGreaterThanOrEqual(120000);
      expect(maxDuration).toBeLessThanOrEqual(600000);
    });
  });

  describe('generateLayer3Run', () => {
    it('should generate valid Layer 3 run', () => {
      const timestamp = new Date();
      const run = generateLayer3Run(timestamp);

      expect(run.layer).toBe(3);
      expect(typeof run.passed).toBe('boolean');
      expect(run.durationMs).toBeGreaterThan(0);
    });

    it('should have highest pass rate (~96%)', () => {
      const runs = [];
      for (let i = 0; i < 1000; i++) {
        runs.push(generateLayer3Run(new Date()));
      }

      const passRate = runs.filter((r) => r.passed).length / runs.length;
      expect(passRate).toBeGreaterThan(0.90);
      expect(passRate).toBeLessThan(0.99);
    });

    it('should have realistic duration (5-30 minutes)', () => {
      const runs = [];
      for (let i = 0; i < 50; i++) {
        runs.push(generateLayer3Run(new Date()));
      }

      const durations = runs.map((r) => r.durationMs);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      expect(minDuration).toBeGreaterThanOrEqual(300000);
      expect(maxDuration).toBeLessThanOrEqual(1800000);
    });
  });

  describe('generateSeedData', () => {
    it('should generate 30 days of history by default', () => {
      const metrics = generateSeedData();

      // Should have multiple runs
      expect(metrics.history.length).toBeGreaterThan(100);

      // Check date range
      const timestamps = metrics.history.map((r) => new Date(r.timestamp));
      const oldestDate = new Date(Math.min(...timestamps));
      const newestDate = new Date(Math.max(...timestamps));

      const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(25);
      expect(daysDiff).toBeLessThanOrEqual(31);
    });

    it('should gene
```