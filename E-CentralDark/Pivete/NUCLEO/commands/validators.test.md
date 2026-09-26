# COMANDO - validators.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\validators.test.js
**SHA:** 122526fa4e2e7535
**Timestamp:** 2026-08-28T02:19:43.248301
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // Missing: name

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires tool YAML files
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Integration Test Suite for Complex Tool Validators
 *
 * AC3 Requirements:
 * - Test ClickUp assignee format validation
 * - Test Google Workspace permission validation
 * - Test n8n workflow validation
 * - Test Supabase RLS policy validation
 *
 * This suite provides integration-level validation testing across all 4 complex tools,
 * ensuring validators work correctly in real-world scenarios.
 */
describeIntegration('Complex Tool Validators - Integration Tests', () => {
  let clickupValidator, googleValidator, n8nValidator, supabaseValidator;

  beforeAll(async () => {
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    const clickupTool = await toolResolver.resolveTool('clickup');
    const googleTool = await toolResolver.resolveTool('google-workspace');
    const n8nTool = await toolResolver.resolveTool('n8n');
    const supabaseTool = await toolResolver.resolveTool('supabase');

    clickupValidator = new ToolValidationHelper(clickupTool.executable_knowledge.validators);
    googleValidator = new ToolValidationHelper(googleTool.executable_knowledge.validators);
    n8nValidator = new ToolValidationHelper(n8nTool.executable_knowledge.validators);
    supabaseValidator = new ToolValidationHelper(supabaseTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('ClickUp Assignee Format Validation', () => {
    test('validates correct assignee format for create_task', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: [456, 789, 101112],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects object format for create_task (expects array)', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: { add: [456], rem: [789] },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.join(' ')).toContain('array');
    });

    test('validates correct assignee format for update_task', async () => {
      const result = await clickupValidator.validate('update_task', {
        task_id: '123',
        assignees: { add: [456], rem: [789] },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects array format for update_task (expects object)', async () => {
      const result = await clickupValidator.validate('update_task', {
        task_id: '123',
        assignees: [456, 789],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates required fields for create_task', async () => {
      const result = await clickupValidator.validate('create_task', {
        list_id: '123456789',
        // Missing: name
      });

      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toMatch(/name.*required/i);
    });

    test('validates list_id format', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: 'short', // Too short
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates priority range (1-4)', async () => {
      const invalidPriority = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 5, // Out of range
      });

      expect(invalidPriority.valid).toBe(false);
      expect(invalidPriority.errors.join(' ')).toMatch(/priority/i);

      const validPriority = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        priority: 2,
      });

      expect(validPriority.valid).toBe(true);
    });

    test('validates custom field structure', async () => {
      const result = await clickupValidator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { id: 'field_123', value: 'test value' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('validates webhook payload structure', async () => {
      const result = await clickupValidator.validate('parse_webhook', {
        event: 'task_created',
        task_id: '123456789',
        webhook_id: 'wh_abc123',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration(
```