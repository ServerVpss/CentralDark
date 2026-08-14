import test from "node:test";
import assert from "node:assert/strict";

import { validateProofOwnership } from "./proof-ownership.mjs";

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
  invariants: [
    {
      id: "A",
      proof_class: "identity",
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
        kind: "repository_active_surface",
        path: "anchor.md",
        observation: "conteudo versionado observado no mesmo HEAD",
      },
      depends_on: [],
    },
  ],
});

const allExist = () => true;

test("grafo finito valido passa somente como topologia parcial", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.coverage_status, "PARTIAL_EXPLICIT");
  assert.deepEqual(result.errors, []);
});

test("grafo nao pode alegar cobertura diferente da parcial explicita", () => {
  const contract = baseContract();
  contract.coverage_status = "FULL";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_COVERAGE_MUST_BE_PARTIAL_EXPLICIT"));
});

test("contraprova booleana sem artefato reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof = true;
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_MISSING:A"));
});

test("contraprova que e o proprio provador reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.path = "prover.mjs";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_IS_PROVER:A"));
});

test("contraprova sem independência declarada reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.independent_from_prover = false;
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_COUNTERPROOF_NOT_INDEPENDENT:A"));
});

test("provador testado por si proprio reprova", () => {
  const contract = baseContract();
  contract.invariants[0].negative_test = "prover.mjs";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_SELF_TEST:A")));
});

test("provador que tambem e consumidor reprova", () => {
  const contract = baseContract();
  contract.invariants[0].consumer = "prover.mjs";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_PROVER_IS_CONSUMER:A")));
});

test("ancora que depende de output de validator reprova", () => {
  const contract = baseContract();
  contract.invariants[0].external_anchor.kind = "validator_output";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_EXTERNAL_ANCHOR_INVALID:A")));
});

test("ancora sem descricao da observacao externa reprova", () => {
  const contract = baseContract();
  delete contract.invariants[0].external_anchor.observation;
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_EXTERNAL_OBSERVATION_MISSING:A"));
});

test("dependencia circular reprova", () => {
  const contract = baseContract();
  contract.invariants[0].depends_on = ["B"];
  contract.invariants.push({
    id: "B",
    proof_class: "runtime",
    source: "b-source.md",
    consumer: "b-consumer.mjs",
    prover: "b-prover.mjs",
    negative_test: "b-prover.test.mjs",
    counterproof: {
      kind: "negative_test_suite",
      path: "b-prover.test.mjs",
      observation: "counterexample externo ao provador",
      independent_from_prover: true,
    },
    external_anchor: {
      kind: "runtime_observation",
      path: "b-anchor.log",
      observation: "evento externo observado pelo consumidor real",
    },
    depends_on: ["A"],
  });
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));
});

test("mesma classe com dois donos reprova", () => {
  const contract = baseContract();
  contract.invariants.push({
    id: "B",
    proof_class: "identity",
    source: "b-source.md",
    consumer: "b-consumer.mjs",
    prover: "outro-prover.mjs",
    negative_test: "outro-prover.test.mjs",
    counterproof: {
      kind: "negative_test_suite",
      path: "outro-prover.test.mjs",
      observation: "counterexample externo ao segundo provador",
      independent_from_prover: true,
    },
    external_anchor: {
      kind: "repository_active_surface",
      path: "b-anchor.md",
      observation: "outra superficie ativa observada no mesmo HEAD",
    },
    depends_on: [],
  });
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_DUPLICATE_OWNER:identity:")));
});

test("path ausente reprova", () => {
  const contract = baseContract();
  const result = validateProofOwnership(contract, { exists: (path) => path !== "anchor.md" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_PATH_MISSING:A:anchor.md"));
});
