import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyExternalSignal, redact, renderGamifiedCard } from './agent.mjs';

test('forwarded Synkra fix becomes candidate and preserves epistemic state', () => {
  const result = classifyExternalSignal({
    source: 'gmail_forward',
    subject: 'Fwd: [SynkraAI/aiox-core] fix: parser',
    body: 'SyntaxError. node --check failed. lazy require silently falls back inside try/catch.',
  });
  assert.equal(result.state, 'CANDIDATE');
  assert.ok(result.findings.some((f) => f.id === 'FORWARDED_SOURCE'));
  assert.ok(result.findings.some((f) => f.id === 'NODE_SYNTAX_SWEEP'));
  assert.ok(result.findings.some((f) => f.id === 'SILENT_FALLBACK_AUDIT'));
});

test('irrelevant event stays NO_DELTA', () => {
  const result = classifyExternalSignal({ source: 'gmail', subject: 'hello', body: 'nothing material here' });
  assert.equal(result.state, 'NO_DELTA');
  assert.deepEqual(result.findings, []);
});

test('secrets are redacted before card output', () => {
  const secret = 'Bearer abcdefghijklmnopqrstuvwxyz123456';
  const redacted = redact(secret);
  assert.doesNotMatch(redacted, /abcdefghijklmnopqrstuvwxyz/);
  const result = classifyExternalSignal({ subject: secret, body: 'release v1.2.3' });
  assert.doesNotMatch(renderGamifiedCard(result), /abcdefghijklmnopqrstuvwxyz/);
});
