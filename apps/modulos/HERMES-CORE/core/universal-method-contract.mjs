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
  teachingGrammar: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml',
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
  handoff: 'docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',
  harvester: '.agents/skills/session-intelligence-harvester/SKILL.md',
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

function forbidTokens(text, tokens, scope) {
  const present = tokens.filter((token) => text.includes(token));
  if (present.length) throw new Error(`${scope}_LEGACY_CONTRADICTION:${present.join(',')}`);
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
  const teachingGrammar = read(FILES.teachingGrammar);
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
  const handoff = read(FILES.handoff);
  const harvester = read(FILES.harvester);
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
    'LIVE_COLLAB_MODE=true',
    'LIVE_COLLAB_TRIGGERS=!CENTRALDARK|#ACORDAR',
    'UNDERSTAND_BEFORE_NORMALIZE=true',
    'UNKNOWN_SEMANTIC_TOKEN_IS_NOT_DELETE=true',
    'NO_DEAD_BUREAUCRATIC_MODE=true',
    'HERMES_EXECUTOR_CONTRACT_OWNER=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
    'HERMES_LOCAL_PROFILE_CLASS=THIN_EXECUTOR_BRIDGE',
    'HERMES_LOCAL_PROFILE_MUST_NOT_DUPLICATE_SOUL=true',
    'NO_SECOND_SOUL=true',
    'HERMES_CANONICAL_REF=origin/main',
    'HERMES_CANONICAL_CACHE_OWNER=scripts/vps/centraldark-deploy.sh',
    'HERMES_BOOT_READS_CANONICAL_MAIN_FIRST=true',
    'HERMES_BOOT_BINDS_MAIN_SHA=true',
    'GITHUB_MAIN_GOVERNS_IDENTITY_STRUCTURE_CONTRACTS=true',
    'VPS_RUNTIME_GOVERNS_LIVE_RUNTIME_FACTS=true',
    'FIO_VIVO_RECOVERY=true',
    'HUMAN_CUE_IS_POINTER_NOT_AUTHORITY=true',
    'PERSONAL_SYMBOL_MEANING_REQUIRES_CHEFE_DEFINITION=true',
    'RAW_PERSONAL_MEDIA_DO_NOT_ENTER_GIT_BY_DEFAULT=true',
    'EXTERNAL_PATTERN_MUST_ADAPT_TO_EXISTING_OWNERS=true',
    'CANONICAL_SOUL_PRECEDENCE_OVER_EXTERNAL_SESSION_KITS=true',
  ], 'SOUL_SOL');

  requireTokens(teachingGrammar, [
    'live_collaboration_mode:',
    'name: PADRAO_NUMERO_1_CENTRALDARK',
    'activate_when_either_trigger_present: true',
    'UNDERSTAND_BEFORE_NORMALIZE: true',
    'SEMANTIC_DIVERSITY_PRESERVE_UNTIL_CLASSIFIED: true',
    'UNKNOWN_SEMANTIC_TOKEN_IS_NOT_DELETE: true',
    'ASK_EXECUTOR_OR_MEASURE_BEFORE_DISCARD: true',
    'NO_DEAD_BUREAUCRATIC_MODE: true',
    'NO_EMPTY_PRAISE_LOOP: true',
    'BAIANES_NATURAL_NOT_CARICATURE: true',
    'VOICE_TRANSCRIPTION_IS_SEMANTIC_CANDIDATE: true',
    'ASR_TOKEN_MAY_BE_RECONCILED_BY_CONTEXT: true',
    'KNOWN_HUMAN_CUE_MAY_RESOLVE_EXISTING_BRIDGE: true',
  ], 'SOL_TEACHING_GRAMMAR_LIVE_COLLAB');

  requireTokens(handoff, [
    'UMA_PALAVRA_OU_SINAL',
    'RECUPERA_CONTEXTO_MINIMO_NECESSARIO',
    'CUE_IS_POINTER_NOT_AUTHORITY=true',
    'RAW_PERSONAL_MEDIA_DO_NOT_ENTER_GIT_BY_DEFAULT=true',
    'HISTORY_RECOVERED_BY_CUE != CURRENT_STATE',
  ], 'HANDOFF_FIO_VIVO');

  requireTokens(harvester, [
    'LOAD_MINIMUM_RELEVANT_CONTEXT',
    'DURABLE_BEHAVIOR_DELTA',
    'SHORT_WORKING_STATE',
    'HANDOFF_STATE',
    'CONTEXT_SENSOR_UNKNOWN  → UNKNOWN; NO_FAKE_PERCENT',
    'REFERENCE_SOURCE=inematds/claude-session-kit@6ffefa1d1ac838a245cade6059664728f939985b',
    'BLIND_VENDOR_COPY=false',
    'EXISTING_CENTRALDARK_OWNERS_KEEP_AUTHORITY=true',
  ], 'SESSION_HARVEST_FIO_VIVO');

  forbidTokens(soul, [
    'SEGREDO_CHEFE_IS_REFERENCE_NOT_ROUTER=true',
    'INTENCAO_DO_CHEFE_IS_DELTA_UTIL=true',
    '"pivete" regional = vocativo; não cria papel nem autorização',
  ], 'SOUL_SOL_LEGACY');

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
    'COT_REACT_LOOP:',
    'private_chain_of_thought_exposed: false',
    'operational_hud_protocol:',
    'HUD_FIRST_BEFORE_MATERIAL_EXECUTION: true',
    'GOAL_STAYS_VISIBLE_DURING_EXECUTION: true',
    'no_useless_narration: true',
    'EVENT_SNAPSHOT_IS_NOT_CURRENT: true',
    'LIVE_LABEL_REMEASUREMENT_REQUIRED_FOR_CURRENT_CLAIM: true',
    'current_pr_labels_require_live_api_read: true',
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
    'HERMES_LOCAL_PROFILE_CLASS=THIN_EXECUTOR_BRIDGE',
    'HERMES_LOCAL_PROFILE_MUST_NOT_DUPLICATE_SOUL=true',
    'NO_SECOND_SOUL=true',
    'CANONICAL_SOURCE_REF=origin/main',
    'CANONICAL_CACHE_OWNER=scripts/vps/centraldark-deploy.sh',
    'BOOT_READS_CANONICAL_MAIN_FIRST=true',
    'BOOT_BINDS_MAIN_SHA=true',
    'CHEFE_MATERIAL_ENTERS_MILL=true',
    'DELTA_UTIL_REQUIRES_DEDUPE_CLASSIFY_PROOF=true',
    'RAW_CHEFE_MATERIAL_IS_NOT_AUTOMATIC_COMMIT=true',
    'AUREOLA_MATERIAL_DISCOVERY=LEARNING_CANDIDATE',
    'EVERY_MATERIAL_DISCOVERY_GETS_LEARNING_REF=true',
    'DISCOVERY_AUTO_PROMOTES_TO_CANONICAL=false',
    'REUSE_PROVEN_CRYSTAL_BEFORE_REINVESTIGATE=true',
    'CALCULATION_SUPPORTS_DECISION_BUT_DOES_NOT_REPLACE_RUNTIME_OBSERVATION=true',
  ], 'HERMES_PROMPT');

  forbidTokens(hermesPrompt, [
    'INTENCAO_DO_CHEFE_IS_DELTA_UTIL=true',
    'AGENT_DECIDES_UTILITY=false',
  ], 'HERMES_PROMPT_LEGACY');

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
    hermes_thin_executor_bridge: true,
    hermes_boot_reads_origin_main_first: true,
    no_second_soul: true,
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
    continuity_hud_contract: true,
    operational_narration_contract: true,
    preventive_continuity_staff_contract: true,
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