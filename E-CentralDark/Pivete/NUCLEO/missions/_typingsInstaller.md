# MISSAO - _typingsInstaller.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\typescript\lib\_typingsInstaller.js
**SHA:** 62a69c574365f1c8
**Timestamp:** 2026-08-26T19:32:31.701875
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

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

// src/typingsInstaller/nodeTypingsInstaller.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/typescript/typescript.ts
var typescript_exports = {};
__reExport(typescript_exports, require("./typescript.js"));

// src/typingsInstaller/nodeTypingsInstaller.ts
var FileLog = class {
  constructor(logFile) {
    this.logFile = logFile;
    this.isEnabled = () => {
      return typeof this.logFile === "string";
    };
    this.writeLine = (text) => {
      if (typeof this.logFile !== "string") return;
      try {
        fs.appendFileSync(this.logFile, `[${typescript_exports.server.nowString()}] ${text}${typescript_exports.sys.newLine}`);
      } catch {
        this.logFile = void 0;
      }
    };
  }
};
function getDefaultNPMLocation(processName, validateDefaultNpmLocation2, host) {
  if (path.basename(processName).indexOf("node") === 0) {
    const npmPath = path.join(path.dirname(process.argv[0]), "npm");
    if (!validateDefaultNpmLocation2) {
      return npmPath;
    }
    if (host.fileExists(npmPath)) {
      return `"${npmPath}"`;
    }
  }
  return "npm";
}
function loadTypesRegistryFile(typesRegistryFilePath, host, log2) {
  if (!host.fileExists(typesRegistryFilePath)) {
    if (log2.isEnabled()) {
      log2.writeLine(`Types registry file '${typesRegistryFilePath}' does not exist`);
    }
    return /* @__PURE__ */ new Map();
  }
  try {
    const content = JSON.parse(host.readFile(typesRegistryFilePath));
    return new Map(Object.entries(content.entries));
  } catch (e) {
    if (log2.isEnabled()) {
      log2.writeLine(`Error when loading types registry file '${typesRegistryFilePath}': ${e.message}, ${e.stack}`);
    }
    return /* @__PURE__ */ new Map();
  }
}
var typesRegistryPackageName = "types-registry";
function getTypesRegistryFileLocation(globalTypingsCacheLocation2) {
  return (0, typescript_exports.combinePaths)((0, typescript_exports.normalizeSlashes)(globalTypingsCacheLocation2), `node_modules/${typesRegistryPackageName}/index.json`);
}
var NodeTypingsInstaller = class extends typescript_exports.server.typingsInstaller.TypingsInstaller {
  constructor(globalTypingsCacheLocation2, typingSafeListLocation2, typesMapLocation2, npmLocation2, validateDefaultNpmLocation2, throttleLimit, log2) {
    const libDirectory = (0, typescript_exports.getDirectoryPath)((0, typescript_exports.normalizePath)(typescript_exports.sys.getExecutingFilePath()));
    super(
      typescript_exports.sys,
      globalTypingsCacheLocation2,
      typingSafeListLocation2 ? (0, typescript_exports.toPath)(typingSafeListLocation2, "", (0, typescript_exports.createGetCanonicalFileName)(typescript_exports.sys.useCaseSensitiveFileNames)) : (0, typescript_exports.toPath)("typingSafeList.json", libDirectory, (0, typescript_exports.createGetCanon
```