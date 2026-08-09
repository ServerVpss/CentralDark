import assert from 'node:assert/strict';
import test from 'node:test';

import {
  continuityBlockReceipt,
  validateContinuityState,
} from './continuity-guard.mjs';

const HEAD = 'a'.repeat(40);

function validState(overrides = {}) {
  const control = { head_sha: HEAD, status: 'PROVED' };
  return {
    objetivo: 'Retomar missão sem repetir trabalho',
    autoridade: 'SEGREDO/CHEFE',
    coordenador: 'SOL',
    escritor: 'PIVETE/HERMES',
    escopo: ['apps/modulos/HERMES-CORE/**'],
    ambiente: 'CASA_LOCAL',
    classe_de_acao: 'R1_LOCAL',
    baseline: { ...control },
    backup: { ...control },
    rollback: { ...control },
    receipt: { ...control, result: 'PASS' },
    head_sha: HEAD,
    ...overrides,
  };
}

test('estado completo e preso ao mesmo HEAD pode ser retomado', () => {
  assert.deepEqual(validateContinuityState(validState()), {
    ok: true,
    state: 'READY',
    head_sha: HEAD,
    reasons: [],
  });
});

test('campo ausente bloqueia antes de DECIDE ou APPLY', () => {
  const state = validState();
  delete state.rollback;
  const result = validateContinuityState(state);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /MISSING_FIELD:rollback/);
});

test('controle preso a outro HEAD bloqueia', () => {
  const result = validateContinuityState(
    validState({ receipt: { head_sha: 'b'.repeat(40), result: 'PASS' } }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /CONTROL_HEAD_MISMATCH:receipt/);
});

test('autoridade ou coordenação divergente bloqueiam', () => {
  const result = validateContinuityState(
    validState({ autoridade: 'PIVETE', coordenador: 'OUTRO' }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /AUTHORITY_MISMATCH/);
  assert.match(result.reasons.join(' '), /COORDINATOR_MISMATCH/);
});

test('receipt de bloqueio é estável, sanitizado e deduplicável', () => {
  const validation = validateContinuityState({ objetivo: 'x' });
  const first = continuityBlockReceipt({ mission: 'missao-a', source: 'state.json', validation });
  const second = continuityBlockReceipt({ mission: 'missao-a', source: 'state.json', validation });
  assert.deepEqual(first, second);
  assert.equal(first.result, 'BLOCKED');
  assert.match(first.fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(first).includes('valor-secreto'), false);
});
