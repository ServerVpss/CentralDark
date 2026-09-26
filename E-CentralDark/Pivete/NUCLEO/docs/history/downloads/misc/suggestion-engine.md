# OUTRO - suggestion-engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\engine\suggestion-engine.js
**SHA:** 1283f4a80e4bb00f
**Timestamp:** 2026-08-28T02:02:23.893437
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const normalizedPattern = pattern.map((c) => c.toLowerCase().replace(/^\*/, ''));

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @module SuggestionEngine
 * @description High-level suggestion engine for the *next task
 * @story WIS-3 - *next Task Implementation
 * @story WIS-5 - Pattern Capture Integration
 * @version 1.1.0
 *
 * @example
 * const { SuggestionEngine } = require('./suggestion-engine');
 * const engine = new SuggestionEngine();
 *
 * const context = await engine.buildContext({ storyOverride: 'path/to/story.md' });
 * const result = await engine.suggestNext(context);
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Lazy-loaded dependencies for performance
let wis = null;
let SessionContextLoader = null;
let learning = null;

/**
 * Default cache TTL for suggestions (5 minutes)
 * @type {number}
 */
const SUGGESTION_CACHE_TTL = 5 * 60 * 1000;

/**
 * Low confidence threshold for marking suggestions as "uncertain"
 * @type {number}
 */
const LOW_CONFIDENCE_THRESHOLD = 0.5;

/**
 * SuggestionEngine class for generating context-aware command suggestions
 */
class SuggestionEngine {
  /**
   * Create a SuggestionEngine instance
   * @param {Object} options - Configuration options
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds
   * @param {boolean} options.lazyLoad - Whether to lazy-load dependencies
   * @param {boolean} options.useLearnedPatterns - Whether to use learned patterns (default: true)
   * @param {number} options.learnedPatternBoost - Confidence boost for learned patterns (default: 0.15)
   */
  constructor(options = {}) {
    this.cacheTTL = options.cacheTTL || SUGGESTION_CACHE_TTL;
    this.lazyLoad = options.lazyLoad !== false;
    this.useLearnedPatterns = options.useLearnedPatterns !== false;
    this.learnedPatternBoost = options.learnedPatternBoost || 0.15;
    this.suggestionCache = null;
    this.cacheTimestamp = null;
    this.cacheKey = null;

    // Load dependencies immediately if not lazy loading
    if (!this.lazyLoad) {
      this._loadDependencies();
    }
  }

  /**
   * Lazy-load WIS and session dependencies
   * @private
   */
  _loadDependencies() {
    if (!wis) {
      try {
        wis = require('../index');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load WIS module:', error.message);
        wis = null;
      }
    }

    if (!SessionContextLoader) {
      try {
        SessionContextLoader = require('../../core/session/context-loader');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load SessionContextLoader:', error.message);
        SessionContextLoader = null;
      }
    }

    if (!learning && this.useLearnedPatterns) {
      try {
        learning = require('../learning');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load learning module:', error.message);
        learning = null;
      }
    }
  }

  /**
   * Build context from multiple sources
   * @param {Object} options - Context building options
   * @param {string} options.storyOverride - Explicit story path (optional)
   * @param {boolean} options.autoDetect - Whether to auto-detect context (default: true)
   * @param {string} options.agentId - Current agent ID (optional)
   * @returns {Promise<Object>} Built context object
   */
  async buildContext(options = {}) {
    this._loadDependencies();

    const context = {
      agentId: options.agentId || this._detectCurrentAgent(),
      lastCommand: null,
      lastCommands: [],
      storyPath: null,
      branch: null,
      projectState: {},
    };

    // 1. Load session context if available
    if (options.autoDetect !== false && SessionContextLoader) {
      try {
        const loader = new SessionContextLoader();
        const sessionContext = loader.loadContext(context.agentId);

        context.lastCommands = sessionContext.lastCommands || [];
        context.lastCommand = context.lastCommands[context.lastCommands.length - 1] || null;
        context.storyPath = sessionContext.currentStory || null;
        context.workflowActive = sessionContext.workflowActive || null;
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load session context:', error.message);
      }
    }

    // 2. Story override takes precedence
    if (options.storyOverride) {
      const resolvedPath = this._resolveStoryPath(options.storyOverride);
      if (resolvedPath) {
        context.storyPath = resolvedPath;
      }
    }

    // 3. Detect git branch
    context.branch = this._detectGitBranch();

    // 4. Build project state
    context.projectState = await this._buildProjectState(context);

    return context;
  }

  /**
   * Get suggestions for next commands based on context
   * @param {Object} context - Current session context
   * @returns {Promise<Object>} Suggestion result
   */
  async suggestNext(context) {
    this._loadDependencies();

    // Check cache first
    const cacheKey = this._generateCacheKey(context);
    if (this._isCacheValid(cacheKey)) {
      return this.suggestionCache;
    }

    // D
```