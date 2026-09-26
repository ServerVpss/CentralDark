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
  cotReactLoop: '.agents/skills/cot-react-loop/SKILL.md',
  contract: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',
  reconciliationContract: 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
  triggers: 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',
  bandScore: 'docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json',
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
  const operationalMethod = read(FILES.operationalMethod);
  const cotReactLoop = read(FILES.cotReactLoop);
  const contract = read(FILES.contract);
  const reconciliationContract = JSON.parse(read(FILES.reconciliationContract));
  const triggers = read(FILES.triggers);
  const bandScore = read(FILES.bandScore);
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

  requireTokens(cotReactLoop, [
    '### 4.8 Standing Goal + `/goal` — continuidade material, não preâmbulo',
    'STANDING_GOAL=ACTIVE',
    'GOAL_PARENT=STABLE',
    'PHASE_CONTRACT=REHYDRATE_NOT_REINVENT',
    'PREAMBLE_IS_PROGRESS=false',
    'ITERATION_COUNTER_IS_PROGRESS=false',
    'MISSING_REQUIRED_EVIDENCE_FORCE_CONTINUE=true',
    'CONTINUE_TOWARD_STANDING_GOAL',
    '/goal RETURNS:',
    'GOAL_STATUS=CONTINUE',
    'REASON=NO_MATERIAL_DELIVERABLE_EVIDENCE',
    'EXECUTE_WITH_JUDGMENT',
    'STANDING_GOAL_SURVIVES_TOOL_FAILURE=true',
    'CHILD_FAILURE_DOES_NOT_REPLACE_PARENT_GOAL=true',
  ], 'COT_REACT_STANDING_GOAL');

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
    'COT_REACT_LOOP:',
    'private_chain_of_thought_exposed: false',
    'operational_hud_protocol:',
    'HUD_FIRST_BEFORE_MATERIAL_EXECUTION: true',
    'GOAL_STAYS_VISIBLE_DURING_EXECUTION: true',
    'no_useless_narration: true',
    'EVENT_SNAPSHOT_IS_NOT_CURRENT: true',
    'LIVE_LABEL_REMEASUREMENT_REQUIRED_FOR_CURRENT_CLAIM: true',
    'current_pr_labels_require_live_api_read: true',
    'standing_goal_protocol:',
    'surface: /goal',
    'surface_role: READ_ONLY_INTROSPECTION',
    'parent_goal: STABLE_UNTIL_MATERIAL_TERMINAL_STATE',
    'phase_contract: REHYDRATE_NOT_REINVENT',
    'progress_denominator: MATERIAL_DELIVERABLES_NOT_ITERATION_COUNT',
    'PREAMBLE_IS_PROGRESS: false',
    'MISSING_REQUIRED_EVIDENCE_FORCE_CONTINUE: true',
    'STANDING_GOAL_SURVIVES_TURN: true',
    'GOAL_SURFACE_DOES_NOT_EXPAND_AUTHORIZATION: true',
    'continuity_hud:',
    'HUD_IS_NOT_PROOF: true',
    'UNKNOWN_STAYS_UNKNOWN: true',
    'operational_narration:',
    'NARRATION_IS_NOT_EXECUTION: true',
    'VERSE_IS_NOT_GATE: true',
    'preventive_continuity_staff:',
    'display_name: "CAJADO_DA_CORRECAO"',
    'DOES_NOT_RESTART_MISSION: true',
    'ASKED_USER_IS_NOT_BLOCKED: true',
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

  const daily = reconciliationContract.daily_checklist_gate ?? {};
  if (daily.marker !== 'DAILY_CHECKLIST_GATE_REQUIRED') throw new Error('DAILY_CHECKLIST_GATE_MISSING');
  if (daily.applies_when?.agent_or_ai_mutates_code_during_day !== true) throw new Error('DAILY_CHECKLIST_SCOPE_INVALID');
  for (const key of ['load_daily_checklist','verify_current_state','verify_parent_goal','verify_owner','verify_scope','verify_writer_lease']) {
    if (daily.before_first_code_mutation_of_day?.[key] !== true) throw new Error(`DAILY_CHECKLIST_BEFORE_MUTATION_MISSING:${key}`);
  }
  for (const key of ['record_material_delta','record_pending_gaps','record_head_changes','record_handoffs','record_gate_failures']) {
    if (daily.during_day?.[key] !== true) throw new Error(`DAILY_CHECKLIST_DURING_DAY_MISSING:${key}`);
  }
  if (daily.before_handoff_or_finalization?.update_daily_checklist !== true) throw new Error('DAILY_CHECKLIST_FINAL_UPDATE_MISSING');

  const executorSelection = reconciliationContract.executor_selection_policy ?? {};
  if (executorSelection.model_name_is_routing_key !== false) throw new Error('MODEL_NAME_BECAME_ROUTING_KEY');
  if (executorSelection.model_name_is_authority !== false) throw new Error('MODEL_NAME_BECAME_AUTHORITY');
  if (executorSelection.model_name_is_writer_lease !== false) throw new Error('MODEL_NAME_BECAME_WRITER_LEASE');
  const expectedExecutorSelection = ['TAG_EXECUTOR','CAPABILITY_MATCH','SCOPE_MATCH','LEASE_AVAILABLE','POLICY_ALLOWED'];
  if (expectedExecutorSelection.some((value, index) => executorSelection.selection?.[index] !== value)) throw new Error('EXECUTOR_SELECTION_INVALID');

  const writerPolicy = reconciliationContract.writer_concurrency_policy ?? {};
  if (writerPolicy.multiple_writers_allowed !== true) throw new Error('MULTIPLE_WRITERS_DISALLOWED');
  if (writerPolicy.concurrent_writers_disjoint_scopes !== true) throw new Error('DISJOINT_SCOPE_WRITERS_DISABLED');
  if (writerPolicy.same_mutable_scope_requires_one_writer_lease !== true) throw new Error('SAME_SCOPE_WRITER_LEASE_NOT_REQUIRED');
  if (writerPolicy.same_scope_parallel_mutation !== 'BLOCKED') throw new Error('SAME_SCOPE_PARALLEL_MUTATION_NOT_BLOCKED');

  const finalization = reconciliationContract.finalization_policy ?? {};
  const expectedFinalizationLane = ['PR','SAME_HEAD_GATES','MAIN','POST_MERGE','DEPLOY','REMEASURE','FINAL_RECEIPT'];
  if (finalization.final_promotion_scope !== 'ONE_ACTIVE_FINALIZER_LEASE') throw new Error('FINALIZER_LEASE_NOT_UNIQUE');
  if (expectedFinalizationLane.some((value, index) => finalization.lane?.[index] !== value)) throw new Error('FINALIZATION_LANE_INVALID');
  if (finalization.same_head_required !== true) throw new Error('FINALIZATION_SAME_HEAD_NOT_REQUIRED');

  const goals = reconciliationContract.goal_derivation_policy ?? {};
  if (goals.goal_pai_id !== 'STABLE') throw new Error('PARENT_GOAL_NOT_STABLE');
  if (goals.micro_goal !== 'DERIVED_FROM_CURRENT_WOUND') throw new Error('MICRO_GOAL_NOT_DERIVED_FROM_CURRENT_WOUND');

  const roleMap = reconciliationContract.authority_role_map ?? {};
  const expectedRoleMap = {
    CHEFE: 'INTENT_AUTHORITY',
    CONTRACT: 'POLICY',
    GATES: 'PROOF',
    VPS: 'EXECUTOR_RUNTIME_AND_CONTROL_PLANE',
    REALITY: 'JUDGE',
  };
  for (const [key, value] of Object.entries(expectedRoleMap)) {
    if (roleMap[key] !== value) throw new Error(`AUTHORITY_ROLE_INVALID:${key}`);
  }

  const nonEq = reconciliationContract.non_equivalence_guards ?? {};
  if (nonEq.UNKNOWN_IS_PASS !== false) throw new Error('UNKNOWN_BECAME_PASS');
  if (nonEq.ACTION_IS_PROOF !== false) throw new Error('ACTION_BECAME_PROOF');
  if (nonEq.AUTHORIZED_IS_VALIDATED !== false) throw new Error('AUTHORIZED_BECAME_VALIDATED');
  if (nonEq.MERGED_IS_DEPLOYED !== false) throw new Error('MERGED_BECAME_DEPLOYED');

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
    same_body_evolution: true,
    transient_execution_ids_are_provenance_only: true,
    aureola_learning_event: 'AUREOLA_MATERIAL_DISCOVERY',
    material_discovery_learning_ref_required: true,
    discovery_auto_promotes_to_crystal: false,
    calculation_replaces_runtime_observation: false,
    operational_method_learning: true,
    sol_and_hermes_share_learning_contract: true,
    operational_hud_first_protocol: true,
    event_snapshot_current_separation: true,
    live_label_remeasurement_contract: true,
    no_useless_narration_contract: true,
    cot_react_loop_bound: true,
    cot_react_standing_goal_contract: true,
    standing_goal_runtime_contract: true,
    goal_surface_is_read_only_introspection: true,
    iteration_counter_is_not_completion: true,
    continuity_hud_contract: true,
    operational_narration_contract: true,
    preventive_continuity_staff_contract: true,
    daily_checklist_gate_required: true,
    executor_selection_is_model_agnostic: true,
    disjoint_scope_writers_allowed: true,
    same_scope_writer_lease_required: true,
    one_active_finalizer_lease_required: true,
    stable_parent_goal_with_derived_micro_goals: true,
    bounded_100_percent_requires_explicit_denominator: true,
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