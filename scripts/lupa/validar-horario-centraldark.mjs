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

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html', '.py', '.ps1', '.sh']);
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.vite',
  'backups', '_LEGADO_ROOT_DOCS_CONFLITOS',
]);

function relative(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

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

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function bootstrapOk(surface) {
  const full = path.join(ROOT, surface.bootstrap);
  if (!fs.existsSync(full)) return false;
  const text = fs.readFileSync(full, 'utf8');
  return text.includes('installCentralDarkDateFormatting') &&
    text.includes('installCentralDarkDateFormatting();');
}

function resolveBaseRef() {
  const explicit = String(argValue('--base-ref') || process.env.BASE_SHA || '').trim();
  const event = String(process.env.GITHUB_EVENT_NAME || '');
  const baseBranch = String(process.env.GITHUB_BASE_REF || '').trim();
  const candidate = explicit || (process.env.GITHUB_ACTIONS === 'true' && event === 'pull_request' && baseBranch
    ? `origin/${baseBranch}`
    : 'HEAD^');

  try {
    const sha = git(['rev-parse', '--verify', `${candidate}^{commit}`]);
    return { ref: candidate, sha };
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
    for (let offset = 0; offset < count; offset += 1) {
      byFile.get(current).add(start + offset);
    }
  }
  return byFile;
}

const findings = [];

for (const ownerFile of REQUIRED_OWNER_FILES) {
  const full = path.join(OWNER_DIR, ownerFile);
  if (!fs.existsSync(full)) {
    findings.push({
      file: `central-horario/${ownerFile}`,
      rule: 'CANONICAL_TIME_OWNER_MISSING',
      structural: true,
    });
  }
}

for (const surface of WEB_SURFACES) {
  if (!bootstrapOk(surface)) {
    findings.push({
      file: surface.bootstrap,
      rule: 'WEB_TIME_BOOTSTRAP_MISSING',
      structural: true,
    });
  }
}

const seloPath = '.github/workflows/selo-fabric.yml';
const seloFull = path.join(ROOT, seloPath);
if (!fs.existsSync(seloFull)) {
  findings.push({ file: seloPath, rule: 'SELO_FABRIC_MISSING', structural: true });
} else {
  const selo = fs.readFileSync(seloFull, 'utf8');
  const required = [
    ['pt-BR', 'SELO_PTBR_LOCALE_MISSING'],
    ['America/Sao_Paulo', 'SELO_BRASILIA_TZ_MISSING'],
    ['Horário de Brasília', 'SELO_HUMAN_TIME_LABEL_MISSING'],
    ['HUD_MEASURED_AT_BRASILIA', 'SELO_HUD_BRASILIA_FIELD_MISSING'],
    ['HUD_TIMESTAMP_ISO_UTC', 'SELO_MACHINE_UTC_FIELD_MISSING'],
  ];
  for (const [token, rule] of required) {
    if (!selo.includes(token)) findings.push({ file: seloPath, rule, structural: true });
  }
  const requiredPatterns = [
    [/const\s+ts\s*=\s*[^\n]*BRT[^\n]*;/, 'SELO_BRT_LABEL_MISSING'],
    [/const\s+tsIso\s*=\s*now\.toISOString\(\)\s*;/, 'SELO_MACHINE_UTC_FORMATTER_MISSING'],
    [/formatToParts\(now\)/, 'SELO_EXPLICIT_BRASILIA_PARTS_FORMAT_MISSING'],
  ];
  for (const [pattern, rule] of requiredPatterns) {
    if (!pattern.test(selo)) findings.push({ file: seloPath, rule, structural: true });
  }
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

  const contentText = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);
  const webSurface = WEB_SURFACES.find((surface) => rel.startsWith(surface.root));
  const webCovered = Boolean(webSurface && bootstrapOk(webSurface));

  if (['.js', '.mjs', '.cjs', '.ts', '.tsx', '.html'].includes(ext) && !webCovered) {
    for (const [regex, rule] of [
      [jsDatePtBrNoZone, 'HUMAN_DATE_PTBR_WITHOUT_BRASILIA_TZ'],
      [jsDateLocaleNoArgs, 'HUMAN_DATE_BROWSER_OR_SERVER_LOCAL_TZ'],
    ]) {
      regex.lastIndex = 0;
      for (const match of contentText.matchAll(regex)) {
        const line = contentText.slice(0, match.index).split('\n').length;
        findings.push({ file: rel, line, rule, sample: match[0].slice(0, 180) });
      }
    }
  }

  if (ext === '.py') {
    pyNaiveNow.lastIndex = 0;
    for (const match of contentText.matchAll(pyNaiveNow)) {
      const line = contentText.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'PYTHON_NAIVE_NOW_FOR_FORMATTING', sample: match[0] });
    }
  }

  if (ext === '.ps1') {
    psNaiveFormattedNow.lastIndex = 0;
    for (const match of contentText.matchAll(psNaiveFormattedNow)) {
      const line = contentText.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, rule: 'POWERSHELL_LOCAL_TZ_FORMATTING', sample: match[0] });
    }
  }

  if (ext === '.sh') {
    shHumanDateWithoutTz.lastIndex = 0;
    for (const match of contentText.matchAll(shHumanDateWithoutTz)) {
      const lineStart = contentText.lastIndexOf('\n', match.index) + 1;
      const lineEnd = contentText.indexOf('\n', match.index);
      const sourceLine = contentText.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      if (/TZ\s*=\s*['"]?America\/Sao_Paulo/.test(sourceLine) || /\bdate\s+-u\b/.test(sourceLine)) continue;
      const line = contentText.slice(0, match.index).split('\n').length;
      findings.push({
        file: rel,
        line,
        rule: 'SHELL_HUMAN_DATE_WITHOUT_EXPLICIT_TZ',
        sample: sourceLine.trim().slice(0, 180),
      });
    }
  }
}

const base = resolveBaseRef();
if (!base.sha) {
  console.error(`CENTRALDARK_TIME_GATE=BLOCKED base_ref_unavailable=${base.ref}`);
  process.exit(2);
}

const changedLines = addedLinesSince(base.sha);
const deltaFindings = findings.filter((finding) => {
  if (finding.structural) return true;
  const lines = changedLines.get(finding.file);
  return Boolean(lines && finding.line && lines.has(finding.line));
});

const output = {
  ok: deltaFindings.length === 0,
  mode: 'DELTA_RATCHET',
  canonical_owner: 'central-horario',
  canonical_timezone: 'America/Sao_Paulo',
  human_format: 'DD/MM/AAAA HH:mm:ss BRT',
  machine_storage: 'UTC_RFC3339',
  base_ref: base.ref,
  base_sha: base.sha,
  head_sha: git(['rev-parse', 'HEAD']),
  scanned_files: files.length,
  global_findings_count: findings.length,
  delta_findings_count: deltaFindings.length,
  findings,
  delta_findings: deltaFindings,
};

console.log(JSON.stringify(output, null, 2));
console.error(`CENTRALDARK_TIME_GLOBAL_AUDIT=${findings.length === 0 ? 'PASS' : 'DEBT'} findings=${findings.length}`);

if (deltaFindings.length) {
  console.error(`CENTRALDARK_TIME_DELTA_GATE=FAIL new_findings=${deltaFindings.length} global_debt=${findings.length}`);
  console.error('CENTRALDARK_TIME_GATE=FAIL scope=DELTA_RATCHET');
  process.exit(1);
}

console.log(`CENTRALDARK_TIME_DELTA_GATE=PASS new_findings=0 global_debt=${findings.length}`);
console.log('CENTRALDARK_TIME_GATE=PASS scope=DELTA_RATCHET');
