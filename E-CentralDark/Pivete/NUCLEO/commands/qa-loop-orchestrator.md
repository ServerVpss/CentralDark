# COMANDO - qa-loop-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\qa-loop-orchestrator.js
**SHA:** 1f9a886d4b6f4671
**Timestamp:** 2026-08-28T02:02:14.144595
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const iterationStart = Date.now();

### Gaps
- // TODO: In production, this would invoke the QA agent
- // TODO: In production, this would invoke the QA agent
- // TODO: In production, this would invoke the Dev agent

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS QA Loop Orchestrator
 *
 * Story: 6.5 - QA Loop Orchestrator
 * Epic: Epic 6 - QA Evolution
 *
 * Orchestrates the automated QA review → fix → re-review cycle.
 * Implements the qa-loop.yaml workflow with full state management.
 *
 * Features:
 * - AC1: Loop automático: review → fix → re-review
 * - AC2: Máximo 5 iterações (configurável via autoClaude.qaLoop.maxIterations)
 * - AC3: Após 5 iterações: escalate para humano com full context
 * - AC4: Track iteração atual em qa/loop-status.json
 * - AC5: Pode ser interrompido manualmente via *stop-qa-loop
 * - AC6: Summary ao final com histórico de iterações
 * - AC7: Integra com status.json para dashboard
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC2: Default max iterations
  defaultMaxIterations: 5,
  configPath: 'autoClaude.qaLoop.maxIterations',

  // AC4: Status file location
  statusFileName: 'loop-status.json',
  statusDir: 'qa',

  // AC7: Dashboard integration paths
  dashboardStatusPath: '.aios/dashboard/status.json',
  legacyStatusPath: '.aios/status.json',

  // Workflow definition
  workflowPath: '.aios-core/development/workflows/qa-loop.yaml',

  // Timeouts (milliseconds)
  reviewTimeout: 1800000, // 30 minutes
  fixTimeout: 3600000, // 60 minutes

  // Retry configuration
  maxRetries: 2,
  retryDelay: 5000,

  // Session persistence (AC4 enhancement)
  abandonedThreshold: 3600000, // 1 hour - consider loop abandoned if no update
  persistenceIndexPath: '.aios/qa-loops-index.json', // Track all active loops
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS ENUM
// ═══════════════════════════════════════════════════════════════════════════════════

const LoopStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  STOPPED: 'stopped',
  ESCALATED: 'escalated',
};

const Verdict = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  BLOCKED: 'BLOCKED',
};

const StatusEmoji = {
  [LoopStatus.PENDING]: '⏳',
  [LoopStatus.IN_PROGRESS]: '🔄',
  [LoopStatus.COMPLETED]: '✅',
  [LoopStatus.STOPPED]: '⏹️',
  [LoopStatus.ESCALATED]: '🚨',
};

const VerdictEmoji = {
  [Verdict.APPROVE]: '✅',
  [Verdict.REJECT]: '❌',
  [Verdict.BLOCKED]: '🚫',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              QA LOOP ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class QALoopOrchestrator {
  /**
   * Create a new QALoopOrchestrator instance
   *
   * @param {string} storyId - Story ID (e.g., 'STORY-42')
   * @param {Object} options - Configuration options
   * @param {number} [options.maxIterations] - Maximum loop iterations (AC2)
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   * @param {boolean} [options.verbose] - Enable verbose logging
   */
  constructor(storyId, options = {}) {
    this.storyId = storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.maxIterations = options.maxIterations || this._loadMaxIterations();
    this.verbose = options.verbose !== false;

    this.status = null;
    this._initPaths();
  }

  /**
   * Initialize file paths
   * @private
   */
  _initPaths() {
    // AC4: Status file path
    this.statusPath = path.join(
      this.rootPath,
      CONFIG.statusDir,
      this.storyId,
      CONFIG.statusFileName
    );

    // Dashboard paths (AC7)
    this.dashboardPath = path.join(this.rootPath, CONFIG.dashboardStatusPath);
    this.legacyStatusPath = path.join(this.rootPath, CONFIG.legacyStatusPath);

    // Workflow path
    this.workflowPath = path.join(this.rootPath, CONFIG.workflowPath);
  }

  /**
   * Load max iterations from config (AC2)
   * @private
   * @returns {number} Max iterations
   */
  _loadMaxIterations() {
    // Try to load from project config
    const configPaths = [
      path.join(this.rootPath, '.aios/config.yaml'),
      path.join(this.rootPath, '.aios/config.yml'),
      path.join(this.rootPath, 'aios.config.js'),
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          let config;
          if (configPath.endsWith('.js')) {
            config = require(configPath);
          } else {
            config = yaml.load(fs.readFileSync(configPath, 'utf-8'));
          }

          // Navigate to autoClaude.qaLoop.maxIterations
          const value = config?.autoClaude?.qaLoop?.maxIterations;
          if (typeof value === 'number' && value > 0) {
            return va
```