# OUTRO - update-imports.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\migrate\update-imports.js
**SHA:** c400cafbb407f19a
**Timestamp:** 2026-08-26T19:43:46.831611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { dryRun = false, verbose = false } = options;
- const { verbose = false, dryRun = false, onProgress = () => {} } = options;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Import Path Update Module
 *
 * Scans and updates require/import paths after migration.
 *
 * @module cli/commands/migrate/update-imports
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const { MODULE_MAPPING, categorizeFile } = require('./analyze');

/**
 * Regex patterns for import detection
 */
const IMPORT_PATTERNS = {
  // require('./path') or require('../path')
  commonjs: /require\s*\(\s*['"`](\.[^'"`]+)['"`]\s*\)/g,

  // import from './path' or import from '../path'
  esm: /from\s+['"`](\.[^'"`]+)['"`]/g,

  // import('./path') dynamic imports
  dynamicImport: /import\s*\(\s*['"`](\.[^'"`]+)['"`]\s*\)/g,

  // /// <reference path="./path" />
  tsReference: /\/\/\/\s*<reference\s+path=['"`](\.[^'"`]+)['"`]\s*\/>/g,
};

/**
 * Build path transformation map for the migration
 * @param {Object} plan - Migration plan
 * @returns {Map<string, string>} Old path to new path map
 */
function buildPathTransformMap(plan) {
  const transformMap = new Map();

  for (const [moduleName, moduleData] of Object.entries(plan.modules)) {
    for (const file of moduleData.files) {
      // Store both with and without extension
      const oldPath = file.relativePath;
      const newPath = path.join(moduleName, file.relativePath);

      transformMap.set(oldPath, newPath);

      // Also store without .js extension for require compatibility
      if (oldPath.endsWith('.js')) {
        const noExt = oldPath.slice(0, -3);
        const newNoExt = newPath.slice(0, -3);
        transformMap.set(noExt, newNoExt);
      }
    }
  }

  return transformMap;
}

/**
 * Scan a file for import statements
 * @param {string} filePath - Path to file
 * @returns {Promise<Object[]>} Array of import info
 */
async function scanFileImports(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const imports = [];

  for (const [patternName, pattern] of Object.entries(IMPORT_PATTERNS)) {
    // Reset regex lastIndex
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push({
        type: patternName,
        fullMatch: match[0],
        importPath: match[1],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  return imports;
}

/**
 * Transform an import path from v2.0 to v2.1 structure
 * @param {string} importPath - Original import path
 * @param {string} currentFileModule - Module of the file containing the import
 * @param {string} currentFilePath - Path of the file containing the import
 * @param {Map} transformMap - Path transformation map
 * @returns {string|null} Transformed path or null if no change needed
 */
function transformImportPath(importPath, currentFileModule, currentFilePath, transformMap) {
  // Resolve the import path relative to the current file
  const currentDir = path.dirname(currentFilePath);
  const resolvedPath = path.normalize(path.join(currentDir, importPath));

  // Check if this path needs transformation
  // We need to detect if it's pointing to a file that moved

  // For paths starting with ../, they might reference files now in different modules
  if (importPath.startsWith('../') || importPath.startsWith('./')) {
    // This is a complex transformation - need to figure out what file it's importing
    // and where that file now lives

    // For now, we'll use heuristics:
    // 1. If the path goes up to .aios-core root and then into a folder, update it

    const parts = importPath.split('/');
    let upCount = 0;
    const restParts = [];

    for (const part of parts) {
      if (part === '..') {
        upCount++;
      } else if (part !== '.') {
        restParts.push(part);
      }
    }

    // If going up enough to reach .aios-core root
    if (restParts.length > 0) {
      const targetDir = restParts[0];

      // Find which module this directory belongs to
      for (const [moduleName, config] of Object.entries(MODULE_MAPPING)) {
        if (config.directories.includes(targetDir)) {
          // This needs to be updated to go through the module directory
          // New path: go up, then into module, then the rest

          // Calculate how to get from current location to target
          const newParts = [];

          // From current file's module directory
          // Current structure after migration: .aios-core/{module}/...
          // Need to go to: .aios-core/{targetModule}/...

          if (currentFileModule === moduleName) {
            // Same module, just adjust the path
            return importPath; // No change needed within same module
          } else {
            // Different module, need to go up and into the other module
            // Example: from development/agents/ to core/registry/
            // Need: ../../core/registry/...

            const currentDepth = currentFilePath.split(path.sep).length - 1;
            const ups = '../'.repeat(currentDepth + 1); // +1 to get
```