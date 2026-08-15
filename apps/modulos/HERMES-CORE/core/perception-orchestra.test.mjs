import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PERCEPTION_ATTACKS,
  assignPerceptionModels,
  buildKernelState,
  buildPerceptionPacket,
} from './perception-orchestra.mjs';

function result(role, overrides = {}) {
  return {
    role,
    model: `model-${role.toLowerCase()}`,
    independence: 'ROLE_AND_PROVIDER_DIVERSE',
    status: 'OK',
    finding: {
      claim: 'mesma ferida material',
      class: 'FACT',
      evidence_ref: `evidence:${role}`,
      independence_key: `source:${role}`,
      counterexample: 'contraprova',
      recommended_test: `test:${role}`,
      material_delta: 'corrigir owner canônico',
      ...overrides,
    },
  };
}

test('usa exatamente os quatro perfis do kernel canônico', () => {
  assert.deepEqual(PERCEPTION_ATTACKS.map((item) => item.id), [
    'LOGIC',
    'IMPLEMENTATION',
    'REGRESSION_FALSE_GREEN',
    'SIMPLIFICATION',
  ]);
  assert.equal(new Set(PERCEPTION_ATTACKS.map((item) => item.objective)).size, 4);
});

test('providers podem repetir sem fingir independência de provider', () => {
  const assignments = assignPerceptionModels(['modelo-a', 'modelo-b']);
  assert.equal(assignments.length, 4);
  assert.deepEqual(assignments.map((item) => item.model), ['modelo-a', 'modelo-b', 'modelo-a', 'modelo-b']);
  assert.ok(assignments.every((item) => item.independence === 'ROLE_DIVERSE_PROVIDER_REUSE'));
});

test('estado do kernel preserva mesma intenção, mesmo material e quatro observadores únicos', () => {
  const assignments = assignPerceptionModels(['a', 'b', 'c', 'd']);
  const state = buildKernelState({ mission: 'uma intenção', head: 'abc123', assignments });
  assert.match(state.intent_id, /^INTENT-/);
  assert.match(state.material_id, /^MATERIAL-/);
  assert.equal(state.head.sha, 'abc123');
  assert.equal(state.writer.agent, 'hermes');
  assert.equal(state.coordinator, 'sol');
  assert.equal(new Set(state.perception_agents).size, 4);
});

test('um braço ausente mantém mutação bloqueada', () => {
  const packet = buildPerceptionPacket({
    mission: 'mesma intenção',
    head: 'abc123',
    results: [result('LOGIC')],
  });
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.next_rule, 'RESOLVE_BLOCKED_PERCEPTIONS_BEFORE_MUTATION');
  assert.deepEqual(packet.failed_roles, ['IMPLEMENTATION', 'REGRESSION_FALSE_GREEN', 'SIMPLIFICATION']);
});

test('hipótese ou evidência UNKNOWN não vira mutação pronta', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => result(attack.id));
  results[1] = result('IMPLEMENTATION', {
    class: 'HYPOTHESIS',
    evidence_ref: 'UNKNOWN',
  });
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', head: 'abc123', results });
  assert.equal(packet.kernel_convergence.status, 'BLOCKED_UNPROVEN_PERCEPTION_FINDINGS');
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.deepEqual(packet.failed_roles, ['IMPLEMENTATION']);
  assert.equal(packet.next_rule, 'RESOLVE_BLOCKED_PERCEPTIONS_BEFORE_MUTATION');
});

test('quatro NO_CHANGE não fabricam trabalho', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => result(attack.id, {
    claim: `sem delta ${attack.id}`,
    material_delta: 'NO_CHANGE',
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', head: 'abc123', results });
  assert.equal(packet.kernel_convergence.status, 'NO_MATERIAL_DELTA');
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.serial_mutation_queue.length, 0);
  assert.equal(packet.next_rule, 'NO_MATERIAL_DELTA_NO_MUTATION');
});

test('quatro ângulos da mesma ferida convergem para uma mutação canônica', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => result(attack.id));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', head: 'abc123', results });
  assert.equal(packet.kernel_plan_status, 'READY_FOUR_ANGLES');
  assert.equal(packet.kernel_convergence.status, 'READY_SINGLE_WRITER_MUTATION');
  assert.equal(packet.kernel_convergence.raw_finding_count, 4);
  assert.equal(packet.kernel_convergence.deduped_finding_count, 1);
  assert.equal(packet.kernel_convergence.deduped_findings[0].independent_proof_count, 4);
  assert.equal(packet.serial_mutation_queue.length, 1);
  assert.equal(packet.canonical_mutation_slots, 1);
  assert.equal(packet.ready_for_writer, true);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.counterproof_required, true);
  assert.equal(packet.gold_requires_counterproof, true);
  assert.equal(packet.model_vote_is_truth, false);
  assert.equal(packet.reality_is_judge, true);
});

test('quatro respostas correlacionadas contam como uma fonte causal', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => result(attack.id, {
    independence_key: 'same-source',
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', head: 'abc123', results });
  assert.equal(packet.kernel_convergence.deduped_finding_count, 1);
  assert.equal(packet.kernel_convergence.deduped_findings[0].independent_proof_count, 1);
  assert.equal(packet.kernel_convergence.deduped_findings[0].corroborated_by_distinct_proof, false);
  assert.equal(packet.serial_mutation_queue.length, 1);
});
