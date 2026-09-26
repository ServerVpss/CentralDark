# COMANDO - human-review-orchestrator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\quality-gates\human-review-orchestrator.js
**SHA:** e2b587ed522923f0
**Timestamp:** 2026-08-28T02:02:00.710556
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- checksRun: layerResult.checks?.total || 0,

### Padroes
- const validIdPattern = /^[A-Za-z0-9_.-]+$/;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Human Review Orchestrator (Layer 3 Enhancement)
 *
 * Orchestrates the complete 3-layer quality gate flow with:
 * - Layer 1+2 pass detection
 * - Layer 1+2 fail blocking
 * - Human review request system
 * - Focus area recommendations
 * - Notification management
 *
 * @module core/quality-gates/human-review-orchestrator
 * @version 1.0.0
 * @story 3.5 - Human Review Orchestration (Layer 3)
 */

const fs = require('fs').promises;
const path = require('path');
const { FocusAreaRecommender } = require('./focus-area-recommender');
const { NotificationManager } = require('./notification-manager');

/**
 * Human Review Orchestrator
 * Implements the 3-layer orchestration flow
 */
class HumanReviewOrchestrator {
  /**
   * Create a new orchestrator
   * @param {Object} config - Orchestrator configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.focusRecommender = new FocusAreaRecommender(config.focusAreas || {});
    this.notificationManager = new NotificationManager(config.notifications || {});
    this.statusPath = config.statusPath || '.aios/qa-status.json';
    this.reviewRequestsPath = config.reviewRequestsPath || '.aios/human-review-requests';
    // Status queue for serializing concurrent writes to status file
    this.statusQueue = Promise.resolve();
  }

  /**
   * Orchestrate the full review flow
   * @param {Object} prContext - PR/change context
   * @param {Object} layer1Result - Layer 1 results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Promise<Object>} Orchestration result
   */
  async orchestrateReview(prContext, layer1Result, layer2Result) {
    const startTime = Date.now();

    // Step 1: Check Layer 1 pass/fail
    const layer1Check = this.checkLayerPassed(layer1Result, 'Layer 1');
    if (!layer1Check.pass) {
      return this.block(layer1Check, 'layer1', startTime);
    }

    // Step 2: Check Layer 2 pass/fail
    const layer2Check = this.checkLayerPassed(layer2Result, 'Layer 2');
    if (!layer2Check.pass) {
      return this.block(layer2Check, 'layer2', startTime);
    }

    // Step 3: Both layers passed - generate human review request
    const reviewRequest = await this.generateHumanReviewRequest(
      prContext,
      layer1Result,
      layer2Result,
    );

    // Step 4: Send notification to human reviewer
    await this.notifyReviewer(reviewRequest);

    // Step 5: Save the review request
    await this.saveReviewRequest(reviewRequest);

    return {
      pass: true,
      status: 'pending_human_review',
      duration: Date.now() - startTime,
      message: 'Layers 1+2 passed. Human review requested.',
      reviewRequest,
      layers: {
        layer1: layer1Check,
        layer2: layer2Check,
      },
    };
  }

  /**
   * Check if a layer passed
   * @param {Object} layerResult - Layer result object
   * @param {string} layerName - Layer name for messaging
   * @returns {Object} Check result
   */
  checkLayerPassed(layerResult, layerName) {
    if (!layerResult) {
      return {
        pass: false,
        layer: layerName,
        reason: `${layerName} not executed`,
        issues: [],
      };
    }

    const pass = layerResult.pass === true;
    const issues = this.extractIssues(layerResult);

    return {
      pass,
      layer: layerName,
      duration: layerResult.duration || 0,
      checksRun: layerResult.checks?.total || 0,
      checksPassed: layerResult.checks?.passed || 0,
      checksFailed: layerResult.checks?.failed || 0,
      reason: pass ? `${layerName} passed` : `${layerName} failed`,
      issues,
    };
  }

  /**
   * Extract issues from layer result
   * @param {Object} layerResult - Layer result
   * @returns {Array} Extracted issues
   */
  extractIssues(layerResult) {
    const issues = [];

    if (!layerResult.results) return issues;

    layerResult.results.forEach((result) => {
      if (!result.pass) {
        issues.push({
          check: result.check,
          message: result.message,
          severity: this.determineSeverity(result),
          details: result.error || result.details || null,
        });
      }
    });

    return issues;
  }

  /**
   * Determine severity from result
   * @param {Object} result - Check result
   * @returns {string} Severity level
   */
  determineSeverity(result) {
    if (result.check === 'lint') return 'HIGH';
    if (result.check === 'test') return 'CRITICAL';
    if (result.check === 'typecheck') return 'HIGH';
    if (result.issues?.critical > 0) return 'CRITICAL';
    if (result.issues?.high > 0) return 'HIGH';
    return 'MEDIUM';
  }

  /**
   * Block the review flow due to layer failure
   * @param {Object} layerCheck - Failed layer check
   * @param {string} stoppedAt - Layer that caused the block
   * @param {number} startTime - Orchestration start time
   * @returns {Object} Block result
   */
  block(layerCheck, stoppedAt, startTime) {
    const blockMessages = {
      layer1: 'Fix linting, tests, and type errors before hu
```