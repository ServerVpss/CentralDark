# OUTRO - google-workspace-validators.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\tools\google-workspace-validators.test.js
**SHA:** c378c720200c71ab
**Timestamp:** 2026-08-28T02:19:43.684031
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
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Google Workspace Tool Validators Test Suite
 *
 * Tests all 4 validators defined in google-workspace.yaml:
 * 1. validate-drive-operations (create_file, share_file, update_file)
 * 2. validate-calendar-operations (create_event, update_event)
 * 3. validate-gmail-operations (send_email, search_messages)
 * 4. validate-sheet-operations (create_spreadsheet, update_range)
 */
describeIntegration('Google Workspace Tool Validators', () => {
  let validator;
  let googleWorkspaceTool;

  beforeAll(async () => {
    // Set search path to aios-core/tools
    const toolsPath = path.join(__dirname, '../../aios-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve Google Workspace tool
    googleWorkspaceTool = await toolResolver.resolveTool('google-workspace');

    // Create validator instance
    validator = new ToolValidationHelper(googleWorkspaceTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve google-workspace tool from aios-core/tools/mcp', async () => {
      expect(googleWorkspaceTool).toBeDefined();
      expect(googleWorkspaceTool.id).toBe('google-workspace');
      expect(googleWorkspaceTool.type).toBe('mcp');
      expect(googleWorkspaceTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(googleWorkspaceTool.executable_knowledge).toBeDefined();
      expect(googleWorkspaceTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(googleWorkspaceTool.executable_knowledge.validators)).toBe(true);
      expect(googleWorkspaceTool.executable_knowledge.validators.length).toBe(8);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = googleWorkspaceTool.executable_knowledge.validators.map(v => v.id);
      // Drive operations
      expect(validatorIds).toContain('validate-create-file');
      expect(validatorIds).toContain('validate-share-file');
      // Calendar operations
      expect(validatorIds).toContain('validate-create-event');
      expect(validatorIds).toContain('validate-update-event');
      // Gmail operations
      expect(validatorIds).toContain('validate-send-email');
      expect(validatorIds).toContain('validate-search-messages');
      // Sheet operations
      expect(validatorIds).toContain('validate-create-spreadsheet');
      expect(validatorIds).toContain('validate-update-range');
    });
  });

  describeIntegration('validate-drive-operations (create_file)', () => {
    test('should pass with valid create_file parameters', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'File content here',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass with fileUrl instead of content', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        fileUrl: 'https://example.com/document.pdf',
      });

      expect(result.valid).toBe(true);
    });

    test('should pass with valid mimeType', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'Content',
        mimeType: 'application/pdf',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without name', async () => {
      const result = await validator.validate('create_file', {
        content: 'Some content',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('name is required for create_file');
    });

    test('should fail without content or fileUrl', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('Either content or fileUrl is required for create_file');
    });

    test('should fail with invalid mimeType format', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test Document',
        content: 'Content',
        mimeType: 'invalid-mime',
      });

      expect(result.valid).toBe(false);
      const messages = result.errors.map(e => e.message);
      expect(messages).toContain('Invalid mimeType format');
    });

    test('should pass with complex mimeType', async () => {
      const result = await validator.validate('create_file', {
        name: 'Test',
        co
```