#!/usr/bin/env node
import { readFileSync, writeFileSync, renameSync, chmodSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PHASES = new Set(['PLAN', 'ACT', 'OBSERVE', 'CRITIQUE', 'REFINE', 'DECIDE']);
const STATUSES = new Set(['PASS', 'FAIL', 'UNKNOWN', 'ANOMALY', 'ACHADO_PENDENTE', 'BLOCKED']);
const BLOCK_REASONS = new Set([
  'CAPTURE_DEGRADED',
  'SECRET_EXPOSURE',
  'SANITIZE_FAILED',
  'SKIPPED',
  'GATE_FAILED',
  'AUTH_MISSING',
  'NO_EVENTS',
  'INVALID_EVENT',
  'CANDIDATE_DRIFT',
  'EVALUATOR_NOT_INDEPENDENT',
]);
const CHIEF_DECISIONS = new Set(['PENDING', 'APPROVED', 'REJECTED']);
const DIGEST_RE = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const HASH_RE = /^[a-f0-9]{64}$/;

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function metric(numerator, denominator) {
  if (!isNonNegativeInteger(numerator) || !isNonNegativeInteger(denominator)) {
    return { numerator: null, denominator: null, percent: null, state: 'INVALID' };
  }
  if (denominator === 0) {
    return { numerator, denominator, percent: null, state: 'SEM_DENOMINADOR' };
  }
  return {
    numerator,
    denominator,
    percent: Number(((numerator / denominator) * 100).toFixed(2)),
    state: 'MEASURED',
  };
}

export function parseJsonl(text) {
  const events = [];
  const errors = [];
  String(text ?? '')
    .split(/\r?\n/)
    .forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        events.push(JSON.parse(trimmed));
      } catch (error) {
        errors.push(`JSON_INVALID:${index + 1}:${error.message}`);
      }
    });
  return { events, errors };
}

export function validateEvent(event, index = 0) {
  const problems = [];
  const at = `EVENT_${index + 1}`;
  const requiredStrings = [
    'capsule_id',
    'run_id',
    'mission_id',
    'timestamp_utc',
    'candidate_ref',
    'candidate_digest',
    'baseline_ref',
    'fixture_ref',
    'evaluator_ref',
    'writer',
    'action',
    'evidence_hash',
  ];

  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return [`${at}:NOT_OBJECT`];
  }

  if (event.schema_version !== 1) problems.push(`${at}:SCHEMA_VERSION`);
  for (const field of requiredStrings) {
    if (!asString(event[field])) problems.push(`${at}:REQUIRED_${field.toUpperCase()}`);
  }

  if (!PHASES.has(event.phase)) problems.push(`${at}:PHASE_INVALID`);
  if (!STATUSES.has(event.status)) problems.push(`${at}:STATUS_INVALID`);
  if (!CHIEF_DECISIONS.has(event.chief_decision)) problems.push(`${at}:CHIEF_DECISION_INVALID`);
  if (!isNonNegativeInteger(event.iteration) || event.iteration < 1) problems.push(`${at}:ITERATION_INVALID`);
  if (!DIGEST_RE.test(asString(event.candidate_digest))) problems.push(`${at}:CANDIDATE_DIGEST_INVALID`);
  if (!HASH_RE.test(asString(event.evidence_hash))) problems.push(`${at}:EVIDENCE_HASH_INVALID`);
  if (Number.isNaN(Date.parse(event.timestamp_utc))) problems.push(`${at}:TIMESTAMP_INVALID`);

  const tests = event.tests;
  if (!tests || typeof tests !== 'object' || Array.isArray(tests)) {
    problems.push(`${at}:TESTS_REQUIRED`);
  } else {
    for (const key of ['total', 'pass', 'fail', 'skipped']) {
      if (!isNonNegativeInteger(tests[key])) problems.push(`${at}:TESTS_${key.toUpperCase()}_INVALID`);
    }
    if (
      isNonNegativeInteger(tests.total) &&
      isNonNegativeInteger(tests.pass) &&
      isNonNegativeInteger(tests.fail) &&
      isNonNegativeInteger(tests.skipped) &&
      tests.total !== tests.pass + tests.fail + tests.skipped
    ) {
      problems.push(`${at}:TESTS_DENOMINATOR_MISMATCH`);
    }
  }

  for (const field of [
    'failure_observed',
    'new_failure_class',
    'correction_verified',
    'retained_after_retest',
    'false_green_found',
    'regression_found',
  ]) {
    if (typeof event[field] !== 'boolean') problems.push(`${at}:${field.toUpperCase()}_INVALID`);
  }

  if (event.failure_observed && !asString(event.failure_fingerprint)) {
    problems.push(`${at}:FAILURE_FINGERPRINT_REQUIRED`);
  }
  if (!event.failure_observed && asString(event.failure_fingerprint)) {
    problems.push(`${at}:FAILURE_FINGERPRINT_WITHOUT_FAILURE`);
  }
  if (event.new_failure_class && !event.failure_observed) {
    problems.push(`${at}:NEW_FAILURE_CLASS_WITHOUT_FAILURE`);
  }
  if ((event.correction_verified || event.retained_after_retest) && !asString(event.failure_fingerprint)) {
    problems.push(`${at}:CORRECTION_WITHOUT_FINGERPRINT`);
  }
  if (event.retained_after_retest && !event.correction_verified) {
    problems.push(`${at}:RETENTION_WITHOUT_VERIFIED_CORRECTION`);
  }

  if (event.status === 'BLOCKED') {
    if (!BLOCK_REASONS.has(event.reason)) problems.push(`${at}:BLOCK_REASON_INVALID`);
  } else if (asString(event.reason)) {
    problems.push(`${at}:REASON_ONLY_ALLOWED_FOR_BLOCKED`);
  }

  if (event.status === 'PASS') {
    const testsOk = tests && tests.total > 0 && tests.fail === 0 && tests.skipped === 0 && tests.pass === tests.total;
    if (!testsOk) problems.push(`${at}:PASS_WITHOUT_COMPLETE_TESTS`);
    if (event.false_green_found) problems.push(`${at}:PASS_WITH_FALSE_GREEN`);
    if (event.regression_found) problems.push(`${at}:PASS_WITH_REGRESSION`);
    if (event.phase === 'DECIDE' && asString(event.evaluator_ref) === asString(event.writer)) {
      problems.push(`${at}:PASS_WITHOUT_INDEPENDENT_EVALUATOR`);
    }
  }

  for (const field of ['generalization', 'retention']) {
    const value = event[field];
    if (value == null) continue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      problems.push(`${at}:${field.toUpperCase()}_INVALID`);
      continue;
    }
    if (!isNonNegativeInteger(value.pass) || !isNonNegativeInteger(value.total) || value.pass > value.total) {
      problems.push(`${at}:${field.toUpperCase()}_COUNTS_INVALID`);
    }
  }

  return problems;
}

