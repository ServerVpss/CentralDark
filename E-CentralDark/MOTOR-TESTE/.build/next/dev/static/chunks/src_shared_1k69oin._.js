(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/utils/cn.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...classes) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(classes));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/sidebarRouteMatch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getActiveSidebarHref",
    ()=>getActiveSidebarHref,
    "matchesSidebarHref",
    ()=>matchesSidebarHref
]);
function matchesSidebarHref(pathname, href, exact = false) {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}
function getActiveSidebarHref(pathname, items) {
    let bestMatch = null;
    for (const item of items){
        if (item.external) continue;
        if (!matchesSidebarHref(pathname, item.href, item.exact === true)) continue;
        if (!bestMatch) {
            bestMatch = item;
            continue;
        }
        if (item.href.length > bestMatch.href.length) {
            bestMatch = item;
            continue;
        }
        if (item.href.length === bestMatch.href.length && item.exact && !bestMatch.exact) {
            bestMatch = item;
        }
    }
    return bestMatch?.href || null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/sidebarSearch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure, framework-free filtering for the sidebar quick-search (#4013).
// Operates on the already-resolved (labeled) section/child shape produced by
// Sidebar.tsx, so it has no dependency on next-intl/React and stays trivially
// unit-testable.
__turbopack_context__.s([
    "filterSidebarSectionsByQuery",
    ()=>filterSidebarSectionsByQuery
]);
function isGroupChild(child) {
    return typeof child === "object" && child !== null && "type" in child && child.type === "group";
}
function filterSidebarSectionsByQuery(sections, query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [
        ...sections
    ];
    const matches = (item)=>item.label.toLowerCase().includes(needle);
    const result = [];
    for (const section of sections){
        const children = [];
        for (const child of section.children){
            if (isGroupChild(child)) {
                const items = child.items.filter(matches);
                if (items.length > 0) {
                    children.push({
                        ...child,
                        items
                    });
                }
            } else if (matches(child)) {
                children.push(child);
            }
        }
        if (children.length > 0) {
            result.push({
                ...section,
                children
            });
        }
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/sidebarExpansionState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expandActiveSection",
    ()=>expandActiveSection,
    "hydrateExpandedSections",
    ()=>hydrateExpandedSections,
    "toggleExpandedSection",
    ()=>toggleExpandedSection
]);
function hydrateExpandedSections(storedExpanded, pinned) {
    return new Set([
        ...storedExpanded,
        ...pinned
    ]);
}
function toggleExpandedSection(expanded, pinned, sectionId) {
    if (expanded.has(sectionId)) {
        const next = new Set(expanded);
        next.delete(sectionId);
        return next;
    }
    return new Set([
        ...pinned,
        sectionId
    ]);
}
function expandActiveSection(pinned, sectionId) {
    return new Set([
        ...pinned,
        sectionId
    ]);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/clipboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clipboard utility with HTTP/HTTPS fallback.
 * navigator.clipboard.writeText() requires HTTPS (secure context).
 * For HTTP deployments, falls back to execCommand('copy').
 */ /**
 * Copy text to clipboard with automatic HTTPS/HTTP fallback.
 * Works in both secure (HTTPS) and non-secure (HTTP) contexts.
 * @param text - Text to copy to clipboard
 * @returns true if copy succeeded, false otherwise
 */ __turbopack_context__.s([
    "copyToClipboard",
    ()=>copyToClipboard
]);
async function copyToClipboard(text) {
    // Method 1: Clipboard API
    // Works on HTTPS, localhost (treated as secure context), and some browsers
    // even on HTTP. Try unconditionally — the catch handles failures.
    if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch  {
        // Fall through to execCommand fallback
        }
    }
    // Method 2: Legacy execCommand fallback (works on HTTP)
    if (typeof document !== "undefined" && document.body) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;pointer-events:none;";
        let appended = false;
        try {
            document.body.appendChild(textArea);
            appended = true;
            textArea.focus();
            textArea.select();
            return document.execCommand("copy");
        } catch  {
            return false;
        } finally{
            if (appended && document.body.contains(textArea)) {
                document.body.removeChild(textArea);
            }
        }
    }
    return false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "del",
    ()=>del,
    "get",
    ()=>get,
    "getErrorMessage",
    ()=>getErrorMessage,
    "parseResponseBody",
    ()=>parseResponseBody,
    "post",
    ()=>post,
    "put",
    ()=>put
]);
/**
 * API utility functions for making HTTP requests
 */ const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};
