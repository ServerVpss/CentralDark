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
  function listDevices() {
    const registry = readRegistry();
    const t = now();
    return registry.devices.map(({ token_hash: _secret, refresh_token_hash: _refreshSecret, ...device }) => ({
      ...device,
      status: device.last_heartbeat && t - Date.parse(device.last_heartbeat) <= staleMs ? "online" : "offline",
    }));
  }
  return { start, approve, pendingConsent, approveWeb, status, heartbeat, refresh, listDevices, registryPath };
}

export function createDevicePairingRouter(options = {}) {
  const router = express.Router();
  const store = options.store || createDevicePairingStore(options);
  const isAdmin = options.isAdmin || ((req) => safeEqual(bearerFrom(req), process.env.CENTRALDARK_ADMIN_KEY || "__missing__"));
  const isBrowserAdmin = options.isBrowserAdmin || (() => false);
  const publicOrigin = String(options.publicOrigin || "").replace(/\/$/, "");
  const escape = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
  router.get("/pair/consent", (req, res) => {
    const item = store.pendingConsent(req.query?.id);
    if (!item) return res.status(404).type("text/plain").send("Pareamento expirado ou nao encontrado.");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'");
    const authorized = Boolean(isBrowserAdmin(req));
    const code = escape(item.code);
    const safeName = escape(item.deviceName);
    const ownerFlow = authorized && !item.approved
      ? `<form method="POST" action="/device/pair/confirm">
          <input type="hidden" name="id" value="${escape(item.pairId)}">
          <input type="hidden" name="code" value="${code}">
          <input type="hidden" name="nonce" value="${escape(item.nonce)}">
          <button type="submit">Confirmar pareamento</button>
        </form>`
      : item.approved
        ? '<p>Autorizado. Volte ao VS Code para concluir.</p>'
        : '<p>Sessao administrativa necessaria. Entre no painel CentralDark existente em outra aba e atualize esta pagina.</p><a href="/admin" target="_blank" rel="noopener noreferrer">Abrir administracao CentralDark</a>';
    res.type("html").send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1"><title>CentralDark - Pareamento VS Code</title>
      <style>body{background:#f5f7f6;font-family:Segoe UI,Arial,sans-serif;display:grid;place-items:center;min-height:100vh}
      main{max-width:430px;background:#fff;border:1px solid #ddd;border-radius:16px;padding:30px}
      .code{font:800 29px Consolas,monospace;letter-spacing:.09em;text-align:center;padding:14px;border:1px solid #ddd;border-radius:9px}
      button{border:0;border-radius:9px;padding:13px 20px;background:#10b981;color:white;font-weight:700;cursor:pointer}
      p{color:#4b5563;line-height:1.5}</style></head><body><main>
      <h1>Autorizar dispositivo</h1><p>O VS Code <strong>${safeName}</strong> solicitou acesso ao MCP existente.</p>
      <div class="code">${code}</div><p>Confira este mesmo codigo no VS Code. Nunca confirme um pedido desconhecido.</p>
      ${ownerFlow}<p>O codigo expira em 2 minutos. Aprovacao exige a sessao administrativa existente.</p>
      </main></body></html>`);
  });
  router.post("/pair/confirm", (req, res) => {
    if (!isBrowserAdmin(req)) return res.status(401).type("text/plain").send("Sessao administrativa necessaria.");
    if (publicOrigin && req.headers.origin && String(req.headers.origin) !== publicOrigin)
      return res.status(403).type("text/plain").send("Origem invalida.");
    const result = store.approveWeb({
      pairId: req.body?.id, code: req.body?.code, nonce: req.body?.nonce
    });
    if (!result.ok) return res.status(403).type("text/plain").send("Codigo/confirmacao invalidos ou expirados.");
    res.setHeader("Cache-Control", "no-store");
    res.type("html").send('<!doctype html><meta charset="utf-8"><title>CentralDark - Dispositivo autorizado</title><h1>Dispositivo autorizado</h1><p>Volte ao VS Code. O pareamento sera concluido automaticamente.</p>');
  });
  router.post("/pair/approve", (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "admin_auth_required" });
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
  router.get("/devices", (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "admin_auth_required" });
    res.json({ ok: true, devices: store.listDevices() });
  });
  return router;
}
//# sourceMappingURL=device-pairing.js.map
