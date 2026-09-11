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

function requireIncludes(file, txt, needles) {
  for (const needle of needles) {
    if (!txt.includes(needle)) errors.push(`${file}: missing ${needle}`);
  }
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

for (const file of legacyPointers) {
  if (!exists(file)) {
    warnings.push(`${file}: legacy pointer absent; ok only if every consumer already moved`);
    continue;
  }
  const txt = read(file);
  requireIncludes(file, txt, ['status: "LEGACY_ALIAS"', 'owner:', 'truth_scope: "LEGACY_POINTER_ONLY"', 'canonical: false']);
  if (/\uFFFD|��/.test(txt)) errors.push(`${file}: replacement-character/corrupted emoji found`);
}

for (const file of walk(DOCS)) {
  const txt = read(file);
  if (/\uFFFD|��/.test(txt)) warnings.push(`${file}: possible corrupted emoji/replacement character`);
  if (/^\+{1,3}\s*#{1,6}\s/m.test(txt) || /^\+\s*→/m.test(txt)) warnings.push(`${file}: possible patch artifact line`);
}

console.log(JSON.stringify({
  schema: 'centraldark.grafo-vivo-markdown-conformance.v1',
  checked_stable_owners: requiredStableOwners.length,
  checked_legacy_pointers: legacyPointers.length,
  scanned_docs_markdown: walk(DOCS).length,
  warnings,
  errors,
  status: errors.length ? 'FAIL' : 'PASS',
}, null, 2));

if (errors.length) process.exit(1);
