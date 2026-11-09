// #OBSERVACOES# | CENTRALDARK.CODE.DOC.SYNC
// @owner: scripts/memory-linker/dream-review-run.mjs
// @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
// @last_updated: 2026-10-28T00:17:22.807Z
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDreamProposal } from './dream-review.mjs';
import { buildDreamReviewWithPatterns } from './dream-review-run.mjs';
import { runMetacognitiveMetabolism, METABOLIC_PROBE_IDS } from './metacognitive-metabolism.mjs';

const HEAD = 'a'.repeat(40);
function event(n, extra = {}) {
  return {
    event_time: '2026-10-27T18:00:00Z',
    observed_at: '2026-10-27T18:05:00Z',
    source: 'test:measured:' + n,
    source_class: 'TOOL_MEASURED',
    session_id: 'session:' + n,
    head_sha: HEAD,
    kind: 'RULE',
    target: 'docs/CONSCIENCIA/APRENDIZADOS.md',
    claim: 'Ensure measurable feedback ' + n,
    learning_delta: 'Reuse verified learning pattern ' + n,
    evidence: [{ type: 'TEST', ref: 'test-' + n, verified: true, status: 'PASS' }],
    owner_evidence: [{ type: 'OWNER', ref: 'existing-owner', verified: true, status: 'PASS' }],
    consumer_evidence: [{ type: 'TEST', ref: 'consumer-test', verified: true, status: 'PASS' }],
    ...extra,
  };
}
function experiment() {
  return {
    treatment: { before: { passed: 3, total: 10 }, after: { passed: 8, total: 10 } },
    control: { before: { passed: 2, total: 10 }, after: { passed: 3, total: 10 } },
    holdout: { before: { passed: 1, total: 5 }, after: { passed: 3, total: 5 } },
    critical_regressions: 0,
    evidence_refs: ['test:holdout-independent', 'test:regression'],
    before_ref: 'before-sha', after_ref: 'after-sha',
  };
}
function sample() {
  return buildDreamProposal([event(1), event(2), event(1, {
    source: 'test:other-origin', session_id: 'session:repeat',
  })], { headSha: HEAD });
}
const fixture = sample();
const rich = runMetacognitiveMetabolism(fixture, {
  allowedTargets: ['docs/CONSCIENCIA/APRENDIZADOS.md'],
  experiment: experiment(),
});

test('registry has 50 distinct, ordered measurable functions', () => {
  assert.equal(METABOLIC_PROBE_IDS.length, 50);
  assert.equal(new Set(METABOLIC_PROBE_IDS).size, 50);
  assert.equal(rich.probe_count, 50);
  assert.equal(rich.observed_probe_count, 50);
  assert.equal(rich.unknown_probe_count, 0);
});

for (const id of METABOLIC_PROBE_IDS) {
  test('functional probe ' + id, () => {
    assert.ok(Object.hasOwn(rich.signals, id));
    assert.notEqual(rich.signals[id], null);
    assert.notEqual(rich.signals[id], undefined);
    assert.ok(typeof rich.signals[id] === 'string' ||
      typeof rich.signals[id] === 'number' || typeof rich.signals[id] === 'boolean');
  });
}

test('deduplication, provenance, scope and feedback are actually computed', () => {
  assert.equal(rich.signals.S01_ACCEPTED_EVENTS, 3);
  assert.equal(rich.signals.S05_CANDIDATES, 2);
  assert.equal(rich.signals.N06_DUPLICATE_EVENTS, 1);
  assert.equal(rich.signals.P17_UNIQUE_SESSIONS, 3);
  assert.equal(rich.signals.V22_VERIFIED_OWNER, 2);
  assert.equal(rich.signals.V23_VERIFIED_CONSUMER, 2);
  assert.equal(rich.signals.G48_SCOPED_ELIGIBLE, 2);
  assert.equal(rich.signals.G49_SUGGESTED_ACTION, 'META_LUPA_CAUSAL_REVIEW');
  assert.equal(rich.automatic_canonical_promotion, false);
  assert.equal(rich.proposal_only, true);
});

test('control correction measures gain without promoting unsupported truth', () => {
  assert.ok(Math.abs(rich.signals.C43_CONTROL_CORRECTED_GAIN - 0.4) < 1e-9);
  assert.ok(Math.abs(rich.signals.C44_HOLDOUT_GAIN - 0.4) < 1e-9);
  assert.equal(rich.signals.G47_CAUSAL_CANDIDATE, true);
  assert.equal(rich.causal_claim, 'DECLARED_MEASUREMENTS_NEED_INDEPENDENT_VERIFICATION');
});

test('negative control: apparent improvement explained entirely by environment is rejected', () => {
  const x = experiment();
  x.control.after.passed = 7;
  const out = runMetacognitiveMetabolism(fixture, { experiment: x });
  assert.ok(Math.abs(out.signals.C43_CONTROL_CORRECTED_GAIN) < 1e-9);
  assert.equal(out.signals.G47_CAUSAL_CANDIDATE, false);
});

