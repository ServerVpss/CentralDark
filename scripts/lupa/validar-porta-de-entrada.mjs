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
const CONTRATO_DELTA = "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md";
const CONTRATO_RECONCILIACAO = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const ESTRUTURA_VPS = "docs/CONSCIENCIA/04-ESTRUTURA-VPS.md";
const RECONCILIATION_SCHEMA_VERSION = 4;
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
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
if (!existe(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!existe(CONTRATO_RECONCILIACAO)) errors.push(`CONTRATO_RECONCILIACAO_AUSENTE:${CONTRATO_RECONCILIACAO}`);
if (!existe(ESTRUTURA_VPS)) errors.push(`ESTRUTURA_VPS_AUSENTE:${ESTRUTURA_VPS}`);
if (!existe(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);

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

  const requiredReceiptFields = ["GITHUB_T0","VPS_T0","CROSS_SURFACE_DRIFT","PREFLIGHT_RESULT","COUNTERPROOF_RESULT","MICRO_DEPLOY_SCOPE","GITHUB_T1","VPS_T1","RUNTIME_RECEIPT","FIXED_HUD_UPDATE","NEXT_CURSOR","ACTIVE_PRS","BRANCH_COMPARISON","PRINCIPAL_PR","CONVERGENCE_RECEIPT","GLOBAL_DNA_RESULT","BUILDKITE_FUNNEL_RESULT","FAILED_JOB_ID","FAILURE_SIGNATURE","FAILED_JOB_ROOT_CAUSE_STATE","RECONCILIATION_PLAN"];
  const receiptFields = contract.internal_receipt_fields ?? [];
  for (const field of requiredReceiptFields) if (!receiptFields.includes(field)) errors.push(`CONTRATO_UNIVERSAL_RECEIPT_CAMPO_AUSENTE:${field}`);

  const rules = contract.decision_rules ?? {};
  if (rules.new_component_requires_proved_gap !== true) errors.push("CONTRATO_RECONCILIACAO_GAP_NAO_OBRIGATORIO");
  if (rules.new_workflow_when_equivalent_exists !== "FORBIDDEN_UPDATE_EXISTING") errors.push("WORKFLOW_REUSE_NAO_OBRIGATORIO");
  if (rules.proposal_without_inventory !== "BOOT_BLOCKED") errors.push("CONTRATO_RECONCILIACAO_SEM_FAIL_CLOSED");
  if (rules.file_found_but_not_cross_referenced !== "CONTEXT_RECONCILIATION_FAILURE") errors.push("CONTRATO_RECONCILIACAO_SEM_CROSS_REFERENCE");
  if (rules.open_or_draft_pr_is_operational_authority !== false) errors.push("CONTRATO_RECONCILIACAO_PR_DRAFT_COM_AUTORIDADE");
  if (rules.program_document_is_runtime_proof !== false) errors.push("CONTRATO_RECONCILIACAO_PROGRAMA_COMO_RUNTIME");
  if (rules.formal_proof_without_user_request !== "FORBIDDEN_FOR_SIMPLE_TASKS") errors.push("CONTRATO_RECONCILIACAO_FORMALISMO_SEM_LIMITE");
  if (rules.parallel_perception_same_scope !== "ALLOWED_READ_ONLY_WHEN_INFORMATION_GAIN") errors.push("ARQUITETURA_PERCEPCAO_PARALELA_INVALIDA");
  if (rules.parallel_mutation_same_scope !== "BLOCKED_HANDOFF_REQUIRED") errors.push("ARQUITETURA_MUTACAO_PARALELA_NAO_BLOQUEADA");
  if (rules.model_vote_is_truth_mechanism !== false) errors.push("ARQUITETURA_VOTACAO_DE_MODELO_COMO_VERDADE");
  if (rules.same_finding_without_new_evidence !== "DROP_DUPLICATE") errors.push("ARQUITETURA_ANTI_ECO_AUSENTE");
  if (rules.derived_projection_is_source_of_truth !== false) errors.push("ARQUITETURA_PROJECAO_DERIVADA_COMO_AUTORIDADE");
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