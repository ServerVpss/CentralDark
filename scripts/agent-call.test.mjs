#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  scopeTemperature,
  validateAgentCall,
  validateDelegationGate,
  validateDelegationResult,
  validateHealingGate,
  validateHealingResult,
} from "./agent-call.mjs";

const state = {
  mission_id: "M-1",
  head: { sha: "abc123" },
  trail: { route_id: "TRILHO-A", origin: "A", destination: "B" },
  scope: { allowed: ["repo:read", "src:x"], denied: ["prod"] },
  writer: { agent: "hermes" },
  capabilities: {
    delegate_agents: {
      supported: true,
      source: "runtime-tool-inventory",
      evidence_ref: "runtime:tools/delegate-agent",
    },
  },
  debug_frontiers: [],
  delegation_receipts: [],
};
const base = {
  call_id: "C-1",
  mission_id: "M-1",
  from: "sol",
  to: "reviewer",
  requested_role: "REVIEWER",
  observed_head: "abc123",
  trail_id: "TRILHO-A",
  scope: ["repo:read"],
  requested_action: "prove X",
  write_requested: false,
};

let pass = 0;
function check(actual, expected) {
  assert.equal(actual, expected);
  pass += 1;
}

check(validateAgentCall(base, state).status, "ACCEPTED");
check(validateAgentCall({ ...base, mission_id: "M-X" }, state).status, "BLOCKED_UNKNOWN_MISSION");
check(validateAgentCall({ ...base, observed_head: "old" }, state).status, "BLOCKED_STALE_HEAD");
check(validateAgentCall({ ...base, trail_id: undefined }, state).status, "BLOCKED_MISSING_TRAIL");
check(validateAgentCall({ ...base, trail_id: "DESVIO" }, state).status, "BLOCKED_ROUTE_DRIFT");
check(validateAgentCall({ ...base, scope: ["prod"] }, state).status, "BLOCKED_OUT_OF_SCOPE");
check(validateAgentCall({ ...base, requested_role: "REVIEWER", write_requested: true }, state).status, "BLOCKED_ROLE_CANNOT_WRITE");
check(validateAgentCall({ ...base, to: "codex", requested_role: "EXECUTOR", write_requested: true }, state).status, "BLOCKED_WRITER_CONFLICT");
check(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true }, state).status, "ACCEPTED");
check(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true, writer_handoff_required: true }, state).status, "BLOCKED_MISSING_HANDOFF");
check(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true, writer_handoff_required: true, writer_handoff_valid: true }, state).status, "ACCEPTED");

// MetaLupa temporal: identidade é proveniência; colisão temporal do mesmo escopo
// decide se outro ator espera ou pode assumir a caneta na rodada seguinte.
const NOW = Date.parse("2026-09-09T09:00:00.000Z");
const writeCall = {
  ...base,
  scope: ["src:x"],
  requested_action: "corrigir src:x",
  requested_role: "EXECUTOR",
  write_requested: true,
};
const hotState = {
  ...state,
  scope_activity: [{ actor: "codex", scope: ["src:x"], touched_at: "2026-09-09T08:59:30.000Z" }],
};
check(scopeTemperature({ ...writeCall, to: "hermes" }, hotState, NOW).temperature, "HOT");
check(validateAgentCall({ ...writeCall, to: "hermes" }, hotState, NOW).status, "WAIT_SCOPE_HOT");
check(validateAgentCall({ ...base, to: "reviewer", scope: ["src:x"], write_requested: false }, hotState, NOW).status, "ACCEPTED");

const warmState = {
  ...state,
  scope_activity: [{ actor: "codex", scope: ["src:x"], touched_at: "2026-09-09T08:58:30.000Z" }],
};
check(scopeTemperature({ ...writeCall, to: "hermes" }, warmState, NOW).temperature, "WARM");
check(validateAgentCall({ ...writeCall, to: "hermes" }, warmState, NOW).status, "WAIT_SCOPE_HOT");

const selfHotState = {
  ...state,
  scope_activity: [{ actor: "hermes", scope: ["src:x"], touched_at: "2026-09-09T08:59:45.000Z" }],
};
check(scopeTemperature({ ...writeCall, to: "hermes" }, selfHotState, NOW).temperature, "SELF");
check(validateAgentCall({ ...writeCall, to: "hermes" }, selfHotState, NOW).status, "ACCEPTED");

