# COMANDO - performance.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\license\performance.test.js
**SHA:** 485c9557d9133080
**Timestamp:** 2026-08-28T02:19:40.270103
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = process.hrtime.bigint();
- const start = process.hrtime.bigint();
- const start = process.hrtime.bigint();

### Contratos
- const gate = new FeatureGate();
- const gate = new FeatureGate();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Performance Tests for License System
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see Task 7.4 - Performance tests
 * @see AC-13 - isAvailable() < 5ms, cache read < 10ms, activation < 3s
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  writeLicenseCache,
  readLicenseCache,
  getCachePath,
  getAiosDir,
} = require('../../pro/license/license-cache');
const { FeatureGate, featureGate } = require('../../pro/license/feature-gate');
const { generateMachineId, deriveCacheKey, generateSalt } = require('../../pro/license/license-crypto');

describe('Performance Tests (AC-13)', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-perf-test-'));
    // Reset the singleton for each test
    featureGate._reset();
  });

  afterEach(() => {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    featureGate._reset();
  });

  // Helper to create valid test cache data
  function createTestCacheData(overrides = {}) {
    return {
      key: 'PRO-ABCD-EFGH-IJKL-MNOP',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['pro.squads.*', 'pro.memory.*', 'pro.metrics.*'],
      seats: { used: 1, max: 5 },
      cacheValidDays: 30,
      gracePeriodDays: 7,
      ...overrides,
    };
  }

  // Helper to measure execution time
  function measureTime(fn, iterations = 1) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      fn();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1_000_000); // Convert to ms
    }
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      total: times.reduce((a, b) => a + b, 0),
      iterations,
    };
  }

  // Helper to measure async execution time
  async function measureTimeAsync(fn, iterations = 1) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await fn();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1_000_000);
    }
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      total: times.reduce((a, b) => a + b, 0),
      iterations,
    };
  }

  describe('isAvailable() Performance (< 5ms per call)', () => {
    beforeEach(() => {
      // Setup valid license cache
      const data = createTestCacheData();
      writeLicenseCache(data, testDir);

      // Mock the cache path to use testDir
      // We need to pre-load the cache by reading from testDir
      const cache = readLicenseCache(testDir);
      // Directly set the internal state for testing
      featureGate._cache = cache;
      featureGate._cacheLoaded = true;
      if (cache && cache.features) {
        for (const feature of cache.features) {
          featureGate._licensedFeatures.add(feature);
        }
      }
    });

    it('should complete isAvailable() in < 5ms (single call, cached)', () => {
      const result = measureTime(() => {
        featureGate.isAvailable('pro.squads.premium');
      }, 1);

      expect(result.avg).toBeLessThan(5);
    });

    it('should complete 1000 isAvailable() calls with average < 5ms', () => {
      const iterations = 1000;
      const result = measureTime(() => {
        featureGate.isAvailable('pro.squads.premium');
      }, iterations);

      // Average should be well under 5ms (cache is already loaded)
      expect(result.avg).toBeLessThan(5);

      // Even the max should be reasonable
      expect(result.max).toBeLessThan(10);
    });

    it('should complete 1000 isAvailable() calls for exact match in < 5ms avg', () => {
      // Test with exact feature match
      featureGate._licensedFeatures.add('pro.squads.premium');

      const result = measureTime(() => {
        featureGate.isAvailable('pro.squads.premium');
      }, 1000);

      expect(result.avg).toBeLessThan(5);
    });

    it('should complete 1000 isAvailable() calls for wildcard match in < 5ms avg', () => {
      // Test with wildcard pattern (slightly more work)
      const result = measureTime(() => {
        featureGate.isAvailable('pro.squads.custom');
      }, 1000);

      expect(result.avg).toBeLessThan(5);
    });

    it('should complete 1000 isAvailable() calls for non-existent feature in < 5ms avg', () => {
      // Non-existent features should also be fast
      const result = measureTime(() => {
        featureGate.isAvailable('pro.nonexistent.feature');
      }, 1000);

      expect(result.avg).toBeLessThan(5);
    });

    it('should maintain performance with many licensed features', () => {
      // Add many features to stress test
      for (let
```