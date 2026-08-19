const SECRET_KEY_RE = /(token|secret|password|passwd|authorization|cookie|session|api[_-]?key|private[_-]?key|service[_-]?role)/i;
const SECRET_VALUE_RE = /(?:Bearer\s+\S+|gh[pousr]_[A-Za-z0-9]{10,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}|sk-[A-Za-z0-9]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/ig;

const text = (value, max = 500) => String(value ?? '').replace(SECRET_VALUE_RE, '[REDACTED]').slice(0, max);
const safeKey = (key) => !SECRET_KEY_RE.test(String(key));

function sanitize(value, depth = 0) {
  if (depth > 5) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitize(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      safeKey(key) ? sanitize(item, depth + 1) : '[REDACTED]',
    ]));
  }
  if (typeof value === 'string') return text(value);
  return value ?? null;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

async function digest(value) {
  const raw = JSON.stringify(stable(value));
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(raw);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('SHA-256 indisponível no runtime');
}

function asTime(value, fallback) {
  const parsed = Date.parse(value ?? '');
  return Number.isNaN(parsed) ? fallback : parsed;
}

function firstDefined(event, keys, fallback = null) {
  for (const key of keys) if (event[key] != null && event[key] !== '') return event[key];
  return fallback;
}

export async function normalizeTelemetryBatch(input) {
  const source = Array.isArray(input) ? input : Array.isArray(input?.events) ? input.events : [input];
  const now = Date.now();
  const groups = new Map();

  for (const raw of source.filter(Boolean)) {
    const event = sanitize(raw);
    const first = asTime(firstDefined(event, ['first_seen', 'firstSeen', 'timestamp', 'event_time']), now);
    const last = asTime(firstDefined(event, ['last_seen', 'lastSeen', 'timestamp', 'observation_time']), first);
    const count = Math.max(1, Number(firstDefined(event, ['count', 'occurrences'], 1)) || 1);
    const identity = {
      event: firstDefined(event, ['event', 'name', 'acao'], 'unknown'),
      producer: firstDefined(event, ['producer', 'agent'], 'unknown'),
      target: firstDefined(event, ['target', 'alvo'], 'unknown'),
      mission_id: firstDefined(event, ['mission_id', 'missionId'], 'unknown'),
      writer_scope: firstDefined(event, ['writer_scope', 'writerScope'], 'unknown'),
      sha: firstDefined(event, ['sha', 'head_sha', 'headSha'], 'unknown'),
      cause: firstDefined(event, ['causal_key', 'cause_key', 'failure_fingerprint'], ''),
    };
    const key = JSON.stringify(stable(identity));
    const current = groups.get(key) ?? {
      ...identity,
      first_seen_ms: first,
      last_seen_ms: last,
      count: 0,
      source_count: 0,
      trace_ids: new Set(),
      latency_ms: [],
      tokens: [],
      costs: [],
      results: new Set(),
      contexts: [],
      sessions: new Set(),
    };
    current.first_seen_ms = Math.min(current.first_seen_ms, first);
    current.last_seen_ms = Math.max(current.last_seen_ms, last);
    current.count += count;
    current.source_count += 1;
    const trace = firstDefined(event, ['trace_id', 'traceId']);
    if (trace) current.trace_ids.add(text(trace, 160));
    const session = firstDefined(event, ['session', 'session_id', 'context']);
    if (session) current.sessions.add(text(session, 160));
    const latency = Number(firstDefined(event, ['latency_ms', 'latencyMs']));
    if (Number.isFinite(latency) && latency >= 0) current.latency_ms.push(latency);
    const tokens = Number(firstDefined(event, ['tokens', 'token_count']));
    if (Number.isFinite(tokens) && tokens >= 0) current.tokens.push(tokens);
    const cost = Number(firstDefined(event, ['cost', 'cost_usd']));
    if (Number.isFinite(cost) && cost >= 0) current.costs.push(cost);
    const result = firstDefined(event, ['result', 'status'], 'UNKNOWN');
    current.results.add(text(result, 80).toUpperCase());
    const context = firstDefined(event, ['context', 'metadata'], null);
    if (context) current.contexts.push(sanitize(context));
    groups.set(key, current);
  }

  const events = [];
  for (const group of groups.values()) {
    const durationSeconds = Math.max(1, (group.last_seen_ms - group.first_seen_ms) / 1000);
    events.push({
      schema_version: 1,
      event: text(group.event, 160),
      producer: text(group.producer, 120),
      target: text(group.target, 160),
      operational_scope: text(firstDefined(group, ['writer_scope'], 'UNKNOWN'), 160),
      first_seen: new Date(group.first_seen_ms).toISOString(),
      last_seen: new Date(group.last_seen_ms).toISOString(),
      count: group.count,
      rate: Number((group.count / durationSeconds).toFixed(4)),
      context: group.contexts.slice(0, 20),
      session: [...group.sessions].slice(0, 20),
      mission_id: text(group.mission_id, 160),
      writer_scope: text(group.writer_scope, 160),
      sha: text(group.sha, 80),
      trace_id: group.trace_ids.size === 1 ? [...group.trace_ids][0] : null,
      latency_ms: group.latency_ms.length ? Number((group.latency_ms.reduce((a, b) => a + b, 0) / group.latency_ms.length).toFixed(2)) : null,
      tokens: group.tokens.length ? group.tokens.reduce((a, b) => a + b, 0) : null,
      cost: group.costs.length ? Number(group.costs.reduce((a, b) => a + b, 0).toFixed(8)) : null,
      result: group.results.size === 1 ? [...group.results][0] : 'MIXED',
      causal_fingerprint: await digest({
        event: group.event,
        producer: group.producer,
        target: group.target,
        mission_id: group.mission_id,
        writer_scope: group.writer_scope,
        sha: group.sha,
        cause: group.cause,
      }),
      source_count: group.source_count,
      duplicates_collapsed: Math.max(0, group.source_count - 1),
    });
  }

  return {
    schema_version: 1,
    source_count: source.length,
    normalized_count: events.length,
    duplicates_collapsed: Math.max(0, source.length - events.length),
    independent_delta_count: events.length,
    events,
  };
}

export const __test = Object.freeze({ sanitize, stable });
