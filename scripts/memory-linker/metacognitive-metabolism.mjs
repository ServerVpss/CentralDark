// #OBSERVACOES# | CENTRALDARK.CODE.DOC.SYNC
// @owner: scripts/memory-linker/dream-review-run.mjs
// @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
// @last_updated: 2026-10-28T00:17:22.807Z
// CentralDark: fifty deterministic operational metacognition probes.
// Read-only component of the EXISTING memory-linker pipeline, not a second brain.
// A derived metric or hash is NOT independent proof of a real-world claim.
import { sha256Stable } from './delta-core.mjs';
import { validateDreamProposal } from './dream-review.mjs';

const count = (items) => Array.isArray(items) ? items.length : 0;
const unique = (items) => new Set(items).size;
const ratio = (a, b) => b > 0 ? a / b : 0;
const tally = (items, predicate) => items.filter(predicate).length;
const rate = (pair) => pair.passed / pair.total;
const asArray = (v) => Array.isArray(v) ? v : [];
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const nonneg = (v) => Number.isInteger(v) && v >= 0;
const sum = (items, fn) => items.reduce((n, v) => n + fn(v), 0);
const present = (v) => typeof v === 'string' && v.trim().length > 0;

// History and current proposals share this digest: stronger proof can change it.
export function learningFingerprint(candidates = []) {
  return sha256Stable(candidates.map(x => ({
    fingerprint: x.fingerprint,
    observations: x.observations,
    sources: asArray(x.sources).slice().sort(),
    sessions: asArray(x.session_ids).slice().sort(),
    owner: x.verified_owner_evidence_count ?? 0,
    consumer: x.verified_consumer_evidence_count ?? 0,
    eligible: x.promotion?.auto_absorb_eligible === true,
  })).sort((a,b) => String(a.fingerprint).localeCompare(String(b.fingerprint))));
}

function validateExperiment(experiment) {
  if (experiment == null) return null;
  if (!experiment || typeof experiment !== 'object' || Array.isArray(experiment)) {
    throw new TypeError('EXPERIMENT_INVALID');
  }
  for (const group of ['treatment', 'control', 'holdout']) {
    for (const phase of ['before', 'after']) {
      const x = experiment[group]?.[phase];
      if (!x || !Number.isInteger(x.total) || x.total <= 0 ||
        !nonneg(x.passed) || x.passed > x.total) {
        throw new TypeError('EXPERIMENT_DENOMINATOR_INVALID:' + group + ':' + phase);
      }
    }
    if (experiment[group].before.total !== experiment[group].after.total) {
      throw new TypeError('EXPERIMENT_DENOMINATOR_DRIFT:' + group);
    }
  }
  if (!nonneg(experiment.critical_regressions)) throw new TypeError('EXPERIMENT_REGRESSIONS_INVALID');
  if (!present(experiment.before_ref) || !present(experiment.after_ref) ||
    experiment.before_ref === experiment.after_ref) {
    throw new TypeError('EXPERIMENT_REFS_INVALID');
  }
  if (!Array.isArray(experiment.evidence_refs) ||
    !experiment.evidence_refs.every(present)) {
    throw new TypeError('EXPERIMENT_EVIDENCE_REFS_INVALID');
  }
  return experiment;
}

function contextFrom(proposal, options) {
  const validation = validateDreamProposal(proposal);
  if (!validation.ok) throw new TypeError('DREAM_PROPOSAL_INVALID:' + validation.errors.join(','));
  const maxCandidates = options.maxCandidates ?? 1000;
  const maxEvents = options.maxEvents ?? 20000;
  if (!Number.isInteger(maxCandidates) || maxCandidates <= 0 ||
    !Number.isInteger(maxEvents) || maxEvents <= 0) {
    throw new TypeError('RESOURCE_BUDGET_INVALID');
  }
  const knownFingerprints = options.knownFingerprints ?? [];
  const allowedTargets = options.allowedTargets ?? [];
  if (!Array.isArray(knownFingerprints) || !knownFingerprints.every(present) ||
    !Array.isArray(allowedTargets) || !allowedTargets.every(present)) {
    throw new TypeError('CONTEXT_LIST_INVALID');
  }
  return {
    p: proposal,
    candidates: proposal.candidates,
    patterns: asArray(proposal.pattern_discovery?.patterns),
    queue: asArray(proposal.pattern_discovery?.autonomy_queue),
    known: new Set(knownFingerprints),
    allowed: new Set(allowedTargets),
    experiment: validateExperiment(options.experiment),
    maxCandidates, maxEvents,
    previousDigest: options.previousDigest ?? null,
  };
}

