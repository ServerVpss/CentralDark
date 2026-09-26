# COMANDO - master-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\master-orchestrator.js
**SHA:** 0f636d7b7a26c4d5
**Timestamp:** 2026-08-28T02:02:00.037774
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.onEpicStart = options.onEpicStart || this._defaultEpicStart.bind(this);

### Contratos
- gate: gateResult.gate,
- this._log(`Evaluating gate: Epic ${epicNum} -> Epic ${nextEpic}`, { icon: '🚦' });
- gate: `epic${epicNum}_to_epic${nextEpic}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Master Orchestrator - Epic 0: Autonomous Development Engine
 *
 * Story: 0.1 - Master Orchestrator Core
 *
 * Central orchestrator that connects all ADE epics (3→4→5→6) in a unified
 * execution pipeline for truly autonomous development.
 *
 * Features:
 * - AC1: Located in `.aios-core/core/orchestration/`
 * - AC2: constructor(projectRoot, options) with storyId, maxRetries, autoRecovery
 * - AC3: executeFullPipeline() runs Epics 3→4→5→6
 * - AC4: executeEpic(epicNum, options) for individual epic execution
 * - AC5: resumeFromEpic(epicNum) to continue from specific point
 * - AC6: State machine: INITIALIZED, READY, IN_PROGRESS, BLOCKED, COMPLETE
 * - AC7: Integrates with TechStackDetector for pre-flight detection
 *
 * @module core/orchestration/master-orchestrator
 * @version 1.0.0
 * @author @dev (Dex)
 */

const fs = require('fs-extra');
const path = require('path');
const { EventEmitter } = require('events');

// Core dependencies
const TechStackDetector = require('./tech-stack-detector');

// Epic Executors (Story 0.3)
const { createExecutor, hasExecutor } = require('./executors');

// Recovery Handler (Story 0.5)
const { RecoveryHandler, RecoveryStrategy: _RecoveryStrategy } = require('./recovery-handler');

// Gate Evaluator (Story 0.6)
const { GateEvaluator, GateVerdict } = require('./gate-evaluator');

// Agent Invoker (Story 0.7)
const { AgentInvoker, SUPPORTED_AGENTS: _SUPPORTED_AGENTS } = require('./agent-invoker');

// Dashboard Integration (Story 0.8)
const { DashboardIntegration, NotificationType: _NotificationType } = require('./dashboard-integration');

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
//                              STATE MACHINE (AC6)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Orchestrator state machine states
 * @enum {string}
 */
const OrchestratorState = {
  /** Initial state after construction */
  INITIALIZED: 'initialized',
  /** Ready to execute after pre-flight checks */
  READY: 'ready',
  /** Currently executing epics */
  IN_PROGRESS: 'in_progress',
  /** Blocked due to error or requiring intervention */
  BLOCKED: 'blocked',
  /** All epics completed successfully */
  COMPLETE: 'complete',
};

/**
 * Epic execution status
 * @enum {string}
 */
const EpicStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Epic configuration - maps epic numbers to their metadata
 */
const EPIC_CONFIG = {
  3: {
    name: 'Spec Pipeline',
    description: 'Requirements → Specification generation',
    executor: 'Epic3Executor',
    icon: '📝',
  },
  4: {
    name: 'Execution Engine',
    description: 'Plan tracking and subtask execution',
    executor: 'Epic4Executor',
    icon: '⚙️',
  },
  5: {
    name: 'Recovery System',
    description: 'Error detection and recovery',
    executor: 'Epic5Executor',
    icon: '🔄',
    onDemand: true, // Only triggered on errors
  },
  6: {
    name: 'QA Loop',
    description: 'Quality assurance and validation',
    executor: 'Epic6Executor',
    icon: '🔍',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              MASTER ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Master Orchestrator - Coordinates all ADE epics in unified execution
 * @extends EventEmitter
 */
class MasterOrchestrator extends EventEmitter {
  /**
   * Create a new MasterOrchestrator instance (AC2)
   *
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Configuration options
   * @param {string} [options.storyId] - Story identifier (e.g., 'STORY-42')
   * @param {number} [options.maxRetries=3] - Maximum retry attempts per epic
   * @param {boolean} [options.autoRecovery=true] - Enable automatic recovery on failures
   * @param {string} [options.source='story'] - Source type: 'story', 'prd', 'prompt'
   * @param {string} [options.prdPath] - Path to PRD if source is 'prd'
   * @param {boolean} [options.strictGates=false] - Fail on any gate failure
   * @param {Function} [options.onEpicStart] - Callback when epic starts
   * @param {Function} [options.onEpicComplete] - Callback when epic completes
   * @param {Function} [options.onStateChange] - Callback on state transitions
   * @param {Function} [options.invokeAgent] - Function to invoke agents for tasks
   */
  constructor(projectRoot, options = {}) {
    super();

    // Core configuration
    this.projectRoot = projectRoot;
    this.storyId = options.storyId || null;
    this.m
```