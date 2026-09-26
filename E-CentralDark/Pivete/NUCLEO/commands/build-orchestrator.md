# COMANDO - build-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\execution\build-orchestrator.js
**SHA:** 123825dc7af75eea
**Timestamp:** 2026-08-28T02:01:56.391547
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dryRun: false,
- EXECUTE: 'execute',
- const phaseStart = Date.now();
- this.log('DRY RUN: Would create worktree', 'info');
- return { dryRun: true };
- this.log('DRY RUN: Would generate plan', 'info');
- return { dryRun: true };
- this.log('DRY RUN: Would execute build loop', 'info');
- return { dryRun: true };
- const prompt = this.buildSubtaskPrompt(subtask, execCtx, buildCtx);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Build Orchestrator - Story 8.5
 *
 * Single command to run complete autonomous builds.
 * Integrates: Worktree → Plan → Execute → Verify → Merge → Cleanup
 *
 * Features:
 * - AC1: Integrates all components (worktree, loop, merge, QA)
 * - AC2: Command `*build {story-id}` executes complete pipeline
 * - AC3: Pipeline: worktree → plan → execute → verify → merge → cleanup
 * - AC4: Flags: --dry-run, --no-merge, --keep-worktree, --verbose
 * - AC5: Notification on complete (future dashboard integration)
 * - AC6: Final report in plan/build-report.md
 * - AC7: Support for multiple simultaneous builds
 * - AC8: QA loop integration before merge
 *
 * @module build-orchestrator
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { EventEmitter } = require('events');

// Import components
const { AutonomousBuildLoop, BuildEvent } = require('./autonomous-build-loop');
const { BuildStateManager: _BuildStateManager } = require('./build-state-manager');

// Epic 10: Parallel Execution Components (optional - loaded dynamically when needed)
// These are available for future parallel execution features but not used in current pipeline

let WorktreeManager;
try {
  WorktreeManager = require('../../infrastructure/scripts/worktree-manager');
} catch {
  WorktreeManager = null;
}

let GotchasMemory;
try {
  GotchasMemory = require('../memory/gotchas-memory').GotchasMemory;
} catch {
  GotchasMemory = null;
}

// Optional chalk
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
    bgRed: (s) => s,
    bgGreen: (s) => s,
    magenta: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Pipeline options
  useWorktree: true,
  runQA: true,
  autoMerge: true,
  cleanupOnSuccess: true,

  // Execution
  maxIterations: 10,
  globalTimeout: 45 * 60 * 1000, // 45 minutes
  subtaskTimeout: 10 * 60 * 1000, // 10 minutes per subtask

  // Epic 10: Parallel Execution
  parallelMode: false, // Enable wave-based parallel execution
  maxParallel: 4, // Max concurrent tasks per wave
  useSubagentDispatch: false, // Route tasks to specialized agents

  // Claude CLI
  claudeModel: null, // Use default model from CLI config
  claudeMaxTokens: 16000,

  // Paths
  planDir: 'plan',
  reportDir: 'plan',
  storiesDir: 'docs/stories',

  // Flags
  dryRun: false,
  verbose: false,
  keepWorktree: false,
  noMerge: false,
};

const OrchestratorEvent = {
  BUILD_QUEUED: 'build_queued',
  PHASE_STARTED: 'phase_started',
  PHASE_COMPLETED: 'phase_completed',
  PHASE_FAILED: 'phase_failed',
  SUBTASK_EXECUTING: 'subtask_executing',
  QA_STARTED: 'qa_started',
  QA_COMPLETED: 'qa_completed',
  MERGE_STARTED: 'merge_started',
  MERGE_COMPLETED: 'merge_completed',
  BUILD_COMPLETED: 'build_completed',
  BUILD_FAILED: 'build_failed',
  REPORT_GENERATED: 'report_generated',
};

const Phase = {
  INIT: 'init',
  WORKTREE: 'worktree',
  PLAN: 'plan',
  EXECUTE: 'execute',
  QA: 'qa',
  MERGE: 'merge',
  CLEANUP: 'cleanup',
  REPORT: 'report',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BUILD ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class BuildOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rootPath = config.rootPath || process.cwd();
    this.activeBuilds = new Map(); // storyId -> buildContext
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              MAIN BUILD PIPELINE (AC3)
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Execute complete build pipeline (AC2, AC3)
   * Pipeline: worktree → plan → execute → verify → merge → cleanup
   */
  async build(storyId, options = {}) {
    const config = { ...this.config, ...options };
    const startTime = Date.now();

    // Check for existing build (AC7)
    if (this.activeBuilds.has(storyId)) {
      throw new Error(`Build already in progress for ${storyId}`);
    }

    // Initialize build context
    const ctx = {
      storyId,
      config,
      startTime,
      phases: {},
      worktree: null,
      plan: null,
      result: null,
      qaResult: null,
      mergeResult: null,
      errors: [],
    };

    this.activeBuilds.set(storyId, ctx);
    this.emit(OrchestratorEvent.BUILD_QUEUED, { storyId, config });

    try {
      // Phase 1: Initialize
      await t
```