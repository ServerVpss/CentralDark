import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import express from "express";
const DEFAULT_TTL_MS = 2 * 60_000;
const DEFAULT_STALE_MS = 45_000;
const DEFAULT_REGISTRY_PATH = process.env.CENTRALDARK_DEVICE_REGISTRY_PATH || "/root/CentralDark/data/mcp-device-registry.json";
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
    const now = options.now || (() => Date.now());
    const pending = new Map();
    function readRegistry() {
        if (!existsSync(registryPath))
            return { version: 1, devices: [] };
        const parsed = JSON.parse(readFileSync(registryPath, "utf8"));
        if (!parsed || !Array.isArray(parsed.devices))
            throw new Error("DEVICE_REGISTRY_INVALID");
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
            if (item.expiresAt <= t || (item.tokenDelivered && t - item.approvedAt > ttlMs))
                pending.delete(id);
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
        const item = {
            pairId,
            pairSecretHash: sha256(pairSecret),
            code: makeCode(),
            createdAt: now(),
            expiresAt: now() + ttlMs,
            approvedAt: 0,
            tokenDelivered: false,
            token: "",
            meta: {
                deviceName: cleanText(meta.deviceName, "unknown-device"),
                executor: cleanText(meta.executor, "unknown"),
                surface: cleanText(meta.surface, "unknown"),
            },
        };
        pending.set(pairId, item);
        return { pairId, pairSecret, code: item.code, expiresAt: item.expiresAt };
    }
    function approve({ pairId, code, deviceName, executor, surface }) {
        prune();
        const item = pending.get(String(pairId));
        if (!item || item.expiresAt <= now())
            return { ok: false, error: "pair_expired_or_missing" };
        if (!safeEqual(item.code, String(code || "").toUpperCase()))
            return { ok: false, error: "pair_code_mismatch" };
        const token = randomBytes(32).toString("base64url");
        const deviceId = randomUUID();
        const registry = readRegistry();
        registry.devices.push({
            device_id: deviceId,
            device_name: cleanText(deviceName, item.meta.deviceName),
            executor: cleanText(executor, item.meta.executor),
            surface: cleanText(surface, item.meta.surface),
            token_hash: sha256(token),
            paired_at: new Date(now()).toISOString(),
            last_heartbeat: null,
            capabilities: {},
        });
        writeRegistry(registry);
        item.deviceId = deviceId;
        item.token = token;
        item.approvedAt = now();
        return { ok: true, deviceId };
    }
    function status({ pairId, pairSecret }) {
        prune();
        const item = pending.get(String(pairId));
        if (!item || item.expiresAt <= now())
            return { status: "expired" };
        if (!safeEqual(item.pairSecretHash, sha256(pairSecret || "")))
            return { status: "denied" };
        if (!item.deviceId)
            return { status: "pending" };
        if (item.tokenDelivered)
            return { status: "approved", device_id: item.deviceId };
        item.tokenDelivered = true;
        const token = item.token;
        item.token = "";
        return { status: "approved", device_id: item.deviceId, token };
    }
    function heartbeat({ token, capabilities = {} }) {
        const tokenHash = sha256(token || "");
        const registry = readRegistry();
        const device = registry.devices.find((entry) => safeEqual(entry.token_hash || "", tokenHash));
        if (!device)
            return { ok: false, error: "invalid_device_token" };
        device.last_heartbeat = new Date(now()).toISOString();
        device.capabilities = capabilities && typeof capabilities === "object" ? capabilities : {};
        writeRegistry(registry);
        return { ok: true, device_id: device.device_id, pong: new Date(now()).toISOString() };
    }
    function listDevices() {
        const registry = readRegistry();
        const t = now();
        return registry.devices.map(({ token_hash: _secret, ...device }) => ({
            ...device,
            status: device.last_heartbeat && t - Date.parse(device.last_heartbeat) <= staleMs ? "online" : "offline",
        }));
    }
    return { start, approve, status, heartbeat, listDevices, registryPath };
}
export function createDevicePairingRouter(options = {}) {
    const router = express.Router();
    const store = options.store || createDevicePairingStore(options);
    const isAdmin = options.isAdmin || ((req) => safeEqual(bearerFrom(req), process.env.CENTRALDARK_ADMIN_KEY || "__missing__"));
    router.post("/pair/start", (req, res) => {
        const pair = store.start({ deviceName: req.body?.device_name, executor: req.body?.executor, surface: req.body?.surface });
        res.status(201).json({ ok: true, pair_id: pair.pairId, pair_secret: pair.pairSecret, code: pair.code, expires_at: new Date(pair.expiresAt).toISOString() });
    });
    router.get("/pair/status", (req, res) => {
        const result = store.status({ pairId: req.query.id, pairSecret: req.query.secret });
        res.status(result.status === "denied" ? 403 : 200).json(result);
    });
    router.post("/pair/approve", (req, res) => {
        if (!isAdmin(req))
            return res.status(401).json({ ok: false, error: "admin_auth_required" });
        const result = store.approve({ pairId: req.body?.id, code: req.body?.code, deviceName: req.body?.device_name, executor: req.body?.executor, surface: req.body?.surface });
        res.status(result.ok ? 200 : 400).json(result);
    });
    router.post("/heartbeat", (req, res) => {
        const result = store.heartbeat({ token: bearerFrom(req), capabilities: req.body?.capabilities });
        res.status(result.ok ? 200 : 401).json(result);
    });
    router.get("/devices", (req, res) => {
        if (!isAdmin(req))
            return res.status(401).json({ ok: false, error: "admin_auth_required" });
        res.json({ ok: true, devices: store.listDevices() });
    });
    return router;
}
//# sourceMappingURL=device-pairing.js.map