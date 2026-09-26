# COMANDO - installer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\aios-install\src\installer.js
**SHA:** f715786bd6175078
**Timestamp:** 2026-08-28T02:18:58.336395
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.dryRun = options.dryRun || false;
- logger.action('Run: npx aios-core doctor');
- logger.action('Run: npm install aios-core --save-dev');
- logger.action('Run: npx aios-core install');
- logger.action('Run: npx aios-core config migrate');
- logger.action('Run: npm init -y');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * AIOS Installer - Main installation logic
 *
 * Orchestrates the complete AIOS installation flow:
 * 1. OS detection
 * 2. Dependency checking
 * 3. Profile selection (bob vs advanced)
 * 4. User config setup (L5)
 * 5. Brownfield detection and migration
 * 6. Environment bootstrap
 *
 * @module installer
 */

'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const { intro, outro, select, confirm, note, isCancel, cancel } = require('@clack/prompts');
const { execa } = require('execa');

const { detectOS, getOSDisplayName } = require('./os-detector');
const { checkAllDependencies, displayResults } = require('./dep-checker');

/**
 * Installation timing tracker
 */
class InstallTimer {
  constructor() {
    this.startTime = Date.now();
  }

  elapsed() {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  elapsedFormatted() {
    const seconds = this.elapsed();
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  checkTimeout(maxSeconds = 300) {
    return this.elapsed() > maxSeconds;
  }
}

/**
 * Logger with dry-run support
 */
class InstallLogger {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.prefix = this.dryRun ? chalk.yellow('[DRY-RUN] ') : '';
  }

  info(message) {
    console.log(this.prefix + message);
  }

  success(message) {
    console.log(this.prefix + chalk.green('✓ ') + message);
  }

  warn(message) {
    console.log(this.prefix + chalk.yellow('⚠ ') + message);
  }

  error(message) {
    console.log(this.prefix + chalk.red('✗ ') + message);
  }

  debug(message) {
    if (this.verbose) {
      console.log(this.prefix + chalk.dim('  ' + message));
    }
  }

  action(message) {
    if (this.dryRun) {
      console.log(chalk.yellow('[DRY-RUN] Would: ') + message);
    }
  }
}

/**
 * Check if a config-resolver is available (aios-core installed)
 * @param {string} projectRoot - Project root
 * @returns {Object|null} Config resolver module or null
 */
function tryLoadConfigResolver(projectRoot) {
  const possiblePaths = [
    path.join(projectRoot, '.aios-core/core/config/config-resolver.js'),
    path.join(projectRoot, 'node_modules/aios-core/.aios-core/core/config/config-resolver.js'),
  ];

  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        return require(configPath);
      }
    } catch {
      // Ignore load errors
    }
  }

  return null;
}

/**
 * Create default user config directly (fallback when config-resolver not available)
 * @param {string} profile - User profile ('bob' or 'advanced')
 * @param {InstallLogger} logger - Logger instance
 * @param {boolean} dryRun - Whether this is a dry run
 */
async function createUserConfigDirect(profile, logger, dryRun) {
  const userConfigDir = path.join(os.homedir(), '.aios');
  const userConfigPath = path.join(userConfigDir, 'user-config.yaml');

  if (dryRun) {
    logger.action(`Create directory: ${userConfigDir}`);
    logger.action(`Write user config: ${userConfigPath}`);
    logger.action(`Set user_profile: ${profile}`);
    return;
  }

  await fs.ensureDir(userConfigDir);

  let config = {};
  if (await fs.pathExists(userConfigPath)) {
    try {
      const yaml = require('js-yaml');
      const content = await fs.readFile(userConfigPath, 'utf8');
      config = yaml.load(content) || {};
    } catch {
      config = {};
    }
  }

  config.user_profile = profile;
  config.educational_mode = profile === 'bob';

  const yaml = require('js-yaml');
  const yamlContent = yaml.dump(config, { lineWidth: -1 });
  await fs.writeFile(userConfigPath, yamlContent, 'utf8');

  logger.success(`User config created at ${userConfigPath}`);
}

/**
 * Check if this is a brownfield installation (existing AIOS)
 * @param {string} projectRoot - Project root
 * @returns {Object} Brownfield detection result
 */
function detectBrownfield(projectRoot) {
  const result = {
    isBrownfield: false,
    hasLegacyConfig: false,
    hasLayeredConfig: false,
    configResolver: null,
  };

  // Check for legacy monolithic config
  const legacyConfigPath = path.join(projectRoot, '.aios-core/core-config.yaml');
  if (fs.existsSync(legacyConfigPath)) {
    result.isBrownfield = true;
    result.hasLegacyConfig = true;
  }

  // Check for layered config
  const frameworkConfigPath = path.join(projectRoot, '.aios-core/framework-config.yaml');
  if (fs.existsSync(frameworkConfigPath)) {
    result.isBrownfield = true;
    result.hasLayeredConfig = true;
  }

  // Check for .aios-core directory
  const aiosCoreDir = path.join(projectRoot, '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    result.isBrownfield = true;
  }

  // Try to load config resolver
  result.configResolver = tryLoadConfigResolver(projec
```