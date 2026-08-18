#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_PATH_RE = /\.(?:test|spec)\.[cm]?[jt]s$/i;
const WINDOWS_ABSOLUTE_RE = /^(?:[A-Za-z]:[\\/]|\\\\)/;

function emptyResult(errors = ["PROOF_OWNERSHIP_CONTRACT_INVALID"]) {
  return {
    ok: false,
    topology_only: true,
    invariant_proof: false,
    operational_claim_policy_ok: false,
    coverage_status: "UNKNOWN",
    invariant_count: 0,
    unregistered_known_count: 0,
    proof_classes: [],
    errors,
  };
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isRepoRelativePath(value) {
  if (!nonEmptyString(value)) return false;
  const raw = value.trim();
  if (raw.includes("\0") || isAbsolute(raw) || WINDOWS_ABSOLUTE_RE.test(raw)) return false;
  const slash = raw.replaceAll("\\", "/");
  if (slash.startsWith("/") || slash.split("/").includes("..")) return false;
  const normalized = normalize(slash).replaceAll("\\", "/");
  return normalized !== "." && normalized !== ".." && !normalized.startsWith("../");
}

function canonicalResponsibilityKey(invariant) {
  return `${String(invariant.source ?? "").trim()}::${String(invariant.consumer ?? "").trim()}`;
}

export function validateOperationalClaimPolicy(contract, { exists = () => true } = {}) {
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return ["OPERATIONAL_POLICY_CONTRACT_INVALID"];
  }

  const errors = [];
  const rules = contract.global_rules ?? {};
  const policy = contract.operational_claim_policy ?? {};
  const requiredRules = {
    reasoning_is_evidence: false,
    action_is_proof: false,
    writer_is_judge: false,
    self_proof_is_pass: false,
    absence_of_proof_is_failure: false,
    absence_of_check_is_pass: false,
    no_check_on_derived_head_is_failure: false,
    operational_claim_requires_enforcement: true,
    operational_claim_without_complete_chain: "UNPROVEN",
    documented_is_executed: false,
    declared_is_enforced: false,
    configured_is_active: false,
    implemented_is_reachable: false,
    triggered_is_completed: false,
    completed_is_correct: false,
    historical_pass_is_current_pass: false,
    proof_target_must_match_claim: true,
    local_fixed_point_is_end_of_intent: false,
  };
  for (const [key, expected] of Object.entries(requiredRules)) {
    if (rules[key] !== expected) errors.push(`OPERATIONAL_RULE_INVALID:${key}`);
  }

  if (policy.marker !== "OPERATIONAL_CLAIM_REQUIRES_ENFORCEMENT") errors.push("OPERATIONAL_POLICY_MARKER_INVALID");
  if (policy.applies_to !== "CLAIMS_THAT_PRODUCE_OR_GOVERN_BEHAVIOR") errors.push("OPERATIONAL_POLICY_SCOPE_INVALID");
  if (policy.technology_lock !== false) errors.push("OPERATIONAL_POLICY_TECHNOLOGY_LOCK_FORBIDDEN");
  if (policy.enforcement_must_be_proportional !== true) errors.push("OPERATIONAL_POLICY_PROPORTIONAL_ENFORCEMENT_REQUIRED");
  if (policy.runtime_status_is_topology_proof !== false) errors.push("OPERATIONAL_POLICY_TOPOLOGY_IS_NOT_RUNTIME_PROOF");
  if (policy.live_state_must_be_measured !== true) errors.push("OPERATIONAL_POLICY_LIVE_STATE_REQUIRED");
  if (policy.monitoring_requires_real_mechanism !== true) errors.push("OPERATIONAL_POLICY_REAL_MONITOR_REQUIRED");
  if (policy.fixed_point_scope_required !== true) errors.push("OPERATIONAL_POLICY_SCOPED_FIXED_POINT_REQUIRED");
  if (policy.judge_must_be_independent_of_writer !== true) errors.push("OPERATIONAL_POLICY_WRITER_JUDGE_SEPARATION_REQUIRED");
  if (policy.duplicate_only_when_same_authority_and_capability !== true) errors.push("OPERATIONAL_POLICY_DUPLICATE_RULE_INVALID");
  if (policy.preserve_layer_specific_implementations !== true) errors.push("OPERATIONAL_POLICY_LAYER_PRESERVATION_REQUIRED");

  const requiredChain = [
    "claim",
    "authority",
    "owner",
    "contract",
    "implementation_or_consumer",
    "enforcement",
    "execution",
    "observable_effect",
    "proof_target",
    "receipt",
    "counterproof",
    "live_state",
    "judge",
    "fixed_point_scope",
  ];
  if (!Array.isArray(policy.required_chain)) {
    errors.push("OPERATIONAL_POLICY_REQUIRED_CHAIN_MISSING");
  } else {
    for (const field of requiredChain) {
      if (!policy.required_chain.includes(field)) errors.push(`OPERATIONAL_POLICY_CHAIN_FIELD_MISSING:${field}`);
    }
  }

  const classifications = new Set(Array.isArray(policy.classifications) ? policy.classifications : []);
  for (const state of ["ENFORCED", "PARTIAL", "DOCUMENTATION_ONLY", "ORPHAN", "UNKNOWN", "NOT_APPLICABLE"]) {
    if (!classifications.has(state)) errors.push(`OPERATIONAL_POLICY_CLASSIFICATION_MISSING:${state}`);
  }

  const nonPass = new Set(Array.isArray(policy.non_pass_states) ? policy.non_pass_states : []);
  for (const state of ["UNKNOWN", "PENDING", "QUEUED", "SKIPPED", "CANCELLED"]) {
    if (!nonPass.has(state)) errors.push(`OPERATIONAL_POLICY_NON_PASS_STATE_MISSING:${state}`);
  }

  const profiles = policy.mechanism_profiles ?? {};
  for (const profile of [
    "CODE_RULE",
    "API_CONTRACT",
    "WORKFLOW",
    "DEPLOY",
    "PANEL",
    "ADMIN_DOCUMENTATION",
    "OPERATIONAL_MEMORY",
    "COMMAND",
    "SECURITY",
    "HUMAN_NON_AUTOMATABLE_RULE",
  ]) {
    if (!Array.isArray(profiles[profile]) || profiles[profile].length === 0) {
      errors.push(`OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:${profile}`);
    }
  }

  const invariantFields = new Set(Array.isArray(contract.required_fields_per_invariant) ? contract.required_fields_per_invariant : []);
  if (!invariantFields.has("operational_chain")) errors.push("OPERATIONAL_CHAIN_NOT_REQUIRED_PER_INVARIANT");

  for (const invariant of Array.isArray(contract.invariants) ? contract.invariants : []) {
    const chain = invariant?.operational_chain;
    const id = String(invariant?.id ?? "UNKNOWN");
    if (!chain || typeof chain !== "object" || Array.isArray(chain)) {
      errors.push(`OPERATIONAL_CHAIN_MISSING:${id}`);
      continue;
    }
    for (const field of requiredChain) {
      if (!nonEmptyString(chain[field])) errors.push(`OPERATIONAL_CHAIN_FIELD_INVALID:${id}:${field}`);
    }
    if (chain.live_state !== "MEASURE_AT_RUNTIME") errors.push(`OPERATIONAL_CHAIN_STALE_STATE_FORBIDDEN:${id}`);
    if (["FIXED_POINT", "MISSION"].includes(String(chain.fixed_point_scope ?? "").trim())) {
      errors.push(`OPERATIONAL_CHAIN_FIXED_POINT_SCOPE_INVALID:${id}`);
    }
    if (nonEmptyString(chain.judge) && chain.judge === invariant.prover) {
      errors.push(`OPERATIONAL_CHAIN_PROVER_JUDGE_COLLISION:${id}`);
    }
    if (chain.counterproof !== invariant.counterproof?.path) {
      errors.push(`OPERATIONAL_CHAIN_COUNTERPROOF_MISMATCH:${id}`);
    }

    for (const pathField of ["owner", "contract", "implementation_or_consumer", "enforcement", "receipt", "counterproof"]) {
      const candidate = chain[pathField];
      if (!nonEmptyString(candidate)) continue;
      const path = candidate.trim();
      if (!isRepoRelativePath(path)) {
        errors.push(`OPERATIONAL_CHAIN_PATH_OUTSIDE_REPO:${id}:${pathField}:${path}`);
        continue;
      }
      if (!exists(path)) errors.push(`OPERATIONAL_CHAIN_PATH_MISSING:${id}:${pathField}:${path}`);
    }
  }

  return errors;
}

