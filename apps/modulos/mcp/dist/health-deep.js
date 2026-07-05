// /health/deep V2.1 — checagem profunda + versão + deps + último restart + SSE.
// Retorna JSON estruturado com Health Score 0-100 e detalhamento de:
//   • versão do MCP e do catálogo
//   • status de dependências (Telegram bot, OAuth, SSE, catálogo, disco)
//   • último restart do serviço (útil pra confirmar que o deploy pegou)
//   • carga de sistema (memória, loadavg)
import fs from "node:fs";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { config } from "./config.js";
import { log } from "./log.js";
import { activeSseSubscribers, getSseDiagnostics } from "./admin.js";

const MCP_VERSION = "0.4.0-v2.1";
const SERVICE_STARTED_AT = new Date().toISOString();

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

function checkDependencia(nome, ok, detalhe) {
    return { nome, ok, detalhe };
}

export async function healthDeep(req, res) {
    const t0 = performance.now();
    try {
        const summary = getCatalogSummary();
        const mem = process.memoryUsage();
        const rssMb = Math.round(mem.rss / 1024 / 1024);
        const heapMb = Math.round(mem.heapUsed / 1024 / 1024);
        const disk = checkDisk(config.log.dir);
        const sse = getSseDiagnostics();
        const sseAtivas = activeSseSubscribers();

        // Dependências externas (checagem leve — sem network)
        const telegramTokenOk = checkSecret("TELEGRAM_BOT_TOKEN").present
            || checkSecret("TELEGRAM_TOKEN").present;
        const oauthOk = checkSecret("MCP_SESSION_SECRET").present
            && checkSecret("MCP_ADMIN_PASSWORD").present;
        const githubOk = checkSecret("GITHUB_TOKEN").present
            || checkSecret("GH_TOKEN").present;

        const dependencias = [
            checkDependencia("mcp_catalog", summary.toolCount > 0, { toolCount: summary.toolCount }),
            checkDependencia("oauth", oauthOk, { secretsPresentes: oauthOk }),
            checkDependencia("telegram_bot", telegramTokenOk, { tokenPresente: telegramTokenOk }),
            checkDependencia("github_api", githubOk, { tokenPresente: githubOk }),
            checkDependencia("sse", true, { conexoesAtivas: sseAtivas, eventosPorMinuto: sse.eventosPorMinuto, ultimoEventoHaMs: sse.ultimoEventoHaMs, status: "operacional" }),
            checkDependencia("disk_logs", disk.ok, disk),
            checkDependencia("memoria", rssMb < 512, { rssMb, heapMb }),
            checkDependencia("loadavg", os.loadavg()[0] < os.cpus().length * 2, { load: os.loadavg() }),
        ];

        const okCount = dependencias.filter((d) => d.ok).length;
        const score = pct(okCount, dependencias.length);
        const status = score === 100 ? "healthy" : score >= 60 ? "degraded" : "unhealthy";

        res.status(status === "unhealthy" ? 503 : 200).json({
            ok: status !== "unhealthy",
            status,
            score,
            versao: MCP_VERSION,
            catalogVersion: summary.catalogVersion || null,
            toolCount: summary.toolCount,
            servicoIniciadoEm: SERVICE_STARTED_AT,
            uptimeSec: Math.round(process.uptime()),
            uptimeLegivel: legivelTempo(process.uptime()),
            memoryMb: { rss: rssMb, heap: heapMb },
            loadavg: os.loadavg(),
            sseAtivas,
            sse,
            dependencias,
            checks: dependencias.map(d => ({ key: d.nome, ok: d.ok, detail: d.detalhe })),
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

function legivelTempo(seg) {
    const s = Math.round(seg);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const partes = [];
    if (d) partes.push(`${d}d`);
    if (h) partes.push(`${h}h`);
    if (m || (!d && !h)) partes.push(`${m}min`);
    return partes.join(" ");
}
