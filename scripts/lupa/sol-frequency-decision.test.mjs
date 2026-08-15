import assert from 'node:assert/strict';
import {
  SOL_FREQUENCY_INVARIANTS,
  decideFrequency,
  globalRuleCoverage,
  recordEngineFitness,
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
