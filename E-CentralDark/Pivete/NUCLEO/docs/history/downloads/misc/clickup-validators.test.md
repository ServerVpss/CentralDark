# OUTRO - clickup-validators.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\clickup-validators.test.js
**SHA:** ec535e8def5c3207
**Timestamp:** 2026-08-28T02:19:43.717250
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * ClickUp Tool Validators Test Suite
 *
 * Tests all 7 validators defined in clickup.yaml:
 * 1. validate-assignee-format (create_task)
 * 2. validate-custom-field-structure (create_task)
 * 3. validate-task-update-assignees (update_task)
 * 4. validate-webhook-payload (parse_webhook)
 * 5. validate-list-id-format (create_task)
 * 6. validate-priority-range (create_task)
 * 7. validate-time-estimate (create_task)
 */
describeIntegration('ClickUp Tool Validators', () => {
  let validator;
  let clickupTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve ClickUp tool
    clickupTool = await toolResolver.resolveTool('clickup');

    // Create validator instance
    validator = new ToolValidationHelper(clickupTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve clickup tool from aios-core/tools/mcp', async () => {
      expect(clickupTool).toBeDefined();
      expect(clickupTool.id).toBe('clickup');
      expect(clickupTool.type).toBe('mcp');
      expect(clickupTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(clickupTool.executable_knowledge).toBeDefined();
      expect(clickupTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(clickupTool.executable_knowledge.validators)).toBe(true);
      expect(clickupTool.executable_knowledge.validators.length).toBe(3);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = clickupTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-create-task');
      expect(validatorIds).toContain('validate-update-task');
      expect(validatorIds).toContain('validate-webhook-payload');
    });
  });

  describeIntegration('validate-assignee-format (create_task)', () => {
    test('should pass with valid array format', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: [456, 789],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with object format (wrong for create)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        assignees: { add: [456] },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('assignees must be array for create_task, got object');
    });

    test('should fail without required name field', async () => {
      const result = await validator.validate('create_task', {
        list_id: '123456789',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail without required list_id field', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('list_id is required');
    });

    test('should pass without assignees (optional field)', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-custom-field-structure (create_task)', () => {
    test('should pass with valid custom fields array', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { id: 'field-uuid-1', value: 'High' },
          { id: 'field-uuid-2', value: 1000 },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('should fail if custom_fields is not an array', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: 'field-value',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('custom_fields must be an array');
    });

    test('should fail if custom field missing id', async () => {
      const result = await validator.validate('create_task', {
        name: 'Test Task',
        list_id: '123456789',
        custom_fields: [
          { value: 'High' },
        ],
      });

      expect(result.valid).toBe(false);
  
```