# COMANDO - capsula-observavel.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\capsula-observavel.test.mjs
**SHA:** 15cc95b6dc4156dc
**Timestamp:** 2026-08-28T02:56:40.298111
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const oldRun = event({
- const newRun = chiefPass({

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  aggregateCapsule,
  EVENT_ALLOWED_KEYS,
  exitCodeForSnapshot,
  main,
  parseJsonl,
  validateEvent,
} from './capsula-observavel.mjs';

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);
const DIGEST_A = '1'.repeat(40);
const DIGEST_B = '2'.repeat(40);

function event(overrides = {}) {
  return {
    schema_version: 1,
    capsule_id: 'CAPSULA-INSTINTO-SUPERIOR-01',
    run_id: 'run-001',
    mission_id: 'mission-001',
    iteration: 1,
    timestamp_utc: '2026-08-06T03:00:00Z',
    phase: 'OBSERVE',
    candidate_ref: 'branch@sha',
    candidate_digest: DIGEST_A,
    baseline_ref: 'baseline-001',
    fixture_ref: 'fixture-001',
    evaluator_ref: 'judge-read-only',
    writer: 'hermes-writer',
    event_actor: 'hermes-writer',
    action: 'executar teste discriminativo',
    status: 'FAIL',
    reason: '',
    chief_decision: 'PENDING',
    chief_receipt_ref: '',
    chief_receipt_hash: '',
    tests: { total: 2, pass: 1, fail: 1, skipped: 0 },
    evidence_hash: HASH_A,
    failure_observed: true,
    failure_fingerprint: 'erro-classe-a',
    new_failure_class: true,
    correction_verified: false,
    retained_after_retest: false,
    false_green_found: false,
    regression_found: false,
    generalization: { pass: 0, total: 0 },
    retention: { pass: 0, total: 0 },
    ...overrides,
  };
}

function chiefPass(overrides = {}) {
  return event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 4, pass: 4, fail: 0, skipped: 0 },
    failure_observed: false,
    new_failure_class: false,
    correction_verified: true,
    retained_after_retest: true,
    event_actor: 'SEGREDO/CHEFE',
    chief_decision: 'APPROVED',
    chief_receipt_ref: 'github://ServerVpss/CentralDark/pull/667#chief-receipt',
    chief_receipt_hash: 'd'.repeat(64),
    generalization: { pass: 3, total: 4 },
    retention: { pass: 5, total: 5 },
    evidence_hash: HASH_C,
    ...overrides,
  });
}

test('schema e validador publicam exatamente as mesmas chaves de evento', () => {
  const schema = JSON.parse(readFileSync(new URL('./capsula-event.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(schema.properties).sort(), [...EVENT_ALLOWED_KEYS].sort());
});

test('sem eventos bloqueia, não inventa porcentagem e retorna exit code 2', () => {
  const snapshot = aggregateCapsule([], { generatedAt: '2026-08-06T03:00:00Z' });
  assert.equal(snapshot.capsule.status, 'BLOCKED');
  assert.equal(snapshot.capsule.reason, 'NO_EVENTS');
  assert.equal(snapshot.learning.correction_rate.percent, null);
  assert.equal(snapshot.learning.correction_rate.state, 'SEM_DENOMINADOR');
  assert.equal(snapshot.guarantees.same_identity_per_run, 'UNKNOWN');
  assert.equal(exitCodeForSnapshot(snapshot), 2);
});

test('PASS com skipped é rejeitado', () => {
  const problems = validateEvent(event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 2, pass: 1, fail: 0, skipped: 1 },
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
  }));
  assert.match(problems.join(' '), /PASS_WITHOUT_COMPLETE_TESTS/);
});

test('PASS com falso verde é rejeitado', () => {
  const problems = validateEvent(event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 2, pass: 2, fail: 0, skipped: 0 },
    false_green_found: true,
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
  }));
  assert.match(problems.join(' '), /PASS_WITH_FALSE_GREEN/);
});

test('PASS com regressão é rejeitado', () => {
  const problems = validateEvent(event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 2, pass: 2, fail: 0, skipped: 0 },
    regression_found: true,
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
  }));
  assert.match(problems.join(' '), /PASS_WITH_REGRESSION/);
});

test('juiz igual ao writer não pode selar PASS', () => {
  const problems = validateEvent(event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 3, pass: 3, fail: 0, skipped: 0 },
    evaluator_ref: 'hermes-writer',
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
  }));
  assert.match(problems.join(' '), /PASS_WITHOUT_INDEPENDENT_EVALUATOR/);
});

test('APPROVED sem recibo independente é rejeitado e não promove', () => {
  const invalid = event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 2, pass: 2, fail: 0, skipped: 0 },
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
    chief_decision: 'APPROVED',
  });
  const problems = validateEvent(invalid);
  assert.match(problems.join(' '), /CHIEF_ACTOR_INVALID/);
  assert.match(problems.join('
```