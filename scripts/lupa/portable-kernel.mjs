#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..', '..');
const argv = process.argv.slice(2);

function valueAfter(name, fallback = '') {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const ROOT = resolve(valueAfter('--repo-root', DEFAULT_ROOT));
const JSON_ONLY = argv.includes('--json');
const EXPORT_PATH = valueAfter('--export', '');
const CONTRACT = 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json';

const CANONICAL_FILES = [
  'LEIA-ME-IA.md',
  'AGENTS.md',
  'docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md',
  'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md',
  'docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md',
  CONTRACT,
  'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md',
  '.agents/skills/meta-lupa/SKILL.md',
  '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA',
];

function git(args) {
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function load(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function fail(code, details = {}) {
  const out = { ok: false, status: 'BLOCKED', code, ...details };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(2);
}

function validateContract(contract) {
  const errors = [];
  const image = contract.multimodal_input_policy ?? {};
  const portable = contract.portable_boot_policy ?? {};

  if (image.marker !== 'IMAGE_INPUT_IS_OPERATIONAL') errors.push('IMAGE_MARKER');
  if (image.image_is_sensor !== true) errors.push('IMAGE_NOT_SENSOR');
  if (image.screenshot_is_current_truth !== false) errors.push('SCREENSHOT_MUST_NOT_BE_CURRENT_TRUTH');
  if (image.screenshot_is_trigger_for_live_measurement !== true) errors.push('SCREENSHOT_MUST_TRIGGER_LIVE_MEASUREMENT');
  if (image.live_state_required_before_mutation !== true) errors.push('LIVE_REMEASURE_REQUIRED');
  if (image.material_visual_finding_action !== 'REMEASURE_LIVE_SOURCE_THEN_ACT_MINIMALLY') errors.push('IMAGE_ACTION_INVALID');

  if (portable.marker !== 'CENTRALDARK_PORTABLE_KERNEL') errors.push('PORTABLE_MARKER');
  if (portable.canonical_entrypoint !== 'LEIA-ME-IA.md') errors.push('PORTABLE_ENTRYPOINT');
  if (portable.package_is_cache_not_authority !== true) errors.push('PACKAGE_MUST_BE_CACHE');
  if (portable.package_source !== 'LIVE_REPOSITORY_CANONICAL_FILES') errors.push('PACKAGE_SOURCE_INVALID');
  if (portable.stale_package_action !== 'REBUILD_FROM_LIVE_REPOSITORY') errors.push('STALE_PACKAGE_ACTION_INVALID');
  if (portable.export_must_bind_to_head_sha !== true) errors.push('EXPORT_HEAD_BINDING_REQUIRED');
  if (portable.export_must_hash_each_member !== true) errors.push('EXPORT_MEMBER_HASH_REQUIRED');
  if (portable.model_provider_lock !== false) errors.push('MODEL_LOCK_FORBIDDEN');
  if (portable.never_overwrite_newer_live_state !== true) errors.push('NEWER_LIVE_STATE_MUST_WIN');

  return errors;
}

for (const file of CANONICAL_FILES) {
  if (!existsSync(join(ROOT, file))) fail('CANONICAL_FILE_MISSING', { file });
}

let contract;
try {
  contract = JSON.parse(load(CONTRACT));
} catch (error) {
  fail('CONTRACT_JSON_INVALID', { error: String(error?.message || error) });
}

const contractErrors = validateContract(contract);
if (contractErrors.length) fail('PORTABLE_CONTRACT_INVALID', { errors: contractErrors });

let head = '';
let branch = '';
let dirty = '';
try {
  head = git(['rev-parse', 'HEAD']);
  branch = git(['branch', '--show-current']) || 'DETACHED';
  dirty = git(['status', '--porcelain']);
} catch (error) {
  fail('GIT_STATE_UNAVAILABLE', { error: String(error?.message || error) });
}

if (!/^[0-9a-f]{40}$/i.test(head)) fail('HEAD_INVALID', { head });

const members = CANONICAL_FILES.map((path) => {
  const content = load(path);
  return {
    path,
    sha256: sha256(content),
    bytes: Buffer.byteLength(content),
    content,
  };
});

const packageObject = {
  schema_version: 1,
  package_id: 'CENTRALDARK_PORTABLE_KERNEL',
  repository: 'ServerVpss/CentralDark',
  source_of_truth: 'LIVE_GIT_STATE',
  head_sha: head,
  branch,
  dirty: Boolean(dirty),
  rule: 'MENOR_MOVIMENTO_EFICAZ',
  canonical_entrypoint: 'LEIA-ME-IA.md',
  package_is_cache_not_authority: true,
  stale_package_action: 'REBUILD_FROM_LIVE_REPOSITORY',
  import_rule: 'DELTA_ONLY_AFTER_LIVE_REMEASURE_WRITER_SCOPE_AND_INDEPENDENT_JUDGE',
  members,
};

const canonicalPayload = JSON.stringify(packageObject);
const packageSha256 = sha256(canonicalPayload);
const receipt = {
  ok: true,
  status: 'PASS',
  package_id: packageObject.package_id,
  head_sha: head,
  branch,
  dirty: Boolean(dirty),
  members: members.length,
  package_sha256: packageSha256,
  export_path: EXPORT_PATH || null,
  image_sensor_policy: 'PASS',
  portable_boot_policy: 'PASS',
};

if (EXPORT_PATH) {
  const exported = {
    ...packageObject,
    package_sha256: packageSha256,
  };
  writeFileSync(resolve(ROOT, EXPORT_PATH), `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
}

if (JSON_ONLY || EXPORT_PATH) {
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} else {
  process.stdout.write([
    'CENTRALDARK_PORTABLE_KERNEL=PASS',
    `HEAD_SHA=${head}`,
    `BRANCH=${branch}`,
    `DIRTY=${Boolean(dirty) ? '1' : '0'}`,
    `MEMBERS=${members.length}`,
    `PACKAGE_SHA256=${packageSha256}`,
    'IMAGE_INPUT_IS_OPERATIONAL=PASS',
    'SCREENSHOT_CURRENT_TRUTH=0',
    'SCREENSHOT_TRIGGERS_LIVE_REMEASURE=1',
    'STALE_PACKAGE_ACTION=REBUILD_FROM_LIVE_REPOSITORY',
  ].join('\n') + '\n');
}
