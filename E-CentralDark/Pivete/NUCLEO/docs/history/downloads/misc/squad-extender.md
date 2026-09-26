# OUTRO - squad-extender.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-extender.js
**SHA:** a1489000b34226f8
**Timestamp:** 2026-08-28T02:02:04.631018
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const kebabCasePattern = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Extender Utility
 *
 * Extends existing squads with new components (agents, tasks, workflows, etc.)
 * with automatic manifest updates and validation.
 *
 * Used by: squad-creator agent (*extend-squad task)
 *
 * @module squad-extender
 * @version 1.0.0
 * @see Story SQS-11: Squad Analyze & Extend
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default path for squads directory
 * @constant {string}
 */
const DEFAULT_SQUADS_PATH = './squads';

/**
 * Default templates directory path
 * @constant {string}
 */
const DEFAULT_TEMPLATES_PATH = './.aios-core/development/templates/squad';

/**
 * Component types and their configurations
 * @constant {Object}
 */
const COMPONENT_CONFIG = {
  agent: {
    directory: 'agents',
    extension: '.md',
    template: 'agent-template.md',
    manifestKey: 'agents',
  },
  task: {
    directory: 'tasks',
    extension: '.md',
    template: 'task-template.md',
    manifestKey: 'tasks',
  },
  workflow: {
    directory: 'workflows',
    extension: '.yaml',
    template: 'workflow-template.yaml',
    manifestKey: 'workflows',
  },
  checklist: {
    directory: 'checklists',
    extension: '.md',
    template: 'checklist-template.md',
    manifestKey: 'checklists',
  },
  template: {
    directory: 'templates',
    extension: '.md',
    template: 'template-template.md',
    manifestKey: 'templates',
  },
  tool: {
    directory: 'tools',
    extension: '.js',
    template: 'tool-template.js',
    manifestKey: 'tools',
  },
  script: {
    directory: 'scripts',
    extension: '.js',
    template: 'script-template.js',
    manifestKey: 'scripts',
  },
  data: {
    directory: 'data',
    extension: '.yaml',
    template: 'data-template.yaml',
    manifestKey: 'data',
  },
};

/**
 * Manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Error codes for SquadExtenderError
 * @enum {string}
 */
const ErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  MANIFEST_UPDATE_FAILED: 'MANIFEST_UPDATE_FAILED',
  COMPONENT_EXISTS: 'COMPONENT_EXISTS',
  INVALID_COMPONENT_NAME: 'INVALID_COMPONENT_NAME',
  INVALID_COMPONENT_TYPE: 'INVALID_COMPONENT_TYPE',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  CREATION_FAILED: 'CREATION_FAILED',
};

/**
 * Custom error class for Squad Extender operations
 * @extends Error
 */
class SquadExtenderError extends Error {
  /**
   * Create a SquadExtenderError
   * @param {string} code - Error code from ErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadExtenderError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadExtenderError);
    }
  }

  /**
   * Create error for squad not found
   * @param {string} squadName - Name of the squad
   * @returns {SquadExtenderError}
   */
  static squadNotFound(squadName) {
    return new SquadExtenderError(
      ErrorCodes.SQUAD_NOT_FOUND,
      `Squad "${squadName}" not found`,
      `Use *list-squads to see available squads, or *create-squad ${squadName} to create it`,
    );
  }

  /**
   * Create error for manifest not found
   * @param {string} squadPath - Path to squad directory
   * @returns {SquadExtenderError}
   */
  static manifestNotFound(squadPath) {
    return new SquadExtenderError(
      ErrorCodes.MANIFEST_NOT_FOUND,
      `No squad.yaml or config.yaml found in ${squadPath}`,
      'Create squad.yaml with squad metadata',
    );
  }

  /**
   * Create error for component already exists
   * @param {string} filePath - Path to existing component
   * @returns {SquadExtenderError}
   */
  static componentExists(filePath) {
    return new SquadExtenderError(
      ErrorCodes.COMPONENT_EXISTS,
      `Component already exists at ${filePath}`,
      'Use --force to overwrite, or choose a different name',
    );
  }

  /**
   * Create error for invalid component name
   * @param {string} name - Invalid component name
   * @returns {SquadExtenderError}
   */
  static invalidComponentName(name) {
    return new SquadExtenderError(
      ErrorCodes.INVALID_COMPONENT_NAME,
      `Invalid component name: "${name}"`,
      'Use kebab-case (lowercase letters, numbers, and hyphens only)',
    );
  }

  /**
   * Create error for invalid component type
   * @param {string} type - Invalid component type
   * @returns {SquadExtenderError}
   */
  static invalidComponentType(type) {
    const validTypes = Object.keys(COMPONENT_CONFIG).join(', ');
    return new SquadExtenderError(
      ErrorCodes.INVALID_COMPONENT_TYPE,
      `Invalid component type: "${type}"`,
      `Valid types are: ${v
```