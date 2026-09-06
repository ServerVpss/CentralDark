#!/usr/bin/env node

function norm(value) {
  return String(value ?? '').trim();
}

function normBool(value) {
  return value === true;
}

function isSameOrChild(scope, requested) {
  const a = norm(scope).replace(/\\/g, '/').replace(/\/+$/g, '');
  const b = norm(requested).replace(/\\/g, '/').replace(/\/+$/g, '');
  if (!a || !b) return false;
  return b === a || b.startsWith(`${a}/`);
}

export function evaluateScopeLock(input = {}) {
  const lockReady = [
    'fixed_point_proven',
    'semantic_green',
    'multibussola_axis_aligned',
    'counterproof_pass',
    'reality_judge_pass',
    'ci_same_head_pass',
    'decision_lineage_reconstructible',
    'last_good_state_recorded',
  ].every((key) => normBool(input[key]));

  const lockedScope = norm(input.locked_scope);
  const requestedScope = norm(input.requested_scope);
  const mutationRequested = normBool(input.mutation_requested);
  const explicitChefeIntent = normBool(input.explicit_chefe_intent);
  const warningShown = normBool(input.lock_warning_shown);
  const warningAcknowledged = normBool(input.chefe_acknowledged_lock_warning);
  const liveStateRemeasured = normBool(input.live_state_remeasured);
  const ownerReconfirmed = normBool(input.owner_reconfirmed);
  const writerScopeReconfirmed = normBool(input.writer_scope_reconfirmed);

  const result = {
    schema: 'centraldark.scope-lock-result.v1',
    lock_ready: lockReady,
    locked_scope: lockedScope || null,
    requested_scope: requestedScope || null,
    mutation_requested: mutationRequested,
    verdict: 'OPEN',
    allow_mutation: true,
    preserve_last_good_state: true,
    warning_required: false,
    reasons: [],
  };

  if (!lockReady) {
    result.verdict = 'OPEN_NOT_FIXED_POINT_LOCKED';
    return result;
  }

  if (!mutationRequested) {
    result.verdict = 'LOCKED_READ_ONLY';
    result.allow_mutation = false;
    return result;
  }

  if (!isSameOrChild(lockedScope, requestedScope)) {
    result.verdict = 'OUTSIDE_LOCK_SCOPE';
    result.allow_mutation = true;
    return result;
  }

  if (!explicitChefeIntent) {
    result.verdict = 'DENY_LOCKED';
    result.allow_mutation = false;
    result.warning_required = true;
    result.reasons.push('EXPLICIT_CHEFE_INTENT_REQUIRED');
    return result;
  }

  const overrideChecks = [
    ['LOCK_WARNING_SHOWN', warningShown],
    ['CHEFE_ACKNOWLEDGED_LOCK_WARNING', warningAcknowledged],
    ['LIVE_STATE_REMEASURED', liveStateRemeasured],
    ['OWNER_RECONFIRMED', ownerReconfirmed],
    ['WRITER_SCOPE_RECONFIRMED', writerScopeReconfirmed],
  ];

  const missing = overrideChecks.filter(([, ok]) => !ok).map(([name]) => name);
  if (missing.length) {
    result.verdict = 'WARN_EXPLICIT_OVERRIDE';
    result.allow_mutation = false;
    result.warning_required = true;
    result.reasons.push(...missing);
    return result;
  }

  result.verdict = 'UNLOCKED_CANDIDATE';
  result.allow_mutation = true;
  result.warning_required = false;
  result.new_truth = false;
  result.previous_last_good_state_preserved = true;
  return result;
}

function assert(condition, name) {
  if (!condition) throw new Error(`SELF_TEST_FAIL:${name}`);
}

export function runSelfTest() {
  const base = {
    fixed_point_proven: true,
    semantic_green: true,
    multibussola_axis_aligned: true,
    counterproof_pass: true,
    reality_judge_pass: true,
    ci_same_head_pass: true,
    decision_lineage_reconstructible: true,
    last_good_state_recorded: true,
    locked_scope: 'apps/modulos/HERMES-CORE',
    requested_scope: 'apps/modulos/HERMES-CORE/core',
  };

  const readOnly = evaluateScopeLock({ ...base, mutation_requested: false });
  assert(readOnly.verdict === 'LOCKED_READ_ONLY' && !readOnly.allow_mutation, 'LOCKS_AFTER_GREEN');

  const silentMutation = evaluateScopeLock({ ...base, mutation_requested: true });
  assert(silentMutation.verdict === 'DENY_LOCKED' && silentMutation.warning_required, 'SILENT_MUTATION_DENIED');

  const explicitNoAck = evaluateScopeLock({ ...base, mutation_requested: true, explicit_chefe_intent: true });
  assert(explicitNoAck.verdict === 'WARN_EXPLICIT_OVERRIDE' && !explicitNoAck.allow_mutation, 'EXPLICIT_REOPEN_WARNS');

  const reopened = evaluateScopeLock({
    ...base,
    mutation_requested: true,
    explicit_chefe_intent: true,
    lock_warning_shown: true,
    chefe_acknowledged_lock_warning: true,
    live_state_remeasured: true,
    owner_reconfirmed: true,
    writer_scope_reconfirmed: true,
  });
  assert(reopened.verdict === 'UNLOCKED_CANDIDATE' && reopened.allow_mutation, 'ACKNOWLEDGED_REOPEN_ALLOWED_AS_CANDIDATE');
  assert(reopened.previous_last_good_state_preserved === true && reopened.new_truth === false, 'LAST_GOOD_STATE_PRESERVED');

  const outside = evaluateScopeLock({ ...base, requested_scope: 'docs/OTHER', mutation_requested: true });
  assert(outside.verdict === 'OUTSIDE_LOCK_SCOPE' && outside.allow_mutation, 'OTHER_SCOPE_NOT_BLOCKED');

  const notReady = evaluateScopeLock({ ...base, ci_same_head_pass: false, mutation_requested: true });
  assert(notReady.verdict === 'OPEN_NOT_FIXED_POINT_LOCKED', 'CI_ALONE_OR_MISSING_GATE_NO_LOCK');

  return {
    schema: 'centraldark.scope-lock-self-test.v1',
    ok: true,
    cases: {
      lock_after_green: readOnly.verdict,
      silent_mutation: silentMutation.verdict,
      explicit_without_ack: explicitNoAck.verdict,
      explicit_with_ack: reopened.verdict,
      other_scope: outside.verdict,
      missing_same_head: notReady.verdict,
    },
  };
}

function main() {
  try {
    if (process.argv.includes('--self-test')) {
      console.log(JSON.stringify(runSelfTest(), null, 2));
      console.log('SCOPE_LOCK_SELF_TEST=PASS');
      return;
    }

    const idx = process.argv.indexOf('--input-json');
    if (idx >= 0) {
      const raw = process.argv[idx + 1];
      if (!raw) throw new Error('INPUT_JSON_MISSING');
      const result = evaluateScopeLock(JSON.parse(raw));
      console.log(JSON.stringify(result, null, 2));
      if (result.mutation_requested && !result.allow_mutation) process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify({
      schema: 'centraldark.scope-lock-cli.v1',
      usage: 'node apps/modulos/HERMES-CORE/core/scope-lock-gate.mjs --self-test | --input-json <json>',
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    process.exitCode = 1;
  }
}

main();
