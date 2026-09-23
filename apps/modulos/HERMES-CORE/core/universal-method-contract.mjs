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
  metaLupa: '.agents/skills/meta-lupa/SKILL.md',
  fableLoop: '.agents/skills/fable-loop/SKILL.md',
  conflictResolver: '.agents/skills/git-conflict-resolve-house-standard/SKILL.md',
  perceptionOrchestra: 'apps/modulos/HERMES-CORE/core/perception-orchestra.mjs',
  orchestrator: 'apps/modulos/HERMES-CORE/core/orchestrator.mjs',
  knowledgeCollector: 'apps/modulos/HERMES-CORE/agents/Knowledge-Collector/agent.mjs',
  agentsGuide: 'AGENTS.md',
  portableEntry: 'LEIA-ME-IA.md',
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
  const metaLupa = read(FILES.metaLupa);
  const fableLoop = read(FILES.fableLoop);
  const conflictResolver = read(FILES.conflictResolver);
  const perceptionOrchestra = read(FILES.perceptionOrchestra);
  const orchestrator = read(FILES.orchestrator);
  const knowledgeCollector = read(FILES.knowledgeCollector);
  const agentsGuide = read(FILES.agentsGuide);
  const portableEntry = read(FILES.portableEntry);
  const tlc23Hash = sha256(readBuffer(FILES.tlc23));

  if (tlc23Hash !== TLC23_CANONICAL_SHA256) {
    throw new Error(`TLC23_SOURCE_HASH_MISMATCH:${tlc23Hash}`);
  }

  requireTokens(universal, [
    'applies_to: ALL_CURRENT_AND_FUTURE_ENGINES',
    'same_method_required_for_new_engine: true',
    'cross_surface_contract_inheritance: true',
    'semantic_convergence_across_surfaces_is_expected_success: true',
    'surface_name_is_not_executor_proof: true',
    'tool_catalog_visible_is_not_tool_call_success: true',
    'tool_claim_requires_measured_receipt: true',
    'executor_attribution_requires_observed_executor: true',
    'no_conformance_level_auto_promotes_next: true',
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

  requireTokens(universal, [
    'human_complexity_absorption_required: true',
    'machine_discoverable_state_must_not_be_human_guesswork: true',
    'machine_safe_fix_must_not_be_delegated_to_human: true',
    'human_complexity_absorption_contract:',
    'purpose: MACHINE_ABSORBS_TECHNICAL_COMPLEXITY_FOR_HUMANS',
    'prefer_complete_execution_bundle_over_microcommands: true',
    'unresolved_failure_must_be_loud_and_unambiguous: true',
    'ask_one_exact_human_action_at_a_time: true',
    'secrets_must_not_be_requested_in_chat: true',
    'after_human_frontier_machine_auto_resumes: true',
    'complexity_belongs_inside_system_not_on_user: true',
  ], 'HUMAN_COMPLEXITY_ABSORPTION_UNIVERSAL');

  requireTokens(contract, [
    'human_complexity_must_be_absorbed_by_machine_when_safe: true',
    'machine_discoverable_state_must_not_be_user_guesswork: true',
    'machine_safe_fix_must_not_be_delegated_to_user: true',
    'generic_error_without_location_and_next_action_is_invalid: true',
    'marker: CENTRALDARK_HUMAN_COMPLEXITY_ABSORPTION_REQUIRED',
    'prefer_one_complete_operation_over_microcommand_chain: true',
    'automatic_resume_after_human_frontier: true',
  ], 'HUMAN_COMPLEXITY_ABSORPTION_CONTRACT');

  requireTokens(hermesPrompt, [
    '## Contrato humano universal — absorver complexidade, não devolvê-la',
    'COMPLEXITY_BELONGS_INSIDE_SYSTEM_NOT_ON_USER=true',
    'HUMAN_SUPPLIES_GOAL_NOT_RUNBOOK=true',
    'PREFER_COMPLETE_OPERATION_OVER_MICROCOMMAND_CHAIN=true',
    'UNRESOLVED_FAILURE_MUST_BE_LOUD_EXACT_ACTIONABLE=true',
    'ASK_ONE_EXACT_HUMAN_ACTION_AT_A_TIME=true',
    'AUTO_RESUME_AFTER_HUMAN_FRONTIER=true',
  ], 'HERMES_HUMAN_COMPLEXITY_PROMPT');

  requireTokens(operationalMethod, [
    '## Contrato humano de execução integral',
    'microcomando não é padrão',
    'se a máquina pode descobrir, o humano não deve adivinhar',
    'erro genérico sem localização e próximo passo acionável é FAIL',
  ], 'OPERATIONAL_HUMAN_COMPLEXITY_METHOD');


  requireTokens(autoconfigRuntime, [
    'official_hermes_update_continuity:',
    'owner: .github/workflows/hermes-core-signal-watch.yml',
    'upstream: NousResearch/hermes-agent',
    'new_parallel_updater: false',
    'check: hermes update --check',
    'plan: hermes update --plan',
    'apply: hermes update --backup --yes',
    'human_does_not_need_to_remember_update_command: true',
    'tutorial_loaded_by_core_prompt: true',
  ], 'HERMES_OFFICIAL_UPDATE_CONTINUITY');

  requireTokens(hermesPrompt, [
    '## Tutorial interno — manter o Hermes oficial atualizado sozinho',
    'HERMES_OFFICIAL_UPDATE_OWNER=EXISTING_HERMES_CORE_SIGNAL_WATCH',
    'OFFICIAL_CLI_IS_UPDATE_ENGINE=true',
    'SCHEDULE_FALLBACK_REQUIRED=true',
    'POSTCHECK_REQUIRED=true',
    'HUMAN_RETEACH_REQUIRED=false',
  ], 'HERMES_OFFICIAL_UPDATE_TUTORIAL');
  requireTokens(agentsGuide, [
    'MEASURE_BEFORE_CREATION_REQUIRED=SIM',
    'MEASURE_BEFORE_CREATION_FORMULA="REUSE_BEFORE_CREATE + UNKNOWN != PASS + DOCUMENTED != EXECUTED + REALITY = JUDGE"',
    'MEASURE_BEFORE_CREATION_SEMANTIC_REFERENCE="1Ts 5:21"',
    'MEASURE_BEFORE_CREATION_APPLIES_TO=ALL_CURRENT_AND_FUTURE_AGENTS',
    'VERSE_IS_SEMANTIC_CUE_NOT_PROOF=true',
  ], 'MEASURE_BEFORE_CREATION_GLOBAL_AGENTS');

  requireTokens(master, [
    'measure_before_creation_semantic_binding:',
    'verse_reference: "1Ts 5:21"',
    'ALL_CURRENT_AND_FUTURE_AGENTS',
    'MEASURE_EXISTING_REALITY',
    'RETAIN_PROVEN_GOOD',
    'verse_is_semantic_cue_not_proof: true',
  ], 'MEASURE_BEFORE_CREATION_MASTER_BINDING');

  requireTokens(hermesPrompt, [
    'MEASURE_BEFORE_CREATION=true',
    'MEASURE_BEFORE_CREATION_SEMANTIC_REFERENCE="1Ts 5:21"',
    'MEASURE_BEFORE_CREATION_APPLIES_TO_ALL_AGENTS=true',
    'VERSE_IS_SEMANTIC_CUE_NOT_PROOF=true',
  ], 'MEASURE_BEFORE_CREATION_HERMES_BINDING');

  requireTokens(agentsGuide, [
    'CENTRALDARK_UNIVERSAL_DIRECT_MODE_V1=true',
    'PREFER_COMPLETE_OPERATION_OVER_MICROCOMMAND_CHAIN=true',
    'HUD_LAYOUT_FIXED=true',
    'UNCHANGED_FIELDS_SHOULD_NOT_BE_REWRITTEN=true',
    'NUMERIC_METRIC_REQUIRES_PROVEN_DENOMINATOR=true',
    'TOOL_ARGUMENT_LIMITS_MUST_BE_NORMALIZED_TO_SAFE_CAP=true',
    'SOURCE_404_IS_SENSOR_MISS_NOT_WORLD_MISS=true',
    'GITHUB_REF_MISS_DOES_NOT_PROVE_RUNTIME_FILE_ABSENT=true',
    'ALTERNATE_AUTHORIZED_SENSOR_BEFORE_HUMAN_BLOCKER=true',
    'SAME_HEAD_GREEN_PROMOTES_TO_TOTAL_DEPLOY=true',
    'TOTAL_DEPLOY_REGENERATES_FROM_PROVEN_MAIN_AND_EXISTING_RUNTIME=true',
    'DEPLOY_DOES_NOT_REASK_AFTER_AUTHORIZED_GREEN=true',
    'UNTRACKED_RUNTIME_STATE_IS_PRESERVED_NOT_BLIND_CLEANED=true',
    'PROOF_COUNTERPROOF_ACCEPT_RECONCILE_IS_DETERMINISTIC_CLOSURE=true',
    'ACCEPTANCE_REQUIRES_PROOF_AND_COUNTERPROOF_SURVIVAL=true',
    'COUNTERPROOF_FAILURE_REOPENS_OR_REJECTS_CLAIM=true',
    'RECONCILIATION_PRESERVES_PROVEN_GOOD_AND_DISCARDS_ONLY_DISPROVEN_DELTA=true',
    'SEALED_CLAIM_NO_REEXECUTE_WITHOUT_NEW_MATERIAL_CAUSE=true',
    'NEW_MATERIAL_CAUSE_REOPENS_SEAL=true',
    'GENERIC_ERROR_ONLY=FAIL',
    'ASK_ONE_EXACT_HUMAN_ACTION_AT_A_TIME=true',
    'AUTO_RESUME_AFTER_HUMAN_FRONTIER=true',
  ], 'UNIVERSAL_DIRECT_MODE_AGENTS');

  requireTokens(portableEntry, [
    '## 0.1 Modo Direto universal — contrato portátil',
    'CENTRALDARK_UNIVERSAL_DIRECT_MODE_V1=true',
    'HUD_FIXED_FIELDS=',
    'HUD_ONLY_MATERIAL_VALUES_CHANGE=true',
    'TOOL_ARGUMENT_LIMITS_MUST_BE_NORMALIZED_TO_SAFE_CAP=true',
    'SOURCE_404_IS_SENSOR_MISS_NOT_WORLD_MISS=true',
    'FAILURE_MUST_SHOW=',
    'NO_TOOL_ACCESS → EXECUTION_CAPABILITY=ADVISORY_ONLY',
  ], 'UNIVERSAL_DIRECT_MODE_PORTABLE_ENTRY');

  requireTokens(hermesPrompt, [
    'UNIVERSAL_DIRECT_MODE_INHERITED=true',
    'UNIVERSAL_DIRECT_MODE_OWNER=AGENTS.md',
    'UNIVERSAL_DIRECT_PORTABLE_ENTRY=LEIA-ME-IA.md',
    'HUD_LAYOUT_FIXED_ONLY_LIVE_VALUES_CHANGE=true',
    'TOOL_ARGUMENT_LIMITS_MUST_BE_NORMALIZED_TO_SAFE_CAP=true',
    'SOURCE_404_IS_SENSOR_MISS_NOT_WORLD_MISS=true',
    'PROOF_COUNTERPROOF_ACCEPT_RECONCILE_IS_DETERMINISTIC_CLOSURE=true',
    'ACCEPTANCE_REQUIRES_PROOF_AND_COUNTERPROOF_SURVIVAL=true',
    'COUNTERPROOF_FAILURE_REOPENS_OR_REJECTS_CLAIM=true',
    'RECONCILIATION_PRESERVES_PROVEN_GOOD_AND_DISCARDS_ONLY_DISPROVEN_DELTA=true',
    'SEALED_CLAIM_NO_REEXECUTE_WITHOUT_NEW_MATERIAL_CAUSE=true',
    'NEW_MATERIAL_CAUSE_REOPENS_SEAL=true',
    'CROSS_SURFACE_CONTRACT_INHERITANCE=true',
    'SEMANTIC_CONVERGENCE_ACROSS_SURFACES_IS_EXPECTED_SUCCESS=true',
    'SURFACE_NAME_IS_NOT_EXECUTOR_PROOF=true',
    'TOOL_CATALOG_VISIBLE_IS_NOT_TOOL_CALL_SUCCESS=true',
    'TOOL_CLAIM_REQUIRES_MEASURED_RECEIPT=true',
    'EXECUTOR_ATTRIBUTION_REQUIRES_OBSERVED_EXECUTOR=true',
    'SAME_HEAD_GREEN_PROMOTES_TO_TOTAL_DEPLOY=true',
    'TOTAL_DEPLOY_REGENERATES_FROM_PROVEN_MAIN_AND_EXISTING_RUNTIME=true',
    'HUMAN_RETEACH_REQUIRED=false',
  ], 'UNIVERSAL_DIRECT_MODE_HERMES');

  requireTokens(metaLupa, [
    '## Gate determinístico: prova → contraprova → aceite → reconciliação',
    'PROOF_REQUIRED_BEFORE_ACCEPTANCE=true',
    'COUNTERPROOF_REQUIRED_BEFORE_ACCEPTANCE=true',
    'ACCEPTANCE_IS_COMPUTED_NOT_VOTED=true',
    'ACCEPTANCE_RESULT_ENUM=ACCEPTED|PARTIAL|REJECTED|UNKNOWN',
    'UNKNOWN=INSUFFICIENT_EVIDENCE_NO_PASS',
    'NEW_MATERIAL_CAUSE_REQUIRES_REOPEN_WITH_CAUSE_REF=true',
    'FIXED_POINT_REQUIRES_DETERMINISTIC_CLOSURE=true',
  ], 'META_LUPA_DETERMINISTIC_CLOSURE');

  requireTokens(metaGrill, [
    '## ⚖️ Lei do fechamento determinístico',
    'META_GRILL_IS_FALSIFIER_NOT_PERMANENT_SKEPTIC=true',
    'ACCEPTANCE_RESULT_ENUM=ACCEPTED|PARTIAL|REJECTED|UNKNOWN',
    'ACCEPT_ONLY_AFTER_COUNTERPROOF_SURVIVAL=true',
    'PROVEN_GOOD_MUST_SURVIVE_RECONCILIATION=true',
  ], 'META_GRILL_DETERMINISTIC_CLOSURE');

  requireTokens(fableLoop, [
    '## Contrato de aceite e reconciliação',
    'FABLE_PROOF_COUNTERPROOF_CLOSURE=true',
    'ACCEPTANCE_RESULT_ENUM=ACCEPTED|PARTIAL|REJECTED|UNKNOWN',
    'FABLE_ACCEPT_ONLY_AFTER_COUNTERPROOF_SURVIVAL=true',
    'FABLE_RECONCILE_PARTIAL_FAILURE=true',
    'FABLE_SEALED_CLAIM_NO_RECHECK_WITHOUT_NEW_CAUSE=true',
  ], 'FABLE_DETERMINISTIC_CLOSURE');
  let previous = -1;
  for (const token of REQUIRED_CHAIN) {
    const needle = `  - ${token}`;
    const pos = universal.indexOf(needle);
    if (pos < 0) throw new Error(`CHAIN_TOKEN_MISSING:${token}`);
    if (pos <= previous) throw new Error(`CHAIN_ORDER_INVALID:${token}`);
    previous = pos;
  }

  requireTokens(aureola, [
    'header: "⭕ !AURÉOLA CANÔNICA"',
    'opening_verse: "“Examinai tudo. Retende o bem.” — 1 Tessalonicenses 5:21"',
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
    '"explicit_intent_override_policy":',
    '"marker": "CENTRALDARK_EXPLICIT_INTENT_TEMPORARY_OVERRIDE"',
    '"EXPLICIT_OVERRIDE_DOES_NOT_MUTATE_DEFAULT": true',
    '"REASK_WHEN_SAME_INTENT_SCOPE_ALREADY_AUTHORIZED": false',
    '"promotion": "VALID_INTENT_RECEIPT + SAME_HEAD_GREEN -> AUTO_SQUASH_IF_CLEAN_WITHOUT_REASK"',
  ], 'UNIVERSAL_GATE_REGISTRY');

  requireTokens(boot, [
    'mission_stop: "CONTINUE_ACROSS_CHAT_BOUNDARIES_UNLESS_CHEFE_EXPLICITLY_STOPS"',
    '- "CHEFE_EXPLICITLY_STOPS"',
    'child_pr_only_promotion_vehicle: false',
    'promotion_mode: "DIRECT_MAIN_SOFT_EVOLUTION"',
    'MIN_SECURITY_CHECKS',
    'DIRECT_MAIN_COMMIT',
    'MAIN_READBACK',
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
    'TLC23_SHARED_METHOD=true',
    'PROOF_REUSE_WHEN_FINGERPRINT_UNCHANGED=true',
    'ACCEPTANCE_IS_NOT_PROOF=true',
    'DETERMINISTIC_RECONCILIATION_BEFORE_NEW_ARCHITECTURE=true',
  ], 'METAGRILL_HOOK');

  requireTokens(fableLoop, [
    'TLC23_SHARED_METHOD=true',
    'PROOF_REUSE_WHEN_FINGERPRINT_UNCHANGED=true',
    'NO_NEW_MATERIAL_FACT=REUSE_PROOF_NO_REPEAT',
    'ACCEPTANCE_IS_NOT_PROOF=true',
    'DETERMINISTIC_RECONCILIATION_BEFORE_NEW_ARCHITECTURE=true',
  ], 'FABLE_TLC23_SHARED_METHOD');

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
    'HERMES_SEMANTIC_RECONCILE_ALL=true',
    'REUSE_CONFLICT_OWNER=true',
    'BLIND_ACCEPT_BOTH=false',
    'MANUAL_CURRENT_INCOMING_BOTH_CHOICE_FOR_MACHINE_RESOLVABLE_CASE=false',
    'SAME_HEAD_AFTER_RESOLUTION_REQUIRED=true',
  ], 'HERMES_SEMANTIC_CONFLICT_RECONCILIATION');

  requireTokens(conflictResolver, [
    '## SAME/ALL — reconciliação semântica canônica',
    'SAME_ALL_IS_DEFAULT_FOR_COMPATIBLE_USEFUL_DELTA=true',
    'SAME_ALL_IS_NOT_BLIND_ACCEPT_BOTH=true',
    'CONTRADICTORY_DELTA_REQUIRES_DISCRIMINANT_TEST=true',
    'CONFLICT_MARKERS_AFTER_RESOLUTION=FAIL',
    'SAME_HEAD_REQUIRED_AFTER_CONFLICT_RESOLUTION=true',
    'REUSE_THIS_OWNER_FOR_ALL_EQUIVALENT_PRS=true',
  ], 'HOUSE_SEMANTIC_CONFLICT_RECONCILIATION');

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
    tlc23_shared_core_method: true,
    tlc23_fable_meta_lupa_meta_grill_binding: true,
    proof_reuse_when_fingerprint_unchanged: true,
    acceptance_is_proof: false,
    deterministic_reconciliation_before_new_architecture: true,
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
    human_complexity_absorption_contract: true,
    prefer_complete_operation_over_microcommands: true,
    loud_actionable_failure_contract: true,
    automatic_resume_after_human_frontier: true,
    universal_direct_mode_contract: true,
    measure_before_creation_global: true,
    measure_before_creation_semantic_reference: '1Ts 5:21',
    measure_before_creation_all_agents: true,
    verse_is_semantic_cue_not_proof: true,
    fixed_hud_only_live_values_change: true,
    numeric_metrics_require_proven_denominator: true,
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