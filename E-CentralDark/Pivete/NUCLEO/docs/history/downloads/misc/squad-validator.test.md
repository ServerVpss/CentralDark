# OUTRO - squad-validator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-validator.test.js
**SHA:** b821bfbcfec99092
**Timestamp:** 2026-08-28T02:19:50.418244
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadValidator
 *
 * Test Coverage:
 * - validate() runs all checks and returns correct result
 * - validateManifest() validates against JSON Schema
 * - validateManifest() warns on deprecated config.yaml
 * - validateManifest() returns error for missing manifest
 * - validateManifest() returns error for malformed YAML
 * - validateStructure() checks for expected directories
 * - validateStructure() validates referenced files exist
 * - validateTasks() checks TASK-FORMAT-SPECIFICATION-V1 fields
 * - validateAgents() checks agent definition format
 * - strict mode treats warnings as errors
 * - formatResult() produces correct output
 * - Performance metrics within targets
 *
 * @see Story SQS-3: Squad Validator + JSON Schema
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,
} = require('../../../.aios-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadValidator', () => {
  let validator;
  let strictValidator;
  let verboseValidator;
  let consoleLogSpy;

  beforeEach(() => {
    // Create validators with different options
    validator = new SquadValidator();
    strictValidator = new SquadValidator({ strict: true });
    verboseValidator = new SquadValidator({ verbose: true });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should export ValidationErrorCodes enum', () => {
      expect(ValidationErrorCodes).toBeDefined();
      expect(ValidationErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ValidationErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ValidationErrorCodes.SCHEMA_ERROR).toBe('SCHEMA_ERROR');
      expect(ValidationErrorCodes.DEPRECATED_MANIFEST).toBe('DEPRECATED_MANIFEST');
      expect(ValidationErrorCodes.MISSING_DIRECTORY).toBe('MISSING_DIRECTORY');
      expect(ValidationErrorCodes.NO_TASKS).toBe('NO_TASKS');
      expect(ValidationErrorCodes.TASK_MISSING_FIELD).toBe('TASK_MISSING_FIELD');
      expect(ValidationErrorCodes.AGENT_INVALID_FORMAT).toBe('AGENT_INVALID_FORMAT');
      expect(ValidationErrorCodes.FILE_NOT_FOUND).toBe('FILE_NOT_FOUND');
      expect(ValidationErrorCodes.INVALID_NAMING).toBe('INVALID_NAMING');
    });

    it('should export TASK_REQUIRED_FIELDS with correct fields', () => {
      expect(TASK_REQUIRED_FIELDS).toBeDefined();
      expect(Array.isArray(TASK_REQUIRED_FIELDS)).toBe(true);
      expect(TASK_REQUIRED_FIELDS).toContain('task');
      expect(TASK_REQUIRED_FIELDS).toContain('responsavel');
      expect(TASK_REQUIRED_FIELDS).toContain('atomic_layer');
      expect(TASK_REQUIRED_FIELDS).toContain('Entrada');
      expect(TASK_REQUIRED_FIELDS).toContain('Saida');
      expect(TASK_REQUIRED_FIELDS).toContain('Checklist');
    });
  });

  describe('Constructor', () => {
    it('should disable strict mode by default', () => {
      const defaultValidator = new SquadValidator();
      expect(defaultValidator.strict).toBe(false);
    });

    it('should enable strict mode when specified', () => {
      expect(strictValidator.strict).toBe(true);
    });

    it('should disable verbose mode by default', () => {
      const defaultValidator = new SquadValidator();
      expect(defaultValidator.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseValidator.verbose).toBe(true);
    });

    it('should accept custom schema for testing', () => {
      const customSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      };
      const customValidator = new SquadValidator({ schema: customSchema });
      expect(customValidator.validateSchema).toBeDefined();
    });
  });

  describe('validateManifest()', () => {
    it('should pass for valid squad.yaml (AC 3.1)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return MANIFEST_NOT_FOUND error when no manifest exists (AC 3.2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');
      const result = await validator.validateManifest(squadPath);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ValidationErrorCodes.MANIFEST_NOT_FOUND);
      expect(result.errors[0].suggestion).toContain('squad.yaml');
    });

    it('should return YAML_PARSE_ERROR for malformed YAML (AC 3.3)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'malformed-squad');
      const result = await validator.val
```