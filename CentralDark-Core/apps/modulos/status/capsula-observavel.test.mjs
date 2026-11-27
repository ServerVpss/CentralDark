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
  assert.match(problems.join(' '), /CHIEF_RECEIPT_REF_REQUIRED/);
  const snapshot = aggregateCapsule([invalid]);
  assert.equal(snapshot.capsule.ready_for_promotion, false);
});

test('drift de candidato dentro do mesmo run bloqueia', () => {
  const snapshot = aggregateCapsule([
    event(),
    event({ iteration: 2, timestamp_utc: '2026-08-06T03:01:00Z', candidate_digest: DIGEST_B, evidence_hash: HASH_B }),
  ]);
  assert.equal(snapshot.validation.verdict, 'FAIL');
  assert.equal(snapshot.capsule.reason, 'CANDIDATE_DRIFT');
});

test('métricas exatas usam denominador, recibo do Chefe e não dão XP duplicado', () => {
  const events = [
    event(),
    event({ iteration: 2, timestamp_utc: '2026-08-06T03:01:00Z', new_failure_class: false, evidence_hash: HASH_B }),
    chiefPass({
      iteration: 3,
      timestamp_utc: '2026-08-06T03:02:00Z',
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
  assert.equal(exitCodeForSnapshot(snapshot), 0);
});

test('um ciclo aceita fases diferentes na mesma iteração e rejeita fase duplicada', () => {
  const valid = aggregateCapsule([
    event({
      phase: 'PLAN',
      status: 'UNKNOWN',
      failure_observed: false,
      failure_fingerprint: '',
      new_failure_class: false,
    }),
    event({
      phase: 'ACT',
      status: 'UNKNOWN',
      failure_observed: false,
      failure_fingerprint: '',
      new_failure_class: false,
      evidence_hash: HASH_B,
    }),
    event({ phase: 'OBSERVE', timestamp_utc: '2026-08-06T03:01:00Z', evidence_hash: HASH_C }),
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
  const newRun = chiefPass({
    run_id: 'run-novo',
    timestamp_utc: '2026-08-06T04:00:00Z',
    correction_verified: false,
    retained_after_retest: false,
    failure_fingerprint: '',
  });
  const snapshot = aggregateCapsule([oldRun, newRun]);
  assert.equal(snapshot.learning.false_green_count, 1);
  assert.equal(snapshot.capsule.ready_for_promotion, true);
});

test('run_id é normalizado na leitura do mapa', () => {
  const snapshot = aggregateCapsule([
    event({ run_id: ' run-espacado ', phase: 'PLAN', status: 'UNKNOWN', failure_observed: false, failure_fingerprint: '', new_failure_class: false }),
    event({ run_id: ' run-espacado ', phase: 'ACT', status: 'UNKNOWN', failure_observed: false, failure_fingerprint: '', new_failure_class: false, evidence_hash: HASH_B }),
  ]);
  assert.equal(snapshot.validation.verdict, 'PASS');
  assert.equal(snapshot.capsule.current_run.run_id, 'run-espacado');
  assert.equal(snapshot.capsule.current_run.writer, 'hermes-writer');
});

test('chave desconhecida e formato de credencial são rejeitados sem ecoar o valor', () => {
  const unknown = validateEvent({ ...event(), campo_extra: 'valor' });
  assert.match(unknown.join(' '), /UNKNOWN_FIELD_PRESENT/);
  const secret = validateEvent(event({ action: `usar ${'gh' + 'p_'}${'A'.repeat(30)}` }));
  assert.match(secret.join(' '), /CREDENTIAL_SHAPE_DETECTED/);
  assert.equal(secret.join(' ').includes('ghp_'), false);
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
  assert.equal(exitCodeForSnapshot(snapshot), 1);
});

test('append com lock aceita evento, rejeita drift e não altera o ledger', () => {
  const dir = mkdtempSync(join(tmpdir(), 'capsula-'));
  const ledger = join(dir, 'events.jsonl');
  const first = join(dir, 'first.json');
  const drift = join(dir, 'drift.json');
  writeFileSync(first, JSON.stringify(event()), 'utf8');
  main(['--ledger', ledger, '--append-event', first]);
  const before = readFileSync(ledger, 'utf8');
  assert.match(before, /erro-classe-a/);
  assert.equal(statSync(ledger).mode & 0o777, 0o600);
  const sealed = JSON.parse(readFileSync(ledger, 'utf8').trim());
  assert.equal(sealed.seal_number, 1);
  assert.equal(sealed.seal_id, 'S000001');
  assert.equal(sealed.seal_proof_hash, sealed.evidence_hash);
  assert.equal(sealed.next_cursor, 'S000002');

  writeFileSync(drift, JSON.stringify(event({ iteration: 2, candidate_digest: DIGEST_B, evidence_hash: HASH_B })), 'utf8');
  assert.throws(() => main(['--ledger', ledger, '--append-event', drift]), /LEDGER_REJECTED/);
  assert.equal(readFileSync(ledger, 'utf8'), before);
});

test('lock concorrente bloqueia append e preserva o ledger', () => {
  const dir = mkdtempSync(join(tmpdir(), 'capsula-lock-'));
  const ledger = join(dir, 'events.jsonl');
  const input = join(dir, 'event.json');
  writeFileSync(input, JSON.stringify(event()), 'utf8');
  const lockFd = openSync(`${ledger}.lock`, 'wx', 0o600);
  try {
    assert.throws(() => main(['--ledger', ledger, '--append-event', input]), /LEDGER_LOCKED/);
    assert.equal(readFileSync(input, 'utf8').includes('erro-classe-a'), true);
  } finally {
    closeSync(lockFd);
  }
});

test('snapshot é gravado legível pelo servidor estático', () => {
  const dir = mkdtempSync(join(tmpdir(), 'capsula-output-'));
  const output = join(dir, 'capsula-data.json');
  const snapshot = main(['--output', output]);
  assert.equal(snapshot.capsule.status, 'BLOCKED');
  assert.equal(statSync(output).mode & 0o777, 0o644);
});
