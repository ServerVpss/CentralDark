(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/utils/providerConnectionStatus.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEffectiveProviderConnectionStatus",
    ()=>getEffectiveProviderConnectionStatus,
    "isProviderConnectionConnected",
    ()=>isProviderConnectionConnected,
    "isProviderConnectionErrored",
    ()=>isProviderConnectionErrored
]);
const CONNECTED_STATUSES = new Set([
    "active",
    "success",
    "unknown"
]);
const ERROR_STATUSES = new Set([
    "error",
    "expired",
    "unavailable"
]);
function getEffectiveProviderConnectionStatus(connection, now = Date.now()) {
    const status = connection.testStatus || "unknown";
    if (status !== "unavailable") return status;
    const rawCooldownUntil = connection.rateLimitedUntil;
    const cooldownUntil = rawCooldownUntil instanceof Date ? rawCooldownUntil.getTime() : typeof rawCooldownUntil === "string" || typeof rawCooldownUntil === "number" ? new Date(rawCooldownUntil).getTime() : Number.NaN;
    const isCoolingDown = Number.isFinite(cooldownUntil) && cooldownUntil > now;
    return isCoolingDown ? status : "active";
}
function isProviderConnectionConnected(connection, now = Date.now()) {
    return connection.isActive !== false && CONNECTED_STATUSES.has(getEffectiveProviderConnectionStatus(connection, now));
}
function isProviderConnectionErrored(connection, now = Date.now()) {
    return connection.isActive !== false && ERROR_STATUSES.has(getEffectiveProviderConnectionStatus(connection, now));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/http/apiErrorMessage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract a human-readable message from an API error response body.
 *
 * OmniRoute's structured error envelope is `{ error: { code, message,
 * correlation_id } }`, but some routes return `{ error: "string" }`. Rendering
 * the raw `error` object in the dashboard yields "[object Object]" (or nothing),
 * which hid actionable messages such as `INVALID_ORIGIN` (#5340) — the operator
 * saw a silent failure instead of guidance. Funnel API error bodies through this
 * so the message (and its actionable hint) always surfaces.
 */ __turbopack_context__.s([
    "extractApiErrorMessage",
    ()=>extractApiErrorMessage
]);
function extractApiErrorMessage(body, fallback) {
    const err = body?.error;
    if (typeof err === "string" && err.trim()) return err.trim();
    if (err && typeof err === "object") {
        const message = err.message;
        if (typeof message === "string" && message.trim()) return message.trim();
    }
    return fallback;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/wsPath.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Derive the live WebSocket path from `NEXT_PUBLIC_LIVE_WS_PUBLIC_URL`.
 *
 * Only `ws://` or `wss://` URLs are accepted (mirrors the scheme guard in
 * `getLivePublicUrl()`). The pathname is extracted and used as the WS upgrade
 * path; if the URL has no pathname (or is `/`), falls back to `/live-ws`.
 *
 * Used by:
 * - `src/app/api/v1/ws/route.ts` — handshake response `path` field
 * - `src/hooks/useLiveDashboard.ts` — build-time path constant + runtime discovery
 *
 * No env var is introduced — this reads the existing `NEXT_PUBLIC_LIVE_WS_PUBLIC_URL`.
 */ __turbopack_context__.s([
    "deriveLiveWsPath",
    ()=>deriveLiveWsPath,
    "getLiveWsPath",
    ()=>getLiveWsPath
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function deriveLiveWsPath(publicUrl) {
    if (!publicUrl) return "/live-ws";
    if (!publicUrl.startsWith("ws://") && !publicUrl.startsWith("wss://")) return "/live-ws";
    try {
        const parsed = new URL(publicUrl);
        const pathname = parsed.pathname;
        return pathname && pathname !== "/" ? pathname : "/live-ws";
    } catch  {
        return "/live-ws";
    }
}
function getLiveWsPath() {
    return deriveLiveWsPath(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useLiveDashboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLiveComboStatus",
    ()=>useLiveComboStatus,
    "useLiveConnectionStatus",
    ()=>useLiveConnectionStatus,
    "useLiveDashboard",
    ()=>useLiveDashboard,
    "useLiveRequests",
    ()=>useLiveRequests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$wsPath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/wsPath.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
/**
 * useLiveDashboard — React hooks for real-time dashboard WebSocket
 *
 * Provides hooks for connecting to the live dashboard WebSocket server
 * and subscribing to event channels.
 *
 * Usage:
 *   const { requests, isConnected } = useLiveRequests();
 *   const { comboEvents, lastComboEvent } = useLiveComboStatus();
 */ "use client";
;
;
// ── Config ────────────────────────────────────────────────────────────────
const WS_RECONNECT_DELAYS = [
    1000,
    2000,
    4000,
    8000,
    16000,
    30000
];
/** Only accept ws:// or wss:// URLs (mirrors the guard in src/app/api/v1/ws/route.ts). */ function sanitizeWsPublicUrl(url) {
    if (typeof url !== "string" || url.length === 0) return null;
    return url.startsWith("ws://") || url.startsWith("wss://") ? url : null;
}
// Build-time inlined value (Docker/npm prebuilt images won't have this — the
// runtime value is discovered via the /api/v1/ws?handshake=1 handshake below).
const BUILD_TIME_PUBLIC_WS_URL = sanitizeWsPublicUrl(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
const BUILD_TIME_WS_PATH = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$wsPath$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveLiveWsPath"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
function getDefaultWsUrl() {
    if (BUILD_TIME_PUBLIC_WS_URL) return BUILD_TIME_PUBLIC_WS_URL;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const { hostname } = window.location;
    // Bug #1 fix: Use the WS server's actual port (20132) for both loopback
    // and non-loopback clients. Previously the non-loopback branch tried to
    // upgrade the HTTP port (window.location.host) which has no upgrade
    // handler in src/proxy.ts. If the user wants the upgrade to go through
    // Next.js (same-origin), they should explicitly pass `wsUrl`.
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        return `${protocol}//${hostname}:20132${BUILD_TIME_WS_PATH}`;
    }
    return `${protocol}//${hostname}:20132${BUILD_TIME_WS_PATH}`;
}
const DEFAULT_WS_URL = getDefaultWsUrl();
function useLiveDashboard({ wsUrl, enabled = true, apiKey, channels = [
    "requests",
    "combo",
    "credentials"
], autoReconnect = true, onEvent } = {}) {
    _s();
    const [connection, setConnection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        isConnected: false,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0
    });
    // Runtime discovery of the public WS URL via the handshake endpoint.
    // NEXT_PUBLIC_* env vars are inlined at build time, so prebuilt Docker/npm
    // images never see a runtime NEXT_PUBLIC_LIVE_WS_PUBLIC_URL — the server
    // echoes it in the /api/v1/ws?handshake=1 response instead.
    // Skipped when the caller passes an explicit wsUrl or the env was inlined.
    const needsHandshake = !wsUrl && !BUILD_TIME_PUBLIC_WS_URL && ("TURBOPACK compile-time value", "object") !== "undefined";
    const [handshakeUrl, setHandshakeUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [handshakePath, setHandshakePath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [wsUrlResolved, setWsUrlResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!needsHandshake);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLiveDashboard.useEffect": ()=>{
            if (!needsHandshake || wsUrlResolved) return;
            let cancelled = false;
            fetch("/api/v1/ws?handshake=1").then({
                "useLiveDashboard.useEffect": (res)=>res.ok ? res.json() : null
            }["useLiveDashboard.useEffect"]).then({
                "useLiveDashboard.useEffect": (body)=>{
                    if (cancelled) return;
                    const publicUrl = sanitizeWsPublicUrl(body?.live?.publicUrl);
                    if (publicUrl) setHandshakeUrl(publicUrl);
                    if (typeof body?.live?.path === "string" && body.live.path.startsWith("/")) {
                        setHandshakePath(body.live.path);
                    }
                }
            }["useLiveDashboard.useEffect"]).catch({
                "useLiveDashboard.useEffect": ()=>{
                // Handshake unavailable — fall back to the default URL.
                }
            }["useLiveDashboard.useEffect"]).finally({
                "useLiveDashboard.useEffect": ()=>{
                    if (!cancelled) setWsUrlResolved(true);
                }
            }["useLiveDashboard.useEffect"]);
            return ({
                "useLiveDashboard.useEffect": ()=>{
                    cancelled = true;
                }
            })["useLiveDashboard.useEffect"];
        }
    }["useLiveDashboard.useEffect"], [
        needsHandshake,
        wsUrlResolved
    ]);
    const effectiveWsUrl = (()=>{
        if (wsUrl) return wsUrl;
        if (handshakeUrl) return handshakeUrl;
        if (handshakePath && handshakePath !== BUILD_TIME_WS_PATH) {
            try {
                const url = new URL(DEFAULT_WS_URL);
                url.pathname = handshakePath;
                return url.toString();
            } catch  {
                return DEFAULT_WS_URL;
            }
        }
        return DEFAULT_WS_URL;
    })();
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reconnectTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const maxEvents = 500;
    const onEventRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onEvent);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLiveDashboard.useEffect": ()=>{
            onEventRef.current = onEvent;
        }
    }["useLiveDashboard.useEffect"], [
        onEvent
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveDashboard.useCallback[connect]": ()=>{
            if (!mountedRef.current) return;
            if (wsRef.current?.readyState === WebSocket.OPEN) return;
            setConnection({
                "useLiveDashboard.useCallback[connect]": (prev)=>({
                        ...prev,
                        isConnecting: true,
                        error: null
                    })
            }["useLiveDashboard.useCallback[connect]"]);
            try {
                const wsUrlWithAuth = apiKey ? `${effectiveWsUrl}?token=${encodeURIComponent(apiKey)}` : effectiveWsUrl;
                const ws = new WebSocket(wsUrlWithAuth);
                wsRef.current = ws;
                ws.onopen = ({
                    "useLiveDashboard.useCallback[connect]": ()=>{
                        if (!mountedRef.current) return;
                        setConnection({
                            isConnected: true,
                            isConnecting: false,
                            error: null,
                            reconnectAttempt: 0
                        });
                        // Subscribe to channels
                        ws.send(JSON.stringify({
                            type: "subscribe",
                            channels
                        }));
                    }
                })["useLiveDashboard.useCallback[connect]"];
                ws.onmessage = ({
                    "useLiveDashboard.useCallback[connect]": (event)=>{
                        if (!mountedRef.current) return;
                        try {
                            const msg = JSON.parse(event.data);
                            if (msg.type === "event") {
                                const payload = {
                                    event: msg.event,
                                    channel: msg.channel,
                                    data: msg.data,
                                    timestamp: msg.timestamp || Date.now()
                                };
                                setEvents({
                                    "useLiveDashboard.useCallback[connect]": (prev)=>{
                                        const next = [
                                            ...prev,
                                            payload
                                        ];
                                        return next.length > maxEvents ? next.slice(-maxEvents) : next;
                                    }
                                }["useLiveDashboard.useCallback[connect]"]);
                                onEventRef.current?.(payload);
                            } else if (msg.type === "pong") {
                            // Heartbeat response
                            } else if (msg.type === "welcome") {
                                // Send backlog
                                if (Array.isArray(msg.data)) {
                                    setEvents({
                                        "useLiveDashboard.useCallback[connect]": (prev)=>{
                                            const next = [
                                                ...prev,
                                                ...msg.data
                                            ];
                                            return next.length > maxEvents ? next.slice(-maxEvents) : next;
                                        }
                                    }["useLiveDashboard.useCallback[connect]"]);
                                    for (const item of msg.data){
                                        const payload = {
                                            event: item.event,
                                            channel: item.channel,
                                            data: item.data,
                                            timestamp: item.timestamp || Date.now()
                                        };
                                        onEventRef.current?.(payload);
                                    }
                                }
                            } else if (msg.type === "error") {
                                console.error("[LiveWS] Server error:", msg.code, msg.message);
                            }
                        } catch  {
                        // Ignore parse errors
                        }
                    }
                })["useLiveDashboard.useCallback[connect]"];
                ws.onclose = ({
                    "useLiveDashboard.useCallback[connect]": ()=>{
                        if (!mountedRef.current) return;
                        wsRef.current = null;
                        setConnection({
                            "useLiveDashboard.useCallback[connect]": (prev)=>({
                                    ...prev,
                                    isConnected: false,
                                    isConnecting: false
                                })
                        }["useLiveDashboard.useCallback[connect]"]);
                        if (autoReconnect) {
                            const attempt = connection.reconnectAttempt;
                            const delay = WS_RECONNECT_DELAYS[Math.min(attempt, WS_RECONNECT_DELAYS.length - 1)];
                            reconnectTimeoutRef.current = setTimeout({
                                "useLiveDashboard.useCallback[connect]": ()=>{
                                    setConnection({
                                        "useLiveDashboard.useCallback[connect]": (prev)=>({
                                                ...prev,
                                                reconnectAttempt: prev.reconnectAttempt + 1
                                            })
                                    }["useLiveDashboard.useCallback[connect]"]);
                                }
                            }["useLiveDashboard.useCallback[connect]"], delay);
                        }
                    }
                })["useLiveDashboard.useCallback[connect]"];
                ws.onerror = ({
                    "useLiveDashboard.useCallback[connect]": ()=>{
                        if (!mountedRef.current) return;
                        setConnection({
                            "useLiveDashboard.useCallback[connect]": (prev)=>({
                                    ...prev,
                                    isConnecting: false,
                                    error: "Connection failed"
                                })
                        }["useLiveDashboard.useCallback[connect]"]);
                    }
                })["useLiveDashboard.useCallback[connect]"];
            } catch (err) {
                setConnection({
                    "useLiveDashboard.useCallback[connect]": (prev)=>({
                            ...prev,
                            isConnecting: false,
                            error: err instanceof Error ? err.message : "Connection failed"
                        })
                }["useLiveDashboard.useCallback[connect]"]);
            }
        }
    }["useLiveDashboard.useCallback[connect]"], [
        effectiveWsUrl,
        apiKey,
        channels.join(","),
        autoReconnect,
        connection.reconnectAttempt
    ]);
    // Connect on mount and on reconnect trigger
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLiveDashboard.useEffect": ()=>{
            mountedRef.current = true;
            if (!enabled) {
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
                wsRef.current?.close();
                wsRef.current = null;
                setConnection({
                    isConnected: false,
                    isConnecting: false,
                    error: null,
                    reconnectAttempt: 0
                });
                return;
            }
            // Wait for the handshake URL resolution before opening the socket, so we
            // never connect to the hardcoded default and then flap to the public URL.
            if (!wsUrlResolved) return;
            connect();
            return ({
                "useLiveDashboard.useEffect": ()=>{
                    mountedRef.current = false;
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    wsRef.current?.close();
                }
            })["useLiveDashboard.useEffect"];
        }
    }["useLiveDashboard.useEffect"], [
        connect,
        enabled,
        wsUrlResolved
    ]);
    // Connect (for manual retry)
    const reconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveDashboard.useCallback[reconnect]": ()=>{
            wsRef.current?.close();
            setConnection({
                "useLiveDashboard.useCallback[reconnect]": (prev)=>({
                        ...prev,
                        reconnectAttempt: prev.reconnectAttempt + 1
                    })
            }["useLiveDashboard.useCallback[reconnect]"]);
        }
    }["useLiveDashboard.useCallback[reconnect]"], []);
    return {
        connection,
        events,
        reconnect,
        /** Filter events by channel */ getEventsByChannel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
            "useLiveDashboard.useCallback": (channel)=>events.filter({
                    "useLiveDashboard.useCallback": (e)=>e.channel === channel
                }["useLiveDashboard.useCallback"])
        }["useLiveDashboard.useCallback"], [
            events
        ]),
        /** Filter events by name */ getEventsByName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
            "useLiveDashboard.useCallback": (eventName)=>events.filter({
                    "useLiveDashboard.useCallback": (e)=>e.event === eventName
                }["useLiveDashboard.useCallback"])
        }["useLiveDashboard.useCallback"], [
            events
        ]),
        /** Clear event history */ clearEvents: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
            "useLiveDashboard.useCallback": ()=>setEvents([])
        }["useLiveDashboard.useCallback"], [])
    };
}
_s(useLiveDashboard, "48yhli+wRE4roy61IZpztKt2ju4=");
function useLiveRequests(options) {
    _s1();
    const [requestState, setRequestState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        active: new Map(),
        completed: []
    });
    const maxCompleted = 100;
    const handleEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveRequests.useCallback[handleEvent]": (event)=>{
            if (event.channel !== "requests") return;
            if (event.event === "request.started") {
                const data = event.data;
                setRequestState({
                    "useLiveRequests.useCallback[handleEvent]": (prev)=>{
                        const active = new Map(prev.active);
                        active.set(data.id, {
                            id: data.id,
                            model: data.model,
                            provider: data.provider,
                            timestamp: data.timestamp,
                            status: "pending",
                            comboName: data.comboName
                        });
                        return {
                            active,
                            completed: prev.completed
                        };
                    }
                }["useLiveRequests.useCallback[handleEvent]"]);
            } else if (event.event === "request.streaming") {
                const data = event.data;
                setRequestState({
                    "useLiveRequests.useCallback[handleEvent]": (prev)=>{
                        const active = new Map(prev.active);
                        const existing = active.get(data.id);
                        if (existing) {
                            active.set(data.id, {
                                ...existing,
                                status: "running"
                            });
                        }
                        return {
                            active,
                            completed: prev.completed
                        };
                    }
                }["useLiveRequests.useCallback[handleEvent]"]);
            } else if (event.event === "request.completed") {
                const data = event.data;
                setRequestState({
                    "useLiveRequests.useCallback[handleEvent]": (prev)=>{
                        const active = new Map(prev.active);
                        const existing = active.get(data.id);
                        if (existing) {
                            active.delete(data.id);
                            const done = {
                                ...existing,
                                status: data.status === "success" ? "success" : "error",
                                tokensInput: data.tokensInput,
                                tokensOutput: data.tokensOutput,
                                latencyMs: data.latencyMs,
                                error: data.error
                            };
                            const completed = [
                                done,
                                ...prev.completed
                            ].slice(0, maxCompleted);
                            return {
                                active,
                                completed
                            };
                        }
                        return prev;
                    }
                }["useLiveRequests.useCallback[handleEvent]"]);
            } else if (event.event === "request.failed") {
                const data = event.data;
                setRequestState({
                    "useLiveRequests.useCallback[handleEvent]": (prev)=>{
                        const active = new Map(prev.active);
                        const existing = active.get(data.id);
                        if (existing) {
                            active.delete(data.id);
                            const done = {
                                ...existing,
                                status: "error",
                                error: data.error,
                                latencyMs: data.latencyMs
                            };
                            const completed = [
                                done,
                                ...prev.completed
                            ].slice(0, maxCompleted);
                            return {
                                active,
                                completed
                            };
                        }
                        return prev;
                    }
                }["useLiveRequests.useCallback[handleEvent]"]);
            }
        }
    }["useLiveRequests.useCallback[handleEvent]"], []);
    const { connection, reconnect } = useLiveDashboard({
        channels: [
            "requests"
        ],
        onEvent: handleEvent,
        ...options
    });
    return {
        activeRequests: Array.from(requestState.active.values()),
        completedRequests: requestState.completed,
        activeCount: requestState.active.size,
        isConnected: connection.isConnected,
        reconnect
    };
}
_s1(useLiveRequests, "u7FxIbjVkSTrP6r2ngyrf4fJF/k=", false, function() {
    return [
        useLiveDashboard
    ];
});
function useLiveComboStatus(options) {
    _s2();
    const [comboEvents, setComboEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const maxComboEvents = 200;
    const handleEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveComboStatus.useCallback[handleEvent]": (event)=>{
            if (event.channel !== "combo") return;
            const data = event.data;
            let comboEvent = null;
            if (event.event === "combo.target.attempt") {
                comboEvent = {
                    comboName: data.comboName,
                    targetIndex: data.targetIndex,
                    provider: data.provider,
                    model: data.model,
                    type: "attempt",
                    strategy: data.strategy,
                    timestamp: event.timestamp
                };
            } else if (event.event === "combo.target.succeeded") {
                comboEvent = {
                    comboName: data.comboName,
                    targetIndex: data.targetIndex,
                    provider: data.provider,
                    model: data.model,
                    type: "succeeded",
                    latencyMs: data.latencyMs,
                    timestamp: event.timestamp
                };
            } else if (event.event === "combo.target.failed") {
                comboEvent = {
                    comboName: data.comboName,
                    targetIndex: data.targetIndex,
                    provider: data.provider,
                    model: data.model,
                    type: "failed",
                    error: data.error,
                    latencyMs: data.latencyMs,
                    timestamp: event.timestamp
                };
            }
            if (comboEvent) {
                setComboEvents({
                    "useLiveComboStatus.useCallback[handleEvent]": (prev)=>[
                            comboEvent,
                            ...prev
                        ].slice(0, maxComboEvents)
                }["useLiveComboStatus.useCallback[handleEvent]"]);
            }
        }
    }["useLiveComboStatus.useCallback[handleEvent]"], []);
    const { connection, reconnect } = useLiveDashboard({
        channels: [
            "combo"
        ],
        onEvent: handleEvent,
        ...options
    });
    /** Get events for a specific combo */ const getComboHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveComboStatus.useCallback[getComboHistory]": (comboName)=>comboEvents.filter({
                "useLiveComboStatus.useCallback[getComboHistory]": (e)=>e.comboName === comboName
            }["useLiveComboStatus.useCallback[getComboHistory]"])
    }["useLiveComboStatus.useCallback[getComboHistory]"], [
        comboEvents
    ]);
    /** Get the last event for a specific combo */ const getLastComboEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLiveComboStatus.useCallback[getLastComboEvent]": (comboName)=>comboEvents.find({
                "useLiveComboStatus.useCallback[getLastComboEvent]": (e)=>e.comboName === comboName
            }["useLiveComboStatus.useCallback[getLastComboEvent]"])
    }["useLiveComboStatus.useCallback[getLastComboEvent]"], [
        comboEvents
    ]);
    return {
        comboEvents,
        activeCombos: new Set(comboEvents.map((e)=>e.comboName)),
        isConnected: connection.isConnected,
        getComboHistory,
        getLastComboEvent,
        reconnect
    };
}
_s2(useLiveComboStatus, "lJejBna43jfwpkDkSBKZ1DMiNtc=", false, function() {
    return [
        useLiveDashboard
    ];
});
function useLiveConnectionStatus(options) {
    _s3();
    const { connection, reconnect } = useLiveDashboard({
        channels: [],
        ...options
    });
    return {
        ...connection,
        reconnect
    };
}
_s3(useLiveConnectionStatus, "ZIcPPI98SgjLZ+ol9LwFdqSB/fc=", false, function() {
    return [
        useLiveDashboard
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/topologyUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure helpers for the home-page Provider Topology panel.
 */ /** Minimal shape expected by <ProviderTopology activeRequests={...}> */ __turbopack_context__.s([
    "selectActiveRequests",
    ()=>selectActiveRequests
]);
function selectActiveRequests(requests) {
    return requests.map(({ provider, model })=>({
            provider,
            model
        }));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HomeProviderTopologySection",
    ()=>HomeProviderTopologySection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLiveDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useLiveDashboard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$home$2f$topologyUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/home/topologyUtils.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const ProviderTopology = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/app/(dashboard)/home/ProviderTopology.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/app/(dashboard)/home/ProviderTopology.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ProviderTopology;
function HomeProviderTopologySection({ providers, lastProvider, errorProvider, enabled = true }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("home");
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const tSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    const tAnalytics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("analytics");
    // #4596: gate the live-WS connection so it only opens while the topology
    // section is actually shown on the home page.
    const { activeRequests: liveActiveRequests } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLiveDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveRequests"])({
        enabled
    });
    const activeRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$home$2f$topologyUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectActiveRequests"])(liveActiveRequests);
    const activeProviderCount = new Set(activeRequests.map(({ provider })=>provider)).size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-semibold",
                                children: t("providerTopology")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t("activeError", {
                                    active: activeProviderCount,
                                    errors: errorProvider ? 1 : 0
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 text-[11px] text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "size-2 rounded-full bg-green-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                        lineNumber: 52,
                                        columnNumber: 13
                                    }, this),
                                    tCommon("active")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "size-2 rounded-full bg-amber-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                        lineNumber: 56,
                                        columnNumber: 13
                                    }, this),
                                    tSettings("recent")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "size-2 rounded-full bg-red-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                        lineNumber: 60,
                                        columnNumber: 13
                                    }, this),
                                    tAnalytics("modelStatusError")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderTopology, {
                providers: providers,
                activeRequests: activeRequests,
                lastProvider: lastProvider,
                errorProvider: errorProvider
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(HomeProviderTopologySection, "7zq8zoo1UZqLCv1MC+1jBdwGzuk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLiveDashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveRequests"]
    ];
});
_c1 = HomeProviderTopologySection;
var _c, _c1;
__turbopack_context__.k.register(_c, "ProviderTopology");
__turbopack_context__.k.register(_c1, "HomeProviderTopologySection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/homeAppearance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Appearance-flag resolution for the home dashboard.
//
// Regression context (#4596 → restored here): the home provider-topology card
// (the ReactFlow connection map) defaults ON — the AppearanceTab toggle reads it
// as `settings.showProviderTopologyOnHome !== false`. #4596 made HomePageClient
// initialize the flag to `false` and only flip it when the API returned an
// explicit boolean, so any install that never persisted the setting (the common
// case → the field is `undefined`) kept the card hidden forever, contradicting
// the AppearanceTab toggle. This helper centralizes the default-ON semantics so
// both surfaces agree: absent ⇒ show, explicit `false` ⇒ hide, explicit `true` ⇒ show.
/**
 * Whether the home provider-topology card should render.
 * Defaults ON; only an explicit `false` hides it (mirrors AppearanceTab).
 */ __turbopack_context__.s([
    "shouldShowProviderTopologyOnHome",
    ()=>shouldShowProviderTopologyOnHome
]);
function shouldShowProviderTopologyOnHome(setting) {
    return setting !== false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/oauth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerConnectionStatus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/http/apiErrorMessage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clipboard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerDisplayLabel.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useElectron$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useElectron.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$HomeProviderTopologySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/HomeProviderTopologySection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$homeAppearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/homeAppearance.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const ProviderQuotaWidget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = ProviderQuotaWidget;
const PROVIDER_ALIAS_TO_ID = new Map(Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"]).flatMap(([providerId, providerInfo])=>providerInfo.alias ? [
        [
            providerInfo.alias.toLowerCase(),
            providerId
        ]
    ] : []).filter((entry)=>entry.length === 2));
