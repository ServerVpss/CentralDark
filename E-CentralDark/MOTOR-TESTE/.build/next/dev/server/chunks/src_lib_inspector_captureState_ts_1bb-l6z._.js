module.exports = [
"[project]/src/lib/inspector/captureState.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Runtime state for Traffic Inspector capture modes.
 *
 * Held in module-level variables (process-singleton). Survives across route
 * handler calls for the lifetime of the process.
 *
 * Exported mutation functions are the single write path so all route handlers
 * stay stateless.
 */ __turbopack_context__.s([
    "clearSystemProxy",
    ()=>clearSystemProxy,
    "getHttpProxyHandle",
    ()=>getHttpProxyHandle,
    "getSystemProxyState",
    ()=>getSystemProxyState,
    "isTlsInterceptEnabled",
    ()=>isTlsInterceptEnabled,
    "setHttpProxyHandle",
    ()=>setHttpProxyHandle,
    "setSystemProxyApplied",
    ()=>setSystemProxyApplied,
    "setTlsIntercept",
    ()=>setTlsIntercept
]);
// ── HTTP Proxy ──────────────────────────────────────────────────────────────
let httpProxyHandle = null;
function getHttpProxyHandle() {
    return httpProxyHandle;
}
function setHttpProxyHandle(handle) {
    httpProxyHandle = handle;
}
let systemProxyState = {
    applied: false,
    port: null,
    guardUntil: null,
    previousState: null
};
let guardTimer = null;
function getSystemProxyState() {
    return {
        ...systemProxyState
    };
}
function setSystemProxyApplied(port, previousState, guardMinutes) {
    if (guardTimer) clearTimeout(guardTimer);
    const guardUntil = new Date(Date.now() + guardMinutes * 60_000).toISOString();
    systemProxyState = {
        applied: true,
        port,
        guardUntil,
        previousState
    };
    guardTimer = setTimeout(()=>{
        // Auto-revert after guard period — fire-and-forget.
        // Import lazily to avoid circular deps at module load.
        __turbopack_context__.A("[project]/src/mitm/inspector/systemProxyConfig.ts [app-route] (ecmascript, async loader)").then(({ revert })=>{
            const ps = systemProxyState.previousState;
            systemProxyState = {
                applied: false,
                port: null,
                guardUntil: null,
                previousState: null
            };
            if (ps) revert(ps).catch(()=>{});
        }).catch(()=>{});
    }, guardMinutes * 60_000);
}
function clearSystemProxy() {
    if (guardTimer) {
        clearTimeout(guardTimer);
        guardTimer = null;
    }
    systemProxyState = {
        applied: false,
        port: null,
        guardUntil: null,
        previousState: null
    };
}
// ── TLS Intercept ───────────────────────────────────────────────────────────
let tlsInterceptEnabled = process.env.INSPECTOR_TLS_INTERCEPT === "true";
function isTlsInterceptEnabled() {
    return tlsInterceptEnabled;
}
function setTlsIntercept(enabled) {
    tlsInterceptEnabled = enabled;
}
}),
];

//# sourceMappingURL=src_lib_inspector_captureState_ts_1bb-l6z._.js.map