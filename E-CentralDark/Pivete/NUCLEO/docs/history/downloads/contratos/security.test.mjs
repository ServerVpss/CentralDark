import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSource } from '../src/ingress/normalize.mjs';

test('redacts token-like keys', () => {
  const out = normalizeSource({
    kind: 'FILE',
    observed_at: '2026-08-23T17:00:00Z',
    provenance: 'test',
    payload: {
      note: 'safe',
      access_token: 'secret-value'
    }
  });

  assert.equal(out.payload.access_token, '[REDACTED_SECRET]');
  assert.equal(out.sensitivity, 'SENSITIVE_QUARANTINE');
});

test('does not mark ordinary text sensitive', () => {
  const out = normalizeSource({
    kind: 'TEXT',
    observed_at: '2026-08-23T17:00:00Z',
    provenance: 'test',
    payload: 'CentralDark one flow'
  });
  assert.equal(out.sensitivity, 'NORMAL');
});
