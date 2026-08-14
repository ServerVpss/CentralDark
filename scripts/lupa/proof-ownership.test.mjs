import test from "node:test";
import assert from "node:assert/strict";

import { validateProofOwnership } from "./proof-ownership.mjs";

const baseContract = () => ({
  schema_version: 1,
  status: "CANONICAL",
  marker: "PROOF_OWNERSHIP_REQUIRED",
  global_rules: {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unknown_skipped_pending: "NOT_PASS",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
  },
  invariants: [
    {
      id: "A",
      proof_class: "identity",
      source: "source.md",
      consumer: "consumer.mjs",
      prover: "prover.mjs",
      negative_test: "prover.test.mjs",
      external_anchor: { kind: "repository_active_surface", path: "anchor.md" },
      independent_counterproof: true,
      depends_on: [],
    },
  ],
});

const allExist = () => true;

test("grafo finito valido passa", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
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
    external_anchor: { kind: "runtime_observation", path: "b-anchor.log" },
    independent_counterproof: true,
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
    external_anchor: { kind: "repository_active_surface", path: "b-anchor.md" },
    independent_counterproof: true,
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
