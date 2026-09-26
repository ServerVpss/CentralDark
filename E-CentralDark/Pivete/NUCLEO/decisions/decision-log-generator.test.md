# DECISAO - decision-log-generator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\decision-log-generator.test.js
**SHA:** 2299f14b61694a9e
**Timestamp:** 2026-08-28T02:19:43.273336
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- testsRun: [

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for Decision Log Generator
 *
 * Test Coverage:
 * - Decision log file generation
 * - Duration calculation and formatting
 * - Decision list formatting
 * - File list formatting
 * - Test result formatting
 * - Rollback information generation
 * - Error handling and edge cases
 *
 * @see .aios-core/scripts/decision-log-generator.js
 */

const {
  generateDecisionLog,
  calculateDuration,
  generateDecisionsList,
  generateFilesList,
  generateTestsList,
  generateRollbackFilesList,
} = require('../../.aios-core/development/scripts/decision-log-generator');

const fs = require('fs').promises;
const path = require('path');

describe('decision-log-generator', () => {
  const testAiDir = '.ai-test';
  const originalDateNow = Date.now;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testAiDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }

    // Mock Date.now for consistent timestamps
    Date.now = jest.fn(() => 1705406400000); // 2024-01-16 12:00:00 UTC
  });

  afterEach(async () => {
    // Restore Date.now
    Date.now = originalDateNow;

    // Clean up test directory
    try {
      await fs.rm(testAiDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('calculateDuration', () => {
    test('should format duration in hours and minutes when > 1 hour', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + (3600000 * 2.5), // 2.5 hours later
      };

      const result = calculateDuration(context);

      expect(result).toBe('2h 30m');
    });

    test('should format duration in minutes and seconds when < 1 hour', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + (60000 * 5.5), // 5.5 minutes later
      };

      const result = calculateDuration(context);

      expect(result).toBe('5m 30s');
    });

    test('should format duration in seconds when < 1 minute', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000 + 45000, // 45 seconds later
      };

      const result = calculateDuration(context);

      expect(result).toBe('45s');
    });

    test('should show "in progress" when endTime is missing', () => {
      const context = {
        startTime: 1705406400000,
        // No endTime
      };

      const result = calculateDuration(context);

      expect(result).toContain('in progress');
    });

    test('should handle zero duration', () => {
      const context = {
        startTime: 1705406400000,
        endTime: 1705406400000, // Same time
      };

      const result = calculateDuration(context);

      expect(result).toBe('0s');
    });
  });

  describe('generateDecisionsList', () => {
    test('should generate markdown for decisions with all fields', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Use Axios for HTTP client',
          reason: 'Better error handling',
          alternatives: ['Fetch API', 'Got library'],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Use Axios for HTTP client');
      expect(result).toContain('**Timestamp:**');
      expect(result).toContain('**Reason:** Better error handling');
      expect(result).toContain('**Alternatives Considered:**');
      expect(result).toContain('- Fetch API');
      expect(result).toContain('- Got library');
    });

    test('should generate markdown for multiple decisions', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Decision 1',
          reason: 'Reason 1',
          alternatives: [],
        },
        {
          timestamp: 1705406400000,
          description: 'Decision 2',
          reason: 'Reason 2',
          alternatives: ['Alt 1'],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Decision 1');
      expect(result).toContain('### Decision 2: Decision 2');
      expect(result).toContain('**Reason:** Reason 1');
      expect(result).toContain('**Reason:** Reason 2');
    });

    test('should handle decisions without alternatives', () => {
      const decisions = [
        {
          timestamp: 1705406400000,
          description: 'Simple decision',
          reason: 'Only one option',
          alternatives: [],
        },
      ];

      const result = generateDecisionsList(decisions);

      expect(result).toContain('### Decision 1: Simple decision');
      expect(result).not.toContain('**Alternatives Considered:**');
    });

    test('should return message when no decisions provided', () => {
      const result = generateDecisionsList([]);

      expect(result).toBe('*No autonomous decisions recorded.*');
    });

    test('should handle nul
```