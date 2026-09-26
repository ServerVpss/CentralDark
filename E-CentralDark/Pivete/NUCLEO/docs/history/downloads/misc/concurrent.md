# OUTRO - concurrent.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\cjs\utils\concurrent.js
**SHA:** ae9c52f1cb95c161
**Timestamp:** 2026-08-26T19:32:09.947450
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: async (fn) => fn()
- const run = async (fn, promise, resolve) => {

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
var concurrent_exports = {};
__export(concurrent_exports, {
  createPool: () => createPool
});
module.exports = __toCommonJS(concurrent_exports);
const DEFAULT_CONCURRENCY = 1024;
const createPool = ({
  concurrency,
  interval
} = {}) => {
  concurrency ||= DEFAULT_CONCURRENCY;
  if (concurrency === Infinity) {
    return {
      run: async (fn) => fn()
    };
  }
  const pool = /* @__PURE__ */ new Set();
  const run = async (fn, promise, resolve) => {
    if (pool.size >= concurrency) {
      promise ||= new Promise((r) => resolve = r);
      setTimeout(() => run(fn, promise, resolve));
      return promise;
    }
    const marker = {};
    pool.add(marker);
    const result = await fn();
    if (interval) {
      setTimeout(() => pool.delete(marker), interval);
    } else {
      pool.delete(marker);
    }
    if (resolve) {
      resolve(result);
      return promise;
    } else {
      return result;
    }
  };
  return { run };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createPool
});

```

---

# OUTRO - concurrent.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\utils\concurrent.js
**SHA:** 825802ecd4733f59
**Timestamp:** 2026-08-26T19:32:15.518007
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: async (fn) => fn()
- const run = async (fn, promise, resolve) => {

### Ouro Bruto (primeiros 5000 chars)
```
// src/utils/concurrent.ts
var DEFAULT_CONCURRENCY = 1024;
var createPool = ({
  concurrency,
  interval
} = {}) => {
  concurrency ||= DEFAULT_CONCURRENCY;
  if (concurrency === Infinity) {
    return {
      run: async (fn) => fn()
    };
  }
  const pool = /* @__PURE__ */ new Set();
  const run = async (fn, promise, resolve) => {
    if (pool.size >= concurrency) {
      promise ||= new Promise((r) => resolve = r);
      setTimeout(() => run(fn, promise, resolve));
      return promise;
    }
    const marker = {};
    pool.add(marker);
    const result = await fn();
    if (interval) {
      setTimeout(() => pool.delete(marker), interval);
    } else {
      pool.delete(marker);
    }
    if (resolve) {
      resolve(result);
      return promise;
    } else {
      return result;
    }
  };
  return { run };
};
export {
  createPool
};

```