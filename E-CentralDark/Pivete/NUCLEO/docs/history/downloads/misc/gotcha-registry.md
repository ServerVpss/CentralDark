# OUTRO - gotcha-registry.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\learning\gotcha-registry.js
**SHA:** a134638adff4dac4
**Timestamp:** 2026-08-28T02:02:23.937215
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: gotcha.pattern,
- pattern: sequence.join(' '),
- .map((g) => ({ id: g.id, pattern: g.pattern, updatedAt: g.updatedAt })),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Gotcha Registry - Story 12.4
 *
 * Learn from past mistakes (gotchas) to prevent repeating errors.
 * Absorbed from Auto-Claude's GOTCHA episode type in GraphitiMemory.
 *
 * @module gotcha-registry
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  storePath: '.aios/gotchas.json',
  maxGotchas: 500,
  minConfidence: 0.5,
  autoQueryBeforeExecution: true,
  relevanceThreshold: 0.7,
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHA SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha schema for validation
 *
 * @typedef {Object} Gotcha
 * @property {string} id - Unique identifier
 * @property {string} pattern - The problematic pattern/approach
 * @property {string} context - Where this gotcha applies
 * @property {string} error - The error that occurred
 * @property {string} reason - Why it's a gotcha
 * @property {string} alternative - Recommended alternative
 * @property {string[]} keywords - Keywords for search
 * @property {number} occurrences - Times this gotcha was hit
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {string} source - Where this gotcha was learned
 */

const GOTCHA_SCHEMA = {
  required: ['pattern', 'context', 'reason'],
  optional: ['error', 'alternative', 'keywords', 'source'],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHA REGISTRY CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchaRegistry {
  /**
   * Create a new GotchaRegistry
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.storePath = path.join(this.rootPath, this.config.storePath);

    this._gotchas = null;
    this._index = null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STORAGE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load gotchas from storage
   * @returns {Object} Gotchas data
   */
  load() {
    if (this._gotchas) {
      return this._gotchas;
    }

    if (!fs.existsSync(this.storePath)) {
      this._gotchas = { gotchas: [], metadata: { version: '1.0.0', lastUpdated: null } };
      return this._gotchas;
    }

    try {
      const content = fs.readFileSync(this.storePath, 'utf-8');
      this._gotchas = JSON.parse(content);
      this._buildIndex();
      return this._gotchas;
    } catch (error) {
      console.error('Failed to load gotchas:', error.message);
      this._gotchas = { gotchas: [], metadata: { version: '1.0.0', lastUpdated: null } };
      return this._gotchas;
    }
  }

  /**
   * Save gotchas to storage
   */
  save() {
    if (!this._gotchas) {
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Update metadata
    this._gotchas.metadata.lastUpdated = new Date().toISOString();

    // Enforce max gotchas limit (remove oldest low-confidence ones)
    if (this._gotchas.gotchas.length > this.config.maxGotchas) {
      this._gotchas.gotchas = this._gotchas.gotchas
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.config.maxGotchas);
    }

    fs.writeFileSync(this.storePath, JSON.stringify(this._gotchas, null, 2), 'utf-8');
    this._buildIndex();
  }

  /**
   * Build search index
   * @private
   */
  _buildIndex() {
    this._index = new Map();

    for (const gotcha of this._gotchas.gotchas) {
      // Index by keywords
      const keywords = this._extractKeywords(gotcha);
      for (const keyword of keywords) {
        if (!this._index.has(keyword)) {
          this._index.set(keyword, []);
        }
        this._index.get(keyword).push(gotcha.id);
      }
    }
  }

  /**
   * Extract keywords from gotcha
   * @private
   */
  _extractKeywords(gotcha) {
    const keywords = new Set(gotcha.keywords || []);

    // Extract from pattern
    const patternWords = gotcha.pattern
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    patternWords.forEach((w) => keywords.add(w));

    // Extract fr
```