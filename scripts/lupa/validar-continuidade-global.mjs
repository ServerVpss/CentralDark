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
const GATE = ".github/workflows/porta-de-entrada.yml";

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
};

const read = (path) => readFileSync(join(ROOT, path), "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const hasAll = (actual, expected) => {
  const set = new Set(Array.isArray(actual) ? actual : []);
  return expected.every((item) => set.has(item));
};

function validate(policy, contractText, gateText) {
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

  const markerCount = (contractText.match(/"marker"\s*:\s*"GLOBAL_CONTINUITY_HARD_GATE"/g) || []).length;
  expect(markerCount === 1, `CONTINUIDADE_GLOBAL_OWNER_COUNT:${markerCount}`);
  expect(gateText.includes("node scripts/lupa/validar-continuidade-global.mjs"), "CONTINUIDADE_GLOBAL_GATE_NOT_REACHABLE");
  expect(gateText.includes("node scripts/lupa/validar-porta-de-entrada.mjs"), "CONTINUIDADE_GLOBAL_CANONICAL_CONSUMER_NOT_REACHABLE");
  return errors;
}

function counterprove(policy, contractText, gateText) {
  const variants = [];
  for (const key of ["REUSE_BEFORE_CREATE", "CONTINUE_BEFORE_RESTART", "ABSORB_BEFORE_DUPLICATE", "SEARCH_BEFORE_INVENT"]) {
    const candidate = clone(policy);
    candidate.principles[key] = false;
    variants.push(candidate);
  }
  const missingMaterial = clone(policy);
  missingMaterial.material_scope = missingMaterial.material_scope.filter((item) => item !== "MODEL");
  variants.push(missingMaterial);
  const missingCreation = clone(policy);
  missingCreation.creation_gate.create_new_only_if = missingCreation.creation_gate.create_new_only_if.filter((item) => item !== "EXISTING_OWNER_FIT_FALSE");
  variants.push(missingCreation);
  const fixedPointStops = clone(policy);
  fixedPointStops.continuity.local_fixed_point_ends_global_mission = true;
  variants.push(fixedPointStops);
  const residueProgress = clone(policy);
  residueProgress.residue_is_progress = true;
  residueProgress.residue_policy.residue_is_progress = true;
  variants.push(residueProgress);
  return variants.every((candidate) => validate(candidate, contractText, gateText).length > 0);
}

let contract;
let contractText = "";
let gateText = "";
const errors = [];
try {
  contractText = read(CONTRACT);
  contract = JSON.parse(contractText);
  gateText = read(GATE);
} catch (error) {
  errors.push(`CONTINUIDADE_GLOBAL_LOAD:${error?.code || error?.name || "ERROR"}`);
}
if (contract) {
  errors.push(...validate(contract.global_continuity_policy, contractText, gateText));
  if (errors.length === 0 && !counterprove(contract.global_continuity_policy, contractText, gateText)) errors.push("CONTINUIDADE_GLOBAL_COUNTERPROOF_FAILED");
}

const report = {
  guardrail: "validar-continuidade-global",
  owner: CONTRACT,
  scope: contract?.global_continuity_policy?.scope ?? null,
  temporal_scope: contract?.global_continuity_policy?.temporal_scope ?? null,
  counterproof: errors.length === 0 ? "PASS" : "BLOCKED",
  errors,
  ok: errors.length === 0,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else console.log(`CONTINUIDADE_GLOBAL=${report.ok ? "PASS" : "BLOCKED"} COUNTERPROOF=${report.counterproof} ERRORS=${errors.length}`);
for (const error of errors) console.error(`ERRO ${error}`);
process.exit(report.ok ? 0 : 1);
