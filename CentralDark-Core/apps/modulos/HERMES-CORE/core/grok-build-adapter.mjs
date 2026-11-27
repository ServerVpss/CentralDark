#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const CONTRACT = path.join(ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-BUILD-ADAPTER.yml');
const RUNTIME_SNAPSHOT = path.join(ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-RUNTIME-PATTERN.json');
const MODE_STATE = process.env.CENTRALDARK_GROK_MODE_STATE || '/root/CentralDark/logs/control/grok-mode.json';

const CONTROL_DEFAULTS = Object.freeze({
  invocation_mode: 'HEADLESS',
  agent_profile: 'general-purpose',
  permission_mode: 'default',
  model: 'grok-4.6',
  reasoning_effort: 'low',
  subagents_enabled: true,
  plan_enabled: true,
});

const INVOCATION_MODES = new Set(['HEADLESS', 'READ_ONLY_AUDIT', 'INTERACTIVE_PTY', 'ACP_STDIO', 'INSPECT']);
const AGENT_PROFILES = new Set(['general-purpose', 'plan', 'explore']);
const PERMISSION_MODES = new Set(['default', 'acceptEdits', 'auto', 'dontAsk', 'bypassPermissions', 'plan']);
const ADMIN_PERMISSION_MODES = new Set(['default', 'plan']);
const OBSERVED_MODELS = new Set(['grok-4.6', 'grok-4.5']);
const REASONING_EFFORTS = new Set(['low', 'inherit']);

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

function readJsonSafe(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function cleanChoice(value, allowed, fallback, label) {
  const out = String(value ?? fallback).trim();
  if (!allowed.has(out)) fail(`${label}_INVALID`);
  return out;
}

function cleanMode(value) {
  return cleanChoice(String(value ?? CONTROL_DEFAULTS.invocation_mode).toUpperCase(), INVOCATION_MODES, CONTROL_DEFAULTS.invocation_mode, 'MODE');
}

function cleanBoolean(value, fallback) {
  return value == null ? fallback : value === true;
}

function persistedControlState() {
  const raw = readJsonSafe(MODE_STATE, null);
  if (!raw || typeof raw !== 'object') {
    return { ...CONTROL_DEFAULTS, _state: 'DEFAULT_NOT_PERSISTED', _path: MODE_STATE };
  }
  try {
    return {
      invocation_mode: cleanMode(raw.invocation_mode),
      agent_profile: cleanChoice(raw.agent_profile, AGENT_PROFILES, CONTROL_DEFAULTS.agent_profile, 'AGENT_PROFILE'),
      permission_mode: cleanChoice(raw.permission_mode, ADMIN_PERMISSION_MODES, CONTROL_DEFAULTS.permission_mode, 'ADMIN_PERMISSION_MODE'),
      model: cleanChoice(raw.model, OBSERVED_MODELS, CONTROL_DEFAULTS.model, 'MODEL'),
      reasoning_effort: cleanChoice(raw.reasoning_effort, REASONING_EFFORTS, CONTROL_DEFAULTS.reasoning_effort, 'REASONING_EFFORT'),
      subagents_enabled: cleanBoolean(raw.subagents_enabled, CONTROL_DEFAULTS.subagents_enabled),
      plan_enabled: cleanBoolean(raw.plan_enabled, CONTROL_DEFAULTS.plan_enabled),
      updated_at: raw.updated_at || null,
      _state: 'PERSISTED',
      _path: MODE_STATE,
    };
  } catch (error) {
    return {
      ...CONTROL_DEFAULTS,
      _state: 'INVALID_FALLBACK_DEFAULT',
      _path: MODE_STATE,
      _error: String(error?.message || error),
    };
  }
}

function runtimeEvidence() {
  const snapshot = readJsonSafe(RUNTIME_SNAPSHOT, {});
  const caps = snapshot?.capabilities || {};
  return {
    snapshot_path: RUNTIME_SNAPSHOT,
    captured_at: snapshot?.captured_at || null,
    runtime: snapshot?.runtime || {},
    observed: snapshot?.observed || {},
    watcher_pattern: snapshot?.watcher_pattern || {},
    capabilities: caps,
    invocation_modes: Array.isArray(caps.invocation_modes) ? caps.invocation_modes : [],
    agents: Array.isArray(caps.agents) ? caps.agents : [],
    proof_rules: snapshot?.proof_rules || {},
  };
}

export function getGrokControlCatalog() {
  const evidence = runtimeEvidence();
  const modeEvidence = new Map((evidence.invocation_modes || []).map((x) => [x.id, x.evidence]));
  const agentEvidence = new Map((evidence.agents || []).map((x) => [x.id, x.evidence]));
  return {
    schema: 'centraldark.grok-mode-catalog.v1',
    owner: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-BUILD-ADAPTER.yml',
    adapter: 'apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs',
    defaults: { ...CONTROL_DEFAULTS },
    state_path: MODE_STATE,
    selection_is_runtime_proof: false,
    explicit_input_overrides_admin_default: true,
    invocation_modes: [...INVOCATION_MODES].map((id) => ({
      id,
      evidence: modeEvidence.get(id) || 'UNKNOWN',
      admin_selectable: true,
    })),
    agent_profiles: [...AGENT_PROFILES].map((id) => ({
      id,
      evidence: agentEvidence.get(id) || 'UNKNOWN',
      admin_selectable: true,
    })),
    permission_modes: [...PERMISSION_MODES].map((id) => ({
      id,
      admin_selectable: ADMIN_PERMISSION_MODES.has(id),
      mutation_guard_required: ['acceptEdits', 'auto', 'dontAsk', 'bypassPermissions'].includes(id),
    })),
    models: [...OBSERVED_MODELS].map((id) => ({ id, evidence: 'PROVEN_RUNTIME', admin_selectable: true })),
    reasoning_efforts: [...REASONING_EFFORTS].map((id) => ({ id, admin_selectable: true })),
    booleans: ['subagents_enabled', 'plan_enabled'],
    evidence,
  };
}

export function readGrokControlState() {
  return {
    schema: 'centraldark.grok-mode-state.v1',
    ...persistedControlState(),
    selection_is_runtime_proof: false,
  };
}

export function resolveGrokControl(input = {}) {
  const state = persistedControlState();
  const explicitPermission = input.permission_mode != null;
  const control = {
    invocation_mode: cleanMode(input.mode ?? input.invocation_mode ?? state.invocation_mode),
    agent_profile: cleanChoice(input.agent_profile ?? state.agent_profile, AGENT_PROFILES, CONTROL_DEFAULTS.agent_profile, 'AGENT_PROFILE'),
    permission_mode: cleanChoice(input.permission_mode ?? state.permission_mode, PERMISSION_MODES, CONTROL_DEFAULTS.permission_mode, 'PERMISSION_MODE'),
    model: cleanChoice(input.model ?? state.model, OBSERVED_MODELS, CONTROL_DEFAULTS.model, 'MODEL'),
    reasoning_effort: cleanChoice(input.reasoning_effort ?? state.reasoning_effort, REASONING_EFFORTS, CONTROL_DEFAULTS.reasoning_effort, 'REASONING_EFFORT'),
    subagents_enabled: cleanBoolean(input.subagents_enabled, state.subagents_enabled),
    plan_enabled: cleanBoolean(input.plan_enabled, state.plan_enabled),
    source: Object.keys(input).some((k) => ['mode','invocation_mode','agent_profile','permission_mode','model','reasoning_effort','subagents_enabled','plan_enabled'].includes(k))
      ? 'EXPLICIT_OVER_ADMIN'
      : state._state,
    explicit_permission_mode: explicitPermission,
  };

  if (control.invocation_mode === 'READ_ONLY_AUDIT') {
    control.agent_profile = 'explore';
    control.permission_mode = 'plan';
    control.subagents_enabled = false;
    control.plan_enabled = true;
    control.read_only_forced = true;
  }
  return control;
}

function controlArgs(control, { allowAgent = true } = {}) {
  const args = [];
  if (allowAgent && control.agent_profile) args.push('--agent', control.agent_profile);
  if (control.permission_mode) args.push('--permission-mode', control.permission_mode);
  if (control.model) args.push('--model', control.model);
  if (control.reasoning_effort && control.reasoning_effort !== 'inherit') {
    args.push('--reasoning-effort', control.reasoning_effort);
  }
  if (!control.subagents_enabled) args.push('--no-subagents');
  if (!control.plan_enabled) args.push('--no-plan');
  return args;
}

export function buildGrokInvocation(input = {}) {
  const control = resolveGrokControl(input);
  const mode = control.invocation_mode;
  const wantsMutation = input.mutation_intent === true;
  const wantsAutoApprove = input.always_approve === true;
  const writerScope = String(input.writer_scope ?? '').trim();
  const writerProven = input.writer_scope_proven === true;
  const elevatedPermission = ['acceptEdits', 'auto', 'dontAsk', 'bypassPermissions'].includes(control.permission_mode);

  if (mode === 'READ_ONLY_AUDIT' && (wantsMutation || wantsAutoApprove)) {
    fail('READ_ONLY_AUDIT_FORBIDS_MUTATION');
  }
  if ((wantsAutoApprove || elevatedPermission) && !wantsMutation) {
    fail('ELEVATED_PERMISSION_REQUIRES_MUTATION_INTENT');
  }
  if (wantsMutation && (!writerProven || !writerScope)) {
    fail('MUTATION_REQUIRES_PROVEN_WRITER_SCOPE');
  }

  if (mode === 'ACP_STDIO') {
    const argv = ['grok', 'agent'];
    if (control.model) argv.push('--model', control.model);
    if (control.reasoning_effort && control.reasoning_effort !== 'inherit') {
      argv.push('--reasoning-effort', control.reasoning_effort);
    }
    if (wantsAutoApprove) argv.push('--always-approve');
    argv.push('stdio');
    return {
      schema: 'centraldark.grok-build-invocation.v1',
      mode,
      argv,
      cwd: null,
      mutates_target: wantsMutation,
      requires_writer_scope: wantsMutation,
      transport: 'JSON_RPC_STDIO',
      control_profile: control,
      agent_profile_applied: false,
      selection_is_runtime_proof: false,
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
      control_profile: control,
      selection_is_runtime_proof: false,
    };
  }

  const workdir = requiredText(input.workdir, 'WORKDIR');
  const common = ['grok', '--no-auto-update', ...controlArgs(control)];
  common.push(...sessionArgs(input.session));
  if (wantsAutoApprove) common.push('--always-approve');

  if (mode === 'INTERACTIVE_PTY') {
    common.push('--cwd', workdir);
    return {
      schema: 'centraldark.grok-build-invocation.v1',
      mode,
      argv: common,
      cwd: workdir,
      pty_required: true,
      tmux_recommended: true,
      mutates_target: wantsMutation,
      requires_writer_scope: wantsMutation,
      writer_scope: writerScope || null,
      writer_scope_proven: writerProven,
      control_profile: control,
      selection_is_runtime_proof: false,
      note: 'Interactive mode does not grant mutation authority; writer scope is evaluated before elevated permissions.',
    };
  }

  const prompt = requiredText(input.prompt, 'PROMPT');
  const outputFormat = normalizeOutputFormat(input.output_format);
  const maxTurns = positiveInt(input.max_turns, 'MAX_TURNS');
  common.push('-p', prompt, '--cwd', workdir, '--output-format', outputFormat);
  if (maxTurns != null) common.push('--max-turns', String(maxTurns));

  return {
    schema: 'centraldark.grok-build-invocation.v1',
    mode,
    argv: common,
    cwd: workdir,
    output_format: outputFormat,
    mutates_target: wantsMutation,
    auto_approve: wantsAutoApprove,
    writer_scope: writerScope || null,
    writer_scope_proven: writerProven,
    requires_writer_scope: wantsMutation,
    no_auto_update: true,
    control_profile: control,
    selection_is_runtime_proof: false,
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

  const profiled = buildGrokInvocation({
    mode: 'HEADLESS',
    workdir: '/tmp/project',
    prompt: 'inspect',
    agent_profile: 'general-purpose',
    permission_mode: 'default',
    model: 'grok-4.6',
    reasoning_effort: 'low',
    subagents_enabled: false,
    plan_enabled: false,
  });
  assert(profiled.argv.includes('--agent') && profiled.argv.includes('general-purpose'), 'PROFILE_AGENT_FLAG');
  assert(profiled.argv.includes('--model') && profiled.argv.includes('grok-4.6'), 'PROFILE_MODEL_FLAG');
  assert(profiled.argv.includes('--reasoning-effort') && profiled.argv.includes('low'), 'PROFILE_EFFORT_FLAG');
  assert(profiled.argv.includes('--no-subagents'), 'PROFILE_NO_SUBAGENTS');
  assert(profiled.argv.includes('--no-plan'), 'PROFILE_NO_PLAN');

  assert(audit.control_profile.agent_profile === 'explore', 'AUDIT_FORCES_EXPLORE');
  assert(audit.control_profile.permission_mode === 'plan', 'AUDIT_FORCES_PLAN_PERMISSION');
  assert(audit.argv.includes('--no-subagents'), 'AUDIT_FORCES_NO_SUBAGENTS');

  let elevatedBlocked = false;
  try {
    buildGrokInvocation({
      mode: 'HEADLESS',
      workdir: '/tmp/project',
      prompt: 'unsafe',
      permission_mode: 'auto',
    });
  } catch (error) {
    elevatedBlocked = String(error.message).includes('ELEVATED_PERMISSION_REQUIRES_MUTATION_INTENT');
  }
  assert(elevatedBlocked, 'ELEVATED_PERMISSION_BLOCKED_WITHOUT_MUTATION_INTENT');

  const acp = buildGrokInvocation({
    mode: 'ACP_STDIO',
    model: 'grok-4.6',
    reasoning_effort: 'low',
  });
  assert(acp.argv[0] === 'grok' && acp.argv[1] === 'agent' && acp.argv.at(-1) === 'stdio', 'ACP_STDIO_SHAPE');
  assert(acp.argv.includes('--model') && acp.argv.includes('grok-4.6'), 'ACP_MODEL_BOUND');

  const inspect = buildGrokInvocation({ mode: 'INSPECT', workdir: '/tmp/project' });
  assert(JSON.stringify(inspect.argv) === JSON.stringify(['grok', 'inspect']), 'INSPECT_SHAPE');

  const catalog = getGrokControlCatalog();
  assert(catalog.invocation_modes.some((x) => x.id === 'HEADLESS' && x.evidence === 'PROVEN_RUNTIME'), 'CATALOG_HEADLESS_PROVEN');
  assert(catalog.agent_profiles.some((x) => x.id === 'plan' && /DOCUMENTED/.test(x.evidence)), 'CATALOG_PLAN_DOCUMENTED');
  assert(catalog.permission_modes.some((x) => x.id === 'bypassPermissions' && x.admin_selectable === false), 'ADMIN_CANNOT_SELECT_BYPASS');

  return {
    schema: 'centraldark.grok-build-adapter.self-test.v1',
    ok: true,
    tests: [
      'read_only_has_no_auto_approve',
      'write_without_writer_is_blocked',
      'write_with_writer_is_bounded_and_explicit',
      'resume_does_not_create_new_session',
      'continue_can_fork',
      'profile_flags_bound',
      'read_only_forces_explore_plan',
      'elevated_permission_requires_mutation_intent',
      'acp_stdio_shape',
      'admin_cannot_select_bypass',
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
    if (process.argv.includes('--catalog-json')) {
      console.log(JSON.stringify(getGrokControlCatalog()));
      return;
    }
    if (process.argv.includes('--state-json')) {
      console.log(JSON.stringify(readGrokControlState()));
      return;
    }
    const input = parseJsonArg();
    if (!input) {
      console.log(JSON.stringify({
        schema: 'centraldark.grok-build-adapter.cli.v1',
        usage: 'node apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs --self-test | --catalog-json | --state-json | --input-json <json>',
      }, null, 2));
      return;
    }
    console.log(JSON.stringify(buildGrokInvocation(input), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) main();
