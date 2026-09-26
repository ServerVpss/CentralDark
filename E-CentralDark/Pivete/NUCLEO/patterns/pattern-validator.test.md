# PADRAO - pattern-validator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\workflow-intelligence\pattern-validator.test.js
**SHA:** 8436c7fe2cd2fe40
**Timestamp:** 2026-08-28T02:19:51.961491
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Padroes
- const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };
- const pattern = { sequence: ['develop', 'review-qa', 'run-tests'] };
- const pattern = { sequence: ['create-story', 'validate-story-draft', 'develop'] };
- const pattern = {
- const pattern = { sequence: ['develop', 'review-qa', 'apply-qa-fixes'] };

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Unit tests for PatternValidator module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

describe('PatternValidator (Unit)', () => {
  let PatternValidator, createPatternValidator, DEFAULT_VALIDATION_RULES, KNOWN_COMMANDS;

  beforeAll(() => {
    const module = require('../../../.aios-core/workflow-intelligence/learning/pattern-validator');
    PatternValidator = module.PatternValidator;
    createPatternValidator = module.createPatternValidator;
    DEFAULT_VALIDATION_RULES = module.DEFAULT_VALIDATION_RULES;
    KNOWN_COMMANDS = module.KNOWN_COMMANDS;
  });

  describe('Module Exports', () => {
    it('should export PatternValidator class', () => {
      expect(PatternValidator).toBeDefined();
      expect(typeof PatternValidator).toBe('function');
    });

    it('should export createPatternValidator factory', () => {
      expect(createPatternValidator).toBeDefined();
      expect(typeof createPatternValidator).toBe('function');
    });

    it('should export DEFAULT_VALIDATION_RULES', () => {
      expect(DEFAULT_VALIDATION_RULES).toBeDefined();
      expect(DEFAULT_VALIDATION_RULES.minSequenceLength).toBe(3);
      expect(DEFAULT_VALIDATION_RULES.maxSequenceLength).toBe(10);
      expect(DEFAULT_VALIDATION_RULES.minOccurrences).toBe(2);
      expect(DEFAULT_VALIDATION_RULES.minSuccessRate).toBe(0.8);
    });

    it('should export KNOWN_COMMANDS set', () => {
      expect(KNOWN_COMMANDS).toBeInstanceOf(Set);
      expect(KNOWN_COMMANDS.has('develop')).toBe(true);
      expect(KNOWN_COMMANDS.has('review-qa')).toBe(true);
    });
  });

  describe('Constructor', () => {
    it('should create instance with default rules', () => {
      const validator = createPatternValidator();
      expect(validator).toBeInstanceOf(PatternValidator);
      expect(validator.rules.minSequenceLength).toBe(3);
    });

    it('should accept custom rules', () => {
      const validator = createPatternValidator({
        rules: { minSequenceLength: 5, minSuccessRate: 0.9 },
      });
      expect(validator.rules.minSequenceLength).toBe(5);
      expect(validator.rules.minSuccessRate).toBe(0.9);
    });

    it('should merge custom rules with defaults', () => {
      const validator = createPatternValidator({
        rules: { minSequenceLength: 5 },
      });
      expect(validator.rules.minSequenceLength).toBe(5);
      expect(validator.rules.maxSequenceLength).toBe(10); // Default preserved
    });
  });

  describe('validate', () => {
    let validator;

    beforeEach(() => {
      validator = createPatternValidator();
    });

    describe('Required Fields', () => {
      it('should reject null pattern', () => {
        const result = validator.validate(null);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Pattern is null or undefined');
      });

      it('should reject pattern without sequence', () => {
        const result = validator.validate({});
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing or invalid sequence');
      });

      it('should reject pattern with non-array sequence', () => {
        const result = validator.validate({ sequence: 'not-an-array' });
        expect(result.valid).toBe(false);
      });
    });

    describe('Sequence Length Rules', () => {
      it('should reject sequences shorter than minimum', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa'],
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('too short'))).toBe(true);
      });

      it('should accept sequences at minimum length', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
        });
        expect(result.valid).toBe(true);
      });

      it('should warn for unusually long sequences', () => {
        const result = validator.validate({
          sequence: Array(12).fill('develop'),
        });
        expect(result.warnings.some((w) => w.includes('unusually long'))).toBe(true);
      });
    });

    describe('Occurrence Rules', () => {
      it('should warn for low occurrences', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          occurrences: 1,
        });
        expect(result.warnings.some((w) => w.includes('Low occurrences'))).toBe(true);
      });

      it('should not warn when occurrences meet minimum', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes'],
          occurrences: 2,
        });
        expect(result.warnings.some((w) => w.includes('occurrences'))).toBe(false);
      });
    });

    describe('Success Rate Rules', () => {
      it('should reject patterns with low success rate', () => {
        const result = validator.validate({
          sequence: ['develop', 'review-qa', 'apply-qa-fixes
```