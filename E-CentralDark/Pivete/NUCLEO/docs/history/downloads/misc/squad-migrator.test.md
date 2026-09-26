# OUTRO - squad-migrator.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\unit\squad\squad-migrator.test.js
**SHA:** f28e805da039982c
**Timestamp:** 2026-08-28T02:19:50.390808
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRunMigrator = new SquadMigrator({ dryRun: true });
- const start = Date.now();
- const originalExecute = failingMigrator._executeAction.bind(failingMigrator);
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unit Tests for SquadMigrator
 *
 * Test Coverage:
 * - analyze() detects legacy manifest (config.yaml)
 * - analyze() detects flat structure (missing tasks/, agents/)
 * - analyze() detects missing required fields
 * - migrate() creates backup before migration
 * - migrate() renames manifest (config.yaml → squad.yaml)
 * - migrate() creates directories
 * - migrate() adds missing fields
 * - migrate() validates after migration
 * - --dry-run mode doesn't modify files
 * - Error handling for edge cases
 * - generateReport() produces correct output
 * - Coverage >= 80%
 *
 * @see Story SQS-7: Squad Migration Tool
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadMigrator,
  SquadMigratorError,
  MigratorErrorCodes,
} = require('../../../.aios-core/development/scripts/squad');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadMigrator', () => {
  let migrator;
  let dryRunMigrator;
  let verboseMigrator;
  let consoleLogSpy;
  let tempDir;

  beforeEach(async () => {
    // Create migrators with different options
    migrator = new SquadMigrator();
    dryRunMigrator = new SquadMigrator({ dryRun: true });
    verboseMigrator = new SquadMigrator({ verbose: true });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Create temp directory for migration tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-migrator-test-'));
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Constants', () => {
    it('should export MigratorErrorCodes enum', () => {
      expect(MigratorErrorCodes).toBeDefined();
      expect(MigratorErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(MigratorErrorCodes.NO_MANIFEST).toBe('NO_MANIFEST');
      expect(MigratorErrorCodes.BACKUP_FAILED).toBe('BACKUP_FAILED');
      expect(MigratorErrorCodes.MIGRATION_FAILED).toBe('MIGRATION_FAILED');
      expect(MigratorErrorCodes.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(MigratorErrorCodes.INVALID_PATH).toBe('INVALID_PATH');
    });

    it('should export SquadMigratorError class', () => {
      expect(SquadMigratorError).toBeDefined();
      const error = new SquadMigratorError(MigratorErrorCodes.SQUAD_NOT_FOUND, 'Test error', {
        path: '/test',
      });
      expect(error.name).toBe('SquadMigratorError');
      expect(error.code).toBe(MigratorErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toBe('Test error');
      expect(error.details).toEqual({ path: '/test' });
    });
  });

  describe('Constructor', () => {
    it('should disable dryRun mode by default', () => {
      const defaultMigrator = new SquadMigrator();
      expect(defaultMigrator.dryRun).toBe(false);
    });

    it('should enable dryRun mode when specified', () => {
      expect(dryRunMigrator.dryRun).toBe(true);
    });

    it('should disable verbose mode by default', () => {
      const defaultMigrator = new SquadMigrator();
      expect(defaultMigrator.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseMigrator.verbose).toBe(true);
    });

    it('should accept custom validator', () => {
      const mockValidator = { validate: jest.fn() };
      const customMigrator = new SquadMigrator({ validator: mockValidator });
      expect(customMigrator.validator).toBe(mockValidator);
    });
  });

  describe('analyze()', () => {
    it('should throw SQUAD_NOT_FOUND for non-existent directory (AC 3.1)', async () => {
      const fakePath = path.join(FIXTURES_PATH, 'non-existent-squad');

      await expect(migrator.analyze(fakePath)).rejects.toThrow(SquadMigratorError);
      try {
        await migrator.analyze(fakePath);
      } catch (error) {
        expect(error.code).toBe(MigratorErrorCodes.SQUAD_NOT_FOUND);
      }
    });

    it('should throw NO_MANIFEST when no manifest exists (AC 3.2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'invalid-squad');

      await expect(migrator.analyze(squadPath)).rejects.toThrow(SquadMigratorError);
      try {
        await migrator.analyze(squadPath);
      } catch (error) {
        expect(error.code).toBe(MigratorErrorCodes.NO_MANIFEST);
      }
    });

    it('should detect legacy manifest (config.yaml) (AC 2)', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const analysis = await migrator.analyze(squadPath);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.issues.some((i) => i.type === 'LEGACY_MANIFEST')).toBe(true);
      expect(analysis.actions.some((a) => a.type === 'RENAME_MANIFEST')).toBe(true);
    });

    it('should detect flat structure (missing d
```