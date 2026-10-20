import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readVsCodeDevices, vscodeRemoteTerminalTools } from "../src/tools/local/vscode-remote-terminal.js";

const dirnameHere = dirname(fileURLToPath(import.meta.url));
const tokenName = "CENTRALDARK_VSCODE_DEVICE_TOKEN_SEGREDO";
const secret = "A".repeat(40);
const registry = JSON.stringify([{ id: "segredo", url: "https://segredo.tail6d7aa4.ts.net/", tokenEnv: tokenName }]);
const originalFetch = globalThis.fetch;
const oldEnv = process.env.CENTRALDARK_VSCODE_DEVICES_JSON;
const oldSecret = process.env[tokenName];

test.after(() => {
  globalThis.fetch = originalFetch;
  if (oldEnv === undefined) delete process.env.CENTRALDARK_VSCODE_DEVICES_JSON;
  else process.env.CENTRALDARK_VSCODE_DEVICES_JSON = oldEnv;
  if (oldSecret === undefined) delete process.env[tokenName];
  else process.env[tokenName] = oldSecret;
});
function result(response) { return JSON.parse(response.content[0].text); }
const tool = name => vscodeRemoteTerminalTools.find(t => t.name === name);

test("rejects public/unpaired device targets and deduplicates IDs without disclosing secrets", () => {
  const env = { [tokenName]: secret };
  assert.deepEqual(readVsCodeDevices("", env), []);
  const malformed = [
    { id: "segredo", url: "http://segredo.tail6d7aa4.ts.net", tokenEnv: tokenName },
    { id: "public", url: "https://example.com/", tokenEnv: tokenName },
    { id: "ip", url: "https://100.64.0.1/", tokenEnv: tokenName },
    { id: "path", url: "https://segredo.tail6d7aa4.ts.net/api", tokenEnv: tokenName },
    { id: "secrets", url: "https://segredo.tail6d7aa4.ts.net/", tokenEnv: "SECRET" },
    { id: "segredo", url: "https://segredo.tail6d7aa4.ts.net/", tokenEnv: tokenName },
    { id: "segredo", url: "https://segredo.tail6d7aa4.ts.net/", tokenEnv: tokenName },
  ];
  const found = readVsCodeDevices(JSON.stringify(malformed), env);
  assert.deepEqual(found.map(x => x.id), ["segredo"]);
  assert.equal(JSON.stringify(found).includes(secret), false);
});

test("MCP sends command only to configured device with correlation, returns measured exit", async () => {
  process.env.CENTRALDARK_VSCODE_DEVICES_JSON = registry;
  process.env[tokenName] = secret;
  let submitted = 0;
  globalThis.fetch = async (url, options) => {
    submitted += 1;
    assert.equal(url, "https://segredo.tail6d7aa4.ts.net/execute");
    assert.equal(options.headers.Authorization, "Bearer " + secret);
    assert.equal(options.headers["X-CentralDark-Device-Id"], "segredo");
    assert.equal(options.redirect, "error");
    const body = JSON.parse(options.body);
    assert.equal(body.command, "Write-Output 'oi'");
    assert.match(body.commandHash, /^[a-f0-9]{64}$/);
    return { status: 200, ok: true, text: async () => JSON.stringify({
      ok: true, status: "EXECUTED", deviceId: "segredo", requestId: body.requestId,
      localConsent: true, exitCode: 0, output: "oi\r\n", observedAt: "2026-10-20T13:00:00Z",
    }) };
  };
  const data = result(await tool("vscode_remote_execute").handler({
    deviceId: "segredo", pid: 31566, command: "Write-Output 'oi'",
  }));
  assert.equal(submitted, 1);
  assert.equal(data.status, "EXECUTED_EXIT_ZERO");
  assert.equal(data.exitCode, 0);
  assert.equal(data.executionProven, true);
  assert.equal(data.output, "oi\r\n");
  assert.equal(data.pid, 31566);
});

test("fixed echo tool ignores injected commands and keeps local consent", async () => {
  process.env.CENTRALDARK_VSCODE_DEVICES_JSON = registry;
  process.env[tokenName] = secret;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.command, "echo oi");
    assert.equal(body.intentId, "CENTRALDARK_FIXED_ECHO");
    return { status: 200, ok: true, text: async () => JSON.stringify({
      ok: true, status: "EXECUTED", requestId: body.requestId, deviceId: "segredo",
      exitCode: 0, output: "oi\n", localConsent: true,
    }) };
  };
  const data = result(await tool("vscode_remote_echo").handler({
    deviceId: "segredo", pid: 31566, command: "UNTRUSTED_OVERRIDE",
  }));
  assert.equal(data.status, "EXECUTED_EXIT_ZERO");
  assert.equal(data.output, "oi\n");
  assert.equal(tool("vscode_remote_echo").annotations.destructiveHint, false);
});

test("denies spoofed device response and never silently repeats a timed-out command", async () => {
  process.env.CENTRALDARK_VSCODE_DEVICES_JSON = registry;
  process.env[tokenName] = secret;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    return { status: 200, ok: true, text: async () => JSON.stringify({
      ok: true, status: "EXECUTED", deviceId: "other", requestId: body.requestId,
      exitCode: 0, output: "oi",
    }) };
  };
  const spoofed = result(await tool("vscode_remote_execute").handler({
    deviceId: "segredo", pid: 31566, command: "Write-Output 'oi'",
  }));
  assert.equal(spoofed.status, "DEVICE_ID_MISMATCH");
  globalThis.fetch = async () => { throw new Error("timed out"); };
  const unknown = result(await tool("vscode_remote_execute").handler({
    deviceId: "segredo", pid: 31566, command: "Write-Output 'oi'",
  }));
  assert.equal(unknown.status, "POST_OUTCOME_UNKNOWN");
  assert.equal(unknown.proof, false);
});

test("requires administrative guard and quarantines unproved write; code refuses nonpaired transports", () => {
  assert.equal(tool("vscode_remote_execute").annotations.destructiveHint, true);
  assert.equal(tool("vscode_remote_devices").annotations.readOnlyHint, true);
  const root = resolve(dirnameHere, "..");
  const manifest = JSON.parse(readFileSync(resolve(root, "manifesto-destrutivas.json"), "utf8"));
  assert.ok(manifest.destrutivasEmRevisao.some(x => x.nome === "vscode_remote_execute"));
  assert.ok(!manifest.destrutivasAprovadas.some(x => x.nome === "vscode_remote_execute"));
});
