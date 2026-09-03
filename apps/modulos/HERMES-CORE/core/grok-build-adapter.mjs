#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const CONTRACT = path.join(ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-BUILD-ADAPTER.yml');

function fail(message) {
  const error = new Error(message);
  error.code = 'GROK_BUILD_ADAPTER_INVALID';
  throw error;
}

function requiredText(value, name) {
  const out = String(value ?? '').trim();
  if (!out) fail(`${name}_REQUIRED`);
  return out;
}

function positiveInt(value, name) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) fail(`${name}_MUST_BE_POSITIVE_INTEGER`);
  return n;
}

function normalizeOutputFormat(value) {
  const format = String(value ?? 'json').trim().toLowerCase();
  if (!['plain', 'json', 'streaming-json'].includes(format)) fail('OUTPUT_FORMAT_INVALID');
  return format;
}

function sessionArgs(session = {}) {
  const mode = String(session.mode ?? 'fresh').trim().toLowerCase();
  const args = [];

  if (mode === 'fresh') {
    if (session.id) args.push('--session-id', requiredText(session.id, 'SESSION_ID'));
    if (session.fork) fail('FORK_REQUIRES_RESUME_OR_CONTINUE');
    return args;
  }

  if (mode === 'resume') {
    args.push('--resume');
    if (session.id) args.push(requiredText(session.id, 'SESSION_ID'));
    if (session.fork) args.push('--fork-session');
    return args;
  }

  if (mode === 'continue') {
    args.push('--continue');
    if (session.id) fail('CONTINUE_DOES_NOT_ACCEPT_SESSION_ID');
    if (session.fork) args.push('--fork-session');
    return args;
  }

  fail('SESSION_MODE_INVALID');
}

export function buildGrokInvocation(input = {}) {
  const mode = String(input.mode ?? 'HEADLESS').trim().toUpperCase();

  if (mode === 'ACP_STDIO') {
    return {
      schema: 'centraldark.grok-build-invocation.v1',
      mode,
      argv: ['grok', 'agent', 'stdio'],
      cwd: null,
      mutates_target: false,
      requires_writer_scope: false,
      transport: 'JSON_RPC_STDIO',
    };
  }

  if (mode === 'INSPECT') {
    const workdir = requiredText(input.workdir, 'WORKDIR');
    return {
      schema: 'centraldark.grok-build-invocation.v1',
      mode,
      argv: ['grok', 'inspect'],
      cwd: workdir,
      mutates_target: false,
      requires_writer_scope: false,
      inspect_is_invocation_proof: false,
    };
  }

  if (!['HEADLESS', 'READ_ONLY_AUDIT', 'INTERACTIVE_PTY'].includes(mode)) fail('MODE_INVALID');

  const workdir = requiredText(input.workdir, 'WORKDIR');

  if (mode === 'INTERACTIVE_PTY') {
    return {
      schema: 'centraldark.grok-build-invocation.v1',
      mode,
      argv: ['grok', '--no-auto-update', '--cwd', workdir],
      cwd: workdir,
      pty_required: true,
      tmux_recommended: true,
      mutates_target: false,
      requires_writer_scope: true,
      note: 'Interactive mode does not grant mutation authority; writer scope is evaluated outside the TUI.',
    };
  }

  const prompt = requiredText(input.prompt, 'PROMPT');
  const outputFormat = normalizeOutputFormat(input.output_format);
  const maxTurns = positiveInt(input.max_turns, 'MAX_TURNS');
  const wantsMutation = input.mutation_intent === true;
  const wantsAutoApprove = input.always_approve === true;
  const writerScope = String(input.writer_scope ?? '').trim();
  const writerProven = input.writer_scope_proven === true;

  if (mode === 'READ_ONLY_AUDIT' && (wantsMutation || wantsAutoApprove)) {
    fail('READ_ONLY_AUDIT_FORBIDS_MUTATION');
  }

  if (wantsAutoApprove && !wantsMutation) fail('AUTO_APPROVE_REQUIRES_MUTATION_INTENT');
  if (wantsMutation && (!writerProven || !writerScope)) fail('MUTATION_REQUIRES_PROVEN_WRITER_SCOPE');

  const argv = ['grok', '--no-auto-update'];
  argv.push(...sessionArgs(input.session));
  if (wantsAutoApprove) argv.push('--always-approve');
  argv.push('-p', prompt, '--cwd', workdir, '--output-format', outputFormat);
  if (maxTurns != null) argv.push('--max-turns', String(maxTurns));

  return {
    schema: 'centraldark.grok-build-invocation.v1',
    mode,
    argv,
    cwd: workdir,
    output_format: outputFormat,
    mutates_target: wantsMutation,
    auto_approve: wantsAutoApprove,
    writer_scope: writerScope || null,
    writer_scope_proven: writerProven,
    requires_writer_scope: wantsMutation,
    no_auto_update: true,
    semantic_green_required_before_claim: true,
    engine_result_is_authority: false,
  };
}

