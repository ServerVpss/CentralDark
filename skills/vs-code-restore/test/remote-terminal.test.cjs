const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const crypto = require("node:crypto");

const originalLoad = Module._load;
let onEnd = null;
let commands = [];
let consent = true;
let openedTerminals = 0;
const terminal = {
  name: "pwsh",
  processId: Promise.resolve(31566),
  shellIntegration: {
    executeCommand(command) {
      commands.push(command);
      const execution = { read: async function* () { yield "oi\r\n"; } };
      queueMicrotask(() => onEnd?.({ terminal, execution, exitCode: 0 }));
      return execution;
    }
  },
  show() {}
};
const fakeVsCode = {
  ViewColumn: { Beside: -2 },
  window: {
    terminals: [terminal],
    showWarningMessage: async (message) => !consent ? undefined :
      message.includes("permitir abrir 1 terminal") ? "Abrir um terminal" : "Executar uma vez",
    createTerminal: options => {
      openedTerminals++;
      const created = { name: options.name, processId: Promise.resolve(40000 + openedTerminals), show() {} };
      fakeVsCode.window.terminals.push(created);
      return created;
    },
    onDidEndTerminalShellExecution: listener => {
      onEnd = listener;
      return { dispose() { onEnd = null; } };
    }
  },
  workspace: {
    getConfiguration: () => ({
      get(name, fallback) {
        if (name === "remoteTerminalEnabled") return true;
        if (name === "remoteTerminalPort") return 18719;
        return fallback;
      }
    })
  },
  Disposable: class { constructor(dispose) { this.dispose = dispose; } }
};
Module._load = function(request, parent, isMain) {
  if (request === "vscode") return fakeVsCode;
  return originalLoad.call(this, request, parent, isMain);
};
const receiver = require("../out/remote-terminal.js");
Module._load = originalLoad;
const deviceId = "segredo";
const key = "b".repeat(48);
const context = {
  subscriptions: [],
  globalState: { get: (_key, def) => deviceId || def },
  secrets: { get: async () => key }
};
const url = "http://127.0.0.1:18719";
const headers = { Authorization: "Bearer " + key, "X-CentralDark-Device-Id": deviceId };
const digest = value => crypto.createHash("sha256").update(value).digest("hex");

test.before(async () => { await receiver.startRemoteTerminal(context); });
test.after(() => { for (const item of context.subscriptions) item.dispose?.(); });

test("receiver is bound to loopback, checks pairing and lists existing PIDs", async () => {
  const unauth = await fetch(url + "/terminals");
  assert.equal(unauth.status, 401);
  const state = await fetch(url + "/status", { headers });
  assert.equal(state.status, 200);
  assert.equal((await state.json()).deviceId, deviceId);
  const response = await fetch(url + "/terminals", { headers });
  const parsed = await response.json();
  assert.equal(parsed.ok, true);
  assert.equal(parsed.terminals[0].pid, 31566);
  assert.equal(parsed.terminals[0].shellIntegration, true);
});

test("same PID executes one time only after local consent and returns exit 0", async () => {
  consent = true;
  const payload = {
    requestId: crypto.randomUUID(), at: new Date().toISOString(),
    pid: 31566, command: "Write-Output 'oi'",
    commandHash: digest("Write-Output 'oi'"),
  };
  const invoke = () => fetch(url + "/execute", {
    method: "POST", headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
  const first = await invoke();
  assert.equal(first.status, "EXECUTED");
  assert.equal(first.exitCode, 0);
  assert.equal(first.output, "oi\r\n");
  assert.equal(first.localConsent, true);
  assert.deepEqual(commands, ["Write-Output 'oi'"]);
  const replay = await invoke();
  assert.equal(replay.status, "REPLAY_BLOCKED");
  assert.equal(commands.length, 1);
});

test("wrong PID and denied local approval never reach shell", async () => {
  const base = { requestId: crypto.randomUUID(), at: new Date().toISOString(),
    command: "Write-Output 'oi'", commandHash: digest("Write-Output 'oi'") };
  const invoke = async payload => (await fetch(url + "/execute", {
    method: "POST", headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })).json();
  const wrongPid = await invoke({ ...base, pid: 1 });
  assert.equal(wrongPid.status, "TERMINAL_PID_NOT_FOUND");
  consent = false;
  const denied = await invoke({ ...base, pid: 31566, requestId: crypto.randomUUID() });
  assert.equal(denied.status, "LOCAL_CONSENT_DENIED");
  assert.equal(commands.length, 1);
});

test("open-terminal: auth, consent, one visual worker, reuse and replay", async () => {
  const request = () => ({ requestId: crypto.randomUUID(), at: new Date().toISOString() });
  const invoke = async (payload, authenticated = true) => {
    const response = await fetch(url + "/open-terminal", {
      method: "POST",
      headers: { ...(authenticated ? headers : {}), "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return { httpStatus: response.status, result: await response.json() };
  };
  const unauth = await invoke(request(), false);
  assert.equal(unauth.httpStatus, 401);
  assert.equal(unauth.result.status, "AUTH_REQUIRED");
  const stale = await invoke({ ...request(), at: new Date(Date.now() - 60_000).toISOString() });
  assert.equal(stale.result.status, "INVALID_OPEN_ENVELOPE");

  consent = false;
  const denied = await invoke(request());
  assert.equal(denied.result.status, "LOCAL_CONSENT_DENIED");
  assert.equal(openedTerminals, 0);

  consent = true;
  const payload = request();
  const created = await invoke(payload);
  assert.equal(created.result.status, "TERMINAL_CREATED");
  assert.equal(created.result.ok, true);
  assert.equal(openedTerminals, 1);
  assert.equal(fakeVsCode.window.terminals.length, 2);
  assert.equal(fakeVsCode.window.terminals[1].name, "CentralDark · Worker 1 (manual)");

  const replay = await invoke(payload);
  assert.equal(replay.result.status, "REPLAY_BLOCKED");
  const reused = await invoke(request());
  assert.equal(reused.result.status, "TERMINAL_REUSED");
  assert.equal(openedTerminals, 1);
});
