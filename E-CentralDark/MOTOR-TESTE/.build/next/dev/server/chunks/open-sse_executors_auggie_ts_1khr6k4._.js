module.exports = [
"[project]/open-sse/executors/auggie.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AuggieExecutor",
    ()=>AuggieExecutor,
    "__resetAuggieModels",
    ()=>__resetAuggieModels,
    "buildAuggiePrompt",
    ()=>buildAuggiePrompt,
    "buildAuggieSpawnOptions",
    ()=>buildAuggieSpawnOptions,
    "checkAuggieCliVersion",
    ()=>checkAuggieCliVersion,
    "initAuggieModels",
    ()=>initAuggieModels,
    "resolveAuggieBin",
    ()=>resolveAuggieBin,
    "resolveAuggieModel",
    ()=>resolveAuggieModel
]);
/**
 * AuggieExecutor — routes completions through the local Augment CLI ("auggie")
 * binary via a one-shot stdin/stdout text pipe (no JSON-RPC / ACP protocol).
 *
 * Flow:
 *   1. Flatten the OpenAI-shaped `messages[]` into a single prompt string.
 *   2. Spawn `auggie --print --quiet --model <model>` and pipe the prompt on stdin.
 *   3. Relay stdout chunks as OpenAI-compatible SSE deltas (stream=true) or
 *      buffer them into a single chat.completion JSON body (stream=false).
 *   4. Kill the subprocess on abort / stream close.
 *
 * Authentication:
 *   None. Auggie delegates auth entirely to the user's local `auggie login`
 *   session — OmniRoute never sees or stores credentials for this provider.
 *   The connection is registered `noAuth: true` and `refreshCredentials()` is
 *   a no-op (nothing to refresh).
 *
 * Binary discovery:
 *   1. AUGGIE_BIN / CLI_AUGGIE_BIN env var (absolute path override)
 *   2. PATH lookup ("auggie" / "auggie.cmd")
 *   3. %LOCALAPPDATA%\auggie\bin\auggie.exe  (Windows installer)
 *   4. ~/.local/share/auggie/bin/auggie      (Linux installer)
 *   5. ~/.auggie/bin/auggie                  (alternate installer layout)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/auggie/index.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const AUGGIE_URL = "auggie://cli/stdio";
// ─── Model allowlist (argument-injection defense) ─────────────────────────────
// The `model` value is forwarded straight into the `auggie` argv, so it is an
// untrusted-input sink. We only ever pass a model that is declared in the
// registry entry — this closes flag-smuggling (a `model` starting with "-" would
// otherwise be parsed by auggie as an option) and unknown-model passthrough.
//
// The static registry (shipped with the code) is checked first.  On first use
// the executor also spawns `auggie model list` at runtime and merges any IDs it
// finds — this lets the allowlist stay current when auggie adds or renames
// models without a code update.
const AUGGIE_MODEL_ALLOWLIST = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["auggieProvider"].models.map((m)=>m.id));
const DEFAULT_AUGGIE_MODEL = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$auggie$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["auggieProvider"].models[0]?.id ?? "claude-sonnet-4.6";
// ─── Model alias map (backward compat for saved combos) ─────────────────────
// Old model IDs from before the v0.32.0 registry update; each maps to the
// equivalent v0.32.0 ID so existing combos continue to work after the rename.
const AUGGIE_MODEL_ALIASES = new Map([
    // Claude
    [
        "claude-sonnet-4.6",
        "sonnet4.6"
    ],
    [
        "claude-sonnet-4.6-thinking",
        "sonnet4.6"
    ],
    [
        "claude-opus-4.6",
        "opus4.6"
    ],
    [
        "claude-haiku-4.5",
        "haiku4.5"
    ],
    // Gemini
    [
        "gemini-3.1-pro",
        "gemini-3.1-pro-preview"
    ],
    [
        "gemini-3.0-flash",
        "gemini-3.1-pro-preview"
    ],
    // GPT-5.x (high/medium split was synthetic — v0.32.0 has a single ID per version)
    [
        "gpt-5.5-high",
        "gpt5.5"
    ],
    [
        "gpt-5.5-medium",
        "gpt5.5"
    ],
    [
        "gpt-5.4-high",
        "gpt5.4"
    ],
    [
        "gpt-5.4-medium",
        "gpt5.4"
    ]
]);
/**
 * Live model cache populated by `initAuggieModels()`.
 * - `null`  = not yet attempted
 * - `Set`   = successfully fetched IDs (possibly empty)
 */ let liveModelSet = null;
