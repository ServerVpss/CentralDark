#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, posix, resolve } from "node:path";

const argv = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const ROOT = resolve(valueAfter("--repo-root", process.cwd()));
const JSON_OUT = argv.includes("--json");
const PORTA = "LEIA-ME-IA.md";
const PORTA_VIVA = "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md";
const BOOT = "CENTRALDARK_AI_BOOT.yaml";
const CONTRATO_DELTA = "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md";
const CONTRATO_RECONCILIACAO = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const ESTRUTURA_VPS = "docs/CONSCIENCIA/04-ESTRUTURA-VPS.md";
const RECONCILIATION_SCHEMA_VERSION = 7;
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
const GRILL_ME = ".agents/skills/grill-me/SKILL.md";
const META_GRILL = ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/KIT.md";
const OPERATIONAL_METHOD = ".agents/skills/centraldark-operational-method/SKILL.md";
const PERCEPTION_ORCHESTRA = "apps/modulos/HERMES-CORE/core/perception-orchestra.mjs";
const BASE_SHA = valueAfter("--base-sha", process.env.BASE_SHA || "");
const HEAD_SHA = valueAfter("--head-sha", process.env.HEAD_SHA || process.env.GITHUB_SHA || "");

const ADAPTADORES = [
  "AGENTS.md",
  "CHATGPT.md",
  "CODEX.md",
  "CLAUDE.md",
  "README.md",
  ".claude/rules/00-centraldark-boot-universal.md",
  ".github/copilot-instructions.md",
  "GEMINI.md",
  ".cursor/rules/centraldark-governanca.mdc",
  ".windsurfrules",
];

const ENTRADAS = [PORTA, ...ADAPTADORES];
const GERADOS = [
  /^docs\/RELATORIOS\//,
  /^apps\/modulos\/status\//,
  /^docs\/ESTADO-DA-RETOMADA\.md$/,
];

const BOUNDARY_ENFORCED_FILES = [
  "scripts/checker/_lib.sh",
  "scripts/checker/01-estrutura.sh",
  "scripts/checker/02-logs.sh",
  "scripts/checker/03-github-deploy.sh",
  "scripts/checker/04-pm2.sh",
  "scripts/checker/05-telegram-bot.sh",
  "scripts/checker/06-supabase-sync.sh",
  "scripts/checker/07-whatsapp-wuzapi.sh",
  "scripts/checker/08-chat-ao-vivo.sh",
  "scripts/checker/09-caddy.sh",
  "scripts/checker/10-crm.sh",
  "scripts/checker/11-seguranca.sh",
  "scripts/checker/12-wildcard-dns.sh",
  "scripts/checker/run-all.sh",
  "scripts/clone-deck-gh-pull-with-deploy.sh",
  "scripts/webhook/deploy-job.sh",
];


