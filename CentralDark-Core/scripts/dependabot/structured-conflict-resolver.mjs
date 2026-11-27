#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
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

function atomicReplace(file, content) {
  const target = path.resolve(file);
  let originalStat = null;
  try { originalStat = fs.lstatSync(target); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (originalStat && (originalStat.isSymbolicLink() || !originalStat.isFile())) throw new Error('COSTURA_ATOMIC_TARGET_INVALID');
  const next = Buffer.from(content, "utf8");
  if (originalStat && fs.readFileSync(target).equals(next)) return;
  const temp = path.join(path.dirname(target), "." + path.basename(target) + ".costura-" + randomUUID() + ".tmp");
  let fd;
  try {
    fd = fs.openSync(temp, "wx", originalStat ? originalStat.mode & 0o777 : 0o600);
    fs.writeFileSync(fd, next);
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = undefined;
    fs.renameSync(temp, target);
    if (!fs.readFileSync(target).equals(next)) throw new Error("COSTURA_ATOMIC_READBACK_MISMATCH");
    if (process.platform !== "win32") {
      const dirFd = fs.openSync(path.dirname(target), "r");
      try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
    }
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

function write(text) {
  atomicReplace(file, text.endsWith('\n') ? text : text + '\n');
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
    const key = item && typeof item === 'object' && (item.CONFLICT_ID != null || item.id != null)
      ? String(item.CONFLICT_ID ?? item.id)
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
