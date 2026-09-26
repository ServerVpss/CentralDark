# PADRAO - pattern-capture.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\workflow-intelligence\pattern-capture.test.js
**SHA:** 3475851c5aa3f79e
**Timestamp:** 2026-08-28T02:19:51.944246
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @fileoverview Unit tests for PatternCapture module
 * @story WIS-5 - Pattern Capture (Internal)
 */

'use strict';

describe('PatternCapture (Unit)', () => {
  let PatternCapture, createPatternCapture, DEFAULT_MIN_SEQUENCE_LENGTH, KEY_WORKFLOW_COMMANDS;

  beforeAll(() => {
    const module = require('../../../.aios-core/workflow-intelligence/learning/pattern-capture');
    PatternCapture = module.PatternCapture;
    createPatternCapture = module.createPatternCapture;
    DEFAULT_MIN_SEQUENCE_LENGTH = module.DEFAULT_MIN_SEQUENCE_LENGTH;
    KEY_WORKFLOW_COMMANDS = module.KEY_WORKFLOW_COMMANDS;
  });

  describe('Module Exports', () => {
    it('should export PatternCapture class', () => {
      expect(PatternCapture).toBeDefined();
      expect(typeof PatternCapture).toBe('function');
    });

    it('should export createPatternCapture factory', () => {
      expect(createPatternCapture).toBeDefined();
      expect(typeof createPatternCapture).toBe('function');
    });

    it('should export DEFAULT_MIN_SEQUENCE_LENGTH', () => {
      expect(DEFAULT_MIN_SEQUENCE_LENGTH).toBe(3);
    });

    it('should export KEY_WORKFLOW_COMMANDS', () => {
      expect(KEY_WORKFLOW_COMMANDS).toContain('develop');
      expect(KEY_WORKFLOW_COMMANDS).toContain('review-qa');
    });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const capture = createPatternCapture();
      expect(capture).toBeInstanceOf(PatternCapture);
      expect(capture.minSequenceLength).toBe(3);
    });

    it('should accept custom minSequenceLength', () => {
      const capture = createPatternCapture({ minSequenceLength: 5 });
      expect(capture.minSequenceLength).toBe(5);
    });

    it('should accept custom keyCommands', () => {
      const customCommands = ['custom-task', 'another-task'];
      const capture = createPatternCapture({ keyCommands: customCommands });
      expect(capture.keyCommands).toEqual(customCommands);
    });

    it('should respect enabled option', () => {
      const capture = createPatternCapture({ enabled: false });
      expect(capture.enabled).toBe(false);
    });
  });

  describe('captureSession', () => {
    let capture;

    beforeEach(() => {
      capture = createPatternCapture({ enabled: true });
    });

    it('should capture valid session data', () => {
      const sessionData = {
        commands: ['validate-story-draft', 'develop', 'review-qa', 'create-pr'],
        agentSequence: ['sm', 'dev', 'qa'],
        success: true,
        timestamp: Date.now(),
        sessionId: 'test-session-1',
      };

      const result = capture.captureSession(sessionData);

      expect(result.valid).toBe(true);
      expect(result.pattern).toBeDefined();
      expect(result.pattern.sequence).toHaveLength(4);
      expect(result.pattern.agents).toEqual(['sm', 'dev', 'qa']);
      expect(result.pattern.occurrences).toBe(1);
      expect(result.pattern.successRate).toBe(1.0);
      expect(result.pattern.status).toBe('pending');
    });

    it('should reject session when capture is disabled', () => {
      const disabledCapture = createPatternCapture({ enabled: false });
      const result = disabledCapture.captureSession({
        commands: ['a', 'b', 'c'],
        success: true,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should reject null or invalid session data', () => {
      expect(capture.captureSession(null).valid).toBe(false);
      expect(capture.captureSession({}).valid).toBe(false);
      expect(capture.captureSession({ commands: null }).valid).toBe(false);
    });

    it('should reject unsuccessful workflows', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: false,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not successful');
    });

    it('should reject sequences shorter than minimum length', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa'],
        success: true,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too short');
    });

    it('should normalize command names (remove * prefix)', () => {
      const result = capture.captureSession({
        commands: ['*develop', '*review-qa', '*apply-qa-fixes'],
        success: true,
      });

      expect(result.valid).toBe(true);
      expect(result.pattern.sequence).toEqual(['develop', 'review-qa', 'apply-qa-fixes']);
    });

    it('should detect story_development workflow', () => {
      const result = capture.captureSession({
        commands: ['develop', 'review-qa', 'apply-qa-fixes'],
        success: true,
      });

      expect(result.pattern.workflow).toBe('story_development');
    });

    it('should detect story_creation workflow', () => {
      const result = capture.captureSession({
  
```