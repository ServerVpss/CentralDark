#!/usr/bin/env node

export const UNIVERSAL_EXECUTION_STANDARD = Object.freeze({
  marker: "CENTRALDARK_UNIVERSAL_EXECUTION_STANDARD",
  status: "CANDIDATE_CANONICAL_UNTIL_SAME_HEAD_CI",
  owner_contract: "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json",
  owner_spine: "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md",
  rule: "REUSE_OR_EXTEND_BEFORE_CREATE_MINIMAL",
  applies_to: [
    "architecture",
    "ci",
    "cd",
    "workflow",
    "executable",
    "desktop_app",
    "cli",
    "mcp",
    "router",
    "site",
    "api",
    "vps",
    "obsidian",
    "remote_bridge",
    "model_provider",
    "future_surface",
  ],
  invariants: [
    "ONE_CORE_MANY_ARMS",
    "REUSE_BEFORE_CREATE",
    "EXTEND_EXISTING_WHEN_PARTIAL",
    "CREATE_MINIMAL_ONLY_AFTER_PROVED_GAP",
    "ONE_WRITER_PER_SCOPE",
    "PARALLEL_READ_ONLY_PERCEPTION",
    "UNKNOWN_IS_NOT_PASS",
    "ACTION_IS_NOT_PROOF",
    "POST_PROBE_BEFORE_GREEN",
    "RECEIPT_REQUIRED_BEFORE_GREEN",
    "MODEL_VOTE_IS_NOT_TRUTH",
    "DETERMINISTIC_FALLBACK_BEFORE_PROVIDER_DEPENDENCE",
  ],
  model_policy: {
    n_models_supported: true,
    fixed_model_denominator: false,
    missing_provider_is_global_failure: false,
    no_model_available: "DETERMINISTIC_FALLBACK_OR_SETUP",
    unsupported_n_models: "ADD_ADAPTER_OR_ROUTER_CAPABILITY; DO_NOT_FORK_CORE",
    selection_order: ["health", "capability", "policy", "cost", "latency", "context_window"],
    vote_as_truth: false,
  },
  evidence_policy: {
    required_before_green: ["target", "scope", "provenance", "action", "post_probe", "receipt"],
    ci_cd_requires_same_head: true,
    executable_requires_hash_or_signature: true,
    runtime_required_for_deployed_claim: true,
    documented_is_not_executed: true,
    receipt_required_before_green: true,
  },
});

const KNOWN_UNKNOWN = new Set([undefined, null, "", "UNKNOWN", "unknown", "?", "UNMEASURED"]);
const SUPPORTED_DECISIONS = new Set(["REUSE", "EXTEND_EXISTING", "CREATE_MINIMAL", "DETERMINISTIC_FALLBACK", "BLOCKED_UNKNOWN", "BLOCKED_SETUP"]);

function known(value) {
  return !KNOWN_UNKNOWN.has(value);
}

function bool(value) {
  return value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
}

function state(value) {
  if (bool(value)) return "PRESENT";
  if (value === false || value === "false" || value === "FALSE" || value === 0 || value === "0") return "GAP";
  if (value === "PRESENT" || value === "GAP") return value;
  return "UNKNOWN";
}

