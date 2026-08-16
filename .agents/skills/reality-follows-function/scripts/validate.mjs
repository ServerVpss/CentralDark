#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..', '..');
const skill = resolve(here, '..');

const readJson = (name) => JSON.parse(readFileSync(join(skill, name), 'utf8'));
const boot = readJson('00-boot.json');
const contract = readJson('01-contract.json');
const sourceMap = readJson('07-source-map.json');
const tests = readJson('09-tests.json');
const owner = readFileSync(join(root, boot.canonical_owner), 'utf8');

assert.equal(boot.global_repository_scope, true);
assert.equal(boot.mandatory_house_behavior, true);
assert.equal(boot.skill_is_parallel_authority, false);
assert.equal(contract.reality, 'JUDGE');
assert.equal(contract.invariants.FUNCTION_OVER_NAME, true);
assert.equal(contract.invariants.TELEMETRY_IS_COUNTERPROOF, true);
assert.equal(contract.invariants.LESS_IS_MORE, true);
assert.equal(sourceMap.classification, 'STITCH_DELTA_NOT_NEW_BRAIN');
assert.ok(tests.cases.length >= 6);

for (const marker of [
  'CAUSE_GENERATOR_BEFORE_SYMPTOM_PATCHING=true',
  'NOME|MODELO|PROVIDER|AGENTE',
  'ABSORCAO NO DONO CANONICO',
  'NO_PROOF_THEATER_FOR_IDENTITY=true',
  'NO_NEW_INFORMATION=NO_CHANGE',
]) {
  assert.ok(owner.includes(marker), `canonical owner missing marker: ${marker}`);
}

for (const file of boot.load_order) readJson(file);

console.log('PASS reality-follows-function global projection');
