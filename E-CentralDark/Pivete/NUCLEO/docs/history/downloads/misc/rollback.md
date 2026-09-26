# OUTRO - rollback.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\migrate\rollback.js
**SHA:** 15728c7a73fdc403
**Timestamp:** 2026-08-26T19:43:46.823100
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: verification.missing,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Migration Rollback Module
 *
 * Handles rollback from v2.1 back to v2.0 structure using backup.
 *
 * @module cli/commands/migrate/rollback
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const { findLatestBackup, verifyBackup, copyFileWithMetadata } = require('./backup');
const { clearMigrationState } = require('./execute');

/**
 * Remove v2.1 module directories
 * @param {string} aiosCoreDir - Path to .aios-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Removal result
 */
async function removeV21Structure(aiosCoreDir, options = {}) {
  const { onProgress = () => {} } = options;

  const v21Modules = ['core', 'development', 'product', 'infrastructure'];
  const result = {
    removed: [],
    errors: [],
  };

  onProgress({ phase: 'remove', message: '✓ Removing v2.1 structure...' });

  for (const moduleName of v21Modules) {
    const moduleDir = path.join(aiosCoreDir, moduleName);

    if (fs.existsSync(moduleDir)) {
      try {
        await fs.promises.rm(moduleDir, { recursive: true, force: true });
        result.removed.push(moduleDir);
        onProgress({ phase: 'removed', message: `  ✓ Removed ${moduleName}/` });
      } catch (error) {
        result.errors.push({
          path: moduleDir,
          error: error.message,
        });
      }
    }
  }

  return result;
}

/**
 * Restore files from backup
 * @param {Object} backup - Backup info from findLatestBackup
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Restore result
 */
async function restoreFromBackup(backup, projectRoot, options = {}) {
  const { onProgress = () => {}, verifyFirst = true } = options;

  const result = {
    success: false,
    restored: 0,
    errors: [],
    warnings: [],
  };

  // Verify backup integrity first
  if (verifyFirst) {
    onProgress({ phase: 'verify', message: 'Verifying backup integrity...' });

    const verification = await verifyBackup(backup.path);

    if (!verification.valid) {
      result.errors.push({
        type: 'verification',
        message: 'Backup verification failed',
        details: {
          missing: verification.missing,
          failed: verification.failed,
        },
      });
      return result;
    }

    onProgress({ phase: 'verified', message: `  ✓ Verified ${verification.verified} files` });
  }

  const aiosCoreDir = path.join(projectRoot, '.aios-core');
  const backupAiosCoreDir = path.join(backup.path, '.aios-core');

  // Restore .aios-core files
  onProgress({ phase: 'restore', message: '✓ Restoring v2.0 files...' });

  for (const file of backup.manifest.files) {
    try {
      const sourcePath = file.isConfig
        ? path.join(backup.path, file.relativePath)
        : path.join(backupAiosCoreDir, file.relativePath);

      const targetPath = file.isConfig
        ? path.join(projectRoot, file.relativePath)
        : path.join(aiosCoreDir, file.relativePath);

      await copyFileWithMetadata(sourcePath, targetPath);
      result.restored++;

    } catch (error) {
      result.errors.push({
        file: file.relativePath,
        error: error.message,
      });
    }
  }

  onProgress({ phase: 'restored', message: `  ✓ Restored ${result.restored} files` });

  result.success = result.errors.length === 0;

  return result;
}

/**
 * Execute full rollback operation
 * @param {string} projectRoot - Project root
 * @param {Object} options - Options
 * @returns {Promise<Object>} Rollback result
 */
async function executeRollback(projectRoot, options = {}) {
  const { onProgress = () => {}, backupPath = null } = options;

  const result = {
    success: false,
    backup: null,
    removal: null,
    restore: null,
    errors: [],
  };

  // Find backup
  onProgress({ phase: 'find', message: 'Looking for backup...' });

  let backup;

  if (backupPath) {
    // Use specified backup
    const manifestPath = path.join(backupPath, 'backup-manifest.json');

    if (!fs.existsSync(manifestPath)) {
      result.errors.push({ type: 'backup', message: `No manifest found at ${backupPath}` });
      return result;
    }

    const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
    backup = { path: backupPath, manifest };

  } else {
    // Find latest backup
    backup = await findLatestBackup(projectRoot);

    if (!backup) {
      result.errors.push({ type: 'backup', message: 'No backup found. Cannot rollback.' });
      return result;
    }
  }

  result.backup = {
    path: backup.path,
    date: backup.manifest?.created,
    files: backup.manifest?.totalFiles,
    size: backup.manifest?.totalSize,
  };

  onProgress({
    phase: 'found',
    message: `Found backup: ${path.basename(backup.path)}`,
    details: {
      created: backup.manifest?.created,
      files: backup.manifest?.totalFiles,
    },
  });

  // Step 1: Remove v2.1 structure
  const aiosCoreDir = path.joi
```