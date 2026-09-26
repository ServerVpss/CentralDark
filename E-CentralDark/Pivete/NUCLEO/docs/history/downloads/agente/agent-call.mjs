#!/usr/bin/env node
/**
 * CentralDark Universal Agent Call — gate determinístico.
 *
 * Não executa modelo, não concede autoridade e não escreve no escopo chamado.
 * Valida CALL, retorno de delegação, obrigação de delegar e recuperação
 * determinística da mesma missão/trilho (HEALING_STREET).
 * Transporte (MCP/HTTP/CLI/Telegram/etc.) fica fora deste núcleo.
 */
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const PROTOCOL = "CENTRALDARK_AGENT_CALL_V1";
const ALLOWED_ROLES = new Set([
  "COORDINATOR", "EXECUTOR", "DEBUGGER", "REVIEWER", "JUDGE", "HERMES", "READ_ONLY",
]);
const WRITE_ROLES = new Set(["EXECUTOR", "HERMES"]);
const DELEGATION_ROLES = new Set(["DEBUGGER", "REVIEWER", "JUDGE", "READ_ONLY"]);
const CLOSED_FRONTIER_STATES = new Set(["CLOSED", "DONE", "RESOLVED"]);
const HEALING_LEVELS = ["WELD", "REBUILD_LOCAL", "JUMP_BRIDGE"];

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmpty);
}

function fail(reason, call, extra = {}) {
  return {
    protocol: PROTOCOL,
    call_id: call?.call_id || null,
    mission_id: call?.mission_id || null,
    status: reason,
    accepted: false,
    write_authorized: false,
    ...extra,
  };
}

function gateFail(reason, state, extra = {}) {
  return {
    protocol: PROTOCOL,
    gate: "REQUIRED_DELEGATION",
    mission_id: state?.mission_id || null,
    observed_head: state?.head?.sha || null,
    status: reason,
    accepted: false,
    required: true,
    ...extra,
  };
}

function healingGateFail(reason, state, extra = {}) {
  return {
    protocol: PROTOCOL,
    gate: "HEALING_STREET",
    mission_id: state?.mission_id || null,
    observed_head: state?.head?.sha || null,
    trail_id: state?.trail?.route_id || null,
    frontier_id: state?.healing?.frontier_id || null,
    status: reason,
    accepted: false,
    required: true,
    ...extra,
  };
}

function openDelegableFrontiers(state) {
  const raw = Array.isArray(state?.debug_frontiers)
    ? state.debug_frontiers
    : state?.debug_frontier
      ? [state.debug_frontier]
      : [];

  return raw.filter((frontier) => (
    frontier
    && typeof frontier === "object"
    && frontier.delegable === true
    && !CLOSED_FRONTIER_STATES.has(String(frontier.status || "OPEN").toUpperCase())
  ));
}

function getDelegationCapability(state) {
  const cap = state?.capabilities?.delegate_agents;
  if (
    !cap
    || typeof cap !== "object"
    || typeof cap.supported !== "boolean"
    || !nonEmpty(cap.source)
    || !nonEmpty(cap.evidence_ref)
  ) {
    return { known: false, supported: null };
  }
  return {
    known: true,
    supported: cap.supported,
    source: cap.source,
    evidence_ref: cap.evidence_ref,
  };
}

function resultReceiptMatchesFrontier(receipt, frontier, state) {
  const routeId = state?.trail?.route_id || null;
  return Boolean(
    receipt
    && receipt.protocol === PROTOCOL
    && receipt.receipt_type === "DELEGATION_RESULT"
    && receipt.accepted === true
    && receipt.status === "COMPLETED"
    && receipt.delegation_completed === true
    && receipt.mission_id === state.mission_id
    && receipt.observed_head === state?.head?.sha
    && receipt.frontier_id === frontier.id
    && receipt.from
    && receipt.to
    && receipt.from !== receipt.to
    && DELEGATION_ROLES.has(receipt.requested_role)
    && receipt.write_authorized === false
    && (!routeId || receipt.trail_id === routeId)
    && receipt.return_mode === "DELTA_MESSAGE"
    && nonEmpty(receipt.execution_ref)
    && receipt.delta_message !== undefined
    && receipt.delta_message !== null
  );
}

