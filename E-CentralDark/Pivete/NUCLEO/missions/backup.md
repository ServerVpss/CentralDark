# MISSAO - backup.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\migrate\backup.js
**SHA:** b26e71f60979a2fd
**Timestamp:** 2026-08-26T19:43:46.794589
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Migration Backup Module
 *
 * Handles backup creation, verification, and manifest generation
 * for v2.0 → v2.1 migration.
 *
 * @module cli/commands/migrate/backup
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Create a backup directory name with timestamp
 * @returns {string} Backup directory name
 */
function createBackupDirName() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  return `.aios-backup-${dateStr}`;
}

/**
 * Calculate MD5 checksum for a file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} MD5 checksum
 */
async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Get file stats including permissions
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} File stats
 */
async function getFileStats(filePath) {
  const stats = await fs.promises.stat(filePath);
  return {
    size: stats.size,
    mode: stats.mode,
    mtime: stats.mtime.toISOString(),
    isDirectory: stats.isDirectory(),
  };
}

/**
 * Copy file with metadata preservation
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @returns {Promise<Object>} Copy result with checksum
 */
async function copyFileWithMetadata(src, dest) {
  const stats = await fs.promises.stat(src);

  // Ensure destination directory exists
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });

  // Copy file
  await fs.promises.copyFile(src, dest);

  // Preserve timestamps and permissions
  await fs.promises.utimes(dest, stats.atime, stats.mtime);
  await fs.promises.chmod(dest, stats.mode);

  // Calculate checksum
  const checksum = await calculateChecksum(dest);

  return {
    src,
    dest,
    size: stats.size,
    mode: stats.mode,
    checksum,
  };
}

/**
 * Recursively get all files in a directory
 * @param {string} dir - Directory path
 * @param {string[]} [fileList] - Accumulated file list
 * @returns {Promise<string[]>} Array of file paths
 */
async function getAllFiles(dir, fileList = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Create backup of .aios-core directory
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Backup options
 * @param {boolean} options.verbose - Show detailed progress
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Backup result
 */
async function createBackup(projectRoot, options = {}) {
  const { verbose = false, onProgress = () => {} } = options;

  const aiosCoreDir = path.join(projectRoot, '.aios-core');
  const backupDirName = createBackupDirName();
  const backupDir = path.join(projectRoot, backupDirName);

  // Check if .aios-core exists
  if (!fs.existsSync(aiosCoreDir)) {
    throw new Error('No .aios-core directory found. Is this an AIOS v2.0 project?');
  }

  // Check if backup already exists
  if (fs.existsSync(backupDir)) {
    throw new Error(`Backup directory ${backupDirName} already exists. Remove it or use a different name.`);
  }

  onProgress({ phase: 'start', message: 'Creating backup directory...' });

  // Create backup directory
  await fs.promises.mkdir(backupDir, { recursive: true });

  // Get all files to backup
  const files = await getAllFiles(aiosCoreDir);
  const manifest = {
    version: '2.0',
    created: new Date().toISOString(),
    projectRoot,
    backupDir,
    files: [],
    totalSize: 0,
    totalFiles: files.length,
    checksums: {},
  };

  onProgress({ phase: 'copying', message: `Backing up ${files.length} files...`, total: files.length });

  // Copy each file
  for (let i = 0; i < files.length; i++) {
    const srcFile = files[i];
    const relativePath = path.relative(aiosCoreDir, srcFile);
    const destFile = path.join(backupDir, '.aios-core', relativePath);

    const result = await copyFileWithMetadata(srcFile, destFile);

    manifest.files.push({
      relativePath,
      size: result.size,
      mode: result.mode,
      checksum: result.checksum,
    });
    manifest.checksums[relativePath] = result.checksum;
    manifest.totalSize += result.size;

    if (verbose) {
      onProgress({ phase: 'file', message: `  → ${relativePath}`, current: i + 1, total: files.length });
    }
  }

  // Backup config files if they exist
  const configFiles = [
    'aios.config.js',
    'aios.config.json',
    '
```