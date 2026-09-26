# COMANDO - memory-bridge.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\synapse\memory\memory-bridge.js
**SHA:** 5f039ad6aa1ab152
**Timestamp:** 2026-08-28T02:02:01.694995
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._featureGate = null;
- this._featureGate = featureGate;
- this._featureGate = null;
- this._featureGate = null;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Memory Bridge — Feature-gated MIS consumer for SYNAPSE engine.
 *
 * Connects SynapseEngine to the Memory Intelligence System (MIS)
 * via MemoryLoader API. Implements bracket-aware retrieval with
 * agent-scoped sector filtering and token budget enforcement.
 *
 * Consumer-only: reads from MIS APIs, never modifies memory stores.
 * Graceful no-op when pro feature is unavailable.
 *
 * @module core/synapse/memory/memory-bridge
 * @version 1.0.0
 * @created Story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 */

'use strict';

const { estimateTokens } = require('../utils/tokens');

/** Memory bridge timeout in milliseconds. */
const BRIDGE_TIMEOUT_MS = 15;

/**
 * Bracket-to-memory-layer mapping.
 *
 * FRESH   → skip (no memory needed)
 * MODERATE → Layer 1 metadata (~50 tokens)
 * DEPLETED → Layer 2 chunks (~200 tokens)
 * CRITICAL → Layer 3 full content (~1000 tokens)
 */
const BRACKET_LAYER_MAP = {
  FRESH: { layer: 0, maxTokens: 0 },
  MODERATE: { layer: 1, maxTokens: 50 },
  DEPLETED: { layer: 2, maxTokens: 200 },
  CRITICAL: { layer: 3, maxTokens: 1000 },
};

/** Default sector for unknown agents. */
const DEFAULT_SECTORS = ['semantic'];

/**
 * MemoryBridge — Feature-gated MIS consumer.
 *
 * Provides bracket-aware memory retrieval with:
 * - Feature gate check (sync, <1ms)
 * - Agent-scoped sector filtering
 * - Token budget enforcement
 * - Session-level caching
 * - Timeout protection (<15ms)
 * - Error catch-all with warn-and-proceed
 */
class MemoryBridge {
  /**
   * @param {object} [options={}]
   * @param {number} [options.timeout=15] - Max execution time in ms
   */
  constructor(options = {}) {
    this._timeout = options.timeout || BRIDGE_TIMEOUT_MS;
    this._provider = null;
    this._featureGate = null;
    this._initialized = false;
  }

  /**
   * Lazy-load feature gate and provider.
   * Isolates pro dependency to runtime only.
   *
   * @private
   */
  _init() {
    if (this._initialized) return;
    this._initialized = true;

    try {
      const { featureGate } = require('../../../../pro/license/feature-gate');
      this._featureGate = featureGate;
    } catch {
      // Pro not installed — feature gate unavailable
      this._featureGate = null;
    }
  }

  /**
   * Lazy-load the SynapseMemoryProvider (pro).
   * Only loaded when feature gate confirms availability.
   *
   * @private
   * @returns {object|null} Provider instance or null
   */
  _getProvider() {
    if (this._provider) return this._provider;

    try {
      const { SynapseMemoryProvider } = require('../../../../pro/memory/synapse-memory-provider');
      this._provider = new SynapseMemoryProvider();
      return this._provider;
    } catch {
      // Provider not available
      return null;
    }
  }

  /**
   * Get memory hints for the current prompt context.
   *
   * Returns an array of memory hint objects suitable for injection
   * into the SYNAPSE pipeline. Gracefully returns [] when:
   * - Pro feature is unavailable
   * - Bracket is FRESH (no memory needed)
   * - Provider fails or times out
   * - Any error occurs
   *
   * @param {string} agentId - Active agent ID (e.g., 'dev', 'qa')
   * @param {string} bracket - Context bracket (FRESH, MODERATE, DEPLETED, CRITICAL)
   * @param {number} tokenBudget - Max tokens available for memory hints
   * @returns {Promise<Array<{content: string, source: string, relevance: number, tokens: number}>>}
   */
  async getMemoryHints(agentId, bracket, tokenBudget) {
    try {
      // 1. Feature gate check (sync, <1ms)
      this._init();
      if (!this._featureGate || !this._featureGate.isAvailable('pro.memory.synapse')) {
        return [];
      }

      // 2. Bracket check — FRESH needs no memory
      const bracketConfig = BRACKET_LAYER_MAP[bracket];
      if (!bracketConfig || bracketConfig.layer === 0) {
        return [];
      }

      // 3. Calculate effective token budget
      const effectiveBudget = Math.min(
        bracketConfig.maxTokens,
        tokenBudget > 0 ? tokenBudget : bracketConfig.maxTokens,
      );

      if (effectiveBudget <= 0) {
        return [];
      }

      // 4. Load provider
      const provider = this._getProvider();
      if (!provider) {
        return [];
      }

      // 5. Execute with timeout protection
      const hints = await this._executeWithTimeout(
        () => provider.getMemories(agentId, bracket, effectiveBudget),
        this._timeout,
      );

      // 6. Enforce token budget on results
      return this._enforceTokenBudget(hints || [], effectiveBudget);
    } catch (error) {
      // Catch-all: warn and proceed with empty results
      console.warn(`[synapse:memory-bridge] Error getting memory hints: ${error.message}`);
      return [];
    }
  }

  /**
   * Execute a function with timeout protection.
   *
   * @private
   * @param {Function} fn - Async function to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<*>} Result or empty array on timeou
```