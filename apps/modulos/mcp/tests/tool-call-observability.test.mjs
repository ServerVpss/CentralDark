import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-toolcall-"));
process.env.MCP_LOG_DIR = logDir;

const audit = await import("../src/audit-logger.js");
const { log } = await import("../src/log.js");

test("tool-call envelope carries request trace through async work", async () => {
  let envelope;
  await audit.runWithAuditContext({
    mission_id: "MISSION-TOOLCALL",
    correlation_id: "corr-12345678",
    request_id: "request-12345678",
    trace_id: "1234567890abcdef1234567890abcdef",
    span_id: "1234567890abcdef",
    parent_span_id: "fedcba0987654321",
  }, async () => {
    await Promise.resolve();
    envelope = audit.auditToolExecution({
      method: "tools/call",
      toolName: "github_read",
      input: { repo: "ServerVpss/CentralDark" },
      result: { ok: true },
      durationMs: 12,
      exitCode: 0,
      ok: true,
    });
  });

  assert.equal(envelope.schema, "centraldark.mcp.tool-call.v1");
  assert.equal(envelope.mission_id, "MISSION-TOOLCALL");
  assert.equal(envelope.correlation_id, "corr-12345678");
  assert.equal(envelope.request_id, "request-12345678");
  assert.equal(envelope.trace_id, "1234567890abcdef1234567890abcdef");
  assert.equal(envelope.span_id, "1234567890abcdef");
  assert.equal(envelope.status, "PASS");
  assert.equal(envelope.pid, process.pid);
  assert.ok(envelope.call_id);
  assert.ok(envelope.started_at);
  assert.ok(envelope.ended_at);
});

test("tool-call envelope redacts sensitive fields before observers see them", () => {
  let observed;
  const unsubscribe = audit.subscribeAuditEvents((event) => { observed = event; });
  audit.auditToolExecution({
    method: "tools/call",
    toolName: "safe_probe",
    input: { authorization: "Bearer abcdefghijklmnopqrstuvwxyz", password: "segredo" },
    result: { email: "pessoa@example.com", ok: false },
    durationMs: 1,
    ok: false,
  });
  unsubscribe();
  assert.equal(observed.input.authorization, "[REDACTED]");
  assert.equal(observed.input.password, "[REDACTED]");
  assert.equal(observed.result.email, "[REDACTED_EMAIL]");
  assert.equal(observed.status, "FAIL");
});

test("audit event crosses existing log layer used by admin SSE", () => {
  const seen = [];
  const originalInfo = log.info;
  log.info = (msg, meta) => seen.push({ msg, meta });
  try {
    audit.auditToolExecution({ method: "tools/list", toolName: "list_tools", input: {}, result: { toolCount: 7 }, durationMs: 2, ok: true });
  } finally {
    log.info = originalInfo;
  }
  const live = seen.find((entry) => entry.msg === "mcp_tool_execution_live");
  assert.ok(live, "mcp_tool_execution_live must cross the existing log layer");
  assert.equal(live.meta.toolName, "list_tools");
  assert.equal(live.meta.status, "PASS");
});