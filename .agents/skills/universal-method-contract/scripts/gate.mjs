#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const VALIDATOR = path.join(ROOT, 'apps/modulos/HERMES-CORE/core/universal-method-contract.mjs');
const CONTRACT = path.join(ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml');
const SKILL = path.join(ROOT, '.agents/skills/universal-method-contract/SKILL.md');
const ALLOWED_DIRECTIONS = new Set(['UNI', 'BI', 'RETURN']);
const ALLOWED_PHASES = new Set(['ENTRY', 'EXIT', 'DIAGNOSE']);
const REOPEN_REASONS = new Set([
  'SAME_OBJECT_PROVEN_IMPROVEMENT',
  'SAME_OWNER_DOMAIN_EXPANSION',
]);

function sha256Buffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function fileMeta(inputPath) {
  const abs = path.isAbsolute(inputPath) ? inputPath : path.resolve(ROOT, inputPath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return { path: inputPath, exists: false, bytes: null, sha256: null };
  }
  const data = fs.readFileSync(abs);
  return {
    path: inputPath,
    exists: true,
    bytes: data.length,
    sha256: sha256Buffer(data),
  };
}

function gitRevParse(...refs) {
  for (const ref of refs) {
    const cp = spawnSync('git', ['-C', ROOT, 'rev-parse', '--verify', ref], {
      encoding: 'utf8',
    });
    if (cp.status === 0 && cp.stdout.trim()) return cp.stdout.trim();
  }
  return null;
}

function parseArgs(argv) {
  const out = { logs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') out.selfTest = true;
    else if (arg === '--consolidated') out.consolidated = true;
    else if (arg === '--phase') out.phase = argv[++i];
    else if (arg === '--object') out.objectId = argv[++i];
    else if (arg === '--owner') out.owner = argv[++i];
    else if (arg === '--writer-scope') out.writerScope = argv[++i];
    else if (arg === '--direction') out.direction = argv[++i];
    else if (arg === '--reopen-reason') out.reopenReason = argv[++i];
    else if (arg === '--evidence-hash') out.evidenceHash = argv[++i];
    else if (arg === '--result-hash') out.resultHash = argv[++i];
    else if (arg === '--result-file') out.resultFile = argv[++i];
    else if (arg === '--action') out.action = argv[++i];
    else if (arg === '--next-cursor') out.nextCursor = argv[++i];
    else if (arg === '--log') out.logs.push(argv[++i]);
    else if (arg === '--receipt-dir') out.receiptDir = argv[++i];
    else if (arg === '--operating-mode') out.operatingMode = argv[++i];
    else if (arg === '--authority') out.authority = argv[++i];
    else if (arg === '--authorization-source') out.authorizationSource = argv[++i];
    else throw new Error(`UNKNOWN_ARGUMENT:${arg}`);
  }
  return out;
}

function runUniversalValidator() {
  const cp = spawnSync(process.execPath, [VALIDATOR, '--self-test'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return {
    passed: cp.status === 0,
    exit_code: cp.status,
    stdout: {
      bytes: Buffer.byteLength(cp.stdout || '', 'utf8'),
      sha256: sha256Buffer(Buffer.from(cp.stdout || '', 'utf8')),
    },
    stderr: {
      bytes: Buffer.byteLength(cp.stderr || '', 'utf8'),
      sha256: sha256Buffer(Buffer.from(cp.stderr || '', 'utf8')),
    },
  };
}

function validHash(value) {
  return typeof value === 'string' && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(value);
}

function lockDecision(args) {
  if (!args.consolidated) return { allowed: true, state: 'OPEN_UNCONSOLIDATED' };
  const reason = String(args.reopenReason || '').toUpperCase();
  if (!REOPEN_REASONS.has(reason)) {
    return { allowed: false, state: 'LOCKED', reason: 'CONSOLIDATED_LOCK_NO_VALID_REOPEN_REASON' };
  }
  if (!validHash(args.evidenceHash)) {
    return { allowed: false, state: 'LOCKED', reason: 'REOPEN_REQUIRES_NEW_MATERIAL_EVIDENCE_HASH' };
  }
  return { allowed: true, state: 'REOPENED_BY_PROVED_DELTA', reason };
}

function pombo64Plus(envelope) {
  const plaintext = Buffer.from(JSON.stringify(envelope), 'utf8');
  return {
    mode: 'CHECKSUM_ON',
    encoding: 'BASE64URL_UTF8',
    payload: plaintext.toString('base64url'),
    plaintext_sha256: sha256Buffer(plaintext),
    is_proof: false,
    base64_is_security: false,
  };
}

function dependencyFingerprint(parts) {
  return sha256Buffer(Buffer.from(parts.filter(Boolean).join('|'), 'utf8'));
}

function writeReceipt(receipt, requestedDir) {
  const rawDir = requestedDir || process.env.CENTRALDARK_UNIVERSAL_RECEIPT_DIR;
  if (!rawDir) return null;
  const dir = path.isAbsolute(rawDir) ? rawDir : path.resolve(ROOT, rawDir);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const safeTs = receipt.observed_at_utc.replace(/[:.]/g, '-');
  const file = path.join(dir, `${safeTs}-${receipt.trace_id}.json`);
  fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  return file;
}

function buildReceipt(args, validator, verdict, reason, lock) {
  const phase = String(args.phase || 'DIAGNOSE').toUpperCase();
  const direction = String(args.direction || 'UNKNOWN').toUpperCase();
  const now = new Date().toISOString();
  const operatingMode = String(
    args.operatingMode || process.env.CENTRALDARK_OPERATING_MODE || 'STANDARD'
  ).toUpperCase();
  const authorityModeRaw = args.authority || process.env.CENTRALDARK_AUTHORITY_MODE || '';
  const authorityMode = String(authorityModeRaw).trim().toUpperCase() || null;
  const authorizationSource = args.authorizationSource || process.env.CENTRALDARK_AUTHORITY_SOURCE || null;
  const inheritedPreprodAuthority = (
    operatingMode === 'PRIVATE_PREPROD'
    && authorityMode === 'PERMITO-SEGREDO'
  );
  const head = gitRevParse('HEAD');
  const main = gitRevParse('refs/remotes/origin/main', 'refs/heads/main');
  const validatorMeta = fileMeta(path.relative(ROOT, VALIDATOR));
  const contractMeta = fileMeta(path.relative(ROOT, CONTRACT));
  const skillMeta = fileMeta(path.relative(ROOT, SKILL));
  const logs = args.logs.map(fileMeta);
  const resultMeta = args.resultFile ? fileMeta(args.resultFile) : null;
  const resultHash = args.resultHash || resultMeta?.sha256 || null;
  const depFingerprint = dependencyFingerprint([
    validatorMeta.sha256,
    contractMeta.sha256,
    skillMeta.sha256,
    args.objectId,
    args.owner,
    head,
  ]);
  const traceId = sha256Buffer(Buffer.from([
    now,
    phase,
    direction,
    args.objectId || '',
    args.owner || '',
    head || '',
    depFingerprint,
  ].join('|'), 'utf8')).slice(0, 24);

  const core = {
    schema: 'centraldark.universal-method-gate.receipt.v1',
    observed_at_utc: now,
    trace_id: traceId,
    law_order_1: 'NO_LATERAL_ROUTE',
    operating_mode: operatingMode,
    authority_mode: authorityMode,
    authorization_source: authorizationSource,
    inherited_preprod_authority: inheritedPreprodAuthority,
    per_step_reask_required: !inheritedPreprodAuthority,
    action_policy: inheritedPreprodAuthority ? 'EXECUTE_MEASURE_PROVE' : 'STANDARD_GATE_POLICY',
    security_hardening_policy: operatingMode === 'PRIVATE_PREPROD'
      ? 'CAUSAL_OR_REAL_EXPOSURE_ONLY'
      : 'STANDARD',
    secret_use_surface: 'LOCAL_AUTHENTICATED_RUNTIME_TTY_ENV_OR_SECRET_STORE',
    secret_republication: 'FORBIDDEN',
    phase,
    direction,
    object_id: args.objectId || null,
    owner: args.owner || null,
    writer_scope: args.writerScope || null,
    main_sha: main,
    target_sha: head,
    dependency_fingerprint: depFingerprint,
    centraldark_runtime_fingerprint: process.env.CENTRALDARK_RUNTIME_FINGERPRINT || null,
    hermes_runtime_fingerprint: process.env.HERMES_RUNTIME_FINGERPRINT || null,
    universal_validator: validatorMeta,
    universal_contract: contractMeta,
    mandatory_skill: skillMeta,
    validator_run: validator,
    logs,
    action: args.action || null,
    result_hash: resultHash,
    result_file: resultMeta,
    consolidated_lock: lock,
    verdict,
    reason,
    next_cursor: args.nextCursor || (
      verdict === 'PASS'
        ? 'CONTINUE_CANONICAL_ROUTE'
        : 'CENTRALDARK→ACORDAR→CALIBRAR→MULTIBUSSOLA→META_LUPA→OWNER→MINIMUM_CAUSAL_DELTA'
    ),
  };
  return { ...core, pombo64_plus: pombo64Plus(core) };
}

function decide(args, validator) {
  const phase = String(args.phase || '').toUpperCase();
  const direction = String(args.direction || '').toUpperCase();

  if (!ALLOWED_PHASES.has(phase)) return ['BLOCKED', 'INVALID_OR_MISSING_PHASE'];
  if (!ALLOWED_DIRECTIONS.has(direction)) return ['BLOCKED', 'LATERAL_OR_UNKNOWN_ROUTE_FORBIDDEN'];
  if (!args.objectId) return ['BLOCKED', 'OBJECT_ID_REQUIRED'];
  if (!args.owner) return ['BLOCKED', 'OWNER_REQUIRED'];
  if (!validator.passed) return ['BLOCKED', 'UNIVERSAL_METHOD_CONTRACT_FAILED'];

  const lock = lockDecision(args);
  if (!lock.allowed) return ['BLOCKED', lock.reason];

  if (phase === 'EXIT') {
    const resultHash = args.resultHash || (args.resultFile ? fileMeta(args.resultFile).sha256 : null);
    if (!validHash(resultHash)) return ['BLOCKED', 'EXIT_REQUIRES_RESULT_HASH_OR_RESULT_FILE'];
  }

  if (phase === 'DIAGNOSE') return ['PASS', 'DIAGNOSTIC_ROUTE_BOUND_TO_CANONICAL_GATE'];
  return ['PASS', `${phase}_GATE_PROVED`];
}

function selfTest() {
  const fakeValidator = { passed: true, exit_code: 0, stdout: { bytes: 0, sha256: '0'.repeat(64) }, stderr: { bytes: 0, sha256: '0'.repeat(64) } };
  const base = { phase: 'ENTRY', direction: 'UNI', objectId: 'obj', owner: 'owner' };
  if (decide(base, fakeValidator)[0] !== 'PASS') throw new Error('SELFTEST_ENTRY');
  if (decide({ ...base, direction: 'LATERAL' }, fakeValidator)[0] !== 'BLOCKED') throw new Error('SELFTEST_LATERAL');
  if (lockDecision({ ...base, consolidated: true }).allowed) throw new Error('SELFTEST_LOCK');
  if (!lockDecision({ ...base, consolidated: true, reopenReason: 'SAME_OBJECT_PROVEN_IMPROVEMENT', evidenceHash: 'a'.repeat(64) }).allowed) throw new Error('SELFTEST_REOPEN');
  if (decide({ ...base, phase: 'EXIT' }, fakeValidator)[0] !== 'BLOCKED') throw new Error('SELFTEST_EXIT_HASH');
  const envelope = { hello: 'centraldark' };
  const p = pombo64Plus(envelope);
  const decoded = Buffer.from(p.payload, 'base64url');
  if (sha256Buffer(decoded) !== p.plaintext_sha256) throw new Error('SELFTEST_POMBO64');
  return {
    schema: 'centraldark.universal-method-gate.self-test.v1',
    status: 'PASS',
    tests: 6,
    no_lateral_route: true,
    consolidated_lock: true,
    pombo_mode: 'CHECKSUM_ON',
    private_preprod_action_mode: true,
    permito_segredo_is_mission_scoped_not_per_step: true,
  };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(JSON.stringify({ verdict: 'BLOCKED', reason: String(error.message || error) }, null, 2));
    process.exitCode = 2;
    return;
  }

  if (args.selfTest) {
    try {
      console.log(JSON.stringify(selfTest(), null, 2));
    } catch (error) {
      console.error(JSON.stringify({ status: 'FAIL', reason: String(error.message || error) }, null, 2));
      process.exitCode = 1;
    }
    return;
  }

  const validator = runUniversalValidator();
  const [verdict, reason] = decide(args, validator);
  const lock = lockDecision(args);
  const receipt = buildReceipt(args, validator, verdict, reason, lock);
  const written = writeReceipt(receipt, args.receiptDir);
  if (written) receipt.receipt_path = written;
  console.log(JSON.stringify(receipt, null, 2));

  // Somente PASS usa exit 0. NO_CHANGE/UNKNOWN/BLOCKED/FAIL nunca podem parecer PASS.
  process.exitCode = verdict === 'PASS' ? 0 : 2;
}

main();
