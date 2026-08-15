const FREQUENCIES = new Set(['LEVE', 'RAPIDA', 'MEDIA', 'PROFUNDA', 'FORTE', 'AVANCADA', 'FRIA', 'ORQUESTRA']);
const VERDICTS = new Set(['PASS', 'FAIL', 'UNKNOWN']);

const requiredText = (value, name) => {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} must be non-empty text`);
  return value.trim();
};

const normalizeEvidence = (evidence) => {
  const list = Array.isArray(evidence) ? evidence : [evidence];
  const normalized = list.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  if (normalized.length === 0) throw new TypeError('evidence must contain at least one observable reference');
  return normalized;
};

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) throw new TypeError('skills must be an array');
  return [...new Set(skills.map((item) => requiredText(item, 'skill')))];
};

export function decideFrequency({
  selected,
  previous_frequency = null,
  reason,
  evidence,
  budget = 'UNKNOWN',
  escalation_trigger = null,
  deescalation_trigger = null,
  outcome = 'PENDING',
  engine = 'UNKNOWN',
  material_delta = false,
  cooldown_elapsed = true,
  safety_override = false,
}) {
  if (!FREQUENCIES.has(selected)) throw new TypeError(`unknown selected frequency: ${selected}`);
  if (previous_frequency !== null && !FREQUENCIES.has(previous_frequency)) {
    throw new TypeError(`unknown previous frequency: ${previous_frequency}`);
  }

  const requestedChange = previous_frequency !== null && previous_frequency !== selected;
  const safetyChange = safety_override === true && selected === 'FRIA';
  const changeAllowed = !requestedChange || safetyChange || (material_delta === true && cooldown_elapsed === true);
  const applied = changeAllowed ? selected : previous_frequency;

  return Object.freeze({
    selected: applied,
    requested_frequency: selected,
    reason: requiredText(reason, 'reason'),
    evidence: normalizeEvidence(evidence),
    budget,
    escalation_trigger,
    deescalation_trigger,
    previous_frequency,
    outcome,
    engine: requiredText(engine, 'engine'),
    material_delta: material_delta === true,
    cooldown_elapsed: cooldown_elapsed === true,
    switch_applied: requestedChange ? changeAllowed : false,
    switch_blocked_by_hysteresis: requestedChange && !changeAllowed,
  });
}

export function recordEngineFitness({
  engine,
  frequency,
  latency_ms,
  cost = 'UNKNOWN',
  correctness,
  counterproof_success,
  retries,
  context_usage = 'UNKNOWN',
  false_green_rate = 'UNKNOWN',
  comparable_sample = false,
}) {
  if (!FREQUENCIES.has(frequency)) throw new TypeError(`unknown frequency: ${frequency}`);
  if (!Number.isFinite(latency_ms) || latency_ms < 0) throw new TypeError('latency_ms must be >= 0');
  if (!Number.isInteger(retries) || retries < 0) throw new TypeError('retries must be a non-negative integer');
  if (!VERDICTS.has(correctness)) throw new TypeError('correctness must be PASS|FAIL|UNKNOWN');
  if (!VERDICTS.has(counterproof_success)) throw new TypeError('counterproof_success must be PASS|FAIL|UNKNOWN');

  return Object.freeze({
    engine: requiredText(engine, 'engine'),
    frequency,
    latency_ms,
    cost,
    correctness,
    counterproof_success,
    retries,
    context_usage,
    false_green_rate,
    comparable_sample: comparable_sample === true,
    ranking_allowed: comparable_sample === true,
  });
}

export function recordThinkingRouteOutcome({
  material_class,
  material_fingerprint,
  skills = [],
  frequency,
  engine_fitness,
  evidence,
  reusable_delta = false,
  fixed_point = false,
}) {
  if (!FREQUENCIES.has(frequency)) throw new TypeError(`unknown frequency: ${frequency}`);
  if (!engine_fitness || typeof engine_fitness !== 'object') throw new TypeError('engine_fitness is required');
  if (engine_fitness.frequency !== frequency) throw new TypeError('engine_fitness frequency mismatch');
  if (!VERDICTS.has(engine_fitness.correctness)) throw new TypeError('engine_fitness correctness invalid');
  if (!VERDICTS.has(engine_fitness.counterproof_success)) throw new TypeError('engine_fitness counterproof invalid');

  const normalizedSkills = normalizeSkills(skills);
  const observedEvidence = normalizeEvidence(evidence);
  const correctness = engine_fitness.correctness;
  const counterproof = engine_fitness.counterproof_success;
  const proven = correctness === 'PASS' && counterproof === 'PASS';
  const failed = correctness === 'FAIL' || counterproof === 'FAIL';
  const learning_state = failed ? 'RECALIBRATE' : (proven ? 'REINFORCE' : 'OBSERVE_ONLY');
  const crystal_eligible = proven && reusable_delta === true && fixed_point === true;

  return Object.freeze({
    schema_version: 1,
    mode: 'SELF_TUNING_THINKING_ROUTE_OUTCOME',
    material_class: requiredText(material_class, 'material_class'),
    material_fingerprint: requiredText(material_fingerprint, 'material_fingerprint'),
    skills: normalizedSkills,
    frequency,
    engine: requiredText(engine_fitness.engine, 'engine_fitness.engine'),
    latency_ms: engine_fitness.latency_ms,
    cost: engine_fitness.cost,
    correctness,
    counterproof_success: counterproof,
    retries: engine_fitness.retries,
    comparable_sample: engine_fitness.comparable_sample === true,
    evidence: observedEvidence,
    reusable_delta: reusable_delta === true,
    fixed_point: fixed_point === true,
    learning_state,
    reinforce_route: learning_state === 'REINFORCE',
    recalibrate_route: learning_state === 'RECALIBRATE',
    crystal_eligible,
    ranking_allowed: engine_fitness.ranking_allowed === true,
  });
}

export function compareThinkingRoutes(samples) {
  const list = Array.isArray(samples) ? samples : [];
  if (list.length < 2) return Object.freeze({ status: 'INSUFFICIENT_COMPARABLE_SAMPLE', winner: null });
  const comparable = list.every((item) => item?.comparable_sample === true)
    && new Set(list.map((item) => `${item.material_class}|${item.material_fingerprint}`)).size === 1;
  if (!comparable) return Object.freeze({ status: 'INSUFFICIENT_COMPARABLE_SAMPLE', winner: null });

  const passed = list.filter((item) => item.correctness === 'PASS' && item.counterproof_success === 'PASS');
  if (passed.length === 0) return Object.freeze({ status: 'NO_PROVEN_ROUTE', winner: null });
  const ordered = [...passed].sort((a, b) => a.latency_ms - b.latency_ms || a.retries - b.retries);
  return Object.freeze({ status: 'COMPARABLE', winner: ordered[0], candidates: ordered.length });
}

export function globalRuleCoverage({
  applicable_consumers,
  loaded_consumers,
  positive_test,
  negative_test,
  escaping_adapters,
}) {
  if (!Number.isInteger(applicable_consumers) || applicable_consumers < 1) return Object.freeze({ status: 'UNKNOWN', percent: null });
  if (!Number.isInteger(loaded_consumers) || loaded_consumers < 0 || loaded_consumers > applicable_consumers) {
    return Object.freeze({ status: 'UNKNOWN', percent: null });
  }
  if (!Number.isInteger(escaping_adapters) || escaping_adapters < 0) return Object.freeze({ status: 'UNKNOWN', percent: null });

  const percent = Math.floor((loaded_consumers / applicable_consumers) * 100);
  const closed = loaded_consumers === applicable_consumers
    && positive_test === true
    && negative_test === true
    && escaping_adapters === 0;

  return Object.freeze({
    status: closed ? 'PASS' : 'INCOMPLETE',
    percent: closed ? 100 : Math.min(percent, 99),
  });
}

export const SOL_FREQUENCY_INVARIANTS = Object.freeze({
  FREQUENCY_DECISION_OBSERVABLE: true,
  FREQUENCY_SWITCH_REQUIRES_MATERIAL_DELTA: true,
  HYSTERESIS_ENABLED: true,
  SAFETY_OVERRIDE_TO_FRIA: true,
  FREQUENCY_IS_NOT_ENGINE: true,
  ENGINE_FITNESS_REQUIRES_OBSERVED_METRICS: true,
  ENGINE_RANKING_REQUIRES_COMPARABLE_SAMPLE: true,
  THINKING_ROUTE_OUTCOME_SHARED: true,
  ROUTE_REINFORCEMENT_REQUIRES_PASS_AND_COUNTERPROOF: true,
  ROUTE_CRYSTAL_REQUIRES_REUSABLE_FIXED_POINT: true,
  GLOBAL_RULE_COVERAGE_100_REQUIRES_CLOSED_DENOMINATOR: true,
});
