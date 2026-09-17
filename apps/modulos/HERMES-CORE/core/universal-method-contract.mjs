#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const FILES = {
  soul: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
  universal: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
  aureola: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml',
  master: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',
  engine: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
  hermesPrompt: 'apps/modulos/HERMES-CORE/prompts/hermes-core.md',
  mandatorySkill: '.agents/skills/universal-method-contract/SKILL.md',
  mandatoryGate: '.agents/skills/universal-method-contract/scripts/gate.mjs',
  tlc23: 'docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf',
};

const TLC23_CANONICAL_SHA256 = 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1';

const REQUIRED_CHAIN = [
  'CENTRALDARK', 'TLC23_OPEN', 'DESTINATION_LOCK', 'ACORDAR', 'CALIBRAR',
  'MULTIBUSSOLA', 'PEGATUDO', 'PEGATUDO_HISTORY', 'DEBITO_COGNITIVO',
  'READERS_MEASURE', 'META_LUPA', 'SCOPE_TEMPERATURE', 'DELTA_MINIMUM',
  'RENDEZVOUS', 'RECONCILE', 'STITCH', 'OWNER', 'ONE_WRITER', 'PATCH',
  'TESTE', 'CONTRAPROVA', 'SEMANTIC_GREEN_GATE', 'REALITY_JUDGE',
  'FIXED_POINT', 'TLC23_CLOSE', 'REGISTRA', 'HANDOFF', 'BOOT',
];

const REQUIRED_GLOBAL_INHERITANCE = [
  'CENTRALDARK_MASTER_CYCLE',
  'DESTINATION_LOCK',
  'ACORDAR',
  'CALIBRAR',
  'MULTIBUSSOLA',
  'META_LUPA_PROPORTIONAL',
  'RECONCILIAR',
  'DELTA_UTIL',
  'CONTRAPROVA',
  'REMEDICAO',
  'FIXED_POINT',
  'REGISTRA',
  'BOOT',
  'ONE_WRITER_PER_SCOPE',
  'OUTPUT_GUARD',
  'REALITY_JUDGE',
  'RECEIPT_AND_CONTINUATION',
  'SELF_HEALING_FAILURE_LOOP',
];

function read(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`MISSING_FILE:${rel}`);
  return fs.readFileSync(abs, 'utf8');
}

function readBuffer(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`MISSING_FILE:${rel}`);
  return fs.readFileSync(abs);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function requireTokens(text, tokens, scope) {
  const missing = tokens.filter((token) => !text.includes(token));
  if (missing.length) throw new Error(`${scope}_MISSING:${missing.join(',')}`);
}

function parseEngineNames(engineText) {
  const normalized = engineText.replace(/\r\n/g, '\n');
  const start = normalized.indexOf('\nengines:\n');
  const end = normalized.indexOf('\nmandatory_inheritance:\n');
  if (start < 0 || end < 0 || end <= start) throw new Error('ENGINE_REGISTRY_SECTION_MISSING');
  const section = normalized.slice(start, end);
  const names = [];
  for (const line of section.split('\n')) {
    const m = line.match(/^  ([a-zA-Z0-9_]+):\s*$/);
    if (m) names.push(m[1]);
  }
  if (!names.length) throw new Error('ENGINE_REGISTRY_EMPTY');
  return names;
}

