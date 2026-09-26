# COMANDO - squad-migrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-migrator.js
**SHA:** 9e1fb04272d5652e
**Timestamp:** 2026-08-28T02:02:04.607677
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param {boolean} [options.dryRun=false] - Simulate without modifying files
- this.dryRun = options.dryRun || false;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Migrator Utility
 *
 * Migrates legacy squad formats to AIOS 2.1 standard.
 * Handles manifest, structure, and task format migrations.
 *
 * Used by: squad-creator agent (*migrate-squad task)
 *
 * @module squad-migrator
 * @version 1.0.0
 * @see Story SQS-7: Squad Migration Tool
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Error codes for SquadMigratorError
 * @enum {string}
 */
const MigratorErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  NO_MANIFEST: 'NO_MANIFEST',
  BACKUP_FAILED: 'BACKUP_FAILED',
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PATH: 'INVALID_PATH',
};

/**
 * Custom error class for migration errors
 */
class SquadMigratorError extends Error {
  /**
   * @param {string} code - Error code from MigratorErrorCodes
   * @param {string} message - Human-readable error message
   * @param {Object} [details={}] - Additional error details
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'SquadMigratorError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Migration analysis result structure
 * @typedef {Object} MigrationAnalysis
 * @property {boolean} needsMigration - Whether migration is required
 * @property {Array<MigrationIssue>} issues - Issues found during analysis
 * @property {Array<MigrationAction>} actions - Actions to perform
 * @property {string} squadPath - Analyzed squad path
 */

/**
 * Migration issue structure
 * @typedef {Object} MigrationIssue
 * @property {string} type - Issue type
 * @property {string} message - Human-readable message
 * @property {string} severity - 'error' | 'warning' | 'info'
 */

/**
 * Migration action structure
 * @typedef {Object} MigrationAction
 * @property {string} type - Action type
 * @property {Object} [params] - Action parameters
 */

/**
 * Migration result structure
 * @typedef {Object} MigrationResult
 * @property {boolean} success - Whether migration succeeded
 * @property {string} message - Result message
 * @property {Array<ExecutedAction>} actions - Actions executed
 * @property {Object|null} validation - Post-migration validation result
 * @property {string|null} backupPath - Path to backup directory
 */

/**
 * Squad Migrator class for migrating legacy squad formats
 */
class SquadMigrator {
  /**
   * Create a SquadMigrator instance
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.dryRun=false] - Simulate without modifying files
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {Object} [options.validator=null] - Custom SquadValidator instance
   */
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.validator = options.validator || null;
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   * @private
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadMigrator] ${message}`);
    }
  }

  /**
   * Check if a path exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   * @private
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recursively copy a file or directory
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   * @private
   */
  async _copyRecursive(src, dest) {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src);
      for (const entry of entries) {
        await this._copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      await fs.copyFile(src, dest);
    }
  }

  /**
   * Analyze squad for migration needs
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<MigrationAnalysis>}
   */
  async analyze(squadPath) {
    this._log(`Analyzing squad at: ${squadPath}`);

    // Verify squad directory exists
    if (!(await this._pathExists(squadPath))) {
      throw new SquadMigratorError(
        MigratorErrorCodes.SQUAD_NOT_FOUND,
        `Squad directory not found: ${squadPath}`,
        { squadPath },
      );
    }

    const analysis = {
      needsMigration: false,
      issues: [],
      actions: [],
      squadPath,
    };

    // Check for legacy manifest (config.yaml)
    const hasConfigYaml = await this._pathExists(path.join(squadPath, 'config.yaml'));
    const hasSquadYaml = await this._pathExists(path.join(squadPath, 'squad.yaml'));

    if (!hasConfigYaml && !hasSquadYaml) {
      throw new SquadMigratorError(
        MigratorErrorCodes.NO_MANIFEST,
        'No manifest found (config.yaml or squad.yaml)',
        { squadPath },
      );
    }

    // Check for legacy manifest name
    
```