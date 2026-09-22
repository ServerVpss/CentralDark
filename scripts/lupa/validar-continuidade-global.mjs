#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const at = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const ROOT = resolve(at("--repo-root", process.cwd()));
const JSON_OUT = argv.includes("--json");
const CONTRACT = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const EXTENSION = "docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json";
const PORTA_VIVA = "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md";
const GATE = ".github/workflows/porta-de-entrada.yml";
const SHARED_WRITER_PUSH = "scripts/lupa/writer-safe-push-main.sh";
const REMOVED_MAIN_WRITERS = Object.freeze([
  {
    path: ".github/workflows/linear-pendencias-sync.yml",
    decision: "REMOVED_BY_DESIGN",
    owner: "docs/CAPACIDADES/pendencias-painel-centraldark.md",
  },
]);

const MAIN_WRITERS = Object.freeze([
  ".github/workflows/notion-sync.yml",
  ".github/workflows/painel-vivo.yml",
  ".github/workflows/obsidian-index.yml",
  ".github/workflows/estado-retomada.yml",
  ".github/workflows/painel-validacao.yml",
  ".github/workflows/painel-auto-update.yml",
]);
const PRE_MAIN_GATES = Object.freeze([
  "node scripts/lupa/validar-continuidade-global.mjs",
  "node scripts/lupa/validar-porta-de-entrada.mjs",
]);

const REQUIRED = {
  principles: [
    "REUSE_BEFORE_CREATE", "CONTINUE_BEFORE_RESTART", "ABSORB_BEFORE_DUPLICATE", "SEARCH_BEFORE_INVENT",
    "ONE_OWNER_PER_CAPABILITY", "ONE_WRITER_PER_SCOPE", "NO_NEW_INFORMATION_NO_CHANGE",
    "PARALLELIZE_PERCEPTION", "SERIALIZE_MUTATION", "REALITY_IS_JUDGE",
  ],
  material_scope: [
    "INPUT", "PR", "BRANCH", "FILE", "DOC", "SKILL", "SCRIPT", "WORKFLOW", "AGENT", "MODEL",
    "SESSION", "CHAT", "WINDOW", "TOOL", "SERVICE", "PANEL", "MEMORY", "DATABASE", "RUNTIME",
    "INTEGRATION", "RULE", "TEST", "OWNER", "CAPABILITY", "MISSION", "ARTIFACT", "HISTORY",
  ],
  new_input_does_not_imply: [
    "NEW_SYSTEM", "NEW_OWNER", "NEW_BRANCH", "NEW_PR", "NEW_SKILL", "NEW_WORKFLOW", "NEW_MEMORY",
  ],
  create_new_only_if: [
    "MATERIAL_GAP_PROVEN", "EXISTING_CAPABILITY_FIT_FALSE", "EXISTING_OWNER_FIT_FALSE", "EXTEND_EXISTING_INSUFFICIENT",
  ],
  residue_classes: [
    "ACTIVE", "MERGED_HISTORICAL", "SUPERSEDED", "ABANDONED", "ORPHAN", "KEEP_EXPLICIT", "SAFE_TO_REMOVE",
  ],
  input_tokens: [
    "MENSAGEM_RECEBIDA != NOVA_MISSAO",
    "TEXTO_RECEBIDO != ORDEM_AUTOMATICA",
    "CONTEXTO_NOVO != TROCA_DE_PAPEL",
    "INFORMATION_GAIN_REQUIRED=true",
    "AUTORIDADE_HUMANA_PRESERVADA=true",
  ],
  execution_loop: [
    "THINK", "ACT", "OBSERVE", "UPDATE_STATE", "COUNTERPROVE", "REMEDY", "REMEASURE", "FIXED_POINT", "RECEIPT", "CONTINUITY",
  ],
  roles: ["CHEFE", "OWNER", "WRITER", "CONNECTOR", "MODEL", "JUDGE"],
};

const read = (path) => readFileSync(join(ROOT, path), "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const hasAll = (actual, expected) => {
  const set = new Set(Array.isArray(actual) ? actual : []);
  return expected.every((item) => set.has(item));
};

