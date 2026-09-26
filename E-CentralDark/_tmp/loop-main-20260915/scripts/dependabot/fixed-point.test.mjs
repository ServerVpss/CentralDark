import assert from "node:assert/strict";
import test from "node:test";
import { dependabotFixedPointProof, dependabotReconciliationChance } from "./fixed-point.mjs";

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

test("chance viva sobe quando checks e mergeabilidade melhoram", () => {
  const pending = dependabotReconciliationChance({
    score: 90,
    threshold: 85,
    mergeable: null,
    mergeState: "unknown",
    pendingChecks: 2,
    successChecks: 0,
  });
  const green = dependabotReconciliationChance({
    score: 90,
    threshold: 85,
    mergeable: true,
    mergeState: "clean",
    pendingChecks: 0,
    successChecks: 4,
    previousChance: pending.chance,
  });
  assert.equal(green.trend, "UP");
  assert.ok(green.chance > pending.chance);
  assert.equal(green.confidence, "HIGH");
});

test("chance viva cai quando aparece blocker material", () => {
  const proof = dependabotFixedPointProof({
    ...ready,
    previousChance: 100,
    blockers: ["CHANGES_REQUESTED"],
    changesRequested: true,
  });
  assert.equal(proof.reconciliation.trend, "DOWN");
  assert.ok(proof.reconciliation.chance < 100);
});
