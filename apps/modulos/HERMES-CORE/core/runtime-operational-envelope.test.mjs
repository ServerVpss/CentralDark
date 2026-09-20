import test from "node:test";
import assert from "node:assert/strict";
import { buildRuntimeOperationalEnvelope } from "./runtime-operational-envelope.mjs";

test("runtime envelope herda quatro frentes existentes sem criar scheduler", () => {
  const e = buildRuntimeOperationalEnvelope({ runtimeId: "grok", missionId: "m1", writerScope: "x" });
  assert.equal(e.fanout.fronts.length, 4);
  assert.deepEqual(e.fanout.fronts.map((x) => x.id), [
    "A_LOGIC", "B_IMPLEMENTATION", "C_REGRESSION_FALSE_GREEN", "D_SIMPLIFICATION",
  ]);
  assert.equal(e.fanout.parent_rendezvous_required, true);
  assert.equal(e.retry.requires_information_gain, true);
  assert.equal(e.proof.four_answers_are_four_proofs, false);
  assert.equal(e.proof.unknown_is_not_pass, true);
});
