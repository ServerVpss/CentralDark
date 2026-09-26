# COMANDO - qa-feedback.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\learning\qa-feedback.js
**SHA:** 2c629b42360ab7cd
**Timestamp:** 2026-08-28T02:02:24.010587
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = this.patternStore.getPattern(patternId);
- console.error('Failed to deprecate pattern:', error.message);
- pattern: patternId,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * QA Feedback Loop - Story 12.5
 *
 * Receive feedback from QA results to adjust pattern confidence
 * and deprecate patterns that consistently fail.
 *
 * Absorbed from Auto-Claude's QA_RESULT episode type.
 *
 * @module qa-feedback
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Confidence adjustments
  successBoost: 0.05, // Increase on success
  failurePenalty: 0.1, // Decrease on failure
  criticalPenalty: 0.2, // Decrease on critical failure

  // Deprecation thresholds
  deprecateAfterFailures: 3, // Consecutive failures to deprecate
  minConfidenceThreshold: 0.3, // Below this = deprecated

  // Feedback storage
  feedbackStorePath: '.aios/qa-feedback.json',
  maxFeedbackHistory: 1000,

  // Suggestions
  suggestAlternativeThreshold: 0.5, // Confidence below this triggers suggestion
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              QA FEEDBACK PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════════════

class QAFeedbackProcessor {
  /**
   * Create a new QAFeedbackProcessor
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.patternStore] - Pattern store instance
   * @param {Object} [options.gotchaRegistry] - Gotcha registry instance
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.storePath = path.join(this.rootPath, this.config.feedbackStorePath);

    this.patternStore = options.patternStore || null;
    this.gotchaRegistry = options.gotchaRegistry || null;

    this._feedbackHistory = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STORAGE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load feedback history
   */
  loadFeedback() {
    if (this._feedbackHistory) {
      return this._feedbackHistory;
    }

    if (!fs.existsSync(this.storePath)) {
      this._feedbackHistory = {
        history: [],
        patternStats: {},
        metadata: { version: '1.0.0', lastUpdated: null },
      };
      return this._feedbackHistory;
    }

    try {
      const content = fs.readFileSync(this.storePath, 'utf-8');
      this._feedbackHistory = JSON.parse(content);
      return this._feedbackHistory;
    } catch (error) {
      console.error('Failed to load feedback history:', error.message);
      this._feedbackHistory = {
        history: [],
        patternStats: {},
        metadata: { version: '1.0.0', lastUpdated: null },
      };
      return this._feedbackHistory;
    }
  }

  /**
   * Save feedback history
   */
  saveFeedback() {
    if (!this._feedbackHistory) {
      return;
    }

    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Enforce max history
    if (this._feedbackHistory.history.length > this.config.maxFeedbackHistory) {
      this._feedbackHistory.history = this._feedbackHistory.history.slice(
        -this.config.maxFeedbackHistory,
      );
    }

    this._feedbackHistory.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.storePath, JSON.stringify(this._feedbackHistory, null, 2), 'utf-8');
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PROCESS QA RESULT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Process QA result and update pattern confidence
   *
   * @param {Object} qaResult - QA result from qa-review-build
   * @param {Object} context - Context information
   * @returns {Object} Feedback processing result
   */
  processQAResult(qaResult, context = {}) {
    this.loadFeedback();

    const result = {
      processed: true,
      patternsAffected: [],
      gotchasCreated: [],
      suggestions: [],
      actions: [],
    };

    // Extract pattern from context
    const patternId = context.patternId || this._inferPattern(context);

    if (!patternId) {
      result.processed = false;
      result.reason = 'No pattern identified';
      return result;
    }

    // Determine outcome
    const outcome = this._determineOutcome(qaResult);

    // Record feedback
    const feedback = {
      id: this._generateId(),
      patternId,
      storyId: context.storyId,
      outcome: outcome.status,
      severity: outcome.severity,
      issues: outcome.issues,
```