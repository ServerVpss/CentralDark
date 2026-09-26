# COMANDO - squad-extender.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-extender.test.js
**SHA:** 466a78e79102c6f8
**Timestamp:** 2026-08-28T02:19:50.243628
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadExtender
 *
 * Test Coverage:
 * - addComponent() creates component file from template
 * - addComponent() validates inputs correctly
 * - addComponent() updates manifest
 * - updateManifest() preserves existing content
 * - listAgents() returns available agents
 * - Security: path traversal prevention
 * - Security: overwrite protection
 * - Error handling for all error codes
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const fs = require('fs').promises;
const {
  SquadExtender,
  SquadExtenderError,
  ErrorCodes,
  COMPONENT_CONFIG,
} = require('../../../.aios-core/development/scripts/squad/squad-extender');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');
const TEMP_PATH = path.join(__dirname, 'temp-extend-test');

describe('SquadExtender', () => {
  let extender;
  let verboseExtender;

  beforeEach(async () => {
    extender = new SquadExtender({ squadsPath: FIXTURES_PATH });
    verboseExtender = new SquadExtender({ squadsPath: FIXTURES_PATH, verbose: true });

    // Create temp directory for tests that modify files
    await fs.mkdir(TEMP_PATH, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constants', () => {
    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.COMPONENT_EXISTS).toBe('COMPONENT_EXISTS');
      expect(ErrorCodes.INVALID_COMPONENT_NAME).toBe('INVALID_COMPONENT_NAME');
      expect(ErrorCodes.INVALID_COMPONENT_TYPE).toBe('INVALID_COMPONENT_TYPE');
      expect(ErrorCodes.AGENT_NOT_FOUND).toBe('AGENT_NOT_FOUND');
      expect(ErrorCodes.PATH_TRAVERSAL).toBe('PATH_TRAVERSAL');
    });

    it('should export COMPONENT_CONFIG object', () => {
      expect(COMPONENT_CONFIG).toBeDefined();
      expect(COMPONENT_CONFIG.agent).toBeDefined();
      expect(COMPONENT_CONFIG.task).toBeDefined();
      expect(COMPONENT_CONFIG.workflow).toBeDefined();
      expect(COMPONENT_CONFIG.checklist).toBeDefined();
      expect(COMPONENT_CONFIG.template).toBeDefined();
      expect(COMPONENT_CONFIG.tool).toBeDefined();
      expect(COMPONENT_CONFIG.script).toBeDefined();
      expect(COMPONENT_CONFIG.data).toBeDefined();
    });

    it('should have correct configuration for each component type', () => {
      expect(COMPONENT_CONFIG.agent.directory).toBe('agents');
      expect(COMPONENT_CONFIG.agent.extension).toBe('.md');

      expect(COMPONENT_CONFIG.task.directory).toBe('tasks');
      expect(COMPONENT_CONFIG.task.extension).toBe('.md');

      expect(COMPONENT_CONFIG.tool.directory).toBe('tools');
      expect(COMPONENT_CONFIG.tool.extension).toBe('.js');

      expect(COMPONENT_CONFIG.workflow.directory).toBe('workflows');
      expect(COMPONENT_CONFIG.workflow.extension).toBe('.yaml');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultExtender = new SquadExtender();
      expect(defaultExtender.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      expect(extender.squadsPath).toBe(FIXTURES_PATH);
    });

    it('should disable verbose mode by default', () => {
      expect(extender.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseExtender.verbose).toBe(true);
    });
  });

  describe('SquadExtenderError', () => {
    it('should create error with code and message', () => {
      const error = new SquadExtenderError('TEST_ERROR', 'Test message', 'Test suggestion');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.name).toBe('SquadExtenderError');
    });

    it('should create squadNotFound error with static method', () => {
      const error = SquadExtenderError.squadNotFound('my-squad');
      expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toContain('my-squad');
    });

    it('should create componentExists error with static method', () => {
      const error = SquadExtenderError.componentExists('agents/test.md');
      expect(error.code).toBe(ErrorCodes.COMPONENT_EXISTS);
      expect(error.suggestion).toContain('--force');
    });

    it('should create invalidComponentName error with static method', () => {
      const error = SquadExtenderError.invalidComponentName('Invalid_Name');
      expect(error.code).toBe(ErrorCodes.INVALID_COMPONENT_NAME);
      expect(error.suggestion).toContain('kebab-case');
    });

    it('should create invalidComponentType error with static method
```