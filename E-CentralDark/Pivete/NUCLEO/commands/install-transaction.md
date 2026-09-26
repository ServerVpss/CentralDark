# COMANDO - install-transaction.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\bin\utils\install-transaction.js
**SHA:** 639c1191a437a5bc
**Timestamp:** 2026-08-28T02:02:30.414760
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- throw new Error(`Symlink detected in backup path - potential security risk: ${filePath}`);
- throw new Error(`Symlink detected in backup path - potential security risk: ${dirPath}`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * InstallTransaction - Transaction manager for AIOS installer
 *
 * Provides atomic installation operations with automatic rollback on failure.
 * Backs up files before modification and restores them if installation fails.
 *
 * @module bin/utils/install-transaction
 * @see Story 1.9 - Error Handling & Rollback
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Error classification constants
const ERROR_TYPES = {
  CRITICAL: 'CRITICAL',
  RECOVERABLE: 'RECOVERABLE',
  WARNING: 'WARNING',
};

// Critical errors that trigger immediate rollback
const CRITICAL_ERRORS = [
  'EACCES',   // Permission denied
  'ENOSPC',   // No space left on device
  'EROFS',    // Read-only file system
  'ENOTDIR',  // Not a directory
  'EISDIR',   // Is a directory
];

class InstallTransaction {
  /**
   * Create a new installation transaction
   *
   * @param {Object} options - Transaction options
   * @param {string} [options.backupDir] - Custom backup directory path
   * @param {string} [options.logFile] - Custom log file path
   */
  constructor(options = {}) {
    this.backupDir = options.backupDir || path.join(process.cwd(), '.aios-backup', this._generateTimestamp());
    this.logFile = options.logFile || path.join(process.cwd(), '.aios-install.log');
    this.backups = [];  // [{original, backup, hash, isDirectory}]
    this.operations = [];  // [{timestamp, level, message}]
    this.isCommitted = false;
    this.isRolledBack = false;
  }

  /**
   * Generate timestamp for backup directory naming
   * Format: 2025-01-23_14-30-45-123Z
   *
   * @private
   * @returns {string} ISO timestamp with safe filename characters
   */
  _generateTimestamp() {
    // Replace colons, dots, and T separator for Windows compatibility
    return new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace('T', '_');
  }

  /**
   * Backup a single file before modification
   *
   * @param {string} filePath - Path to file to backup
   * @throws {Error} If backup operation fails
   *
   * @example
   * await transaction.backup('package.json');
   */
  async backup(filePath) {
    const originalPath = path.resolve(filePath);

    // Check if file exists
    if (!(await fs.pathExists(originalPath))) {
      this.log('WARN', `File not found for backup: ${filePath}`);
      return;
    }

    // Prevent symlink attacks (security)
    const stats = await fs.lstat(originalPath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Symlink detected in backup path - potential security risk: ${filePath}`);
    }

    // Skip if already backed up
    if (this.backups.find((b) => b.original === originalPath)) {
      this.log('DEBUG', `File already backed up: ${filePath}`);
      return;
    }

    // Generate unique backup filename using path hash to prevent collisions
    // e.g., /app/config.json and /data/config.json won't overwrite each other
    const pathHash = crypto.createHash('sha256').update(originalPath).digest('hex').substring(0, 8);
    const backupFilename = `${path.basename(filePath)}.${pathHash}.backup`;
    const backupPath = path.join(this.backupDir, backupFilename);
    await fs.ensureDir(this.backupDir);

    // Set restrictive permissions on backup directory (owner only)
    try {
      await fs.chmod(this.backupDir, 0o700);
    } catch (error) {
      // Windows doesn't support chmod - log warning but continue
      this.log('DEBUG', `Could not set backup directory permissions: ${error.message}`);
    }

    await fs.copy(originalPath, backupPath);

    const hash = await this._calculateHash(originalPath);
    this.backups.push({ original: originalPath, backup: backupPath, hash });
    this.log('INFO', `Backed up: ${filePath}`);
  }

  /**
   * Backup entire directory recursively
   *
   * @param {string} dirPath - Path to directory to backup
   * @throws {Error} If backup operation fails
   *
   * @example
   * await transaction.backupDirectory('.aios-core/');
   */
  async backupDirectory(dirPath) {
    const originalPath = path.resolve(dirPath);

    if (!(await fs.pathExists(originalPath))) {
      this.log('WARN', `Directory not found for backup: ${dirPath}`);
      return;
    }

    // Prevent symlink attacks (security) - use lstat to detect symlinks
    const stats = await fs.lstat(originalPath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Symlink detected in backup path - potential security risk: ${dirPath}`);
    }

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    // Skip if already backed up
    if (this.backups.find((b) => b.original === originalPath)) {
      this.log('DEBUG', `Directory already backed up: ${dirPath}`);
      return;
    }

    // Generate unique backup dirname using path hash to prevent collisions
    const pathHash = crypto.createHash('sha256').update(originalPath).digest('hex').substring(0, 8);
    const backupDirname = `${path.basenam
```