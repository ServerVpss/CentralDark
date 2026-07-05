// /health/deep — checagem profunda de dependências + Health Score visual.
// Cobre: catálogo de tools, memória do processo, uptime, presença de secrets,
// disco do LOG_DIR, e liveness do próprio HTTP. Retorna JSON estruturado
// com score 0-100 pra ser consumido pelo painel /admin e pelo status externo.
import fs from "node:fs";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { config } from "./config.js";
import { log } from "./log.js";

function checkSecret(name) {
    const v = process.env[name];
    return { name, present: Boolean(v && v.trim() && !v.startsWith("__MISSING_")) };
}

function checkDisk(dir) {
    try {
        fs.accessSync(dir, fs.constants.W_OK);
        return { ok: true, dir };
    } catch (err) {
        return { ok: false, dir, error: String(err?.message || err) };
    }
}

function pct(ok, total) {
    if (!total) return 100;
    return Math.round((ok / total) * 100);
}

export async function healthDeep(req, res) {
    const t0 = performance.now();
    try {
        const summary = getCatalogSummary();
        const mem = process.memoryUsage();
        const secrets = [
            checkSecret("MCP_SESSION_SECRET"),
            checkSecret("MCP_ADMIN_PASSWORD"),
            checkSecret("CENTRALDARK_ADMIN_KEY"),
        ];
        const disk = checkDisk(config.log.dir);
        const rssMb = Math.round(mem.rss / 1024 / 1024);
        const heapMb = Math.round(mem.heapUsed / 1024 / 1024);

        const checks = [
            { key: "catalog", ok: summary.toolCount > 0, detail: { toolCount: summary.toolCount } },
            { key: "memory", ok: rssMb < 512, detail: { rssMb, heapMb } },
            { key: "secrets", ok: secrets.every((s) => s.present), detail: { secrets } },
            { key: "disk_logs", ok: disk.ok, detail: disk },
            { key: "loadavg", ok: os.loadavg()[0] < os.cpus().length * 2, detail: { load: os.loadavg() } },
        ];
        const okCount = checks.filter((c) => c.ok).length;
        const score = pct(okCount, checks.length);
        const status = score === 100 ? "healthy" : score >= 60 ? "degraded" : "unhealthy";

        res.status(status === "unhealthy" ? 503 : 200).json({
            ok: status !== "unhealthy",
            status,
            score,
            uptimeSec: Math.round(process.uptime()),
            version: "0.4.0-v2",
            catalogVersion: summary.catalogVersion || null,
            toolCount: summary.toolCount,
            memoryMb: { rss: rssMb, heap: heapMb },
            loadavg: os.loadavg(),
            checks,
            elapsedMs: Math.round(performance.now() - t0),
            time: new Date().toISOString(),
        });
    } catch (err) {
        log.error("health_deep_error", { error: String(err), cid: req.cid });
        if (!res.headersSent) {
            res.status(500).json({ ok: false, status: "error", error: String(err) });
        }
    }
}
