# OUTRO - validate-manifest.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\scripts\validate-manifest.js
**SHA:** 3527786d99700153
**Timestamp:** 2026-08-28T02:19:08.578081
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.log('To fix, run: npm run generate:manifest');

### Gaps
- console.log(`🗑️  REMOVED FILES (${result.removedFiles.length}) - in manifest but missing:`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Validate Install Manifest
 * Ensures install-manifest.yaml is up-to-date with actual files
 *
 * @script scripts/validate-manifest.js
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 *
 * Usage:
 *   node scripts/validate-manifest.js
 *   npm run validate:manifest
 *
 * Exit codes:
 *   0 - Manifest is valid and up-to-date
 *   1 - Manifest is outdated or has issues
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFile } = require('../packages/installer/src/installer/file-hasher');
const {
  scanDirectory,
  FOLDERS_TO_COPY,
  ROOT_FILES_TO_COPY,
  getFileType,
} = require('./generate-install-manifest');

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether manifest is valid
 * @property {string[]} newFiles - Files in filesystem but not in manifest
 * @property {string[]} removedFiles - Files in manifest but not in filesystem
 * @property {string[]} modifiedFiles - Files with different hashes
 * @property {string[]} errors - Error messages
 */

/**
 * Load and parse the install manifest
 * @returns {Object|null} - Parsed manifest or null if not found
 */
function loadManifest() {
  const manifestPath = path.join(__dirname, '..', '.aios-core', 'install-manifest.yaml');

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  return yaml.load(content);
}

/**
 * Get current files from filesystem
 * @returns {Map<string, Object>} - Map of relativePath -> file metadata
 */
function getCurrentFiles() {
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  const filesMap = new Map();

  // Scan folders
  const allFiles = [];
  for (const folder of FOLDERS_TO_COPY) {
    const folderPath = path.join(aiosCoreDir, folder);
    if (fs.existsSync(folderPath)) {
      scanDirectory(folderPath, aiosCoreDir, allFiles);
    }
  }

  // Add root files
  for (const file of ROOT_FILES_TO_COPY) {
    const filePath = path.join(aiosCoreDir, file);
    if (fs.existsSync(filePath)) {
      allFiles.push(filePath);
    }
  }

  // Build map
  for (const fullPath of allFiles) {
    const relativePath = path.relative(aiosCoreDir, fullPath).replace(/\\/g, '/');
    try {
      const hash = hashFile(fullPath);
      filesMap.set(relativePath, {
        path: relativePath,
        hash: `sha256:${hash}`,
        type: getFileType(relativePath),
      });
    } catch (error) {
      console.warn(`Warning: Could not hash ${relativePath}: ${error.message}`);
    }
  }

  return filesMap;
}

/**
 * Validate manifest against current filesystem
 * @returns {ValidationResult} - Validation results
 */
function validateManifest() {
  const result = {
    valid: true,
    newFiles: [],
    removedFiles: [],
    modifiedFiles: [],
    errors: [],
  };

  // Load manifest
  const manifest = loadManifest();
  if (!manifest) {
    result.valid = false;
    result.errors.push('install-manifest.yaml not found');
    return result;
  }

  if (!manifest.files || !Array.isArray(manifest.files)) {
    result.valid = false;
    result.errors.push('Manifest has no files array');
    return result;
  }

  // Get current files
  const currentFiles = getCurrentFiles();

  // Build set of manifest paths
  const manifestPaths = new Set();
  const manifestMap = new Map();

  for (const entry of manifest.files) {
    const normalizedPath = entry.path.replace(/\\/g, '/');
    manifestPaths.add(normalizedPath);
    manifestMap.set(normalizedPath, entry);
  }

  // Check for new files (in filesystem but not in manifest)
  for (const [filePath, _fileData] of currentFiles) {
    if (!manifestPaths.has(filePath)) {
      result.newFiles.push(filePath);
      result.valid = false;
    }
  }

  // Check for removed files and hash mismatches
  for (const [manifestPath, manifestEntry] of manifestMap) {
    const currentFile = currentFiles.get(manifestPath);

    if (!currentFile) {
      // File in manifest but not in filesystem
      result.removedFiles.push(manifestPath);
      result.valid = false;
    } else if (currentFile.hash !== manifestEntry.hash) {
      // Hash mismatch
      result.modifiedFiles.push({
        path: manifestPath,
        manifestHash: manifestEntry.hash,
        currentHash: currentFile.hash,
      });
      result.valid = false;
    }
  }

  return result;
}

/**
 * Print validation report
 * @param {ValidationResult} result - Validation results
 */
function printReport(result) {
  console.log('='.repeat(60));
  console.log('AIOS-Core Manifest Validation Report');
  console.log('='.repeat(60));
  console.log('');

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
    console.log('');
  }

  if (result.newFiles.length > 0) {
    console.log(`📁 NEW FILES (${result.newFiles.length}) - not in manifest:`);
    for (const f
```