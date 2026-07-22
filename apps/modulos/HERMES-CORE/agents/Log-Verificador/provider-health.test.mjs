import assert from 'node:assert/strict';
import test from 'node:test';
import { detectarEventoProvedor, sanitizarLinhaLog } from './provider-health.mjs';

test('sanitiza bearer, key e jwt antes de qualquer saída', () => {
  const raw = 'Authorization: Bearer segredo123 api_key=sk-abcdefghijklmnopqrstuvwxyz eyJabcdefghijk.abcdefghijk.abcdefghijk';
  const safe = sanitizarLinhaLog(raw);
  assert.doesNotMatch(safe, /segredo123|sk-abcdefghijklmnopqrstuvwxyz|eyJabcdefghijk/);
  assert.match(safe, /REDACTED/);
});

test('classifica créditos esgotados sem expor payload', () => {
  const event = detectarEventoProvedor('xAI Grok: insufficient_quota token=super-secreto');
  assert.deepEqual(event, {
    provider: 'grok',
    kind: 'credits_exhausted',
    severity: 'error',
    remaining_percent: null,
    fingerprint: 'grok:credits_exhausted:unknown',
  });
});

test('não confunde 429 temporário com fim de créditos', () => {
  const event = detectarEventoProvedor('OpenAI HTTP 429 too many requests');
  assert.equal(event.kind, 'rate_limited');
  assert.equal(event.severity, 'warning');
});

test('só informa porcentagem quando ela veio da evidência', () => {
  const event = detectarEventoProvedor('Gemini credits remaining: 12%');
  assert.equal(event.provider, 'google');
  assert.equal(event.kind, 'credits_low');
  assert.equal(event.remaining_percent, 12);
});

test('linha comum não cria alerta', () => {
  assert.equal(detectarEventoProvedor('OpenAI request completed 200'), null);
});
