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
import { getHubMissionConsumerStatus } from "./hub-mission-consumer.js";
import { getOperationalSnapshot } from "./operational-telemetry.js";
const MCP_VERSION = "0.4.0-v2.2";
const SERVICE_STARTED_AT = new Date().toISOString();
function checkSecret(name) {
    const v = process.env[name];
    return { name, present: Boolean(v && v.trim() && !v.startsWith("__MISSING_")) };
}
function checkDisk(dir) {
    try {
        fs.accessSync(dir, fs.constants.W_OK);
        return { ok: true, dir };
    }
    catch (err) {
        return { ok: false, dir, error: String(err?.message || err) };
    }
}
function pct(ok, total) {
    if (!total)
        return 100;
    return Math.round((ok / total) * 100);
}
function checkDependencia(nome, ok, detalhe) {
    return { nome, ok, detalhe };
}
async function checkTelegramSubsystem() {
    const tokenPresent = checkSecret("SRVER1_BOT_TOKEN").present
        || checkSecret("TELEGRAM_BOT_TOKEN").present
        || checkSecret("GUARDA_TELEGRAM_BOT_TOKEN").present
        || checkSecret("TELEGRAM_TOKEN").present;
    try {
        const response = await fetch("http://127.0.0.1:9500/bot/health", {
            signal: AbortSignal.timeout(1_500),
        });
        const payload = await response.json().catch(() => ({}));
        const ok = response.ok && payload?.ok === true;
        return {
            ok,
            detalhe: {
                endpoint: "http://127.0.0.1:9500/bot/health",
                reachable: true,
                mode: payload?.mode || null,
                bot: payload?.bot || null,
                lastTelegramOkAt: payload?.lastTelegramOkAt || null,
                lastTelegramOkAgeMs: payload?.lastTelegramOkAgeMs ?? null,
                lastErrorPresent: payload?.lastErrorPresent === true,
                localTokenPresent: tokenPresent,
            },
        };
    }
    catch {
        return {
            ok: tokenPresent,
            detalhe: {
                endpoint: "http://127.0.0.1:9500/bot/health",
                reachable: false,
                mode: tokenPresent ? "local-token-fallback" : null,
                localTokenPresent: tokenPresent,
            },
        };
    }
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
        const hubConsumer = getHubMissionConsumerStatus();
        const operational = getOperationalSnapshot();
        // Dependências externas (checagem leve — sem network)
        const telegram = await checkTelegramSubsystem();
        const oauthOk = checkSecret("MCP_SESSION_SECRET").present
            && checkSecret("MCP_ADMIN_PASSWORD").present;
        const githubOk = checkSecret("GITHUB_TOKEN").present
            || checkSecret("GH_TOKEN").present;
        const now = Date.now();
        const lastPollMs = hubConsumer.lastPollAt ? Date.parse(hubConsumer.lastPollAt) : NaN;
        const bootStartedMs = Date.parse(SERVICE_STARTED_AT);
        const bootAgeMs = Number.isFinite(bootStartedMs) ? Math.max(0, now - bootStartedMs) : null;
        const pollStaleMs = Number.isFinite(lastPollMs) ? Math.max(0, now - lastPollMs) : null;
        const explicitlyDisabled = hubConsumer.status === "disabled"
            && hubConsumer.reason === "HUB_MISSION_CONSUMER_ENABLED=false";
        const startingGrace = hubConsumer.status === "starting"
            && hubConsumer.lastPollAt == null
            && bootAgeMs !== null
            && bootAgeMs < hubConsumer.pollMs * 6;
        const pollFresh = pollStaleMs !== null && pollStaleMs < hubConsumer.pollMs * 6;
        const hubConsumerOk = explicitlyDisabled || startingGrace || (hubConsumer.enabled === true
            && hubConsumer.status !== "error"
            && pollFresh);
        const dependencias = [
            checkDependencia("mcp_catalog", summary.toolCount > 0, { toolCount: summary.toolCount }),
            checkDependencia("oauth", oauthOk, { secretsPresentes: oauthOk }),
            checkDependencia("telegram_bot", telegram.ok, telegram.detalhe),
            checkDependencia("github_api", githubOk, { tokenPresente: githubOk }),
            checkDependencia("hub_mission_consumer", hubConsumerOk, {
                enabled: hubConsumer.enabled,
                status: hubConsumer.status,
                reason: hubConsumer.reason,
                workerId: hubConsumer.workerId,
                pollMs: hubConsumer.pollMs,
                requestTimeoutMs: hubConsumer.requestTimeoutMs,
                lastPollAt: hubConsumer.lastPollAt,
                pollStaleMs,
                bootAgeMs,
                critical: true,
                lastMissionId: hubConsumer.lastMissionId,
                lastExecutionStatus: hubConsumer.lastExecutionStatus,
                staleUnprovenCount: hubConsumer.staleUnprovenCount,
                lastError: hubConsumer.lastError,
            }),
            checkDependencia("sse", true, { conexoesAtivas: sseAtivas, eventosPorMinuto: sse.eventosPorMinuto, ultimoEventoHaMs: sse.ultimoEventoHaMs, status: "operacional" }),
            checkDependencia("disk_logs", disk.ok, disk),
            checkDependencia("memoria", rssMb < 512, { rssMb, heapMb }),
            checkDependencia("loadavg", os.loadavg()[0] < os.cpus().length * 2, { load: os.loadavg() }),
        ];
        const okCount = dependencias.filter((d) => d.ok).length;
        const score = pct(okCount, dependencias.length);
        const criticalFailures = dependencias.filter((d) => d.detalhe?.critical === true && !d.ok);
        const status = criticalFailures.length > 0 ? "unhealthy" : (score === 100 ? "healthy" : score >= 60 ? "degraded" : "unhealthy");
        res.status(status === "unhealthy" ? 503 : 200).json({
            ok: status !== "unhealthy",
            status,
            score,
            criticalFailures: criticalFailures.map((d) => d.nome),
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
            hubMissionConsumer: hubConsumer,
            operationalSnapshot: operational,
            dependencias,
            checks: dependencias.map(d => ({ key: d.nome, ok: d.ok, detail: d.detalhe })),
            elapsedMs: Math.round(performance.now() - t0),
            time: new Date().toISOString(),
        });
    }
    catch (err) {
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
    if (d)
        partes.push(`${d}d`);
    if (h)
        partes.push(`${h}h`);
    if (m || (!d && !h))
        partes.push(`${m}min`);
    return partes.join(" ");
}
//# sourceMappingURL=health-deep.js.map
