import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py']);
const EXCLUDED_PREFIXES = ['vendor/', 'dist/', 'build/', 'coverage/', '.next/'];
const EXCLUDED_SEGMENTS = ['/node_modules/', '/fixtures/'];

const JS_PATTERNS = [
  { id: 'EMPTY_CATCH_BLOCK', re: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g },
  { id: 'EMPTY_PROMISE_CATCH', re: /\.catch\s*\(\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>\s*\{\s*\}\s*\)/g },
  { id: 'EMPTY_PROMISE_REJECTION_HANDLER', re: /\.then\s*\([\s\S]*?,\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>\s*\{\s*\}\s*\)/g },
];
const PY_PATTERNS = [
  { id: 'PY_EXCEPT_PASS', re: /except(?:\s+[^:\n]+)?\s*:\s*\n[ \t]+pass(?:\s*(?:#.*)?)?(?=\n|$)/g },
];

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
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
        path,
        line: lineOf(text, match.index),
        excerpt: match[0].replace(/\s+/g, ' ').slice(0, 160),
      });
      if (match[0].length === 0) re.lastIndex += 1;
    }
  }
  return findings;
}

function shouldScan(path) {
  const normalized = path.replaceAll('\\', '/');
  if (!CODE_EXTENSIONS.has(extname(normalized))) return false;
  if (EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
  if (EXCLUDED_SEGMENTS.some((segment) => `/${normalized}`.includes(segment))) return false;
  return true;
}

export function scanRepo(root = process.cwd()) {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter(shouldScan);
  const findings = [];
  for (const path of files) {
    const text = readFileSync(resolve(root, path), 'utf8');
    findings.push(...scanText(text, path));
  }
  return findings;
}

function main() {
  const rootArgIndex = process.argv.indexOf('--repo-root');
  const root = rootArgIndex >= 0 ? resolve(process.argv[rootArgIndex + 1]) : process.cwd();
  const findings = scanRepo(root);
  if (findings.length === 0) {
    console.log('NO_SILENT_ERROR=PASS findings=0');
    return;
  }
  console.error(`NO_SILENT_ERROR=FAIL findings=${findings.length}`);
  for (const finding of findings) {
    console.error(`${finding.id} ${finding.path}:${finding.line} ${finding.excerpt}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
