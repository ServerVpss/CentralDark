# COMANDO - workflow-executor.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\workflow-executor.js
**SHA:** d24f0f5a999b90b1
**Timestamp:** 2026-08-28T02:02:00.271177
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const severityPattern = /\[(CRITICAL|HIGH|MEDIUM|LOW)\]/i;
- const filePattern = /([^\s:]+):(\d+)/;

### Contratos
- qualityGate: null,
- this.state.qualityGate = storyMetadata.quality_gate;
- console.log(`  Quality Gate: ${this.state.qualityGate}`);
- quality_gate: storyMetadata.quality_gate,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Workflow Executor - Development Cycle Engine
 *
 * Story 11.3: Projeto Bob - Development Cycle Workflow
 * Story 11.5: Session State Persistence (ADR-011)
 *
 * Executes the development cycle workflow with:
 * - Dynamic executor assignment (Story 11.1)
 * - Terminal spawning for clean context (Story 11.2)
 * - Session state persistence (Story 11.5)
 * - Conditional self-healing with CodeRabbit
 * - Quality gate by different agent
 * - Human checkpoints (GO/PAUSE/REVIEW/ABORT)
 *
 * @module core/orchestration/workflow-executor
 * @version 1.1.0
 */

'use strict';

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Import dependencies from Story 11.1, 11.2, and 11.5
const ExecutorAssignment = require('./executor-assignment');
const TerminalSpawner = require('./terminal-spawner');
const { SessionState, ActionType } = require('./session-state');

// Constants
const DEFAULT_TIMEOUT_MS = 7200000; // 2 hours
const CHECKPOINT_TIMEOUT_MS = 1800000; // 30 minutes
const STATE_SAVE_INTERVAL_MS = 300000; // 5 minutes

/**
 * Workflow phase status
 * @enum {string}
 */
const PhaseStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
};

/**
 * Checkpoint decision options
 * @enum {string}
 */
const CheckpointDecision = {
  GO: 'GO',
  PAUSE: 'PAUSE',
  REVIEW: 'REVIEW',
  ABORT: 'ABORT',
};

/**
 * Workflow execution state
 * @typedef {Object} WorkflowState
 * @property {string} workflowId - Workflow identifier
 * @property {string} currentPhase - Current phase ID
 * @property {string} currentStory - Path to current story file
 * @property {string} executor - Current executor agent
 * @property {string} qualityGate - Current quality gate agent
 * @property {number} attemptCount - Number of attempts for current phase
 * @property {Date} startedAt - Workflow start time
 * @property {Date} lastUpdated - Last state update time
 * @property {Object} phaseResults - Results from each phase
 * @property {Object} accumulatedContext - Context accumulated across phases
 */

/**
 * Workflow Executor class
 */
class WorkflowExecutor {
  /**
   * Creates a new WorkflowExecutor instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Executor options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      autoResume: true,
      saveState: true,
      useSessionState: true, // Story 11.5: Use unified session state
      ...options,
    };

    this.workflowPath = path.join(
      projectRoot,
      '.aios-core/development/workflows/development-cycle.yaml',
    );
    this.statePath = path.join(projectRoot, '.aios/workflow-state/');
    this.configPath = path.join(projectRoot, '.aios-core/core-config.yaml');

    this.workflow = null;
    this.state = null;
    this.config = null;

    // Story 11.5: Session State Manager (ADR-011)
    this.sessionState = new SessionState(projectRoot, { debug: options.debug });

    // Story 12.6: Phase change callbacks for observability
    this._phaseChangeCallbacks = [];
    this._agentSpawnCallbacks = [];
    this._terminalSpawnCallbacks = [];
  }

  /**
   * Registers a callback for phase change events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (phase, storyId, executor) => void
   * @returns {void}
   */
  onPhaseChange(callback) {
    if (typeof callback === 'function') {
      this._phaseChangeCallbacks.push(callback);
    }
  }

  /**
   * Registers a callback for agent spawn events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (agent, task) => void
   * @returns {void}
   */
  onAgentSpawn(callback) {
    if (typeof callback === 'function') {
      this._agentSpawnCallbacks.push(callback);
    }
  }

  /**
   * Registers a callback for terminal spawn events (Story 12.6 - AC1)
   * @param {Function} callback - Callback function (agent, pid, task) => void
   * @returns {void}
   */
  onTerminalSpawn(callback) {
    if (typeof callback === 'function') {
      this._terminalSpawnCallbacks.push(callback);
    }
  }

  /**
   * Emits phase change to all registered callbacks (Story 12.6)
   * @param {string} phase - Phase name
   * @param {string} storyId - Story ID
   * @param {string} executor - Executor agent
   * @private
   */
  _emitPhaseChange(phase, storyId, executor) {
    for (const callback of this._phaseChangeCallbacks) {
      try {
        callback(phase, storyId, executor);
      } catch (error) {
        if (this.options.debug) {
          console.log(`[WorkflowExecutor] Phase change callback error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Emits agent spawn to all registered callbacks (Story 12.6)
   * @param {string} agent - Agent ID
   * @param {string} task - Task being executed
   * @private
   */
  _emitAgentSpawn(agent, task) {
    for (co
```