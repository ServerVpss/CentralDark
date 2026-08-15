import assert from 'node:assert/strict';
import test from 'node:test';
import { scanText } from './no-silent-error-scan.mjs';

test('bloqueia catch JS vazio', () => {
  const code = ['try { work(); }', 'catch ', '{', '}'].join('');
  const findings = scanText(code, 'x.mjs');
  assert.equal(findings[0]?.id, 'EMPTY_CATCH_BLOCK');
});

test('bloqueia rejection handler vazio', () => {
  const code = 'audit().then(() => ok(), ' + '() => {' + '})';
  const findings = scanText(code, 'x.ts');
  assert.equal(findings[0]?.id, 'EMPTY_PROMISE_REJECTION_HANDLER');
});

test('recuperação explícita com endereço não é bloqueada pelo scanner sintático', () => {
  const code = `try { work(); } catch (error) { console.error('ERROR_ID=x stage=work', error); throw error; }`;
  assert.deepEqual(scanText(code, 'x.mjs'), []);
});

test('bloqueia except/pass Python', () => {
  const findings = scanText('try:\n    work()\nexcept Exception:\n    pass\n', 'x.py');
  assert.equal(findings[0]?.id, 'PY_EXCEPT_PASS');
});
