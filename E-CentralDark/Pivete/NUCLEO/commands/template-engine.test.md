# COMANDO - template-engine.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\template-engine\template-engine.test.js
**SHA:** 99d902eb2b0522a6
**Timestamp:** 2026-08-28T02:19:43.216939
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: jest.fn().mockResolvedValue({}),
- { name: 'title', type: 'string', required: true, prompt: 'Enter title:' },

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Template Engine v2.0 Test Suite
 * Tests for Story 3.6 - Template Engine Core Refactor
 *
 * Test IDs:
 * - TE-01: Load template with frontmatter
 * - TE-02: Elicit variables interactively
 * - TE-03: Render template with context
 * - TE-04: Validate output with JSON Schema
 * - TE-05: Generate complete document
 * - TE-06: Handle missing variables
 * - TE-07: List supported templates
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;

// Mock inquirer for non-interactive tests
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({}),
}));

const {
  TemplateEngine,
  TemplateLoader,
  VariableElicitation,
  TemplateRenderer,
  TemplateValidator,
  SUPPORTED_TYPES,
} = require('../../.aios-core/product/templates/engine');

const inquirer = require('inquirer');

describe('Template Engine v2.0', () => {
  const baseDir = path.join(__dirname, '..', '..');
  const templatesDir = path.join(baseDir, '.aios-core', 'product', 'templates');
  const schemasDir = path.join(templatesDir, 'engine', 'schemas');

  let engine;

  beforeEach(() => {
    engine = new TemplateEngine({
      baseDir,
      templatesDir,
      schemasDir,
      interactive: false,
    });
    jest.clearAllMocks();
  });

  describe('TE-01: Template Loader', () => {
    let loader;

    beforeEach(() => {
      loader = new TemplateLoader({ templatesDir });
    });

    test('should load template with YAML frontmatter', async () => {
      const template = await loader.load('adr');

      expect(template).toBeDefined();
      expect(template.metadata).toBeDefined();
      expect(template.metadata.template_id).toBe('adr');
      expect(template.metadata.template_name).toBe('Architecture Decision Record');
      expect(template.body).toBeTruthy();
    });

    test('should parse variables from frontmatter', async () => {
      const template = await loader.load('prd');

      expect(template.variables).toBeDefined();
      expect(Array.isArray(template.variables)).toBe(true);
      expect(template.variables.length).toBeGreaterThan(0);

      const titleVar = template.variables.find(v => v.name === 'title');
      expect(titleVar).toBeDefined();
      expect(titleVar.required).toBe(true);
    });

    test('should throw error for missing template', async () => {
      await expect(loader.load('nonexistent')).rejects.toThrow('Template not found');
    });

    test('should cache loaded templates', async () => {
      const template1 = await loader.load('adr');
      const template2 = await loader.load('adr');

      expect(template1).toBe(template2); // Same reference
    });

    test('should list available templates', async () => {
      const templates = await loader.listTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates).toContain('prd');
      expect(templates).toContain('adr');
    });
  });

  describe('TE-02: Variable Elicitation', () => {
    let elicitation;

    beforeEach(() => {
      elicitation = new VariableElicitation({ interactive: false });
    });

    test('should merge provided context with defaults', async () => {
      const variables = [
        { name: 'title', type: 'string', required: true },
        { name: 'status', type: 'choice', default: 'Draft' },
      ];

      const values = await elicitation.elicit(variables, { title: 'Test Title' });

      expect(values.title).toBe('Test Title');
      expect(values.status).toBe('Draft');
    });

    test('should resolve auto values', async () => {
      const variables = [
        { name: 'now', type: 'string', auto: 'current_date' },
      ];

      const values = await elicitation.elicit(variables, {});

      expect(values.now).toBeDefined();
      expect(values.now).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should validate required variables', () => {
      const variables = [
        { name: 'title', required: true },
        { name: 'description', required: false },
      ];

      const result = elicitation.validate(variables, { description: 'test' });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required variable: title');
    });

    test('should handle interactive mode', async () => {
      const interactiveElicitation = new VariableElicitation({ interactive: true });

      inquirer.prompt.mockResolvedValue({ title: 'Interactive Title' });

      const variables = [
        { name: 'title', type: 'string', required: true, prompt: 'Enter title:' },
      ];

      const values = await interactiveElicitation.elicit(variables, {});

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(values.title).toBe('Interactive Title');
    });
  });

  describe('TE-03: Template Renderer', () => {
    let renderer;

    beforeEach(() => {
      renderer = new TemplateRenderer();
    });

    test('should render simple template', () => {
      const template = { body: '# {{title}}\n\nBy {{author}}' };
      const context =
```