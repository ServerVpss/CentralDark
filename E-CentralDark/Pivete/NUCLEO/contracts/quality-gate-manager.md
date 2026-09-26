# CONTRATO - quality-gate-manager.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\quality-gates\quality-gate-manager.js
**SHA:** a662b6f8b431baaf
**Timestamp:** 2026-08-28T02:02:00.702524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- lastRun: status.lastRun,
- lastRun: null,
- lastRun: new Date().toISOString(),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Quality Gate Manager
 *
 * Orchestrates the 3-layer quality gate pipeline:
 * - Layer 1: Pre-commit (lint, test, typecheck)
 * - Layer 2: PR Automation (CodeRabbit, Quinn)
 * - Layer 3: Human Review (checklist, sign-off)
 *
 * @module core/quality-gates/quality-gate-manager
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { Layer1PreCommit } = require('./layer1-precommit');
const { Layer2PRAutomation } = require('./layer2-pr-automation');
const { Layer3HumanReview } = require('./layer3-human-review');
const { HumanReviewOrchestrator } = require('./human-review-orchestrator');
const { NotificationManager } = require('./notification-manager');

/**
 * Default configuration path
 */
const DEFAULT_CONFIG_PATH = '.aios-core/core/quality-gates/quality-gate-config.yaml';

/**
 * Quality Gate Manager - Main orchestrator
 */
class QualityGateManager {
  /**
   * Create a new QualityGateManager
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.config = config;
    this.layers = {
      layer1: new Layer1PreCommit(config.layer1 || {}),
      layer2: new Layer2PRAutomation(config.layer2 || {}),
      layer3: new Layer3HumanReview(config.layer3 || {}),
    };
    this.humanReviewOrchestrator = new HumanReviewOrchestrator(config.humanReview || {});
    this.notificationManager = new NotificationManager(config.notifications || {});
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Load configuration from file
   * @param {string} configPath - Path to config file
   * @returns {Promise<QualityGateManager>} New instance with loaded config
   */
  static async load(configPath = DEFAULT_CONFIG_PATH) {
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(content);
      return new QualityGateManager(config);
    } catch (_error) {
      console.warn(`Could not load config from ${configPath}, using defaults`);
      return new QualityGateManager({});
    }
  }

  /**
   * Run a specific layer
   * @param {number} layerNum - Layer number (1, 2, or 3)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer result
   */
  async runLayer(layerNum, context = {}) {
    const layerMap = {
      1: 'layer1',
      2: 'layer2',
      3: 'layer3',
    };

    const layerKey = layerMap[layerNum];
    if (!layerKey) {
      throw new Error(`Invalid layer number: ${layerNum}. Use 1, 2, or 3.`);
    }

    const layer = this.layers[layerKey];
    return await layer.execute(context);
  }

  /**
   * Run Layer 1: Pre-commit checks
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 1 results
   */
  async runLayer1(context = {}) {
    return await this.layers.layer1.execute(context);
  }

  /**
   * Run Layer 2: PR Automation
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 2 results
   */
  async runLayer2(context = {}) {
    return await this.layers.layer2.execute(context);
  }

  /**
   * Run Layer 3: Human Review
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 3 results
   */
  async runLayer3(context = {}) {
    return await this.layers.layer3.execute(context);
  }

  /**
   * Orchestrate the full quality gate pipeline
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Pipeline results
   */
  async orchestrate(context = {}) {
    this.startTime = Date.now();
    this.results = [];

    const { verbose = false } = context;

    if (verbose) {
      console.log('\n🔍 Quality Gate Pipeline');
      console.log('━'.repeat(50));
    }

    // Layer 1: Pre-commit
    const l1Result = await this.runLayer1(context);
    this.results.push(l1Result);

    if (!l1Result.pass) {
      this.endTime = Date.now();
      return this.failFast(l1Result, context);
    }

    // Layer 2: PR Automation
    const l2Result = await this.runLayer2(context);
    this.results.push(l2Result);

    if (!l2Result.pass) {
      this.endTime = Date.now();
      return this.escalate(l2Result, context);
    }

    // Layer 3: Human Review
    const l3Context = {
      ...context,
      previousLayers: [l1Result, l2Result],
    };
    const l3Result = await this.runLayer3(l3Context);
    this.results.push(l3Result);

    this.endTime = Date.now();

    // Determine overall pass status
    const signoffResult = l3Result.results?.find((r) => r.check === 'signoff');
    const allPassed = l1Result.pass && l2Result.pass;
    const pendingReview = signoffResult && !signoffResult.signedOff && signoffResult.required;

    return this.getOrchestratedResult(allPassed, pendingReview, context);
  }

  /**
   * Handle fail-fast on Layer 1 failure
   * @param {Object} result - Layer 1 result
   * @param {Object} context - Execution context
   * @returns {Object} F
```