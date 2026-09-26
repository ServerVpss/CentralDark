# DECISAO - decision-context.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\decision-context.test.js
**SHA:** 8a653eece629b675
**Timestamp:** 2026-08-28T02:19:43.424576
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- testsRun: expect.any(Array),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for Decision Context
 *
 * Tests the DecisionContext class for tracking decisions, files, and tests.
 *
 * @see .aios-core/scripts/decision-context.js
 */

const {
  DecisionContext,
  DECISION_TYPES,
  PRIORITY_LEVELS,
} = require('../../.aios-core/development/scripts/decision-context');

describe('DecisionContext', () => {
  let context;

  beforeEach(() => {
    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    // Create fresh context for each test
    context = new DecisionContext('dev', 'docs/stories/test-story.md');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required fields', () => {
      expect(context.agentId).toBe('dev');
      expect(context.storyPath).toBe('docs/stories/test-story.md');
      expect(context.startTime).toBe(1700000000000);
      expect(context.status).toBe('running');
      expect(context.enabled).toBe(true);
    });

    it('should initialize empty tracking arrays', () => {
      expect(context.decisions).toEqual([]);
      expect(context.filesModified).toEqual([]);
      expect(context.testsRun).toEqual([]);
    });

    it('should capture git commit hash', () => {
      expect(context.commitBefore).toBeDefined();
      expect(typeof context.commitBefore).toBe('string');
    });

    it('should handle disabled state', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      expect(disabledContext.enabled).toBe(false);
    });
  });

  describe('recordDecision', () => {
    it('should record decision with all fields', () => {
      const decision = context.recordDecision({
        description: 'Use Axios for HTTP',
        reason: 'Better error handling',
        alternatives: ['Fetch API', 'Got library'],
        type: 'library-choice',
        priority: 'medium',
      });

      expect(decision).toMatchObject({
        timestamp: 1700000000000,
        description: 'Use Axios for HTTP',
        reason: 'Better error handling',
        alternatives: ['Fetch API', 'Got library'],
        type: 'library-choice',
        priority: 'medium',
      });

      expect(context.decisions).toHaveLength(1);
      expect(context.decisions[0]).toBe(decision);
    });

    it('should handle empty alternatives array', () => {
      const decision = context.recordDecision({
        description: 'Simple decision',
        reason: 'Only one option',
        alternatives: [],
      });

      expect(decision.alternatives).toEqual([]);
    });

    it('should use default type and priority if not provided', () => {
      const decision = context.recordDecision({
        description: 'Decision without classification',
        reason: 'Some reason',
      });

      expect(decision.type).toBe('architecture');
      expect(decision.priority).toBe('medium');
    });

    it('should validate decision type', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = context.recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        type: 'invalid-type',
      });

      expect(decision.type).toBe('architecture'); // Fallback to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown decision type'));

      consoleSpy.mockRestore();
    });

    it('should validate priority level', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = context.recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        priority: 'invalid-priority',
      });

      expect(decision.priority).toBe('medium'); // Fallback to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown priority level'));

      consoleSpy.mockRestore();
    });

    it('should handle non-array alternatives', () => {
      const decision = context.recordDecision({
        description: 'Test',
        reason: 'Test',
        alternatives: 'not an array',
      });

      expect(decision.alternatives).toEqual([]);
    });

    it('should return null when disabled', () => {
      const disabledContext = new DecisionContext('dev', 'story.md', { enabled: false });
      const decision = disabledContext.recordDecision({
        description: 'Test',
        reason: 'Test',
      });

      expect(decision).toBeNull();
      expect(disabledContext.decisions).toHaveLength(0);
    });
  });

  describe('trackFile', () => {
    it('should track file with action', () => {
      context.trackFile('src/api.js', 'created');

      expect(context.filesModified).toHaveLength(1);
      expect(context.filesModified[0].path).toContain('api.js'); // OS-agnostic path check
      expect(context.filesModified[0].action).toBe('created');
    });

    it('should use default action "modified"', () => {
      context.trackFile('src/utils.js');


```