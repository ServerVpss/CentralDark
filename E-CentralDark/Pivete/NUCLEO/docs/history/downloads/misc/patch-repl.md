# OUTRO - patch-repl.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\tsx\dist\patch-repl.cjs
**SHA:** 33f5f67552700547
**Timestamp:** 2026-08-26T19:32:29.013961
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "use strict";var i=Object.defineProperty;var a=(r,t)=>i(r,"name",{value:t,configurable:!0});var n=require("node:repl"),u=require("esbuild");const f=a(r=>{const{eval:t}=r,c=a(async function(e,l,s,o){tr

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";var i=Object.defineProperty;var a=(r,t)=>i(r,"name",{value:t,configurable:!0});var n=require("node:repl"),u=require("esbuild");const f=a(r=>{const{eval:t}=r,c=a(async function(e,l,s,o){try{e=(await u.transform(e,{sourcefile:s,loader:"ts",tsconfigRaw:{compilerOptions:{preserveValueImports:!0}},define:{require:"global.require"}})).code}catch{}return t.call(this,e,l,s,o)},"preEval");r.eval=c},"patchEval"),{start:p}=n;n.start=function(){const r=Reflect.apply(p,this,arguments);return f(r),r};

```

---

# OUTRO - patch-repl.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\tsx\dist\patch-repl.mjs
**SHA:** 3850acac507aa554
**Timestamp:** 2026-08-26T19:32:29.038096
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var i=Object.defineProperty;var a=(t,r)=>i(t,"name",{value:r,configurable:!0});import s from"node:repl";import{transform as f}from"esbuild";const p=a(t=>{const{eval:r}=t,n=a(async function(e,c,o,l){tr

### Ouro Bruto (primeiros 5000 chars)
```
var i=Object.defineProperty;var a=(t,r)=>i(t,"name",{value:r,configurable:!0});import s from"node:repl";import{transform as f}from"esbuild";const p=a(t=>{const{eval:r}=t,n=a(async function(e,c,o,l){try{e=(await f(e,{sourcefile:o,loader:"ts",tsconfigRaw:{compilerOptions:{preserveValueImports:!0}},define:{require:"global.require"}})).code}catch{}return r.call(this,e,c,o,l)},"preEval");t.eval=n},"patchEval"),{start:u}=s;s.start=function(){const t=Reflect.apply(u,this,arguments);return p(t),t};

```