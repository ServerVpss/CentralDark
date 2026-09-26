# COMANDO - canvas-server.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\canvas-server.test.mjs
**SHA:** 73c88723936c37ec
**Timestamp:** 2026-08-28T02:37:56.385353
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = namespace.buildCommentFixPrompt(
- leftFileStart: null,
- rightFileStart: { line: 5, offset: 1 },
- rightFileStart: { line: 1, offset: 1 },
- rightFileStart: { line: 5, offset: 1 },

### Gaps
- const missing = discoveryStubs({ installed: false, platform });
- const missing = await authed(canvas, "/api/connection", {

### Ouro Bruto (primeiros 5000 chars)
```
// Run with: node --experimental-vm-modules --test canvas-server.test.mjs
//
// Loads canvas-server.mjs under node:vm so node:child_process and node:fs can be
// replaced with stubs. That is the only way to drive AzureAuth discovery and
// token acquisition deterministically without a real azureauth install.
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import test from "node:test";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { SyntheticModule, SourceTextModule, createContext } from "node:vm";
import { PULL_REQUEST_REVIEW_VOTING_ENABLED } from "./ui/feature-flags.mjs";

const serverPath = new URL("./canvas-server.mjs", import.meta.url);

// canvas-server.mjs pulls in ./common.mjs, ./pull-request.mjs and ./work-item.mjs,
// so relative specifiers are linked recursively rather than stubbed.
async function loadCanvasServer({ execFileImpl, existsSyncImpl, readdirSyncImpl, homedirImpl, fetchImpl = fetch, platform = "linux", env = {} }) {
    const processStub = {
        platform,
        env,
        cwd: () => process.cwd(),
        nextTick: process.nextTick.bind(process),
    };
    const context = createContext({ Buffer, URL, URLSearchParams, TextDecoder, TextEncoder, fetch: fetchImpl, console, setTimeout, clearTimeout, Date, JSON, Math, Number, String, Object, Array, Promise, Error, process: processStub });
    const synthetic = (specifier) => {
        const exports = {
            "node:http": { createServer },
            "node:child_process": { execFile: execFileImpl, spawn: () => ({ unref() {} }) },
            "node:crypto": { createHash, randomBytes },
            "node:fs": {
                existsSync: existsSyncImpl,
                readFileSync,
                readdirSync: readdirSyncImpl,
                // Real implementations: the sign-in marker is an actual file, written
                // under a per-test temporary home rather than the developer's own.
                mkdirSync,
                writeFileSync,
                rmSync,
            },
            "node:os": { homedir: homedirImpl },
            "node:path": { dirname, extname, isAbsolute, join, relative, resolve },
            "node:url": { fileURLToPath },
            "node:util": { promisify },
            "@github/copilot-sdk/extension": {
                CanvasError: class CanvasError extends Error {
                    constructor(code, message) {
                        super(message);
                        this.code = code;
                    }
                },
            },
        }[specifier];
        if (!exports) return null;
        return new SyntheticModule(Object.keys(exports), function () {
            for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
        }, { context });
    };

    const cache = new Map();
    const initializeImportMeta = (meta, module) => { meta.url = module.identifier; };
    const loadRelative = async (href) => {
        if (cache.has(href)) return cache.get(href);
        const mod = new SourceTextModule(await readFile(new URL(href), "utf8"), { context, identifier: href, initializeImportMeta });
        cache.set(href, mod);
        await mod.link(linker);
        return mod;
    };
    async function linker(specifier, referencingModule) {
        const stub = synthetic(specifier);
        if (stub) return stub;
        if (specifier.startsWith(".")) return loadRelative(new URL(specifier, referencingModule.identifier).href);
        throw new Error(`Unexpected import: ${specifier}`);
    }

    const module = new SourceTextModule(await readFile(serverPath, "utf8"), { context, identifier: serverPath.href, initializeImportMeta });
    await module.link(linker);
    await module.evaluate();
    return module.namespace;
}

// A per-test home so the sign-in marker never touches the developer's own
// ~/.copilot. Mirrors the layout managedAzureAuthDiscovery expects for the
// requested platform, so the win32 branch is exercised from any host OS: on
// Windows AzureAuth lives under %LOCALAPPDATA%\Programs\AzureAuth and the
// executable is azureauth.exe, elsewhere it is ~/.azureauth/<version>/azureauth.
function discoveryStubs({ installed, platform = "linux", home = mkdtempSync(join(tmpdir(), "azure-devops-canvas-")) }) {
    const isWindows = platform === "win32";
    const localAppData = join(home, "AppData", "Local");
    const root = isWindows ? join(localAppData, "Programs", "AzureAuth") : join(home, ".azureauth");
    const executable = join(root, "0.9.6", isWindows ? "azureauth.exe" : "azureauth");
    return {
        home,
        root,
        
```