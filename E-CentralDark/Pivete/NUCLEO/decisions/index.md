# DECISAO - index.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api@1.9.1@@@1\build\esm\index.js
**SHA:** 7f64d111c63ee84f
**Timestamp:** 2026-08-28T02:20:46.482342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove ProxyTracerProvider export in the next major version.

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
export { baggageEntryMetadataFromString } from './baggage/utils';
// Context APIs
export { createContextKey, ROOT_CONTEXT } from './context/context';
// Diag APIs
export { DiagConsoleLogger } from './diag/consoleLogger';
export { DiagLogLevel } from './diag/types';
// Metrics APIs
export { createNoopMeter } from './metrics/NoopMeter';
export { ValueType } from './metrics/Metric';
// Propagation APIs
export { defaultTextMapGetter, defaultTextMapSetter, } from './propagation/TextMapPropagator';
export { ProxyTracer } from './trace/ProxyTracer';
// TODO: Remove ProxyTracerProvider export in the next major version.
export { ProxyTracerProvider } from './trace/ProxyTracerProvider';
export { SamplingDecision } from './trace/SamplingResult';
export { SpanKind } from './trace/span_kind';
export { SpanStatusCode } from './trace/status';
export { TraceFlags } from './trace/trace_flags';
export { createTraceState } from './trace/internal/utils';
export { isSpanContextValid, isValidTraceId, isValidSpanId, } from './trace/spancontext-utils';
export { INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT, } from './trace/invalid-span-constants';
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
import { context } from './context-api';
import { diag } from './diag-api';
import { metrics } from './metrics-api';
import { propagation } from './propagation-api';
import { trace } from './trace-api';
// Named export.
export { context, diag, metrics, propagation, trace };
// Default export.
export default {
    context,
    diag,
    metrics,
    propagation,
    trace,
};
//# sourceMappingURL=index.js.map
```

---

# DECISAO - index.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api@1.9.1@@@1\build\src\index.js
**SHA:** d2ad421c473ecbbb
**Timestamp:** 2026-08-28T02:20:56.301869
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove ProxyTracerProvider export in the next major version.

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace = exports.propagation = exports.metrics = exports.diag = exports.context = exports.INVALID_SPAN_CONTEXT = exports.INVALID_TRACEID = exports.INVALID_SPANID = exports.isValidSpanId = exports.isValidTraceId = exports.isSpanContextValid = exports.createTraceState = exports.TraceFlags = exports.SpanStatusCode = exports.SpanKind = exports.SamplingDecision = exports.ProxyTracerProvider = exports.ProxyTracer = exports.defaultTextMapSetter = exports.defaultTextMapGetter = exports.ValueType = exports.createNoopMeter = exports.DiagLogLevel = exports.DiagConsoleLogger = exports.ROOT_CONTEXT = exports.createContextKey = exports.baggageEntryMetadataFromString = void 0;
var utils_1 = require("./baggage/utils");
Object.defineProperty(exports, "baggageEntryMetadataFromString", { enumerable: true, get: function () { return utils_1.baggageEntryMetadataFromString; } });
// Context APIs
var context_1 = require("./context/context");
Object.defineProperty(exports, "createContextKey", { enumerable: true, get: function () { return context_1.createContextKey; } });
Object.defineProperty(exports, "ROOT_CONTEXT", { enumerable: true, get: function () { return context_1.ROOT_CONTEXT; } });
// Diag APIs
var consoleLogger_1 = require("./diag/consoleLogger");
Object.defineProperty(exports, "DiagConsoleLogger", { enumerable: true, get: function () { return consoleLogger_1.DiagConsoleLogger; } });
var types_1 = require("./diag/types");
Object.defineProperty(exports, "DiagLogLevel", { enumerable: true, get: function () { return types_1.DiagLogLevel; } });
// Metrics APIs
var NoopMeter_1 = require("./metrics/NoopMeter");
Object.defineProperty(exports, "createNoopMeter", { enumerable: true, get: function () { return NoopMeter_1.createNoopMeter; } });
var Metric_1 = require("./metrics/Metric");
Object.defineProperty(exports, "ValueType", { enumerable: true, get: function () { return Metric_1.ValueType; } });
// Propagation APIs
var TextMapPropagator_1 = require("./propagation/TextMapPropagator");
Object.defineProperty(exports, "defaultTextMapGetter", { enumerable: true, get: function () { return TextMapPropagator_1.defaultTextMapGetter; } });
Object.defineProperty(exports, "defaultTextMapSetter", { enumerable: true, get: function () { return TextMapPropagator_1.defaultTextMapSetter; } });
var ProxyTracer_1 = require("./trace/ProxyTracer");
Object.defineProperty(exports, "ProxyTracer", { enumerable: true, get: function () { return ProxyTracer_1.ProxyTracer; } });
// TODO: Remove ProxyTracerProvider export in the next major version.
var ProxyTracerProvider_1 = require("./trace/ProxyTracerProvider");
Object.defineProperty(exports, "ProxyTracerProvider", { enumerable: true, get: function () { return ProxyTracerProvider_1.ProxyTracerProvider; } });
var SamplingResult_1 = require("./trace/SamplingResult");
Object.defineProperty(exports, "SamplingDecision", { enumerable: true, get: function () { return SamplingResult_1.SamplingDecision; } });
var span_kind_1 = require("./trace/span_kind");
Object.defineProperty(exports, "SpanKind", { enumerable: true, get: function () { return span_kind_1.SpanKind; } });
var status_1 = require("./trace/status");
Object.defineProperty(exports, "SpanStatusCode", { enumerable: true, get: function () { return status_1.SpanStatusCode; } });
var trace_flags_1 = require("./trace/trace_flags");
Object.defineProperty(exports, "TraceFlags", { enumerable: true, get: function () { return trace_flags_1.TraceFlags; } });
var utils_2 = require("./trace/internal/utils");
Object.defineProperty(exports, "createTraceState", { enumerable: true, get: function () { return utils_2.createTraceState; } });
var spancontext_utils_1 = require("./trace/spancontext-utils");
Object.defineProperty(exports, "isSpanContextValid", { enumerable: true, get: function () { return spancontext_utils_1.isSpanContextValid; } });
Object.defineProperty(exports, "isValidTraceId", { enumerable: true, get: function () { return spancontext_utils_1.isValidTraceId; } });
Object.defineProperty(exports, "isValidSpanId", { enumerable: true, get: function () { return spancontext_utils_1.isValidSpanId; } });
var invalid_span_constants_1 = require("./trace/invalid-span-constants");
Object.defineProperty(exports, "INVALID_SPANID", { enumerable: true, get: function () { return invalid_span_constants_1.INVALID_SPANID; } });
Object.defineProperty(exports, "INVALID_TRACEID", { enumerable: true, get: function () { return invalid_span_constants_1.INVALID_TRACEID; } });
Object.defineProperty(exports, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function () { return invalid_span_constants_1.INVALID_SPAN_CONTEXT; } });
// Split module-level variable definition into separate files to allow
// tree-shaking on each api instance.
const context_api_1 = require("./context-api");
Object.defineProperty(exports, "con
```