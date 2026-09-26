# COMANDO - deployment-config-loader.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\documentation-integrity\deployment-config-loader.js
**SHA:** 363c59c4919151ef
**Timestamp:** 2026-08-28T02:02:14.626419
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const regexPattern = pattern

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Deployment Config Loader
 *
 * Shared utility for loading deployment configuration from core-config.yaml.
 * Implements the Configuration-Driven Architecture pattern.
 *
 * Usage:
 *   const { loadDeploymentConfig } = require('./deployment-config-loader');
 *   const config = loadDeploymentConfig(projectRoot);
 *
 * @module documentation-integrity/deployment-config-loader
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Default deployment configuration
 * Used when core-config.yaml doesn't exist or deployment section is missing
 *
 * @type {Object}
 */
const DEFAULT_DEPLOYMENT_CONFIG = {
  workflow: 'staging-first',

  branches: {
    staging_targets: ['feature/*', 'fix/*', 'docs/*', 'chore/*', 'refactor/*', 'test/*'],
    production_targets: ['hotfix/*'],
    staging_branch: 'staging',
    production_branch: 'main',
    default_target: 'staging',
  },

  environments: {
    staging: {
      name: 'Staging',
      auto_deploy: true,
      platform: null,
      url: null,
      promotion_message: 'After validation, create PR to main for production',
    },
    production: {
      name: 'Production',
      auto_deploy: true,
      platform: null,
      url: null,
      promotion_message: 'This is the final production deployment',
    },
  },

  quality_gates: {
    lint: true,
    typecheck: true,
    tests: true,
    security_scan: false,
    min_coverage: 50,
  },

  pr_defaults: {
    auto_assign_reviewers: false,
    draft_by_default: false,
    include_deployment_info: true,
  },
};

/**
 * Loads deployment configuration from core-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Deployment configuration (merged with defaults)
 */
function loadDeploymentConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.aios-core', 'core-config.yaml');

  if (!fs.existsSync(configPath)) {
    console.warn(`[deployment-config-loader] core-config.yaml not found at ${configPath}`);
    console.warn('[deployment-config-loader] Using default deployment configuration');
    return { ...DEFAULT_DEPLOYMENT_CONFIG };
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);

    if (!config || !config.deployment) {
      console.warn('[deployment-config-loader] No deployment section in core-config.yaml');
      console.warn('[deployment-config-loader] Using default deployment configuration');
      return { ...DEFAULT_DEPLOYMENT_CONFIG };
    }

    // Deep merge with defaults to ensure all required fields exist
    return deepMerge(DEFAULT_DEPLOYMENT_CONFIG, config.deployment);
  } catch (error) {
    console.error(`[deployment-config-loader] Error loading config: ${error.message}`);
    console.warn('[deployment-config-loader] Using default deployment configuration');
    return { ...DEFAULT_DEPLOYMENT_CONFIG };
  }
}

/**
 * Loads project configuration from core-config.yaml
 *
 * @param {string} projectRoot - Project root directory
 * @returns {Object|null} Project configuration or null if not found
 */
function loadProjectConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.aios-core', 'core-config.yaml');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);
    return config.project || null;
  } catch (error) {
    console.error(`[deployment-config-loader] Error loading project config: ${error.message}`);
    return null;
  }
}

/**
 * Gets the target branch for a given source branch
 *
 * @param {string} sourceBranch - Source branch name
 * @param {Object} deploymentConfig - Deployment configuration
 * @returns {string} Target branch name
 */
function getTargetBranch(sourceBranch, deploymentConfig) {
  const { branches, workflow } = deploymentConfig;

  // Check if it's a staging branch (used for promotion)
  if (sourceBranch === branches.staging_branch) {
    return branches.production_branch;
  }

  // Check production targets (hotfix/* etc.)
  for (const pattern of branches.production_targets || []) {
    if (matchesBranchPattern(sourceBranch, pattern)) {
      return branches.production_branch;
    }
  }

  // Check staging targets
  for (const pattern of branches.staging_targets || []) {
    if (matchesBranchPattern(sourceBranch, pattern)) {
      // If direct-to-main workflow, target production
      if (workflow === 'direct-to-main') {
        return branches.production_branch;
      }
      return branches.staging_branch || branches.production_branch;
    }
  }

  // Default target - resolve symbolic name to actual branch
  const defaultTarget = (branches.default_target || 'production').toLowerCase();
  const stagingBranch = branches.staging_branch;
  const productionBranch = branches.production_branch;

  // Handle symbolic names
  if (defaultTarget === 'staging') {
    
```