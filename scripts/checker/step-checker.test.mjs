import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const checker = fileURLToPath(new URL('./step-checker.mjs', import.meta.url));

function run(args) {
  return spawnSync(process.execPath, [checker, ...args], { encoding: 'utf8' });
}

test('PROVED somente quando probe sai 0', () => {
  const r = run(['--step', 'self.pass', '--phase', 'POST', '--', process.execPath, '-e', 'process.exit(0)']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /"status":"PROVED"/);
  assert.match(r.stdout, /"previous_flow_continues":true/);
});

test('exit não-zero vira BROKEN e não PASS', () => {
  const r = run(['--step', 'self.fail', '--phase', 'POST', '--', process.execPath, '-e', 'process.exit(7)']);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /"status":"BROKEN"/);
  assert.doesNotMatch(r.stdout, /"status":"PROVED"/);
});

test('executável inexistente vira BLOCKED', () => {
  const r = run(['--step', 'self.blocked', '--phase', 'PRE', '--', '__centraldark_missing_executable__']);
  assert.equal(r.status, 3);
  assert.match(r.stdout, /"status":"BLOCKED"/);
});

test('segredos são sanitizados da saída', () => {
  const r = run([
    '--step', 'self.redact', '--phase', 'CONSUMER', '--',
    process.execPath, '-e', "console.log('token=abc123 secret:xyz987')",
  ]);
  assert.equal(r.status, 0);
  assert.doesNotMatch(r.stdout, /abc123|xyz987/);
  assert.match(r.stdout, /OCULTO/);
});
