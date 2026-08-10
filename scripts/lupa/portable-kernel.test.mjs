import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const ROOT = resolve(process.cwd());
const SCRIPT = join(ROOT, 'scripts/lupa/portable-kernel.mjs');
const CONTRACT = join(ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');

function run(args = []) {
  return execFileSync(process.execPath, [SCRIPT, '--repo-root', ROOT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('imagem é sensor e nunca substitui medição viva', () => {
  const contract = JSON.parse(readFileSync(CONTRACT, 'utf8'));
  const image = contract.multimodal_input_policy;
  assert.equal(image.marker, 'IMAGE_INPUT_IS_OPERATIONAL');
  assert.equal(image.image_is_sensor, true);
  assert.equal(image.screenshot_is_current_truth, false);
  assert.equal(image.screenshot_is_trigger_for_live_measurement, true);
  assert.equal(image.live_state_required_before_mutation, true);
  assert.equal(image.material_visual_finding_action, 'REMEASURE_LIVE_SOURCE_THEN_ACT_MINIMALLY');
});

test('pacote portátil é regenerado do HEAD vivo e não vira segunda verdade', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-'));
  const rel = join(temp, 'bundle.json');
  try {
    const receipt = JSON.parse(run(['--json']));
    assert.equal(receipt.ok, true);
    assert.equal(receipt.status, 'PASS');
    assert.equal(receipt.image_sensor_policy, 'PASS');
    assert.equal(receipt.portable_boot_policy, 'PASS');
    assert.match(receipt.head_sha, /^[0-9a-f]{40}$/i);
    assert.ok(receipt.members >= 9);

    const exportedReceipt = JSON.parse(run(['--export', rel, '--json']));
    assert.equal(exportedReceipt.status, 'PASS');
    const bundle = JSON.parse(readFileSync(rel, 'utf8'));
    assert.equal(bundle.head_sha, receipt.head_sha);
    assert.equal(bundle.package_is_cache_not_authority, true);
    assert.equal(bundle.stale_package_action, 'REBUILD_FROM_LIVE_REPOSITORY');
    assert.equal(bundle.import_rule, 'DELTA_ONLY_AFTER_LIVE_REMEASURE_WRITER_SCOPE_AND_INDEPENDENT_JUDGE');
    assert.ok(bundle.members.every((item) => /^[0-9a-f]{64}$/i.test(item.sha256)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
