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
  confrontPerceptionEvidence,
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

function perception(role, overrides = {}) {
  return {
    role,
    model: `model-${role.toLowerCase()}`,
    independence: 'ROLE_AND_PROVIDER_DIVERSE',
    status: 'OK',
    finding: {
      claim: 'mesma ferida',
      class: 'FACT',
      evidence_ref: `evidence:${role}`,
      independence_key: `source:${role}`,
      counterexample: 'contraprova',
      recommended_test: 'teste discriminante comum',
      material_delta: 'corrigir owner canônico',
      ...overrides,
    },
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

test('orquestra fixa exatamente quatro ataques diferentes', () => {
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

test('dedupe funde eco e preserva delta material diferente', () => {
  const results = [
    perception('A_LOGIC', { claim: 'Owner errado', recommended_test: 'ler owner', independence_key: 'owner-source' }),
    perception('B_IMPLEMENTATION', { claim: 'Owner errado', recommended_test: 'ler owner', independence_key: 'owner-source' }),
    perception('D_SIMPLIFICATION', { claim: 'Há duplicação', recommended_test: 'contar owners', independence_key: 'tree-shape' }),
  ];
  const deduped = dedupePerceptionFindings(results);
  assert.equal(deduped.length, 2);
  assert.deepEqual(deduped.map((item) => item.role), ['A_LOGIC', 'D_SIMPLIFICATION']);
});

test('um braço ausente não libera writer', () => {
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results: [perception('A_LOGIC')] });
  assert.equal(packet.parallel_perception, true);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.deepEqual(packet.evidence_confrontation.missing_roles, [
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
  assert.equal(packet.next_rule, 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION');
});

test('hipótese ou UNKNOWN exige teste antes de mutação', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id));
  results[1] = perception('B_IMPLEMENTATION', {
    class: 'HYPOTHESIS',
    evidence_ref: 'UNKNOWN',
  });
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.deepEqual(packet.evidence_confrontation.unproven_roles, ['B_IMPLEMENTATION']);
  assert.equal(packet.unproven_findings.length, 1);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.next_rule, 'RUN_DISCRIMINATING_TEST_BEFORE_MUTATION');
});

test('quatro NO_CHANGE não fabricam trabalho', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id, {
    claim: `sem delta ${attack.id}`,
    material_delta: 'NO_CHANGE',
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.material_findings.length, 0);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.next_rule, 'NO_MATERIAL_DELTA_NO_MUTATION');
});

test('mesma ferida com quatro fontes causais converge em uma correção candidata', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.evidence_confrontation.effective_independent_count, 4);
  assert.equal(packet.evidence_confrontation.confidence_can_increase, true);
  assert.equal(packet.evidence_confrontation.four_answers_are_four_proofs, false);
  assert.equal(packet.deduped_findings.length, 1);
  assert.equal(packet.material_findings.length, 1);
  assert.equal(packet.ready_for_writer, true);
  assert.equal(packet.canonical_mutation_slots, 1);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.counterproof_required, true);
  assert.equal(packet.gold_requires_counterproof, true);
  assert.equal(packet.model_vote_is_truth, false);
  assert.equal(packet.reality_is_judge, true);
});

test('quatro respostas correlacionadas contam como um cluster causal', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id, {
    independence_key: 'same-source',
  }));
  const confrontation = confrontPerceptionEvidence(results);
  assert.equal(confrontation.all_four_completed, true);
  assert.equal(confrontation.effective_independent_count, 1);
  assert.equal(confrontation.confidence_can_increase, false);
  assert.equal(confrontation.correlated_clusters.length, 1);
  assert.deepEqual(confrontation.correlated_clusters[0].roles, [
    'A_LOGIC',
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
});
