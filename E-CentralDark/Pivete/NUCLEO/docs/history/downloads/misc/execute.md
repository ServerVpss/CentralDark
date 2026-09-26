# OUTRO - execute.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\migrate\execute.js
**SHA:** 565f9f9143de4540
**Timestamp:** 2026-08-26T19:43:46.802593
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const { verbose = false, onProgress = () => {}, dryRun = false } = options;
- dryRun: true,
- dryRun = false,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Migration Execution Module
 *
 * Executes the migration from v2.0 → v2.1 structure.
 *
 * @module cli/commands/migrate/execute
 * @version 1.0.0
 * @story 2.14 - Migration Script v2.0 → v2.1
 */

const fs = require('fs');
const path = require('path');
const { copyFileWithMetadata } = require('./backup');
const { MODULE_MAPPING } = require('./analyze');

/**
 * Create module directories for v2.1 structure
 * @param {string} aiosCoreDir - Path to .aios-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Created directories
 */
async function createModuleDirectories(aiosCoreDir, options = {}) {
  const { onProgress = () => {} } = options;
  const modules = Object.keys(MODULE_MAPPING);
  const created = [];

  onProgress({ phase: 'directories', message: 'Creating module directories...' });

  for (const moduleName of modules) {
    const moduleDir = path.join(aiosCoreDir, moduleName);

    if (!fs.existsSync(moduleDir)) {
      await fs.promises.mkdir(moduleDir, { recursive: true });
      created.push(moduleDir);
      onProgress({ phase: 'directory', message: `  ✓ Created ${moduleName}/` });
    }
  }

  return { created, modules };
}

/**
 * Migrate files for a single module
 * @param {Object} moduleData - Module data from migration plan
 * @param {string} moduleName - Module name
 * @param {string} aiosCoreDir - Path to .aios-core
 * @param {Object} options - Options
 * @returns {Promise<Object>} Migration result
 */
async function migrateModule(moduleData, moduleName, aiosCoreDir, options = {}) {
  const { verbose = false, onProgress = () => {}, dryRun = false } = options;

  const result = {
    module: moduleName,
    migratedFiles: [],
    errors: [],
    totalSize: 0,
  };

  const moduleDir = path.join(aiosCoreDir, moduleName);

  for (const file of moduleData.files) {
    try {
      // Calculate target path within the module
      const targetPath = path.join(moduleDir, file.relativePath);

      if (dryRun) {
        result.migratedFiles.push({
          source: file.sourcePath,
          target: targetPath,
          size: file.size,
          dryRun: true,
        });
      } else {
        // Actually copy the file
        await copyFileWithMetadata(file.sourcePath, targetPath);

        result.migratedFiles.push({
          source: file.sourcePath,
          target: targetPath,
          size: file.size,
        });
      }

      result.totalSize += file.size;

      if (verbose) {
        onProgress({
          phase: 'file',
          message: `    → ${file.relativePath}`,
        });
      }
    } catch (error) {
      result.errors.push({
        file: file.relativePath,
        error: error.message,
      });
    }
  }

  return result;
}

/**
 * Execute full migration from v2.0 to v2.1
 * @param {Object} plan - Migration plan from analyzeMigrationPlan
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Migration result
 */
async function executeMigration(plan, options = {}) {
  const {
    verbose = false,
    dryRun = false,
    onProgress = () => {},
    cleanupOriginals = true,
  } = options;

  if (!plan.canMigrate) {
    return {
      success: false,
      error: plan.error || plan.message,
    };
  }

  const result = {
    success: true,
    dryRun,
    modules: {},
    totalFiles: 0,
    totalSize: 0,
    errors: [],
    cleanedUp: [],
  };

  // Phase 1: Create module directories
  if (!dryRun) {
    await createModuleDirectories(plan.aiosCoreDir, { onProgress });
  }

  // Phase 2: Migrate each module
  const moduleNames = ['core', 'development', 'product', 'infrastructure'];

  for (const moduleName of moduleNames) {
    const moduleData = plan.modules[moduleName];

    if (moduleData.files.length === 0) {
      result.modules[moduleName] = {
        files: 0,
        size: 0,
        skipped: true,
      };
      continue;
    }

    onProgress({
      phase: 'module',
      message: `✓ Migrating ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} module (${moduleData.files.length} files)`,
    });

    const moduleResult = await migrateModule(
      moduleData,
      moduleName,
      plan.aiosCoreDir,
      { verbose, onProgress, dryRun },
    );

    result.modules[moduleName] = {
      files: moduleResult.migratedFiles.length,
      size: moduleResult.totalSize,
      errors: moduleResult.errors,
    };

    result.totalFiles += moduleResult.migratedFiles.length;
    result.totalSize += moduleResult.totalSize;

    if (moduleResult.errors.length > 0) {
      result.errors.push(...moduleResult.errors);
    }
  }

  // Handle uncategorized files (move to core/)
  if (plan.uncategorized.length > 0 && !dryRun) {
    onProgress({
      phase: 'uncategorized',
      message: `Handling ${plan.uncategorized.length} uncategorized files...`,
    });

    for (const file of plan.uncategorized) {
      try {
        const targetPath = path.join(plan.aiosCoreDir, 'core', file.relativePath);
        await copyFileWithMetadata
```