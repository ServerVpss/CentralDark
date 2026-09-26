import test from 'node:test';
import assert from 'node:assert/strict';
import { runOneFlow } from '../src/pipeline/one-flow.mjs';

test('one flow normalizes and produces crystal candidate on new material', () => {
  const out = runOneFlow({
    kind: 'SAVED_HTML',
    target: 'chat-surface',
    observed_at: '2026-08-23T17:00:00Z',
    provenance: 'user-saved-page',
    payload: { title: 'CentralDark', text: 'delta útil' }
  });

  assert.equal(out.contract, 'CENTRALDARK_ONE_FLOW');
  assert.equal(out.counts.sources, 1);
  assert.equal(out.knowledge_result, 'CRYSTAL_CANDIDATE');
  assert.equal(out.invariants.one_system_only, true);
});

test('same hash becomes NO_CHANGE', async () => {
  const first = runOneFlow({
    kind: 'TEXT',
    observed_at: '2026-08-23T17:00:00Z',
    provenance: 'test',
    payload: 'same'
  });
  const hash = first.normalized_sources[0].content_hash;

  const second = runOneFlow({
    kind: 'TEXT',
    observed_at: '2026-08-23T17:01:00Z',
    provenance: 'test',
    previous_hash: hash,
    payload: 'same'
  });

  assert.equal(second.deltas[0].status, 'NO_CHANGE');
});
