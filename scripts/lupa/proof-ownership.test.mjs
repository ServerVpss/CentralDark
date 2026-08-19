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
    HUMAN_NON_AUTOMATABLE_RULE: ["explicit_authority", "procedure", "proportional_evidence_or_review"],
  },
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
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unregistered_invariant: "UNPROVEN_NOT_OWNED",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
    graph_structure_ok_is_not_invariant_proof: true,
    external_anchor_must_be_observed_by_responsible_prover: true,
    execution_status_is_out_of_scope: true,
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
  },
  operational_claim_policy: operationalPolicy(),
  allowed_proof_classes: ["authenticated_authority", "runtime"],
  required_registered_invariants: ["AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"],
  required_fields_per_invariant: [
    "id",
    "proof_class",
    "source",
    "consumer",
    "prover",
    "negative_test",
    "counterproof",
    "external_anchor",
    "depends_on",
    "operational_chain",
  ],
  unregistered_known_invariants: [
    { id: "IDENTITY_AUTHORITY_ACTIVE_SURFACES", status: "UNPROVEN_NOT_OWNED" },
    { id: "PROOF_OWNERSHIP_GRAPH_STRUCTURE", status: "UNPROVEN_NOT_OWNED" },
  ],
  invariants: [makeInvariant()],
});

const allExist = () => true;

function errorsFor(contract, exists = allExist) {
  return validateProofOwnership(contract, { exists }).errors;
}

function loadCanonicalContract() {
  return JSON.parse(readFileSync(CANONICAL_CONTRACT, "utf8"));
}

test("grafo válido passa somente como topologia parcial", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.operational_claim_policy_ok, true);
  assert.equal(result.coverage_status, "PARTIAL_EXPLICIT");
  assert.equal(result.unregistered_known_count, 2);
});

test("contrato inválido retorna shape determinístico", () => {
  const result = validateProofOwnership(null, { exists: allExist });
  assert.equal(result.ok, false);
  assert.deepEqual(result.proof_classes, []);
  assert.equal(result.invariant_count, 0);
  assert.equal(result.topology_only, true);
  assert.equal(result.operational_claim_policy_ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_CONTRACT_INVALID"));
});

test("cobertura FULL é falso verde e reprova", () => {
  const contract = baseContract();
  contract.coverage_status = "FULL";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COVERAGE_MUST_BE_PARTIAL_EXPLICIT"));
});

test("escopo diferente de TOPOLOGY_ONLY reprova", () => {
  const contract = baseContract();
  contract.scope = "INVARIANT_PROOF";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_SCOPE_MUST_BE_TOPOLOGY_ONLY"));
});

test("classe livre não canônica reprova", () => {
  const contract = baseContract();
  contract.invariants[0].proof_class = "authenticated_authority_alias";
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_PROOF_CLASS_NOT_CANONICAL:")));
});

test("mesma responsabilidade com provadores diferentes reprova mesmo em classes diferentes", () => {
  const contract = baseContract();
  contract.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    prover: "scripts/lupa/outro-prover.mjs",
    negative_test: "scripts/lupa/outro-prover.test.mjs",
    counterproof: {
      kind: "negative_test_suite",
      path: "scripts/lupa/outro-prover.test.mjs",
      observation: "falso PASS deve falhar",
      independent_from_prover: true,
    },
    operational_chain: {
      ...defaultOperationalChain(),
      claim: "B",
      implementation_or_consumer: "scripts/lupa/outro-prover.mjs",
      counterproof: "scripts/lupa/outro-prover.test.mjs",
      fixed_point_scope: "B_SCOPE",
    },
  }));
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_DUPLICATE_RESPONSIBILITY:")));
});