function currentHealingReceipts(state) {
  const routeId = state?.trail?.route_id || null;
  const frontierId = state?.healing?.frontier_id || null;
  const raw = Array.isArray(state?.healing_receipts) ? state.healing_receipts : [];
  return raw.filter((receipt) => (
    receipt
    && receipt.protocol === PROTOCOL
    && receipt.receipt_type === "HEALING_RESULT"
    && receipt.accepted === true
    && receipt.mission_id === state?.mission_id
    && receipt.observed_head === state?.head?.sha
    && receipt.trail_id === routeId
    && receipt.frontier_id === frontierId
    && HEALING_LEVELS.includes(receipt.level)
    && ["FAILED", "HEALED"].includes(receipt.status)
  ));
}

function nextHealingLevel(state) {
  const receipts = currentHealingReceipts(state);
  if (receipts.length === 0) return { done: false, receipts, next: "WELD" };
  if (receipts.length > HEALING_LEVELS.length) {
    return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
  }

  for (let index = 0; index < receipts.length; index += 1) {
    const receipt = receipts[index];
    const expectedLevel = HEALING_LEVELS[index];
    if (receipt.level !== expectedLevel) {
      return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
    }

    const isLast = index === receipts.length - 1;
    if (receipt.status === "HEALED") {
      if (receipt.healed !== true || !isLast) {
        return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
      }
      return { done: true, receipts, healedReceipt: receipt, next: null };
    }

    if (receipt.status !== "FAILED" || receipt.healed !== false) {
      return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
    }
  }

  if (receipts.length === HEALING_LEVELS.length) {
    return { done: false, receipts, exhausted: true, next: null };
  }
  return { done: false, receipts, next: HEALING_LEVELS[receipts.length] };
}

/**
 * Valida a volta do rádio. CALL_ACCEPTED não prova execução; só este receipt
 * DELEGATION_RESULT pode satisfazer o gate de delegação obrigatória.
 */
export function validateDelegationResult(result, callReceipt, state) {
  if (!result || typeof result !== "object") return fail("BLOCKED_INVALID_DELEGATION_RESULT", result);
  if (!state || typeof state !== "object") return fail("BLOCKED_UNKNOWN_MISSION", result);
  if (
    !callReceipt
    || callReceipt.protocol !== PROTOCOL
    || callReceipt.accepted !== true
    || callReceipt.status !== "ACCEPTED"
  ) {
    return fail("BLOCKED_CALL_RECEIPT_NOT_ACCEPTED", result);
  }
  if (!callReceipt.parent_call_id || !DELEGATION_ROLES.has(callReceipt.requested_role) || callReceipt.write_authorized !== false) {
    return fail("BLOCKED_CALL_NOT_READ_ONLY_DELEGATION", result);
  }

  const required = ["call_id", "mission_id", "from", "to", "observed_head", "frontier_id", "trail_id", "execution_ref", "delta_message"];
  const missing = required.filter((key) => (
    result[key] === undefined
    || result[key] === null
    || (typeof result[key] === "string" && result[key].trim() === "")
  ));
  if (missing.length) return fail("BLOCKED_INVALID_DELEGATION_RESULT", result, { missing });

  if (result.call_id !== callReceipt.call_id) return fail("BLOCKED_DELEGATION_CALL_MISMATCH", result);
  if (result.mission_id !== state.mission_id || result.mission_id !== callReceipt.mission_id) {
    return fail("BLOCKED_UNKNOWN_MISSION", result);
  }
  if (result.observed_head !== state?.head?.sha || result.observed_head !== callReceipt.observed_head) {
    return fail("BLOCKED_STALE_HEAD", result, { expected_head: state?.head?.sha || "UNKNOWN" });
  }
  if (result.frontier_id !== callReceipt.frontier_id) return fail("BLOCKED_FRONTIER_MISMATCH", result);
  if (result.trail_id !== callReceipt.trail_id) return fail("BLOCKED_ROUTE_DRIFT", result, { expected_trail: callReceipt.trail_id });
  if (result.from !== callReceipt.to || result.to !== callReceipt.from) return fail("BLOCKED_RADIO_DIRECTION_MISMATCH", result);
  if (result.status !== "COMPLETED") return fail("BLOCKED_DELEGATION_NOT_COMPLETED", result);

  return {
    protocol: PROTOCOL,
    receipt_type: "DELEGATION_RESULT",
    call_id: callReceipt.call_id,
    parent_call_id: callReceipt.parent_call_id,
    depth: callReceipt.depth,
    mission_id: callReceipt.mission_id,
    status: "COMPLETED",
    accepted: true,
    delegation_completed: true,
    write_authorized: false,
    from: callReceipt.from,
    to: callReceipt.to,
    requested_role: callReceipt.requested_role,
    observed_head: callReceipt.observed_head,
    frontier_id: callReceipt.frontier_id,
    trail_id: callReceipt.trail_id,
    execution_ref: result.execution_ref,
    delta_message: result.delta_message,
    evidence_refs: Array.isArray(result.evidence_refs) ? result.evidence_refs : [],
    return_mode: "DELTA_MESSAGE",
    radio_mode: "DELTA_ONLY",
  };
}

