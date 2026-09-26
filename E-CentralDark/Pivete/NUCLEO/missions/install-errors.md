# MISSAO - install-errors.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\bin\utils\install-errors.js
**SHA:** c42fc588727476ca
**Timestamp:** 2026-08-28T02:02:30.349291
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 'Run: npm install manually',
- 'Run: git fsck to check repository integrity',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Installation Error Messages - User-friendly error communication
 *
 * Provides classified error messages with recovery suggestions
 * for AIOS installer failures.
 *
 * @module bin/utils/install-errors
 * @see Story 1.9 - Error Handling & Rollback
 */

const chalk = require('chalk');
const { CRITICAL_ERRORS } = require('./install-transaction');

/**
 * Error classification taxonomy
 */
const ERROR_CLASSIFICATION = {
  CRITICAL: {
    level: 'CRITICAL',
    color: chalk.red.bold,
    icon: '❌',
  },
  RECOVERABLE: {
    level: 'RECOVERABLE',
    color: chalk.yellow,
    icon: '⚠️',
  },
  WARNING: {
    level: 'WARNING',
    color: chalk.yellow,
    icon: '⚡',
  },
};

/**
 * Error message templates with recovery suggestions
 */
const ERROR_MESSAGES = {
  // File system errors
  EACCES: {
    title: 'Permission Denied',
    description: 'Installation failed due to insufficient file system permissions.',
    recovery: [
      'Run the installer with administrator/sudo privileges',
      'Check file permissions for the installation directory',
      'Ensure you have write access to the project folder',
    ],
  },
  ENOSPC: {
    title: 'Disk Space Exhausted',
    description: 'Installation failed because the disk is full.',
    recovery: [
      'Free up disk space (at least 500MB recommended)',
      'Delete unnecessary files or move data to another drive',
      'Run the installer again after freeing space',
    ],
  },
  EROFS: {
    title: 'Read-Only File System',
    description: 'Installation failed because the file system is read-only.',
    recovery: [
      'Ensure you are not installing to a read-only volume',
      'Check file system mount options',
      'Choose a different installation directory with write access',
    ],
  },
  ENOTDIR: {
    title: 'Invalid Directory',
    description: 'Installation failed because the path is not a directory.',
    recovery: [
      'Verify the installation path is a valid directory',
      'Remove any files with conflicting names',
      'Create the target directory manually before running installer',
    ],
  },

  // Network errors
  NETWORK_TIMEOUT: {
    title: 'Network Timeout',
    description: 'Installation failed due to network connection timeout.',
    recovery: [
      'Check your internet connection',
      'Try again in a few moments',
      'Use a wired connection if possible',
      'Check if npm registry is accessible: npm config get registry',
    ],
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'Installation failed due to network connectivity issues.',
    recovery: [
      'Verify internet connection is active',
      'Check firewall/proxy settings',
      'Try using a different network',
    ],
  },

  // Package errors
  DEPENDENCY_FAILED: {
    title: 'Dependency Installation Failed',
    description: 'One or more npm dependencies failed to install.',
    recovery: [
      'Clear npm cache: npm cache clean --force',
      'Delete node_modules and package-lock.json',
      'Run: npm install manually',
      'Check npm version compatibility: npm --version',
    ],
  },
  PACKAGE_CORRUPTION: {
    title: 'Package Corruption',
    description: 'Installation failed due to corrupted package files.',
    recovery: [
      'Clear npm cache: npm cache clean --force',
      'Verify package integrity with npm audit',
      'Try installing with --force flag',
    ],
  },

  // Configuration errors
  CONFIG_PARSE_ERROR: {
    title: 'Configuration Parse Error',
    description: 'Installation failed due to invalid configuration file syntax.',
    recovery: [
      'Check YAML/JSON syntax in configuration files',
      'Validate config files with a linter',
      'Restore default configuration and retry',
    ],
  },
  CONFIG_WRITE_ERROR: {
    title: 'Configuration Write Failed',
    description: 'Installation failed while writing configuration files.',
    recovery: [
      'Check write permissions for config directories',
      'Ensure config directory exists',
      'Check disk space availability',
    ],
  },

  // Git errors
  GIT_CORRUPTION: {
    title: 'Git Repository Corruption',
    description: 'Installation detected git repository corruption.',
    recovery: [
      'Run: git fsck to check repository integrity',
      'Restore from backup if available',
      'Re-initialize git repository: git init (warning: loses history)',
    ],
  },
  GIT_CONFLICT: {
    title: 'Git Conflict Detected',
    description: 'Installation failed due to uncommitted changes or conflicts.',
    recovery: [
      'Commit or stash your changes: git stash',
      'Resolve any merge conflicts',
      'Run installer in a clean git state',
    ],
  },

  // Generic errors
  UNKNOWN_ERROR: {
    title: 'Unknown Installation Error',
    description: 'Installation failed due to an unexpected error.',
    recovery: [
      'Check the installation log: .aios-install.log',
      'Review error details in the log file',
      'Report the issue if 
```