import { makeId } from '../lib/stable.mjs';

export function computeDelta(source) {
  if (!source.previous_hash) {
    return {
      delta_id: makeId('delta', [source.source_id, source.content_hash, null]),
      source_id: source.source_id,
      status: 'NEW',
      changed: true,
      content_hash: source.content_hash,
      previous_hash: null,
      reason: 'NO_PREVIOUS_HASH'
    };
  }

  const changed = source.previous_hash !== source.content_hash;
  return {
    delta_id: makeId('delta', [source.source_id, source.content_hash, source.previous_hash]),
    source_id: source.source_id,
    status: changed ? 'CHANGED' : 'NO_CHANGE',
    changed,
    content_hash: source.content_hash,
    previous_hash: source.previous_hash,
    reason: changed ? 'CONTENT_HASH_CHANGED' : 'SAME_CONTENT_HASH'
  };
}