/**
 * Gate de fechamento: se há capacidade real comprovada + frente delegável,
 * exige um DELEGATION_RESULT válido por frente. Sem trabalho separável, não
 * cria agente ornamental.
 */
export function validateDelegationGate(state) {
  if (!state || typeof state !== "object") {
    return gateFail("BLOCKED_UNKNOWN_MISSION", state);
  }

  const frontiers = openDelegableFrontiers(state);
  if (frontiers.length === 0) {
    return {
      protocol: PROTOCOL,
      gate: "REQUIRED_DELEGATION",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      status: "NOT_APPLICABLE_NO_DELEGABLE_FRONTIER",
      accepted: true,
      required: false,
      delegated_frontiers: 0,
    };
  }

  const capability = getDelegationCapability(state);
  if (!capability.known) {
    return gateFail("BLOCKED_DELEGATION_CAPABILITY_UNKNOWN", state, {
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    });
  }
  if (capability.supported === false) {
    return {
      protocol: PROTOCOL,
      gate: "REQUIRED_DELEGATION",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      status: "NOT_APPLICABLE_CAPABILITY_UNAVAILABLE",
      accepted: true,
      required: false,
      capability_source: capability.source,
      capability_evidence_ref: capability.evidence_ref,
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    };
  }

  const invalidFrontiers = frontiers.filter((frontier) => !nonEmpty(frontier.id));
  if (invalidFrontiers.length) {
    return gateFail("BLOCKED_INVALID_DEBUG_FRONTIER", state);
  }

  const receipts = Array.isArray(state.delegation_receipts) ? state.delegation_receipts : [];
  const missing = frontiers
    .filter((frontier) => !receipts.some((receipt) => resultReceiptMatchesFrontier(receipt, frontier, state)))
    .map((frontier) => frontier.id);

  if (missing.length) {
    return gateFail("BLOCKED_REQUIRED_DELEGATION_MISSING", state, {
      missing_frontiers: missing,
      capability_source: capability.source,
      capability_evidence_ref: capability.evidence_ref,
    });
  }

  return {
    protocol: PROTOCOL,
    gate: "REQUIRED_DELEGATION",
    mission_id: state.mission_id,
    observed_head: state?.head?.sha || null,
    status: "PASS_REQUIRED_DELEGATION",
    accepted: true,
    required: true,
    capability_source: capability.source,
    capability_evidence_ref: capability.evidence_ref,
    delegated_frontiers: frontiers.map((frontier) => frontier.id),
    radio_mode: "DELTA_MESSAGE",
  };
}

/**
 * HEALING_STREET não abre outro trilho. Ele repara a continuidade do trilho
 * canônico depois de STITCH_FAILED, escalando sem repetição cega:
 * WELD -> REBUILD_LOCAL -> JUMP_BRIDGE -> BLOCKED.
 */
