# COMANDO - aios-core-installer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\installer\aios-core-installer.js
**SHA:** ce066d2520ab9019
**Timestamp:** 2026-08-28T02:18:59.170496
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: 'echo "Configure your start script"',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * AIOS Core Installer Module
 *
 * Story 1.4/1.6: IDE Selection & Environment Configuration
 * Handles copying .aios-core content (agents, tasks, workflows, templates, etc.)
 * to the target project directory.
 *
 * @module installer/aios-core-installer
 */

const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { hashFile } = require('./file-hasher');

/**
 * Get the path to the source .aios-core directory in the package
 * @returns {string} Absolute path to .aios-core source
 */
function getAiosCoreSourcePath() {
  // Navigate from packages/installer/src/installer/ to project root/.aios-core
  return path.join(__dirname, '..', '..', '..', '..', '.aios-core');
}

/**
 * Folders to copy from .aios-core
 * Includes both v2.1 modular structure and v2.0 legacy flat structure for compatibility
 * @constant {string[]}
 */
const FOLDERS_TO_COPY = [
  // v2.1 Modular Structure (Story 2.15)
  'core',           // Framework utilities, config, registry, migration
  'development',    // Agents, tasks, workflows, scripts, personas
  'product',        // Templates, checklists, cli, api
  'infrastructure', // Hooks, telemetry, integrations, tools

  // v2.0 Legacy Flat Structure (for backwards compatibility)
  'agents',
  'agent-teams',
  'checklists',
  'data',
  'docs',
  'elicitation',
  'scripts',
  'tasks',
  'templates',
  'tools',
  'workflows',

  // Additional directories
  'cli',                    // CLI commands
  'manifests',              // Manifest definitions
  'schemas',                // JSON schemas for validation (*validate-squad, *migrate-squad)
  'workflow-intelligence',  // Workflow intelligence engine (*next, *patterns)
  'monitor',                // Claude Code hooks for monitoring
  'presets',                // Configuration presets
];

/**
 * Root files to copy from .aios-core
 * @constant {string[]}
 */
const ROOT_FILES_TO_COPY = [
  'index.js',
  'index.esm.js',
  'core-config.yaml',   // Core framework configuration
  'package.json',       // Module package definition
  'constitution.md',    // AIOS fundamental principles
  'user-guide.md',
  'working-in-the-brownfield.md',
];

/**
 * Replace {root} placeholder in file content
 * @param {string} content - File content
 * @param {string} rootPath - Replacement path (e.g., '.aios-core')
 * @returns {string} Content with {root} replaced
 */
function replaceRootPlaceholder(content, rootPath = '.aios-core') {
  return content.replace(/\{root\}/g, rootPath);
}

/**
 * Generate file hashes for installed files
 * Story 7.2: Version Tracking
 *
 * @param {string} targetAiosCore - Path to .aios-core directory
 * @param {string[]} installedFiles - List of installed files (relative to .aios-core)
 * @returns {Promise<Object>} Object mapping file paths to their sha256 hashes
 */
async function generateFileHashes(targetAiosCore, installedFiles) {
  const fileHashes = {};

  for (const filePath of installedFiles) {
    const absolutePath = path.join(targetAiosCore, filePath);

    try {
      if (await fs.pathExists(absolutePath)) {
        const stats = await fs.stat(absolutePath);
        if (stats.isFile()) {
          const hash = hashFile(absolutePath);
          fileHashes[filePath] = `sha256:${hash}`;
        }
      }
    } catch (_error) {
      // Skip files that can't be hashed (permissions, etc.)
      continue;
    }
  }

  return fileHashes;
}

/**
 * Generate version.json for installation tracking
 * Story 7.2: Version Tracking - Enables update command to detect changes
 *
 * @param {Object} options - Options
 * @param {string} options.targetAiosCore - Path to .aios-core directory
 * @param {string} options.version - Package version
 * @param {string[]} options.installedFiles - List of installed files
 * @param {string} [options.mode='project-development'] - Installation mode
 * @returns {Promise<Object>} version.json content
 */
async function generateVersionJson(options) {
  const {
    targetAiosCore,
    version,
    installedFiles,
    mode = 'project-development',
  } = options;

  const fileHashes = await generateFileHashes(targetAiosCore, installedFiles);

  const versionJson = {
    version,
    installedAt: new Date().toISOString(),
    mode,
    fileHashes,
    customized: [],
  };

  const versionJsonPath = path.join(targetAiosCore, 'version.json');
  await fs.writeJson(versionJsonPath, versionJson, { spaces: 2 });

  return versionJson;
}

/**
 * Copy a single file with optional {root} replacement
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @param {boolean} replaceRoot - Whether to replace {root} placeholders
 * @returns {Promise<boolean>} Success status
 */
async function copyFileWithRootReplacement(sourcePath, destPath, replaceRoot = true) {
  try {
    await fs.ensureDir(path.dirname(destPath));

    // Check if file needs {root} replacement (.md, .yaml, .yml)
    const ext = path.extname(sourcePath).toLowerCase();
    co
```