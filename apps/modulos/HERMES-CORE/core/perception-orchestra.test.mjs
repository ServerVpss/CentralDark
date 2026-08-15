import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PERCEPTION_ATTACKS,
  assignPerceptionModels,
  buildPerceptionPacket,
  confrontPerceptionEvidence,
  dedupePerceptionFindings,
} from './perception-orchestra.mjs';

function finding({
  claim = 'claim',
  evidence_ref = 'evidence',
  independence_key = 'UNKNOWN',
  recommended_test = 'test',
  material_delta = 'delta',
  className = 'HYPOTHESIS',
} = {}) {
  return {
    claim,
    class: className,
    evidence_ref,
    independence_key,
    counterexample: 'counterexample',
    recommended_test,
    material_delta,
  };
}

test('fixa quatro ataques diferentes para a mesma intenção', () => {
  assert.deepEqual(PERCEPTION_ATTACKS.map((item) => item.id), [
    'A_LOGIC',
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
  assert.equal(new Set(PERCEPTION_ATTACKS.map((item) => item.objective)).size, 4);
});

test('reutiliza providers sem fingir independência causal', () => {
  const assignments = assignPerceptionModels(['modelo-a', 'modelo-b']);
  assert.equal(assignments.length, 4);
  assert.deepEqual(assignments.map((item) => item.model), ['modelo-a', 'modelo-b', 'modelo-a', 'modelo-b']);
  assert.ok(assignments.every((item) => item.independence === 'ROLE_DIVERSE_PROVIDER_REUSE'));
});

test('dedupe remove eco e preserva delta material diferente', () => {
  const results = [
    {
      role: 'A_LOGIC', model: 'm1', independence: 'ROLE_AND_PROVIDER_DIVERSE', status: 'OK',
      finding: finding({ claim: 'Owner errado', independence_key: 'owner-source', recommended_test: 'ler owner' }),
    },
    {
      role: 'B_IMPLEMENTATION', model: 'm2', independence: 'ROLE_AND_PROVIDER_DIVERSE', status: 'OK',
      finding: finding({ claim: 'Owner errado', independence_key: 'owner-source', recommended_test: 'ler owner', material_delta: 'eco' }),
    },
    {
      role: 'D_SIMPLIFICATION', model: 'm4', independence: 'ROLE_AND_PROVIDER_DIVERSE', status: 'OK',
      finding: finding({ claim: 'Há duplicação', independence_key: 'tree-shape', recommended_test: 'contar owners' }),
    },
  ];
  const deduped = dedupePerceptionFindings(results);
  assert.equal(deduped.length, 2);
  assert.deepEqual(deduped.map((item) => item.role), ['A_LOGIC', 'D_SIMPLIFICATION']);
});

test('confronta independência por fonte causal em vez de contar respostas', () => {
  const results = [
    { role: 'A_LOGIC', status: 'OK', finding: finding({ independence_key: 'owner-source', recommended_test: 'testar owner' }) },
    { role: 'B_IMPLEMENTATION', status: 'OK', finding: finding({ independence_key: 'owner-source', recommended_test: 'testar integração' }) },
    { role: 'C_REGRESSION_FALSE_GREEN', status: 'OK', finding: finding({ independence_key: 'regression-log', recommended_test: 'rodar regressão' }) },
    { role: 'D_SIMPLIFICATION', status: 'OK', finding: finding({ independence_key: 'UNKNOWN', recommended_test: 'medir complexidade' }) },
  ];
  const confrontation = confrontPerceptionEvidence(results);
  assert.equal(confrontation.all_four_completed, true);
  assert.equal(confrontation.effective_independent_count, 2);
  assert.deepEqual(confrontation.correlated_clusters, [
    { independence_key: 'owner-source', roles: ['A_LOGIC', 'B_IMPLEMENTATION'] },
  ]);
  assert.deepEqual(confrontation.unproven_independence_roles, ['D_SIMPLIFICATION']);
  assert.equal(confrontation.confidence_can_increase, true);
  assert.equal(confrontation.four_answers_are_four_proofs, false);
  assert.equal(confrontation.correlated_evidence_inflation_blocked, true);
});

test('um braço falho mantém a caneta bloqueada', () => {
  const results = [
    { role: 'A_LOGIC', status: 'OK', finding: finding({ independence_key: 'a' }) },
    { role: 'B_IMPLEMENTATION', status: 'FAILED', finding: null },
    { role: 'C_REGRESSION_FALSE_GREEN', status: 'OK', finding: finding({ independence_key: 'c' }) },
    { role: 'D_SIMPLIFICATION', status: 'OK', finding: finding({ independence_key: 'd' }) },
  ];
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, false);
  assert.deepEqual(packet.evidence_confrontation.missing_roles, ['B_IMPLEMENTATION']);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.next_rule, 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION');
});

test('quatro braços sem delta não fabricam mutação', () => {
  const results = PERCEPTION_ATTACKS.map((attack, index) => ({
    role: attack.id,
    status: 'OK',
    finding: finding({
      claim: `sem delta ${index}`,
      independence_key: `source-${index}`,
      recommended_test: `teste ${index}`,
      material_delta: 'NO_CHANGE',
    }),
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.material_findings.length, 0);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.next_rule, 'NO_MATERIAL_DELTA_NO_MUTATION');
});

test('quatro braços completos com delta material liberam só um slot de writer', () => {
  const results = PERCEPTION_ATTACKS.map((attack, index) => ({
    role: attack.id,
    status: 'OK',
    finding: finding({
      claim: `delta ${index}`,
      independence_key: `source-${index}`,
      recommended_test: `teste ${index}`,
      material_delta: index === 3 ? 'simplificar owner' : 'NO_CHANGE',
    }),
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.ready_for_writer, true);
  assert.equal(packet.canonical_mutation_slots, 1);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.counterproof_required, true);
  assert.equal(packet.gold_requires_counterproof, true);
  assert.equal(packet.model_vote_is_truth, false);
  assert.equal(packet.reality_is_judge, true);
});
