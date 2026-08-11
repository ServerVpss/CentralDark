#!/usr/bin/env node
/**
 * CentralDark Universal Agent Call — gate determinístico.
 *
 * Não executa modelo, não concede autoridade e não escreve no escopo chamado.
 * Recebe CALL + STATE em JSON, valida missão/HEAD/escopo/writer/trilho e emite receipt.
 * Transporte (MCP/HTTP/CLI/Telegram/etc.) fica fora deste núcleo.
 *
 * MENOS É MAIS + Meta Lupa:
 * - chamada aninhada continua na mesma missão e no mesmo trilho;
 * - subagente é read-only por padrão; escrita aninhada exige handoff explícito;
 * - se o runtime consegue delegar E existe frente de debug realmente separável,
 *   a finalização deve provar delegação por receipt aceito;
 * - sem frente delegável, não cria agente ornamental.
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

function receiptMatchesFrontier(receipt, frontier, state) {
  const routeId = state?.trail?.route_id || null;
  return Boolean(
    receipt
    && receipt.protocol === PROTOCOL
    && receipt.accepted === true
    && receipt.status === "ACCEPTED"
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
  );
}

/**
 * Gate de fechamento: se há capacidade real + frente delegável, tem que existir
 * ao menos um receipt de delegação read-only válido por frente.
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

  const capability = state?.capabilities?.delegate_agents;
  if (capability === false) {
    return {
      protocol: PROTOCOL,
      gate: "REQUIRED_DELEGATION",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      status: "NOT_APPLICABLE_CAPABILITY_UNAVAILABLE",
      accepted: true,
      required: false,
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    };
  }
  if (capability !== true) {
    return gateFail("BLOCKED_DELEGATION_CAPABILITY_UNKNOWN", state, {
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    });
  }

  const invalidFrontiers = frontiers.filter((frontier) => !frontier.id);
  if (invalidFrontiers.length) {
    return gateFail("BLOCKED_INVALID_DEBUG_FRONTIER", state);
  }

  const receipts = Array.isArray(state.delegation_receipts) ? state.delegation_receipts : [];
  const missing = frontiers
    .filter((frontier) => !receipts.some((receipt) => receiptMatchesFrontier(receipt, frontier, state)))
    .map((frontier) => frontier.id);

  if (missing.length) {
    return gateFail("BLOCKED_REQUIRED_DELEGATION_MISSING", state, {
      missing_frontiers: missing,
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
    delegated_frontiers: frontiers.map((frontier) => frontier.id),
    radio_mode: "DELTA_MESSAGE",
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
