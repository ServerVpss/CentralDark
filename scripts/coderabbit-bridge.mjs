#!/usr/bin/env node
/*
 * CodeRabbit / Zendrive review bridge — CentralDark.
 *
 * Papel: agregar sinais de revisão e entregá-los ao Signal Watcher.
 * NÃO faz merge. NÃO altera PR. NÃO transforma ausência em zero/PASS.
 *
 * Fontes opcionais:
 *   RABBIT_A_URL / RABBIT_B_URL  -> endpoints legados read-only
 *   ZENDRIVE_REVIEW_FILE          -> receipt centraldark.zendrive-handoff.v1
 *
 * Fluxo:
 *   Zendrive/ChatGPT review -> bridge -> Signal Watcher -> Hermes testa/contraprova.
 */

import fs from 'node:fs';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const SIGNAL_WATCH = resolve(REPO_ROOT, 'scripts', 'hermes', 'signal-watch-notify.mjs');
const MINERALIZER = resolve(REPO_ROOT, 'scripts', 'hermes', 'signal-mineralize.mjs');
const LOGDIR = resolve(process.env.LOGDIR || './logs');
const LOGFILE = resolve(LOGDIR, 'coderabbit-bridge.log');

const RABBIT_A = (process.env.RABBIT_A_URL || '').trim();
const RABBIT_B = (process.env.RABBIT_B_URL || '').trim();
const CENTRAL_URL = (process.env.CENTRALDARK_API_URL || '').trim();
const ZENDRIVE_REVIEW_FILE = (process.env.ZENDRIVE_REVIEW_FILE || '').trim();

function redact(value) {
  return String(value ?? '')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [REDACTED]')
    .replace(/\b(?:sk|ghp|github_pat|xox[baprs])-[-A-Za-z0-9_]{12,}/g, '[REDACTED]');
}

async function log(...args) {
  await mkdir(LOGDIR, { recursive: true });
  const line = `[${new Date().toISOString()}] ${args.map(redact).join(' ')}\n`;
  await appendFile(LOGFILE, line, 'utf8');
  console.log(...args.map(redact));
}

async function getJson(url, source) {
  if (!url) return { source, state: 'UNKNOWN', reason: 'SOURCE_URL_UNCONFIGURED', payload: null };
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { source, state: 'QUEBRADO', reason: `HTTP_${response.status}`, payload };
    }
    return { source, state: 'PROVADO', reason: null, payload };
  } catch (error) {
    return { source, state: 'QUEBRADO', reason: redact(error?.message || error), payload: null };
  }
}