function latestByTimestamp(events) {
  return [...events].sort((a, b) => {
    const t = Date.parse(a.timestamp_utc) - Date.parse(b.timestamp_utc);
    return t || a.iteration - b.iteration;
  }).at(-1) || null;
}

function currentRunSummary(runEvents) {
  const latest = latestByTimestamp(runEvents);
  const decisions = runEvents.filter((event) => event.phase === 'DECIDE');
  const decision = latestByTimestamp(decisions);
  const tests = decision?.tests || { total: 0, pass: 0, fail: 0, skipped: 0 };
  return {
    run_id: latest?.run_id || null,
    candidate_ref: latest?.candidate_ref || null,
    candidate_digest: latest?.candidate_digest || null,
    baseline_ref: latest?.baseline_ref || null,
    fixture_ref: latest?.fixture_ref || null,
    evaluator_ref: latest?.evaluator_ref || null,
    writer: latest?.writer || null,
    iteration: latest?.iteration || 0,
    status: decision?.status || 'RUNNING',
    reason: decision?.reason || '',
    chief_decision: decision?.chief_decision || 'PENDING',
    tests,
    test_success: metric(tests.pass, tests.total),
    generalization: metric(decision?.generalization?.pass || 0, decision?.generalization?.total || 0),
    retention: metric(decision?.retention?.pass || 0, decision?.retention?.total || 0),
    last_event_at_utc: latest?.timestamp_utc || null,
    decision_event_present: Boolean(decision),
  };
}