function assert(condition, label) {
  if (!condition) fail(`SELF_TEST:${label}`);
}

export function selfTest() {
  if (!fs.existsSync(CONTRACT)) fail('CONTRACT_MISSING');
  const contract = fs.readFileSync(CONTRACT, 'utf8');
  for (const token of [
    'no_auto_update_required: true',
    'workdir_required: true',
    'read_only_audit_forbids_always_approve: true',
    'grok_cli_auth_is_hermes_xai_auth: false',
    'centraldark_universal_method_still_required: true',
    'parallel_mutation_same_scope: false',
    'runtime_adapter: apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs',
  ]) assert(contract.includes(token), `CONTRACT_TOKEN:${token}`);

  const audit = buildGrokInvocation({
    mode: 'READ_ONLY_AUDIT',
    workdir: '/tmp/project',
    prompt: 'review only',
  });
  assert(audit.argv.includes('--no-auto-update'), 'AUDIT_NO_AUTO_UPDATE');
  assert(audit.argv.includes('--output-format'), 'AUDIT_STRUCTURED_OUTPUT');
  assert(!audit.argv.includes('--always-approve'), 'AUDIT_NO_AUTO_APPROVE');
  assert(audit.mutates_target === false, 'AUDIT_READ_ONLY');

  let blockedWrite = false;
  try {
    buildGrokInvocation({
      mode: 'HEADLESS',
      workdir: '/tmp/project',
      prompt: 'change file',
      mutation_intent: true,
      always_approve: true,
    });
  } catch (error) {
    blockedWrite = String(error.message).includes('MUTATION_REQUIRES_PROVEN_WRITER_SCOPE');
  }
  assert(blockedWrite, 'WRITE_BLOCKED_WITHOUT_WRITER');

  const write = buildGrokInvocation({
    mode: 'HEADLESS',
    workdir: '/tmp/project',
    prompt: 'change file',
    mutation_intent: true,
    always_approve: true,
    writer_scope: 'PR#1381:apps/modulos/example',
    writer_scope_proven: true,
    max_turns: 8,
  });
  assert(write.argv.includes('--always-approve'), 'WRITE_AUTO_APPROVE_ALLOWED_WITH_WRITER');
  assert(write.argv.includes('--max-turns'), 'WRITE_BOUNDED_TURNS');

  const resume = buildGrokInvocation({
    mode: 'HEADLESS',
    workdir: '/tmp/project',
    prompt: 'continue',
    session: { mode: 'resume', id: '00000000-0000-4000-8000-000000000001' },
  });
  assert(resume.argv.includes('--resume'), 'RESUME_FLAG');
  assert(!resume.argv.includes('--session-id'), 'RESUME_NOT_NEW_SESSION');

  const continuedFork = buildGrokInvocation({
    mode: 'HEADLESS',
    workdir: '/tmp/project',
    prompt: 'fork',
    session: { mode: 'continue', fork: true },
  });
  assert(continuedFork.argv.includes('--continue'), 'CONTINUE_FLAG');
  assert(continuedFork.argv.includes('--fork-session'), 'FORK_FLAG');

  const acp = buildGrokInvocation({ mode: 'ACP_STDIO' });
  assert(JSON.stringify(acp.argv) === JSON.stringify(['grok', 'agent', 'stdio']), 'ACP_STDIO_SHAPE');

  const inspect = buildGrokInvocation({ mode: 'INSPECT', workdir: '/tmp/project' });
  assert(JSON.stringify(inspect.argv) === JSON.stringify(['grok', 'inspect']), 'INSPECT_SHAPE');

  return {
    schema: 'centraldark.grok-build-adapter.self-test.v1',
    ok: true,
    tests: [
      'read_only_has_no_auto_approve',
      'write_without_writer_is_blocked',
      'write_with_writer_is_bounded_and_explicit',
      'resume_does_not_create_new_session',
      'continue_can_fork',
      'acp_stdio_shape',
      'inspect_shape',
    ],
  };
}

function parseJsonArg() {
  const idx = process.argv.indexOf('--input-json');
  if (idx < 0) return null;
  if (!process.argv[idx + 1]) fail('INPUT_JSON_REQUIRED');
  return JSON.parse(process.argv[idx + 1]);
}

function main() {
  try {
    if (process.argv.includes('--self-test')) {
      const result = selfTest();
      console.log(JSON.stringify(result, null, 2));
      console.log('GROK_BUILD_ADAPTER_SELF_TEST=PASS');
      return;
    }
    const input = parseJsonArg();
    if (!input) {
      console.log(JSON.stringify({
        schema: 'centraldark.grok-build-adapter.cli.v1',
        usage: 'node apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs --self-test | --input-json <json>',
      }, null, 2));
      return;
    }
    console.log(JSON.stringify(buildGrokInvocation(input), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    process.exitCode = 1;
  }
}

main();