export function validateHealingGate(state) {
  if (!state || typeof state !== "object") return healingGateFail("BLOCKED_UNKNOWN_MISSION", state);
  if (state?.healing?.required !== true) {
    return {
      protocol: PROTOCOL,
      gate: "HEALING_STREET",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      trail_id: state?.trail?.route_id || null,
      status: "NOT_APPLICABLE_NO_HEALING_REQUIRED",
      accepted: true,
      required: false,
    };
  }
  if (state?.healing?.trigger !== "STITCH_FAILED") {
    return healingGateFail("BLOCKED_HEALING_TRIGGER_UNKNOWN", state);
  }
  if (!nonEmpty(state?.mission_id) || !nonEmpty(state?.head?.sha) || !nonEmpty(state?.trail?.route_id) || !nonEmpty(state?.healing?.frontier_id)) {
    return healingGateFail("BLOCKED_INVALID_HEALING_CONTEXT", state);
  }

  const progression = nextHealingLevel(state);
  if (progression.invalid) return healingGateFail(progression.invalid, state);
  if (progression.done) {
    const healed = progression.healedReceipt;
    return {
      protocol: PROTOCOL,
      gate: "HEALING_STREET",
      mission_id: state.mission_id,
      observed_head: state.head.sha,
      trail_id: state.trail.route_id,
      frontier_id: state.healing.frontier_id,
      status: "PASS_HEALING_RECOVERED",
      accepted: true,
      required: true,
      recovered_by: healed.level,
      receipt_ref: healed.result_ref || null,
    };
  }
  if (progression.exhausted) {
    return healingGateFail("BLOCKED_HEALING_EXHAUSTED", state, {
      exhausted_after: "JUMP_BRIDGE",
    });
  }

  return {
    protocol: PROTOCOL,
    gate: "HEALING_STREET",
    mission_id: state.mission_id,
    observed_head: state.head.sha,
    trail_id: state.trail.route_id,
    frontier_id: state.healing.frontier_id,
    status: `REQUIRED_${progression.next}`,
    accepted: false,
    required: true,
    next_level: progression.next,
    attempts_completed: progression.receipts.length,
  };
}

/**
 * Registra resultado de um nível de cura. Um resultado FAILED é um recibo
 * válido de falha e libera somente o próximo nível. Um HEALED só fecha após
 * teste + contraprova + revisão completa de ida e volta da fronteira afetada.
 */
export function validateHealingResult(result, state) {
  if (!result || typeof result !== "object") return fail("BLOCKED_INVALID_HEALING_RESULT", result);
  const gate = validateHealingGate(state);
  if (gate.status === "NOT_APPLICABLE_NO_HEALING_REQUIRED") return fail("BLOCKED_HEALING_NOT_REQUIRED", result);
  if (gate.status === "PASS_HEALING_RECOVERED") return fail("BLOCKED_HEALING_ALREADY_RECOVERED", result);
  if (gate.status === "BLOCKED_HEALING_EXHAUSTED") return fail("BLOCKED_HEALING_EXHAUSTED", result);
  if (!gate.next_level) return fail(gate.status || "BLOCKED_INVALID_HEALING_CONTEXT", result);

  const required = ["mission_id", "observed_head", "frontier_id", "trail_id", "level", "status", "result_ref"];
  const missing = required.filter((key) => !nonEmpty(result[key]));
  if (missing.length) return fail("BLOCKED_INVALID_HEALING_RESULT", result, { missing });
  if (result.mission_id !== state.mission_id) return fail("BLOCKED_UNKNOWN_MISSION", result);
  if (result.observed_head !== state.head.sha) return fail("BLOCKED_STALE_HEAD", result, { expected_head: state.head.sha });
  if (result.frontier_id !== state.healing.frontier_id) return fail("BLOCKED_FRONTIER_MISMATCH", result);
  if (result.trail_id !== state.trail.route_id) return fail("BLOCKED_ROUTE_DRIFT", result, { expected_trail: state.trail.route_id });
  if (result.level !== gate.next_level) {
    return fail("BLOCKED_HEALING_LEVEL_SKIP", result, { expected_level: gate.next_level });
  }
  if (!["FAILED", "HEALED"].includes(result.status)) return fail("BLOCKED_INVALID_HEALING_STATUS", result);
  if (!nonEmptyArray(result.evidence_refs)) return fail("BLOCKED_HEALING_EVIDENCE_MISSING", result);

  if (result.status === "FAILED") {
    if (!nonEmpty(result.failure_ref) || !nonEmpty(result.cause_ref)) {
      return fail("BLOCKED_HEALING_FAILURE_UNPROVEN", result);
    }
    return {
      protocol: PROTOCOL,
      receipt_type: "HEALING_RESULT",
      mission_id: result.mission_id,
      observed_head: result.observed_head,
      frontier_id: result.frontier_id,
      trail_id: result.trail_id,
      level: result.level,
      status: "FAILED",
      accepted: true,
      healed: false,
      result_ref: result.result_ref,
      failure_ref: result.failure_ref,
      cause_ref: result.cause_ref,
      evidence_refs: result.evidence_refs,
      next_level: HEALING_LEVELS[HEALING_LEVELS.indexOf(result.level) + 1] || "BLOCKED",
    };
  }

  const successRefs = [
    "test_ref",
    "counterproof_ref",
    "review_forward_ref",
    "review_backward_ref",
    "checkpoint_before",
    "checkpoint_after",
  ];
  const missingSuccess = successRefs.filter((key) => !nonEmpty(result[key]));
  if (missingSuccess.length) return fail("BLOCKED_HEALING_PROOF_INCOMPLETE", result, { missing: missingSuccess });
  if (result.postcondition_proven !== true || result.affected_frontier_revalidated !== true) {
    return fail("BLOCKED_HEALING_POSTCONDITION_UNPROVEN", result);
  }
  if (result.material_delta_after_review !== 0) {
    return fail("BLOCKED_HEALING_REVIEW_NOT_FIXED_POINT", result);
  }

  if (result.level === "JUMP_BRIDGE") {
    const bridge = result.bridge;
    if (!bridge || typeof bridge !== "object") return fail("BLOCKED_UNSAFE_BRIDGE", result);
    if (
      bridge.rejoins_same_trail !== true
      || bridge.target_checkpoint_proven !== true
      || bridge.authorization_preserved !== true
      || bridge.scope_preserved !== true
      || !Array.isArray(bridge.mandatory_gates_skipped)
      || bridge.mandatory_gates_skipped.length !== 0
    ) {
      return fail("BLOCKED_UNSAFE_BRIDGE", result);
    }
  }

  return {
    protocol: PROTOCOL,
    receipt_type: "HEALING_RESULT",
    mission_id: result.mission_id,
    observed_head: result.observed_head,
    frontier_id: result.frontier_id,
    trail_id: result.trail_id,
    level: result.level,
    status: "HEALED",
    accepted: true,
    healed: true,
    result_ref: result.result_ref,
    evidence_refs: result.evidence_refs,
    test_ref: result.test_ref,
    counterproof_ref: result.counterproof_ref,
    review_forward_ref: result.review_forward_ref,
    review_backward_ref: result.review_backward_ref,
    checkpoint_before: result.checkpoint_before,
    checkpoint_after: result.checkpoint_after,
    postcondition_proven: true,
    affected_frontier_revalidated: true,
    material_delta_after_review: 0,
    bridge: result.level === "JUMP_BRIDGE" ? result.bridge : null,
  };
}

