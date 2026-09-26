# AGENTE - agent-call.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\agent-call.test.mjs
**SHA:** fad6c4d7539a9753
**Timestamp:** 2026-08-28T02:57:32.469632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execution_ref: "cli-run:42",
- execution_ref: "cli-run:43",

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import assert from "node:assert/strict";
import {
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
check(validateDelegationResult({ ...result, trail_id: "DESVIO" }, acceptedCall, state).status, "BLOCKED_R
```