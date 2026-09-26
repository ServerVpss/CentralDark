# COMANDO - squad-designer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-designer.js
**SHA:** 101cbb7d6ded0d6f
**Timestamp:** 2026-08-28T02:02:04.562697
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const capitalizedPattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\b/g;
- const quotedPattern = /[`"']([A-Za-z][A-Za-z0-9_]+)[`"']/g;
- const pattern = new RegExp(`\\b${action}[\\s-]+([a-z]+)`, 'gi');
- const stepPattern = /(?:^|\n)\s*(?:\d+\.|[-*])\s*([A-Za-z]+)\s+(?:the\s+)?([a-z]+)/gi;
- const apiPattern = /(?:api|endpoint)[:\s]+([a-z/_-]+)/gi;
- const pattern = new RegExp(`\\b${role}s?\\b`, 'gi');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Designer
 *
 * Analyzes documentation and generates squad blueprints
 * with intelligent agent and task recommendations.
 *
 * @module squad-designer
 * @version 1.0.0
 * @see Story SQS-9: Squad Designer
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default output path for blueprints
 * @constant {string}
 */
const DEFAULT_DESIGNS_PATH = './squads/.designs';

/**
 * Minimum confidence threshold for recommendations
 * @constant {number}
 */
const MIN_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Keywords that indicate workflow actions
 * @constant {string[]}
 */
const ACTION_KEYWORDS = [
  'create', 'add', 'new', 'generate', 'build',
  'update', 'edit', 'modify', 'change', 'patch',
  'delete', 'remove', 'cancel', 'archive',
  'get', 'fetch', 'retrieve', 'list', 'search', 'find', 'query',
  'process', 'handle', 'manage', 'execute', 'run',
  'validate', 'verify', 'check', 'approve', 'reject',
  'send', 'notify', 'alert', 'email', 'publish',
  'import', 'export', 'sync', 'migrate', 'transform',
  'login', 'logout', 'authenticate', 'authorize',
  'upload', 'download', 'save', 'load',
];

/**
 * Keywords that indicate integrations
 * @constant {string[]}
 */
const INTEGRATION_KEYWORDS = [
  'api', 'rest', 'graphql', 'webhook', 'endpoint',
  'database', 'db', 'sql', 'nosql', 'redis', 'postgres', 'mysql', 'mongodb',
  'aws', 'azure', 'gcp', 'cloud', 's3', 'lambda',
  'stripe', 'paypal', 'payment', 'gateway',
  'slack', 'discord', 'email', 'sms', 'twilio',
  'oauth', 'jwt', 'auth0', 'firebase',
  'github', 'gitlab', 'bitbucket',
  'docker', 'kubernetes', 'k8s',
];

/**
 * Keywords that indicate stakeholder roles
 * @constant {string[]}
 */
const ROLE_KEYWORDS = [
  'user', 'admin', 'administrator', 'manager', 'owner',
  'customer', 'client', 'buyer', 'seller', 'vendor',
  'developer', 'engineer', 'devops', 'qa', 'tester',
  'analyst', 'designer', 'architect',
  'operator', 'support', 'agent', 'representative',
];

/**
 * Error codes for SquadDesignerError
 * @enum {string}
 */
const DesignerErrorCodes = {
  NO_DOCUMENTATION: 'NO_DOCUMENTATION',
  PARSE_ERROR: 'PARSE_ERROR',
  EMPTY_ANALYSIS: 'EMPTY_ANALYSIS',
  BLUEPRINT_EXISTS: 'BLUEPRINT_EXISTS',
  INVALID_BLUEPRINT: 'INVALID_BLUEPRINT',
  SAVE_ERROR: 'SAVE_ERROR',
};

/**
 * Custom error class for Squad Designer operations
 * @extends Error
 */
class SquadDesignerError extends Error {
  /**
   * Create a SquadDesignerError
   * @param {string} code - Error code from DesignerErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadDesignerError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadDesignerError);
    }
  }

  /**
   * Create error for no documentation provided
   * @returns {SquadDesignerError}
   */
  static noDocumentation() {
    return new SquadDesignerError(
      DesignerErrorCodes.NO_DOCUMENTATION,
      'No documentation provided for analysis',
      'Provide documentation via --docs flag or paste text interactively',
    );
  }

  /**
   * Create error for parse failure
   * @param {string} filePath - Path that failed to parse
   * @param {string} reason - Parse failure reason
   * @returns {SquadDesignerError}
   */
  static parseError(filePath, reason) {
    return new SquadDesignerError(
      DesignerErrorCodes.PARSE_ERROR,
      `Failed to parse documentation: ${filePath} - ${reason}`,
      'Check file format (supported: .md, .yaml, .yml, .json, .txt)',
    );
  }

  /**
   * Create error for empty analysis result
   * @returns {SquadDesignerError}
   */
  static emptyAnalysis() {
    return new SquadDesignerError(
      DesignerErrorCodes.EMPTY_ANALYSIS,
      'No domain concepts could be extracted from documentation',
      'Provide more detailed documentation with clear entities and workflows',
    );
  }

  /**
   * Create error for existing blueprint
   * @param {string} blueprintPath - Path where blueprint exists
   * @returns {SquadDesignerError}
   */
  static blueprintExists(blueprintPath) {
    return new SquadDesignerError(
      DesignerErrorCodes.BLUEPRINT_EXISTS,
      `Blueprint already exists at ${blueprintPath}`,
      'Use --force to overwrite or choose a different output path',
    );
  }
}

/**
 * Squad Designer class
 * Analyzes documentation and generates squad blueprints
 */
class SquadDesigner {
  /**
   * Create a SquadDesigner
   * @param {Object} options - Designer options
   * @param {string} [options.designsPath] - Path to designs directory
   */
  constructor(options = {}) {
    this.designsPath = options.designsPath || DEFAULT_DESIGNS_PATH;
  }

  // ===========================================================================
  // DOCUMENTATION COLLECTION
  // ====================
```