// Ten interlinked domains x five executable probes = fifty measured functions.
// Dependent probes receive outputs of earlier probes, ensuring one ordered DAG.
const PROBES = [
  ['S01_ACCEPTED_EVENTS', c => c.p.accepted_event_count ?? 0],
  ['S02_REJECTED_EVENTS', c => c.p.rejected_event_count ?? 0],
  ['S03_REJECTION_RATE', (c,s) => ratio(s.S02_REJECTED_EVENTS, s.S01_ACCEPTED_EVENTS + s.S02_REJECTED_EVENTS)],
  ['S04_OBSERVATIONS', c => sum(c.candidates, x => x.observations ?? 0)],
  ['S05_CANDIDATES', c => count(c.candidates)],

  ['N06_DUPLICATE_EVENTS', (c,s) => Math.max(0, s.S04_OBSERVATIONS - s.S05_CANDIDATES)],
  ['N07_DISTINCT_FINGERPRINTS', c => unique(c.candidates.map(x => x.fingerprint))],
  ['N08_DISTINCT_TARGETS', c => unique(c.candidates.map(x => x.target))],
  ['N09_DISTINCT_KINDS', c => unique(c.candidates.map(x => x.kind))],
  ['N10_LEARNING_FINGERPRINT', c => learningFingerprint(c.candidates)],

  ['T11_FIRST_OBSERVED', c => c.candidates.map(x => x.first_seen).filter(present).sort()[0] ?? null],
  ['T12_LAST_OBSERVED', c => c.candidates.map(x => x.last_seen).filter(present).sort().at(-1) ?? null],
  ['T13_SPAN_HOURS', (c,s) => s.T11_FIRST_OBSERVED && s.T12_LAST_OBSERVED
    ? (Date.parse(s.T12_LAST_OBSERVED) - Date.parse(s.T11_FIRST_OBSERVED)) / 3600000 : null],
  ['T14_TIME_REVERSALS', c => tally(c.candidates, x => x.first_seen > x.last_seen || x.first_event_time > x.last_event_time)],
  ['T15_TEMPORAL_GAPS', c => tally(c.candidates, x => !present(x.first_seen) || !present(x.last_seen))],

  ['P16_UNIQUE_SOURCES', c => unique(c.candidates.flatMap(x => asArray(x.sources)))],
  ['P17_UNIQUE_SESSIONS', c => unique(c.candidates.flatMap(x => asArray(x.session_ids)))],
  ['P18_SOURCE_CLASS_CLAMPS', c => sum(c.candidates, x => x.source_class_clamped_count ?? 0)],
  ['P19_EXTERNAL_ONLY', c => tally(c.candidates, x => asArray(x.source_classes).length > 0 &&
    x.source_classes.every(v => v === 'EXTERNAL_UNTRUSTED'))],
  ['P20_QUARANTINED', c => tally(c.candidates, x => x.promotion?.status === 'QUARANTINE')],

  ['V21_MEASURED_SOURCE', c => tally(c.candidates, x => asArray(x.source_classes).includes('TOOL_MEASURED'))],
  ['V22_VERIFIED_OWNER', c => tally(c.candidates, x => x.owner_reachability === 'EVIDENCED')],
  ['V23_VERIFIED_CONSUMER', c => tally(c.candidates, x => x.consumer_reachability === 'EVIDENCED')],
  ['V24_MULTI_SOURCE', c => tally(c.candidates, x => count(x.sources) > 1)],
  ['V25_MULTI_SESSION', c => tally(c.candidates, x => count(x.session_ids) > 1)],

  ['M26_REUSED_LESSONS', c => tally(c.candidates, x => c.known.has(x.fingerprint))],
  ['M27_NEW_LESSONS', (c,s) => s.S05_CANDIDATES - s.M26_REUSED_LESSONS],
  ['M28_NOVELTY_RATIO', (c,s) => ratio(s.M27_NEW_LESSONS, s.S05_CANDIDATES)],
  ['M29_RECURRING_LESSONS', c => tally(c.candidates, x => x.observations > 1)],
  ['M30_MAX_RECURRENCE', c => Math.max(0, ...c.candidates.map(x => x.observations ?? 0))],

  ['R31_PATTERNS', c => c.patterns.length],
  ['R32_PATTERN_MEMBERS', c => sum(c.patterns, x => count(x.member_candidate_ids))],
  ['R33_PATTERN_COVERED', c => unique(c.patterns.flatMap(x => asArray(x.member_candidate_ids)))],
  ['R34_PATTERN_COVERAGE', (c,s) => ratio(s.R33_PATTERN_COVERED, s.S05_CANDIDATES)],
  ['R35_AUTONOMY_HANDOFFS', c => c.queue.length],

  ['E36_WORK_UNITS', (c,s) => s.S01_ACCEPTED_EVENTS + 2*s.S05_CANDIDATES + 3*s.R31_PATTERNS],
  ['E37_CANDIDATE_BUDGET_LEFT', (c,s) => c.maxCandidates - s.S05_CANDIDATES],
  ['E38_EVENT_BUDGET_LEFT', (c,s) => c.maxEvents - s.S01_ACCEPTED_EVENTS],
  ['E39_OVER_BUDGET', (c,s) => s.E37_CANDIDATE_BUDGET_LEFT < 0 || s.E38_EVENT_BUDGET_LEFT < 0],
  ['E40_LEARNING_DENSITY', (c,s) => ratio(s.M27_NEW_LESSONS, s.E36_WORK_UNITS)],

  ['C41_TREATMENT_DELTA', c => c.experiment ? rate(c.experiment.treatment.after) - rate(c.experiment.treatment.before) : null],
  ['C42_CONTROL_DELTA', c => c.experiment ? rate(c.experiment.control.after) - rate(c.experiment.control.before) : null],
  ['C43_CONTROL_CORRECTED_GAIN', (c,s) => c.experiment ? s.C41_TREATMENT_DELTA - s.C42_CONTROL_DELTA : null],
  ['C44_HOLDOUT_GAIN', c => c.experiment ? rate(c.experiment.holdout.after) - rate(c.experiment.holdout.before) : null],
  ['C45_CRITICAL_REGRESSIONS', c => c.experiment ? c.experiment.critical_regressions : null],

  ['G46_EVIDENCE_REFS', c => c.experiment ? c.experiment.evidence_refs.length : null],
  ['G47_CAUSAL_CANDIDATE', (c,s) => c.experiment ? Boolean(s.C43_CONTROL_CORRECTED_GAIN > 1e-12 &&
    s.C44_HOLDOUT_GAIN >= 0 && s.C45_CRITICAL_REGRESSIONS === 0 &&
    s.G46_EVIDENCE_REFS > 0 && !s.E39_OVER_BUDGET) : null],
  ['G48_SCOPED_ELIGIBLE', c => tally(c.candidates, x => x.promotion?.auto_absorb_eligible === true &&
    c.allowed.has(x.target))],
  ['G49_SUGGESTED_ACTION', (c,s) => s.E39_OVER_BUDGET ? 'LIMIT_INPUT' :
    c.previousDigest === s.N10_LEARNING_FINGERPRINT ? 'NO_NEW_INFORMATION' :
    s.S05_CANDIDATES === 0 ? 'STOP_NO_NEW_INFORMATION' :
    s.P20_QUARANTINED === s.S05_CANDIDATES ? 'QUARANTINE_REVIEW' :
    s.G47_CAUSAL_CANDIDATE === true ? 'META_LUPA_CAUSAL_REVIEW' :
    s.G48_SCOPED_ELIGIBLE > 0 ? 'EXISTING_WRITER_HANDOFF' : 'COLLECT_EVIDENCE'],
  ['G50_NEXT_CURSOR', (c,s) => ({
    LIMIT_INPUT: 'REDUCE_INPUT_WITHOUT_DROPPING_RAW_EVIDENCE',
    NO_NEW_INFORMATION: 'STOP_DUPLICATE_REPLAY',
    STOP_NO_NEW_INFORMATION: 'WAIT_FOR_MATERIAL_DELTA',
    QUARANTINE_REVIEW: 'OBTAIN_INDEPENDENT_SOURCE',
    META_LUPA_CAUSAL_REVIEW: 'INDEPENDENT_COUNTERPROOF_THEN_EXISTING_EVOLUTION_GATE',
    EXISTING_WRITER_HANDOFF: 'SAME_HEAD_OWNER_SCOPE_GATE_VIA_EXISTING_PIPELINE',
    COLLECT_EVIDENCE: 'MEASURE_OWNER_CONSUMER_HOLDOUT_AND_REGRESSIONS',
  })[s.G49_SUGGESTED_ACTION]],
];

