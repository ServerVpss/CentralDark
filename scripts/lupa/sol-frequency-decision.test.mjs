import assert from 'node:assert/strict';
import {
  SOL_FREQUENCY_INVARIANTS,
  compareThinkingRoutes,
  decideFrequency,
  globalRuleCoverage,
  quantifyRatio,
  recordEngineFitness,
  recordThinkingRouteOutcome,
  scientificDelta,
} from './sol-frequency-decision.mjs';

const rapid = decideFrequency({
  selected: 'RAPIDA',
  reason: 'lookup simples',
  evidence: ['1 owner', 'baixo risco'],
  budget: 'LOW',
  engine: 'engine-a',
});
assert.equal(rapid.selected, 'RAPIDA');
assert.equal(rapid.switch_applied, false);

const deep = decideFrequency({
  selected: 'PROFUNDA',
  previous_frequency: 'RAPIDA',
  reason: 'conflito entre owners',
  evidence: ['3 owners', 'contradicao material'],
  escalation_trigger: 'MULTI_OWNER_CONFLICT',
  engine: 'engine-a',
  material_delta: true,
  cooldown_elapsed: true,
});
assert.equal(deep.selected, 'PROFUNDA');
assert.equal(deep.switch_applied, true);

const antiOscillation = decideFrequency({
  selected: 'RAPIDA',
  previous_frequency: 'PROFUNDA',
  reason: 'nenhuma evidencia nova',
  evidence: ['same evidence'],
  deescalation_trigger: 'NONE',
  engine: 'engine-a',
  material_delta: false,
  cooldown_elapsed: false,
});
assert.equal(antiOscillation.selected, 'PROFUNDA');
assert.equal(antiOscillation.switch_blocked_by_hysteresis, true);

const coldSafety = decideFrequency({
  selected: 'FRIA',
  previous_frequency: 'MEDIA',
  reason: 'seguranca exige judge',
  evidence: ['security boundary'],
  engine: 'engine-b',
  material_delta: true,
  cooldown_elapsed: false,
  safety_override: true,
});
assert.equal(coldSafety.selected, 'FRIA');
assert.equal(coldSafety.switch_applied, true);

const sameFrequencyOtherEngine = decideFrequency({
  selected: 'PROFUNDA',
  previous_frequency: 'PROFUNDA',
  reason: 'comparar motor sem trocar perfil',
  evidence: ['same wound class'],
  engine: 'engine-b',
});
assert.equal(sameFrequencyOtherEngine.selected, 'PROFUNDA');
assert.equal(sameFrequencyOtherEngine.engine, 'engine-b');
assert.equal(sameFrequencyOtherEngine.switch_applied, false);

const ratio = quantifyRatio({ numerator: 568, denominator: 572, unit: 'files' });
assert.equal(ratio.status, 'PASS');
assert.equal(ratio.percent, 99.3007);
assert.equal(ratio.formula, '100 * numerator / denominator');

const zeroDenominator = quantifyRatio({ numerator: 1, denominator: 0, unit: 'files' });
assert.equal(zeroDenominator.status, 'UNDEFINED');
assert.equal(zeroDenominator.percent, null);

const delta = scientificDelta({ before: 91346859, after: 93330056, unit: 'bytes' });
assert.equal(delta.absolute_delta, 1983200);
assert.equal(delta.percent_change, 2.17106);
assert.equal(delta.relative_status, 'PASS');

const zeroBaselineDelta = scientificDelta({ before: 0, after: 10, unit: 'events' });
assert.equal(zeroBaselineDelta.percent_change, null);
assert.equal(zeroBaselineDelta.relative_status, 'UNDEFINED_BASELINE_ZERO');

const fitness = recordEngineFitness({
  engine: 'engine-b',
  frequency: 'PROFUNDA',
  latency_ms: 1200,
  correctness: 'PASS',
  counterproof_success: 'PASS',
  retries: 1,
  comparable_sample: false,
});
assert.equal(fitness.ranking_allowed, false, 'sem amostra comparavel nao ranquear motor por fama ou numero isolado');

const uncrystallizedRoute = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:abc-uncrystallized',
  skills: ['META_LUPA'],
  frequency: 'PROFUNDA',
  engine_fitness: fitness,
  evidence: ['PASS', 'counterproof PASS'],
  reusable_delta: true,
  fixed_point: true,
});
assert.equal(uncrystallizedRoute.crystal_required, true);
assert.equal(uncrystallizedRoute.fixed_point_requested, true);
assert.equal(uncrystallizedRoute.crystallized, false);
assert.equal(uncrystallizedRoute.durable_memory_receipt, false);
assert.equal(uncrystallizedRoute.fixed_point, false);
assert.equal(uncrystallizedRoute.fixed_point_blocked_by_uncrystallized, true);

const declaredWithoutReceipt = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:declared-without-receipt',
  skills: ['META_LUPA'],
  frequency: 'PROFUNDA',
  engine_fitness: fitness,
  evidence: ['PASS', 'counterproof PASS'],
  reusable_delta: true,
  crystallized: true,
  fixed_point: true,
});
assert.equal(declaredWithoutReceipt.crystallized_declared, true);
assert.equal(declaredWithoutReceipt.crystallized, false, 'autoafirmacao sem gaveta duravel nao prova cristalizacao');
assert.equal(declaredWithoutReceipt.fixed_point, false);

