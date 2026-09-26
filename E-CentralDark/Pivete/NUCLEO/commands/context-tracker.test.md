# COMANDO - context-tracker.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\synapse\context-tracker.test.js
**SHA:** e2ed42cd1dc9c438
**Timestamp:** 2026-08-28T02:19:43.569129
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- expect(estimateContextPercent(10, { avgTokensPerPrompt: 2000 })).toBeCloseTo(90, 5);
- avgTokensPerPrompt: 1000,
- test('should have avgTokensPerPrompt = 1500', () => {

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for SYNAPSE Context Bracket Tracker
 *
 * @module tests/synapse/context-tracker
 * @story SYN-3 - Context Bracket Tracker
 */

const {
  calculateBracket,
  estimateContextPercent,
  getTokenBudget,
  getActiveLayers,
  needsHandoffWarning,
  needsMemoryHints,
  BRACKETS,
  TOKEN_BUDGETS,
  DEFAULTS,
} = require('../../.aios-core/core/synapse/context/context-tracker');

// =============================================================================
// calculateBracket
// =============================================================================

describe('calculateBracket', () => {
  // --- FRESH bracket (>= 60%) ---
  test('should return FRESH for 100% context remaining', () => {
    expect(calculateBracket(100)).toBe('FRESH');
  });

  test('should return FRESH for exactly 60% (lower boundary)', () => {
    expect(calculateBracket(60)).toBe('FRESH');
  });

  test('should return FRESH for 60.01%', () => {
    expect(calculateBracket(60.01)).toBe('FRESH');
  });

  test('should return FRESH for 75%', () => {
    expect(calculateBracket(75)).toBe('FRESH');
  });

  // --- MODERATE bracket (>= 40%, < 60%) ---
  test('should return MODERATE for 59.99% (just below FRESH)', () => {
    expect(calculateBracket(59.99)).toBe('MODERATE');
  });

  test('should return MODERATE for exactly 40% (lower boundary)', () => {
    expect(calculateBracket(40)).toBe('MODERATE');
  });

  test('should return MODERATE for 50%', () => {
    expect(calculateBracket(50)).toBe('MODERATE');
  });

  // --- DEPLETED bracket (>= 25%, < 40%) ---
  test('should return DEPLETED for 39.99% (just below MODERATE)', () => {
    expect(calculateBracket(39.99)).toBe('DEPLETED');
  });

  test('should return DEPLETED for exactly 25% (lower boundary)', () => {
    expect(calculateBracket(25)).toBe('DEPLETED');
  });

  test('should return DEPLETED for 25.01%', () => {
    expect(calculateBracket(25.01)).toBe('DEPLETED');
  });

  test('should return DEPLETED for 30%', () => {
    expect(calculateBracket(30)).toBe('DEPLETED');
  });

  // --- CRITICAL bracket (< 25%) ---
  test('should return CRITICAL for 24.99% (just below DEPLETED)', () => {
    expect(calculateBracket(24.99)).toBe('CRITICAL');
  });

  test('should return CRITICAL for 0%', () => {
    expect(calculateBracket(0)).toBe('CRITICAL');
  });

  test('should return CRITICAL for 10%', () => {
    expect(calculateBracket(10)).toBe('CRITICAL');
  });

  // --- Edge cases ---
  test('should return FRESH for values above 100%', () => {
    expect(calculateBracket(150)).toBe('FRESH');
  });

  test('should return CRITICAL for negative values', () => {
    expect(calculateBracket(-10)).toBe('CRITICAL');
  });

  test('should return CRITICAL for NaN', () => {
    expect(calculateBracket(NaN)).toBe('CRITICAL');
  });

  test('should return CRITICAL for non-number input', () => {
    expect(calculateBracket('fifty')).toBe('CRITICAL');
    expect(calculateBracket(undefined)).toBe('CRITICAL');
    expect(calculateBracket(null)).toBe('CRITICAL');
  });
});

// =============================================================================
// estimateContextPercent
// =============================================================================

describe('estimateContextPercent', () => {
  test('should return 100% for 0 prompts', () => {
    expect(estimateContextPercent(0)).toBe(100);
  });

  test('should return 98.5% for 2 prompts with defaults (2*1500/200000)', () => {
    // 100 - (2 * 1500 / 200000 * 100) = 100 - 1.5 = 98.5
    expect(estimateContextPercent(2)).toBeCloseTo(98.5, 5);
  });

  test('should return 77.5% for 30 prompts with defaults', () => {
    // 100 - (30 * 1500 / 200000 * 100) = 100 - 22.5 = 77.5
    expect(estimateContextPercent(30)).toBeCloseTo(77.5, 5);
  });

  test('should return 25% for 100 prompts with defaults', () => {
    // 100 - (100 * 1500 / 200000 * 100) = 100 - 75 = 25
    expect(estimateContextPercent(100)).toBeCloseTo(25, 5);
  });

  test('should clamp to 0% when tokens exceed max context', () => {
    // 200 prompts * 1500 = 300000 > 200000
    expect(estimateContextPercent(200)).toBe(0);
  });

  test('should support custom avgTokensPerPrompt', () => {
    // 100 - (10 * 2000 / 200000 * 100) = 100 - 10 = 90
    expect(estimateContextPercent(10, { avgTokensPerPrompt: 2000 })).toBeCloseTo(90, 5);
  });

  test('should support custom maxContext', () => {
    // 100 - (10 * 1500 / 100000 * 100) = 100 - 15 = 85
    expect(estimateContextPercent(10, { maxContext: 100000 })).toBeCloseTo(85, 5);
  });

  test('should support both custom options', () => {
    // 100 - (5 * 1000 / 50000 * 100) = 100 - 10 = 90
    expect(estimateContextPercent(5, {
      avgTokensPerPrompt: 1000,
      maxContext: 50000,
    })).toBeCloseTo(90, 5);
  });

  test('should return 100% for negative promptCount (graceful)', () => {
    expect(estimateContextPercent(-5)).toBe(100);
  });

  test('should return 100% for NaN promptCount (graceful)', () => {
    expect(estima
```