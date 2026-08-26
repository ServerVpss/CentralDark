import { randomBytes, randomUUID } from "node:crypto";
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
//# sourceMappingURL=trace-context.js.map