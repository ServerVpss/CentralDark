# COMANDO - vercel-ai-orchestrion-subscriber.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\vercel-ai\vercel-ai-orchestrion-subscriber.js
**SHA:** 6dd32780449fa69b
**Timestamp:** 2026-08-28T02:23:30.230381
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- tool.execute = function(input, ...rest) {
- if (typeof options.prompt === "string") {

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const debugBuild = require('../debug-build.js');
const channels = require('../orchestrion/channels.js');
const tracingChannel = require('../tracing-channel.js');
const vercelAiDcSubscriber = require('./vercel-ai-dc-subscriber.js');
const util = require('./util.js');

const PATCHED = /* @__PURE__ */ Symbol("SentryVercelAiModelPatched");
const TOOL_PATCHED = /* @__PURE__ */ Symbol("SentryVercelAiToolPatched");
let callIdCounter = 0;
function nextCallId() {
  return `v6-${++callIdCounter}`;
}
const messages = /* @__PURE__ */ new WeakMap();
const operationSpans = /* @__PURE__ */ new WeakSet();
const toolCallSpans = /* @__PURE__ */ new WeakSet();
const callIdBySpan = /* @__PURE__ */ new WeakMap();
const recordingBySpan = /* @__PURE__ */ new WeakMap();
const operationErrorInfoBySpan = /* @__PURE__ */ new WeakMap();
const suppressedTelemetry = /* @__PURE__ */ new WeakSet();
let subscribed = false;
function subscribeVercelAiOrchestrionChannels(tracingChannel, options = {}) {
  if (subscribed) {
    return;
  }
  subscribed = true;
  try {
    bindOperation(tracingChannel, channels.CHANNELS.VERCEL_AI_GENERATE_TEXT, buildTextMessage("generateText"), options);
    bindOperation(tracingChannel, channels.CHANNELS.VERCEL_AI_STREAM_TEXT, buildTextMessage("streamText"), options);
    bindOperation(tracingChannel, channels.CHANNELS.VERCEL_AI_GENERATE_OBJECT, buildTextMessage("generateObject"), options);
    bindOperation(
      tracingChannel,
      channels.CHANNELS.VERCEL_AI_EMBED,
      (callOptions, telemetry) => ({
        type: "embed",
        event: {
          callId: nextCallId(),
          ...modelFields(callOptions.model),
          maxRetries: callOptions.maxRetries,
          value: callOptions.value,
          ...recording(telemetry)
        }
      }),
      options
    );
    bindOperation(
      tracingChannel,
      channels.CHANNELS.VERCEL_AI_EMBED_MANY,
      // `embedMany` takes a `values` array (vs `embed`'s single `value`); the shared core reads it as the
      // embeddings input, matching the OTel path's batch `ai.embedMany` span.
      (callOptions, telemetry) => ({
        type: "embedMany",
        event: {
          callId: nextCallId(),
          ...modelFields(callOptions.model),
          maxRetries: callOptions.maxRetries,
          values: callOptions.values,
          ...recording(telemetry)
        }
      }),
      options
    );
    bindOperation(
      tracingChannel,
      channels.CHANNELS.VERCEL_AI_EXECUTE_TOOL_CALL,
      (callOptions, telemetry) => ({
        type: "executeTool",
        // v6 carries the tool definitions on the executeToolCall args (a record keyed by name);
        // the shared core reads the matching tool's `description` for the span.
        event: {
          callId: nextCallId(),
          toolCall: callOptions.toolCall,
          tools: callOptions.tools,
          ...recording(telemetry)
        }
      }),
      options
    );
    subscribeResolveLanguageModel(tracingChannel, channels.CHANNELS.VERCEL_AI_RESOLVE_LANGUAGE_MODEL, options);
  } catch {
    debugBuild.DEBUG_BUILD && core.debug.log("Vercel AI orchestrion channel subscription failed.");
  }
}
function bindOperation(tracingChannel$1, channelName, build, options) {
  const channel = tracingChannel$1(channelName);
  const buildOperationSpan = (data) => {
    const callOptions = core.isObjectLike(data.arguments[0]) ? data.arguments[0] : {};
    const telemetry = core.isObjectLike(callOptions.experimental_telemetry) ? callOptions.experimental_telemetry : {};
    if (telemetry.isEnabled === false && !suppressedTelemetry.has(telemetry)) {
      return void 0;
    }
    const message = build(callOptions, telemetry);
    suppressNativeTelemetry(callOptions, telemetry);
    const callSiteSpan = core.getActiveSpan();
    const span = vercelAiDcSubscriber.createSpanFromMessage(message, options);
    if (span) {
      messages.set(data, message);
      operationSpans.add(span);
      const isV4 = core.isObjectLike(callOptions.model) && callOptions.model.specificationVersion === "v1";
      operationErrorInfoBySpan.set(span, { callSiteSpan, toolErrorsBubbleToCaller: isV4 });
      if (message.type === "executeTool") {
        toolCallSpans.add(span);
      }
      const callId = util.asString(message.event.callId);
      if (callId) {
        callIdBySpan.set(span, callId);
      }
      recordingBySpan.set(span, recording(telemetry));
      if (core.isObjectLike(callOptions.tools)) {
        patchOperationTools(callOptions.tools, options);
      }
      if (isV4) {
        patchModelMethods(callOptions.model, options);
      }
    }
    return span;
  };
  tracingChannel.bindTracingChannelToSpan(
    channel,
    (data) => buildOperationSpan(data),
    {
      beforeSpanEnd: (span, data) => {
        const message = messages.get(data);
        if (!message) {
          return;
        }
        if
```

---

# COMANDO - vercel-ai-orchestrion-subscriber.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\vercel-ai\vercel-ai-orchestrion-subscriber.js
**SHA:** b6d2935d45199993
**Timestamp:** 2026-08-28T02:23:37.713612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- tool.execute = function(input, ...rest) {
- if (typeof options.prompt === "string") {

### Ouro Bruto (primeiros 5000 chars)
```
import { debug, isObjectLike, addNonEnumerableProperty, getActiveSpan, withActiveSpan, SPAN_STATUS_ERROR } from '@sentry/core';
import { DEBUG_BUILD } from '../debug-build.js';
import { CHANNELS } from '../orchestrion/channels.js';
import { bindTracingChannelToSpan } from '../tracing-channel.js';
import { enrichSpanOnEnd, clearOperationId, createSpanFromMessage, streamedResultToChannelResult, clearOperationCallId, captureToolError } from './vercel-ai-dc-subscriber.js';
import { asString, isReadableStream, tapModelCallStream } from './util.js';

const PATCHED = /* @__PURE__ */ Symbol("SentryVercelAiModelPatched");
const TOOL_PATCHED = /* @__PURE__ */ Symbol("SentryVercelAiToolPatched");
let callIdCounter = 0;
function nextCallId() {
  return `v6-${++callIdCounter}`;
}
const messages = /* @__PURE__ */ new WeakMap();
const operationSpans = /* @__PURE__ */ new WeakSet();
const toolCallSpans = /* @__PURE__ */ new WeakSet();
const callIdBySpan = /* @__PURE__ */ new WeakMap();
const recordingBySpan = /* @__PURE__ */ new WeakMap();
const operationErrorInfoBySpan = /* @__PURE__ */ new WeakMap();
const suppressedTelemetry = /* @__PURE__ */ new WeakSet();
let subscribed = false;
function subscribeVercelAiOrchestrionChannels(tracingChannel, options = {}) {
  if (subscribed) {
    return;
  }
  subscribed = true;
  try {
    bindOperation(tracingChannel, CHANNELS.VERCEL_AI_GENERATE_TEXT, buildTextMessage("generateText"), options);
    bindOperation(tracingChannel, CHANNELS.VERCEL_AI_STREAM_TEXT, buildTextMessage("streamText"), options);
    bindOperation(tracingChannel, CHANNELS.VERCEL_AI_GENERATE_OBJECT, buildTextMessage("generateObject"), options);
    bindOperation(
      tracingChannel,
      CHANNELS.VERCEL_AI_EMBED,
      (callOptions, telemetry) => ({
        type: "embed",
        event: {
          callId: nextCallId(),
          ...modelFields(callOptions.model),
          maxRetries: callOptions.maxRetries,
          value: callOptions.value,
          ...recording(telemetry)
        }
      }),
      options
    );
    bindOperation(
      tracingChannel,
      CHANNELS.VERCEL_AI_EMBED_MANY,
      // `embedMany` takes a `values` array (vs `embed`'s single `value`); the shared core reads it as the
      // embeddings input, matching the OTel path's batch `ai.embedMany` span.
      (callOptions, telemetry) => ({
        type: "embedMany",
        event: {
          callId: nextCallId(),
          ...modelFields(callOptions.model),
          maxRetries: callOptions.maxRetries,
          values: callOptions.values,
          ...recording(telemetry)
        }
      }),
      options
    );
    bindOperation(
      tracingChannel,
      CHANNELS.VERCEL_AI_EXECUTE_TOOL_CALL,
      (callOptions, telemetry) => ({
        type: "executeTool",
        // v6 carries the tool definitions on the executeToolCall args (a record keyed by name);
        // the shared core reads the matching tool's `description` for the span.
        event: {
          callId: nextCallId(),
          toolCall: callOptions.toolCall,
          tools: callOptions.tools,
          ...recording(telemetry)
        }
      }),
      options
    );
    subscribeResolveLanguageModel(tracingChannel, CHANNELS.VERCEL_AI_RESOLVE_LANGUAGE_MODEL, options);
  } catch {
    DEBUG_BUILD && debug.log("Vercel AI orchestrion channel subscription failed.");
  }
}
function bindOperation(tracingChannel, channelName, build, options) {
  const channel = tracingChannel(channelName);
  const buildOperationSpan = (data) => {
    const callOptions = isObjectLike(data.arguments[0]) ? data.arguments[0] : {};
    const telemetry = isObjectLike(callOptions.experimental_telemetry) ? callOptions.experimental_telemetry : {};
    if (telemetry.isEnabled === false && !suppressedTelemetry.has(telemetry)) {
      return void 0;
    }
    const message = build(callOptions, telemetry);
    suppressNativeTelemetry(callOptions, telemetry);
    const callSiteSpan = getActiveSpan();
    const span = createSpanFromMessage(message, options);
    if (span) {
      messages.set(data, message);
      operationSpans.add(span);
      const isV4 = isObjectLike(callOptions.model) && callOptions.model.specificationVersion === "v1";
      operationErrorInfoBySpan.set(span, { callSiteSpan, toolErrorsBubbleToCaller: isV4 });
      if (message.type === "executeTool") {
        toolCallSpans.add(span);
      }
      const callId = asString(message.event.callId);
      if (callId) {
        callIdBySpan.set(span, callId);
      }
      recordingBySpan.set(span, recording(telemetry));
      if (isObjectLike(callOptions.tools)) {
        patchOperationTools(callOptions.tools, options);
      }
      if (isV4) {
        patchModelMethods(callOptions.model, options);
      }
    }
    return span;
  };
  bindTracingChannelToSpan(
    channel,
    (data) => buildOperationSpan(data),
    {
      beforeSpanEnd: (span, data) => {
        const message = messages.get(data);
        if (!message) {
          return
```