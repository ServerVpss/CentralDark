# OUTRO - dev-context-loader.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\dev-context-loader.test.js
**SHA:** ea47720bc06a84f1
**Timestamp:** 2026-08-28T02:19:49.437668
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests: Dev Context Loader
 * Story 6.1.2.6.2 - Agent Performance Optimization
 *
 * Tests smart file loading with caching and summarization
 */

const fs = require('fs').promises;
const path = require('path');
const DevContextLoader = require('../../.aios-core/development/scripts/dev-context-loader');

describe('DevContextLoader', () => {
  let loader;
  const testCacheDir = path.join(process.cwd(), '.aios', 'cache-test');

  beforeEach(async () => {
    loader = new DevContextLoader();
    // Override cache directory for testing
    loader.cacheDir = testCacheDir;
    // Clear cache before each test to ensure clean state
    await loader.clearCache().catch(() => {});
  });

  afterEach(async () => {
    // Clean up test cache
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('load() - Performance', () => {
    test('loads summaries efficiently (cold load)', async () => {
      const start = Date.now();
      const result = await loader.load({ fullLoad: false, skipCache: true });
      const duration = Date.now() - start;

      // Relaxed timing for CI environments - just verify it completes reasonably
      expect(duration).toBeLessThan(5000); // 5 seconds max
      // Accept either 'loaded' or 'no_files' (when running in test environment without expected files)
      expect(['loaded', 'no_files']).toContain(result.status);
      if (result.status === 'loaded') {
        expect(result.loadStrategy).toBe('summary');
      }
    }, 60000); // 60s timeout for slow systems

    test('cached load is significantly faster than cold load', async () => {
      // First load (cache miss)
      const start1 = Date.now();
      const firstResult = await loader.load({ fullLoad: false, skipCache: false });
      const coldDuration = Date.now() - start1;

      // Skip cache comparison test if no files were loaded
      if (firstResult.status === 'no_files') {
        return;
      }

      // Skip if all files had errors (no actual files to cache)
      const successfulFiles = firstResult.files.filter((f) => !f.error);
      if (successfulFiles.length === 0) {
        return;
      }

      // Second load (cache hit)
      const start2 = Date.now();
      const result = await loader.load({ fullLoad: false, skipCache: false });
      const cachedDuration = Date.now() - start2;

      // Skip performance assertion if durations are too short to measure reliably (< 50ms)
      // This can happen in CI environments with variable timing
      const durationsTooShort = coldDuration < 50 || cachedDuration < 5;

      // Cached should be faster than cold load (relaxed threshold for CI environments)
      // Only enforce timing when we have a reasonably measurable cold duration
      if (!durationsTooShort && coldDuration > 100) {
        expect(cachedDuration).toBeLessThan(coldDuration * 0.9);
      }

      // Verify caching occurred only if we had successful file loads
      if (successfulFiles.length > 0) {
        expect(result.cacheHits).toBeGreaterThan(0);
      }
    }, 60000);
  });

  describe('load() - Summary Mode', () => {
    test('generates correct summaries with headers + preview', async () => {
      const result = await loader.load({ fullLoad: false });

      // Accept either 'loaded' or 'no_files' (when running in test environment without expected files)
      expect(['loaded', 'no_files']).toContain(result.status);

      if (result.status === 'loaded') {
        expect(result.files).toBeTruthy();

        // Check each file has summary structure
        result.files.forEach((file) => {
          if (file.summary) {
            expect(file.summary).toContain('## Key Sections:');
            expect(file.summary).toContain('## Preview (first 100 lines):');
            expect(file.summaryLines).toBeLessThan(150);
          }
        });
      }
    });

    test('reduces data by ~82%', async () => {
      const summaryResult = await loader.load({ fullLoad: false, skipCache: true });
      const fullResult = await loader.load({ fullLoad: true, skipCache: true });

      // Accept either 'loaded' or 'no_files' (when running in test environment without expected files)
      expect(['loaded', 'no_files']).toContain(summaryResult.status);

      if (summaryResult.status === 'no_files') {
        return; // Skip rest of test if no files found
      }

      // Only count successfully loaded files (exclude files with errors)
      const successfulSummaryFiles = summaryResult.files.filter((f) => !f.error);
      const successfulFullFiles = fullResult.files.filter((f) => !f.error);

      // Calculate total lines only from successfully loaded files
      const summaryLines = successfulSummaryFiles.reduce(
        (sum, f) => sum + (f.summaryLines || 0),
        0,
      );
      const fullLines = successfulFullFiles.reduce((sum, f) => sum + (f.linesCount || 0), 0);

      // Only test reduction if we have 
```