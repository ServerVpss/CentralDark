import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { aggregateCapsule, main, parseJsonl, validateEvent } from './capsula-observavel.mjs';

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
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
    action: 'executar teste discriminativo',
    status: 'FAIL',
    reason: '',
    chief_decision: 'PENDING',
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

test('sem eventos bloqueia e não inventa porcentagem', () => {
  const snapshot = aggregateCapsule([], { generatedAt: '2026-08-06T03:00:00Z' });
  assert.equal(snapshot.capsule.status, 'BLOCKED');
  assert.equal(snapshot.capsule.reason, 'NO_EVENTS');
  assert.equal(snapshot.learning.correction_rate.percent, null);
  assert.equal(snapshot.learning.correction_rate.state, 'SEM_DENOMINADOR');
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

test('drift de candidato dentro do mesmo run bloqueia', () => {
  const snapshot = aggregateCapsule([
    event(),
    event({ iteration: 2, timestamp_utc: '2026-08-06T03:01:00Z', candidate_digest: DIGEST_B, evidence_hash: HASH_B }),
  ]);
  assert.equal(snapshot.validation.verdict, 'FAIL');
  assert.equal(snapshot.capsule.reason, 'CANDIDATE_DRIFT');
});

test('métricas exatas usam denominador e não dão XP duplicado', () => {
  const events = [
    event(),
    event({ iteration: 2, timestamp_utc: '2026-08-06T03:01:00Z', new_failure_class: false, evidence_hash: HASH_B }),
    event({
      iteration: 3,
      timestamp_utc: '2026-08-06T03:02:00Z',
      phase: 'DECIDE',
      status: 'PASS',
      tests: { total: 4, pass: 4, fail: 0, skipped: 0 },
      failure_observed: false,
      new_failure_class: false,
      correction_verified: true,
      retained_after_retest: true,
      generalization: { pass: 3, total: 4 },
      retention: { pass: 5, total: 5 },
      chief_decision: 'APPROVED',
      evidence_hash: 'c'.repeat(64),
    }),
  ];
  const snapshot = aggregateCapsule(events);
  assert.equal(snapshot.validation.verdict, 'PASS');
  assert.equal(snapshot.learning.failures_observed, 2);
  assert.equal(snapshot.learning.unique_failure_classes, 1);
  assert.equal(snapshot.learning.repeated_failures, 1);
  assert.equal(snapshot.learning.xp_valid, 1);
  assert.equal(snapshot.learning.xp_rejected, 0);
  assert.equal(snapshot.learning.correction_rate.percent, 100);
  assert.equal(snapshot.learning.recurrence_rate.percent, 50);
  assert.equal(snapshot.capsule.current_run.generalization.percent, 75);
  assert.equal(snapshot.capsule.current_run.retention.percent, 100);
  assert.equal(snapshot.capsule.ready_for_promotion, true);
});

test('um ciclo aceita fases diferentes na mesma iteração e rejeita fase duplicada', () => {
  const valid = aggregateCapsule([
    event({ phase: 'PLAN', status: 'UNKNOWN', failure_observed: false, failure_fingerprint: '', new_failure_class: false }),
    event({ phase: 'ACT', status: 'UNKNOWN', failure_observed: false, failure_fingerprint: '', new_failure_class: false, evidence_hash: HASH_B }),
    event({ phase: 'OBSERVE', iteration: 1, timestamp_utc: '2026-08-06T03:01:00Z', evidence_hash: 'c'.repeat(64) }),
  ]);
  assert.equal(valid.validation.verdict, 'PASS');

  const duplicate = aggregateCapsule([
    event({ phase: 'OBSERVE' }),
    event({ phase: 'OBSERVE', timestamp_utc: '2026-08-06T03:01:00Z', evidence_hash: HASH_B }),
  ]);
  assert.equal(duplicate.validation.verdict, 'FAIL');
  assert.match(duplicate.validation.problems.join(' '), /PHASE_DUPLICATE/);
});

test('falso verde histórico não bloqueia para sempre um run posterior corrigido', () => {
  const oldRun = event({
    run_id: 'run-antigo',
    phase: 'DECIDE',
    status: 'FAIL',
    false_green_found: true,
  });
  const newRun = event({
    run_id: 'run-novo',
    timestamp_utc: '2026-08-06T04:00:00Z',
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 2, pass: 2, fail: 0, skipped: 0 },
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
    chief_decision: 'APPROVED',
    evidence_hash: HASH_B,
  });
  const snapshot = aggregateCapsule([oldRun, newRun]);
  assert.equal(snapshot.learning.false_green_count, 1);
  assert.equal(snapshot.capsule.ready_for_promotion, true);
});

test('denominador inconsistente reprova', () => {
  const problems = validateEvent(event({ tests: { total: 3, pass: 1, fail: 1, skipped: 0 } }));
  assert.match(problems.join(' '), /TESTS_DENOMINATOR_MISMATCH/);
});

test('JSONL inválido não vira lista vazia aprovada', () => {
  const parsed = parseJsonl('{"ok":true}\n{quebrado}\n');
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.errors.length, 1);
  const snapshot = aggregateCapsule(parsed.events, { parseErrors: parsed.errors });
  assert.equal(snapshot.validation.verdict, 'FAIL');
  assert.equal(snapshot.capsule.status, 'BLOCKED');
});

test('append atômico aceita evento válido e rejeita drift sem alterar ledger', () => {
  const dir = mkdtempSync(join(tmpdir(), 'capsula-'));
  const ledger = join(dir, 'events.jsonl');
  const first = join(dir, 'first.json');
  const drift = join(dir, 'drift.json');
  writeFileSync(first, JSON.stringify(event()), 'utf8');
  main(['--ledger', ledger, '--append-event', first]);
  const before = readFileSync(ledger, 'utf8');
  assert.match(before, /erro-classe-a/);

  writeFileSync(drift, JSON.stringify(event({ iteration: 2, candidate_digest: DIGEST_B, evidence_hash: HASH_B })), 'utf8');
  assert.throws(() => main(['--ledger', ledger, '--append-event', drift]), /LEDGER_REJECTED/);
  assert.equal(readFileSync(ledger, 'utf8'), before);
});
