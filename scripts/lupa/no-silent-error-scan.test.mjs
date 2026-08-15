import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyFindings, isActionableCodePath, scanText } from './no-silent-error-scan.mjs';

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

test('teste, fixture, docs, backup, dist e minificado não viram dívida de runtime', () => {
  for (const path of [
    'scripts/x.test.mjs',
    'pkg/tests/a.js',
    'pkg/testes/a.py',
    'pkg/fixtures/a.js',
    'docs/example.js',
    'backups/old.js',
    'apps/x/dist/a.js',
    'public/vendor.min.js',
  ]) assert.equal(isActionableCodePath(path), false, path);
  assert.equal(isActionableCodePath('apps/modulos/hub/src/live.ts'), true);
});

test('catraca separa dívida antiga de violação em arquivo tocado', () => {
  const findings = [
    { id: 'EMPTY_CATCH_BLOCK', path: 'legacy/a.js', line: 1, excerpt: 'catch {}' },
    { id: 'EMPTY_CATCH_BLOCK', path: 'apps/live.js', line: 7, excerpt: 'catch {}' },
  ];
  const result = classifyFindings(findings, new Set(['apps/live.js']));
  assert.equal(result.legacy.length, 1);
  assert.equal(result.changed.length, 1);
  assert.equal(result.changed[0].path, 'apps/live.js');
});