test("source igual consumer reprova", () => {
  const contract = baseContract();
  contract.invariants[0].consumer = contract.invariants[0].source;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_SOURCE_IS_CONSUMER:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("path não string reprova", () => {
  const contract = baseContract();
  contract.invariants[0].source = ["docs/CONSCIENCIA/02-PERMISSOES.md"];
  assert.ok(errorsFor(contract).some((item) => item.includes(":source") || item.startsWith("PROOF_OWNERSHIP_PATH_TYPE_INVALID:")));
});

test("path traversal reprova antes de consultar exists", () => {
  const contract = baseContract();
  contract.invariants[0].source = "../../etc/hosts";
  const calls = [];
  const result = validateProofOwnership(contract, { exists: (path) => { calls.push(path); return true; } });
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_PATH_OUTSIDE_REPO:")));
  assert.equal(calls.includes("../../etc/hosts"), false);
});

test("helper rejeita absolutos Windows Unix e traversal", () => {
  assert.equal(isRepoRelativePath("docs/x.md"), true);
  assert.equal(isRepoRelativePath("../x.md"), false);
  assert.equal(isRepoRelativePath("a/../../x.md"), false);
  assert.equal(isRepoRelativePath("/etc/hosts"), false);
  assert.equal(isRepoRelativePath("C:\\Windows\\system32"), false);
  assert.equal(isRepoRelativePath("\\\\server\\share"), false);
});

test("contraprova booleana sem artefato reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof = true;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COUNTERPROOF_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("negative_test_suite precisa ser o negative_test executável", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.path = "AGENTS.md";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COUNTERPROOF_NOT_NEGATIVE_TEST:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("negative_test precisa ter nome de teste", () => {
  const contract = baseContract();
  contract.invariants[0].negative_test = "AGENTS.md";
  contract.invariants[0].counterproof.path = "AGENTS.md";
  contract.invariants[0].operational_chain.counterproof = "AGENTS.md";
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_NEGATIVE_TEST_NOT_EXECUTABLE_TEST:")));
});

test("provador igual teste ou consumidor reprova", () => {
  const contractA = baseContract();
  contractA.invariants[0].negative_test = contractA.invariants[0].prover;
  contractA.invariants[0].counterproof.path = contractA.invariants[0].prover;
  contractA.invariants[0].operational_chain.counterproof = contractA.invariants[0].prover;
  assert.ok(errorsFor(contractA).includes("PROOF_OWNERSHIP_SELF_TEST:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));

  const contractB = baseContract();
  contractB.invariants[0].consumer = contractB.invariants[0].prover;
  assert.ok(errorsFor(contractB).includes("PROOF_OWNERSHIP_PROVER_IS_CONSUMER:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("âncora github exige event_field", () => {
  const contract = baseContract();
  delete contract.invariants[0].external_anchor.event_field;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_EXTERNAL_EVENT_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("depends_on é obrigatório e só aceita ids string", () => {
  const contractA = baseContract();
  delete contractA.invariants[0].depends_on;
  assert.ok(errorsFor(contractA).includes("PROOF_OWNERSHIP_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT:depends_on"));

  const contractB = baseContract();
  contractB.invariants[0].depends_on = [123];
  assert.ok(errorsFor(contractB).includes("PROOF_OWNERSHIP_DEPENDS_ON_ITEM_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("ciclo explícito e implícito reprova", () => {
  const explicit = baseContract();
  explicit.invariants[0].depends_on = ["B"];
  explicit.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    source: "docs/b.md",
    consumer: "scripts/b-consumer.mjs",
    prover: "scripts/b-prover.mjs",
    negative_test: "scripts/b-prover.test.mjs",
    counterproof: { kind: "negative_test_suite", path: "scripts/b-prover.test.mjs", observation: "x", independent_from_prover: true },
    external_anchor: { kind: "runtime_observation", path: "evidence/b.log", observation: "evento externo" },
    depends_on: ["AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"],
    operational_chain: {
      ...defaultOperationalChain(),
      claim: "B",
      owner: "docs/b.md",
      implementation_or_consumer: "scripts/b-prover.mjs",
      enforcement: "scripts/b-consumer.mjs",
      receipt: "evidence/b.log",
      counterproof: "scripts/b-prover.test.mjs",
      fixed_point_scope: "B_SCOPE",
    },
  }));
  assert.ok(errorsFor(explicit).some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));

  const implicit = baseContract();
  implicit.invariants[0].consumer = "scripts/b-prover.mjs";
  implicit.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    source: "docs/b.md",
    consumer: "scripts/lupa/authority-approval.mjs",
    prover: "scripts/b-prover.mjs",
    negative_test: "scripts/b-prover.test.mjs",
    counterproof: { kind: "negative_test_suite", path: "scripts/b-prover.test.mjs", observation: "x", independent_from_prover: true },
    external_anchor: { kind: "runtime_observation", path: "evidence/b.log", observation: "evento externo" },
    depends_on: [],
    operational_chain: {
      ...defaultOperationalChain(),
      claim: "B",
      owner: "docs/b.md",
      implementation_or_consumer: "scripts/b-prover.mjs",
      enforcement: "scripts/lupa/authority-approval.mjs",
      receipt: "evidence/b.log",
      counterproof: "scripts/b-prover.test.mjs",
      fixed_point_scope: "B_SCOPE",
    },
  }));
  assert.ok(errorsFor(implicit).some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));
});

test("required_registered_invariants impede sumiço silencioso", () => {
  const contract = baseContract();
  contract.invariants = [makeInvariant({ id: "OUTRA" })];
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_REQUIRED_INVARIANT_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("invariável conhecida não pode estar simultaneamente registrada e UNPROVEN", () => {
  const contract = baseContract();
  contract.unregistered_known_invariants.push({ id: "AUTHORITY_RECEIPT_FROM_GITHUB_EVENT", status: "UNPROVEN_NOT_OWNED" });
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_REGISTERED_AND_UNREGISTERED:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("status de execução é explicitamente fora do escopo deste detector", () => {
  const contract = baseContract();
  contract.invariants[0].status = "UNKNOWN";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.operational_claim_policy_ok, true);
});

test("contrato canônico exige enforcement proporcional para qualquer claim operacional registrado", () => {
  const contract = loadCanonicalContract();
  assert.deepEqual(validateOperationalClaimPolicy(contract, { exists: repoPathExists }), []);
  const result = validateProofOwnership(contract, { exists: repoPathExists });
  assert.equal(result.operational_claim_policy_ok, true);
});

test("política operacional não pode ser trocada por YAML ou tecnologia única", () => {
  const contract = loadCanonicalContract();
  contract.operational_claim_policy.technology_lock = true;
  assert.ok(validateOperationalClaimPolicy(contract, { exists: repoPathExists }).includes("OPERATIONAL_POLICY_TECHNOLOGY_LOCK_FORBIDDEN"));

  delete contract.operational_claim_policy.mechanism_profiles.API_CONTRACT;
  assert.ok(validateOperationalClaimPolicy(contract, { exists: repoPathExists }).includes("OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:API_CONTRACT"));
});

test("claim operacional sem cadeia completa ou com estado stale reprova", () => {
  const contract = loadCanonicalContract();
  delete contract.invariants[0].operational_chain.enforcement;
  assert.ok(validateOperationalClaimPolicy(contract, { exists: repoPathExists }).includes("OPERATIONAL_CHAIN_FIELD_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT:enforcement"));

  const stale = loadCanonicalContract();
  stale.invariants[0].operational_chain.live_state = "PASS_ONTEM";
  assert.ok(validateOperationalClaimPolicy(stale, { exists: repoPathExists }).includes("OPERATIONAL_CHAIN_STALE_STATE_FORBIDDEN:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("fixed point operacional precisa declarar escopo e judge não pode ser o prover", () => {
  const contract = loadCanonicalContract();
  contract.invariants[0].operational_chain.fixed_point_scope = "FIXED_POINT";
  assert.ok(validateOperationalClaimPolicy(contract, { exists: repoPathExists }).includes("OPERATIONAL_CHAIN_FIXED_POINT_SCOPE_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));

  const collision = loadCanonicalContract();
  collision.invariants[0].operational_chain.judge = collision.invariants[0].prover;
  assert.ok(validateOperationalClaimPolicy(collision, { exists: repoPathExists }).includes("OPERATIONAL_CHAIN_WRITER_JUDGE_COLLISION:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});
