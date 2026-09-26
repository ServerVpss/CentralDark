# MISSAO - squad-analyzer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\squad\squad-analyzer.js
**SHA:** c1f24ab40cb3e726
**Timestamp:** 2026-08-28T02:02:04.539490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = coverage.config.missing || [];
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Squad Analyzer Utility
 *
 * Analyzes existing squads and generates comprehensive reports
 * with component inventory, coverage metrics, and improvement suggestions.
 *
 * Used by: squad-creator agent (*analyze-squad task)
 *
 * @module squad-analyzer
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
 * Component directories in a squad (from squad-schema.json)
 * @constant {string[]}
 */
const COMPONENT_DIRECTORIES = [
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
 * Config files to check for coverage
 * @constant {string[]}
 */
const CONFIG_FILES = [
  'README.md',
  'config/coding-standards.md',
  'config/tech-stack.md',
  'config/source-tree.md',
];

/**
 * Manifest file names in order of preference
 * @constant {string[]}
 */
const MANIFEST_FILES = ['squad.yaml', 'config.yaml'];

/**
 * Error codes for SquadAnalyzerError
 * @enum {string}
 */
const ErrorCodes = {
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  YAML_PARSE_ERROR: 'YAML_PARSE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
};

/**
 * Custom error class for Squad Analyzer operations
 * @extends Error
 */
class SquadAnalyzerError extends Error {
  /**
   * Create a SquadAnalyzerError
   * @param {string} code - Error code from ErrorCodes enum
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadAnalyzerError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadAnalyzerError);
    }
  }

  /**
   * Create error for squad not found
   * @param {string} squadName - Name of the squad
   * @returns {SquadAnalyzerError}
   */
  static squadNotFound(squadName) {
    return new SquadAnalyzerError(
      ErrorCodes.SQUAD_NOT_FOUND,
      `Squad "${squadName}" not found`,
      `Use *list-squads to see available squads, or *create-squad ${squadName} to create it`,
    );
  }

  /**
   * Create error for manifest not found
   * @param {string} squadPath - Path to squad directory
   * @returns {SquadAnalyzerError}
   */
  static manifestNotFound(squadPath) {
    return new SquadAnalyzerError(
      ErrorCodes.MANIFEST_NOT_FOUND,
      `No squad.yaml or config.yaml found in ${squadPath}`,
      'Create squad.yaml with squad metadata',
    );
  }
}

/**
 * Squad Analyzer class for analyzing squad structure and content
 */
class SquadAnalyzer {
  /**
   * Create a SquadAnalyzer instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.squadsPath] - Custom squads directory path
   * @param {boolean} [options.verbose=false] - Enable verbose output
   */
  constructor(options = {}) {
    this.squadsPath = options.squadsPath || DEFAULT_SQUADS_PATH;
    this.verbose = options.verbose || false;
  }

  /**
   * Analyze a squad and generate complete report
   * @param {string} squadName - Name of the squad to analyze
   * @param {Object} [options={}] - Analysis options
   * @param {boolean} [options.suggestions=true] - Include suggestions
   * @param {boolean} [options.verbose=false] - Include file details
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(squadName, options = {}) {
    const includeSuggestions = options.suggestions !== false;
    const verbose = options.verbose || this.verbose;

    const squadPath = path.join(this.squadsPath, squadName);

    // Check if squad exists
    const exists = await this._directoryExists(squadPath);
    if (!exists) {
      throw SquadAnalyzerError.squadNotFound(squadName);
    }

    // Load manifest
    const manifest = await this.loadManifest(squadPath);

    // Build overview
    const overview = this._buildOverview(manifest, squadName);

    // Inventory components
    const inventory = await this.inventoryComponents(squadPath, verbose);

    // Calculate coverage
    const coverage = this.calculateCoverage(inventory, manifest, squadPath);

    // Generate suggestions
    const suggestions = includeSuggestions
      ? this.generateSuggestions(inventory, coverage, manifest)
      : [];

    return {
      overview,
      inventory,
      coverage,
      suggestions,
      squadPath,
    };
  }

  /**
   * Load and parse squad manifest
   * @param {string} squadPath - Path to squad directory
   * @returns {Promise<Object>} Parsed manifest
   */
  async loadManifest(squadPath) {
    for (const manifestFile of MANIFEST_FILES) {
      const manifestPath = path.join(squadPath, manifestFile);
      try {
        const content = await fs.readFile(mani
```