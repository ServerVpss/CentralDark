# CONTRATO - gate-evaluator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\gate-evaluator.js
**SHA:** a6afd775aae2b84f
**Timestamp:** 2026-08-28T02:01:59.971192
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._log(`Evaluating gate: ${gateKey}`, 'info');
- gate: gateKey,
- return this.results.find((r) => r.gate === gateKey) || null;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Gate Evaluator - Story 0.6
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Evaluates quality gates between epics to ensure bad outputs don't propagate.
 *
 * Features:
 * - AC1: Gate check after each epic completes
 * - AC2: Gate verdicts: APPROVED, NEEDS_REVISION, BLOCKED
 * - AC3: BLOCKED halts pipeline and escalates
 * - AC4: NEEDS_REVISION returns to previous epic
 * - AC5: Gates configurable in core-config.yaml
 * - AC6: Gate results saved in state
 * - AC7: Strict mode: any gate fail = halt
 *
 * @module core/orchestration/gate-evaluator
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GATE VERDICTS (AC2)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gate verdict enum
 */
const GateVerdict = {
  /** Output meets all quality criteria */
  APPROVED: 'approved',
  /** Output needs revision, return to previous epic */
  NEEDS_REVISION: 'needs_revision',
  /** Critical issue, halt pipeline */
  BLOCKED: 'blocked',
};

/**
 * Default gate configurations
 */
const DEFAULT_GATE_CONFIG = {
  // Epic 3 -> Epic 4 gate
  epic3_to_epic4: {
    blocking: true,
    minScore: 3.0,
    requireApproval: false,
    checks: ['spec_exists', 'complexity_assessed', 'requirements_defined'],
  },
  // Epic 4 -> Epic 6 gate
  epic4_to_epic6: {
    blocking: true,
    requireTests: true,
    minTestCoverage: 0,
    checks: ['plan_complete', 'implementation_exists', 'no_critical_errors'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GATE EVALUATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GateEvaluator - Evaluates quality gates between epics (AC1)
 */
class GateEvaluator {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {boolean} [options.strictMode=false] - Strict mode: any fail = halt (AC7)
   * @param {Object} [options.gateConfig] - Custom gate configurations (AC5)
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.strictMode = options.strictMode ?? false;
    this.gateConfig = options.gateConfig || null;

    // Results storage (AC6)
    this.results = [];
    this.logs = [];
  }

  /**
   * Load gate configuration from core-config.yaml (AC5)
   * @private
   */
  async _loadConfig() {
    if (this.gateConfig) {
      return this.gateConfig;
    }

    try {
      const configPath = path.join(this.projectRoot, '.aios-core', 'core-config.yaml');
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf8');
        const config = yaml.load(content);

        if (config?.autoClaude?.orchestrator?.gates) {
          return { ...DEFAULT_GATE_CONFIG, ...config.autoClaude.orchestrator.gates };
        }
      }
    } catch (error) {
      this._log(`Failed to load gate config: ${error.message}`, 'warn');
    }

    return DEFAULT_GATE_CONFIG;
  }

  /**
   * Get gate key for transition
   * @private
   */
  _getGateKey(fromEpic, toEpic) {
    return `epic${fromEpic}_to_epic${toEpic}`;
  }

  /**
   * Evaluate gate between epics (AC1)
   *
   * @param {number} fromEpic - Source epic number
   * @param {number} toEpic - Target epic number
   * @param {Object} epicResult - Result from the source epic
   * @returns {Promise<Object>} Gate evaluation result
   */
  async evaluate(fromEpic, toEpic, epicResult) {
    const gateKey = this._getGateKey(fromEpic, toEpic);
    this._log(`Evaluating gate: ${gateKey}`, 'info');

    const config = await this._loadConfig();
    const gateConfig = config[gateKey] || { blocking: false };

    const result = {
      gate: gateKey,
      fromEpic,
      toEpic,
      timestamp: new Date().toISOString(),
      verdict: GateVerdict.APPROVED,
      score: 0,
      checks: [],
      issues: [],
      config: gateConfig,
    };

    try {
      // Run gate checks
      const checks = await this._runGateChecks(fromEpic, toEpic, epicResult, gateConfig);
      result.checks = checks;

      // Calculate score
      const passedChecks = checks.filter((c) => c.passed).length;
      result.score = checks.length > 0 ? (passedChecks / checks.length) * 5 : 5;

      // Collect issues
      result.issues = checks
        .filter((c) => !c.passed)
        .map((c) => ({
          check: c.name,
          message: c.message,
          severity: c.severity || 'medium',
        }));

      // Determine verdict (AC2)
      result.verdict = this._determineVerdict(result, gateConfig);

      this._log(`Gate ${gateKey}: ${result.verdict} (score: ${result.score.toFixed(1)})`, 'info');
    } catch (error) {
      result.verdict = GateVerdict.BLOCKED;
      resul
```