const coldState = {
  ...state,
  scope_activity: [{ actor: "hermes", scope: ["src:x"], touched_at: "2026-09-09T08:57:30.000Z" }],
};
check(scopeTemperature({ ...writeCall, to: "codex" }, coldState, NOW).temperature, "COLD");
const coldTakeover = validateAgentCall({ ...writeCall, to: "codex" }, coldState, NOW);
check(coldTakeover.status, "ACCEPTED");
check(coldTakeover.writer_takeover, true);
check(coldTakeover.breaths_total, 17);
check(coldTakeover.delta_minimum, true);

const nested = {
  ...base,
  call_id: "C-2",
  parent_call_id: "C-1",
  frontier_id: "F-DEBUG",
  depth: 1,
  from: "sol",
  to: "debugger",
  requested_role: "DEBUGGER",
  requested_action: "depurar a frente e devolver só o delta",
};
check(validateAgentCall({ ...nested, frontier_id: undefined }, state).status, "BLOCKED_INVALID_NESTED_CALL");
check(validateAgentCall({ ...nested, depth: 0 }, state).status, "BLOCKED_INVALID_NESTED_CALL");
check(validateAgentCall({ ...nested, to: "sol" }, state).status, "BLOCKED_SELF_DELEGATION");
check(validateAgentCall({ ...nested, to: "hermes", requested_role: "EXECUTOR", write_requested: true }, state).status, "BLOCKED_NESTED_WRITE_WITHOUT_HANDOFF");
check(validateAgentCall(nested, state).status, "ACCEPTED");
check(validateAgentCall({ ...nested, call_id: "C-3", parent_call_id: "C-2", depth: 2, from: "debugger", to: "reviewer" }, state).status, "ACCEPTED");

check(validateDelegationGate(state).status, "NOT_APPLICABLE_NO_DELEGABLE_FRONTIER");
const frontierState = {
  ...state,
  debug_frontiers: [{ id: "F-DEBUG", delegable: true, status: "OPEN" }],
};
const unsupported = {
  ...frontierState,
  capabilities: { delegate_agents: { supported: false, source: "runtime-tool-inventory", evidence_ref: "runtime:no-delegation-tool" } },
};
check(validateDelegationGate(unsupported).status, "NOT_APPLICABLE_CAPABILITY_UNAVAILABLE");
check(validateDelegationGate({ ...frontierState, capabilities: { delegate_agents: false } }).status, "BLOCKED_DELEGATION_CAPABILITY_UNKNOWN");
check(validateDelegationGate({ ...frontierState, capabilities: { delegate_agents: { supported: true } } }).status, "BLOCKED_DELEGATION_CAPABILITY_UNKNOWN");
check(validateDelegationGate(frontierState).status, "BLOCKED_REQUIRED_DELEGATION_MISSING");

const acceptedCall = validateAgentCall(nested, state);
check(validateDelegationGate({ ...frontierState, delegation_receipts: [acceptedCall] }).status, "BLOCKED_REQUIRED_DELEGATION_MISSING");

const result = {
  call_id: acceptedCall.call_id,
  mission_id: "M-1",
  from: "debugger",
  to: "sol",
  observed_head: "abc123",
  frontier_id: "F-DEBUG",
  trail_id: "TRILHO-A",
  status: "COMPLETED",
  execution_ref: "cli-run:42",
  delta_message: { material_delta: "erro X em src:x", next_target: "src:x" },
  evidence_refs: ["log:42"],
};
check(validateDelegationResult({ ...result, execution_ref: "" }, acceptedCall, state).status, "BLOCKED_INVALID_DELEGATION_RESULT");
check(validateDelegationResult({ ...result, observed_head: "old" }, acceptedCall, state).status, "BLOCKED_STALE_HEAD");
check(validateDelegationResult({ ...result, trail_id: "DESVIO" }, acceptedCall, state).status, "BLOCKED_ROUTE_DRIFT");
check(validateDelegationResult({ ...result, from: "sol", to: "debugger" }, acceptedCall, state).status, "BLOCKED_RADIO_DIRECTION_MISMATCH");
check(validateDelegationResult({ ...result, status: "RUNNING" }, acceptedCall, state).status, "BLOCKED_DELEGATION_NOT_COMPLETED");

const completed = validateDelegationResult(result, acceptedCall, state);
check(completed.status, "COMPLETED");
check(validateDelegationGate({ ...frontierState, delegation_receipts: [completed] }).status, "PASS_REQUIRED_DELEGATION");

