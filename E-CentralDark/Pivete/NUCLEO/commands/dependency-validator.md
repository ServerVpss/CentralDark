# COMANDO - dependency-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\wizard\validation\validators\dependency-validator.js
**SHA:** e5202116ebb268a6
**Timestamp:** 2026-08-28T02:19:04.068024
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- message: `Critical dependencies missing: ${missingDeps.join(', ')}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Dependency Validator
 * Task 1.8.4: Validates dependency installation
 *
 * @module wizard/validation/validators/dependency-validator
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Validate dependencies
 *
 * @param {Object} depsContext - Dependency installation context
 * @param {boolean} depsContext.success - Installation success status
 * @param {string} depsContext.packageManager - Package manager used
 * @param {boolean} depsContext.offlineMode - Offline mode flag
 * @param {string} depsContext.projectType - Project type (GREENFIELD, BROWNFIELD, etc.)
 * @returns {Promise<Object>} Validation result
 */
async function validateDependencies(depsContext = {}) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: [],
  };

  try {
    // Check if dependencies were installed (skip for greenfield with no deps defined)
    if (depsContext.success === false) {
      results.success = false;
      results.errors.push({
        severity: 'critical',
        message: 'Dependencies not installed - installation failed',
        code: 'DEPS_INSTALL_FAILED',
      });
      return results;
    }

    // Check node_modules existence
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    // For greenfield projects, check if package.json has dependencies
    let hasDependencies = false;
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        hasDependencies = !!(
          (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) ||
          (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0)
        );
      } catch {
        // If we can't parse package.json, assume no dependencies
        hasDependencies = false;
      }
    }

    if (!fs.existsSync(nodeModulesPath)) {
      // For greenfield projects with no dependencies, this is OK
      if (!hasDependencies) {
        results.checks.push({
          component: 'Dependencies',
          file: 'node_modules',
          status: 'skipped',
          message: 'No dependencies defined in package.json (greenfield project)',
        });
        return results;
      }

      // Otherwise, it's an error
      results.success = false;
      results.errors.push({
        severity: 'critical',
        message: 'node_modules directory not found',
        file: nodeModulesPath,
        code: 'NODE_MODULES_MISSING',
      });
      return results;
    }

    results.checks.push({
      component: 'Dependencies',
      file: 'node_modules',
      status: 'success',
      message: 'Directory exists',
    });

    // Validate package.json integrity
    await validatePackageJson(results);

    // Check critical dependencies
    await checkCriticalDependencies(results);

    // Run npm audit (non-blocking - warnings only)
    await runSecurityAudit(results, depsContext.packageManager);

    // Count installed packages
    await countInstalledPackages(results, nodeModulesPath);

    return results;
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `Dependency validation failed: ${error.message}`,
      code: 'DEPS_VALIDATION_ERROR',
      details: error.stack,
    });
    results.success = false;

    return results;
  }
}

/**
 * Validate package.json
 * @private
 */
async function validatePackageJson(results) {
  const packageJsonPath = 'package.json';

  if (!fs.existsSync(packageJsonPath)) {
    results.errors.push({
      severity: 'critical',
      message: 'package.json not found',
      file: packageJsonPath,
      code: 'PACKAGE_JSON_MISSING',
    });
    results.success = false;
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.dependencies && !packageJson.devDependencies) {
      results.warnings.push({
        severity: 'medium',
        message: 'package.json has no dependencies',
        file: packageJsonPath,
        code: 'NO_DEPENDENCIES',
      });
    }

    results.checks.push({
      component: 'Package Manifest',
      file: packageJsonPath,
      status: 'success',
      message: 'Valid JSON',
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `package.json parsing failed: ${error.message}`,
      file: packageJsonPath,
      code: 'PACKAGE_JSON_PARSE_ERROR',
    });
    results.success = false;
  }
}

/**
 * Check critical dependencies
 * @private
 */
async function checkCriticalDependencies(results) {
  const criticalDeps = [
    'inquirer',
    'chalk',
    'yaml',
    'fs-extra',
    '@clack/prompts',
  ];

  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const missingDeps = [];

  f
```