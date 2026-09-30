#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('USAGE: semantic-all-resolver.mjs <file>');
  process.exit(2);
}

const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz', '.tar', '.7z', '.mp4', '.mov', '.exe', '.dll', '.so', '.dylib'
]);

const ext = path.extname(file).toLowerCase();
if (binaryExtensions.has(ext)) {
  console.error(`SEMANTIC_ALL_BINARY_BLOCKED path=${file}`);
  process.exit(3);
}

const original = fs.readFileSync(file, 'utf8');
const newline = original.includes('\r\n') ? '\r\n' : '\n';
const lines = original.replace(/\r\n/g, '\n').split('\n');
const out = [];
let conflicts = 0;
let preservedBoth = 0;
let identical = 0;

function trimTrailingBlank(value) {
  const next = [...value];
  while (next.length && next[next.length - 1] === '') next.pop();
  return next;
}

function sameLines(a, b) {
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

for (let i = 0; i < lines.length; i += 1) {
  if (!lines[i].startsWith('<<<<<<< ')) {
    out.push(lines[i]);
    continue;
  }

  conflicts += 1;
  const ours = [];
  const theirs = [];
  i += 1;

  while (i < lines.length && lines[i] !== '=======') ours.push(lines[i++]);
  if (i >= lines.length) throw new Error(`CONFLICT_SEPARATOR_MISSING:${file}`);
  i += 1;
  while (i < lines.length && !lines[i].startsWith('>>>>>>> ')) theirs.push(lines[i++]);
  if (i >= lines.length) throw new Error(`CONFLICT_END_MISSING:${file}`);

  const left = trimTrailingBlank(ours);
  const right = trimTrailingBlank(theirs);
  if (sameLines(left, right)) {
    out.push(...left);
    identical += 1;
  } else {
    out.push(...left);
    if (left.length && right.length && out[out.length - 1] !== '') out.push('');
    out.push(...right);
    preservedBoth += 1;
  }
}

const normalizedOut = out.map((line) => line.replace(/[ \t]+$/g, ''));
const resolved = normalizedOut.join(newline);
console.log('TRAILING_WHITESPACE_NORMALIZED=1');
if (/^(<<<<<<< |=======|>>>>>>> )/m.test(resolved)) {
  console.error(`SEMANTIC_ALL_MARKERS_LEFT path=${file}`);
  process.exit(4);
}

fs.writeFileSync(file, resolved);
console.log(`SEMANTIC_ALL_RESOLVED path=${file} conflicts=${conflicts} preserved_both=${preservedBoth} identical=${identical}`);
