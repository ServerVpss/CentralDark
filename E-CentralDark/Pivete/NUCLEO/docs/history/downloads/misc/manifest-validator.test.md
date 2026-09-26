# OUTRO - manifest-validator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\manifest\manifest-validator.test.js
**SHA:** 1a73aaac0d95af3f
**Timestamp:** 2026-08-28T02:19:49.978260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],
- missing: [],

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Manifest Validator Tests
 *
 * Unit tests for the manifest validation functionality.
 *
 * @module tests/unit/manifest/manifest-validator.test
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const path = require('path');
const fs = require('fs').promises;
const {
  ManifestValidator,
  createManifestValidator,
  parseCSV,
  parseCSVLine,
} = require('../../../.aios-core/core/manifest/manifest-validator');

describe('ManifestValidator', () => {
  const basePath = path.join(__dirname, '..', '..', '..');

  describe('parseCSVLine', () => {
    test('parses simple CSV line', () => {
      const result = parseCSVLine('a,b,c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('parses quoted values with commas', () => {
      const result = parseCSVLine('a,"b,c",d');
      expect(result).toEqual(['a', 'b,c', 'd']);
    });

    test('parses escaped quotes', () => {
      const result = parseCSVLine('a,"say ""hello""",c');
      expect(result).toEqual(['a', 'say "hello"', 'c']);
    });

    test('handles empty values', () => {
      const result = parseCSVLine('a,,c');
      expect(result).toEqual(['a', '', 'c']);
    });

    test('handles trailing empty value', () => {
      const result = parseCSVLine('a,b,');
      expect(result).toEqual(['a', 'b', '']);
    });
  });

  describe('parseCSV', () => {
    test('parses CSV content with header and rows', () => {
      const content = `id,name,status
1,First,active
2,Second,deprecated`;

      const result = parseCSV(content);

      expect(result.header).toEqual(['id', 'name', 'status']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toMatchObject({
        id: '1',
        name: 'First',
        status: 'active',
      });
      expect(result.rows[1]).toMatchObject({
        id: '2',
        name: 'Second',
        status: 'deprecated',
      });
    });

    test('adds line numbers to rows', () => {
      const content = `id,name
1,First
2,Second`;

      const result = parseCSV(content);

      expect(result.rows[0]._lineNumber).toBe(2);
      expect(result.rows[1]._lineNumber).toBe(3);
    });

    test('handles empty content', () => {
      const result = parseCSV('');
      expect(result.header).toEqual([]);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('createManifestValidator', () => {
    test('creates validator with default options', () => {
      const validator = createManifestValidator();
      expect(validator).toBeInstanceOf(ManifestValidator);
    });

    test('creates validator with custom options', () => {
      const validator = createManifestValidator({
        basePath: '/custom',
        verbose: true,
      });
      expect(validator.basePath).toBe('/custom');
      expect(validator.verbose).toBe(true);
    });
  });

  describe('ManifestValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new ManifestValidator({ basePath });
    });

    describe('getAgentsSchema', () => {
      test('returns correct schema for agents', () => {
        const schema = validator.getAgentsSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('name');
        expect(schema.required).toContain('file_path');
        expect(schema.sourceDir).toBe('.aios-core/development/agents');
      });
    });

    describe('getWorkersSchema', () => {
      test('returns correct schema for workers', () => {
        const schema = validator.getWorkersSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('category');
        expect(schema.sourceDir).toBeNull();
      });
    });

    describe('getTasksSchema', () => {
      test('returns correct schema for tasks', () => {
        const schema = validator.getTasksSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('name');
        expect(schema.sourceDir).toBe('.aios-core/development/tasks');
      });
    });

    describe('validateHeader', () => {
      test('returns no errors for valid header', () => {
        const header = ['id', 'name', 'file_path', 'status'];
        const schema = { required: ['id', 'name'] };
        const errors = validator.validateHeader(header, schema);
        expect(errors).toHaveLength(0);
      });

      test('returns errors for missing required columns', () => {
        const header = ['id', 'status'];
        const schema = { required: ['id', 'name', 'file_path'] };
        const errors = validator.validateHeader(header, schema);
        expect(errors).toContain('Missing required column: name');
        expect(errors).toContain('Missing required column: file_path');
      });
    });

    describe('validateAll', () => {
      test('validates all manifests', async () => {
        // First generate manifests to ensure they exist
        const { createManifestGenerator } = require('../../../.aios-core/core/manifest/manifest-generator');
        const
```