#!/usr/bin/env node
// #OBSERVACOES# | CENTRALDARK.CODE.DOC.SYNC
// @owner: .agents/skills/centraldark-operational-method/SKILL.md (WORKTREE TEARDOWN)
// @doc_ref: .agents/skills/centraldark-operational-method/SKILL.md
// @last_updated: 2026-10-28T00:45:20.454Z
// Standalone Git worktree teardown gate; no extra scheduler or storage owner.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const fail = (code) => { const e = new Error(code); e.code = code; throw e; };
const args = process.argv.slice(2);
const get = (key) => {
  const index = args.indexOf('--' + key);
  return index >= 0 ? args[index + 1] : null;
};
const apply = args.includes('--apply');
const repo = get('repo');
const target = get('target');
const allowedRoot = get('allowed-root');
const receiptRef = get('receipt-ref');
const remote = get('remote') || 'origin';

const normalize = (p) => path.normalize(fs.realpathSync.native(p)).replace(/[\\/]+$/,'').toLowerCase();
function git(where, ...cmd) {
  const result = spawnSync('git', ['-C', where, ...cmd], {
    encoding: 'utf8', windowsHide: true, timeout: 30000,
    maxBuffer: 1024 * 1024,
  });
  if (result.error || result.status !== 0) fail('GIT_COMMAND_FAILED:' + cmd[0]);
  return result.stdout.trim();
}
function inventory(directory) {
  return git(directory, 'worktree', 'list', '--porcelain')
    .split(/\r?\n\r?\n/)
    .map(block => Object.fromEntries(
      block.split(/\r?\n/).filter(Boolean).map(line => {
        const cut = line.indexOf(' ');
        return cut < 0 ? [line, true] : [line.slice(0, cut), line.slice(cut + 1)];
      }),
    )).filter(item => item.worktree);
}
function validate() {
  if (!repo || !target || !allowedRoot || !receiptRef) fail('REQUIRED_ARGS_MISSING');
  if (!/^[A-Za-z0-9._/-]+$/.test(receiptRef) ||
      receiptRef.includes('..') || receiptRef.startsWith('/')) fail('RECEIPT_REF_INVALID');
  if (!/^[A-Za-z0-9._-]+$/.test(remote)) fail('REMOTE_NAME_INVALID');
  for (const p of [repo, target, allowedRoot]) {
    if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) fail('PATH_NOT_A_DIRECTORY');
  }
  if (fs.lstatSync(target).isSymbolicLink()) fail('SYMLINK_TARGET_FORBIDDEN');
  const root = normalize(allowedRoot);
  const candidate = normalize(target);
  if (candidate === root || !candidate.startsWith(root + path.sep.toLowerCase()))
    fail('OUTSIDE_ALLOWED_ROOT');
  if (normalize(repo) === candidate) fail('MAIN_WORKTREE_PROTECTED');
  const entries = inventory(repo);
  if (!entries.length || normalize(entries[0].worktree) === candidate) fail('MAIN_WORKTREE_PROTECTED');
  const entry = entries.find(x => normalize(x.worktree) === candidate);
  if (!entry) fail('NOT_A_REGISTERED_WORKTREE');
  if (entry.locked || entry.prunable) fail('WORKTREE_LOCKED_OR_PRUNABLE');
  const branch = git(target, 'symbolic-ref', '--quiet', '--short', 'HEAD');
  const head = git(target, 'rev-parse', 'HEAD');
  if (!/^[0-9a-f]{40}$/.test(head)) fail('HEAD_INVALID');
  if (git(target, 'status', '--porcelain=v1', '--untracked-files=all') !== '')
    fail('UNCOMMITTED_OR_UNTRACKED_CONTENT');
  git(target, 'cat-file', '-e', 'HEAD:' + receiptRef);
  const remoteHead = git(repo, 'ls-remote', '--heads', remote, 'refs/heads/' + branch)
    .split(/\s+/)[0] || '';
  if (remoteHead !== head) fail('REMOTE_COMMIT_NOT_IDENTICAL');
  return { branch, head, remoteHead, receiptRef, candidate, remote };
}
const result = {
  rule: 'TEMP_MATERIAL_EXIT_GATE_V1',
  status: 'UNKNOWN',
  apply,
  target: target || null,
  receipt_ref: receiptRef || null,
  mutation: false,
};
try {
  const verified = validate();
  result.status = 'CANDIDATE_SAFE';
  result.head = verified.head;
  result.branch = verified.branch;
  result.remote_head = verified.remoteHead;
  result.receipt_sha = verified.head;
  if (apply) {
    git(repo, 'worktree', 'remove', target); // NEVER use --force, rm -rf or blind prune.
    if (fs.existsSync(target) || inventory(repo).some(w => {
      try { return normalize(w.worktree) === verified.candidate; } catch { return false; }
    })) fail('REMOVAL_READBACK_FAILED');
    result.status = 'REMOVED_VERIFIED';
    result.mutation = true;
  }
} catch (error) {
  result.status = 'KEEP_ACTIVE';
  result.reason = String(error.code || error.message).split('\n')[0];
  process.exitCode = 2;
}
console.log(JSON.stringify(result));
