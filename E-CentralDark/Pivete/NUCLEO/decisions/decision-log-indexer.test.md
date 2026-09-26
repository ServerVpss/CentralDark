# DECISAO - decision-log-indexer.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\decision-log-indexer.test.js
**SHA:** 668e10946d143f9d
**Timestamp:** 2026-08-28T02:19:43.454489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Tests Run:** 8 tests

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for Decision Log Indexer
 *
 * Tests the indexing system for decision logs.
 *
 * @see .aios-core/scripts/decision-log-indexer.js
 */

const fs = require('fs').promises;
const path = require('path');
const {
  parseLogMetadata,
  generateIndexContent,
  addToIndex,
  rebuildIndex,
} = require('../../.aios-core/development/scripts/decision-log-indexer');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe('decision-log-indexer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseLogMetadata', () => {
    it('should parse metadata from decision log file', async () => {
      const mockLogContent = `# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Mode:** Yolo (Autonomous Development)
**Story:** docs/stories/story-6.1.2.6.2.md
**Rollback:** \`git reset --hard abc123\`

---

## Context

**Story Implementation:** 6.1.2.6.2
**Execution Time:** 15m 30s
**Status:** completed

**Files Modified:** 5 files
**Tests Run:** 8 tests
**Decisions Made:** 3 autonomous decisions
`;

      fs.readFile.mockResolvedValue(mockLogContent);

      const metadata = await parseLogMetadata('.ai/decision-log-6.1.2.6.2.md');

      expect(metadata).toBeDefined();
      expect(metadata.storyId).toBe('6.1.2.6.2');
      expect(metadata.agent).toBe('dev');
      expect(metadata.status).toBe('completed');
      expect(metadata.duration).toBe('15m 30s');
      expect(metadata.decisionCount).toBe(3);
      expect(metadata.timestamp).toBeInstanceOf(Date);
    });

    it('should handle missing metadata fields gracefully', async () => {
      const mockLogContent = `# Decision Log: Story test

Some content without proper metadata
`;

      fs.readFile.mockResolvedValue(mockLogContent);

      const metadata = await parseLogMetadata('.ai/decision-log-test.md');

      expect(metadata).toBeDefined();
      expect(metadata.storyId).toBe('test');
      expect(metadata.agent).toBe('unknown');
      expect(metadata.status).toBe('unknown');
      expect(metadata.duration).toBe('0s');
      expect(metadata.decisionCount).toBe(0);
    });

    it('should return null on read error', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const metadata = await parseLogMetadata('.ai/missing.md');

      expect(metadata).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('generateIndexContent', () => {
    it('should generate markdown index from metadata array', () => {
      const metadata = [
        {
          storyId: '6.1.2.6.2',
          timestamp: new Date('2025-11-16T14:30:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '15m 30s',
          decisionCount: 3,
          logPath: '.ai/decision-log-6.1.2.6.2.md',
        },
        {
          storyId: '6.1.2.6.1',
          timestamp: new Date('2025-11-15T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '5m 10s',
          decisionCount: 1,
          logPath: '.ai/decision-log-6.1.2.6.1.md',
        },
      ];

      const indexContent = generateIndexContent(metadata);

      expect(indexContent).toContain('# Decision Log Index');
      expect(indexContent).toContain('Total logs: 2');
      expect(indexContent).toContain('6.1.2.6.2');
      expect(indexContent).toContain('6.1.2.6.1');
      expect(indexContent).toContain('2025-11-16');
      expect(indexContent).toContain('2025-11-15');
      expect(indexContent).toContain('completed');
      expect(indexContent).toContain('15m 30s');
      expect(indexContent).toContain('5m 10s');
      expect(indexContent).toContain('[View](decision-log-6.1.2.6.2.md)');
    });

    it('should sort logs by timestamp (newest first)', () => {
      const metadata = [
        {
          storyId: 'old',
          timestamp: new Date('2025-11-10T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '5m',
          decisionCount: 1,
          logPath: '.ai/decision-log-old.md',
        },
        {
          storyId: 'new',
          timestamp: new Date('2025-11-16T10:00:00.000Z'),
          agent: 'dev',
          status: 'completed',
          duration: '3m',
          decisionCount: 2,
          logPath: '.ai/decision-log-new.md',
        },
      ];

      const indexContent = generateIndexContent(metadata);

      // 'new' should appear before 'old' in the table
      const newIndex = indexContent.indexOf('| new |');
      const oldIndex = indexContent.indexOf('| old |');

      expect(newIndex).toBeLessThan(oldIndex);
    });

    it('should handle empty metadata array', () => {
      const indexContent = generate
```