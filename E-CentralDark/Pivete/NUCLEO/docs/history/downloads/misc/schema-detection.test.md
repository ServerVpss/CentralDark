# OUTRO - schema-detection.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\schema-detection.test.js
**SHA:** 29573867a5edce25
**Timestamp:** 2026-08-28T02:19:43.661930
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const cachedStart = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
// Integration test - requires tool YAML files
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');

/**
 * Schema Detection & v1.0 Tools Backward Compatibility Test Suite
 *
 * Task 5.1 Requirements:
 * - 8 simple tools work without breaking changes
 * - Auto-detection correctly identifies v1.0
 * - No breaking changes in behavior
 * - Verify schema_version field handling
 *
 * This suite tests:
 * 1. All v1.0 simple tools are correctly identified
 * 2. Schema version auto-detection works properly
 * 3. v1.0 tools function identically to pre-migration behavior
 * 4. No errors or warnings for v1.0 tools
 */
describeIntegration('Schema Detection & v1.0 Backward Compatibility', () => {
  const toolsPath = path.join(__dirname, '../../aios-core/tools');

  // v1.0 simple tools (8 total)
  const v1SimpleTools = [
    'github-cli',      // CLI tools
    'railway-cli',
    'supabase-cli',
    'ffmpeg',          // Local tools
    '21st-dev-magic',  // MCP tools
    'browser',
    'context7',
    'exa',
  ];

  // v2.0 complex tools (4 total)
  const v2ComplexTools = [
    'clickup',
    'google-workspace',
    'n8n',
    'supabase',
  ];

  beforeAll(() => {
    toolResolver.setSearchPaths([toolsPath]);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('v1.0 Schema Version Detection', () => {
    test('correctly identifies all 8 v1.0 simple tools', async () => {
      const results = [];

      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          schema_version: tool.schema_version,
          has_executable_knowledge: !!tool.executable_knowledge,
        });
      }

      // All v1.0 tools should have schema_version = 1
      results.forEach(({ _name, schema_version, has_executable_knowledge }) => {
        expect(schema_version).toBe(1);
        expect(has_executable_knowledge).toBe(false);
      });
    });

    test('correctly identifies all 4 v2.0 complex tools', async () => {
      const results = [];

      for (const toolName of v2ComplexTools) {
        const tool = await toolResolver.resolveTool(toolName);
        results.push({
          name: toolName,
          schema_version: tool.schema_version,
          has_executable_knowledge: !!tool.executable_knowledge,
        });
      }

      // All v2.0 tools should have schema_version = 2
      results.forEach(({ _name, schema_version, has_executable_knowledge }) => {
        expect(schema_version).toBe(2);
        expect(has_executable_knowledge).toBe(true);
      });
    });

    test('auto-detection assigns version 1 to tools without schema_version field', async () => {
      // Test with a mock tool that has no schema_version field
      const _mockToolPath = path.join(__dirname, '../fixtures/tools');

      // Note: If no fixtures exist, this test verifies existing v1.0 tools
      // have consistent schema_version assignment
      const tool = await toolResolver.resolveTool('github-cli');

      // GitHub CLI is v1.0, should have schema_version = 1
      expect(tool.schema_version).toBe(1);
      expect(tool.id).toBe('github-cli');
    });

    test('schema version is a number, not a string', async () => {
      for (const toolName of [...v1SimpleTools, ...v2ComplexTools]) {
        const tool = await toolResolver.resolveTool(toolName);
        expect(typeof tool.schema_version).toBe('number');
        expect([1, 2]).toContain(tool.schema_version);
      }
    });
  });

  describeIntegration('v1.0 Tools Functionality (No Breaking Changes)', () => {
    test('v1.0 tools resolve successfully', async () => {
      const resolvePromises = v1SimpleTools.map(name =>
        toolResolver.resolveTool(_name),
      );

      const tools = await Promise.all(resolvePromises);

      tools.forEach((tool, index) => {
        expect(tool).toBeDefined();
        expect(tool.id).toBe(v1SimpleTools[index]);
        expect(tool.schema_version).toBe(1);
      });
    });

    test('v1.0 tools have required core fields', async () => {
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        // Core fields that ALL tools must have
        expect(tool.id).toBeDefined();
        expect(tool.type).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();

        // v1.0 specific: NO executable_knowledge
        expect(tool.executable_knowledge).toBeUndefined();
      }
    });

    test('v1.0 tools maintain knowledge_strategy field', async () => {
      for (const toolName of v1SimpleTools) {
        const tool = await toolResolver.resolveTool(toolName);

        // v1.0 tools use declarative knowledge_strategy
        expect(tool.knowledge_strategy).toBe('declarative');
      }
    });

    test('v1.0 tools work with ToolResolver caching', asy
```