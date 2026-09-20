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
  tlc23: 'docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf',
  agentCall: 'scripts/agent-call.mjs',
  deployDispatcher: 'scripts/vps/deploy-guards-dispatcher.sh',
  centralDeploy: 'scripts/vps/centraldark-deploy.sh',
  operationalDeploy: 'scripts/vps/deploy-operational-guards.sh',
  globalContract: 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
  boot: 'CENTRALDARK_AI_BOOT.yaml',
  grillMe: '.agents/skills/grill-me/SKILL.md',
  metaGrill: '.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/KIT.md',
  perceptionOrchestra: 'apps/modulos/HERMES-CORE/core/perception-orchestra.mjs',
  orchestrator: 'apps/modulos/HERMES-CORE/core/orchestrator.mjs',
  knowledgeCollector: 'apps/modulos/HERMES-CORE/agents/Knowledge-Collector/agent.mjs',
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
  'GLOBAL_CONTRACT_ENFORCER',
  'DELTA_CONTINUO_GLOBAL',
  'FIXED_HUD_LIVE_DATA',
  'POMBO64_TRACE',
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
  const agentCall = read(FILES.agentCall);
  const deployDispatcher = read(FILES.deployDispatcher);
  const centralDeploy = read(FILES.centralDeploy);
  const operationalDeploy = read(FILES.operationalDeploy);
  const globalContract = read(FILES.globalContract);
  const boot = read(FILES.boot);
  const grillMe = read(FILES.grillMe);
  const metaGrill = read(FILES.metaGrill);
  const perceptionOrchestra = read(FILES.perceptionOrchestra);
  const orchestrator = read(FILES.orchestrator);
  const knowledgeCollector = read(FILES.knowledgeCollector);
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
    'desktop_agentic_kernel_contract:',
    'CENTRALDARK_DESKTOP_AGENTIC_KERNEL_REQUIRED',
    'logical_kernel_is_centraldark_core_not_native_os_kernel: true',
    'native_os_kernel_claim_requires_boot_evidence: true',
    'owner: apps/modulos/Bolt/source',
    'entrypoint: CentralDark.exe',
    'same_head_source_required: true',
    'desktop_contract_test_required: true',
    'source_present_is_runtime_pass: false',
    'contract_test_pass_is_packaged_pass: false',
    'packaged_runtime_required: true',
    'installer_sha256_required: true',
    'centraldark_exe_launch_required: true',
    'renderer_visible_required: true',
    'omni_router_health_required: true',
    'hermes_sidecar_required_for_fixed_point: true',
    'hermes_bundle_unknown_blocks_fixed_point: true',
    'mcp_health_required_for_fixed_point: true',
    'optional_provider_failure_does_not_kill_core: true',
    'selected_optional_provider_requires_fresh_health: true',
    'direct_api_mcp_primary: true',
    'github_casa_vps_api_rendezvous_required: true',
    'remote_bridge_online_is_global_fixed_point: false',
    'secrets_forbidden_in_receipt: true',
    'hybrid_telemetry_contract:',
    'CENTRALDARK_HYBRID_TELEMETRY_REQUIRED',
    'screen_is_optional_sensor_not_single_point_of_truth: true',
    'no_screen_does_not_block_other_observability: true',
    'sensor_failure_is_world_failure: false',
    'endpoint_must_be_attributed_to_screenpipe_process_before_use: true',
    'unresolved_material_contradiction: FIXED_POINT_FALSE',
    'ephemeral_artifact_policy:',
    'CENTRALDARK_EPHEMERAL_WORKSPACE_CLEAN_REQUIRED',
    'temporary_version_suffixes_allowed: true',
    'temporary_suffixes_are_architecture: false',
    'cleanup_required_after_use: true',
    'canonical_same_capability_version_suffix: FORBIDDEN',
    'evolve_same_object: true',
    'expand_domain_in_same_owner: true',
    'create_parallel_architecture_for_domain_expansion: false',
    'integrated_global_dedupe: true',
    'duplicate_action: ABSORB_DELTA_INTO_EXISTING_OWNER_THEN_RETIRE_DUPLICATE',
    'log_incident_crystallization_contract:',
    'CENTRALDARK_LOG_INCIDENT_FANOUT_CRYSTALLIZATION_REQUIRED',
    'sensor: /admin/api/logs',
    'deterministic_fanout_gate: scripts/agent-call.mjs --log-incident-fanout',
    'fanout_mode: PARALLEL_READ_ONLY_DIAGNOSIS',
    'mutation_mode: PARALLEL_ONLY_FOR_PROVEN_DISJOINT_SCOPES_SERIAL_WITHIN_EACH_SCOPE',
    'one_active_writer_per_mutable_scope: true',
    'continue_until: ALL_MATERIAL_INCIDENTS_RESOLVED_OR_EXACT_BLOCKER',
    'endpoint_200_alone_is_pass: false',
    'unresolved_material_error_means_fixed_point: false',
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
    'global_contract_enforcer:',
    'marker: CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED',
    'mode: EXTEND_EXISTING_TRIGGER_FABRIC_AND_AGENT_CALL',
    'mutation_gate: scripts/agent-call.mjs',
    'deploy_gate: scripts/vps/deploy-guards-dispatcher.sh',
    'GLOBAL_ENTRY_GATE_PASS',
    'GLOBAL_EXIT_GATE_PASS',
    'DELTA_CONTINUO_REQUIRED: true',
    'log_incident_crystallization:',
    'sensor: /admin/api/logs',
    'FAN_OUT_PARALLEL_READ_ONLY',
    'REMEDIATE_BY_SCOPE',
    'RESCAN_ADMIN_API_LOGS',
    'CONTINUE_TO_CRYSTALLIZATION',
    'ADMIN_API_LOGS_200_IS_NOT_GLOBAL_PASS: true',
    'UNRESOLVED_MATERIAL_ERROR_BLOCKS_FIXED_POINT: true',
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
    'continuous_capability_absorption:',
    'fixed_point_is_learning_gate: false',
    'approved_material_step_emits_learning_ref: true',
    'proven_reusable_delta_binds_before_global_fixed_point: true',
    'CONTINUOUS_HERMES_CAPABILITY_ABSORPTION: true',
    'FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE: true',
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

  requireTokens(globalContract, [
    '"universal_gate_registry":',
    '"marker": "CENTRALDARK_UNIVERSAL_GATE_REGISTRY"',
    '"hard_gate_id_must_be_registered_before_enforcement": true',
    '"gate_enforcement_without_contract_declaration": "FORBIDDEN"',
    '"PRE_MUTATION_INTERVIEW_GATE"',
    '"FAIL_FAST_BLOCK_GATE"',
    '"LOCAL_HOUSE_SENSOR_GATE"',
    '"pre_mutation_interview_gate":',
    '"marker": "CENTRALDARK_GRILL_META_INTERVIEW_GATE"',
    '"parallel_perception_runtime": "apps/modulos/HERMES-CORE/core/perception-orchestra.mjs"',
    '"fail_fast_block_contract":',
    '"on_any_material_failure": "ABORT_CURRENT_BLOCK"',
    '"fixed_point_true_after_material_failure": "FORBIDDEN"',
    '"local_house_sensor_contract":',
    '"CASA_LOCAL": "DISCOVER_AT_RUNTIME_DO_NOT_ASSUME_PATH"',
  ], 'UNIVERSAL_GATE_REGISTRY');

  requireTokens(boot, [
    'required_gate_ids:',
    'LOAD_UNIVERSAL_GATE_REGISTRY',
    'LOAD_ROOT_CHILD_CONTRACT_LINEAGE',
    'LOAD_POMBO64_TRACE_CONTRACT',
    'LOAD_PRE_MUTATION_INTERVIEW_GATE',
    'LOAD_FAIL_FAST_BLOCK_GATE',
    'LOAD_LOCAL_HOUSE_SENSOR_CONTRACT',
    'ALLOW_FIRST_AGENT_ROUTING',
  ], 'BOOT_UNIVERSAL_GATE_LOADING');

  requireTokens(grillMe, [
    'disable-model-invocation: true',
    'Call the Skill tool with "grilling".',
  ], 'GRILL_ME_HOOK');

  requireTokens(metaGrill, [
    'OWNER CANÔNICO:',
    'META-GRILL acha a ferida',
    'KIT_IS_SEMANTIC_HOOK=true',
    'CHANGE_REQUIRES_SEGREDO_CHEFE=true',
  ], 'METAGRILL_HOOK');

  requireTokens(operationalMethod, [
    'Leitores investigam em paralelo',
    'Um Writer por escopo mutavel',
    'UNKNOWN, ANOMALY, ACHADO_PENDENTE, BLOCKED',
  ], 'OPERATIONAL_METHOD_INTERVIEW_BINDING');

  requireTokens(perceptionOrchestra, [
    "id: 'A_LOGIC'",
    "id: 'B_IMPLEMENTATION'",
    "id: 'C_REGRESSION_FALSE_GREEN'",
    "id: 'D_SIMPLIFICATION'",
    "mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION'",
    'mutation_allowed: false',
    'writer_required_for_mutation: true',
    'reality_is_judge: true',
  ], 'PERCEPTION_ORCHESTRA_INTERVIEW_RUNTIME');

  requireTokens(contract, [
    'global_contract_entry_policy:',
    'marker: CENTRALDARK_GLOBAL_CONTRACT_ENTRY_REQUIRED',
    'ALL_CURRENT_AND_FUTURE_MODEL_ADAPTERS',
    'ALL_CURRENT_AND_FUTURE_AGENTS',
    'ALL_CURRENT_AND_FUTURE_CLIS',
    'contract_required_before_operational_mutation: true',
    'model_or_tool_may_bypass_contract: false',
    'outside_contract_mutation: FAIL_CLOSED',
    'parallel_workaround_for_uncovered_case: FORBIDDEN',
    'FIND_EXISTING_OWNER',
    'IDENTIFY_MINIMAL_CONTRACT_DELTA',
    'PATCH_EXISTING_OWNER',
    'REVALIDATE_GLOBAL_CONTRACT',
    'CONTINUE_CURRENT_MISSION',
    'uncovered_case_may_create_parallel_architecture: false',
    'uncovered_case_may_restart_mission: false',
    'delta_must_preserve_human_intent: true',
    'revalidation_required_before_continue: true',
  ], 'GLOBAL_CONTRACT_ENTRY_POLICY');

  requireTokens(triggers, [
    'event: AUREOLA_MATERIAL_DISCOVERY',
    'every_material_discovery_is_learning_candidate: true',
    'every_material_discovery_is_canonical_fact: false',
    'same_finding_without_new_evidence: DROP_DUPLICATE',
    'direct_canonical_mutation: false',
  ], 'TRIGGER_MAP_LEARNING');

  requireTokens(triggers, [
    'MUTATION_REQUIRES_GLOBAL_CONTRACT_ENTRY_EXIT',
    'DELTA_CONTINUO',
    'PERSIST_NEXT_CURSOR',
    'global_enforcer: scripts/agent-call.mjs',
    'mutation_gate: ENTRY_AND_EXIT_REQUIRED',
    'BIND_GLOBAL_CONTRACT_ENFORCER',
  ], 'TRIGGER_GLOBAL_ENFORCER_BINDING');

  requireTokens(triggers, [
    'event: LOG_INCIDENT_MATERIAL',
    'sensor: /admin/api/logs',
    'FAN_OUT_PARALLEL_READ_ONLY_FRONTS',
    'SERIALIZE_SAME_SCOPE_MUTATION',
    'ALLOW_PROVEN_DISJOINT_SCOPE_PARALLELISM',
    'CONTINUE_UNTIL_CRYSTALLIZED',
    'endpoint_200_is_global_pass: false',
    'unresolved_material_error_fixed_point: false',
  ], 'TRIGGER_LOG_INCIDENT_FANOUT');

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
    'global_contract_enforcer: scripts/agent-call.mjs',
    'future_executor_requires_global_gate: true',
    'mutation_without_global_entry_gate: FAIL_CLOSED',
    'delta_continuo_required: true',
    'hud_fixed_live_data_required: true',
  ], 'ENGINE_BINDING');

  requireTokens(agentCall, [
    'CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED',
    'GLOBAL_CONTRACT_SCOPE_ID',
    'validateGlobalContractGate',
    'BLOCKED_GLOBAL_CONTRACT_GATE_MISSING',
    '--global-contract-gate',
    'PASS_GLOBAL_CONTRACT_GATE',
    '--log-incident-fanout',
    'validateLogIncidentFanout',
    'PASS_LOG_INCIDENT_FANOUT_PLAN',
    'PARALLEL_ONLY_FOR_PROVEN_DISJOINT_SCOPES_SERIAL_WITHIN_EACH_SCOPE',
  ], 'GLOBAL_CONTRACT_AGENT_GATE');

  requireTokens(deployDispatcher, [
    'CentralDark — dispatcher condicional de scripts de deploy na VPS',
    'TLC23 / Universal Method: validar o SHA alvo antes de mutação',
  ], 'GLOBAL_CONTRACT_DEPLOY_OWNER');

  requireTokens(deployDispatcher, [
    'GLOBAL_CONTRACT_ENFORCER_TARGET=PASS',
    'grep -q "GLOBAL_ENTRY_GATE=PASS" scripts/vps/centraldark-deploy.sh',
    'grep -q "GLOBAL_EXIT_GATE=PASS" scripts/vps/centraldark-deploy.sh',
  ], 'GLOBAL_CONTRACT_DEPLOY_DISPATCHER_BINDING');

  requireTokens(centralDeploy, [
    'CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED',
    '--global-contract-gate ENTRY',
    '--global-contract-gate EXIT',
    'GLOBAL_ENTRY_GATE=PASS',
    'GLOBAL_EXIT_GATE=PASS',
  ], 'GLOBAL_CONTRACT_CENTRAL_DEPLOY_BINDING');

  requireTokens(operationalDeploy, [
    'CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED',
    '--global-contract-gate ENTRY',
    '--global-contract-gate EXIT',
    'GLOBAL_ENTRY_GATE=PASS',
    'GLOBAL_EXIT_GATE=PASS',
  ], 'GLOBAL_CONTRACT_OPERATIONAL_DEPLOY_BINDING');

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
    'CONTINUOUS_HERMES_CAPABILITY_ABSORPTION=true',
    'FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE=true',
    'PROVEN_REUSABLE_DELTA_BINDS_TO_CORE_BEFORE_GLOBAL_FIXED_POINT=true',
    'MATERIAL_APPROVED_STEP_EMITS_LEARNING_REF=true',
  ], 'HERMES_PROMPT');

  requireTokens(orchestrator, [
    "registrar as registrarAprendizado",
    'function registrarAprendizadoMaterial',
    'deveCapturarAprendizadoMaterial',
    'entrada.learning_ref = aprendizagem.ref',
    'FIXED_POINT é checkpoint de verificação, não gate para capacitação do Hermes',
  ], 'HERMES_CONTINUOUS_LEARNING_RUNTIME');

  requireTokens(knowledgeCollector, [
    'export function consultarContexto',
    'export function registrar',
    'deduped: true',
    "createHash('sha256')",
  ], 'HERMES_KNOWLEDGE_COLLECTOR_RUNTIME');

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
    fixed_point_is_learning_gate: false,
    continuous_hermes_capability_absorption: true,
    material_approved_step_emits_learning_ref: true,
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
    global_contract_enforcer: true,
    global_contract_entry_policy: true,
    outside_contract_mutation_fail_closed: true,
    uncovered_case_minimal_contract_delta: true,
    continuous_delta_global: true,
    desktop_agentic_kernel_global: true,
    hybrid_telemetry_global: true,
    ephemeral_cleanup_contract: true,
    log_incident_crystallization_contract: true,
    log_incident_fanout_gate: true,
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