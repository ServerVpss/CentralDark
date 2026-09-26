import test from 'node:test';
import assert from 'node:assert/strict';

import {
  suggestedPrTitle,
  validatePrTitle,
} from './pr-title-contract.mjs';

test('accepts canonical emoji prefix and uppercase PR title', () => {
  const result = validatePrTitle('🧿 DOCS+TEST: PREANSWER GITHUB GATE · CONTINUIDADE VIVA');

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('rejects lowercase title even when emoji exists', () => {
  const result = validatePrTitle('🛠️ fix(ci): menos e mais');

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TITLE_TEXT_NOT_UPPERCASE'));
});

test('rejects title without emoji prefix', () => {
  const result = validatePrTitle('FIX(CI): MENOS E MAIS');

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TITLE_MISSING_EMOJI_PREFIX'));
});

test('rejects unknown emoji prefix to keep situation symbol canonical', () => {
  const result = validatePrTitle('🍕 FIX(CI): MENOS E MAIS');

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TITLE_EMOJI_PREFIX_NOT_CANONICAL'));
});

test('suggestedPrTitle preserves existing emoji and uppercases text', () => {
  assert.equal(
    suggestedPrTitle('🛠️ fix(ci): menos e mais'),
    '🛠️ FIX(CI): MENOS E MAIS',
  );
});

test('suggestedPrTitle adds default CentralDark emoji when missing', () => {
  assert.equal(
    suggestedPrTitle('fix(ci): menos e mais'),
    '🧿 FIX(CI): MENOS E MAIS',
  );
});
