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
    "EXIT_CODE_IS_SIGNAL_NOT_ROOT_CAUSE",
    "EXIT_CODE_ZERO_ALONE_IS_NOT_PASS",
    "ANY_NONZERO_EXIT_REQUIRES_CAUSAL_DIAGNOSIS",
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

export function classifyProcessExit(input = {}) {
  const rawCode = input.exit_code ?? input.code ?? null;
  const parsedCode = rawCode === null || rawCode === undefined || rawCode === ""
    ? null
    : Number(rawCode);
  const exitCode = Number.isInteger(parsedCode) ? parsedCode : null;
  const signal = input.signal ? String(input.signal) : null;
  const shellSemantics = bool(input.shell_semantics);
  const stdout = String(input.stdout ?? "");
  const stderr = String(input.stderr ?? "");
  const combined = `${stdout}\n${stderr}`;
  const explicitCause = String(input.classified_failure ?? input.cause ?? "").trim();
  const causalEvidence = String(input.causal_evidence ?? "").trim();

  let shellHint = "NO_UNIVERSAL_NUMERIC_MEANING";
  if (shellSemantics && exitCode !== null) {
    if (exitCode === 0) shellHint = "SUCCESS_CANDIDATE";
    else if (exitCode === 1) shellHint = "GENERIC_FAILURE";
    else if (exitCode === 2) shellHint = "USAGE_OR_POLICY_CANDIDATE";
    else if (exitCode === 126) shellHint = "NOT_EXECUTABLE_CANDIDATE";
    else if (exitCode === 127) shellHint = "COMMAND_NOT_FOUND_CANDIDATE";
    else if (exitCode >= 129 && exitCode <= 255) shellHint = "SIGNAL_TERMINATION_CANDIDATE";
    else shellHint = "NONZERO_UNCLASSIFIED";
  }

  const deterministicPatterns = [
    [/refusing to merge unrelated histories/i, "UNRELATED_HISTORIES"],
    [/(?:command not found|not recognized as an internal or external command)/i, "COMMAND_NOT_FOUND"],
    [/(?:permission denied|operation not permitted)/i, "PERMISSION_DENIED"],
    [/(?:no such file or directory|cannot find the (?:file|path))/i, "PATH_OR_FILE_MISSING"],
    [/(?:timed? out|timeout)/i, "TIMEOUT"],
    [/(?:address already in use|EADDRINUSE)/i, "PORT_ALREADY_IN_USE"],
    [/(?:syntax error|SyntaxError)/i, "SYNTAX_ERROR"],
    [/(?:authentication failed|unauthorized|401 Unauthorized)/i, "AUTHENTICATION_FAILED"],
  ];

  let classifiedFailure = explicitCause || null;
  if (!classifiedFailure && exitCode !== 0) {
    classifiedFailure = deterministicPatterns.find(([pattern]) => pattern.test(combined))?.[1] ?? null;
  }

  const rootCauseProven = exitCode === 0
    ? false
    : Boolean(classifiedFailure && (causalEvidence || deterministicPatterns.some(([pattern, name]) => name === classifiedFailure && pattern.test(combined))));

  return {
    marker: "CENTRALDARK_EXIT_CODE_DIAGNOSIS_REQUIRED",
    exit_code: exitCode,
    signal,
    shell_semantics: shellSemantics,
    shell_hint: shellHint,
    status: exitCode === 0 ? "SUCCESS_CANDIDATE" : "BLOCKED_REQUIRES_CAUSAL_DIAGNOSIS",
    pass: false,
    effect_proof_required: exitCode === 0,
    causal_diagnosis_required: exitCode !== 0,
    classified_failure: classifiedFailure ?? "UNKNOWN",
    root_cause_proven: rootCauseProven,
    numeric_code_is_root_cause: false,
    unknown_is_pass: false,
    next_cursor: exitCode === 0
      ? "MEASURE_EFFECT_AND_RECEIPT_BEFORE_GREEN"
      : rootCauseProven
        ? "REUSE_EXISTING_OWNER_APPLY_MINIMUM_CAUSAL_DELTA_RETEST"
        : "INSPECT_STDOUT_STDERR_RUNTIME_SOURCE_AND_DISCRIMINATE_CAUSE",
  };
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

  const exit0 = classifyProcessExit({ exit_code: 0, shell_semantics: true });
  const exit1 = classifyProcessExit({ exit_code: 1, shell_semantics: true, stderr: "generic failure" });
  const exit2 = classifyProcessExit({ exit_code: 2, shell_semantics: true, stderr: "policy blocked" });
  const exit127 = classifyProcessExit({ exit_code: 127, shell_semantics: true, stderr: "command not found" });
  const exit128Unrelated = classifyProcessExit({
    exit_code: 128,
    shell_semantics: true,
    stderr: "fatal: refusing to merge unrelated histories",
  });
  const exit42 = classifyProcessExit({ exit_code: 42, shell_semantics: true, stderr: "tool specific failure" });

  const samples = [reusableCi, reusableExecutable];
  const receiptGatePass = blockedWithoutReceipt.pass === false &&
    blockedWithoutReceipt.errors.includes("RECEIPT_REQUIRED_BEFORE_GREEN");
  const exitGatePass =
    exit0.pass === false &&
    exit0.effect_proof_required === true &&
    exit1.causal_diagnosis_required === true &&
    exit2.shell_hint === "USAGE_OR_POLICY_CANDIDATE" &&
    exit127.classified_failure === "COMMAND_NOT_FOUND" &&
    exit128Unrelated.classified_failure === "UNRELATED_HISTORIES" &&
    exit128Unrelated.root_cause_proven === true &&
    exit42.shell_hint === "NONZERO_UNCLASSIFIED" &&
    exit42.classified_failure === "UNKNOWN";

  return {
    status: samples.every((sample) => sample.pass) && receiptGatePass && exitGatePass ? "PASS" : "FAIL",
    marker: UNIVERSAL_EXECUTION_STANDARD.marker,
    samples,
    blocked_without_receipt: blockedWithoutReceipt,
    exit_code_diagnosis: { exit0, exit1, exit2, exit127, exit128Unrelated, exit42 },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = selfTest();
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.status === "PASS" ? 0 : 1);
}
