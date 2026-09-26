#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
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

const liveMissing = liveCandidates.length - liveReady.length;
const report = {
  schema: 'centraldark.grafo-vivo-markdown-conformance.v2',
  checked_stable_owners: requiredStableOwners.length,
  checked_legacy_pointers: legacyPointers.length,
  scanned_docs_markdown: docs.length,
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
