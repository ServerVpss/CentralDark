# COMANDO - proof-ownership.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\proof-ownership.mjs
**SHA:** 6e77f3bb21b7b499
**Timestamp:** 2026-08-28T02:57:36.150738
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const invariantFields = new Set(Array.isArray(contract.required_fields_per_invariant) ? contract.required_fields_per_invariant : []);
- unregistered_invariant: "UNPROVEN_NOT_OWNED",
- contract = JSON.parse(readFileSync(resolve(root, contractPath), "utf8"));

### Principios
- const invariantFields = new Set(Array.isArray(contract.required_fields_per_invariant) ? contract.required_fields_per_invariant : []);
- unregistered_invariant: "UNPROVEN_NOT_OWNED",

### Gaps
- if (!coverageScopes.has(scope)) errors.push(`OPERATIONAL_COVERAGE_SCOPE_MARKER_MISSING:${scope}`);
- if (!receiptFields.has(field)) errors.push(`OPERATIONAL_COVERAGE_RECEIPT_FIELD_MISSING:${field}`);
- if (!policy.required_chain.includes(field)) errors.push(`OPERATIONAL_POLICY_CHAIN_FIELD_MISSING:${field}`);
- if (!classifications.has(state)) errors.push(`OPERATIONAL_POLICY_CLASSIFICATION_MISSING:${state}`);
- if (!nonPass.has(state)) errors.push(`OPERATIONAL_POLICY_NON_PASS_STATE_MISSING:${state}`);
- errors.push(`OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:${profile}`);
- errors.push(`OPERATIONAL_CHAIN_MISSING:${id}`);
- if (!exists(path)) errors.push(`OPERATIONAL_CHAIN_PATH_MISSING:${id}:${pathField}:${path}`);
- errors.push(`PROOF_OWNERSHIP_FIELD_MISSING:${String(invariant.id ?? "UNKNOWN")}:${field}`);
- errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_MISSING:${id}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
    tool_unavailable_without_attempt: "UNPROVEN",
    source_listing_is_content_read: false,
    repository_tree_is_full_content_read: false,
    partial_retrieval_is_total_coverage: false,
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
  if (policy.duplicate_only_when_same_authority_and_capability !== true) errors.push("OPERATIONAL_POLICY_DUPLICATE_RULE_INVALID");
  if (policy.preserve_layer_specific_implementations !== true) errors.push("OPERATIONAL_POLICY_LAYER_PRESERVATION_REQUIRED");

  const coveragePolicy = policy.coverage_claim_policy ?? {};
  if (coveragePolicy.marker !== "SOURCE_COVERAGE_RECEIPT_REQUIRED") {
    errors.push("OPERATIONAL_COVERAGE_POLICY_MARKER_INVALID");
  }
  if (coveragePolicy.tool_attempt_required_before_unavailable_claim !== true) {
    errors.push("OPERATIONAL_COVERAGE_TOOL_ATTEMPT_REQUIRED");
  }
  if (coveragePolicy.tree_or_listing_counts_as_content_read !== false) {
    errors.push("OPERATIONAL_COVERAGE_TREE_LISTING_NOT_CONTENT_READ");
  }
  if (coveragePolicy.partial_retrieval_counts_as_total_coverage !== false) {
    errors.push("OPERATIONAL_COVERAGE_PARTIAL_NOT_TOTAL");
  }

  const coverageScopes = new Set(Array.isArray(coveragePolicy.applies_when_scope_is) ? coveragePolicy.applies_when_scope_is : []);
  for (const scope of ["ALL", "WHOLE", "ENTIRE", "100%", "COMPLETE", "EXHAUSTIVE"]) {
    if (!coverageScopes.has(scope)) errors.push(`OPERATIONAL_COVERAGE_SCOPE_MARKER_MISSING:${scope}`);
  }

  const receiptFields = new Set(Array.isArray(coveragePolicy.required_receipt_fields) ? coveragePolicy.required_receipt_fields : []);
  for (const field of [
    "source_and_ref",
    "inventory_denominator",
    "content_read_numerator",
    "skipped_or_excluded",
    "truncation_or_pagination",
    "method",
    "limitations",
  ]) {
    if (!receiptFields.
```