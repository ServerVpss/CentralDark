#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_STDIN_BYTES = 2 * 1024 * 1024;
const MAX_IDENTIFIER_LENGTH = 160;

function sha256(value) {
  return createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');
}

export function sanitizeIdentifier(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_IDENTIFIER_LENGTH);
}

export function buildCheckpoint(input = {}, observed = {}, now = new Date()) {
  const transcriptPath = typeof input.transcript_path === 'string' ? input.transcript_path : '';

  return {
    schema: 'centraldark.precompact-checkpoint.v1',
    observed_at: now.toISOString(),
    source: 'CLAUDE_PRECOMPACT',
    hook_event_name: sanitizeIdentifier(input.hook_event_name) ?? 'PreCompact',
    trigger: sanitizeIdentifier(input.trigger),
    session_id: sanitizeIdentifier(input.session_id),
    transcript_path_present: Boolean(transcriptPath),
    transcript_path_sha256: transcriptPath ? sha256(transcriptPath) : null,
    repository: {
      root_name: sanitizeIdentifier(observed.rootName) ?? 'CentralDark',
      root_path_sha256: observed.repoRoot ? sha256(observed.repoRoot) : null,
      branch: sanitizeIdentifier(observed.branch),
      head_sha: sanitizeIdentifier(observed.head),
      dirty_count: Number.isInteger(observed.dirtyCount) ? observed.dirtyCount : null,
      worktree_state_sha256: observed.porcelain ? sha256(observed.porcelain) : null,
    },
    epistemic_state: 'HISTORICAL_REFERENCE_UNTIL_REMEASURED',
    checkpoint_is_authority: false,
    direct_canonical_mutation: false,
    raw_transcript_persisted: false,
    raw_prompt_persisted: false,
    raw_tool_data_persisted: false,
    raw_environment_persisted: false,
    resume_contract: {
      action: 'REMEASURE_THEN_CONTINUE',
      canonical_refs: [
        'LEIA-ME-IA.md',
        'AGENTS.md',
        'CLAUDE.md',
        '.agents/skills/session-intelligence-harvester/SKILL.md',
        'scripts/memory-linker/README.md',
        'docs/BRAIN/01-CONCEITOS/02-BANDA/INTENT_SYNC_STATE.md',
      ],
      invariants: [
        'REUSE_BEFORE_CREATE=true',
        'ONE_SYSTEM_ONLY=true',
        'ONE_WRITER_PER_CONFLICT_SCOPE=true',
        'HISTORICAL!=CURRENT',
        'UNKNOWN!=PASS',
      ],
    },
  };
}

function git(args, cwd = process.cwd()) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

export function observeRepository(cwd = process.cwd()) {
  const repoRoot = git(['rev-parse', '--show-toplevel'], cwd);
  const branch = git(['branch', '--show-current'], repoRoot) || 'DETACHED';
  const head = git(['rev-parse', 'HEAD'], repoRoot);
  const porcelain = git(['status', '--porcelain=v1'], repoRoot);
  const dirtyCount = porcelain ? porcelain.split(/\r?\n/).filter(Boolean).length : 0;
  const rootName = repoRoot.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || 'CentralDark';
  let gitDir = git(['rev-parse', '--git-dir'], repoRoot);
  if (!isAbsolute(gitDir)) gitDir = resolve(repoRoot, gitDir);

  return { repoRoot, rootName, branch, head, porcelain, dirtyCount, gitDir };
}

async function readHookInput(stream = process.stdin) {
  let raw = '';
  for await (const chunk of stream) {
    raw += chunk;
    if (Buffer.byteLength(raw, 'utf8') > MAX_STDIN_BYTES) {
      throw new Error('HOOK_INPUT_TOO_LARGE');
    }
  }
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function persistCheckpoint(checkpoint, gitDir) {
  const target = resolve(gitDir, 'centraldark', 'precompact', 'latest.json');
  const temp = `${target}.tmp-${process.pid}`;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(temp, `${JSON.stringify(checkpoint, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  renameSync(temp, target);
  return target;
}

async function main() {
  try {
    const input = await readHookInput();
    const observed = observeRepository();
    const checkpoint = buildCheckpoint(input, observed);
    persistCheckpoint(checkpoint, observed.gitDir);
  } catch (error) {
    // Context compaction must not be blocked because the local checkpoint degraded.
    // The failure stays visible while the canonical state remains unchanged.
    const code = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CENTRALDARK_PRECOMPACT=DEGRADED reason=${code}\n`);
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  await main();
}