function numericBalance(result) {
  if (result?.state !== 'PROVADO') return null;
  const value = result.payload?.balance ?? result.payload?.data?.balance;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function loadZendriveReceipt() {
  if (!ZENDRIVE_REVIEW_FILE) {
    return { source: 'zendrive_chatgpt_review', state: 'UNKNOWN', reason: 'ZENDRIVE_REVIEW_FILE_UNCONFIGURED', payload: null };
  }
  try {
    const payload = JSON.parse(await readFile(resolve(ZENDRIVE_REVIEW_FILE), 'utf8'));
    if (payload?.schema !== 'centraldark.zendrive-handoff.v1') {
      return { source: 'zendrive_chatgpt_review', state: 'QUEBRADO', reason: 'INVALID_ZENDRIVE_RECEIPT_SCHEMA', payload: null };
    }
    const text = payload?.gateway_response?.choices?.[0]?.message?.content;
    if (!text || !String(text).trim()) {
      return { source: 'zendrive_chatgpt_review', state: 'UNKNOWN', reason: 'REVIEW_TEXT_ABSENT', payload };
    }
    return { source: 'zendrive_chatgpt_review', state: 'PROVADO', reason: null, payload };
  } catch (error) {
    return { source: 'zendrive_chatgpt_review', state: 'QUEBRADO', reason: redact(error?.message || error), payload: null };
  }
}

function zendriveSignal(zendrive) {
  const payload = zendrive?.payload || {};
  const context = payload?.randolf_context || {};
  const text = payload?.gateway_response?.choices?.[0]?.message?.content || '';
  return {
    source: 'zendrive_chatgpt_review',
    sender: context.profile_display || context.profile_id || 'authenticated_local_profile',
    subject: 'Zendrive / ChatGPT — revisão consultiva de código',
    body: String(text).slice(0, 8000),
    url: '',
    observed_at: new Date().toISOString(),
    metadata: {
      source_surface: context.source_surface || 'HERMES_DESKTOP_ZENDRIVE',
      session_id: context.session_id || null,
      profile_id: context.profile_id || null,
      head_sha: context.head_sha || null,
      role: 'REVIEW_ONLY',
      next: 'HERMES_REPRODUCE_TEST_AND_COUNTERPROVE',
    },
  };
}

async function runSignalWatcher(event) {
  if (!fs.existsSync(SIGNAL_WATCH)) {
    return { state: 'QUEBRADO', reason: 'SIGNAL_WATCHER_ABSENT', receipt: null };
  }
  const encoded = Buffer.from(JSON.stringify(event), 'utf8').toString('base64url');
  try {
    const { stdout } = await pexec(process.execPath, [SIGNAL_WATCH, '--event-b64', encoded], {
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    return { state: 'PROVADO', reason: null, receipt: JSON.parse(stdout) };
  } catch (error) {
    return { state: 'QUEBRADO', reason: redact(error?.stderr || error?.message || error), receipt: null };
  }
}

async function mineralize(signalReceipt) {
  if (!fs.existsSync(MINERALIZER)) {
    return { state: 'QUEBRADO', reason: 'MINERALIZER_ABSENT', receipt: null };
  }
  const encoded = Buffer.from(JSON.stringify(signalReceipt), 'utf8').toString('base64url');
  try {
    const child = await pexec(process.execPath, [MINERALIZER, '--event-b64', encoded], {
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    return { state: 'PROVADO', reason: null, receipt: JSON.parse(child.stdout) };
  } catch (error) {
    return { state: 'QUEBRADO', reason: redact(error?.stderr || error?.message || error), receipt: null };
  }
}

async function notifyCentral(payload) {
  if (!CENTRAL_URL) return { state: 'UNKNOWN', reason: 'CENTRALDARK_API_URL_UNCONFIGURED' };
  try {
    const response = await fetch(CENTRAL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok
      ? { state: 'PROVADO', reason: null, status: response.status }
      : { state: 'QUEBRADO', reason: `HTTP_${response.status}`, status: response.status };
  } catch (error) {
    return { state: 'QUEBRADO', reason: redact(error?.message || error) };
  }
}

async function runOnce() {
  const [rabbitA, rabbitB, zendrive] = await Promise.all([
    getJson(RABBIT_A, 'rabbit_a'),
    getJson(RABBIT_B, 'rabbit_b'),
    loadZendriveReceipt(),
  ]);

  const balA = numericBalance(rabbitA);
  const balB = numericBalance(rabbitB);
  const hasAnyBalance = balA !== null || balB !== null;
  const aggregated = hasAnyBalance ? (balA ?? 0) + (balB ?? 0) : null;

  let signal = { state: 'UNKNOWN', reason: 'ZENDRIVE_REVIEW_NOT_PROVEN', receipt: null };
  let mineral = { state: 'UNKNOWN', reason: 'NO_SIGNAL_TO_MINERALIZE', receipt: null };

  if (zendrive.state === 'PROVADO') {
    signal = await runSignalWatcher(zendriveSignal(zendrive));
    if (signal.state === 'PROVADO' && signal.receipt) {
      mineral = await mineralize(signal.receipt);
    }
  }

  const receipt = {
    schema: 'centraldark.coderabbit-zendrive-review.v2',
    timestamp: new Date().toISOString(),
    role: 'REVIEW_ONLY',
    sources: { rabbit_a: rabbitA, rabbit_b: rabbitB, zendrive },
    legacy_numeric_aggregate: {
      state: hasAnyBalance ? 'PROVADO' : 'UNKNOWN',
      value: aggregated,
      missing_is_zero: false,
    },
    signal_watcher: signal,
    learning_mineral: mineral,
    hermes_next: 'REPRODUCE_TEST_COUNTERPROVE',
    invariants: [
      'ZENDRIVE_REVIEWS_ONLY',
      'RABBIT_REVIEWS_ONLY',
      'HERMES_PROVES_AND_TESTS',
      'REVIEW_IS_NOT_PROOF',
      'REVIEW_IS_NOT_MERGE_AUTHORITY',
      'MISSING_DATA_IS_NOT_ZERO',
      'UNKNOWN_IS_NOT_PASS',
      'NEVER_DISCARD_LEARNING',
    ],
  };

  const central = await notifyCentral(receipt);
  receipt.central_notification = central;
  await log('receipt', JSON.stringify(receipt));
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);

  return zendrive.state === 'QUEBRADO' || signal.state === 'QUEBRADO' ? 2 : 0;
}

async function main() {
  if (process.argv.includes('--once')) {
    process.exitCode = await runOnce();
    return;
  }
  const interval = Math.max(30, Number(process.env.INTERVAL_SECONDS || 300)) * 1000;
  await log('coderabbit-zendrive review bridge starting; interval', interval);
  await runOnce();
  setInterval(() => runOnce().catch((error) => log('loop error', error?.message || error)), interval);
}

main().catch(async (error) => {
  await log('bridge fatal', error?.stack || error?.message || error);
  process.exitCode = 1;
});
