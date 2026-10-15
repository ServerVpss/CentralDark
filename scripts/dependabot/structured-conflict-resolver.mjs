#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [file, strategy, semanticKey = ''] = process.argv.slice(2);
if (!file || !strategy) {
  console.error('USAGE: structured-conflict-resolver.mjs <file> <strategy> [semantic-key]');
  process.exit(2);
}

function gitShow(stage) {
  return execFileSync('git', ['show', ':' + stage + ':' + file], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function write(text) {
  fs.writeFileSync(file, text.endsWith('\n') ? text : text + '\n', 'utf8');
}

function mergeJsonPatternsByIdMainFirst() {
  const ours = JSON.parse(gitShow(2));
  const theirs = JSON.parse(gitShow(3));
  const out = { ...ours };
  for (const [key, value] of Object.entries(theirs)) {
    if (key === 'patterns') continue;
    if (value && typeof value === 'object' && !Array.isArray(value)
        && ours[key] && typeof ours[key] === 'object' && !Array.isArray(ours[key])) {
      out[key] = { ...ours[key], ...value };
    } else {
      out[key] = value;
    }
  }
  const merged = [];
  const seen = new Set();
  for (const item of [...(theirs.patterns || []), ...(ours.patterns || [])]) {
    const key = item && typeof item === 'object' && item !== null
      ? (item.CONFLICT_ID != null ? 'conflict:' + String(item.CONFLICT_ID)
        : item.id != null ? 'id:' + String(item.id) : JSON.stringify(item))
      : JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  out.patterns = merged;
  if (out.refresh && typeof out.refresh === 'object') out.refresh.pattern_count = merged.length;
  write(JSON.stringify(out, null, 2));
  console.log('STRUCTURED_RESOLUTION=PASS strategy=' + strategy + ' path=' + file + ' patterns=' + merged.length);
}

function extractTopLevelBlock(text, key) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line === key + ':');
  if (start < 0) throw new Error('TOPLEVEL_KEY_NOT_FOUND:' + key);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^[A-Za-z0-9_.-]+:\s*/.test(line)) { end = i; break; }
  }
  return lines.slice(start, end).join('\n').trimEnd();
}

function mergeTopLevelYamlKeyFromPrIntoMain() {
  if (!semanticKey) throw new Error('SEMANTIC_KEY_REQUIRED');
  const ours = gitShow(2);
  const theirs = gitShow(3);
  const keyEscaped = semanticKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keyRegex = new RegExp('^' + keyEscaped + ':\\s*$', 'm');
  if (keyRegex.test(theirs)) {
    write(theirs);
    console.log('STRUCTURED_RESOLUTION=PASS strategy=' + strategy + ' path=' + file + ' key=' + semanticKey + ' already_in_main=1');
    return;
  }
  const block = extractTopLevelBlock(ours, semanticKey);
  write(theirs.replace(/\s*$/, '') + '\n\n' + block + '\n');
  console.log('STRUCTURED_RESOLUTION=PASS strategy=' + strategy + ' path=' + file + ' key=' + semanticKey + ' appended=1');
}

try {
  if (strategy === 'MERGE_JSON_PATTERNS_BY_ID_MAIN_FIRST') mergeJsonPatternsByIdMainFirst();
  else if (strategy === 'MERGE_TOPLEVEL_YAML_KEY_FROM_PR_INTO_MAIN') mergeTopLevelYamlKeyFromPrIntoMain();
  else throw new Error('UNKNOWN_STRUCTURED_STRATEGY:' + strategy);
} catch (error) {
  console.error('STRUCTURED_RESOLUTION=BLOCKED strategy=' + strategy + ' path=' + file + ' error=' + error.message);
  process.exit(3);
}