export function aggregateCapsule(events, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const parseErrors = Array.isArray(options.parseErrors) ? options.parseErrors : [];
  const validationProblems = [...parseErrors];

  events.forEach((event, index) => validationProblems.push(...validateEvent(event, index)));

  const runs = new Map();
  for (const event of events) {
    const key = asString(event.run_id) || '__invalid__';
    const list = runs.get(key) || [];
    list.push(event);
    runs.set(key, list);
  }

  for (const [runId, runEvents] of runs) {
    const identities = new Set(
      runEvents.map((event) => [
        event.candidate_ref,
        event.candidate_digest,
        event.baseline_ref,
        event.fixture_ref,
        event.evaluator_ref,
        event.writer,
      ].join('|')),
    );
    if (identities.size > 1) validationProblems.push(`RUN_${runId}:IDENTITY_DRIFT`);

    const iterations = new Set();
    for (const event of runEvents) {
      if (iterations.has(event.iteration)) validationProblems.push(`RUN_${runId}:ITERATION_DUPLICATE:${event.iteration}`);
      iterations.add(event.iteration);
    }
  }

  const allFailures = events.filter((event) => event.failure_observed && asString(event.failure_fingerprint));
  const uniqueFailures = new Set(allFailures.map((event) => event.failure_fingerprint));
  const corrected = new Set(
    events
      .filter((event) => event.correction_verified && event.retained_after_retest && asString(event.failure_fingerprint))
      .map((event) => event.failure_fingerprint),
  );
  const newClasses = new Set(
    events
      .filter((event) => event.new_failure_class && asString(event.failure_fingerprint))
      .map((event) => event.failure_fingerprint),
  );
  const xpValid = [...newClasses].filter((fingerprint) => corrected.has(fingerprint)).length;
  const xpRejected = Math.max(0, newClasses.size - xpValid);
  const recurrenceCount = Math.max(0, allFailures.length - uniqueFailures.size);
  const falseGreenCount = events.filter((event) => event.false_green_found).length;
  const regressionCount = events.filter((event) => event.regression_found).length;

  const latest = latestByTimestamp(events);
  const latestRunEvents = latest ? (runs.get(latest.run_id) || []) : [];
  const runSummary = currentRunSummary(latestRunEvents);

  let status = 'RUNNING';
  let reason = '';
  if (events.length === 0) {
    status = 'BLOCKED';
    reason = 'NO_EVENTS';
  } else if (validationProblems.length > 0) {
    status = 'BLOCKED';
    reason = validationProblems.some((problem) => problem.includes('IDENTITY_DRIFT'))
      ? 'CANDIDATE_DRIFT'
      : 'INVALID_EVENT';
  } else if (!runSummary.decision_event_present) {
    status = 'RUNNING';
  } else {
    status = runSummary.status;
    reason = runSummary.reason;
  }

  const readyForPromotion =
    status === 'PASS' &&
    runSummary.chief_decision === 'APPROVED' &&
    falseGreenCount === 0 &&
    regressionCount === 0 &&
    validationProblems.length === 0;

  return {
    schema_version: 1,
    generated_at_utc: generatedAt,
    source: {
      event_count: events.length,
      run_count: runs.size,
      kind: events.length ? 'CAPSULE_EVENT_JSONL' : 'NO_EVENTS',
    },
    capsule: {
      status,
      reason,
      production: 'UNTOUCHED',
      ready_for_promotion: readyForPromotion,
      current_run: runSummary,
    },
    learning: {
      failures_observed: allFailures.length,
      unique_failure_classes: uniqueFailures.size,
      repeated_failures: recurrenceCount,
      corrections_verified_and_retained: corrected.size,
      xp_valid: xpValid,
      xp_rejected: xpRejected,
      false_green_count: falseGreenCount,
      regression_count: regressionCount,
      correction_rate: metric(corrected.size, uniqueFailures.size),
      recurrence_rate: metric(recurrenceCount, allFailures.length),
    },
    guarantees: {
      no_percentage_without_denominator: true,
      skipped_never_counts_as_pass: true,
      same_identity_per_run: validationProblems.every((problem) => !problem.includes('IDENTITY_DRIFT')),
      independent_evaluator_required_for_decision_pass: true,
      production_not_authorized_by_snapshot: true,
    },
    validation: {
      verdict: validationProblems.length ? 'FAIL' : 'PASS',
      problems: validationProblems,
    },
  };
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function atomicWrite(path, content) {
  const absolute = resolve(path);
  const temp = `${absolute}.tmp-${process.pid}`;
  writeFileSync(temp, content, { encoding: 'utf8', mode: 0o600 });
  chmodSync(temp, 0o600);
  renameSync(temp, absolute);
}

function readLedger(path) {
  if (!existsSync(path)) return { events: [], errors: [] };
  return parseJsonl(readFileSync(path, 'utf8'));
}

function appendEventAtomically({ ledgerPath, eventPath }) {
  const existing = readLedger(ledgerPath);
  if (existing.errors.length) throw new Error(`LEDGER_INVALID:${existing.errors.join('|')}`);
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const eventProblems = validateEvent(event, existing.events.length);
  if (eventProblems.length) throw new Error(`EVENT_REJECTED:${eventProblems.join('|')}`);

  const candidate = [...existing.events, event];
  const snapshot = aggregateCapsule(candidate);
  if (snapshot.validation.verdict !== 'PASS') {
    throw new Error(`LEDGER_REJECTED:${snapshot.validation.problems.join('|')}`);
  }

  const content = candidate.map((item) => JSON.stringify(item)).join('\n') + '\n';
  atomicWrite(ledgerPath, content);
  return snapshot;
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const ledgerPath = args.ledger || args.input;
  const outputPath = args.output;

  let snapshot;
  if (args['append-event']) {
    if (!ledgerPath) throw new Error('LEDGER_REQUIRED');
    snapshot = appendEventAtomically({ ledgerPath, eventPath: args['append-event'] });
  } else {
    const parsed = ledgerPath ? readLedger(ledgerPath) : { events: [], errors: [] };
    snapshot = aggregateCapsule(parsed.events, { parseErrors: parsed.errors });
  }

  if (outputPath) atomicWrite(outputPath, stableStringify(snapshot));
  process.stdout.write(stableStringify(snapshot));
  if (snapshot.validation.verdict !== 'PASS') process.exitCode = 1;
  return snapshot;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`CAPSULA_ERROR=${error.message}\n`);
    process.exit(1);
  }
}
