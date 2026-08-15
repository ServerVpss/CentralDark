import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

console.log('PASS sol-frequency-global-contract');
