import test from "node:test";
import assert from "node:assert/strict";

import { validateProofOwnership } from "./proof-ownership.mjs";

const makeInvariant = (overrides = {}) => ({
  id: "A",
  proof_class: "authority",
  source: "source.md",
  consumer: "consumer.mjs",
  prover: "prover.mjs",
  negative_test: "prover.test.mjs",
  counterproof: {
    kind: "negative_test_suite",
    path: "prover.test.mjs",
    observation: "casos adversariais tentam falso PASS",
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
  global_rules: {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unregistered_invariant: "UNPROVEN_NOT_OWNED",
    unknown_skipped_pending: "NOT_PASS",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
    graph_structure_ok_is_not_invariant_proof: true,
    external_anchor_must_be_observed_by_responsible_prover: true,
  },
  unregistered_known_invariants: [],
  invariants: [makeInvariant()],
});

const allExist = () => true;

test("grafo válido passa somente como topologia parcial", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.coverage_status, "PARTIAL_EXPLICIT");
  assert.deepEqual(result.errors, []);
});

test("cobertura FULL é falso verde e reprova", () => {
  const contract = baseContract();
  contract.coverage_status = "FULL";
  assert.equal(validateProofOwnership(contract, { exists: allExist }).ok, false);
});

test("contraprova booleana sem artefato reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof = true;
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_MISSING:A"));
});

test("contraprova que é o próprio provador reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.path = "prover.mjs";
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_IS_PROVER:A"));
});

test("contraprova sem independência reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.independent_from_prover = false;
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_NOT_INDEPENDENT:A"));
});

test("negative_test que não é artefato executável de teste reprova", () => {
  const contract = baseContract();
  contract.invariants[0].negative_test = "AGENTS.md";
  contract.invariants[0].counterproof.path = "AGENTS.md";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_NEGATIVE_TEST_NOT_EXECUTABLE_TEST:A:AGENTS.md"));
});

test("counterproof negative_test_suite diferente do negative_test reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.path = "outro.test.mjs";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_NOT_NEGATIVE_TEST:A"));
});

test("provador = teste negativo reprova", () => {
  const contract = baseContract();
  contract.invariants[0].negative_test = "prover.mjs";
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_SELF_TEST:A"));
});

test("provador = consumidor reprova", () => {
  const contract = baseContract();
  contract.invariants[0].consumer = "prover.mjs";
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_PROVER_IS_CONSUMER:A"));
});

test("âncora baseada em output do validator reprova", () => {
  const contract = baseContract();
  contract.invariants[0].external_anchor.kind = "validator_output";
  assert.equal(validateProofOwnership(contract, { exists: allExist }).ok, false);
});

test("âncora github sem event_field reprova", () => {
  const contract = baseContract();
  delete contract.invariants[0].external_anchor.event_field;
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_EXTERNAL_EVENT_FIELD_MISSING:A"));
});

test("âncora estática sem path reprova", () => {
  const contract = baseContract();
  contract.invariants[0].external_anchor = { kind: "repository_active_surface", observation: "x" };
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_EXTERNAL_PATH_MISSING:A"));
});

test("depends_on ausente reprova", () => {
  const contract = baseContract();
  delete contract.invariants[0].depends_on;
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.includes("PROOF_OWNERSHIP_FIELD_MISSING:A:depends_on"));
});

test("ciclo explícito A→B→A reprova", () => {
  const contract = baseContract();
  contract.invariants[0].depends_on = ["B"];
  contract.invariants.push(makeInvariant({ id: "B", proof_class: "runtime", prover: "b-prover.mjs", consumer: "b-consumer.mjs", negative_test: "b.test.mjs", counterproof: { kind: "negative_test_suite", path: "b.test.mjs", observation: "x", independent_from_prover: true }, depends_on: ["A"] }));
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));
});

test("ciclo implícito consumer→prover é inferido e reprova", () => {
  const contract = baseContract();
  contract.invariants[0].consumer = "b-prover.mjs";
  contract.invariants.push(makeInvariant({ id: "B", proof_class: "runtime", prover: "b-prover.mjs", consumer: "prover.mjs", negative_test: "b.test.mjs", counterproof: { kind: "negative_test_suite", path: "b.test.mjs", observation: "x", independent_from_prover: true } }));
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));
});

test("mesma classe com dois donos reprova", () => {
  const contract = baseContract();
  contract.invariants.push(makeInvariant({ id: "B", prover: "outro.mjs", consumer: "outro-consumer.mjs", negative_test: "outro.test.mjs", counterproof: { kind: "negative_test_suite", path: "outro.test.mjs", observation: "x", independent_from_prover: true } }));
  assert.ok(validateProofOwnership(contract, { exists: allExist }).errors.some((item) => item.startsWith("PROOF_OWNERSHIP_DUPLICATE_OWNER:authority:")));
});

test("path obrigatório ausente reprova", () => {
  const contract = baseContract();
  const result = validateProofOwnership(contract, { exists: (path) => path !== "source.md" });
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_PATH_MISSING:A:source.md"));
});
