# MISSAO - _tsserver.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\typescript\lib\_tsserver.js
**SHA:** 0efcc88cdf0593cc
**Timestamp:** 2026-08-26T19:32:31.831196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let pathStart = args[initialIndex];

### Ouro Bruto (primeiros 5000 chars)
```
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */


"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/tsserver/server.ts
var import_os2 = __toESM(require("os"));

// src/typescript/typescript.ts
var typescript_exports = {};
__reExport(typescript_exports, require("./typescript.js"));

// src/tsserver/nodeServer.ts
var import_child_process = __toESM(require("child_process"));
var import_fs = __toESM(require("fs"));
var import_net = __toESM(require("net"));
var import_os = __toESM(require("os"));
var import_readline = __toESM(require("readline"));

// src/tsserver/common.ts
function getLogLevel(level) {
  if (level) {
    const l = level.toLowerCase();
    for (const name in typescript_exports.server.LogLevel) {
      if (isNaN(+name) && l === name.toLowerCase()) {
        return typescript_exports.server.LogLevel[name];
      }
    }
  }
  return void 0;
}

// src/tsserver/nodeServer.ts
function parseLoggingEnvironmentString(logEnvStr) {
  if (!logEnvStr) {
    return {};
  }
  const logEnv = { logToFile: true };
  const args = logEnvStr.split(" ");
  const len = args.length - 1;
  for (let i = 0; i < len; i += 2) {
    const option = args[i];
    const { value, extraPartCounter } = getEntireValue(i + 1);
    i += extraPartCounter;
    if (option && value) {
      switch (option) {
        case "-file":
          logEnv.file = value;
          break;
        case "-level":
          const level = getLogLevel(value);
          logEnv.detailLevel = level !== void 0 ? level : typescript_exports.server.LogLevel.normal;
          break;
        case "-traceToConsole":
          logEnv.traceToConsole = value.toLowerCase() === "true";
          break;
        case "-logToFile":
          logEnv.logToFile = value.toLowerCase() === "true";
          break;
      }
    }
  }
  return logEnv;
  function getEntireValue(initialIndex) {
    let pathStart = args[initialIndex];
    let extraPartCounter = 0;
    if (pathStart.charCodeAt(0) === typescript_exports.CharacterCodes.doubleQuote && pathStart.charCodeAt(pathStart.length - 1) !== typescript_exports.CharacterCodes.doubleQuote) {
      for (let i = initialIndex + 1; i < args.length; i++) {
        pathStart += " ";
        pathStart += args[i];
        extraPartCounter++;
        if (pathStart.charCodeAt(pathStart.length - 1) === typescript_exports.CharacterCodes.doubleQuote) break;
      }
    }
    return { value: (0, typescript_exports.stripQuotes)(pathStart), extraPartCounter };
  }
}
function parseServerMode() {
  const mode = typescript_exports.server.findArgument("--serverMode");
  if (!mode) return void 0;
  switch (mode.toLowerCase()) {
    case "semantic":
      return typescript_exports.LanguageServiceMode.Semantic;
    case "partialsemantic":
      return typescript_exports.LanguageServiceMode.PartialSemantic;
    case "syntactic":
      return typescript_exports.LanguageServiceMode.Syntactic;
    default:
      return mode;
  }
}
function initializeNodeSys
```