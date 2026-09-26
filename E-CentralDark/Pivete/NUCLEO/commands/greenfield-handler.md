# COMANDO - greenfield-handler.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\greenfield-handler.js
**SHA:** 54b141713fd0df14
**Timestamp:** 2026-08-28T02:01:59.990288
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- instructions: `Spawn ${agent} manually and execute: *${task}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Greenfield Handler - Story 12.13
 *
 * Epic 12: Bob Full Integration — Completando o PRD v2.0
 *
 * Orchestrates the complete Greenfield Workflow (greenfield-fullstack.yaml)
 * for users starting a brand new project from scratch.
 *
 * Features:
 * - AC1: Detects Greenfield state (no package.json, .git, docs/)
 * - AC2-5: Orchestrates 4 phases (Bootstrap → Discovery → Sharding → Dev Cycle)
 * - AC6-10: Integrates with all Epic 11 modules
 * - AC11-14: Surface decisions between phases with PAUSE/resume
 * - AC15-17: Error handling (Retry/Skip/Abort) and idempotency
 *
 * @module core/orchestration/greenfield-handler
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GREENFIELD CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Default indicators that signal a project is NOT greenfield
 * @constant {string[]}
 */
const DEFAULT_GREENFIELD_INDICATORS = [
  'package.json',
  '.git',
  'docs/',
  'src/',
  '.aios-core/',
];

/**
 * Greenfield workflow phases
 * @enum {string}
 */
const GreenfieldPhase = {
  DETECTION: 'detection',
  BOOTSTRAP: 'phase_0_bootstrap',
  DISCOVERY: 'phase_1_discovery',
  SHARDING: 'phase_2_sharding',
  DEV_CYCLE: 'phase_3_dev_cycle',
  COMPLETE: 'complete',
};

/**
 * Phase 1 agent sequence (Discovery & Planning)
 * @constant {Array<{agent: string, task: string, creates: string}>}
 */
const PHASE_1_SEQUENCE = [
  { agent: '@analyst', task: 'project-brief', creates: 'docs/project-brief.md' },
  { agent: '@pm', task: 'create-prd', creates: 'docs/prd.md' },
  { agent: '@ux-design-expert', task: 'front-end-spec', creates: 'docs/front-end-spec.md' },
  { agent: '@architect', task: 'architecture', creates: 'docs/fullstack-architecture.md' },
  { agent: '@po', task: 'validate-artifacts', creates: null },
];

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
//                              GREENFIELD HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GreenfieldHandler - Orchestrates the complete Greenfield Workflow
 */
class GreenfieldHandler extends EventEmitter {
  /**
   * @param {string} projectRoot - Project root path
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {Object} [options.workflowExecutor] - WorkflowExecutor instance
   * @param {Object} [options.surfaceChecker] - SurfaceChecker instance
   * @param {Object} [options.sessionState] - SessionState instance
   * @param {string[]} [options.indicators] - Custom greenfield indicators
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

    // Configurable indicators (AC1)
    this.indicators = options.indicators || DEFAULT_GREENFIELD_INDICATORS;

    // Lazy-loaded dependencies
    this._workflowExecutor = options.workflowExecutor || null;
    this._surfaceChecker = options.surfaceChecker || null;
    this._sessionState = options.sessionState || null;

    // Workflow path
    this.workflowPath = path.join(
      projectRoot,
      '.aios-core/development/workflows/greenfield-fullstack.yaml',
    );

    // Phase progress tracking
    this.phaseProgress = {};

    this._log('GreenfieldHandler initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              LAZY DEPENDENCY LOADING
  // ═══════════════════════════════════════════════════════════════════════════════════

  /** @private */
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

  /** @private */
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

  /** @private */
  _getSessionState() {
    if (!this._sessionState) {
      try {
       
```