export const METABOLIC_PROBE_IDS = Object.freeze(PROBES.map(([id]) => id));
if (METABOLIC_PROBE_IDS.length !== 50 || unique(METABOLIC_PROBE_IDS) !== 50) {
  throw new Error('METABOLIC_PROBE_REGISTRY_INVALID');
}

export function runMetacognitiveMetabolism(proposal, options = {}) {
  const ctx = contextFrom(proposal, options);
  const signals = {};
  for (const [id, evaluate] of PROBES) {
    const value = evaluate(ctx, signals);
    if (typeof value === 'number' && !finite(value)) throw new Error('NONFINITE_METRIC:' + id);
    signals[id] = value;
  }
  const snapshot = {
    schema_version: 1,
    mode: 'METACOGNITION_OPERATIONAL_MEASUREMENT',
    head_sha: proposal.head_sha,
    input_digest: sha256Stable({ head: proposal.head_sha, source: proposal.source_digest }),
    probe_count: PROBES.length,
    observed_probe_count: Object.values(signals).filter(v => v !== null).length,
    unknown_probe_count: Object.values(signals).filter(v => v === null).length,
    signals,
    action: signals.G49_SUGGESTED_ACTION,
    next_cursor: signals.G50_NEXT_CURSOR,
    causal_claim: ctx.experiment ? 'DECLARED_MEASUREMENTS_NEED_INDEPENDENT_VERIFICATION' : 'UNPROVEN',
    feedback_changes_weights: false,
    automatic_canonical_promotion: false,
    proposal_only: true,
  };
  return { ...snapshot, receipt_sha256: sha256Stable(snapshot) };
}
