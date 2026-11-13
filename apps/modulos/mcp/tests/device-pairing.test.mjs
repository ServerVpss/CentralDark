import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import test from "node:test";
import { createDevicePairingStore } from "../src/device-pairing.js";

test("registro padrao descobre pasta do usuario sem depender de VPS ou cwd", () => {
  const store = createDevicePairingStore();
  assert.equal(store.registryPath, join(homedir(), ".centraldark", "mcp-device-registry.json"));
  assert.equal(isAbsolute(store.registryPath), true);
});

test("registro dinamico confirma e recebe heartbeat na pasta do usuario, sem EISDIR", () => {
  const home = mkdtempSync(join(tmpdir(), "centraldark-pair-home-"));
  try {
    const moduleUrl = new URL("../src/device-pairing.js", import.meta.url).href;
    const script = `
      import { createDevicePairingStore } from ${JSON.stringify(moduleUrl)};
      const store = createDevicePairingStore();
      const pair = store.start({ deviceName: "test-device" });
      if (!store.approve({ pairId: pair.pairId, code: pair.code }).ok) throw Error("approve_failed");
      const auth = store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });
      if (auth.status !== "approved" || !store.heartbeat({ token: auth.token }).ok) throw Error("heartbeat_failed");
    `;
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: home,
      env: { ...process.env, HOME: home, USERPROFILE: home, CENTRALDARK_DEVICE_REGISTRY_PATH: "" },
      encoding: "utf8",
      timeout: 45000,
    });
    assert.equal(run.status, 0, run.stderr);
    const dataDir = join(home, ".centraldark");
    const dataFile = join(dataDir, "mcp-device-registry.json");
    assert.equal(existsSync(dataFile), true);
    if (process.platform !== "win32") {
      assert.equal(statSync(dataDir).mode & 0o777, 0o700);
      assert.equal(statSync(dataFile).mode & 0o777, 0o600);
    }
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test("registro rejeita caminho relativo sem depender da pasta de execucao", () => {
  assert.throws(() => createDevicePairingStore({ registryPath: "registry.json" }), /DEVICE_REGISTRY_PATH_NOT_ABSOLUTE/);
});

test("registro rejeita pasta como arquivo e preserva conteudo existente", () => {
  const dir = mkdtempSync(join(tmpdir(), "centraldark-pair-invalid-"));
  try {
    const store = createDevicePairingStore({ registryPath: dir });
    const pair = store.start({ deviceName: "test" });
    assert.throws(() => store.approve({ pairId: pair.pairId, code: pair.code }), /DEVICE_REGISTRY_PATH_NOT_FILE/);
    const invalid = join(dir, "registry.json");
    writeFileSync(invalid, "{invalido", { mode: 0o600 });
    const broken = createDevicePairingStore({ registryPath: invalid });
    const item = broken.start({ deviceName: "test" });
    assert.throws(() => broken.approve({ pairId: item.pairId, code: item.code }), /DEVICE_REGISTRY_INVALID_JSON/);
    assert.equal(readFileSync(invalid, "utf8"), "{invalido");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "centraldark-pair-"));
  let clock = Date.parse("2026-09-13T23:00:00.000Z");
  const store = createDevicePairingStore({
    registryPath: join(dir, "registry.json"),
    now: () => clock,
    ttlMs: 120_000,
    staleMs: 45_000,
  });
  return { store, advance: (ms) => { clock += ms; }, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test("pairing exige segredo de posse e entrega token uma única vez", () => {
  const f = fixture();
  try {
    const pair = f.store.start({ deviceName: "SEGREDO", executor: "hermes", surface: "casa" });
    assert.equal(f.store.status({ pairId: pair.pairId, pairSecret: "errado" }).status, "denied");
    assert.equal(f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret }).status, "pending");
    const approved = f.store.approve({ pairId: pair.pairId, code: pair.code });
    assert.equal(approved.ok, true);
    const first = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });
    assert.equal(first.status, "approved");
    assert.ok(first.token);
    assert.ok(first.refresh_token);
    assert.ok(first.token_expires_at);
    const second = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });
    assert.equal(second.status, "approved");
    assert.equal("token" in second, false);
  } finally { f.cleanup(); }
});

test("heartbeat autentica device e lista sem expor token hash", () => {
  const f = fixture();
  try {
    const pair = f.store.start({ deviceName: "SEGREDO", executor: "hermes", surface: "casa" });
    f.store.approve({ pairId: pair.pairId, code: pair.code });
    const auth = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });
    const pong = f.store.heartbeat({ token: auth.token, capabilities: { shell: true } });
    assert.equal(pong.ok, true);
    const [device] = f.store.listDevices();
    assert.equal(device.status, "online");
    assert.equal(device.device_name, "SEGREDO");
    assert.equal("token_hash" in device, false);
    assert.equal("refresh_token_hash" in device, false);
    assert.ok(device.token_expires_at);
    f.advance(46_000);
    assert.equal(f.store.listDevices()[0].status, "offline");
  } finally { f.cleanup(); }
});

