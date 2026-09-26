# PADRAO - pattern-store.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\workflow-intelligence\pattern-store.test.js
**SHA:** a5a29ee824909ded
**Timestamp:** 2026-08-28T02:19:51.953285
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Padroes
- const pattern = {
- const pattern = {
- const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };
- const pattern = {

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Unit tests for PatternStore module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('PatternStore (Unit)', () => {
  let PatternStore, createPatternStore, DEFAULT_MAX_PATTERNS, PATTERN_STATUS;
  let testStoragePath;

  beforeAll(() => {
    const module = require('../../../.aios-core/workflow-intelligence/learning/pattern-store');
    PatternStore = module.PatternStore;
    createPatternStore = module.createPatternStore;
    DEFAULT_MAX_PATTERNS = module.DEFAULT_MAX_PATTERNS;
    PATTERN_STATUS = module.PATTERN_STATUS;
  });

  beforeEach(() => {
    // Create unique temp file for each test
    testStoragePath = path.join(os.tmpdir(), `test-patterns-${Date.now()}.yaml`);
  });

  afterEach(() => {
    // Cleanup temp file
    try {
      if (fs.existsSync(testStoragePath)) {
        fs.unlinkSync(testStoragePath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('Module Exports', () => {
    it('should export PatternStore class', () => {
      expect(PatternStore).toBeDefined();
      expect(typeof PatternStore).toBe('function');
    });

    it('should export createPatternStore factory', () => {
      expect(createPatternStore).toBeDefined();
      expect(typeof createPatternStore).toBe('function');
    });

    it('should export DEFAULT_MAX_PATTERNS', () => {
      expect(DEFAULT_MAX_PATTERNS).toBe(100);
    });

    it('should export PATTERN_STATUS enum', () => {
      expect(PATTERN_STATUS.PENDING).toBe('pending');
      expect(PATTERN_STATUS.ACTIVE).toBe('active');
      expect(PATTERN_STATUS.PROMOTED).toBe('promoted');
      expect(PATTERN_STATUS.DEPRECATED).toBe('deprecated');
    });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      expect(store).toBeInstanceOf(PatternStore);
      expect(store.maxPatterns).toBe(100);
    });

    it('should accept custom options', () => {
      const store = createPatternStore({
        storagePath: testStoragePath,
        maxPatterns: 50,
        pruneThreshold: 0.8,
      });
      expect(store.maxPatterns).toBe(50);
      expect(store.pruneThreshold).toBe(0.8);
    });
  });

  describe('save', () => {
    it('should save new pattern', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        agents: ['dev', 'qa'],
        successRate: 1.0,
      };

      const result = store.save(pattern);

      expect(result.action).toBe('created');
      expect(result.pattern.id).toBeDefined();
      expect(result.pattern.sequence).toEqual(pattern.sequence);
    });

    it('should update existing pattern with same sequence', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = {
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      };

      store.save(pattern);
      const result = store.save(pattern);

      expect(result.action).toBe('updated');
      expect(result.pattern.occurrences).toBe(2);
    });

    it('should update success rate with weighted average', () => {
      const store = createPatternStore({ storagePath: testStoragePath });

      store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 1.0,
      });

      const result = store.save({
        sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        successRate: 0.5,
      });

      // Average of 1.0 and 0.5 = 0.75
      expect(result.pattern.successRate).toBe(0.75);
    });

    it('should set lastSeen on update', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };

      store.save(pattern);
      const result = store.save(pattern);

      expect(result.pattern.lastSeen).toBeDefined();
    });

    it('should normalize pattern with default values', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      const result = store.save({ sequence: ['a', 'b', 'c'] });

      expect(result.pattern.occurrences).toBe(1);
      expect(result.pattern.successRate).toBe(1.0);
      expect(result.pattern.status).toBe('pending');
      expect(result.pattern.firstSeen).toBeDefined();
    });

    it('should persist to file', () => {
      const store = createPatternStore({ storagePath: testStoragePath });
      store.save({ sequence: ['develop', 'review-qa', 'apply-qa-fixes'] });

      expect(fs.existsSync(testStoragePath)).toBe(true);

      const content = fs.readFileSync(testStoragePath, 'utf8');
      expect(content).toContain('develop');
    });
  });

  describe('load', () => {
    it('should return empty structure when file does not
```