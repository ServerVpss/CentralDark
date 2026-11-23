import { createHash } from 'node:crypto';

export const REQUIRED_CONTINUITY_FIELDS = Object.freeze([
  'objetivo',
  'autoridade',
  'coordenador',
  'escritor',
  'escopo',
  'ambiente',
  'classe_de_acao',
  'baseline',
  'backup',
  'rollback',
  'receipt',
  'head_sha',
]);

const HEAD_SHA_RE = /^[0-9a-f]{40}$/i;
const HEAD_BOUND_FIELDS = Object.freeze(['baseline', 'backup', 'rollback', 'receipt']);

function present(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && typeof value === 'object' && Object.keys(value).length > 0;
}

export function validateContinuityState(state) {
  const reasons = [];
  const value = state && typeof state === 'object' && !Array.isArray(state) ? state : {};

  for (const field of REQUIRED_CONTINUITY_FIELDS) {
    if (!present(value[field])) reasons.push(`MISSING_FIELD:${field}`);
  }

  const headSha = typeof value.head_sha === 'string' ? value.head_sha.trim() : '';
  if (headSha && !HEAD_SHA_RE.test(headSha)) reasons.push('HEAD_SHA_INVALID');
  if (value.autoridade && value.autoridade !== 'SEGREDO/CHEFE') {
    reasons.push('AUTHORITY_MISMATCH');
  }
  if (value.coordenador && value.coordenador !== 'SOL') {
    reasons.push('COORDINATOR_MISMATCH');
  }

  if (HEAD_SHA_RE.test(headSha)) {
    for (const field of HEAD_BOUND_FIELDS) {
      const control = value[field];
      if (!control || typeof control !== 'object' || Array.isArray(control)) continue;
      if (!HEAD_SHA_RE.test(String(control.head_sha || ''))) {
        reasons.push(`CONTROL_HEAD_MISSING:${field}`);
      } else if (String(control.head_sha).toLowerCase() !== headSha.toLowerCase()) {
        reasons.push(`CONTROL_HEAD_MISMATCH:${field}`);
      }
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  return {
    ok: uniqueReasons.length === 0,
    state: uniqueReasons.length === 0 ? 'READY' : 'BLOCKED',
    head_sha: HEAD_SHA_RE.test(headSha) ? headSha : null,
    reasons: uniqueReasons,
  };
}

export function continuityBlockReceipt({ mission, source, validation }) {
  const stable = {
    schema: 'centraldark.hermes-continuity-block.v1',
    result: 'BLOCKED',
    mission: String(mission || 'unknown').slice(0, 120),
    source: String(source || 'unknown').slice(0, 200),
    head_sha: validation?.head_sha || null,
    reasons: [...(validation?.reasons || [])].sort(),
  };
  return {
    ...stable,
    fingerprint: createHash('sha256').update(JSON.stringify(stable)).digest('hex'),
  };
}


// Existing Hermes continuity owner: a sanitized, externally verifiable context
// capsule for compact/clean handoff. This is NOT a provider prompt/KV cache.
export const DEEP_CONTEXT_CAPSULE_FIELDS = Object.freeze([
  'schema_version', 'loop_id', 'parent_id', 'intent_id', 'goal_fingerprint',
  'chefe_intent_summary', 'current_main_sha', 'runtime_ref', 'owner_map',
  'used_skills', 'used_tools', 'clause_states', 'evidence_refs',
  'decision_summary', 'unknowns', 'failures', 'oracle_candidates',
  'counterproof_refs', 'receipts', 'next_cursor', 'observed_at_utc',
  'expires_at_utc', 'rehydration_summary',
]);

const CAPSULE_REQUIRED = Object.freeze([
  'schema_version', 'loop_id', 'intent_id', 'goal_fingerprint',
  'chefe_intent_summary', 'current_main_sha', 'owner_map', 'clause_states',
  'evidence_refs', 'receipts', 'next_cursor', 'observed_at_utc', 'expires_at_utc',
]);
const SENSITIVE_KEY = /^(?:secret|secrets|token|tokens|password|passwd|cookie|cookies|authorization|api[_-]?key|private[_-]?key|chain[_-]?of[_-]?thought|hidden[_-]?reasoning)$/i;
const CREDENTIAL_SHAPE = /(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{12,}|Bearer\s+\S+|-----BEGIN [^-]*PRIVATE KEY-----)/i;

function capsuleHasSensitive(value) {
  if (typeof value === 'string') return CREDENTIAL_SHAPE.test(value);
  if (Array.isArray(value)) return value.some(capsuleHasSensitive);
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, child]) => SENSITIVE_KEY.test(key) || capsuleHasSensitive(child));
  }
  return false;
}

export function validateDeepContextCapsule(capsule, { nowMs = Date.now() } = {}) {
  const value = capsule && typeof capsule === 'object' && !Array.isArray(capsule) ? capsule : {};
  const reasons = [];
  for (const key of CAPSULE_REQUIRED) {
    if (!present(value[key])) reasons.push(`MISSING_FIELD:${key}`);
  }
  if (value.schema_version !== 'centraldark.deep-context-capsule.v1') reasons.push('SCHEMA_INVALID');
  if (value.current_main_sha && !HEAD_SHA_RE.test(value.current_main_sha)) reasons.push('MAIN_SHA_INVALID');
  const time = (field) => typeof value[field] === 'string' && /Z$/.test(value[field])
    ? Date.parse(value[field]) : NaN;
  const observed = time('observed_at_utc');
  const expires = time('expires_at_utc');
  if (!Number.isFinite(observed) || !Number.isFinite(expires) || observed >= expires) reasons.push('TIME_INVALID');
  else {
    if (observed > nowMs) reasons.push('OBSERVED_IN_FUTURE');
    if (expires <= nowMs) reasons.push('CAPSULE_STALE');
  }
  if (capsuleHasSensitive(value)) reasons.push('SENSITIVE_CONTENT_DETECTED');
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > 65536) reasons.push('CAPSULE_TOO_LARGE');
  return { ok: reasons.length === 0, reasons: [...new Set(reasons)].sort(),
    intent_id: typeof value.intent_id === 'string' ? value.intent_id : null,
    next_cursor: typeof value.next_cursor === 'string' ? value.next_cursor : null };
}

export function buildDeepContextCapsule(source, options = {}) {
  const capsule = Object.fromEntries(DEEP_CONTEXT_CAPSULE_FIELDS
    .filter((key) => Object.hasOwn(source || {}, key))
    .map((key) => [key, structuredClone(source[key])]));
  const validation = validateDeepContextCapsule(capsule, options);
  if (!validation.ok) throw new Error(`DEEP_CONTEXT_CAPSULE_BLOCKED:${validation.reasons.join(',')}`);
  return capsule;
}
