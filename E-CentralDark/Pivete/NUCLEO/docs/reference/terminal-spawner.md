# REFERENCIA - terminal-spawner.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\terminal-spawner.js
**SHA:** 4b3d536da60627e5
**Timestamp:** 2026-08-28T02:02:00.248383
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const agentPattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;
- const taskPattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Terminal Spawner - Node.js wrapper for pm.sh
 *
 * Provides async API for spawning AIOS agents in separate terminals
 * to maintain clean context isolation during orchestration.
 *
 * Story 11.2: Bob Terminal Spawning
 *
 * @module core/orchestration/terminal-spawner
 * @version 1.0.0
 */

'use strict';

const { spawn, execSync } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

// Constants
const POLL_INTERVAL_MS = 500;
const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Environment types for spawn strategy selection
 * @readonly
 * @enum {string}
 */
const ENVIRONMENT_TYPE = {
  NATIVE_TERMINAL: 'NATIVE_TERMINAL',
  VSCODE: 'VSCODE',
  SSH: 'SSH',
  DOCKER: 'DOCKER',
  CI: 'CI',
};

/**
 * Environment detection result
 * @typedef {Object} EnvironmentInfo
 * @property {string} type - Environment type (ENVIRONMENT_TYPE enum value)
 * @property {boolean} supportsVisualTerminal - Whether visual terminal spawn is supported
 * @property {string} reason - Human-readable reason for detection
 */

/**
 * Detects the current execution environment (Story 12.10 - Task 1)
 *
 * Detection priority:
 * 1. CI/CD (GitHub Actions, GitLab CI, etc.)
 * 2. Docker container
 * 3. SSH session
 * 4. VS Code integrated terminal
 * 5. Native terminal (default)
 *
 * @returns {EnvironmentInfo} Environment detection result
 */
function detectEnvironment() {
  // 1. CI/CD detection (Task 1.5)
  // Check common CI environment variables
  if (
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.GITLAB_CI === 'true' ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS === 'true' ||
    process.env.CIRCLECI === 'true' ||
    process.env.BUILDKITE === 'true' ||
    process.env.AZURE_PIPELINES === 'true' ||
    process.env.TF_BUILD === 'True'
  ) {
    return {
      type: ENVIRONMENT_TYPE.CI,
      supportsVisualTerminal: false,
      reason: 'CI/CD environment detected (headless)',
    };
  }

  // 2. Docker container detection (Task 1.4)
  // Check for /.dockerenv file or cgroup indicators
  try {
    if (fsSync.existsSync('/.dockerenv')) {
      return {
        type: ENVIRONMENT_TYPE.DOCKER,
        supportsVisualTerminal: false,
        reason: 'Docker container detected (/.dockerenv exists)',
      };
    }

    // Check cgroup for docker/containerd/kubepods
    if (fsSync.existsSync('/proc/1/cgroup')) {
      const cgroup = fsSync.readFileSync('/proc/1/cgroup', 'utf8');
      if (cgroup.includes('docker') || cgroup.includes('containerd') || cgroup.includes('kubepods')) {
        return {
          type: ENVIRONMENT_TYPE.DOCKER,
          supportsVisualTerminal: false,
          reason: 'Container detected via cgroup',
        };
      }
    }
  } catch {
    // Ignore file read errors (e.g., on Windows)
  }

  // 3. SSH session detection (Task 1.3)
  if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) {
    return {
      type: ENVIRONMENT_TYPE.SSH,
      supportsVisualTerminal: false,
      reason: 'SSH session detected (no display available)',
    };
  }

  // 4. VS Code integrated terminal detection (Task 1.2)
  if (
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.VSCODE_GIT_IPC_HANDLE
  ) {
    return {
      type: ENVIRONMENT_TYPE.VSCODE,
      supportsVisualTerminal: false,
      reason: 'VS Code integrated terminal detected',
    };
  }

  // 5. Native terminal (default) - supports visual spawn
  return {
    type: ENVIRONMENT_TYPE.NATIVE_TERMINAL,
    supportsVisualTerminal: true,
    reason: 'Native terminal environment',
  };
}

/**
 * Default spawn options
 * @type {Object}
 */
const DEFAULT_OPTIONS = {
  params: '',
  context: null,
  timeout: DEFAULT_TIMEOUT_MS,
  outputDir: os.tmpdir(),
  retries: MAX_RETRIES,
  debug: false,
};

/**
 * Context schema for agent execution
 * @typedef {Object} AgentContext
 * @property {string} story - Story file path or content
 * @property {string[]} files - Array of relevant file paths
 * @property {string} instructions - Additional instructions for the agent
 * @property {Object} metadata - Additional metadata
 */

/**
 * Spawn result object
 * @typedef {Object} SpawnResult
 * @property {boolean} success - Whether spawn was successful
 * @property {string} output - Agent output content
 * @property {string} outputFile - Path to output file
 * @property {number} duration - Execution duration in ms
 * @property {string} [error] - Error message if failed
 */

/**
 * Gets the path to the pm.sh script
 * @returns {string} Absolute path to pm.sh
 */
function getScriptPath() {
  return path.join(__dirname, '../../scripts/pm.sh');
}

/**
 * Validates spawn arguments
 * @param {string} agent - Agent ID
 * @param {string} task - Task to execute
 * @throws {Error} If arguments are invalid
```