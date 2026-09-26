module.exports = [
"[project]/src/lib/serverLifecycle.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getServerLifecyclePhase",
    ()=>getServerLifecyclePhase,
    "markServerReady",
    ()=>markServerReady,
    "markServerStarting",
    ()=>markServerStarting,
    "markServerStopping",
    ()=>markServerStopping
]);
function getServerLifecyclePhase() {
    return globalThis.__omnirouteServerLifecycle ?? "starting";
}
function markServerStarting() {
    globalThis.__omnirouteServerLifecycle = "starting";
}
function markServerReady() {
    if (getServerLifecyclePhase() !== "stopping") {
        globalThis.__omnirouteServerLifecycle = "ready";
    }
}
function markServerStopping() {
    globalThis.__omnirouteServerLifecycle = "stopping";
}
}),
"[project]/src/lib/gracefulShutdown.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getActiveRequestCount",
    ()=>getActiveRequestCount,
    "initGracefulShutdown",
    ()=>initGracefulShutdown,
    "isDraining",
    ()=>isDraining,
    "trackRequest",
    ()=>trackRequest
]);
/**
 * Graceful Shutdown — E-2 Critical Fix
 *
 * Handles SIGTERM / SIGINT to drain in-flight requests before exit.
 * Critical for Docker containers and Kubernetes pods where hard kills
 * can drop active SSE streams.
 *
 * Usage:
 *   import { initGracefulShutdown } from "@/lib/gracefulShutdown";
 *   initGracefulShutdown();
 *
 * @module lib/gracefulShutdown
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serverLifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/serverLifecycle.ts [instrumentation] (ecmascript)");
;
/** Grace period before forced exit (default 30s, configurable) */ const SHUTDOWN_TIMEOUT_MS = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || "30000", 10);
function getShutdownState() {
    if (!globalThis.__omnirouteShutdown) {
        globalThis.__omnirouteShutdown = {
            init: false,
            shuttingDown: false,
            activeRequests: 0
        };
    }
    return globalThis.__omnirouteShutdown;
}
function isDraining() {
    return getShutdownState().shuttingDown;
}
function trackRequest() {
    const state = getShutdownState();
    state.activeRequests++;
    let called = false;
    return ()=>{
        if (!called) {
            called = true;
            state.activeRequests--;
        }
    };
}
function getActiveRequestCount() {
    return getShutdownState().activeRequests;
}
/**
 * Wait for all in-flight requests to complete, with timeout.
 */ async function waitForDrain() {
    const state = getShutdownState();
    const start = Date.now();
    const CHECK_INTERVAL_MS = 250;
    return new Promise((resolve)=>{
        const check = ()=>{
            if (state.activeRequests <= 0) {
                console.log("[Shutdown] All in-flight requests drained.");
                resolve();
                return;
            }
            if (Date.now() - start > SHUTDOWN_TIMEOUT_MS) {
                console.warn(`[Shutdown] Timeout after ${SHUTDOWN_TIMEOUT_MS}ms with ${state.activeRequests} active requests. Forcing exit.`);
                resolve();
                return;
            }
            console.log(`[Shutdown] Waiting for ${state.activeRequests} in-flight request(s)...`);
            setTimeout(check, CHECK_INTERVAL_MS);
        };
        check();
    });
}
/**
 * Perform cleanup: close DB connections, flush logs.
 */ async function cleanup() {
    try {
        const [{ closeAuditDb }, { closeDbInstance }, { flushSpendBatchWriter }, { closeLogRotation }] = await Promise.all([
            __turbopack_context__.A("[project]/open-sse/mcp-server/audit.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/db/core.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/spend/batchWriter.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/logRotation.ts [instrumentation] (ecmascript, async loader)")
        ]);
        const flushResult = await flushSpendBatchWriter();
        if (flushResult.flushedEntries > 0) {
            console.log(`[Shutdown] Spend batch writer flushed ${flushResult.flushedEntries} pending entry(ies).`);
        }
        if (closeAuditDb()) {
            console.log("[Shutdown] MCP audit database checkpointed and closed.");
        }
        if (closeDbInstance()) {
            console.log("[Shutdown] SQLite database checkpointed and closed.");
        }
        closeLogRotation();
        console.log("[Shutdown] Log rotation timer stopped.");
        // Tear down any persistent VNC login browser containers so they don't leak
        // past the server process. Best-effort; no-op if the feature was never used
        // or the docker CLI is unavailable.
        try {
            const { stopAllSessions, listSessions } = await __turbopack_context__.A("[project]/src/lib/vncSession/service.ts [instrumentation] (ecmascript, async loader)");
            if (listSessions().length > 0) {
                await stopAllSessions();
                console.log("[Shutdown] VNC login sessions stopped.");
            }
        } catch  {
        /* feature unused / docker missing */ }
    } catch (err) {
        console.error("[Shutdown] Error during cleanup:", err.message);
    }
}
function initGracefulShutdown() {
    const state = getShutdownState();
    if (state.init) return;
    state.init = true;
    const shutdown = async (signal)=>{
        if (state.shuttingDown) return;
        state.shuttingDown = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serverLifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markServerStopping"])();
        console.log(`\n[Shutdown] Received ${signal}. Draining ${state.activeRequests} request(s)...`);
        await waitForDrain();
        await cleanup();
        console.log("[Shutdown] Bye.");
        process.exit(0);
    };
    process.on("SIGTERM", ()=>shutdown("SIGTERM"));
    process.on("SIGINT", ()=>shutdown("SIGINT"));
    // #8045: on Windows, closing the console window delivers CTRL_CLOSE_EVENT, which
    // Node/libuv maps to a JS-visible "SIGHUP" event — without this listener, closing
    // the window never runs cleanup() (WAL checkpoint + closeDbInstance()), leaving
    // storage.sqlite's WAL un-checkpointed for the next launch.
    process.on("SIGHUP", ()=>shutdown("SIGHUP"));
    console.log("[Shutdown] Graceful shutdown handlers registered.");
}
}),
];

//# sourceMappingURL=src_lib_0mucbsi._.js.map