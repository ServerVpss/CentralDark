import assert from 'node:assert/strict';
import test from 'node:test';

import {
  continuityBlockReceipt,
  validateContinuityState,
} from './continuity-guard.mjs';
import {
  PERCEPTION_ATTACKS,
  assignPerceptionModels,
  buildPerceptionPacket,
  dedupePerceptionFindings,
} from './perception-orchestra.mjs';

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

test('orquestra de percepção fixa exatamente quatro ataques diferentes', () => {
  assert.deepEqual(PERCEPTION_ATTACKS.map((item) => item.id), [
    'A_LOGIC',
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
  assert.equal(new Set(PERCEPTION_ATTACKS.map((item) => item.objective)).size, 4);
});

test('quatro braços podem reutilizar providers sem fingir independência causal', () => {
  const assignments = assignPerceptionModels(['modelo-a', 'modelo-b']);
  assert.equal(assignments.length, 4);
  assert.deepEqual(assignments.map((item) => item.model), ['modelo-a', 'modelo-b', 'modelo-a', 'modelo-b']);
  assert.ok(assignments.every((item) => item.independence === 'ROLE_DIVERSE_PROVIDER_REUSE'));
});

test('dedupe funde eco e preserva ângulos materialmente diferentes', () => {
  const results = [
    {
      role: 'A_LOGIC', model: 'm1', independence: 'ROLE_DIVERSE_PROVIDER_REUSE', status: 'OK',
      finding: { claim: 'Owner errado', class: 'HYPOTHESIS', evidence_ref: 'x', counterexample: 'owner certo', recommended_test: 'ler owner', material_delta: 'verificar owner' },
    },
    {
      role: 'B_IMPLEMENTATION', model: 'm2', independence: 'ROLE_DIVERSE_PROVIDER_REUSE', status: 'OK',
      finding: { claim: 'Owner errado', class: 'HYPOTHESIS', evidence_ref: 'x', counterexample: 'owner certo', recommended_test: 'ler owner', material_delta: 'eco' },
    },
    {
      role: 'D_SIMPLIFICATION', model: 'm1', independence: 'ROLE_DIVERSE_PROVIDER_REUSE', status: 'OK',
      finding: { claim: 'Há duplicação', class: 'INFERENCE', evidence_ref: 'y', counterexample: 'um owner', recommended_test: 'contar owners', material_delta: 'remover eco' },
    },
  ];
  const deduped = dedupePerceptionFindings(results);
  assert.equal(deduped.length, 2);
  assert.deepEqual(deduped.map((item) => item.role), ['A_LOGIC', 'D_SIMPLIFICATION']);
});

test('pacote de quatro percepções é read-only e serializa a caneta', () => {
  const packet = buildPerceptionPacket({
    mission: 'mesma intenção',
    results: [{
      role: 'A_LOGIC', model: 'm1', independence: 'ROLE_AND_PROVIDER_DIVERSE', status: 'OK',
      finding: { claim: 'x', class: 'FACT', evidence_ref: 'ref', counterexample: 'y', recommended_test: 'teste', material_delta: 'delta' },
    }],
  });
  assert.equal(packet.parallel_perception, true);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.writer_required_for_mutation, true);
  assert.equal(packet.model_vote_is_truth, false);
  assert.equal(packet.reality_is_judge, true);
  assert.equal(packet.next_rule, 'CONFRONT_EVIDENCE_THEN_ONE_CANONICAL_MUTATION');
});