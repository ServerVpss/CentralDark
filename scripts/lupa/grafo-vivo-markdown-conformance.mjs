#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const changedFromIndex = args.indexOf('--changed-from');
const changedFrom = changedFromIndex >= 0 ? args[changedFromIndex + 1] : '';
const selfTest = args.includes('--self-test');
const DOCS = path.join(ROOT, 'docs');

const requiredStableOwners = [
  'docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md',
  'docs/CONSCIENCIA/GUIA-COMUNICACAO-SEGREDO-CHEFE.md',
  'docs/BRAIN/00-MAPA-SISTEMA/01-HUB/POSTURA-SEGREDO-CHEFE.md',
  'docs/CONSCIENCIA/HERMES-CADEIA-OPERACIONAL.md',
  'docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md',
  'docs/RECEIPTS/README.md',
];

const legacyPointers = [
  'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md',
  'docs/CONSCIENCIA/12-GUIA-PIVETE.md',
  'docs/BRAIN/00-MAPA-SISTEMA/01-HUB/00-POSTURA-PIVETE.md',
  'docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md',
];

const requiredLiveFields = [
  'title',
  'status',
  'owner',
  'truth_scope',
  'canonical',
  'tags',
  'related',
  'links',
];

const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...walk(full));
    else if (item.isFile() && item.name.endsWith('.md')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
  return out;
}

function hasFrontmatter(txt) {
  return txt.startsWith('---\n') && txt.indexOf('\n---', 4) !== -1;
}

function frontmatterText(txt) {
  if (!hasFrontmatter(txt)) return '';
  const end = txt.indexOf('\n---', 4);
  return txt.slice(4, end + 1);
}

function frontmatterHasField(txt, field) {
  return new RegExp(`^${field}:`, 'm').test(frontmatterText(txt));
}

