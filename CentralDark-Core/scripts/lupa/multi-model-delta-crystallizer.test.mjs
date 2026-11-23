import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCrystallizedPattern,
  canonicalClaim,
  validateCrystallizedPattern,
} from './multi-model-delta-crystallizer.mjs';

test('normalizes different lenses into the same canonical core', () => {
  assert.equal(canonicalClaim('pegar tudo'), 'CAPTURE_WIDE');
  assert.equal(canonicalClaim('garimpar delta util'), 'DELTA_USEFUL_ONLY');
  assert.equal(canonicalClaim('owner existente'), 'ONE_OWNER_PER_CAPABILITY');
});

test('extracts intersection without choosing a winning chat', () => {
  const pattern = buildCrystallizedPattern([
    { source_id: 'CHAT_A', claims: ['pegar tudo', 'delta util', 'medir antes'] },
    { source_id: 'CHAT_B', claims: ['capturar tudo', 'garimpar delta util', 'medir antes'] },
    { source_id: 'GPT_5_5', claims: ['PEGAR_TUDO', 'DELTA_USEFUL_ONLY', 'MEASURE_BEFORE_GREEN'] },
  ]);

  assert.deepEqual(pattern.intersection, [
    'CAPTURE_WIDE',
    'DELTA_USEFUL_ONLY',
    'MEASURE_BEFORE_GREEN',
  ]);
  assert.equal(pattern.status, 'READY_TO_ABSORB');
});

test('blocks anti-patterns instead of absorbing them as truth', () => {
  const pattern = buildCrystallizedPattern([
    { source_id: 'CHAT_A', claims: ['pegar tudo', 'commit as green'] },
    { source_id: 'CHAT_B', claims: ['pegar tudo'] },
  ]);

  assert.equal(pattern.status, 'MEASURE_REQUIRED');
  assert.equal(pattern.contradictions[0].claim, 'COMMIT_AS_GREEN');
});

test('validates the Casa contract invariants', () => {
  const pattern = buildCrystallizedPattern([
    { source_id: 'CHAT_A', claims: ['pegar tudo', 'delta util'] },
    { source_id: 'CHAT_B', claims: ['capturar tudo', 'garimpar delta util'] },
  ]);

  assert.deepEqual(validateCrystallizedPattern(pattern), {
    ok: true,
    failures: [],
  });
});
