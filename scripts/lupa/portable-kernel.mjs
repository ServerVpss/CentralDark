#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..', '..');
const argv = process.argv.slice(2);

function valueAfter(name, fallback = '') {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const ROOT = resolve(valueAfter('--repo-root', DEFAULT_ROOT));
const JSON_ONLY = argv.includes('--json');
const COMPACT = argv.includes('--compact');
const EXPORT_PATH = valueAfter('--export', '');
const CONTRACT = 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json';
const SOUL = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md';
const COGNITION = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md';
const METACOGNITION = 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md';
const ORCHESTRATION = 'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md';
const PROOF_OWNERSHIP = 'docs/CONSCIENCIA/PROOF-OWNERSHIP.json';
const RESPONSE_PATTERN = 'docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md';
const EVIDENCE_ONTOLOGY = 'docs/GOVERNANCA/ONTOLOGIA-DE-EVIDENCIA-E-CAUSALIDADE.md';
const EVOLUTION_GATE = '.agents/skills/meta-lupa/scripts/evolution_gate.py';
const PORTABLE_SCRIPT = 'scripts/lupa/portable-kernel.mjs';
const PORTABLE_TEST = 'scripts/lupa/portable-kernel.test.mjs';

function git(args) {
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function canonicalJson(value) {
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function load(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function fail(code, details = {}) {
  const out = { ok: false, status: 'BLOCKED', code, ...details };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(2);
}

if (!existsSync(join(ROOT, CONTRACT))) fail('CANONICAL_FILE_MISSING', { file: CONTRACT });

let contract;
try {
  contract = JSON.parse(load(CONTRACT));
} catch (error) {
  fail('CONTRACT_JSON_INVALID', { error: String(error?.message || error) });
}

function validateContract(value) {
  const errors = [];
  const image = value.multimodal_input_policy ?? {};
  const portable = value.portable_boot_policy ?? {};
  const language = value.language_policy ?? {};

  if (image.marker !== 'IMAGE_INPUT_IS_OPERATIONAL') errors.push('IMAGE_MARKER');
  if (image.image_is_sensor !== true) errors.push('IMAGE_NOT_SENSOR');
  if (image.screenshot_is_current_truth !== false) errors.push('SCREENSHOT_MUST_NOT_BE_CURRENT_TRUTH');
  if (image.screenshot_is_trigger_for_live_measurement !== true) errors.push('SCREENSHOT_MUST_TRIGGER_LIVE_MEASUREMENT');
  if (image.context_before_judgment !== true) errors.push('CONTEXT_BEFORE_JUDGMENT_REQUIRED');
  if (image.observed_state_is_neutral_by_default !== true) errors.push('OBSERVED_STATE_MUST_START_NEUTRAL');
  if (image.function_before_failure !== true) errors.push('FUNCTION_BEFORE_FAILURE_REQUIRED');
  if (image.cause_before_classification !== true) errors.push('CAUSE_BEFORE_CLASSIFICATION_REQUIRED');
  if (image.expected_mobility_is_not_drift !== true) errors.push('EXPECTED_MOBILITY_MUST_NOT_BE_DRIFT');
  if (image.terminal_cwd_is_not_blocker_without_causal_evidence !== true) errors.push('TERMINAL_CWD_FALSE_BLOCKER_GUARD_REQUIRED');
  if (image.do_not_invent_problem_from_screenshot !== true) errors.push('SCREENSHOT_FALSE_PROBLEM_GUARD_REQUIRED');
  if (image.do_not_expand_scope_from_visual_incidental_state !== true) errors.push('VISUAL_SCOPE_EXPANSION_GUARD_REQUIRED');
  if (image.user_demonstrated_context_is_primary_for_visual_scope !== true) errors.push('USER_VISUAL_SCOPE_REQUIRED');
  if (image.live_state_required_before_mutation !== true) errors.push('LIVE_REMEASURE_REQUIRED');
  if (image.material_visual_finding_action !== 'REMEASURE_LIVE_SOURCE_THEN_ACT_MINIMALLY') errors.push('IMAGE_ACTION_INVALID');

  if (language.paired_explanation_house_standard !== true) errors.push('PAIRED_EXPLANATION_REQUIRED');
  if (language.chefe_register_required_immediately_after_material_technical_unit !== true) errors.push('INLINE_CHEFE_REGISTER_REQUIRED');
  if (language.final_simple_summary_does_not_replace_inline_translation !== true) errors.push('INLINE_TRANSLATION_CANNOT_BE_REPLACED_BY_SUMMARY');
  if (language.referent_clarity_required !== true) errors.push('REFERENT_CLARITY_REQUIRED');
  if (language.ambiguous_pronoun_reference_is_incomplete !== true) errors.push('AMBIGUOUS_PRONOUN_MUST_BE_INCOMPLETE');
  if (language.orphan_deictic_reference_is_incomplete !== true) errors.push('ORPHAN_DEICTIC_MUST_BE_INCOMPLETE');
  if (language.referent_recovery !== 'REPEAT_THE_NOUN_OR_ENUMERATE_REFERENTS') errors.push('REFERENT_RECOVERY_INVALID');
  if (language.user_must_not_need_second_question_to_resolve_referent !== true) errors.push('REFERENT_SECOND_QUESTION_FORBIDDEN');

  if (portable.marker !== 'CENTRALDARK_PORTABLE_KERNEL') errors.push('PORTABLE_MARKER');
  if (portable.canonical_entrypoint !== 'LEIA-ME-IA.md') errors.push('PORTABLE_ENTRYPOINT');
  if (portable.package_is_cache_not_authority !== true) errors.push('PACKAGE_MUST_BE_CACHE');
  if (portable.package_source !== 'LIVE_REPOSITORY_CANONICAL_FILES') errors.push('PACKAGE_SOURCE_INVALID');
  if (portable.stale_package_action !== 'REBUILD_FROM_LIVE_REPOSITORY') errors.push('STALE_PACKAGE_ACTION_INVALID');
  if (portable.export_must_bind_to_head_sha !== true) errors.push('EXPORT_HEAD_BINDING_REQUIRED');
  if (portable.export_must_hash_each_member !== true) errors.push('EXPORT_MEMBER_HASH_REQUIRED');
  if (portable.model_provider_lock !== false) errors.push('MODEL_LOCK_FORBIDDEN');
  if (portable.never_overwrite_newer_live_state !== true) errors.push('NEWER_LIVE_STATE_MUST_WIN');
  if (!Array.isArray(value.mandatory_boot_sources) || value.mandatory_boot_sources.length < 4) errors.push('MANDATORY_BOOT_SOURCES_INVALID');
  if (!Array.isArray(value.standard_architecture?.flow) || value.standard_architecture.flow.length < 6) errors.push('STANDARD_FLOW_MISSING');

  return errors;
}

const contractErrors = validateContract(contract);
if (contractErrors.length) fail('PORTABLE_CONTRACT_INVALID', { errors: contractErrors });

const PORTABLE_SOURCE_FILES = [
  'LEIA-ME-IA.md',
  'AGENTS.md',
  SOUL,
  'docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',
  COGNITION,
  'docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md',
  RESPONSE_PATTERN,
  'docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md',
  CONTRACT,
  'docs/CONSCIENCIA/02-PERMISSOES.md',
  ORCHESTRATION,
  '.agents/skills/meta-lupa/SKILL.md',
  '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA',
  METACOGNITION,
  PROOF_OWNERSHIP,
  EVIDENCE_ONTOLOGY,
  EVOLUTION_GATE,
  '.agents/skills/meta-lupa/testes/test_evolution_gate.py',
  PORTABLE_SCRIPT,
  PORTABLE_TEST,
];

const SOURCE_FILES = [...new Set([
  ...contract.mandatory_boot_sources,
  ...PORTABLE_SOURCE_FILES,
])];

for (const file of SOURCE_FILES) {
  if (!existsSync(join(ROOT, file))) fail('CANONICAL_FILE_MISSING', { file });
}

const members = SOURCE_FILES.map((path) => {
  const content = load(path);
  return {
    path,
    sha256: sha256(content),
    bytes: Buffer.byteLength(content),
    content,
  };
});

const memberByPath = new Map(members.map((item) => [item.path, item]));

const CAPABILITY_SPECS = [
  {
    id: 'HUMAN_AUTHORITY_MODEL_REPLACEABILITY',
    layer: 'IDENTITY',
    owner: SOUL,
    markers: [
      'AUTORIDADE_FINAL=SEGREDO/CHEFE',
      'MODELO=MOTOR_SUBSTITUIVEL',
      'ONE_WRITER_PER_SCOPE=true',
      'UNKNOWN_IS_NOT_PASS=true',
    ],
    reproduction: 'PRESERVE_HUMAN_AUTHORITY_WHILE_MODELS_REMAIN_REPLACEABLE',
  },
  {
    id: 'LIVE_CONTEXT_RECOVERY',
    layer: 'BOOT',
    owner: 'LEIA-ME-IA.md',
    markers: [
      'REUSE_BEFORE_CREATE_REQUIRED=true',
      '#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR',
      'UNKNOWN_FIRST=true',
    ],
    reproduction: 'RECOVER_AND_REANCHOR_BEFORE_CONTINUING',
  },
  {
    id: 'ONE_CORE_MANY_ARMS',
    layer: 'ORCHESTRATION',
    owner: ORCHESTRATION,
    markers: [
      'STANDARD_ARCHITECTURE=ONE_CORE_MANY_ARMS',
      'MODEL_VOTE=FORBIDDEN_AS_TRUTH_MECHANISM',
      'PARALLEL_MUTATION_SAME_SCOPE=BLOCKED',
    ],
    reproduction: 'PARALLELIZE_PERCEPTION_SERIALIZE_MUTATION_REALITY_ARBITRATES',
  },
  {
    id: 'COGNITIVE_CAUSAL_LOOP',
    layer: 'COGNITION',
    owner: COGNITION,
    markers: [
      'PRIVATE_REASONING_DISCLOSURE_REQUIRED=false',
      'DIRECT_SOURCE_BEFORE_BULK_DOWNLOAD=true',
      'CAUSE_GENERATOR_BEFORE_SYMPTOM_PATCHING=true',
    ],
    reproduction: 'GROUND_ACT_OBSERVE_REEVALUATE_VERIFY_COMPRESS',
  },
  {
    id: 'EVIDENCE_CAUSALITY_ONTOLOGY',
    layer: 'EPISTEMIC_SAFETY',
    owner: EVIDENCE_ONTOLOGY,
    markers: [
      'MANIFESTACAO != REPRESENTACAO',
      'MECANISMO_DISPONIVEL != MECANISMO_ATIVO',
      'MECANISMO_ATIVO != CAUSA_PROVADA',
      'L4_REQUIRES_DISCRIMINATING_EVIDENCE=true',
      'FORCED_COLORS_MIGRATION_GUIDANCE_OBSERVED=true',
      'REPEATED_WARNING_COUNT != INDEPENDENT_EVIDENCE_COUNT',
      'VISIBLE_LABEL != HIDDEN_MECHANISM_PROOF',
      'UNKNOWN_IS_BOUNDARY_OF_CURRENT_PROOF=true',
    ],
    reproduction: 'CLASSIFY_EVIDENCE_LAYER_DEDUPE_REQUIRE_DISCRIMINATING_CAUSAL_LINK_AND_PRESERVE_UNKNOWN',
  },
  {
    id: 'CAUSAL_MINING_AND_DENSIFICATION',
    layer: 'LEARNING',
    owner: COGNITION,
    markers: [
      'MINING_WITHIN_ACTIVE_INTENT=AUTOMATIC',
      'NO_NEW_INFORMATION=NO_CHANGE',
      'SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true',
    ],
    reproduction: 'MINE_SOURCE_TO_MINIMAL_PROVEN_REUSABLE_DELTA',
  },
  {
    id: 'CROSS_META_EVOLUTION',
    layer: 'META',
    owner: METACOGNITION,
    markers: [
      'META_EVALUATION_REQUIRED=true',
      'META_MUTATION_REQUIRES_PROVEN_DELTA=true',
      'CROSS_META_REFINEMENT_REQUIRED_WHEN_REUSABLE_DELTA=true',
    ],
    consumer: EVOLUTION_GATE,
    consumer_markers: [
      'CROSS_META_LENSES',
      'META_FIXED_POINT_UNPROVEN',
    ],
    reproduction: 'APPLY_META_LENSES_UNTIL_INFORMATIONAL_FIXED_POINT',
  },
  {
    id: 'PROOF_OWNERSHIP_ANTI_CIRCULARITY',
    layer: 'PROOF',
    owner: PROOF_OWNERSHIP,
    markers: [
      '"self_validation_without_independent_counterproof": "UNPROVEN"',
      '"proof_graph_must_be_acyclic": true',
      '"proof_must_end_in_external_anchor": true',
    ],
    reproduction: 'ASSIGN_PROVER_AND_END_PROOF_CHAIN_IN_EXTERNAL_ANCHOR',
  },
  {
    id: 'TEXT_ARTIFACT_PROOF_BOUNDARY',
    layer: 'ARTIFACT',
    owner: METACOGNITION,
    markers: [
      'TEXT_IS_ARTIFACT=true',
      'TEXT_ARTIFACT_CAN_CHANGE_SCAFFOLD=true',
      'TEXT_ARTIFACT_ALONE_CANNOT_PROVE_RUNTIME_EFFECT=true',
    ],
    reproduction: 'TREAT_TEXT_AS_ARTIFACT_WITHOUT_PROMOTING_IT_TO_RUNTIME_PROOF',
  },
  {
    id: 'MEDIATED_EXPOSURE_AND_RESIDUAL_EFFECT',
    layer: 'SAFETY',
    owner: COGNITION,
    markers: [
      'DIRECT_EXPOSURE_CAN_BE_THE_HAZARD=true',
      'SAFE_TO_INSPECT != SAFE_TO_EXECUTE',
      'THREAT_REPURPOSED != TRUSTED',
    ],
    reproduction: 'MEDIATE_RISKY_INPUT_CONTAIN_RESIDUAL_EFFECT_REUSE_ONLY_UNDER_BOUNDS',
  },
  {
    id: 'MULTIMODAL_SENSOR_NOT_TRUTH',
    layer: 'PERCEPTION',
    owner: CONTRACT,
    markers: [
      '"marker": "IMAGE_INPUT_IS_OPERATIONAL"',
      '"image_is_sensor": true',
      '"screenshot_is_current_truth": false',
    ],
    reproduction: 'USE_VISUAL_INPUT_AS_SENSOR_THEN_REMEASURE_LIVE_SOURCE',
  },
  {
    id: 'PAIRED_EXPLANATION_AND_REFERENT_CLARITY',
    layer: 'COMMUNICATION',
    owner: CONTRACT,
    markers: [
      '"paired_explanation_house_standard": true',
      '"chefe_register_required_immediately_after_material_technical_unit": true',
      '"referent_clarity_required": true',
      '"ambiguous_pronoun_reference_is_incomplete": true',
      '"referent_recovery": "REPEAT_THE_NOUN_OR_ENUMERATE_REFERENTS"',
    ],
    reproduction: 'NAME_THE_TECHNICAL_TERM_TRANSLATE_INLINE_AND_REPEAT_THE_NOUN_IF_REFERENCE_COULD_BE_AMBIGUOUS',
  },
  {
    id: 'HUMAN_MACHINE_SAFETY_SEMANTIC_BOUNDARY',
    layer: 'SAFETY',
    owner: RESPONSE_PATTERN,
    markers: [
      'CAPABILITY_INTENT_CONDUCT_EFFECT_SEPARATE=true',
      'CAPABILITY_TO_PRODUCE_EMOTIONAL_EFFECT != INTENT_TO_CAUSE_PSYCHOLOGICAL_HARM',
      'EMOTIONAL_EFFECT_DOES_NOT_AUTHORIZE_HARMFUL_CONDUCT=true',
      'NO_CAPABILITY_INTENT_SUBSTITUTION=true',
      'OMISSION_IS_NOT_CONFESSION=true',
      'OMISSION_IS_NOT_COMPLETE_ANSWER=true',
      'SAFETY_QUESTION_CLOSE_INTENT_BEFORE_CAPABILITY_EXPLANATION=true',
    ],
    reproduction: 'SEPARATE_CAPABILITY_INTENT_CONDUCT_EFFECT_AND_CLOSE_SAFETY_SCOPE_EXPLICITLY',
  },
  {
    id: 'PORTABLE_REPRODUCTION_HEAD_BOUND',
    layer: 'PORTABILITY',
    owner: CONTRACT,
    markers: [
      '"marker": "CENTRALDARK_PORTABLE_KERNEL"',
      '"package_is_cache_not_authority": true',
      '"never_overwrite_newer_live_state": true',
    ],
    consumer: PORTABLE_SCRIPT,
    consumer_markers: [
      "package_id: 'CENTRALDARK_PORTABLE_KERNEL'",
      "source_of_truth: 'LIVE_GIT_STATE'",
    ],
    reproduction: 'REBUILD_FROM_LIVE_HEAD_AND_IMPORT_ONLY_DELTA',
  },
  {
    id: 'DERIVED_GRAPH_FRESHNESS_BOUNDARY',
    layer: 'MEMORY_PROJECTION',
    owner: SOUL,
    markers: [
      'BRAIN_GRAPH_IS_DERIVED_NOT_AUTHORITY=true',
      'BRAIN_GRAPH_FRESHNESS_KEY=GRAPH_FINGERPRINT',
      'STALE_BRAIN_GRAPH_IS_NOT_CURRENT=true',
      'BRAIN_GRAPH_SINGLE_WRITER=scripts/grafo-vivo/obsidian-nota.mjs',
    ],
    reproduction: 'TRUST_LIVE_GRAPH_SOURCE_REGENERATE_DERIVED_BRAIN_PROJECTION_ON_FINGERPRINT_DRIFT',
  },
  {
    id: 'WORK_DISCOVERY_WITHOUT_SELF_AUTHORIZATION',
    layer: 'AUTONOMY',
    owner: ORCHESTRATION,
    markers: [
      'WORK_DISCOVERY_IS_NOT_AUTHORIZATION=true',
      'AUTO_WORK_DISCOVERY_PRODUCER=UNPROVEN',
    ],
    declared_limit: 'AUTO_WORK_DISCOVERY_PRODUCER=UNPROVEN',
    reproduction: 'DISCOVER_CANDIDATES_FROM_STATE_WITHOUT_CONVERTING_DISCOVERY_TO_AUTHORITY',
  },
  {
    id: 'MATERIAL_FIRST_COGNITIVE_CRYSTALLIZATION',
    layer: 'LEARNING',
    owner: 'LEIA-ME-IA.md',
    markers: [
      'MATERIAL_FROM_CHEFE_AUTO_INGEST=true',
      'PROVEN_MATERIAL_AUTO_CRYSTALLIZES_IN_EXISTING_OWNER=true',
      'PRE_RESPONSE_MATERIAL_RECONCILIATION_REQUIRED=true',
      'FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE=true',
    ],
    consumer: 'AGENTS.md',
    consumer_markers: [
      'MATERIAL_FROM_CHEFE_AUTO_INGEST=true',
      'ASK_TO_CRYSTALLIZE_ALREADY_PROVEN_DELTA=false',
      'MATERIAL_COGNITIVE_ROUTE=CHEFE_MATERIAL',
    ],
    reproduction: 'INGEST_CLASSIFY_BIND_EXISTING_OWNER_CRYSTALLIZE_PROVEN_DELTA_AND_REUSE',
  },
];

function verifyCapability(spec) {
  const owner = memberByPath.get(spec.owner);
  if (!owner) fail('CAPABILITY_OWNER_MISSING', { capability: spec.id, owner: spec.owner });

  const missing = spec.markers.filter((marker) => !owner.content.includes(marker));
  if (missing.length) {
    fail('CAPABILITY_MARKER_MISSING', {
      capability: spec.id,
      owner: spec.owner,
      missing,
    });
  }

  let consumerEvidence = null;
  if (spec.consumer) {
    const consumer = memberByPath.get(spec.consumer);
    if (!consumer) fail('CAPABILITY_CONSUMER_MISSING', { capability: spec.id, consumer: spec.consumer });
    const consumerMissing = (spec.consumer_markers ?? []).filter((marker) => !consumer.content.includes(marker));
    if (consumerMissing.length) {
      fail('CAPABILITY_CONSUMER_MARKER_MISSING', {
        capability: spec.id,
        consumer: spec.consumer,
        missing: consumerMissing,
      });
    }
    consumerEvidence = {
      path: consumer.path,
      sha256: consumer.sha256,
      markers: spec.consumer_markers ?? [],
    };
  }

  return {
    id: spec.id,
    layer: spec.layer,
    state: 'SOURCE_VERIFIED_IN_REPO',
    claim_scope: 'SCAFFOLD_AND_CONTRACT',
    runtime_state: 'UNPROVEN_BY_PORTABLE_KERNEL',
    reproduction: spec.reproduction,
    declared_limit: spec.declared_limit ?? null,
    owner: {
      path: owner.path,
      sha256: owner.sha256,
      markers: spec.markers,
    },
    consumer: consumerEvidence,
  };
}

const capabilities = CAPABILITY_SPECS.map(verifyCapability);
const sourceIndex = members.map(({ path, sha256: memberSha256, bytes }) => ({
  path,
  sha256: memberSha256,
  bytes,
}));
const sourceFingerprintSha256 = sha256(canonicalJson(sourceIndex));

const condensedDna = {
  schema_version: 1,
  marker: 'CENTRALDARK_CONDENSED_DNA',
  derived_from: 'LIVE_REPOSITORY_CANONICAL_SOURCES',
  authority: 'SEGREDO/CHEFE',
  identity: {
    coordinator: 'SOL',
    executor: 'HERMES',
    piveteRole: 'RETIRED',
    model: 'REPLACEABLE_ENGINE',
  },
  load_strategy: 'DNA_FIRST_SOURCE_ON_DEMAND',
  axioms: [
    'HUMAN_AUTHORITY_REMAINS_FINAL',
    'MODEL_IS_REPLACEABLE_NOT_IDENTITY',
    'LIVE_STATE_OVERRIDES_STALE_CONTEXT',
    'REUSE_BEFORE_CREATE',
    'PARALLELIZE_PERCEPTION_SERIALIZE_MUTATION',
    'REALITY_AND_DISCRIMINATING_TEST_OVERRULE_MODEL_VOTE',
    'UNKNOWN_IS_NOT_PASS',
    'SOURCE_IS_PROVENANCE_NOT_AUTHORITY',
    'NO_NEW_INFORMATION_NO_CHANGE',
    'RUNTIME_MUST_BE_MEASURED_SEPARATELY',
    'CAPABILITY_INTENT_CONDUCT_EFFECT_ARE_SEPARATE',
    'EVIDENCE_LAYER_DOES_NOT_AUTO_PROMOTE_TO_CAUSALITY',
    'HUMAN_SUPPLIES_GOAL_NOT_RUNBOOK',
    'PREFER_COMPLETE_OPERATION_OVER_MICROCOMMAND_CHAIN',
    'FIXED_HUD_LAYOUT_ONLY_LIVE_VALUES_CHANGE',
    'NUMERIC_METRICS_REQUIRE_PROVEN_DENOMINATOR',
    'LOUD_EXACT_ACTIONABLE_FAILURE',
    'TOOL_ARGUMENT_LIMITS_NORMALIZED_TO_SAFE_CAP',
    'SOURCE_404_IS_SENSOR_MISS_NOT_WORLD_MISS',
    'ALTERNATE_AUTHORIZED_SENSOR_BEFORE_BLOCKER',
    'SAME_HEAD_GREEN_PROMOTES_TO_TOTAL_DEPLOY',
    'TOTAL_DEPLOY_REGENERATES_FROM_PROVEN_MAIN_AND_EXISTING_RUNTIME',
    'PROOF_COUNTERPROOF_ACCEPT_RECONCILE_DETERMINISTIC_CLOSURE',
    'ACCEPT_ONLY_AFTER_COUNTERPROOF_SURVIVAL',
    'COUNTERPROOF_DEFEAT_RECONCILES_BY_DISCARDING_ONLY_DISPROVEN_DELTA',
    'SEALED_CLAIM_NO_REEXECUTE_WITHOUT_NEW_CAUSE',
    'NEW_MATERIAL_CAUSE_REOPENS_SEAL',
    'CROSS_SURFACE_CONTRACT_INHERITANCE',
    'STALE_BRAIN_GRAPH_IS_NOT_CURRENT',
    'DERIVED_GRAPH_REGENERATES_FROM_LIVE_SOURCE',
    'SEMANTIC_CONVERGENCE_ACROSS_SURFACES_IS_EXPECTED_SUCCESS',
    'TOOL_CATALOG_VISIBLE_IS_NOT_TOOL_CALL_SUCCESS',
    'EXECUTOR_ATTRIBUTION_REQUIRES_OBSERVED_EXECUTOR',
    'AUTO_RESUME_AFTER_HUMAN_FRONTIER',
  ],
  operational_flow: contract.standard_architecture.flow,
  meta_flow: [
    'META_EXPANSAO_DE_DOMINIO',
    'META_MINERACAO',
    'META_MENOS_E_MAIS',
    'META_LUPA',
    'META_INSTINTO_SUPERIOR',
    'META_METACOGNICAO_OPERACIONAL',
    'CROSS_META_COUNTERPROOF',
    'FIXED_POINT',
  ],
  minimum_reproduction: [
    'VERIFY_HEAD_AND_SOURCE_FINGERPRINT',
    'LOAD_CONDENSED_DNA',
    'LOAD_OWNER_SOURCE_ON_DEMAND',
    'MEASURE_RUNTIME_TOOLS_AND_STATE',
    'RECONCILE_BEFORE_CREATE',
    'EXECUTE_MINIMAL_CAUSAL_DELTA_WITH_ONE_WRITER',
    'VERIFY_CLAIM_ON_SAME_TARGET',
    'ABSORB_REUSABLE_DELTA_OR_NO_CHANGE',
  ],
  capabilities,
  proof_boundary: {
    proves: [
      'SOURCE_FILES_PRESENT',
      'REQUIRED_MARKERS_PRESENT',
      'SOURCE_HASHES_BOUND_TO_EXPORT',
      'CONDENSED_DNA_DERIVED_FROM_SAME_SOURCE_SET',
    ],
    does_not_prove: [
      'RUNTIME_EFFECT',
      'DEPLOY',
      'TOOL_AVAILABILITY',
      'EXTERNAL_PROVIDER_STATE',
      'OPEN_PR_CANDIDATE_CAPABILITY',
      'AGI_OR_CONSCIOUSNESS',
    ],
  },
};

const capabilityDnaSha256 = sha256(canonicalJson(condensedDna));
const condensedDnaBytes = Buffer.byteLength(canonicalJson(condensedDna));
const sourceBytes = members.reduce((total, item) => total + item.bytes, 0);

let head = '';
let branch = '';
let dirty = '';
try {
  head = git(['rev-parse', 'HEAD']);
  branch = git(['branch', '--show-current']) || 'DETACHED';
  dirty = git(['status', '--porcelain']);
} catch (error) {
  fail('GIT_STATE_UNAVAILABLE', { error: String(error?.message || error) });
}

if (!/^[0-9a-f]{40}$/i.test(head)) fail('HEAD_INVALID', { head });

const packageObject = {
  schema_version: 2,
  package_id: 'CENTRALDARK_PORTABLE_KERNEL',
  repository: 'ServerVpss/CentralDark',
  source_of_truth: 'LIVE_GIT_STATE',
  head_sha: head,
  branch,
  dirty: Boolean(dirty),
  rule: 'MENOR_MOVIMENTO_EFICAZ',
  canonical_entrypoint: 'LEIA-ME-IA.md',
  package_is_cache_not_authority: true,
  stale_package_action: 'REBUILD_FROM_LIVE_REPOSITORY',
  import_rule: 'DELTA_ONLY_AFTER_LIVE_REMEASURE_WRITER_SCOPE_AND_INDEPENDENT_JUDGE',
  load_strategy: condensedDna.load_strategy,
  capability_dna_sha256: capabilityDnaSha256,
  source_fingerprint_sha256: sourceFingerprintSha256,
  condensed_dna: condensedDna,
  members,
};

const canonicalPayload = canonicalJson(packageObject);
const packageSha256 = sha256(canonicalPayload);
const receipt = {
  ok: true,
  status: 'PASS',
  mode: COMPACT ? 'COMPACT' : 'FULL',
  package_id: packageObject.package_id,
  head_sha: head,
  branch,
  dirty: Boolean(dirty),
  members: members.length,
  capabilities: capabilities.length,
  source_bytes: sourceBytes,
  condensed_dna_bytes: condensedDnaBytes,
  condensed_dna: condensedDna,
  capability_dna_sha256: capabilityDnaSha256,
  source_fingerprint_sha256: sourceFingerprintSha256,
  package_sha256: packageSha256,
  export_path: EXPORT_PATH || null,
  image_sensor_policy: 'PASS',
  portable_boot_policy: 'PASS',
  semantic_safety_boundary: 'PASS',
  evidence_causality_ontology: 'PASS',
  runtime_claim: 'UNPROVEN_BY_PORTABLE_KERNEL',
};

if (EXPORT_PATH) {
  const exported = COMPACT
    ? {
        schema_version: 1,
        package_id: 'CENTRALDARK_PORTABLE_KERNEL_COMPACT',
        repository: packageObject.repository,
        source_of_truth: packageObject.source_of_truth,
        head_sha: head,
        branch,
        dirty: Boolean(dirty),
        package_is_cache_not_authority: true,
        stale_package_action: packageObject.stale_package_action,
        import_rule: packageObject.import_rule,
        load_strategy: condensedDna.load_strategy,
        capability_dna_sha256: capabilityDnaSha256,
        source_fingerprint_sha256: sourceFingerprintSha256,
        condensed_dna: condensedDna,
        sources: sourceIndex,
      }
    : {
        ...packageObject,
        package_sha256: packageSha256,
      };
  writeFileSync(resolve(ROOT, EXPORT_PATH), `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
}

if (JSON_ONLY || EXPORT_PATH) {
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} else {
  process.stdout.write([
    'CENTRALDARK_PORTABLE_KERNEL=PASS',
    `MODE=${COMPACT ? 'COMPACT' : 'FULL'}`,
    `HEAD_SHA=${head}`,
    `BRANCH=${branch}`,
    `DIRTY=${Boolean(dirty) ? '1' : '0'}`,
    `MEMBERS=${members.length}`,
    `CAPABILITIES=${capabilities.length}`,
    `SOURCE_BYTES=${sourceBytes}`,
    `CONDENSED_DNA_BYTES=${condensedDnaBytes}`,
    `CAPABILITY_DNA_SHA256=${capabilityDnaSha256}`,
    `SOURCE_FINGERPRINT_SHA256=${sourceFingerprintSha256}`,
    `PACKAGE_SHA256=${packageSha256}`,
    'LOAD_STRATEGY=DNA_FIRST_SOURCE_ON_DEMAND',
    'RUNTIME_CLAIM=UNPROVEN_BY_PORTABLE_KERNEL',
    'IMAGE_INPUT_IS_OPERATIONAL=PASS',
    'SCREENSHOT_CURRENT_TRUTH=0',
    'SCREENSHOT_TRIGGERS_LIVE_REMEASURE=1',
    'SEMANTIC_SAFETY_BOUNDARY=PASS',
    'EVIDENCE_CAUSALITY_ONTOLOGY=PASS',
    'STALE_PACKAGE_ACTION=REBUILD_FROM_LIVE_REPOSITORY',
  ].join('\n') + '\n');
}