function firstHeading(txt) {
  return txt.split('\n').find((line) => /^#\s+/.test(line)) || '';
}

function titleLine(txt) {
  return frontmatterText(txt).split('\n').find((line) => /^title:\s*/.test(line)) || firstHeading(txt);
}

function hasEmoji(txt) {
  return /\p{Extended_Pictographic}/u.test(txt);
}

function hasDateSignal(txt) {
  return frontmatterHasField(txt, 'date') || frontmatterHasField(txt, 'updated');
}

function requireIncludes(file, txt, needles) {
  for (const needle of needles) {
    if (!txt.includes(needle)) errors.push(`${file}: missing ${needle}`);
  }
}

function looksHistorical(file, txt) {
  const fm = frontmatterText(txt);
  const status = (fm.match(/^status:\s*["']?([^"'\n]+)/m)?.[1] || '').toUpperCase();
  return (
    /(^|\/)RELATORIOS\//.test(file) ||
    /(^|\/)AUDITORIAS\//.test(file) ||
    /(^|\/)RECEIPTS\//.test(file) ||
    /(^|\/)CONTINUIDADE\//.test(file) ||
    /\d{4}-\d{2}-\d{2}/.test(path.basename(file)) ||
    /(HISTORICAL|SNAPSHOT|HANDOFF|ARCHIVED|RECEIPT|RELATORIO|AUDITORIA)/.test(status)
  );
}

function percent(part, total) {
  if (!total) return 100;
  return Number(((part / total) * 100).toFixed(2));
}

function isGlobalMarkdownPath(file) {
  return (
    file.startsWith('docs/') ||
    file.startsWith('.agents/skills/') ||
    file.startsWith('.github/') ||
    (!file.includes('/') && /^README[^/]*\.md$/i.test(file))
  ) && file.endsWith('.md');
}

function changedMarkdownFiles(baseSha) {
  if (!/^[0-9a-f]{40}$/i.test(baseSha) || /^0{40}$/i.test(baseSha)) return [];
  const output = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', `${baseSha}...HEAD`, '--'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  return [...new Set(output.split('\n').map((file) => file.trim()).filter(isGlobalMarkdownPath))].sort();
}

function markdownHygieneErrors(file, text) {
  const findings = [];
  const lines = text.split('\n');
  const ordered = new Map();
  const headings = new Map();
  const fences = [];

  if (text && !text.endsWith('\n')) findings.push('MD047:no-final-newline');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNo = index + 1;
    if (/\t/.test(line)) findings.push(`MD010:tab:${lineNo}`);
    if (/[ \t]+$/.test(line)) findings.push(`MD009:trailing-space:${lineNo}`);
    if (line === '' && lines[index + 1] === '' && lines[index + 2] === '') findings.push(`MD012:multiple-blank-lines:${lineNo}`);
    const insideFence = fences.length > 0;

    if (!insideFence) {
      if (/^\s*(?:[-+*](?![-+*])|\d+[.)])\S/.test(line)) findings.push(`MD030:marker-space:${lineNo}`);

      const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const normalized = heading[2].trim().toLowerCase();
        if (headings.has(normalized)) findings.push(`MD024:duplicate-heading:${lineNo}`);
        else headings.set(normalized, lineNo);
        if (index > 0 && lines[index - 1] !== '') findings.push(`MD022:heading-before-blank:${lineNo}`);
        if (index + 1 < lines.length && lines[index + 1] !== '') findings.push(`MD022:heading-after-blank:${lineNo}`);
      }

      const orderedMatch = line.match(/^(\s*)(\d+)\.\s+/);
      if (orderedMatch) {
        const indent = orderedMatch[1].length;
        const number = Number(orderedMatch[2]);
        const prior = ordered.get(indent);
        if (prior !== undefined && number !== prior + 1) findings.push(`MD029:ordered-list:${lineNo}`);
        ordered.set(indent, number);
      } else if (line.trim() && !/^\s*(?:[-+*]|\d+[.)])\s+/.test(line)) {
        ordered.clear();
      }
    }

    const fence = line.match(/^\s*(```+|~~~+)(.*)$/);
    if (fence) {
      if (!fences.length) {
        if (!fence[2].trim()) findings.push(`MD040:fence-language:${lineNo}`);
        if (index > 0 && lines[index - 1] !== '') findings.push(`MD031:fence-before-blank:${lineNo}`);
        fences.push({ marker: fence[1][0], lineNo });
      } else {
        fences.pop();
        if (index + 1 < lines.length && lines[index + 1] !== '') findings.push(`MD031:fence-after-blank:${lineNo}`);
      }
    }
  }
  for (const fence of fences) findings.push(`MD031:unclosed-fence:${fence.lineNo}`);
  return findings;
}

function runSelfTest() {
  const good = '# Título\n\n1. Um\n2. Dois\n\n```text\nok\n```\n';
  const bad = '# Título\n1. Um\n15. Dois\n15. Três\n\n```\nsem linguagem\n```';
  const fenced = '# Título\n\n```bash\n# shell comment\n# shell comment\n-item\n1.bad\n15. bad\n```\n';
  const goodPasses = markdownHygieneErrors('good.md', good).length === 0;
  const badFindings = markdownHygieneErrors('bad.md', bad);
  const fencedFindings = markdownHygieneErrors('fenced.md', fenced);
  const badCovers = ['MD022', 'MD029', 'MD040', 'MD047'].every((code) => badFindings.some((item) => item.startsWith(code)));
  const fencedSemanticsIgnored = !fencedFindings.some((item) => ['MD022', 'MD024', 'MD029', 'MD030'].some((code) => item.startsWith(code)));
  const ok = goodPasses && badCovers && fencedSemanticsIgnored;
  console.log(`GLOBAL_MARKDOWN_CONFORMANCE_SELF_TEST=${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

if (selfTest) {
  runSelfTest();
  process.exit(0);
}

for (const file of requiredStableOwners) {
  if (!exists(file)) {
    errors.push(`${file}: stable owner missing`);
    continue;
  }
  const txt = read(file);
  if (!hasFrontmatter(txt)) errors.push(`${file}: missing frontmatter`);
  requireIncludes(file, txt, ['status:', 'owner:', 'truth_scope:', 'canonical: true', 'tags:', 'related:', 'links:']);
  if (/\uFFFD|��/.test(txt)) errors.push(`${file}: replacement-character/corrupted emoji found`);
  if (/^\+{1,3}\s*#{1,6}\s/m.test(txt) || /^\+\s*→/m.test(txt)) errors.push(`${file}: patch artifact line beginning with + found`);
}

const visualGraphOwner = 'docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md';
if (exists(visualGraphOwner)) {
  const visual = read(visualGraphOwner);
  requireIncludes(visualGraphOwner, visual, [
    'VISUAL_AUTHORING_SURFACE=true',
    'VISUAL_IS_TRUTH=false',
    'VISUAL_MUST_REUSE_GRAFO_VIVO=true',
    'VISUAL_MUST_NOT_CREATE_SECOND_ROUTER=true',
    'owner',
    'gate',
    'proof_key',
    'fallback',
    'next_cursor',
    '→  CONTINUE',
    '↺  RETRY_OR_LOOP',
    '↩  RETURN_TO_PREVIOUS_PROVEN_STAGE',
    '⊣  BLOCK',
    '⇢  OPTIONAL',
    '⇄  SYNCHRONIZE',
    'DRAG_DROP_AUTHORING_RUNTIME=UNKNOWN',
    'VISUAL_TO_CANONICAL_COMPILER=UNKNOWN',
    'ROUND_TRIP_EDIT_TELEMETRY_FIXED_POINT=UNKNOWN',
  ]);
}

for (const file of legacyPointers) {
  if (!exists(file)) {
    warnings.push(`${file}: legacy pointer absent; ok only if every consumer already moved`);
    continue;
  }
  const txt = read(file);
  requireIncludes(file, txt, ['status: "LEGACY_ALIAS"', 'owner:', 'truth_scope: "LEGACY_POINTER_ONLY"', 'canonical: false']);
  if (/\uFFFD|��/.test(txt)) errors.push(`${file}: replacement-character/corrupted emoji found`);
}

const docs = walk(DOCS);
const docsWithFrontmatter = [];
const docsWithRequiredProperties = [];
const docsWithDateOrUpdated = [];
const docsWithEmojiTitle = [];
const docsWithAnyEmoji = [];
const historicalDocs = [];
const liveCandidates = [];
const liveReady = [];
const missingByField = Object.fromEntries(requiredLiveFields.map((field) => [field, 0]));
const examplesMissingProperties = [];
const examplesMissingEmojiTitle = [];

for (const file of docs) {
  const txt = read(file);
  if (/\uFFFD|��/.test(txt)) warnings.push(`${file}: possible corrupted emoji/replacement character`);
  if (/^\+{1,3}\s*#{1,6}\s/m.test(txt) || /^\+\s*→/m.test(txt)) warnings.push(`${file}: possible patch artifact line`);

  if (hasFrontmatter(txt)) docsWithFrontmatter.push(file);
  if (hasDateSignal(txt)) docsWithDateOrUpdated.push(file);
  if (hasEmoji(titleLine(txt))) docsWithEmojiTitle.push(file);
  if (hasEmoji(txt)) docsWithAnyEmoji.push(file);

  const missing = requiredLiveFields.filter((field) => !frontmatterHasField(txt, field));
  for (const field of missing) missingByField[field] += 1;
  if (!missing.length) docsWithRequiredProperties.push(file);
  else if (examplesMissingProperties.length < 20) examplesMissingProperties.push({ file, missing });

  if (looksHistorical(file, txt)) historicalDocs.push(file);
  else {
    liveCandidates.push(file);
    if (!missing.length && hasDateSignal(txt) && hasEmoji(titleLine(txt))) liveReady.push(file);
    if (!hasEmoji(titleLine(txt)) && examplesMissingEmojiTitle.length < 20) examplesMissingEmojiTitle.push(file);
  }
}

const changedMarkdown = changedMarkdownFiles(changedFrom);
const markdownHygiene = [];
for (const file of changedMarkdown) {
  if (!exists(file)) continue;
  const findings = markdownHygieneErrors(file, read(file));
  if (findings.length) {
    markdownHygiene.push({ file, findings });
    errors.push(`${file}: global-markdown-conformance ${findings.join(',')}`);
  }
}

const liveMissing = liveCandidates.length - liveReady.length;
const report = {
  schema: 'centraldark.grafo-vivo-markdown-conformance.v2',
  checked_stable_owners: requiredStableOwners.length,
  checked_legacy_pointers: legacyPointers.length,
  scanned_docs_markdown: docs.length,
  global_changed_markdown: {
    base_sha: changedFrom || null,
    files_checked: changedMarkdown.length,
    failures: markdownHygiene,
    status: markdownHygiene.length ? 'FAIL' : (changedFrom ? 'PASS' : 'NOT_REQUESTED'),
  },
  metrics: {
    all_docs: {
      total: docs.length,
      with_frontmatter: docsWithFrontmatter.length,
      with_required_properties: docsWithRequiredProperties.length,
      with_date_or_updated: docsWithDateOrUpdated.length,
      with_emoji_in_title_or_h1: docsWithEmojiTitle.length,
      with_any_emoji: docsWithAnyEmoji.length,
      properties_done_percent: percent(docsWithRequiredProperties.length, docs.length),
      properties_missing_percent: Number((100 - percent(docsWithRequiredProperties.length, docs.length)).toFixed(2)),
      emoji_title_done_percent: percent(docsWithEmojiTitle.length, docs.length),
      emoji_title_missing_percent: Number((100 - percent(docsWithEmojiTitle.length, docs.length)).toFixed(2)),
    },
    live_candidates: {
      total: liveCandidates.length,
      ready: liveReady.length,
      missing: liveMissing,
      done_percent: percent(liveReady.length, liveCandidates.length),
      missing_percent: Number((100 - percent(liveReady.length, liveCandidates.length)).toFixed(2)),
    },
    historical_or_receipt_like: historicalDocs.length,
    missing_by_field: missingByField,
    examples_missing_properties: examplesMissingProperties,
    examples_missing_emoji_title: examplesMissingEmojiTitle,
  },
  warnings,
  errors,
  status: errors.length ? 'FAIL' : 'PASS',
};

console.log(JSON.stringify(report, null, 2));

if (errors.length) process.exit(1);
