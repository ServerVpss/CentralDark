# OUTRO - supabase-validators.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\supabase-validators.test.js
**SHA:** 07a19a19958a9e24
**Timestamp:** 2026-08-28T02:19:43.446487
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
 * Supabase Tool Validators Test Suite
 *
 * Tests all 5 validators defined in supabase.yaml:
 * 1. validate-execute-sql
 * 2. validate-apply-migration
 * 3. validate-create-branch
 * 4. validate-deploy-edge-function
 * 5. validate-create-project
 */
describeIntegration('Supabase Tool Validators', () => {
  let validator;
  let supabaseTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve supabase tool
    supabaseTool = await toolResolver.resolveTool('supabase');

    // Create validator instance
    validator = new ToolValidationHelper(supabaseTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve supabase tool from aios-core/tools/mcp', async () => {
      expect(supabaseTool).toBeDefined();
      expect(supabaseTool.id).toBe('supabase');
      expect(supabaseTool.type).toBe('mcp');
      expect(supabaseTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(supabaseTool.executable_knowledge).toBeDefined();
      expect(supabaseTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(supabaseTool.executable_knowledge.validators)).toBe(true);
      expect(supabaseTool.executable_knowledge.validators.length).toBe(5);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = supabaseTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-execute-sql');
      expect(validatorIds).toContain('validate-apply-migration');
      expect(validatorIds).toContain('validate-create-branch');
      expect(validatorIds).toContain('validate-deploy-edge-function');
      expect(validatorIds).toContain('validate-create-project');
    });
  });

  describeIntegration('validate-execute-sql', () => {
    test('should pass with valid SQL query', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'SELECT * FROM posts WHERE user_id = auth.uid()',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without project_id', async () => {
      const result = await validator.validate('execute_sql', {
        query: 'SELECT * FROM posts',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('project_id is required');
    });

    test('should fail without query', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('query is required');
    });

    test('should reject DROP TABLE operations', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'DROP TABLE users',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DROP operations not allowed via execute_sql - use apply_migration');
    });

    test('should reject DROP DATABASE operations', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'drop database test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DROP operations not allowed via execute_sql - use apply_migration');
    });

    test('should reject CREATE TABLE (DDL)', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'CREATE TABLE test (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DDL operations not allowed in execute_sql - use apply_migration instead');
    });

    test('should reject ALTER TABLE (DDL)', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'ALTER TABLE users ADD COLUMN email text',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DDL operations not allowed in execute_sql - use apply_migration instead');
    });

    test('should accept DML operations (INSERT, UPDATE, DELETE)', async () => {
      const insertResult = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'INSERT INTO posts (title) VALUES (\'test\')',
      });
      expect(insertResult.valid).toBe(true);

 
```