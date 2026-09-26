import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HORN_PROOF_LOCK,
  calculateClosedDenominatorCoverage,
  computeHornClosure,
  evaluateHornGoal,
  runPdfHornConformance,
} from './horn-proof-gate.mjs';

test('PDF Horn: p e p->q e q->F chega a contradicao', () => {
  const result = computeHornClosure({
    facts: ['p'],
    rules: [
      { if: ['p'], then: 'q' },
      { if: ['q'], then: null },
    ],
  });
  assert.equal(result.state, 'CONTRADICTION');
  assert.equal(result.satisfiable_under_rules, false);
});

test('Horn propaga somente consequencias forcadas e para no ponto fixo', () => {
  const result = computeHornClosure({
    facts: ['p'],
    rules: [
      { if: ['p'], then: 'q' },
      { if: ['q'], then: 'r' },
    ],
  });
  assert.equal(result.state, 'FIXED_POINT');
  assert.deepEqual(result.marked, ['P', 'Q', 'R']);
});

test('nao marcado permanece UNKNOWN e nao vira falso', () => {
  const result = evaluateHornGoal({
    facts: ['p'],
    rules: [{ if: ['p'], then: 'q' }],
    goal: 's',
  });
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.proven, false);
  assert.equal(result.false_proven, false);
});

test('denominador fechado calcula 4/4 como 100 sem virar claim universal', () => {
  const result = calculateClosedDenominatorCoverage({
    covered: ['A', 'B', 'C', 'D'],
    denominator: ['A', 'B', 'C', 'D'],
  });
  assert.equal(result.numerator, 4);
  assert.equal(result.denominator, 4);
  assert.equal(result.percent, 100);
  assert.deepEqual(result.missing, []);
});

test('autoconformance com o PDF fecha 4/4', () => {
  const result = runPdfHornConformance();
  assert.equal(result.status, 'PASS');
  assert.equal(result.passed, 4);
  assert.equal(result.total, 4);
  assert.equal(result.conformance_percent, 100);
  assert.equal(result.universal_correctness_claim, false);
  assert.equal(result.source_sha256, HORN_PROOF_LOCK.source_sha256);
});
