import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeText, isSensitivePath, classifyPaths } from './security.mjs';

test('sanitizeText redige token GitHub PAT clássico', () => {
  const out = sanitizeText('token: ghp_1234567890abcdefghij1234567890abcd');
  assert.ok(!out.includes('ghp_1234567890'));
  assert.ok(out.includes('[REDACTED_GITHUB_TOKEN]'));
});

test('sanitizeText redige Bearer token', () => {
  const out = sanitizeText('Authorization: Bearer abcdefghijklmnop1234567890');
  assert.ok(out.includes('Bearer [REDACTED]'));
});

test('sanitizeText redige JWT', () => {
  const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dQw4w9WgXcQ';
  const out = sanitizeText(`token=${jwt}`);
  assert.ok(!out.includes(jwt));
  assert.ok(out.includes('[REDACTED_JWT]'));
});

test('XSS bloqueia — HTML hostil não executa (< e > neutralizados)', () => {
  const out = sanitizeText('<script>alert(1)</script>');
  assert.ok(!out.includes('<script>'));
  assert.equal(out, '&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('@-menção não dispara silenciosamente', () => {
  const out = sanitizeText('cc @segredounlock');
  assert.ok(!out.includes('@segredounlock'));
});

test('isSensitivePath — path traversal / caminho sensível clássico bloqueia', () => {
  assert.equal(isSensitivePath('.env'), true);
  assert.equal(isSensitivePath('.env.production'), true);
  assert.equal(isSensitivePath('secrets/api.json'), true);
  assert.equal(isSensitivePath('.ssh/id_rsa'), true);
  assert.equal(isSensitivePath('certs/server.pem'), true);
  assert.equal(isSensitivePath('config/private.key'), true);
});

test('isSensitivePath — caminho normal não é falso positivo', () => {
  assert.equal(isSensitivePath('src/app.js'), false);
  assert.equal(isSensitivePath('docs/README.md'), false);
});

test('classifyPaths conta sensíveis separadamente e não os classifica como code', () => {
  const c = classifyPaths(['src/a.js', 'docs/b.md', '.env', 'tests/c.test.js', '.github/workflows/x.yml']);
  assert.equal(c.sensitive_paths, 1);
  assert.equal(c.code, 1);
  assert.equal(c.docs, 1);
  assert.equal(c.tests, 1);
  assert.equal(c.workflows, 1);
});
