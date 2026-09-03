#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CORE = resolve(HERE, '..', '..');
const CODE_EXTS = new Set(['.js', '.mjs', '.cjs']);
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', 'backups']);

const SECRET_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
  /\b(?:sk|ghp|github_pat|xox[baprs])-[-A-Za-z0-9_]{12,}/g,
  /\beyJ[A-Za-z0-9._-]{20,}/g,
  /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi,
];

export function redact(value) {
  let text = String(value ?? '');
  for (const rx of SECRET_PATTERNS) text = text.replace(rx, '[REDACTED]');
  return text;
}

function clean(value, max = 2000) {
  return redact(value).replace(/\u0000/g, '').slice(0, max);
}

function lower(value) {
  return String(value ?? '').toLowerCase();
}

export function classifyExternalSignal(raw = {}) {
  const event = {
    source: clean(raw.source || raw.kind || 'external', 80),
    sender: clean(raw.sender || '', 160),
    subject: clean(raw.subject || raw.title || '', 500),
    body: clean(raw.body || raw.snippet || raw.summary || '', 8000),
    url: clean(raw.url || '', 1000),
    observed_at: clean(raw.observed_at || new Date().toISOString(), 80),
  };
  const hay = lower(`${event.source}\n${event.sender}\n${event.subject}\n${event.body}\n${event.url}`);
  const findings = [];

  const isForwarded = /(^|\s)(fwd:|fw:|enc:|mensagem encaminhada)/i.test(`${event.subject}\n${event.body}`);
  const isDependabot = /dependabot/.test(hay);
  const isAios = /(synkraai|synkra|skynkra|aiox(?:-core)?)/.test(hay);
  const hasSyntaxSignal = /(syntaxerror|does not parse|node --check|parse error|non-async|await inside)/.test(hay);
  const hasSilentFallback = /(fallback|degrad(?:e|ed|a)|silently|silencios|try\/catch|try\s*\{|lazy require|require\(|dynamic import)/.test(hay);
  const hasFix = /\b(fix|bug|regression|correction|corre[cç][aã]o|patch|pr\s*#?\d+)/.test(hay);
  const hasRelease = /\b(release|released|version|v\d+\.\d+)/.test(hay);

  if (isForwarded) findings.push({
    id: 'FORWARDED_SOURCE',
    state: 'OBSERVED',
    summary: 'Mensagem encaminhada detectada; classificar pelo conteúdo encapsulado, não só pelo remetente externo.',
    next: 'PRESERVE_PROVENANCE_AND_CLASSIFY_BODY',
  });

  if (isAios && hasFix) findings.push({
    id: 'EXTERNAL_AI_CORE_FIX',
    state: 'CANDIDATE',
    summary: 'Correção do ecossistema Synkra/AIOS detectada como fonte externa candidata.',
    next: 'COMPARE_WITH_CENTRALDARK_OWNER',
  });

  if (hasSyntaxSignal) findings.push({
    id: 'NODE_SYNTAX_SWEEP',
    state: 'CANDIDATE',
    summary: 'Adicionar/usar varredura barata com node --check para JS/MJS/CJS que lint/typecheck possam ignorar.',
    next: 'SCAN_HERMES_CORE_AND_RELEVANT_IGNORED_PATHS',
  });

  if (hasSilentFallback) findings.push({
    id: 'SILENT_FALLBACK_AUDIT',
    state: 'CANDIDATE',
    summary: 'Auditar imports/requires protegidos por catch que podem mascarar módulo morto e degradar silenciosamente.',
    next: 'SEEK_DISCRIMINATING_TEST_BEFORE_PATCH',
  });

  if (isDependabot) findings.push({
    id: 'DEPENDABOT_SIGNAL',
    state: 'OBSERVED',
    summary: 'Evento Dependabot deve passar pelo mesmo classificador/owner e produzir receipt antes de qualquer merge.',
    next: 'APPLY_DEPENDABOT_POLICY_AND_SAME_HEAD_GATES',
  });

  if (hasRelease && findings.length === 0) findings.push({
    id: 'EXTERNAL_RELEASE',
    state: 'CANDIDATE',
    summary: 'Release externa detectada; ainda sem prova de aplicabilidade à CentralDark.',
    next: 'COMPARE_CAPABILITY_WITH_EXISTING_OWNER',
  });

  const material = findings.some((f) => f.state === 'CANDIDATE');
  return {
    schema: 'centraldark.signal-watch.v1',
    mode: 'external_event',
    state: material ? 'CANDIDATE' : findings.length ? 'OBSERVED' : 'NO_DELTA',
    source: event.source,
    observed_at: event.observed_at,
    subject: event.subject,
    url: event.url,
    findings,
    invariants: [
      'SOURCE_IS_PROVENANCE_NOT_AUTHORITY',
      'UNKNOWN_IS_NOT_PASS',
      'DOCUMENTED_IS_NOT_EXECUTED',
      'ONE_SYSTEM_ONLY',
      'ONE_WRITER_PER_SCOPE',
      'NO_DIRECT_MAIN_WRITE',
    ],
  };
}

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.agents') continue;
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.isFile() && CODE_EXTS.has(extname(entry.name))) out.push(full);
  }
  return out;
}

