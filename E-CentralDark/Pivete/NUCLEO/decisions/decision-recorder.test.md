# DECISAO - decision-recorder.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\decision-recorder.test.js
**SHA:** d727ec23f053dd2c
**Timestamp:** 2026-08-28T02:19:49.219625
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- testsRun: expect.any(Array),
- expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Tests Run: 2'));

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for Decision Recorder API
 *
 * Tests the convenience API for recording decisions during yolo mode.
 *
 * @see .aios-core/scripts/decision-recorder.js
 */

const fs = require('fs').promises;
const {
  initializeDecisionLogging,
  recordDecision,
  trackFile,
  trackTest,
  updateMetrics,
  completeDecisionLogging,
  getCurrentContext,
} = require('../../.aios-core/development/scripts/decision-recorder');

// Mock decision-log-generator
jest.mock('../../.aios-core/development/scripts/decision-log-generator', () => ({
  generateDecisionLog: jest.fn().mockResolvedValue('.ai/decision-log-test.md'),
}));

describe('decision-recorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeDecisionLogging', () => {
    it('should initialize decision logging context', async () => {
      const context = await initializeDecisionLogging('dev', 'docs/stories/test.md');

      expect(context).toBeDefined();
      expect(context.agentId).toBe('dev');
      expect(context.storyPath).toBe('docs/stories/test.md');
      expect(context.enabled).toBe(true);
    });

    it('should respect enabled option', async () => {
      const context = await initializeDecisionLogging('dev', 'test.md', { enabled: false });

      expect(context).toBeNull();
    });

    it('should pass agent load time to context', async () => {
      const context = await initializeDecisionLogging('dev', 'test.md', { agentLoadTime: 150 });

      expect(context.metrics.agentLoadTime).toBe(150);
    });
  });

  describe('recordDecision', () => {
    beforeEach(async () => {
      // Reset global context before each test in this suite
      if (getCurrentContext()) {
        await completeDecisionLogging('cleanup');
      }
    });

    it('should record decision after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      const decision = recordDecision({
        description: 'Test decision',
        reason: 'Test reason',
        alternatives: ['Alt 1', 'Alt 2'],
        type: 'library-choice',
        priority: 'high',
      });

      expect(decision).toBeDefined();
      expect(decision.description).toBe('Test decision');
      expect(decision.type).toBe('library-choice');
      expect(decision.priority).toBe('high');
    });

    it('should warn if not initialized', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const decision = recordDecision({
        description: 'Test',
        reason: 'Test',
      });

      expect(decision).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not initialized'));

      consoleSpy.mockRestore();
    });
  });

  describe('trackFile', () => {
    it('should track file after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      trackFile('src/api.js', 'created');

      const context = getCurrentContext();
      expect(context.filesModified).toHaveLength(1);
      expect(context.filesModified[0].path).toContain('api.js'); // Path may have OS-specific separators
      expect(context.filesModified[0].action).toBe('created');
    });

    it('should handle not initialized gracefully', async () => {
      trackFile('test.js', 'created'); // Should not throw
    });
  });

  describe('trackTest', () => {
    it('should track test after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      trackTest({
        name: 'api.test.js',
        passed: true,
        duration: 125,
      });

      const context = getCurrentContext();
      expect(context.testsRun).toHaveLength(1);
      expect(context.testsRun[0].name).toBe('api.test.js');
      expect(context.testsRun[0].passed).toBe(true);
    });

    it('should handle not initialized gracefully', async () => {
      trackTest({ name: 'test.js', passed: true }); // Should not throw
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics after initialization', async () => {
      await initializeDecisionLogging('dev', 'test.md');

      updateMetrics({
        agentLoadTime: 200,
        taskExecutionTime: 5000,
      });

      const context = getCurrentContext();
      expect(context.metrics.agentLoadTime).toBe(200);
      expect(context.metrics.taskExecutionTime).toBe(5000);
    });

    it('should handle not initialized gracefully', async () => {
      updateMetrics({ test: 123 }); // Should not throw
    });
  });

  describe('completeDecisionLogging', () => {
    it('should complete logging and generate log file', async () => {
      const { generateDecisionLog } = require('../../.aios-core/development/scripts/decision-log-generator');

      await initializeDecisionLogging('dev', 'test.md');

      recordDecision({ description: 'D1', reason: 'R1' });
      trackFile('file1.js', 'created');

```