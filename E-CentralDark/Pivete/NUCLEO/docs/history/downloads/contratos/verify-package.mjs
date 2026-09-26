#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const required = [
  '00-LEIA-PRIMEIRO.md',
  'BOOT-CANONICO.txt',
  'HERMES-HANDOFF.md',
  'CONFIG/centraldark-one-flow.json',
  'CONTRACTS/source-envelope.schema.json',
  'CONTRACTS/evidence-envelope.schema.json',
  'src/pipeline/one-flow.mjs',
  'tests/one-flow.test.mjs'
];

let ok = true;
for (const rel of required) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    ok = false;
    console.error(`MISSING ${rel}`);
  }
}

for (const rel of [
  'CONFIG/centraldark-one-flow.json',
  'CONTRACTS/source-envelope.schema.json',
  'CONTRACTS/evidence-envelope.schema.json',
  'CONTRACTS/delta-envelope.schema.json',
  'CONTRACTS/reality-judge.schema.json',
  'CONTRACTS/crystal.schema.json'
]) {
  JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

const sums = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (!p.endsWith('SHA256SUMS.txt')) {
      const rel = path.relative(root, p).replaceAll('\\', '/');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      sums.push(`${hash}  ${rel}`);
    }
  }
}
walk(root);
sums.sort();
fs.mkdirSync(path.join(root, 'checksums'), { recursive: true });
fs.writeFileSync(path.join(root, 'checksums/SHA256SUMS.txt'), sums.join('\n') + '\n');

console.log(ok ? 'PACKAGE_VERIFY=PASS' : 'PACKAGE_VERIFY=FAIL');
console.log(`FILES_HASHED=${sums.length}`);
process.exit(ok ? 0 : 1);
