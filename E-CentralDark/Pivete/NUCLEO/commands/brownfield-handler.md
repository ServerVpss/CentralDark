# COMANDO - brownfield-handler.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\brownfield-handler.js
**SHA:** 721606c2de14ecc2
**Timestamp:** 2026-08-28T02:01:59.866532
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- onPhaseStart: (phase) => this._onPhaseStart(phase, context),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Brownfield Handler - Story 12.8
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Handles first execution behavior for existing projects without AIOS documentation.
 * Executes the brownfield-discovery.yaml workflow to analyze the codebase and
 * generate technical debt assessment.
 *
 * Features:
 * - AC1: Detects first execution via EXISTING_NO_DOCS state
 * - AC2: Welcome conversation with time estimate (4-8h)
 * - AC3: Executes brownfield-discovery.yaml via WorkflowExecutor
 * - AC4: Generates system-architecture.md and TECHNICAL-DEBT-REPORT.md
 * - AC5: Post-discovery flow: resolve debts or add feature
 * - AC6: Idempotent re-execution (update, don't duplicate)
 *
 * @module core/orchestration/brownfield-handler
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BROWNFIELD PHASES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Brownfield discovery phases
 * @enum {string}
 */
const BrownfieldPhase = {
  WELCOME: 'welcome',
  SYSTEM_DOCUMENTATION: 'system_documentation',
  DATABASE_DOCUMENTATION: 'database_documentation',
  FRONTEND_DOCUMENTATION: 'frontend_documentation',
  INITIAL_CONSOLIDATION: 'initial_consolidation',
  DATABASE_REVIEW: 'database_specialist_review',
  UX_REVIEW: 'ux_specialist_review',
  QA_REVIEW: 'qa_general_review',
  FINAL_ASSESSMENT: 'final_assessment',
  EXECUTIVE_REPORT: 'executive_awareness_report',
  PLANNING: 'epic_creation',
  COMPLETE: 'complete',
};

/**
 * User decision after discovery
 * @enum {string}
 */
const PostDiscoveryChoice = {
  RESOLVE_DEBTS: 'resolve_debts',
  ADD_FEATURE: 'add_feature',
};

/**
 * Phase failure action
 * @enum {string}
 */
const PhaseFailureAction = {
  RETRY: 'retry',
  SKIP: 'skip',
  ABORT: 'abort',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              BROWNFIELD HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BrownfieldHandler - Manages first execution behavior for existing projects
 */
class BrownfieldHandler extends EventEmitter {
  /**
   * @param {string} projectRoot - Project root path
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {Object} [options.workflowExecutor] - WorkflowExecutor instance
   * @param {Object} [options.surfaceChecker] - SurfaceChecker instance
   * @param {Object} [options.sessionState] - SessionState instance
   */
  constructor(projectRoot, options = {}) {
    super();

    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    // Lazy-loaded dependencies
    this._workflowExecutor = options.workflowExecutor || null;
    this._surfaceChecker = options.surfaceChecker || null;
    this._sessionState = options.sessionState || null;

    // Workflow path
    this.workflowPath = path.join(
      projectRoot,
      '.aios-core/development/workflows/brownfield-discovery.yaml',
    );

    // Phase progress tracking
    this.phaseProgress = {};

    this._log('BrownfieldHandler initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LAZY DEPENDENCY LOADING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Get WorkflowExecutor instance
   * @private
   */
  _getWorkflowExecutor() {
    if (!this._workflowExecutor) {
      try {
        const { WorkflowExecutor } = require('./workflow-executor');
        this._workflowExecutor = new WorkflowExecutor(this.projectRoot, {
          debug: this.options.debug,
        });
      } catch (error) {
        this._log(`WorkflowExecutor not available: ${error.message}`, 'warn');
      }
    }
    return this._workflowExecutor;
  }

  /**
   * Get SurfaceChecker instance
   * @private
   */
  _getSurfaceChecker() {
    if (!this._surfaceChecker) {
      try {
        const { SurfaceChecker } = require('./surface-checker');
        this._surfaceChecker = new SurfaceChecker();
      } catch (error) {
        this._log(`SurfaceChecker not available: ${error.message}`, 'warn');
      }
    }
    return this._surfaceChecker;
  }

  /**
   * Get SessionState instance
   * @private
   */
  _getSessionState() {
    if (!this._sessionState) {
      try {
        const { SessionState } = require('./session-state');
        this._sessionState = new SessionState(this.projectRoot, {
          debug: this.options.debug,
        });
      } catch (error) {
        this._log(`SessionState not ava
```