#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

// The unmerged index and conflict markers *already committed in the PR HEAD*
// are different failure modes. Detect the latter from the immutable Git blob,
// not from the merge worktree (which normally contains temporary markers).
function inspectCommittedMarkers(repoPath) {
  if (!new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.json', '.yaml', '.yml', '.sh', '.ps1', '.py']).has(ext)) {
    return { state: 'NOT_APPLICABLE', blocks: 0, lines: [] };
  }
  let data;
  try {
    data = execFileSync('git', ['show', 'HEAD:' + repoPath], {
      encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return { state: 'UNAVAILABLE', blocks: 0, lines: [] };
  }
  let state = 0;
  let blocks = 0;
  let malformed = false;
  const lines = [];
  for (const [i, line] of data.replace(/\r\n/g, '\n').split('\n').entries()) {
    if (/^<<<<<<<(?: |$)/.test(line)) {
      lines.push(i + 1);
      if (state !== 0) malformed = true;
      state = 1;
    } else if (/^\|\|\|\|\|\|\|(?: |$)/.test(line)) {
      if (state !== 1) malformed = true;
    } else if (/^=======$/.test(line)) {
      lines.push(i + 1);
      if (state !== 1) malformed = true;
      state = 2;
    } else if (/^>>>>>>>(?: |$)/.test(line)) {
      lines.push(i + 1);
      if (state !== 2) malformed = true;
      state = 0;
      blocks += 1;
    }
  }
  if (state !== 0) malformed = true;
  return {
    state: lines.length === 0 ? 'NONE' : malformed ? 'COMMITTED_MALFORMED' : 'COMMITTED_BLOCKS',
    blocks, lines,
  };
}

const committedMarkers = inspectCommittedMarkers(normalized);

let action = 'YELLOW';
let reason = 'UNKNOWN_CODE_OR_CONFIG_REQUIRES_DISCRIMINANT';
let conflictId = 'UNREGISTERED';
let source = 'path-policy';
let structuredStrategy = '';
let semanticKey = '';
let sourceRef = '';
let preserveRule = '';

if (['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(base)) {
  action = 'CURRENT';
  reason = 'DEPENDENCY_MANIFEST_OR_LOCKFILE_PRESERVE_PR_DELTA';
  conflictId = 'DEPENDENCY_MANIFEST_OR_LOCKFILE';
} else {
  const known = matchKnown(normalized);
  if (known) {
    conflictId = String(known.CONFLICT_ID || 'KNOWN');
    source = 'known-conflict-patterns.json';
    sourceRef = String(known.SOURCE_REF || '');
    preserveRule = String(known.PRESERVE_RULE || '');
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
    } else if (policy === 'REVIEW' || policy === 'BLOCK_REVIEW') {
      action = 'YELLOW';
      reason = 'KNOWN_OWNER_REVIEW_AND_COUNTERPROOF_REQUIRED';
    } else if (policy === 'STRUCTURED') {
      action = 'STRUCTURED';
      structuredStrategy = String(known.STRUCTURED_STRATEGY || '');
      semanticKey = String(known.SEMANTIC_KEY || '');
      reason = structuredStrategy ? 'KNOWN_POLICY_STRUCTURED' : 'KNOWN_POLICY_STRUCTURED_MISSING_STRATEGY';
      if (!structuredStrategy) action = 'YELLOW';
    }
    if (action !== 'YELLOW' && (!sourceRef || !preserveRule)) {
      action = 'YELLOW';
      reason = 'KNOWN_POLICY_MISSING_PRIMARY_SOURCE_OR_PRESERVE_RULE';
    }
  }
}

// UNKNOWN textual conflicts are not automatically semantically compatible.
// Preserve YELLOW until a proven pattern is added to the canonical registry.
if (action === 'YELLOW' && reason === 'UNKNOWN_CODE_OR_CONFIG_REQUIRES_DISCRIMINANT') {
  reason = 'UNREGISTERED_CONFLICT_REQUIRES_PROVEN_PATTERN';
}

// A committed marker cannot be resolved by selecting --ours/--theirs
// during a later merge. Never silently discard either policy branch.
if (committedMarkers.state.startsWith('COMMITTED_')) {
  action = 'YELLOW';
  reason = committedMarkers.state === 'COMMITTED_MALFORMED'
    ? 'PR_HEAD_MALFORMED_CONFLICT_MARKERS'
    : 'PR_HEAD_COMMITTED_CONFLICT_MARKERS_REQUIRE_RECONCILIATION';
  conflictId = 'PR_HEAD_EMBEDDED_MERGE_MARKERS';
  source = 'git HEAD:path';
  structuredStrategy = '';
}

console.log(JSON.stringify({
  path: normalized,
  committed_marker_state: committedMarkers.state,
  committed_marker_blocks: committedMarkers.blocks,
  committed_marker_lines: committedMarkers.lines,
  action,
  reason,
  conflict_id: conflictId,
  source,
  structured_strategy: structuredStrategy,
  semantic_key: semanticKey,
  source_ref: sourceRef,
  preserve_rule: preserveRule,
  current_means: 'PR_HEAD',
  incoming_means: 'MAIN',
  unknown_is_pass: false
}));
