#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
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

const WEB_SURFACES = [
  { root: 'src/', bootstrap: 'src/main.tsx' },
  { root: 'apps/modulos/hub/src/', bootstrap: 'apps/modulos/hub/src/main.tsx' },
  { root: 'apps/modulos/mcp-admin-ui/src/', bootstrap: 'apps/modulos/mcp-admin-ui/src/main.tsx' },
  { root: 'apps/modulos/obsidian-plugin-grafo-vivo/src/', bootstrap: 'apps/modulos/obsidian-plugin-grafo-vivo/src/main.ts' },
  { root: 'apps/modulos/Bolt/source/app/', bootstrap: 'apps/modulos/Bolt/source/app/entry.client.tsx' },
];

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.py', '.ps1', '.sh', '.yml', '.yaml']);
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.vite',
  'backups', '_LEGADO_ROOT_DOCS_CONFLITOS',
]);

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.agents' && entry.name !== '.github' && entry.isDirectory()) continue;
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

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function bootstrapOk(surface) {
  const full = path.join(ROOT, surface.bootstrap);
  if (!fs.existsSync(full)) return false;
  const text = fs.readFileSync(full, 'utf8');
  return text.includes('installCentralDarkDateFormatting') && text.includes('installCentralDarkDateFormatting();');
}

function resolveBase(ref) {
  const candidate = String(ref || '').trim() || 'HEAD^';
  try {
    return { ref: candidate, sha: git(['rev-parse', '--verify', `${candidate}^{commit}`]) };
  } catch {
    return { ref: candidate, sha: null };
  }
}

function addedLinesSince(baseSha) {
  const byFile = new Map();
  const diff = git(['diff', '--unified=0', '--no-ext-diff', baseSha, 'HEAD', '--']);
  let current = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      current = line.slice(6);
      if (!byFile.has(current)) byFile.set(current, new Set());
      continue;
    }
    if (!current || !line.startsWith('@@')) continue;
    const match = line.match(/\+(\d+)(?:,(\d+))?/);
    if (!match) continue;
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    for (let offset = 0; offset < count; offset += 1) byFile.get(current).add(start + offset);
  }
  return byFile;
}

function pushMatches(findings, rel, content, regex, rule) {
  regex.lastIndex = 0;
  for (const match of content.matchAll(regex)) {
    const line = content.slice(0, match.index).split('\n').length;
    findings.push({ file: rel, line, rule, sample: match[0].replace(/\s+/g, ' ').slice(0, 180) });
  }
}

const findings = [];
for (const ownerFile of REQUIRED_OWNER_FILES) {
  const full = path.join(OWNER_DIR, ownerFile);
  if (!fs.existsSync(full)) {
    findings.push({ file: `central-horario/${ownerFile}`, line: 1, rule: 'CANONICAL_TIME_OWNER_MISSING', structural: true });
  }
}
for (const surface of WEB_SURFACES) {
  if (!bootstrapOk(surface)) {
    findings.push({ file: surface.bootstrap, line: 1, rule: 'WEB_TIME_BOOTSTRAP_MISSING', structural: true });
  }
}

const patterns = {
  jsLocaleDirect: /new\s+Date\s*\([^\n;]*?\)\.toLocale(?:String|DateString|TimeString)\s*\(/g,
  jsIntlDirect: /new\s+Intl\.DateTimeFormat\s*\(/g,
  pyNaiveNow: /\b(?:datetime|dt\.datetime)\.now\(\)\.(?:strftime|isoformat)\s*\(/g,
  psNaiveFormattedNow: /\(Get-Date\)\.ToString\s*\(/g,
  shHumanDateWithoutTz: /(^|[^A-Za-z0-9_])date\s+['"]\+%(?:d|Y|H|I|M)/gm,
};

const files = walk(ROOT);
for (const file of files) {
  const rel = relative(file);
  if (rel.startsWith('central-horario/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);
  const webSurface = WEB_SURFACES.find((surface) => rel.startsWith(surface.root));
  const webCovered = Boolean(webSurface && bootstrapOk(webSurface));

  if (['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.yml', '.yaml'].includes(ext) && !webCovered) {
    pushMatches(findings, rel, content, patterns.jsLocaleDirect, 'HUMAN_DATE_FORMATTER_OUTSIDE_CANONICAL_OWNER');
    pushMatches(findings, rel, content, patterns.jsIntlDirect, 'INTL_DATE_FORMATTER_OUTSIDE_CANONICAL_OWNER');
  }

  if (ext === '.py') pushMatches(findings, rel, content, patterns.pyNaiveNow, 'PYTHON_NAIVE_NOW_FOR_FORMATTING');
  if (ext === '.ps1') pushMatches(findings, rel, content, patterns.psNaiveFormattedNow, 'POWERSHELL_LOCAL_TZ_FORMATTING');

  if (ext === '.sh') {
    patterns.shHumanDateWithoutTz.lastIndex = 0;
    for (const match of content.matchAll(patterns.shHumanDateWithoutTz)) {
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const sourceLine = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      if (/TZ\s*=\s*['"]?America\/Sao_Paulo/.test(sourceLine) || /\bdate\s+-u\b/.test(sourceLine)) continue;
      const line = content.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'SHELL_HUMAN_DATE_WITHOUT_EXPLICIT_TZ', sample: sourceLine.trim().slice(0, 180) });
    }
  }
}

const requestedBase = argValue('--base-ref') || process.env.BASE_SHA || process.env.GITHUB_EVENT_BEFORE || 'HEAD^';
const base = resolveBase(requestedBase);
if (!base.sha) {
  console.error(`CENTRALDARK_TIME_GATE=BLOCKED base_ref_unavailable=${base.ref}`);
  process.exit(2);
}

const changedLines = addedLinesSince(base.sha);
const deltaFindings = findings.filter((finding) => {
  if (finding.structural) return true;
  const lines = changedLines.get(finding.file);
  return Boolean(lines && lines.has(finding.line));
});

const output = {
  ok: deltaFindings.length === 0,
  mode: 'GLOBAL_SCAN_DELTA_RATCHET',
  canonical_owner: 'central-horario',
  canonical_timezone: 'America/Sao_Paulo',
  locale: 'pt-BR',
  human_display_format: 'DD/MM/AAAA HH:mm:ss BRT',
  machine_storage: 'UTC_RFC3339',
  base_ref: base.ref,
  base_sha: base.sha,
  head_sha: git(['rev-parse', 'HEAD']),
  scanned_files: files.length,
  global_findings_count: findings.length,
  new_findings_count: deltaFindings.length,
  legacy_debt: findings.filter((finding) => !deltaFindings.includes(finding)),
  new_findings: deltaFindings,
};

console.log(JSON.stringify(output, null, 2));
console.error(`CENTRALDARK_TIME_GLOBAL_AUDIT=${findings.length ? 'DEBT' : 'PASS'} findings=${findings.length}`);
if (findings.length) console.warn(`CENTRALDARK_TIME_LEGACY_DEBT=${findings.length - deltaFindings.length}`);

if (deltaFindings.length) {
  console.error(`CENTRALDARK_TIME_GATE=FAIL new_findings=${deltaFindings.length}`);
  process.exit(1);
}

console.log(`CENTRALDARK_TIME_DELTA_GATE=PASS new_findings=0 global_debt=${findings.length}`);
console.log('CENTRALDARK_TIME_GATE=PASS scope=GLOBAL_SCAN_DELTA_RATCHET');