const unobservedObsidian = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:obsidian-unobserved',
  skills: ['META_LUPA'],
  frequency: 'PROFUNDA',
  engine_fitness: fitness,
  evidence: ['PASS', 'counterproof PASS'],
  reusable_delta: true,
  crystallized: true,
  persistence_receipt: {
    channel: 'OBSIDIAN_INBOX',
    target: 'CASA-VAULT/20-INBOX-HERMES/lesson.md',
    observed: false,
    durable: true,
  },
  fixed_point: true,
});
assert.equal(unobservedObsidian.persistence_receipt.verified, false);
assert.equal(unobservedObsidian.crystallized, false, 'caminho Obsidian nao medido nao vira prova por intencao');
assert.equal(unobservedObsidian.fixed_point, false);

const route = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:abc',
  skills: ['META_LUPA', 'ARTIFACT_TO_CAPABILITY', 'META_LUPA'],
  frequency: 'PROFUNDA',
  engine_fitness: fitness,
  evidence: ['console TypeError', 'network 500', 'counterproof PASS'],
  reusable_delta: true,
  crystallized: true,
  persistence_receipt: {
    channel: 'GITHUB_CANONICAL',
    target: 'docs/CONSCIENCIA/owner-existente.md@commit:abc123',
    observed: true,
    durable: true,
  },
  fixed_point: true,
});
assert.deepEqual(route.skills, ['META_LUPA', 'ARTIFACT_TO_CAPABILITY']);
assert.equal(route.learning_state, 'REINFORCE');
assert.equal(route.reinforce_route, true);
assert.equal(route.crystal_required, true);
assert.equal(route.crystal_eligible, true);
assert.equal(route.crystallized_declared, true);
assert.equal(route.crystallized, true);
assert.equal(route.durable_memory_receipt, true);
assert.equal(route.persistence_receipt.verified, true);
assert.equal(route.fixed_point, true);
assert.equal(route.fixed_point_blocked_by_uncrystallized, false);
assert.equal(route.ranking_allowed, false);

assert.throws(() => recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:bad-receipt',
  skills: [],
  frequency: 'PROFUNDA',
  engine_fitness: fitness,
  evidence: ['PASS'],
  reusable_delta: true,
  crystallized: true,
  persistence_receipt: { channel: '', target: 'x', observed: true, durable: true },
}), /persistence_receipt\.channel/);

const failedFitness = recordEngineFitness({
  engine: 'engine-c',
  frequency: 'PROFUNDA',
  latency_ms: 900,
  correctness: 'FAIL',
  counterproof_success: 'FAIL',
  retries: 0,
  comparable_sample: true,
});
const failedRoute = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:abc',
  skills: ['META_LUPA'],
  frequency: 'PROFUNDA',
  engine_fitness: failedFitness,
  evidence: ['regressao detectada'],
});
assert.equal(failedRoute.learning_state, 'RECALIBRATE');
assert.equal(failedRoute.crystal_eligible, false);
assert.equal(failedRoute.crystal_required, false);

const unknownFitness = recordEngineFitness({
  engine: 'engine-d',
  frequency: 'PROFUNDA',
  latency_ms: 800,
  correctness: 'UNKNOWN',
  counterproof_success: 'UNKNOWN',
  retries: 0,
  comparable_sample: true,
});
const unknownRoute = recordThinkingRouteOutcome({
  material_class: 'BROWSER_OBSERVATION',
  material_fingerprint: 'sha256:abc',
  skills: [],
  frequency: 'PROFUNDA',
  engine_fitness: unknownFitness,
  evidence: ['runner indisponivel'],
});
assert.equal(unknownRoute.learning_state, 'OBSERVE_ONLY');
assert.equal(unknownRoute.reinforce_route, false);
assert.equal(unknownRoute.recalibrate_route, false);

const comparablePassA = recordThinkingRouteOutcome({
  material_class: 'SOURCE_CODE',
  material_fingerprint: 'sha256:def',
  skills: ['META_LUPA'],
  frequency: 'MEDIA',
  engine_fitness: recordEngineFitness({
    engine: 'engine-a', frequency: 'MEDIA', latency_ms: 1500,
    correctness: 'PASS', counterproof_success: 'PASS', retries: 1, comparable_sample: true,
  }),
  evidence: ['same wound class', 'same criterion'],
});
const comparablePassB = recordThinkingRouteOutcome({
  material_class: 'SOURCE_CODE',
  material_fingerprint: 'sha256:def',
  skills: ['META_LUPA'],
  frequency: 'MEDIA',
  engine_fitness: recordEngineFitness({
    engine: 'engine-b', frequency: 'MEDIA', latency_ms: 1100,
    correctness: 'PASS', counterproof_success: 'PASS', retries: 0, comparable_sample: true,
  }),
  evidence: ['same wound class', 'same criterion'],
});
const comparison = compareThinkingRoutes([comparablePassA, comparablePassB]);
assert.equal(comparison.status, 'COMPARABLE');
assert.equal(comparison.winner.engine, 'engine-b');

assert.deepEqual(
  compareThinkingRoutes([route, comparablePassB]),
  { status: 'INSUFFICIENT_COMPARABLE_SAMPLE', winner: null },
);

assert.deepEqual(
  globalRuleCoverage({
    applicable_consumers: 10,
    loaded_consumers: 10,
    positive_test: true,
    negative_test: false,
    escaping_adapters: 0,
  }),
  { status: 'INCOMPLETE', percent: 99 },
);

assert.deepEqual(
  globalRuleCoverage({
    applicable_consumers: 10,
    loaded_consumers: 10,
    positive_test: true,
    negative_test: true,
    escaping_adapters: 0,
  }),
  { status: 'PASS', percent: 100 },
);

for (const [key, value] of Object.entries(SOL_FREQUENCY_INVARIANTS)) {
  assert.equal(value, true, `${key} must remain true`);
}

console.log('PASS sol-frequency-decision');