function validateMainWriter(path, text, sharedScriptText) {
  const errors = [];

  // Padrao canonico: workflow delega push ao script unico (retry + worktree + gates).
  if (text.includes(SHARED_WRITER_PUSH)) {
    if (typeof sharedScriptText !== "string") {
      errors.push(`MAIN_WRITER_SHARED_SCRIPT_MISSING:${path}`);
      return errors;
    }
    for (const gate of PRE_MAIN_GATES) {
      if (!sharedScriptText.includes(gate)) {
        errors.push(`MAIN_WRITER_SHARED_GATE_MISSING:${path}:${gate}`);
      }
    }
    if (!sharedScriptText.includes("git push origin HEAD:main")) {
      errors.push(`MAIN_WRITER_SHARED_PUSH_MISSING:${path}`);
    }
    if (sharedScriptText.includes('bash -lc "$REGENERATE_CMD"')) {
      errors.push(`MAIN_WRITER_SHARED_REGENERATE_LOGIN_SHELL_FORBIDDEN:${path}`);
    }
    if (!sharedScriptText.includes('env -u BASH_ENV -u ENV /bin/bash --noprofile --norc -c "$REGENERATE_CMD"')) {
      errors.push(`MAIN_WRITER_SHARED_REGENERATE_CWD_SAFE_MISSING:${path}`);
    }
    if (!sharedScriptText.includes('REGENERATE_CWD_MISMATCH') || !sharedScriptText.includes('REGENERATE_ESCAPED_WORKTREE')) {
      errors.push(`MAIN_WRITER_SHARED_REGENERATE_CWD_GUARD_MISSING:${path}`);
    }
    // Remove shell comments (# ...) before scanning for forbidden commands,
    // so a comment like "# - ZERO rebase -X ours" is not flagged as a real command.
    const stripComments = (src) => src.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
    const scanned = stripComments(sharedScriptText);
    if (scanned.includes("rebase -X ours") || /git\s+push\s+--force/.test(scanned)) {
      errors.push(`MAIN_WRITER_SHARED_FORBIDDEN_FORCE:${path}`);
    }
    return errors;
  }

  let cursor = 0;
  let pushes = 0;
  while (true) {
    const pushAt = text.indexOf("git push origin HEAD:main", cursor);
    if (pushAt < 0) break;
    pushes += 1;
    const prefix = text.slice(0, pushAt);
    for (const gate of PRE_MAIN_GATES) {
      const gateAt = prefix.lastIndexOf(gate);
      if (gateAt < 0) errors.push(`MAIN_WRITER_GATE_MISSING:${path}:${gate}`);
    }
    cursor = pushAt + 1;
  }
  if (pushes === 0) errors.push(`MAIN_WRITER_PUSH_NOT_FOUND:${path}`);
  return errors;
}

