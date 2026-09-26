# COMANDO - asyncContextStrategy-jD8YWNDU.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\opentelemetry@10.71.0@@@1\build\esm\asyncContextStrategy-jD8YWNDU.js
**SHA:** 4d2d82328a01497c
**Timestamp:** 2026-08-28T02:23:20.245612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Do we need to change something here?

### Ouro Bruto (primeiros 5000 chars)
```
import * as api from '@opentelemetry/api';
import { trace, SpanKind, createContextKey, TraceFlags, propagation, INVALID_TRACEID, context, SpanStatusCode, ROOT_CONTEXT, isSpanContextValid } from '@opentelemetry/api';
import { isObjectLike, parseUrl, getSanitizedUrlString, SDK_VERSION, derefWeakRef, addNonEnumerableProperty, makeWeakRef, isSentryRequestUrl, getClient, getRootSpan, spanIsIgnored, hasSpansEnabled, spanIsSentrySpan, spanIsSampled, baggageHeaderToDynamicSamplingContext, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, spanToJSON, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME, stripUrlQueryAndFragment, dynamicSamplingContextToSentryBaggageHeader, LRUMap, debug, shouldPropagateTraceForUrl, parseBaggageHeader, SENTRY_BAGGAGE_KEY_PREFIX, generateSentryTraceHeader, generateTraceparentHeader, getDynamicSamplingContextFromSpan, getCurrentScope, getDynamicSamplingContextFromScope, getIsolationScope, propagationContextFromHeaders, shouldContinueTrace, spanToTraceContext, getTraceContextFromScope, generateTraceId, generateSpanId, _INTERNAL_safeMathRandom, handleCallbackErrors, getSpanStatusFromHttpCode, SPAN_STATUS_ERROR, SPAN_STATUS_OK, _INTERNAL_safeDateNow, debounce, timedEventsToMeasurements, captureEvent, getCapturedScopesOnSpan, SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, convertSpanLinksForEnvelope, getStatusMessage, spanTimeInputToSeconds, SPAN_KIND, safeSetSpanJSONAttributes, spanKindToName, hasSpanStreamingEnabled, addChildSpanToSpan, getDefaultIsolationScope, getDefaultCurrentScope, setCapturedScopesOnSpan, logSpanStart, logSpanEnd, shouldIgnoreSpan, parseSampleRate, sampleSpan, spanShouldInferOtelSource, spanSourceWasExplicitlySet, markSpanAsTracerProviderSpan, markSpanForOtelSourceInference, _INTERNAL_setSpanForScope, startNewTrace as startNewTrace$1, _INTERNAL_startInactiveSpan, withScope, SentryNonRecordingSpan, setAsyncContextStrategy } from '@sentry/core';
import { URL_FULL, HTTP_URL, HTTP_REQUEST_METHOD, HTTP_METHOD, DB_SYSTEM_NAME, DB_SYSTEM, RPC_SERVICE, MESSAGING_SYSTEM, FAAS_TRIGGER, DB_STATEMENT, HTTP_TARGET, HTTP_ROUTE, HTTP_RESPONSE_STATUS_CODE, HTTP_STATUS_CODE, RPC_GRPC_STATUS_CODE, SENTRY_ORIGIN, SERVICE_VERSION, SERVICE_NAME } from '@sentry/conventions/attributes';
import { SamplingDecision } from '@opentelemetry/sdk-trace-base';
import { W3CBaggagePropagator, isTracingSuppressed as isTracingSuppressed$1, suppressTracing as suppressTracing$1, SDK_INFO } from '@opentelemetry/core';

const SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE = "sentry.parentIsRemote";
const SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION = "sentry.graphql.operation";

function getParentSpanId(span) {
  if ("parentSpanId" in span) {
    return span.parentSpanId;
  } else if ("parentSpanContext" in span) {
    return span.parentSpanContext?.spanId;
  }
  return void 0;
}

function spanHasAttributes(span) {
  const castSpan = span;
  return isObjectLike(castSpan.attributes);
}
function spanHasKind(span) {
  const castSpan = span;
  return typeof castSpan.kind === "number";
}
function spanHasStatus(span) {
  const castSpan = span;
  return !!castSpan.status;
}
function spanHasName(span) {
  const castSpan = span;
  return !!castSpan.name;
}
function spanHasParentId(span) {
  const castSpan = span;
  return !!getParentSpanId(castSpan);
}
function spanHasEvents(span) {
  const castSpan = span;
  return Array.isArray(castSpan.events);
}

function getRequestSpanData(span) {
  if (!spanHasAttributes(span)) {
    return {};
  }
  const maybeUrlAttribute = span.attributes[URL_FULL] || span.attributes[HTTP_URL];
  const data = {
    url: maybeUrlAttribute,
    // eslint-disable-next-line typescript/no-deprecated
    "http.method": span.attributes[HTTP_REQUEST_METHOD] || span.attributes[HTTP_METHOD]
  };
  if (!data["http.method"] && data.url) {
    data["http.method"] = "GET";
  }
  try {
    if (typeof maybeUrlAttribute === "string") {
      const url = parseUrl(maybeUrlAttribute);
      data.url = getSanitizedUrlString(url);
      if (url.search) {
        data["http.query"] = url.search;
      }
      if (url.hash) {
        data["http.fragment"] = url.hash;
      }
    }
  } catch {
  }
  return data;
}

function wrapClientClass(ClientClass) {
  class OpenTelemetryClient extends ClientClass {
    constructor(...args) {
      super(...args);
    }
    /** Get the OTEL tracer. */
    get tracer() {
      if (this._tracer) {
        return this._tracer;
      }
      const name = "@sentry/opentelemetry";
      const version = SDK_VERSION;
      const tracer = trace.getTracer(name, version);
      this._tracer = tracer;
      return tracer;
    }
    /**
     * @inheritDoc
     */
    async flush(timeout) {
      const provider = this.traceProvider;
      await provider?.forceFlush();
      return super.flush(timeout);
    }
  }
  return OpenTelemetryClient;
}

function getSpanKind(span) {
  if (spanHasKind(span)) {
    return span.kind;
  }
  return SpanKind.INTERNAL;
}

const SEN
```