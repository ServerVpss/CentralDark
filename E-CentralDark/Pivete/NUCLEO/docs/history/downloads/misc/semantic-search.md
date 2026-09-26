# OUTRO - semantic-search.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\learning\semantic-search.js
**SHA:** f9ba491acf310e47
**Timestamp:** 2026-08-28T02:02:24.018567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const normalizedPattern = this._normalize(patternText);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Semantic Pattern Search - Story 12.7
 *
 * Find patterns by semantic similarity, not just exact string matches.
 * Merges exact, semantic, and subsequence matches with confidence scoring.
 *
 * @module semantic-search
 * @version 1.0.0
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  // Match weights
  exactMatchWeight: 1.0,
  semanticMatchWeight: 0.7,
  subsequenceMatchWeight: 0.5,
  fuzzyMatchWeight: 0.3,

  // Thresholds
  minSimilarityScore: 0.3,
  maxResults: 10,

  // Performance
  maxQueryLength: 100,
  cacheEnabled: true,
  cacheTTL: 60000, // 1 minute

  // Synonym groups for semantic matching
  synonymGroups: [
    ['create', 'make', 'generate', 'add', 'new'],
    ['delete', 'remove', 'destroy', 'drop'],
    ['update', 'modify', 'change', 'edit', 'alter'],
    ['get', 'fetch', 'retrieve', 'load', 'read'],
    ['list', 'show', 'display', 'view'],
    ['test', 'verify', 'check', 'validate'],
    ['build', 'compile', 'bundle', 'package'],
    ['deploy', 'publish', 'release', 'ship'],
    ['fix', 'repair', 'resolve', 'patch'],
    ['review', 'inspect', 'audit', 'examine'],
    ['story', 'task', 'ticket', 'issue'],
    ['dev', 'develop', 'development', 'implement'],
    ['qa', 'quality', 'testing'],
    ['start', 'begin', 'init', 'initialize'],
    ['end', 'finish', 'complete', 'done'],
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SEMANTIC SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

class SemanticSearch {
  /**
   * Create a new SemanticSearch instance
   *
   * @param {Object} options - Configuration options
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this._synonymIndex = this._buildSynonymIndex();
    this._cache = new Map();
    this._lastCacheClean = Date.now();
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              SEARCH
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Search patterns by semantic similarity
   *
   * @param {string} query - Search query
   * @param {Object[]} patterns - Patterns to search
   * @param {Object} options - Search options
   * @returns {Object[]} Matched patterns with scores
   */
  search(query, patterns, options = {}) {
    if (!query || !patterns || patterns.length === 0) {
      return [];
    }

    const startTime = Date.now();

    // Normalize query
    const normalizedQuery = this._normalize(query);
    if (normalizedQuery.length === 0) {
      return [];
    }

    // Check cache
    const cacheKey = this._getCacheKey(normalizedQuery, patterns.length);
    if (this.config.cacheEnabled) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Score all patterns
    const scored = patterns
      .map((pattern) => {
        const score = this._scorePattern(normalizedQuery, pattern);
        return { pattern, score };
      })
      .filter((item) => item.score >= this.config.minSimilarityScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults || this.config.maxResults);

    // Add metadata
    const results = scored.map((item) => ({
      ...item.pattern,
      _searchScore: item.score,
      _searchMethod: this._determineMatchMethod(item.score),
    }));

    // Cache results
    if (this.config.cacheEnabled) {
      this._setCache(cacheKey, results);
    }

    // Performance check
    const elapsed = Date.now() - startTime;
    if (elapsed > 100) {
      console.warn(`SemanticSearch: Query took ${elapsed}ms (target <100ms)`);
    }

    return results;
  }

  /**
   * Find similar patterns to a given pattern
   *
   * @param {Object} pattern - Reference pattern
   * @param {Object[]} patterns - Patterns to compare
   * @param {Object} options - Search options
   * @returns {Object[]} Similar patterns
   */
  findSimilar(pattern, patterns, options = {}) {
    if (!pattern || !patterns) {
      return [];
    }

    // Build query from pattern
    const queryParts = [];

    if (pattern.name) queryParts.push(pattern.name);
    if (pattern.workflow) queryParts.push(pattern.workflow);
    if (pattern.sequence) queryParts.push(...pattern.sequence);
    if (pattern.commands) queryParts.push(...pattern.commands);

    const query = queryParts.join(' ');

    // Exclude the reference pattern
    const candidatePatterns = patterns.filter((p) => p.id !== pattern.id);

    return this.search(query, candidatePatterns, options);
  }

  // ────────────────────────────────────────────────────────
```