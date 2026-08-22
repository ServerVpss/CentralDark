import assert from "node:assert/strict";
import test from "node:test";
import { resolveTraceContext, traceHeaders, traceLogMeta } from "../src/correlation.js";

const TRACE_RE = /^[a-f0-9]{32}$/;
const SPAN_RE = /^[a-f0-9]{16}$/;

test("gera identidades separadas para request, correlation, trace e span", () => {
    const trace = resolveTraceContext({});
    assert.match(trace.trace_id, TRACE_RE);
    assert.match(trace.span_id, SPAN_RE);
    assert.ok(trace.request_id);
    assert.ok(trace.correlation_id);
    assert.equal(trace.parent_span_id, null);
    assert.notEqual(trace.request_id, trace.correlation_id);
    assert.notEqual(trace.request_id, trace.trace_id);
    assert.notEqual(trace.correlation_id, trace.trace_id);
});

test("preserva request_id e correlation_id independentes", () => {
    const trace = resolveTraceContext({
        "x-request-id": "request-12345678",
        "x-correlation-id": "correlation-87654321",
    });
    assert.equal(trace.request_id, "request-12345678");
    assert.equal(trace.correlation_id, "correlation-87654321");
});

test("traceparent cria span filho mantendo a causalidade", () => {
    const trace = resolveTraceContext({
        traceparent: "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
    });
    assert.equal(trace.trace_id, "0123456789abcdef0123456789abcdef");
    assert.equal(trace.parent_span_id, "0123456789abcdef");
    assert.match(trace.span_id, SPAN_RE);
    assert.notEqual(trace.span_id, trace.parent_span_id);
});

test("traceparent inválido não contamina o trace novo", () => {
    const trace = resolveTraceContext({ traceparent: "00-zero-zero-01" });
    assert.match(trace.trace_id, TRACE_RE);
    assert.match(trace.span_id, SPAN_RE);
    assert.equal(trace.parent_span_id, null);
});

test("round-trip preserva trace, correlation e encadeia parent_span", () => {
    const first = resolveTraceContext({ "x-mission-id": "CD-TRACE-42" });
    const headers = Object.fromEntries(
        Object.entries(traceHeaders(first)).map(([key, value]) => [key.toLowerCase(), value]),
    );
    const second = resolveTraceContext(headers);
    assert.equal(second.trace_id, first.trace_id);
    assert.equal(second.correlation_id, first.correlation_id);
    assert.equal(second.parent_span_id, first.span_id);
    assert.notEqual(second.span_id, first.span_id);
    assert.equal(second.mission_id, "CD-TRACE-42");
});

test("identificador inseguro ou excessivo não é propagado", () => {
    const unsafe = resolveTraceContext({
        "x-mission-id": "token=segredo com espaço",
        "x-correlation-id": "x".repeat(256),
    });
    assert.equal(unsafe.mission_id, null);
    assert.notEqual(unsafe.correlation_id, "x".repeat(256));
});

test("metadado estruturado preserva causalidade sem apagar meta do evento", () => {
    const trace = resolveTraceContext({ "x-mission-id": "CD-7" });
    const meta = traceLogMeta(trace, { status: 200 });
    assert.equal(meta.trace_id, trace.trace_id);
    assert.equal(meta.span_id, trace.span_id);
    assert.equal(meta.request_id, trace.request_id);
    assert.equal(meta.correlation_id, trace.correlation_id);
    assert.equal(meta.mission_id, "CD-7");
    assert.equal(meta.status, 200);
});
