# MISSAO - squad-publisher.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-publisher.js
**SHA:** 329c00fb9d108567
**Timestamp:** 2026-08-28T02:02:04.652281
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param {boolean} [options.dryRun=false] - Simulate without creating PR
- this.dryRun = options.dryRun || false;
- *   console.log('Please run: gh auth login');
- * const dryPublisher = new SquadPublisher({ dryRun: true });
- this._log(`Dry run: ${this.dryRun}`);
- 'Run: gh auth login',

### Padroes
- const SAFE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Publisher Utility
 *
 * Publishes squads to the aios-squads GitHub repository via Pull Request.
 * Requires GitHub CLI (gh) authentication.
 *
 * @module squad-publisher
 * @version 1.0.0
 * @see Story SQS-6: Download & Publish Tasks
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Regex pattern for safe squad/branch names
 * Only allows alphanumerics, hyphens, underscores, and dots
 * @constant {RegExp}
 */
const SAFE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/**
 * Repository for aios-squads
 * @constant {string}
 */
const AIOS_SQUADS_REPO = 'SynkraAI/aios-squads';

/**
 * Error codes for SquadPublisherError
 * @enum {string}
 */
const PublisherErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_ERROR: 'MANIFEST_ERROR',
  GH_CLI_ERROR: 'GH_CLI_ERROR',
  PR_ERROR: 'PR_ERROR',
  FORK_ERROR: 'FORK_ERROR',
  SQUAD_EXISTS_IN_REGISTRY: 'SQUAD_EXISTS_IN_REGISTRY',
  INVALID_SQUAD_NAME: 'INVALID_SQUAD_NAME',
};

/**
 * Sanitize a string for safe use in shell commands and file paths
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
function sanitizeForShell(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  // Replace unsafe characters with hyphens, then collapse multiple hyphens
  return value
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate that a name is safe for use in shell commands
 * @param {string} name - Name to validate
 * @returns {boolean} True if safe
 */
function isValidName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  return SAFE_NAME_PATTERN.test(name);
}

/**
 * Custom error class for Squad Publisher operations
 * @extends Error
 */
class SquadPublisherError extends Error {
  /**
   * Create a SquadPublisherError
   * @param {string} code - Error code from PublisherErrorCodes
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadPublisherError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadPublisherError);
    }
  }

  /**
   * Returns formatted error string
   * @returns {string}
   */
  toString() {
    let str = `[${this.code}] ${this.message}`;
    if (this.suggestion) {
      str += `\n  Suggestion: ${this.suggestion}`;
    }
    return str;
  }
}

/**
 * Squad Publisher class for publishing squads to aios-squads repository
 */
class SquadPublisher {
  /**
   * Create a SquadPublisher instance
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.dryRun=false] - Simulate without creating PR
   * @param {string} [options.repo] - Target repository (default: SynkraAI/aios-squads)
   */
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.repo = options.repo || AIOS_SQUADS_REPO;
  }

  /**
   * Log message if verbose mode is enabled
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadPublisher] ${message}`);
    }
  }

  /**
   * Check GitHub CLI authentication
   *
   * @returns {Promise<{authenticated: boolean, username: string|null}>}
   *
   * @example
   * const publisher = new SquadPublisher();
   * const auth = await publisher.checkAuth();
   * if (!auth.authenticated) {
   *   console.log('Please run: gh auth login');
   * }
   */
  async checkAuth() {
    this._log('Checking GitHub CLI authentication');

    try {
      const result = execSync('gh auth status', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Extract username from output (supports hyphenated GitHub usernames)
      const usernameMatch = result.match(/Logged in to .* as ([\w-]+)/);
      const username = usernameMatch ? usernameMatch[1] : null;

      this._log(`Authenticated as: ${username || 'unknown'}`);
      return { authenticated: true, username };
    } catch {
      this._log('Not authenticated with GitHub CLI');
      return { authenticated: false, username: null };
    }
  }

  /**
   * Publish squad to aios-squads repository
   *
   * @param {string} squadPath - Path to squad directory
   * @param {Object} [options={}] - Publish options
   * @param {string} [options.category='community'] - Category: 'official' or 'community'
   * @returns {Promise<{prUrl: string, branch: string, manifest: object}>}
   * @throws {SquadPublisherError} AUTH_REQUIRED if not authenticated
   * @throws {SquadPublisherError} VALIDATION_FAILED if squad validatio
```