test("router exige chave administrativa configurada para aprovar pareamento", async () => {
  const { default: express } = await import("express");
  const { createDevicePairingRouter } = await import("../src/device-pairing.js");
  const f = fixture();
  const oldKey = process.env.CENTRALDARK_ADMIN_KEY;
  let server;
  try {
    delete process.env.CENTRALDARK_ADMIN_KEY;
    const app = express();
    app.use(express.json());
    app.use("/device", createDevicePairingRouter({ store: f.store }));
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const start = await fetch(base + "/device/pair/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_name: "windows-casa" }),
    });
    assert.equal(start.status, 201);
    const pair = await start.json();
    const reject = await fetch(base + "/device/pair/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer __missing__" },
      body: JSON.stringify({ id: pair.pair_id, code: pair.code }),
    });
    assert.equal(reject.status, 401);
    process.env.CENTRALDARK_ADMIN_KEY = "test-admin-secret";
    const approve = await fetch(base + "/device/pair/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-admin-secret" },
      body: JSON.stringify({ id: pair.pair_id, code: pair.code }),
    });
    assert.equal(approve.status, 200);
    const status = await fetch(base + "/device/pair/status?id=" + encodeURIComponent(pair.pair_id) +
      "&secret=" + encodeURIComponent(pair.pair_secret));
    assert.equal((await status.json()).status, "approved");
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (oldKey === undefined) delete process.env.CENTRALDARK_ADMIN_KEY;
    else process.env.CENTRALDARK_ADMIN_KEY = oldKey;
    f.cleanup();
  }
});

test("revoke impede heartbeat com o token antigo", () => {
  const f = fixture();
  try {
    const pair = f.store.start({deviceName:"windows-casa"});
    assert.equal(f.store.approve({pairId:pair.pairId,code:pair.code}).ok,true);
    const auth=f.store.status({pairId:pair.pairId,pairSecret:pair.pairSecret});
    assert.equal(f.store.heartbeat({token:auth.token}).ok,true);
    assert.equal(f.store.revoke({deviceId:auth.device_id}).ok,true);
    assert.equal(f.store.heartbeat({token:auth.token}).ok,false);
    assert.equal(f.store.listDevices().length,0);
  } finally { f.cleanup(); }
});

test("cookie admin exige cabecalho explicito para aprovar e revogar", async () => {
 const { default: express } = await import("express");
 const { createDevicePairingRouter } = await import("../src/device-pairing.js");
 const f=fixture();let server;
 try{
  const app=express();app.use(express.json());
  app.use("/device",createDevicePairingRouter({store:f.store,cookieAdmin:req=>req.get("X-Test-Login")==="yes"}));
  server=app.listen(0,"127.0.0.1");
  await new Promise(resolve=>server.once("listening",resolve));
  const base="http://127.0.0.1:"+server.address().port;
  const started=await fetch(base+"/device/pair/start",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
  const p=await started.json();
  const approve=async h=>fetch(base+"/device/pair/approve",{method:"POST",headers:{"Content-Type":"application/json","X-Test-Login":"yes",...h},body:JSON.stringify({id:p.pair_id,code:p.code})});
  assert.equal((await approve({})).status,401);
  assert.equal((await approve({"X-CentralDark-Intent":"pairing-admin"})).status,200);
  const auth=f.store.status({pairId:p.pair_id,pairSecret:p.pair_secret});
  const revoke=async h=>fetch(base+"/device/devices/revoke",{method:"POST",headers:{"Content-Type":"application/json","X-Test-Login":"yes",...h},body:JSON.stringify({device_id:auth.device_id})});
  assert.equal((await revoke({})).status,401);
  assert.equal((await revoke({"X-CentralDark-Intent":"pairing-admin"})).status,200);
 }finally{
  if(server)await new Promise(resolve=>server.close(resolve));f.cleanup();
 }
});

test("pairing expira sem falso verde", () => {
  const f = fixture();
  try {
    const pair = f.store.start({});
    f.advance(120_001);
    assert.equal(f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret }).status, "expired");
    assert.equal(f.store.approve({ pairId: pair.pairId, code: pair.code }).ok, false);
  } finally { f.cleanup(); }
});

test("owner Supabase vincula dispositivo e permite revogacao propria sem chave admin", async () => {
  const f = fixture();
  let server;
  try {
    const pair = f.store.start({ deviceName: "client-win", executor: "remote-bridge" });
    const consent = f.store.pendingConsent(pair.pairId);
    const owner = "fb671c7f-4a18-4d89-b103-3a53979a5d9b";
    assert.equal(f.store.approveWeb({ pairId: pair.pairId, code: pair.code,
      nonce: consent.nonce, ownerUserId: owner }).ok, true);
    const auth = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });
    assert.equal(f.store.listDevices()[0].owner_user_id, owner);
    assert.equal(f.store.refresh({ refreshToken: "invalid" }).ok, false);
    const refresh = f.store.refresh({ refreshToken: auth.refresh_token });
    assert.equal(refresh.ok, true);
    assert.equal(f.store.heartbeat({ token: auth.token }).ok, false);
    assert.equal(f.store.heartbeat({ token: refresh.token }).ok, true);
    const { default: express } = await import("express");
    const { createDevicePairingRouter } = await import("../src/device-pairing.js");
    const app = express(); app.use(express.json());
    app.use("/device", createDevicePairingRouter({ store: f.store }));
    server = app.listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const revoke = async token => fetch(base + "/device/devices/self/revoke", {
      method: "POST", headers: {"Content-Type": "application/json", Authorization: "Bearer " + token},
      body: JSON.stringify({ device_id: auth.device_id }),
    });
    assert.equal((await revoke("incorrect")).status, 401);
    assert.equal((await revoke(refresh.token)).status, 200);
    assert.equal(f.store.heartbeat({token: refresh.token}).ok, false);
    assert.equal(f.store.listDevices().length, 0);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    f.cleanup();
  }
});
