# COMANDO - memory-bridge.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\memory-bridge.test.js
**SHA:** e4832c9b3a06ed8d
**Timestamp:** 2026-08-28T02:19:43.478724
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const mockFeatureGate = {
- featureGate: mockFeatureGate,
- bridge._featureGate = mockFeatureGate;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * MemoryBridge Tests
 *
 * Tests for the feature-gated MIS consumer that provides
 * bracket-aware memory retrieval for the SYNAPSE engine.
 *
 * @module tests/synapse/memory-bridge
 * @story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 */

jest.setTimeout(10000);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFeatureGate = {
  isAvailable: jest.fn(() => false),
  require: jest.fn(),
};

jest.mock('../../pro/license/feature-gate', () => ({
  featureGate: mockFeatureGate,
}), { virtual: true });

const mockGetMemories = jest.fn(() => Promise.resolve([]));
const mockClearCache = jest.fn();

jest.mock('../../pro/memory/synapse-memory-provider', () => ({
  SynapseMemoryProvider: jest.fn().mockImplementation(() => ({
    getMemories: mockGetMemories,
    clearCache: mockClearCache,
  })),
}), { virtual: true });

// ---------------------------------------------------------------------------
// Import (after mocks)
// ---------------------------------------------------------------------------

const { MemoryBridge, BRACKET_LAYER_MAP, BRIDGE_TIMEOUT_MS } = require('../../.aios-core/core/synapse/memory/memory-bridge');

// =============================================================================
// MemoryBridge
// =============================================================================

describe('MemoryBridge', () => {
  let bridge;

  beforeEach(() => {
    bridge = new MemoryBridge();
    mockFeatureGate.isAvailable.mockReset();
    mockGetMemories.mockReset();
    mockClearCache.mockReset();
    mockFeatureGate.isAvailable.mockReturnValue(false);
    mockGetMemories.mockResolvedValue([]);
  });

  // -------------------------------------------------------------------------
  // AC-1: Module exists and exports correctly
  // -------------------------------------------------------------------------

  describe('module structure', () => {
    test('exports MemoryBridge class', () => {
      expect(MemoryBridge).toBeDefined();
      expect(typeof MemoryBridge).toBe('function');
    });

    test('exports BRACKET_LAYER_MAP constant', () => {
      expect(BRACKET_LAYER_MAP).toBeDefined();
      expect(BRACKET_LAYER_MAP.FRESH).toBeDefined();
      expect(BRACKET_LAYER_MAP.MODERATE).toBeDefined();
      expect(BRACKET_LAYER_MAP.DEPLETED).toBeDefined();
      expect(BRACKET_LAYER_MAP.CRITICAL).toBeDefined();
    });

    test('exports BRIDGE_TIMEOUT_MS constant', () => {
      expect(BRIDGE_TIMEOUT_MS).toBe(15);
    });

    test('getMemoryHints returns array of hint objects', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockGetMemories.mockResolvedValue([
        { content: 'test hint', source: 'procedural', relevance: 0.8, tokens: 5 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(Array.isArray(hints)).toBe(true);
      if (hints.length > 0) {
        expect(hints[0]).toHaveProperty('content');
        expect(hints[0]).toHaveProperty('source');
        expect(hints[0]).toHaveProperty('relevance');
        expect(hints[0]).toHaveProperty('tokens');
      }
    });
  });

  // -------------------------------------------------------------------------
  // AC-2: Feature gate integration
  // -------------------------------------------------------------------------

  describe('feature gate', () => {
    test('returns [] when feature is unavailable', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(false);
      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });

    test('delegates to provider when feature is available', async () => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
      mockGetMemories.mockResolvedValue([
        { content: 'hint 1', source: 'procedural', relevance: 0.9, tokens: 5 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints.length).toBeGreaterThan(0);
    });

    test('feature gate check does not throw', async () => {
      mockFeatureGate.isAvailable.mockImplementation(() => {
        throw new Error('Gate error');
      });

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // AC-3: Bracket-aware retrieval
  // -------------------------------------------------------------------------

  describe('bracket-aware retrieval', () => {
    beforeEach(() => {
      mockFeatureGate.isAvailable.mockReturnValue(true);
    });

    test('FRESH bracket returns [] (no memory injection)', async () => {
      const hints = await bridge.getMemoryHints('dev', 'FRESH', 100);
      expect(hints).toEqual([]);
      expect(mockGetMemories).not.toHaveBeenCalled();
    });

    test('MODERATE bracke
```