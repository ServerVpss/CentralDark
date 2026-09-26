# MISSAO - google-workspace-helpers.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\google-workspace-helpers.test.js
**SHA:** 9fd9204a244d5693
**Timestamp:** 2026-08-28T02:19:43.284381
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * Google Workspace Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in google-workspace.yaml:
 * 1. format-oauth-scopes
 * 2. parse-drive-file-id
 * 3. format-calendar-datetime
 * 4. build-gmail-query
 * 5. parse-sheet-range
 * 6. validate-permission-level
 * 7. format-email-attachment
 */
describeIntegration('Google Workspace Tool Helpers', () => {
  let executor;
  let googleWorkspaceTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve Google Workspace tool
    googleWorkspaceTool = await toolResolver.resolveTool('google-workspace');

    // Create executor instance
    executor = new ToolHelperExecutor(googleWorkspaceTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should have executable_knowledge with helpers', () => {
      expect(googleWorkspaceTool.executable_knowledge).toBeDefined();
      expect(googleWorkspaceTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(googleWorkspaceTool.executable_knowledge.helpers)).toBe(true);
      expect(googleWorkspaceTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = googleWorkspaceTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('format-oauth-scopes');
      expect(helperIds).toContain('parse-drive-file-id');
      expect(helperIds).toContain('format-calendar-datetime');
      expect(helperIds).toContain('build-gmail-query');
      expect(helperIds).toContain('parse-sheet-range');
      expect(helperIds).toContain('validate-permission-level');
      expect(helperIds).toContain('format-email-attachment');
    });
  });

  describeIntegration('format-oauth-scopes', () => {
    test('should format single service scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/drive']);
    });

    test('should format multiple service scopes', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'docs', 'sheets'],
      });

      expect(result).toEqual([
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
      ]);
    });

    test('should handle drive.file scope (file-specific access)', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive.file'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/drive.file']);
    });

    test('should handle gmail.send scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['gmail.send'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/gmail.send']);
    });

    test('should handle calendar scope', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['calendar'],
      });

      expect(result).toEqual(['https://www.googleapis.com/auth/calendar']);
    });

    test('should filter out unknown services', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'unknown-service', 'sheets'],
      });

      expect(result).toEqual([
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ]);
    });

    test('should return empty array for non-array input', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: 'drive',
      });

      expect(result).toEqual([]);
    });

    test('should return empty array for null input', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: null,
      });

      expect(result).toEqual([]);
    });

    test('should handle all supported services', async () => {
      const result = await executor.execute('format-oauth-scopes', {
        services: ['drive', 'drive.file', 'docs', 'sheets', 'calendar', 'gmail.send'],
      });

      expect(result).toHaveLength(6);
      expect(result).toContain('https://www.googleapis.com/auth/drive');
      expect(result).toContain('https://www.googleapis.com/auth/drive.file');
      expect(result).toContain('https://www.googleapis.com/auth/documents');
      expect(result).toContain('https://www.
```