import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import express from "express";

const DEFAULT_TTL_MS = 2 * 60_000;
const DEFAULT_STALE_MS = 45_000;
const DEFAULT_DEVICE_TOKEN_TTL_MS = Number(process.env.CENTRALDARK_DEVICE_TOKEN_TTL_MS || 30 * 24 * 60 * 60_000);
const DEFAULT_REGISTRY_PATH = process.env.CENTRALDARK_DEVICE_REGISTRY_PATH || "<caminho-vps>";

const sha256 = (value) => createHash("sha256").update(String(value)).digest("hex");
const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
const bearerFrom = (req) => /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization || "").trim())?.[1]?.trim() || "";
const cleanText = (value, fallback = "") => String(value ?? fallback).trim().slice(0, 160);

export function createDevicePairingStore(options = {}) {
  const registryPath = options.registryPath || DEFAULT_REGISTRY_PATH;
  const ttlMs = Number(options.ttlMs || DEFAULT_TTL_MS);
  const staleMs = Number(options.staleMs || DEFAULT_STALE_MS);
  const deviceTokenTtlMs = Number(options.deviceTokenTtlMs || DEFAULT_DEVICE_TOKEN_TTL_MS);
  const now = options.now || (() => Date.now());
  const pending = new Map();

  function readRegistry() {
    if (!existsSync(registryPath)) return { version: 1, devices: [] };
    const parsed = JSON.parse(readFileSync(registryPath, "utf8"));
    if (!parsed || !Array.isArray(parsed.devices)) throw new Error("DEVICE_REGISTRY_INVALID");
    return parsed;
  }
  function writeRegistry(registry) {
    mkdirSync(dirname(registryPath), { recursive: true, mode: 0o700 });
    const temp = `${registryPath}.${process.pid}.${Date.now()}.tmp`;
    writeFileSync(temp, `${JSON.stringify(registry, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    renameSync(temp, registryPath);
    chmodSync(registryPath, 0o600);
  }
  function prune() {
    const t = now();
    for (const [id, item] of pending.entries()) {
      if (item.expiresAt <= t || (item.tokenDelivered && t - item.approvedAt > ttlMs)) pending.delete(id);
    }
  }
  function makeCode() {
    const raw = randomBytes(4).toString("hex").toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  }
  function start(meta = {}) {
    prune();
    const pairId = randomUUID();
    const pairSecret = randomBytes(24).toString("base64url");
    const consentNonce = randomBytes(24).toString("base64url");
    const item = {
      pairId,
      pairSecretHash: sha256(pairSecret),
      consentNonce,
      code: makeCode(),
      createdAt: now(),
      expiresAt: now() + ttlMs,
      approvedAt: 0,
      tokenDelivered: false,
      token: "",
      refreshToken: "",
      meta: {
        deviceName: cleanText(meta.deviceName, "unknown-device"),
        executor: cleanText(meta.executor, "unknown"),
        surface: cleanText(meta.surface, "unknown"),
      },
    };
    pending.set(pairId, item);
    return { pairId, pairSecret, code: item.code, expiresAt: item.expiresAt };
  }
  function pendingConsent(pairId) {
    prune();
    const item = pending.get(String(pairId || ""));
    if (!item) return null;
    return {
      pairId: item.pairId, code: item.code, expiresAt: item.expiresAt,
      deviceName: item.meta.deviceName, executor: item.meta.executor,
      surface: item.meta.surface, nonce: item.consentNonce,
      approved: Boolean(item.deviceId),
    };
  }
  function approveWeb({ pairId, code, nonce }) {
    const item = pendingConsent(pairId);
    if (!item || item.approved) return { ok: false, error: "pair_expired_or_completed" };
    if (!safeEqual(item.nonce, nonce)) return { ok: false, error: "pair_consent_invalid" };
    return approve({ pairId, code });
  }
  function approve({ pairId, code, deviceName, executor, surface }) {
    prune();
    const item = pending.get(String(pairId));
    if (!item || item.expiresAt <= now()) return { ok: false, error: "pair_expired_or_missing" };
    if (!safeEqual(item.code, String(code || "").toUpperCase())) return { ok: false, error: "pair_code_mismatch" };
    const token = randomBytes(32).toString("base64url");
    const refreshToken = randomBytes(40).toString("base64url");
    const deviceId = randomUUID();
    const registry = readRegistry();
    registry.devices.push({
      device_id: deviceId,
      device_name: cleanText(deviceName, item.meta.deviceName),
      executor: cleanText(executor, item.meta.executor),
      surface: cleanText(surface, item.meta.surface),
      token_hash: sha256(token),
      refresh_token_hash: sha256(refreshToken),
      token_expires_at: new Date(now() + deviceTokenTtlMs).toISOString(),
      paired_at: new Date(now()).toISOString(),
      last_heartbeat: null,
      capabilities: {},
    });
    writeRegistry(registry);
    item.deviceId = deviceId;
    item.token = token;
    item.refreshToken = refreshToken;
    item.tokenExpiresAt = now() + deviceTokenTtlMs;
    item.approvedAt = now();
    return { ok: true, deviceId };
  }
  function status({ pairId, pairSecret }) {
    prune();
    const item = pending.get(String(pairId));
    if (!item || item.expiresAt <= now()) return { status: "expired" };
    if (!safeEqual(item.pairSecretHash, sha256(pairSecret || ""))) return { status: "denied" };
    if (!item.deviceId) return { status: "pending" };
    if (item.tokenDelivered) return { status: "approved", device_id: item.deviceId };
    item.tokenDelivered = true;
    const token = item.token;
    const refreshToken = item.refreshToken;
    item.token = "";
    item.refreshToken = "";
    return { status: "approved", device_id: item.deviceId, token, refresh_token: refreshToken, token_expires_at: new Date(item.tokenExpiresAt).toISOString() };
  }
  function heartbeat({ token, capabilities = {} }) {
    const tokenHash = sha256(token || "");
    const registry = readRegistry();
    const device = registry.devices.find((entry) => safeEqual(entry.token_hash || "", tokenHash));
    if (!device) return { ok: false, error: "invalid_device_token" };
    if (device.token_expires_at && Date.parse(device.token_expires_at) <= now()) return { ok: false, error: "device_token_expired" };
    device.last_heartbeat = new Date(now()).toISOString();
    device.capabilities = capabilities && typeof capabilities === "object" ? capabilities : {};
    writeRegistry(registry);
    return { ok: true, device_id: device.device_id, pong: new Date(now()).toISOString() };
  }
  function refresh({ refreshToken }) {
    const refreshHash = sha256(refreshToken || "");
    const registry = readRegistry();
    const device = registry.devices.find((entry) => safeEqual(entry.refresh_token_hash || "", refreshHash));
    if (!device) return { ok: false, error: "invalid_refresh_token" };
    const token = randomBytes(32).toString("base64url");
    device.token_hash = sha256(token);
    device.token_expires_at = new Date(now() + deviceTokenTtlMs).toISOString();
    writeRegistry(registry);
    return { ok: true, device_id: device.device_id, token, token_expires_at: device.token_expires_at };
  }
  function revoke({ deviceId }) {
    if (!deviceId || typeof deviceId !== "string") return { ok: false, error: "device_id_required" };
    const registry = readRegistry();
    const before = registry.devices.length;
    registry.devices = registry.devices.filter(entry => entry.device_id !== deviceId);
    if (registry.devices.length === before) return { ok: false, error: "device_not_found" };
    writeRegistry(registry);
    return { ok: true, device_id: deviceId };
  }
  function listDevices() {
    const registry = readRegistry();
    const t = now();
    return registry.devices.map(({ token_hash: _secret, refresh_token_hash: _refreshSecret, ...device }) => ({
      ...device,
      status: device.last_heartbeat && t - Date.parse(device.last_heartbeat) <= staleMs ? "online" : "offline",
    }));
  }
  return { start, approve, pendingConsent, approveWeb, status, heartbeat, refresh, revoke, listDevices, registryPath };
}

export function createDevicePairingRouter(options = {}) {
  const router = express.Router();
  const store = options.store || createDevicePairingStore(options);
  const isAdmin = options.isAdmin || ((req) => {
    const expected = String(process.env.CENTRALDARK_ADMIN_KEY || "");
    return expected.length > 0 && safeEqual(bearerFrom(req), expected);
  });

  const isCookieAdmin = options.cookieAdmin || (() => false);
  const authorized = (req) => isAdmin(req) || (
    req.get("X-CentralDark-Intent") === "pairing-admin" && isCookieAdmin(req)
  );
  const limiter = new Map();
  const allowStart = (req) => {
    const key = String(req.ip || req.socket?.remoteAddress || "unknown");
    const now = Date.now();
    for (const [ip, entry] of limiter) if (entry.until < now) limiter.delete(ip);
    const entry = limiter.get(key);
    if (!entry || entry.until < now) { limiter.set(key, {count: 1, until: now + 60_000}); return true; }
    if (entry.count >= 20) return false;
    entry.count++;
    return true;
  };

  router.post("/pair/start", (req, res) => {
    if (!allowStart(req)) return res.status(429).json({ok:false,error:"pair_rate_limited"});
    const pair = store.start({ deviceName: req.body?.device_name, executor: req.body?.executor, surface: req.body?.surface });
    res.status(201).json({ ok: true, pair_id: pair.pairId, pair_secret: pair.pairSecret, code: pair.code, expires_at: new Date(pair.expiresAt).toISOString() });
  });
  router.get("/pair/status", (req, res) => {
    const result = store.status({ pairId: req.query.id, pairSecret: req.query.secret });
    res.status(result.status === "denied" ? 403 : 200).json(result);
  });
  // Use POST para que o segredo de posse nao apareca em URL, referrer e access logs.
  router.post("/pair/status", (req, res) => {
    const result = store.status({ pairId: req.body?.id, pairSecret: req.body?.secret });
    res.status(result.status === "denied" ? 403 : 200).json(result);
  });
  router.post("/pair/approve", (req, res) => {
    if (!authorized(req)) return res.status(401).json({ ok: false, error: "admin_auth_required" });
    const result = store.approve({ pairId: req.body?.id, code: req.body?.code, deviceName: req.body?.device_name, executor: req.body?.executor, surface: req.body?.surface });
    res.status(result.ok ? 200 : 400).json(result);
  });
  router.post("/token/refresh", (req, res) => {
    const result = store.refresh({ refreshToken: bearerFrom(req) });
    res.status(result.ok ? 200 : 401).json(result);
  });
  router.post("/heartbeat", (req, res) => {
    const result = store.heartbeat({ token: bearerFrom(req), capabilities: req.body?.capabilities });
    res.status(result.ok ? 200 : 401).json(result);
  });
  router.post("/devices/revoke", (req, res) => {
    if (!authorized(req)) return res.status(401).json({ ok: false, error: "admin_auth_required" });
    const result = store.revoke({ deviceId: req.body?.device_id });
    res.status(result.ok ? 200 : 404).json(result);
  });
  router.get("/devices", (req, res) => {
    if (!authorized(req)) return res.status(401).json({ ok: false, error: "admin_auth_required" });
    res.json({ ok: true, devices: store.listDevices() });
  });
  return router;
}
