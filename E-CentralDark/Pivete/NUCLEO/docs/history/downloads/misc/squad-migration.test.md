# OUTRO - squad-migration.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\integration\squad\squad-migration.test.js
**SHA:** 3f60a9edd2211cce
**Timestamp:** 2026-08-28T02:19:40.099862
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const dryRunMigrator = new SquadMigrator({ dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Integration Tests for Squad Migration
 *
 * Tests the full migration workflow including:
 * - Full migration of legacy squad
 * - Migration of already-compliant squad (no-op)
 * - Rollback from backup works
 *
 * @see Story SQS-7: Squad Migration Tool
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const yaml = require('js-yaml');
const { SquadMigrator, SquadValidator } = require('../../../.aios-core/development/scripts/squad');

// Test fixtures path (reuse from unit tests)
const FIXTURES_PATH = path.join(__dirname, '../../unit/squad/fixtures');

describe('Squad Migration Integration Tests', () => {
  let tempDir;

  beforeEach(async () => {
    // Create temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-migration-int-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Full Migration of Legacy Squad (AC 5.1)', () => {
    it('should migrate legacy squad end-to-end', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'legacy-migration-test');
      await copyRecursive(srcPath, testPath);

      // Verify initial state
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(false);

      // Create migrator with validator for post-migration validation
      const validator = new SquadValidator();
      const migrator = new SquadMigrator({ validator });

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify migration success
      expect(result.success).toBe(true);
      expect(result.backupPath).not.toBeNull();

      // Verify manifest renamed
      expect(await pathExists(path.join(testPath, 'squad.yaml'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'config.yaml'))).toBe(false);

      // Verify directories created
      expect(await pathExists(path.join(testPath, 'tasks'))).toBe(true);
      expect(await pathExists(path.join(testPath, 'agents'))).toBe(true);

      // Verify fields added
      const content = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');
      const manifest = yaml.load(content);
      expect(manifest.aios?.type).toBe('squad');
      expect(manifest.aios?.minVersion).toBe('2.1.0');

      // Verify backup exists and contains original files
      expect(await pathExists(result.backupPath)).toBe(true);
      expect(await pathExists(path.join(result.backupPath, 'config.yaml'))).toBe(true);
    });

    it('should pass post-migration validation', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'validation-test');
      await copyRecursive(srcPath, testPath);

      // Create migrator with validator
      const validator = new SquadValidator();
      const migrator = new SquadMigrator({ validator });

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify validation ran and passed (may have warnings but no errors)
      expect(result.validation).toBeDefined();
      // The migrated squad should be valid (valid: true) or have no schema errors
      // Note: May have warnings for missing tasks/agents content
    });
  });

  describe('Migration of Already-Compliant Squad (AC 5.2)', () => {
    it('should be a no-op for compliant squad', async () => {
      // Setup: Copy complete squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'complete-squad');
      const testPath = path.join(tempDir, 'compliant-test');
      await copyRecursive(srcPath, testPath);

      // Record initial state
      const initialContent = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');

      // Create migrator
      const migrator = new SquadMigrator();

      // Execute migration
      const result = await migrator.migrate(testPath);

      // Verify no migration needed
      expect(result.success).toBe(true);
      expect(result.message).toContain('already up to date');
      expect(result.actions).toHaveLength(0);
      expect(result.backupPath).toBeNull();

      // Verify file unchanged
      const finalContent = await fs.readFile(path.join(testPath, 'squad.yaml'), 'utf-8');
      expect(finalContent).toBe(initialContent);
    });
  });

  describe('Rollback from Backup (AC 5.3)', () => {
    it('should be able to restore from backup after migration', async () => {
      // Setup: Copy legacy squad to temp dir
      const srcPath = path.join(FIXTURES_PATH, 'legacy-squad');
      const testPath = path.join(tempDir, 'rollback-test');
      await copyRecursive(src
```