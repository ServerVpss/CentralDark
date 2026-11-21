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


test('NULL legítimo permanece NULL e lacuna material vira UNKNOWN', async () => {
  const snapshot = await normalizeTelemetryBatch({
    event: 'tool_call',
    producer: 'github-connector',
    target: 'compare_commits',
    mission_id: 'm-null-contract',
    writer_scope: 'read-only-observation',
    sha: 'same-head',
    result: null,
  });

  const event = snapshot.events[0];
  assert.equal(event.result, 'UNKNOWN');
  assert.equal(event.trace_id, null);
  assert.equal(event.latency_ms, null);
  assert.equal(event.tokens, null);
  assert.equal(event.cost, null);
});

test('zero medido não é convertido em NULL', async () => {
  const snapshot = await normalizeTelemetryBatch({
    event: 'tool_call',
    producer: 'github-connector',
    target: 'compare_commits',
    mission_id: 'm-zero-contract',
    writer_scope: 'read-only-observation',
    sha: 'same-head',
    result: 'PASS',
    latency_ms: 0,
    tokens: 0,
    cost: 0,
  });

  const event = snapshot.events[0];
  assert.equal(event.result, 'PASS');
  assert.equal(event.latency_ms, 0);
  assert.equal(event.tokens, 0);
  assert.equal(event.cost, 0);
});

test('preserva causalidade de tentativa Oracle no envelope', async () => {
  const snapshot = await normalizeTelemetryBatch({
    event: 'oracle_response_captured',
    producer: 'hermes',
    target: 'CHAT_GLOBAL',
    mission_id: 'oracle-runtime-002',
    writer_scope: 'read-only-oracle',
    sha: 'current',
    event_id: 'preview-current-tab-replay-003',
    causation_id: 'hermes-replay-003',
    surface_id: 'CHATGPT-ORACLE-CURRENT-TAB',
    attempt_id: 'attempt-2',
    trace_id: 'trace-oracle-2',
    result: 'PASS',
    context: {
      capability: 'CHATGPT_PREVIEW_CURRENT_TAB_RESPONSE_CAPTURE',
      replay_marker: 'oracle-runtime-002',
      evidence_limit: 'interface_response_only',
    },
  });

  const event = snapshot.events[0];
  assert.equal(event.event_id, 'preview-current-tab-replay-003');
  assert.equal(event.causation_id, 'hermes-replay-003');
  assert.equal(event.surface_id, 'CHATGPT-ORACLE-CURRENT-TAB');
  assert.equal(event.attempt_id, 'attempt-2');
  assert.equal(event.context[0].replay_marker, 'oracle-runtime-002');
});

test('replays com EVENT_ID diferente não colapsam numa única causa', async () => {
  const snapshot = await normalizeTelemetryBatch([
    { event: 'oracle_response_captured', producer: 'hermes', target: 'CHAT_GLOBAL', mission_id: 'oracle-runtime-002', writer_scope: 'read-only-oracle', sha: 'current', event_id: 'preview-current-tab-002', causation_id: 'hermes-test-002', surface_id: 'CHATGPT-ORACLE-CURRENT-TAB', attempt_id: 'attempt-1', result: 'PASS' },
    { event: 'oracle_response_captured', producer: 'hermes', target: 'CHAT_GLOBAL', mission_id: 'oracle-runtime-002', writer_scope: 'read-only-oracle', sha: 'current', event_id: 'preview-current-tab-replay-003', causation_id: 'hermes-replay-003', surface_id: 'CHATGPT-ORACLE-CURRENT-TAB', attempt_id: 'attempt-2', result: 'PASS' },
  ]);

  assert.equal(snapshot.normalized_count, 2);
  assert.equal(snapshot.duplicates_collapsed, 0);
  assert.notEqual(snapshot.events[0].causal_fingerprint, snapshot.events[1].causal_fingerprint);
});