async function initAuggieModels(signal, timeoutMs = 8000) {
    if (liveModelSet !== null) return;
    let bin;
    try {
        bin = resolveAuggieBin();
    } catch  {
        liveModelSet = new Set();
        return;
    }
    const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(bin, [
        "model",
        "list"
    ], {
        env: process.env,
        stdio: [
            "ignore",
            "pipe",
            "pipe"
        ],
        shell: false,
        windowsHide: true
    });
    const fragments = [];
    child.stdout.on("data", (d)=>fragments.push(d.toString("utf8")));
    let settled = false;
    const settle = (result)=>{
        if (settled) return;
        settled = true;
        liveModelSet = result;
    };
    const timer = setTimeout(()=>{
        if (!child.killed) child.kill("SIGKILL");
        settle(new Set());
    }, timeoutMs);
    const onAbort = ()=>{
        if (!child.killed) child.kill("SIGKILL");
        clearTimeout(timer);
        settle(new Set());
    };
    if (signal) {
        if (signal.aborted) {
            clearTimeout(timer);
            settle(new Set());
            return;
        }
        signal.addEventListener("abort", onAbort, {
            once: true
        });
    }
    try {
        const code = await new Promise((resolve, reject)=>{
            child.on("close", resolve);
            child.on("error", (e)=>reject(e));
        });
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        if (code !== 0) {
            settle(new Set());
            return;
        }
        const ids = new Set();
        for (const line of fragments.join("").split("\n")){
            const m = line.match(/\[([^\]]+)\]/);
            if (m) ids.add(m[1]);
        }
        settle(ids.size > 0 ? ids : new Set());
    } catch  {
        clearTimeout(timer);
        settle(new Set());
        signal?.removeEventListener("abort", onAbort);
    }
}
/**
 * This workspace compiles with `strictNullChecks: false`, where a boolean-literal
 * discriminant narrows the positive branch but not the negative one — so `!r.ok` alone
 * leaves `r` as the full union and reading `.error` fails. An explicit type predicate
 * narrows under those settings without retagging the union (which is public API here:
 * `resolveAuggieModel` is exported and its tests deep-equal the `{ ok: true, ... }` shape).
 */ function isAuggieModelFailure(resolution) {
    return !resolution.ok;
}
function resolveAuggieModel(model) {
    const requested = typeof model === "string" ? model.trim() : "";
    if (!requested) return {
        ok: true,
        model: DEFAULT_AUGGIE_MODEL
    };
    if (requested.startsWith("-")) {
        return {
            ok: false,
            error: `Invalid Auggie model "${requested}": model must not start with "-".`
        };
    }
    // Backward-compat alias: resolve old model IDs → v0.32.0 equivalents.
    // This lets saved combos referencing the old names keep working.
    const requestedAlias = AUGGIE_MODEL_ALIASES.get(requested);
    if (requestedAlias) return {
        ok: true,
        model: requestedAlias
    };
    // Static registry — always authoritative for the shipped set.
    if (AUGGIE_MODEL_ALLOWLIST.has(requested)) return {
        ok: true,
        model: requested
    };
    // Live-discovered models (if loaded) extend the static list.
    if (liveModelSet?.has(requested)) return {
        ok: true,
        model: requested
    };
    const known = [
        ...AUGGIE_MODEL_ALLOWLIST
    ];
    if (liveModelSet) known.push(...liveModelSet);
    return {
        ok: false,
        error: `Unknown Auggie model "${requested}". Supported models: ${known.join(", ")}.`
    };
}
/**
 * Build the auggie argv. `model` MUST already be allowlist-validated via
 * resolveAuggieModel(). The trailing `--` marks the end of options so no
 * later positional value can be reinterpreted as a flag.
 */ function buildAuggieArgs(model) {
    return [
        "--print",
        "--quiet",
        "--model",
        model,
        "--"
    ];
}
function buildAuggieSpawnOptions(stdio) {
    return {
        env: process.env,
        stdio,
        shell: process.platform === "win32"
    };
}
function resolveAuggieBin() {
    // 1. Explicit override
    const envBin = (process.env.AUGGIE_BIN || process.env.CLI_AUGGIE_BIN || "").trim();
    if (envBin) return envBin;
    const isWin = process.platform === "win32";
    // 2. Windows installer default: %LOCALAPPDATA%\auggie\bin\auggie.exe
    if ("TURBOPACK compile-time truthy", 1) {
        const localAppData = process.env.LOCALAPPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), "AppData", "Local");
        const winPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(localAppData, "auggie", "bin", "auggie.exe");
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(winPath)) return winPath;
    }
    // 3. Linux/macOS installer paths
    const home = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
    for (const candidate of [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(home, ".local", "share", "auggie", "bin", "auggie"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(home, ".auggie", "bin", "auggie")
    ]){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(candidate)) return candidate;
    }
    // Fallback — rely on PATH
    return ("TURBOPACK compile-time truthy", 1) ? "auggie.cmd" : "TURBOPACK unreachable";
}
function buildAuggiePrompt(messages) {
    const lines = [];
    for (const m of messages){
        const role = String(m.role || "user");
        let text = "";
        if (typeof m.content === "string") {
            text = m.content;
        } else if (Array.isArray(m.content)) {
            for (const p of m.content){
                if (p && typeof p === "object" && p.type === "text") {
                    text += String(p.text || "");
                }
            }
        }
        if (!text.trim()) continue;
        if (role === "system") {
            lines.push(`[System]\n${text}`);
        } else if (role === "assistant") {
            lines.push(`[Assistant]\n${text}`);
        } else {
            lines.push(`[User]\n${text}`);
        }
    }
    return lines.join("\n\n") || "(empty)";
}
function isEnoentLike(message) {
    return message.includes("ENOENT") || message.includes("not found");
}
function checkAuggieCliVersion(timeoutMs = 5000) {
    const bin = resolveAuggieBin();
    return new Promise((resolve)=>{
        let settled = false;
        const settle = (result)=>{
            if (settled) return;
            settled = true;
            resolve(result);
        };
        let child;
        try {
            // No `shell` option — fixed argv, no cmd.exe interpretation.
            child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(bin, [
                "--version"
            ], {
                env: process.env,
                stdio: [
                    "ignore",
                    "pipe",
                    "pipe"
                ]
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            settle({
                ok: false,
                error: isEnoentLike(message) ? cliNotFoundMessage(bin) : message
            });
            return;
        }
        const timer = setTimeout(()=>{
            if (!child.killed) child.kill("SIGKILL");
            settle({
                ok: false,
                error: "Auggie CLI version check timed out"
            });
        }, timeoutMs);
        let stdout = "";
        child.stdout?.on("data", (chunk)=>{
            stdout += chunk.toString("utf8");
        });
        child.on("error", (err)=>{
            clearTimeout(timer);
            const message = err?.message || String(err);
            settle({
                ok: false,
                error: isEnoentLike(message) ? cliNotFoundMessage(bin) : message
            });
        });
        child.on("close", (code)=>{
            clearTimeout(timer);
            if (code === 0 && stdout.trim()) {
                settle({
                    ok: true,
                    version: stdout.trim().slice(0, 200)
                });
            } else {
                settle({
                    ok: false,
                    error: `Auggie CLI exited with code ${code}`
                });
            }
        });
    });
}
function cliNotFoundMessage(bin) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI not found: ${bin}. Install it and run "auggie login", or set AUGGIE_BIN to an absolute path.`);
}
class AuggieExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    constructor(){
        super("auggie", {
            id: "auggie",
            baseUrl: ""
        });
    }
    buildUrl() {
        return AUGGIE_URL;
    }
    buildHeaders() {
        return {};
    }
    transformRequest() {
        return null;
    }
    /** No-op — auggie has no OmniRoute-managed credentials to refresh. */ async refreshCredentials(_credentials) {
        return null;
    }
    async execute({ model, body, stream, signal, log }) {
        const b = body ?? {};
        const messages = Array.isArray(b.messages) ? b.messages : [];
        const promptText = buildAuggiePrompt(messages);
        const auggieBin = resolveAuggieBin();
        const wantsStream = stream !== false;
        // On first execution, try to discover model IDs the local auggie recognises.
        // Best-effort: missing/inactive CLI falls through to the static list.
        await initAuggieModels(signal);
        // Argument-injection defense: never forward an unvalidated model into the argv.
        const modelResolution = resolveAuggieModel(model);
        if (isAuggieModelFailure(modelResolution)) {
            const response = wantsStream ? buildAuggieSseError(modelResolution.error) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["errorResponse"])(400, modelResolution.error);
            return {
                response,
                url: AUGGIE_URL,
                headers: {},
                transformedBody: {
                    error: true
                }
            };
        }
        const safeModel = modelResolution.model;
        log?.info?.("AUGGIE", `auggie --print → model=${safeModel}, bin=${auggieBin}, stream=${wantsStream}`);
        const response = wantsStream ? this.runStreaming(auggieBin, safeModel, promptText, signal, log) : await this.runNonStreaming(auggieBin, safeModel, promptText, signal, log);
        return {
            response,
            url: AUGGIE_URL,
            headers: {},
            transformedBody: {
                model: safeModel,
                promptLength: promptText.length
            }
        };
    }
    spawnAuggie(auggieBin, model, promptText) {
        // `shell: true` on win32 only (see buildAuggieSpawnOptions() for why) — argv
        // stays a fixed literal array; `model` is already allowlist-validated by
        // resolveAuggieModel() before reaching here, so no argument-injection surface
        // is reopened by shell interpretation.
        const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(auggieBin, buildAuggieArgs(model), buildAuggieSpawnOptions([
            "pipe",
            "pipe",
            "pipe"
        ]));
        // EPIPE from a fast-exiting CLI arrives ASYNCHRONOUSLY as an 'error' event on
        // stdin (not a sync throw), so the try/catch below cannot swallow it — without
        // this handler the unhandled stream error crashes the process instead of
        // letting the child's own 'error'/'close' handlers surface the failure.
        child.stdin.on("error", ()=>{});
        try {
            child.stdin.write(promptText);
            child.stdin.end();
        } catch  {
        /* ignore write errors — 'error'/'close' handlers surface the failure */ }
        return child;
    }
    runStreaming(auggieBin, model, promptText, signal, log) {
        const responseId = `chatcmpl-auggie-${Date.now()}`;
        const created = Math.floor(Date.now() / 1000);
        const sseStream = new ReadableStream({
            start (controller) {
                const enc = new TextEncoder();
                const emit = (data)=>controller.enqueue(enc.encode(data));
                let closed = false;
                let roleEmitted = false;
                let finished = false;
                const finish = ()=>{
                    if (finished) return;
                    finished = true;
                    if (!closed) {
                        closed = true;
                        try {
                            controller.close();
                        } catch  {
                        /* already closed */ }
                    }
                };
                const emitDelta = (delta)=>{
                    if (!delta) return;
                    if (!roleEmitted) {
                        emit(`data: ${JSON.stringify({
                            id: responseId,
                            object: "chat.completion.chunk",
                            created,
                            model,
                            choices: [
                                {
                                    index: 0,
                                    delta: {
                                        role: "assistant",
                                        content: ""
                                    },
                                    finish_reason: null
                                }
                            ]
                        })}\n\n`);
                        roleEmitted = true;
                    }
                    emit(`data: ${JSON.stringify({
                        id: responseId,
                        object: "chat.completion.chunk",
                        created,
                        model,
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    content: delta
                                },
                                finish_reason: null
                            }
                        ]
                    })}\n\n`);
                };
                const emitError = (message)=>{
                    emit(`data: ${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(502, message))}\n\n`);
                    emit("data: [DONE]\n\n");
                    finish();
                };
                const emitStop = ()=>{
                    emit(`data: ${JSON.stringify({
                        id: responseId,
                        object: "chat.completion.chunk",
                        created,
                        model,
                        choices: [
                            {
                                index: 0,
                                delta: {},
                                finish_reason: "stop"
                            }
                        ]
                    })}\n\n`);
                    emit("data: [DONE]\n\n");
                    finish();
                };
                let child;
                try {
                    // `shell: true` on win32 only (see buildAuggieSpawnOptions() for why).
                    // `model` is already allowlist-validated upstream, so shell interpretation
                    // does not reopen argument-injection.
                    child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(auggieBin, buildAuggieArgs(model), buildAuggieSpawnOptions([
                        "pipe",
                        "pipe",
                        "pipe"
                    ]));
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    emitError(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message));
                    return;
                }
                // Async EPIPE lands as an 'error' event on stdin, not a sync throw (see
                // spawnAuggie) — handle it so a fast-exiting CLI can't crash the stream.
                child.stdin.on("error", ()=>{});
                try {
                    child.stdin.write(promptText);
                    child.stdin.end();
                } catch  {
                /* ignore — error/close handlers below surface failures */ }
                if (signal) {
                    signal.addEventListener("abort", ()=>{
                        if (!child.killed) child.kill("SIGTERM");
                        finish();
                    });
                }
                child.on("error", (err)=>{
                    const message = err?.message || String(err);
                    emitError(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message));
                });
                let stderrTail = "";
                child.stdout?.on("data", (chunk)=>{
                    emitDelta(chunk.toString("utf8"));
                });
                child.stderr?.on("data", (chunk)=>{
                    stderrTail = (stderrTail + chunk.toString("utf8")).slice(-2000);
                    log?.debug?.("AUGGIE", `stderr: ${chunk.toString("utf8").slice(0, 200)}`);
                });
                child.on("close", (code)=>{
                    if (finished) return;
                    if (code !== 0) {
                        emitError((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI exited with code ${code}${stderrTail ? `: ${stderrTail}` : ""}`));
                        return;
                    }
                    emitStop();
                });
            },
            cancel () {
            // Stream cancelled by the consumer — nothing extra to clean up here;
            // the abort-signal listener above (if provided) handles process kill.
            }
        });
        return new Response(sseStream, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
            }
        });
    }
    runNonStreaming(auggieBin, model, promptText, signal, log) {
        return new Promise((resolve)=>{
            let child;
            try {
                child = this.spawnAuggie(auggieBin, model, promptText);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                resolve(buildAuggieErrorResponse(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message)));
                return;
            }
            let stdout = "";
            let stderrTail = "";
            let settled = false;
            const settle = (response)=>{
                if (settled) return;
                settled = true;
                resolve(response);
            };
            if (signal) {
                signal.addEventListener("abort", ()=>{
                    if (!child.killed) child.kill("SIGTERM");
                    settle(buildAuggieErrorResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])("Auggie CLI request aborted")));
                });
            }
            child.stdout?.on("data", (chunk)=>{
                stdout += chunk.toString("utf8");
            });
            child.stderr?.on("data", (chunk)=>{
                stderrTail = (stderrTail + chunk.toString("utf8")).slice(-2000);
                log?.debug?.("AUGGIE", `stderr: ${chunk.toString("utf8").slice(0, 200)}`);
            });
            child.on("error", (err)=>{
                const message = err?.message || String(err);
                settle(buildAuggieErrorResponse(isEnoentLike(message) ? cliNotFoundMessage(auggieBin) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message)));
            });
            child.on("close", (code)=>{
                if (code !== 0) {
                    settle(buildAuggieErrorResponse((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Auggie CLI exited with code ${code}${stderrTail ? `: ${stderrTail}` : ""}`)));
                    return;
                }
                settle(buildChatCompletionResponse(model, promptText, stdout));
            });
        });
    }
}
function buildChatCompletionResponse(model, promptText, content) {
    const trimmed = content.trim();
    const body = {
        id: `chatcmpl-auggie-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: trimmed
                },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: Math.ceil(promptText.length / 4),
            completion_tokens: Math.ceil(trimmed.length / 4),
            total_tokens: Math.ceil((promptText.length + trimmed.length) / 4),
            estimated: true
        }
    };
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
function buildAuggieErrorResponse(message) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["errorResponse"])(502, message);
}
/**
 * Build a one-shot SSE error Response (single sanitized error event + [DONE]).
 * Used for pre-spawn rejections on the streaming path (e.g. an invalid model)
 * where no subprocess is ever started.
 */ function buildAuggieSseError(message) {
    const enc = new TextEncoder();
    const sseStream = new ReadableStream({
        start (controller) {
            controller.enqueue(enc.encode(`data: ${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildErrorBody"])(400, message))}\n\n`));
            controller.enqueue(enc.encode("data: [DONE]\n\n"));
            controller.close();
        }
    });
    return new Response(sseStream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        }
    });
}
function __resetAuggieModels() {
    liveModelSet = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_executors_auggie_ts_1khr6k4._.js.map