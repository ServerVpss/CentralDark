#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('USAGE: classify-conflict.mjs <repo-relative-path>');
  process.exit(2);
}

const registryPath = process.env.CONFLICT_REGISTRY || 'scripts/dependabot/known-conflict-patterns.json';

function globToRegExp(glob) {
  let out = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          out += '(?:.*/)?';
        } else {
          out += '.*';
        }
      } else {
        out += '[^/]*';
      }
    } else if ('\\.^$+?()[]{}|'.includes(c)) {
      out += '\\' + c;
    } else {
      out += c;
    }
  }
  return new RegExp(out + '$');
}

function matchKnown(p) {
  if (!fs.existsSync(registryPath)) return null;
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch {
    return null;
  }
  for (const item of registry.patterns || []) {
    const pattern = String(item.PATH_PATTERN || '');
    if (!pattern) continue;
    if (globToRegExp(pattern).test(p)) return item;
  }
  return null;
}

const normalized = file.replaceAll('\\', '/');
const base = path.posix.basename(normalized);
const ext = path.posix.extname(normalized).toLowerCase();

let action = 'YELLOW';
let reason = 'UNKNOWN_CODE_OR_CONFIG_REQUIRES_DISCRIMINANT';
let conflictId = 'UNREGISTERED';
let source = 'path-policy';

if (['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(base)) {
  action = 'CURRENT';
  reason = 'DEPENDENCY_MANIFEST_OR_LOCKFILE_PRESERVE_PR_DELTA';
  conflictId = 'DEPENDENCY_MANIFEST_OR_LOCKFILE';
} else {
  const known = matchKnown(normalized);
  if (known) {
    conflictId = String(known.CONFLICT_ID || 'KNOWN');
    source = 'known-conflict-patterns.json';
    const policy = String(known.SAFE_RESOLUTION || '').toUpperCase();
    if (policy === 'USE_PR_SIDE') {
      action = 'CURRENT';
      reason = 'KNOWN_POLICY_USE_PR_SIDE';
    } else if (policy === 'USE_MAIN_SIDE') {
      action = 'INCOMING';
      reason = 'KNOWN_POLICY_USE_MAIN_SIDE';
    } else if (policy === 'PRESERVE_BOTH' || policy === 'USE_BOTH') {
      action = 'BOTH';
      reason = 'KNOWN_POLICY_PRESERVE_BOTH';
    }
  }
}

if (action === 'YELLOW') {
  const textExt = new Set(['.md', '.txt', '.mmd', '.jsonl', '.csv', '.rst', '.adoc']);
  if (textExt.has(ext)) {
    action = 'BOTH';
    reason = 'UNKNOWN_TEXT_PRESERVE_BOTH_THEN_VALIDATE';
  }
}

console.log(JSON.stringify({
  path: normalized,
  action,
  reason,
  conflict_id: conflictId,
  source,
  current_means: 'PR_HEAD',
  incoming_means: 'MAIN',
  unknown_is_pass: false
}));