async function nodeCheck(file) {
  try {
    await pexec(process.execPath, ['--check', file], { timeout: 15_000, maxBuffer: 1024 * 1024 });
    return { file, ok: true };
  } catch (error) {
    return {
      file,
      ok: false,
      error: clean(error?.stderr || error?.stdout || error?.message || 'node --check failed', 1500),
    };
  }
}

function silentFallbackCandidates(file, source) {
  const candidates = [];
  const hasDynamicLoad = /\brequire\s*\(|\bimport\s*\(/.test(source);
  if (!hasDynamicLoad) return candidates;

  const catchBlocks = source.match(/catch\s*(?:\([^)]*\))?\s*\{[\s\S]{0,700}?\}/g) || [];
  for (const block of catchBlocks) {
    const quiet = /catch\s*(?:\([^)]*\))?\s*\{\s*(?:\/\*[\s\S]*?\*\/\s*)?(?:\}|return\b|continue\b|;)/.test(block);
    const fallbackish = /(fallback|default|return\s+[^;]+|continue|optional|ignore|ignora)/i.test(block);
    if (quiet || fallbackish) {
      candidates.push({
        file,
        state: 'CANDIDATE',
        summary: 'Carga dinâmica coexistindo com catch tolerante; verificar se erro de path/import pode degradar silenciosamente.',
      });
      break;
    }
  }
  return candidates;
}

export async function scanHermesCore(corePath = DEFAULT_CORE) {
  const root = resolve(corePath);
  if (!existsSync(root)) {
    return {
      schema: 'centraldark.signal-watch.v1',
      mode: 'hermes_core_scan',
      state: 'BLOCKED',
      root,
      reason: 'HERMES_CORE_PATH_NOT_FOUND',
      findings: [],
    };
  }

  const files = await walk(root);
  const syntax = [];
  const fallback = [];
  const concurrency = Math.max(1, Math.min(8, Number(process.env.CENTRALDARK_SIGNAL_SCAN_WORKERS || 4)));

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    syntax.push(...await Promise.all(batch.map(nodeCheck)));
  }

  for (const file of files) {
    const source = await readFile(file, 'utf8').catch(() => '');
    fallback.push(...silentFallbackCandidates(file, source));
  }

  const syntaxFailures = syntax.filter((item) => !item.ok);
  const findings = [
    ...syntaxFailures.map((item) => ({
      id: 'NODE_CHECK_FAIL',
      state: 'FAIL',
      file: item.file,
      summary: item.error,
      next: 'FIX_PARSE_ERROR_BEFORE_RUNTIME',
    })),
    ...fallback.map((item) => ({
      id: 'SILENT_FALLBACK_CANDIDATE',
      ...item,
      next: 'PROVE_WITH_PATH_RESOLUTION_TEST',
    })),
  ];

  return {
    schema: 'centraldark.signal-watch.v1',
    mode: 'hermes_core_scan',
    state: syntaxFailures.length ? 'FAIL' : fallback.length ? 'CANDIDATE' : 'PROVEN',
    root,
    files_scanned: files.length,
    node_check_passed: syntax.length - syntaxFailures.length,
    node_check_failed: syntaxFailures.length,
    silent_fallback_candidates: fallback.length,
    findings,
    proof: syntaxFailures.length ? 'NODE_CHECK_FAILURE_OBSERVED' : 'NODE_CHECK_ALL_SCANNED_FILES_PASS',
    caveat: 'STATIC_FALLBACK_CANDIDATE_IS_NOT_RUNTIME_FAILURE',
  };
}

export function renderGamifiedCard(result) {
  const icon = result.state === 'PROVEN' ? '🟢' : result.state === 'FAIL' ? '🔴' : result.state === 'BLOCKED' ? '🟠' : result.state === 'NO_DELTA' ? '⚪' : '🟣';
  const rows = (result.findings || []).slice(0, 6).map((f, i) => `${i + 1}. ${f.id} [${f.state}] — ${clean(f.summary, 240)}`);
  return [
    '🧿 CENTRALDARK SIGNAL WATCH',
    `${icon} STATE=${result.state}`,
    `🎯 MODE=${result.mode}`,
    result.subject ? `✉️ ${clean(result.subject, 180)}` : null,
    Number.isFinite(result.files_scanned) ? `🧩 FILES=${result.files_scanned} NODE_CHECK_FAIL=${result.node_check_failed} FALLBACK_CANDIDATES=${result.silent_fallback_candidates}` : null,
    ...rows,
    '🧠 CANDIDATE != PROVEN',
    '🔒 UNKNOWN != PASS · DOCUMENTED != EXECUTED',
  ].filter(Boolean).join('\n');
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function cli() {
  if (process.argv.includes('--scan-core')) {
    const root = argValue('--core') || DEFAULT_CORE;
    const result = await scanHermesCore(root);
    result.card = renderGamifiedCard(result);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.state === 'FAIL' ? 2 : 0;
    return;
  }

  const encoded = argValue('--event-b64');
  const eventFile = argValue('--event-file');
  let raw = {};
  if (encoded) raw = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  else if (eventFile) raw = JSON.parse(await readFile(resolve(eventFile), 'utf8'));
  else if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) data += chunk;
    if (data.trim()) raw = JSON.parse(data);
  }
  const result = classifyExternalSignal(raw);
  result.card = renderGamifiedCard(result);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    process.stderr.write(`${redact(error?.stack || error?.message || error)}\n`);
    process.exitCode = 1;
  });
}
