import test from "node:test";
import assert from "node:assert/strict";

import { isRepoRelativePath, validateProofOwnership } from "./proof-ownership.mjs";

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
  ...overrides,
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
  },
  allowed_proof_classes: ["authenticated_authority", "runtime"],
  required_registered_invariants: ["AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"],
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

test("grafo válido passa somente como topologia parcial", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.coverage_status, "PARTIAL_EXPLICIT");
  assert.equal(result.unregistered_known_count, 2);
});

test("contrato inválido retorna shape determinístico", () => {
  const result = validateProofOwnership(null, { exists: allExist });
  assert.equal(result.ok, false);
  assert.deepEqual(result.proof_classes, []);
  assert.equal(result.invariant_count, 0);
  assert.equal(result.topology_only, true);
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
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_NEGATIVE_TEST_NOT_EXECUTABLE_TEST:")));
});

test("provador igual teste ou consumidor reprova", () => {
  const contractA = baseContract();
  contractA.invariants[0].negative_test = contractA.invariants[0].prover;
  contractA.invariants[0].counterproof.path = contractA.invariants[0].prover;
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
});