async function get(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        method: "GET",
        headers: {
            ...DEFAULT_HEADERS,
            ...options.headers
        }
    });
    return handleResponse(response);
}
async function post(url, data, options = {}) {
    const response = await fetch(url, {
        ...options,
        method: "POST",
        headers: {
            ...DEFAULT_HEADERS,
            ...options.headers
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}
async function put(url, data, options = {}) {
    const response = await fetch(url, {
        ...options,
        method: "PUT",
        headers: {
            ...DEFAULT_HEADERS,
            ...options.headers
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
}
async function del(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        method: "DELETE",
        headers: {
            ...DEFAULT_HEADERS,
            ...options.headers
        }
    });
    return handleResponse(response);
}
async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch  {
        return text;
    }
}
function getErrorMessage(body, status, fallback = "Request failed") {
    if (body && typeof body === "object") {
        const rec = body;
        const err = rec.error;
        if (typeof err === "string" && err.trim()) return err;
        if (err && typeof err === "object") {
            const message = err.message;
            if (typeof message === "string" && message.trim()) return message;
            return JSON.stringify(err);
        }
        const msg = rec.message ?? rec.detail;
        if (typeof msg === "string" && msg.trim()) return msg;
    }
    if (typeof body === "string" && body.trim()) {
        return body.length > 300 ? `${body.slice(0, 300)}…` : body;
    }
    return status != null ? `${fallback} (HTTP ${status})` : fallback;
}
async function handleResponse(response) {
    const data = await parseResponseBody(response);
    if (!response.ok) {
        const error = new Error(getErrorMessage(data, response.status, "An error occurred"));
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}
const api = {
    get,
    post,
    put,
    del
};
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/linkify.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// #5486 — Split a plain string into text + URL segments so messages that embed a
// URL (e.g. the GitLab Duo OAuth setup instructions pointing at
// https://gitlab.com/-/profile/applications) can render clickable links instead of
// dead red text in the OAuth error step. Pure (no React) so it is unit-testable.
//
// The matcher is a single unbounded repetition over a NEGATED character class
// (`[^\s...]+`) — linear time, no catastrophic backtracking (ReDoS-safe per the
// bounded-regex rule). A trailing sentence punctuation char is peeled back out of
// the URL so "…restart." keeps its period as text and the link stays valid.
__turbopack_context__.s([
    "linkifyText",
    ()=>linkifyText
]);
const URL_RE = /https?:\/\/[^\s"'<>)]+/g;
// Defense-in-depth scheme allowlist. URL_RE already requires an http(s):// prefix, but
// validate the scheme EXPLICITLY before exposing `href` so the http(s)-only guarantee is
// enforced on the value itself — not merely implied by the regex. A non-parseable or
// non-http(s) match degrades to plain text (no `href`). This also makes the sink safe to
// static analysis: `href` provably can never carry a javascript:/data:/vbscript: scheme
// (CodeQL js/xss + js/client-side-unvalidated-url-redirection).
function safeHttpHref(url) {
    let protocol;
    try {
        protocol = new URL(url).protocol;
    } catch  {
        return undefined;
    }
    return protocol === "http:" || protocol === "https:" ? url : undefined;
}
function linkifyText(input) {
    if (!input) return [];
    const segments = [];
    let last = 0;
    let match;
    URL_RE.lastIndex = 0;
    while((match = URL_RE.exec(input)) !== null){
        if (match.index > last) {
            segments.push({
                text: input.slice(last, match.index)
            });
        }
        let url = match[0];
        let trailing = "";
        while(url.length > 0 && /[.,;:!?]$/.test(url)){
            trailing = url.slice(-1) + trailing;
            url = url.slice(0, -1);
        }
        const href = safeHttpHref(url);
        segments.push(href ? {
            text: url,
            href
        } : {
            text: url
        });
        if (trailing) segments.push({
            text: trailing
        });
        last = match.index + match[0].length;
    }
    if (last < input.length) segments.push({
        text: input.slice(last)
    });
    return segments;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/modelCatalogSearch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelCatalogSourceLabel",
    ()=>getModelCatalogSourceLabel,
    "matchesModelCatalogQuery",
    ()=>matchesModelCatalogQuery,
    "normalizeModelCatalogSource",
    ()=>normalizeModelCatalogSource
]);
function normalizeText(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function normalizeModelCatalogSource(source) {
    const normalized = normalizeText(source);
    if (normalized === "api-sync" || normalized === "synced" || normalized === "auto-sync" || normalized === "imported") {
        return "imported";
    }
    if (normalized === "fallback") return "fallback";
    if (normalized === "alias") return "alias";
    // Models discovered live from a custom provider's upstream `/models` endpoint.
    if (normalized === "auto") return "auto";
    if (normalized === "custom" || normalized === "manual") {
        return "custom";
    }
    return "system";
}
function getModelCatalogSourceLabel(source) {
    switch(normalizeModelCatalogSource(source)){
        case "imported":
            return "Imported";
        case "custom":
            return "Custom";
        case "fallback":
            return "Fallback";
        case "alias":
            return "Alias";
        case "auto":
            return "Auto";
        case "system":
        default:
            return "Built-in";
    }
}
function getModelCatalogSourceSearchText(source) {
    switch(normalizeModelCatalogSource(source)){
        case "imported":
            return "synced api imported discovered";
        case "custom":
            return "custom manual imported";
        case "fallback":
            return "fallback compatible";
        case "alias":
            return "alias shortcut";
        case "auto":
            return "auto fetched discovered upstream";
        case "system":
        default:
            return "built-in builtin official catalog";
    }
}
function matchesModelCatalogQuery(query, target) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return true;
    const haystacks = [
        normalizeText(target.modelId),
        normalizeText(target.modelName),
        normalizeText(target.alias),
        getModelCatalogSourceSearchText(target.source)
    ].filter(Boolean);
    return haystacks.some((value)=>value.includes(normalizedQuery));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/maskEmail.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * maskEmail — Privacy display utility for email addresses.
 *
 * Masks both username and domain portions of an email address.
 * - Username: keep the first `visibleChars`, mask the rest
 * - Domain: mask everything except the final `visibleChars`
 *
 * @example
 *   maskEmail("diego.souza@outlook.com.br")  // "die********@***********.br"
 *   maskEmail("user@gmail.com")              // "use*@******.com"
 *   maskEmail("a@b.com")                     // "a@b.com"  (too short to mask)
 */ __turbopack_context__.s([
    "maskEmail",
    ()=>maskEmail,
    "maskEmailLikeValue",
    ()=>maskEmailLikeValue,
    "pickDisplayValue",
    ()=>pickDisplayValue,
    "pickMaskedDisplayValue",
    ()=>pickMaskedDisplayValue
]);
function maskEmail(email, visibleChars = 3) {
    if (!email) return "";
    if (!email.includes("@")) return email;
    const atIndex = email.lastIndexOf("@");
    const username = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    // If username is too short to mask meaningfully, return as-is
    if (username.length <= visibleChars) return email;
    const maskedUser = username.slice(0, visibleChars) + "*".repeat(username.length - visibleChars);
    if (domain.length <= visibleChars) {
        return `${maskedUser}@${domain}`;
    }
    const maskedDomain = "*".repeat(domain.length - visibleChars) + domain.slice(domain.length - visibleChars);
    return `${maskedUser}@${maskedDomain}`;
}
function maskEmailLikeValue(value, visibleChars = 3) {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.includes("@") ? maskEmail(trimmed, visibleChars) : trimmed;
}
function pickMaskedDisplayValue(values, fallback = "") {
    for (const value of values){
        const masked = maskEmailLikeValue(value);
        if (masked) return masked;
    }
    return fallback;
}
function pickDisplayValue(values, showFull, fallback = "") {
    if (showFull) {
        for (const value of values){
            if (value?.trim()) return value.trim();
        }
        return fallback;
    }
    return pickMaskedDisplayValue(values, fallback);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fmtCompact",
    ()=>fmtCompact,
    "fmtCost",
    ()=>fmtCost,
    "fmtFull",
    ()=>fmtFull,
    "formatApiKeyLabel",
    ()=>formatApiKeyLabel,
    "formatCost",
    ()=>formatCost,
    "formatDuration",
    ()=>formatDuration,
    "formatErrorForDisplay",
    ()=>formatErrorForDisplay,
    "formatResetCountdown",
    ()=>formatResetCountdown,
    "formatTime",
    ()=>formatTime,
    "maskAccount",
    ()=>maskAccount,
    "maskSegment",
    ()=>maskSegment,
    "safePercentage",
    ()=>safePercentage,
    "stableAccountSuffix",
    ()=>stableAccountSuffix,
    "truncateUrl",
    ()=>truncateUrl
]);
/**
 * Shared formatting utilities — DRY extraction from duplicated functions
 * across RequestLoggerV2.js, UsageAnalytics.js, ProxyLogger.js
 *
 * Prevents copy-paste duplication and provides a single source of truth.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-client] (ecmascript)");
;
function formatTime(isoString) {
    try {
        if (!isoString) return "-";
        const d = new Date(isoString);
        return d.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    } catch  {
        return "-";
    }
}
function formatDuration(ms) {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
function maskSegment(value, start = 2, end = 2) {
    if (!value) return "";
    if (value.length <= start + end) return `${value.slice(0, 1)}***`;
    return `${value.slice(0, start)}***${value.slice(-end)}`;
}
function maskAccount(account, emailsVisible) {
    if (!account || account === "-") return "-";
    if (emailsVisible) return account;
    const atIdx = account.indexOf("@");
    if (atIdx > 3) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maskEmail"])(account);
    }
    if (account.length > 8) {
        return account.slice(0, 5) + "***";
    }
    return account;
}
function stableAccountSuffix(account) {
    if (!account || account === "-") return "0000";
    let hash = 0x811c9dc5;
    for(let i = 0; i < account.length; i++){
        hash ^= account.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0").slice(0, 4);
}
function formatApiKeyLabel(apiKeyName, apiKeyId) {
    if (!apiKeyName && !apiKeyId) return "—";
    const displayName = apiKeyName || "key";
    if (!apiKeyId) return displayName;
    return `${displayName} (${maskSegment(apiKeyId, 4, 4)})`;
}
function fmtCompact(n) {
    if (n && n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n && n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n && n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return new Intl.NumberFormat().format(n || 0);
}
function fmtFull(n) {
    return new Intl.NumberFormat().format(n || 0);
}
function formatCost(usd) {
    const value = Number(usd || 0);
    if (!Number.isFinite(value) || value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(2)}`;
}
const fmtCost = formatCost;
function truncateUrl(url, max = 50) {
    if (!url) return "-";
    try {
        const parsed = new URL(url);
        const display = parsed.hostname + parsed.pathname;
        return display.length > max ? display.slice(0, max) + "…" : display;
    } catch  {
        return url.length > max ? url.slice(0, max) + "…" : url;
    }
}
function safePercentage(value) {
    return typeof value === "number" && isFinite(value) ? value : undefined;
}
function formatResetCountdown(resetAt) {
    if (!resetAt) return null;
    const resetTime = typeof resetAt === "number" ? resetAt : new Date(resetAt).getTime();
    if (isNaN(resetTime)) return null;
    const diffMs = resetTime - Date.now();
    if (diffMs <= 0) return null;
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
function formatErrorForDisplay(err) {
    if (err == null) return null;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err, null, 2);
    } catch  {
        return String(err);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/fetchError.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract a human-readable message from a failed `fetch` Response body.
 *
 * Handles both response shapes OmniRoute routes emit:
 * - OpenAI-style `{ error: { message, type, code } }` (from `buildErrorBody`)
 * - legacy `{ error: "..." }` string bodies
 *
 * The server already sanitizes these messages (stack traces / absolute paths
 * stripped via `sanitizeErrorMessage`), so surfacing them in the UI is safe.
 * Falls back to `fallback` when the body is absent, unparseable, or carries no
 * usable message. Never throws -- safe to call directly inside a fetch guard.
 */ __turbopack_context__.s([
    "readFetchErrorMessage",
    ()=>readFetchErrorMessage
]);
async function readFetchErrorMessage(res, fallback) {
    try {
        const body = await res.json();
        const err = body?.error;
        if (typeof err === "string" && err.trim()) return err.trim();
        if (err && typeof err === "object") {
            const message = err.message;
            if (typeof message === "string" && message.trim()) return message.trim();
        }
    } catch  {
    // Non-JSON body (e.g. an HTML 500 page) or a read failure -> use the fallback.
    }
    return fallback;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/serviceTierLabels.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getServiceTierDisplayLabel",
    ()=>getServiceTierDisplayLabel,
    "normalizeServiceTierId",
    ()=>normalizeServiceTierId,
    "translateCostText",
    ()=>translateCostText
]);
const SERVICE_TIER_LABEL_KEYS = {
    priority: "serviceTierFast",
    flex: "serviceTierFlex",
    standard: "serviceTierStandard"
};
const SERVICE_TIER_FALLBACK_LABELS = {
    priority: "Fast",
    flex: "Flex",
    standard: "Standard"
};
function normalizeServiceTierId(value) {
    const tier = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (tier === "priority" || tier === "fast") return "priority";
    if (tier === "flex") return "flex";
    return "standard";
}
function translateCostText(t, key, fallback) {
    return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}
function getServiceTierDisplayLabel(t, serviceTier, fallback) {
    const normalized = normalizeServiceTierId(serviceTier);
    const fallbackText = typeof fallback === "string" ? fallback.trim() : "";
    const fallbackLabel = fallbackText && normalizeServiceTierId(fallbackText) !== normalized ? fallbackText : SERVICE_TIER_FALLBACK_LABELS[normalized];
    return translateCostText(t, SERVICE_TIER_LABEL_KEYS[normalized], fallbackLabel);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/providerDisplayLabel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Get a friendly display label for compatible providers.
 * Converts long IDs like "openai-compatible-chat-02669115-2545-4896-b003-cb4dac09d441"
 * to readable labels. If providerNodes are available, uses user-defined name;
 * otherwise falls back to "OAI-COMPAT" / "ANT-COMPAT".
 *
 * @param provider - The raw provider ID string from a request log or active request.
 * @param providerNodes - Optional array of provider node objects (from /api/provider-nodes).
 * @returns A human-readable label for compatible providers, or `null` if the provider
 *          is not an openai-compatible-* or anthropic-compatible-* provider (caller
 *          should use its own default in that case).
 */ __turbopack_context__.s([
    "getProviderDisplayLabel",
    ()=>getProviderDisplayLabel
]);
function getProviderDisplayLabel(provider, providerNodes) {
    if (!provider) return "-";
    if (provider.startsWith("openai-compatible-") || provider.startsWith("anthropic-compatible-")) {
        // Try to find user-defined name from provider nodes
        if (providerNodes?.length) {
            const matchedNode = providerNodes.find((node)=>node.id === provider || node.prefix === provider);
            if (matchedNode?.name) return matchedNode.name;
        }
        // Fallback to generic labels
        if (provider.startsWith("openai-compatible-")) {
            const suffix = provider.replace("openai-compatible-", "");
            const parts = suffix.split("-");
            if (parts.length > 1 && parts[1]?.length >= 8) return `OAI-COMPAT`;
            return `OAI: ${suffix.slice(0, 16).toUpperCase()}`;
        }
        if (provider.startsWith("anthropic-compatible-")) {
            const suffix = provider.replace("anthropic-compatible-", "");
            const parts = suffix.split("-");
            if (parts.length > 1 && parts[1]?.length >= 8) return `ANT-COMPAT`;
            return `ANT: ${suffix.slice(0, 16).toUpperCase()}`;
        }
    }
    return null; // Not a compatible provider, use default PROVIDER_COLORS
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/dashboardCsrf.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetDashboardCsrfTokenForTests",
    ()=>__resetDashboardCsrfTokenForTests,
    "installDashboardCsrfFetch",
    ()=>installDashboardCsrfFetch,
    "prefetchDashboardCsrfToken",
    ()=>prefetchDashboardCsrfToken,
    "withDashboardCsrfHeader",
    ()=>withDashboardCsrfHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/dashboardCsrf.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/publicApiRoutes.ts [app-client] (ecmascript)");
;
;
let cachedToken = null;
let pendingToken = null;
let originalFetch = null;
let installCount = 0;
const CLIENT_API_ALIAS_PREFIXES = [
    "/chat/completions",
    "/responses",
    "/models",
    "/codex"
];
const TOP_LEVEL_MANAGEMENT_PATH_PREFIXES = [
    "/a2a"
];
function __resetDashboardCsrfTokenForTests() {
    cachedToken = null;
    pendingToken = null;
    if (originalFetch) {
        globalThis.fetch = originalFetch;
        originalFetch = null;
    }
    installCount = 0;
}
function currentDashboardCsrfToken(now = Date.now()) {
    if (cachedToken && cachedToken.expiresAtMs - now > 30_000) {
        return cachedToken.token;
    }
    return null;
}
async function fetchDashboardCsrfToken(now) {
    try {
        const response = await fetch("/api/auth/csrf", {
            cache: "no-store",
            credentials: "same-origin"
        });
        if (!response.ok) return null;
        const body = await response.json().catch(()=>null);
        if (typeof body?.token !== "string" || typeof body.expiresAt !== "string") {
            cachedToken = null;
            return null;
        }
        const expiresAtMs = Date.parse(body.expiresAt);
        if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) {
            cachedToken = null;
            return null;
        }
        cachedToken = {
            token: body.token,
            expiresAtMs
        };
        return cachedToken.token;
    } catch  {
        return null;
    }
}
async function getDashboardCsrfToken() {
    const cached = currentDashboardCsrfToken();
    if (cached) return cached;
    if (!pendingToken) {
        pendingToken = fetchDashboardCsrfToken(Date.now()).finally(()=>{
            pendingToken = null;
        });
    }
    return pendingToken;
}
function prefetchDashboardCsrfToken() {
    return getDashboardCsrfToken();
}
async function withDashboardCsrfHeader(headers) {
    const result = new Headers(headers);
    const token = await getDashboardCsrfToken();
    if (token) result.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DASHBOARD_CSRF_HEADER"], token);
    return result;
}
function requestFromInput(input) {
    return typeof Request !== "undefined" && input instanceof Request ? input : null;
}
function inputUrl(input) {
    const request = requestFromInput(input);
    if (request) return request.url;
    if (input instanceof URL) return input.href;
    return typeof input === "string" ? input : null;
}
function requestMethod(input, init) {
    if (init?.method) return init.method;
    return requestFromInput(input)?.method ?? "GET";
}
function isClientApiPath(pathname) {
    if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) return true;
    if (pathname === "/api/v1beta" || pathname.startsWith("/api/v1beta/")) return true;
    if (pathname === "/v1" || pathname.startsWith("/v1/")) return true;
    if (pathname === "/v1beta" || pathname.startsWith("/v1beta/")) return true;
    if (pathname === "/v1/v1" || pathname.startsWith("/v1/v1/")) return true;
    return CLIENT_API_ALIAS_PREFIXES.some((prefix)=>pathname === prefix || pathname.startsWith(prefix + "/"));
}
function isPublicApiPath(pathname) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PUBLIC_API_ROUTE_PREFIXES"].some((prefix)=>pathname.startsWith(prefix));
}
function shouldAttachDashboardCsrf(url) {
    if (TOP_LEVEL_MANAGEMENT_PATH_PREFIXES.some((prefix)=>url.pathname === prefix || url.pathname.startsWith(prefix + "/"))) {
        return true;
    }
    return url.pathname.startsWith("/api/") && url.pathname !== "/api/auth/csrf" && !isPublicApiPath(url.pathname) && !isClientApiPath(url.pathname);
}
function sameOriginDashboardMutation(input, init) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const method = requestMethod(input, init).toUpperCase();
    if (![
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ].includes(method)) return false;
    const rawUrl = inputUrl(input);
    if (!rawUrl) return false;
    let url;
    try {
        url = new URL(rawUrl, window.location.href);
    } catch  {
        return false;
    }
    return url.origin === window.location.origin && shouldAttachDashboardCsrf(url);
}
function mergedHeaders(input, init) {
    return new Headers(init?.headers ?? requestFromInput(input)?.headers);
}
function installDashboardCsrfFetch() {
    if (typeof globalThis.fetch !== "function") return ()=>{};
    if (installCount === 0) {
        originalFetch = globalThis.fetch;
        globalThis.fetch = async (input, init)=>{
            if (!originalFetch || !sameOriginDashboardMutation(input, init)) {
                return originalFetch ? originalFetch(input, init) : fetch(input, init);
            }
            const headers = mergedHeaders(input, init);
            if (headers.has(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DASHBOARD_CSRF_HEADER"])) {
                return originalFetch(input, init);
            }
            const token = currentDashboardCsrfToken() ?? await getDashboardCsrfToken();
            if (!token) return originalFetch(input, init);
            headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DASHBOARD_CSRF_HEADER"], token);
            return originalFetch(input, {
                ...init,
                headers
            });
        };
    }
    installCount++;
    let active = true;
    return ()=>{
        if (!active) return;
        active = false;
        installCount = Math.max(0, installCount - 1);
        if (installCount === 0 && originalFetch) {
            globalThis.fetch = originalFetch;
            originalFetch = null;
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/hooks/useTheme.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/themeStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Subscribe to system theme changes
function subscribeToSystemTheme(callback) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", callback);
    return ()=>mediaQuery.removeEventListener("change", callback);
}
// Get current system theme preference
function getSystemThemeSnapshot() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
// Server snapshot always returns false
function getServerSnapshot() {
    return false;
}
function useTheme() {
    _s();
    const { theme, setTheme, toggleTheme, initTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    // Use useSyncExternalStore to safely subscribe to system theme
    const systemPrefersDark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeToSystemTheme, getSystemThemeSnapshot, getServerSnapshot);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTheme.useEffect": ()=>{
            initTheme();
        }
    }["useTheme.useEffect"], [
        initTheme
    ]);
    // Listen for system theme changes when theme is "system"
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTheme.useEffect": ()=>{
            if (theme !== "system") return;
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = {
                "useTheme.useEffect.handleChange": ()=>initTheme()
            }["useTheme.useEffect.handleChange"];
            mediaQuery.addEventListener("change", handleChange);
            return ({
                "useTheme.useEffect": ()=>mediaQuery.removeEventListener("change", handleChange)
            })["useTheme.useEffect"];
        }
    }["useTheme.useEffect"], [
        theme,
        initTheme
    ]);
    // Compute isDark from current state (no effect needed)
    const isDark = theme === "dark" || theme === "system" && systemPrefersDark;
    return {
        theme,
        setTheme,
        toggleTheme,
        isDark
    };
}
_s(useTheme, "NzZUJcA3VFFuBg1KwOuOWQgxm1s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$themeStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/hooks/useElectron.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDataDir",
    ()=>useDataDir,
    "useElectronAppInfo",
    ()=>useElectronAppInfo,
    "useIsElectron",
    ()=>useIsElectron,
    "useOpenExternal",
    ()=>useOpenExternal,
    "usePortChanged",
    ()=>usePortChanged,
    "useServerControls",
    ()=>useServerControls,
    "useServerStatus",
    ()=>useServerStatus,
    "useWindowControls",
    ()=>useWindowControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature();
"use client";
;
/**
 * Code Review Fixes Applied:
 * #7  useIsElectron — useSyncExternalStore for zero re-renders
 * #11 Import AppInfo type instead of inline duplication
 * #12 useDataDir — add error state (was swallowed silently)
 */ // ── Fix #7: Module-level detection (no state, no re-renders) ──
function getIsElectronSnapshot() {
    return ("TURBOPACK compile-time value", "object") !== "undefined" && window.electronAPI?.isElectron === true;
}
function getServerSnapshot() {
    return false; // SSR always returns false
}
const noop = ()=>()=>{};
function useIsElectron() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(noop, getIsElectronSnapshot, getServerSnapshot);
}
_s(useIsElectron, "FpwL93IKMLJZuQQXefVtWynbBPQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
function useElectronAppInfo() {
    _s1();
    const hasApi = getIsElectronSnapshot();
    const [appInfo, setAppInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hasApi);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useElectronAppInfo.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !window.electronAPI) return;
            window.electronAPI.getAppInfo().then({
                "useElectronAppInfo.useEffect": (info)=>{
                    setAppInfo(info);
                    setLoading(false);
                }
            }["useElectronAppInfo.useEffect"]).catch({
                "useElectronAppInfo.useEffect": (err)=>{
                    setError(err);
                    setLoading(false);
                }
            }["useElectronAppInfo.useEffect"]);
        }
    }["useElectronAppInfo.useEffect"], []);
    return {
        appInfo,
        loading,
        error
    };
}
_s1(useElectronAppInfo, "a3l0RKyO6Uk4OvkDM1Ps72wxAuI=");
function useDataDir() {
    _s2();
    const hasApi = getIsElectronSnapshot();
    const [dataDir, setDataDir] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hasApi);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDataDir.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !window.electronAPI) return;
            window.electronAPI.getDataDir().then({
                "useDataDir.useEffect": (dir)=>{
                    setDataDir(dir);
                    setLoading(false);
                }
            }["useDataDir.useEffect"]).catch({
                "useDataDir.useEffect": (err)=>{
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setLoading(false);
                }
            }["useDataDir.useEffect"]);
        }
    }["useDataDir.useEffect"], []);
    return {
        dataDir,
        loading,
        error
    };
}
_s2(useDataDir, "z11ifuAzu9O8Z/jW2n18NfKx3n8=");
function useWindowControls() {
    _s3();
    const isElectron = useIsElectron();
    const minimize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWindowControls.useCallback[minimize]": ()=>{
            if (isElectron && window.electronAPI) {
                window.electronAPI.minimizeWindow();
            }
        }
    }["useWindowControls.useCallback[minimize]"], [
        isElectron
    ]);
    const maximize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWindowControls.useCallback[maximize]": ()=>{
            if (isElectron && window.electronAPI) {
                window.electronAPI.maximizeWindow();
            }
        }
    }["useWindowControls.useCallback[maximize]"], [
        isElectron
    ]);
    const close = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWindowControls.useCallback[close]": ()=>{
            if (isElectron && window.electronAPI) {
                window.electronAPI.closeWindow();
            }
        }
    }["useWindowControls.useCallback[close]"], [
        isElectron
    ]);
    return {
        isElectron,
        minimize,
        maximize,
        close
    };
}
_s3(useWindowControls, "PB2c5IS+SXPfRqQV8F9cdeU/YsI=", false, function() {
    return [
        useIsElectron
    ];
});
function useOpenExternal() {
    _s4();
    const isElectron = useIsElectron();
    const openExternal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useOpenExternal.useCallback[openExternal]": async (url)=>{
            if (isElectron && window.electronAPI) {
                await window.electronAPI.openExternal(url);
            } else {
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }
    }["useOpenExternal.useCallback[openExternal]"], [
        isElectron
    ]);
    return {
        openExternal
    };
}
_s4(useOpenExternal, "d9016B3wril3Npz5cqqSEB5+ykY=", false, function() {
    return [
        useIsElectron
    ];
});
function useServerControls() {
    _s5();
    const isElectron = useIsElectron();
    const [restarting, setRestarting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const restart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useServerControls.useCallback[restart]": async ()=>{
            if (!isElectron || !window.electronAPI) {
                return {
                    success: false
                };
            }
            setRestarting(true);
            try {
                const result = await window.electronAPI.restartServer();
                return result;
            } finally{
                setRestarting(false);
            }
        }
    }["useServerControls.useCallback[restart]"], [
        isElectron
    ]);
    return {
        isElectron,
        restart,
        restarting
    };
}
_s5(useServerControls, "N65G8zwerhH2sWGUzQBb4P7zieo=", false, function() {
    return [
        useIsElectron
    ];
});
function useServerStatus(onStatus) {
    _s6();
    const isElectron = useIsElectron();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useServerStatus.useEffect": ()=>{
            if (!isElectron || !window.electronAPI) return;
            const dispose = window.electronAPI.onServerStatus(onStatus);
            return dispose;
        }
    }["useServerStatus.useEffect"], [
        isElectron,
        onStatus
    ]);
}
_s6(useServerStatus, "1ArlN/wCbXd6VVYTgaU568skQLM=", false, function() {
    return [
        useIsElectron
    ];
});
function usePortChanged(onPortChanged) {
    _s7();
    const isElectron = useIsElectron();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePortChanged.useEffect": ()=>{
            if (!isElectron || !window.electronAPI) return;
            const dispose = window.electronAPI.onPortChanged(onPortChanged);
            return dispose;
        }
    }["usePortChanged.useEffect"], [
        isElectron,
        onPortChanged
    ]);
}
_s7(usePortChanged, "1ArlN/wCbXd6VVYTgaU568skQLM=", false, function() {
    return [
        useIsElectron
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/hooks/useCopyToClipboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCopyToClipboard",
    ()=>useCopyToClipboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clipboard.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useCopyToClipboard(resetDelay = 2000) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const copy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCopyToClipboard.useCallback[copy]": async (text, id = "default")=>{
            const success = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyToClipboard"])(text);
            if (success) {
                setCopied(id);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout({
                    "useCopyToClipboard.useCallback[copy]": ()=>{
                        setCopied(null);
                    }
                }["useCopyToClipboard.useCallback[copy]"], resetDelay);
            }
            return success;
        }
    }["useCopyToClipboard.useCallback[copy]"], [
        resetDelay
    ]);
    return {
        copied,
        copy
    };
}
_s(useCopyToClipboard, "Gw+fWIjCFccsFPh6gIRRXAZb7hk=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/validation/providerSchema.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProviderSchema",
    ()=>ProviderSchema,
    "ProvidersMapSchema",
    ()=>ProvidersMapSchema,
    "validateProviders",
    ()=>validateProviders
]);
/**
 * Provider Schema Validation — Phase 7.2
 *
 * Zod schemas for provider constant validation.
 * Validates provider category maps
 * at module load time to catch configuration drift early.
 *
 * @module shared/validation/providerSchema
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-client] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$serviceKinds$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/serviceKinds.ts [app-client] (ecmascript)");
;
;
const ProviderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    alias: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)"),
    textIcon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    website: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional(),
    passthroughModels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    subscriptionRisk: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    riskNoticeVariant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "oauth",
        "webCookie",
        "deprecated",
        "embedded-service"
    ]).optional(),
    isEmbeddedService: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    deprecated: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    deprecationReason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    hiddenFromDashboard: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    hasFree: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    freeNote: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    authHint: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    apiHint: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    serviceKinds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$serviceKinds$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SERVICE_KIND_VALUES"])).optional(),
    noAuth: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    anonymousFallback: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    managedAccount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const ProvidersMapSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), ProviderSchema);
function validateProviders(map, name) {
    const result = ProvidersMapSchema.safeParse(map);
    if (!result.success) {
        const issues = result.error.issues.map((i)=>`  ${i.path.join(".")}: ${i.message}`).join("\n");
        console.error(`[PROVIDER VALIDATION] ${name} has invalid entries:\n${issues}`);
        throw new Error(`Provider validation failed for ${name}`);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_shared_1k69oin._.js.map