const subSubCall = validateAgentCall({
  ...nested,
  call_id: "C-3",
  parent_call_id: "C-2",
  depth: 2,
  from: "debugger",
  to: "reviewer",
  requested_role: "REVIEWER",
}, state);
const subSubResult = validateDelegationResult({
  call_id: subSubCall.call_id,
  mission_id: "M-1",
  from: "reviewer",
  to: "debugger",
  observed_head: "abc123",
  frontier_id: "F-DEBUG",
  trail_id: "TRILHO-A",
  status: "COMPLETED",
  execution_ref: "cli-run:43",
  delta_message: { material_delta: null, conclusion: "contraprova não derrubou o finding" },
}, subSubCall, state);
check(subSubResult.status, "COMPLETED");

// HEALING_STREET: a costura normal já falhou. A recuperação deve escalar sem
// repetir cegamente nem trocar silenciosamente de trilho.
check(validateHealingGate(state).status, "NOT_APPLICABLE_NO_HEALING_REQUIRED");
const healingState = {
  ...state,
  healing: {
    required: true,
    trigger: "STITCH_FAILED",
    frontier_id: "F-HEAL",
  },
  healing_receipts: [],
};
check(validateHealingGate(healingState).status, "REQUIRED_WELD");
check(validateHealingGate({ ...healingState, healing: { ...healingState.healing, trigger: "UNKNOWN" } }).status, "BLOCKED_HEALING_TRIGGER_UNKNOWN");
check(validateHealingGate({ ...healingState, healing: { ...healingState.healing, frontier_id: "" } }).status, "BLOCKED_INVALID_HEALING_CONTEXT");

// Histórico fabricado fora da ordem não pode produzir verde.
const forgedRebuildHealed = {
  protocol: "CENTRALDARK_AGENT_CALL_V1",
  receipt_type: "HEALING_RESULT",
  mission_id: "M-1",
  observed_head: "abc123",
  frontier_id: "F-HEAL",
  trail_id: "TRILHO-A",
  level: "REBUILD_LOCAL",
  status: "HEALED",
  accepted: true,
  healed: true,
  result_ref: "forged:rebuild",
};
check(validateHealingGate({ ...healingState, healing_receipts: [forgedRebuildHealed] }).status, "BLOCKED_INVALID_HEALING_HISTORY");

const forgedBridgeHealed = {
  ...forgedRebuildHealed,
  level: "JUMP_BRIDGE",
  result_ref: "forged:bridge",
};
check(validateHealingGate({ ...healingState, healing_receipts: [forgedBridgeHealed] }).status, "BLOCKED_INVALID_HEALING_HISTORY");

const weldFailureInput = {
  mission_id: "M-1",
  observed_head: "abc123",
  frontier_id: "F-HEAL",
  trail_id: "TRILHO-A",
  level: "WELD",
  status: "FAILED",
  result_ref: "heal:weld:1",
  failure_ref: "test:weld:failed",
  cause_ref: "cause:structural-change",
  evidence_refs: ["log:weld:1"],
};
check(validateHealingResult({ ...weldFailureInput, evidence_refs: [] }, healingState).status, "BLOCKED_HEALING_EVIDENCE_MISSING");
check(validateHealingResult({ ...weldFailureInput, failure_ref: "" }, healingState).status, "BLOCKED_HEALING_FAILURE_UNPROVEN");
check(validateHealingResult({ ...weldFailureInput, observed_head: "old" }, healingState).status, "BLOCKED_STALE_HEAD");
check(validateHealingResult({ ...weldFailureInput, trail_id: "DESVIO" }, healingState).status, "BLOCKED_ROUTE_DRIFT");
check(validateHealingResult({ ...weldFailureInput, level: "JUMP_BRIDGE" }, healingState).status, "BLOCKED_HEALING_LEVEL_SKIP");

const weldFailed = validateHealingResult(weldFailureInput, healingState);
check(weldFailed.status, "FAILED");
const rebuildState = { ...healingState, healing_receipts: [weldFailed] };
check(validateHealingGate(rebuildState).status, "REQUIRED_REBUILD_LOCAL");

