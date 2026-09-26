# COMANDO - proof-ownership.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\proof-ownership.test.mjs
**SHA:** 0308400e76e730c5
**Timestamp:** 2026-08-28T02:57:36.166143
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const CANONICAL_CONTRACT = resolve(ROOT, "docs/CONSCIENCIA/PROOF-OWNERSHIP.json");
- contract: "docs/CONSCIENCIA/PROOF-OWNERSHIP.json",
- const makeInvariant = (overrides = {}) => ({
- API_CONTRACT: ["schema", "implementation", "consumer_test"],
- const baseContract = () => ({
- unregistered_invariant: "UNPROVEN_NOT_OWNED",
- required_fields_per_invariant: [
- const contract = baseContract();
- const contract = baseContract();
- const contract = baseContract();

### Principios
- const makeInvariant = (overrides = {}) => ({
- unregistered_invariant: "UNPROVEN_NOT_OWNED",
- required_fields_per_invariant: [

### Gaps
- assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COUNTERPROOF_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
- assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_EXTERNAL_EVENT_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
- assert.ok(errorsFor(contractA).includes("PROOF_OWNERSHIP_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT:depends_on"));
- assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_REQUIRED_INVARIANT_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
- assert.ok(validateOperationalClaimPolicy(noDenominator, { exists: repoPathExists }).includes("OPERATIONAL_COVERAGE_RECEIPT_FIELD_MISSING:inventory_denominator"));
- assert.ok(validateOperationalClaimPolicy(contract, { exists: repoPathExists }).includes("OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:API_CONTRACT"));

### Ouro Bruto (primeiros 5000 chars)
```
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  isRepoRelativePath,
  validateOperationalClaimPolicy,
  validateProofOwnership,
} from "./proof-ownership.mjs";

const ROOT = resolve(process.cwd());
const CANONICAL_CONTRACT = resolve(ROOT, "docs/CONSCIENCIA/PROOF-OWNERSHIP.json");
const repoPathExists = (path) => isRepoRelativePath(path) && existsSync(resolve(ROOT, path));

const defaultOperationalChain = () => ({
  claim: "AUTHORITY_APPROVAL_CURRENT_GITHUB_EVENT",
  authority: "SEGREDO/CHEFE",
  owner: "docs/CONSCIENCIA/02-PERMISSOES.md",
  contract: "docs/CONSCIENCIA/PROOF-OWNERSHIP.json",
  implementation_or_consumer: "scripts/lupa/authority-approval.mjs",
  enforcement: ".github/workflows/porta-de-entrada.yml",
  execution: "GITHUB_ACTIONS_CURRENT_EVENT",
  observable_effect: "AUTHORITY_APPROVED_OUTPUT_FOR_CURRENT_EVENT",
  proof_target: "CURRENT_GITHUB_EVENT_AUTHORITY_DECISION",
  receipt: ".github/workflows/porta-de-entrada.yml",
  counterproof: "scripts/lupa/authority-approval.test.mjs",
  live_state: "MEASURE_AT_RUNTIME",
  judge: "REALITY_CURRENT_GITHUB_EVENT",
  fixed_point_scope: "AUTHORITY_APPROVAL_CURRENT_EVENT",
});

const makeInvariant = (overrides = {}) => ({
  id: "AUTHORITY_RECEIPT_FROM_GITHUB_EVENT",
  proof_class: "authenticated_authority",
  source: "docs/CONSCIENCIA/02-PERMISSOES.md",
  consumer: ".github/workflows/porta-de-entrada.yml",
  prover: "scripts/lupa/authority-approval.mjs",
  negative_test: "scripts/lupa/authority-approval.test.mjs",
  counterproof: {
    kind: "negative_test_suite",
    path: "scripts/lupa/authority-approval.test.mjs",
    observation: "payloads sem autoridade devem falhar",
    independent_from_prover: true,
  },
  external_anchor: {
    kind: "github_event_label",
    event_field: "pull_request.labels",
    observation: "label observada no payload real do evento",
  },
  depends_on: [],
  operational_chain: defaultOperationalChain(),
  ...overrides,
});

const coverageClaimPolicy = () => ({
  marker: "SOURCE_COVERAGE_RECEIPT_REQUIRED",
  applies_when_scope_is: ["ALL", "WHOLE", "ENTIRE", "100%", "COMPLETE", "EXHAUSTIVE"],
  tool_attempt_required_before_unavailable_claim: true,
  tree_or_listing_counts_as_content_read: false,
  partial_retrieval_counts_as_total_coverage: false,
  required_receipt_fields: [
    "source_and_ref",
    "inventory_denominator",
    "content_read_numerator",
    "skipped_or_excluded",
    "truncation_or_pagination",
    "method",
    "limitations",
  ],
  missing_denominator: "NOT_MEASURED",
  unattempted_unavailability: "UNPROVEN",
  tree_only_content_claim: "UNPROVEN",
  partial_as_total: "UNPROVEN",
});

const operationalPolicy = () => ({
  marker: "OPERATIONAL_CLAIM_REQUIRES_ENFORCEMENT",
  applies_to: "CLAIMS_THAT_PRODUCE_OR_GOVERN_BEHAVIOR",
  technology_lock: false,
  enforcement_must_be_proportional: true,
  runtime_status_is_topology_proof: false,
  live_state_must_be_measured: true,
  monitoring_requires_real_mechanism: true,
  fixed_point_scope_required: true,
  duplicate_only_when_same_authority_and_capability: true,
  preserve_layer_specific_implementations: true,
  required_chain: [
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
  ],
  classifications: ["ENFORCED", "PARTIAL", "DOCUMENTATION_ONLY", "ORPHAN", "UNKNOWN", "NOT_APPLICABLE"],
  non_pass_states: ["UNKNOWN", "PENDING", "QUEUED", "SKIPPED", "CANCELLED"],
  mechanism_profiles: {
    CODE_RULE: ["test", "linter", "ci_when_applicable"],
    API_CONTRACT: ["schema", "implementation", "consumer_test"],
    WORKFLOW: ["trigger", "execution", "receipt"],
    DEPLOY: ["artifact", "runtime", "health_or_telemetry"],
    PANEL: ["real_source", "consumer", "validation"],
    ADMIN_DOCUMENTATION: ["owner", "marker_or_registry", "consumer", "scanner_or_gate_when_applicable"],
    OPERATIONAL_MEMORY: ["canonical_owner", "provenance", "dedupe", "absorption"],
    COMMAND: ["registry", "parser_or_consumer", "observable_behavior"],
    SECURITY: ["policy", "enforcement", "adversarial_test_when_applicable"],
    SOURCE_COVERAGE: ["source_selection", "inventory", "content_read", "coverage_receipt", "countercheck"],
    HUMAN_NON_AUTOMATABLE_RULE: ["explicit_authority", "procedure", "proportional_evidence_or_review"],
  },
  coverage_claim_policy: coverageClaimPolicy(),
});

const baseContract = () => ({
  schema_version: 1,
  status: "CANONICAL",
  marker: "PROOF_OWNERSHIP_REQUIRED",
  coverage_status: "PARTIAL_EXPLICIT",
  scope: "TOPOLOGY_ONLY",
  global_rules: {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "U
```