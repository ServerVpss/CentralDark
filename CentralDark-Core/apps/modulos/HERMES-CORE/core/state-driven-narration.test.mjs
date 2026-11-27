import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateNarrationTransition,
  narrationStateHash,
  rollingHandoff,
} from './state-driven-narration.mjs';

const base = {
  mission_id: 'MISSION-1',
  goal: 'Cristalizar registry + runtime envelope',
  position: 'VPS:/root/CentralDark',
  owner: 'HERMES',
  writer_scope: 'runtime-envelope',
  last_action: 'measure',
  last_evidence: 'registry present',
  last_delta: 'NO_CHANGE',
  current_hypothesis: 'owner already exists',
  current_state: 'WAITING',
  residual: ['CI'],
  unknowns: ['runtime_binding'],
  next_cursor: 'WAIT_CI',
};

test('mesmo estado suprime narrativa duplicada e preserva goal/cursor', () => {
  const result = evaluateNarrationTransition({ previous: base, current: { ...base } });
  assert.equal(result.changed, false);
  assert.equal(result.narrate, false);
  assert.equal(result.update_handoff, false);
  assert.equal(result.suppress_duplicate_narration, true);
  assert.equal(result.keep_goal, true);
  assert.equal(result.keep_next_cursor, true);
});

test('evidência nova muda o fingerprint e libera uma emissão', () => {
  const result = evaluateNarrationTransition({
    previous: base,
    current: { ...base, last_evidence: 'CI 10/10 PASS', current_state: 'PROVED' },
  });
  assert.equal(result.changed, true);
  assert.equal(result.narrate, true);
  assert.equal(result.update_handoff, true);
  assert.equal(result.suppress_duplicate_narration, false);
});

test('updated_at sozinho não fabrica delta material', () => {
  const a = narrationStateHash({ ...base, updated_at: '2026-09-16T10:00:00Z' });
  const b = narrationStateHash({ ...base, updated_at: '2026-09-16T10:05:00Z' });
  assert.equal(a, b);
});

test('rolling handoff carrega o mesmo hash material do estado', () => {
  const handoff = rollingHandoff({ ...base, updated_at: '2026-09-16T10:00:00Z' });
  assert.equal(handoff.schema, 'centraldark.rolling-handoff.v1');
  assert.equal(handoff.state_hash, narrationStateHash(base));
  assert.equal(handoff.goal, base.goal);
  assert.equal(handoff.next_cursor, base.next_cursor);
});
