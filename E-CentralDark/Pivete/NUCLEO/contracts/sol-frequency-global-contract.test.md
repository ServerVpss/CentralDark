# CONTRATO - sol-frequency-global-contract.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\sol-frequency-global-contract.test.mjs
**SHA:** 17a837d1924bbc99
**Timestamp:** 2026-08-28T02:57:36.257760
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const contract = readFileSync(
- assert.match(agents, new RegExp(`SOL_FREQUENCY_CONTRACT=${contractPath.replaceAll('/', '\\/')}`));
- assert.ok(contract.includes(marker), `missing global SOL frequency invariant: ${marker}`);

### Principios
- assert.ok(contract.includes(marker), `missing global SOL frequency invariant: ${marker}`);

### Gaps
- 'ANTI_GAP=ON',

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SOL_FREQUENCY_INVARIANTS,
  decideFrequency,
  globalRuleCoverage,
  recordEngineFitness,
} from './sol-frequency-decision.mjs';

const agents = readFileSync(new URL('../../AGENTS.md', import.meta.url), 'utf8');
const contract = readFileSync(
  new URL('../../docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md', import.meta.url),
  'utf8',
);

const contractPath = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md';

assert.match(agents, new RegExp(`SOL_FREQUENCY_CONTRACT=${contractPath.replaceAll('/', '\\/')}`));
assert.ok(agents.includes(`Ler \`${contractPath}\`.`));
assert.ok(agents.includes('## Frequência operacional é regra global da Casa'));
assert.ok(agents.includes('FREQUENCY_IS_AUTHORITY=false'));
assert.ok(agents.includes('USE_LOWEST_SUFFICIENT_FREQUENCY=true'));

for (const marker of [
  'status: "CANÔNICO"',
  'GLOBAL_REPOSITORY_SCOPE=true',
  'SOL=ONE',
  'MODELS=ENGINES',
  'FREQUENCY=ADAPTIVE',
  'FREQUENCY_AUTO_SELECTED=true',
  'FREQUENCY_DECISION_OBSERVABLE=true',
  'FREQUENCY_CHANGE_REQUIRES_MATERIAL_DELTA=true',
  'HYSTERESIS_ENABLED=true',
  'FREQUENCY_IS_NOT_ENGINE=true',
  'ENGINE_FITNESS_REQUIRES_OBSERVED_METRICS=true',
  'ENGINE_RANKING_REQUIRES_COMPARABLE_SAMPLE=true',
  'GLOBAL_RULE_COVERAGE_100_REQUIRES_CLOSED_DENOMINATOR=true',
  'QUANTIFY_WHEN_MEASURABLE=true',
  'PERCENTAGE_REQUIRED_WHEN_DENOMINATOR_CLOSED=true',
  'SCIENTIFIC_CALCULATION_REQUIRED_WHEN_DECISION_DEPENDS_ON_MAGNITUDE=true',
  'NO_FALSE_PRECISION=true',
  'CRYSTALLIZE_ALL_PROVEN_REUSABLE_DELTA=true',
  'UNCRYSTALLIZED_PROVEN_REUSABLE_DELTA=0_AT_FIXED_POINT',
  'FREQUENCY_IS_AUTHORITY=false',
  'USE_LOWEST_SUFFICIENT_FREQUENCY=true',
  'AUTO_ESCALATE_ON_MATERIAL_DELTA=true',
  'AUTO_DEESCALATE_WHEN_SIMPLE=true',
  'FREQUENCY_SWITCH != MISSION_SWITCH',
  'FREQUENCY_SWITCH != IDENTITY_SWITCH',
  'ONE_WRITER_PER_WOUND=ON',
  'FORTE_IS_VERBOSE=false',
  'REALITY=JUDGE',
  'ANTI_GAP=ON',
]) {
  assert.ok(contract.includes(marker), `missing global SOL frequency invariant: ${marker}`);
}

for (const frequency of [
  'SOL-LEVE',
  'SOL-RÁPIDA',
  'SOL-MÉDIA',
  'SOL-PROFUNDA',
  'SOL-FORTE',
  'SOL-AVANÇADA',
  'SOL-FRIA',
  'SOL-ORQUESTRA',
]) {
  assert.ok(contract.includes(frequency), `missing operational frequency: ${frequency}`);
}

const escalation = decideFrequency({
  selected: 'PROFUNDA',
  previous_frequency: 'RAPIDA',
  reason: 'conflito material',
  evidence: ['multiple owners'],
  engine: 'engine-a',
  material_delta: true,
  cooldown_elapsed: true,
});
assert.equal(escalation.selected, 'PROFUNDA');
assert.equal(escalation.switch_applied, true);

const hysteresis = decideFrequency({
  selected: 'RAPIDA',
  previous_frequency: 'PROFUNDA',
  reason: 'sem nova evidencia',
  evidence: ['same evidence'],
  engine: 'engine-a',
  material_delta: false,
  cooldown_elapsed: false,
});
assert.equal(hysteresis.selected, 'PROFUNDA');
assert.equal(hysteresis.switch_blocked_by_hysteresis, true);

const fitness = recordEngineFitness({
  engine: 'engine-b',
  frequency: 'PROFUNDA',
  latency_ms: 100,
  correctness: 'PASS',
  counterproof_success: 'PASS',
  retries: 0,
  comparable_sample: false,
});
assert.equal(fitness.ranking_allowed, false);

assert.deepEqual(
  globalRuleCoverage({
    applicable_consumers: 2,
    loaded_consumers: 2,
    positive_test: true,
    negative_test: false,
    escaping_adapters: 0,
  }),
  { status: 'INCOMPLETE', percent: 99 },
);

for (const value of Object.values(SOL_FREQUENCY_INVARIANTS)) assert.equal(value, true);

console.log('PASS sol-frequency-global-contract');

```