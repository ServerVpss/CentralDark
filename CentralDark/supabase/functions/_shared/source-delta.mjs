const SHA256_RE = /^[0-9a-f]{64}$/i;
const SOURCE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/;

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

export async function sha256Hex(value) {
  const bytes = value instanceof Uint8Array
    ? value
    : new TextEncoder().encode(typeof value === 'string' ? value : stableStringify(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function normalizeCheckpoint(raw, sourceId) {
  const value = raw && typeof raw === 'object' ? raw : {};
  const normalizedId = String(value.source_id || sourceId || '').trim();
  if (!SOURCE_ID_RE.test(normalizedId)) throw new Error('SOURCE_ID_INVALID');
  const optional = (key) => {
    const candidate = value[key];
    return candidate == null || String(candidate).trim() === '' ? null : String(candidate).trim();
  };
  const contentHash = optional('content_hash');
  const capabilityFingerprint = optional('capability_fingerprint');
  if (contentHash && !SHA256_RE.test(contentHash)) throw new Error('CONTENT_HASH_INVALID');
  if (capabilityFingerprint && !SHA256_RE.test(capabilityFingerprint)) throw new Error('CAPABILITY_FINGERPRINT_INVALID');
  return {
    source_id: normalizedId,
    last_sha: optional('last_sha'),
    last_release: optional('last_release'),
    etag: optional('etag'),
    last_modified: optional('last_modified'),
    content_hash: contentHash,
    capability_fingerprint: capabilityFingerprint,
    last_absorbed: optional('last_absorbed'),
    observed_at: optional('observed_at'),
  };
}

export function conditionalHeaders(checkpoint) {
  const current = normalizeCheckpoint(checkpoint, checkpoint?.source_id);
  const headers = {};
  if (current.etag) headers['If-None-Match'] = current.etag;
  if (current.last_modified) headers['If-Modified-Since'] = current.last_modified;
  return headers;
}

export function checkpointFromRunMetadata(metadata, sourceId) {
  const list = Array.isArray(metadata?.source_delta?.sources)
    ? metadata.source_delta.sources
    : [];
  const found = list.find((item) => item?.source_id === sourceId);
  return found ? normalizeCheckpoint(found, sourceId) : normalizeCheckpoint({}, sourceId);
}

export async function buildObservation({
  sourceId,
  responseHeaders,
  payloadText,
  lastSha = null,
  lastRelease = null,
  capabilities = null,
  lastAbsorbed = null,
  observedAt = new Date().toISOString(),
}) {
  if (!SOURCE_ID_RE.test(String(sourceId || ''))) throw new Error('SOURCE_ID_INVALID');
  const getHeader = (name) => {
    if (!responseHeaders) return null;
    if (typeof responseHeaders.get === 'function') return responseHeaders.get(name);
    const entry = Object.entries(responseHeaders).find(([key]) => key.toLowerCase() === name.toLowerCase());
    return entry ? String(entry[1]) : null;
  };
  return normalizeCheckpoint({
    source_id: sourceId,
    last_sha: lastSha,
    last_release: lastRelease,
    etag: getHeader('etag'),
    last_modified: getHeader('last-modified'),
    content_hash: payloadText == null ? null : await sha256Hex(payloadText),
    capability_fingerprint: capabilities == null ? null : await sha256Hex(capabilities),
    last_absorbed: lastAbsorbed,
    observed_at: observedAt,
  }, sourceId);
}

export function classifySourceDelta(previousRaw, currentRaw, { httpStatus = 200 } = {}) {
  const sourceId = String(currentRaw?.source_id || previousRaw?.source_id || '').trim();
  const previous = normalizeCheckpoint(previousRaw, sourceId);
  if (httpStatus === 304) {
    return { status: 'NO_CHANGE', changed_fields: [], source_id: sourceId, reason: 'HTTP_304' };
  }
  const current = normalizeCheckpoint(currentRaw, sourceId);
  const materialFields = ['last_sha', 'last_release', 'content_hash', 'capability_fingerprint'];
  const changed = materialFields.filter((field) => previous[field] !== current[field]);
  const previousHasMaterial = materialFields.some((field) => previous[field]);
  if (!previousHasMaterial) {
    return { status: 'DELTA_FOUND', changed_fields: changed.length ? changed : materialFields.filter((field) => current[field]), source_id: sourceId, reason: 'FIRST_OBSERVATION' };
  }
  if (changed.length === 0) {
    return { status: 'NO_CHANGE', changed_fields: [], source_id: sourceId, reason: 'MATERIAL_FINGERPRINT_EQUAL' };
  }
  return { status: 'DELTA_FOUND', changed_fields: changed, source_id: sourceId, reason: 'MATERIAL_FIELD_CHANGED' };
}

export function mergeCheckpoint(previousRaw, currentRaw, { absorbed = false, observedAt = new Date().toISOString() } = {}) {
  const sourceId = String(currentRaw?.source_id || previousRaw?.source_id || '').trim();
  const previous = normalizeCheckpoint(previousRaw, sourceId);
  const current = normalizeCheckpoint(currentRaw, sourceId);
  return normalizeCheckpoint({
    ...previous,
    ...Object.fromEntries(Object.entries(current).filter(([, value]) => value != null)),
    source_id: sourceId,
    last_absorbed: absorbed ? observedAt : previous.last_absorbed,
    observed_at: observedAt,
  }, sourceId);
}
