# OUTRO - n8n-helpers.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\n8n-helpers.test.js
**SHA:** 7e0ce9c9b81b1ccd
**Timestamp:** 2026-08-28T02:19:43.745049
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * n8n Tool Helpers Test Suite
 *
 * Tests all 7 helpers defined in n8n.yaml:
 * 1. extract-workflow-state
 * 2. validate-node-connections
 * 3. format-workflow-data
 * 4. parse-execution-error
 * 5. validate-credential-type
 * 6. build-workflow-structure
 * 7. calculate-workflow-complexity
 */
describeIntegration('n8n Tool Helpers', () => {
  let executor;
  let n8nTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve n8n tool
    n8nTool = await toolResolver.resolveTool('n8n');

    // Create helper executor instance
    executor = new ToolHelperExecutor(n8nTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve n8n tool with helpers', async () => {
      expect(n8nTool).toBeDefined();
      expect(n8nTool.executable_knowledge).toBeDefined();
      expect(n8nTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(n8nTool.executable_knowledge.helpers)).toBe(true);
      expect(n8nTool.executable_knowledge.helpers.length).toBe(7);
    });

    test('should have all required helper IDs', () => {
      const helperIds = n8nTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('extract-workflow-state');
      expect(helperIds).toContain('validate-node-connections');
      expect(helperIds).toContain('format-workflow-data');
      expect(helperIds).toContain('parse-execution-error');
      expect(helperIds).toContain('validate-credential-type');
      expect(helperIds).toContain('build-workflow-structure');
      expect(helperIds).toContain('calculate-workflow-complexity');
    });
  });

  describeIntegration('extract-workflow-state', () => {
    test('should extract finished workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_123',
          finished: true,
          startedAt: '2024-01-15T10:00:00Z',
          finishedAt: '2024-01-15T10:05:00Z',
          mode: 'manual',
        },
      });

      expect(result).toEqual({
        id: 'exec_123',
        status: 'finished',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: '2024-01-15T10:05:00Z',
        mode: 'manual',
      });
    });

    test('should extract stopped workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_456',
          finished: false,
          stoppedAt: '2024-01-15T10:03:00Z',
          startedAt: '2024-01-15T10:00:00Z',
          mode: 'manual',
        },
      });

      expect(result).toEqual({
        id: 'exec_456',
        status: 'stopped',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: undefined,
        mode: 'manual',
      });
    });

    test('should extract running workflow state', async () => {
      const result = await executor.execute('extract-workflow-state', {
        execution: {
          id: 'exec_789',
          finished: false,
          startedAt: '2024-01-15T10:00:00Z',
          mode: 'trigger',
        },
      });

      expect(result).toEqual({
        id: 'exec_789',
        status: 'running',
        startedAt: '2024-01-15T10:00:00Z',
        finishedAt: undefined,
        mode: 'trigger',
      });
    });

    test('should return null for missing execution', async () => {
      const result = await executor.execute('extract-workflow-state', {});

      expect(result).toBeNull();
    });
  });

  describeIntegration('validate-node-connections', () => {
    test('should validate correct connections', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
          { name: 'HTTP Request', type: 'n8n-nodes-base.httpRequest' },
        ],
        connections: {
          'Start': {
            main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result).toEqual({
        valid: true,
        errors: [],
      });
    });

    test('should detect missing source node', async () => {
      const result = await executor.execute('validate-node-connections', {
        nodes: [
          { name: 'Start', type: 'n8n-nodes-base.start' },
        ],
        connections: {
          'NonExistent': {
            main: [[{ node: 'Start', type: 'main', index: 0 }]],
          },
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toCont
```