# COMANDO - bob-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\bob-orchestrator.js
**SHA:** 84b4b5c9e2b82ea6
**Timestamp:** 2026-08-28T02:01:59.794112
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- persistencePrompt: this.getEducationalModePersistencePrompt(),
- needsReprompt: true,

### Contratos
- this._log(`Assigned executor: ${assignment.executor}, gate: ${assignment.quality_gate}`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Bob Orchestrator - Decision Tree Entry Point
 *
 * Story 12.3: Bob Orchestration Logic (Decision Tree)
 * PRD Reference: §3.3 (Decision Tree), §3.7 (Router not God Class)
 *
 * This is the main entry point for Bob (PM agent). It detects project state
 * and routes to the appropriate workflow using codified decision logic
 * (no LLM reasoning for routing decisions).
 *
 * Integrates all Epic 11 modules:
 * - ExecutorAssignment (11.1) — agent selection
 * - TerminalSpawner (11.2) — agent spawning
 * - WorkflowExecutor (11.3) — development cycle
 * - SurfaceChecker (11.4) — human decision criteria
 * - SessionState (11.5) — session persistence
 *
 * Constraint: < 50 lines of other-agent-specific logic (PRD §3.7)
 *
 * @module core/orchestration/bob-orchestrator
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { resolveConfig } = require('../config/config-resolver');
const ExecutorAssignment = require('./executor-assignment');
const { WorkflowExecutor } = require('./workflow-executor');
const { SurfaceChecker } = require('./surface-checker');
const { SessionState } = require('./session-state');
const LockManager = require('./lock-manager');
const { DataLifecycleManager } = require('./data-lifecycle-manager');

// Story 12.8: Brownfield Handler
const { BrownfieldHandler } = require('./brownfield-handler');

// Story 12.13: Greenfield Handler
const { GreenfieldHandler } = require('./greenfield-handler');

// Story 12.6: Observability Panel Integration + Dashboard Bridge
const { ObservabilityPanel, PanelMode } = require('../ui/observability-panel');
const { BobStatusWriter } = require('./bob-status-writer');
const { getDashboardEmitter } = require('../events/dashboard-emitter');

// Story 12.7: Educational Mode
const { MessageFormatter } = require('./message-formatter');
const { setUserConfigValue } = require('../config/config-resolver');

/**
 * Project state enum — detected by decision tree
 * @enum {string}
 */
const ProjectState = {
  NO_CONFIG: 'NO_CONFIG',
  EXISTING_NO_DOCS: 'EXISTING_NO_DOCS',
  EXISTING_WITH_DOCS: 'EXISTING_WITH_DOCS',
  GREENFIELD: 'GREENFIELD',
};

/**
 * Orchestration result
 * @typedef {Object} OrchestrationResult
 * @property {boolean} success - Whether orchestration completed successfully
 * @property {string} projectState - Detected project state
 * @property {string} action - Action taken
 * @property {Object} [data] - Additional result data
 * @property {string} [error] - Error message if failed
 */

/**
 * BobOrchestrator — Main decision tree and orchestration entry point
 */
class BobOrchestrator {
  /**
   * Creates a new BobOrchestrator instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Orchestrator options
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    // Initialize Epic 11 dependencies
    this.surfaceChecker = new SurfaceChecker();
    this.sessionState = new SessionState(projectRoot, { debug: this.options.debug });
    this.workflowExecutor = new WorkflowExecutor(projectRoot, { debug: this.options.debug });
    this.lockManager = new LockManager(projectRoot, { debug: this.options.debug });

    // Story 12.5: Data Lifecycle Manager
    this.dataLifecycleManager = new DataLifecycleManager(projectRoot, { debug: this.options.debug });

    // Story 12.8: Brownfield Handler
    this.brownfieldHandler = new BrownfieldHandler(projectRoot, {
      debug: this.options.debug,
      workflowExecutor: this.workflowExecutor,
      surfaceChecker: this.surfaceChecker,
      sessionState: this.sessionState,
    });

    // Story 12.13: Greenfield Handler
    this.greenfieldHandler = new GreenfieldHandler(projectRoot, {
      debug: this.options.debug,
      workflowExecutor: this.workflowExecutor,
      surfaceChecker: this.surfaceChecker,
      sessionState: this.sessionState,
    });

    // Story 12.7: Educational Mode (AC1-2)
    // Educational mode is resolved from: session override > user config > default (false)
    this.educationalMode = this._resolveEducationalMode();
    this.messageFormatter = new MessageFormatter({ educationalMode: this.educationalMode });

    // Story 12.6: Observability Panel Integration (AC1-5)
    // Story 12.7: Panel mode based on educational mode (AC2, AC7)
    this.observabilityPanel = new ObservabilityPanel({
      mode: this.educationalMode ? PanelMode.DETAILED : PanelMode.MINIMAL,
      refreshRate: 1000, // 1 second refresh (AC3)
    });

    // Story 12.6: Dashboard Bridge (AC6-11)
    this.bobStatusWriter = new BobStatusWriter(projectRoot, { debug: this.options.debug });
    this.dashboardEmitter = getDashboardEmitter();

    // S
```