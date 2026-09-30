import assert from "node:assert/strict";
import test from "node:test";
import { dependabotFixedPointProof, houseSquashFixedPointProof } from "./fixed-point.mjs";

const ready = {
  kind: "patch",
  score: 100,
  threshold: 85,
  mergeable: true,
  mergeState: "clean",
  pendingChecks: 0,
  failedChecks: 0,
  badStatuses: 0,
  successChecks: 4,
  changesRequested: false,
  exactHead: true,
  blockers: [],
};

test("Dependabot só chega ao squash pelo fechamento Horn completo", () => {
  const proof = dependabotFixedPointProof(ready);
  assert.equal(proof.ready, true);
  assert.equal(proof.verdict, "PROVED_IN_SCOPE");
  assert.equal(proof.facts.includes("DEPENDABOT_SQUASH_READY"), true);
});

test("check pendente é UNKNOWN e nunca PASS", () => {
  const proof = dependabotFixedPointProof({ ...ready, pendingChecks: 1, blockers: ["CHECKS_PENDING_1"] });
  assert.equal(proof.ready, false);
  assert.equal(proof.verdict, "UNKNOWN");
});

test("major é refutado no escopo automático", () => {
  const proof = dependabotFixedPointProof({ ...ready, kind: "major", threshold: 101, blockers: ["MAJOR_AUTO_MERGE_FORBIDDEN"] });
  assert.equal(proof.ready, false);
  assert.equal(proof.verdict, "REFUTED_IN_SCOPE");
});

test("autorreferência não injeta o goal", () => {
  const proof = dependabotFixedPointProof({ ...ready, exactHead: false, blockers: [] });
  assert.equal(proof.ready, false);
  assert.equal(proof.facts.includes("DEPENDABOT_SQUASH_READY"), false);
  assert.equal(proof.self_reference_guard, "EXTERNAL_FACTS_ONLY_NO_GOAL_SEED");
});


const houseReady = {
  prNumber: 1701,
  state: "open",
  draft: false,
  labels: ["👑 PERMITO-SEGREDO"],
  protectedPrs: [1562],
  mergeable: true,
  mergeState: "clean",
  headSha: "a".repeat(40),
  observedHeadSha: "a".repeat(40),
  pendingChecks: 0,
  nonGreenChecks: 0,
  badStatuses: 0,
  successChecks: 8,
  changesRequested: false,
  blockers: [],
};

test("PR da Casa só fica elegível com SAME_HEAD e todos os CI verdes", () => {
  const proof = houseSquashFixedPointProof(houseReady);
  assert.equal(proof.ready, true);
  assert.equal(proof.verdict, "PROVED_IN_SCOPE");
  assert.equal(proof.facts.includes("HOUSE_SQUASH_READY"), true);
});

test("PR-mãe, draft e do-not-merge nunca entram no squash", () => {
  for (const candidate of [
    { ...houseReady, prNumber: 1562 },
    { ...houseReady, draft: true },
    { ...houseReady, labels: ["do-not-merge"] },
  ]) {
    assert.equal(houseSquashFixedPointProof(candidate).ready, false);
  }
});

test("pending, skipped/cancelled/failure e HEAD divergente bloqueiam verde", () => {
  assert.equal(houseSquashFixedPointProof({ ...houseReady, pendingChecks: 1 }).verdict, "UNKNOWN");
  assert.equal(houseSquashFixedPointProof({ ...houseReady, nonGreenChecks: 1 }).ready, false);
  assert.equal(houseSquashFixedPointProof({ ...houseReady, observedHeadSha: "b".repeat(40) }).ready, false);
});

test("zero CI é UNKNOWN, nunca PASS", () => {
  const proof = houseSquashFixedPointProof({ ...houseReady, successChecks: 0 });
  assert.equal(proof.ready, false);
  assert.equal(proof.verdict, "UNKNOWN");
});
