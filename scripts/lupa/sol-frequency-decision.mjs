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

const normalizePersistenceReceipt = (receipt) => {
  if (receipt === null || receipt === undefined) return null;
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    throw new TypeError('persistence_receipt must be an object when provided');
  }
  const normalized = {
    channel: requiredText(receipt.channel, 'persistence_receipt.channel'),
    target: requiredText(receipt.target, 'persistence_receipt.target'),
    observed: receipt.observed === true,
    durable: receipt.durable === true,
  };
  return Object.freeze({
    ...normalized,
    verified: normalized.observed && normalized.durable,
  });
};

const requiredFiniteNumber = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
};

const normalizeSignificantDigits = (value) => {
  if (!Number.isInteger(value) || value < 1 || value > 15) {
    throw new TypeError('significant_digits must be an integer between 1 and 15');
  }
  return value;
};

const toSignificant = (value, digits) => {
  if (value === 0) return 0;
  return Number(value.toPrecision(digits));
};

export function quantifyRatio({
  numerator,
  denominator,
  unit = 'count',
  significant_digits = 6,
}) {
  const observedNumerator = requiredFiniteNumber(numerator, 'numerator');
  const observedDenominator = requiredFiniteNumber(denominator, 'denominator');
  const digits = normalizeSignificantDigits(significant_digits);
  const observedUnit = requiredText(unit, 'unit');

  if (observedDenominator === 0) {
    return Object.freeze({
      status: 'UNDEFINED',
      numerator: observedNumerator,
      denominator: observedDenominator,
      unit: observedUnit,
      ratio_raw: null,
      percent_raw: null,
      ratio: null,
      percent: null,
      significant_digits: digits,
      formula: '100 * numerator / denominator',
    });
  }

  const ratioRaw = observedNumerator / observedDenominator;
  const percentRaw = ratioRaw * 100;
  return Object.freeze({
    status: 'PASS',
    numerator: observedNumerator,
    denominator: observedDenominator,
    unit: observedUnit,
    ratio_raw: ratioRaw,
    percent_raw: percentRaw,
    ratio: toSignificant(ratioRaw, digits),
    percent: toSignificant(percentRaw, digits),
    significant_digits: digits,
    formula: '100 * numerator / denominator',
  });
}

export function scientificDelta({
  before,
  after,
  unit,
  significant_digits = 6,
}) {
  const observedBefore = requiredFiniteNumber(before, 'before');
  const observedAfter = requiredFiniteNumber(after, 'after');
  const observedUnit = requiredText(unit, 'unit');
  const digits = normalizeSignificantDigits(significant_digits);
  const absoluteRaw = observedAfter - observedBefore;
  const relativeRaw = observedBefore === 0 ? null : absoluteRaw / observedBefore;
  const percentRaw = relativeRaw === null ? null : relativeRaw * 100;

  return Object.freeze({
    status: 'PASS',
    before: observedBefore,
    after: observedAfter,
    unit: observedUnit,
    absolute_delta_raw: absoluteRaw,
    absolute_delta: toSignificant(absoluteRaw, digits),
    relative_status: observedBefore === 0 ? 'UNDEFINED_BASELINE_ZERO' : 'PASS',
    relative_delta_raw: relativeRaw,
    relative_delta: relativeRaw === null ? null : toSignificant(relativeRaw, digits),
    percent_change_raw: percentRaw,
    percent_change: percentRaw === null ? null : toSignificant(percentRaw, digits),
    significant_digits: digits,
    formula: '100 * (after - before) / before',
  });
}

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
  crystallized = false,
  persistence_receipt = null,
  fixed_point = false,
}) {
  if (!FREQUENCIES.has(frequency)) throw new TypeError(`unknown frequency: ${frequency}`);
  if (!engine_fitness || typeof engine_fitness !== 'object') throw new TypeError('engine_fitness is required');
  if (engine_fitness.frequency !== frequency) throw new TypeError('engine_fitness frequency mismatch');
  if (!VERDICTS.has(engine_fitness.correctness)) throw new TypeError('engine_fitness correctness invalid');
  if (!VERDICTS.has(engine_fitness.counterproof_success)) throw new TypeError('engine_fitness counterproof invalid');

  const normalizedSkills = normalizeSkills(skills);
  const observedEvidence = normalizeEvidence(evidence);
  const normalizedPersistenceReceipt = normalizePersistenceReceipt(persistence_receipt);
  const correctness = engine_fitness.correctness;
  const counterproof = engine_fitness.counterproof_success;
  const proven = correctness === 'PASS' && counterproof === 'PASS';
  const failed = correctness === 'FAIL' || counterproof === 'FAIL';
  const learning_state = failed ? 'RECALIBRATE' : (proven ? 'REINFORCE' : 'OBSERVE_ONLY');
  const crystal_required = proven && reusable_delta === true;
  const crystal_eligible = crystal_required;
  const crystallized_declared = crystallized === true;
  const durable_memory_receipt = normalizedPersistenceReceipt?.verified === true;
  const crystal_done = crystallized_declared && (!crystal_required || durable_memory_receipt);
  const fixedPointRequested = fixed_point === true;
  const fixed_point_blocked_by_uncrystallized = fixedPointRequested && crystal_required && !crystal_done;
  const effectiveFixedPoint = fixedPointRequested && !fixed_point_blocked_by_uncrystallized;

  return Object.freeze({
    schema_version: 3,
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
    crystallized_declared,
    crystallized: crystal_done,
    persistence_receipt: normalizedPersistenceReceipt,
    durable_memory_receipt,
    fixed_point_requested: fixedPointRequested,
    fixed_point: effectiveFixedPoint,
    fixed_point_blocked_by_uncrystallized,
    learning_state,
    reinforce_route: learning_state === 'REINFORCE',
    recalibrate_route: learning_state === 'RECALIBRATE',
    crystal_required,
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

  const quantified = quantifyRatio({
    numerator: loaded_consumers,
    denominator: applicable_consumers,
    unit: 'consumers',
    significant_digits: 6,
  });
  const percent = Math.floor(quantified.percent_raw);
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
  ROUTE_CRYSTAL_REQUIRES_PROVEN_REUSABLE_DELTA: true,
  CRYSTAL_REQUIRES_DURABLE_MEMORY_RECEIPT: true,
  SELF_ASSERTED_CRYSTALLIZATION_IS_NOT_PROOF: true,
  OBSIDIAN_WRITE_REQUIRES_PROVEN_LOCAL_CHANNEL: true,
  GLOBAL_RULE_COVERAGE_100_REQUIRES_CLOSED_DENOMINATOR: true,
  QUANTIFY_WHEN_MEASURABLE: true,
  PERCENTAGE_REQUIRES_CLOSED_DENOMINATOR: true,
  SCIENTIFIC_CALCULATION_REQUIRED_WHEN_MAGNITUDE_MATTERS: true,
  NO_FALSE_PRECISION: true,
  CRYSTALLIZE_ALL_PROVEN_REUSABLE_DELTA: true,
  FIXED_POINT_BLOCKS_UNCRYSTALLIZED_REUSABLE_DELTA: true,
});
