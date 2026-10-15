import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const GATE = 'scripts/centraldark/canonical-consumption-gate.mjs';

function run(...args) {
  const r = spawnSync('node', [GATE, ...args], { encoding: 'utf8' });
  return { status: r.status, out: JSON.parse(r.stdout) };
}

test('gate é consultivo: nunca bloqueia e orienta a próxima ação', () => {
  const { status, out } = run('--tool-available', '--unknown-claimed', '--measurement-route-exists');
  assert.equal(status, 0);
  assert.equal(out.non_blocking, true);
  assert.deepEqual(out.next_actions, [
    'ATTEMPT_AVAILABLE_TOOL_THEN_REPORT_MEASURED_RESULT',
    'RUN_MEASUREMENT_ROUTE_FOR_AFFECTED_CLAIM_ONLY',
  ]);
});

test('arquivo canônico ausente é aviso com ação, exit 0', () => {
  const { status, out } = run('--file', 'docs/__nao_existe__.md');
  assert.equal(status, 0);
  assert.equal(out.ok, false);
  assert.equal(out.non_blocking, true);
  assert.deepEqual(out.next_actions, ['READ_CANONICAL_PATH_DIRECT_FROM_MAIN_OR_DECLARE_SOUL_STATUS_UNKNOWN']);
});

test('sem aviso não emite next_actions', () => {
  const { status, out } = run();
  assert.equal(status, 0);
  assert.equal(out.next_actions, undefined);
});
