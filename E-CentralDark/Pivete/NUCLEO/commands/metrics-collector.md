# COMANDO - metrics-collector.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\quality\metrics-collector.js
**SHA:** 56a8283f3b701db7
**Timestamp:** 2026-08-28T02:02:22.715881
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- lastRun: null,
- lastRun: null,
- lastRun: null,
- metrics.layers[layerKey].lastRun = layerHistory[layerHistory.length - 1].timestamp;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Quality Metrics Collector
 *
 * Collects and manages quality gate metrics across all layers.
 * Provides APIs for recording runs, calculating aggregates, and cleanup.
 *
 * @module quality/metrics-collector
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Default configuration
const DEFAULT_DATA_FILE = '.aios/data/quality-metrics.json';
const DEFAULT_RETENTION_DAYS = 30;

/**
 * Create empty metrics structure
 * @returns {Object} Empty metrics object
 */
function createEmptyMetrics() {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    retentionDays: DEFAULT_RETENTION_DAYS,
    layers: {
      layer1: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
      },
      layer2: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
        autoCatchRate: 0,
        coderabbit: {
          active: false,
          findingsCount: 0,
          severityBreakdown: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
        },
        quinn: {
          findingsCount: 0,
          topCategories: [],
        },
      },
      layer3: {
        passRate: 0,
        avgTimeMs: 0,
        totalRuns: 0,
        lastRun: null,
      },
    },
    trends: {
      autoCatchRate: [],
      passRates: [],
    },
    history: [],
  };
}

/**
 * MetricsCollector class
 * Manages quality gate metrics collection, storage, and aggregation
 */
class MetricsCollector {
  /**
   * Create a new MetricsCollector instance
   * @param {Object} options - Configuration options
   * @param {string} [options.dataFile] - Path to data file
   * @param {number} [options.retentionDays] - Days to retain history
   * @param {string} [options.projectRoot] - Project root directory
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.dataFile = options.dataFile || path.join(this.projectRoot, DEFAULT_DATA_FILE);
    this.retentionDays = options.retentionDays || DEFAULT_RETENTION_DAYS;
    this._metrics = null;
    this._validator = null;
    this._lockFile = `${this.dataFile}.lock`;
  }

  /**
   * Initialize the JSON schema validator
   * @private
   */
  async _initValidator() {
    if (this._validator) return;

    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);

    const schemaPath = path.join(
      this.projectRoot,
      '.aios-core/quality/schemas/quality-metrics.schema.json',
    );

    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      this._validator = ajv.compile(schema);
    } catch (error) {
      // Schema file not found - validation will be skipped
      console.warn(`Warning: Schema file not found at ${schemaPath}`);
      this._validator = null;
    }
  }

  /**
   * Validate metrics against schema
   * @param {Object} metrics - Metrics object to validate
   * @returns {Object} Validation result { valid, errors }
   */
  async validate(metrics) {
    await this._initValidator();

    if (!this._validator) {
      return { valid: true, errors: null };
    }

    const valid = this._validator(metrics);
    return {
      valid,
      errors: valid ? null : this._validator.errors,
    };
  }

  /**
   * Acquire file lock for thread-safe operations
   * @private
   * @param {number} [timeout=5000] - Lock timeout in ms
   * @returns {Promise<boolean>} Whether lock was acquired
   */
  async _acquireLock(timeout = 5000) {
    const startTime = Date.now();
    const retryDelay = 50;

    while (Date.now() - startTime < timeout) {
      try {
        // Try to create lock file exclusively
        await fs.writeFile(this._lockFile, String(process.pid), { flag: 'wx' });
        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock exists, check if stale (> 30s old)
          try {
            const stat = await fs.stat(this._lockFile);
            if (Date.now() - stat.mtimeMs > 30000) {
              await fs.unlink(this._lockFile);
              continue;
            }
          } catch {
            // Lock file gone, retry
            continue;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else if (error.code === 'ENOENT') {
          // Directory doesn't exist, create it
          await fs.mkdir(path.dirname(this._lockFile), { recursive: true });
        } else {
          throw error;
        }
      }
    }
    return false;
  }

  /**
   * Release file lock
   * @private
   */
  async _releaseLock() {
    try {
      await fs.unlink(this._lockFile);
    } catch {
      // Ignore errors on unlock
    }
  }

  /**
   * Ensure data directory exists
   * @private
   */
  asyn
```