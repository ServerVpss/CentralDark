# OUTRO - tool-helper-executor.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\tool-helper-executor.test.js
**SHA:** 3abf37a6574ce896
**Timestamp:** 2026-08-28T02:19:49.253804
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

describe('ToolHelperExecutor', () => {
  describe('Constructor and Helper Management', () => {
    test('should initialize with empty helpers array', () => {
      const executor = new ToolHelperExecutor([]);
      expect(executor.listHelpers()).toEqual([]);
      expect(executor.getStats().count).toBe(0);
    });

    test('should load helpers from constructor', () => {
      const helpers = [
        {
          id: 'test-helper',
          language: 'javascript',
          function: 'function test() { return "result"; }',
        },
      ];

      const executor = new ToolHelperExecutor(helpers);
      expect(executor.hasHelper('test-helper')).toBe(true);
      expect(executor.listHelpers()).toContain('test-helper');
    });

    test('should skip invalid helpers during construction', () => {
      const helpers = [
        { id: 'valid', function: 'function() {}' },
        { id: 'no-function' }, // Missing function
        { function: 'function() {}' }, // Missing id
      ];

      const executor = new ToolHelperExecutor(helpers);
      expect(executor.listHelpers()).toEqual(['valid']);
    });

    test('should add helper dynamically', () => {
      const executor = new ToolHelperExecutor([]);

      executor.addHelper({
        id: 'dynamic-helper',
        function: 'function() { return 42; }',
      });

      expect(executor.hasHelper('dynamic-helper')).toBe(true);
    });

    test('should throw error when adding duplicate helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'existing', function: 'function() {}' },
      ]);

      expect(() => {
        executor.addHelper({ id: 'existing', function: 'function() {}' });
      }).toThrow(/already exists/);
    });

    test('should replace existing helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'replaceable', function: 'function() { return 1; }' },
      ]);

      executor.replaceHelper({
        id: 'replaceable',
        function: 'function() { return 2; }',
      });

      expect(executor.hasHelper('replaceable')).toBe(true);
    });

    test('should remove helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'removable', function: 'function() {}' },
      ]);

      const removed = executor.removeHelper('removable');
      expect(removed).toBe(true);
      expect(executor.hasHelper('removable')).toBe(false);
    });

    test('should clear all helpers', () => {
      const executor = new ToolHelperExecutor([
        { id: 'helper1', function: 'function() {}' },
        { id: 'helper2', function: 'function() {}' },
      ]);

      executor.clearHelpers();
      expect(executor.getStats().count).toBe(0);
    });
  });

  describe('Helper Execution - Success Cases', () => {
    test('should execute simple helper successfully', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'simple-return',
          function: `
            function execute() {
              return 42;
            }
            execute();
          `,
        },
      ]);

      const result = await executor.execute('simple-return');
      expect(result).toBe(42);
    });

    test('should pass args to helper', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'args-helper',
          function: `
            function process() {
              return args.value * 2;
            }
            process();
          `,
        },
      ]);

      const result = await executor.execute('args-helper', { value: 21 });
      expect(result).toBe(42);
    });

    test('should handle complex data structures in args', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'complex-args',
          function: `
            function process() {
              return {
                name: args.user.name.toUpperCase(),
                count: args.items.length,
                total: args.items.reduce((sum, item) => sum + item.value, 0)
              };
            }
            process();
          `,
        },
      ]);

      const result = await executor.execute('complex-args', {
        user: { name: 'test' },
        items: [
          { value: 10 },
          { value: 20 },
          { value: 30 },
        ],
      });

      expect(result).toEqual({
        name: 'TEST',
        count: 3,
        total: 60,
      });
    });

    test('should execute helper with string manipulation', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'string-helper',
          function: `
            function format() {
              return args.text.split(' ').map(w =>
                w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
              ).join(' ');
            }
            format();
          `,
        },
      ]);

      const result = await executor.execute('string-helper', {
     
```