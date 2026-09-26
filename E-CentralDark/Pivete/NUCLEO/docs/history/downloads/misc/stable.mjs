import crypto from 'node:crypto';

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

export function sha256(value) {
  const raw = typeof value === 'string' ? value : stableStringify(value);
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function makeId(prefix, value) {
  return `${prefix}_${sha256(value).slice(0, 16)}`;
}