const CANONICAL_DEPLOY_GATE = "scripts/vps/deploy-guards-dispatcher.sh";
const DEPLOY_GATE_ENFORCED_FILES = [
  ".github/workflows/vps-exec-selfhosted.yml",
  "scripts/vps/deploy-operational-guards.sh",
  "scripts/vps-deploy.sh",
  "scripts/webhook/deploy-job.sh",
  "scripts/clone-deck-gh-pull-with-deploy.sh",
  "scripts/webhook/telepainel-deploy.mjs",
  "scripts/remote-bridge/canonical/CENTRALDARK-VPS-UPDATE.ps1",
  "apps/modulos/hub/scripts/deploy-abacus-router.sh",
  "apps/modulos/hub/scripts/deploy-hermes-coletivo.sh",
];
const existe = (relativePath) => existsSync(join(ROOT, relativePath));
const ler = (relativePath) => {
  try {
    return readFileSync(join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
};
const ehGerado = (relativePath) => GERADOS.some((pattern) => pattern.test(relativePath));

function lerJson(relativePath) {
  try {
    return JSON.parse(ler(relativePath));
  } catch {
    return null;
  }
}

function git(args) {
  return execFileSync("git", ["-C", ROOT, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitCommitExiste(sha) {
  try {
    git(["rev-parse", "--verify", `${sha}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function shaValido(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ""));
}

function isNullOid(value) {
  return /^0{40}$/.test(String(value || "").trim());
}

function caminhosCitados(texto) {
  const encontrados = new Set();
  const padroes = [
    /\[[^\]]*\]\(([^)\s#]+)\)/g,
    /`([^`\n]+\.(?:md|mdc|mjs|js|json|py|sh|ps1|yml|yaml))`/g,
    /(?:^|[\s(>])((?:docs|scripts|apps|infra|conexao-ia|\.agents|\.github|\.claude|\.cursor)\/[^\s`)"',;]+)/gm,
  ];

  for (const pattern of padroes) {
    let match;
    while ((match = pattern.exec(texto)) !== null) {
      let candidate = match[1].trim().replace(/^\.\//, "").replace(/[.,;:]+$/, "");
      if (!candidate || candidate.startsWith("http") || candidate.startsWith("#")) continue;
      if (!candidate.includes("/") && !ENTRADAS.includes(candidate)) continue;
      candidate = posix.normalize(candidate);
      if (candidate.startsWith("../") || candidate.startsWith("/")) continue;
      encontrados.add(candidate);
    }
  }

  return [...encontrados];
}

function canonicos() {
  const output = [];
  const walk = (directory) => {
    let entries = [];
    try {
      entries = readdirSync(join(ROOT, directory), { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const relativePath = posix.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!/^(?:node_modules|\.git)$/.test(entry.name)) walk(relativePath);
        continue;
      }
      if (!entry.name.endsWith(".md") || ehGerado(relativePath)) continue;
      if (/^status:\s*"?CAN[OÔ]NICO"?/im.test(ler(relativePath).slice(0, 700))) output.push(relativePath);
    }
  };

  walk("docs");
  walk(".agents");
  return output;
}

const errors = [];
const warnings = [];

if (!existe(PORTA)) errors.push(`PORTA_AUSENTE:${PORTA}`);
if (!existe(PORTA_VIVA)) errors.push(`PORTA_VIVA_AUSENTE:${PORTA_VIVA}`);
if (!existe(BOOT)) errors.push(`BOOT_AUSENTE:${BOOT}`);
if (!existe(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!existe(CONTRATO_RECONCILIACAO)) errors.push(`CONTRATO_RECONCILIACAO_AUSENTE:${CONTRATO_RECONCILIACAO}`);
if (!existe(ESTRUTURA_VPS)) errors.push(`ESTRUTURA_VPS_AUSENTE:${ESTRUTURA_VPS}`);
if (!existe(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);
if (!existe(GRILL_ME)) errors.push(`GRILL_ME_AUSENTE:${GRILL_ME}`);
if (!existe(META_GRILL)) errors.push(`META_GRILL_AUSENTE:${META_GRILL}`);
if (!existe(OPERATIONAL_METHOD)) errors.push(`OPERATIONAL_METHOD_AUSENTE:${OPERATIONAL_METHOD}`);
if (!existe(PERCEPTION_ORCHESTRA)) errors.push(`PERCEPTION_ORCHESTRA_AUSENTE:${PERCEPTION_ORCHESTRA}`);

for (const adapter of ADAPTADORES) {
  if (!existe(adapter)) {
    errors.push(`ADAPTADOR_AUSENTE:${adapter}`);
    continue;
  }

  const content = ler(adapter);
  for (const token of [PORTA, CONTRATO_DELTA, "CENTRALDARK_AI_BOOT", ".agents/skills/meta-lupa/SKILL.md", IDENTIDADE_LUPA]) {
    if (!content.includes(token)) errors.push(`ADAPTADOR_SEM_TOKEN:${adapter}:${token}`);
  }
  if (/SKILL_COMMIT_SHA\s*:/i.test(content)) errors.push(`ADAPTADOR_COM_SHA_COPIADO:${adapter}`);
}

const semanticRequirements = new Map([
  [BOOT, [
    "CENTRALDARK_TLC23_PDF_BOOT_GATE_REQUIRED",
    'position: "BEFORE_FIRST_AGENT_ROUTING"',
    'logical_reference: "tlc23.pdf"',
    'measured_house_receipt: "PDF-CC2003-HORN-GATE-20260912-152444.log"',
    "LOAD_TLC23_PDF_GATE",
    "LOAD_HERMES_TRISMEGISTUS_CONTEXT",
    "LOAD_GLOBAL_CONTRACT_ENFORCER",
    "LOAD_UNIVERSAL_GATE_REGISTRY",
    "LOAD_DELTA_CONTINUO_GLOBAL",
    "LOAD_ROOT_CHILD_CONTRACT_LINEAGE",
    "LOAD_POMBO64_TRACE_CONTRACT",
    "LOAD_PRE_MUTATION_INTERVIEW_GATE",
    "LOAD_FAIL_FAST_BLOCK_GATE",
    "LOAD_LOCAL_HOUSE_SENSOR_CONTRACT",
    "ALLOW_FIRST_AGENT_ROUTING",
    "TLC23_PDF_GATE",
    "HERMES_TRISMEGISTUS_CONTEXT_GATE",
    "GLOBAL_CONTRACT_BOOTSTRAP_GATE",
    "pdf_is_runtime_authority: false",
    "reality_is_judge: true",
    'failure_policy: "FAIL_CLOSED"',
    "preserve_existing_good: true",
    'gate_id: "HERMES_TRISMEGISTUS_CONTEXT_GATE"',
    'role: "CONTEXT_PROVENANCE_INTERPRETATION_GUARD"',
    'canonical_display_family: "HERMES TRISMEGISTUS"',
    'technical_paths_renamed: false',
    'judge: "REALIDADE"',
  ]],
  [GRILL_ME, [
    "disable-model-invocation: true",
    'Call the Skill tool with "grilling".',
  ]],
  [META_GRILL, [
    "OWNER CANÔNICO:",
    "META-GRILL acha a ferida",
    "KIT_IS_SEMANTIC_HOOK=true",
    "CHANGE_REQUIRES_SEGREDO_CHEFE=true",
  ]],
  [OPERATIONAL_METHOD, [
    "Leitores investigam em paralelo",
    "Um Writer por escopo mutavel",
    "Gate de falsificação (MetaLupa)",
  ]],
  [PERCEPTION_ORCHESTRA, [
    "A_LOGIC",
    "B_IMPLEMENTATION",
    "C_REGRESSION_FALSE_GREEN",
    "D_SIMPLIFICATION",
    "PARALLEL_PERCEPTION_SERIAL_MUTATION",
    "mutation_allowed: false",
    "writer_required_for_mutation: true",
    "reality_is_judge: true",
  ]],
  [PORTA, [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "context_reconciliation: LOADED",
  ]],
  ["AGENTS.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "tarefa simples não vira swarm",
    "HERMES_TRISMEGISTUS_CONTEXT_GATE_REQUIRED=true",
    "HERMES_TRISMEGISTUS_IS_SEMANTIC_IDENTITY_NOT_NEW_AUTHORITY=true",
    "GLOBAL_SECRET_REUSE_REQUIRED=SIM",
    "REPOSITORY_SECRETS_POLICY=REUSE_ALL_EXISTING_AND_FUTURE",
  ]],
  [PORTA_VIVA, [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "PROGRAM_ONLY",
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "Fluxo proporcional ao risco",
  ]],
  [CONTRATO_DELTA, [
    "STANDARD_ARCHITECTURE=ONE_CORE_MANY_ARMS",
    "N_PERCEPCOES=true",
    "PARALLEL_MUTATION_SAME_SCOPE=BLOCKED",
    "SEM_DELTA_MATERIAL → NO_CHANGE",
    "PROJECAO_VISUAL != FONTE_DA_VERDADE",
  ]],
  [".claude/rules/00-centraldark-boot-universal.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
  ]],
  ["CHATGPT.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
  ]],
  [ESTRUTURA_VPS, [
    "CENTRALDARK_ROOT_ONLY_REQUIRED=SIM",
    "WORKFLOW_REUSE_REQUIRED=SIM",
    "AI_DETERMINISTIC_FALLBACK_REQUIRED=SIM",
    "/root/Multizap/apps/clone-deck=OUT_OF_SCOPE",
  ]],
]);

for (const [source, tokens] of semanticRequirements) {
  const content = ler(source);
  for (const token of tokens) {
    if (!content.includes(token)) errors.push(`RECONCILIACAO_SEM_TOKEN:${source}:${token}`);
  }
}

const bootContent = ler(BOOT);
const pdfGateIndex = bootContent.indexOf("initial_bootstrap_gate:");
const routingIndex = bootContent.indexOf("unified_entry_pipeline:");
if (pdfGateIndex < 0) errors.push("BOOT_TLC23_PDF_GATE_AUSENTE");
if (routingIndex < 0) errors.push("BOOT_UNIFIED_ENTRY_PIPELINE_AUSENTE");
if (pdfGateIndex >= 0 && routingIndex >= 0 && pdfGateIndex > routingIndex) {
  errors.push("BOOT_TLC23_PDF_GATE_DEPOIS_DO_ROTEAMENTO");
}

const firstAgentRoutingIndex = bootContent.indexOf('      - "ALLOW_FIRST_AGENT_ROUTING"');
const requiredPreRouting = [
  "LOAD_TLC23_PDF_GATE",
  "LOAD_GLOBAL_CONTRACT_ENFORCER",
  "LOAD_UNIVERSAL_GATE_REGISTRY",
  "LOAD_DELTA_CONTINUO_GLOBAL",
  "LOAD_ROOT_CHILD_CONTRACT_LINEAGE",
  "LOAD_POMBO64_TRACE_CONTRACT",
  "LOAD_PRE_MUTATION_INTERVIEW_GATE",
  "LOAD_FAIL_FAST_BLOCK_GATE",
  "LOAD_LOCAL_HOUSE_SENSOR_CONTRACT",
];
let previousGateIndex = -1;
for (const token of requiredPreRouting) {
  const index = bootContent.indexOf(`      - "${token}"`);
  if (index < 0) {
    errors.push(`BOOT_GATE_PRE_ROUTING_AUSENTE:${token}`);
    continue;
  }
  if (firstAgentRoutingIndex >= 0 && index > firstAgentRoutingIndex) {
    errors.push(`BOOT_GATE_DEPOIS_DO_PRIMEIRO_ROTEAMENTO:${token}`);
  }
  if (previousGateIndex >= 0 && index <= previousGateIndex) {
    errors.push(`BOOT_GATE_ORDEM_INVALIDA:${token}`);
  }
  previousGateIndex = index;
}

const agentsContent = ler("AGENTS.md");
if (/META_LUPA_BOOT_REQUIRED\s*:\s*SIM/i.test(agentsContent)) {
  errors.push("CONTRADICAO_COMPLEXIDADE:AGENTS_META_LUPA_PARA_TODA_TAREFA");
}
if (/Antes de alterar qualquer arquivo[\s\S]{0,220}BEGIN\+FINAL/i.test(agentsContent)) {
  errors.push("CONTRADICAO_COMPLEXIDADE:AGENTS_LEDGER_PARA_TODA_TAREFA");
}
if (/## Fluxo único dos agentes/i.test(ler(PORTA_VIVA))) {
  errors.push("CONTRADICAO_COMPLEXIDADE:PORTA_FLUXO_CRITICO_DECLARADO_UNICO");
}

const contract = lerJson(CONTRATO_RECONCILIACAO);
if (!contract) {
  errors.push(`CONTRATO_RECONCILIACAO_JSON_INVALIDO:${CONTRATO_RECONCILIACAO}`);
} else {
  if (contract.schema_version !== RECONCILIATION_SCHEMA_VERSION) {
    errors.push(`CONTRATO_RECONCILIACAO_SCHEMA_INVALIDO:esperado=${RECONCILIATION_SCHEMA_VERSION}:observado=${contract.schema_version}`);
  }
  if (contract.status !== "CANONICAL") errors.push("CONTRATO_RECONCILIACAO_NAO_CANONICO");
  if (contract.marker !== "REUSE_BEFORE_CREATE_REQUIRED") errors.push("CONTRATO_RECONCILIACAO_MARKER_INVALIDO");

  const secretReuse = contract.global_secret_reuse_contract ?? {};
  if (secretReuse.marker !== "CENTRALDARK_GLOBAL_SECRET_REUSE") errors.push("CONTRATO_SECRET_REUSE_MARKER_AUSENTE");
  if (secretReuse.status !== "CANONICAL") errors.push("CONTRATO_SECRET_REUSE_NAO_CANONICO");
  if (secretReuse.canonical_vault !== "/root/CentralDark/secrets") errors.push("CONTRATO_SECRET_VAULT_CANONICO_INVALIDO");
  if (secretReuse.repository_secrets !== "REUSE_ALL_EXISTING_AND_FUTURE") errors.push("CONTRATO_REPOSITORY_SECRETS_REUSE_AUSENTE");
  if (secretReuse.secret_values_in_git !== "FORBIDDEN") errors.push("CONTRATO_SECRET_VALUE_IN_GIT_PERMITIDO");
  if (secretReuse.create_new_secret_only_if !== "NO_EQUIVALENT_AFTER_MEASURE") errors.push("CONTRATO_SECRET_CREATE_SEM_REUSE_GATE");

  const gateRegistry = contract.universal_gate_registry ?? {};
  if (gateRegistry.marker !== "CENTRALDARK_UNIVERSAL_GATE_REGISTRY") errors.push("CONTRATO_GATE_REGISTRY_MARKER_AUSENTE");
  if (gateRegistry.status !== "CANONICAL") errors.push("CONTRATO_GATE_REGISTRY_NAO_CANONICO");
  if (gateRegistry.hard_gate_id_must_be_registered_before_enforcement !== true) errors.push("CONTRATO_GATE_NAO_EXIGE_REGISTRO");
  if (gateRegistry.gate_enforcement_without_contract_declaration !== "FORBIDDEN") errors.push("CONTRATO_GATE_FANTASMA_PERMITIDO");

  const declaredGateIds = new Set(Object.keys(gateRegistry.gates ?? {}));
  if (gateRegistry.boot_required_gate_ids_must_be_subset_of_registry !== true) errors.push("CONTRATO_GATE_BOOT_SUBSET_NAO_OBRIGATORIO");
  if (gateRegistry.formal_gate_without_registry_entry !== "FAIL_CLOSED") errors.push("CONTRATO_GATE_FORMAL_SEM_FAIL_CLOSED");

  const formalBootGateIds = new Set();
  const requiredGateSection = bootContent.match(/required_gate_ids:\s*\n([\s\S]*?)\n\s*required_sequence:/);
  if (requiredGateSection) {
    for (const match of requiredGateSection[1].matchAll(/^\s*-\s*"([A-Z0-9_]+)"\s*$/gm)) formalBootGateIds.add(match[1]);
  } else {
    errors.push("BOOT_REQUIRED_GATE_IDS_AUSENTE");
  }
  for (const match of bootContent.matchAll(/^\s*gate_id:\s*"([A-Z0-9_]+)"\s*$/gm)) formalBootGateIds.add(match[1]);
  for (const gateId of formalBootGateIds) {
    if (!declaredGateIds.has(gateId)) errors.push(`BOOT_FORMAL_GATE_NAO_REGISTRADO:${gateId}`);
  }
  for (const gateId of [
    "TLC23_PDF_BOOT_GATE",
    "HERMES_TRISMEGISTUS_CONTEXT_GATE",
    "GLOBAL_CONTRACT_BOOTSTRAP_GATE",
    "DELTA_CONTINUO_GLOBAL_GATE",
    "ROOT_CHILD_CONTRACT_LINEAGE_GATE",
    "POMBO64_TRACE_GATE",
    "PRE_MUTATION_INTERVIEW_GATE",
    "FAIL_FAST_BLOCK_GATE",
    "LOCAL_HOUSE_SENSOR_GATE",
    "ONE_WRITER_PER_SCOPE_GATE",
    "SAME_HEAD_CI_GATE",
    "RUNTIME_PROOF_GATE",
  ]) {
    if (!declaredGateIds.has(gateId)) errors.push(`CONTRATO_GATE_NAO_DECLARADO:${gateId}`);
  }

  const interviewGate = contract.pre_mutation_interview_gate ?? {};
  if (interviewGate.marker !== "CENTRALDARK_GRILL_META_INTERVIEW_GATE") errors.push("CONTRATO_INTERVIEW_GATE_MARKER_AUSENTE");
  if (interviewGate.grill_hook !== GRILL_ME) errors.push("CONTRATO_INTERVIEW_GRILL_OWNER_INVALIDO");
  if (interviewGate.meta_grill_owner !== META_GRILL) errors.push("CONTRATO_INTERVIEW_METAGRILL_OWNER_INVALIDO");
  if (interviewGate.operational_method_owner !== OPERATIONAL_METHOD) errors.push("CONTRATO_INTERVIEW_METHOD_OWNER_INVALIDO");
  if (interviewGate.parallel_perception_runtime !== PERCEPTION_ORCHESTRA) errors.push("CONTRATO_INTERVIEW_RUNTIME_INVALIDO");
  if (interviewGate.external_grilling_skill_is_hard_dependency !== false) errors.push("CONTRATO_INTERVIEW_EXTERNAL_SPOF");
  const interviewRoles = interviewGate.parallel_interviews?.roles ?? [];
  for (const role of ["A_LOGIC","B_IMPLEMENTATION","C_REGRESSION_FALSE_GREEN","D_SIMPLIFICATION"]) {
    if (!interviewRoles.includes(role)) errors.push(`CONTRATO_INTERVIEW_ROLE_AUSENTE:${role}`);
  }
  if (interviewGate.parallel_interviews?.all_four_required_for_writer_readiness !== true) errors.push("CONTRATO_INTERVIEW_QUATRO_FRENTES_NAO_OBRIGATORIAS");
  if (interviewGate.parallel_interviews?.ready_for_writer_required !== true) errors.push("CONTRATO_INTERVIEW_WRITER_SEM_READY");
  if (interviewGate.mutation_rule !== "ONE_WRITER_PER_SCOPE") errors.push("CONTRATO_INTERVIEW_WRITER_RULE_INVALIDA");

  const failFast = contract.fail_fast_block_contract ?? {};
  if (failFast.marker !== "CENTRALDARK_FAIL_FAST_BLOCK_REQUIRED") errors.push("CONTRATO_FAIL_FAST_MARKER_AUSENTE");
  if (failFast.on_any_material_failure !== "ABORT_CURRENT_BLOCK") errors.push("CONTRATO_FAIL_FAST_NAO_ABORTA");
  if (failFast.continue_later_mutating_step_after_material_failure !== false) errors.push("CONTRATO_FAIL_FAST_PERMITE_CONTINUAR");
  if (failFast.fixed_point_true_after_material_failure !== "FORBIDDEN") errors.push("CONTRATO_FAIL_FAST_PERMITE_FALSO_FIXED_POINT");
  if (failFast.fixed_point_requires_all_applicable_steps_measured_and_passed !== true) errors.push("CONTRATO_FIXED_POINT_SEM_DENOMINADOR_COMPLETO");
  if (failFast.empty_required_sensor_value !== "INVALID_NOT_SUCCESS") errors.push("CONTRATO_SENSOR_VAZIO_VIRA_SUCESSO");

  const houseSensor = contract.local_house_sensor_contract ?? {};
  if (houseSensor.marker !== "CENTRALDARK_LOCAL_HOUSE_SENSOR_DISCOVERY_REQUIRED") errors.push("CONTRATO_CASA_SENSOR_MARKER_AUSENTE");
  if (houseSensor.sensors?.CASA_LOCAL !== "DISCOVER_AT_RUNTIME_DO_NOT_ASSUME_PATH") errors.push("CONTRATO_CASA_CAMINHO_PRESUMIDO");
  if (houseSensor.path_not_found !== "UNKNOWN_OR_BLOCKED") errors.push("CONTRATO_CASA_PATH_MISSING_FALSO_VERDE");
  if (houseSensor.empty_path_value !== "INVALID_SENSOR") errors.push("CONTRATO_CASA_PATH_VAZIO_VALIDO");
  if (houseSensor.vps_dirty_blocks_blind_pull_reset_or_clean !== true) errors.push("CONTRATO_VPS_DIRTY_SEM_PROTECAO");

  const requiredSequence = [
    "resolve_user_intent",
    "recover_relevant_context",
    "measure_github_and_vps_in_parallel_when_operational",
    "reconcile_cross_surface_state",
    "search_existing_capabilities",
    "open_primary_implementation_files",
    "cross_reference_capabilities_with_request",
    "classify_authority_and_runtime_state",
    "measure_available_tools",
    "normalize_evidence_scope_time_and_provenance",
    "arbitrate_conflict_by_discriminating_test_if_needed",
    "reuse_or_extend_before_create",
    "identify_existing_owner_and_writer_scope",
    "run_pre_mutation_interview_gate_when_material",
    "preflight_minimal_patch",
    "counterproof_before_promotion",
    "causal_micro_deploy_when_applicable",
    "remeasure_github_and_vps_in_parallel",
    "register_receipt_and_update_fixed_hud",
  ];
  const sequence = contract.mandatory_pre_solution_sequence;
  if (!Array.isArray(sequence)) {
    errors.push("CONTRATO_RECONCILIACAO_SEQUENCIA_AUSENTE");
  } else {
    for (const step of requiredSequence) {
      if (!sequence.includes(step)) errors.push(`CONTRATO_RECONCILIACAO_ETAPA_AUSENTE:${step}`);
    }
  }

  const universal = contract.universal_operational_contract ?? {};
  if (universal.marker !== "CENTRALDARK_UNIVERSAL_OPERATIONAL_CONTRACT_REQUIRED") errors.push("CONTRATO_UNIVERSAL_MARKER_AUSENTE");
  if (universal.status !== "MANDATORY") errors.push("CONTRATO_UNIVERSAL_NAO_OBRIGATORIO");
  if (universal.inheritance_required !== true) errors.push("CONTRATO_UNIVERSAL_SEM_HERANCA");

  const parallel = universal.parallel_measurement ?? {};
  if (!Array.isArray(parallel.required_sources) || !parallel.required_sources.includes("GITHUB") || !parallel.required_sources.includes("VPS")) errors.push("CONTRATO_UNIVERSAL_SEM_GITHUB_VPS");
  if (parallel.mode !== "PARALLEL_READ_ONLY_T0_AND_T1") errors.push("CONTRATO_UNIVERSAL_MEDICAO_NAO_PARALELA");
  if (parallel.rendezvous_before_mutation !== true) errors.push("CONTRATO_UNIVERSAL_SEM_RENDEZVOUS");
  if (parallel.cross_surface_drift_must_be_explicit !== true) errors.push("CONTRATO_UNIVERSAL_DRIFT_OCULTO");

  const requiredUniversalCycle = [
    "RECOVER_RELEVANT_CONTEXT",
    "MEASURE_GITHUB_AND_VPS_IN_PARALLEL_T0",
    "RECONCILE_CROSS_SURFACE_STATE",
    "COORDINATE_CONVERGENCE",
    "ANALYZE_ACTIVE_PRS_AND_COMPARE_BRANCHES",
    "REGISTER_CONVERGENCE_IN_PRINCIPAL_PR",
    "VALIDATE_GLOBAL_DNA",
    "VALIDATE_BUILDKITE_FUNNEL_END_TO_END_WHEN_MATERIAL",
    "INVESTIGATE_FAILED_JOB_AND_DOCUMENT_RECONCILIATION_PLAN",
    "FIND_EXISTING_OWNER",
    "ACQUIRE_ONE_WRITER_SCOPE",
    "META_LUPA",
    "MINIMAL_CAUSAL_PATCH",
    "PREFLIGHT",
    "COUNTERPROOF",
    "CAUSAL_MICRO_DEPLOY_IF_APPLICABLE",
    "MEASURE_GITHUB_AND_VPS_IN_PARALLEL_T1",
    "MEASURE_CROSS_SURFACE_DRIFT",
    "PROTECT_DIRTY_RUNTIME_ROOT",
    "RECONCILE_DIVERGED_BRANCH_NO_FORCE_IN_ISOLATED_WORKTREE",
    "RUN_SAME_HEAD_CI",
    "PROMOTE_CANONICALLY",
    "REMEASURE_PROMOTED_SHA_ON_GITHUB_AND_VPS",
    "RUNTIME_PROOF",
    "REGISTER_RECEIPT",
    "UPDATE_FIXED_HUD_WITH_LIVE_DATA",
    "CONTINUE_TO_FIXED_POINT_OR_HUMAN_FRONTIER",
  ];
  if (!Array.isArray(universal.canonical_cycle) || requiredUniversalCycle.some((step, index) => universal.canonical_cycle[index] !== step)) errors.push("CONTRATO_UNIVERSAL_CICLO_FORA_DE_ORDEM");

  const convergence = universal.global_convergence_coordination ?? {};
  if (convergence.marker !== "GLOBAL_CONVERGENCE_COORDINATION_REQUIRED") errors.push("CONTRATO_GLOBAL_CONVERGENCIA_MARKER_AUSENTE");
  if (convergence.coordinate_convergence !== true) errors.push("CONTRATO_GLOBAL_CONVERGENCIA_DESATIVADA");
  if (convergence.analyze_active_prs !== true || convergence.compare_active_branches !== true) errors.push("CONTRATO_GLOBAL_PRS_BRANCHES_AUSENTE");
  if (convergence.register_convergence_in_principal_pr !== true) errors.push("CONTRATO_GLOBAL_PRINCIPAL_SEM_RECEIPT");
  if (convergence.principal_pr_is_authority !== false || convergence.principal_pr_is_runtime_proof !== false) errors.push("CONTRATO_GLOBAL_PRINCIPAL_COM_FALSA_AUTORIDADE");
  if (convergence.global_dna_validation?.required !== true) errors.push("CONTRATO_GLOBAL_DNA_NAO_OBRIGATORIO");
  if (convergence.buildkite_funnel?.validate_end_to_end_when_material !== true) errors.push("CONTRATO_GLOBAL_BUILDKITE_FUNIL_AUSENTE");
  if (convergence.buildkite_funnel?.green_requires_end_to_end_evidence !== true) errors.push("CONTRATO_GLOBAL_BUILDKITE_FALSO_VERDE");
  if (convergence.failed_job_reconciliation?.any_failed_job_requires_investigation !== true) errors.push("CONTRATO_GLOBAL_JOB_FALHO_SEM_INVESTIGACAO");
  if (convergence.failed_job_reconciliation?.reconciliation_plan_required !== true) errors.push("CONTRATO_GLOBAL_JOB_FALHO_SEM_PLANO");
  if (convergence.failed_job_reconciliation?.unknown_root_cause_stays_unknown !== true) errors.push("CONTRATO_GLOBAL_JOB_FALHO_INVENTA_CAUSA");

  const crossSurface = universal.cross_surface_convergence ?? {};
  if (crossSurface.marker !== "CROSS_SURFACE_GIT_RUNTIME_CONVERGENCE_REQUIRED") errors.push("CONTRATO_CROSS_SURFACE_MARKER_AUSENTE");
  if (crossSurface.branch_reconciliation?.divergent_pr_requires_update_before_promotion !== true) errors.push("CONTRATO_PR_DIVERGENTE_SEM_UPDATE");
  if (crossSurface.branch_reconciliation?.update_mode !== "NO_FORCE") errors.push("CONTRATO_UPDATE_BRANCH_COM_FORCE");
  if (crossSurface.branch_reconciliation?.isolated_worktree_required_when_root_dirty !== true) errors.push("CONTRATO_ROOT_DIRTY_SEM_WORKTREE_ISOLADO");
  if (crossSurface.branch_reconciliation?.reset_hard_forbidden !== true) errors.push("CONTRATO_RESET_HARD_NAO_BLOQUEADO");
  if (crossSurface.branch_reconciliation?.force_push_forbidden !== true) errors.push("CONTRATO_FORCE_PUSH_NAO_BLOQUEADO");
  if (crossSurface.runtime_root_safety?.delete_or_clean_without_proof !== "FORBIDDEN") errors.push("CONTRATO_DIRTY_ROOT_CLEAN_SEM_PROVA");
  if (crossSurface.transient_channel_failure?.classify_as !== "BLOCKED_TRANSIENT") errors.push("CONTRATO_CHANNEL_TRANSIENT_CLASS_INVALIDA");
  if (crossSurface.transient_channel_failure?.does_not_authorize_false_green !== true) errors.push("CONTRATO_CHANNEL_TRANSIENT_FALSO_VERDE");
  if (crossSurface.ci_semantics?.cancelled !== "NOT_PASS") errors.push("CONTRATO_CI_CANCELLED_VIROU_PASS");
  if (crossSurface.ci_semantics?.same_head_required !== true) errors.push("CONTRATO_CI_SEM_SAME_HEAD");
  if (!Array.isArray(crossSurface.fixed_point_requires) || !crossSurface.fixed_point_requires.includes("GITHUB_AND_VPS_T1_RECONCILED")) errors.push("CONTRATO_FIXED_POINT_SEM_T1_DUAL");

  const micro = universal.micro_deploy ?? {};
  if (micro.policy !== "CANONICAL_WHEN_CAUSALLY_APPLICABLE") errors.push("CONTRATO_UNIVERSAL_MICRO_DEPLOY_AUSENTE");
  if (micro.scope_must_match_causal_scope !== true) errors.push("CONTRATO_UNIVERSAL_MICRO_DEPLOY_SEM_CONE_CAUSAL");
  if (micro.restart_all_by_default !== false) errors.push("CONTRATO_UNIVERSAL_RESTART_ALL_DEFAULT");
  if (micro.full_deploy_by_default !== false) errors.push("CONTRATO_UNIVERSAL_FULL_DEPLOY_DEFAULT");

  const hud = universal.hud ?? {};
  if (hud.layout !== "FIXED" || hud.data !== "LIVE") errors.push("CONTRATO_UNIVERSAL_HUD_INVALIDO");
  if (hud.layout_changes_require_explicit_chefe_authorization !== true) errors.push("CONTRATO_UNIVERSAL_HUD_SEM_CADEADO");

  const deploy = contract.deploy_policy ?? {};
  if (deploy.micro_deploy_policy !== "CANONICAL_WHEN_CAUSALLY_APPLICABLE") errors.push("DEPLOY_POLICY_MICRO_DEPLOY_NAO_CANONICO");
  if (deploy.deploy_scope_must_match_causal_scope !== true) errors.push("DEPLOY_POLICY_CONE_CAUSAL_AUSENTE");
  if (deploy.post_deploy_parallel_remeasure_required !== true) errors.push("DEPLOY_POLICY_SEM_REMEDICAO_GITHUB_VPS");
  if (deploy.runtime_receipt_required !== true) errors.push("DEPLOY_POLICY_SEM_RECEIPT_RUNTIME");

  const requiredReceiptFields = ["GITHUB_T0","VPS_T0","CROSS_SURFACE_DRIFT","PREFLIGHT_RESULT","COUNTERPROOF_RESULT","MICRO_DEPLOY_SCOPE","GITHUB_T1","VPS_T1","RUNTIME_RECEIPT","FIXED_HUD_UPDATE","NEXT_CURSOR","ACTIVE_PRS","BRANCH_COMPARISON","PRINCIPAL_PR","CONVERGENCE_RECEIPT","GLOBAL_DNA_RESULT","BUILDKITE_FUNNEL_RESULT","FAILED_JOB_ID","FAILURE_SIGNATURE","FAILED_JOB_ROOT_CAUSE_STATE","RECONCILIATION_PLAN","CONTRACT_SCOPE_ID","CONTRACT_SCHEMA","CONTRACT_BLOB_SHA","CONTRACT_COMMIT_SHA","OBSERVED_AT_LOCAL","OBSERVED_AT_UTC","TRACE_ID","EVENT_ID","POMBO64_PLUS","HEAD_SHA","ARTIFACT_OR_RESULT_SHA256","DEPENDENCY_FINGERPRINT","CARDS_ON_TABLE_GAPS","EXACT_FAILURE_LOCATION","EXACT_IMPROVEMENT","PM2_HOMES_DISCOVERED","OWNER_PM2_HOME","T0_PID","T1_PID","PID_CHANGED","CADDY_BACKUP","CADDY_VALIDATE","CADDY_RELOAD","ROLLBACK_USED","HUD_STATE_HASH","GLOBAL_GATE_PHASE","GLOBAL_GATE_STATUS","GLOBAL_GATE_TRACE_ID","GITHUB_T0_HEAD","VPS_T0_HEAD","DRIFT_CLASS","OWNER_PROOF","WRITER_SCOPE_PROOF","ROLLBACK_REF","COUNTERPROOF_PLAN_REF","GITHUB_T1_HEAD","VPS_T1_HEAD","COUNTERPROOF_REF","SAME_HEAD_CI_RESULT","RUNTIME_PROOF_RESULT","HUMAN_BOUNDARY_STATE","DELTA_CLASS","DELTA_INFORMATION_GAIN","ROOT_CONTRACT_REF","ROOT_CONTRACT_SCHEMA","ROOT_GOAL_ID","PARENT_CONTRACT_ID","CHILD_CONTRACT_ID","SELF_GOAL_ID","SELF_GOAL_STATUS","GOAL_DONE_CONDITION","GOAL_EVIDENCE_REF","GOAL_COUNTERPROOF_REF","TLC23_PDF_SHA256","TLC23_HORN_GATE_RESULT","HERMES_TRISMEGISTUS_CONTEXT_GATE_RESULT","CHILD_CONTRACT_LINEAGE_RESULT"];
  const receiptFields = contract.internal_receipt_fields ?? [];
  for (const field of requiredReceiptFields) if (!receiptFields.includes(field)) errors.push(`CONTRATO_UNIVERSAL_RECEIPT_CAMPO_AUSENTE:${field}`);

  const wholeHouse = contract.centraldark_global_contract ?? {};
  if (wholeHouse.marker !== "CENTRALDARK_WHOLE_HOUSE_ONE_DIRECTION_REQUIRED") errors.push("CONTRATO_CASA_INTEIRA_MARKER_AUSENTE");
  if (wholeHouse.status !== "MANDATORY_GLOBAL") errors.push("CONTRATO_CASA_INTEIRA_NAO_GLOBAL");
  if (wholeHouse.scope !== "ENTIRE_CENTRALDARK") errors.push("CONTRATO_CASA_INTEIRA_ESCOPO_INVALIDO");
  if (wholeHouse.scope_id !== "canon/centraldark-universal-contract-20260919") errors.push("CONTRATO_CASA_INTEIRA_SCOPE_ID_INVALIDO");
  if (wholeHouse.one_direction !== true || wholeHouse.no_parallel_contract !== true) errors.push("CONTRATO_CASA_INTEIRA_DIRECAO_PARALELA");
  if (wholeHouse.authority?.creator_owner !== "SEGREDO/CHEFE") errors.push("CONTRATO_CASA_INTEIRA_AUTORIDADE_INVALIDA");
  if (wholeHouse.cards_on_table?.missing_piece_must_be_reported !== true) errors.push("CONTRATO_CARTAS_NA_MESA_LACUNA_OCULTA");
  if (wholeHouse.cards_on_table?.exact_failure_location_required !== true) errors.push("CONTRATO_CARTAS_NA_MESA_SEM_LOCAL_FALHA");
  if (wholeHouse.cards_on_table?.exact_improvement_or_next_test_required !== true) errors.push("CONTRATO_CARTAS_NA_MESA_SEM_MELHORIA_EXATA");

  const lineage = wholeHouse.child_contract_lineage ?? {};
  if (lineage.marker !== "CENTRALDARK_ROOT_CHILD_CONTRACT_LINEAGE_REQUIRED") errors.push("CONTRATO_CHILD_LINEAGE_MARKER_AUSENTE");
  if (lineage.status !== "MANDATORY") errors.push("CONTRATO_CHILD_LINEAGE_NAO_OBRIGATORIO");
  if (lineage.architecture !== "ONE_GLOBAL_ROOT_MANY_SCOPED_CHILDREN") errors.push("CONTRATO_CHILD_LINEAGE_ARQUITETURA_INVALIDA");
  if (lineage.root_policy_owner !== "AGENTS.md") errors.push("CONTRATO_CHILD_LINEAGE_ROOT_OWNER_INVALIDO");
  if (lineage.machine_contract_owner !== "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json") errors.push("CONTRATO_CHILD_LINEAGE_MACHINE_OWNER_INVALIDO");
  if (lineage.runtime_enforcer !== "scripts/agent-call.mjs") errors.push("CONTRATO_CHILD_LINEAGE_ENFORCER_INVALIDO");
  if (lineage.creates_new_control_plane !== false || lineage.creates_new_runtime !== false || lineage.creates_new_owner !== false) errors.push("CONTRATO_CHILD_LINEAGE_CRIOU_ARQUITETURA_PARALELA");
  if (lineage.root_goal?.authority !== "SEGREDO/CHEFE" || lineage.root_goal?.mutable_by_runtime !== false) errors.push("CONTRATO_CHILD_LINEAGE_AUTORIDADE_INVALIDA");
  if (lineage.child_contract?.scope_expansion_without_authority !== "BLOCK") errors.push("CONTRATO_CHILD_LINEAGE_SCOPE_EXPANSION_NAO_BLOQUEADA");
  if (lineage.child_contract?.root_goal_change !== "BLOCK") errors.push("CONTRATO_CHILD_LINEAGE_ROOT_GOAL_MUTAVEL");
  if (lineage.child_contract?.duplicate_same_goal_same_evidence !== "BLOCK") errors.push("CONTRATO_CHILD_LINEAGE_DUPLICATA_NAO_BLOQUEADA");
  if (lineage.fixed_point?.fixed_point_is_checkpoint !== true || lineage.fixed_point?.heartbeat_continues_while_runtime_exists !== true) errors.push("CONTRATO_CHILD_LINEAGE_FIXED_POINT_TERMINAL");
  if (lineage.tlc23_horn_gate?.required !== true) errors.push("CONTRATO_CHILD_LINEAGE_TLC23_NAO_OBRIGATORIO");
  if (lineage.tlc23_horn_gate?.pdf_path !== "docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf") errors.push("CONTRATO_CHILD_LINEAGE_TLC23_PATH_INVALIDO");
  if (lineage.tlc23_horn_gate?.pdf_sha256 !== "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1") errors.push("CONTRATO_CHILD_LINEAGE_TLC23_HASH_INVALIDO");



  const artifactMatrix = contract.artifact_evidence_matrix ?? {};
  if (artifactMatrix.marker !== "CENTRALDARK_ARTIFACT_EVIDENCE_MATRIX") errors.push("CONTRATO_ARTIFACT_MATRIX_MARKER_AUSENTE");
  if (artifactMatrix.status !== "ACTIVE") errors.push("CONTRATO_ARTIFACT_MATRIX_INATIVA");
  if (artifactMatrix.owner !== "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json") errors.push("CONTRATO_ARTIFACT_MATRIX_OWNER_INVALIDO");
  if (artifactMatrix.policy?.artifact_is_owner !== false) errors.push("CONTRATO_ARTIFACT_VIROU_OWNER");
  if (artifactMatrix.policy?.artifact_is_runtime_proof !== false) errors.push("CONTRATO_ARTIFACT_VIROU_RUNTIME_PROOF");
  if (artifactMatrix.policy?.byte_identity_is_semantic_proof !== false) errors.push("CONTRATO_ARTIFACT_HASH_VIROU_PROVA_SEMANTICA");
  if (artifactMatrix.policy?.newer_owner_must_not_be_overwritten_by_older_artifact !== true) errors.push("CONTRATO_ARTIFACT_PERMITE_DOWNGRADE");
  if (artifactMatrix.policy?.extract_useful_delta_before_merge !== true) errors.push("CONTRATO_ARTIFACT_SEM_DELTA_UTIL");
  if (artifactMatrix.policy?.deterministic_test_before_promotion !== true) errors.push("CONTRATO_ARTIFACT_SEM_TESTE_DETERMINISTICO");
  if (artifactMatrix.policy?.global_contract_inheritance_required !== true) errors.push("CONTRATO_ARTIFACT_SEM_HERANCA_GLOBAL");

  const artifactIds = new Set(Array.isArray(artifactMatrix.artifacts) ? artifactMatrix.artifacts.map((row) => row?.id) : []);
  for (const id of ["PDF_HARNESS_CORE_20260909","UNIFIED_ONESHOT_REMEDIADO","REMOTE_TRAY_PACOTAO_FINAL"]) {
    if (!artifactIds.has(id)) errors.push(`CONTRATO_ARTIFACT_AUSENTE:${id}`);
  }
  const remoteTrayArtifact = Array.isArray(artifactMatrix.artifacts)
    ? artifactMatrix.artifacts.find((row) => row?.id === "REMOTE_TRAY_PACOTAO_FINAL")
    : null;
  if (!remoteTrayArtifact || !Array.isArray(remoteTrayArtifact.gap_proven) || !remoteTrayArtifact.gap_proven.some((item) => String(item).includes("harness/RUN-TESTS.ps1"))) {
    errors.push("CONTRATO_REMOTE_TRAY_GAP_HARNESS_NAO_REGISTRADO");
  }

  if (remoteTrayArtifact?.gap_status !== "CLOSED_IN_CHILD_PR_SOURCE_LAYER") errors.push("CONTRATO_REMOTE_TRAY_GAP_SOURCE_NAO_FECHADO");
  if (remoteTrayArtifact?.runtime_proof !== "REQUIRES_WINDOWS_CASA_OR_EXTERNAL_DEVICE_MEASUREMENT") errors.push("CONTRATO_REMOTE_TRAY_RUNTIME_OVERCLAIM");
  if (remoteTrayArtifact?.exe_policy !== "PACKAGE_ONLY_NOT_GIT") errors.push("CONTRATO_REMOTE_TRAY_EXE_POLICY_INVALIDA");
  const remoteTraySourceFiles = [
    "scripts/remote-bridge/canonical/engine/CentralDark-Remote-Parser.psm1",
    "scripts/remote-bridge/canonical/engine/CentralDark-Remote-Tray.ps1",
    "scripts/remote-bridge/canonical/harness/RUN-TESTS.ps1",
    "scripts/remote-bridge/canonical/harness/fixtures/auth-code-base-url.log",
    "scripts/remote-bridge/canonical/harness/fixtures/stale-refresh-token.log",
    "scripts/remote-bridge/canonical/harness/fixtures/authorized-online-claim.log",
    "scripts/remote-bridge/canonical/harness/fixtures/local-mcp-failed.log",
  ];
  for (const file of remoteTraySourceFiles) {
    if (!existe(file)) errors.push(`CONTRATO_REMOTE_TRAY_SOURCE_AUSENTE:${file}`);
  }

  const fixedHud = contract.fixed_hud_contract ?? {};
  if (fixedHud.marker !== "CENTRALDARK_FIXED_HUD_REQUIRED") errors.push("CONTRATO_HUD_FIXO_MARKER_AUSENTE");
  if (fixedHud.always_show_on_centraldark_operational_response !== true) errors.push("CONTRATO_HUD_NAO_OBRIGATORIO");
  if (fixedHud.layout !== "FIXED" || fixedHud.data !== "LIVE_ONLY") errors.push("CONTRATO_HUD_FIXO_DADOS_INVALIDO");
  if (fixedHud.percent_policy?.arbitrary_percent_forbidden !== true || fixedHud.percent_policy?.requires_explicit_denominator !== true) errors.push("CONTRATO_HUD_PERCENTUAL_FALSO");

  const trace = contract.trace_pombo64_contract ?? {};
  if (trace.marker !== "CENTRALDARK_HASH_TIME_POMBO64_TRACE_REQUIRED") errors.push("CONTRATO_POMBO64_MARKER_AUSENTE");
  if (trace.pombo64_plus?.pombo_mode !== "CHECKSUM_ON") errors.push("CONTRATO_POMBO64_CHECKSUM_OFF");
  if (trace.pombo64_plus?.is_proof !== false || trace.pombo64_plus?.base64_is_security !== false) errors.push("CONTRATO_POMBO64_FALSA_PROVA_SEGURANCA");
  if (trace.identity?.hash_binding_lives_in_receipt !== true) errors.push("CONTRATO_HASH_SEM_RECEIPT");

  const plug = contract.plug_and_play_inheritance ?? {};
  if (plug.marker !== "CENTRALDARK_PLUG_AND_PLAY_CONTRACT_INHERITANCE") errors.push("CONTRATO_PLUG_PLAY_MARKER_AUSENTE");
  if (plug.future_executor_without_contract !== "FAIL_CLOSED") errors.push("CONTRATO_FUTURO_EXECUTOR_SEM_FAIL_CLOSED");
  if (plug.no_v2_v3_v4_for_same_capability !== true) errors.push("CONTRATO_PLUG_PLAY_PERMITE_V2V3V4");

  for (const binding of ["ROOT_CONTRACT_REF","ROOT_GOAL_ID","CHILD_CONTRACT_ID","SELF_GOAL_ID","TLC23_HORN_GATE"]) {
    if (!Array.isArray(plug.required_binding) || !plug.required_binding.includes(binding)) errors.push(`CONTRATO_PLUG_PLAY_BINDING_AUSENTE:${binding}`);
  }


  const hybrid = contract.hybrid_runtime_contract ?? {};
  if (hybrid.marker !== "CENTRALDARK_HYBRID_RUNTIME_DISCOVERY_REQUIRED") errors.push("CONTRATO_RUNTIME_HIBRIDO_MARKER_AUSENTE");
  if (hybrid.pm2?.discover_all_homes_before_mutation !== true) errors.push("CONTRATO_PM2_HIBRIDO_SEM_DISCOVERY");
  if (hybrid.pm2?.act_only_where_owner_exists !== true) errors.push("CONTRATO_PM2_HIBRIDO_OWNER_INVALIDO");
  if (hybrid.pm2?.cross_home_restart_forbidden !== true || hybrid.pm2?.restart_all_forbidden !== true) errors.push("CONTRATO_PM2_HIBRIDO_RESTART_AMPLO");
  if (hybrid.caddy?.validate_before_reload !== true || hybrid.caddy?.backup_before_mutation !== true) errors.push("CONTRATO_CADDY_SEM_BACKUP_VALIDATE");
  if (hybrid.microdeploy_runtime_proof?.t1_pid_and_health_required !== true) errors.push("CONTRATO_MICRODEPLOY_SEM_T1_PID_HEALTH");

  const telemetry = contract.hybrid_telemetry_contract ?? {};
  if (telemetry.marker !== "CENTRALDARK_HYBRID_TELEMETRY_REQUIRED") errors.push("CONTRATO_TELEMETRIA_HIBRIDA_MARKER_AUSENTE");
  if (telemetry.no_screen_does_not_block_other_observability !== true) errors.push("CONTRATO_TELEMETRIA_HIBRIDA_TELA_VIROU_SPOF");
  if (telemetry.source_semantics?.screen_is_required !== false) errors.push("CONTRATO_TELEMETRIA_HIBRIDA_TELA_OBRIGATORIA");
  if (telemetry.source_semantics?.port_response_requires_owner_attribution !== true) errors.push("CONTRATO_TELEMETRIA_PORTA_SEM_OWNER");
  if (telemetry.source_semantics?.global_current_claim_requires_cross_surface_reconciliation !== true) errors.push("CONTRATO_TELEMETRIA_SEM_RECONCILIACAO_GLOBAL");
  if (telemetry.screenpipe?.endpoint_must_be_attributed_to_screenpipe_process_before_use !== true) errors.push("CONTRATO_SCREENPIPE_PORTA_SEM_PROCESSO");
  if (telemetry.contradiction_policy?.unresolved_material_contradiction !== "FIXED_POINT_FALSE") errors.push("CONTRATO_TELEMETRIA_CONTRADICAO_PODE_VERDE");
  const telemetrySources = telemetry.sources ?? {};
  for (const source of ["github","vps_runtime","api","logs","mcp","ci","screen","file_config","network","history"]) {
    if (!Array.isArray(telemetrySources[source]) || telemetrySources[source].length === 0) errors.push(`CONTRATO_TELEMETRIA_FONTE_AUSENTE:${source}`);
  }

  const tempPolicy = contract.ephemeral_artifact_policy ?? {};
  if (tempPolicy.marker !== "CENTRALDARK_EPHEMERAL_WORKSPACE_CLEAN_REQUIRED") errors.push("CONTRATO_TEMP_POLICY_MARKER_AUSENTE");
  if (tempPolicy.temporary_suffixes_allowed !== true) errors.push("CONTRATO_TEMP_POLICY_NAO_PERMITE_COORDENACAO_EFEMERA");
  const tempCleanupTool = tempPolicy.cleanup?.tool;
  if (tempCleanupTool !== "scripts/centraldark/ephemeral-workspace.mjs") errors.push("CONTRATO_TEMP_POLICY_SEM_FERRAMENTA_EXECUTAVEL");
  if (tempPolicy.cleanup?.marker_file !== ".centraldark-ephemeral.json") errors.push("CONTRATO_TEMP_POLICY_MARKER_FILE_AUSENTE");
  if (tempPolicy.cleanup?.cleanup_readback_required !== true) errors.push("CONTRATO_TEMP_POLICY_SEM_READBACK_FINAL");
  if (tempPolicy.cleanup?.fixed_point_requires_ephemeral_cleanup !== true) errors.push("CONTRATO_FIXED_POINT_NAO_EXIGE_LIMPEZA_EFEMERA");
  if (tempPolicy.cleanup?.temporary_workspace_must_use_canonical_creator !== true) errors.push("CONTRATO_TEMP_NAO_EXIGE_CRIADOR_CANONICO");
  if (tempPolicy.cleanup?.unmarked_temp_workspace !== "CONTRACT_VIOLATION") errors.push("CONTRATO_TEMP_SEM_PUNICAO_PARA_NAO_MARCADO");
  if (tempPolicy.cleanup?.mission_end_requires_temp_inventory !== true) errors.push("CONTRATO_FIM_MISSAO_SEM_INVENTARIO_TEMP");
  if (tempPolicy.cleanup?.blind_delete_without_marker !== "FORBIDDEN") errors.push("CONTRATO_TEMP_POLICY_PERMITE_DELETE_CEGO");
  if (tempPolicy.cleanup?.self_test_required_by_gate !== true) errors.push("CONTRATO_TEMP_POLICY_SEM_SELF_TEST_GATE");
  const tempCleanupToolPath = typeof tempCleanupTool === "string" ? join(ROOT, tempCleanupTool) : "";
  if (!tempCleanupToolPath || !existsSync(tempCleanupToolPath)) {
    errors.push("CONTRATO_TEMP_TOOL_NAO_EXISTE");
  } else if (tempPolicy.cleanup?.self_test_required_by_gate === true) {
    try {
      const cleanupProof = execFileSync(process.execPath, [tempCleanupToolPath, "--self-test"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      if (!cleanupProof.includes('"selfTest":"PASS"')) errors.push("CONTRATO_TEMP_TOOL_SELF_TEST_SEM_PASS");
    } catch (error) {
      errors.push(`CONTRATO_TEMP_TOOL_SELF_TEST_FAIL:${error?.status ?? "UNKNOWN"}:${String(error?.stderr || error?.message || "").trim().slice(0, 500)}`);
    }
  }
  if (tempPolicy.cleanup?.delete_after_use !== true) errors.push("CONTRATO_TEMP_POLICY_SEM_LIMPEZA_FINAL");
  if (tempPolicy.cleanup?.final_temp_residue_target !== "ZERO_UNLESS_PROVEN_ACTIVE_OR_FORENSIC_KEEP") errors.push("CONTRATO_TEMP_POLICY_RESIDUO_SEM_ALVO_ZERO");
  if (tempPolicy.canonical_architecture?.version_suffix_for_same_capability !== "FORBIDDEN") errors.push("CONTRATO_CANONICO_PERMITE_V1V2V3");
  if (tempPolicy.canonical_architecture?.evolve_same_object !== true) errors.push("CONTRATO_CANONICO_NAO_EVOLVE_MESMO_OBJETO");
  if (tempPolicy.canonical_architecture?.expand_domain_in_same_owner !== true) errors.push("CONTRATO_DOMINIO_NAO_EXPANDE_NO_OWNER");
  if (tempPolicy.canonical_architecture?.create_parallel_architecture_for_domain_expansion !== false) errors.push("CONTRATO_DOMINIO_PERMITE_ARQUITETURA_PARALELA");
  if (tempPolicy.duplicate_control?.integrated_global_dedupe !== true) errors.push("CONTRATO_SEM_DEDUPE_GLOBAL_INTEGRADO");
  if (tempPolicy.duplicate_control?.duplicate_found !== "ABSORB_DELTA_INTO_EXISTING_OWNER_THEN_RETIRE_DUPLICATE") errors.push("CONTRATO_DUPLICATA_SEM_ABSORCAO");
  if (tempPolicy.vps_cleanliness?.do_not_use_dirty_root_as_temp_workspace !== true) errors.push("CONTRATO_TEMP_USA_ROOT_DIRTY");
  if (tempPolicy.vps_cleanliness?.cleanliness_is_not_permission_for_reset_hard_or_git_clean !== true) errors.push("CONTRATO_LIMPEZA_AUTORIZA_RESET_CEGO");
  if (tempPolicy.delivery_visibility?.marker !== "CENTRALDARK_INTERNAL_WORK_ARTIFACT_IS_NOT_CHEFE_DELIVERY") errors.push("CONTRATO_ARTEFATO_INTERNO_SEM_MARCADOR_DE_ENTREGA");
  if (tempPolicy.delivery_visibility?.internal_work_artifact_is_delivery !== false) errors.push("CONTRATO_ARTEFATO_INTERNO_VIRA_ENTREGA");
  if (tempPolicy.delivery_visibility?.tool_materialization_is_delivery !== false) errors.push("CONTRATO_MATERIALIZACAO_DE_TOOL_VIRA_ENTREGA");
  if (tempPolicy.delivery_visibility?.downloaded_ci_artifact_default_visibility !== "INTERNAL_WORKSPACE") errors.push("CONTRATO_ARTEFATO_CI_NAO_FICA_INTERNO");
  if (tempPolicy.delivery_visibility?.show_raw_file_to_chefe_only_if_explicitly_requested_or_final_deliverable !== true) errors.push("CONTRATO_ARQUIVO_BRUTO_PODE_VAZAR_SEM_PEDIDO");
  if (tempPolicy.delivery_visibility?.pombo64_may_reference_hash_manifest_lineage_without_exposing_raw_artifact !== true) errors.push("CONTRATO_POMBO64_EXIGE_EXPOSICAO_DO_ARQUIVO_BRUTO");
  if (tempPolicy.delivery_visibility?.pombo64_trace_is_delivery_by_itself !== false) errors.push("CONTRATO_POMBO64_TRACE_VIRA_ENTREGA");
  if (tempPolicy.delivery_visibility?.temporary_file_card_in_chat_is_not_proof_of_delivery_intent !== true) errors.push("CONTRATO_CARD_TEMPORARIO_VIRA_INTENCAO_DE_ENTREGA");
  if (tempPolicy.delivery_visibility?.final_delivery_must_be_intentional_and_named !== true) errors.push("CONTRATO_ENTREGA_FINAL_NAO_EXIGE_INTENCAO");

  const vpsKernelDelta = contract.vps_kernel_delta_stream_contract ?? {};
  if (vpsKernelDelta.marker !== "CENTRALDARK_VPS_KERNEL_DELTA_STREAM_REQUIRED") errors.push("CONTRATO_VPS_KERNEL_DELTA_MARKER_AUSENTE");
  if (vpsKernelDelta.new_parallel_service !== false) errors.push("CONTRATO_VPS_KERNEL_DELTA_SERVICO_PARALELO");
  if (vpsKernelDelta.transport !== "FASTAPI") errors.push("CONTRATO_VPS_KERNEL_DELTA_TRANSPORTE_INVALIDO");
  if (vpsKernelDelta.engine_owner !== "apps/modulos/elite-gateway/scripts/centraldark_omni_router.py") errors.push("CONTRATO_VPS_KERNEL_DELTA_OWNER_INVALIDO");
  if (vpsKernelDelta.one_heart !== "https://api.centralldark.com/heartbeat") errors.push("CONTRATO_VPS_KERNEL_DELTA_CORACAO_INVALIDO");
  if (vpsKernelDelta.raw_stream?.preserve !== true || vpsKernelDelta.raw_stream?.may_be_removed !== false) errors.push("CONTRATO_VPS_KERNEL_DELTA_REMOVE_STREAM_BRUTO");
  if (vpsKernelDelta.delta_semantics?.derived_not_authority !== true) errors.push("CONTRATO_VPS_KERNEL_DELTA_VIROU_AUTORIDADE");
  if (vpsKernelDelta.mutation_policy?.stream_never_mutates_directly !== true) errors.push("CONTRATO_VPS_KERNEL_DELTA_STREAM_MUTANTE");
  if (vpsKernelDelta.mutation_policy?.global_contract_entry_exit_required_for_fix !== true) errors.push("CONTRATO_VPS_KERNEL_DELTA_SEM_GATE_GLOBAL");

  const logIncident = contract.log_incident_crystallization_contract ?? {};
  if (logIncident.marker !== "CENTRALDARK_LOG_INCIDENT_FANOUT_CRYSTALLIZATION_REQUIRED") errors.push("CONTRATO_LOG_INCIDENT_MARKER_AUSENTE");
  if (logIncident.primary_sensor?.endpoint !== "/admin/api/logs") errors.push("CONTRATO_LOG_INCIDENT_SENSOR_INVALIDO");
  if (logIncident.primary_sensor?.owner !== "apps/modulos/mcp/src/admin.js") errors.push("CONTRATO_LOG_INCIDENT_OWNER_INVALIDO");
  if (logIncident.primary_sensor?.endpoint_http_200_is_global_pass !== false) errors.push("CONTRATO_LOG_INCIDENT_200_VIRA_PASS_GLOBAL");
  if (logIncident.fanout?.mode !== "PARALLEL_READ_ONLY_DIAGNOSIS") errors.push("CONTRATO_LOG_INCIDENT_FANOUT_INVALIDO");
  if (logIncident.fanout?.readers_may_run_in_parallel !== true || logIncident.fanout?.readers_may_not_mutate !== true) errors.push("CONTRATO_LOG_INCIDENT_READERS_MUTAM");
  if (logIncident.remediation?.same_scope_concurrent_writers !== false) errors.push("CONTRATO_LOG_INCIDENT_WRITER_CONCORRENTE");
  if (logIncident.remediation?.one_active_writer_per_mutable_scope !== true) errors.push("CONTRATO_LOG_INCIDENT_SEM_WRITER_POR_ESCOPO");
  if (logIncident.remediation?.mutation_mode !== "PARALLEL_ONLY_FOR_PROVEN_DISJOINT_SCOPES_SERIAL_WITHIN_EACH_SCOPE") errors.push("CONTRATO_LOG_INCIDENT_MUTATION_MODE_INVALIDO");
  if (logIncident.convergence_loop?.new_error_during_fix !== "NEW_DELTA_SAME_MISSION") errors.push("CONTRATO_LOG_INCIDENT_NOVO_ERRO_REINICIA_MISSAO");
  if (logIncident.crystallization?.log_silence_alone_is_pass !== false || logIncident.crystallization?.endpoint_200_alone_is_pass !== false) errors.push("CONTRATO_LOG_INCIDENT_FALSO_VERDE");
  if (logIncident.crystallization?.fixed_point_if_any_required_unknown !== false) errors.push("CONTRATO_LOG_INCIDENT_UNKNOWN_VIRA_FIXED_POINT");

  const enforcer = contract.global_contract_enforcer ?? {};
  if (enforcer.marker !== "CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED") errors.push("CONTRATO_ENFORCER_GLOBAL_MARKER_AUSENTE");
  if (enforcer.status !== "MANDATORY_FOR_MUTATION") errors.push("CONTRATO_ENFORCER_GLOBAL_NAO_OBRIGATORIO");
  if (enforcer.creates_new_dispatcher !== false) errors.push("CONTRATO_ENFORCER_CRIANDO_DISPATCHER_PARALELO");
  if (enforcer.deterministic_gate !== "scripts/agent-call.mjs") errors.push("CONTRATO_ENFORCER_GATE_INVALIDO");
  if (enforcer.deploy_gate !== "scripts/vps/deploy-guards-dispatcher.sh") errors.push("CONTRATO_ENFORCER_DEPLOY_INVALIDO");
  if (enforcer.any_mutable_action_requires_entry_gate !== true) errors.push("CONTRATO_ENFORCER_MUTACAO_SEM_ENTRY_GATE");
  if (enforcer.mutation_without_entry_receipt !== "BLOCK") errors.push("CONTRATO_ENFORCER_MUTACAO_SEM_RECEIPT_NAO_BLOQUEIA");
  if (enforcer.entry_requires?.github_t0 !== "PASS" || enforcer.entry_requires?.vps_t0 !== "PASS") errors.push("CONTRATO_ENFORCER_T0_DUAL_AUSENTE");
  if (enforcer.entry_requires?.rollback_prepared_and_identified !== true) errors.push("CONTRATO_ENFORCER_ROLLBACK_AUSENTE");

  if (enforcer.entry_requires?.tlc23_horn_gate !== "PASS") errors.push("CONTRATO_ENFORCER_TLC23_HORN_AUSENTE");
  if (enforcer.entry_requires?.child_contract_lineage !== "PASS") errors.push("CONTRATO_ENFORCER_CHILD_LINEAGE_AUSENTE");
  if (!Array.isArray(enforcer.fixed_point_aggregator?.requires) || !enforcer.fixed_point_aggregator.requires.includes("TLC23_HORN_GATE")) errors.push("CONTRATO_FIXED_POINT_SEM_TLC23");
  if (!Array.isArray(enforcer.fixed_point_aggregator?.requires) || !enforcer.fixed_point_aggregator.requires.includes("CHILD_CONTRACT_LINEAGE")) errors.push("CONTRATO_FIXED_POINT_SEM_CHILD_LINEAGE");

  if (enforcer.exit_requires?.github_t1 !== "PASS" || enforcer.exit_requires?.vps_t1 !== "PASS") errors.push("CONTRATO_ENFORCER_T1_DUAL_AUSENTE");
  if (enforcer.fixed_point_aggregator?.unknown_never_green !== true) errors.push("CONTRATO_ENFORCER_UNKNOWN_GREEN");

  const deltaContinuo = contract.continuous_delta_global ?? {};
  if (deltaContinuo.marker !== "CENTRALDARK_DELTA_CONTINUO_REQUIRED") errors.push("CONTRATO_DELTA_CONTINUO_MARKER_AUSENTE");
  if (deltaContinuo.every_new_material_is_delta_candidate !== true) errors.push("CONTRATO_DELTA_CONTINUO_NAO_CAPTURA");
  if (deltaContinuo.new_material_does_not_restart_mission !== true) errors.push("CONTRATO_DELTA_CONTINUO_REINICIA_MISSAO");
  if (deltaContinuo.interruption !== "RESUME_FROM_NEXT_CURSOR_AFTER_REMEASURE") errors.push("CONTRATO_DELTA_CONTINUO_SEM_RESUME");

  if (deltaContinuo.next_cursor_materializes_self_goal !== true) errors.push("CONTRATO_DELTA_CONTINUO_NEXT_CURSOR_NAO_GERA_SELF_GOAL");
  if (deltaContinuo.self_goal_inherits_global_contract !== true) errors.push("CONTRATO_DELTA_CONTINUO_SELF_GOAL_SEM_HERANCA");
  if (deltaContinuo.self_goal_may_change_root_goal !== false) errors.push("CONTRATO_DELTA_CONTINUO_SELF_GOAL_MUDA_ROOT");
  if (deltaContinuo.self_goal_may_expand_scope_without_authority !== false) errors.push("CONTRATO_DELTA_CONTINUO_SELF_GOAL_EXPANDE_ESCOPO");


  const rules = contract.decision_rules ?? {};
  if (rules.new_component_requires_proved_gap !== true) errors.push("CONTRATO_RECONCILIACAO_GAP_NAO_OBRIGATORIO");
  if (rules.new_workflow_when_equivalent_exists !== "FORBIDDEN_UPDATE_EXISTING") errors.push("WORKFLOW_REUSE_NAO_OBRIGATORIO");
  if (rules.proposal_without_inventory !== "SEARCH_PERTINENT_AND_CONTINUE") errors.push("CONTRATO_RECONCILIACAO_POLICY_DRIFT");
  if (rules.file_found_but_not_cross_referenced !== "CONTEXT_RECONCILIATION_FAILURE") errors.push("CONTRATO_RECONCILIACAO_SEM_CROSS_REFERENCE");
  if (rules.open_or_draft_pr_is_operational_authority !== false) errors.push("CONTRATO_RECONCILIACAO_PR_DRAFT_COM_AUTORIDADE");
  if (rules.program_document_is_runtime_proof !== false) errors.push("CONTRATO_RECONCILIACAO_PROGRAMA_COMO_RUNTIME");
  if (rules.formal_proof_without_user_request !== "FORBIDDEN_FOR_SIMPLE_TASKS") errors.push("CONTRATO_RECONCILIACAO_FORMALISMO_SEM_LIMITE");
  if (rules.parallel_perception_same_scope !== "ALLOWED_READ_ONLY_WHEN_INFORMATION_GAIN") errors.push("ARQUITETURA_PERCEPCAO_PARALELA_INVALIDA");
  if (rules.parallel_mutation_same_scope !== "BLOCKED_HANDOFF_REQUIRED") errors.push("ARQUITETURA_MUTACAO_PARALELA_NAO_BLOQUEADA");
  if (rules.model_vote_is_truth_mechanism !== false) errors.push("ARQUITETURA_VOTACAO_DE_MODELO_COMO_VERDADE");
  if (rules.same_finding_without_new_evidence !== "DROP_DUPLICATE") errors.push("ARQUITETURA_ANTI_ECO_AUSENTE");
  if (rules.derived_projection_is_source_of_truth !== false) errors.push("ARQUITETURA_PROJECAO_DERIVADA_COMO_AUTORIDADE");

  const preArchitecture = contract.pre_architecture_reconciliation ?? {};
  if (preArchitecture.marker !== "PRE_ARCHITECTURE_RECONCILIATION_REQUIRED") errors.push("PRE_ARCHITECTURE_GATE_AUSENTE");
  if (preArchitecture.owner !== CONTRATO_RECONCILIACAO) errors.push("PRE_ARCHITECTURE_OWNER_INVALIDO");
  const preSequence = [
    "RECOVER_CHEFE_INTENT",
    "SEARCH_EXISTING",
    "VERIFY_OWNER",
    "VERIFY_CAPABILITY",
    "VERIFY_GAP",
    "VERIFY_CURRENT_RUNTIME",
    "PDF_TLC23_HORN_WHEN_APPLICABLE",
    "REALITY_JUDGE",
    "REUSE_OR_EXTEND",
  ];
  if (!Array.isArray(preArchitecture.sequence) || preSequence.some((step, index) => preArchitecture.sequence[index] !== step)) {
    errors.push("PRE_ARCHITECTURE_SEQUENCE_INVALIDA");
  }
  if (preArchitecture.decision?.existing_complete !== "REUSE") errors.push("PRE_ARCHITECTURE_REUSE_INVALIDO");
  if (preArchitecture.decision?.existing_partial !== "EXTEND_MINIMALLY") errors.push("PRE_ARCHITECTURE_EXTEND_INVALIDO");
  if (preArchitecture.decision?.gap_not_proven !== "UNKNOWN_DO_NOT_CREATE") errors.push("PRE_ARCHITECTURE_UNKNOWN_INVALIDO");
  if (preArchitecture.invariants?.PARALLEL_ARCH_WITHOUT_PROVEN_GAP !== "BLOCK") errors.push("PRE_ARCHITECTURE_PARALLEL_GAP_NOT_BLOCKED");

  const adminAuthority = contract.admin_authority_policy ?? {};
  if (adminAuthority.marker !== "ADMIN_AUTHORITY_IS_NOT_PROOF") errors.push("ADMIN_AUTHORITY_POLICY_AUSENTE");
  if (adminAuthority.semantics?.ADMIN_AUTHENTICATED_TRUE !== "AUTHORITY_TO_OPERATE_PRIVILEGED_PATHS") errors.push("ADMIN_AUTH_SEM_AUTORIDADE_OPERACIONAL");
  if (adminAuthority.semantics?.ADMIN_AUTHENTICATED_FALSE !== "PRIVILEGED_OPERATION_FORBIDDEN") errors.push("ADMIN_AUTH_FALSE_NAO_BLOQUEIA");
  if (adminAuthority.semantics?.AUTHENTICATED_IS_PROVED !== false) errors.push("ADMIN_AUTH_VIROU_PROVA");
  if (adminAuthority.semantics?.AUTHORIZED_IS_VALIDATED !== false) errors.push("ADMIN_AUTH_VIROU_VALIDACAO");
  if (adminAuthority.semantics?.EXECUTED_IS_PASSED !== false) errors.push("EXECUCAO_VIROU_PASS");
  if (adminAuthority.semantics?.ADMIN_IS_BYPASS !== false) errors.push("ADMIN_BYPASS_INDEVIDO");
  if (adminAuthority.privileged_execution?.admin_required !== true) errors.push("ADMIN_NAO_OBRIGATORIO_PARA_PRIVILEGIADO");
  if (adminAuthority.privileged_execution?.proof_gates_remain_required !== true) errors.push("ADMIN_REMOVEU_GATES");

  const domains = contract.canonical_domain_policy ?? {};
  if (domains.marker !== "CENTRALDARK_CANONICAL_PUBLIC_SURFACES") errors.push("CANONICAL_DOMAIN_POLICY_AUSENTE");
  if (domains.canonical?.["centralldark.com"] !== "ONE_SITE_HUMAN_COCKPIT") errors.push("CANONICAL_SITE_INVALIDO");
  if (domains.canonical?.["admin.centralldark.com"] !== "ONE_ADMIN_PANEL") errors.push("CANONICAL_ADMIN_INVALIDO");
  if (domains.canonical?.["api.centralldark.com"] !== "ONE_MACHINE_API") errors.push("CANONICAL_API_INVALIDO");
  if (domains.canonical?.["mcp.centralldark.com"] !== "MCP_PROTOCOL_SURFACE") errors.push("CANONICAL_MCP_INVALIDO");
  if (domains.hub?.role !== "INTERNAL_ADMIN_CAPABILITY") errors.push("HUB_ROLE_INVALIDO");
  if (domains.hub?.public_product !== false) errors.push("HUB_PUBLIC_PRODUCT_FORBIDDEN");
  if (domains.hub?.new_panel !== false) errors.push("HUB_NEW_PANEL_FORBIDDEN");
  if (domains.hub?.canonical_public_destination !== false) errors.push("HUB_CANONICAL_DESTINATION_FORBIDDEN");
  if (domains.expansion_rule?.new_public_subdomain_requires_proven_material_gap !== true) errors.push("NEW_PUBLIC_SUBDOMAIN_GAP_NOT_REQUIRED");
  if (domains.expansion_rule?.active_consumer_compatibility_must_be_measured_before_removal !== true) errors.push("LEGACY_CONSUMER_MEASUREMENT_NOT_REQUIRED");

  if (contract.complexity_policy?.never_expose_internal_governance_as_user_bureaucracy !== true) {
    errors.push("CONTRATO_RECONCILIACAO_GOVERNANCA_EXPOSTA_AO_USUARIO");
  }

  const topology = contract.standard_architecture ?? {};
  if (topology.marker !== "ONE_CORE_MANY_ARMS_STANDARD") errors.push("ARQUITETURA_PADRAO_MARKER_AUSENTE");
  if (topology.canonical_owner !== CONTRATO_DELTA) errors.push("ARQUITETURA_PADRAO_DONO_INVALIDO");
  if (topology.authority_center !== "SEGREDO/CHEFE") errors.push("ARQUITETURA_PADRAO_AUTORIDADE_INVALIDA");
  if (topology.coordination_center !== "SOL") errors.push("ARQUITETURA_PADRAO_COORDENACAO_INVALIDA");

  const perception = topology.perception ?? {};
  if (perception.parallel !== true) errors.push("ARQUITETURA_PERCEPCAO_PARALELA_DESATIVADA");
  if (perception.same_writer_scope_mode !== "READ_ONLY") errors.push("ARQUITETURA_PERCEPCAO_ROUBA_WRITER");
  if (perception.requires_information_gain !== true) errors.push("ARQUITETURA_PERCEPCAO_SEM_GANHO_INFORMACIONAL");
  if (perception.correlated_views_are_independent_evidence !== false) errors.push("ARQUITETURA_EVIDENCIA_CORRELACIONADA_MULTIPLICADA");

  const envelope = topology.evidence_envelope ?? {};
  const requiredEvidenceFields = [
    "TARGET",
    "OPERATIONAL_SCOPE",
    "EVENT_TIME",
    "OBSERVATION_TIME",
    "PROVENANCE",
    "CLAIM",
    "EVIDENCE_REF",
    "CLASS",
  ];
  if (!Array.isArray(envelope.required_fields)) {
    errors.push("ARQUITETURA_ENVELOPE_EVIDENCIA_AUSENTE");
  } else {
    for (const field of requiredEvidenceFields) {
      if (!envelope.required_fields.includes(field)) errors.push(`ARQUITETURA_ENVELOPE_CAMPO_AUSENTE:${field}`);
    }
  }

  const arbitration = topology.arbitration ?? {};
  if (arbitration.same_target_conflict !== "DISCRIMINATING_TEST_THEN_EVIDENCE_THEN_REALITY") errors.push("ARQUITETURA_ARBITRAGEM_INVALIDA");
  if (arbitration.different_target !== "NOT_A_CONFLICT") errors.push("ARQUITETURA_FALSO_CONFLITO_DE_ALVO");
  if (arbitration.model_vote_is_truth !== false) errors.push("ARQUITETURA_ARBITRAGEM_POR_VOTO");
  if (arbitration.name_or_reputation_is_authority !== false) errors.push("ARQUITETURA_REPUTACAO_COMO_AUTORIDADE");
  if (arbitration.indistinguishable_hypotheses !== "UNKNOWN") errors.push("ARQUITETURA_HIPOTESE_INDISTINGUIVEL_NAO_UNKNOWN");

  const mutation = topology.mutation ?? {};
  if (mutation.rule !== "ONE_WRITER_PER_SCOPE") errors.push("ARQUITETURA_WRITER_UNICO_AUSENTE");
  if (mutation.parallel_same_scope !== "BLOCKED") errors.push("ARQUITETURA_WRITER_PARALELO_NAO_BLOQUEADO");
  if (mutation.handoff_required !== true) errors.push("ARQUITETURA_HANDOFF_NAO_OBRIGATORIO");
  if (mutation.strategy !== "MINIMAL_CAUSAL_MUTATION") errors.push("ARQUITETURA_MUTACAO_NAO_MINIMA");

  const observability = topology.observability ?? {};
  if (observability.derived_projection_is_authority !== false) errors.push("ARQUITETURA_OBSERVABILIDADE_VIROU_AUTORIDADE");
  if (observability.graph_fingerprint_role !== "DELTA_INSTRUMENT") errors.push("ARQUITETURA_GRAPH_FINGERPRINT_PAPEL_INVALIDO");
  if (observability.green_visual_status_is_end_to_end_pass !== false) errors.push("ARQUITETURA_FALSO_VERDE_VISUAL");

  const learning = topology.learning ?? {};
  if (learning.same_finding_without_new_evidence !== "DROP_DUPLICATE") errors.push("ARQUITETURA_APRENDIZADO_COM_ECO");
  if (learning.no_material_delta !== "NO_CHANGE") errors.push("ARQUITETURA_NO_CHANGE_AUSENTE");
  if (learning.absorb_only_reusable_proven_delta !== true) errors.push("ARQUITETURA_ABSORCAO_SEM_PROVA");

  const requiredFlow = [
    "INTENT",
    "REANCHOR",
    "FAN_OUT_READ_ONLY",
    "NORMALIZE_EVIDENCE",
    "DEDUPE",
    "ARBITRATE_BY_TEST",
    "SINGLE_WRITER_MINIMAL_MUTATION",
    "VERIFY_SAME_TARGET",
    "CANONICAL_PROMOTION",
    "RUNTIME_EXECUTION",
    "OBSERVE",
    "ABSORB_REUSABLE_DELTA_OR_NO_CHANGE",
  ];
  if (!Array.isArray(topology.flow)) {
    errors.push("ARQUITETURA_FLUXO_PADRAO_AUSENTE");
  } else if (requiredFlow.some((step, index) => topology.flow[index] !== step)) {
    errors.push("ARQUITETURA_FLUXO_PADRAO_FORA_DE_ORDEM");
  }

  const boundary = contract.repository_boundary_policy ?? {};
  if (boundary.marker !== "CENTRALDARK_ROOT_ONLY_REQUIRED") errors.push("BOUNDARY_MARKER_AUSENTE");
  if (boundary.repository !== "ServerVpss/CentralDark") errors.push("BOUNDARY_REPOSITORY_INVALIDO");
  if (boundary.vps_root !== "/root/CentralDark") errors.push("BOUNDARY_VPS_ROOT_INVALIDO");
  if (boundary.external_root_default !== "OUT_OF_SCOPE") errors.push("BOUNDARY_EXTERNAL_DEFAULT_INVALIDO");
  if (!Array.isArray(boundary.explicit_external_exclusions) || !boundary.explicit_external_exclusions.includes("/root/Multizap/apps/clone-deck")) {
    errors.push("BOUNDARY_CLONE_DECK_NAO_EXCLUIDO");
  }
  if (boundary.external_runtime_fallback !== "FORBIDDEN") errors.push("BOUNDARY_EXTERNAL_FALLBACK_NAO_BLOQUEADO");

  const workflow = contract.workflow_policy ?? {};
  if (workflow.marker !== "WORKFLOW_REUSE_REQUIRED") errors.push("WORKFLOW_POLICY_MARKER_AUSENTE");
  if (workflow.reuse_existing_before_new !== true) errors.push("WORKFLOW_REUSE_FALSE");
  if (workflow.ai_policy_marker !== "AI_DETERMINISTIC_FALLBACK_REQUIRED") errors.push("AI_FALLBACK_MARKER_AUSENTE");
  if (workflow.deterministic_first !== true) errors.push("AI_DETERMINISTICO_NAO_PRIORITARIO");
  if (workflow.ai_unavailable !== "DETERMINISTIC_FALLBACK_OR_FAIL_CLOSED") errors.push("AI_SEM_FALLBACK_DETERMINISTICO");
  if (workflow.rate_limit_timeout_model_offline_is_pass !== false) errors.push("AI_INDISPONIVEL_PODE_VIRAR_PASS");

  const daily = contract.daily_checklist_gate ?? {};
  if (daily.marker !== "DAILY_CHECKLIST_GATE_REQUIRED") errors.push("DAILY_CHECKLIST_GATE_AUSENTE");
  if (daily.applies_when?.agent_or_ai_mutates_code_during_day !== true) errors.push("DAILY_CHECKLIST_ESCOPO_INVALIDO");
  const beforeMutation = daily.before_first_code_mutation_of_day ?? {};
  for (const key of ["load_daily_checklist","verify_current_state","verify_parent_goal","verify_owner","verify_scope","verify_writer_lease"]) {
    if (beforeMutation[key] !== true) errors.push(`DAILY_CHECKLIST_BEFORE_MUTATION_AUSENTE:${key}`);
  }
  const duringDay = daily.during_day ?? {};
  for (const key of ["record_material_delta","record_pending_gaps","record_head_changes","record_handoffs","record_gate_failures"]) {
    if (duringDay[key] !== true) errors.push(`DAILY_CHECKLIST_DURING_DAY_AUSENTE:${key}`);
  }
  if (daily.before_handoff_or_finalization?.update_daily_checklist !== true) errors.push("DAILY_CHECKLIST_FINAL_UPDATE_AUSENTE");
  if (daily.no_new_material_delta !== "NO_CHANGE") errors.push("DAILY_CHECKLIST_NO_CHANGE_INVALIDO");
  if (daily.checklist_role !== "OPERATIONAL_HUD_NOT_SOURCE_OF_TRUTH") errors.push("DAILY_CHECKLIST_VIROU_FONTE_DA_VERDADE");

  const checklistOwner = String(daily.projection_owner || "");
  const checklistHistoryOwner = String(daily.history_owner || "");
  if (daily.projection_owner_required !== true) errors.push("DAILY_CHECKLIST_PROJECTION_OWNER_NOT_REQUIRED");
  if (checklistOwner !== "apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx") {
    errors.push("DAILY_CHECKLIST_PROJECTION_OWNER_INVALIDO");
  } else if (!existe(checklistOwner)) {
    errors.push("DAILY_CHECKLIST_PROJECTION_AUSENTE:" + checklistOwner);
  } else {
    const hudText = ler(checklistOwner);
    for (const marker of [
      "HUD_IS_CURRENT_PROJECTION",
      "CHECKLIST_DAILY_OWNER",
      "receiptsFingerprint",
      "nextCursor",
      "activeLanes",
    ]) {
      if (!hudText.includes(marker)) errors.push("DAILY_CHECKLIST_HUD_MARKER_AUSENTE:" + marker);
    }
  }
  if (checklistHistoryOwner !== "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md" || !existe(checklistHistoryOwner)) {
    errors.push("DAILY_CHECKLIST_HISTORY_OWNER_INVALIDO");
  }
  if (daily.no_daily_pr !== true) errors.push("DAILY_CHECKLIST_DAILY_PR_AINDA_PERMITIDA");
  if (daily.no_new_pr_mother !== true) errors.push("DAILY_CHECKLIST_NEW_PR_MOTHER_AINDA_PERMITIDA");
  if (daily.hud_is_current_projection !== true) errors.push("DAILY_CHECKLIST_HUD_CURRENT_PROJECTION_AUSENTE");
  if (daily.hud_is_not_authority !== true) errors.push("DAILY_CHECKLIST_HUD_VIROU_AUTORIDADE");
  if (daily.receipts_owner !== "repository") errors.push("DAILY_CHECKLIST_RECEIPTS_OWNER_INVALIDO");

  const executorSelection = contract.executor_selection_policy ?? {};
  if (executorSelection.marker !== "EXECUTOR_SELECTION_BY_CAPABILITY_SCOPE_LEASE_POLICY") errors.push("EXECUTOR_SELECTION_POLICY_AUSENTE");
  if (executorSelection.model_name_is_routing_key !== false) errors.push("MODEL_NAME_VIROU_ROUTING_KEY");
  if (executorSelection.model_name_is_authority !== false) errors.push("MODEL_NAME_VIROU_AUTHORITY");
  if (executorSelection.model_name_is_writer_lease !== false) errors.push("MODEL_NAME_VIROU_WRITER_LEASE");
  const expectedExecutorSelection = ["TAG_EXECUTOR","CAPABILITY_MATCH","SCOPE_MATCH","LEASE_AVAILABLE","POLICY_ALLOWED"];
  if (!Array.isArray(executorSelection.selection) || expectedExecutorSelection.some((item, index) => executorSelection.selection[index] !== item)) {
    errors.push("EXECUTOR_SELECTION_INVALIDA");
  }

  const writerPolicy = contract.writer_concurrency_policy ?? {};
  if (writerPolicy.marker !== "DISJOINT_SCOPE_CONCURRENCY_WITH_SINGLE_SCOPE_LEASE") errors.push("WRITER_CONCURRENCY_POLICY_AUSENTE");
  if (writerPolicy.multiple_writers_allowed !== true) errors.push("MULTIPLE_WRITERS_DISALLOWED");
  if (writerPolicy.concurrent_writers_disjoint_scopes !== true) errors.push("DISJOINT_SCOPE_WRITERS_NAO_PERMITIDOS");
  if (writerPolicy.same_mutable_scope_requires_one_writer_lease !== true) errors.push("WRITER_LEASE_MESMO_ESCOPO_NAO_OBRIGATORIO");
  if (writerPolicy.same_scope_parallel_mutation !== "BLOCKED") errors.push("WRITER_MESMO_ESCOPO_PARALELO_NAO_BLOQUEADO");
  if (writerPolicy.lease_is_capability_not_persona !== true) errors.push("WRITER_LEASE_VIROU_PERSONA");

  const finalization = contract.finalization_policy ?? {};
  if (finalization.marker !== "ONE_ACTIVE_FINALIZER_LEASE") errors.push("FINALIZER_LEASE_POLICY_AUSENTE");
  if (finalization.final_promotion_scope !== "ONE_ACTIVE_FINALIZER_LEASE") errors.push("FINALIZER_LEASE_NAO_UNICO");
  const expectedFinalizationLane = ["PR","SAME_HEAD_GATES","MAIN","POST_MERGE","DEPLOY","REMEASURE","FINAL_RECEIPT"];
  if (!Array.isArray(finalization.lane) || expectedFinalizationLane.some((item, index) => finalization.lane[index] !== item)) {
    errors.push("FINALIZATION_LANE_INVALIDA");
  }
  if (finalization.same_head_required !== true) errors.push("FINALIZATION_SEM_SAME_HEAD");
  if (finalization.merge_is_not_deploy !== true) errors.push("MERGE_CONFUNDIDO_COM_DEPLOY");
  if (finalization.deploy_is_not_runtime_proof !== true) errors.push("DEPLOY_CONFUNDIDO_COM_RUNTIME_PROOF");

  const branchPolicy = contract.git_branch_lifecycle_policy ?? {};
  if (branchPolicy.marker !== "CENTRALDARK_GIT_BRANCH_LIFECYCLE_REQUIRED") errors.push("GIT_BRANCH_LIFECYCLE_POLICY_AUSENTE");
  if (branchPolicy.new_pr_default !== false) errors.push("NEW_PR_DEFAULT_VIROU_TRUE");
  if (branchPolicy.new_remote_branch_default !== false) errors.push("NEW_REMOTE_BRANCH_DEFAULT_VIROU_TRUE");
  if (branchPolicy.branch_is_transport_not_intent !== true) errors.push("BRANCH_VIROU_INTENT_OWNER");
  if (branchPolicy.no_branch_parking_lot !== true) errors.push("BRANCH_PARKING_LOT_PERMITIDO");
  if (branchPolicy.find_matching_child_before_new_branch !== true) errors.push("NEW_BRANCH_SEM_REUSE_CHILD");
  if (branchPolicy.direct_main_when_authorized_and_applicable !== true) errors.push("DIRECT_MAIN_APLICAVEL_NAO_PRIORIZADO");
  const expectedRemoteBranchCauses = ["DIRECT_MAIN_NOT_APPLICABLE","PR_REQUIRED","REMOTE_CI_REQUIRED","CROSS_AGENT_HANDOFF_REQUIRED","ISOLATION_REQUIRED"];
  if (!Array.isArray(branchPolicy.remote_branch_only_when) || expectedRemoteBranchCauses.some((item) => !branchPolicy.remote_branch_only_when.includes(item))) {
    errors.push("REMOTE_BRANCH_CAUSES_INVALIDAS");
  }
  const expectedBranchBindings = ["OWNER","SCOPE","INTENT","LIFECYCLE"];
  if (!Array.isArray(branchPolicy.new_remote_branch_requires) || expectedBranchBindings.some((item) => !branchPolicy.new_remote_branch_requires.includes(item))) {
    errors.push("NEW_REMOTE_BRANCH_SEM_BINDINGS");
  }
  if (branchPolicy.ephemeral_branch_open_ready_pr_same_turn !== true) errors.push("EPHEMERAL_BRANCH_SEM_READY_PR_SAME_TURN");
  if (branchPolicy.ephemeral_branch_delete_after_merge !== true) errors.push("EPHEMERAL_BRANCH_SEM_CLEANUP_POS_MERGE");
  if (branchPolicy.persistent_branch_requires_explicit_owner_and_purpose !== true) errors.push("PERSISTENT_BRANCH_SEM_OWNER");
  if (branchPolicy.historical_branch_delete_without_delta_proof !== "FORBIDDEN") errors.push("HISTORICAL_BRANCH_BLIND_DELETE_PERMITIDO");

  const draftPolicy = branchPolicy.draft_policy ?? {};
  if (draftPolicy.autonomous_pr_draft_default !== false) errors.push("AUTONOMOUS_PR_DRAFT_DEFAULT_VIROU_TRUE");
  if (draftPolicy.authorized_intent_draft_auto_ready !== true) errors.push("AUTHORIZED_DRAFT_AUTO_READY_AUSENTE");
  if (draftPolicy.draft_is_not_dependency_semaphore !== true) errors.push("DRAFT_VIROU_DEPENDENCY_SEMAPHORE");
  if (draftPolicy.explicit_keep_draft_preserved !== true) errors.push("EXPLICIT_KEEP_DRAFT_NAO_PRESERVADO");
  const draftRuntimeOwner = String(draftPolicy.runtime_owner || "");
  const draftWorkflowOwner = String(draftPolicy.workflow_owner || "");
  if (!draftRuntimeOwner || !existe(draftRuntimeOwner)) errors.push("DRAFT_NORMALIZER_RUNTIME_OWNER_AUSENTE");
  else {
    const draftRuntime = ler(draftRuntimeOwner);
    if (!draftRuntime.includes("draftReadyDecision") || !draftRuntime.includes("normalizeDraftSweep") || !draftRuntime.includes('mode === "normalize"')) {
      errors.push("DRAFT_NORMALIZER_RUNTIME_BINDING_AUSENTE");
    }
  }
  if (!draftWorkflowOwner || !existe(draftWorkflowOwner)) errors.push("DRAFT_NORMALIZER_WORKFLOW_OWNER_AUSENTE");
  else {
    const draftWorkflow = ler(draftWorkflowOwner);
    if (!draftWorkflow.includes("normalize:") || !draftWorkflow.includes("github-autonomia-varredura.mjs normalize")) {
      errors.push("DRAFT_NORMALIZER_WORKFLOW_BINDING_AUSENTE");
    }
  }
  const historicalBranchOwner = String(branchPolicy.historical_reconciliation_owner || "");
  if (!historicalBranchOwner || !existe(historicalBranchOwner)) errors.push("BRANCH_RECONCILIATION_OWNER_AUSENTE");

  const mcpToolOwner = String(branchPolicy.mcp_tool_owner || "");
  const mcpClientOwner = String(branchPolicy.mcp_client_owner || "");
  const toolLevel = branchPolicy.tool_level_enforcement ?? {};
  if (!mcpToolOwner || !existe(mcpToolOwner)) errors.push("BRANCH_MCP_TOOL_OWNER_AUSENTE");
  else {
    const mcpTool = ler(mcpToolOwner);
    for (const token of [
      "centralDarkPrCreationPolicy",
      "centralDarkBranchCreationPolicy",
      "NEW_REMOTE_BRANCH_DEFAULT=false",
      "EPHEMERAL_READY_PR_SAME_TURN",
      "keepDraftReason",
      "draft: false",
    ]) {
      if (!mcpTool.includes(token)) errors.push(`BRANCH_MCP_TOOL_BINDING_AUSENTE:${token}`);
    }
  }
  if (!mcpClientOwner || !existe(mcpClientOwner)) errors.push("BRANCH_MCP_CLIENT_OWNER_AUSENTE");
  else if (!ler(mcpClientOwner).includes("export async function deleteBranch")) {
    errors.push("BRANCH_MCP_ROLLBACK_CLIENT_AUSENTE");
  }
  if (toolLevel.create_pr_ready_by_default !== true) errors.push("MCP_PR_READY_DEFAULT_AUSENTE");
  if (toolLevel.explicit_keep_draft_reason_required !== true) errors.push("MCP_KEEP_DRAFT_REASON_AUSENTE");
  if (toolLevel.create_branch_requires_material_purpose !== true) errors.push("MCP_BRANCH_PURPOSE_GATE_AUSENTE");
  if (toolLevel.ephemeral_branch_auto_opens_ready_pr !== true) errors.push("MCP_EPHEMERAL_READY_PR_ATOMIC_AUSENTE");
  if (toolLevel.ephemeral_branch_rolls_back_if_pr_creation_fails !== true) errors.push("MCP_EPHEMERAL_ROLLBACK_AUSENTE");
  if (toolLevel.capability_does_not_infer_human_authority !== true) errors.push("MCP_CAPABILITY_INFERIU_AUTHORITY");

  const goals = contract.goal_derivation_policy ?? {};
  if (goals.marker !== "STABLE_PARENT_GOAL_DERIVED_MICRO_GOALS") errors.push("GOAL_DERIVATION_POLICY_AUSENTE");
  if (goals.goal_pai_id !== "STABLE") errors.push("GOAL_PAI_NAO_ESTAVEL");
  if (goals.micro_goal !== "DERIVED_FROM_CURRENT_WOUND") errors.push("MICRO_GOAL_NAO_DERIVADO_DA_FERIDA");
  if (goals.child_failure_does_not_replace_parent_goal !== true) errors.push("FALHA_FILHA_SUBSTITUI_GOAL_PAI");
  if (goals.current_wound_drives_next_micro_goal !== true) errors.push("FERIDA_ATUAL_NAO_DIRIGE_MICRO_GOAL");
  if (goals.criterion_inheritance_marker !== "HEREDITARY_ADAPTIVE_CRITERION") errors.push("CRITERION_HEREDITARIO_AUSENTE");
  for (const child of ["GOAL","SUBGOAL","BATCH","SUBAGENT","SUBSUBGOAL"]) {
    if (!Array.isArray(goals.applies_to) || !goals.applies_to.includes(child)) errors.push(`CRITERION_HERANCA_AUSENTE_${child}`);
  }
  if (goals.child_can_refine_criterion !== true) errors.push("CHILD_NAO_PODE_REFINAR_CRITERION");
  if (goals.child_cannot_weaken_parent_criterion !== true) errors.push("CHILD_PODE_ENFRAQUECER_PARENT_CRITERION");
  if (goals.local_done_does_not_equal_parent_done !== true) errors.push("LOCAL_DONE_CONFUNDIDO_COM_PARENT_DONE");
  for (const terminal of ["FIXED_POINT","HUMAN_ONLY_BLOCKER"]) {
    if (!Array.isArray(goals.parent_terminal_state) || !goals.parent_terminal_state.includes(terminal)) errors.push(`PARENT_TERMINAL_STATE_AUSENTE_${terminal}`);
  }

  const ladder = contract.capability_proof_ladder ?? {};
  if (ladder.marker !== "CENTRALDARK_CAPABILITY_PROOF_LADDER") errors.push("CAPABILITY_PROOF_LADDER_AUSENTE");
  const expectedStages = ["DECLARED","DISCOVERED","CONFIGURED","HEALTHY","EXECUTED","RECEIPT"];
  if (JSON.stringify(ladder.stages ?? []) !== JSON.stringify(expectedStages)) errors.push("CAPABILITY_PROOF_LADDER_ORDEM_INVALIDA");
  if (ladder.no_stage_implies_next !== true) errors.push("CAPABILITY_STAGE_IMPLICOU_PROXIMO");
  if (ladder.strongest_claim_is_highest_measured_stage !== true) errors.push("CAPABILITY_CLAIM_ACIMA_DA_PROVA");

  const sectors = contract.sectoral_parallel_perception_contract ?? {};
  if (sectors.marker !== "CENTRALDARK_SECTORAL_PARALLEL_PERCEPTION") errors.push("SECTORAL_PARALLEL_PERCEPTION_AUSENTE");
  if (sectors.selection_rule !== "PARALLEL_PERCEPTION_ALLOWED_WHEN_INFORMATION_GAIN") errors.push("SECTOR_FANOUT_SEM_INFORMATION_GAIN");
  if (sectors.sector_count_is_fixed !== false) errors.push("SECTOR_COUNT_FIXADO");
  if (sectors.read_only_fanout_before_mutation !== true) errors.push("SECTOR_FANOUT_NAO_READONLY");
  if (sectors.rendezvous_before_mutation !== true) errors.push("SECTOR_RENDEZVOUS_AUSENTE");
  if (sectors.dedupe_before_mutation !== true) errors.push("SECTOR_DEDUPE_AUSENTE");
  if (sectors.same_scope_parallel_mutation !== false) errors.push("SECTOR_PARALLEL_MUTATION_SAME_SCOPE");
  if (sectors.reality_is_judge !== true) errors.push("SECTOR_REALITY_JUDGE_AUSENTE");

  const roleMap = contract.authority_role_map ?? {};
  const expectedRoleMap = {
    CHEFE: "INTENT_AUTHORITY",
    CONTRACT: "POLICY",
    GATES: "PROOF",
    VPS: "EXECUTOR_RUNTIME_AND_CONTROL_PLANE",
    REALITY: "JUDGE",
  };
  for (const [key, value] of Object.entries(expectedRoleMap)) {
    if (roleMap[key] !== value) errors.push(`AUTHORITY_ROLE_INVALIDO:${key}`);
  }

  const nonEq = contract.non_equivalence_guards ?? {};
  if (nonEq.UNKNOWN_IS_PASS !== false) errors.push("UNKNOWN_VIROU_PASS");
  if (nonEq.ACTION_IS_PROOF !== false) errors.push("ACTION_VIROU_PROOF");
  if (nonEq.AUTHORIZED_IS_VALIDATED !== false) errors.push("AUTHORIZED_VIROU_VALIDATED");
  if (nonEq.MERGED_IS_DEPLOYED !== false) errors.push("MERGED_VIROU_DEPLOYED");
}

// A dívida histórica pode continuar arquivada, mas estes entrypoints ativos não
// podem depender de /root/Multizap. Isso torna a fronteira determinística sem
// reescrever de uma vez todos os documentos históricos.
for (const file of BOUNDARY_ENFORCED_FILES) {
  if (!existe(file)) {
    errors.push(`BOUNDARY_FILE_AUSENTE:${file}`);
    continue;
  }
  if (ler(file).includes("/root/Multizap")) errors.push(`BOUNDARY_EXTERNAL_PATH_ATIVO:${file}`);
  if (ler(file).includes("CK_MULTIZAP_ROOT")) errors.push(`BOUNDARY_LEGACY_ROOT_ATIVO:${file}`);
}


for (const file of DEPLOY_GATE_ENFORCED_FILES) {
  if (!existe(file)) {
    errors.push("DEPLOY_GATE_ENTRYPOINT_AUSENTE:" + file);
    continue;
  }
  if (!ler(file).includes(CANONICAL_DEPLOY_GATE)) {
    errors.push("DEPLOY_GATE_BYPASS:" + file + ":esperado=" + CANONICAL_DEPLOY_GATE);
  }
}

const centralDeployGateOwner = ler("scripts/vps/centraldark-deploy.sh");
if (!centralDeployGateOwner.includes("CENTRALDARK_CANONICAL_DEPLOY_GATE") ||
    !centralDeployGateOwner.includes("DIRECT_DEPLOY_BYPASS_BLOCKED") ||
    !centralDeployGateOwner.includes("CENTRALDARK_CANONICAL_DEPLOY_TARGET")) {
  errors.push("DEPLOY_GATE_MUTATION_OWNER_SEM_HANDOFF_CANONICO:scripts/vps/centraldark-deploy.sh");
}

// Não criar workflow paralelo. Em PRs com BASE/HEAD conhecidos, qualquer novo
// arquivo de workflow é bloqueado para forçar extensão do mecanismo existente.
// FABLE JUDGE: before=40 zeros → SEM_BASE (push de branch nova) — não merge-base/diff.
if (isNullOid(BASE_SHA)) {
  // safe no-base path — skip workflow delta gate
} else if (shaValido(BASE_SHA) && shaValido(HEAD_SHA)) {
  const baseExiste = gitCommitExiste(BASE_SHA);
  const headExiste = gitCommitExiste(HEAD_SHA);
  if (!baseExiste) errors.push(`WORKFLOW_BASE_SHA_INDISPONIVEL:${BASE_SHA}`);
  if (!headExiste) errors.push(`WORKFLOW_HEAD_SHA_INDISPONIVEL:${HEAD_SHA}`);
  if (baseExiste && headExiste) {
    try {
      const workflowChanges = git(["diff", "--name-status", BASE_SHA, HEAD_SHA, "--", ".github/workflows"]);
      for (const line of workflowChanges.split(/\r?\n/).filter(Boolean)) {
        const [status, path] = line.split(/\t/);
        if (status === "A" && /\.ya?ml$/i.test(path || "")) {
          errors.push(`NOVO_WORKFLOW_BLOQUEADO_REUTILIZE_EXISTENTE:${path}`);
        }
      }
    } catch {
      errors.push(`WORKFLOW_DIFF_INDISPONIVEL:${BASE_SHA}:${HEAD_SHA}`);
    }
  }
} else if (BASE_SHA || HEAD_SHA) {
  errors.push(`WORKFLOW_SHA_INVALIDO:${BASE_SHA || "EMPTY"}:${HEAD_SHA || "EMPTY"}`);
}

for (const entrypoint of ENTRADAS) {
  if (!existe(entrypoint)) continue;
  for (const cited of caminhosCitados(ler(entrypoint))) {
    if (/[*<>]/.test(cited)) continue;
    if (!existe(cited)) errors.push(`CAMINHO_MORTO:${entrypoint}:${cited}`);
  }
}

const canonicalDocuments = canonicos();
const reachable = new Set();
const reachableFrom = new Map();
const canonicalDeclaration = (document) => {
  const lines = ler(document).split(/\r?\n/);
  const index = lines.findIndex((line) => /^status:\s*"?CAN[OÔ]NICO"?/i.test(line));
  return index >= 0 ? index + 1 : 1;
};
let currentLevel = ENTRADAS.filter(existe);
for (let depth = 0; depth < 2; depth += 1) {
  const nextLevel = [];
  for (const document of currentLevel) {
    for (const cited of caminhosCitados(ler(document))) {
      if (ehGerado(cited) || reachable.has(cited) || !existe(cited)) continue;
      reachable.add(cited);
      reachableFrom.set(cited, { document, depth: depth + 1 });
      if (/\.mdc?$/.test(cited)) nextLevel.push(cited);
    }
  }
  currentLevel = nextLevel;
}

const checkedEntrypoints = ENTRADAS.filter(existe).join(",");
for (const canonical of canonicalDocuments) {
  if (!reachable.has(canonical)) {
    errors.push(
      `CANONICO_ORFAO:path=${canonical}:declaracao_linha=${canonicalDeclaration(canonical)}:` +
      `referencias_verificadas=${checkedEntrypoints}:profundidade_maxima=2:` +
      "acao=adicionar_referencia_a_partir_de_uma_entrada_canonica_ou_remover_status_CANONICO_apos_reconciliacao",
    );
  }
}

const report = {
  guardrail: "validar-porta-de-entrada",
  porta: PORTA,
  porta_viva: PORTA_VIVA,
  contrato_delta: CONTRATO_DELTA,
  contrato_reconciliacao: CONTRATO_RECONCILIACAO,
  estrutura_vps: ESTRUTURA_VPS,
  contrato_reconciliacao_schema_expected: RECONCILIATION_SCHEMA_VERSION,
  contrato_reconciliacao_schema_observed: contract?.schema_version ?? null,
  arquitetura_padrao_marker: contract?.standard_architecture?.marker ?? null,
  identidade_lupa: IDENTIDADE_LUPA,
  reuse_before_create_required: true,
  centraldark_root_only_required: true,
  workflow_reuse_required: true,
  ai_deterministic_fallback_required: true,
  base_sha: BASE_SHA || null,
  head_sha: HEAD_SHA || null,
  adaptadores_obrigatorios: ADAPTADORES,
  adaptadores_encontrados: ADAPTADORES.filter(existe),
  canonicos_encontrados: canonicalDocuments.length,
  canonicos_alcancaveis: canonicalDocuments.filter((item) => reachable.has(item)).length,
  errors,
  warnings,
  known_debt_exceptions: 0,
  ok: errors.length === 0,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else {
  for (const warning of warnings) console.log(`AVISO ${warning}`);
  for (const error of errors) console.error(`ERRO ${error}`);
  console.log(
    `PORTA_OK=${report.ok ? 1 : 0} ` +
      `REUSE_BEFORE_CREATE=${report.reuse_before_create_required ? 1 : 0} ` +
      `CENTRALDARK_ROOT_ONLY=${report.centraldark_root_only_required ? 1 : 0} ` +
      `WORKFLOW_REUSE=${report.workflow_reuse_required ? 1 : 0} ` +
      `AI_DETERMINISTIC_FALLBACK=${report.ai_deterministic_fallback_required ? 1 : 0} ` +
      `ARCHITECTURE=${report.arquitetura_padrao_marker || "MISSING"} ` +
      `SCHEMA=${report.contrato_reconciliacao_schema_observed}/${report.contrato_reconciliacao_schema_expected} ` +
      `ADAPTADORES=${report.adaptadores_encontrados.length}/${report.adaptadores_obrigatorios.length} ` +
      `CANONICOS=${report.canonicos_encontrados} ` +
      `ALCANCAVEIS=${report.canonicos_alcancaveis} ` +
      `DIVIDA=0 ERROS=${errors.length}`,
  );
}

process.exit(report.ok ? 0 : 1);