export function validateAgentCall(call, state) {
  if (!call || typeof call !== "object") return fail("BLOCKED_INVALID_CALL", call);
  if (!state || typeof state !== "object") return fail("BLOCKED_UNKNOWN_MISSION", call);

  const required = ["mission_id", "from", "to", "requested_role", "observed_head", "scope", "requested_action"];
  const missing = required.filter((k) => call[k] === undefined || call[k] === null || call[k] === "");
  if (missing.length) return fail("BLOCKED_INVALID_CALL", call, { missing });

  if (call.mission_id !== state.mission_id) return fail("BLOCKED_UNKNOWN_MISSION", call);
  if (!ALLOWED_ROLES.has(call.requested_role)) return fail("BLOCKED_ROLE", call);

  const liveHead = state?.head?.sha;
  if (!liveHead || call.observed_head !== liveHead) {
    return fail("BLOCKED_STALE_HEAD", call, { expected_head: liveHead || "UNKNOWN" });
  }

  const routeId = state?.trail?.route_id || null;
  if (routeId) {
    if (!call.trail_id) return fail("BLOCKED_MISSING_TRAIL", call, { expected_trail: routeId });
    if (call.trail_id !== routeId) return fail("BLOCKED_ROUTE_DRIFT", call, { expected_trail: routeId });
  }

  const allowed = Array.isArray(state?.scope?.allowed) ? state.scope.allowed : [];
  const denied = Array.isArray(state?.scope?.denied) ? state.scope.denied : [];
  const requestedScope = Array.isArray(call.scope) ? call.scope : [call.scope];
  if (requestedScope.some((x) => denied.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);
  if (allowed.length && requestedScope.some((x) => !allowed.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);

  const nested = Boolean(call.parent_call_id);
  if (nested) {
    if (!call.frontier_id || !Number.isInteger(call.depth) || call.depth < 1) {
      return fail("BLOCKED_INVALID_NESTED_CALL", call);
    }
    if (call.from === call.to) return fail("BLOCKED_SELF_DELEGATION", call);
  }

  const writeRequested = call.write_requested === true;
  if (nested && writeRequested && call.writer_handoff_valid !== true) {
    return fail("BLOCKED_NESTED_WRITE_WITHOUT_HANDOFF", call);
  }

  if (writeRequested) {
    if (!WRITE_ROLES.has(call.requested_role)) return fail("BLOCKED_ROLE_CANNOT_WRITE", call);
    const writer = state?.writer?.agent;
    if (!writer || writer === "NONE") return fail("BLOCKED_NO_WRITER", call);
    if (writer !== call.to) return fail("BLOCKED_WRITER_CONFLICT", call, { current_writer: writer });
    if (call.writer_handoff_required === true && call.writer_handoff_valid !== true) {
      return fail("BLOCKED_MISSING_HANDOFF", call);
    }
  }

  return {
    protocol: PROTOCOL,
    receipt_type: "CALL_ACCEPTED",
    call_id: call.call_id || randomUUID(),
    parent_call_id: call.parent_call_id || null,
    depth: nested ? call.depth : 0,
    frontier_id: call.frontier_id || null,
    mission_id: call.mission_id,
    status: "ACCEPTED",
    accepted: true,
    write_authorized: writeRequested,
    from: call.from,
    to: call.to,
    requested_role: call.requested_role,
    observed_head: call.observed_head,
    trail_id: call.trail_id || routeId,
    scope: requestedScope,
    requested_action: call.requested_action,
    return_mode: "DELTA_MESSAGE",
    radio_mode: "DELTA_ONLY",
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--delegation-gate") {
    const statePath = args[1];
    if (!statePath) {
      console.error("uso: node scripts/agent-call.mjs --delegation-gate <jarvis-state.json>");
      process.exit(2);
    }
    const state = await readFile(statePath, "utf8").then(JSON.parse);
    const receipt = validateDelegationGate(state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--delegation-result") {
    const [resultPath, callReceiptPath, statePath] = args.slice(1);
    if (!resultPath || !callReceiptPath || !statePath) {
      console.error("uso: node scripts/agent-call.mjs --delegation-result <result.json> <call-receipt.json> <jarvis-state.json>");
      process.exit(2);
    }
    const [result, callReceipt, state] = await Promise.all([
      readFile(resultPath, "utf8").then(JSON.parse),
      readFile(callReceiptPath, "utf8").then(JSON.parse),
      readFile(statePath, "utf8").then(JSON.parse),
    ]);
    const receipt = validateDelegationResult(result, callReceipt, state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--healing-gate") {
    const statePath = args[1];
    if (!statePath) {
      console.error("uso: node scripts/agent-call.mjs --healing-gate <jarvis-state.json>");
      process.exit(2);
    }
    const state = await readFile(statePath, "utf8").then(JSON.parse);
    const receipt = validateHealingGate(state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--healing-result") {
    const [resultPath, statePath] = args.slice(1);
    if (!resultPath || !statePath) {
      console.error("uso: node scripts/agent-call.mjs --healing-result <result.json> <jarvis-state.json>");
      process.exit(2);
    }
    const [result, state] = await Promise.all([
      readFile(resultPath, "utf8").then(JSON.parse),
      readFile(statePath, "utf8").then(JSON.parse),
    ]);
    const receipt = validateHealingResult(result, state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  const [callPath, statePath] = args;
  if (!callPath || !statePath) {
    console.error("uso: node scripts/agent-call.mjs <call.json> <jarvis-state.json>");
    process.exit(2);
  }
  const [call, state] = await Promise.all([
    readFile(callPath, "utf8").then(JSON.parse),
    readFile(statePath, "utf8").then(JSON.parse),
  ]);
  const receipt = validateAgentCall(call, state);
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exit(receipt.accepted ? 0 : 13);
}

if (process.argv[1]?.endsWith("agent-call.mjs")) {
  main().catch((error) => {
    console.error(JSON.stringify({ protocol: PROTOCOL, status: "BLOCKED_RUNTIME_ERROR", error: error.message }));
    process.exit(1);
  });
}
