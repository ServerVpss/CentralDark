# COMANDO - doc-generator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\documentation-integrity\doc-generator.test.js
**SHA:** 587c105040fd7d72
**Timestamp:** 2026-08-28T02:19:49.832540
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const results = generateDocs(tempDir, context, { dryRun: true });
- const results = generateDocs(tempDir, context, { dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Documentation Generator Unit Tests
 *
 * @module tests/unit/documentation-integrity/doc-generator
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  buildDocContext,
  renderTemplate,
  loadTemplate,
  generateDocs,
  generateDoc,
  TemplateFiles,
  OutputFiles,
} = require('../../../.aios-core/infrastructure/scripts/documentation-integrity/doc-generator');

describe('Documentation Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-docgen-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('buildDocContext', () => {
    it('should build context for Node.js project', () => {
      const markers = {
        hasPackageJson: true,
        hasTsconfig: true,
      };

      const context = buildDocContext('my-project', 'greenfield', markers);

      expect(context.PROJECT_NAME).toBe('my-project');
      expect(context.INSTALLATION_MODE).toBe('greenfield');
      expect(context.IS_NODE).toBe(true);
      expect(context.IS_TYPESCRIPT).toBe(true);
      expect(context.FILE_EXT).toBe('ts');
      expect(context.TECH_STACK).toContain('Node.js');
    });

    it('should build context for Python project', () => {
      const markers = {
        hasPythonProject: true,
      };

      const context = buildDocContext('py-project', 'brownfield', markers);

      expect(context.IS_PYTHON).toBe(true);
      expect(context.PYTHON_PACKAGE_NAME).toBe('py_project');
      expect(context.TECH_STACK).toContain('Python');
    });

    it('should build context for Go project', () => {
      const markers = {
        hasGoMod: true,
      };

      const context = buildDocContext('go-service', 'greenfield', markers);

      expect(context.IS_GO).toBe(true);
      expect(context.GO_MODULE).toContain('go-service');
      expect(context.TECH_STACK).toContain('Go');
    });

    it('should build context for Rust project', () => {
      const markers = {
        hasCargoToml: true,
      };

      const context = buildDocContext('rust-app', 'greenfield', markers);

      expect(context.IS_RUST).toBe(true);
      expect(context.TECH_STACK).toContain('Rust');
    });

    it('should apply overrides', () => {
      const markers = { hasPackageJson: true };
      const overrides = {
        NODE_VERSION: '20+',
        DEPLOYMENT_PLATFORM: 'Railway',
      };

      const context = buildDocContext('test', 'greenfield', markers, overrides);

      expect(context.NODE_VERSION).toBe('20+');
      expect(context.DEPLOYMENT_PLATFORM).toBe('Railway');
    });

    it('should include generation date', () => {
      const context = buildDocContext('test', 'greenfield', {});
      const today = new Date().toISOString().split('T')[0];

      expect(context.GENERATED_DATE).toBe(today);
    });

    it('should handle multi-stack projects', () => {
      const markers = {
        hasPackageJson: true,
        hasPythonProject: true,
      };

      const context = buildDocContext('full-stack', 'brownfield', markers);

      expect(context.IS_NODE).toBe(true);
      expect(context.IS_PYTHON).toBe(true);
      expect(context.TECH_STACK).toContain('Node.js');
      expect(context.TECH_STACK).toContain('Python');
    });
  });

  describe('renderTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}!';
      const context = { name: 'World' };

      const result = renderTemplate(template, context);

      expect(result).toBe('Hello World!');
    });

    it('should handle multiple variables', () => {
      const template = '{{greeting}} {{name}}, welcome to {{place}}!';
      const context = { greeting: 'Hello', name: 'User', place: 'AIOS' };

      const result = renderTemplate(template, context);

      expect(result).toBe('Hello User, welcome to AIOS!');
    });

    it('should process if blocks with true condition', () => {
      const template = '{{#if IS_NODE}}Node.js project{{/if}}';
      const context = { IS_NODE: true };

      const result = renderTemplate(template, context);

      expect(result).toBe('Node.js project');
    });

    it('should process if blocks with false condition', () => {
      const template = '{{#if IS_NODE}}Node.js project{{/if}}';
      const context = { IS_NODE: false };

      const result = renderTemplate(template, context);

      expect(result).toBe('');
    });

    it('should process nested if blocks', () => {
      const template = '{{#if IS_NODE}}{{#if IS_TYPESCRIPT}}TS{{/if}}{{/if}}';
      const context = { IS_NODE: true, IS_TYPESCRIPT: true };

      const result = renderTemplate(template, context);

      expect(result).toBe('TS');
    });

    it('should process each blocks', () => {
      const template = '{{#each items}}{{this}},{{/each}}';
      const context = { items: ['a', 'b', 'c'] };

      const result = renderTempla
```