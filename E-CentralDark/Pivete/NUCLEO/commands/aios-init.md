# COMANDO - aios-init.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\bin\aios-init.js
**SHA:** 3073107d083c5d2e
**Timestamp:** 2026-08-28T02:02:30.282192
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: false,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS-FullStack Installation Wizard v5 (LEGACY)
 * Based on the original beautiful visual design with ASCII art
 * Version: 2.1.0
 *
 * ⚠️ DEPRECATED (since v3.11.3, scheduled for removal in v5.0.0):
 * This file is the LEGACY installer.
 * The new modular wizard is located at: packages/installer/src/wizard/index.js
 *
 * This file is kept as a fallback for edge cases where the new wizard
 * is not available. All new development should use the new wizard.
 *
 * Migration path:
 * - Use `npx aios-core` which routes through bin/aios.js to the new wizard
 * - Do NOT call this file directly
 *
 * Supported IDEs (7 total):
 * - Claude Code, Cursor, Windsurf, Roo Code, Cline, Gemini CLI, GitHub Copilot
 */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const { execSync, exec, spawn } = require('child_process');
const { promisify } = require('util');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora'); // INS-2 Performance: Progress indicators (AC9)

// INS-2 Performance: Promisified exec for async shell commands (AC7)
const execAsync = promisify(exec);

/**
 * Execute command with inherited stdio (for npm install -g that needs user interaction)
 * INS-2 Performance: Async version that doesn't block event loop
 * @param {string} command - Command to execute
 * @param {object} options - Spawn options
 * @returns {Promise<void>}
 */
function spawnAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

// ASCII Art Banner (Clean blocky style like reference image)
const BANNER = chalk.cyan(`
  █████╗ ██╗ ██████╗ ███████╗      ███████╗██╗   ██╗██╗     ██╗     ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ██╔══██╗██║██╔═══██╗██╔════╝      ██╔════╝██║   ██║██║     ██║     ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
 ███████║██║██║   ██║███████╗█████╗█████╗  ██║   ██║██║     ██║     ███████╗   ██║   ███████║██║     █████╔╝
 ██╔══██║██║██║   ██║╚════██║╚════╝██╔══╝  ██║   ██║██║     ██║     ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
 ██║  ██║██║╚██████╔╝███████║      ██║     ╚██████╔╝███████╗███████╗███████║   ██║   ██║  ██║╚██████╗██║  ██╗
 ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝      ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`);

const SUBTITLE = chalk.magenta('Universal AI Agent Framework for Any Domain');
// Read version from package.json dynamically
const packageJsonVersion = require(path.join(__dirname, '..', 'package.json')).version;
const VERSION = chalk.yellow(`Installer v${packageJsonVersion}`);

/**
 * Smart path resolution for AIOS Core modules
 */
function resolveAiosCoreModule(modulePath) {
  const aiosCoreModule = path.join(__dirname, '..', '.aios-core', modulePath);

  const moduleExists =
    fs.existsSync(aiosCoreModule + '.js') ||
    fs.existsSync(aiosCoreModule + '/index.js') ||
    fs.existsSync(aiosCoreModule);

  if (!moduleExists) {
    throw new Error(
      `Cannot find AIOS Core module: ${modulePath}\n` +
        `Searched: ${aiosCoreModule}\n` +
        'Please ensure @synkra/aios-core is installed correctly.'
    );
  }

  return require(aiosCoreModule);
}

// Load AIOS Core modules
const { detectRepositoryContext } = resolveAiosCoreModule(
  'infrastructure/scripts/repository-detector'
);
// PM adapters imported but not used directly (loaded dynamically)
// const { ClickUpAdapter } = resolveAiosCoreModule('utils/pm-adapters/clickup-adapter');
// const { GitHubProjectsAdapter } = resolveAiosCoreModule('utils/pm-adapters/github-adapter');
// const { JiraAdapter } = resolveAiosCoreModule('utils/pm-adapters/jira-adapter');

// Brownfield upgrade module (Story 6.18)
let brownfieldUpgrader;
try {
  brownfieldUpgrader = require('../packages/installer/src/installer/brownfield-upgrader');
} catch (_err) {
  // Module may not be available in older installations
  brownfieldUpgrader = null;
}

async function main() {
  console.clear();

  // Check for minimal mode flag
  const isMinimalMode = process.argv.includes('--minimal');

  // Display beautiful banner
  console.log(BANNER);
  console.log(SUBTITLE);
  console.log(VERSION);
  if (isMinimalMode) {
    console.log(chalk.yellow('   🔹 Minimal Installation Mode'));
  }
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');

  const projectRoot = process.cwd();
  let context = detectRepositoryContext();

  // Setup prerequisites if needed
  if (!context) {
    console.log(chalk.blue('⚙️  Setting up project prerequisites...\n'));

    // Check for git repository
    // INS-2 Performance: Use async exec (AC7)
    let 
```