test('critical regressions veto positive treatment', () => {
  const x = experiment();
  x.critical_regressions = 1;
  const out = runMetacognitiveMetabolism(fixture, { experiment: x });
  assert.equal(out.signals.G47_CAUSAL_CANDIDATE, false);
});

test('negative holdout reverses causal candidacy', () => {
  const x = experiment();
  x.holdout.after.passed = 0;
  const out = runMetacognitiveMetabolism(fixture, { experiment: x });
  assert.equal(out.signals.G47_CAUSAL_CANDIDATE, false);
});

test('invalid denominator and invalid evidence are fail-closed', () => {
  const x = experiment(); x.treatment.after.total = 0;
  assert.throws(() => runMetacognitiveMetabolism(fixture, { experiment: x }), /DENOMINATOR/);
  const y = experiment(); y.evidence_refs = null;
  assert.throws(() => runMetacognitiveMetabolism(fixture, { experiment: y }), /EVIDENCE/);
});

test('resource exhaustion clamps recommended action without deleting raw events', () => {
  const out = runMetacognitiveMetabolism(fixture, { maxCandidates: 1 });
  assert.equal(out.signals.E39_OVER_BUDGET, true);
  assert.equal(out.action, 'LIMIT_INPUT');
  assert.equal(out.signals.S01_ACCEPTED_EVENTS, 3);
});

test('repeat learning fingerprint produces NO_NEW_INFORMATION', () => {
  const original = runMetacognitiveMetabolism(fixture);
  const out = runMetacognitiveMetabolism(fixture, {
    previousDigest: original.signals.N10_LEARNING_FINGERPRINT,
  });
  assert.equal(out.action, 'NO_NEW_INFORMATION');
});

test('same input deterministic receipt, material change new receipt', () => {
  const a = runMetacognitiveMetabolism(fixture);
  const b = runMetacognitiveMetabolism(fixture);
  assert.equal(a.receipt_sha256, b.receipt_sha256);
  const c = runMetacognitiveMetabolism(buildDreamProposal([event(1)], { headSha: HEAD }));
  assert.notEqual(a.receipt_sha256, c.receipt_sha256);
});

test('unknown experiment remains unknown, not false PASS', () => {
  const out = runMetacognitiveMetabolism(fixture);
  assert.equal(out.signals.C43_CONTROL_CORRECTED_GAIN, null);
  assert.equal(out.signals.G47_CAUSAL_CANDIDATE, null);
  assert.equal(out.causal_claim, 'UNPROVEN');
});

test('external-only source remains quarantine and cannot promote', () => {
  const p = buildDreamProposal([event(1, {
    source: 'https://example.invalid/malicious', source_class: 'HUMAN_AUTHORITY',
  })], { headSha: HEAD });
  const out = runMetacognitiveMetabolism(p, {
    allowedTargets: ['docs/CONSCIENCIA/APRENDIZADOS.md'],
  });
  assert.equal(out.signals.P20_QUARANTINED, 1);
  assert.equal(out.signals.P18_SOURCE_CLASS_CLAMPS, 1);
  assert.equal(out.signals.G48_SCOPED_ELIGIBLE, 0);
  assert.equal(out.action, 'QUARANTINE_REVIEW');
});

test('invalid proposal cannot bypass existing Dream Review gate', () => {
  assert.throws(() => runMetacognitiveMetabolism({
    ...fixture, apply_allowed: true,
  }), /DREAM_PROPOSAL_INVALID/);
});

test('real Dream Review runner consumes all fifty probes without another engine', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], { headSha: HEAD });
  assert.equal(proposal.metacognitive_metabolism.probe_count, 50);
  assert.equal(proposal.metacognitive_metabolism.head_sha, HEAD);
  assert.equal(proposal.metacognitive_metabolism.signals.S01_ACCEPTED_EVENTS, 2);
  assert.equal(proposal.metacognitive_metabolism.automatic_canonical_promotion, false);
});

test('new independent corroboration changes fingerprint even when lesson text is same', () => {
  const first = buildDreamProposal([event(1)], { headSha: HEAD });
  const second = buildDreamProposal([
    event(1),
    event(1, { source: 'test:second-independent-sensor', session_id: 'second-session' }),
  ], { headSha: HEAD });
  const a = runMetacognitiveMetabolism(first);
  const b = runMetacognitiveMetabolism(second, { previousDigest: a.signals.N10_LEARNING_FINGERPRINT });
  assert.notEqual(a.signals.N10_LEARNING_FINGERPRINT, b.signals.N10_LEARNING_FINGERPRINT);
  assert.notEqual(b.action, 'NO_NEW_INFORMATION');
});
