import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py']);
const EXCLUDED_PREFIXES = ['backups/', 'docs/', 'vendor/', 'build/', 'coverage/', '.next/'];
const EXCLUDED_SEGMENTS = ['/node_modules/', '/fixtures/', '/dist/', '/coverage/', '/.next/'];

const JS_PATTERNS = [
  { id: 'EMPTY_CATCH_BLOCK', re: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g },
  { id: 'EMPTY_PROMISE_CATCH', re: /\.catch\s*\(\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>\s*\{\s*\}\s*\)/g },
  { id: 'EMPTY_PROMISE_REJECTION_HANDLER', re: /\.then\s*\([\s\S]*?,\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>\s*\{\s*\}\s*\)/g },
];
const PY_PATTERNS = [
  { id: 'PY_EXCEPT_PASS', re: /except(?:\s+[^:\n]+)?\s*:\s*\n[ \t]+pass(?:\s*(?:#.*)?)?(?=\n|$)/g },
];

function normalizedPath(path) {
  return String(path || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

export function isActionableCodePath(path) {
  const normalized = normalizedPath(path);
  if (!CODE_EXTENSIONS.has(extname(normalized))) return false;
  if (EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
  if (EXCLUDED_SEGMENTS.some((segment) => `/${normalized}`.includes(segment))) return false;
  if (/\.min\.js$/i.test(normalized)) return false;
  if (/(?:^|\/)(?:test|spec)\.[cm]?[jt]sx?$/i.test(normalized)) return false;
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(normalized)) return false;
  if (/(?:^|\/)(?:tests?|testes)(?:\/|$)/i.test(normalized)) return false;
  if (/^test_.*\.py$/i.test(basename(normalized))) return false;
  return true;
}

export function scanText(text, path = '<memory>') {
  const patterns = path.endsWith('.py') ? PY_PATTERNS : JS_PATTERNS;
  const findings = [];
  for (const { id, re } of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text))) {
      findings.push({
        id,
        path: normalizedPath(path),
        line: lineOf(text, match.index),
        excerpt: match[0].replace(/\s+/g, ' ').slice(0, 160),
      });
      if (match[0].length === 0) re.lastIndex += 1;
    }
  }
  return findings;
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

export function trackedCodePaths(root = process.cwd()) {
  return git(root, ['ls-files', '-z'])
    .split('\0')
    .filter(Boolean)
    .map(normalizedPath)
    .filter(isActionableCodePath);
}

export function changedPaths(root = process.cwd(), baseRef = 'HEAD^') {
  if (!baseRef || !String(baseRef).trim()) throw new Error('BASE_REF_REQUIRED');
  const ref = String(baseRef).trim();
  try {
    git(root, ['rev-parse', '--verify', `${ref}^{commit}`]);
  } catch {
    throw new Error(`BASE_REF_UNAVAILABLE:${ref}`);
  }
  return new Set(
    git(root, ['diff', '--name-only', '-z', `${ref}...HEAD`, '--'])
      .split('\0')
      .filter(Boolean)
      .map(normalizedPath),
  );
}

export function scanRepo(root = process.cwd()) {
  const findings = [];
  for (const path of trackedCodePaths(root)) {
    const text = readFileSync(resolve(root, path), 'utf8');
    findings.push(...scanText(text, path));
  }
  return findings;
}

export function classifyFindings(findings, changedSet) {
  const changed = [];
  const legacy = [];
  for (const finding of findings) {
    (changedSet.has(normalizedPath(finding.path)) ? changed : legacy).push(finding);
  }
  return { changed, legacy };
}

function printFinding(prefix, finding) {
  console.error(`${prefix} ${finding.id} ${finding.path}:${finding.line} ${finding.excerpt}`);
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function main() {
  const root = resolve(argValue('--repo-root') || process.cwd());
  const baseRef = argValue('--base-ref') || 'HEAD^';
  let changedSet;
  try {
    changedSet = changedPaths(root, baseRef);
  } catch (error) {
    console.error(`NO_SILENT_ERROR=BLOCKED cause=${String(error?.message || error)}`);
    process.exitCode = 2;
    return;
  }

  const all = scanRepo(root);
  const { changed, legacy } = classifyFindings(all, changedSet);

  console.log(`NO_SILENT_ERROR_RATCHET changed_files=${changedSet.size} new_findings=${changed.length} legacy_debt=${legacy.length}`);
  if (legacy.length > 0) {
    console.log(`GLOBAL_NO_SILENT_ERROR=UNPROVEN_LEGACY_DEBT count=${legacy.length}`);
    for (const finding of legacy) printFinding('LEGACY_DEBT', finding);
  } else {
    console.log('GLOBAL_NO_SILENT_ERROR=PASS legacy_debt=0');
  }

  if (changed.length > 0) {
    console.error(`NO_SILENT_ERROR_RATCHET=FAIL new_findings=${changed.length}`);
    for (const finding of changed) printFinding('NEW_SILENT_ERROR', finding);
    process.exitCode = 1;
    return;
  }

  console.log('NO_SILENT_ERROR_RATCHET=PASS new_findings=0');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
