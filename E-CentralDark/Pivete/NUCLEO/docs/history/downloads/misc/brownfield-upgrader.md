# OUTRO - brownfield-upgrader.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\installer\brownfield-upgrader.js
**SHA:** 57d8f41b2b51b07b
**Timestamp:** 2026-08-28T02:18:59.180212
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { dryRun = false, includeModified = true } = options;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Brownfield Upgrader
 * Handles incremental upgrades for existing AIOS-Core installations
 *
 * @module src/installer/brownfield-upgrader
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const semver = require('semver');
const { hashFile, hashesMatch } = require('./file-hasher');

/**
 * Upgrade report structure
 * @typedef {Object} UpgradeReport
 * @property {string} sourceVersion - Version being upgraded to
 * @property {string} installedVersion - Currently installed version
 * @property {Object[]} newFiles - Files to be added
 * @property {Object[]} modifiedFiles - Files that changed (framework side)
 * @property {Object[]} userModifiedFiles - Files modified by user (won't overwrite)
 * @property {Object[]} deletedFiles - Files removed from framework
 * @property {boolean} upgradeAvailable - Whether an upgrade is available
 */

/**
 * Load manifest from a given base path
 * @param {string} basePath - Base path to look for manifest
 * @param {string} manifestName - Name of manifest file
 * @returns {Object|null} - Parsed manifest or null
 */
function loadManifest(basePath, manifestName = 'install-manifest.yaml') {
  const manifestPath = path.join(basePath, manifestName);

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading manifest from ${manifestPath}:`, error.message);
    return null;
  }
}

/**
 * Load installed manifest from target project
 * @param {string} targetDir - Target project directory
 * @returns {Object|null} - Installed manifest or null if not found
 */
function loadInstalledManifest(targetDir) {
  return loadManifest(
    path.join(targetDir, '.aios-core'),
    '.installed-manifest.yaml',
  );
}

/**
 * Load source manifest from package
 * @param {string} sourceDir - Source package directory (.aios-core from npm)
 * @returns {Object|null} - Source manifest
 */
function loadSourceManifest(sourceDir) {
  return loadManifest(sourceDir, 'install-manifest.yaml');
}

/**
 * Build file map from manifest for quick lookup
 * @param {Object} manifest - Manifest object
 * @returns {Map<string, Object>} - Map of path -> entry
 */
function buildFileMap(manifest) {
  const map = new Map();
  if (manifest && manifest.files) {
    for (const entry of manifest.files) {
      const normalizedPath = entry.path.replace(/\\/g, '/');
      map.set(normalizedPath, entry);
    }
  }
  return map;
}

/**
 * Check if a file has been modified by the user
 * Compares current file hash against installed manifest hash
 *
 * @param {string} filePath - Absolute path to file
 * @param {string} expectedHash - Hash from installed manifest (with sha256: prefix)
 * @returns {boolean} - True if file was modified by user
 */
function isUserModified(filePath, expectedHash) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const currentHash = `sha256:${hashFile(filePath)}`;
    return !hashesMatch(currentHash, expectedHash);
  } catch {
    // If we can't hash, assume it's modified
    return true;
  }
}

/**
 * Generate upgrade report comparing source and installed manifests
 *
 * @param {Object} sourceManifest - Manifest from source (npm package)
 * @param {Object} installedManifest - Manifest from target installation
 * @param {string} targetDir - Target project directory
 * @returns {UpgradeReport} - Detailed upgrade report
 */
function generateUpgradeReport(sourceManifest, installedManifest, targetDir) {
  const report = {
    sourceVersion: sourceManifest?.version || 'unknown',
    installedVersion: installedManifest?.installed_version || installedManifest?.version || 'unknown',
    newFiles: [],
    modifiedFiles: [],
    userModifiedFiles: [],
    deletedFiles: [],
    unchangedFiles: 0,
    upgradeAvailable: false,
  };

  // Check if upgrade is available via semver
  if (sourceManifest?.version && installedManifest?.installed_version) {
    const sourceVer = semver.coerce(sourceManifest.version);
    const installedVer = semver.coerce(installedManifest.installed_version);

    if (sourceVer && installedVer) {
      report.upgradeAvailable = semver.gt(sourceVer, installedVer);
    }
  } else if (sourceManifest?.version && !installedManifest) {
    // No installed manifest means this is a fresh install scenario
    report.upgradeAvailable = false;
  }

  const sourceMap = buildFileMap(sourceManifest);
  const installedMap = buildFileMap(installedManifest);

  const aiosCoreDir = path.join(targetDir, '.aios-core');

  // Check source files against installed
  for (const [filePath, sourceEntry] of sourceMap) {
    const installedEntry = installedMap.get(filePath);
    const absolutePath = path.join(aiosCoreDir, filePath);

    if (!installedEntry) {
      // New file in source
      report.newFiles.push({
        path: filePath,
```