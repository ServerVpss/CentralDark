# OUTRO - clickup-helpers.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\clickup-helpers.test.js
**SHA:** 0a9abd0bfb2866d5
**Timestamp:** 2026-08-28T02:19:43.752392
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * ClickUp Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in clickup.yaml:
 * 1. extract-custom-field
 * 2. format-assignee-for-create
 * 3. format-assignee-for-update
 * 4. parse-webhook-type
 * 5. extract-webhook-payload
 * 6. calculate-time-tracking-total
 * 7. format-custom-field-update
 */
describeIntegration('ClickUp Tool Helpers', () => {
  let executor;
  let clickupTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve ClickUp tool
    clickupTool = await toolResolver.resolveTool('clickup');

    // Create executor instance
    executor = new ToolHelperExecutor(clickupTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should have executable_knowledge with helpers', () => {
      expect(clickupTool.executable_knowledge).toBeDefined();
      expect(clickupTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(clickupTool.executable_knowledge.helpers)).toBe(true);
      expect(clickupTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = clickupTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('extract-custom-field');
      expect(helperIds).toContain('format-assignee-for-create');
      expect(helperIds).toContain('format-assignee-for-update');
      expect(helperIds).toContain('parse-webhook-type');
      expect(helperIds).toContain('extract-webhook-payload');
      expect(helperIds).toContain('calculate-time-tracking-total');
      expect(helperIds).toContain('format-custom-field-update');
    });
  });

  describeIntegration('extract-custom-field', () => {
    test('should extract existing custom field by name', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Priority', value: 'High' },
            { name: 'Estimate', value: 1000 },
          ],
        },
        fieldName: 'Priority',
      });

      expect(result).toEqual({ name: 'Priority', value: 'High' });
    });

    test('should return null for non-existent field', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Priority', value: 'High' },
          ],
        },
        fieldName: 'NonExistent',
      });

      expect(result).toBeNull();
    });

    test('should return null if response missing custom_fields', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {},
        fieldName: 'Priority',
      });

      expect(result).toBeNull();
    });

    test('should return null if response is null', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: null,
        fieldName: 'Priority',
      });

      expect(result).toBeNull();
    });

    test('should handle multiple fields with same type', async () => {
      const result = await executor.execute('extract-custom-field', {
        response: {
          custom_fields: [
            { name: 'Field1', value: 'A' },
            { name: 'Field2', value: 'B' },
            { name: 'Field3', value: 'C' },
          ],
        },
        fieldName: 'Field2',
      });

      expect(result).toEqual({ name: 'Field2', value: 'B' });
    });
  });

  describeIntegration('format-assignee-for-create', () => {
    test('should return array as-is', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: [456, 789],
      });

      expect(result).toEqual([456, 789]);
    });

    test('should convert single number to array', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: 456,
      });

      expect(result).toEqual([456]);
    });

    test('should return empty array if assignees is null', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: null,
      });

      expect(result).toEqual([]);
    });

    test('should return empty array if assignees is undefined', async () => {
      const result = await executor.execute('format-assignee-for-create', {});

      expect(result).toEqual([]);
    });

    test('should return empty array for invalid types', async () => {
      const result = await executor.execute('format-assignee-for-create', {
        assignees: 'inval
```