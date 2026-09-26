# COMANDO - cli-commands.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\cli-commands.js
**SHA:** 99f1805a195db970
**Timestamp:** 2026-08-28T02:01:59.895865
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: true,

### Contratos
- console.log(chalk.gray(`   Gate: ${data.gateResult.verdict}`));

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * CLI Commands - Story 0.9
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * CLI command handlers for orchestrator control.
 *
 * Features:
 * - AC1: *orchestrate {story-id} starts full pipeline
 * - AC2: *orchestrate-status {story-id} shows progress
 * - AC3: *orchestrate-stop {story-id} stops execution
 * - AC4: *orchestrate-resume {story-id} continues execution
 * - AC5: --epic N flag for specific epic start
 * - AC6: --dry-run flag for preview
 * - AC7: Commands available globally
 *
 * @module core/orchestration/cli-commands
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const MasterOrchestrator = require('./master-orchestrator');

// Optional chalk for colored output
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
    dim: (s) => s,
    magenta: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMMAND: orchestrate (AC1)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Execute orchestrate command (AC1)
 *
 * @param {string} storyId - Story ID to orchestrate
 * @param {Object} options - Command options
 * @param {number} [options.epic] - Start from specific epic (AC5)
 * @param {boolean} [options.dryRun] - Preview without execution (AC6)
 * @param {boolean} [options.strict] - Enable strict gate mode
 * @param {string} [options.projectRoot] - Project root path
 * @returns {Promise<Object>} Command result
 */
async function orchestrate(storyId, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  if (!storyId) {
    return {
      success: false,
      exitCode: 3,
      error: 'Story ID is required',
    };
  }

  console.log(chalk.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold(`  🚀 AIOS Orchestrator: ${storyId}`));
  console.log(chalk.cyan('═══════════════════════════════════════════════════════════\n'));

  // Dry run mode (AC6)
  if (options.dryRun) {
    return await orchestrateDryRun(storyId, options);
  }

  try {
    const orchestrator = new MasterOrchestrator(projectRoot, {
      storyId,
      strictGates: options.strict ?? false,
      dashboardAutoUpdate: true,
    });

    // Start dashboard
    await orchestrator.startDashboard();

    // Setup event handlers
    setupEventHandlers(orchestrator);

    let result;

    // Start from specific epic (AC5)
    if (options.epic) {
      console.log(chalk.yellow(`Starting from Epic ${options.epic}...`));
      result = await orchestrator.resumeFromEpic(options.epic);
    } else {
      console.log(chalk.green('Starting full pipeline...'));
      result = await orchestrator.executeFullPipeline();
    }

    // Stop dashboard
    orchestrator.stopDashboard();

    // Display final result
    displayResult(result);

    return {
      success: result.success,
      exitCode: result.success ? 0 : result.blocked ? 2 : 1,
      result,
    };
  } catch (error) {
    console.log(chalk.red(`\n❌ Orchestration failed: ${error.message}`));
    return {
      success: false,
      exitCode: 1,
      error: error.message,
    };
  }
}

/**
 * Dry run orchestration (AC6)
 * @private
 */
async function orchestrateDryRun(storyId, options) {
  console.log(chalk.yellow('🔍 DRY RUN MODE - No actual execution\n'));

  const projectRoot = options.projectRoot || process.cwd();
  const orchestrator = new MasterOrchestrator(projectRoot, {
    storyId,
    strictGates: options.strict ?? false,
  });

  // Initialize to detect tech stack
  await orchestrator.initialize();

  // Display what would happen
  console.log(chalk.bold('Pipeline Preview:'));
  console.log(chalk.gray('─'.repeat(50)));

  const epicConfig = orchestrator.constructor.EPIC_CONFIG;
  const startEpic = options.epic || 3;

  // Use dynamic epic list from config (excludes onDemand epics like Epic 5)
  const epicNums = Object.keys(epicConfig)
    .map(Number)
    .filter((num) => !epicConfig[num].onDemand)
    .sort((a, b) => a - b);

  for (const epicNum of epicNums) {
    const config = epicConfig[epicNum];
    if (epicNum < startEpic) {
      console.log(chalk.gray(`  ⏭️  Epic ${epicNum}: ${config.name} (skipped)`));
    } else {
      console.log(chalk.cyan(`  ▶️  Epic ${epicNum}: ${config.name}`));
    }
  }

  console.log(chalk.gray('─'.repeat(50)));

  if (orchestrator.executionState.techStackProfile) {
    console.log(chalk.bold('\nDetected Tech Stack:'));
    const tech = orchestrator.executionState.techStackProfile;
    if (tech.hasDatabase)
      console.log(chalk.green(`  ✓ Database: ${tech.database?.type || 'detected'}`));
    if (tech.hasFrontend)
      console.log(chalk.green(`  ✓ Frontend: ${tech.frontend?.framework || 'detected'}`));
    if (tech.hasBackend)
      console.log(chal
```