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
  operationalMethod: '.agents/skills/centraldark-operational-method/SKILL.md',
  contract: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',
  triggers: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',
  bandScore: 'docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json',
  aureola: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml',
  master: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',
  engine: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
  autoconfigRuntime: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/HERMES-AUTOCONFIG-RUNTIME.yml',
  hermesPrompt: 'apps/modulos/HERMES-CORE/prompts/hermes-core.md',
  dailyChecklistPolicy: 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
  adminChecklist: 'docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md',
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
  const operationalMethod = read(FILES.operationalMethod);
  const contract = read(FILES.contract);
  const triggers = read(FILES.triggers);
  const bandScore = read(FILES.bandScore);
  const aureola = read(FILES.aureola);
  const master = read(FILES.master);
  const engine = read(FILES.engine);
  const autoconfigRuntime = read(FILES.autoconfigRuntime);
  const hermesPrompt = read(FILES.hermesPrompt);
  const adminChecklist = read(FILES.adminChecklist);
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
    'semantic_identity_is_owner_capability_scope: true',
    'transient_execution_ids_are_provenance_only: true',
    'same_scope_evolves_existing_owner_job: true',
    'new_equivalent_job_without_material_split: false',
    'human_return_requires_human_frontier_or_exact_hard_blocker: true',
    'model_identity_must_not_block_scope: true',
    'next_cursor_required_when_not_fixed_point: true',
    'same_body_evolution:',
    'semantic_identity: [OWNER, CAPABILITY, SCOPE]',
    'hardcode_transient_execution_id_in_contract: FORBIDDEN',
    'same_scope_existing_job: PATCH_AND_EVOLVE',
    'same_scope_existing_workflow: PATCH_AND_EVOLVE',
    'create_v2_v3_v4_for_same_capability: FORBIDDEN',
    'new_job_workflow_or_runtime_requires_material_split: true',
    'machine_resolvable_blocker_auto_continue: true',
    'same_scope_microapproval_required: false',
    'EXACT_HARD_BLOCKER_AFTER_AUTHORIZED_ROUTES_EXHAUSTED',
    'mass_job_creation_without_independent_boundaries: FORBIDDEN',
    'complexity_without_capability_gain: REGRESSION',
    'aureola_learning_contract:',
    'applies_to: [SOL, HERMES, PIVETE, CURRENT_EXECUTOR, ALL_CURRENT_AND_FUTURE_ENGINES]',
    'SOL_AND_HERMES_SHARE_SAME_LEARNING_CONTRACT: true',
    'bounded_100_percent:',
    'requires_explicit_denominator: true',
    'calculation_only_global_runtime_claim: false',
  ], 'UNIVERSAL_CONTRACT');

  requireTokens(operationalMethod, [
    '## AURÉOLA DISCOVERY HARVEST — SOL + HERMES',
    'AUREOLA_MATERIAL_DISCOVERY',
    'SOL_AND_HERMES_SHARE_SAME_LEARNING_CONTRACT = true',
    'CONTRACT_COVERAGE = PASSED_DEFINED_CHECKS / ALL_DEFINED_CHECKS',
    'CALCULATION != RUNTIME_OBSERVATION',
  ], 'OPERATIONAL_METHOD_LEARNING');

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
    'AUREOLA_MATERIAL_DISCOVERY_EMITS_LEARNING_CANDIDATE: true',
    'MATERIAL_DISCOVERY_REQUIRES_LEARNING_REF: true',
    'learning_binding:',
    'event: AUREOLA_MATERIAL_DISCOVERY',
    'proof_then_crystallize: true',
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
    'aureola_learning_loop:',
    'EVERY_MATERIAL_DISCOVERY_GETS_LEARNING_REF: true',
    'EVERY_DISCOVERY_IS_CANONICAL_FACT: false',
    'SAME_FINDING_WITHOUT_NEW_EVIDENCE: DROP_DUPLICATE',
    'PROVEN_RULE_BINDS_TO_RUNTIME: true',
    'contract_coverage_may_equal_100_percent_when_all_defined_conditions_verified: true',
    'external_reality_100_percent_from_calculation_only: false',
    'SEARCH_EXISTING_CRYSTAL_BEFORE_NEW: true',
    'SEARCH_EXISTING_OWNER_BEFORE_NEW: true',
    'VERIFY_EXISTING_CAPABILITY_BEFORE_NEW: true',
    'SEMANTIC_DEDUPE_BEFORE_CRYSTAL: true',
    'UNVERIFIED_ABSENCE_IS_UNKNOWN: true',
    'PARALLEL_ARCHITECTURE_WITHOUT_PROVEN_GAP: FORBIDDEN',
    'TLC23_HORN_BEFORE_LOGICAL_MUTATION: true',
    'axes: [CASA, GITHUB, VPS]',
    'same_source_commit_required: true',
    'casa_exact_head_validation_required: true',
    'github_same_head_gates_required: true',
    'vps_exact_commit_deploy_required: true',
    'counterproof_each_axis_required: true',
    'partial_axis_pass_is_global_pass: false',
    'micro_deploy_requires_explicit_chefe_authorization: true',
    'daily_checklist_gate:',
    'DAILY_CHECKLIST_GATE_REQUIRED: true',
    'DAILY_CHECKLIST_OWNER: docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
    'DAILY_CHECKLIST_CONSUMER: docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md',
    'DAILY_CHECKLIST_RECORD_TARGET: ACTIVE_SCOPE_LEDGER',
    'AGENT_OR_AI_MUTATES_CODE_DURING_DAY: true',
    'LOAD_DAILY_CHECKLIST: true',
    'VERIFY_PARENT_GOAL: true',
    'VERIFY_WRITER_LEASE: true',
    'UPDATE_DAILY_CHECKLIST: true',
    'MODEL_NAME_IS_ROUTING_KEY: false',
    'MODEL_NAME_IS_AUTHORITY: false',
    'MODEL_NAME_IS_WRITER_LEASE: false',
    'SAME_MUTABLE_SCOPE_REQUIRES_ONE_WRITER_LEASE: true',
    'FINAL_PROMOTION_SCOPE: ONE_ACTIVE_FINALIZER_LEASE',
    'GOAL_PAI_ID: STABLE',
    'MICRO_GOAL: DERIVED_FROM_CURRENT_WOUND',
  ], 'AUTOCONFIG_RUNTIME');

  requireTokens(contract, [
    'aureola_material_discovery_is_learning_candidate: true',
    'every_material_discovery_gets_learning_ref: true',
    'material_discovery_auto_promotes_to_canonical: false',
    'operational_rule_learning:',
    'AUREOLA_MATERIAL_DISCOVERY',
    'measurement_confidence:',
    'calculation_is_not_runtime_observation: true',
    'allowed_when: ALL_DEFINED_SCOPE_CONDITIONS_ARE_DETERMINISTICALLY_VERIFIED',
  ], 'TRIGGER_CONTRACT_LEARNING');

  requireTokens(triggers, [
    'event: AUREOLA_MATERIAL_DISCOVERY',
    'every_material_discovery_is_learning_candidate: true',
    'every_material_discovery_is_canonical_fact: false',
    'same_finding_without_new_evidence: DROP_DUPLICATE',
    'direct_canonical_mutation: false',
  ], 'TRIGGER_MAP_LEARNING');

  requireTokens(bandScore, [
    '"learning_candidate_event": "AUREOLA_MATERIAL_DISCOVERY"',
    '"learning_ref_required_for_material_discovery": true',
    '"discovery_auto_promotes_to_crystal": false',
    '"material_discovery_routes_to_existing_learning_pipeline": true',
  ], 'BAND_LEARNING_BINDING');

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
    'AUREOLA_MATERIAL_DISCOVERY=LEARNING_CANDIDATE',
    'EVERY_MATERIAL_DISCOVERY_GETS_LEARNING_REF=true',
    'DISCOVERY_AUTO_PROMOTES_TO_CANONICAL=false',
    'REUSE_PROVEN_CRYSTAL_BEFORE_REINVESTIGATE=true',
    'CALCULATION_SUPPORTS_DECISION_BUT_DOES_NOT_REPLACE_RUNTIME_OBSERVATION=true',
    'CRYSTAL_NEW_REQUIRES_SEARCH_EXISTING=true',
    'CRYSTAL_NEW_REQUIRES_EXISTING_OWNER_CHECK=true',
    'CRYSTAL_NEW_REQUIRES_CAPABILITY_DEDUPE=true',
    'UNVERIFIED_ABSENCE_IS_UNKNOWN=true',
    'PARALLEL_ARCHITECTURE_WITHOUT_PROVEN_GAP=FORBIDDEN',
    'CRYSTAL_TRUTH_GATE=PDF_GATE_TLC23_HORN',
    'RUNTIME_PROMOTION_AXES=CASA+GITHUB+VPS',
    'THREE_AXIS_SAME_SOURCE_REQUIRED=true',
    'PARTIAL_AXIS_PASS_IS_GLOBAL_PASS=false',
    'MICRO_DEPLOY_REQUIRES_EXPLICIT_CHEFE_AUTH=true',
    'DAILY_CHECKLIST_GATE_REQUIRED=true',
    'DAILY_CHECKLIST_OWNER=docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
    'DAILY_CHECKLIST_CONSUMER=docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md',
    'LOAD_DAILY_CHECKLIST_BEFORE_FIRST_CODE_MUTATION_OF_DAY=true',
    'UPDATE_DAILY_CHECKLIST_BEFORE_HANDOFF_OR_FINALIZATION=true',
    'MODEL_NAME_IS_ROUTING_KEY=false',
    'MODEL_NAME_IS_AUTHORITY=false',
    'MODEL_NAME_IS_WRITER_LEASE=false',
    'EXECUTOR_SELECTION=TAG_EXECUTOR+CAPABILITY_MATCH+SCOPE_MATCH+LEASE_AVAILABLE+POLICY_ALLOWED',
    'SAME_MUTABLE_SCOPE_REQUIRES_ONE_WRITER_LEASE=true',
    'FINAL_PROMOTION_SCOPE=ONE_ACTIVE_FINALIZER_LEASE',
    'FINALIZATION_LANE=PR->SAME_HEAD_GATES->MAIN->POST_MERGE->DEPLOY->REMEASURE->FINAL_RECEIPT',
    'GOAL_PAI_ID=STABLE',
    'MICRO_GOAL=DERIVED_FROM_CURRENT_WOUND',
    'AUTHORIZED_IS_NOT_VALIDATED=true',
  ], 'HERMES_PROMPT');

  requireTokens(adminChecklist, [
    'DAILY_CHECKLIST_GATE_REQUIRED=true',
    'DAILY_CHECKLIST_OWNER=docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
    'DAILY_CHECKLIST_CONSUMER=docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md',
    'DAILY_CHECKLIST_RECORD_TARGET=ACTIVE_SCOPE_LEDGER',
    'AGENT_OR_AI_MUTATES_CODE_DURING_DAY=true',
    'LOAD_DAILY_CHECKLIST=true',
    'VERIFY_CURRENT_STATE=true',
    'VERIFY_PARENT_GOAL=true',
    'VERIFY_OWNER=true',
    'VERIFY_SCOPE=true',
    'VERIFY_WRITER_LEASE=true',
    'RECORD_MATERIAL_DELTA=true',
    'RECORD_PENDING_GAPS=true',
    'RECORD_HEAD_CHANGES=true',
    'RECORD_HANDOFFS=true',
    'RECORD_GATE_FAILURES=true',
    'UPDATE_DAILY_CHECKLIST=true',
    'MODEL_NAME_IS_ROUTING_KEY=false',
    'MODEL_NAME_IS_AUTHORITY=false',
    'MODEL_NAME_IS_WRITER_LEASE=false',
    'EXECUTOR_SELECTION=TAG_EXECUTOR+CAPABILITY_MATCH+SCOPE_MATCH+LEASE_AVAILABLE+POLICY_ALLOWED',
    'MULTIPLE_WRITERS_ALLOWED=true',
    'CONCURRENT_WRITERS_DISJOINT_SCOPES=true',
    'SAME_MUTABLE_SCOPE_REQUIRES_ONE_WRITER_LEASE=true',
    'FINAL_PROMOTION_SCOPE=ONE_ACTIVE_FINALIZER_LEASE',
    'FINALIZATION_LANE=PR->SAME_HEAD_GATES->MAIN->POST_MERGE->DEPLOY->REMEASURE->FINAL_RECEIPT',
    'CHEFE=INTENT_AUTHORITY',
    'CONTRACT=POLICY',
    'GATES=PROOF',
    'VPS=EXECUTOR_RUNTIME_AND_CONTROL_PLANE',
    'REALITY=JUDGE',
    'GOAL_PAI_ID=STABLE',
    'MICRO_GOAL=DERIVED_FROM_CURRENT_WOUND',
    'UNKNOWN != PASS',
    'ACTION != PROOF',
    'AUTHORIZED != VALIDATED',
    'MERGED != DEPLOYED',
  ], 'DAILY_CHECKLIST_ADMIN_OWNER');

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
    same_body_evolution: true,
    transient_execution_ids_are_provenance_only: true,
    aureola_learning_event: 'AUREOLA_MATERIAL_DISCOVERY',
    material_discovery_learning_ref_required: true,
    discovery_auto_promotes_to_crystal: false,
    calculation_replaces_runtime_observation: false,
    operational_method_learning: true,
    sol_and_hermes_share_learning_contract: true,
    bounded_100_percent_requires_explicit_denominator: true,
    crystallization_truth_gate: true,
    three_axis_atomic_promotion: true,
    three_axis_promotion_axes: ['CASA', 'GITHUB', 'VPS'],
    parallel_architecture_without_proven_gap: false,
    daily_checklist_gate_required: true,
    daily_checklist_owner: FILES.dailyChecklistPolicy,
    daily_checklist_consumer: FILES.adminChecklist,
    daily_checklist_record_target: 'ACTIVE_SCOPE_LEDGER',
    finalizer_lease_required: true,
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