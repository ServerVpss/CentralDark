# OUTRO - extractor.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\pro\memory\session-digest\extractor.test.js
**SHA:** 0d55d578eee7592a
**Timestamp:** 2026-08-28T02:19:43.527985
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- sessionStart: Date.now() - 60000, // 1 minute ago
- const sessionStart = Date.now() - 120000; // 2 minutes ago

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Session Digest Extractor Tests
 * Story MIS-3: Session Digest (PreCompact Hook)
 *
 * Requires pro/ submodule. Tests skip gracefully in CI
 * where the submodule is not available.
 */

// Mock fs FIRST (before any requires)
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

let extractorModule;
try {
  extractorModule = require('../../../../pro/memory/session-digest/extractor');
} catch (e) {
  // pro/ submodule not available (CI environment)
}

const isProAvailable = !!extractorModule;
const extractSessionDigest = isProAvailable ? extractorModule.extractSessionDigest : undefined;
const _analyzeConversation = isProAvailable ? extractorModule._analyzeConversation : undefined;
const _generateDigestDocument = isProAvailable ? extractorModule._generateDigestDocument : undefined;
const _writeDigest = isProAvailable ? extractorModule._writeDigest : undefined;

(isProAvailable ? describe : describe.skip)('Session Digest Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.promises.mkdir.mockClear();
    fs.promises.writeFile.mockClear();
    fs.promises.mkdir.mockResolvedValue(undefined);
    fs.promises.writeFile.mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('extractSessionDigest', () => {
    it('should extract and write digest successfully', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: {
          messages: [
            { role: 'user', content: 'Actually, the path should be /correct/path' },
            { role: 'assistant', content: 'I understand.' },
          ],
        },
        metadata: {
          sessionStart: Date.now() - 60000, // 1 minute ago
          compactTrigger: 'context_limit_90%',
        },
      };

      const digestPath = await extractSessionDigest(context);

      // Check path contains correct components (cross-platform)
      expect(digestPath).toContain('.aios');
      expect(digestPath).toContain('session-digests');
      expect(digestPath).toContain('test-session-123');
      expect(digestPath).toMatch(/\.yaml$/);
      expect(fs.promises.mkdir).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should handle extraction errors and throw', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: { messages: [] },
      };

      fs.promises.writeFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(extractSessionDigest(context)).rejects.toThrow('Write failed');
    });

    it('should complete within performance budget (< 5s)', async () => {
      const context = {
        sessionId: 'test-session-123',
        projectDir: '/test/project',
        conversation: {
          messages: Array(100).fill({ role: 'user', content: 'Test message' }),
        },
        metadata: {},
      };

      const startTime = Date.now();
      await extractSessionDigest(context);
      const duration = Date.now() - startTime;

      // Should complete in < 5 seconds (story requirement)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('_analyzeConversation', () => {
    it('should extract user corrections', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'user', content: 'Actually, the correct way is to use async/await' },
            { role: 'user', content: 'No, that\'s wrong. Use promises instead' },
          ],
        },
        metadata: {},
      };

      const insights = await _analyzeConversation(context);

      expect(insights.corrections).toHaveLength(2);
      expect(insights.corrections[0]).toContain('Actually');
      expect(insights.corrections[1]).toContain('No');
    });

    it('should identify patterns in conversation', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'user', content: 'How do I create a file?' },
            { role: 'user', content: 'How do I delete a file?' },
            { role: 'user', content: 'How do I read a file?' },
          ],
        },
        metadata: {},
      };

      const insights = await _analyzeConversation(context);

      expect(insights.patterns.length).toBeGreaterThan(0);
      expect(insights.patterns[0]).toContain('how-to');
    });

    it('should extract axioms from conversation', async () => {
      const context = {
        conversation: {
          messages: [
            { role: 'assistant', content: 'Always use ESLint for code quality.' },
     
```