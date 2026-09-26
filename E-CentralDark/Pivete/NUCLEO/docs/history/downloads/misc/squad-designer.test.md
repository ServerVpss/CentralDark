# OUTRO - squad-designer.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-designer.test.js
**SHA:** 1f710e1deabb2f7b
**Timestamp:** 2026-08-28T02:19:50.182851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadDesigner
 *
 * Test Coverage:
 * - analyzeDomain() extracts entities, workflows, integrations, stakeholders
 * - generateAgentRecommendations() creates valid agent structures
 * - generateTaskRecommendations() creates valid task structures
 * - generateBlueprint() creates complete blueprint
 * - saveBlueprint() writes YAML file
 * - collectDocumentation() reads files and text
 * - Confidence scoring works correctly
 * - Deduplication works for similar agents
 *
 * @see Story SQS-9: Squad Designer
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
} = require('../../../.aios-core/development/scripts/squad');

describe('SquadDesigner', () => {
  let designer;
  let tempDir;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-designer-test-'));
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    designer = new SquadDesigner({
      designsPath: tempDir,
    });
  });

  afterEach(async () => {
    try {
      const entries = await fs.readdir(tempDir);
      for (const entry of entries) {
        await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    it('should use default designs path when not specified', () => {
      const defaultDesigner = new SquadDesigner();
      expect(defaultDesigner.designsPath).toBe('./squads/.designs');
    });

    it('should use custom designs path when specified', () => {
      const customDesigner = new SquadDesigner({ designsPath: './custom/path' });
      expect(customDesigner.designsPath).toBe('./custom/path');
    });
  });

  describe('SquadDesignerError', () => {
    it('should create error with correct properties', () => {
      const error = new SquadDesignerError(
        DesignerErrorCodes.NO_DOCUMENTATION,
        'Test message',
        'Test suggestion',
      );

      expect(error.name).toBe('SquadDesignerError');
      expect(error.code).toBe(DesignerErrorCodes.NO_DOCUMENTATION);
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
    });

    it('should create noDocumentation error with correct format', () => {
      const error = SquadDesignerError.noDocumentation();

      expect(error.code).toBe(DesignerErrorCodes.NO_DOCUMENTATION);
      expect(error.suggestion).toContain('--docs');
    });

    it('should create parseError error with correct format', () => {
      const error = SquadDesignerError.parseError('/path/to/file.md', 'Invalid syntax');

      expect(error.code).toBe(DesignerErrorCodes.PARSE_ERROR);
      expect(error.message).toContain('/path/to/file.md');
      expect(error.message).toContain('Invalid syntax');
    });

    it('should create emptyAnalysis error with correct format', () => {
      const error = SquadDesignerError.emptyAnalysis();

      expect(error.code).toBe(DesignerErrorCodes.EMPTY_ANALYSIS);
      expect(error.suggestion).toContain('detailed');
    });
  });

  describe('collectDocumentation()', () => {
    it('should collect text input directly', async () => {
      const result = await designer.collectDocumentation({
        text: 'This is the order management system documentation.',
      });

      expect(result.mergedContent).toContain('order management');
      expect(result.sources.length).toBe(1);
      expect(result.sources[0].type).toBe('text');
    });

    it('should collect from file path', async () => {
      // Create temp doc file
      const docPath = path.join(tempDir, 'test-doc.md');
      await fs.writeFile(docPath, '# Order Management\n\nManage orders and customers.');

      const result = await designer.collectDocumentation({
        docs: [docPath],
      });

      expect(result.mergedContent).toContain('Order Management');
      expect(result.sources.some((s) => s.path === docPath)).toBe(true);
    });

    it('should merge multiple file sources', async () => {
      const doc1Path = path.join(tempDir, 'doc1.md');
      const doc2Path = path.join(tempDir, 'doc2.md');
      await fs.writeFile(doc1Path, 'Document 1 content');
      await fs.writeFile(doc2Path, 'Document 2 content');

      const result = await designer.collectDocumentation({
        docs: [doc1Path, doc2Path],
      });

      expect(result.mergedContent).toContain('Document 1');
      expect(result.mergedContent).toContain('Document 2');
      expect(result.sources.length).toBe(2);
    });

    it('should throw error when no documentation provided', async () => {
      await expect(designer.collectDocumentation({})).rejects.toThrow(SquadDesignerError);
    });

    it('should throw error when file not found', async () => {
      await expect(
        desig
```