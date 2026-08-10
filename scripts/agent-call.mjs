#!/usr/bin/env node
/**
 * CentralDark Universal Agent Call — gate determinístico.
 *
 * Não executa modelo, não concede autoridade e não escreve no escopo chamado.
 * Recebe CALL + STATE em JSON, valida missão/HEAD/escopo/writer e emite receipt.
 * Transporte (MCP/HTTP/CLI/Telegram/etc.) fica fora deste núcleo.
 */
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const ALLOWED_ROLES = new Set([
  "COORDINATOR", "EXECUTOR", "DEBUGGER", "REVIEWER", "JUDGE", "HERMES", "READ_ONLY",
]);
const WRITE_ROLES = new Set(["EXECUTOR", "HERMES"]);

function fail(reason, call, extra = {}) {
  return {
    protocol: "CENTRALDARK_AGENT_CALL_V1",
    call_id: call?.call_id || null,
    mission_id: call?.mission_id || null,
    status: reason,
    accepted: false,
    write_authorized: false,
    ...extra,
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

  const allowed = Array.isArray(state?.scope?.allowed) ? state.scope.allowed : [];
  const denied = Array.isArray(state?.scope?.denied) ? state.scope.denied : [];
  const requestedScope = Array.isArray(call.scope) ? call.scope : [call.scope];
  if (requestedScope.some((x) => denied.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);
  if (allowed.length && requestedScope.some((x) => !allowed.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);

  const writeRequested = call.write_requested === true;
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
    protocol: "CENTRALDARK_AGENT_CALL_V1",
    call_id: call.call_id || randomUUID(),
    mission_id: call.mission_id,
    status: "ACCEPTED",
    accepted: true,
    write_authorized: writeRequested,
    to: call.to,
    requested_role: call.requested_role,
    observed_head: call.observed_head,
    scope: requestedScope,
    requested_action: call.requested_action,
    return_mode: "DELTA_MESSAGE",
  };
}

async function main() {
  const [callPath, statePath] = process.argv.slice(2);
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
    console.error(JSON.stringify({ protocol: "CENTRALDARK_AGENT_CALL_V1", status: "BLOCKED_RUNTIME_ERROR", error: error.message }));
    process.exit(1);
  });
}
