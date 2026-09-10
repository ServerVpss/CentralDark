export const MULTI_MODEL_DELTA_CRYSTALLIZER_VERSION =
  'centraldark.multi-model-delta-crystallizer.v1';

export const CORE_PATTERN = Object.freeze([
  'SYSTEM_BEFORE_PART',
  'CAPTURE_WIDE',
  'DELTA_USEFUL_ONLY',
  'REUSE_BEFORE_CREATE',
  'FIND_REAL_WOUND',
  'ONE_OWNER_PER_CAPABILITY',
  'MEASURE_BEFORE_GREEN',
  'PROOF_AND_COUNTERPROOF',
  'RECEIPT',
  'NEXT_CURSOR',
]);

export const ANTI_PATTERNS = Object.freeze([
  'PRETTY_ANSWER_AS_PROOF',
  'ONLINE_AS_EXECUTION',
  'COMMIT_AS_GREEN',
  'MODEL_AS_AUTHORITY',
  'RAW_DELTA_AS_USEFUL_DELTA',
  'PARALLEL_ARCHITECTURE',
  'CRYSTALLIZE_BEFORE_MEASURE',
]);

export const LAW =
  'INTUICAO_PODE_CORRER_PROMOCAO_TEM_QUE_PROVAR';

const SYNONYMS = new Map([
  ['PEGAR_TUDO', 'CAPTURE_WIDE'],
  ['CAPTURAR_TUDO', 'CAPTURE_WIDE'],
  ['GARIMPAR_DELTA_UTIL', 'DELTA_USEFUL_ONLY'],
  ['DELTA_UTIL', 'DELTA_USEFUL_ONLY'],
  ['EVITAR_DUPLICACAO', 'REUSE_BEFORE_CREATE'],
  ['NAO_DUPLICAR', 'REUSE_BEFORE_CREATE'],
  ['NAO_CRIAR_SISTEMA_PARALELO', 'REUSE_BEFORE_CREATE'],
  ['FERIDA_REAL', 'FIND_REAL_WOUND'],
  ['PRESSAO_REAL', 'FIND_REAL_WOUND'],
  ['OWNER_EXISTENTE', 'ONE_OWNER_PER_CAPABILITY'],
  ['OWNER_CERTO', 'ONE_OWNER_PER_CAPABILITY'],
  ['MEDIR_ANTES', 'MEASURE_BEFORE_GREEN'],
  ['PROVA', 'PROOF_AND_COUNTERPROOF'],
  ['CONTRAPROVA', 'PROOF_AND_COUNTERPROOF'],
  ['REGISTRAR_RECEIPT', 'RECEIPT'],
  ['CONTINUAR_CURSOR', 'NEXT_CURSOR'],
]);

export function normalizeClaim(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function canonicalClaim(value) {
  const normalized = normalizeClaim(value);
  return SYNONYMS.get(normalized) ?? normalized;
}

export function normalizeInput(input) {
  return {
    source_id: String(input?.source_id ?? input?.model ?? 'UNKNOWN_SOURCE'),
    lens: String(input?.lens ?? 'UNSPECIFIED_LENS'),
    claims: [...new Set((input?.claims ?? []).map(canonicalClaim).filter(Boolean))],
    provenance: input?.provenance ?? 'USER_OBSERVED',
  };
}

export function intersectClaims(inputs) {
  const normalized = inputs.map(normalizeInput);
  if (normalized.length === 0) return [];
  const [first, ...rest] = normalized.map((entry) => new Set(entry.claims));
  return [...first].filter((claim) => rest.every((set) => set.has(claim)));
}

export function extractUsefulDeltas(inputs, knownCore = CORE_PATTERN) {
  const known = new Set(knownCore);
  const all = new Set(inputs.flatMap((entry) => normalizeInput(entry).claims));
  return [...all].filter((claim) => !known.has(claim) && !ANTI_PATTERNS.includes(claim));
}

export function detectContradictions(inputs) {
  const claims = new Set(inputs.flatMap((entry) => normalizeInput(entry).claims));
  const contradictions = [];

  for (const anti of ANTI_PATTERNS) {
    if (claims.has(anti)) {
      contradictions.push({
        claim: anti,
        action: 'MEASURE_BEFORE_ABSORB',
        status: 'BLOCKED_UNTIL_PROVED',
      });
    }
  }

  return contradictions;
}

export function buildCrystallizedPattern(inputs) {
  const normalizedInputs = inputs.map(normalizeInput);
  const intersection = intersectClaims(normalizedInputs);
  const deltas = extractUsefulDeltas(normalizedInputs);
  const contradictions = detectContradictions(normalizedInputs);

  const absorbable = contradictions.length === 0;
  const status = absorbable ? 'READY_TO_ABSORB' : 'MEASURE_REQUIRED';

  return {
    schema: MULTI_MODEL_DELTA_CRYSTALLIZER_VERSION,
    pattern: 'CENTRALDARK_OPERATING_PATTERN',
    law: LAW,
    input_count: normalizedInputs.length,
    normalized_inputs: normalizedInputs,
    core: CORE_PATTERN,
    intersection,
    delta_useful_candidates: deltas,
    contradictions,
    anti_patterns: ANTI_PATTERNS,
    truth_rule: 'MODEL_IS_NOT_TRUTH_RESPONSE_IS_NOT_TRUTH_REALITY_JUDGES',
    promotion_rule: 'SERIALIZE_MUTATION_AFTER_PARALLEL_PERCEPTION',
    status,
    receipt_required: true,
    next_cursor_required: true,
  };
}

export function validateCrystallizedPattern(pattern) {
  const failures = [];

  if (pattern.schema !== MULTI_MODEL_DELTA_CRYSTALLIZER_VERSION) {
    failures.push('SCHEMA_MISMATCH');
  }
  if (!Array.isArray(pattern.core) || pattern.core.length !== CORE_PATTERN.length) {
    failures.push('CORE_PATTERN_INCOMPLETE');
  }
  if (pattern.truth_rule?.includes('MODEL_IS_NOT_TRUTH') !== true) {
    failures.push('MODEL_AUTHORITY_NOT_BLOCKED');
  }
  if (pattern.promotion_rule !== 'SERIALIZE_MUTATION_AFTER_PARALLEL_PERCEPTION') {
    failures.push('PARALLEL_MUTATION_NOT_SERIALIZED');
  }
  if (pattern.receipt_required !== true) failures.push('RECEIPT_NOT_REQUIRED');
  if (pattern.next_cursor_required !== true) failures.push('NEXT_CURSOR_NOT_REQUIRED');
  if (pattern.contradictions.length > 0 && pattern.status !== 'MEASURE_REQUIRED') {
    failures.push('CONTRADICTION_WITHOUT_MEASUREMENT_GATE');
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}
