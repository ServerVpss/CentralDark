#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');

function read(relative) {
  return readFileSync(join(ROOT, relative), 'utf8');
}

const errors = [];
const contractPath = '.agents/skills/git-state-safety/contract.json';
const skillPath = '.agents/skills/git-state-safety/SKILL.md';
const permissionsPath = 'docs/CONSCIENCIA/02-PERMISSOES.md';
const cognitiveOwner = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md';
const helperPath = 'scripts/webhook/lib/safe-git-deploy.mjs';
const consumerPath = 'scripts/webhook/telepainel-deploy.mjs';
const testPath = 'scripts/webhook/lib/safe-git-deploy.test.mjs';

let contract;
try {
  contract = JSON.parse(read(contractPath));
} catch (error) {
  errors.push(`CONTRACT_INVALID:${error.message}`);
  contract = {};
}

const skill = read(skillPath);
const permissions = read(permissionsPath);
const owner = read(cognitiveOwner);
const helper = read(helperPath);
const consumer = read(consumerPath);
const regression = read(testPath);

if (contract.schema_version !== 1) errors.push('SCHEMA_VERSION_INVALID');
if (contract.contract_id !== 'CENTRALDARK_GIT_STATE_SAFETY') errors.push('CONTRACT_ID_INVALID');
if (contract.house_wide !== true) errors.push('HOUSE_WIDE_NOT_TRUE');
if (contract.model_neutral !== true) errors.push('MODEL_NEUTRAL_NOT_TRUE');
if (contract.source_is_provenance_not_authority !== true) errors.push('PROVENANCE_BOUNDARY_MISSING');
if (contract.cognitive_owner !== cognitiveOwner) errors.push('COGNITIVE_OWNER_INVALID');
if (contract.permission_owner !== permissionsPath) errors.push('PERMISSION_OWNER_INVALID');
if (contract.operational_consumer !== helperPath) errors.push('OPERATIONAL_CONSUMER_INVALID');
if (contract.regression_test !== testPath) errors.push('REGRESSION_TEST_INVALID');

if (!owner.includes('curso, modelo externo ou sessão antiga entram como matéria-prima, não como autoridade')) {
  errors.push('COGNITIVE_OWNER_DOES_NOT_DECLARE_COURSE_MINING');
}
if (!owner.includes('SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true')) {
  errors.push('COGNITIVE_OWNER_PROVENANCE_RULE_MISSING');
}

if (!/Force-push\./i.test(permissions)) errors.push('FORCE_PUSH_PROHIBITION_MISSING');
if (!/git reset --hard` como mecanismo operacional/i.test(permissions)) errors.push('RESET_HARD_PROHIBITION_MISSING');

for (const marker of [
  'HOUSE_WIDE=true',
  'MODEL_NEUTRAL=true',
  `COGNITIVE_OWNER=${cognitiveOwner}`,
  `PERMISSION_OWNER=${permissionsPath}`,
  'FETCH = OBSERVAR ESTADO REMOTO SEM INTEGRAR NA BRANCH ATUAL',
  'PUSH_REJECTED_NON_FAST_FORWARD = SINAL DE DIVERGENCIA, NAO PERMISSAO PARA FORCE',
  'FORCE_PUSH=FORBIDDEN',
  'RESET_HARD_AS_OPERATIONAL_MECHANISM=FORBIDDEN',
]) {
  if (!skill.includes(marker)) errors.push(`SKILL_MARKER_MISSING:${marker}`);
}

if (!helper.includes('export async function safeUpdateFromOrigin')) errors.push('SAFE_UPDATE_EXPORT_MISSING');
if (!/git\(\[\s*['"]merge['"]\s*,\s*['"]--ff-only['"]/.test(helper)) errors.push('FF_ONLY_MUTATION_MISSING');
if (/git\(\[\s*['"]reset['"]\s*,\s*['"]--hard['"]/.test(helper)) errors.push('RESET_HARD_EXECUTABLE_PRESENT');
if (/git\(\[\s*['"]push['"][^\]]*['"]--force/.test(helper)) errors.push('FORCE_PUSH_EXECUTABLE_PRESENT');
if (helper.includes('safeResetToOrigin')) errors.push('LEGACY_RESET_API_PRESENT');
if (!helper.includes("reason: 'REMOTE_REWRITE'")) errors.push('REMOTE_REWRITE_BLOCK_MISSING');

if (!consumer.includes("import { safeUpdateFromOrigin } from './lib/safe-git-deploy.mjs'")) errors.push('CONSUMER_IMPORT_INVALID');
const safeUpdateCall = consumer.match(/await\s+safeUpdateFromOrigin\(\{([\s\S]*?)\}\)/);
const safeUpdateArgs = safeUpdateCall?.[1] || '';
if (
  !safeUpdateCall ||
  !/\brepoPath\s*:\s*REPO_PATH\b/.test(safeUpdateArgs) ||
  !/\bbranch\s*:\s*['"]main['"]/.test(safeUpdateArgs) ||
  !/(?:^|,)\s*log\s*(?:,|$)/m.test(safeUpdateArgs)
) errors.push('CONSUMER_CALL_INVALID');
if (!consumer.includes('estado local preservado')) errors.push('CONSUMER_PRESERVATION_RECEIPT_MISSING');

for (const marker of ['DIRTY_WORKTREE', 'LOCAL_AHEAD', 'DIVERGED', 'REMOTE_REWRITE', 'DETACHED_HEAD', 'PASS fast-forward']) {
  if (!regression.includes(marker)) errors.push(`REGRESSION_COVERAGE_MISSING:${marker}`);
}

const provenance = Array.isArray(contract.provenance) ? contract.provenance : [];
if (provenance.length < 9) errors.push('PROVENANCE_DENOMINATOR_INCOMPLETE');
const urls = new Set(provenance.map((source) => source.url));
for (const requiredUrl of [
  'https://alexandrecaramaschi.com/educacao/github',
  'https://pt.stackoverflow.com/questions/458820/como-reverter-o-git-push-force',
  'https://docs.github.com/pt/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors',
  'https://www.datacamp.com/pt/tutorial/git-pull-force',
  'https://graphite.com/guides/fix-git-push-rejected-errors',
  'https://git-scm.com/docs/git-fetch',
  'https://git-scm.com/docs/git-pull',
  'https://git-scm.com/docs/git-push',
  'https://git-scm.com/docs/git-reflog',
]) {
  if (!urls.has(requiredUrl)) errors.push(`PROVENANCE_URL_MISSING:${requiredUrl}`);
}

if (errors.length) {
  console.error('GIT_STATE_SAFETY=FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('GIT_STATE_SAFETY=PASS');
console.log(`PROVENANCE_SOURCES=${provenance.length}`);
console.log('MUTATION_POLICY=FAST_FORWARD_ONLY_OR_BLOCK');
console.log('FORCE_PUSH=FORBIDDEN');
console.log('RESET_HARD_OPERATIONAL=FORBIDDEN');
