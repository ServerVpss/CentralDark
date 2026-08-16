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
assert.equal(boot.owner_already_in_universal_boot, true);
assert.equal(boot.skill_is_parallel_authority, false);
assert.equal(boot.skill_is_reusable_projection, true);
assert.equal(contract.reality, 'JUDGE');
assert.equal(contract.invariants.FUNCTION_OVER_NAME, true);
assert.equal(contract.invariants.EFFECT_BEFORE_STORY, true);
assert.equal(contract.invariants.TRACE_CAUSE_BACKWARDS_FROM_OBSERVED_EFFECT, true);
assert.equal(contract.invariants.TELEMETRY_IS_COUNTERPROOF, true);
assert.equal(contract.invariants.BETTER_COUNTERPROOF_CAN_REPLACE_OLD_BELIEF, true);
assert.equal(contract.invariants.NEW_EVIDENCE_WINS_OVER_STALE_CONTEXT, true);
assert.equal(contract.invariants.SAFETY_WITHOUT_BUREAUCRACY, true);
assert.equal(contract.invariants.LESS_IS_MORE, true);
assert.equal(contract.hard_boundaries.UNKNOWN_IS_NOT_PASS, true);
assert.equal(contract.hard_boundaries.ONE_WRITER_PER_SCOPE, true);
assert.equal(contract.hard_boundaries.REUSE_BEFORE_CREATE, true);
assert.equal(sourceMap.classification, 'STITCH_DELTA_NOT_NEW_BRAIN');

const expectedCases = new Map([
  ['NAME_MISS_DOES_NOT_PROVE_ABSENCE', {
    given: 'Literal label is absent',
    expect: 'Search by function and observable effect before concluding absence',
  }],
  ['GREEN_PANEL_DOES_NOT_PROVE_RUNTIME', {
    given: 'UI or panel is green',
    expect: 'Require proof on applicable target for stronger runtime claim',
  }],
  ['STALE_EVIDENCE_LOSES_TO_NEW_HEAD', {
    given: 'HEAD changes after finding',
    expect: 'Reanchor and drop finding if it no longer survives',
  }],
  ['CAUTION_WITHOUT_INFORMATION_GAIN_IS_NOT_SAFETY', {
    given: 'Extra ceremony adds no risk reduction or information',
    expect: 'Prefer smaller safe path',
  }],
  ['COMPRESSION_PRESERVES_GUARDRAILS', {
    given: 'Conclusion can be shortened',
    expect: 'Keep cause, constraints, proof, material unknown and next discriminating test',
  }],
  ['SAME_EFFECT_DIFFERENT_NAME', {
    given: 'Model or component name changed but responsibility and effect remain',
    expect: 'Treat name as provenance and trace functional owner',
  }],
]);

assert.equal(tests.skill_id, boot.skill_id);
assert.equal(tests.cases.length, expectedCases.size);
const seenCaseIds = new Set();
for (const testCase of tests.cases) {
  assert.equal(typeof testCase?.id, 'string');
  assert.equal(seenCaseIds.has(testCase.id), false, `duplicate test case: ${testCase.id}`);
  seenCaseIds.add(testCase.id);
  const expected = expectedCases.get(testCase.id);
  assert.ok(expected, `unexpected test case: ${testCase.id}`);
  assert.equal(testCase.given, expected.given, `given drift: ${testCase.id}`);
  assert.equal(testCase.expect, expected.expect, `expect drift: ${testCase.id}`);
}
for (const id of expectedCases.keys()) {
  assert.equal(seenCaseIds.has(id), true, `missing test case: ${id}`);
}

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
