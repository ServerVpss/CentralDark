# OUTRO - sse.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\helper\streaming\sse.js
**SHA:** 24d6d8914bc858cc
**Timestamp:** 2026-08-26T19:32:10.083527
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var run = async (stream, cb, onError) => {

### Ouro Bruto (primeiros 5000 chars)
```
// src/helper/streaming/sse.ts
import { HtmlEscapedCallbackPhase, resolveCallback } from "../../utils/html.js";
import { StreamingApi } from "../../utils/stream.js";
import { isOldBunVersion } from "./utils.js";
var SSEStreamingApi = class extends StreamingApi {
  constructor(writable, readable) {
    super(writable, readable);
  }
  async writeSSE(message) {
    const data = await resolveCallback(message.data, HtmlEscapedCallbackPhase.Stringify, false, {});
    const dataLines = data.split(/\r\n|\r|\n/).map((line) => {
      return `data: ${line}`;
    }).join("\n");
    for (const key of ["event", "id", "retry"]) {
      if (message[key] && /[\r\n]/.test(message[key])) {
        throw new Error(`${key} must not contain "\\r" or "\\n"`);
      }
    }
    const sseData = [
      message.event && `event: ${message.event}`,
      dataLines,
      message.id && `id: ${message.id}`,
      message.retry && `retry: ${message.retry}`
    ].filter(Boolean).join("\n") + "\n\n";
    await this.write(sseData);
  }
};
var run = async (stream, cb, onError) => {
  try {
    await cb(stream);
  } catch (e) {
    if (e instanceof Error && onError) {
      await onError(e, stream);
      await stream.writeSSE({
        event: "error",
        data: e.message
      });
    } else {
      console.error(e);
    }
  } finally {
    stream.close();
  }
};
var contextStash = /* @__PURE__ */ new WeakMap();
var streamSSE = (c, cb, onError) => {
  const { readable, writable } = new TransformStream();
  const stream = new SSEStreamingApi(writable, readable);
  if (isOldBunVersion()) {
    c.req.raw.signal.addEventListener("abort", () => {
      if (!stream.closed) {
        stream.abort();
      }
    });
  }
  contextStash.set(stream.responseReadable, c);
  c.header("Transfer-Encoding", "chunked");
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  run(stream, cb, onError);
  return c.newResponse(stream.responseReadable);
};
export {
  SSEStreamingApi,
  streamSSE
};

```

---

# OUTRO - sse.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\hono@4.13.4@@@1\dist\cjs\helper\streaming\sse.js
**SHA:** 604ff89d49c7bc84
**Timestamp:** 2026-08-28T02:24:23.202338
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = async (stream, cb, onError) => {

### Ouro Bruto (primeiros 5000 chars)
```
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var sse_exports = {};
__export(sse_exports, {
  SSEStreamingApi: () => SSEStreamingApi,
  streamSSE: () => streamSSE
});
module.exports = __toCommonJS(sse_exports);
var import_html = require("../../utils/html");
var import_stream = require("../../utils/stream");
var import_utils = require("./utils");
class SSEStreamingApi extends import_stream.StreamingApi {
  constructor(writable, readable) {
    super(writable, readable);
  }
  async writeSSE(message) {
    const data = await (0, import_html.resolveCallback)(message.data, import_html.HtmlEscapedCallbackPhase.Stringify, false, {});
    const dataLines = data.split(/\r\n|\r|\n/).map((line) => {
      return `data: ${line}`;
    }).join("\n");
    for (const key of ["event", "id"]) {
      const value = message[key];
      if (value && /[\r\n]/.test(value)) {
        throw new Error(`${key} must not contain "\\r" or "\\n"`);
      }
    }
    const sseData = [
      message.event && `event: ${message.event}`,
      dataLines,
      message.id !== void 0 && `id: ${message.id}`,
      message.retry !== void 0 && `retry: ${message.retry}`
    ].filter(Boolean).join("\n") + "\n\n";
    await this.write(sseData);
  }
}
const run = async (stream, cb, onError) => {
  try {
    await cb(stream);
  } catch (e) {
    if (e instanceof Error && onError) {
      await onError(e, stream);
      await stream.writeSSE({
        event: "error",
        data: e.message
      });
    } else {
      console.error(e);
    }
  } finally {
    stream.close();
  }
};
const contextStash = /* @__PURE__ */ new WeakMap();
const streamSSE = (c, cb, onError) => {
  const { readable, writable } = new TransformStream();
  const stream = new SSEStreamingApi(writable, readable);
  if ((0, import_utils.isOldBunVersion)()) {
    c.req.raw.signal.addEventListener("abort", () => {
      if (!stream.closed) {
        stream.abort();
      }
    });
  }
  contextStash.set(stream.responseReadable, c);
  c.header("Transfer-Encoding", "chunked");
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  run(stream, cb, onError);
  return c.newResponse(stream.responseReadable);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SSEStreamingApi,
  streamSSE
});

```

---

# OUTRO - sse.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\hono@4.13.4@@@1\dist\helper\streaming\sse.js
**SHA:** e0165d0d3eb507de
**Timestamp:** 2026-08-28T02:24:27.471022
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var run = async (stream, cb, onError) => {

### Ouro Bruto (primeiros 5000 chars)
```
// src/helper/streaming/sse.ts
import { HtmlEscapedCallbackPhase, resolveCallback } from "../../utils/html.js";
import { StreamingApi } from "../../utils/stream.js";
import { isOldBunVersion } from "./utils.js";
var SSEStreamingApi = class extends StreamingApi {
  constructor(writable, readable) {
    super(writable, readable);
  }
  async writeSSE(message) {
    const data = await resolveCallback(message.data, HtmlEscapedCallbackPhase.Stringify, false, {});
    const dataLines = data.split(/\r\n|\r|\n/).map((line) => {
      return `data: ${line}`;
    }).join("\n");
    for (const key of ["event", "id"]) {
      const value = message[key];
      if (value && /[\r\n]/.test(value)) {
        throw new Error(`${key} must not contain "\\r" or "\\n"`);
      }
    }
    const sseData = [
      message.event && `event: ${message.event}`,
      dataLines,
      message.id !== void 0 && `id: ${message.id}`,
      message.retry !== void 0 && `retry: ${message.retry}`
    ].filter(Boolean).join("\n") + "\n\n";
    await this.write(sseData);
  }
};
var run = async (stream, cb, onError) => {
  try {
    await cb(stream);
  } catch (e) {
    if (e instanceof Error && onError) {
      await onError(e, stream);
      await stream.writeSSE({
        event: "error",
        data: e.message
      });
    } else {
      console.error(e);
    }
  } finally {
    stream.close();
  }
};
var contextStash = /* @__PURE__ */ new WeakMap();
var streamSSE = (c, cb, onError) => {
  const { readable, writable } = new TransformStream();
  const stream = new SSEStreamingApi(writable, readable);
  if (isOldBunVersion()) {
    c.req.raw.signal.addEventListener("abort", () => {
      if (!stream.closed) {
        stream.abort();
      }
    });
  }
  contextStash.set(stream.responseReadable, c);
  c.header("Transfer-Encoding", "chunked");
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  run(stream, cb, onError);
  return c.newResponse(stream.responseReadable);
};
export {
  SSEStreamingApi,
  streamSSE
};

```