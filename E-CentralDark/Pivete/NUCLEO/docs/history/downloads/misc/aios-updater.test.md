# OUTRO - aios-updater.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\updater\aios-updater.test.js
**SHA:** 4543851dcfb57775
**Timestamp:** 2026-08-28T02:19:52.020264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const result = await updater.update({ dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * AIOS Updater Tests
 *
 * @story Epic 7 - CLI Update Command
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const { AIOSUpdater, UpdateStatus, formatCheckResult, formatUpdateResult } = require('../../packages/installer/src/updater');

describe('AIOSUpdater', () => {
  let tempDir;
  let updater;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-updater-test-'));

    // Create minimal .aios-core structure
    await fs.ensureDir(path.join(tempDir, '.aios-core'));
    await fs.ensureDir(path.join(tempDir, '.aios'));

    // Create version.json
    await fs.writeJson(path.join(tempDir, '.aios-core', 'version.json'), {
      version: '1.0.0',
      installedAt: '2025-01-01T00:00:00Z',
      mode: 'project-development',
      fileHashes: {
        'test-file.md': 'sha256:abc123def456',
      },
    });

    updater = new AIOSUpdater(tempDir, { verbose: false });
  });

  afterEach(async () => {
    if (tempDir && fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const u = new AIOSUpdater(tempDir);
      expect(u.projectRoot).toBe(path.resolve(tempDir));
      expect(u.options.verbose).toBe(false);
      expect(u.options.force).toBe(false);
      expect(u.options.preserveAll).toBe(true);
    });

    it('should accept custom options', () => {
      const u = new AIOSUpdater(tempDir, {
        verbose: true,
        force: true,
        preserveAll: false,
        timeout: 60000,
      });
      expect(u.options.verbose).toBe(true);
      expect(u.options.force).toBe(true);
      expect(u.options.preserveAll).toBe(false);
      expect(u.options.timeout).toBe(60000);
    });
  });

  describe('getInstalledVersion', () => {
    it('should read version from version.json', async () => {
      const version = await updater.getInstalledVersion();
      expect(version).toBeDefined();
      expect(version.version).toBe('1.0.0');
      expect(version.mode).toBe('project-development');
    });

    it('should return null if version.json not found', async () => {
      await fs.remove(path.join(tempDir, '.aios-core', 'version.json'));
      const version = await updater.getInstalledVersion();
      expect(version).toBeNull();
    });

    it('should handle corrupted version.json', async () => {
      await fs.writeFile(path.join(tempDir, '.aios-core', 'version.json'), 'invalid json');
      const version = await updater.getInstalledVersion();
      expect(version).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(updater.compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(updater.compareVersions('v1.0.0', '1.0.0')).toBe(0);
    });

    it('should return -1 when first is older', () => {
      expect(updater.compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(updater.compareVersions('1.0.0', '1.1.0')).toBe(-1);
      expect(updater.compareVersions('1.0.0', '2.0.0')).toBe(-1);
    });

    it('should return 1 when first is newer', () => {
      expect(updater.compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(updater.compareVersions('1.1.0', '1.0.0')).toBe(1);
      expect(updater.compareVersions('2.0.0', '1.0.0')).toBe(1);
    });

    it('should handle version prefix v', () => {
      expect(updater.compareVersions('v1.0.0', 'v1.0.0')).toBe(0);
      expect(updater.compareVersions('v1.0.0', '1.0.1')).toBe(-1);
    });
  });

  describe('isBreakingUpdate', () => {
    it('should detect major version change as breaking', () => {
      expect(updater.isBreakingUpdate('1.0.0', '2.0.0')).toBe(true);
      expect(updater.isBreakingUpdate('1.9.9', '2.0.0')).toBe(true);
    });

    it('should not flag minor/patch as breaking', () => {
      expect(updater.isBreakingUpdate('1.0.0', '1.1.0')).toBe(false);
      expect(updater.isBreakingUpdate('1.0.0', '1.0.1')).toBe(false);
    });
  });

  describe('checkConnectivity', () => {
    it('should return boolean', async () => {
      const result = await updater.checkConnectivity();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkForUpdates', () => {
    it('should return installed version', async () => {
      const result = await updater.checkForUpdates();
      expect(result.installed).toBe('1.0.0');
    });

    it('should handle missing installation', async () => {
      await fs.remove(path.join(tempDir, '.aios-core', 'version.json'));
      const result = await updater.checkForUpdates();
      expect(result.status).toBe(UpdateStatus.CHECK_FAILED);
      expect(result.error).toContain('not installed');
    });
  });

  describe('detectCustomizations', () => {
    it('should detect unchanged files', async () => {
      // Create a file with matching hash
      const testFile = path.join(tempDir, '.aios-core', 'test-file.md');
      await fs.writeFile(tes
```