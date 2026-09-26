# OUTRO - tool-validation-helper.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\tool-validation-helper.test.js
**SHA:** 3b9295d54d82458f
**Timestamp:** 2026-08-28T02:19:49.458708
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

describe('ToolValidationHelper', () => {
  describe('Constructor and Validator Management', () => {
    test('should initialize with empty validators array', () => {
      const helper = new ToolValidationHelper([]);
      expect(helper.listValidators()).toEqual([]);
      expect(helper.getStats().count).toBe(0);
    });

    test('should load validators from constructor', () => {
      const validators = [
        {
          validates: 'create_item',
          language: 'javascript',
          function: `
            (function() {
              return { valid: true, errors: [] };
            })();
          `,
        },
      ];

      const helper = new ToolValidationHelper(validators);
      expect(helper.hasValidator('create_item')).toBe(true);
      expect(helper.listValidators()).toContain('create_item');
    });

    test('should skip invalid validators during construction', () => {
      const validators = [
        { validates: 'valid', function: 'function() {}' },
        { validates: 'no-function' }, // Missing function
        { function: 'function() {}' }, // Missing validates
      ];

      const helper = new ToolValidationHelper(validators);
      expect(helper.listValidators()).toEqual(['valid']);
    });

    test('should add validator dynamically', () => {
      const helper = new ToolValidationHelper([]);

      helper.addValidator({
        validates: 'dynamic-command',
        function: '(function() { return { valid: true, errors: [] }; })();',
      });

      expect(helper.hasValidator('dynamic-command')).toBe(true);
    });

    test('should throw error when adding duplicate validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'existing', function: 'function() {}' },
      ]);

      expect(() => {
        helper.addValidator({ validates: 'existing', function: 'function() {}' });
      }).toThrow(/already exists/);
    });

    test('should replace existing validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'replaceable', function: '(function() { return { valid: true, errors: [] }; })();' },
      ]);

      helper.replaceValidator({
        validates: 'replaceable',
        function: '(function() { return { valid: false, errors: ["replaced"] }; })();',
      });

      expect(helper.hasValidator('replaceable')).toBe(true);
    });

    test('should remove validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'removable', function: 'function() {}' },
      ]);

      const removed = helper.removeValidator('removable');
      expect(removed).toBe(true);
      expect(helper.hasValidator('removable')).toBe(false);
    });

    test('should clear all validators', () => {
      const helper = new ToolValidationHelper([
        { validates: 'validator1', function: 'function() {}' },
        { validates: 'validator2', function: 'function() {}' },
      ]);

      helper.clearValidators();
      expect(helper.getStats().count).toBe(0);
    });
  });

  describe('Validation Success/Failure Cases', () => {
    test('should pass validation with valid args', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_item',
          function: `
            (function() {
              if (!args.args.name || !args.args.type) {
                return { valid: false, errors: ['Missing required fields'] };
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('create_item', { name: 'Test', type: 'item' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should fail validation with invalid args', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_item',
          function: `
            (function() {
              if (!args.args.name || !args.args.type) {
                return { valid: false, errors: ['Missing required fields: name, type'] };
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('create_item', { name: 'Test' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required fields: name, type');
    });

    test('should handle complex validation logic', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'update_item',
          function: `
            (function() {
              const errors = [];
              const data = args.args;

              if (!data.id) errors.push('ID is required');
              if (data.priority && (data.priority < 1 || data.priority > 4)) {
                errors.push('Priority must be between 1 and 4');
              }
              
```