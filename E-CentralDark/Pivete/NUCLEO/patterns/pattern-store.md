# PADRAO - pattern-store.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\learning\pattern-store.js
**SHA:** 36fa074ebe287ae2
**Timestamp:** 2026-08-28T02:02:23.967408
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const normalizedPattern = this._normalizePattern(pattern);
- return { action: 'updated', pattern: existing };
- return { action: 'created', pattern: normalizedPattern };
- const pattern = data.patterns.find((p) => p.id === patternId);
- return { success: true, pattern: pattern };

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @module PatternStore
 * @description Stores and manages learned workflow patterns
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

/**
 * Default storage path for learned patterns
 * @type {string}
 */
const DEFAULT_STORAGE_PATH = path.join(__dirname, '../../..', 'data', 'learned-patterns.yaml');

/**
 * Default maximum number of patterns
 * @type {number}
 */
const DEFAULT_MAX_PATTERNS = 100;

/**
 * Default auto-prune threshold (percentage of max)
 * @type {number}
 */
const DEFAULT_PRUNE_THRESHOLD = 0.9;

/**
 * Pattern status values
 * @type {Object}
 */
const PATTERN_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PROMOTED: 'promoted',
  DEPRECATED: 'deprecated',
};

/**
 * PatternStore class for persisting workflow patterns
 */
class PatternStore {
  /**
   * Create a PatternStore instance
   * @param {Object} options - Configuration options
   * @param {string} options.storagePath - Path to storage file
   * @param {number} options.maxPatterns - Maximum patterns to store
   * @param {number} options.pruneThreshold - Auto-prune threshold (0-1)
   * @param {string} options.pruneStrategy - Prune strategy ('oldest_low_occurrence' | 'lowest_success_rate')
   */
  constructor(options = {}) {
    this.storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
    this.maxPatterns = options.maxPatterns || DEFAULT_MAX_PATTERNS;
    this.pruneThreshold = options.pruneThreshold || DEFAULT_PRUNE_THRESHOLD;
    this.pruneStrategy = options.pruneStrategy || 'oldest_low_occurrence';
    this._cache = null;
    this._cacheTime = null;
  }

  /**
   * Save a pattern to storage
   * @param {Object} pattern - Pattern to save
   * @returns {Object} Save result
   */
  save(pattern) {
    const data = this._load();

    // Ensure pattern has required fields
    const normalizedPattern = this._normalizePattern(pattern);

    // Check for existing pattern with same sequence
    const existingIndex = data.patterns.findIndex((p) =>
      this._sequenceEquals(p.sequence, normalizedPattern.sequence),
    );

    if (existingIndex >= 0) {
      // Update existing pattern
      const existing = data.patterns[existingIndex];
      existing.occurrences = (existing.occurrences || 1) + 1;
      existing.lastSeen = new Date().toISOString();

      // Update success rate (weighted average)
      const totalOccurrences = existing.occurrences;
      const newSuccessRate = normalizedPattern.successRate || 1.0;
      existing.successRate =
        (existing.successRate * (totalOccurrences - 1) + newSuccessRate) / totalOccurrences;

      data.patterns[existingIndex] = existing;

      this._save(data);
      return { action: 'updated', pattern: existing };
    }

    // Add new pattern
    data.patterns.push(normalizedPattern);

    // Check if auto-prune needed
    if (data.patterns.length > this.maxPatterns * this.pruneThreshold) {
      this._autoPrune(data);
    }

    this._save(data);
    return { action: 'created', pattern: normalizedPattern };
  }

  /**
   * Load all patterns from storage
   * @returns {Object} Loaded data with patterns array
   */
  load() {
    return this._load();
  }

  /**
   * Find patterns similar to a given sequence
   * @param {string[]} sequence - Sequence to match
   * @returns {Object[]} Matching patterns sorted by relevance
   */
  findSimilar(sequence) {
    const data = this._load();

    if (!sequence || sequence.length === 0) {
      return [];
    }

    const matches = [];

    for (const pattern of data.patterns) {
      const similarity = this._calculateSimilarity(sequence, pattern.sequence);

      if (similarity > 0.3) {
        // Minimum threshold for consideration
        matches.push({
          ...pattern,
          similarity: similarity,
        });
      }
    }

    // Sort by similarity (descending), then by occurrences
    return matches.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) > 0.1) {
        return b.similarity - a.similarity;
      }
      return (b.occurrences || 1) - (a.occurrences || 1);
    });
  }

  /**
   * Get storage statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const data = this._load();
    const patterns = data.patterns;

    const statusCounts = {
      pending: 0,
      active: 0,
      promoted: 0,
      deprecated: 0,
    };

    let totalSuccessRate = 0;
    let totalOccurrences = 0;

    for (const pattern of patterns) {
      statusCounts[pattern.status || 'pending']++;
      totalSuccessRate += pattern.successRate || 0;
      totalOccurrences += pattern.occurrences || 1;
    }

    const avgSuccessRate = patterns.length > 0 ? totalSuccessRate / patterns.length : 0;

    return {
      totalPatterns: patterns.length,
      maxPatterns: this.maxPatterns,
      utilizationPercent: Math.round((patterns.length / this.maxPatterns) * 100),

```