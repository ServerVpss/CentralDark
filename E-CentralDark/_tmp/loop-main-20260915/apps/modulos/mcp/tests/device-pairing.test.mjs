import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createDevicePairingStore } from "../src/device-pairing.js";

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

test("pairing expira sem falso verde", () => {
  const f = fixture();
  try {
    const pair = f.store.start({});
    f.advance(120_001);
    assert.equal(f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret }).status, "expired");
    assert.equal(f.store.approve({ pairId: pair.pairId, code: pair.code }).ok, false);
  } finally { f.cleanup(); }
});