export function normalizeModelSet(models = []) {
  if (!Array.isArray(models)) return [];
  return models
    .map((model, index) => ({
      id: String(model?.id ?? model?.name ?? `model-${index}`).trim(),
      health: String(model?.health ?? model?.state ?? "UNKNOWN").toUpperCase(),
      capability: Array.isArray(model?.capability) ? model.capability : [],
      required: bool(model?.required),
      priority: Number.isFinite(model?.priority) ? model.priority : index,
    }))
    .filter((model) => model.id.length > 0)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

export function selectModel(models = []) {
  const normalized = normalizeModelSet(models);
  return (
    normalized.find((model) => model.health === "PROVED") ??
    normalized.find((model) => model.health === "READY") ??
    normalized.find((model) => model.health === "SETUP") ??
    null
  );
}

export function decideUniversalExecution(input = {}) {
  const surface = String(input.surface ?? "future_surface").toLowerCase();
  const ownerState = state(input.owner_present);
  const capabilityState = state(input.capability_present);
  const sameScope = state(input.same_scope);
  const evidencePresent = bool(input.evidence_present);
  const gapMeasured = bool(input.gap_measured);
  const postProbePassed = bool(input.post_probe_passed);
  const receiptRequired = input.receipt_required === undefined ? false : bool(input.receipt_required);
  const receiptPresent = bool(input.receipt_present);
  const deterministicFallback = bool(input.deterministic_fallback);
  const supportsNModels = input.supports_n_models === undefined ? true : bool(input.supports_n_models);
  const models = normalizeModelSet(input.models);
  const selectedModel = selectModel(models);

  const errors = [];
  const facts = [];
  let decision = "BLOCKED_UNKNOWN";

  if (!evidencePresent) errors.push("EVIDENCE_REQUIRED_BEFORE_GREEN");
  if (!postProbePassed) errors.push("POST_PROBE_REQUIRED_BEFORE_GREEN");
  if (receiptRequired && !receiptPresent) errors.push("RECEIPT_REQUIRED_BEFORE_GREEN");

  if (ownerState === "PRESENT" && capabilityState === "PRESENT" && sameScope === "PRESENT") {
    decision = "REUSE";
    facts.push("EXISTING_OWNER_AND_CAPABILITY_REUSED");
  } else if (ownerState === "PRESENT" && sameScope === "PRESENT") {
    decision = "EXTEND_EXISTING";
    facts.push("EXISTING_OWNER_EXTENDED_MINIMALLY");
  } else if (ownerState === "GAP" && capabilityState === "GAP" && sameScope === "GAP" && gapMeasured) {
    decision = "CREATE_MINIMAL";
    facts.push("MEASURED_GAP_AUTHORIZES_MINIMAL_CREATION");
  } else {
    errors.push("OWNER_CAPABILITY_SCOPE_NOT_PROVED");
  }

  if (!supportsNModels) {
    facts.push("N_MODEL_SUPPORT_ADAPTER_REQUIRED");
    if (decision === "CREATE_MINIMAL") decision = "EXTEND_EXISTING";
  }

  const modelRequired = bool(input.model_required);
  if (modelRequired && !selectedModel && !deterministicFallback) {
    decision = "BLOCKED_SETUP";
    errors.push("MODEL_REQUIRED_BUT_NO_MODEL_AND_NO_DETERMINISTIC_FALLBACK");
  }
  if (!selectedModel && deterministicFallback) {
    facts.push("DETERMINISTIC_FALLBACK_AVAILABLE");
    if (decision === "BLOCKED_UNKNOWN" && errors.every((error) => error !== "OWNER_CAPABILITY_SCOPE_NOT_PROVED")) {
      decision = "DETERMINISTIC_FALLBACK";
    }
  }
  if (selectedModel) facts.push(`MODEL_SELECTED:${selectedModel.id}:${selectedModel.health}`);

  if (["ci", "cd", "workflow"].includes(surface)) {
    if (!bool(input.same_head)) errors.push("CI_CD_REQUIRES_SAME_HEAD");
    facts.push("CI_CD_USES_UNIVERSAL_STANDARD");
  }

  if (["exe", ".exe", "executable", "desktop_app"].includes(surface)) {
    if (!known(input.artifact_hash) && !known(input.signature)) errors.push("EXECUTABLE_REQUIRES_HASH_OR_SIGNATURE");
    if (!bool(input.launch_probe_passed)) errors.push("EXECUTABLE_REQUIRES_LAUNCH_PROBE");
    facts.push("EXECUTABLE_USES_UNIVERSAL_STANDARD");
  }

  if (!SUPPORTED_DECISIONS.has(decision)) errors.push(`UNSUPPORTED_DECISION:${decision}`);

  const pass = errors.length === 0;
  return {
    marker: UNIVERSAL_EXECUTION_STANDARD.marker,
    surface,
    decision: pass ? decision : decision.startsWith("BLOCKED") ? decision : "BLOCKED_UNKNOWN",
    pass,
    facts,
    errors,
    selected_model: selectedModel,
    model_count: models.length,
    n_models_supported: supportsNModels,
    receipt_required: receiptRequired,
    receipt_present: receiptPresent,
    vote_as_truth: false,
  };
}

function selfTest() {
  const reusableCi = decideUniversalExecution({
    surface: "ci",
    owner_present: true,
    capability_present: true,
    same_scope: true,
    evidence_present: true,
    post_probe_passed: true,
    receipt_required: true,
    receipt_present: true,
    same_head: true,
    models: [{ id: "deterministic", health: "PROVED" }],
  });
  const reusableExecutable = decideUniversalExecution({
    surface: "executable",
    owner_present: true,
    capability_present: false,
    same_scope: true,
    evidence_present: true,
    post_probe_passed: true,
    receipt_required: true,
    receipt_present: true,
    artifact_hash: "sha256:local",
    launch_probe_passed: true,
    deterministic_fallback: true,
  });
  const blockedWithoutReceipt = decideUniversalExecution({
    surface: "ci",
    owner_present: true,
    capability_present: true,
    same_scope: true,
    evidence_present: true,
    post_probe_passed: true,
    receipt_required: true,
    receipt_present: false,
    same_head: true,
  });

  const samples = [reusableCi, reusableExecutable];
  const receiptGatePass = blockedWithoutReceipt.pass === false &&
    blockedWithoutReceipt.errors.includes("RECEIPT_REQUIRED_BEFORE_GREEN");
  return {
    status: samples.every((sample) => sample.pass) && receiptGatePass ? "PASS" : "FAIL",
    marker: UNIVERSAL_EXECUTION_STANDARD.marker,
    samples,
    blocked_without_receipt: blockedWithoutReceipt,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = selfTest();
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.status === "PASS" ? 0 : 1);
}
