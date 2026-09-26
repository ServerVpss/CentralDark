# OUTRO - dep-checker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\aios-install\src\dep-checker.js
**SHA:** 4bc58d11b98d1ee0
**Timestamp:** 2026-08-28T02:18:58.326804
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- instruction: 'Start Docker Desktop or run: sudo systemctl start docker',

### Gaps
- missing: [],

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Dependency Checker - Verifies required system dependencies
 *
 * Checks:
 * - Node.js (>= 18.0.0) - REQUIRED
 * - Git (>= 2.30) - REQUIRED
 * - Docker - OPTIONAL (required for edmcp)
 * - GitHub CLI (gh) - OPTIONAL (enhances workflow)
 *
 * @module dep-checker
 */

'use strict';

const { execaSync } = require('execa');
const semver = require('semver');
const chalk = require('chalk');

/**
 * Dependency requirement levels
 */
const REQUIREMENT = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
};

/**
 * Default dependency specifications
 */
const DEPENDENCIES = {
  node: {
    name: 'Node.js',
    command: 'node',
    versionFlag: '--version',
    minVersion: '18.0.0',
    requirement: REQUIREMENT.REQUIRED,
    versionParser: (output) => output.replace(/^v/, '').trim(),
    description: 'JavaScript runtime',
  },
  git: {
    name: 'Git',
    command: 'git',
    versionFlag: '--version',
    minVersion: '2.30.0',
    requirement: REQUIREMENT.REQUIRED,
    versionParser: (output) => {
      const match = output.match(/git version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'Version control system',
  },
  docker: {
    name: 'Docker',
    command: 'docker',
    versionFlag: '--version',
    minVersion: null, // Any version is fine
    requirement: REQUIREMENT.OPTIONAL,
    versionParser: (output) => {
      const match = output.match(/Docker version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'Container platform (required for edmcp)',
  },
  gh: {
    name: 'GitHub CLI',
    command: 'gh',
    versionFlag: '--version',
    minVersion: null, // Any version is fine
    requirement: REQUIREMENT.OPTIONAL,
    versionParser: (output) => {
      const match = output.match(/gh version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
    description: 'GitHub command-line tool',
  },
};

/**
 * Checks if a dependency is installed and meets version requirements
 * @param {Object} dep - Dependency specification
 * @param {Object} osInfo - OS information from os-detector
 * @returns {Object} Check result
 */
function checkDependency(dep, osInfo) {
  const result = {
    name: dep.name,
    command: dep.command,
    installed: false,
    version: null,
    meetsMinVersion: true,
    minVersion: dep.minVersion,
    requirement: dep.requirement,
    instruction: osInfo.installInstructions?.[dep.command] || `Install ${dep.name}`,
    error: null,
  };

  try {
    const { stdout } = execaSync(dep.command, [dep.versionFlag], {
      timeout: 5000,
      reject: false,
    });

    if (stdout) {
      result.installed = true;
      result.version = dep.versionParser(stdout);

      // Check minimum version if specified
      if (dep.minVersion && result.version) {
        const cleanVersion = semver.coerce(result.version);
        if (cleanVersion) {
          result.meetsMinVersion = semver.gte(cleanVersion.version, dep.minVersion);
        }
      }
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Checks if Docker daemon is running
 * @returns {Object} Docker status
 */
function checkDockerRunning() {
  try {
    const { stdout, exitCode } = execaSync('docker', ['info'], {
      timeout: 10000,
      reject: false,
    });

    return {
      running: exitCode === 0,
      info: stdout,
    };
  } catch {
    return {
      running: false,
      info: null,
    };
  }
}

/**
 * Checks all dependencies
 * @param {Object} osInfo - OS information from os-detector
 * @param {Object} options - Check options
 * @returns {Object} Check results
 */
function checkAllDependencies(osInfo, _options = {}) {
  const results = {
    passed: true,
    hasWarnings: false,
    required: [],
    optional: [],
    missing: [],
    warnings: [],
    summary: null,
  };

  // Check each dependency
  for (const [key, dep] of Object.entries(DEPENDENCIES)) {
    const check = checkDependency(dep, osInfo);

    if (dep.requirement === REQUIREMENT.REQUIRED) {
      results.required.push(check);

      if (!check.installed || !check.meetsMinVersion) {
        results.passed = false;
        results.missing.push({
          name: check.name,
          command: key,
          required: true,
          instruction: check.instruction,
          reason: !check.installed
            ? 'Not installed'
            : `Version ${check.version} is below minimum ${check.minVersion}`,
        });
      }
    } else {
      results.optional.push(check);

      if (!check.installed) {
        results.hasWarnings = true;
        results.warnings.push({
          name: check.name,
          command: key,
          instruction: check.instruction,
          impact: dep.description,
        });
      }
    }
  }

  // Special check: Docker daemon running
  const dockerCheck = results.optional.find((c) => c.command === 'docker');
  if (dockerCheck && dockerCheck.installed) {
    const dockerStatus = checkDockerRunning();
    if (!dock
```