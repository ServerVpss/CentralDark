import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCheckpoint, sanitizeIdentifier } from './precompact-session-digest.mjs';

test('precompact checkpoint whitelists metadata and drops raw sensitive payloads', () => {
  const secret = 'fixture';
  const input = {
    hook_event_name: 'PreCompact',
    trigger: 'auto',
    session_id: 'session-123',
    transcript_path: 'C:/Users/example/.claude/projects/private/session.jsonl',
    prompt: secret,
    tool_input: { token: secret },
    env: { API_KEY: secret },
    custom_instructions: secret,
  };
  const observed = {
    repoRoot: 'E:/CentralDark/workspace',
    rootName: 'workspace',
    branch: 'feature/example',
    head: '0123456789abcdef0123456789abcdef01234567',
    porcelain: ' M file-a\n?? file-b',
    dirtyCount: 2,
  };

  const checkpoint = buildCheckpoint(input, observed, new Date('2026-09-08T23:30:00.000Z'));
  const encoded = JSON.stringify(checkpoint);

  assert.equal(checkpoint.schema, 'centraldark.precompact-checkpoint.v1');
  assert.equal(checkpoint.session_id, 'session-123');
  assert.equal(checkpoint.repository.branch, 'feature/example');
  assert.equal(checkpoint.repository.dirty_count, 2);
  assert.equal(checkpoint.raw_transcript_persisted, false);
  assert.equal(checkpoint.raw_prompt_persisted, false);
  assert.equal(checkpoint.raw_tool_data_persisted, false);
  assert.equal(checkpoint.raw_environment_persisted, false);
  assert.equal(checkpoint.checkpoint_is_authority, false);
  assert.equal(checkpoint.direct_canonical_mutation, false);
  assert.equal(encoded.includes(secret), false);
  assert.equal(encoded.includes('C:/Users/example/.claude/projects/private/session.jsonl'), false);
  assert.match(checkpoint.transcript_path_sha256, /^[a-f0-9]{64}$/);
  assert.match(checkpoint.repository.root_path_sha256, /^[a-f0-9]{64}$/);
  assert.match(checkpoint.repository.worktree_state_sha256, /^[a-f0-9]{64}$/);
});

test('identifier sanitizer bounds untrusted hook metadata', () => {
  assert.equal(sanitizeIdentifier('  hello  '), 'hello');
  assert.equal(sanitizeIdentifier(''), null);
  assert.equal(sanitizeIdentifier(null), null);
  assert.equal(sanitizeIdentifier('x'.repeat(500)).length, 160);
});
