#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const FILES = {
  universal: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
  aureola: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml',
  master: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',
  engine: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
  autoconfigRuntime: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/HERMES-AUTOCONFIG-RUNTIME.yml',
  hermesPrompt: 'apps/modulos/HERMES-CORE/prompts/hermes-core.md',
  tlc23: 'docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf',
};

const TLC23_CANONICAL_SHA256 = 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1';

const REQUIRED_CHAIN = [
  'CENTRALDARK', 'TLC23_OPEN', 'DESTINATION_LOCK', 'ACORDAR', 'CALIBRAR',
  'MULTIBUSSOLA', 'PEGATUDO', 'DEBITO_COGNITIVO', 'READERS_MEASURE',
  'META_LUPA', 'SCOPE_TEMPERATURE', 'DELTA_MINIMUM',
  'RENDEZVOUS', 'RECONCILE', 'OWNER', 'ONE_WRITER', 'PATCH', 'TESTE',
  'CONTRAPROVA', 'REALITY_JUDGE', 'FIXED_POINT', 'TLC23_CLOSE', 'REGISTRA',
  'HANDOFF', 'BOOT',
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

export function validateUniversalMethod() {
  const universal = read(FILES.universal);
  const aureola = read(FILES.aureola);
  const master = read(FILES.master);
  const engine = read(FILES.engine);
  const autoconfigRuntime = read(FILES.autoconfigRuntime);
  const hermesPrompt = read(FILES.hermesPrompt);
  const tlc23Hash = sha256(readBuffer(FILES.tlc23));

  if (tlc23Hash !== TLC23_CANONICAL_SHA256) {
    throw new Error(`TLC23_SOURCE_HASH_MISMATCH:${tlc23Hash}`);
  }

  requireTokens(universal, [
    'applies_to: ALL_CURRENT_AND_FUTURE_ENGINES',
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

  requireTokens(autoconfigRuntime, [
    'status: CANONICAL_RUNTIME_CONTRACT',
    'progressive_autonomy:',
    'SONHAR:',
    'EXPERIMENTAR:',
    'CRISTALIZAR:',
    'FREEDOM_TO_EXPLORE_IS_NOT_FREEDOM_TO_INVENT_STATE: true',
    'local_block_does_not_freeze_independent_work: true',
    'return_to_chefe_after_every_arrow: false',
    'REALITY_IS_JUDGE: true',
    'AUTONOMY_IS_MOTOR: true',
  ], 'AUTOCONFIG_RUNTIME');

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

  const engines = parseEngineNames(engine);
  return {
    schema: 'centraldark.universal-engine-method.self-test.v1',
    ok: true,
    engines,
    engine_count: engines.length,
    universal_chain: REQUIRED_CHAIN,
    method_owner: FILES.master,
    hermes_runtime_validator: FILES.universal,
    autoconfig_runtime: FILES.autoconfigRuntime,
    progressive_autonomy_modes: ['SONHAR','EXPERIMENTAR','CRISTALIZAR'],
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