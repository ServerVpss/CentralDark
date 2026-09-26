# PADRAO - pattern-learning.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\integration\workflow-intelligence\pattern-learning.test.js
**SHA:** 71827a9eaefd3b16
**Timestamp:** 2026-08-28T02:19:40.184039
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Padroes
- let pattern = store.load().patterns.find((p) => p.id === patternId);
- pattern = store.load().patterns.find((p) => p.id === patternId);
- pattern = store.load().patterns.find((p) => p.id === patternId);
- const similarPattern = {

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Integration tests for Pattern Learning System
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Pattern Learning Integration', () => {
  let learningModule;
  let testStoragePath;

  beforeAll(() => {
    learningModule = require('../../../.aios-core/workflow-intelligence/learning');
  });

  beforeEach(() => {
    testStoragePath = path.join(os.tmpdir(), `integration-patterns-${Date.now()}.yaml`);
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testStoragePath)) {
        fs.unlinkSync(testStoragePath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('Module Exports', () => {
    it('should export high-level API functions', () => {
      expect(learningModule.captureAndStore).toBeDefined();
      expect(learningModule.getLearnedPatterns).toBeDefined();
      expect(learningModule.findMatchingPatterns).toBeDefined();
    });

    it('should export factory functions', () => {
      expect(learningModule.createPatternCapture).toBeDefined();
      expect(learningModule.createPatternValidator).toBeDefined();
      expect(learningModule.createPatternStore).toBeDefined();
    });

    it('should export classes', () => {
      expect(learningModule.PatternCapture).toBeDefined();
      expect(learningModule.PatternValidator).toBeDefined();
      expect(learningModule.PatternStore).toBeDefined();
    });

    it('should export constants', () => {
      expect(learningModule.DEFAULT_MIN_SEQUENCE_LENGTH).toBe(3);
      expect(learningModule.DEFAULT_MAX_PATTERNS).toBe(100);
      expect(learningModule.PATTERN_STATUS).toBeDefined();
    });
  });

  describe('End-to-End Pattern Capture Flow', () => {
    it('should capture, validate, and store a workflow pattern', () => {
      const { createPatternCapture, createPatternValidator, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true });
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      // Step 1: Capture session
      const sessionData = {
        commands: ['validate-story-draft', 'develop', 'review-qa', 'apply-qa-fixes'],
        agentSequence: ['sm', 'dev', 'qa'],
        success: true,
        timestamp: Date.now(),
        sessionId: 'integration-test-1',
      };

      const captureResult = capture.captureSession(sessionData);
      expect(captureResult.valid).toBe(true);
      expect(captureResult.pattern).toBeDefined();

      // Step 2: Validate pattern
      const validationResult = validator.validate(captureResult.pattern);
      expect(validationResult.valid).toBe(true);

      // Step 3: Store pattern
      const storeResult = store.save(captureResult.pattern);
      expect(storeResult.action).toBe('created');

      // Step 4: Verify retrieval
      const loaded = store.load();
      expect(loaded.patterns).toHaveLength(1);
      expect(loaded.patterns[0].sequence).toEqual(captureResult.pattern.sequence);
    });

    it('should detect and update duplicate patterns', () => {
      const { createPatternCapture, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true });
      const store = createPatternStore({ storagePath: testStoragePath });

      const sessionData = {
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: true,
      };

      // First capture
      const result1 = capture.captureSession(sessionData);
      store.save(result1.pattern);

      // Second capture (same sequence)
      const result2 = capture.captureSession(sessionData);
      const storeResult = store.save(result2.pattern);

      expect(storeResult.action).toBe('updated');
      expect(storeResult.pattern.occurrences).toBe(2);

      // Verify only one pattern exists
      const loaded = store.load();
      expect(loaded.patterns).toHaveLength(1);
    });

    it('should reject invalid patterns before storage', () => {
      const { createPatternCapture, createPatternValidator, createPatternStore } = learningModule;

      const capture = createPatternCapture({ enabled: true, minSequenceLength: 2 });
      const validator = createPatternValidator();
      const store = createPatternStore({ storagePath: testStoragePath });

      // Capture session with low success rate
      const sessionData = {
        commands: ['unknown1', 'unknown2'],
        success: true,
      };

      const captureResult = capture.captureSession(sessionData);

      if (captureResult.valid) {
        // Manually set low success rate
        captureResult.pattern.successRate = 0.3;

        const validationResult = validator.validate(captureResult.pattern);
        expect(validationResult.valid).toBe(false);
      }
    });
  });

  describe('Pattern Lifecycle Management', () => {
    it('should transition pattern through lifecycle st
```