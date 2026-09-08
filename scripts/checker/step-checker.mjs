#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const REDACT = /(token|password|authorization|apikey|api_key|secret|bearer|client_secret|refresh_token)([=: ]+)([^\s"']+)/gi;
const redact = (value = '') => String(value).replace(REDACT, '$1$2***OCULTO***');

function failUsage(message) {
  console.error(`[CHECKER] BLOCKED ${message}`);
  process.exit(3);
}

const argv = process.argv.slice(2);
let stepId = '';
let phase = '';
let receiptPath = process.env.CENTRALDARK_CHECKER_RECEIPT || '';
let timeoutMs = Number(process.env.CENTRALDARK_CHECKER_TIMEOUT_MS || 120000);
let split = argv.indexOf('--');
const options = split >= 0 ? argv.slice(0, split) : argv;
const command = split >= 0 ? argv.slice(split + 1) : [];

for (let i = 0; i < options.length; i += 1) {
  const key = options[i];
  const value = options[i + 1];
  if (key === '--step') { stepId = value || ''; i += 1; continue; }
  if (key === '--phase') { phase = value || ''; i += 1; continue; }
  if (key === '--receipt') { receiptPath = value || ''; i += 1; continue; }
  if (key === '--timeout-ms') { timeoutMs = Number(value || 0); i += 1; continue; }
  failUsage(`argumento desconhecido: ${key}`);
}

if (!stepId) failUsage('--step é obrigatório');
if (!phase) failUsage('--phase é obrigatório');
if (!command.length) failUsage('probe obrigatório após --');
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) failUsage('--timeout-ms inválido');

const startedAt = new Date().toISOString();
const [exe, ...args] = command;
const result = spawnSync(exe, args, {
  encoding: 'utf8',
  timeout: timeoutMs,
  windowsHide: true,
  shell: false,
});

const stdout = redact(result.stdout || '');
const stderr = redact(result.stderr || '');
const evidenceDigest = createHash('sha256').update(`${stdout}\n${stderr}`).digest('hex');

let status = 'UNKNOWN';
let errorClass = null;
let exitCode = typeof result.status === 'number' ? result.status : null;

if (result.error) {
  status = 'BLOCKED';
  errorClass = result.error.code || result.error.name || 'SPAWN_ERROR';
} else if (result.signal) {
  status = 'BLOCKED';
  errorClass = `SIGNAL_${result.signal}`;
} else if (exitCode === 0) {
  status = 'PROVED';
} else if (typeof exitCode === 'number') {
  status = 'BROKEN';
  errorClass = `EXIT_${exitCode}`;
}

const receipt = {
  schema: 'centraldark.step-checker.v1',
  step_id: stepId,
  phase,
  status,
  observed_at: new Date().toISOString(),
  started_at: startedAt,
  command: [exe, ...args],
  exit_code: exitCode,
  error_class: errorClass,
  evidence_digest: evidenceDigest,
  action_is_proof: false,
  unknown_is_not_pass: true,
  delta_util_applied: true,
  previous_flow_continues: true,
};

const line = JSON.stringify(receipt);
console.log(`[CHECKER] ${line}`);
if (stdout.trim()) console.log(stdout.trim());
if (stderr.trim()) console.error(stderr.trim());

if (receiptPath) {
  mkdirSync(dirname(receiptPath), { recursive: true });
  appendFileSync(receiptPath, `${line}\n`, { encoding: 'utf8' });
}

if (status === 'PROVED') process.exit(0);
if (status === 'BROKEN') process.exit(2);
process.exit(3);
