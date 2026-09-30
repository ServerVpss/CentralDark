#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.py', '.ps1', '.sh']);
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.vite',
  'backups', '_LEGADO_ROOT_DOCS_CONFLITOS',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.agents' && entry.isDirectory()) continue;
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

function changedPaths(baseRef) {
  const ref = String(baseRef || '').trim();
  if (!ref) return new Set();
  try {
    execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: ROOT, stdio: 'ignore' });
    const text = execFileSync('git', ['diff', '--name-only', `${ref}...HEAD`, '--'], { cwd: ROOT, encoding: 'utf8' });
    return new Set(text.split(/\r?\n/).filter(Boolean).map((x) => x.replaceAll('\\', '/')));
  } catch {
    return null;
  }
}

function bootstrapOk(surface) {
  const full = path.join(ROOT, surface.bootstrap);
  if (!fs.existsSync(full)) return false;
  const text = fs.readFileSync(full, 'utf8');
  return text.includes('installCentralDarkDateFormatting') && text.includes('installCentralDarkDateFormatting();');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function resolveCiBase() {
  if (process.env.GITHUB_ACTIONS !== 'true') return null;
  const event = String(process.env.GITHUB_EVENT_NAME || '');
  const baseRef = String(process.env.GITHUB_BASE_REF || '').trim();
  const candidate = event === 'pull_request' && baseRef ? `origin/${baseRef}` : 'HEAD^';
  try {
    return { ref: candidate, sha: git(['rev-parse', candidate]) };
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

const findings = [];
for (const ownerFile of REQUIRED_OWNER_FILES) {
  const full = path.join(OWNER_DIR, ownerFile);
  if (!fs.existsSync(full)) findings.push({ file: `central-horario/${ownerFile}`, rule: 'CANONICAL_TIME_OWNER_MISSING', structural: true });
}
for (const surface of WEB_SURFACES) {
  if (!bootstrapOk(surface)) findings.push({ file: surface.bootstrap, rule: 'WEB_TIME_BOOTSTRAP_MISSING', structural: true });
}

const jsDatePtBrNoZone = /new\s+Date\s*\([^\n;]*?\)\.toLocale(?:String|DateString|TimeString)\(\s*(['"])pt-BR\1\s*\)/g;
const jsDateLocaleNoArgs = /new\s+Date\s*\([^\n;]*?\)\.toLocale(?:String|DateString|TimeString)\(\s*\)/g;
const pyNaiveNow = /\b(?:datetime|dt\.datetime)\.now\(\)\.(?:strftime|isoformat)\s*\(/g;
const psNaiveFormattedNow = /\(Get-Date\)\.ToString\s*\(/g;
const shHumanDateWithoutTz = /(^|[^A-Za-z0-9_])date\s+['"]\+%(?:d|Y|H|I|M)/g;

const files = walk(ROOT);
for (const file of files) {
  const rel = relative(file);
  if (rel.startsWith('central-horario/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);
  const webSurface = WEB_SURFACES.find((surface) => rel.startsWith(surface.root));
  const webCovered = Boolean(webSurface && bootstrapOk(webSurface));

  if (['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html'].includes(ext) && !webCovered) {
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

const files = walk(ROOT);
const baseRef = argValue('--base-ref') || process.env.BASE_SHA || process.env.GITHUB_EVENT_BEFORE || 'HEAD^';
const changed = changedPaths(baseRef);
if (changed === null) {
  console.error(`CENTRALDARK_TIME_GATE=BLOCKED base_ref_unavailable=${baseRef}`);
  process.exit(2);
}
const newFindings = findings.filter((finding) => changed.has(finding.file));
const legacyFindings = findings.filter((finding) => !changed.has(finding.file));
const output = {
  ok: newFindings.length === 0,
  canonical_timezone: 'America/Sao_Paulo',
  human_display: 'BRT',
  machine_storage: 'UTC_RFC3339',
  scope_policy: 'SCAN_ALL_RATCHET_NEW_DELTA',
  base_ref: baseRef,
  bootstrapped_web_surfaces: WEB_SURFACES.filter(bootstrapOk).map((surface) => surface.root),
  scanned_files: files.length,
  changed_files: changed.size,
  new_findings: newFindings,
  legacy_debt: legacyFindings,
};

console.log(JSON.stringify(output, null, 2));
if (legacyFindings.length) console.warn(`CENTRALDARK_TIME_LEGACY_DEBT=${legacyFindings.length}`);
if (newFindings.length) {
  console.error(`CENTRALDARK_TIME_GATE=FAIL new_findings=${newFindings.length}`);
  process.exit(1);
}
console.log('CENTRALDARK_TIME_GATE=PASS new_findings=0');
const ciBase = resolveCiBase();
let mode = 'FULL_AUDIT';
let deltaFindings = findings;
let deltaBinding = null;
if (ciBase) {
  if (!ciBase.sha) {
    mode = 'DELTA_RATCHET_UNBOUND';
  } else {
    mode = 'DELTA_RATCHET';
    const changedLines = addedLinesSince(ciBase.sha);
    deltaFindings = findings.filter((finding) => {
      if (finding.structural) return true;
      const lines = changedLines.get(finding.file);
      return Boolean(lines && lines.has(finding.line));
    });
    deltaBinding = { base_ref: ciBase.ref, base_sha: ciBase.sha, head_sha: git(['rev-parse', 'HEAD']) };
  }
}

const globalAuditStatus = findings.length === 0 ? 'PASS' : 'DEBT';
const ok = mode === 'DELTA_RATCHET' ? deltaFindings.length === 0 : findings.length === 0;
const output = {
  ok,
  mode,
  canonical_timezone: 'America/Sao_Paulo',
  human_display: 'BRT',
  machine_storage: 'UTC_RFC3339',
  global_audit_status: globalAuditStatus,
  global_findings_count: findings.length,
  delta_findings_count: mode === 'DELTA_RATCHET' ? deltaFindings.length : null,
  delta_binding: deltaBinding,
  bootstrapped_web_surfaces: WEB_SURFACES.filter(bootstrapOk).map((surface) => surface.root),
  scanned_files: files.length,
  findings,
  delta_findings: mode === 'DELTA_RATCHET' ? deltaFindings : undefined,
};

console.log(JSON.stringify(output, null, 2));
console.error(`CENTRALDARK_TIME_GLOBAL_AUDIT=${globalAuditStatus} findings=${findings.length}`);
if (mode === 'DELTA_RATCHET' && ok) {
  console.log(`CENTRALDARK_TIME_DELTA_GATE=PASS new_findings=0 global_debt=${findings.length}`);
  console.log('CENTRALDARK_TIME_GATE=PASS scope=DELTA_RATCHET');
  process.exit(0);
}
if (mode === 'DELTA_RATCHET' && !ok) {
  console.error(`CENTRALDARK_TIME_DELTA_GATE=FAIL new_findings=${deltaFindings.length} global_debt=${findings.length}`);
} else if (mode === 'DELTA_RATCHET_UNBOUND') {
  console.error(`CENTRALDARK_TIME_GATE=FAIL reason=CI_BASE_UNBOUND findings=${findings.length}`);
} else {
  console.error(`CENTRALDARK_TIME_GATE=${ok ? 'PASS' : 'FAIL'} scope=FULL_AUDIT findings=${findings.length}`);
}
process.exit(ok ? 0 : 1);
