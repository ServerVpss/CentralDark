# OUTRO - tools-migration.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\regression\tools-migration.test.js
**SHA:** 2abc29ec4fa9204e
**Timestamp:** 2026-08-28T02:19:43.655929
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const cachedStart = Date.now();
- const start = Date.now();
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration/Performance test - uses describeIntegration
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Tools Migration Regression Test Suite
 *
 * Task 5.3 Requirements:
 * - All existing agent workflows pass unchanged
 * - All existing task workflows pass unchanged
 * - Zero breaking changes in API surface
 * - Verify end-to-end system integrity post-migration
 *
 * This suite tests:
 * 1. Tool resolution API remains stable
 * 2. Validation API remains stable
 * 3. All 12 tools work correctly
 * 4. Agent-tool integration works
 * 5. No regressions in existing functionality
 */
describeIntegration('Tools Migration Regression Suite', () => {
  const toolsPath = path.join(__dirname, '../../.aios-core/tools');

  // All 12 tools (8 v1.0 + 4 v2.0)
  const allTools = [
    'github-cli',
    'railway-cli',
    'supabase-cli',
    'ffmpeg',
    '21st-dev-magic',
    'browser',
    'context7',
    'exa',
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  const v1Tools = [
    'github-cli',
    'railway-cli',
    'supabase-cli',
    'ffmpeg',
    '21st-dev-magic',
    'browser',
    'context7',
    'exa',
  ];

  const v2Tools = [
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  beforeAll(() => {
    toolResolver.setSearchPaths([toolsPath]);
  });

  afterEach(() => {
    toolResolver.clearCache();
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution API Stability', () => {
    test('resolveTool() API unchanged for all 12 tools', async () => {
      const results = [];

      for (const toolName of allTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          hasId: !!tool.id,
          hasType: !!tool.type,
          hasName: !!tool.name,
          hasDescription: !!tool.description,
        });
      }

      // All should have core fields
      results.forEach(result => {
        expect(result.hasId).toBe(true);
        expect(result.hasType).toBe(true);
        expect(result.hasName).toBe(true);
        expect(result.hasDescription).toBe(true);
      });
    });

    test('tool resolution returns same structure as before', async () => {
      const tool = await toolResolver.resolveTool('github-cli');

      // Pre-migration structure still intact
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('type');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('knowledge_strategy');

      // New field added but doesn't break anything
      expect(tool).toHaveProperty('schema_version');
      expect(typeof tool.schema_version).toBe('number');
    });

    test('setSearchPaths() API works as before', () => {
      expect(() => {
        toolResolver.setSearchPaths([toolsPath]);
      }).not.toThrow();
    });

    test('clearCache() API works as before', () => {
      expect(() => {
        toolResolver.clearCache();
      }).not.toThrow();
    });

    test('resetSearchPaths() API works as before', () => {
      expect(() => {
        toolResolver.resetSearchPaths();
      }).not.toThrow();
    });
  });

  describeIntegration('Validation API Stability', () => {
    test('ToolValidationHelper constructor accepts executable_knowledge', () => {
      expect(() => {
        new ToolValidationHelper({ validators: [], helpers: [] });
      }).not.toThrow();
    });

    test('ToolValidationHelper constructor accepts undefined (backward compat)', () => {
      expect(() => {
        new ToolValidationHelper(undefined);
      }).not.toThrow();
    });

    test('validate() method signature unchanged', async () => {
      const validator = new ToolValidationHelper(undefined);

      // Old signature: validate(command, args)
      await expect(async () => {
        await validator.validate('test-command', { arg1: 'value1' });
      }).not.toThrow();
    });

    test('validateBatch() method signature unchanged', async () => {
      const validator = new ToolValidationHelper(undefined);

      // Old signature: validateBatch(operations)
      await expect(async () => {
        await validator.validateBatch([
          { command: 'cmd1', args: {} },
          { command: 'cmd2', args: {} },
        ]);
      }).not.toThrow();
    });

    test('validation returns same result structure', async () => {
      const validator = new ToolValidationHelper(undefined);
      const result = await validator.validate('test', {});

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describeIntegration('End-to-End Tool Workflows', () => {

```