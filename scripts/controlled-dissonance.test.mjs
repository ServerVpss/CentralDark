#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  ATTACK_PROFILES,
  buildPerceptionPlan,
  convergePerceptions,
  validateCanonicalMutation,
  crystallizeGold,
} from "./controlled-dissonance.mjs";

const state = {
  mission_id: "M-DISSONANCE",
  intent_id: "INTENT-1",
  material_id: "MAT-1",
  head: { sha: "abc123" },
  trail: { route_id: "TRILHO-1" },
  scope: { allowed: ["repo:read"], denied: [] },
  writer: { agent: "hermes" },
  writer_scope: "src:wound-1",
  coordinator: "sol",
  perception_agents: ["agent-a", "agent-b", "agent-c", "agent-d"],
};

const plan = buildPerceptionPlan(state);
assert.equal(plan.accepted, true);
assert.equal(plan.status, "READY_FOUR_ANGLES");
assert.equal(plan.calls.length, 4);
assert.deepEqual(plan.calls.map((x) => x.attack_profile), ATTACK_PROFILES.map((x) => x.id));
assert.equal(new Set(plan.calls.map((x) => x.call.to)).size, 4);
for (const entry of plan.calls) {
  assert.equal(entry.call.write_requested, false);
  assert.equal(entry.call.dissonance.same_intent, true);
  assert.equal(entry.call.dissonance.same_material, true);
  assert.equal(entry.call.dissonance.read_only, true);
  assert.equal(entry.call_receipt.accepted, true);
  assert.equal(entry.call_receipt.write_authorized, false);
}

const duplicateAgents = buildPerceptionPlan({ ...state, perception_agents: ["same", "same", "same", "same"] });
assert.equal(duplicateAgents.status, "BLOCKED_DUPLICATE_PERCEPTION_AGENT");

function receipt(attackProfile, evidenceCluster, evidenceRef, extra = {}) {
  return {
    protocol: "CENTRALDARK_CONTROLLED_DISSONANCE_V1",
    attack_profile: attackProfile,
    observer: `observer-${attackProfile}`,
    intent_id: state.intent_id,
    material_id: state.material_id,
    observed_head: state.head.sha,
    writer_scope: state.writer_scope,
    read_only: true,
    write_performed: false,
    findings: [{
      finding_fingerprint: "WOUND-1",
      wound: "same-root-error",
      claim: "root condition breaks the contract",
      verdict: "MATERIAL",
      evidence_cluster: evidenceCluster,
      evidence_refs: [evidenceRef],
      proposed_correction: "fix only the canonical owner",
      ...extra,
    }],
  };
}

const sameEvidence = ATTACK_PROFILES.map((p, i) => receipt(p.id, "same-source", `same:${i}`));
const deduped = convergePerceptions(state, sameEvidence);
assert.equal(deduped.accepted, true);
assert.equal(deduped.raw_finding_count, 4);
assert.equal(deduped.deduped_finding_count, 1);
assert.equal(deduped.canonical_mutations.length, 1);
assert.equal(deduped.deduped_findings[0].independent_proof_count, 1);
assert.equal(deduped.deduped_findings[0].corroborated_by_distinct_proof, false);

const independentEvidence = ATTACK_PROFILES.map((p, i) => receipt(p.id, `independent:${i}`, `proof:${i}`));
const converged = convergePerceptions(state, independentEvidence);
assert.equal(converged.status, "READY_SINGLE_WRITER_MUTATION");
assert.equal(converged.deduped_finding_count, 1);
assert.equal(converged.canonical_mutations.length, 1);
assert.equal(converged.deduped_findings[0].independent_proof_count, 4);
assert.equal(converged.deduped_findings[0].corroborated_by_distinct_proof, true);

const missingAngle = convergePerceptions(state, independentEvidence.slice(0, 3));
assert.equal(missingAngle.status, "BLOCKED_FOUR_PERCEPTIONS_REQUIRED");

const duplicateAngle = convergePerceptions(state, [
  independentEvidence[0],
  { ...independentEvidence[1], attack_profile: "LOGIC" },
  independentEvidence[2],
  independentEvidence[3],
]);
assert.equal(duplicateAngle.status, "BLOCKED_ATTACK_PROFILE_COVERAGE");

const wroteDuringPerception = convergePerceptions(state, [
  { ...independentEvidence[0], write_performed: true },
  ...independentEvidence.slice(1),
]);
assert.equal(wroteDuringPerception.status, "BLOCKED_INVALID_PERCEPTION_RECEIPTS");

const noEvidenceReceipts = ATTACK_PROFILES.map((p) => ({
  ...receipt(p.id, "cluster:unproven", "placeholder"),
  findings: [{
    finding_fingerprint: "WOUND-UNPROVEN",
    wound: "unproven",
    claim: "claim without evidence",
    verdict: "MATERIAL",
    evidence_refs: [],
    evidence_cluster: "cluster:unproven",
  }],
}));
const noEvidence = convergePerceptions(state, noEvidenceReceipts);
assert.equal(noEvidence.status, "BLOCKED_MATERIAL_FINDING_WITHOUT_EVIDENCE");

const mutation = {
  intent_id: state.intent_id,
  material_id: state.material_id,
  finding_fingerprint: "WOUND-1",
  writer: "hermes",
  writer_scope: state.writer_scope,
  mutation_count_for_wound: 1,
  correction_ref: "commit:fix-1",
};
assert.equal(validateCanonicalMutation(state, converged, mutation).status, "CANONICAL_MUTATION_ACCEPTED");
assert.equal(validateCanonicalMutation(state, converged, { ...mutation, writer: "agent-a" }).status, "BLOCKED_WRITER_CONFLICT");
assert.equal(validateCanonicalMutation(state, converged, { ...mutation, mutation_count_for_wound: 4 }).status, "BLOCKED_DUPLICATE_MUTATION");

const result = {
  ...mutation,
  post_head: "def456",
  test_ref: "test:unit",
  regression_ref: "test:regression",
  counterproof_ref: "proof:counter",
  integration_ref: "test:integration",
  regression_status: "PASS",
  counterproof_status: "PASS",
  integration_status: "PASS",
  material_gap_count: 0,
  false_green_count: 0,
  silent_error_count: 0,
};
assert.equal(crystallizeGold(state, converged, { ...result, counterproof_status: "FAIL" }).status, "BLOCKED_COUNTERPROOF_NOT_PASS");
assert.equal(crystallizeGold(state, converged, { ...result, false_green_count: 1 }).status, "BLOCKED_FALSE_GREEN_REMAINS");
const gold = crystallizeGold(state, converged, result);
assert.equal(gold.status, "GOLD_CRYSTALLIZED");
assert.equal(gold.fixed_point, true);
assert.equal(gold.writer, "hermes");

console.log("PASS controlled-dissonance: 4 angles -> dedupe -> one writer -> counterproof -> gold");
