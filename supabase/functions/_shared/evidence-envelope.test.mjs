import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTelemetryBatch } from './evidence-envelope.mjs';

test('colapsa logs repetidos em um evento causal', async () => {
  const snapshot = await normalizeTelemetryBatch([
    { event: 'ms-high-contrast_deprecation', producer: 'chrome', target: 'Browser', mission_id: 'm1', writer_scope: 'telemetry', sha: 'abc', timestamp: '2026-08-18T10:00:00Z' },
    { event: 'ms-high-contrast_deprecation', producer: 'chrome', target: 'Browser', mission_id: 'm1', writer_scope: 'telemetry', sha: 'abc', timestamp: '2026-08-18T10:01:00Z' },
  ]);
  assert.equal(snapshot.source_count, 2);
  assert.equal(snapshot.normalized_count, 1);
  assert.equal(snapshot.duplicates_collapsed, 1);
  assert.equal(snapshot.independent_delta_count, 1);
  assert.equal(snapshot.events[0].count, 2);
  assert.equal(snapshot.events[0].result, 'UNKNOWN');
});

test('preserva deltas independentes e calcula taxa/latência', async () => {
  const snapshot = await normalizeTelemetryBatch([
    { event: 'request', producer: 'mcp', target: 'VPS', mission_id: 'm1', writer_scope: 'runtime', sha: 'a', first_seen: '2026-08-18T10:00:00Z', last_seen: '2026-08-18T10:10:00Z', count: 10, latency_ms: 100, result: 'PASS' },
    { event: 'request', producer: 'mcp', target: 'VPS', mission_id: 'm2', writer_scope: 'runtime', sha: 'b', timestamp: '2026-08-18T10:00:00Z', count: 1, latency_ms: 200, result: 'FAIL' },
  ]);
  assert.equal(snapshot.normalized_count, 2);
  assert.equal(snapshot.events[0].rate, 0.0167);
  assert.equal(snapshot.events[0].latency_ms, 100);
  assert.equal(snapshot.events[1].result, 'FAIL');
});

test('não ecoa segredos em metadata/contexto', async () => {
  const snapshot = await normalizeTelemetryBatch({
    event: 'auth', producer: 'mcp', target: 'VPS', mission_id: 'm1',
    context: { authorization: 'Bearer super-secret', safe: 'ok' },
  });
  assert.equal(JSON.stringify(snapshot).includes('super-secret'), false);
  assert.equal(snapshot.events[0].context[0].authorization, '[REDACTED]');
});