const rebuildSuccessInput = {
  mission_id: "M-1",
  observed_head: "abc123",
  frontier_id: "F-HEAL",
  trail_id: "TRILHO-A",
  level: "REBUILD_LOCAL",
  status: "HEALED",
  result_ref: "heal:rebuild:1",
  evidence_refs: ["log:rebuild:1", "diff:frontier"],
  test_ref: "test:rebuild:pass",
  counterproof_ref: "counterproof:rebuild:pass",
  review_forward_ref: "review:forward:1",
  review_backward_ref: "review:backward:1",
  checkpoint_before: "checkpoint:B",
  checkpoint_after: "checkpoint:C",
  postcondition_proven: true,
  affected_frontier_revalidated: true,
  material_delta_after_review: 0,
};
check(validateHealingResult({ ...rebuildSuccessInput, review_backward_ref: "" }, rebuildState).status, "BLOCKED_HEALING_PROOF_INCOMPLETE");
check(validateHealingResult({ ...rebuildSuccessInput, postcondition_proven: false }, rebuildState).status, "BLOCKED_HEALING_POSTCONDITION_UNPROVEN");
check(validateHealingResult({ ...rebuildSuccessInput, material_delta_after_review: 1 }, rebuildState).status, "BLOCKED_HEALING_REVIEW_NOT_FIXED_POINT");
const rebuildHealed = validateHealingResult(rebuildSuccessInput, rebuildState);
check(rebuildHealed.status, "HEALED");
check(validateHealingGate({ ...rebuildState, healing_receipts: [weldFailed, rebuildHealed] }).status, "PASS_HEALING_RECOVERED");

const rebuildFailureInput = {
  ...weldFailureInput,
  level: "REBUILD_LOCAL",
  result_ref: "heal:rebuild:failed",
  failure_ref: "test:rebuild:failed",
  cause_ref: "cause:route-segment-unviable",
  evidence_refs: ["log:rebuild:failed"],
};
const rebuildFailed = validateHealingResult(rebuildFailureInput, rebuildState);
check(rebuildFailed.status, "FAILED");
const bridgeState = { ...healingState, healing_receipts: [weldFailed, rebuildFailed] };
check(validateHealingGate(bridgeState).status, "REQUIRED_JUMP_BRIDGE");

const bridgeSuccessInput = {
  ...rebuildSuccessInput,
  level: "JUMP_BRIDGE",
  result_ref: "heal:bridge:1",
  evidence_refs: ["log:bridge:1", "proof:checkpoint"],
  test_ref: "test:bridge:pass",
  counterproof_ref: "counterproof:bridge:pass",
  review_forward_ref: "review:bridge:forward",
  review_backward_ref: "review:bridge:backward",
  checkpoint_before: "checkpoint:before-broken-segment",
  checkpoint_after: "checkpoint:rejoin-same-trail",
  bridge: {
    rejoins_same_trail: true,
    target_checkpoint_proven: true,
    authorization_preserved: true,
    scope_preserved: true,
    mandatory_gates_skipped: [],
  },
};
check(validateHealingResult({ ...bridgeSuccessInput, bridge: { ...bridgeSuccessInput.bridge, mandatory_gates_skipped: ["judge"] } }, bridgeState).status, "BLOCKED_UNSAFE_BRIDGE");
check(validateHealingResult({ ...bridgeSuccessInput, bridge: { ...bridgeSuccessInput.bridge, rejoins_same_trail: false } }, bridgeState).status, "BLOCKED_UNSAFE_BRIDGE");
const bridgeHealed = validateHealingResult(bridgeSuccessInput, bridgeState);
check(bridgeHealed.status, "HEALED");
check(validateHealingGate({ ...bridgeState, healing_receipts: [weldFailed, rebuildFailed, bridgeHealed] }).status, "PASS_HEALING_RECOVERED");

const bridgeFailureInput = {
  ...weldFailureInput,
  level: "JUMP_BRIDGE",
  result_ref: "heal:bridge:failed",
  failure_ref: "test:bridge:failed",
  cause_ref: "cause:no-safe-rejoin",
  evidence_refs: ["log:bridge:failed"],
};
const bridgeFailed = validateHealingResult(bridgeFailureInput, bridgeState);
check(bridgeFailed.status, "FAILED");
check(validateHealingGate({ ...bridgeState, healing_receipts: [weldFailed, rebuildFailed, bridgeFailed] }).status, "BLOCKED_HEALING_EXHAUSTED");

console.log(`agent-call: ${pass}/${pass} PASS`);
