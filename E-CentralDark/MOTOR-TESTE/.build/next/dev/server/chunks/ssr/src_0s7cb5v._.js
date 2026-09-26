module.exports = [
"[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/shared/components/SegmentedControl.tsx [app-ssr] (ecmascript) <export default as SegmentedControl>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SegmentedControl",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/SegmentedControl.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/shared/hooks/useDisplayBaseUrl.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_DISPLAY_BASE_URL",
    ()=>DEFAULT_DISPLAY_BASE_URL,
    "isPublicDisplayBaseUrl",
    ()=>isPublicDisplayBaseUrl,
    "normalizeBasePath",
    ()=>normalizeBasePath,
    "resolveDeployBasePath",
    ()=>resolveDeployBasePath,
    "resolveDisplayBaseUrl",
    ()=>resolveDisplayBaseUrl,
    "useDisplayBaseUrl",
    ()=>useDisplayBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const DEFAULT_DISPLAY_BASE_URL = "http://localhost:20128";
function normalizeUrl(value) {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    return trimmed.replace(/\/+$/, "");
}
function normalizeBasePath(value) {
    const trimmed = value?.trim() ?? "";
    if (!trimmed || trimmed === "/") return "";
    const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return withSlash.replace(/\/+$/, "");
}
function resolveDeployBasePath(envBasePath, configuredBaseUrl, browserPathname) {
    const fromEnv = normalizeBasePath(envBasePath ?? (typeof process !== "undefined" ? ("TURBOPACK compile-time value", "") || process.env.OMNIROUTE_BASE_PATH : undefined));
    if (fromEnv) return fromEnv;
    const configured = normalizeUrl(configuredBaseUrl ?? undefined);
    if (configured) {
        try {
            const path = normalizeBasePath(new URL(configured).pathname);
            if (path) return path;
        } catch  {
        /* ignore invalid URL */ }
    }
    // browserPathname kept for API symmetry with resolveDisplayBaseUrl; basePath
    // must come from env / configured URL so root deploys never invent a prefix.
    void browserPathname;
    return "";
}
/** RFC1918 + special-use IPv4 ranges treated as non-public for display purposes. */ const PRIVATE_IPV4_RANGES = [
    {
        firstMin: 0,
        firstMax: 0,
        secondMin: -Infinity,
        secondMax: Infinity
    },
    {
        firstMin: 10,
        firstMax: 10,
        secondMin: -Infinity,
        secondMax: Infinity
    },
    {
        firstMin: 127,
        firstMax: 127,
        secondMin: -Infinity,
        secondMax: Infinity
    },
    {
        firstMin: 224,
        firstMax: Infinity,
        secondMin: -Infinity,
        secondMax: Infinity
    },
    {
        firstMin: 100,
        firstMax: 100,
        secondMin: 64,
        secondMax: 127
    },
    {
        firstMin: 169,
        firstMax: 169,
        secondMin: 254,
        secondMax: 254
    },
    {
        firstMin: 172,
        firstMax: 172,
        secondMin: 16,
        secondMax: 31
    },
    {
        firstMin: 192,
        firstMax: 192,
        secondMin: 168,
        secondMax: 168
    }
];
function isInIpv4Range(first, second, range) {
    return first >= range.firstMin && first <= range.firstMax && second >= range.secondMin && second <= range.secondMax;
}
function isPrivateIpv4(hostname) {
    const octets = hostname.split(".").map(Number);
    if (octets.length !== 4 || octets.some((octet)=>!Number.isInteger(octet))) return false;
    const [first, second] = octets;
    return PRIVATE_IPV4_RANGES.some((range)=>isInIpv4Range(first, second, range));
}
function isSupportedProtocol(protocol) {
    return protocol === "http:" || protocol === "https:";
}
function isLoopbackHostname(hostname) {
    return !hostname || hostname === "localhost" || hostname.endsWith(".localhost");
}
function isMulticastDnsHostname(hostname) {
    return hostname.endsWith(".local");
}
function isIpv6LoopbackOrUnspecified(hostname) {
    return hostname === "::" || hostname === "::1";
}
function isIpv6UniqueLocal(hostname) {
    // RFC 4193 Unique Local Addresses: fc00::/7 (prefixes "fc" and "fd").
    return hostname.startsWith("fc") || hostname.startsWith("fd");
}
const IPV6_LINK_LOCAL_PATTERN = /^fe[89ab]/;
function isIpv6LinkLocal(hostname) {
    // RFC 4291 link-local: fe80::/10.
    return IPV6_LINK_LOCAL_PATTERN.test(hostname);
}
/** Combines the IPv6-specific non-public checks the caller gates on `isIpv6`. */ function isNonPublicIpv6(hostname) {
    return isIpv6LoopbackOrUnspecified(hostname) || isIpv6UniqueLocal(hostname) || isIpv6LinkLocal(hostname);
}
function isPublicDisplayBaseUrl(value) {
    const normalized = normalizeUrl(value);
    if (!normalized) return false;
    try {
        const parsed = new URL(normalized);
        if (!isSupportedProtocol(parsed.protocol)) return false;
        const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
        if (isLoopbackHostname(hostname)) return false;
        if (isMulticastDnsHostname(hostname) || isPrivateIpv4(hostname)) return false;
        // IPv6-only checks stay gated on isIpv6 — hostnames like "fdroid.example.com"
        // legitimately start with "fd" and must not be misclassified as ULA addresses.
        const isIpv6 = hostname.includes(":");
        if (isIpv6 && isNonPublicIpv6(hostname)) return false;
        return true;
    } catch  {
        return false;
    }
}
function urlPathname(value) {
    try {
        return normalizeBasePath(new URL(value).pathname);
    } catch  {
        return "";
    }
}
function joinOriginAndBasePath(origin, basePath) {
    if (!basePath) return origin;
    return `${origin.replace(/\/+$/, "")}${basePath}`;
}
function resolveDisplayBaseUrl(envValue, browserOrigin, browserPathname, envBasePath) {
    const configuredUrl = normalizeUrl(envValue);
    const currentOrigin = normalizeUrl(browserOrigin);
    const basePath = resolveDeployBasePath(envBasePath, configuredUrl, browserPathname);
    // Configured public URL that already includes a non-root path wins (subpath deploy).
    // Example: NEXT_PUBLIC_BASE_URL=https://host/omniroute must not be collapsed to
    // https://host when the browser origin is the same host without a path.
    if (configuredUrl && isPublicDisplayBaseUrl(configuredUrl) && urlPathname(configuredUrl)) {
        return configuredUrl;
    }
    // Reachable public browser origin, with basePath re-applied when configured.
    // Existing behavior: prefer the live origin over a different configured *host*
    // (tunnels / alternate domains). basePath keeps /v1 examples correct under
    // reverse-proxy subpaths (OMNIROUTE_BASE_PATH).
    if (currentOrigin && isPublicDisplayBaseUrl(currentOrigin)) {
        return joinOriginAndBasePath(currentOrigin, basePath);
    }
    // Configured public URL without a path — append basePath if present.
    if (configuredUrl && isPublicDisplayBaseUrl(configuredUrl)) {
        return joinOriginAndBasePath(configuredUrl, basePath);
    }
    const fallback = currentOrigin ?? configuredUrl ?? DEFAULT_DISPLAY_BASE_URL;
    return joinOriginAndBasePath(fallback, basePath);
}
function useDisplayBaseUrl() {
    const envValue = normalizeUrl(("TURBOPACK compile-time value", "http://localhost:20128"));
    const envBasePath = normalizeBasePath(("TURBOPACK compile-time value", "") || process.env.OMNIROUTE_BASE_PATH);
    const [url, setUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>resolveDisplayBaseUrl(envValue ?? undefined, undefined, undefined, envBasePath || undefined));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const resolvedUrl = resolveDisplayBaseUrl(envValue ?? undefined, window.location.origin, window.location.pathname, envBasePath || undefined);
        // Schedule via queueMicrotask so setState is called inside a callback,
        // not synchronously in the effect body (react-hooks/set-state-in-effect).
        // The unmounted guard prevents a stale setState on a torn-down root
        // (relevant under React strict mode's double-invoke, where cleanup runs
        // before the microtask fires on the first effect invocation).
        let unmounted = false;
        queueMicrotask(()=>{
            if (!unmounted) setUrl(resolvedUrl);
        });
        return ()=>{
            unmounted = true;
        };
    }, [
        envValue,
        envBasePath
    ]);
    return url;
}
}),
"[project]/src/shared/hooks/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Shared Hooks - Export all
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useTheme.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useDisplayBaseUrl.ts [app-ssr] (ecmascript)");
;
;
}),
"[project]/src/shared/utils/compatibleProviderId.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isCompatibleProviderConnectionId",
    ()=>isCompatibleProviderConnectionId
]);
/**
 * Single source of truth for recognizing a "compatible provider" connection
 * ID — the dynamic IDs generated for openai-compatible / anthropic-compatible
 * custom nodes (src/app/api/provider-nodes/route.ts).
 *
 * Generated shapes (all four must match):
 *   - openai-compatible-chat-<uuid>
 *   - openai-compatible-responses-<uuid>
 *   - anthropic-compatible-<uuid>
 *   - anthropic-compatible-cc-<uuid>
 *
 * Built from the same prefix constants used at ID-generation time
 * (src/shared/constants/providers.ts) so the generator and the validator can
 * never drift apart again. See #8326: the previous inline regex required a
 * literal "-chat-" segment, rejecting 3 of the 4 shapes the system actually
 * generates.
 *
 * @module shared/utils/compatibleProviderId
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const COMPATIBLE_PROVIDER_ID_PATTERN = new RegExp(`^(?:${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OPENAI_COMPATIBLE_PREFIX"]}(?:chat|responses)-|${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTHROPIC_COMPATIBLE_PREFIX"]}(?:cc-)?)[0-9a-f-]+$`, "i");
function isCompatibleProviderConnectionId(providerId) {
    return typeof providerId === "string" && COMPATIBLE_PROVIDER_ID_PATTERN.test(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/display/names.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAccountDisplayName",
    ()=>getAccountDisplayName,
    "getProviderDisplayName",
    ()=>getProviderDisplayName
]);
/**
 * Centralized display name helpers for provider and account/connection labels.
 *
 * Prevents raw internal IDs (connection UUIDs, dynamic provider IDs) from
 * leaking into user-facing dashboards (Health, Analytics, Sessions, Rate-limits,
 * Quota, Compatible Provider pages, etc.).
 *
 * Priority order:
 *   — Account: name → displayName → email → short readble label
 *   — Provider: node.name → node.prefix → alias → readable ID
 *
 * @module lib/display/names
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getAccountDisplayName(conn) {
    if (!conn) return "Unknown Account";
    const name = typeof conn.name === "string" && conn.name.trim() || typeof conn.displayName === "string" && conn.displayName.trim() || typeof conn.email === "string" && conn.email.trim();
    if (name) return name;
    if (typeof conn.id === "string" && conn.id) {
        return `Account #${conn.id.slice(0, 6)}`;
    }
    return "Unknown Account";
}
function getProviderDisplayName(providerId, providerNode) {
    if (providerNode?.name?.trim()) return providerNode.name.trim();
    if (providerNode?.prefix?.trim()) return providerNode.prefix.trim();
    if (!providerId) return "Unknown Provider";
    // Simplify dynamic compatible provider IDs (all 4 generated shapes — #8326)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(providerId)) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return "CC Compatible";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId)) return "Compatible (openai)";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId)) return "Compatible (anthropic)";
    }
    return providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>A2ADashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
const PAGE_SIZE = 20;
const TASK_STATES = [
    "all",
    "submitted",
    "working",
    "completed",
    "failed",
    "cancelled"
];
function stateClass(state) {
    if (state === "completed") return "bg-green-500/15 text-green-500";
    if (state === "failed") return "bg-red-500/15 text-red-500";
    if (state === "working") return "bg-amber-500/15 text-amber-500";
    if (state === "cancelled") return "bg-gray-500/15 text-gray-400";
    return "bg-blue-500/15 text-blue-500";
}
function A2ADashboardPage() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("a2aDashboard");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [stateFilter, setStateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [skillFilter, setSkillFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [offset, setOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [tasksData, setTasksData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        tasks: [],
        total: 0,
        limit: PAGE_SIZE,
        offset: 0
    });
    const [tasksLoading, setTasksLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedTask, setSelectedTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionMessage, setActionMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [actionBusy, setActionBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const response = await fetch("/api/a2a/status");
        if (!response.ok) return;
        const json = await response.json();
        setStatus(json);
    }, []);
    const refreshTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setTasksLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", String(PAGE_SIZE));
            params.set("offset", String(offset));
            if (stateFilter !== "all") params.set("state", stateFilter);
            if (skillFilter) params.set("skill", skillFilter);
            const response = await fetch(`/api/a2a/tasks?${params.toString()}`);
            if (!response.ok) return;
            const json = await response.json();
            setTasksData({
                tasks: Array.isArray(json.tasks) ? json.tasks : [],
                total: Number(json.total || 0),
                limit: Number(json.limit || PAGE_SIZE),
                offset: Number(json.offset || 0)
            });
        } finally{
            setTasksLoading(false);
        }
    }, [
        offset,
        stateFilter,
        skillFilter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        Promise.allSettled([
            refreshStatus(),
            refreshTasks()
        ]).finally(()=>setLoading(false));
        const interval = setInterval(()=>{
            void refreshStatus();
            void refreshTasks();
        }, 30000);
        return ()=>clearInterval(interval);
    }, [
        refreshStatus,
        refreshTasks
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void refreshTasks();
    }, [
        refreshTasks
    ]);
    const availableSkills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const values = new Set();
        for (const skill of status?.skills || [])values.add(skill.id);
        for (const task of tasksData.tasks)values.add(task.skill);
        return Array.from(values.values()).sort();
    }, [
        status,
        tasksData.tasks
    ]);
    const currentPage = Math.floor(tasksData.offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(tasksData.total / PAGE_SIZE));
    const handleLoadTask = async (taskId)=>{
        const response = await fetch(`/api/a2a/tasks/${encodeURIComponent(taskId)}`);
        if (!response.ok) return;
        const json = await response.json();
        setSelectedTask(json.task || null);
    };
    const handleCancelTask = async (taskId)=>{
        if (!globalThis.confirm(t("confirmCancelTask", {
            taskId
        }))) return;
        setActionBusy("cancel");
        setActionMessage("");
        try {
            const response = await fetch(`/api/a2a/tasks/${encodeURIComponent(taskId)}/cancel`, {
                method: "POST"
            });
            if (!response.ok) {
                const json = await response.json().catch(()=>({}));
                setActionMessage(json?.error || t("cancelTaskFailed"));
                return;
            }
            setActionMessage(t("cancelTaskSuccess", {
                taskId
            }));
            await refreshStatus();
            await refreshTasks();
            if (selectedTask?.id === taskId) {
                await handleLoadTask(taskId);
            }
        } finally{
            setActionBusy(null);
        }
    };
    const handleSmokeSend = async ()=>{
        setActionBusy("send");
        setActionMessage("");
        try {
            const response = await fetch("/a2a", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "dashboard-send",
                    method: "message/send",
                    params: {
                        skill: "quota-management",
                        messages: [
                            {
                                role: "user",
                                content: "Show a short quota summary."
                            }
                        ]
                    }
                })
            });
            const json = await response.json().catch(()=>({}));
            if (!response.ok || json?.error) {
                setActionMessage(json?.error?.message || t("smokeSendFailed"));
                return;
            }
            const taskId = json?.result?.task?.id;
            setActionMessage(taskId ? t("smokeSendSuccessWithTask", {
                taskId
            }) : t("smokeSendSuccess"));
            await refreshStatus();
            await refreshTasks();
        } finally{
            setActionBusy(null);
        }
    };
    const handleSmokeStream = async ()=>{
        setActionBusy("stream");
        setActionMessage("");
        try {
            const response = await fetch("/a2a", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "dashboard-stream",
                    method: "message/stream",
                    params: {
                        skill: "quota-management",
                        messages: [
                            {
                                role: "user",
                                content: "Stream a short quota summary."
                            }
                        ]
                    }
                })
            });
            if (!response.ok || !response.body) {
                const text = await response.text().catch(()=>"");
                setActionMessage(text || t("smokeStreamFailed"));
                return;
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let streamTaskId = null;
            let terminalState = null;
            while(true){
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const parts = buffer.split("\n\n");
                buffer = parts.pop() || "";
                for (const part of parts){
                    if (!part.startsWith("data: ")) continue;
                    const payload = part.slice("data: ".length);
                    let parsed;
                    try {
                        parsed = JSON.parse(payload);
                    } catch  {
                        continue;
                    }
                    const nextTaskId = parsed?.params?.task?.id;
                    const nextState = parsed?.params?.task?.state;
                    if (nextTaskId) streamTaskId = nextTaskId;
                    if (typeof nextState === "string") {
                        if ([
                            "completed",
                            "failed",
                            "cancelled"
                        ].includes(nextState)) {
                            terminalState = nextState;
                        }
                    }
                }
            }
            if (streamTaskId) {
                setActionMessage(t("smokeStreamSuccessWithTask", {
                    taskId: streamTaskId,
                    stateSuffix: terminalState ? `, ${t(`state.${terminalState}`)}` : ""
                }));
            } else {
                setActionMessage(t("smokeStreamNoTaskId"));
            }
            await refreshStatus();
            await refreshTasks();
        } finally{
            setActionBusy(null);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-text-muted",
            children: t("loading")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
            lineNumber: 298,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("health"),
                        value: status?.status === "ok" ? t("ok") : "—"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 304,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("totalTasks"),
                        value: status?.tasks?.total || 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 305,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("activeStreams"),
                        value: status?.tasks?.activeStreams || 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 306,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("lastTask"),
                        value: status?.tasks?.lastTaskAt ? new Date(status.tasks.lastTaskAt).toLocaleTimeString() : "—"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 307,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: t("taskStateOverview")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 316,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-5 gap-3",
                        children: [
                            "submitted",
                            "working",
                            "completed",
                            "failed",
                            "cancelled"
                        ].map((state)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 bg-bg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted uppercase",
                                        children: t(`state.${state}`)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-semibold mt-1",
                                        children: status?.tasks?.counts?.[state] || 0
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 322,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, state, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 320,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 317,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 xl:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        className: "p-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold mb-3",
                                children: t("agentCard")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 331,
                                columnNumber: 11
                            }, this),
                            status?.agent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold",
                                        children: status.agent.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 334,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-text-muted",
                                        children: status.agent.description
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            t("version"),
                                            ": ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono",
                                                children: status.agent.version
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 337,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 336,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            t("url"),
                                            ": ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono text-xs break-all",
                                                children: status.agent.url
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 340,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 339,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase text-text-muted mb-1",
                                                children: t("capabilities")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 343,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                className: "text-xs break-all",
                                                children: JSON.stringify(status.capabilities || {}, null, 2)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 344,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 342,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 333,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted",
                                children: t("agentCardNotAvailable")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 330,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        className: "p-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold mb-3",
                                children: t("quickValidation")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mb-3",
                                children: t("quickValidationDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "secondary",
                                        onClick: handleSmokeSend,
                                        disabled: actionBusy !== null,
                                        children: t("runMessageSend")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 358,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "secondary",
                                        onClick: handleSmokeStream,
                                        disabled: actionBusy !== null,
                                        children: t("runMessageStream")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 366,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 357,
                                columnNumber: 11
                            }, this),
                            actionMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mt-3",
                                children: actionMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 375,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 354,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 329,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-end justify-between gap-3 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold",
                                        children: t("taskManagement")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 382,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-text-muted",
                                        children: t("taskSummary", {
                                            total: tasksData.total,
                                            page: currentPage,
                                            totalPages
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 381,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: stateFilter,
                                        onChange: (event)=>{
                                            setOffset(0);
                                            setStateFilter(event.target.value);
                                        },
                                        children: TASK_STATES.map((state)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: state,
                                                children: state === "all" ? t("allStates") : t(`state.${state}`)
                                            }, state, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 397,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 388,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: skillFilter,
                                        onChange: (event)=>{
                                            setOffset(0);
                                            setSkillFilter(event.target.value);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: t("allSkills")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 410,
                                                columnNumber: 15
                                            }, this),
                                            availableSkills.map((skill)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: skill,
                                                    children: skill
                                                }, skill, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 412,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 402,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 387,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 380,
                        columnNumber: 9
                    }, this),
                    tasksLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("loadingTasks")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 421,
                        columnNumber: 11
                    }, this) : tasksData.tasks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("noTasksForFilters")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 423,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-border",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableTask")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 429,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableSkill")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 430,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableState")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 431,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tablePhase") || "FSM Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 432,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableUpdated")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 433,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2",
                                                children: t("tableActions")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                lineNumber: 434,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 428,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                    lineNumber: 427,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: tasksData.tasks.map((task)=>{
                                        const fsmPhase = task.metadata?.fsmPhase || task.metadata?.workflowFSM?.currentPhase;
                                        let fsmBadgeColor = "bg-gray-500/15 text-gray-500";
                                        if (fsmPhase === "plan" || fsmPhase === "plan_review") fsmBadgeColor = "bg-purple-500/15 text-purple-500";
                                        else if (fsmPhase === "execute") fsmBadgeColor = "bg-blue-500/15 text-blue-500";
                                        else if ([
                                            "code_review",
                                            "quality_review",
                                            "security",
                                            "test",
                                            "output_review"
                                        ].includes(fsmPhase)) fsmBadgeColor = "bg-amber-500/15 text-amber-500";
                                        else if (fsmPhase === "done") fsmBadgeColor = "bg-green-500/15 text-green-500";
                                        else if (fsmPhase === "failed") fsmBadgeColor = "bg-red-500/15 text-red-500";
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-border/40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 font-mono text-xs",
                                                    children: task.id
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: task.skill
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 457,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-xs px-2 py-1 rounded-full ${stateClass(task.state)}`,
                                                        children: t(`state.${task.state}`)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 458,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: fsmPhase ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-xs px-2 py-1 rounded border border-current/20 font-medium ${fsmBadgeColor}`,
                                                        children: fsmPhase
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                        lineNumber: 467,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-text-muted",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 text-xs",
                                                    children: new Date(task.updatedAt).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            size: "sm",
                                                            variant: "secondary",
                                                            onClick: ()=>handleLoadTask(task.id),
                                                            children: t("view")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                            lineNumber: 480,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            size: "sm",
                                                            variant: "secondary",
                                                            onClick: ()=>handleCancelTask(task.id),
                                                            disabled: task.state === "completed" || task.state === "failed" || task.state === "cancelled" || actionBusy === "cancel",
                                                            children: t("cancel")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                            lineNumber: 487,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                                    lineNumber: 479,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, task.id, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                            lineNumber: 455,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                    lineNumber: 437,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                            lineNumber: 426,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 425,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-2 mt-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                size: "sm",
                                variant: "secondary",
                                disabled: offset === 0,
                                onClick: ()=>setOffset((current)=>Math.max(0, current - PAGE_SIZE)),
                                children: t("previous")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 510,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                size: "sm",
                                variant: "secondary",
                                disabled: offset + PAGE_SIZE >= tasksData.total,
                                onClick: ()=>setOffset((current)=>current + PAGE_SIZE < tasksData.total ? current + PAGE_SIZE : current),
                                children: t("next")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 518,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 509,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 379,
                columnNumber: 7
            }, this),
            selectedTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold",
                                children: t("taskDetail")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 536,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                size: "sm",
                                variant: "secondary",
                                onClick: ()=>setSelectedTask(null),
                                children: t("close")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 537,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 535,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 xl:grid-cols-2 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 bg-bg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs uppercase text-text-muted mb-2",
                                        children: t("metadata")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 543,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs break-all whitespace-pre-wrap",
                                        children: JSON.stringify({
                                            id: selectedTask.id,
                                            skill: selectedTask.skill,
                                            state: selectedTask.state,
                                            createdAt: selectedTask.createdAt,
                                            updatedAt: selectedTask.updatedAt,
                                            expiresAt: selectedTask.expiresAt,
                                            metadata: selectedTask.metadata
                                        }, null, 2)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 544,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 542,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 bg-bg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs uppercase text-text-muted mb-2",
                                        children: t("events")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 561,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs break-all whitespace-pre-wrap",
                                        children: JSON.stringify(selectedTask.events, null, 2)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                        lineNumber: 562,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 560,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 541,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-border p-3 bg-bg mt-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase text-text-muted mb-2",
                                children: t("artifacts")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 568,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "text-xs break-all whitespace-pre-wrap",
                                children: JSON.stringify(selectedTask.artifacts, null, 2)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                                lineNumber: 569,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                        lineNumber: 567,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 534,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
        lineNumber: 302,
        columnNumber: 5
    }, this);
}
function StatCard({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-border bg-bg p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-text-muted uppercase tracking-wide",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 582,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xl font-semibold mt-1",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
                lineNumber: 583,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx",
        lineNumber: 581,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>McpDashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
const AUDIT_PAGE_SIZE = 20;
const RESILIENCE_PRESETS = {
    aggressive: {
        requestQueue: {
            requestsPerMinute: 180,
            minTimeBetweenRequestsMs: 100,
            concurrentRequests: 16
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 30000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 4
            },
            apikey: {
                baseCooldownMs: 2000,
                useUpstreamRetryHints: true,
                maxBackoffSteps: 3
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 2,
                resetTimeoutMs: 30000
            },
            apikey: {
                failureThreshold: 3,
                resetTimeoutMs: 15000
            }
        }
    },
    balanced: {
        requestQueue: {
            requestsPerMinute: 100,
            minTimeBetweenRequestsMs: 200,
            concurrentRequests: 10
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 60000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 8
            },
            apikey: {
                baseCooldownMs: 3000,
                useUpstreamRetryHints: true,
                maxBackoffSteps: 5
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 3,
                resetTimeoutMs: 60000
            },
            apikey: {
                failureThreshold: 5,
                resetTimeoutMs: 30000
            }
        }
    },
    conservative: {
        requestQueue: {
            requestsPerMinute: 60,
            minTimeBetweenRequestsMs: 350,
            concurrentRequests: 6
        },
        connectionCooldown: {
            oauth: {
                baseCooldownMs: 120000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 10
            },
            apikey: {
                baseCooldownMs: 30000,
                useUpstreamRetryHints: false,
                maxBackoffSteps: 8
            }
        },
        providerBreaker: {
            oauth: {
                failureThreshold: 8,
                resetTimeoutMs: 120000
            },
            apikey: {
                failureThreshold: 8,
                resetTimeoutMs: 60000
            }
        }
    }
};
function formatDuration(ms) {
    if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
function formatPercent(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "0%";
    return `${(value * 100).toFixed(1)}%`;
}
function McpDashboardPage() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("mcpDashboard");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tools, setTools] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [combos, setCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [toolFilter, setToolFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [successFilter, setSuccessFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [apiKeyFilter, setApiKeyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [auditOffset, setAuditOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [auditData, setAuditData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        entries: [],
        total: 0,
        limit: AUDIT_PAGE_SIZE,
        offset: 0
    });
    const [auditLoading, setAuditLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedComboId, setSelectedComboId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedProfile, setSelectedProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("balanced");
    const [actionBusy, setActionBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionMessage, setActionMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const selectedCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>combos.find((combo)=>combo.id === selectedComboId) || null, [
        combos,
        selectedComboId
    ]);
    const refreshSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const [statusRes, toolsRes, combosRes] = await Promise.all([
                fetch("/api/mcp/status"),
                fetch("/api/mcp/tools"),
                fetch("/api/combos")
            ]);
            if (statusRes.ok) {
                const json = await statusRes.json();
                setStatus(json);
            }
            if (toolsRes.ok) {
                const json = await toolsRes.json();
                setTools(Array.isArray(json.tools) ? json.tools : []);
            }
            if (combosRes.ok) {
                const json = await combosRes.json();
                const nextCombos = Array.isArray(json?.combos) ? json.combos : [];
                setCombos(nextCombos);
                if (!selectedComboId && nextCombos.length > 0) {
                    setSelectedComboId(nextCombos[0].id);
                }
            }
        } finally{
            setLoading(false);
        }
    }, [
        selectedComboId
    ]);
    const refreshAudit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setAuditLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", String(AUDIT_PAGE_SIZE));
            params.set("offset", String(auditOffset));
            if (toolFilter) params.set("tool", toolFilter);
            if (successFilter !== "all") params.set("success", successFilter);
            if (apiKeyFilter) params.set("apiKeyId", apiKeyFilter);
            const response = await fetch(`/api/mcp/audit?${params.toString()}`);
            if (!response.ok) return;
            const json = await response.json();
            setAuditData({
                entries: Array.isArray(json.entries) ? json.entries : [],
                total: Number(json.total || 0),
                limit: Number(json.limit || AUDIT_PAGE_SIZE),
                offset: Number(json.offset || 0)
            });
        } finally{
            setAuditLoading(false);
        }
    }, [
        auditOffset,
        toolFilter,
        successFilter,
        apiKeyFilter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshSummary();
        const interval = setInterval(refreshSummary, 30000);
        return ()=>clearInterval(interval);
    }, [
        refreshSummary
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshAudit();
    }, [
        refreshAudit
    ]);
    const handleSwitchCombo = async ()=>{
        if (!selectedCombo) return;
        const nextState = selectedCombo.isActive === false;
        const confirmLabel = nextState ? t("activate") : t("deactivate");
        if (!globalThis.confirm(t("confirmSwitchCombo", {
            action: confirmLabel,
            combo: selectedCombo.name
        }))) return;
        setActionBusy("switch");
        setActionMessage("");
        try {
            const response = await fetch(`/api/combos/${selectedCombo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    isActive: nextState
                })
            });
            if (!response.ok) {
                const json = await response.json().catch(()=>({}));
                setActionMessage(json?.error || t("switchComboFailed"));
                return;
            }
            setActionMessage(t("switchComboSuccess", {
                combo: selectedCombo.name
            }));
            await refreshSummary();
        } finally{
            setActionBusy(null);
        }
    };
    const handleApplyResilience = async ()=>{
        const preset = RESILIENCE_PRESETS[selectedProfile];
        const profileLabelById = {
            aggressive: t("profileAggressive"),
            balanced: t("profileBalanced"),
            conservative: t("profileConservative")
        };
        const profileLabel = profileLabelById[selectedProfile];
        if (!globalThis.confirm(t("confirmApplyProfile", {
            profile: profileLabel
        }))) return;
        setActionBusy("resilience");
        setActionMessage("");
        try {
            const response = await fetch("/api/resilience", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(preset)
            });
            if (!response.ok) {
                const json = await response.json().catch(()=>({}));
                setActionMessage(json?.error || t("applyProfileFailed"));
                return;
            }
            setActionMessage(t("applyProfileSuccess", {
                profile: profileLabel
            }));
            await refreshSummary();
        } finally{
            setActionBusy(null);
        }
    };
    const handleResetCircuitBreakers = async ()=>{
        if (!globalThis.confirm(t("confirmResetBreakers"))) return;
        setActionBusy("reset");
        setActionMessage("");
        try {
            const response = await fetch("/api/monitoring/health", {
                method: "DELETE"
            });
            if (!response.ok) {
                const json = await response.json().catch(()=>({}));
                setActionMessage(json?.error || t("resetBreakersFailed"));
                return;
            }
            const json = await response.json().catch(()=>({}));
            setActionMessage(json?.message || t("resetBreakersSuccess"));
            await refreshSummary();
        } finally{
            setActionBusy(null);
        }
    };
    const totalPages = Math.max(1, Math.ceil((auditData.total || 0) / AUDIT_PAGE_SIZE));
    const currentPage = Math.floor((auditData.offset || 0) / AUDIT_PAGE_SIZE) + 1;
    const topTools = status?.activity?.topTools || [];
    const runtimeTransport = status?.transport || status?.heartbeat?.transport || "—";
    const runtimeUptime = status?.transport === "stdio" ? formatDuration(status?.heartbeat?.uptimeMs ?? null) : status?.httpTransport?.uptime || "—";
    const heartbeatLabel = status?.transport === "stdio" ? formatDuration(status?.heartbeat?.heartbeatAgeMs ?? null) : "—";
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-text-muted",
            children: t("loading")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
            lineNumber: 376,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("processStatus"),
                        value: status?.online ? t("online") : t("offline")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 382,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("pid"),
                        value: status?.heartbeat?.pid ?? "—"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 383,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("sessionUptime"),
                        value: runtimeUptime
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 384,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("lastHeartbeat"),
                        value: heartbeatLabel
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 385,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 381,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: t("activity24h")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 389,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("totalCalls"),
                                value: status?.activity?.totalCalls24h ?? 0,
                                compact: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("successRate"),
                                value: formatPercent(status?.activity?.successRate),
                                compact: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 392,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("avgLatency"),
                                value: formatDuration(status?.activity?.avgDurationMs ?? null),
                                compact: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 397,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 390,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold mb-2",
                                        children: t("topTools")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 405,
                                        columnNumber: 13
                                    }, this),
                                    topTools.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-text-muted",
                                        children: t("noToolCalls24h")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 407,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "space-y-1 text-sm",
                                        children: topTools.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-xs",
                                                        children: entry.tool
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: entry.count
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 413,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, entry.tool, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 411,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 409,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 404,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold mb-2",
                                        children: t("runtimeDetails")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 420,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t("transport"),
                                                    ": ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono",
                                                        children: runtimeTransport
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 35
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 422,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t("scopesEnforced"),
                                                    ":",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold",
                                                        children: status?.scopesEnforced ?? status?.heartbeat?.scopesEnforced ? t("yes") : t("no")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 427,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 425,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t("lastCall"),
                                                    ":",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-xs",
                                                        children: [
                                                            status?.activity?.lastCallTool || "—",
                                                            " ",
                                                            status?.activity?.lastCallAt ? `(${new Date(status.activity.lastCallAt).toLocaleString()})` : ""
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 431,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    t("heartbeatPath"),
                                                    ":",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-xs break-all",
                                                        children: status?.heartbeatPath || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 442,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 440,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 421,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 419,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 403,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 388,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: t("operationalControls")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 450,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 xl:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold",
                                        children: t("switchCombo")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 453,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: selectedComboId,
                                        onChange: (event)=>setSelectedComboId(event.target.value),
                                        children: combos.map((combo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: combo.id,
                                                children: [
                                                    combo.name,
                                                    " (",
                                                    combo.isActive === false ? t("inactive") : t("active"),
                                                    ")"
                                                ]
                                            }, combo.id, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 460,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 454,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "secondary",
                                        onClick: handleSwitchCombo,
                                        disabled: !selectedCombo || actionBusy === "switch",
                                        children: selectedCombo?.isActive === false ? t("activateCombo") : t("deactivateCombo")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 465,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 452,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold",
                                        children: t("applyResilienceProfile")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 476,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: selectedProfile,
                                        onChange: (event)=>setSelectedProfile(event.target.value),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "aggressive",
                                                children: t("profileAggressive")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 484,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "balanced",
                                                children: t("profileBalanced")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 485,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "conservative",
                                                children: t("profileConservative")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 486,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 477,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "secondary",
                                        onClick: handleApplyResilience,
                                        disabled: actionBusy === "resilience",
                                        children: t("applyProfile")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 488,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 475,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border p-3 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold",
                                        children: t("resetCircuitBreakers")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 499,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted",
                                        children: t("resetCircuitBreakersHelp")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 500,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        onClick: handleResetCircuitBreakers,
                                        className: "bg-red-500! hover:bg-red-600! text-white!",
                                        disabled: actionBusy === "reset",
                                        children: t("resetAllBreakers")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 501,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 498,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 451,
                        columnNumber: 9
                    }, this),
                    actionMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted mt-3",
                        children: actionMessage
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 511,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 449,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: t("toolsAndScopes")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 515,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-border",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableTool")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 520,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableScopes")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 521,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tablePhase")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 522,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2",
                                                children: t("tableAudit")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 523,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 519,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                    lineNumber: 518,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-border/40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 font-mono text-xs",
                                                    children: tool.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 529,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 text-xs",
                                                    children: tool.scopes.join(", ") || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 530,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: tool.phase
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 531,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2",
                                                    children: tool.auditLevel
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 532,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, tool.name, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                            lineNumber: 528,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                    lineNumber: 526,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                            lineNumber: 517,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 516,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 514,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2 items-end justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold",
                                        children: t("auditLog")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 543,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-text-muted",
                                        children: t("auditSummary", {
                                            total: auditData.total,
                                            page: currentPage,
                                            totalPages
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 544,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 542,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: toolFilter,
                                        onChange: (event)=>{
                                            setAuditOffset(0);
                                            setToolFilter(event.target.value);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: t("allTools")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 557,
                                                columnNumber: 15
                                            }, this),
                                            tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: tool.name,
                                                    children: tool.name
                                                }, tool.name, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 559,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        value: successFilter,
                                        onChange: (event)=>{
                                            setAuditOffset(0);
                                            setSuccessFilter(event.target.value);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                children: t("allResults")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 572,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "true",
                                                children: t("success")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 573,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "false",
                                                children: t("failure")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 574,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 564,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm",
                                        placeholder: t("apiKeyIdPlaceholder"),
                                        value: apiKeyFilter,
                                        onChange: (event)=>{
                                            setAuditOffset(0);
                                            setApiKeyFilter(event.target.value);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 576,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 548,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 541,
                        columnNumber: 9
                    }, this),
                    auditLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("loadingAuditEntries")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 589,
                        columnNumber: 11
                    }, this) : auditData.entries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("noAuditEntriesForFilters")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 591,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-border",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableTimestamp")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 597,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableTool")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 598,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableDuration")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 599,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2 pr-2",
                                                children: t("tableResult")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 600,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left py-2",
                                                children: t("tableApiKey")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                lineNumber: 601,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                        lineNumber: 596,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                    lineNumber: 595,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: auditData.entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-border/40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 text-xs",
                                                    children: new Date(entry.createdAt).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 607,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2 font-mono text-xs",
                                                    children: entry.toolName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 610,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: [
                                                        entry.durationMs,
                                                        "ms"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 611,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2 pr-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: entry.success ? "text-green-500" : "text-red-500",
                                                        children: entry.success ? t("success") : entry.errorCode || t("failed")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                        lineNumber: 613,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 612,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-2",
                                                    children: entry.apiKeyId || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                                    lineNumber: 617,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, entry.id, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                            lineNumber: 606,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                    lineNumber: 604,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                            lineNumber: 594,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 593,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end gap-2 mt-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                size: "sm",
                                variant: "secondary",
                                disabled: auditOffset === 0,
                                onClick: ()=>setAuditOffset((current)=>Math.max(0, current - AUDIT_PAGE_SIZE)),
                                children: t("previous")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 626,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                size: "sm",
                                variant: "secondary",
                                disabled: auditOffset + AUDIT_PAGE_SIZE >= auditData.total,
                                onClick: ()=>setAuditOffset((current)=>current + AUDIT_PAGE_SIZE < auditData.total ? current + AUDIT_PAGE_SIZE : current),
                                children: t("next")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                                lineNumber: 634,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                        lineNumber: 625,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 540,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
        lineNumber: 380,
        columnNumber: 5
    }, this);
}
function StatCard({ label, value, compact = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-lg border border-border bg-bg p-4 ${compact ? "" : "min-h-[84px]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-text-muted uppercase tracking-wide",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 663,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xl font-semibold mt-1",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
                lineNumber: 664,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx",
        lineNumber: 662,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>NotionSourceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
function NotionSourceCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch("/api/settings/notion");
            if (res.ok) {
                const data = await res.json();
                setConnected(data.connected);
            }
        } catch  {
        // Non-critical
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void fetchConfig();
    }, [
        fetchConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (message) {
            const timer = setTimeout(()=>setMessage(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        message
    ]);
    const handleSaveToken = async ()=>{
        if (!token.trim()) {
            setMessage({
                type: "error",
                text: "Please enter a Notion integration token"
            });
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/notion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setConnected(true);
                setMessage({
                    type: "success",
                    text: data.message
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? "Failed to connect"
                });
                setConnected(false);
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Connection failed"
            });
        } finally{
            setBusy(false);
        }
    };
    const handleDisconnect = async ()=>{
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/notion", {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                setConnected(false);
                setToken("");
                setMessage({
                    type: "success",
                    text: data.message
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? "Failed to disconnect"
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Disconnect failed"
            });
        } finally{
            setBusy(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setExpanded(!expanded),
                    className: "w-full flex items-center gap-3 text-left",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center size-10 rounded-lg bg-blue-500/10 shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-xl text-blue-400",
                                children: "description"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 flex-wrap",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-sm",
                                            children: "Notion"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                            lineNumber: 98,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                            variant: connected ? "success" : "default",
                                            children: connected ? "Connected" : "Not connected"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                            lineNumber: 99,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted mt-0.5",
                                    children: "Search, read, query, and write to Notion through routed AI models"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-text-muted text-lg transition-transform ${expanded ? "rotate-180" : ""}`,
                            children: "expand_more"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                    lineNumber: 89,
                    columnNumber: 9
                }, this),
                expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-4 pt-4 border-t border-border/50 flex flex-col gap-3",
                    children: [
                        message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${message.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: message.type === "success" ? "check_circle" : "error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 124,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex-1",
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 127,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 117,
                            columnNumber: 15
                        }, this),
                        !connected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-text-muted font-medium",
                                    children: "Notion Internal Integration Token"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 133,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                            type: "password",
                                            value: token,
                                            onChange: (e)=>setToken(e.target.value),
                                            placeholder: "ntn_... or secret_...",
                                            disabled: busy,
                                            className: "font-mono text-sm flex-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                            lineNumber: 137,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            onClick: handleSaveToken,
                                            loading: busy,
                                            variant: "primary",
                                            size: "sm",
                                            children: "Connect"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                            lineNumber: 145,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 136,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-text-muted",
                                    children: [
                                        "Create an Internal Integration at",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "text-primary font-mono bg-surface/80 px-1 rounded",
                                            children: "https://www.notion.so/profile/integrations"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                            lineNumber: 151,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 149,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 132,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-text-muted flex-1",
                                    children: "Token configured. Notion tools are available via MCP."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 158,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: handleDisconnect,
                                    loading: busy,
                                    variant: "secondary",
                                    size: "sm",
                                    className: "border-red-500/30! text-red-400! hover:bg-red-500/10!",
                                    children: "Disconnect"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                                    lineNumber: 161,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                            lineNumber: 157,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
                    lineNumber: 115,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ObsidianSourceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
function ObsidianSourceCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const DEFAULT_URL = "http://127.0.0.1:27123";
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [baseUrl, setBaseUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_URL);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [webdavEnabled, setWebdavEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [webdavUsername, setWebdavUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [webdavPassword, setWebdavPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [vaultPath, setVaultPath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [webdavBusy, setWebdavBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch("/api/settings/obsidian");
            if (res.ok) {
                const data = await res.json();
                setConnected(data.connected);
                if (data.baseUrl) setBaseUrl(data.baseUrl);
                if (data.vaultPath) setVaultPath(data.vaultPath);
            }
        } catch  {
        // Non-critical
        }
    }, []);
    const fetchWebdavStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch("/api/settings/obsidian/webdav");
            if (res.ok) {
                const data = await res.json();
                setWebdavEnabled(data.webdavEnabled);
                setWebdavUsername(data.webdavUsername);
                setWebdavPassword(data.webdavPassword);
                if (data.vaultPath) setVaultPath(data.vaultPath);
            }
        } catch  {
        // Non-critical
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void fetchConfig();
        void fetchWebdavStatus();
    }, [
        fetchConfig,
        fetchWebdavStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (message) {
            const timer = setTimeout(()=>setMessage(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        message
    ]);
    const handleSaveToken = async ()=>{
        if (!token.trim()) {
            setMessage({
                type: "error",
                text: t("obsidianEnterToken")
            });
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const body = {
                token: token.trim()
            };
            if (baseUrl.trim() && baseUrl.trim() !== DEFAULT_URL) {
                body.baseUrl = baseUrl.trim();
            }
            const res = await fetch("/api/settings/obsidian", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setConnected(true);
                setMessage({
                    type: "success",
                    text: data.message
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? t("obsidianConnectFailed")
                });
                setConnected(false);
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : t("obsidianConnectionFailed")
            });
        } finally{
            setBusy(false);
        }
    };
    const handleDisconnect = async ()=>{
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/obsidian", {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                setConnected(false);
                setToken("");
                setBaseUrl(DEFAULT_URL);
                setMessage({
                    type: "success",
                    text: data.message
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? t("obsidianDisconnectFailed")
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : t("obsidianDisconnectFailed")
            });
        } finally{
            setBusy(false);
        }
    };
    const handleEnableWebdav = async ()=>{
        if (!vaultPath.trim()) {
            setMessage({
                type: "error",
                text: t("obsidianEnterVaultPath")
            });
            return;
        }
        setWebdavBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/obsidian/webdav", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vaultPath: vaultPath.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setWebdavEnabled(true);
                setWebdavUsername(data.username);
                setWebdavPassword(data.password);
                setMessage({
                    type: "success",
                    text: t("obsidianWebdavEnabledMessage")
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? t("obsidianEnableWebdavFailed")
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : t("obsidianEnableWebdavFailed")
            });
        } finally{
            setWebdavBusy(false);
        }
    };
    const handleDisableWebdav = async ()=>{
        setWebdavBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/settings/obsidian/webdav", {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                setWebdavEnabled(false);
                setWebdavUsername(null);
                setWebdavPassword(null);
                setMessage({
                    type: "success",
                    text: t("obsidianWebdavDisabledMessage")
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error ?? t("obsidianDisableWebdavFailed")
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : t("obsidianDisableWebdavFailed")
            });
        } finally{
            setWebdavBusy(false);
        }
    };
    const getWebdavUrl = ()=>{
        if ("TURBOPACK compile-time truthy", 1) return "<server-ip>/api/v1/webdav/";
        //TURBOPACK unreachable
        ;
        // Inherit the page protocol (http on localhost, https behind a TLS proxy)
        // instead of hard-coding http.
        const protocol = undefined, hostname = undefined, port = undefined;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setExpanded(!expanded),
                    className: "w-full flex items-center gap-3 text-left",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center size-10 rounded-lg bg-purple-500/10 shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "20",
                                height: "20",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                fill: "#C084FC",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M19.355 18.538a68.967 68.959 0 0 0 1.858-2.954.81.81 0 0 0-.062-.9c-.516-.685-1.504-2.075-2.042-3.362-.553-1.321-.636-3.375-.64-4.377a1.707 1.707 0 0 0-.358-1.05l-3.198-4.064a3.744 3.744 0 0 1-.076.543c-.106.503-.307 1.004-.536 1.5-.134.29-.29.6-.446.914l-.31.626c-.516 1.068-.997 2.227-1.132 3.59-.124 1.26.046 2.73.815 4.481.128.011.257.025.386.044a6.363 6.363 0 0 1 3.326 1.505c.916.79 1.744 1.922 2.415 3.5zM8.199 22.569c.073.012.146.02.22.02.78.024 2.095.092 3.16.29.87.16 2.593.64 4.01 1.055 1.083.316 2.198-.548 2.355-1.664.114-.814.33-1.735.725-2.58l-.01.005c-.67-1.87-1.522-3.078-2.416-3.849a5.295 5.295 0 0 0-2.778-1.257c-1.54-.216-2.952.19-3.84.45.532 2.218.368 4.829-1.425 7.531zM5.533 9.938c-.023.1-.056.197-.098.29L2.82 16.059a1.602 1.602 0 0 0 .313 1.772l4.116 4.24c2.103-3.101 1.796-6.02.836-8.3-.728-1.73-1.832-3.081-2.55-3.831zM9.32 14.01c.615-.183 1.606-.465 2.745-.534-.683-1.725-.848-3.233-.716-4.577.154-1.552.7-2.847 1.235-3.95.113-.235.223-.454.328-.664.149-.297.288-.577.419-.86.217-.47.379-.885.46-1.27.08-.38.08-.72-.014-1.043-.095-.325-.297-.675-.68-1.06a1.6 1.6 0 0 0-1.475.36l-4.95 4.452a1.602 1.602 0 0 0-.513.952l-.427 2.83c.672.59 2.328 2.316 3.335 4.711.09.21.175.43.253.653z"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 202,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 flex-wrap",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-sm",
                                            children: "Obsidian"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 207,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                            variant: connected ? "success" : "default",
                                            children: connected ? t("obsidianConnected") : t("obsidianNotConnected")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 208,
                                            columnNumber: 15
                                        }, this),
                                        webdavEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                            variant: "success",
                                            className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                            children: t("obsidianWebdavSync")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 212,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 206,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted mt-0.5",
                                    children: t("obsidianDescription")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 220,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-text-muted text-lg transition-transform ${expanded ? "rotate-180" : ""}`,
                            children: "expand_more"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 222,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this),
                expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-4 pt-4 border-t border-border/50 flex flex-col gap-3",
                    children: [
                        message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${message.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: message.type === "success" ? "check_circle" : "error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 239,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex-1",
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 242,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 232,
                            columnNumber: 15
                        }, this),
                        !connected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-text-muted font-medium",
                                    children: t("obsidianRestToken")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 248,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                            type: "password",
                                            value: token,
                                            onChange: (e)=>setToken(e.target.value),
                                            placeholder: t("obsidianApiKeyPlaceholder"),
                                            disabled: busy,
                                            className: "font-mono text-sm flex-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 252,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            onClick: handleSaveToken,
                                            loading: busy,
                                            variant: "primary",
                                            size: "sm",
                                            children: t("obsidianConnect")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 260,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 251,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-text-muted font-medium mt-1",
                                    children: t("obsidianBaseUrlOptional")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 264,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    type: "text",
                                    value: baseUrl,
                                    onChange: (e)=>setBaseUrl(e.target.value),
                                    placeholder: DEFAULT_URL,
                                    disabled: busy,
                                    className: "font-mono text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 267,
                                    columnNumber: 17
                                }, this),
                                baseUrl.includes(":27124") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 text-[10px] text-yellow-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "warning"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 277,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: t("obsidianPortWarning")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 278,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 276,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-text-muted",
                                    children: t("obsidianRemoteVaultHint", {
                                        defaultUrl: DEFAULT_URL
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 281,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 247,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-text-muted flex-1",
                                            children: t("obsidianTokenConfigured")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 288,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            onClick: handleDisconnect,
                                            loading: busy,
                                            variant: "secondary",
                                            size: "sm",
                                            className: "border-red-500/30! text-red-400! hover:bg-red-500/10!",
                                            children: t("obsidianDisconnect")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 291,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 287,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-border/50 pt-3 flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-text-muted font-medium",
                                                children: t("obsidianVaultSync")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                lineNumber: 304,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 303,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted",
                                            children: t("obsidianVaultSyncDescription")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 308,
                                            columnNumber: 19
                                        }, this),
                                        !webdavEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-xs text-text-muted font-medium",
                                                    children: t("obsidianVaultDirectoryPath")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                            type: "text",
                                                            value: vaultPath,
                                                            onChange: (e)=>setVaultPath(e.target.value),
                                                            placeholder: "/Users/you/Documents/Obsidian",
                                                            disabled: webdavBusy,
                                                            className: "font-mono text-sm flex-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            onClick: handleEnableWebdav,
                                                            loading: webdavBusy,
                                                            variant: "primary",
                                                            size: "sm",
                                                            children: t("obsidianEnable")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 324,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 311,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[18px] text-blue-400",
                                                            children: "cloud_sync"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-blue-300 font-medium",
                                                                    children: t("obsidianWebdavEnabled")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 341,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[10px] text-blue-400/70 font-mono truncate",
                                                                    children: getWebdavUrl()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            onClick: handleDisableWebdav,
                                                            loading: webdavBusy,
                                                            variant: "secondary",
                                                            size: "sm",
                                                            className: "border-red-500/30! text-red-400! hover:bg-red-500/10! shrink-0",
                                                            children: t("obsidianDisable")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col gap-2 rounded-lg border border-border/50 bg-black/10 p-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] text-text-muted font-medium",
                                                            children: t("obsidianConfigureMobile")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 360,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-text-muted",
                                                            children: t("obsidianMobileInstructions")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "text-[10px] text-text-muted font-medium",
                                                                    children: t("obsidianWebdavUrl")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 368,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-1.5 rounded border border-border/30 bg-black/20 px-2.5 py-1.5",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        className: "text-[10px] text-text-muted font-mono flex-1 break-all select-all",
                                                                        children: getWebdavUrl()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                        lineNumber: 372,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 371,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 367,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "text-[10px] text-text-muted font-medium",
                                                                    children: t("obsidianUsername")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 379,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-1.5 rounded border border-border/30 bg-black/20 px-2.5 py-1.5",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        className: "text-[10px] text-text-muted font-mono flex-1 select-all",
                                                                        children: webdavUsername ?? "—"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                        lineNumber: 383,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 382,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 378,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "text-[10px] text-text-muted font-medium",
                                                                    children: t("obsidianPassword")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 390,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-1.5 rounded border border-border/30 bg-black/20 px-2.5 py-1.5 flex-1",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                                className: "text-[10px] text-text-muted font-mono flex-1 select-all",
                                                                                children: showPassword ? webdavPassword ?? "—" : "••••••••••••"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                                lineNumber: 395,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                            lineNumber: 394,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                                            onClick: ()=>setShowPassword(!showPassword),
                                                                            variant: "secondary",
                                                                            size: "sm",
                                                                            className: "shrink-0",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "material-symbols-outlined text-[16px]",
                                                                                children: showPassword ? "visibility_off" : "visibility"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                                lineNumber: 405,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                            lineNumber: 399,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                                    lineNumber: 393,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 389,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-text-muted",
                                                            children: t("obsidianTailscaleHint")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                            lineNumber: 412,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                                    lineNumber: 359,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                            lineNumber: 335,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                                    lineNumber: 302,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                            lineNumber: 286,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
                    lineNumber: 230,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>VscodeTokenAliasCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useCopyToClipboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/hooks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useDisplayBaseUrl.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
;
function VscodeTokenAliasCard({ className = "", variant = "highlight" }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const [cliApiKeys, setCliApiKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [keysLoading, setKeysLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [keysError, setKeysError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { copied, copy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCopyToClipboard"])();
    const displayBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDisplayBaseUrl"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const loadCliApiKeys = async ()=>{
            setKeysLoading(true);
            setKeysError(false);
            try {
                const res = await fetch("/api/cli-tools/keys");
                if (!res.ok) {
                    throw new Error("Failed to load CLI keys");
                }
                const data = await res.json();
                if (!cancelled) {
                    setCliApiKeys(data.keys || []);
                }
            } catch  {
                if (!cancelled) {
                    setCliApiKeys([]);
                    setKeysError(true);
                }
            } finally{
                if (!cancelled) {
                    setKeysLoading(false);
                }
            }
        };
        void loadCliApiKeys();
        return ()=>{
            cancelled = true;
        };
    }, []);
    const preferredCliApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (cliApiKeys.length === 0) {
            return null;
        }
        const storedCopilotKeyId = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
        return (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null) ?? cliApiKeys.find((key)=>key.isActive !== false) ?? cliApiKeys[0] ?? null;
    }, [
        cliApiKeys
    ]);
    const tokenSegment = preferredCliApiKey?.rawKey || "{token}";
    const hasRealToken = Boolean(preferredCliApiKey?.rawKey);
    const translationToken = {
        token: "{token}"
    };
    const baseUrl = `${displayBaseUrl}/api/v1/vscode/${tokenSegment}`;
    const vscodeTokenizedUrls = [
        {
            label: t("vscodeAliasBaseLabel"),
            url: `${baseUrl}/`,
            key: "vscode_token_base"
        },
        {
            label: t("vscodeAliasModelsLabel"),
            url: `${baseUrl}/models`,
            key: "vscode_token_models"
        },
        {
            label: t("vscodeAliasChatLabel"),
            url: `${baseUrl}/chat/completions`,
            key: "vscode_token_chat"
        }
    ];
    const description = hasRealToken ? t("vscodeAliasDescriptionReady", translationToken) : keysError ? t("vscodeAliasDescriptionError") : keysLoading ? t("vscodeAliasDescriptionLoading") : t("vscodeAliasDescriptionPlaceholder", translationToken);
    if (variant === "catalog") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
            className: `overflow-hidden ${className}`.trim(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[14px] text-primary",
                            children: "key"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xs font-semibold uppercase tracking-wider text-text-muted",
                            children: t("vscodeAliasTitle")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 h-px bg-border/30"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/dashboard/cli-tools",
                            className: "shrink-0 text-[11px] font-medium text-primary hover:underline",
                            children: t("vscodeAliasManage")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: description
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 flex flex-col gap-2",
                            children: vscodeTokenizedUrls.map(({ label, url, key })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CopyableEndpointRow, {
                                    label: label,
                                    url: url,
                                    copyKey: key,
                                    copy: (text, copyKey)=>void copy(text, copyKey),
                                    copied: copied,
                                    variant: "catalog"
                                }, key, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                                    lineNumber: 132,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 ${className}`.trim(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400",
                                children: t("vscodeAliasTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-text-muted",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/cli-tools",
                        className: "shrink-0 text-xs text-primary hover:underline",
                        children: t("vscodeAliasManage")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex flex-col gap-2",
                children: vscodeTokenizedUrls.map(({ label, url, key })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CopyableEndpointRow, {
                        label: label,
                        url: url,
                        copyKey: key,
                        copy: (text, copyKey)=>void copy(text, copyKey),
                        copied: copied,
                        variant: "highlight"
                    }, key, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
function CopyableEndpointRow({ label, url, copyKey, copy, copied, variant = "highlight" }) {
    const rowClassName = variant === "catalog" ? "flex items-center gap-2 min-w-0 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5" : "flex items-center gap-2 min-w-0 rounded-md border border-sky-500/15 bg-background/60 px-2.5 py-2";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: rowClassName,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "w-24 shrink-0 text-[11px] font-medium text-text-muted",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                className: "flex-1 min-w-0 truncate text-[11px] font-mono text-text-main",
                children: url
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>copy(url, copyKey),
                className: "shrink-0 flex items-center gap-1 rounded border border-border/70 px-2 py-1 text-text-muted transition-colors hover:text-text",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[12px]",
                    children: copied === copyKey ? "check" : "content_copy"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                    lineNumber: 207,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>APIPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SegmentedControl$3e$__ = __turbopack_context__.i("[project]/src/shared/components/SegmentedControl.tsx [app-ssr] (ecmascript) <export default as SegmentedControl>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useCopyToClipboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/hooks/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useDisplayBaseUrl.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/display/names.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$A2ADashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/endpoint/components/A2ADashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$MCPDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/endpoint/components/MCPDashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$NotionSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/endpoint/components/NotionSourceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$ObsidianSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/endpoint/components/ObsidianSourceCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$VscodeTokenAliasCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/endpoint/VscodeTokenAliasCard.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$A2ADashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$MCPDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$NotionSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$ObsidianSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$VscodeTokenAliasCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$A2ADashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$MCPDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$NotionSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$ObsidianSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$VscodeTokenAliasCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const BUILD_TIME_CLOUD_URL = ("TURBOPACK compile-time value", "") || null;
const CLOUD_ACTION_TIMEOUT_MS = 15000;
const ENDPOINT_TABS = [
    {
        value: "apis",
        labelKey: "tabApis",
        icon: "api"
    },
    {
        value: "mcp",
        labelKey: "tabMcp",
        icon: "extension"
    },
    {
        value: "a2a",
        labelKey: "tabA2a",
        icon: "hub"
    },
    {
        value: "context-sources",
        labelKey: "tabContextSources",
        icon: "database"
    }
];
const DEFAULT_TUNNEL_VISIBILITY = {
    showCloudflaredTunnel: true,
    showTailscaleFunnel: true,
    showNgrokTunnel: true
};
function runEndpointBackgroundTask(taskName, task) {
    void task().catch((error)=>{
        console.log("Error running endpoint background task:", taskName, error);
    });
}
function APIPageClient({ machineId }) {
    const [resolvedMachineId, setResolvedMachineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(machineId || "");
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Endpoints / models state
    const [allModels, setAllModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [modelsLoading, setModelsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [expandedEndpoint, setExpandedEndpoint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Cloud sync state
    const [cloudEnabled, setCloudEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCloudModal, setShowCloudModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDisableModal, setShowDisableModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cloudSyncing, setCloudSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cloudStatus, setCloudStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [syncStep, setSyncStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""); // "syncing" | "verifying" | "disabling" | "done" | ""
    const [modalSuccess, setModalSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // show success state in modal before closing
    const [selectedProvider, setSelectedProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // for provider models popup
    const [cloudBaseUrl, setCloudBaseUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(BUILD_TIME_CLOUD_URL); // dynamic cloud URL from API response
    const [cloudConfigured, setCloudConfigured] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Boolean(BUILD_TIME_CLOUD_URL));
    const [mcpStatus, setMcpStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [a2aStatus, setA2aStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchProviders, setSearchProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [cloudflaredStatus, setCloudflaredStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [cloudflaredBusy, setCloudflaredBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cloudflaredNotice, setCloudflaredNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tailscaleStatus, setTailscaleStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [tailscaleBusy, setTailscaleBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tailscaleNotice, setTailscaleNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showTailscaleInstallModal, setShowTailscaleInstallModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tailscaleInstallBusy, setTailscaleInstallBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tailscaleInstallLog, setTailscaleInstallLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tailscalePassword, setTailscalePassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [showCloudflaredTunnel, setShowCloudflaredTunnel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showTailscaleFunnel, setShowTailscaleFunnel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [ngrokStatus, setNgrokStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ngrokBusy, setNgrokBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [ngrokNotice, setNgrokNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ngrokToken, setNgrokToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [showNgrokTunnel, setShowNgrokTunnel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [expandedTunnel, setExpandedTunnel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [localApiUrl, setLocalApiUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("http://localhost:20128/v1");
    const [lanUrls, setLanUrls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tailscaleIpUrl, setTailscaleIpUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeEndpointTab, setActiveEndpointTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("apis");
    const [customSystemPromptEnabled, setCustomSystemPromptEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customSystemPrompt, setCustomSystemPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const { copied, copy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCopyToClipboard"])();
    const translateOrFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key, fallback, values)=>{
        try {
            const message = values ? t(key, values) : t(key);
            if (!message || message === key || message === `endpoint.${key}`) {
                return fallback;
            }
            return message;
        } catch  {
            return fallback;
        }
    }, [
        t
    ]);
    const fetchSearchProviders = async ()=>{
        try {
            const res = await fetch("/api/search/providers");
            if (res.ok) {
                const data = await res.json();
                setSearchProviders(data.providers || []);
            }
        } catch  {
        // Search endpoint may not be available
        }
    };
    const fetchCloudflaredStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (silent = false)=>{
        try {
            const res = await fetch("/api/tunnels/cloudflared", {
                cache: "no-store"
            });
            const data = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("cloudflaredRequestFailed", "Failed to load Cloudflare tunnel status"));
            }
            setCloudflaredStatus(data);
            return data;
        } catch (error) {
            if (!silent) {
                setCloudflaredNotice({
                    type: "error",
                    message: error instanceof Error ? error.message : translateOrFallback("cloudflaredRequestFailed", "Failed to load Cloudflare tunnel status")
                });
            }
            return null;
        }
    }, [
        translateOrFallback
    ]);
    const fetchTailscaleStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (silent = false)=>{
        try {
            const res = await fetch("/api/tunnels/tailscale", {
                cache: "no-store"
            });
            const data = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("tailscaleRequestFailed", "Failed to load Tailscale status"));
            }
            setTailscaleStatus(data);
            return data;
        } catch (error) {
            if (!silent) {
                setTailscaleNotice({
                    type: "error",
                    message: error instanceof Error ? error.message : translateOrFallback("tailscaleRequestFailed", "Failed to load Tailscale status")
                });
            }
            return null;
        }
    }, [
        translateOrFallback
    ]);
    const fetchNgrokStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (silent = false)=>{
        try {
            const res = await fetch("/api/tunnels/ngrok", {
                cache: "no-store"
            });
            const data = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("ngrokRequestFailed", "Failed to load ngrok status"));
            }
            setNgrokStatus(data);
            return data;
        } catch (error) {
            if (!silent) {
                setNgrokNotice({
                    type: "error",
                    message: error instanceof Error ? error.message : translateOrFallback("ngrokRequestFailed", "Failed to load ngrok status")
                });
            }
            return null;
        }
    }, [
        translateOrFallback
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        const loadPage = async ()=>{
            const tunnelVisibility = await loadCloudSettings(()=>mounted);
            if (!mounted) return;
            setLoading(false);
            runEndpointBackgroundTask("models", fetchModels);
            runEndpointBackgroundTask("protocol-status", fetchProtocolStatus);
            runEndpointBackgroundTask("search-providers", fetchSearchProviders);
            runEndpointBackgroundTask("network-info", async ()=>{
                try {
                    const res = await fetch("/api/network/info");
                    if (res.ok) {
                        const data = await res.json();
                        if (mounted) {
                            if (data.localUrl) setLocalApiUrl(data.localUrl);
                            setLanUrls(data.lanUrls ?? []);
                            if (data.tailscaleIpUrl) setTailscaleIpUrl(data.tailscaleIpUrl);
                        }
                    }
                } catch  {
                // non-critical
                }
            });
            if (tunnelVisibility.showCloudflaredTunnel) {
                runEndpointBackgroundTask("cloudflared-status", ()=>fetchCloudflaredStatus(true));
            }
            if (tunnelVisibility.showTailscaleFunnel) {
                runEndpointBackgroundTask("tailscale-status", ()=>fetchTailscaleStatus(true));
            }
            if (tunnelVisibility.showNgrokTunnel) {
                runEndpointBackgroundTask("ngrok-status", ()=>fetchNgrokStatus(true));
            }
        };
        void loadPage();
        return ()=>{
            mounted = false;
        };
    }, [
        fetchCloudflaredStatus,
        fetchTailscaleStatus,
        fetchNgrokStatus
    ]);
    const fetchModels = async ()=>{
        setModelsLoading(true);
        try {
            const res = await fetch("/v1/models");
            if (res.ok) {
                const data = await res.json();
                setAllModels(data.data || []);
            }
        } catch (e) {
            console.log("Error fetching models:", e);
        } finally{
            setModelsLoading(false);
        }
    };
    const fetchProtocolStatus = async ()=>{
        try {
            const [mcpRes, a2aRes] = await Promise.allSettled([
                fetch("/api/mcp/status"),
                fetch("/api/a2a/status")
            ]);
            if (mcpRes.status === "fulfilled" && mcpRes.value.ok) {
                setMcpStatus(await mcpRes.value.json());
            }
            if (a2aRes.status === "fulfilled" && a2aRes.value.ok) {
                setA2aStatus(await a2aRes.value.json());
            }
        } catch  {
        // Ignore status failures; protocols panel has fallback text.
        }
    };
    // Categorize models by endpoint type
    // Filter out parent models (models with parent field set) to avoid showing duplicates
    const endpointData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const chat = allModels.filter((m)=>!m.type && !m.parent);
        const embeddings = allModels.filter((m)=>m.type === "embedding" && !m.parent);
        const images = allModels.filter((m)=>m.type === "image" && !m.parent);
        const video = allModels.filter((m)=>m.type === "video" && !m.parent);
        const rerank = allModels.filter((m)=>m.type === "rerank" && !m.parent);
        const audioTranscription = allModels.filter((m)=>m.type === "audio" && m.subtype === "transcription" && !m.parent);
        const audioSpeech = allModels.filter((m)=>m.type === "audio" && m.subtype === "speech" && !m.parent);
        const moderation = allModels.filter((m)=>m.type === "moderation" && !m.parent);
        const music = allModels.filter((m)=>m.type === "music" && !m.parent);
        return {
            chat,
            embeddings,
            images,
            video,
            rerank,
            audioTranscription,
            audioSpeech,
            moderation,
            music
        };
    }, [
        allModels
    ]);
    const totalEndpointModelCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Object.values(endpointData).reduce((acc, models)=>acc + models.length, 0), [
        endpointData
    ]);
    const availableEndpointCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const chatCount = endpointData.chat.length > 0 ? 4 : 0; // chat + responses + completions + messages
        const imageCount = endpointData.images.length > 0 ? 2 : 0; // image gen + image edits
        const otherMedia = [
            endpointData.embeddings,
            endpointData.audioTranscription,
            endpointData.audioSpeech,
            endpointData.music,
            endpointData.video
        ].filter((m)=>m.length > 0).length;
        const utilityFixed = 3; // batch + files + list models (always available)
        const modelUtility = (endpointData.rerank.length > 0 ? 1 : 0) + (endpointData.moderation.length > 0 ? 1 : 0);
        const searchCount = searchProviders.length > 0 ? 1 : 0;
        return chatCount + imageCount + otherMedia + utilityFixed + modelUtility + searchCount;
    }, [
        endpointData,
        searchProviders
    ]);
    const postCloudAction = async (action, timeoutMs = CLOUD_ACTION_TIMEOUT_MS)=>{
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
        try {
            const res = await fetch("/api/sync/cloud", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action
                }),
                signal: controller.signal
            });
            const data = await res.json().catch(()=>({}));
            return {
                ok: res.ok,
                status: res.status,
                data
            };
        } catch (error) {
            if (error?.name === "AbortError") {
                return {
                    ok: false,
                    status: 408,
                    data: {
                        error: t("cloudRequestTimeout")
                    }
                };
            }
            return {
                ok: false,
                status: 500,
                data: {
                    error: error.message || t("cloudRequestFailed")
                }
            };
        } finally{
            clearTimeout(timeoutId);
        }
    };
    const loadCloudSettings = async (shouldApplyState = ()=>true)=>{
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                const tunnelVisibility = {
                    showCloudflaredTunnel: data.hideEndpointCloudflaredTunnel !== true,
                    showTailscaleFunnel: data.hideEndpointTailscaleFunnel !== true,
                    showNgrokTunnel: data.hideEndpointNgrokTunnel !== true
                };
                if (!shouldApplyState()) {
                    return tunnelVisibility;
                }
                setCloudEnabled(data.cloudEnabled || false);
                if (typeof data.cloudConfigured === "boolean") {
                    setCloudConfigured(data.cloudConfigured);
                }
                if (data.cloudUrl) {
                    setCloudBaseUrl(data.cloudUrl);
                }
                if (data.machineId) {
                    setResolvedMachineId(data.machineId);
                }
                setShowCloudflaredTunnel(tunnelVisibility.showCloudflaredTunnel);
                setShowTailscaleFunnel(tunnelVisibility.showTailscaleFunnel);
                setShowNgrokTunnel(tunnelVisibility.showNgrokTunnel);
                if (data.ngrokAuthToken) setNgrokToken(data.ngrokAuthToken);
                setCustomSystemPromptEnabled(!!data.customSystemPromptEnabled);
                setCustomSystemPrompt(data.customSystemPrompt || "");
                if (!tunnelVisibility.showCloudflaredTunnel) {
                    setCloudflaredStatus(null);
                    setCloudflaredNotice(null);
                }
                if (!tunnelVisibility.showTailscaleFunnel) {
                    setTailscaleStatus(null);
                    setTailscaleNotice(null);
                }
                if (!tunnelVisibility.showNgrokTunnel) {
                    setNgrokStatus(null);
                    setNgrokNotice(null);
                }
                return tunnelVisibility;
            }
        } catch (error) {
            console.log("Error loading cloud settings:", error);
        }
        return DEFAULT_TUNNEL_VISIBILITY;
    };
    const handleCustomSystemPromptEnabledChange = (value)=>{
        setCustomSystemPromptEnabled(value);
        void fetch("/api/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customSystemPromptEnabled: value
            })
        });
    };
    const handleCustomSystemPromptChange = (value)=>{
        setCustomSystemPrompt(value);
        void fetch("/api/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customSystemPrompt: value
            })
        });
    };
    const handleCloudToggle = (checked)=>{
        if (checked) {
            if (!cloudConfigured) {
                setCloudStatus({
                    type: "warning",
                    message: "Cloud sync is not configured on this instance."
                });
                return;
            }
            setShowCloudModal(true);
        } else {
            setShowDisableModal(true);
        }
    };
    // Auto-dismiss cloudStatus after 5s
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (cloudStatus) {
            const timer = setTimeout(()=>setCloudStatus(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        cloudStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (cloudflaredNotice) {
            const timer = setTimeout(()=>setCloudflaredNotice(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        cloudflaredNotice
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (tailscaleNotice) {
            const timer = setTimeout(()=>setTailscaleNotice(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        tailscaleNotice
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (ngrokNotice) {
            const timer = setTimeout(()=>setNgrokNotice(null), 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        ngrokNotice
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const interval = setInterval(()=>{
            void fetchProtocolStatus();
            if (showCloudflaredTunnel) {
                void fetchCloudflaredStatus(true);
            }
            if (showTailscaleFunnel) {
                void fetchTailscaleStatus(true);
            }
            if (showNgrokTunnel) {
                void fetchNgrokStatus(true);
            }
        }, 30000);
        return ()=>clearInterval(interval);
    }, [
        fetchCloudflaredStatus,
        fetchNgrokStatus,
        fetchTailscaleStatus,
        showCloudflaredTunnel,
        showNgrokTunnel,
        showTailscaleFunnel
    ]);
    const dispatchCloudChange = ()=>{
        globalThis.dispatchEvent(new Event("cloud-status-changed"));
    };
    const handleEnableCloud = async ()=>{
        setCloudSyncing(true);
        setModalSuccess(false);
        setSyncStep("syncing");
        try {
            const { ok, status, data } = await postCloudAction("enable");
            if (ok) {
                setSyncStep("verifying");
                // Brief delay so user sees the verifying step
                await new Promise((r)=>setTimeout(r, 600));
                // Sync succeeded — mark as enabled regardless of verify result
                setCloudEnabled(true);
                setSyncStep("done");
                setModalSuccess(true);
                setCloudSyncing(false);
                dispatchCloudChange();
                // Show success in modal for a moment, then close
                await new Promise((r)=>setTimeout(r, 1200));
                setShowCloudModal(false);
                setModalSuccess(false);
                if (data.verified) {
                    setCloudStatus({
                        type: "success",
                        message: t("cloudConnectedVerified")
                    });
                } else {
                    setCloudStatus({
                        type: "warning",
                        message: data.verifyError ? t("connectedVerificationPendingWithError", {
                            error: data.verifyError
                        }) : t("connectedVerificationPending")
                    });
                }
                // Update cloud URL from API response (fixes undefined/v1 when env var not set)
                if (data.cloudUrl) {
                    setCloudBaseUrl(data.cloudUrl);
                }
                // Reload settings to ensure fresh state
                await loadCloudSettings();
            } else {
                // Sync failed — provide a helpful error message
                let errorMessage = data.error || t("failedEnable");
                if (status === 502 || status === 408) {
                    errorMessage = t("cloudWorkerUnreachable");
                }
                setCloudStatus({
                    type: "error",
                    message: errorMessage
                });
                setShowCloudModal(false);
            }
        } catch (error) {
            setCloudStatus({
                type: "error",
                message: error.message || t("connectionFailed")
            });
            setShowCloudModal(false);
        } finally{
            setCloudSyncing(false);
            setSyncStep("");
        }
    };
    const handleConfirmDisable = async ()=>{
        setCloudSyncing(true);
        setSyncStep("syncing");
        try {
            // Step 1: Sync latest data from cloud
            await postCloudAction("sync");
            setSyncStep("disabling");
            // Step 2: Disable cloud
            const { ok, data } = await postCloudAction("disable");
            if (ok) {
                setCloudEnabled(false);
                setCloudStatus({
                    type: "success",
                    message: t("cloudDisabledSuccess")
                });
                setShowDisableModal(false);
                dispatchCloudChange();
                await loadCloudSettings();
            } else {
                setCloudStatus({
                    type: "error",
                    message: data.error || t("failedDisable")
                });
            }
        } catch (error) {
            console.log("Error disabling cloud:", error);
            setCloudStatus({
                type: "error",
                message: t("failedDisable")
            });
        } finally{
            setCloudSyncing(false);
            setSyncStep("");
        }
    };
    const handleCloudflaredAction = async (action)=>{
        setCloudflaredBusy(true);
        setCloudflaredNotice(null);
        try {
            const res = await fetch("/api/tunnels/cloudflared", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("cloudflaredRequestFailed", "Failed to update Cloudflare tunnel"));
            }
            if (data?.status) {
                setCloudflaredStatus(data.status);
            }
            setCloudflaredNotice({
                type: "success",
                message: action === "enable" ? translateOrFallback("cloudflaredStarted", "Cloudflare tunnel started") : translateOrFallback("cloudflaredStopped", "Cloudflare tunnel stopped")
            });
        } catch (error) {
            setCloudflaredNotice({
                type: "error",
                message: error instanceof Error ? error.message : translateOrFallback("cloudflaredRequestFailed", "Failed to update Cloudflare tunnel")
            });
        } finally{
            setCloudflaredBusy(false);
            await fetchCloudflaredStatus(true);
        }
    };
    const handleNgrokAction = async (action)=>{
        setNgrokBusy(true);
        setNgrokNotice(null);
        try {
            const res = await fetch("/api/tunnels/ngrok", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action,
                    authToken: action === "enable" ? ngrokToken : undefined
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("ngrokRequestFailed", "Failed to update ngrok tunnel"));
            }
            if (data?.status) {
                setNgrokStatus(data.status);
            }
            setNgrokNotice({
                type: "success",
                message: action === "enable" ? translateOrFallback("ngrokStarted", "ngrok tunnel started") : translateOrFallback("ngrokStopped", "ngrok tunnel stopped")
            });
            if (action === "enable" && ngrokToken) {
                await fetch("/api/settings", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ngrokAuthToken: ngrokToken
                    })
                });
            }
        } catch (error) {
            setNgrokNotice({
                type: "error",
                message: error instanceof Error ? error.message : translateOrFallback("ngrokRequestFailed", "Failed to update ngrok tunnel")
            });
        } finally{
            setNgrokBusy(false);
            await fetchNgrokStatus(true);
        }
    };
    const waitForTailscale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (predicate, attempts = 40, delayMs = 3000)=>{
        for(let attempt = 0; attempt < attempts; attempt += 1){
            await new Promise((resolve)=>setTimeout(resolve, delayMs));
            const status = await fetchTailscaleStatus(true);
            if (status && predicate(status)) {
                return status;
            }
        }
        return null;
    }, [
        fetchTailscaleStatus
    ]);
    const requestTailscaleEnable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (payload = {})=>{
        const res = await fetch("/api/tunnels/tailscale/enable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        return {
            res,
            data
        };
    }, []);
    const handleTailscaleEnable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setTailscaleBusy(true);
        setTailscaleNotice(null);
        try {
            let { res, data } = await requestTailscaleEnable({
                sudoPassword: tailscalePassword || undefined
            });
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("tailscaleEnableFailed", "Failed to enable Tailscale Funnel"));
            }
            if (data?.needsLogin && data?.authUrl) {
                window.open(data.authUrl, "tailscale_auth", "width=680,height=780");
                setTailscaleNotice({
                    type: "info",
                    message: translateOrFallback("tailscaleWaitingForLogin", "Complete the Tailscale login in the opened browser tab. OmniRoute will retry automatically.")
                });
                const loggedIn = await waitForTailscale((status)=>status.loggedIn);
                if (!loggedIn) {
                    throw new Error(translateOrFallback("tailscaleLoginTimedOut", "Timed out waiting for Tailscale login"));
                }
                ({ res, data } = await requestTailscaleEnable({
                    sudoPassword: tailscalePassword || undefined
                }));
                if (!res.ok) {
                    throw new Error(data?.error || translateOrFallback("tailscaleEnableFailed", "Failed to enable Tailscale Funnel"));
                }
            }
            if (data?.funnelNotEnabled && data?.enableUrl) {
                window.open(data.enableUrl, "tailscale_funnel", "width=680,height=780");
                setTailscaleNotice({
                    type: "info",
                    message: translateOrFallback("tailscaleWaitingForFunnel", "Enable Funnel for this device in the opened browser tab. OmniRoute will keep polling.")
                });
                let enabled = null;
                for(let attempt = 0; attempt < 40; attempt += 1){
                    await new Promise((resolve)=>setTimeout(resolve, 3000));
                    const next = await requestTailscaleEnable({
                        sudoPassword: tailscalePassword || undefined
                    });
                    if (!next.res.ok) {
                        throw new Error(next.data?.error || translateOrFallback("tailscaleEnableFailed", "Failed to enable Tailscale Funnel"));
                    }
                    if (next.data?.success) {
                        enabled = next;
                        break;
                    }
                    if (!next.data?.funnelNotEnabled) {
                        enabled = next;
                        break;
                    }
                }
                if (!enabled?.data?.success) {
                    throw new Error(translateOrFallback("tailscaleFunnelTimedOut", "Timed out waiting for Tailscale Funnel to be enabled"));
                }
                data = enabled.data;
            }
            if (!data?.success) {
                throw new Error(data?.error || translateOrFallback("tailscaleEnableFailed", "Failed to enable Tailscale Funnel"));
            }
            if (data?.status) {
                setTailscaleStatus(data.status);
            }
            setTailscaleNotice({
                type: "success",
                message: translateOrFallback("tailscaleStarted", "Tailscale Funnel enabled")
            });
        } catch (error) {
            setTailscaleNotice({
                type: "error",
                message: error instanceof Error ? error.message : translateOrFallback("tailscaleEnableFailed", "Failed to enable Tailscale Funnel")
            });
        } finally{
            setTailscaleBusy(false);
            await fetchTailscaleStatus(true);
        }
    }, [
        fetchTailscaleStatus,
        requestTailscaleEnable,
        tailscalePassword,
        translateOrFallback,
        waitForTailscale
    ]);
    const handleTailscaleDisable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setTailscaleBusy(true);
        setTailscaleNotice(null);
        try {
            const res = await fetch("/api/tunnels/tailscale/disable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sudoPassword: tailscalePassword || undefined
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                throw new Error(data?.error || translateOrFallback("tailscaleDisableFailed", "Failed to disable Tailscale Funnel"));
            }
            if (data?.status) {
                setTailscaleStatus(data.status);
            }
            setTailscaleNotice({
                type: "success",
                message: translateOrFallback("tailscaleStopped", "Tailscale Funnel disabled")
            });
        } catch (error) {
            setTailscaleNotice({
                type: "error",
                message: error instanceof Error ? error.message : translateOrFallback("tailscaleDisableFailed", "Failed to disable Tailscale Funnel")
            });
        } finally{
            setTailscaleBusy(false);
            await fetchTailscaleStatus(true);
        }
    }, [
        fetchTailscaleStatus,
        tailscalePassword,
        translateOrFallback
    ]);
    const handleTailscaleInstall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setTailscaleInstallBusy(true);
        setTailscaleInstallLog([]);
        setTailscaleNotice(null);
        try {
            const res = await fetch("/api/tunnels/tailscale/install", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sudoPassword: tailscalePassword || undefined
                })
            });
            if (!res.body) {
                throw new Error(translateOrFallback("tailscaleInstallFailed", "Failed to install Tailscale"));
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let installSucceeded = false;
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const parts = buffer.split("\n\n");
                buffer = parts.pop() || "";
                for (const part of parts){
                    const lines = part.split("\n");
                    let eventName = "progress";
                    let payload = null;
                    for (const line of lines){
                        if (line.startsWith("event: ")) {
                            eventName = line.slice(7).trim();
                        } else if (line.startsWith("data: ")) {
                            payload = JSON.parse(line.slice(6));
                        }
                    }
                    if (!payload) continue;
                    if (eventName === "progress") {
                        const message = typeof payload.message === "string" ? payload.message : translateOrFallback("tailscaleInstallProgress", "Working...");
                        setTailscaleInstallLog((current)=>[
                                ...current.slice(-79),
                                message
                            ]);
                    } else if (eventName === "done") {
                        installSucceeded = true;
                        if (payload.status) {
                            setTailscaleStatus(payload.status);
                        }
                    } else if (eventName === "error") {
                        throw new Error(typeof payload.error === "string" ? payload.error : translateOrFallback("tailscaleInstallFailed", "Failed to install Tailscale"));
                    }
                }
            }
            if (!installSucceeded) {
                throw new Error(translateOrFallback("tailscaleInstallFailed", "Failed to install Tailscale"));
            }
            setShowTailscaleInstallModal(false);
            setTailscalePassword("");
            setTailscaleNotice({
                type: "success",
                message: translateOrFallback("tailscaleInstalled", "Tailscale installed successfully")
            });
            await fetchTailscaleStatus(true);
            await handleTailscaleEnable();
        } catch (error) {
            setTailscaleNotice({
                type: "error",
                message: error instanceof Error ? error.message : translateOrFallback("tailscaleInstallFailed", "Failed to install Tailscale")
            });
        } finally{
            setTailscaleInstallBusy(false);
        }
    }, [
        fetchTailscaleStatus,
        handleTailscaleEnable,
        tailscalePassword,
        translateOrFallback
    ]);
    const displayBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDisplayBaseUrl"])();
    const displayApiUrl = `${displayBaseUrl}/v1`;
    const publicDisplayApiUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useDisplayBaseUrl$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPublicDisplayBaseUrl"])(displayBaseUrl) ? displayApiUrl : null;
    const normalizedCloudBaseUrl = cloudBaseUrl ? resolvedMachineId && !cloudBaseUrl.endsWith(`/${resolvedMachineId}`) ? `${cloudBaseUrl}/${resolvedMachineId}` : cloudBaseUrl : null;
    const cloudEndpointNew = normalizedCloudBaseUrl ? `${normalizedCloudBaseUrl}/v1` : null;
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 1082,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 1083,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
            lineNumber: 1081,
            columnNumber: 7
        }, this);
    }
    const activeTunnelUrls = [
        ...publicDisplayApiUrl ? [
            {
                label: t("tierPublic"),
                url: publicDisplayApiUrl,
                key: "active_public"
            }
        ] : [],
        ...cloudflaredStatus?.running && cloudflaredStatus.apiUrl ? [
            {
                label: "Cloudflare",
                url: cloudflaredStatus.apiUrl,
                key: "active_cf"
            }
        ] : [],
        ...tailscaleStatus?.running && (tailscaleStatus.apiUrl ?? tailscaleStatus.tunnelUrl) ? [
            {
                label: "Tailscale",
                url: tailscaleStatus.apiUrl ?? tailscaleStatus.tunnelUrl ?? "",
                key: "active_ts"
            }
        ] : [],
        ...ngrokStatus?.running && ngrokStatus.apiUrl ? [
            {
                label: "ngrok",
                url: ngrokStatus.apiUrl,
                key: "active_ngrok"
            }
        ] : []
    ];
    const preferredTunnelUrl = activeTunnelUrls[0]?.url ?? null;
    const currentEndpoint = preferredTunnelUrl ?? (cloudEnabled && cloudEndpointNew ? cloudEndpointNew : null) ?? displayApiUrl;
    const activeUrls = [
        ...activeTunnelUrls,
        ...cloudEnabled && cloudEndpointNew ? [
            {
                label: t("activeCloud"),
                url: cloudEndpointNew,
                key: "active_cloud"
            }
        ] : [],
        {
            label: t("activeLocal"),
            url: localApiUrl,
            key: "active_local"
        }
    ].filter((candidate, index, candidates)=>candidates.findIndex((other)=>other.url === candidate.url) === index);
    const visibleTunnelCount = [
        showCloudflaredTunnel,
        showTailscaleFunnel,
        showNgrokTunnel
    ].filter(Boolean).length;
    const activeTunnelCount = [
        showCloudflaredTunnel && cloudflaredStatus?.running,
        showTailscaleFunnel && tailscaleStatus?.running,
        showNgrokTunnel && ngrokStatus?.running
    ].filter(Boolean).length;
    const mcpOnline = Boolean(mcpStatus?.online);
    const a2aOnline = a2aStatus?.status === "ok";
    const mcpToolCount = Number(mcpStatus?.heartbeat?.toolCount || 0);
    const a2aActiveStreams = Number(a2aStatus?.tasks?.activeStreams || 0);
    const cloudflaredPhase = cloudflaredStatus?.phase || "not_installed";
    const cloudflaredPhaseMeta = {
        running: {
            label: translateOrFallback("cloudflaredRunning", "Running"),
            className: "bg-green-500/10 border-green-500/30 text-green-400"
        },
        starting: {
            label: translateOrFallback("cloudflaredStarting", "Starting"),
            className: "bg-blue-500/10 border-blue-500/30 text-blue-400"
        },
        stopped: {
            label: translateOrFallback("cloudflaredStoppedState", "Stopped"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        not_installed: {
            label: translateOrFallback("cloudflaredNotInstalled", "Not installed"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        unsupported: {
            label: translateOrFallback("cloudflaredUnsupported", "Unsupported"),
            className: "bg-amber-500/10 border-amber-500/30 text-amber-400"
        },
        error: {
            label: translateOrFallback("cloudflaredError", "Error"),
            className: "bg-red-500/10 border-red-500/30 text-red-400"
        }
    };
    const cloudflaredActionLabel = cloudflaredStatus?.running ? translateOrFallback("cloudflaredDisable", "Stop Tunnel") : cloudflaredStatus?.installed ? translateOrFallback("cloudflaredEnable", "Enable Tunnel") : translateOrFallback("cloudflaredInstallAndEnable", "Install & Enable");
    const cloudflaredUrlNotice = translateOrFallback("cloudflaredUrlNotice", "Creates a temporary Cloudflare Quick Tunnel. The URL changes after every restart.");
    const tailscalePhase = tailscaleStatus?.phase || "not_installed";
    const tailscalePhaseMeta = {
        running: {
            label: translateOrFallback("tailscaleRunning", "Running"),
            className: "bg-green-500/10 border-green-500/30 text-green-400"
        },
        needs_login: {
            label: translateOrFallback("tailscaleNeedsLogin", "Needs Login"),
            className: "bg-blue-500/10 border-blue-500/30 text-blue-400"
        },
        stopped: {
            label: translateOrFallback("tailscaleStoppedState", "Stopped"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        not_installed: {
            label: translateOrFallback("tailscaleNotInstalled", "Not installed"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        unsupported: {
            label: translateOrFallback("tailscaleUnsupported", "Unsupported"),
            className: "bg-amber-500/10 border-amber-500/30 text-amber-400"
        },
        error: {
            label: translateOrFallback("tailscaleError", "Error"),
            className: "bg-red-500/10 border-red-500/30 text-red-400"
        }
    };
    const tailscaleActionLabel = tailscaleStatus?.running ? translateOrFallback("tailscaleDisable", "Stop Funnel") : tailscaleStatus?.installed ? tailscaleStatus?.loggedIn ? translateOrFallback("tailscaleEnable", "Enable Funnel") : translateOrFallback("tailscaleLoginAndEnable", "Login & Enable") : translateOrFallback("tailscaleInstallAndEnable", "Install & Enable");
    const tailscaleUrlNotice = translateOrFallback("tailscaleUrlNotice", "Uses your Tailscale .ts.net address. Login and Funnel approval may be required on first use.");
    const ngrokPhase = ngrokStatus?.phase || "not_installed";
    const ngrokPhaseMeta = {
        running: {
            label: translateOrFallback("ngrokRunning", "Running"),
            className: "bg-green-500/10 border-green-500/30 text-green-400"
        },
        starting: {
            label: translateOrFallback("ngrokStarting", "Starting"),
            className: "bg-blue-500/10 border-blue-500/30 text-blue-400"
        },
        stopped: {
            label: translateOrFallback("ngrokStoppedState", "Stopped"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        needs_auth: {
            label: translateOrFallback("ngrokNeedsAuth", "Needs Auth"),
            className: "bg-amber-500/10 border-amber-500/30 text-amber-400"
        },
        not_installed: {
            label: translateOrFallback("ngrokNotInstalled", "Not installed"),
            className: "bg-surface border-border/70 text-text-muted"
        },
        unsupported: {
            label: translateOrFallback("ngrokUnsupported", "Unsupported"),
            className: "bg-amber-500/10 border-amber-500/30 text-amber-400"
        },
        error: {
            label: translateOrFallback("ngrokError", "Error"),
            className: "bg-red-500/10 border-red-500/30 text-red-400"
        }
    };
    const ngrokActionLabel = ngrokStatus?.running ? translateOrFallback("ngrokDisable", "Stop Tunnel") : translateOrFallback("ngrokEnable", "Enable Tunnel");
    const ngrokUrlNotice = translateOrFallback("ngrokUrlNotice", "Creates a public ngrok tunnel.");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$SegmentedControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SegmentedControl$3e$__["SegmentedControl"], {
                options: ENDPOINT_TABS.map((tab)=>({
                        ...tab,
                        label: t(tab.labelKey)
                    })),
                value: activeEndpointTab,
                onChange: (value)=>setActiveEndpointTab(value),
                "aria-label": t("endpointSections"),
                className: "w-fit"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1250,
                columnNumber: 7
            }, this),
            activeEndpointTab === "mcp" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$MCPDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1258,
                columnNumber: 38
            }, this) : null,
            activeEndpointTab === "a2a" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$A2ADashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1259,
                columnNumber: 38
            }, this) : null,
            activeEndpointTab === "context-sources" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$NotionSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1262,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$components$2f$ObsidianSourceCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1263,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1261,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: t("title")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1269,
                        columnNumber: 9
                    }, this),
                    cloudStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${cloudStatus.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : cloudStatus.type === "warning" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px]",
                                children: cloudStatus.type === "success" ? "check_circle" : cloudStatus.type === "warning" ? "warning" : "error"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1282,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex-1",
                                children: cloudStatus.message
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1289,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCloudStatus(null),
                                className: "p-0.5 hover:bg-white/10 rounded transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: "close"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 1294,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1290,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1273,
                        columnNumber: 11
                    }, this),
                    activeUrls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-semibold text-primary uppercase tracking-wider mb-2",
                                children: t("activeEndpoints")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1302,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-1.5",
                                children: activeUrls.map(({ label, url, key })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1308,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-text-muted w-20 shrink-0",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1309,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                className: "text-xs font-mono text-text-main flex-1 truncate min-w-0",
                                                children: url
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1310,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>void copy(url, key),
                                                className: "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded border border-border/70 text-text-muted hover:text-text transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[12px]",
                                                    children: copied === key ? "check" : "content_copy"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1317,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1313,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, key, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1307,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1305,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1301,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px] text-emerald-500 shrink-0",
                                        children: "computer"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1331,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-baseline gap-1 flex-wrap",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium",
                                                    children: t("localServer")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1336,
                                                    columnNumber: 17
                                                }, this),
                                                resolvedMachineId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-text-muted",
                                                    children: [
                                                        "· ",
                                                        resolvedMachineId.slice(0, 8)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1338,
                                                    columnNumber: 19
                                                }, this),
                                                lanUrls.map((url)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>void copy(url, `lan_${url}`),
                                                        title: t("copyUrlTitle", {
                                                            url
                                                        }),
                                                        className: "inline-flex items-center gap-0.5 text-[10px] text-text-muted hover:text-text transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                className: "font-mono",
                                                                children: url.replace(/^https?:\/\//, "")
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                                lineNumber: 1347,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[10px] opacity-60",
                                                                children: copied === `lan_${url}` ? "check" : "content_copy"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                                lineNumber: 1348,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, url, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1341,
                                                        columnNumber: 19
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 1335,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1334,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 border border-green-500/30 text-green-400 shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1356,
                                                columnNumber: 15
                                            }, this),
                                            t("statusRunning")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1355,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>void copy(localApiUrl, "endpoint_url"),
                                        className: "shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-border/70 text-text-muted hover:text-text hover:border-border transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: copied === "endpoint_url" ? "check" : "content_copy"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1363,
                                                columnNumber: 15
                                            }, this),
                                            copied === "endpoint_url" ? tc("copied") : tc("copy")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1359,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1330,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 pt-4 pb-1 border-t border-border/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px] text-text-muted",
                                        children: "network_node"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1372,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-semibold text-text-muted uppercase tracking-wider",
                                        children: t("tunnels")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1378,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted",
                                        children: t("activeTunnelCount", {
                                            active: activeTunnelCount,
                                            total: visibleTunnelCount
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1379,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1371,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px] text-blue-400 shrink-0",
                                        children: "cloud"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1389,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium",
                                            children: t("cloudOmniroute")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 1393,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1392,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${cloudEnabled ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-surface border-border/70 text-text-muted"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-1.5 h-1.5 rounded-full shrink-0 ${cloudEnabled ? "bg-green-400 animate-pulse" : "bg-text-muted"}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1402,
                                                columnNumber: 15
                                            }, this),
                                            cloudEnabled ? tc("active") : tc("disabled")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1395,
                                        columnNumber: 13
                                    }, this),
                                    cloudEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "secondary",
                                        icon: "cloud_off",
                                        onClick: ()=>handleCloudToggle(false),
                                        disabled: cloudSyncing,
                                        className: "shrink-0 bg-red-500/10! text-red-500! hover:bg-red-500/20! border-red-500/30!",
                                        children: t("disableCloud")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1408,
                                        columnNumber: 15
                                    }, this) : cloudConfigured ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "sm",
                                        variant: "primary",
                                        icon: "cloud_upload",
                                        onClick: ()=>handleCloudToggle(true),
                                        disabled: cloudSyncing,
                                        className: "shrink-0",
                                        children: t("enableCloud")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1419,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted shrink-0 px-2 py-1 rounded border border-border/70 bg-surface",
                                        children: tc("notConfigured")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1430,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1388,
                                columnNumber: 11
                            }, this),
                            showCloudflaredTunnel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-border/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 py-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px] text-orange-400 shrink-0",
                                                children: "cloud_queue"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1440,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium",
                                                    children: translateOrFallback("cloudflaredTitle", "Cloudflare Quick Tunnel")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1444,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1443,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${cloudflaredPhaseMeta[cloudflaredPhase].className}`,
                                                children: cloudflaredPhaseMeta[cloudflaredPhase].label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1448,
                                                columnNumber: 17
                                            }, this),
                                            cloudflaredStatus?.supported !== false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                variant: cloudflaredStatus?.running ? "secondary" : "primary",
                                                icon: cloudflaredStatus?.running ? "cloud_off" : "cloud_upload",
                                                loading: cloudflaredBusy,
                                                onClick: ()=>{
                                                    void handleCloudflaredAction(cloudflaredStatus?.running ? "disable" : "enable");
                                                },
                                                className: `shrink-0 ${cloudflaredStatus?.running ? "border-border/70! text-text-muted! hover:text-text!" : ""}`,
                                                children: cloudflaredActionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1454,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1439,
                                        columnNumber: 15
                                    }, this),
                                    cloudflaredNotice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `mb-2 ml-7 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cloudflaredNotice.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : cloudflaredNotice.type === "info" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: cloudflaredNotice.type === "success" ? "check_circle" : cloudflaredNotice.type === "info" ? "info" : "error"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1480,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex-1",
                                                children: cloudflaredNotice.message
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1487,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setCloudflaredNotice(null),
                                                className: "rounded p-0.5 transition-colors hover:bg-white/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[16px]",
                                                    children: "close"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1492,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1488,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1471,
                                        columnNumber: 17
                                    }, this),
                                    cloudflaredStatus?.lastError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-2 ml-7 text-xs text-red-400",
                                        children: translateOrFallback("cloudflaredLastError", "Last error: {error}", {
                                            error: cloudflaredStatus.lastError
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1497,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1438,
                                columnNumber: 13
                            }, this),
                            showTailscaleFunnel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: showCloudflaredTunnel ? "border-t border-border/30" : "",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        role: "button",
                                        tabIndex: 0,
                                        className: "w-full flex items-center gap-3 py-3 hover:bg-surface/40 transition-colors rounded -mx-1 px-1 text-left cursor-pointer",
                                        onClick: ()=>setExpandedTunnel(expandedTunnel === "ts" ? null : "ts"),
                                        onKeyDown: (e)=>{
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setExpandedTunnel(expandedTunnel === "ts" ? null : "ts");
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px] text-indigo-400 shrink-0",
                                                children: "vpn_lock"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1521,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-baseline gap-1 flex-wrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium",
                                                            children: translateOrFallback("tailscaleTitle", "Tailscale Funnel")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                            lineNumber: 1526,
                                                            columnNumber: 21
                                                        }, this),
                                                        tailscaleIpUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                void copy(tailscaleIpUrl, "tailscale_ip_inline");
                                                            },
                                                            title: `Copy ${tailscaleIpUrl}`,
                                                            className: "inline-flex items-center gap-0.5 text-[10px] text-text-muted hover:text-text transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                    className: "font-mono",
                                                                    children: tailscaleIpUrl.replace(/^https?:\/\//, "")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                                    lineNumber: 1538,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "material-symbols-outlined text-[10px] opacity-60",
                                                                    children: copied === "tailscale_ip_inline" ? "check" : "content_copy"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                                    lineNumber: 1541,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                            lineNumber: 1530,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1525,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1524,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${tailscalePhaseMeta[tailscalePhase].className}`,
                                                children: tailscalePhaseMeta[tailscalePhase].label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1548,
                                                columnNumber: 17
                                            }, this),
                                            tailscaleStatus?.supported !== false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                variant: tailscaleStatus?.running ? "secondary" : "primary",
                                                icon: tailscaleStatus?.running ? "vpn_key_off" : "vpn_lock",
                                                loading: tailscaleBusy,
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    if (tailscaleStatus?.running) {
                                                        void handleTailscaleDisable();
                                                    } else if (tailscaleStatus?.installed) {
                                                        void handleTailscaleEnable();
                                                    } else {
                                                        setShowTailscaleInstallModal(true);
                                                    }
                                                },
                                                className: `shrink-0 ${tailscaleStatus?.running ? "border-border/70! text-text-muted! hover:text-text!" : ""}`,
                                                children: tailscaleActionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1554,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px] text-text-muted shrink-0 transition-transform duration-200",
                                                style: {
                                                    transform: expandedTunnel === "ts" ? "rotate(180deg)" : "rotate(0deg)"
                                                },
                                                children: "expand_more"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1574,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1509,
                                        columnNumber: 15
                                    }, this),
                                    expandedTunnel === "ts" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pb-3 pl-7 pr-1 flex flex-col gap-2",
                                        children: [
                                            tailscaleNotice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${tailscaleNotice.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : tailscaleNotice.type === "info" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[18px]",
                                                        children: tailscaleNotice.type === "success" ? "check_circle" : tailscaleNotice.type === "info" ? "info" : "error"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1595,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex-1",
                                                        children: tailscaleNotice.message
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1602,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setTailscaleNotice(null),
                                                        className: "rounded p-0.5 transition-colors hover:bg-white/10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px]",
                                                            children: "close"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                            lineNumber: 1607,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1603,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1586,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted",
                                                children: tailscaleUrlNotice
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1611,
                                                columnNumber: 19
                                            }, this),
                                            tailscaleStatus?.phase === "needs_login" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-blue-400",
                                                children: translateOrFallback("tailscaleNeedsLoginHint", "Authenticate this machine with Tailscale, then enable Funnel.")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1613,
                                                columnNumber: 21
                                            }, this),
                                            tailscaleStatus?.installed && tailscaleStatus?.platform !== "win32" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-xs text-text-muted",
                                                        children: translateOrFallback("tailscaleSudoLabel", "Sudo Password (required on macOS/Linux)")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1622,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                        type: "password",
                                                        value: tailscalePassword,
                                                        onChange: (event)=>setTailscalePassword(event.target.value),
                                                        placeholder: translateOrFallback("tailscaleSudoPlaceholder", "Optional sudo password"),
                                                        disabled: tailscaleBusy,
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1628,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1621,
                                                columnNumber: 21
                                            }, this),
                                            tailscaleStatus?.binaryPath && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted",
                                                children: translateOrFallback("tailscaleBinaryPath", "Binary: {path}", {
                                                    path: tailscaleStatus.binaryPath
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1642,
                                                columnNumber: 21
                                            }, this),
                                            tailscaleStatus?.lastError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-400",
                                                children: translateOrFallback("tailscaleLastError", "Last error: {error}", {
                                                    error: tailscaleStatus.lastError
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1649,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1584,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1508,
                                columnNumber: 13
                            }, this),
                            showNgrokTunnel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: showCloudflaredTunnel || showTailscaleFunnel ? "border-t border-border/30" : "",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        role: "button",
                                        tabIndex: 0,
                                        className: "w-full flex items-center gap-3 py-3 hover:bg-surface/40 transition-colors rounded -mx-1 px-1 text-left cursor-pointer",
                                        onClick: ()=>setExpandedTunnel(expandedTunnel === "ngrok" ? null : "ngrok"),
                                        onKeyDown: (e)=>{
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setExpandedTunnel(expandedTunnel === "ngrok" ? null : "ngrok");
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px] text-purple-400 shrink-0",
                                                children: "public"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1679,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium",
                                                    children: translateOrFallback("ngrokTitle", "ngrok Tunnel")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                    lineNumber: 1683,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1682,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${ngrokPhaseMeta[ngrokPhase].className}`,
                                                children: ngrokPhaseMeta[ngrokPhase].label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1687,
                                                columnNumber: 17
                                            }, this),
                                            ngrokStatus?.supported !== false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "sm",
                                                variant: ngrokStatus?.running ? "secondary" : "primary",
                                                icon: ngrokStatus?.running ? "public_off" : "public",
                                                loading: ngrokBusy,
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    void handleNgrokAction(ngrokStatus?.running ? "disable" : "enable");
                                                },
                                                className: `shrink-0 ${ngrokStatus?.running ? "border-border/70! text-text-muted! hover:text-text!" : ""}`,
                                                children: ngrokActionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1693,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px] text-text-muted shrink-0 transition-transform duration-200",
                                                style: {
                                                    transform: expandedTunnel === "ngrok" ? "rotate(180deg)" : "rotate(0deg)"
                                                },
                                                children: "expand_more"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1707,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1667,
                                        columnNumber: 15
                                    }, this),
                                    expandedTunnel === "ngrok" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pb-3 pl-7 pr-1 flex flex-col gap-2",
                                        children: [
                                            ngrokNotice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${ngrokNotice.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : ngrokNotice.type === "info" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[18px]",
                                                        children: ngrokNotice.type === "success" ? "check_circle" : ngrokNotice.type === "info" ? "info" : "error"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1728,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex-1",
                                                        children: ngrokNotice.message
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1735,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setNgrokNotice(null),
                                                        className: "rounded p-0.5 transition-colors hover:bg-white/10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px]",
                                                            children: "close"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                            lineNumber: 1740,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1736,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1719,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted",
                                                children: ngrokUrlNotice
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1744,
                                                columnNumber: 19
                                            }, this),
                                            ngrokStatus?.phase === "needs_auth" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-xs text-text-muted",
                                                        children: translateOrFallback("ngrokAuthTokenLabel", "Authtoken (Required if NGROK_AUTHTOKEN not set in environment)")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1747,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                        type: "password",
                                                        value: ngrokToken,
                                                        onChange: (event)=>setNgrokToken(event.target.value),
                                                        placeholder: translateOrFallback("ngrokAuthTokenPlaceholder", "Enter your ngrok authtoken"),
                                                        disabled: ngrokBusy,
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                        lineNumber: 1753,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1746,
                                                columnNumber: 21
                                            }, this),
                                            ngrokStatus?.lastError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-400",
                                                children: translateOrFallback("ngrokLastError", "Last error: {error}", {
                                                    error: ngrokStatus.lastError
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 1767,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1717,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1662,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1328,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between pt-4 mt-4 border-t border-border gap-4 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-sm",
                                        children: t("customSystemPromptTitle")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1782,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-text-muted",
                                        children: t("customSystemPromptDescription")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1783,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1781,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 shrink-0",
                                children: [
                                    customSystemPromptEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                        type: "text",
                                        value: customSystemPrompt,
                                        onChange: (e)=>handleCustomSystemPromptChange(e.target.value),
                                        placeholder: t("customSystemPromptPlaceholder"),
                                        className: "w-64 text-xs"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1787,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        checked: customSystemPromptEnabled,
                                        onChange: handleCustomSystemPromptEnabledChange,
                                        ariaLabel: t("customSystemPromptTitle"),
                                        size: "sm"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1795,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1785,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1780,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1268,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold",
                                    children: t("available")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 1808,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: modelsLoading ? translateOrFallback("loadingModels", "Loading available models...") : t("modelsAcrossEndpoints", {
                                        models: totalEndpointModelCount,
                                        endpoints: availableEndpointCount
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 1809,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 1807,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1806,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-sm text-primary",
                                        children: "hub"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1823,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold text-text-muted uppercase tracking-wider",
                                        children: t("categoryCore") || "Core APIs"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1824,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1827,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1822,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "chat",
                                        iconColor: "text-blue-500",
                                        iconBg: "bg-blue-500/10",
                                        title: t("chatCompletions"),
                                        path: "/v1/chat/completions",
                                        models: endpointData.chat,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1830,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "code",
                                        iconColor: "text-indigo-500",
                                        iconBg: "bg-indigo-500/10",
                                        title: t("responses") || "Responses API",
                                        path: "/v1/responses",
                                        models: endpointData.chat,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1842,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "text_fields",
                                        iconColor: "text-orange-500",
                                        iconBg: "bg-orange-500/10",
                                        title: t("completionsLegacy") || "Completions (Legacy)",
                                        path: "/v1/completions",
                                        models: endpointData.chat,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1854,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "psychology",
                                        iconColor: "text-violet-500",
                                        iconBg: "bg-violet-500/10",
                                        title: t("messagesApi") || "Messages",
                                        path: "/v1/messages",
                                        models: null,
                                        badge: "Anthropic",
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1866,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1829,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1821,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-sm text-purple-400",
                                        children: "perm_media"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1884,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold text-text-muted uppercase tracking-wider",
                                        children: t("categoryMedia") || "Media & Multi-Modal"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1885,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1888,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1883,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "data_array",
                                        iconColor: "text-emerald-500",
                                        iconBg: "bg-emerald-500/10",
                                        title: t("embeddings"),
                                        path: "/v1/embeddings",
                                        models: endpointData.embeddings,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1891,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "image",
                                        iconColor: "text-purple-500",
                                        iconBg: "bg-purple-500/10",
                                        title: t("imageGeneration"),
                                        path: "/v1/images/generations",
                                        models: endpointData.images,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1903,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "edit_square",
                                        iconColor: "text-violet-500",
                                        iconBg: "bg-violet-500/10",
                                        title: t("imageEdits") || "Image Edits",
                                        path: "/v1/images/edits",
                                        models: endpointData.images,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1915,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "mic",
                                        iconColor: "text-rose-500",
                                        iconBg: "bg-rose-500/10",
                                        title: t("audioTranscription"),
                                        path: "/v1/audio/transcriptions",
                                        models: endpointData.audioTranscription,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1927,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "record_voice_over",
                                        iconColor: "text-cyan-500",
                                        iconBg: "bg-cyan-500/10",
                                        title: t("textToSpeech"),
                                        path: "/v1/audio/speech",
                                        models: endpointData.audioSpeech,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1939,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "music_note",
                                        iconColor: "text-fuchsia-500",
                                        iconBg: "bg-fuchsia-500/10",
                                        title: t("musicGeneration") || "Music Generation",
                                        path: "/v1/music/generations",
                                        models: endpointData.music,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1951,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "videocam",
                                        iconColor: "text-red-500",
                                        iconBg: "bg-red-500/10",
                                        title: t("videoGeneration") || "Video Generation",
                                        path: "/v1/videos/generations",
                                        models: endpointData.video,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1963,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1890,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1882,
                        columnNumber: 9
                    }, this),
                    searchProviders.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-sm text-cyan-400",
                                        children: "travel_explore"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1982,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold text-text-muted uppercase tracking-wider",
                                        children: t("categorySearch") || "Search & Discovery"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1985,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 1988,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1981,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                    icon: "search",
                                    iconColor: "text-cyan-500",
                                    iconBg: "bg-cyan-500/10",
                                    title: t("webSearch") || "Web Search",
                                    path: "/v1/search",
                                    models: searchProviders.map((p)=>({
                                            id: p.id,
                                            owned_by: p.id,
                                            type: "search"
                                        })),
                                    copy: copy,
                                    copied: copied,
                                    baseUrl: currentEndpoint
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 1991,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 1990,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 1980,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-sm text-amber-400",
                                        children: "build"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2009,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold text-text-muted uppercase tracking-wider",
                                        children: t("categoryUtility") || "Utility & Management"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2010,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border/50"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2013,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2008,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "sort",
                                        iconColor: "text-amber-500",
                                        iconBg: "bg-amber-500/10",
                                        title: t("rerank"),
                                        path: "/v1/rerank",
                                        models: endpointData.rerank,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2016,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "shield",
                                        iconColor: "text-orange-500",
                                        iconBg: "bg-orange-500/10",
                                        title: t("moderations"),
                                        path: "/v1/moderations",
                                        models: endpointData.moderation,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint,
                                        modelsLoading: modelsLoading
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2028,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "view_list",
                                        iconColor: "text-teal-500",
                                        iconBg: "bg-teal-500/10",
                                        title: t("batchApi") || "Batch API",
                                        path: "/v1/batches",
                                        models: null,
                                        badge: "OpenAI",
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2040,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "folder",
                                        iconColor: "text-yellow-500",
                                        iconBg: "bg-yellow-500/10",
                                        title: t("filesApi") || "Files API",
                                        path: "/v1/files",
                                        models: null,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2052,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EndpointCard, {
                                        icon: "list",
                                        iconColor: "text-teal-500",
                                        iconBg: "bg-teal-500/10",
                                        title: t("listModels") || "List Models",
                                        path: "/v1/models",
                                        models: null,
                                        copy: copy,
                                        copied: copied,
                                        baseUrl: currentEndpoint
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2063,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2015,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$endpoint$2f$VscodeTokenAliasCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                className: "mt-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2076,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2007,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 1805,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: showCloudModal,
                title: t("enableCloudTitle"),
                onClose: ()=>setShowCloudModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-blue-800 dark:text-blue-200 font-medium mb-2",
                                    children: t("whatYouGet")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2088,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "text-sm text-blue-700 dark:text-blue-300 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudBenefitAccess")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2092,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudBenefitShare")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2093,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudBenefitPorts")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2094,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudBenefitEdge")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2095,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2091,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2087,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1",
                                    children: tc("note")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "text-sm text-yellow-700 dark:text-yellow-300 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudSessionNote")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2104,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "• ",
                                                t("cloudUnstableNote")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                            lineNumber: 2105,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2103,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2099,
                            columnNumber: 11
                        }, this),
                        (cloudSyncing || modalSuccess) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${modalSuccess ? "bg-green-500/10 border-green-500/30" : "bg-primary/10 border-primary/30"}`,
                            children: [
                                modalSuccess ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-green-500 text-xl",
                                    children: "check_circle"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2119,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-primary",
                                    children: "progress_activity"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2123,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium ${modalSuccess ? "text-green-500" : "text-primary"}`,
                                        children: [
                                            modalSuccess && t("cloudConnected"),
                                            !modalSuccess && syncStep === "syncing" && t("connectingToCloud"),
                                            !modalSuccess && syncStep === "verifying" && t("verifyingConnection")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2128,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2127,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2111,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: handleEnableCloud,
                                    fullWidth: true,
                                    disabled: cloudSyncing || modalSuccess,
                                    children: cloudSyncing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined animate-spin text-sm",
                                                children: "progress_activity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2145,
                                                columnNumber: 19
                                            }, this),
                                            syncStep === "syncing" ? t("connecting") : t("verifying")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2144,
                                        columnNumber: 17
                                    }, this) : modalSuccess ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-sm",
                                                children: "check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2152,
                                                columnNumber: 19
                                            }, this),
                                            t("connected")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2151,
                                        columnNumber: 17
                                    }, this) : t("enableCloud")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: ()=>setShowCloudModal(false),
                                    variant: "ghost",
                                    fullWidth: true,
                                    disabled: cloudSyncing || modalSuccess,
                                    children: tc("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2159,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 2086,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2081,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: showDisableModal,
                title: t("disableCloudTitle"),
                onClose: ()=>!cloudSyncing && setShowDisableModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-red-600 dark:text-red-400",
                                        children: "warning"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2180,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-red-800 dark:text-red-200 font-medium mb-1",
                                                children: tc("warning")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2184,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-red-700 dark:text-red-300",
                                                children: t("disableWarning")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2187,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2183,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2179,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2178,
                            columnNumber: 11
                        }, this),
                        cloudSyncing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-primary",
                                    children: "progress_activity"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2195,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-primary",
                                        children: [
                                            syncStep === "syncing" && t("syncingData"),
                                            syncStep === "disabling" && t("disablingCloud")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2199,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2198,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2194,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted",
                            children: t("disableConfirm")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2207,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: handleConfirmDisable,
                                    fullWidth: true,
                                    disabled: cloudSyncing,
                                    className: "bg-red-500! hover:bg-red-600! text-white!",
                                    children: cloudSyncing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined animate-spin text-sm",
                                                children: "progress_activity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2218,
                                                columnNumber: 19
                                            }, this),
                                            syncStep === "syncing" ? t("syncing") : t("disabling")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2217,
                                        columnNumber: 17
                                    }, this) : t("disableCloud")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2210,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: ()=>setShowDisableModal(false),
                                    variant: "ghost",
                                    fullWidth: true,
                                    disabled: cloudSyncing,
                                    children: tc("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2227,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2209,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 2177,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: showTailscaleInstallModal,
                title: translateOrFallback("tailscaleInstallTitle", "Install Tailscale"),
                onClose: ()=>!tailscaleInstallBusy && setShowTailscaleInstallModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg border border-blue-500/30 bg-blue-500/10 p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-blue-300",
                                    children: translateOrFallback("tailscaleInstallIntro", "Installs Tailscale on this machine and prepares OmniRoute to enable Funnel.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2246,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-sm text-blue-200/80",
                                    children: translateOrFallback("tailscaleInstallPasswordHint", "On macOS and Linux, sudo may be required for the package install and daemon start.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2252,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2245,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            type: "password",
                            value: tailscalePassword,
                            onChange: (event)=>setTailscalePassword(event.target.value),
                            placeholder: translateOrFallback("tailscaleSudoPlaceholder", "Optional sudo password"),
                            disabled: tailscaleInstallBusy
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2260,
                            columnNumber: 11
                        }, this),
                        tailscaleInstallLog.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-48 overflow-auto rounded-lg border border-border/70 bg-surface/60 p-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "whitespace-pre-wrap text-xs text-text-muted",
                                children: tailscaleInstallLog.join("\n")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2270,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2269,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: ()=>void handleTailscaleInstall(),
                                    fullWidth: true,
                                    disabled: tailscaleInstallBusy,
                                    children: tailscaleInstallBusy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined animate-spin text-sm",
                                                children: "progress_activity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2284,
                                                columnNumber: 19
                                            }, this),
                                            translateOrFallback("tailscaleInstalling", "Installing")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2283,
                                        columnNumber: 17
                                    }, this) : translateOrFallback("tailscaleInstallAndEnable", "Install & Enable")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: ()=>setShowTailscaleInstallModal(false),
                                    variant: "ghost",
                                    fullWidth: true,
                                    disabled: tailscaleInstallBusy,
                                    children: tc("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2293,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2276,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 2244,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2239,
                columnNumber: 7
            }, this),
            selectedProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderModelsModal, {
                provider: selectedProvider,
                models: allModels,
                copy: copy,
                copied: copied,
                onClose: ()=>setSelectedProvider(null)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2306,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
        lineNumber: 1249,
        columnNumber: 5
    }, this);
}
// -- Sub-component: Provider Models Modal ------------------------------------------
function ProviderModelsModal({ provider, models, copy, copied, onClose }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    // Get provider alias for matching models
    // Filter out parent models (models with parent field set) to avoid showing duplicates
    const providerAlias = provider.provider.alias || provider.id;
    const providerModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return models.filter((m)=>!m.parent && (m.owned_by === providerAlias || m.owned_by === provider.id));
    }, [
        models,
        providerAlias,
        provider.id
    ]);
    const chatModels = providerModels.filter((m)=>!m.type);
    const embeddingModels = providerModels.filter((m)=>m.type === "embedding");
    const imageModels = providerModels.filter((m)=>m.type === "image");
    const renderModelGroup = (title, icon, groupModels)=>{
        if (groupModels.length === 0) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                    className: "text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-sm",
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2353,
                            columnNumber: 11
                        }, this),
                        title,
                        " (",
                        groupModels.length,
                        ")"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 2352,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: groupModels.map((m)=>{
                        const copyKey = `modal-${m.id}`;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface/60 group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "text-sm font-mono flex-1 truncate",
                                    children: m.id
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2364,
                                    columnNumber: 17
                                }, this),
                                m.custom && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary",
                                    children: t("custom")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2366,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>copy(m.id, copyKey),
                                    className: "p-1 hover:bg-sidebar rounded text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity",
                                    title: tc("copy"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-sm",
                                        children: copied === copyKey ? "check" : "content_copy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2375,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2370,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, m.id, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2360,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                    lineNumber: 2356,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
            lineNumber: 2351,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: true,
        onClose: onClose,
        title: t("providerModelsTitle", {
            provider: provider.provider.name
        }),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-h-[60vh] overflow-y-auto",
            children: providerModels.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-muted py-4 text-center",
                children: t("noModelsForProvider")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2395,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    renderModelGroup(t("chat"), "chat", chatModels),
                    renderModelGroup(t("embedding"), "data_array", embeddingModels),
                    renderModelGroup(t("image"), "image", imageModels)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
            lineNumber: 2393,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
        lineNumber: 2388,
        columnNumber: 5
    }, this);
}
// -- Sub-component: Endpoint Section ------------------------------------------
function EndpointCard({ icon, iconColor, iconBg, title, path, models, copy, copied, baseUrl, badge, modelsLoading = false }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const copyId = `endpoint_${path}`;
    const fullUrl = `${baseUrl.replace(/\/v1$/, "")}${path}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-border rounded-lg p-3 hover:bg-surface/30 transition-colors flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start gap-2.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center justify-center size-8 rounded-lg ${iconBg} shrink-0`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-base ${iconColor}`,
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2443,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2442,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-xs leading-tight",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2447,
                                        columnNumber: 13
                                    }, this),
                                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[9px] px-1.5 py-0.5 rounded-full border border-border/60 text-text-muted font-medium uppercase tracking-wider leading-none",
                                        children: badge
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2449,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2446,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-text-muted mt-0.5 block",
                                children: models === null ? "—" : modelsLoading ? "..." : t("modelsCount", {
                                    count: models.length
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2454,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2445,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2441,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        className: "flex-1 text-[10px] font-mono text-text-muted bg-surface/80 px-2 py-1 rounded truncate",
                        children: path
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2464,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>void copy(fullUrl, copyId),
                        className: "shrink-0 flex items-center justify-center size-6 rounded hover:bg-sidebar transition-colors",
                        title: t("copyUrl"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[12px] text-text-muted",
                            children: copied === copyId ? "check" : "content_copy"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2472,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2467,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2463,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
        lineNumber: 2440,
        columnNumber: 5
    }, this);
}
function EndpointSection({ icon, iconColor, iconBg, title, path, description, models, expanded, onToggle, copy, copied, baseUrl, modelsLoading = false }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("endpoint");
    const grouped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = {};
        for (const m of models){
            const owner = m.owned_by || "unknown";
            if (!map[owner]) map[owner] = [];
            map[owner].push(m);
        }
        return Object.entries(map).sort((a, b)=>b[1].length - a[1].length);
    }, [
        models
    ]);
    const resolveProvider = (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"][id] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderByAlias"])(id);
    const providerColor = (id)=>resolveProvider(id)?.color || "#888";
    const providerName = (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProviderDisplayName"])(id, resolveProvider(id));
    const copyId = `endpoint_${path}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-border rounded-lg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onToggle,
                className: "w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors text-left",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center justify-center size-10 rounded-lg ${iconBg} shrink-0`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-xl ${iconColor}`,
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                            lineNumber: 2534,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2533,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-sm",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2538,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs px-2 py-0.5 rounded-full bg-surface text-text-muted font-medium",
                                        children: modelsLoading ? "..." : t("modelsCount", {
                                            count: models.length
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2539,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2537,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted mt-0.5",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2543,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2536,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `material-symbols-outlined text-text-muted text-lg transition-transform ${expanded ? "rotate-180" : ""}`,
                        children: "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2545,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2529,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-border px-4 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mt-3 mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                className: "flex-1 text-xs font-mono text-text-muted bg-surface/80 px-3 py-1.5 rounded-lg truncate",
                                children: [
                                    baseUrl.replace(/\/v1$/, ""),
                                    path
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2557,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>copy(`${baseUrl.replace(/\/v1$/, "")}${path}`, copyId),
                                className: "p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-primary transition-colors shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: copied === copyId ? "check" : "content_copy"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                    lineNumber: 2565,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2561,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2556,
                        columnNumber: 11
                    }, this),
                    modelsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 rounded-lg border border-border/70 bg-surface/40 px-3 py-2 text-xs text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined animate-spin text-sm",
                                children: "progress_activity"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2574,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: t("loadingModels")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2577,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2573,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2",
                        children: grouped.map(([providerId, providerModels])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "size-2.5 rounded-full shrink-0",
                                                style: {
                                                    backgroundColor: providerColor(providerId)
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2584,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-semibold text-text-main",
                                                children: providerName(providerId)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2588,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-text-muted",
                                                children: [
                                                    "(",
                                                    providerModels.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2591,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2583,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ml-5 flex flex-wrap gap-1.5",
                                        children: providerModels.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs px-2 py-0.5 rounded-md bg-surface/80 text-text-muted font-mono",
                                                title: m.id,
                                                children: m.root || m.id.split("/").pop()
                                            }, m.id, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                                lineNumber: 2597,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                        lineNumber: 2595,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, providerId, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                                lineNumber: 2582,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                        lineNumber: 2580,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
                lineNumber: 2554,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.tsx",
        lineNumber: 2527,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_0s7cb5v._.js.map