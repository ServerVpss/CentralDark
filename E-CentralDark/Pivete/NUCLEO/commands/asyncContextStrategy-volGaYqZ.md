# COMANDO - asyncContextStrategy-volGaYqZ.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\opentelemetry@10.71.0@@@1\build\cjs\asyncContextStrategy-volGaYqZ.js
**SHA:** 6d0ea193533a54bf
**Timestamp:** 2026-08-28T02:23:20.051612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Do we need to change something here?

### Ouro Bruto (primeiros 5000 chars)
```
const api = require('@opentelemetry/api');
const core = require('@sentry/core');
const attributes = require('@sentry/conventions/attributes');
const sdkTraceBase = require('@opentelemetry/sdk-trace-base');
const core$1 = require('@opentelemetry/core');

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
  return core.isObjectLike(castSpan.attributes);
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
  const maybeUrlAttribute = span.attributes[attributes.URL_FULL] || span.attributes[attributes.HTTP_URL];
  const data = {
    url: maybeUrlAttribute,
    // eslint-disable-next-line typescript/no-deprecated
    "http.method": span.attributes[attributes.HTTP_REQUEST_METHOD] || span.attributes[attributes.HTTP_METHOD]
  };
  if (!data["http.method"] && data.url) {
    data["http.method"] = "GET";
  }
  try {
    if (typeof maybeUrlAttribute === "string") {
      const url = core.parseUrl(maybeUrlAttribute);
      data.url = core.getSanitizedUrlString(url);
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
      const version = core.SDK_VERSION;
      const tracer = api.trace.getTracer(name, version);
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
  return api.SpanKind.INTERNAL;
}

const SENTRY_TRACE_HEADER = "sentry-trace";
const SENTRY_BAGGAGE_HEADER = "baggage";
const SENTRY_TRACE_STATE_DSC = "sentry.dsc";
const SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING = "sentry.sampled_not_recording";
const SENTRY_TRACE_STATE_URL = "sentry.url";
const SENTRY_TRACE_STATE_SAMPLE_RAND = "sentry.sample_rand";
const SENTRY_TRACE_STATE_SAMPLE_RATE = "sentry.sample_rate";
const SENTRY_TRACE_STATE_CHILD_IGNORED = "sentry.ignored";
const SENTRY_TRACE_STATE_SEGMENT_IGNORED = "sentry.segment_ignored";
const SENTRY_SCOPES_CONTEXT_KEY = api.createContextKey("sentry_scopes");
const SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_isolation_scope");
const SENTRY_FORK_SET_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_set_scope");
const SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_set_isolation_scope");

const SCOPE_CONTEXT_FIELD = "_scopeContext";
function getScopesFromContext(context) {
  return context.getValue(SENTRY_SCOPES_CONTEXT_KEY);
}
function setScopesOnContext(context, scopes) {
  return context.setValue(SENTRY_SCOPES_CONTEXT_KEY, scopes);
}
function setContextOnScope(scope, context) {
  core.addNonEnumerableProperty(scope, SCOPE_CONTEXT_FIELD, core.makeWeakRef(context));
}
function getContextFromScope(scope) {
  return core.derefWeakRef(scope[SCOPE_CONTEXT_FIELD]);
}

function isSentryRequestSpan(span) {
  if (!spanHasAttributes(span)) {
    return false;
  }
  const { attributes: attributes$1 } = span;
  const httpUrl = attributes$1[attributes.HTTP_URL] || attributes$1[attributes.URL_FULL];
  if (!httpUrl) {
    return false;
  }
  return core.isSentryRequestUrl(httpUrl.toString(), core.getClient());
}

function getSamplingDecision(spanContext) {
  const { traceFlags, traceState } = spanContext;
  const sampledNotRecording = traceState ? traceState.get(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING) === "1" : false;
  if (traceFlags === api.TraceFlags.SAMPLED) {
    return true;
  }
  if (sampledNotRecording) {
    return false;
  }
  const dscString = traceState ? traceState.get(SENTRY_TRACE_STATE_DSC) : void 0;
  const dsc = dscString ? core.baggageHeaderToDynamicSamplin
```