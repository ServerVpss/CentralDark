# COMANDO - subtask-verifier.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\subtask-verifier.js
**SHA:** ceb0450fa12fa48f
**Timestamp:** 2026-08-28T02:02:14.316822
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- error: `Output did not match pattern: ${config.expectedOutput}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Subtask Verifier - Story 4.5
 *
 * Verifies subtask completion by running type-specific verification commands.
 * Supports: command, api, browser, e2e verification types.
 *
 * @module subtask-verifier
 */

const fs = require('fs').promises;
const path = require('path');

// Optional dependencies with graceful fallback
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

let execa;
try {
  execa = require('execa').execa;
} catch {
  execa = null;
}

let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
  };
}

/**
 * Verification result interface
 * @typedef {Object} VerificationResult
 * @property {string} subtaskId - The subtask identifier
 * @property {boolean} passed - Whether verification passed
 * @property {string} verificationType - Type of verification performed
 * @property {number} duration - Execution time in ms
 * @property {string[]} logs - Execution logs
 * @property {number} attempts - Number of attempts made
 * @property {Error|null} error - Error if failed
 */

/**
 * Verification config from implementation.yaml
 * @typedef {Object} VerificationConfig
 * @property {string} type - Verification type (command, api, browser, e2e)
 * @property {string} [command] - Shell command to run
 * @property {string} [url] - API endpoint URL
 * @property {number} [expectedStatus] - Expected HTTP status
 * @property {Object} [options] - Additional fetch options
 * @property {string} [selector] - Browser selector to check
 * @property {string} [testCommand] - E2E test command
 * @property {number} [timeout] - Verification timeout in seconds
 */

/**
 * SubtaskVerifier - Verifies subtask completion
 */
class SubtaskVerifier {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.implementationPath - Path to implementation.yaml
   * @param {number} [options.timeout=60000] - Default timeout in ms
   * @param {number} [options.maxRetries=3] - Maximum retry attempts
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {string} [options.cwd] - Working directory for commands
   */
  constructor(options = {}) {
    this.implementationPath = options.implementationPath;
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries || 3;
    this.verbose = options.verbose || false;
    this.cwd = options.cwd || process.cwd();
    this.implementation = null;
    this.logs = [];

    // Verify required dependencies
    if (!yaml) {
      throw new Error('js-yaml module not available - install with: npm install js-yaml');
    }
  }

  /**
   * Log message with timestamp
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);

    if (this.verbose) {
      const colorFn =
        {
          info: chalk.blue,
          success: chalk.green,
          error: chalk.red,
          warn: chalk.yellow,
        }[level] || chalk.gray;
      console.log(colorFn(logEntry));
    }
  }

  /**
   * Load implementation.yaml
   * @returns {Promise<Object>}
   */
  async loadImplementation() {
    try {
      const content = await fs.readFile(this.implementationPath, 'utf8');
      this.implementation = yaml.load(content);
      this._log(`Loaded implementation from ${this.implementationPath}`, 'info');
      return this.implementation;
    } catch (error) {
      throw new Error(`Failed to load implementation.yaml: ${error.message}`);
    }
  }

  /**
   * Find subtask by ID in implementation
   * @param {string} subtaskId - Subtask identifier (e.g., '1.1', '2.3')
   * @returns {Object|null}
   */
  findSubtask(subtaskId) {
    if (!this.implementation || !this.implementation.phases) {
      return null;
    }

    for (const phase of this.implementation.phases) {
      if (phase.subtasks) {
        const subtask = phase.subtasks.find((st) => st.id === subtaskId);
        if (subtask) {
          return { ...subtask, phase: phase.id, phaseName: phase.name };
        }
      }
    }
    return null;
  }

  /**
   * Verify a subtask by ID
   * @param {string} subtaskId - Subtask identifier
   * @returns {Promise<VerificationResult>}
   */
  async verify(subtaskId) {
    const startTime = Date.now();
    this.logs = [];

    // Load implementation if not already loaded
    if (!this.implementation) {
      await this.loadImplementation();
    }

    // Find subtask
    const subtask = this.findSubtask(subtaskId);
    if (!subtask) {
      return this._createResult(subtaskId, false, 'unknown', startTime, {
        error: new Error(`Subtask ${subtaskId} not found in implementation`),
      });
    }

    this._log(`Verifying subtask ${subtaskId}: ${subtask.description}`, 'info');

    // Get verification config
    const verif
```