function validateExtension(extension) {
  const errors = [];
  const expect = (condition, code) => { if (!condition) errors.push(code); };
  expect(extension?.status === "CANONICAL_EXTENSION", "EXECUTION_EXTENSION_STATUS");
  expect(extension?.scope === "GLOBAL", "EXECUTION_EXTENSION_SCOPE");
  expect(extension?.is_owner === false, "EXECUTION_EXTENSION_NOT_OWNER");
  expect(extension?.single_global_owner === CONTRACT, "EXECUTION_EXTENSION_OWNER");
  for (const role of REQUIRED.roles) expect(typeof extension?.roles?.[role] === "string", `EXECUTION_EXTENSION_ROLE:${role}`);
  expect(extension?.invariants?.REALITY_IS_JUDGE === true, "EXECUTION_EXTENSION_REALITY_JUDGE");
  expect(extension?.invariants?.ONE_WRITER_PER_SCOPE === true, "EXECUTION_EXTENSION_ONE_WRITER");
  expect(extension?.invariants?.MODEL_NE_AUTHORITY === true, "EXECUTION_EXTENSION_MODEL_AUTHORITY");
  expect(extension?.invariants?.CONNECTOR_NE_AUTHORITY === true, "EXECUTION_EXTENSION_CONNECTOR_AUTHORITY");
  expect(hasAll(extension?.execution_loop, REQUIRED.execution_loop), "EXECUTION_EXTENSION_REACT_LOOP");
  expect(extension?.counterproof_transition?.CONCLUSION_FALSIFIED?.includes("EXECUTE_CORRECTION_IN_CURRENT_RUN_IF_AUTHORIZED"), "EXECUTION_EXTENSION_CURRENT_RUN_REMEDY");
  expect(extension?.error_discovered?.flow?.includes("RECORD_EXACT_CONTINUITY_RECEIPT"), "EXECUTION_EXTENSION_CONTINUITY_RECEIPT");
  expect(extension?.adapter_policy?.thin_adapter_only === true, "EXECUTION_EXTENSION_THIN_ADAPTER");
  expect(extension?.adapter_policy?.model_change_changes_owner === false, "EXECUTION_EXTENSION_MODEL_OWNER_STABLE");
  expect(extension?.writer_collision?.same_scope_writer_exists?.includes("DO_NOT_COMPETE"), "EXECUTION_EXTENSION_WRITER_COLLISION");
  return errors;
}

