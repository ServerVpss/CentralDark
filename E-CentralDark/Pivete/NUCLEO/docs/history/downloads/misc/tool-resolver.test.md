# OUTRO - tool-resolver.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\tool-resolver.test.js
**SHA:** 130b69523a676bc4
**Timestamp:** 2026-08-28T02:19:49.369608
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - pattern: wrong_usage

### Ouro Bruto (primeiros 5000 chars)
```
// Mock dependencies before requiring
jest.mock('fs-extra');
jest.mock('glob', () => ({
  sync: jest.fn().mockReturnValue([]),
}));

describe('ToolResolver', () => {
  let resolver;
  let fs;
  let glob;
  let path;

  beforeAll(() => {
    // Require modules inside beforeAll to avoid module-level issues
    fs = require('fs-extra');
    glob = require('glob');
    path = require('path');

    // Require ToolResolver after all other modules are loaded
    resolver = require('../../common/utils/tool-resolver');
  });

  const _fixturesPath = () => path.join(__dirname, '../fixtures');

  // Sample tool definitions (with 'tool:' wrapper - matches spec format)
  const simpleToolYaml = `
tool:
  id: test-simple
  type: mcp
  name: Test Simple Tool
  version: 1.0.0
  description: Simple v1.0 tool for testing
  commands:
    - search
    - fetch
  mcp_specific:
    server_command: npx -y test-simple-server
    transport: stdio
`;

  const complexToolYaml = `
tool:
  schema_version: 2.0
  id: test-complex
  type: mcp
  name: Test Complex Tool
  version: 1.0.0
  description: Complex v2.0 tool with executable knowledge
  knowledge_strategy: executable
  commands:
    - create_item
  executable_knowledge:
    validators:
      - id: validate-create-item
        validates: create_item
        language: javascript
        function: |
          function validateCommand(args) {
            return { valid: true, errors: [] };
          }
  mcp_specific:
    server_command: npx -y test-complex-server
    transport: stdio
`;

  const invalidToolYaml = `
tool:
  type: mcp
  name: Invalid Tool
  version: 1.0.0
`;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset glob.sync to return empty array by default
    glob.sync.mockReturnValue([]);

    // Clear cache before each test
    if (resolver.cache) {
      resolver.cache.clear();
    }
  });

  describe('Cache Mechanism', () => {
    test('should cache tool after first resolution', async () => {
      // Mock file system
      glob.sync.mockReturnValue(['aios-core/tools/test-simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      // First call - should read from file
      const tool1 = await resolver.resolveTool('test-simple');
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(tool1.id).toBe('test-simple');

      // Second call - should use cache
      const tool2 = await resolver.resolveTool('test-simple');
      expect(fs.readFile).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(tool2.id).toBe('test-simple');

      // Should be exact same object from cache
      expect(tool1).toBe(tool2);
    });

    test('should use different cache keys for different expansion packs', async () => {
      glob.sync.mockReturnValue(['expansion-packs/pack1/tools/test-tool.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool1 = await resolver.resolveTool('test-simple', { expansionPack: 'pack1' });
      const tool2 = await resolver.resolveTool('test-simple', { expansionPack: 'pack2' });

      // Should have called readFile twice (different cache keys)
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    test('should provide cache clear method', () => {
      // Add items to cache
      resolver.cache.set('test1', { id: 'test1' });
      resolver.cache.set('test2', { id: 'test2' });
      expect(resolver.cache.size).toBe(2);

      // Clear cache
      resolver.clearCache();
      expect(resolver.cache.size).toBe(0);
    });

    test('should provide cache stats', async () => {
      glob.sync.mockReturnValue(['aios-core/tools/test-simple.yaml']);
      fs.readFile.mockResolvedValue(simpleToolYaml);

      await resolver.resolveTool('test-simple');
      await resolver.resolveTool('test-simple'); // Cache hit

      const stats = resolver.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('core:test-simple');
    });
  });

  describe('Search Path Priority', () => {
    test('should prioritize expansion pack tools over core tools', async () => {
      // Mock expansion pack tool found first
      glob.sync.mockImplementation((pattern) => {
        if (pattern.includes('expansion-packs/my-pack')) {
          return ['expansion-packs/my-pack/tools/test-simple.yaml'];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(simpleToolYaml);

      const tool = await resolver.resolveTool('test-simple', { expansionPack: 'my-pack' });

      // Should have searched expansion pack first
      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining('expansion-packs/my-pack/tools'),
      );

      expect(tool.id).toBe('test-simple');
    });

    test('should fall back to core when expansion pack tool not found', async () => {
      // Mock: expansion pack returns empty, core returns tool
      glob.sync.mockImplemen
```