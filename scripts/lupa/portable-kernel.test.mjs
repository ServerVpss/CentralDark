import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import test from 'node:test';

const ROOT = resolve(process.cwd());
const SCRIPT = join(ROOT, 'scripts/lupa/portable-kernel.mjs');
const CONTRACT = join(ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');
const METACOGNITION = 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md';

function run(args = []) {
  return execFileSync(process.execPath, [SCRIPT, '--repo-root', ROOT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function materializeBundleAsRepo(bundle, root) {
  for (const member of bundle.members) {
    const target = join(root, member.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, member.content, 'utf8');
  }
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'portable-kernel@test.local']);
  git(root, ['config', 'user.name', 'Portable Kernel Test']);
  git(root, ['add', '.']);
  git(root, ['commit', '-q', '-m', 'fixture']);
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

test('kernel FULL deriva DNA condensado e hashes do mesmo HEAD vivo', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-full-'));
  const rel = join(temp, 'bundle.json');
  try {
    const receipt = JSON.parse(run(['--export', rel, '--json']));
    assert.equal(receipt.ok, true);
    assert.equal(receipt.status, 'PASS');
    assert.equal(receipt.mode, 'FULL');
    assert.equal(receipt.image_sensor_policy, 'PASS');
    assert.equal(receipt.portable_boot_policy, 'PASS');
    assert.equal(receipt.runtime_claim, 'UNPROVEN_BY_PORTABLE_KERNEL');
    assert.match(receipt.head_sha, /^[0-9a-f]{40}$/i);
    assert.match(receipt.capability_dna_sha256, /^[0-9a-f]{64}$/i);
    assert.match(receipt.source_fingerprint_sha256, /^[0-9a-f]{64}$/i);
    assert.ok(receipt.members >= 19);
    assert.ok(receipt.capabilities >= 12);
    assert.ok(receipt.condensed_dna_bytes < receipt.source_bytes);

    const bundle = JSON.parse(readFileSync(rel, 'utf8'));
    assert.equal(bundle.schema_version, 2);
    assert.equal(bundle.head_sha, receipt.head_sha);
    assert.equal(bundle.package_is_cache_not_authority, true);
    assert.equal(bundle.stale_package_action, 'REBUILD_FROM_LIVE_REPOSITORY');
    assert.equal(bundle.import_rule, 'DELTA_ONLY_AFTER_LIVE_REMEASURE_WRITER_SCOPE_AND_INDEPENDENT_JUDGE');
    assert.equal(bundle.load_strategy, 'DNA_FIRST_SOURCE_ON_DEMAND');
    assert.equal(bundle.condensed_dna.marker, 'CENTRALDARK_CONDENSED_DNA');
    assert.equal(bundle.condensed_dna.authority, 'SEGREDO/CHEFE');
    assert.equal(bundle.condensed_dna.proof_boundary.does_not_prove.includes('RUNTIME_EFFECT'), true);
    assert.equal(bundle.condensed_dna.proof_boundary.does_not_prove.includes('AGI_OR_CONSCIOUSNESS'), true);
    assert.equal(bundle.condensed_dna.capabilities.length, receipt.capabilities);
    assert.ok(bundle.condensed_dna.capabilities.every((item) => item.state === 'SOURCE_VERIFIED_IN_REPO'));
    assert.ok(bundle.condensed_dna.capabilities.every((item) => item.runtime_state === 'UNPROVEN_BY_PORTABLE_KERNEL'));
    assert.ok(bundle.members.every((item) => /^[0-9a-f]{64}$/i.test(item.sha256)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('kernel COMPACT reproduz o mesmo DNA sem carregar conteúdo integral dos owners', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-compact-'));
  const fullPath = join(temp, 'full.json');
  const compactPath = join(temp, 'compact.json');
  try {
    const fullReceipt = JSON.parse(run(['--export', fullPath, '--json']));
    const compactReceipt = JSON.parse(run(['--export', compactPath, '--compact', '--json']));
    const full = JSON.parse(readFileSync(fullPath, 'utf8'));
    const compact = JSON.parse(readFileSync(compactPath, 'utf8'));

    assert.equal(compactReceipt.status, 'PASS');
    assert.equal(compactReceipt.mode, 'COMPACT');
    assert.equal(compact.package_id, 'CENTRALDARK_PORTABLE_KERNEL_COMPACT');
    assert.equal(compact.head_sha, full.head_sha);
    assert.equal(compact.capability_dna_sha256, fullReceipt.capability_dna_sha256);
    assert.equal(compact.source_fingerprint_sha256, fullReceipt.source_fingerprint_sha256);
    assert.deepEqual(compact.condensed_dna, full.condensed_dna);
    assert.equal(compact.load_strategy, 'DNA_FIRST_SOURCE_ON_DEMAND');
    assert.ok(compact.sources.length >= 19);
    assert.ok(compact.sources.every((item) => !Object.hasOwn(item, 'content')));
    assert.ok(compact.sources.every((item) => /^[0-9a-f]{64}$/i.test(item.sha256)));
    assert.ok(Buffer.byteLength(readFileSync(compactPath)) < Buffer.byteLength(readFileSync(fullPath)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('DNA fail-closed se um owner perder marcador de capacidade condensada', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-drift-'));
  const bundlePath = join(temp, 'bundle.json');
  const fixtureRoot = join(temp, 'repo');
  try {
    run(['--export', bundlePath, '--json']);
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
    mkdirSync(fixtureRoot, { recursive: true });
    materializeBundleAsRepo(bundle, fixtureRoot);

    const metacognitionPath = join(fixtureRoot, METACOGNITION);
    const original = readFileSync(metacognitionPath, 'utf8');
    assert.ok(original.includes('META_EVALUATION_REQUIRED=true'));
    writeFileSync(
      metacognitionPath,
      original.replace('META_EVALUATION_REQUIRED=true', 'META_EVALUATION_REQUIRED=false'),
      'utf8',
    );

    const result = spawnSync(
      process.execPath,
      [SCRIPT, '--repo-root', fixtureRoot, '--json'],
      { cwd: fixtureRoot, encoding: 'utf8' },
    );
    assert.equal(result.status, 2);
    const failure = JSON.parse(result.stdout);
    assert.equal(failure.status, 'BLOCKED');
    assert.equal(failure.code, 'CAPABILITY_MARKER_MISSING');
    assert.equal(failure.capability, 'CROSS_META_EVOLUTION');
    assert.equal(failure.owner, METACOGNITION);
    assert.deepEqual(failure.missing, ['META_EVALUATION_REQUIRED=true']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
