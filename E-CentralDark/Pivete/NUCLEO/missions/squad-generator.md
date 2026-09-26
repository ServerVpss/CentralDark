# MISSAO - squad-generator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-generator.js
**SHA:** fa83979eeeac3617
**Timestamp:** 2026-08-28T02:02:04.588571
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Implement extraction logic

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Generator
 *
 * Generates squad structure following task-first architecture.
 * Used by the *create-squad task of the squad-creator agent.
 *
 * @module squad-generator
 * @version 1.0.0
 * @see Story SQS-4: Squad Creator Agent + Tasks
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Default path for squad designs directory
 * @constant {string}
 */
const DEFAULT_DESIGNS_PATH = './squads/.designs';

/**
 * Path to squad design schema
 * @constant {string}
 */
const SQUAD_DESIGN_SCHEMA_PATH = path.join(__dirname, '../../schemas/squad-design-schema.json');

/**
 * Default AIOS minimum version
 * @constant {string}
 */
const DEFAULT_AIOS_MIN_VERSION = '2.1.0';

/**
 * Available templates
 * @constant {string[]}
 */
const AVAILABLE_TEMPLATES = ['basic', 'etl', 'agent-only'];

/**
 * Available config modes
 * @constant {string[]}
 */
const CONFIG_MODES = ['extend', 'override', 'none'];

/**
 * Available licenses
 * @constant {string[]}
 */
const AVAILABLE_LICENSES = ['MIT', 'Apache-2.0', 'ISC', 'UNLICENSED'];

/**
 * Directories to create in squad structure
 * @constant {string[]}
 */
const SQUAD_DIRECTORIES = [
  '',
  'config',
  'agents',
  'tasks',
  'workflows',
  'checklists',
  'templates',
  'tools',
  'scripts',
  'data',
];

/**
 * Error codes for SquadGeneratorError
 * @enum {string}
 */
const GeneratorErrorCodes = {
  INVALID_NAME: 'INVALID_NAME',
  SQUAD_EXISTS: 'SQUAD_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  INVALID_CONFIG_MODE: 'INVALID_CONFIG_MODE',
  BLUEPRINT_NOT_FOUND: 'BLUEPRINT_NOT_FOUND',
  BLUEPRINT_INVALID: 'BLUEPRINT_INVALID',
  BLUEPRINT_PARSE_ERROR: 'BLUEPRINT_PARSE_ERROR',
  SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
};

/**
 * Custom error class for Squad Generator operations
 * @extends Error
 */
class SquadGeneratorError extends Error {
  /**
   * Create a SquadGeneratorError
   * @param {string} code - Error code from GeneratorErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadGeneratorError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadGeneratorError);
    }
  }

  /**
   * Create error for invalid squad name
   * @param {string} name - Invalid name provided
   * @returns {SquadGeneratorError}
   */
  static invalidName(name) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.INVALID_NAME,
      `Invalid squad name "${name}": must be kebab-case (lowercase letters, numbers, hyphens)`,
      'Use format: my-squad-name (lowercase, hyphens only)',
    );
  }

  /**
   * Create error for existing squad
   * @param {string} name - Squad name that exists
   * @param {string} squadPath - Path where squad exists
   * @returns {SquadGeneratorError}
   */
  static squadExists(name, squadPath) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.SQUAD_EXISTS,
      `Squad "${name}" already exists at ${squadPath}`,
      `Choose a different name or delete existing squad: rm -rf ${squadPath}`,
    );
  }

  /**
   * Create error for invalid template
   * @param {string} template - Invalid template name
   * @returns {SquadGeneratorError}
   */
  static templateNotFound(template) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.TEMPLATE_NOT_FOUND,
      `Template "${template}" not found`,
      `Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`,
    );
  }

  /**
   * Create error for invalid config mode
   * @param {string} mode - Invalid config mode
   * @returns {SquadGeneratorError}
   */
  static invalidConfigMode(mode) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.INVALID_CONFIG_MODE,
      `Invalid config mode "${mode}"`,
      `Available modes: ${CONFIG_MODES.join(', ')}`,
    );
  }

  /**
   * Create error for blueprint not found
   * @param {string} blueprintPath - Path that doesn't exist
   * @returns {SquadGeneratorError}
   */
  static blueprintNotFound(blueprintPath) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.BLUEPRINT_NOT_FOUND,
      `Blueprint not found at "${blueprintPath}"`,
      'Generate a blueprint first: *design-squad --docs ./your-docs.md',
    );
  }

  /**
   * Create error for blueprint parse error
   * @param {string} blueprintPath - Path to blueprint
   * @param {string} parseError - Parse error message
   * @returns {SquadGeneratorError}
   */
  static blueprintParseError(blueprintPath, parseError) {
    return new SquadGeneratorError(
      GeneratorErrorCodes.BLUEPRINT_PARSE_ERROR,
      `Failed to parse blueprint at "${blueprintPath
```