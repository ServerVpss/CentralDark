# CONTRATO - feature-gate.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\license\feature-gate.test.js
**SHA:** 099c5bc7db3b3396
**Timestamp:** 2026-08-28T02:19:40.218846
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = performance.now();

### Contratos
- const { featureGate: fg2 } = require('../../pro/license/feature-gate');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit tests for feature-gate.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-4, AC-5 - Feature gate check, Wildcard matching
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { FeatureGate, featureGate } = require('../../pro/license/feature-gate');
const { ProFeatureError } = require('../../pro/license/errors');
const { writeLicenseCache, deleteLicenseCache } = require('../../pro/license/license-cache');

describe('feature-gate', () => {
  let testDir;
  let originalCwd;

  beforeEach(() => {
    // Create temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-feature-test-'));

    // Mock process.cwd to return our test directory
    originalCwd = process.cwd;
    process.cwd = () => testDir;

    // Reset the singleton for clean tests
    featureGate._reset();
  });

  afterEach(() => {
    // Restore process.cwd
    process.cwd = originalCwd;

    // Cleanup temp directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // Helper to create test cache
  function createTestCache(features = ['pro.squads.*'], overrides = {}) {
    return {
      key: 'PRO-TEST-1234-5678-ABCD',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features,
      seats: { used: 1, max: 5 },
      cacheValidDays: 30,
      gracePeriodDays: 7,
      ...overrides,
    };
  }

  describe('isAvailable', () => {
    it('should return false when no license', () => {
      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
    });

    it('should return true for exact match', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });

    it('should return false for unmatched feature', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(featureGate.isAvailable('pro.memory.extended')).toBe(false);
    });

    it('should support wildcard matching (AC-5)', () => {
      writeLicenseCache(createTestCache(['pro.squads.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.marketplace')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(false);
    });

    it('should support module wildcard (pro.*)', () => {
      writeLicenseCache(createTestCache(['pro.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.integrations.jira')).toBe(true);
    });

    it('should handle multiple patterns', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium', 'pro.memory.*']), testDir);

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
      expect(featureGate.isAvailable('pro.squads.custom')).toBe(false);
      expect(featureGate.isAvailable('pro.memory.extended')).toBe(true);
      expect(featureGate.isAvailable('pro.memory.persistence')).toBe(true);
    });

    it('should return false for expired license (past grace)', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 40); // 40 days ago

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(false);
    });

    it('should return true during grace period', () => {
      const activatedAt = new Date();
      activatedAt.setDate(activatedAt.getDate() - 33); // 33 days ago (in grace)

      writeLicenseCache(
        createTestCache(['pro.squads.*'], { activatedAt: activatedAt.toISOString() }),
        testDir,
      );

      expect(featureGate.isAvailable('pro.squads.premium')).toBe(true);
    });
  });

  describe('require (AC-4)', () => {
    it('should not throw when feature is available', () => {
      writeLicenseCache(createTestCache(['pro.squads.premium']), testDir);

      expect(() => {
        featureGate.require('pro.squads.premium', 'Premium Squads');
      }).not.toThrow();
    });

    it('should throw ProFeatureError when not available', () => {
      expect(() => {
        featureGate.require('pro.squads.premium', 'Premium Squads');
      }).toThrow(ProFeatureError);
    });

    it('should include feature info in error', () => {
      try {
        featureGate.require('pro.squads.premium', 'Premium Squads');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ProFeatureError);
        expect(error.featureId).toBe('pro.squads.premium');
        e
```