function validate(contract, extension, contractText, portaText, gateText, writerTexts, sharedScriptText) {
  const policy = contract?.global_continuity_policy;
  const errors = [];
  const expect = (condition, code) => { if (!condition) errors.push(code); };

  expect(policy?.marker === "GLOBAL_CONTINUITY_HARD_GATE", "CONTINUIDADE_GLOBAL_MARKER");
  expect(policy?.scope === "GLOBAL", "CONTINUIDADE_GLOBAL_SCOPE");
  expect(policy?.temporal_scope === "CONTINUOUS", "CONTINUIDADE_GLOBAL_TEMPORAL");
  expect(policy?.default_action === "CONTINUE_EXISTING", "CONTINUIDADE_GLOBAL_DEFAULT");

  for (const key of REQUIRED.principles) expect(policy?.principles?.[key] === true, `CONTINUIDADE_GLOBAL_PRINCIPIO:${key}`);
  expect(hasAll(policy?.material_scope, REQUIRED.material_scope), "CONTINUIDADE_GLOBAL_MATERIAL_SCOPE");
  expect(hasAll(policy?.new_input_does_not_imply, REQUIRED.new_input_does_not_imply), "CONTINUIDADE_GLOBAL_NON_IMPLICATION");

  for (const key of ["model_change", "session_change", "chat_change", "window_change", "tool_change", "new_error"]) {
    expect(policy?.continuity?.[key] === "CONTINUE_EXISTING", `CONTINUIDADE_GLOBAL_RESTART:${key}`);
  }
  expect(policy?.continuity?.new_context === "APPLY_DELTA_TO_EXISTING_OWNER", "CONTINUIDADE_GLOBAL_NEW_CONTEXT");
  expect(policy?.continuity?.same_mission_new_material === "APPLY_DELTA_TO_EXISTING_OWNER", "CONTINUIDADE_GLOBAL_NEW_MATERIAL");
  expect(policy?.continuity?.other_owner_material === "ROUTE_DELTA_WITHOUT_STEALING_WRITER", "CONTINUIDADE_GLOBAL_OWNER_ROUTE");
  expect(policy?.continuity?.local_fixed_point === "RETURN_TO_ACTIVE_INTENT", "CONTINUIDADE_GLOBAL_FIXED_POINT");
  expect(policy?.continuity?.local_fixed_point_ends_global_mission === false, "CONTINUIDADE_GLOBAL_FIXED_POINT_END");
  expect(hasAll(policy?.continuity?.stop_only_when, ["GLOBAL_OBJECTIVE_CLOSED", "CHEFE_EXPLICITLY_STOPS", "REAL_BLOCK_PROVEN"]), "CONTINUIDADE_GLOBAL_STOP");

  const sequence = Array.isArray(contract?.mandatory_pre_solution_sequence) ? contract.mandatory_pre_solution_sequence : [];
  const authorityAt = sequence.indexOf("classify_authority_and_runtime_state");
  const normalizeAt = sequence.indexOf("normalize_evidence_scope_time_and_provenance");
  const arbitrateAt = sequence.indexOf("arbitrate_conflict_by_discriminating_test_if_needed");
  const reuseAt = sequence.indexOf("reuse_or_extend_before_create");
  expect(authorityAt >= 0 && reuseAt > authorityAt, "CONTINUIDADE_GLOBAL_AUTHORITY_BEFORE_DELTA");
  expect(normalizeAt >= 0 && reuseAt > normalizeAt, "CONTINUIDADE_GLOBAL_EVIDENCE_BEFORE_DELTA");
  expect(arbitrateAt >= 0 && reuseAt > arbitrateAt, "CONTINUIDADE_GLOBAL_COUNTERPROOF_BEFORE_DELTA");
  expect(contract?.decision_rules?.same_finding_without_new_evidence === "DROP_DUPLICATE", "CONTINUIDADE_GLOBAL_DEDUPE_REQUIRED");
  expect(contract?.decision_rules?.unknown_is_pass === false, "CONTINUIDADE_GLOBAL_UNKNOWN_NOT_PASS");
  for (const token of REQUIRED.input_tokens) expect(portaText.includes(token), `CONTINUIDADE_GLOBAL_INPUT_BOUNDARY:${token}`);

  expect(policy?.creation_gate?.mode === "ALL", "CONTINUIDADE_GLOBAL_CREATION_MODE");
  expect(hasAll(policy?.creation_gate?.create_new_only_if, REQUIRED.create_new_only_if), "CONTINUIDADE_GLOBAL_CREATION_CONDITIONS");
  expect(policy?.creation_gate?.otherwise === "REUSE_OR_EXTEND_EXISTING", "CONTINUIDADE_GLOBAL_CREATION_FALLBACK");
  expect(policy?.creation_gate?.parallel_owner === "FORBIDDEN", "CONTINUIDADE_GLOBAL_PARALLEL_OWNER");
  expect(policy?.creation_gate?.parallel_system === "FORBIDDEN", "CONTINUIDADE_GLOBAL_PARALLEL_SYSTEM");
  expect(policy?.creation_gate?.parallel_workflow === "FORBIDDEN", "CONTINUIDADE_GLOBAL_PARALLEL_WORKFLOW");

  expect(policy?.residue_policy?.residue_is_progress === false, "CONTINUIDADE_GLOBAL_RESIDUE_PROGRESS");
  expect(policy?.residue_policy?.delete_by_name_only === "FORBIDDEN", "CONTINUIDADE_GLOBAL_DELETE_BY_NAME");
  expect(policy?.residue_policy?.cleanup_requires_delta_residual_classified === true, "CONTINUIDADE_GLOBAL_RESIDUE_CLASSIFY");
  expect(hasAll(policy?.residue_policy?.classes, REQUIRED.residue_classes), "CONTINUIDADE_GLOBAL_RESIDUE_CLASSES");
  expect(policy?.residue_policy?.residue_zero === "NO_ACTION", "CONTINUIDADE_GLOBAL_RESIDUE_ZERO");
  expect(policy?.residue_policy?.residue_material === "ABSORB_ONLY_USEFUL_DELTA", "CONTINUIDADE_GLOBAL_RESIDUE_MATERIAL");
  expect(policy?.residue_policy?.remove_only_after_absorption_or_proven_no_delta === true, "CONTINUIDADE_GLOBAL_RESIDUE_REMOVE");

  expect(policy?.enforcement?.consumer === "scripts/lupa/validar-porta-de-entrada.mjs", "CONTINUIDADE_GLOBAL_CONSUMER");
  expect(policy?.enforcement?.gate === GATE, "CONTINUIDADE_GLOBAL_GATE");
  expect(policy?.enforcement?.fail_closed === true, "CONTINUIDADE_GLOBAL_FAIL_CLOSED");
  expect(policy?.enforcement?.counterproof_required === true, "CONTINUIDADE_GLOBAL_COUNTERPROOF_REQUIRED");
  expect(policy?.enforcement?.future_execution_required === true, "CONTINUIDADE_GLOBAL_FUTURE_REQUIRED");
  expect(policy?.enforcement?.single_global_owner === CONTRACT, "CONTINUIDADE_GLOBAL_OWNER");
  const globalEverything = contract?.global_absorption_and_cockpit_policy;
  expect(globalEverything?.marker === "GLOBAL_EVERYTHING_INTO_CENTRALDARK", "GLOBAL_EVERYTHING_MARKER");
  expect(globalEverything?.scope === "GLOBAL", "GLOBAL_EVERYTHING_SCOPE");
  expect(globalEverything?.origin_is_not_architecture === true, "GLOBAL_ORIGIN_NOT_ARCHITECTURE");
  expect(globalEverything?.same_contract_regardless_of_origin === true, "GLOBAL_SAME_CONTRACT_ORIGIN");
  expect(globalEverything?.ingestion?.single_character_is_valid_input === true, "GLOBAL_SINGLE_CHARACTER_INPUT");
  expect(globalEverything?.ingestion?.whole_file_is_valid_input === true, "GLOBAL_WHOLE_FILE_INPUT");
  expect(globalEverything?.ingestion?.whole_package_is_valid_input === true, "GLOBAL_WHOLE_PACKAGE_INPUT");
  expect(globalEverything?.ingestion?.apply_into_existing_centraldark === true, "GLOBAL_APPLY_EXISTING_CENTRALDARK");
  expect(globalEverything?.ingestion?.create_parallel_system_for_new_input === false, "GLOBAL_NO_PARALLEL_SYSTEM");
  expect(globalEverything?.surfaces?.public_site?.canonical_host === "centralldark.com", "GLOBAL_PUBLIC_SITE_HOST");
  expect(globalEverything?.surfaces?.private_admin_cockpit?.canonical_host === "admin.centralldark.com", "GLOBAL_ADMIN_HOST");
  expect(globalEverything?.surfaces?.private_admin_cockpit?.access === "AUTHENTICATED_OWNER_ONLY", "GLOBAL_ADMIN_PRIVATE_ACCESS");
  expect(globalEverything?.surfaces?.private_admin_cockpit?.one_cockpit === true, "GLOBAL_ONE_COCKPIT");
  expect(globalEverything?.global_application?.all_current_components_inherit === true, "GLOBAL_CURRENT_COMPONENTS_INHERIT");
  expect(globalEverything?.global_application?.all_future_components_inherit === true, "GLOBAL_FUTURE_COMPONENTS_INHERIT");
  expect(globalEverything?.global_application?.every_addition_removal_update_uses_same_contract === true, "GLOBAL_MUTATIONS_SAME_CONTRACT");
  expect(globalEverything?.pr_mother_projection?.pr === 1562, "GLOBAL_PR_MOTHER_1562");
  const continuousReality = globalEverything?.continuous_reality_convergence;
  expect(continuousReality?.marker === "CONTINUOUS_REALITY_FIXED_POINT_LOOP", "GLOBAL_CONTINUOUS_LOOP_MARKER");
  expect(continuousReality?.scope === "GLOBAL_CONTINUOUS", "GLOBAL_CONTINUOUS_LOOP_SCOPE");
  expect(continuousReality?.main_movement_is_internal_trigger_not_user_interrupt === true, "GLOBAL_MAIN_MOVE_INTERNAL_TRIGGER");
  expect(continuousReality?.do_not_stop_to_report_main_movement === true, "GLOBAL_DO_NOT_STOP_ON_MAIN_MOVE");
  expect(continuousReality?.preserve_current_mission_across_head_changes === true, "GLOBAL_PRESERVE_MISSION_ACROSS_HEAD");
  expect(Array.isArray(continuousReality?.loop) && continuousReality.loop.join(">").includes("REMEASURE_HEAD>ABSORB_USEFUL_DELTA>FAST_FORWARD_VPS_WHEN_SAFE>MEASURE_RUNTIME>GRILL_ME>COUNTERPROOF"), "GLOBAL_CONTINUOUS_LOOP_ORDER");
  expect(continuousReality?.loop?.includes("REPEAT_IF_SOURCE_OF_TRUTH_ADVANCES"), "GLOBAL_CONTINUOUS_REPEAT");
  expect(continuousReality?.loop?.at?.(-1) === "STOP_ONLY_WHEN_REALITY_EQUALS_FIXED_POINT", "GLOBAL_STOP_ONLY_FIXED_POINT");
  expect(continuousReality?.stopping_condition?.only === "REALITY_EQUALS_FIXED_POINT", "GLOBAL_STOP_CONDITION_REALITY");
  expect(continuousReality?.invariants?.UNKNOWN_IS_NOT_PASS === true, "GLOBAL_UNKNOWN_NOT_PASS");
  expect(continuousReality?.invariants?.COMMITTED_IS_NOT_DEPLOYED === true, "GLOBAL_COMMITTED_NOT_DEPLOYED");
  expect(continuousReality?.invariants?.NO_BLIND_OVERWRITE === true, "GLOBAL_NO_BLIND_OVERWRITE");



  const markerCount = (contractText.match(/"marker"\s*:\s*"GLOBAL_CONTINUITY_HARD_GATE"/g) || []).length;
  expect(markerCount === 1, `CONTINUIDADE_GLOBAL_OWNER_COUNT:${markerCount}`);
  expect(gateText.includes("node scripts/lupa/validar-continuidade-global.mjs"), "CONTINUIDADE_GLOBAL_GATE_NOT_REACHABLE");
  expect(gateText.includes("node scripts/lupa/validar-porta-de-entrada.mjs"), "CONTINUIDADE_GLOBAL_CANONICAL_CONSUMER_NOT_REACHABLE");

  errors.push(...validateExtension(extension));
  for (const path of MAIN_WRITERS) {
    const text = writerTexts[path];
    if (typeof text !== "string") errors.push(`MAIN_WRITER_LOAD:${path}`);
    else errors.push(...validateMainWriter(path, text, sharedScriptText));
  }
  return errors;
}

