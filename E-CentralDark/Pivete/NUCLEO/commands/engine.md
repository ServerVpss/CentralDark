# COMANDO - engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\health-check\engine.js
**SHA:** 4388d1c988d3789c
**Timestamp:** 2026-08-28T02:01:58.094561
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- checksRun: this.results.length,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Health Check Engine
 *
 * Core execution engine for health checks. Handles parallel execution,
 * caching, timeout management, and result aggregation.
 *
 * @module @synkra/aios-core/health-check/engine
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const { CheckStatus, CheckSeverity } = require('./base-check');

/**
 * Simple in-memory cache for check results
 * @private
 */
class ResultCache {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached result
   * @param {string} key - Cache key
   * @param {Object} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached results
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
    };
  }
}

/**
 * Health Check Engine
 *
 * Executes health checks with support for:
 * - Parallel execution within domains
 * - Result caching
 * - Timeout management
 * - Fail-fast for critical issues
 *
 * @class HealthCheckEngine
 */
class HealthCheckEngine {
  /**
   * Create a new HealthCheckEngine
   * @param {Object} config - Engine configuration
   * @param {boolean} [config.parallel=true] - Enable parallel execution
   * @param {Object} [config.cache] - Cache configuration
   * @param {Object} [config.performance] - Performance settings
   */
  constructor(config = {}) {
    this.config = config;
    this.parallel = config.parallel !== false;
    this.cache = new ResultCache(config.cache?.ttl || 300000);
    this.cacheEnabled = config.cache?.enabled !== false;

    this.timeouts = {
      quick: config.performance?.quickModeTimeout || 10000,
      full: config.performance?.fullModeTimeout || 60000,
    };

    this.startTime = null;
    this.results = [];
    this.errors = [];
  }