function normalizeProviderId(providerId) {
    const normalized = typeof providerId === "string" ? providerId.trim().toLowerCase() : "";
    if (!normalized) return "";
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"][normalized] ? normalized : PROVIDER_ALIAS_TO_ID.get(normalized) || normalized;
}
const wait = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
function mergeUpdateStep(steps, nextStep) {
    const idx = steps.findIndex((step)=>step.step === nextStep.step);
    if (idx === -1) {
        return [
            ...steps,
            nextStep
        ];
    }
    const next = [
        ...steps
    ];
    next[idx] = nextStep;
    return next;
}
// Quick-start link classes, extracted so each <Link> still fits on one line with
// prefetch={false} (#8281) — this file is size-frozen.
const INLINE_LINK = "text-primary hover:underline";
const DOCS_LINK = "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-text-muted hover:text-text-main hover:bg-bg-subtle transition-colors";
function HomePageClient({ machineId }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const isElectron = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useElectron$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsElectron"])();
    const { openExternal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useElectron$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpenExternal"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("home");
    const tp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const [providerConnections, setProviderConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [baseUrl, setBaseUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("/v1");
    const [selectedProvider, setSelectedProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [providerMetrics, setProviderMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [providerTopology, setProviderTopology] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        lastProvider: "",
        errorProvider: ""
    });
    const [providerNodes, setProviderNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // The live in-flight request feed for the Provider Topology pulse animation is owned by
    // <HomeProviderTopologySection>, which subscribes to it (gated by the `enabled` prop)
    // only when the topology is actually shown. HomePageClient must NOT open its own
    // unconditional live socket: the binding here was unused (ReferenceError in prod,
    // #4759/#4745) and the socket opened even when topology was hidden (#4596).
    const [versionInfo, setVersionInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [updating, setUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Platform detection and download links for Electron
    const platform = typeof globalThis.window === "undefined" ? undefined : globalThis.window.electronAPI?.platform;
    const electronDownload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePageClient.useMemo[electronDownload]": ()=>{
            const latest = versionInfo?.latest || "";
            const cleanLatest = latest.replace(/^v/, "");
            if (platform === "darwin") {
                return {
                    label: "Download DMG (macOS)",
                    url: `https://github.com/diegosouzapw/OmniRoute/releases/download/v${cleanLatest}/OmniRoute-${cleanLatest}.dmg`,
                    desc: `A new version of the OmniRoute desktop app is available. Please download and install the macOS DMG installer to update (current: v${versionInfo?.current || ""}).`
                };
            }
            if (platform === "win32") {
                return {
                    label: "Download EXE (Windows)",
                    url: `https://github.com/diegosouzapw/OmniRoute/releases/download/v${cleanLatest}/OmniRoute.Setup.${cleanLatest}.exe`,
                    desc: `A new version of the OmniRoute desktop app is available. Please download and install the Windows EXE installer to update (current: v${versionInfo?.current || ""}).`
                };
            }
            if (platform === "linux") {
                return {
                    label: "Download AppImage (Linux)",
                    url: `https://github.com/diegosouzapw/OmniRoute/releases/download/v${cleanLatest}/OmniRoute-${cleanLatest}.AppImage`,
                    desc: `A new version of the OmniRoute desktop app is available. Please download the Linux AppImage package to update (current: v${versionInfo?.current || ""}).`
                };
            }
            return {
                label: "Download Update",
                url: `https://github.com/diegosouzapw/OmniRoute/releases/tag/v${cleanLatest}`,
                desc: `A new version of the OmniRoute desktop app is available. Please download the respective app format for your system to update (current: v${versionInfo?.current || ""}).`
            };
        }
    }["HomePageClient.useMemo[electronDownload]"], [
        platform,
        versionInfo?.latest,
        versionInfo?.current
    ]);
    // Electron internal auto-updater state and listeners
    const [electronUpdateStatus, setElectronUpdateStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        status: "idle"
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            if (!isElectron || typeof globalThis.window === "undefined" || !globalThis.window.electronAPI) return;
            // Trigger initial check silently on mount
            globalThis.window.electronAPI.checkForUpdates().catch({
                "HomePageClient.useEffect": (err)=>{
                    console.error("[Electron] Check for updates failed:", err);
                }
            }["HomePageClient.useEffect"]);
            const dispose = globalThis.window.electronAPI.onUpdateStatus({
                "HomePageClient.useEffect.dispose": (data)=>{
                    setElectronUpdateStatus({
                        status: data.status,
                        version: data.version,
                        percent: data.percent,
                        message: data.message
                    });
                }
            }["HomePageClient.useEffect.dispose"]);
            return dispose;
        }
    }["HomePageClient.useEffect"], [
        isElectron
    ]);
    const [updateSteps, setUpdateSteps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [updatePhase, setUpdatePhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    // Appearance settings for home page pinning
    const [pinProviderQuotaToHome, setPinProviderQuotaToHome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showQuickStartOnHome, setShowQuickStartOnHome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true); // default on
    // #4596: default hidden until appearance settings load, so the live-WS
    // topology connection is never opened before we know the user wants it.
    const [showProviderTopologyOnHome, setShowProviderTopologyOnHome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autoRefreshProviderQuota, setAutoRefreshProviderQuota] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autoRefreshProviderQuotaInterval, setAutoRefreshProviderQuotaInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(180);
    const [appearanceSettingsLoaded, setAppearanceSettingsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            // Fetch the pin settings (lightweight)
            fetch("/api/settings").then({
                "HomePageClient.useEffect": (r)=>r.ok ? r.json() : {}
            }["HomePageClient.useEffect"]).then({
                "HomePageClient.useEffect": (data)=>{
                    if (data) {
                        if (typeof data.pinProviderQuotaToHome === "boolean") {
                            setPinProviderQuotaToHome(data.pinProviderQuotaToHome);
                        }
                        if (typeof data.showQuickStartOnHome === "boolean") {
                            setShowQuickStartOnHome(data.showQuickStartOnHome);
                        }
                        // #4596 regression fix: the topology card defaults ON (matches the
                        // AppearanceTab toggle's `!== false`). Honoring only an explicit boolean
                        // left the card hidden whenever the setting was never persisted
                        // (undefined), silently removing it for most installs. The live-WS
                        // connection is still gated by `appearanceSettingsLoaded` in the data
                        // effect, so it is never opened before settings load.
                        setShowProviderTopologyOnHome((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$homeAppearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shouldShowProviderTopologyOnHome"])(data.showProviderTopologyOnHome));
                        if (typeof data.autoRefreshProviderQuota === "boolean") {
                            setAutoRefreshProviderQuota(data.autoRefreshProviderQuota);
                        }
                        if (typeof data.autoRefreshProviderQuotaInterval === "number") {
                            setAutoRefreshProviderQuotaInterval(data.autoRefreshProviderQuotaInterval);
                        }
                    }
                }
            }["HomePageClient.useEffect"]).catch({
                "HomePageClient.useEffect": ()=>{
                /* ignore — defaults stay */ }
            }["HomePageClient.useEffect"]).finally({
                "HomePageClient.useEffect": ()=>{
                    setAppearanceSettingsLoaded(true);
                }
            }["HomePageClient.useEffect"]);
        }
    }["HomePageClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            if (typeof globalThis.window !== "undefined") {
                setBaseUrl(`${globalThis.location.origin}/v1`);
            }
        }
    }["HomePageClient.useEffect"], []);
    const fetchData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePageClient.useCallback[fetchData]": async ()=>{
            try {
                const [provRes, modelsRes, versionRes] = await Promise.all([
                    fetch("/api/providers"),
                    fetch("/api/models"),
                    fetch("/api/system/version")
                ]);
                if (provRes.ok) {
                    const provData = await provRes.json();
                    setProviderConnections(provData.connections || []);
                }
                if (modelsRes.ok) {
                    const modelsData = await modelsRes.json();
                    setModels(modelsData.models || []);
                }
                if (versionRes.ok) {
                    const versionData = await versionRes.json();
                    setVersionInfo(versionData);
                }
            } catch (e) {
                console.log("Error fetching data:", e);
            } finally{
                setLoading(false);
            }
        }
    }["HomePageClient.useCallback[fetchData]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            fetchData();
        }
    }["HomePageClient.useEffect"], [
        fetchData
    ]);
    // Fetch provider nodes for display labels (compat providers)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            fetch("/api/provider-nodes").then({
                "HomePageClient.useEffect": (r)=>r.ok ? r.json() : {
                        nodes: []
                    }
            }["HomePageClient.useEffect"]).then({
                "HomePageClient.useEffect": (d)=>setProviderNodes(d.nodes || [])
            }["HomePageClient.useEffect"]).catch({
                "HomePageClient.useEffect": ()=>{}
            }["HomePageClient.useEffect"]);
        }
    }["HomePageClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            if (!appearanceSettingsLoaded || !showProviderTopologyOnHome) {
                return;
            }
            let cancelled = false;
            let timeoutId = null;
            let controller = null;
            const loadTopologyActivity = {
                "HomePageClient.useEffect.loadTopologyActivity": async ()=>{
                    const currentController = new AbortController();
                    controller = currentController;
                    try {
                        const metricsRes = await fetch("/api/provider-metrics", {
                            cache: "no-store",
                            signal: currentController.signal
                        });
                        if (metricsRes.ok) {
                            const data = await metricsRes.json();
                            if (!cancelled) {
                                setProviderMetrics(data.metrics || {});
                                setProviderTopology({
                                    lastProvider: normalizeProviderId(data.topology?.lastProvider),
                                    errorProvider: normalizeProviderId(data.topology?.errorProvider)
                                });
                            }
                        }
                    } catch (error) {
                        const isAbortError = error instanceof DOMException && error.name === "AbortError";
                        if (!cancelled && !isAbortError) {
                            console.error("Failed to load topology activity:", error);
                        }
                    } finally{
                        if (controller === currentController) {
                            controller = null;
                        }
                        if (!cancelled) {
                            timeoutId = setTimeout(loadTopologyActivity, 3000);
                        }
                    }
                }
            }["HomePageClient.useEffect.loadTopologyActivity"];
            loadTopologyActivity();
            return ({
                "HomePageClient.useEffect": ()=>{
                    cancelled = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    controller?.abort();
                }
            })["HomePageClient.useEffect"];
        }
    }["HomePageClient.useEffect"], [
        appearanceSettingsLoaded,
        showProviderTopologyOnHome
    ]);
    // T07: Check for unhealthy API keys and show notification (once per session)
    const notifiedUnhealthyKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            const checkApiKeyHealth = {
                "HomePageClient.useEffect.checkApiKeyHealth": ()=>{
                    const newUnhealthyKeys = new Set();
                    const unhealthyProviderIds = new Set();
                    const unhealthyConnections = [];
                    let firstUnhealthyProviderId = null;
                    let hasWarning = false;
                    for (const conn of providerConnections){
                        const health = conn.providerSpecificData?.apiKeyHealth;
                        if (!health) continue;
                        // Defense-in-depth: skip stale extra_N health entries whose index
                        // is out of range of the current extraApiKeys list.
                        // The backend cleans this up on PATCH, but existing stale data from
                        // before the fix or other code paths could still have orphan entries.
                        const extras = conn.providerSpecificData?.extraApiKeys ?? [];
                        const extraKeyCount = Array.isArray(extras) ? extras.length : 0;
                        const unhealthyKeys = Object.entries(health).filter({
                            "HomePageClient.useEffect.checkApiKeyHealth.unhealthyKeys": ([keyId, h])=>{
                                if (h.status !== "invalid" && h.status !== "warning") return false;
                                // extra_N entries: only flag if the index is still within bounds
                                if (keyId.startsWith("extra_")) {
                                    const idx = Number.parseInt(keyId.slice(6), 10);
                                    if (Number.isNaN(idx) || idx >= extraKeyCount) return false;
                                }
                                return true;
                            }
                        }["HomePageClient.useEffect.checkApiKeyHealth.unhealthyKeys"]);
                        if (unhealthyKeys.length > 0) {
                            for (const [, h] of unhealthyKeys){
                                if (h.status === "warning") hasWarning = true;
                                break;
                            }
                            for (const [keyId] of unhealthyKeys){
                                newUnhealthyKeys.add(`${conn.id}:${keyId}`);
                            }
                            firstUnhealthyProviderId ??= conn.provider;
                            unhealthyConnections.push(conn.name || conn.id);
                            unhealthyProviderIds.add(conn.provider);
                        }
                    }
                    // Only notify for newly unhealthy keys (not already notified)
                    const hasNewUnhealthy = Array.from(newUnhealthyKeys).some({
                        "HomePageClient.useEffect.checkApiKeyHealth.hasNewUnhealthy": (k)=>!notifiedUnhealthyKeys.current.has(k)
                    }["HomePageClient.useEffect.checkApiKeyHealth.hasNewUnhealthy"]);
                    if (hasNewUnhealthy) {
                        const navigateTo = newUnhealthyKeys.size === 1 && firstUnhealthyProviderId ? `/dashboard/providers/${firstUnhealthyProviderId}` : `/dashboard/providers?search=${encodeURIComponent(Array.from(unhealthyProviderIds).join(" "))}`;
                        const notificationType = hasWarning ? "warning" : "error";
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().addNotification({
                            type: notificationType,
                            message: tp(hasWarning ? "apiKeyWarningAlert" : "apiKeyInvalidAlert", {
                                count: newUnhealthyKeys.size,
                                connections: unhealthyConnections.join(", ")
                            }),
                            title: tp(hasWarning ? "apiKeyWarningAlertTitle" : "apiKeyInvalidAlertTitle"),
                            duration: 10000,
                            onClick: {
                                "HomePageClient.useEffect.checkApiKeyHealth": ()=>router.push(navigateTo)
                            }["HomePageClient.useEffect.checkApiKeyHealth"]
                        });
                        // Mark all current unhealthy keys as notified
                        newUnhealthyKeys.forEach({
                            "HomePageClient.useEffect.checkApiKeyHealth": (k)=>notifiedUnhealthyKeys.current.add(k)
                        }["HomePageClient.useEffect.checkApiKeyHealth"]);
                    }
                }
            }["HomePageClient.useEffect.checkApiKeyHealth"];
            if (providerConnections.length > 0) {
                checkApiKeyHealth();
            }
        }
    }["HomePageClient.useEffect"], [
        providerConnections,
        t,
        tp,
        router
    ]);
    const providerStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePageClient.useMemo[providerStats]": ()=>{
            return Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"]).map({
                "HomePageClient.useMemo[providerStats]": ([providerId, providerInfo])=>{
                    const connections = providerConnections.filter({
                        "HomePageClient.useMemo[providerStats].connections": (conn)=>conn.provider === providerId
                    }["HomePageClient.useMemo[providerStats].connections"]);
                    const connected = connections.filter({
                        "HomePageClient.useMemo[providerStats]": (connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProviderConnectionConnected"])(connection)
                    }["HomePageClient.useMemo[providerStats]"]).length;
                    const errors = connections.filter({
                        "HomePageClient.useMemo[providerStats]": (connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProviderConnectionErrored"])(connection)
                    }["HomePageClient.useMemo[providerStats]"]).length;
                    const providerKeys = new Set([
                        providerId,
                        providerInfo.alias
                    ].filter(Boolean));
                    const providerModels = models.filter({
                        "HomePageClient.useMemo[providerStats].providerModels": (m)=>providerKeys.has(m.provider)
                    }["HomePageClient.useMemo[providerStats].providerModels"]);
                    const authType = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"][providerId] ? "no-auth" : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"][providerId] ? "oauth" : "apikey";
                    return {
                        id: providerId,
                        provider: providerInfo,
                        total: connections.length,
                        connected,
                        errors,
                        modelCount: providerModels.length,
                        authType
                    };
                }
            }["HomePageClient.useMemo[providerStats]"]);
        }
    }["HomePageClient.useMemo[providerStats]"], [
        providerConnections,
        models
    ]);
    const selectedProviderModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePageClient.useMemo[selectedProviderModels]": ()=>{
            if (!selectedProvider) return [];
            const providerKeys = new Set([
                selectedProvider.id,
                selectedProvider.provider?.alias
            ].filter(Boolean));
            return models.filter({
                "HomePageClient.useMemo[selectedProviderModels]": (m)=>providerKeys.has(m.provider)
            }["HomePageClient.useMemo[selectedProviderModels]"]);
        }
    }["HomePageClient.useMemo[selectedProviderModels]"], [
        selectedProvider,
        models
    ]);
    const topologyProviders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "HomePageClient.useMemo[topologyProviders]": ()=>{
            const byProvider = new Map();
            const providerConfig = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"];
            // Connection-health per provider, so the topology node reflects "what is connected"
            // at rest (green healthy / red error) instead of going blank between requests. A
            // provider with ≥1 healthy connection is "active"; if none are healthy but some are
            // errored it is "error"; otherwise "idle". Live/recent traffic still overrides this.
            const healthByProvider = new Map();
            for (const stat of providerStats){
                const canonical = normalizeProviderId(stat.id);
                if (!canonical) continue;
                healthByProvider.set(canonical, stat.connected > 0 ? "active" : stat.errors > 0 ? "error" : "idle");
            }
            const addProvider = {
                "HomePageClient.useMemo[topologyProviders].addProvider": (providerId, name)=>{
                    const rawProviderId = typeof providerId === "string" ? providerId.trim() : "";
                    if (!rawProviderId) return;
                    const canonicalProviderId = normalizeProviderId(rawProviderId);
                    if (!canonicalProviderId || byProvider.has(canonicalProviderId)) return;
                    // Exclude providers with no active connections (or where all connections are deactivated)
                    const hasActiveConn = providerConnections.some({
                        "HomePageClient.useMemo[topologyProviders].addProvider.hasActiveConn": (c)=>normalizeProviderId(c.provider) === canonicalProviderId && c.isActive !== false
                    }["HomePageClient.useMemo[topologyProviders].addProvider.hasActiveConn"]);
                    if (!hasActiveConn) return;
                    const resolvedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProviderDisplayLabel"])(rawProviderId, providerNodes) || name || providerConfig[canonicalProviderId]?.name || rawProviderId;
                    byProvider.set(canonicalProviderId, {
                        id: canonicalProviderId,
                        provider: canonicalProviderId,
                        name: resolvedName,
                        status: healthByProvider.get(canonicalProviderId) ?? "idle"
                    });
                }
            }["HomePageClient.useMemo[topologyProviders].addProvider"];
            providerStats.filter({
                "HomePageClient.useMemo[topologyProviders]": (provider)=>provider.total > 0
            }["HomePageClient.useMemo[topologyProviders]"]).forEach({
                "HomePageClient.useMemo[topologyProviders]": (provider)=>addProvider(provider.id, provider.provider.name)
            }["HomePageClient.useMemo[topologyProviders]"]);
            providerConnections.forEach({
                "HomePageClient.useMemo[topologyProviders]": (conn)=>addProvider(conn.provider)
            }["HomePageClient.useMemo[topologyProviders]"]);
            Object.keys(providerMetrics).forEach({
                "HomePageClient.useMemo[topologyProviders]": (provider)=>addProvider(provider)
            }["HomePageClient.useMemo[topologyProviders]"]);
            return Array.from(byProvider.values());
        }
    }["HomePageClient.useMemo[topologyProviders]"], [
        providerStats,
        providerMetrics,
        providerNodes,
        providerConnections
    ]);
    const { lastProvider, errorProvider } = providerTopology;
    const pollBackgroundUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePageClient.useCallback[pollBackgroundUpdate]": async ({ channel, message, targetVersion })=>{
            const notify = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState();
            const initialSteps = channel === "docker-compose" ? [
                {
                    step: "install",
                    status: "done",
                    message: message || `Queued update to v${targetVersion}.`
                },
                {
                    step: "rebuild",
                    status: "running",
                    message: "Docker image is rebuilding in the background."
                },
                {
                    step: "restart",
                    status: "pending",
                    message: "Waiting for OmniRoute to restart with the new version."
                }
            ] : [
                {
                    step: "install",
                    status: "running",
                    message: message || `Installing v${targetVersion}.`
                },
                {
                    step: "restart",
                    status: "pending",
                    message: "Waiting for OmniRoute to restart with the new version."
                }
            ];
            setUpdateSteps(initialSteps);
            const maxAttempts = channel === "docker-compose" ? 72 : 36;
            for(let attempt = 0; attempt < maxAttempts; attempt += 1){
                await wait(5000);
                try {
                    const versionRes = await fetch("/api/system/version", {
                        cache: "no-store"
                    });
                    if (!versionRes.ok) {
                        throw new Error(`Version check returned ${versionRes.status}`);
                    }
                    const latestInfo = await versionRes.json();
                    setVersionInfo(latestInfo);
                    if (latestInfo.current === targetVersion) {
                        setUpdateSteps({
                            "HomePageClient.useCallback[pollBackgroundUpdate]": (prev)=>{
                                let next = prev.map({
                                    "HomePageClient.useCallback[pollBackgroundUpdate].next": (step)=>{
                                        if (step.step === "install" || step.step === "rebuild" || step.step === "restart") {
                                            return {
                                                ...step,
                                                status: "done"
                                            };
                                        }
                                        return step;
                                    }
                                }["HomePageClient.useCallback[pollBackgroundUpdate].next"]);
                                next = mergeUpdateStep(next, {
                                    step: "complete",
                                    status: "done",
                                    message: `OmniRoute is now running v${targetVersion}.`
                                });
                                return next;
                            }
                        }["HomePageClient.useCallback[pollBackgroundUpdate]"]);
                        setUpdating(false);
                        setUpdatePhase("done");
                        notify.success(`OmniRoute updated to v${targetVersion}.`);
                        await fetchData();
                        return;
                    }
                    setUpdateSteps({
                        "HomePageClient.useCallback[pollBackgroundUpdate]": (prev)=>{
                            let next = prev;
                            if (channel === "docker-compose") {
                                next = mergeUpdateStep(next, {
                                    step: "rebuild",
                                    status: "running",
                                    message: `Docker image is still rebuilding for v${targetVersion}.`
                                });
                            } else {
                                next = mergeUpdateStep(next, {
                                    step: "install",
                                    status: "running",
                                    message: `Installing v${targetVersion} in the background.`
                                });
                            }
                            next = mergeUpdateStep(next, {
                                step: "restart",
                                status: "pending",
                                message: `Waiting for OmniRoute to come back on v${targetVersion}.`
                            });
                            return next;
                        }
                    }["HomePageClient.useCallback[pollBackgroundUpdate]"]);
                } catch  {
                    setUpdateSteps({
                        "HomePageClient.useCallback[pollBackgroundUpdate]": (prev)=>{
                            let next = prev;
                            if (channel === "docker-compose") {
                                next = mergeUpdateStep(next, {
                                    step: "rebuild",
                                    status: "running",
                                    message: "Docker rebuild is still in progress."
                                });
                            } else {
                                next = mergeUpdateStep(next, {
                                    step: "install",
                                    status: "running",
                                    message: `Installing v${targetVersion} in the background.`
                                });
                            }
                            next = mergeUpdateStep(next, {
                                step: "restart",
                                status: "running",
                                message: "Service restart in progress. Waiting for OmniRoute to come back online..."
                            });
                            return next;
                        }
                    }["HomePageClient.useCallback[pollBackgroundUpdate]"]);
                }
            }
            setUpdateSteps({
                "HomePageClient.useCallback[pollBackgroundUpdate]": (prev)=>mergeUpdateStep(prev, {
                        step: "error",
                        status: "failed",
                        message: `Update started, but v${targetVersion} did not become available before timeout. Refresh the page or check server logs.`
                    })
            }["HomePageClient.useCallback[pollBackgroundUpdate]"]);
            setUpdating(false);
            setUpdatePhase("failed");
            notify.error(`Update to v${targetVersion} timed out.`);
        }
    }["HomePageClient.useCallback[pollBackgroundUpdate]"], [
        fetchData
    ]);
    const handleUpdate = async ()=>{
        const notify = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState();
        setUpdating(true);
        setUpdatePhase("running");
        setUpdateSteps([]);
        try {
            const res = await fetch("/api/system/version", {
                method: "POST"
            });
            // If response is JSON (error/already up to date)
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const data = await res.json();
                if (!res.ok || !data.success) {
                    // #5991: the error envelope is `{ error: { code, message, correlation_id } }`.
                    // Passing the raw object to notify.error() rendered it as a React child →
                    // "Minified React error #31" crash ("Internal Server Error" screen), e.g. on
                    // the 403 from the loopback-only /api/system/version. Extract the string.
                    notify.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractApiErrorMessage"])(data, "Failed to start update."));
                    setUpdating(false);
                    setUpdatePhase("idle");
                    return;
                }
                notify.success(data.message || "Update started.");
                await pollBackgroundUpdate({
                    channel: data.channel || "docker-compose",
                    message: data.message || "",
                    targetVersion: data.to || data.latest
                });
                return;
            }
            // SSE stream — read progress events
            if (!res.body) {
                notify.error("No response stream received.");
                setUpdating(false);
                setUpdatePhase("idle");
                return;
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines){
                    if (!line.startsWith("data: ")) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        setUpdateSteps((prev)=>{
                            return mergeUpdateStep(prev, event);
                        });
                        if (event.step === "complete") {
                            setUpdatePhase("done");
                            setUpdating(false);
                            notify.success(event.message || "Update complete!");
                        } else if (event.step === "error") {
                            setUpdatePhase("failed");
                            notify.error(event.message || "Update failed.");
                            setUpdating(false);
                        }
                    } catch  {
                    // ignore parse errors
                    }
                }
            }
        } catch  {
            setUpdatePhase("failed");
            setUpdateSteps((prev)=>[
                    ...prev,
                    {
                        step: "error",
                        status: "failed",
                        message: "Network error — connection lost during update."
                    }
                ]);
            setUpdating(false);
        }
    };
    // Auto-reload after successful update (service restarts, need new page)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePageClient.useEffect": ()=>{
            if (updatePhase !== "done") return;
            const timer = setTimeout({
                "HomePageClient.useEffect.timer": ()=>{
                    globalThis.window.location.reload();
                }
            }["HomePageClient.useEffect.timer"], 8000);
            return ({
                "HomePageClient.useEffect": ()=>clearTimeout(timer)
            })["HomePageClient.useEffect"];
        }
    }["HomePageClient.useEffect"], [
        updatePhase
    ]);
    const stepLabels = {
        install: "Install Package",
        rebuild: "Rebuild Native Modules",
        restart: "Restart Service",
        complete: "Complete",
        error: "Error"
    };
    const showUpdateOverlay = updatePhase !== "idle";
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 790,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 791,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
            lineNumber: 789,
            columnNumber: 7
        }, this);
    }
    const currentEndpoint = baseUrl;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-8",
        children: [
            showUpdateOverlay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-bg-main border border-border rounded-2xl shadow-2xl max-w-md w-full p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-primary text-[28px] animate-spin",
                                    children: "progress_activity"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 805,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-bold",
                                            children: updatePhase === "done" ? "Update Complete!" : updatePhase === "failed" ? "Update Failed" : "Updating OmniRoute..."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 809,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted mt-0.5",
                                            children: updatePhase === "done" ? "The page will reload automatically in a few seconds." : updatePhase === "failed" ? "Please try again or update manually via the CLI." : "Do not close this page. The system will restart automatically."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 816,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 808,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 804,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                updateSteps.filter((s)=>s.step !== "complete" && s.step !== "error").map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${s.status === "running" ? "border-primary/40 bg-primary/5" : s.status === "done" ? "border-green-500/30 bg-green-500/5" : s.status === "failed" ? "border-red-500/30 bg-red-500/5" : "border-border bg-bg-subtle"}`,
                                        children: [
                                            s.status === "running" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-primary text-[18px] animate-spin",
                                                children: "progress_activity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 844,
                                                columnNumber: 23
                                            }, this) : s.status === "done" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-green-500 text-[18px]",
                                                children: "check_circle"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 848,
                                                columnNumber: 23
                                            }, this) : s.status === "failed" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-red-500 text-[18px]",
                                                children: "error"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 852,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-amber-500 text-[18px]",
                                                children: "warning"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 856,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium",
                                                        children: stepLabels[s.step] || s.step
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-text-muted truncate",
                                                        children: s.message
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 862,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 860,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, s.step, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 831,
                                        columnNumber: 19
                                    }, this)),
                                updateSteps.find((s)=>s.step === "error") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-1 px-3 py-2.5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-500",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-mono break-all",
                                        children: updateSteps.find((s)=>s.step === "error")?.message
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 870,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 869,
                                    columnNumber: 17
                                }, this),
                                updatePhase === "done" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-1 px-3 py-2.5 rounded-lg border border-green-500/30 bg-green-500/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-green-500 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[18px]",
                                                    children: "check_circle"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 880,
                                                    columnNumber: 21
                                                }, this),
                                                updateSteps.find((s)=>s.step === "complete")?.message || "Update complete!"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 879,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted mt-1",
                                            children: t("reloadingPageAutomatically")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 883,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 878,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 827,
                            columnNumber: 13
                        }, this),
                        (updatePhase === "failed" || updatePhase === "done") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    fullWidth: true,
                                    onClick: ()=>{
                                        setUpdating(false);
                                        setUpdatePhase("idle");
                                        setUpdateSteps([]);
                                        if (updatePhase === "done") globalThis.window.location.reload();
                                    },
                                    children: updatePhase === "done" ? "Reload Now" : "Close"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 891,
                                    columnNumber: 17
                                }, this),
                                updatePhase === "failed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    variant: "secondary",
                                    fullWidth: true,
                                    onClick: handleUpdate,
                                    children: "Retry"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 904,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 890,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 803,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 802,
                columnNumber: 9
            }, this),
            versionInfo?.updateAvailable && !showUpdateOverlay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/10 px-5 py-4 text-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-h-[48px] items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex min-w-0 items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined shrink-0 text-[24px]",
                                                children: isElectron && electronUpdateStatus.status === "downloading" ? "downloading" : "system_update_alt"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 920,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-semibold text-sm",
                                                        children: [
                                                            "Update Available: v",
                                                            versionInfo.latest,
                                                            " ",
                                                            isElectron && "(Desktop App)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 926,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs opacity-80 mt-0.5",
                                                        children: isElectron ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                electronUpdateStatus.status === "checking" && "Checking for updates...",
                                                                electronUpdateStatus.status === "available" && `Version v${versionInfo.latest} is available for download.`,
                                                                electronUpdateStatus.status === "downloading" && `Downloading update... ${electronUpdateStatus.percent || 0}% complete.`,
                                                                electronUpdateStatus.status === "downloaded" && "Update downloaded successfully! Click Restart & Install to apply.",
                                                                electronUpdateStatus.status === "error" && `Auto-update failed: ${electronUpdateStatus.message || "Unknown error"}.`,
                                                                (electronUpdateStatus.status === "idle" || electronUpdateStatus.status === "not-available") && `Version v${versionInfo.latest} is available for the desktop app.`
                                                            ]
                                                        }, void 0, true) : versionInfo.autoUpdateSupported ? t("updateAvailableDesc") || `You are currently using v${versionInfo.current}. Update to access the latest features and bug fixes.` : versionInfo.autoUpdateError || "Manual update required for this installation type."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 929,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 925,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 919,
                                        columnNumber: 15
                                    }, this),
                                    isElectron ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 shrink-0 ml-4",
                                        children: [
                                            electronUpdateStatus.status === "available" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                onClick: ()=>globalThis.window.electronAPI?.downloadUpdate(),
                                                className: "font-semibold",
                                                children: "Download Update"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 959,
                                                columnNumber: 21
                                            }, this),
                                            electronUpdateStatus.status === "downloading" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-primary text-[16px] animate-spin",
                                                        children: "progress_activity"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 969,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold",
                                                        children: [
                                                            electronUpdateStatus.percent || 0,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                        lineNumber: 972,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 968,
                                                columnNumber: 21
                                            }, this),
                                            electronUpdateStatus.status === "downloaded" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                onClick: ()=>globalThis.window.electronAPI?.installUpdate(),
                                                className: "font-semibold animate-pulse",
                                                children: "Restart & Install"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 978,
                                                columnNumber: 21
                                            }, this),
                                            (electronUpdateStatus.status === "error" || electronUpdateStatus.status === "idle" || electronUpdateStatus.status === "not-available") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                onClick: ()=>{
                                                    setElectronUpdateStatus({
                                                        status: "checking"
                                                    });
                                                    globalThis.window.electronAPI?.checkForUpdates().catch((err)=>{
                                                        setElectronUpdateStatus({
                                                            status: "error",
                                                            message: err.message
                                                        });
                                                    });
                                                },
                                                className: "font-semibold",
                                                children: "Check for Update"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 989,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 957,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        onClick: versionInfo.autoUpdateSupported ? handleUpdate : undefined,
                                        disabled: updating || !versionInfo.autoUpdateSupported,
                                        className: "ml-4 shrink-0 font-semibold",
                                        title: versionInfo.autoUpdateError || "",
                                        children: versionInfo.autoUpdateSupported ? t("updateNow") || "Update Now" : "Manual Update"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1004,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                lineNumber: 918,
                                columnNumber: 13
                            }, this),
                            isElectron && (electronUpdateStatus.status === "error" || electronUpdateStatus.status === "idle" || electronUpdateStatus.status === "available" || electronUpdateStatus.status === "not-available") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row sm:items-center justify-between border-t border-primary/20 mt-2 pt-3 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs opacity-75",
                                        children: "Or download the respective installer format directly:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1025,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                variant: "secondary",
                                                onClick: ()=>openExternal(`https://github.com/diegosouzapw/OmniRoute/releases/tag/v${versionInfo.latest}`),
                                                className: "font-semibold text-xs py-1",
                                                children: "Release Notes"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1029,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                onClick: ()=>openExternal(electronDownload.url),
                                                className: "font-semibold text-xs py-1",
                                                children: electronDownload.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1041,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1028,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                lineNumber: 1024,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                        lineNumber: 917,
                        columnNumber: 11
                    }, this),
                    versionInfo?.news && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-h-[64px] items-center justify-between rounded-lg border border-border bg-surface px-5 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-w-0 items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[22px] text-primary",
                                            children: versionInfo.news.icon || "campaign"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1058,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1057,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-text-main",
                                                children: versionInfo.news.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1063,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-0.5 max-w-[560px] text-xs leading-relaxed text-text-muted",
                                                children: versionInfo.news.message
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1064,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1062,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                lineNumber: 1056,
                                columnNumber: 15
                            }, this),
                            versionInfo.news.link && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: versionInfo.news.link,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-bg px-4 py-2 text-xs font-semibold text-text-main transition-colors hover:border-primary/30 hover:text-primary",
                                children: [
                                    versionInfo.news.linkLabel || "Ler Mais",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "arrow_forward"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1078,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                lineNumber: 1071,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                        lineNumber: 1055,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 916,
                columnNumber: 9
            }, this),
            pinProviderQuotaToHome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1088,
                    columnNumber: 29
                }, this),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderQuotaWidget, {
                    autoRefreshInterval: autoRefreshProviderQuota ? autoRefreshProviderQuotaInterval : 0
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1089,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 1088,
                columnNumber: 9
            }, this),
            showQuickStartOnHome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold",
                                            children: t("quickStart")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1101,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-text-muted",
                                            children: t("quickStartDesc")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1102,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1100,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/docs",
                                    prefetch: false,
                                    className: DOCS_LINK,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "menu_book"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1105,
                                            columnNumber: 17
                                        }, this),
                                        t("fullDocs")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1104,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1099,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "rounded-lg border border-border bg-bg-subtle p-4 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: "key"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1113,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1112,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: t("step1Title")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1116,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-text-muted mt-0.5",
                                                    children: t.rich("step1Desc", {
                                                        endpoint: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/dashboard/api-manager",
                                                                prefetch: false,
                                                                className: INLINE_LINK,
                                                                children: chunks
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                                lineNumber: 1120,
                                                                columnNumber: 25
                                                            }, this)
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1117,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1115,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1111,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "rounded-lg border border-border bg-bg-subtle p-4 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center size-8 rounded-lg bg-green-500/10 text-green-500 shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: "dns"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1134,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1133,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: t("step2Title")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1137,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-text-muted mt-0.5",
                                                    children: t.rich("step2Desc", {
                                                        providers: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/dashboard/providers",
                                                                prefetch: false,
                                                                className: INLINE_LINK,
                                                                children: chunks
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                                lineNumber: 1141,
                                                                columnNumber: 25
                                                            }, this)
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1138,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1136,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1132,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "rounded-lg border border-border bg-bg-subtle p-4 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center size-8 rounded-lg bg-blue-500/10 text-blue-500 shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: "link"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1151,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1150,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: t("step3Title")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1154,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-text-muted mt-0.5",
                                                    children: t("step3Desc", {
                                                        url: currentEndpoint
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1155,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1153,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1149,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "rounded-lg border border-border bg-bg-subtle p-4 flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center size-8 rounded-lg bg-amber-500/10 text-amber-500 shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: "analytics"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                lineNumber: 1162,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1161,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: t("step4Title")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1165,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-text-muted mt-0.5",
                                                    children: t.rich("step4Desc", {
                                                        logs: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/dashboard/logs",
                                                                prefetch: false,
                                                                className: INLINE_LINK,
                                                                children: chunks
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                                lineNumber: 1169,
                                                                columnNumber: 25
                                                            }, this),
                                                        analytics: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/dashboard/analytics",
                                                                prefetch: false,
                                                                className: INLINE_LINK,
                                                                children: chunks
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                                lineNumber: 1174,
                                                                columnNumber: 25
                                                            }, this)
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                                    lineNumber: 1166,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1164,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1160,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1110,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1098,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 1097,
                columnNumber: 9
            }, this),
            showProviderTopologyOnHome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$HomeProviderTopologySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HomeProviderTopologySection"], {
                providers: topologyProviders,
                lastProvider: lastProvider,
                errorProvider: errorProvider,
                enabled: showProviderTopologyOnHome
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 1188,
                columnNumber: 9
            }, this),
            selectedProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderModelsModal, {
                provider: selectedProvider,
                models: selectedProviderModels,
                onClose: ()=>setSelectedProvider(null)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                lineNumber: 1198,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
        lineNumber: 799,
        columnNumber: 5
    }, this);
}
_s(HomePageClient, "VvKQmDYYZFa18JUG02Cz/t/V1pc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useElectron$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsElectron"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useElectron$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpenExternal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = HomePageClient;
function ProviderOverviewCard({ item, metrics, onClick }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("home");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const statusVariant = item.errors > 0 ? "text-red-500" : item.connected > 0 ? "text-green-500" : "text-text-muted";
    const authTypeConfig = {
        "no-auth": {
            color: "bg-stone-500",
            label: "No Auth"
        },
        free: {
            color: "bg-green-500",
            label: tc("free")
        },
        oauth: {
            color: "bg-blue-500",
            label: t("oauthLabel")
        },
        apikey: {
            color: "bg-amber-500",
            label: t("apiKeyLabel")
        }
    };
    const authInfo = authTypeConfig[item.authType] || authTypeConfig.apikey;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: "border border-border rounded-lg p-3 hover:bg-surface/40 transition-colors text-left cursor-pointer w-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "size-8 rounded-lg flex items-center justify-center shrink-0",
                    style: {
                        backgroundColor: `${item.provider.color || "#888"}15`
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        providerId: item.provider.id,
                        size: 26,
                        type: "color"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                        lineNumber: 1241,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1237,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-w-0 flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold truncate",
                                    children: item.provider.name
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1246,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `size-2 rounded-full ${authInfo.color} shrink-0`,
                                    title: authInfo.label
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1247,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1245,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: `text-xs ${statusVariant}`,
                            children: item.total === 0 ? tc("notConfigured") : t("activeError", {
                                active: item.connected,
                                errors: item.errors
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1252,
                            columnNumber: 11
                        }, this),
                        metrics && metrics.totalRequests > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mt-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-text-muted",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-emerald-500",
                                            children: metrics.totalSuccesses
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1260,
                                            columnNumber: 17
                                        }, this),
                                        "/",
                                        t("requestsShort", {
                                            count: metrics.totalRequests
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1259,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-text-muted",
                                    children: [
                                        metrics.successRate,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1263,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-text-muted",
                                    children: [
                                        "~",
                                        metrics.avgLatencyMs,
                                        "ms"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1264,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1258,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1244,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-right shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-medium text-text-main",
                            children: item.modelCount
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1270,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-text-muted",
                            children: tc("models")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1271,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1269,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
            lineNumber: 1236,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
        lineNumber: 1232,
        columnNumber: 5
    }, this);
}
_s1(ProviderOverviewCard, "UDvIaiqwzEIf8m3QPSwIyu5wmF0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = ProviderOverviewCard;
function ProviderModelsModal({ provider, models, onClose }) {
    _s2();
    const [copiedModel, setCopiedModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("home");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const ts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("sidebar");
    const navigateTo = (path)=>{
        onClose();
        router.push(path);
    };
    const handleCopy = async (text)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyToClipboard"])(text);
        setCopiedModel(text);
        notify.success(t("copiedModel", {
            model: text
        }));
        setTimeout(()=>setCopiedModel(null), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: true,
        title: t("providerModelsTitle", {
            provider: provider.provider.name
        }),
        onClose: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-sm text-text-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[16px]",
                            children: "token"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1315,
                            columnNumber: 11
                        }, this),
                        models.length === 1 ? t("modelAvailable", {
                            count: models.length
                        }) : t("modelsAvailable", {
                            count: models.length
                        }),
                        provider.total > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "ml-auto text-xs text-green-500",
                            children: [
                                "●",
                                " ",
                                provider.connected === 1 ? t("connectionsActive", {
                                    count: provider.connected
                                }) : t("connectionsActivePlural", {
                                    count: provider.connected
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1320,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1314,
                    columnNumber: 9
                }, this),
                models.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[32px] text-text-muted mb-2",
                            children: "search_off"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1331,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted",
                            children: t("noModelsAvailable")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1334,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted mt-1",
                            children: t("configureFirst", {
                                providers: ts("providers")
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1335,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1330,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 max-h-[400px] overflow-y-auto",
                    children: models.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface/50 transition-colors group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0 flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-sm text-text-main truncate",
                                            children: m.fullModel
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1347,
                                            columnNumber: 19
                                        }, this),
                                        m.alias !== m.model && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted",
                                            children: [
                                                t("aliasLabel"),
                                                ": ",
                                                m.alias
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                            lineNumber: 1349,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1346,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleCopy(m.fullModel),
                                    className: "shrink-0 ml-2 p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-subtle transition-colors opacity-0 group-hover:opacity-100",
                                    title: t("copyModelName"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: copiedModel === m.fullModel ? "check" : "content_copy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                        lineNumber: 1359,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1354,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, m.fullModel, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1342,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1340,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2 pt-2 border-t border-border",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "secondary",
                            fullWidth: true,
                            size: "sm",
                            onClick: ()=>navigateTo(`/dashboard/providers/${provider.id}`),
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px] mr-1",
                                    children: "settings"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                                    lineNumber: 1377,
                                    columnNumber: 13
                                }, this),
                                t("configureProvider")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1370,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            onClick: onClose,
                            children: tc("close")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                            lineNumber: 1380,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
                    lineNumber: 1369,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
            lineNumber: 1312,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/HomePageClient.tsx",
        lineNumber: 1307,
        columnNumber: 5
    }, this);
}
_s2(ProviderModelsModal, "ULOaglsyRg0gsfrNmEwVI01nzwo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c3 = ProviderModelsModal;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "ProviderQuotaWidget");
__turbopack_context__.k.register(_c1, "HomePageClient");
__turbopack_context__.k.register(_c2, "ProviderOverviewCard");
__turbopack_context__.k.register(_c3, "ProviderModelsModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BootstrapBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function BootstrapBanner() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [dismissed, setDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (dismissed) return null;
    // Determine default data dir hint based on platform hint from user-agent
    const dataDir = typeof navigator !== "undefined" && navigator.platform?.startsWith("Win") ? "%APPDATA%\\omniroute\\server.env" : "~/.omniroute/server.env";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "alert",
        className: "flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-amber-500 dark:text-amber-400 text-base shrink-0 mt-0.5",
                children: "⚠️"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-semibold text-amber-900 dark:text-amber-300",
                        children: "Running in zero-config mode"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-amber-800/80 dark:text-amber-200/80",
                        children: [
                            "OmniRoute auto-generated secure encryption keys on first launch. They are persisted to",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "font-mono bg-amber-200/50 dark:bg-amber-500/20 px-1 rounded text-xs",
                                children: dataDir
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            ". No action is required — your data is encrypted and safe. To use custom keys, add",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "font-mono bg-amber-200/50 dark:bg-amber-500/20 px-1 rounded text-xs",
                                children: "JWT_SECRET"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            " ",
                            "and",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "font-mono bg-amber-200/50 dark:bg-amber-500/20 px-1 rounded text-xs",
                                children: "STORAGE_ENCRYPTION_KEY"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            " ",
                            "to that file."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setDismissed(true),
                className: "shrink-0 text-amber-600/60 hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-300 transition-colors ml-1",
                "aria-label": t("bootstrapBannerDismiss"),
                children: "✕"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/BootstrapBanner.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(BootstrapBanner, "MYfKxDEgxECPl0ehf1z3uqHXAC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = BootstrapBanner;
var _c;
__turbopack_context__.k.register(_c, "BootstrapBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/system/versionCompare.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure semver comparison helpers, split out of `versionCheck.ts` so they are
 * importable from CLIENT components without dragging that module's server-only
 * top-level `import { execFile } from "child_process"` into the browser bundle.
 *
 * `versionCheck.ts` re-exports both names for back-compat; new client-reachable
 * callers (e.g. `kimiSponsorBannerGate.ts`) MUST import from here instead — a
 * value-import of the server module breaks the Turbopack `next build` with
 * "Module not found: Can't resolve 'child_process'" (the client bundle cannot
 * tree-shake a top-level Node built-in import away).
 *
 * This file must stay dependency-free (no Node built-ins, no logger, no
 * installer utils) so it is safe in any bundling context.
 */ /**
 * Strip a leading `v`, drop pre-release/build metadata (`-`/`+` suffix), split on `.`,
 * and return a numeric tuple. Returns null when the string is empty or any segment is
 * non-numeric, so callers can fail safe instead of comparing `NaN`.
 */ __turbopack_context__.s([
    "isNewer",
    ()=>isNewer,
    "normalizeVersion",
    ()=>normalizeVersion
]);
function normalizeVersion(v) {
    if (typeof v !== "string") return null;
    const cleaned = v.trim().replace(/^v/i, "").split(/[-+]/)[0];
    if (!cleaned) return null;
    const parts = cleaned.split(".").map((p)=>Number(p));
    if (parts.length === 0 || parts.some((n)=>!Number.isFinite(n))) return null;
    return parts;
}
function isNewer(latest, current) {
    if (!latest) return false;
    const a = normalizeVersion(latest);
    const b = normalizeVersion(current);
    if (!a || !b) return false;
    const len = Math.max(a.length, b.length);
    for(let i = 0; i < len; i++){
        const av = a[i] ?? 0;
        const bv = b[i] ?? 0;
        if (av !== bv) return av > bv;
    }
    return false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/kimiSponsorBannerGate.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIMI_SPONSOR_BANNER_THROUGH_VERSION",
    ()=>KIMI_SPONSOR_BANNER_THROUGH_VERSION,
    "shouldShowKimiSponsorBanner",
    ()=>shouldShowKimiSponsorBanner
]);
// Kimi (Moonshot AI) official-partnership sponsor banner — version gate.
//
// Pure logic split out of KimiSponsorBanner.tsx so the gate can be unit-tested
// with node:test (no DOM/next-intl needed), mirroring homeAppearance.ts.
// Import the pure helpers from versionCompare (NOT versionCheck): this module is
// pulled into the "use client" KimiSponsorBanner bundle, and versionCheck.ts's
// top-level child_process import would break the Turbopack client build (#7872 VPS build).
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$system$2f$versionCompare$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/system/versionCompare.ts [app-client] (ecmascript)");
;
const KIMI_SPONSOR_BANNER_THROUGH_VERSION = "3.8.60";
function shouldShowKimiSponsorBanner(currentVersion) {
    if (typeof currentVersion !== "string") return false;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$system$2f$versionCompare$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeVersion"])(currentVersion)) return false;
    // isNewer(a, b) is true iff a > b — so isNewer(current, THROUGH) is true
    // exactly when current is past the sunset version. Negate for "<=".
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$system$2f$versionCompare$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isNewer"])(currentVersion, KIMI_SPONSOR_BANNER_THROUGH_VERSION);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KimiSponsorBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$kimiSponsorBannerGate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/kimiSponsorBannerGate.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// Official Kimi partnership tracking link — keep in sync with README.md's
// Sponsors section and the aff links wired in the providers onboarding UI
// (ProviderPageHeader.tsx).
const KIMI_CODING_AFF_URL = "https://www.kimi.com/code?aff=omniroute";
// Versioned dismissal key — bump the suffix (e.g. `-v2`) if the banner's
// offer/copy ever changes materially enough to warrant re-showing it to
// users who already dismissed the previous version.
const DISMISS_STORAGE_KEY = "omniroute-kimi-sponsor-banner-dismissed-v1";
// Same-tab signal for the dismiss button, since writing localStorage doesn't
// fire a "storage" event in the tab that wrote it.
const DISMISS_EVENT = "omniroute:kimi-sponsor-banner-dismissed";
function isNotDismissed() {
    try {
        return !localStorage.getItem(DISMISS_STORAGE_KEY);
    } catch  {
        return true;
    }
}
function subscribe(callback) {
    window.addEventListener(DISMISS_EVENT, callback);
    return ()=>window.removeEventListener(DISMISS_EVENT, callback);
}
// SSR has no localStorage, so the server always renders the banner visible;
// useSyncExternalStore reconciles that against the real client-side value
// right after hydration (mirroring useTheme's systemPrefersDark pattern),
// with no hydration mismatch and no setState-in-effect.
function getServerSnapshot() {
    return true;
}
function KimiSponsorBanner() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("kimiSponsorBanner");
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, isNotDismissed, getServerSnapshot);
    if (!visible || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$kimiSponsorBannerGate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shouldShowKimiSponsorBanner"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_CONFIG"].version)) {
        return null;
    }
    const dismiss = ()=>{
        try {
            localStorage.setItem(DISMISS_STORAGE_KEY, "true");
        } catch  {
        // ignore — worst case the banner reappears next visit
        }
        window.dispatchEvent(new Event(DISMISS_EVENT));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "complementary",
        "aria-label": t("title"),
        className: "mb-4 flex flex-col gap-3 rounded-lg border border-[#1783FF]/30 bg-[#1783FF]/5 px-4 py-3 dark:bg-[#1783FF]/10 sm:flex-row sm:items-center sm:justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1783FF]/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            providerId: "moonshot",
                            size: 24,
                            type: "color"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-text-main",
                                children: t("title")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-xs text-text-muted",
                                children: t("description")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-3 self-end sm:self-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-end gap-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: KIMI_CODING_AFF_URL,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                title: t("partnerLinkNote"),
                                className: "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1783FF] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:brightness-110",
                                children: [
                                    t("cta"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        "aria-hidden": "true",
                                        children: "open_in_new"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[9px] text-text-muted/70",
                                children: t("partnerLinkNote")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: dismiss,
                        "aria-label": t("dismissAriaLabel"),
                        className: "text-text-muted transition-colors hover:text-text-main",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/KimiSponsorBanner.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_s(KimiSponsorBanner, "5jrpTgCSj7SO6aMGcamljGi/j/Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = KimiSponsorBanner;
var _c;
__turbopack_context__.k.register(_c, "KimiSponsorBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_16fzgyt._.js.map