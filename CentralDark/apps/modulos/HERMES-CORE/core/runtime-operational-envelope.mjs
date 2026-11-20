import { PERCEPTION_ATTACKS } from "./perception-orchestra.mjs";

export const OPERATIONAL_PHASES = Object.freeze([
  "DISCOVER", "FANOUT", "RENDEZVOUS", "DEDUPE", "COUNTERPROOF",
  "REMEASURE", "REALITY_JUDGE", "RECEIPT", "NEXT_CURSOR",
]);

export function buildRuntimeOperationalEnvelope({
  runtimeId,
  missionId,
  writerScope = "READ_ONLY",
  correlationId = null,
} = {}) {
  if (!runtimeId || !missionId) throw new Error("RUNTIME_AND_MISSION_REQUIRED");
  return Object.freeze({
    schema: "centraldark.runtime-operational-envelope.v1",
    runtime_id: String(runtimeId),
    mission_id: String(missionId),
    correlation_id: correlationId || String(missionId),
    phases: [...OPERATIONAL_PHASES],
    fanout: {
      fronts: PERCEPTION_ATTACKS.map(({ id, objective }) => ({ id, objective })),
      parallel_read_only: true,
      parent_rendezvous_required: true,
      mutation_serialized_by_writer_scope: true,
    },
    writer_scope: String(writerScope),
    retry: { requires_information_gain: true },
    proof: {
      four_answers_are_four_proofs: false,
      unknown_is_not_pass: true,
      reality_is_judge: true,
      receipt_required: true,
    },
  });
}
