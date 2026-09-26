module.exports = [
"[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildNativeTlsClientOptions",
    ()=>buildNativeTlsClientOptions,
    "resolveTlsClientDownloadDir",
    ()=>resolveTlsClientDownloadDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [middleware] (ecmascript)");
;
;
function resolveTlsClientDownloadDir() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "tls-client", "bin");
}
function buildNativeTlsClientOptions() {
    return {
        runtimeMode: "native",
        downloadDir: resolveTlsClientDownloadDir()
    };
}
}),
"[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveTlsClientProxyUrl",
    ()=>resolveTlsClientProxyUrl
]);
function resolveTlsClientProxyUrl(targetUrl, perCall, resolveProxyForRequest) {
    if (perCall && perCall.length > 0) return perCall;
    let info;
    try {
        info = resolveProxyForRequest(targetUrl);
    } catch (err) {
        throw new Error(`[TlsClient] Proxy resolution failed for ${targetUrl}; refusing direct connection (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
    }
    return info && info.proxyUrl ? info.proxyUrl : undefined;
}
}),
"[project]/open-sse/services/claudeTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CLAUDE_TLS_BROWSER_MAJOR_VERSION",
    ()=>CLAUDE_TLS_BROWSER_MAJOR_VERSION,
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "looksLikeSse",
    ()=>looksLikeSse,
    "tlsFetchClaude",
    ()=>tlsFetchClaude,
    "tlsFetchStreaming",
    ()=>tlsFetchStreaming
]);
/**
 * Browser-TLS-impersonating HTTP client for claude.ai.
 *
 * Why this exists: Claude's Cloudflare config pins `cf_clearance` to the
 * client's TLS fingerprint (JA3/JA4) + HTTP/2 SETTINGS frame ordering.
 * Node's Undici fetch presents an obvious "not a browser" handshake and
 * gets challenged with `cf-mitigated: challenge` — even with all the right
 * cookies. This module wraps `tls-client-node` (native shared library
 * built from bogdanfinn/tls-client) to send a Chrome handshake instead.
 *
 * The first call lazily starts the managed sidecar; subsequent calls reuse
 * a singleton TLSClient. Process exit hooks stop the sidecar cleanly.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const CLAUDE_TLS_BROWSER_MAJOR_VERSION = "146";
const CLAUDE_PROFILE = `chrome_${CLAUDE_TLS_BROWSER_MAJOR_VERSION}`;
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_CLAUDE_TLS_TIMEOUT_MS || "", 10) || 60_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_CLAUDE_TLS_GRACE_MS || "", 10) || 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (!clientPromise) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://claude.ai", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchClaude(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: CLAUDE_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        isByteResponse: options.byteResponse === true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order. Without this
        // line, every chatgpt-web call egresses with the bare host IP regardless
        // of dashboard proxy config — see #2022.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
// Cap for the bounded fallback read of a non-SSE error body straight from the
// streaming temp file (mirrors the 2048-byte cap executors/claude-web.ts
// already applies when reading error bodies) — avoids buffering an unbounded
// error page into memory. See #7134.
const MAX_ERROR_BODY_BYTES = 16 * 1024;
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "cgpt-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.sse`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte. tls-client-node
    // creates the output file when the request starts, but the file can be
    // empty for a brief window before the first body chunk lands — peeking
    // during that window would return "" and misclassify the response as
    // non-SSE, dropping us into the buffered-wait branch and silently turning
    // a streaming request into a buffered one. Waiting for content avoids
    // that race; if the request actually fails before producing any bytes,
    // the timeout falls through to the requestPromise drain below (returning
    // the real upstream status).
    // Do not impose a second, shorter first-byte timeout here. Opus-class
    // models can legitimately take more than five seconds before emitting the
    // first SSE event. `requestPromise` is already guarded by the configured
    // wire timeout plus the JS hard-timeout grace, so waiting until either the
    // file has data or that promise settles remains bounded.
    const ready = await waitForContent(path, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek the first bytes to decide whether this looks like SSE. Anything
    // that doesn't positively look like SSE (JSON `{...}`, HTML `<...>`, plain
    // text rate-limit messages, Cloudflare challenge pages, etc.) gets surfaced
    // as a non-streaming response so the executor sees the real upstream status
    // and body — otherwise non-2xx error pages get silently treated as 200 OK
    // and the SSE parser produces an empty completion.
    const peek = await readFirstBytes(path, 256);
    if (!looksLikeSse(peek)) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        // tls-client-node's `streamOutputPath` mode writes the response body to
        // the temp file chunk-by-chunk and does NOT also populate the resolved
        // response's in-memory `body` field (confirmed against
        // node_modules/tls-client-node/dist/response.js) — so for every non-SSE,
        // non-2xx claude-web response (400/403/429/500 with a real JSON/HTML
        // error), `r.body` is empty even though the real bytes are sitting in
        // `path` (we just peeked them above). Prefer `r.body` when it IS
        // populated (some native-client modes do fill it in); otherwise fall
        // back to a bounded read of the temp file so the real upstream error
        // detail reaches the caller instead of being silently discarded. #7134
        const text = r.body || await readFirstBytes(path, MAX_ERROR_BODY_BYTES).catch(()=>"");
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text,
            body: null
        };
    }
    // Looks like SSE — start tailing. SSE bodies in practice are always 2xx;
    // tls-client-node doesn't expose response status separately from full-body
    // completion, so we report 200 and let the SSE parser consume the stream.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed) return false;
    if (trimmed.startsWith(":")) return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    const dir = path.substring(0, path.lastIndexOf("/"));
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the SSE
 * heuristic to give a useful answer.
 */ async function waitForContent(path, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    while(true){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        if (text.includes(eofSymbol)) {
                            const cutAt = text.indexOf(eofSymbol) + eofSymbol.length;
                            controller.enqueue(new Uint8Array(chunk.subarray(0, cutAt)));
                            break;
                        }
                        controller.enqueue(new Uint8Array(chunk));
                    } else if (finished) {
                        // No more data and request completed. If the request rejected,
                        // surface the error so the consumer doesn't think the stream
                        // ended cleanly.
                        if (upstreamError) {
                            controller.error(upstreamError);
                            errored = true;
                        }
                        break;
                    } else {
                        await sleep(25);
                    }
                }
            } catch (err) {
                controller.error(err);
                errored = true;
            } finally{
                if (signal) signal.removeEventListener("abort", onAbort);
                await fd.close().catch(()=>{});
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
                const dir = path.substring(0, path.lastIndexOf("/"));
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
                if (!errored) controller.close();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_1xsdjy5._.js.map