function counterprove(contract, extension, contractText, portaText, gateText, writerTexts, sharedScriptText) {
  const variants = [];
  for (const key of ["REUSE_BEFORE_CREATE", "CONTINUE_BEFORE_RESTART", "ABSORB_BEFORE_DUPLICATE", "SEARCH_BEFORE_INVENT"]) {
    const candidate = clone(contract);
    candidate.global_continuity_policy.principles[key] = false;
    variants.push({ contract: candidate, extension, portaText, writerTexts, sharedScriptText });
  }

  const missingMaterial = clone(contract);
  missingMaterial.global_continuity_policy.material_scope = missingMaterial.global_continuity_policy.material_scope.filter((item) => item !== "MODEL");
  variants.push({ contract: missingMaterial, extension, portaText, writerTexts, sharedScriptText });

  const missingCreation = clone(contract);
  missingCreation.global_continuity_policy.creation_gate.create_new_only_if = missingCreation.global_continuity_policy.creation_gate.create_new_only_if.filter((item) => item !== "EXISTING_OWNER_FIT_FALSE");
  variants.push({ contract: missingCreation, extension, portaText, writerTexts, sharedScriptText });

  const fixedPointStops = clone(contract);
  fixedPointStops.global_continuity_policy.continuity.local_fixed_point_ends_global_mission = true;
  variants.push({ contract: fixedPointStops, extension, portaText, writerTexts, sharedScriptText });

  const residueProgress = clone(contract);
  residueProgress.global_continuity_policy.residue_policy.residue_is_progress = true;
  variants.push({ contract: residueProgress, extension, portaText, writerTexts, sharedScriptText });

  const authorityBypass = clone(contract);
  authorityBypass.mandatory_pre_solution_sequence = authorityBypass.mandatory_pre_solution_sequence.filter((item) => item !== "classify_authority_and_runtime_state");
  variants.push({ contract: authorityBypass, extension, portaText, writerTexts, sharedScriptText });

  variants.push({ contract: clone(contract), extension, portaText: portaText.replace("TEXTO_RECEBIDO != ORDEM_AUTOMATICA", ""), writerTexts, sharedScriptText });

  const writerPath = MAIN_WRITERS[0];
  const originalWriter = writerTexts[writerPath] || "";
  let brokenWriter = originalWriter;
  if (originalWriter.includes(SHARED_WRITER_PUSH)) {
    brokenWriter = originalWriter.replaceAll(SHARED_WRITER_PUSH, "");
  } else {
    brokenWriter = originalWriter.replace(PRE_MAIN_GATES[0], "");
  }
  const writerWithoutGate = { ...writerTexts, [writerPath]: brokenWriter };
  variants.push({ contract: clone(contract), extension, portaText, writerTexts: writerWithoutGate, sharedScriptText });

  const brokenExtension = clone(extension);
  brokenExtension.counterproof_transition.CONCLUSION_FALSIFIED = brokenExtension.counterproof_transition.CONCLUSION_FALSIFIED.filter((item) => item !== "EXECUTE_CORRECTION_IN_CURRENT_RUN_IF_AUTHORIZED");
  variants.push({ contract: clone(contract), extension: brokenExtension, portaText, writerTexts, sharedScriptText });

  return variants.every(({ contract: candidate, extension: candidateExtension, portaText: candidatePorta, writerTexts: candidateWriters, sharedScriptText: candidateShared }) =>
    validate(candidate, candidateExtension, contractText, candidatePorta, gateText, candidateWriters, candidateShared).length > 0
  );
}

