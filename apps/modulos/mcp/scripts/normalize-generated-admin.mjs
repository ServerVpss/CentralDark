#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const path = resolve('dist/admin.js');
const from = 'const m = /\\s(\\/[a-zA-Z0-9/_\\-.]+)/.exec';
const to = 'const m = /\\s(\\/[a-zA-Z0-9\\/_\\-.]+)/.exec';

const current = await readFile(path, 'utf8');
const occurrences = current.split(from).length - 1;

if (occurrences === 0) {
  if (current.includes(to)) {
    console.log('MCP_GENERATED_ADMIN_NORMALIZED=ALREADY');
    process.exit(0);
  }
  throw new Error('MCP_GENERATED_ADMIN_NORMALIZATION_TARGET_MISSING');
}

if (occurrences !== 1) {
  throw new Error(`MCP_GENERATED_ADMIN_NORMALIZATION_AMBIGUOUS:${occurrences}`);
}

await writeFile(path, current.replace(from, to), 'utf8');
console.log('MCP_GENERATED_ADMIN_NORMALIZED=1');
