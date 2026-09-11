#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OWNER_DIR = path.join(ROOT, 'central-horario');
const REQUIRED_OWNER_FILES = [
  'README.md',
  'node.cjs',
  'node.mjs',
  'frontend.ts',
  'python.py',
  'powershell.ps1',
  'shell.sh',
  'self-test.mjs',
];

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.py', '.ps1', '.sh']);
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.vite',
  'backups', '_LEGADO_ROOT_DOCS_CONFLITOS',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.agents') {
      if (entry.isDirectory()) continue;
    }
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

const findings = [];
for (const ownerFile of REQUIRED_OWNER_FILES) {
  const full = path.join(OWNER_DIR, ownerFile);
  if (!fs.existsSync(full)) findings.push({ file: `central-horario/${ownerFile}`, rule: 'CANONICAL_TIME_OWNER_MISSING' });
}

const jsDatePtBrNoZone = /new\s+Date\s*\([^\n;]*?\)\.toLocale(?:String|DateString|TimeString)\(\s*(['"])pt-BR\1\s*\)/g;
const jsDateLocaleNoArgs = /new\s+Date\s*\([^\n;]*?\)\.toLocale(?:String|DateString|TimeString)\(\s*\)/g;
const pyNaiveNow = /\b(?:datetime|dt\.datetime)\.now\(\)\.(?:strftime|isoformat)\s*\(/g;
const psNaiveFormattedNow = /\(Get-Date\)\.ToString\s*\(/g;
const shHumanDateWithoutTz = /(^|[^A-Za-z0-9_])date\s+['"]\+%(?:d|Y|H|I|M)/g;

for (const file of walk(ROOT)) {
  const rel = relative(file);
  if (rel.startsWith('central-horario/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);

  if (['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html'].includes(ext)) {
    for (const [regex, rule] of [
      [jsDatePtBrNoZone, 'HUMAN_DATE_PTBR_WITHOUT_BRASILIA_TZ'],
      [jsDateLocaleNoArgs, 'HUMAN_DATE_BROWSER_OR_SERVER_LOCAL_TZ'],
    ]) {
      regex.lastIndex = 0;
      for (const match of content.matchAll(regex)) {
        const line = content.slice(0, match.index).split('\n').length;
        findings.push({ file: rel, line, rule, sample: match[0].slice(0, 180) });
      }
    }
  }

  if (ext === '.py') {
    pyNaiveNow.lastIndex = 0;
    for (const match of content.matchAll(pyNaiveNow)) {
      const line = content.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'PYTHON_NAIVE_NOW_FOR_FORMATTING', sample: match[0] });
    }
  }

  if (ext === '.ps1') {
    psNaiveFormattedNow.lastIndex = 0;
    for (const match of content.matchAll(psNaiveFormattedNow)) {
      const line = content.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'POWERSHELL_LOCAL_TZ_FORMATTING', sample: match[0] });
    }
  }

  if (ext === '.sh') {
    shHumanDateWithoutTz.lastIndex = 0;
    for (const match of content.matchAll(shHumanDateWithoutTz)) {
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const sourceLine = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      if (/TZ\s*=\s*['"]?America\/Sao_Paulo/.test(sourceLine) || /\bdate\s+-u\b/.test(sourceLine)) continue;
      const line = content.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'SHELL_HUMAN_DATE_WITHOUT_EXPLICIT_TZ', sample: sourceLine.trim().slice(0, 180) });
    }
  }
}

const output = {
  ok: findings.length === 0,
  canonical_timezone: 'America/Sao_Paulo',
  human_display: 'BRT',
  machine_storage: 'UTC_RFC3339',
  scanned_files: walk(ROOT).length,
  findings,
};

console.log(JSON.stringify(output, null, 2));
if (findings.length) {
  console.error(`CENTRALDARK_TIME_GATE=FAIL findings=${findings.length}`);
  process.exit(1);
}
console.log('CENTRALDARK_TIME_GATE=PASS');
