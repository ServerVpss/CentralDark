const FREQUENCIES = new Set(['LEVE', 'RAPIDA', 'MEDIA', 'PROFUNDA', 'FORTE', 'AVANCADA', 'FRIA', 'ORQUESTRA']);

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
  if (!['PASS', 'FAIL', 'UNKNOWN'].includes(correctness)) throw new TypeError('correctness must be PASS|FAIL|UNKNOWN');
  if (!['PASS', 'FAIL', 'UNKNOWN'].includes(counterproof_success)) {
    throw new TypeError('counterproof_success must be PASS|FAIL|UNKNOWN');
  }

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
  GLOBAL_RULE_COVERAGE_100_REQUIRES_CLOSED_DENOMINATOR: true,
});