export function validateProofOwnership(contract, { exists = () => true } = {}) {
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return emptyResult();
  }

  const errors = [];
  if (contract.schema_version !== 1) errors.push("PROOF_OWNERSHIP_SCHEMA_INVALID");
  if (contract.status !== "CANONICAL") errors.push("PROOF_OWNERSHIP_NOT_CANONICAL");
  if (contract.marker !== "PROOF_OWNERSHIP_REQUIRED") errors.push("PROOF_OWNERSHIP_MARKER_INVALID");
  if (contract.coverage_status !== "PARTIAL_EXPLICIT") errors.push("PROOF_OWNERSHIP_COVERAGE_MUST_BE_PARTIAL_EXPLICIT");
  if (contract.scope !== "TOPOLOGY_ONLY") errors.push("PROOF_OWNERSHIP_SCOPE_MUST_BE_TOPOLOGY_ONLY");

  const rules = contract.global_rules ?? {};
  const expectedRules = {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unregistered_invariant: "UNPROVEN_NOT_OWNED",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
    graph_structure_ok_is_not_invariant_proof: true,
    external_anchor_must_be_observed_by_responsible_prover: true,
    execution_status_is_out_of_scope: true,
  };
  for (const [key, expected] of Object.entries(expectedRules)) {
    if (rules[key] !== expected) errors.push(`PROOF_OWNERSHIP_RULE_INVALID:${key}`);
  }

  const operationalErrors = validateOperationalClaimPolicy(contract, { exists });
  errors.push(...operationalErrors);

  const allowedProofClasses = Array.isArray(contract.allowed_proof_classes) ? contract.allowed_proof_classes : [];
  if (allowedProofClasses.length === 0 || allowedProofClasses.some((item) => !nonEmptyString(item))) {
    errors.push("PROOF_OWNERSHIP_ALLOWED_CLASSES_INVALID");
  }
  const allowedClassSet = new Set(allowedProofClasses);

  const requiredRegistered = Array.isArray(contract.required_registered_invariants)
    ? contract.required_registered_invariants
    : [];
  if (requiredRegistered.some((item) => !nonEmptyString(item))) {
    errors.push("PROOF_OWNERSHIP_REQUIRED_REGISTERED_INVALID");
  }

  const invariants = Array.isArray(contract.invariants) ? contract.invariants : [];
  if (invariants.length === 0) errors.push("PROOF_OWNERSHIP_INVARIANTS_EMPTY");

  const ids = new Set();
  const ownerByClass = new Map();
  const ownerByResponsibility = new Map();
  const byId = new Map();

  for (const invariant of invariants) {
    if (!invariant || typeof invariant !== "object" || Array.isArray(invariant)) {
      errors.push("PROOF_OWNERSHIP_INVARIANT_INVALID");
      continue;
    }

    const stringFields = ["id", "proof_class", "source", "consumer", "prover", "negative_test"];
    for (const field of stringFields) {
      if (!nonEmptyString(invariant[field])) {
        errors.push(`PROOF_OWNERSHIP_FIELD_INVALID:${String(invariant.id ?? "UNKNOWN")}:${field}`);
      }
    }
    for (const field of ["counterproof", "external_anchor", "depends_on", "operational_chain"]) {
      if (invariant[field] == null) {
        errors.push(`PROOF_OWNERSHIP_FIELD_MISSING:${String(invariant.id ?? "UNKNOWN")}:${field}`);
      }
    }
    if (!Array.isArray(invariant.depends_on)) {
      errors.push(`PROOF_OWNERSHIP_DEPENDS_ON_INVALID:${String(invariant.id ?? "UNKNOWN")}`);
    } else if (invariant.depends_on.some((item) => !nonEmptyString(item))) {
      errors.push(`PROOF_OWNERSHIP_DEPENDS_ON_ITEM_INVALID:${String(invariant.id ?? "UNKNOWN")}`);
    }

    const id = nonEmptyString(invariant.id) ? invariant.id.trim() : "";
    if (!id) continue;
    if (ids.has(id)) errors.push(`PROOF_OWNERSHIP_DUPLICATE_ID:${id}`);
    ids.add(id);
    byId.set(id, invariant);

    const proofClass = nonEmptyString(invariant.proof_class) ? invariant.proof_class.trim() : "";
    const source = nonEmptyString(invariant.source) ? invariant.source.trim() : "";
    const consumer = nonEmptyString(invariant.consumer) ? invariant.consumer.trim() : "";
    const prover = nonEmptyString(invariant.prover) ? invariant.prover.trim() : "";
    const negativeTest = nonEmptyString(invariant.negative_test) ? invariant.negative_test.trim() : "";

    if (proofClass && !allowedClassSet.has(proofClass)) {
      errors.push(`PROOF_OWNERSHIP_PROOF_CLASS_NOT_CANONICAL:${id}:${proofClass}`);
    }

    if (proofClass && prover) {
      const currentOwner = ownerByClass.get(proofClass);
      if (currentOwner && currentOwner !== prover) {
        errors.push(`PROOF_OWNERSHIP_DUPLICATE_OWNER:${proofClass}:${currentOwner}:${prover}`);
      } else {
        ownerByClass.set(proofClass, prover);
      }
    }

    if (source && consumer && source === consumer) {
      errors.push(`PROOF_OWNERSHIP_SOURCE_IS_CONSUMER:${id}`);
    }
    if (prover && consumer && prover === consumer) {
      errors.push(`PROOF_OWNERSHIP_PROVER_IS_CONSUMER:${id}`);
    }
    if (prover && negativeTest && prover === negativeTest) {
      errors.push(`PROOF_OWNERSHIP_SELF_TEST:${id}`);
    }
    if (negativeTest && !TEST_PATH_RE.test(negativeTest)) {
      errors.push(`PROOF_OWNERSHIP_NEGATIVE_TEST_NOT_EXECUTABLE_TEST:${id}:${negativeTest}`);
    }

    const responsibilityKey = canonicalResponsibilityKey(invariant);
    if (source && consumer && prover) {
      const existing = ownerByResponsibility.get(responsibilityKey);
      if (existing && existing !== prover) {
        errors.push(`PROOF_OWNERSHIP_DUPLICATE_RESPONSIBILITY:${id}:${existing}:${prover}`);
      } else {
        ownerByResponsibility.set(responsibilityKey, prover);
      }
    }

    if (!invariant.counterproof || typeof invariant.counterproof !== "object" || Array.isArray(invariant.counterproof)) {
      errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_MISSING:${id}`);
    } else {
      const counterproofPath = nonEmptyString(invariant.counterproof.path) ? invariant.counterproof.path.trim() : "";
      const counterproofKind = nonEmptyString(invariant.counterproof.kind) ? invariant.counterproof.kind.trim() : "";
      const observation = nonEmptyString(invariant.counterproof.observation) ? invariant.counterproof.observation.trim() : "";
      if (!counterproofPath || !counterproofKind || !observation) {
        errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_INCOMPLETE:${id}`);
      }
      if (invariant.counterproof.independent_from_prover !== true) {
        errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_NOT_INDEPENDENT:${id}`);
      }
      if (counterproofPath && counterproofPath === prover) {
        errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_IS_PROVER:${id}`);
      }
      if (counterproofKind === "negative_test_suite" && counterproofPath !== negativeTest) {
        errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_NOT_NEGATIVE_TEST:${id}`);
      }
      if (counterproofKind === "negative_test_suite" && counterproofPath && !TEST_PATH_RE.test(counterproofPath)) {
        errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_NOT_EXECUTABLE_TEST:${id}`);
      }
    }

    if (!invariant.external_anchor || typeof invariant.external_anchor !== "object" || Array.isArray(invariant.external_anchor)) {
      errors.push(`PROOF_OWNERSHIP_EXTERNAL_ANCHOR_MISSING:${id}`);
    } else {
      const kind = nonEmptyString(invariant.external_anchor.kind) ? invariant.external_anchor.kind.trim() : "";
      const observation = nonEmptyString(invariant.external_anchor.observation) ? invariant.external_anchor.observation.trim() : "";
      const anchorPath = nonEmptyString(invariant.external_anchor.path) ? invariant.external_anchor.path.trim() : "";
      const eventField = nonEmptyString(invariant.external_anchor.event_field) ? invariant.external_anchor.event_field.trim() : "";
      if (!kind || /validator_output|self/i.test(kind)) {
        errors.push(`PROOF_OWNERSHIP_EXTERNAL_ANCHOR_INVALID:${id}:${kind || "EMPTY"}`);
      }
      if (!observation) errors.push(`PROOF_OWNERSHIP_EXTERNAL_OBSERVATION_MISSING:${id}`);
      if (kind === "github_event_label" && !eventField) {
        errors.push(`PROOF_OWNERSHIP_EXTERNAL_EVENT_FIELD_MISSING:${id}`);
      }
      if (kind !== "github_event_label" && !anchorPath) {
        errors.push(`PROOF_OWNERSHIP_EXTERNAL_PATH_MISSING:${id}`);
      }
    }

    const repoPaths = [
      source,
      consumer,
      prover,
      negativeTest,
      invariant.counterproof?.path,
      invariant.external_anchor?.path,
    ].filter((value) => value != null && value !== "");

    for (const candidate of repoPaths) {
      if (!nonEmptyString(candidate)) {
        errors.push(`PROOF_OWNERSHIP_PATH_TYPE_INVALID:${id}`);
        continue;
      }
      const path = candidate.trim();
      if (!isRepoRelativePath(path)) {
        errors.push(`PROOF_OWNERSHIP_PATH_OUTSIDE_REPO:${id}:${path}`);
        continue;
      }
      if (!exists(path)) errors.push(`PROOF_OWNERSHIP_PATH_MISSING:${id}:${path}`);
    }
  }

  for (const requiredId of requiredRegistered) {
    if (!ids.has(requiredId)) errors.push(`PROOF_OWNERSHIP_REQUIRED_INVARIANT_MISSING:${requiredId}`);
  }

  const unregisteredKnown = Array.isArray(contract.unregistered_known_invariants)
    ? contract.unregistered_known_invariants
    : [];
  for (const item of unregisteredKnown) {
    if (!item || typeof item !== "object" || !nonEmptyString(item.id)) {
      errors.push("PROOF_OWNERSHIP_UNREGISTERED_KNOWN_INVALID");
      continue;
    }
    if (item.status !== "UNPROVEN_NOT_OWNED") {
      errors.push(`PROOF_OWNERSHIP_UNREGISTERED_STATUS_INVALID:${item.id}`);
    }
    if (ids.has(item.id)) errors.push(`PROOF_OWNERSHIP_REGISTERED_AND_UNREGISTERED:${item.id}`);
  }

  const effectiveDeps = new Map();
  for (const invariant of invariants) {
    if (!invariant || !nonEmptyString(invariant.id)) continue;
    effectiveDeps.set(invariant.id.trim(), new Set(Array.isArray(invariant.depends_on) ? invariant.depends_on : []));
  }

  for (const invariant of invariants) {
    if (!invariant || !nonEmptyString(invariant.id)) continue;
    const id = invariant.id.trim();
    for (const dependency of Array.isArray(invariant.depends_on) ? invariant.depends_on : []) {
      if (!byId.has(dependency)) errors.push(`PROOF_OWNERSHIP_UNKNOWN_DEPENDENCY:${id}:${dependency}`);
    }
    for (const other of invariants) {
      if (!other || id === other.id || !nonEmptyString(other.prover)) continue;
      if (invariant.consumer === other.prover) effectiveDeps.get(id)?.add(other.id);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      errors.push(`PROOF_OWNERSHIP_CYCLE:${id}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of effectiveDeps.get(id) ?? []) {
      if (byId.has(dependency)) visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);

  return {
    ok: errors.length === 0,
    topology_only: true,
    invariant_proof: false,
    operational_claim_policy_ok: operationalErrors.length === 0,
    coverage_status: contract.coverage_status,
    invariant_count: invariants.length,
    unregistered_known_count: unregisteredKnown.length,
    proof_classes: [...ownerByClass.keys()].sort(),
    errors,
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    out[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args["repo-root"] ?? process.cwd());
  const contractPath = args.contract ?? "docs/CONSCIENCIA/PROOF-OWNERSHIP.json";
  let contract;
  try {
    contract = JSON.parse(readFileSync(resolve(root, contractPath), "utf8"));
  } catch (error) {
    console.error(`PROOF_OWNERSHIP_LOAD_ERROR=${error.message}`);
    process.exit(1);
  }

  const result = validateProofOwnership(contract, {
    exists: (relativePath) => {
      if (!isRepoRelativePath(relativePath)) return false;
      const candidate = resolve(root, relativePath);
      const prefix = root.endsWith(sep) ? root : `${root}${sep}`;
      return candidate.startsWith(prefix) && existsSync(candidate);
    },
  });

  for (const error of result.errors) console.error(`ERRO ${error}`);
  console.log(`PROOF_GRAPH_STRUCTURE_OK=${result.ok ? 1 : 0} OPERATIONAL_CLAIM_POLICY=${result.operational_claim_policy_ok ? 1 : 0} COVERAGE=${result.coverage_status} TOPOLOGY_ONLY=1 INVARIANT_PROOF=0 INVARIANTS=${result.invariant_count} UNREGISTERED_KNOWN=${result.unregistered_known_count} CLASSES=${result.proof_classes.length} ERROS=${result.errors.length}`);
  process.exit(result.ok ? 0 : 1);
}
