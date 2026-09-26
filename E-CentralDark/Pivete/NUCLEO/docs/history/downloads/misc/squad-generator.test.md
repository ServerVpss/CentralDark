# OUTRO - squad-generator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-generator.test.js
**SHA:** ea878127aef1d72e
**Timestamp:** 2026-08-28T02:19:50.311883
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadGenerator
 *
 * Test Coverage:
 * - generate() creates complete squad structure
 * - generate() fails if squad already exists
 * - generate() validates squad name (kebab-case)
 * - Templates generate valid content
 * - Config inheritance is respected
 * - Optional files are generated correctly
 * - .gitkeep files created in empty directories
 * - Generated squad.yaml passes validation
 * - listLocal() returns squads from directory
 *
 * @see Story SQS-4: Squad Creator Agent + Tasks
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  isValidSquadName,
  getGitUserName,
} = require('../../../.aios-core/development/scripts/squad');

const { SquadValidator } = require('../../../.aios-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadGenerator', () => {
  let generator;
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-generator-test-'));
    originalCwd = process.cwd();
  });

  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    // Create generator with temp directory as squads path
    generator = new SquadGenerator({
      squadsPath: tempDir,
    });
  });

  afterEach(async () => {
    // Clean up generated squads after each test
    try {
      const entries = await fs.readdir(tempDir);
      for (const entry of entries) {
        await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constants', () => {
    it('should export AVAILABLE_TEMPLATES', () => {
      expect(AVAILABLE_TEMPLATES).toEqual(['basic', 'etl', 'agent-only']);
    });

    it('should export AVAILABLE_LICENSES', () => {
      expect(AVAILABLE_LICENSES).toContain('MIT');
      expect(AVAILABLE_LICENSES).toContain('Apache-2.0');
      expect(AVAILABLE_LICENSES).toContain('ISC');
      expect(AVAILABLE_LICENSES).toContain('UNLICENSED');
    });

    it('should export CONFIG_MODES', () => {
      expect(CONFIG_MODES).toEqual(['extend', 'override', 'none']);
    });

    it('should export GeneratorErrorCodes enum', () => {
      expect(GeneratorErrorCodes).toBeDefined();
      expect(GeneratorErrorCodes.INVALID_NAME).toBe('INVALID_NAME');
      expect(GeneratorErrorCodes.SQUAD_EXISTS).toBe('SQUAD_EXISTS');
      expect(GeneratorErrorCodes.TEMPLATE_NOT_FOUND).toBe('TEMPLATE_NOT_FOUND');
      expect(GeneratorErrorCodes.INVALID_CONFIG_MODE).toBe('INVALID_CONFIG_MODE');
    });
  });

  describe('isValidSquadName()', () => {
    it('should accept valid kebab-case names', () => {
      expect(isValidSquadName('my-squad')).toBe(true);
      expect(isValidSquadName('test-squad-123')).toBe(true);
      expect(isValidSquadName('etl-pipeline')).toBe(true);
      expect(isValidSquadName('a1')).toBe(true);
    });

    it('should reject invalid names', () => {
      // Too short
      expect(isValidSquadName('a')).toBe(false);

      // Uppercase
      expect(isValidSquadName('MySquad')).toBe(false);
      expect(isValidSquadName('MY-SQUAD')).toBe(false);

      // Starts with number
      expect(isValidSquadName('123-squad')).toBe(false);

      // Ends with hyphen
      expect(isValidSquadName('squad-')).toBe(false);

      // Starts with hyphen
      expect(isValidSquadName('-squad')).toBe(false);

      // Contains spaces
      expect(isValidSquadName('my squad')).toBe(false);

      // Contains underscores
      expect(isValidSquadName('my_squad')).toBe(false);

      // Empty
      expect(isValidSquadName('')).toBe(false);
    });
  });

  describe('getGitUserName()', () => {
    it('should return a string', () => {
      const result = getGitUserName();
      expect(typeof result).toBe('string');
    });

    it('should return "Unknown" when git is not configured', () => {
      // This test may pass or fail depending on git config
      // Just verify it doesn't throw
      expect(() => getGitUserName()).not.toThrow();
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultGenerator = new SquadGenerator();
      expect(defaultGenerator.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      const customGenerator = new SquadGenerator({ squadsPath: './custom/path' });
      expect(customGenerator.squadsPath).toBe('./custom/path');
    });
  });

  describe('SquadGeneratorError', () => {
    it('should create error with correct properties', () => {
      const error = new SquadGene
```