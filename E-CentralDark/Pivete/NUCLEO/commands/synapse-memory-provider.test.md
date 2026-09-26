# COMANDO - synapse-memory-provider.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\synapse-memory-provider.test.js
**SHA:** 5d9c4ec5d5f12815
**Timestamp:** 2026-08-28T02:19:43.355770
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const mockFeatureGate = {
- featureGate: mockFeatureGate,
- FeatureGate: jest.fn(),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SynapseMemoryProvider Tests
 *
 * Tests for the pro-gated MIS retrieval provider used by MemoryBridge.
 *
 * @module tests/synapse/synapse-memory-provider
 * @story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 */

jest.setTimeout(10000);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFeatureGate = {
  isAvailable: jest.fn(() => true),
  require: jest.fn(),
};

jest.mock('../../pro/license/feature-gate', () => ({
  featureGate: mockFeatureGate,
  FeatureGate: jest.fn(),
}), { virtual: true });

const mockQueryMemories = jest.fn(() => Promise.resolve([]));

jest.mock('../../pro/memory/memory-loader', () => ({
  MemoryLoader: jest.fn().mockImplementation(() => ({
    queryMemories: mockQueryMemories,
  })),
  AGENT_SECTOR_PREFERENCES: {
    dev: ['procedural', 'semantic'],
    qa: ['reflective', 'episodic'],
    architect: ['semantic', 'reflective'],
    pm: ['episodic', 'semantic'],
    po: ['episodic', 'semantic'],
    sm: ['procedural', 'episodic'],
    devops: ['procedural', 'episodic'],
    analyst: ['semantic', 'reflective'],
    'data-engineer': ['procedural', 'semantic'],
    'ux-design-expert': ['reflective', 'procedural'],
  },
}), { virtual: true });

// ---------------------------------------------------------------------------
// Import (after mocks) — skip entire suite if pro/ submodule is absent (CI)
// ---------------------------------------------------------------------------

let SynapseMemoryProvider, BRACKET_CONFIG, DEFAULT_SECTORS;
let proAvailable = true;

try {
  const mod = require('../../pro/memory/synapse-memory-provider');
  SynapseMemoryProvider = mod.SynapseMemoryProvider;
  BRACKET_CONFIG = mod.BRACKET_CONFIG;
  DEFAULT_SECTORS = mod.DEFAULT_SECTORS;
} catch {
  proAvailable = false;
}

const describeIfPro = proAvailable ? describe : describe.skip;

// =============================================================================
// SynapseMemoryProvider
// =============================================================================

describeIfPro('SynapseMemoryProvider', () => {
  let provider;

  beforeEach(() => {
    mockFeatureGate.require.mockReset();
    mockQueryMemories.mockReset();
    mockQueryMemories.mockResolvedValue([]);
    provider = new SynapseMemoryProvider();
  });

  // -------------------------------------------------------------------------
  // Construction + Feature Gate
  // -------------------------------------------------------------------------

  describe('construction', () => {
    test('requires pro.memory.synapse feature', () => {
      new SynapseMemoryProvider();
      expect(mockFeatureGate.require).toHaveBeenCalledWith(
        'pro.memory.synapse',
        'SYNAPSE Memory Bridge',
      );
    });

    test('throws when feature gate denies', () => {
      mockFeatureGate.require.mockImplementation(() => {
        throw new Error('Pro feature required');
      });
      expect(() => new SynapseMemoryProvider()).toThrow('Pro feature required');
    });
  });

  // -------------------------------------------------------------------------
  // AC-4: Agent-scoped memory
  // -------------------------------------------------------------------------

  describe('agent-scoped sector filtering', () => {
    test('@dev gets procedural + semantic sectors', async () => {
      await provider.getMemories('dev', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('dev', expect.objectContaining({
        sectors: ['procedural', 'semantic'],
      }));
    });

    test('@qa gets reflective + episodic sectors', async () => {
      await provider.getMemories('qa', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('qa', expect.objectContaining({
        sectors: ['reflective', 'episodic'],
      }));
    });

    test('@architect gets semantic + reflective sectors', async () => {
      await provider.getMemories('architect', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('architect', expect.objectContaining({
        sectors: ['semantic', 'reflective'],
      }));
    });

    test('unknown agent gets default sector (semantic)', async () => {
      await provider.getMemories('unknown-agent', 'MODERATE', 100);
      expect(mockQueryMemories).toHaveBeenCalledWith('unknown-agent', expect.objectContaining({
        sectors: ['semantic'],
      }));
    });
  });

  // -------------------------------------------------------------------------
  // AC-5: Session-level caching
  // -------------------------------------------------------------------------

  describe('session-level caching', () => {
    test('caches results by agentId + bracket', async () => {
      mockQueryMemories.mockResolvedValue([
        { content: 'cached', relevance: 0.8 },
      ]);

      const first = await provider.getMemories('dev', 'MODERATE', 100);
      const second = await p
```