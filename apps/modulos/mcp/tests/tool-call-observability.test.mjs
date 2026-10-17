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
  const authFixture = "Bea" + "rer " + "abcdefghijklmnopqrstuvwx";
  audit.auditToolExecution({
    method: "tools/call",
    toolName: "safe_probe",
    input: { authorization: authFixture, password: "segredo" },
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

test("Tool Call Lens reutiliza SSE admin e exporta so metadados de auditoria", () => {
  const src = fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8");
  assert.match(src, /subscribeAuditEvents\(\(evento\) =>/);
  assert.match(src, /mcp_tool_call/);
  assert.match(src, /id="toolLensRows"/);
  assert.match(src, /function toolLensAlternar\(/);
  assert.match(src, /function toolLensRever\(/);
  assert.match(src, /toolLensRegistrar\(d\)/);
  const begin = src.indexOf("subscribeAuditEvents((evento) =>");
  const end = src.indexOf("function extrairRota(", begin);
  const observer = src.slice(begin, end);
  assert.ok(begin >= 0 && end > begin);
  assert.doesNotMatch(observer, /evento\.(?:input|result|error)/);
  assert.ok(observer.includes("mcp_host_pid"));
  assert.ok(observer.includes("durationMs"));
  assert.ok(observer.includes("correlation_id"));
});


test("CORS admin fica restrito a GET de logs/metricas e origem do cockpit", () => {
  const src = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.ok(src.includes('https://admin.centralldark.com'));
  assert.ok(src.includes('CENTRALDARK_COCKPIT_ADMIN_READ_ORIGINS'));
  assert.ok(src.includes('req.method === "GET"'));
  assert.ok(src.includes('path === "/admin/api/logs"'));
  assert.ok(src.includes('path === "/admin/api/metricas"'));
  assert.ok(src.includes('cockpitAdminReadOrigins.has(origin)'));
  assert.ok(src.includes('res.setHeader("Access-Control-Allow-Credentials", "true")'));
  assert.ok(src.includes('res.vary("Origin")'));
});


test("Forja Tool Call Lens preserva quatro gates e nao faz merge/deploy", () => {
  const script = fs.readFileSync(new URL(
    "../../../../skills/vs-code-restore/tools/forja-tool-call-lens-4-fases.ps1",
    import.meta.url,
  ), "utf8");
  for (const phase of ["01_CONSTRUIR", "02_INSTALAR", "03_CONECTAR", "04_PROVAR"]) {
    assert.ok(script.includes(phase), "fase obrigatoria ausente: " + phase);
  }
  assert.ok(script.includes("ExitCode") || script.includes("LASTEXITCODE"));
  assert.ok(script.includes("CENTRALDARK_SSH_READBACK_OK"));
  assert.ok(script.includes("VSIX_VERSION_READBACK_MISSING"));
  assert.ok(script.includes("E2E_TOOL_CALL_NOT_MEASURED"));
  assert.ok(script.includes("published = $false"));
  assert.ok(script.includes("exit 3"));
  assert.doesNotMatch(script, /git\s+(?:reset|merge|push|clean)|systemctl\s+restart|force.push/i);
});