function runMandatoryGateSelfTest() {
  const gateAbs = path.join(ROOT, FILES.mandatoryGate);
  const cp = spawnSync(process.execPath, [gateAbs, '--self-test'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (cp.status !== 0) {
    throw new Error(`MANDATORY_GATE_SELF_TEST_FAILED:${cp.status}:${sha256(Buffer.from(cp.stderr || '', 'utf8'))}`);
  }
  let payload;
  try {
    payload = JSON.parse(cp.stdout);
  } catch {
    throw new Error('MANDATORY_GATE_SELF_TEST_INVALID_JSON');
  }
  if (payload?.status !== 'PASS' || payload?.no_lateral_route !== true || payload?.consolidated_lock !== true) {
    throw new Error('MANDATORY_GATE_SELF_TEST_NOT_PASS');
  }
  return payload;
}

export function validateUniversalMethod() {
  const soul = read(FILES.soul);
  const universal = read(FILES.universal);
  const aureola = read(FILES.aureola);
  const master = read(FILES.master);
  const engine = read(FILES.engine);
  const hermesPrompt = read(FILES.hermesPrompt);
  const mandatorySkill = read(FILES.mandatorySkill);
  const mandatoryGate = read(FILES.mandatoryGate);
  const tlc23Hash = sha256(readBuffer(FILES.tlc23));

  if (tlc23Hash !== TLC23_CANONICAL_SHA256) {
    throw new Error(`TLC23_SOURCE_HASH_MISMATCH:${tlc23Hash}`);
  }

  requireTokens(universal, [
    'applies_to: ALL_CURRENT_AND_FUTURE_ENGINES',
    'governing_soul: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
    'global_mandatory: true',
    'no_lateral_route: true',
    'uni_directional_requires_gate: true',
    'bi_directional_requires_gate: true',
    'return_path_requires_gate: true',
    'entry_requires_gate: true',
    'exit_requires_gate: true',
    'gate_failure_must_diagnose_same_route: true',
    'default_after_fixed_point: LOCKED',
    'SAME_OBJECT_PROVEN_IMPROVEMENT',
    'SAME_OWNER_DOMAIN_EXPANSION',
    'mandatory_skill_self_test_required: true',
    'mode: PRIVATE_PREPROD',
    'per_step_reask_within_authorized_scope: false',
    'action_first_when_gate_passes: true',
    'plan_only_when_authorized_action_is_available: FORBIDDEN',
    'security_hardening_by_ceremony: FORBIDDEN',
    'secret_republication: FORBIDDEN',
    'same_method_required_for_new_engine: true',
    'engine_specific_capability_may_bypass_contract: false',
    'skin_is_presentation_adapter: true',
    'skin_must_not_change:',
    'private_chain_of_thought_must_not_be_exposed: true',
    'hermes_self_test_required: true',
    'same_head_ci_required: true',
    'owner: scripts/agent-call.mjs',
    'hot_window_ms: 60000',
    'warm_window_ms: 120000',
    'hot_or_warm_other_actor: WAIT_NEXT_ROUND',
    'unknown_temperature: PRESERVE_EXISTING_STATIC_WRITER_GUARD',
    'human_touch_counts_as_touch: true',
    'meta_lupa_required: true',
    'breaths_total: 17',
    'delta_minimum_required: true',
    'model_identity_must_not_block_scope: true',
    'next_cursor_required_when_not_fixed_point: true',
  ], 'UNIVERSAL_CONTRACT');

  requireTokens(soul, [
    'UNIVERSAL_METHOD_CONTRACT_REQUIRED=true',
    'NO_LATERAL_ROUTE=true',
    'PIVETE_VOCATIVE_ROUTES_TO_HERMES=true',
    'VOCATIVE_ROUTING_DOES_NOT_EXPAND_AUTHORITY=true',
    'CHEFE_MAY_ROUTE_BY_VOCATIVE=true',
    'CHEFE_NOT_REQUIRED_AS_ROUTER=true',
    'PERMITO_SEGREDO_MISSION_SCOPE=true',
    'PER_STEP_REASK_WITHIN_SAME_MISSION=false',
    'ACTION_FIRST_WHEN_GATE_PASS=true',
    'SOL_GUARD_ROLE=COORDINATE_COUNTERPROVE_NOT_STALL',
    'DELTA_UTIL_REQUIRES_DEDUPE_CLASSIFY_PROOF=true',
    'RAW_CHEFE_MATERIAL_IS_NOT_AUTOMATIC_COMMIT=true',
  ], 'SOUL_SOL');

  requireTokens(mandatorySkill, [
    'AUTHORITY_CLASS=MANDATORY_CONTRACT_ADAPTER',
    'NO_LATERAL_ROUTE=true',
    'UNI_DIRECTIONAL_REQUIRES_GATE=true',
    'BI_DIRECTIONAL_REQUIRES_GATE=true',
    'ENTRY_REQUIRES_GATE=true',
    'EXIT_REQUIRES_GATE=true',
    'CONSOLIDATED_STATE=LOCKED',
    'SAME_OBJECT_PROVEN_IMPROVEMENT',
    'SAME_OWNER_DOMAIN_EXPANSION',
    'POMBO_MODE=CHECKSUM_ON',
    'POMBO64_PLUS_IS_PROOF=false',
    'OPERATING_MODE=PRIVATE_PREPROD',
    'PERMITO_SEGREDO_MISSION_SCOPE=ACTIVE_WHEN_EXPLICITLY_GRANTED',
    'PER_STEP_REASK=OFF_WITHIN_SAME_MISSION_TARGET',
    'ACTION_FIRST_WHEN_GATE_PASS=true',
    'SECURITY_HARDENING_BY_CEREMONY=FORBIDDEN',
    'REAL_BLOCK_REQUIRES_MEASURED_CAUSE=true',
    'UNKNOWN   = nao e PASS',
  ], 'MANDATORY_SKILL');

  requireTokens(mandatoryGate, [
    "const ALLOWED_DIRECTIONS = new Set(['UNI', 'BI', 'RETURN'])",
    'CONSOLIDATED_LOCK_NO_VALID_REOPEN_REASON',
    'REOPEN_REQUIRES_NEW_MATERIAL_EVIDENCE_HASH',
    'LATERAL_OR_UNKNOWN_ROUTE_FORBIDDEN',
    'EXIT_REQUIRES_RESULT_HASH_OR_RESULT_FILE',
    "mode: 'CHECKSUM_ON'",
    "is_proof: false",
    "process.exitCode = verdict === 'PASS' ? 0 : 2",
    "private_preprod_action_mode: true",
    "permito_segredo_is_mission_scoped_not_per_step: true",
  ], 'MANDATORY_GATE_RUNTIME');

  let previous = -1;
  for (const token of REQUIRED_CHAIN) {
    const needle = `  - ${token}`;
    const pos = universal.indexOf(needle);
    if (pos < 0) throw new Error(`CHAIN_TOKEN_MISSING:${token}`);
    if (pos <= previous) throw new Error(`CHAIN_ORDER_INVALID:${token}`);
    previous = pos;
  }

  requireTokens(aureola, [
    'AUREOLA_IS_OPERATIONAL_TRACE_NOT_PRIVATE_CHAIN_OF_THOUGHT: true',
    'BIBLE_REFERENCE_IS_SEMANTIC_CUE_NOT_PROOF: true',
    'VERSE_DOES_NOT_REPLACE_EVIDENCE: true',
  ], 'AUREOLA');

  requireTokens(master, [
    'master_trigger: "!CENTRALDARK"',
    'master_session_remains_active: true',
    'subsequent_chefe_material_is_delta_candidate: true',
    'model_is_replaceable: true',
    'one_writer_per_scope: true',
    'reality_is_judge: true',
    'runtime_claim_requires_runtime_evidence: true',
    'mission_fixed_point_stops_learning_capacity: false',
    'NEXT_ACORDAR',
    'NEXT_CURSOR',
  ], 'MASTER_CYCLE');

  requireTokens(engine, REQUIRED_GLOBAL_INHERITANCE, 'ENGINE_GLOBAL_INHERITANCE');
  requireTokens(engine, [
    'engine_is_owner: false',
    'binding_mode: LOAD_REFERENCE',
    'copy_brain: false',
    'master_cycle_binding:',
    'explicit_trigger: "!CENTRALDARK"',
    'second_semantic_owner: FORBIDDEN',
    'same_failure_no_new_information: REUSE_CRYSTAL_NOT_RETHINK',
    'human_return_before_fixed_point: FORBIDDEN_UNLESS_HUMAN_FRONTIER',
    'CONTINUE_NEXT_CURSOR',
  ], 'ENGINE_BINDING');

  requireTokens(hermesPrompt, [
    'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
    'ENGINE_IS_NOT_OWNER=true',
    'ONE_SYSTEM_ONLY=true',
    'ONE_WRITER_PER_SCOPE=true',
    'REALITY_IS_JUDGE=true',
    'UNKNOWN_SKIPPED_PENDING_ARE_NOT_PASS=true',
  ], 'HERMES_PROMPT');

  const mandatoryGateSelfTest = runMandatoryGateSelfTest();
  const engines = parseEngineNames(engine);
  return {
    schema: 'centraldark.universal-engine-method.self-test.v1',
    ok: true,
    engines,
    engine_count: engines.length,
    universal_chain: REQUIRED_CHAIN,
    method_owner: FILES.master,
    governing_soul: FILES.soul,
    hermes_runtime_validator: FILES.universal,
    mandatory_skill: FILES.mandatorySkill,
    mandatory_gate: FILES.mandatoryGate,
    mandatory_gate_self_test: mandatoryGateSelfTest,
    no_lateral_route: true,
    uni_and_bi_directional_gate_required: true,
    consolidated_state_locked_by_default: true,
    reopen_same_object_improvement_only: true,
    reopen_same_owner_domain_expansion_only: true,
    pombo_mode: 'CHECKSUM_ON',
    pombo64_plus_is_transport_only: true,
    private_preprod_action_mode: true,
    permito_segredo_is_mission_scoped_not_per_step: true,
    tlc23_source: FILES.tlc23,
    tlc23_source_sha256: tlc23Hash,
    tlc23_source_gate: 'PASS',
    persistent_operational_regime_contract: true,
    fixed_point_is_checkpoint: true,
    fixed_point_is_end: false,
    next_cycle_required_while_runtime_exists: true,
    self_correction_is_runtime_internal: true,
    measured_100_percent_or_exact_blocker: true,
    runtime_activation_proven_by_self_test: false,
    skin_changes_governance: false,
    private_reasoning_exposed: false,
    reality_is_judge: true,
    scope_temperature_owner: 'scripts/agent-call.mjs',
    scope_temperature_hot_ms: 60000,
    scope_temperature_warm_ms: 120000,
    breaths_total: 17,
    delta_minimum_required: true,
  };
}

function main() {
  const selfTest = process.argv.includes('--self-test');
  if (!selfTest) {
    console.log(JSON.stringify({
      schema: 'centraldark.universal-engine-method.cli.v1',
      usage: 'node apps/modulos/HERMES-CORE/core/universal-method-contract.mjs --self-test',
    }, null, 2));
    return;
  }
  try {
    const result = validateUniversalMethod();
    console.log(JSON.stringify(result, null, 2));
    console.log('UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS');
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    console.error('UNIVERSAL_ENGINE_METHOD_SELF_TEST=FAIL');
    process.exitCode = 1;
  }
}

main();