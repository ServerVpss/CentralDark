# OUTRO - n8n-validators.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\n8n-validators.test.js
**SHA:** c0ab930335c9b928
**Timestamp:** 2026-08-28T02:19:43.711250
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
 * n8n Tool Validators Test Suite
 *
 * Tests all 3 validators defined in n8n.yaml:
 * 1. validate-execute-workflow
 * 2. validate-create-workflow
 * 3. validate-credential-operations
 */
describeIntegration('n8n Tool Validators', () => {
  let validator;
  let n8nTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve n8n tool
    n8nTool = await toolResolver.resolveTool('n8n');

    // Create validator instance
    validator = new ToolValidationHelper(n8nTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve n8n tool from aios-core/tools/mcp', async () => {
      expect(n8nTool).toBeDefined();
      expect(n8nTool.id).toBe('n8n');
      expect(n8nTool.type).toBe('mcp');
      expect(n8nTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(n8nTool.executable_knowledge).toBeDefined();
      expect(n8nTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(n8nTool.executable_knowledge.validators)).toBe(true);
      expect(n8nTool.executable_knowledge.validators.length).toBe(5);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = n8nTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-execute-workflow');
      expect(validatorIds).toContain('validate-create-workflow');
      expect(validatorIds).toContain('validate-create-credential');
      expect(validatorIds).toContain('validate-update-credential');
      expect(validatorIds).toContain('validate-delete-credential');
    });
  });

  describeIntegration('validate-execute-workflow', () => {
    test('should pass with valid workflow_id', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass with workflowId (alternative field name)', async () => {
      const result = await validator.validate('execute_workflow', {
        workflowId: 'wf_abc123',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with data object', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        data: { key: 'value' },
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with wait_for_completion boolean', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        wait_for_completion: true,
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without workflow_id', async () => {
      const result = await validator.validate('execute_workflow', {
        data: { key: 'value' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('workflow_id is required');
    });

    test('should fail with non-object data', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        data: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data must be an object');
    });

    test('should fail with non-boolean wait_for_completion', async () => {
      const result = await validator.validate('execute_workflow', {
        workflow_id: 'wf_abc123',
        wait_for_completion: 'yes',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('wait_for_completion must be boolean');
    });
  });

  describeIntegration('validate-create-workflow', () => {
    test('should pass with valid workflow name', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with nodes array', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        nodes: [
          { type: 'n8n-nodes-base.start', name: 'Start' },
          { type: 'n8n-nodes-base.httpRequest', name: 'HTTP Request' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with connections object', async () => {
      const result = await validator.validate('create_workflow', {
        name: 'Test Workflow',
        connections: {
      
```