import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildObservation,
  checkpointFromRunMetadata,
  classifySourceDelta,
  conditionalHeaders,
  mergeCheckpoint,
  sha256Hex,
  stableStringify,
} from './source-delta.mjs';

test('stableStringify e sha256 não dependem da ordem de chaves', async () => {
  assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }));
  assert.equal(await sha256Hex({ b: 2, a: 1 }), await sha256Hex({ a: 1, b: 2 }));
});

test('conditionalHeaders reaproveita ETag e Last-Modified', () => {
  assert.deepEqual(conditionalHeaders({
    source_id: 'github-release:owner/repo',
    etag: '"abc"',
    last_modified: 'Sat, 15 Aug 2026 20:00:00 GMT',
  }), {
    'If-None-Match': '"abc"',
    'If-Modified-Since': 'Sat, 15 Aug 2026 20:00:00 GMT',
  });
});

test('304 é NO_CHANGE sem fabricar delta', () => {
  const state = { source_id: 'mcp-tools', content_hash: 'a'.repeat(64) };
  assert.deepEqual(classifySourceDelta(state, state, { httpStatus: 304 }), {
    status: 'NO_CHANGE',
    changed_fields: [],
    source_id: 'mcp-tools',
    reason: 'HTTP_304',
  });
});

test('200 com mesmo fingerprint material continua NO_CHANGE mesmo se ETag girar', () => {
  const previous = {
    source_id: 'mcp-tools',
    etag: '"old"',
    content_hash: 'a'.repeat(64),
    capability_fingerprint: 'b'.repeat(64),
  };
  const current = { ...previous, etag: '"new"' };
  assert.equal(classifySourceDelta(previous, current).status, 'NO_CHANGE');
});

test('mudança de release ou conteúdo produz DELTA_FOUND', () => {
  const previous = { source_id: 'github-release:o/r', last_release: 'v1', content_hash: 'a'.repeat(64) };
  const current = { source_id: 'github-release:o/r', last_release: 'v2', content_hash: 'b'.repeat(64) };
  const delta = classifySourceDelta(previous, current);
  assert.equal(delta.status, 'DELTA_FOUND');
  assert.deepEqual(delta.changed_fields.sort(), ['content_hash', 'last_release']);
});

test('buildObservation calcula hash de conteúdo e capacidade', async () => {
  const observation = await buildObservation({
    sourceId: 'mcp-tools',
    responseHeaders: new Headers({ etag: '"e1"' }),
    payloadText: '{"tools":[]}',
    capabilities: [{ name: 'a', version: '1' }],
  });
  assert.match(observation.content_hash, /^[0-9a-f]{64}$/);
  assert.match(observation.capability_fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(observation.etag, '"e1"');
});

test('checkpoint é recuperado de metadata do sync run e merge preserva last_absorbed sem absorção', () => {
  const prev = checkpointFromRunMetadata({ source_delta: { sources: [{ source_id: 'mcp-tools', content_hash: 'a'.repeat(64), last_absorbed: '2026-08-15T19:00:00Z' }] } }, 'mcp-tools');
  const merged = mergeCheckpoint(prev, { ...prev, content_hash: 'b'.repeat(64) }, { absorbed: false, observedAt: '2026-08-15T20:00:00Z' });
  assert.equal(merged.last_absorbed, '2026-08-15T19:00:00Z');
  assert.equal(merged.observed_at, '2026-08-15T20:00:00Z');
});
