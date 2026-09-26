import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCheckName,
  decideRerunAction,
  loadQueueFabric,
  summarizeQueueRuns,
  validateQueueFabric
} from './centraldark-queue-fabric.mjs';

test('queue fabric manifest is valid and ordered', () => {
  const fabric = loadQueueFabric();
  const result = validateQueueFabric(fabric);

  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(fabric.phases[0].id, '00_BOOT_TRILHO');
  assert.equal(fabric.phases.at(-1).id, '12_DEPENDABOT_CONFLICT_RESOLVER');
});

test('queued and pending checks must wait, never rerun all', () => {
  assert.equal(decideRerunAction({ status: 'queued', conclusion: null }), 'WAIT');
  assert.equal(decideRerunAction({ status: 'pending', conclusion: null }), 'WAIT');
  assert.equal(decideRerunAction({ status: 'in_progress', conclusion: null }), 'WAIT');
});

test('cancelled and failed checks are not pass and need bounded rerun or fix', () => {
  assert.equal(
    decideRerunAction({ status: 'completed', conclusion: 'failure' }),
    'RERUN_FAILED_ONLY_OR_FIX_ROOT_CAUSE'
  );
  assert.equal(
    decideRerunAction({ status: 'completed', conclusion: 'cancelled' }),
    'RERUN_FAILED_ONLY_IF_HEAD_STILL_CURRENT'
  );
  assert.equal(
    decideRerunAction({ status: 'completed', conclusion: 'skipped' }),
    'SKIPPED_IS_VISIBLE_DEBT_NOT_PASS'
  );
});

test('old heads must not be rerun as current proof', () => {
  assert.equal(
    decideRerunAction({ status: 'completed', conclusion: 'failure', headChanged: true }),
    'DO_NOT_RERUN_OLD_HEAD'
  );
});

test('check names are classified into queue phases', () => {
  const fabric = loadQueueFabric();

  assert.equal(classifyCheckName('CENTRALDARK LABEL GATE', fabric), '01_LABEL_GATE');
  assert.equal(classifyCheckName('PR HANDOFF CONTRACT', fabric), '02_HANDOFF_CONTRACT');
  assert.equal(classifyCheckName('CENTRALDARK HORN LINE GATE', fabric), '04_HORN_LINE_GATE');
  assert.equal(classifyCheckName('CENTRALDARK CONNECTOR DEMAND ROUTER', fabric), '05_CONNECTOR_ROUTER');
  assert.equal(classifyCheckName('codex-validate', fabric), '06_CODEX_VALIDATE');
  assert.equal(classifyCheckName('Dependabot conflict resolver', fabric), '12_DEPENDABOT_CONFLICT_RESOLVER');
});

test('queue summary keeps status separate from proof', () => {
  const fabric = loadQueueFabric();
  const summary = summarizeQueueRuns([
    { name: 'PR Title Contract', status: 'queued', conclusion: null },
    { name: 'CodeQL', status: 'completed', conclusion: 'skipped' },
    { name: 'Dependabot conflict resolver', status: 'completed', conclusion: 'failure' }
  ], fabric);

  assert.deepEqual(summary.map((item) => item.rerun_action), [
    'WAIT',
    'SKIPPED_IS_VISIBLE_DEBT_NOT_PASS',
    'RERUN_FAILED_ONLY_OR_FIX_ROOT_CAUSE'
  ]);
});
