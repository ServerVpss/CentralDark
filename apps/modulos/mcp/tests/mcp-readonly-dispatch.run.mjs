import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Isola auditoria/logs: estes testes nunca podem escrever no estado real do runtime.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cd-dispatch-"));
process.env.MCP_AUDIT_DIR = path.join(tmp, "audit");
process.env.MCP_LOG_DIR = path.join(tmp, "logs");
process.env.MCP_ALLOW_VPS_COMMANDS = "true";

const { mcpAdminTools } = await import("../src/tools/core/mcp-admin.js");
const { semanticOutcome } = await import("../src/tool-result-envelope.js");
const dispatcher = mcpAdminTools.find((t) => t.name === "mcp_admin_call");

const ctx = (extra = {}) => ({
  admin: true, oauthScope: "admin", callerUser: "tester", correlationId: "cid-readonly-test", token: "", ...extra,
});
const call = async (command, extra) => {
  const res = await dispatcher.handler({ tool: "execute_command", input: { command, root: "tmp" } }, ctx(extra));
  return JSON.parse(res.content[0].text);
};

test("dispatcher geral continua destrutivo e execute_command continua anotado destrutivo", () => {
  assert.equal(dispatcher.annotations.destructiveHint, true);
  assert.equal(dispatcher.annotations.readOnlyHint, false);
});

test("leitura provada executa sem confirmacao, mesmo sem procedencia", async () => {
  const out = await call("echo marcador-readonly-ok");
  assert.equal(out.status, "OK");
  assert.match(out.stdout, /marcador-readonly-ok/);
});

test("escrita ou encadeamento sem procedencia continua bloqueado e nada executa", async () => {
  const marker = path.join(tmp, "nao-deve-existir");
  for (const command of [`touch ${marker}`, `echo a; touch ${marker}`, `echo a > ${marker}`]) {
    const out = await call(command);
    assert.equal(out.ok, false, command);
    assert.equal(out.executionStatus, "blocked", command);
    assert.equal(out.stdout, undefined, command);
  }
  assert.equal(fs.existsSync(marker), false);
});

test("procedencia desconhecida ou forjada nao vira autorizacao", async () => {
  const marker = path.join(tmp, "forjada");
  for (const authProvenance of ["verified_admin", "VERIFIED_OAUTH_ADMIN", "", null, undefined, "verified_hub_admin_x"]) {
    const out = await call(`touch ${marker}`, { authProvenance });
    assert.equal(out.executionStatus, "blocked", String(authProvenance));
  }
  assert.equal(fs.existsSync(marker), false);
});

test("procedencia aceita nao dispensa contexto admin completo", async () => {
  const marker = path.join(tmp, "sem-escopo");
  for (const extra of [{ oauthScope: "mcp" }, { admin: false }, { callerUser: null }, { correlationId: null }]) {
    const out = await call(`touch ${marker}`, { ...extra, authProvenance: "verified_oauth_admin" });
    assert.equal(out.ok, false);
    assert.equal(out.executionStatus, "blocked");
  }
  assert.equal(fs.existsSync(marker), false);
});

test("missao automatica nao ganha aprovacao para escrita, mas le", async () => {
  const marker = path.join(tmp, "auto");
  const w = await call(`touch ${marker}`, { autoMission: true, authProvenance: "verified_hub_admin" });
  assert.equal(w.executionStatus, "blocked");
  assert.equal(fs.existsSync(marker), false);
  const r = await call("hostname", { autoMission: true });
  assert.equal(r.status, "OK");
});

test("classifyInvocation que lanca erro cai em destrutiva (fail-closed)", async () => {
  const tool = mcpAdminTools.find((t) => t.name === "mcp_admin_call");
  assert.ok(tool);
  const { vpsLazyTools } = await import("../src/tools/vps/vps-lazy.js");
  const exec = vpsLazyTools.find((t) => t.name === "execute_command");
  assert.equal(exec.classifyInvocation({ command: "echo a", root: "tmp", cwd: "../fora" }).readOnly, false);
  assert.equal(exec.classifyInvocation({ command: "touch x", root: "tmp" }).readOnly, false);
  assert.equal(exec.classifyInvocation({ command: "echo a", root: "tmp" }).readOnly, true);
});

test("auditoria: bloqueio semantico nao e PASS; sucesso e invalido continuam coerentes", async () => {
  const blocked = await dispatcher.handler({ tool: "execute_command", input: { command: "touch x", root: "tmp" } }, ctx());
  assert.equal(semanticOutcome(blocked).ok, false);
  assert.equal(semanticOutcome(blocked).blocked, true);
  const missing = await dispatcher.handler({ tool: "nao_existe_xyz" }, ctx());
  assert.equal(semanticOutcome(missing).ok, false);
  const readonly = await dispatcher.handler({ tool: "execute_command", input: { command: "echo ok", root: "tmp" } }, ctx());
  assert.equal(semanticOutcome(readonly).ok, true);
  assert.equal(semanticOutcome({ content: [{ type: "text", text: "texto solto" }] }).ok, true);
  assert.equal(semanticOutcome(null).ok, true);
  assert.equal(semanticOutcome({ content: [{ type: "text", text: JSON.stringify({ ok: true }) }] }).ok, true);
});

test("fiacao: mcp-server usa o resultado semantico na auditoria e nao amplia a lista de procedencia", () => {
  const server = fs.readFileSync(new URL("../src/mcp-server.js", import.meta.url), "utf8");
  assert.match(server, /semanticOutcome\(result\)\.ok/);
  assert.match(server, /options\.authProvenance === "verified_oauth_admin"/);
  const admin = fs.readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
  assert.match(admin, /authProvenance === "verified_oauth_admin"/);
  assert.match(admin, /authProvenance === "verified_hub_admin"/);
});

