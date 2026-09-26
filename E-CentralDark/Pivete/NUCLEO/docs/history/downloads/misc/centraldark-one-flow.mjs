#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { runOneFlow } from '../src/pipeline/one-flow.mjs';

const args = process.argv.slice(2);
const get = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const inputPath = get('--input');
const outPath = get('--out');

if (!inputPath) {
  console.error('Usage: node bin/centraldark-one-flow.mjs --input <json> [--out <receipt.json>]');
  process.exit(2);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const receipt = runOneFlow(raw);

const text = JSON.stringify(receipt, null, 2);
if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, text, 'utf8');
  console.log(`RECEIPT=${path.resolve(outPath)}`);
} else {
  console.log(text);
}
