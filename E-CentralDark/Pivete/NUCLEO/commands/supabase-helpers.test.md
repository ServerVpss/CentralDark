# COMANDO - supabase-helpers.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\supabase-helpers.test.js
**SHA:** 1af56944967a3481
**Timestamp:** 2026-08-28T02:19:43.466201
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
 * Supabase Tool Helpers Test Suite
 *
 * Tests all 8 helpers defined in supabase.yaml:
 * 1. build-select-query
 * 2. build-insert-query
 * 3. build-update-query
 * 4. validate-rls-policy
 * 5. format-realtime-subscription
 * 6. validate-table-permissions
 * 7. parse-postgres-error
 * 8. generate-migration-name
 */
describeIntegration('Supabase Tool Helpers', () => {
  let executor;
  let supabaseTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve supabase tool
    supabaseTool = await toolResolver.resolveTool('supabase');

    // Create helper executor instance
    executor = new ToolHelperExecutor(supabaseTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve supabase tool with helpers', async () => {
      expect(supabaseTool).toBeDefined();
      expect(supabaseTool.executable_knowledge).toBeDefined();
      expect(supabaseTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(supabaseTool.executable_knowledge.helpers)).toBe(true);
      expect(supabaseTool.executable_knowledge.helpers.length).toBe(8);
    });

    test('should have all required helper IDs', () => {
      const helperIds = supabaseTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('build-select-query');
      expect(helperIds).toContain('build-insert-query');
      expect(helperIds).toContain('build-update-query');
      expect(helperIds).toContain('validate-rls-policy');
      expect(helperIds).toContain('format-realtime-subscription');
      expect(helperIds).toContain('validate-table-permissions');
      expect(helperIds).toContain('parse-postgres-error');
      expect(helperIds).toContain('generate-migration-name');
    });
  });

  describeIntegration('build-select-query', () => {
    test('should build simple SELECT query', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
      });

      expect(result).toEqual({
        query: 'SELECT * FROM posts',
        requiresRLS: true,
        hint: 'Ensure RLS policies are enabled on this table',
      });
    });

    test('should build SELECT with specific columns', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'users',
        columns: ['id', 'email', 'name'],
      });

      expect(result.query).toBe('SELECT id, email, name FROM users');
      expect(result.requiresRLS).toBe(true);
    });

    test('should build SELECT with WHERE clause', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        where: { user_id: 'abc123', published: true },
      });

      expect(result.query).toContain('SELECT * FROM posts WHERE');
      expect(result.query).toContain("user_id = 'abc123'");
      expect(result.query).toContain('published = true');
    });

    test('should build SELECT with ORDER BY', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        orderBy: 'created_at DESC',
      });

      expect(result.query).toBe('SELECT * FROM posts ORDER BY created_at DESC');
    });

    test('should build SELECT with LIMIT', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        limit: 10,
      });

      expect(result.query).toBe('SELECT * FROM posts LIMIT 10');
    });

    test('should build SELECT with all options', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        columns: ['id', 'title'],
        where: { published: true },
        orderBy: 'created_at DESC',
        limit: 5,
      });

      expect(result.query).toBe('SELECT id, title FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 5');
    });

    test('should skip RLS check when requested', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        checkRLS: false,
      });

      expect(result.requiresRLS).toBe(false);
      expect(result.hint).toBeNull();
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('build-select-query', {});

      expect(result).toEqual({ error: 'Table name is required' });
    });
  });

  describeIntegration('build-insert-query', () => {
    test('should build INSERT query', async () => {
      const result = await executor.execute('build-insert-qu
```