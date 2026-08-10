#!/usr/bin/env node
import assert from "node:assert/strict";
import { validateAgentCall } from "./agent-call.mjs";

const state = {
  mission_id: "M-1",
  head: { sha: "abc123" },
  scope: { allowed: ["repo:read", "src:x"], denied: ["prod"] },
  writer: { agent: "hermes" },
};
const base = {
  call_id: "C-1",
  mission_id: "M-1",
  from: "sol",
  to: "reviewer",
  requested_role: "REVIEWER",
  observed_head: "abc123",
  scope: ["repo:read"],
  requested_action: "prove X",
  write_requested: false,
};

assert.equal(validateAgentCall(base, state).status, "ACCEPTED");
assert.equal(validateAgentCall({ ...base, mission_id: "M-X" }, state).status, "BLOCKED_UNKNOWN_MISSION");
assert.equal(validateAgentCall({ ...base, observed_head: "old" }, state).status, "BLOCKED_STALE_HEAD");
assert.equal(validateAgentCall({ ...base, scope: ["prod"] }, state).status, "BLOCKED_OUT_OF_SCOPE");
assert.equal(validateAgentCall({ ...base, requested_role: "REVIEWER", write_requested: true }, state).status, "BLOCKED_ROLE_CANNOT_WRITE");
assert.equal(validateAgentCall({ ...base, to: "codex", requested_role: "EXECUTOR", write_requested: true }, state).status, "BLOCKED_WRITER_CONFLICT");
assert.equal(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true }, state).status, "ACCEPTED");
assert.equal(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true, writer_handoff_required: true }, state).status, "BLOCKED_MISSING_HANDOFF");
assert.equal(validateAgentCall({ ...base, to: "hermes", requested_role: "EXECUTOR", write_requested: true, writer_handoff_required: true, writer_handoff_valid: true }, state).status, "ACCEPTED");

console.log("agent-call: 9/9 PASS");
