#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(__filename);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const DEFAULT_INBOX = path.join(SCRIPT_DIR, 'inbox');
const DEFAULT_REPORT = path.join(REPO_ROOT, 'logs', 'memory-linker', 'inbox-sentinel-latest.json');
const IGNORE = new Set(['README.md', '.gitkeep', 'routes.json', 'links']);
const SECRET_PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/i,
  /\bsk-[A-Za-z0-9._-]{16,}\b/,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i,
  /(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["']?[^\s"']{12,}/i,
];

function parseArgs(argv) {
  const args = { kanban: false, dryRun: false, inbox: DEFAULT_INBOX, report: DEFAULT_REPORT };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--kanban') args.kanban = true;
    else if (item === '--dry-run') args.dryRun = true;
    else if (item === '--inbox') args.inbox = path.resolve(argv[++i]);
    else if (item === '--report') args.report = path.resolve(argv[++i]);
    else if (item === '--help') {
      console.log('USAGE: inbox-sentinel.mjs [--kanban] [--dry-run] [--inbox <path>] [--report <path>]');
      process.exit(0);
    }
  }
  return args;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function listMaterials(inbox) {
  if (!fs.existsSync(inbox)) return [];
  return fs.readdirSync(inbox, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !IGNORE.has(entry.name))
    .map((entry) => path.join(inbox, entry.name))
    .sort();
}

function classify(filePath) {
  const stat = fs.statSync(filePath);
  const buf = fs.readFileSync(filePath);
  const text = buf.toString('utf8');
  const ext = path.extname(filePath).toLowerCase();
  const secretRisk = SECRET_PATTERNS.some((pattern) => pattern.test(text));
  const validExt = ['.md', '.txt', '.json', '.jsonl'].includes(ext);
  const digest = sha256(buf);
  let status = 'PENDING_DREAM_REVIEW';
  if (!validExt) status = 'QUARANTINE_UNSUPPORTED_EXTENSION';
  if (secretRisk) status = 'BLOCKED_SECRET_RISK';
  return {
    path: path.relative(REPO_ROOT, filePath),
    absolute_path: filePath,
    filename: path.basename(filePath),
    size: stat.size,
    sha256: digest,
    extension: ext || 'NO_EXTENSION',
    status,
    secret_risk: secretRisk,
    idempotency_key: `memory-linker-inbox:${digest}`,
  };
}

function kanbanBody(item) {
  return [
    'INBOX_MINERACAO_OWNER=scripts/memory-linker/',
    'DIRECT_CANONICAL_MUTATION=false',
    'APPLY_ALLOWED=false',
    'DREAM_REVIEW_FIRST=true',
    'META_LUPA_BEFORE_CRYSTALLIZATION=true',
    '',
    `Arquivo: ${item.path}`,
    `SHA256: ${item.sha256}`,
    `Status inicial: ${item.status}`,
    '',
    'Fluxo esperado:',
    'INBOX -> SANITIZAR -> DREAM REVIEW -> PATTERN DISCOVERY -> CANDIDATE|QUARANTINE -> META LUPA -> OWNER/CONSUMER/TEST -> WRITER AUTORIZADO -> PR',
  ].join('\n');
}

function createKanbanTask(item) {
  const title = `MINERAR_INBOX: ${item.filename}`;
  const result = spawnSync('hermes', [
    'kanban', 'create', title,
    '--triage',
    '--workspace', `dir:${REPO_ROOT}`,
    '--created-by', 'memory-linker-inbox-sentinel',
    '--idempotency-key', item.idempotency_key,
    '--body', kanbanBody(item),
    '--json',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });
  return {
    exit_code: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const items = listMaterials(args.inbox).map(classify);
  const routed = items.map((item) => {
    if (!args.kanban || args.dryRun) return { ...item, kanban: { skipped: true, reason: args.dryRun ? 'DRY_RUN' : 'KANBAN_DISABLED' } };
    if (item.secret_risk) return { ...item, kanban: { skipped: true, reason: 'SECRET_RISK_BLOCKED' } };
    return { ...item, kanban: createKanbanTask(item) };
  });
  const report = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: REPO_ROOT,
    inbox: args.inbox,
    kanban_enabled: args.kanban && !args.dryRun,
    direct_canonical_mutation: false,
    apply_allowed: false,
    count: routed.length,
    items: routed,
  };
  fs.mkdirSync(path.dirname(args.report), { recursive: true });
  fs.writeFileSync(args.report, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, count: routed.length, report: args.report }, null, 2));
  if (routed.some((item) => item.secret_risk)) process.exitCode = 2;
}

main();
