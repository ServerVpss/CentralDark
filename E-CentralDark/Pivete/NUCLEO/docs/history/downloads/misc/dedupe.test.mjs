import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupeEvidence } from '../src/harvest/dedupe.mjs';

test('dedupe only collapses same target + same content hash', () => {
  const out = dedupeEvidence([
    { evidence_id: 'a', target: 'x', content_hash: '1' },
    { evidence_id: 'b', target: 'x', content_hash: '1' },
    { evidence_id: 'c', target: 'y', content_hash: '1' }
  ]);

  assert.equal(out.unique.length, 2);
  assert.equal(out.duplicates.length, 1);
  assert.equal(out.duplicates[0].duplicate, 'b');
});
