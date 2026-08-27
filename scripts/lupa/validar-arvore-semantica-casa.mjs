#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = 'docs/BRAIN';
export const NUMBERED_DIR = /^(0[0-9])-(.+)$/u;
export const FORBIDDEN_BUCKETS = new Set(['misc','outros','coisas','novo','temp','tmp','backup','copy','copia']);

export function normalizeSemanticName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^0[0-9]-/, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function validateNewDirName(baseName) {
  if (baseName.startsWith('.')) return { ok: true, technical: true };
  const m = baseName.match(NUMBERED_DIR);
  if (!m) return { ok: false, reason: 'NEW_DIRECTORY_MUST_USE_00_TO_09_PREFIX' };
  const semantic = normalizeSemanticName(baseName);
  if (!semantic) return { ok: false, reason: 'EMPTY_SEMANTIC_NAME' };
  if (FORBIDDEN_BUCKETS.has(semantic)) return { ok: false, reason: 'PERMANENT_GENERIC_BUCKET_FORBIDDEN' };
  return { ok: true, technical: false };
}

function git(args, cwd = process.cwd()) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function parseArgs(argv) {
  const out = { base: process.env.BASE_SHA || '', head: process.env.HEAD_SHA || 'HEAD', json: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base-sha') out.base = argv[++i] || '';
    else if (argv[i] === '--head-sha') out.head = argv[++i] || 'HEAD';
    else if (argv[i] === '--json') out.json = true;
  }
  return out;
}

function existsAt(ref, p) {
  try { git(['cat-file', '-e', `${ref}:${p}`]); return true; } catch { return false; }
}

function childDirectoriesAt(ref, parent) {
  try {
    const out = git(['ls-tree', '-d', '--name-only', ref, `${parent}/`]);
    if (!out) return [];
    return out.split(/\r?\n/u).filter(Boolean).map(v => v.replace(/\/$/, ''));
  } catch { return []; }
}

function collectParents(file) {
  const dirs = [];
  let d = path.posix.dirname(file.replaceAll('\\', '/'));
  while (d === ROOT || d.startsWith(`${ROOT}/`)) {
    if (d !== ROOT) dirs.push(d);
    const next = path.posix.dirname(d);
    if (next === d) break;
    d = next;
  }
  return dirs;
}

function validateLawMarkers(repoRoot) {
  const law = path.join(repoRoot, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/LEI-ARVORE-SEMANTICA-DA-CASA.md');
  if (!fs.existsSync(law)) return ['CANONICAL_HOUSE_TREE_LAW_MISSING'];
  const text = fs.readFileSync(law, 'utf8');
  const required = [
    'MAX_CHILD_DIRECTORIES_PER_FOLDER=10',
    'NUMBERING_SCHEME=00..09',
    'RECONCILIAR != COPIAR',
    'NO_DUPLICATE_MATERIAL=true',
    'SOURCE_EMPTY_AFTER_SUCCESSFUL_RECONCILIATION=true',
    'DO_NOT_RENUMBER_FOR_AESTHETICS=true'
  ];
  return required.filter(m => !text.includes(m)).map(m => `LAW_MARKER_MISSING:${m}`);
}

export function evaluate({ base, head, repoRoot = process.cwd() }) {
  const failures = validateLawMarkers(repoRoot);
  const notes = [];
  if (!base) {
    failures.push('BASE_SHA_REQUIRED');
    return { ok: false, failures, notes };
  }

  let changed = '';
  try { changed = git(['diff', '--name-only', base, head, '--', ROOT], repoRoot); }
  catch (error) {
    failures.push(`GIT_DIFF_FAILED:${error?.message || 'UNKNOWN'}`);
    return { ok: false, failures, notes };
  }

  const files = changed ? changed.split(/\r?\n/u).filter(Boolean) : [];
  const dirs = [...new Set(files.flatMap(collectParents))].sort();

  for (const dir of dirs) {
    if (existsAt(base, dir)) continue; // legado não é quebrado retroativamente; nova expansão é fail-closed.
    const result = validateNewDirName(path.posix.basename(dir));
    if (!result.ok) failures.push(`${result.reason}:${dir}`);

    const parent = path.posix.dirname(dir);
    const children = childDirectoriesAt(head, parent).filter(child => path.posix.dirname(child) === parent || child.startsWith(`${parent}/`));
    const directNames = new Set(children.map(child => child.slice(parent.length + 1).split('/')[0]).filter(Boolean));
    if (directNames.size > 10) failures.push(`MAX_10_DIRECT_CHILD_DIRS_EXCEEDED:${parent}:${directNames.size}`);
  }

  notes.push(`CHANGED_BRAIN_FILES=${files.length}`);
  notes.push(`NEW_OR_TOUCHED_PARENT_DIRS=${dirs.length}`);
  return { ok: failures.length === 0, failures, notes };
}

if (import.meta.url === `file://${process.argv[1].replaceAll('\\', '/')}`) {
  const args = parseArgs(process.argv.slice(2));
  const result = evaluate({ base: args.base, head: args.head });
  if (args.json) console.log(JSON.stringify({ HOUSE_TREE_LAW: result.ok ? 'PASS' : 'FAIL', ...result }, null, 2));
  else {
    console.log(`HOUSE_TREE_LAW=${result.ok ? 'PASS' : 'FAIL'}`);
    for (const n of result.notes) console.log(n);
    for (const f of result.failures) console.error(`HOUSE_TREE_VIOLATION=${f}`);
  }
  process.exit(result.ok ? 0 : 1);
}
