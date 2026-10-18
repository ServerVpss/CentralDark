// Fachada autenticada para a fonte VS Code da Casa. Não expõe o arquivo bruto.
import { isAdmin } from "./admin.js";
import { queryCentralLogs } from "./agent-observability.js";
const SOURCE = "LOGS-VS-CODE.log";
function bounded(value, fallback, lo, hi) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(hi, Math.max(lo, Math.floor(parsed))) : fallback;
}
function ageMs(iso) {
    const value = Date.parse(String(iso || ""));
    return Number.isFinite(value) ? Math.max(0, Date.now() - value) : null;
}
export function adminVsCodeLog(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({ ok: false, error: "unauthorized" });
        return;
    }
    res.setHeader("Cache-Control", "no-store");
    const windowMinutes = bounded(req.query?.since_minutes, 60, 1, 1440);
    const limit = bounded(req.query?.limit, 100, 1, 500);
    const level = String(req.query?.level || "").toLowerCase().slice(0, 24);
    const component = String(req.query?.component || "").toLowerCase().slice(0, 48);
    const rows = queryCentralLogs({ sector: "vscode", since_minutes: windowMinutes, limit: 2000 })
        .filter((row) => row.source === SOURCE && row.actor === "casa");
    const heartbeats = rows.filter((row) => row.kind === "vscode_bridge_status");
    const last = heartbeats.length ? heartbeats[heartbeats.length - 1] : null;
    const heartbeatAgeMs = ageMs(last?.timestamp);
    const sourceAgeMs = ageMs(last?.data?.source_last_write_utc);
    const stale = heartbeatAgeMs == null || heartbeatAgeMs > 180_000;
    const sourceIdle = sourceAgeMs == null || sourceAgeMs > 300_000;
    const state = last == null ? "UNKNOWN" :
        stale || sourceIdle || last.data?.state !== "OK" ? "ATTENTION" : "OK";
    const color = state === "OK" ? "green" : state === "ATTENTION" ? "yellow" : "gray";
    const playwrightSample = last?.data?.playwright;
    const playwright = !stale && playwrightSample && typeof playwrightSample === "object"
        ? { cache_state: playwrightSample.cache_state || "UNKNOWN",
            revision: playwrightSample.revision ?? null,
            runtime_state: playwrightSample.runtime_state || "UNPROVEN",
            process_count: playwrightSample.process_count || 0,
            automation_roundtrip: "UNPROVEN", source: "CASA_SSH_METADATA" }
        : { cache_state: "UNKNOWN", revision: null, runtime_state: "UNPROVEN",
            process_count: 0, automation_roundtrip: "UNPROVEN", source: "NO_FRESH_CASA_PROOF" };
    const events = rows.filter((row) => row.kind === "vscode_log_signal")
        .filter((row) => !level || row.level === level)
        .filter((row) => !component || row.key === "vscode:" + component)
        .slice(-limit);
    res.json({
        ok: true, source: SOURCE,
        raw_log_location: "CASA_ONLY", raw_log_exposed: false,
        canonical_owner: "apps/modulos/mcp/src/log-funnel.js",
        state, color, route: last?.data?.route || null, playwright,
        last_received_at: last?.timestamp || null,
        heartbeat_age_ms: heartbeatAgeMs,
        source_age_ms: sourceAgeMs,
        attention: {
            route_fallback: last?.data?.route === "ssh-direct",
            heartbeat_stale: stale,
            source_idle_or_stale: sourceIdle,
        },
        filters: { since_minutes: windowMinutes, limit, level: level || null, component: component || null },
        total: events.length,
        events,
    });
}
//# sourceMappingURL=vscode-log-route.js.map