let contract;
let extension;
let contractText = "";
let portaText = "";
let gateText = "";
let sharedScriptText = "";
const writerTexts = {};
const errors = [];
try {
  contractText = read(CONTRACT);
  contract = JSON.parse(contractText);
  extension = JSON.parse(read(EXTENSION));
  portaText = read(PORTA_VIVA);
  gateText = read(GATE);
  sharedScriptText = read(SHARED_WRITER_PUSH);
  for (const path of MAIN_WRITERS) writerTexts[path] = read(path);
} catch (error) {
  errors.push(`CONTINUIDADE_GLOBAL_LOAD:${error?.code || error?.name || "ERROR"}`);
}
if (contract && extension) {
  errors.push(...validate(contract, extension, contractText, portaText, gateText, writerTexts, sharedScriptText));
  if (errors.length === 0 && !counterprove(contract, extension, contractText, portaText, gateText, writerTexts, sharedScriptText)) errors.push("CONTINUIDADE_GLOBAL_COUNTERPROOF_FAILED");
}

const report = {
  guardrail: "validar-continuidade-global",
  owner: CONTRACT,
  extension: EXTENSION,
  scope: contract?.global_continuity_policy?.scope ?? null,
  temporal_scope: contract?.global_continuity_policy?.temporal_scope ?? null,
  main_writers: MAIN_WRITERS,
  removed_main_writers: REMOVED_MAIN_WRITERS,
  shared_writer_push: SHARED_WRITER_PUSH,
  input_authority_boundary: errors.some((item) => item.includes("AUTHORITY") || item.includes("INPUT_BOUNDARY")) ? "BLOCKED" : "PASS",
  counterproof: errors.length === 0 ? "PASS" : "BLOCKED",
  errors,
  ok: errors.length === 0,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else console.log(`CONTINUIDADE_GLOBAL=${report.ok ? "PASS" : "BLOCKED"} MAIN_WRITERS=${MAIN_WRITERS.length} EXTENSION=${extension ? "PASS" : "BLOCKED"} INPUT_AUTHORITY=${report.input_authority_boundary} COUNTERPROOF=${report.counterproof} ERRORS=${errors.length}`);
for (const error of errors) console.error(`ERRO ${error}`);
process.exit(report.ok ? 0 : 1);
