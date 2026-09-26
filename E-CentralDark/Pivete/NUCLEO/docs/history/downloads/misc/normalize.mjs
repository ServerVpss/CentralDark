import { makeId, sha256 } from '../lib/stable.mjs';
import { sanitize } from './redact.mjs';

const ALLOWED_KINDS = new Set([
  'TEXT','VOICE','IMAGE','SCREEN_REGION','FILE','URL','TAB_CONTEXT',
  'SAVED_HTML','RECORDER_EXPORT','SCREENPIPE_EXPORT','GITHUB',
  'RUNTIME','LOG','VPS','WEB'
]);

export function normalizeSource(input) {
  if (!input || typeof input !== 'object') throw new Error('SOURCE_REQUIRED');
  if (!ALLOWED_KINDS.has(input.kind)) throw new Error(`UNSUPPORTED_SOURCE_KIND:${input.kind}`);

  const observedAt = input.observed_at ?? new Date().toISOString();
  const sanitized = sanitize(input.payload);

  const normalized = {
    source_id: input.source_id ?? makeId('src', {
      kind: input.kind,
      provenance: input.provenance ?? 'UNKNOWN',
      target: input.target ?? null,
      observedAt,
      payload: sanitized.value
    }),
    surface_id: input.surface_id ?? null,
    kind: input.kind,
    target: input.target ?? null,
    operational_scope: input.operational_scope ?? null,
    event_time: input.event_time ?? null,
    observed_at: observedAt,
    provenance: input.provenance ?? 'UNKNOWN',
    previous_hash: input.previous_hash ?? null,
    sensitivity: sanitized.sensitive ? 'SENSITIVE_QUARANTINE' : (input.sensitivity ?? 'NORMAL'),
    payload: sanitized.value,
    redactions: sanitized.redactions
  };

  normalized.content_hash = sha256({
    kind: normalized.kind,
    target: normalized.target,
    payload: normalized.payload
  });

  return normalized;
}
