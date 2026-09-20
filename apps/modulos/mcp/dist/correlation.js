// Middleware de Correlation-ID + tracing causal estruturado por request.
// Preserva compatibilidade com req.cid e X-Correlation-Id, mas separa
// request, correlation, trace e span para permitir round-trip causal.
import { randomBytes, randomUUID } from "node:crypto";
import { log } from "./log.js";
const TRACEPARENT_RE = /^00-([a-f0-9]{32})-([a-f0-9]{16})-([a-f0-9]{2})$/i;
const SAFE_ID_RE = /^[A-Za-z0-9._:@/-]+$/;
function headerValue(headers, name) {
    const value = headers?.[name] ?? headers?.[name.toLowerCase()];
    if (Array.isArray(value))
        return value[0];
    return typeof value === "string" ? value.trim() : "";
}
function boundedId(value, { min = 1, max = 128 } = {}) {
    if (typeof value !== "string")
        return "";
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max)
        return "";
    return SAFE_ID_RE.test(trimmed) ? trimmed : "";
}
function randomTraceId() {
    return randomBytes(16).toString("hex");
}
function randomSpanId() {
    return randomBytes(8).toString("hex");
}
function parseTraceparent(value) {
    const match = TRACEPARENT_RE.exec(String(value ?? "").trim());
    if (!match)
        return null;
    const [, traceId, parentSpanId, flags] = match;
    if (/^0{32}$/i.test(traceId) || /^0{16}$/i.test(parentSpanId))
        return null;
    return {
        trace_id: traceId.toLowerCase(),
        parent_span_id: parentSpanId.toLowerCase(),
        trace_flags: flags.toLowerCase(),
    };
}
export function resolveTraceContext(headers = {}) {
    const traceparent = parseTraceparent(headerValue(headers, "traceparent"));
    const explicitTraceId = headerValue(headers, "x-trace-id").toLowerCase();
    const traceId = traceparent?.trace_id
        || (/^[a-f0-9]{32}$/.test(explicitTraceId) && !/^0{32}$/.test(explicitTraceId) ? explicitTraceId : randomTraceId());
    const incomingRequestId = boundedId(headerValue(headers, "x-request-id"), { min: 8, max: 128 });
    const requestId = incomingRequestId || randomUUID();
    const incomingCorrelationId = boundedId(headerValue(headers, "x-correlation-id"), { min: 8, max: 128 });
    const correlationId = incomingCorrelationId || randomUUID();
    const missionId = boundedId(headerValue(headers, "x-mission-id"), { min: 1, max: 128 }) || null;
    const spanId = randomSpanId();
    return Object.freeze({
        mission_id: missionId,
        trace_id: traceId,
        request_id: requestId,
        correlation_id: correlationId,
        span_id: spanId,
        parent_span_id: traceparent?.parent_span_id ?? null,
        trace_flags: traceparent?.trace_flags ?? "01",
    });
}
export function traceHeaders(trace) {
    return {
        "X-Correlation-Id": trace.correlation_id,
        "X-Request-Id": trace.request_id,
        "X-Trace-Id": trace.trace_id,
        "X-Span-Id": trace.span_id,
        ...(trace.mission_id ? { "X-Mission-Id": trace.mission_id } : {}),
        traceparent: `00-${trace.trace_id}-${trace.span_id}-${trace.trace_flags || "01"}`,
    };
}
export function traceLogMeta(trace, meta = {}) {
    if (!trace || typeof trace !== "object")
        return { ...meta };
    return {
        cid: trace.correlation_id,
        correlation_id: trace.correlation_id,
        request_id: trace.request_id,
        trace_id: trace.trace_id,
        span_id: trace.span_id,
        parent_span_id: trace.parent_span_id ?? undefined,
        mission_id: trace.mission_id ?? undefined,
        ...meta,
    };
}
export function correlationMiddleware(req, res, next) {
    const trace = resolveTraceContext(req.headers ?? {});
    req.trace = trace;
    req.cid = trace.correlation_id; // compatibilidade com consumidores existentes
    for (const [name, value] of Object.entries(traceHeaders(trace))) {
        res.setHeader(name, value);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (body && typeof body === "object" && !Array.isArray(body)) {
            if (body.jsonrpc === "2.0") {
                body.cid = body.cid || trace.correlation_id;
                body.traceId = body.traceId || trace.trace_id;
                body.spanId = body.spanId || trace.span_id;
                if (body.error && typeof body.error === "object") {
                    body.error.data = {
                        ...(body.error.data || {}),
                        cid: body.error.data?.cid || trace.correlation_id,
                        traceId: body.error.data?.traceId || trace.trace_id,
                        spanId: body.error.data?.spanId || trace.span_id,
                    };
                }
            }
            else {
                body.cid = body.cid || trace.correlation_id;
                body.requestId = body.requestId || trace.request_id;
                body.traceId = body.traceId || trace.trace_id;
                body.spanId = body.spanId || trace.span_id;
            }
        }
        return originalJson(body);
    };
    const started = Date.now();
    log.info("http_request_start", traceLogMeta(trace, {
        method: req.method,
        path: req.path,
        ua: (req.headers["user-agent"] || "").slice(0, 120),
        ip: req.ip || req.socket?.remoteAddress || "?",
    }));
    res.on("finish", () => {
        log.info("http_request_end", traceLogMeta(trace, {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            ms: Date.now() - started,
            bytes: Number(res.getHeader("content-length")) || undefined,
        }));
    });
    res.on("close", () => {
        if (!res.writableEnded) {
            log.warn("http_request_aborted", traceLogMeta(trace, {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                ms: Date.now() - started,
            }));
        }
    });
    next();
}
export function withTrace(trace) {
    return {
        debug: (msg, meta = {}) => log.debug(msg, traceLogMeta(trace, meta)),
        info: (msg, meta = {}) => log.info(msg, traceLogMeta(trace, meta)),
        warn: (msg, meta = {}) => log.warn(msg, traceLogMeta(trace, meta)),
        error: (msg, meta = {}) => log.error(msg, traceLogMeta(trace, meta)),
    };
}
// Helper legado: continua válido para consumidores que só conhecem CID.
export function withCid(cid) {
    return {
        debug: (msg, meta = {}) => log.debug(msg, { cid, ...meta }),
        info: (msg, meta = {}) => log.info(msg, { cid, ...meta }),
        warn: (msg, meta = {}) => log.warn(msg, { cid, ...meta }),
        error: (msg, meta = {}) => log.error(msg, { cid, ...meta }),
    };
}
//# sourceMappingURL=correlation.js.map