  /**
   * Run all provided checks
   *
   * @param {BaseCheck[]} checks - Array of checks to run
   * @param {Object} runConfig - Runtime configuration
   * @returns {Promise<Object[]>} Array of check results
   */
  async runChecks(checks, runConfig = {}) {
    this.startTime = Date.now();
    this.results = [];
    this.errors = [];

    const mode = runConfig.mode || 'quick';
    const timeout = this.timeouts[mode] || this.timeouts.quick;

    // Group checks by domain for parallel execution
    const _checksByDomain = this.groupByDomain(checks);

    // Execute checks by priority
    const _priorityOrder = [
      CheckSeverity.CRITICAL,
      CheckSeverity.HIGH,
      CheckSeverity.MEDIUM,
      CheckSeverity.LOW,
      CheckSeverity.INFO,
    ];

    try {
      // Run CRITICAL checks first
      const criticalChecks = checks.filter((c) => c.severity === CheckSeverity.CRITICAL);
      if (criticalChecks.length > 0) {
        const criticalResults = await this.runCheckGroup(criticalChecks, timeout, runConfig);
        this.results.push(...criticalResults);

        // Fail-fast in quick mode if critical failures
        if (mode === 'quick' && this.hasCriticalFailure(criticalResults)) {
          return this.results;
        }
      }

      // Run remaining checks by domain (parallel)
      const remainingChecks = checks.filter((c) => c.severity !== CheckSeverity.CRITICAL);

      if (this.parallel) {
        // Group by domain and run domains in parallel
        const domainGroups = this.groupByDomain(remainingChecks);
        const domainPromises = Object.entries(domainGroups).map(([_domain, domainChecks]) =>
          this.runCheckGroup(domainChecks, timeout, runConfig),
        );

        const domainResults = await Promise.all(domainPromises);
        for (const results of domainResults) {
          this.results.push(...results);
        }
      } else {
        // Run sequentially
        const results = await this.runCheckGroup(remainingChecks, timeout, runConfig);
        this.results.push(...results);
      }

      return this.results;
    } catch (error) {
      this.errors.push({
        message: error.message,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Run a group of checks (with optional parallelization within group)
   * @private
   * @param {BaseCheck[]} checks - Checks to run
   * @param {number} timeout - Timeout in milliseconds
   * @param {Object} runConfig - Runtime configuration
   * @returns {Promise<Object[]>} Check results
   */
  async runCheckGroup(checks, timeout, runConfig) {
    if (checks.length === 0) return [];

    const results = [];
    const remaining
```

---

# COMANDO - engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\synapse\engine.js
**SHA:** 90572bd719491e1f
**Timestamp:** 2026-08-28T02:02:00.874305
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.totalStart = null;
- this.layers[name] = { start: Date.now(), status: 'running' };
- metrics.totalStart = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SynapseEngine — Orchestrator for the 8-layer context injection pipeline.
 *
 * Executes L0-L7 sequentially, applies bracket-aware filtering via
 * context-tracker (SYN-3), collects pipeline metrics, and formats
 * the final <synapse-rules> XML output via the formatter module.
 *
 * @module core/synapse/engine
 * @version 1.0.0
 * @created Story SYN-6 - SynapseEngine Orchestrator + Output Formatter
 */

const {
  estimateContextPercent,
  calculateBracket,
  getActiveLayers,
  getTokenBudget,
  needsMemoryHints,
  needsHandoffWarning,
} = require('./context/context-tracker');

const { formatSynapseRules } = require('./output/formatter');
const { MemoryBridge } = require('./memory/memory-bridge');

// ---------------------------------------------------------------------------
// Layer Imports (graceful — layers from SYN-4/SYN-5 may not exist yet)
// ---------------------------------------------------------------------------

const LAYER_MODULES = [
  { path: './layers/l0-constitution', layer: 0, name: 'constitution' },
  { path: './layers/l1-global', layer: 1, name: 'global' },
  { path: './layers/l2-agent', layer: 2, name: 'agent' },
  { path: './layers/l3-workflow', layer: 3, name: 'workflow' },
  { path: './layers/l4-task', layer: 4, name: 'task' },
  { path: './layers/l5-squad', layer: 5, name: 'squad' },
  { path: './layers/l6-keyword', layer: 6, name: 'keyword' },
  { path: './layers/l7-star-command', layer: 7, name: 'star-command' },
];

/**
 * Safely load a layer module. Returns the class or null if not available.
 *
 * @param {string} modulePath - Relative require path
 * @returns {Function|null} Layer constructor or null
 */
function loadLayerModule(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    // Only silence MODULE_NOT_FOUND for the requested module
    if (err.code === 'MODULE_NOT_FOUND' && err.message && err.message.includes(modulePath)) {
      return null;
    }
    // Surface unexpected errors (syntax, runtime, transitive missing deps)
    console.warn(`[synapse:engine] Unexpected error loading ${modulePath}: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PipelineMetrics
// ---------------------------------------------------------------------------

/**
 * Collects timing and statistics for each layer in the pipeline.
 *
 * Used by DEVMODE output and returned in the process() result.
 */
class PipelineMetrics {
  constructor() {
    /** @type {Object.<string, object>} Per-layer metrics keyed by name */
    this.layers = {};
    /** @type {number|null} Pipeline start timestamp (ms) */
    this.totalStart = null;
    /** @type {number|null} Pipeline end timestamp (ms) */
    this.totalEnd = null;
  }

  /**
   * Mark the start of a layer's execution.
   *
   * @param {string} name - Layer name
   */
  startLayer(name) {
    this.layers[name] = { start: Date.now(), status: 'running' };
  }

  /**
   * Mark the successful end of a layer's execution.
   *
   * @param {string} name - Layer name
   * @param {number} rulesCount - Number of rules produced
   */
  endLayer(name, rulesCount) {
    const layer = this.layers[name];
    if (!layer) {
      this.layers[name] = { status: 'ok', rules: rulesCount };
      return;
    }
    layer.end = Date.now();
    layer.duration = layer.end - layer.start;
    layer.status = 'ok';
    layer.rules = rulesCount;
  }

  /**
   * Record that a layer was skipped.
   *
   * @param {string} name - Layer name
   * @param {string} reason - Why it was skipped
   */
  skipLayer(name, reason) {
    this.layers[name] = { status: 'skipped', reason };
  }

  /**
   * Record that a layer encountered an error.
   *
   * @param {string} name - Layer name
   * @param {Error} error - The error object
   */
  errorLayer(name, error) {
    const existing = this.layers[name] || {};
    if (existing.start) {
      existing.end = Date.now();
      existing.duration = existing.end - existing.start;
    }
    this.layers[name] = {
      ...existing,
      status: 'error',
      error: error && error.message ? error.message : String(error),
    };
  }

  /**
   * Return a summary of the full pipeline execution.
   *
   * @returns {{
   *   total_ms: number,
   *   layers_loaded: number,
   *   layers_skipped: number,
   *   layers_errored: number,
   *   total_rules: number,
   *   per_layer: Object
   * }}
   */
  getSummary() {
    const values = Object.values(this.layers);
    return {
      total_ms: this.totalStart != null && this.totalEnd != null
        ? this.totalEnd - this.totalStart
        : 0,
      layers_loaded: values.filter(l => l.status === 'ok').length,
      layers_skipped: values.filter(l => l.status === 'skipped').length,
      layers_errored: values.filter(l => l.status === 'error').length,
      total_rules: values.reduce((sum, l) => sum + (l.rules || 0), 0),
      per_layer: this.layers,
    };
  }
}

// ---------------------------------------------
```