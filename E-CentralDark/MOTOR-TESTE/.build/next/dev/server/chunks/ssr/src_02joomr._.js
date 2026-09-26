module.exports = [
"[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript)");
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
"[project]/src/shared/utils/turkishText.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareTr",
    ()=>compareTr,
    "matchesAnyToken",
    ()=>matchesAnyToken,
    "matchesSearch",
    ()=>matchesSearch,
    "normalizeForSearch",
    ()=>normalizeForSearch
]);
/**
 * Türkçe-güvenli metin normalizasyonu, arama ve sıralama yardımcıları.
 *
 * JavaScript'in locale-bağımsız `toLowerCase()`'i Türkçe `İ/I/ı/i`
 * karakterlerini bozar: `"İ".toLowerCase()` → `"i̇"` (U+0069 U+0307
 * combining dot above). Bu, `toLowerCase().includes()` tabanlı aramada
 * Türkçe girdileri eşleşmez kılar.
 *
 * Saf fonksiyonlar — yan etki ve bağımlılık yok.
 *
 * @module shared/utils/turkishText
 */ /** NFD ile katlanmayan Türkçe harfler için açık eşleme. */ const TR_FOLD = {
    ı: "i",
    ş: "s",
    ğ: "g",
    ü: "u",
    ö: "o",
    ç: "c"
};
function normalizeForSearch(input) {
    if (!input) return "";
    let s = input.toLocaleLowerCase("tr"); // İ→i, I→ı (Türkçe-güvenli)
    s = s.replace(/[ışğüöç]/g, (ch)=>TR_FOLD[ch] ?? ch); // açık Türkçe fold
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); // kalan aksanları sil
    return s.trim();
}
function matchesSearch(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    return normalizeForSearch(text).includes(q);
}
function matchesAnyToken(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    const normalizedText = normalizeForSearch(text);
    if (normalizedText.includes(q)) return true;
    return q.split(/\s+/).filter(Boolean).some((token)=>normalizedText.includes(token));
}
const trCollator = new Intl.Collator("tr", {
    sensitivity: "base",
    numeric: true
});
function compareTr(a, b) {
    return trCollator.compare(a ?? "", b ?? "");
}
}),
"[project]/src/shared/constants/endpointCategories.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Endpoint Category Definitions — API key endpoint restrictions.
 *
 * Each category maps a stable ID to a set of `/v1/` route prefixes.
 * The `resolveEndpointCategory()` function maps an incoming request path
 * to its category for policy enforcement.
 *
 * Empty `allowedEndpoints` on a key = all endpoints allowed (backward compatible).
 *
 * @module shared/constants/endpointCategories
 */ __turbopack_context__.s([
    "ENDPOINT_CATEGORIES",
    ()=>ENDPOINT_CATEGORIES,
    "resolveEndpointCategory",
    ()=>resolveEndpointCategory
]);
const ENDPOINT_CATEGORIES = [
    {
        id: "chat",
        label: "Chat / Messages",
        description: "Chat completions, text completions, messages, and responses",
        prefixes: [
            "/v1/chat/completions",
            "/v1/completions",
            "/v1/messages",
            "/v1/responses"
        ]
    },
    {
        id: "search",
        label: "Web Search",
        description: "Web search and search analytics",
        prefixes: [
            "/v1/search"
        ]
    },
    {
        id: "embeddings",
        label: "Embeddings",
        description: "Text embeddings generation",
        prefixes: [
            "/v1/embeddings"
        ]
    },
    {
        id: "images",
        label: "Images",
        description: "Image generation, editing and upscaling",
        prefixes: [
            "/v1/images"
        ]
    },
    {
        id: "audio",
        label: "Audio / Speech",
        description: "Text-to-speech and speech-to-text",
        prefixes: [
            "/v1/audio"
        ]
    },
    {
        id: "video",
        label: "Video",
        description: "Video generation",
        prefixes: [
            "/v1/videos"
        ]
    },
    {
        id: "music",
        label: "Music",
        description: "Music generation",
        prefixes: [
            "/v1/music"
        ]
    },
    {
        id: "rerank",
        label: "Rerank",
        description: "Document reranking",
        prefixes: [
            "/v1/rerank"
        ]
    },
    {
        id: "models",
        label: "Models",
        description: "List available models (read-only)",
        prefixes: [
            "/v1/models"
        ]
    },
    {
        id: "moderations",
        label: "Moderations",
        description: "Content moderation",
        prefixes: [
            "/v1/moderations"
        ]
    },
    {
        id: "ocr",
        label: "OCR",
        description: "Optical character recognition",
        prefixes: [
            "/v1/ocr"
        ]
    },
    {
        id: "batches",
        label: "Batch Processing",
        description: "Batch API operations",
        prefixes: [
            "/v1/batches"
        ]
    },
    {
        id: "files",
        label: "Files",
        description: "File upload and management",
        prefixes: [
            "/v1/files"
        ]
    },
    {
        id: "web-fetch",
        label: "Web Fetch",
        description: "Web page fetching",
        prefixes: [
            "/v1/web"
        ]
    },
    {
        id: "agents",
        label: "Agents / A2A",
        description: "Agent-to-agent protocol and task execution",
        prefixes: [
            "/v1/agents"
        ]
    }
];
/**
 * Sorted longest-prefix-first so the most specific match wins
 * (e.g. `/v1/chat/completions` before `/v1/chat`).
 */ const SORTED_PREFIXES = ENDPOINT_CATEGORIES.flatMap((cat)=>cat.prefixes.map((prefix)=>({
            prefix,
            categoryId: cat.id
        }))).sort((a, b)=>b.prefix.length - a.prefix.length);
function resolveEndpointCategory(pathname) {
    for (const { prefix, categoryId } of SORTED_PREFIXES){
        if (pathname === prefix || pathname.startsWith(prefix + "/")) {
            return categoryId;
        }
    }
    return null;
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApiKeyFilterChip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-ssr] (ecmascript)");
"use client";
;
;
function ApiKeyFilterChip({ label, count, isActive, dotColor, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", isActive ? "bg-primary text-white border-primary" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/30"),
        children: [
            dotColor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("size-2 rounded-full shrink-0", dotColor)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx",
                lineNumber: 30,
                columnNumber: 20
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            count !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-[11px]", isActive ? "text-white/80" : "text-text-muted"),
                children: count
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ApiKeyFilterBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterChip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterChip.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
function ApiKeyFilterBar({ counts, searchQuery, onSearchChange, activeOnly, onActiveOnlyChange, statusFilter, onStatusChange, typeFilter, onTypeChange }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("apiManager");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const statusChips = [
        {
            value: null,
            label: t("filterAll"),
            dotColor: null,
            count: counts.total
        },
        {
            value: "active",
            label: t("filterStatusActive"),
            dotColor: "bg-green-500",
            count: counts.active
        },
        {
            value: "disabled",
            label: t("filterStatusDisabled"),
            dotColor: "bg-gray-500",
            count: counts.disabled
        },
        {
            value: "banned",
            label: t("filterStatusBanned"),
            dotColor: "bg-red-500",
            count: counts.banned
        },
        {
            value: "expired",
            label: t("filterStatusExpired"),
            dotColor: "bg-amber-500",
            count: counts.expired
        }
    ];
    const typeChips = [
        {
            value: null,
            label: t("filterAll"),
            dotColor: null,
            count: counts.total
        },
        {
            value: "standard",
            label: t("filterTypeStandard"),
            dotColor: "bg-slate-500",
            count: counts.standard
        },
        {
            value: "manage",
            label: t("filterTypeManage"),
            dotColor: "bg-rose-500",
            count: counts.manage
        },
        {
            value: "restricted",
            label: t("filterTypeRestricted"),
            dotColor: "bg-amber-500",
            count: counts.restricted
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 flex-wrap",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex-1 min-w-[160px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    value: searchQuery,
                                    onChange: (e)=>onSearchChange(e.target.value),
                                    placeholder: t("searchPlaceholder"),
                                    "aria-label": t("searchPlaceholder"),
                                    icon: "search",
                                    inputClassName: searchQuery ? "pr-9" : ""
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                searchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onSearchChange(""),
                                    className: "absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text-primary transition-colors",
                                    "aria-label": tc("clear"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px]",
                                        children: "close"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                    lineNumber: 109,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                            size: "sm",
                            checked: activeOnly,
                            onChange: (v)=>{
                                onActiveOnlyChange(v);
                                // When enabling activeOnly, reset statusFilter if it's not "active"
                                if (v && statusFilter !== null && statusFilter !== "active") {
                                    onStatusChange(null);
                                }
                            },
                            label: t("activeOnly"),
                            className: "rounded-lg border border-border bg-bg-subtle px-3 py-1.5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t border-border pt-3 flex flex-wrap items-center gap-x-3 gap-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-semibold uppercase tracking-wider text-text-muted mr-1",
                                    children: [
                                        t("filterStatus"),
                                        ":"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this),
                                statusChips.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterChip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: chip.label,
                                        count: chip.count,
                                        isActive: statusFilter === chip.value || chip.value === "active" && activeOnly && statusFilter === null,
                                        dotColor: chip.dotColor,
                                        onClick: ()=>{
                                            onStatusChange(chip.value);
                                            // If user picks a non-active status chip while activeOnly is on, turn off activeOnly
                                            if (chip.value !== null && chip.value !== "active" && activeOnly) {
                                                onActiveOnlyChange(false);
                                            }
                                        }
                                    }, chip.value ?? "all", false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                        lineNumber: 140,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "aria-hidden": "true",
                            className: "hidden xl:block h-6 w-px bg-border self-center"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-semibold uppercase tracking-wider text-text-muted mr-1",
                                    children: [
                                        t("filterType"),
                                        ":"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                    lineNumber: 163,
                                    columnNumber: 13
                                }, this),
                                typeChips.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterChip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        label: chip.label,
                                        count: chip.count,
                                        isActive: typeFilter === chip.value,
                                        dotColor: chip.dotColor,
                                        onClick: ()=>onTypeChange(chip.value)
                                    }, chip.value ?? "all", false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                            lineNumber: 162,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
            lineNumber: 96,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerPageUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyKeyStatus",
    ()=>classifyKeyStatus,
    "classifyKeyType",
    ()=>classifyKeyType,
    "computeApiKeyCounts",
    ()=>computeApiKeyCounts,
    "formatUsdCost",
    ()=>formatUsdCost,
    "isExpired",
    ()=>isExpired,
    "isKeyActive",
    ()=>isKeyActive,
    "isRestricted",
    ()=>isRestricted,
    "maskKey",
    ()=>maskKey,
    "toLocalDateTimeInputValue",
    ()=>toLocalDateTimeInputValue,
    "toggleKeyVisibility",
    ()=>toggleKeyVisibility
]);
function isKeyActive(k) {
    if (k.isBanned === true) return false;
    if (k.isActive === false) return false;
    if (k.expiresAt) {
        return new Date(k.expiresAt).getTime() > Date.now();
    }
    return true;
}
function isExpired(k) {
    if (!k.expiresAt) return false;
    const ts = new Date(k.expiresAt).getTime();
    if (Number.isNaN(ts)) return false;
    return ts < Date.now();
}
function isRestricted(k) {
    const hasModelRestrictions = Array.isArray(k.allowedModels) && k.allowedModels.length > 0;
    const hasConnectionRestrictions = Array.isArray(k.allowedConnections) && k.allowedConnections.length > 0;
    return hasModelRestrictions || hasConnectionRestrictions;
}
function classifyKeyStatus(k) {
    if (k.isBanned === true) return "banned";
    if (isExpired(k)) return "expired";
    if (k.isActive === false) return "disabled";
    return "active";
}
function classifyKeyType(k) {
    if (Array.isArray(k.scopes) && k.scopes.includes("manage")) return "manage";
    if (isRestricted(k)) return "restricted";
    return "standard";
}
function computeApiKeyCounts(keys) {
    const counts = {
        total: keys.length,
        active: 0,
        disabled: 0,
        banned: 0,
        expired: 0,
        standard: 0,
        manage: 0,
        restricted: 0
    };
    for (const k of keys){
        const status = classifyKeyStatus(k);
        counts[status] += 1;
        const type = classifyKeyType(k);
        counts[type] += 1;
    }
    return counts;
}
function toLocalDateTimeInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n)=>String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function formatUsdCost(value, locale) {
    const amount = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: amount > 0 && amount < 1 ? 4 : 2,
        maximumFractionDigits: amount > 0 && amount < 1 ? 4 : 2
    }).format(amount);
}
function maskKey(fullKey) {
    if (!fullKey) return "";
    if (fullKey.includes("****")) return fullKey;
    return fullKey.length > 8 ? `${fullKey.slice(0, 8)}...` : fullKey;
}
function toggleKeyVisibility(prev, keyId) {
    const next = new Set(prev);
    if (next.has(keyId)) next.delete(keyId);
    else next.add(keyId);
    return next;
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerPageStorage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACTIVE_ONLY_STORAGE_KEY",
    ()=>ACTIVE_ONLY_STORAGE_KEY,
    "parseActiveOnlyPreference",
    ()=>parseActiveOnlyPreference,
    "readActiveOnlyPreference",
    ()=>readActiveOnlyPreference,
    "writeActiveOnlyPreference",
    ()=>writeActiveOnlyPreference
]);
const ACTIVE_ONLY_STORAGE_KEY = "omniroute-api-manager-active-only";
function getBrowserStorage() {
    try {
        return globalThis.localStorage ?? null;
    } catch  {
        return null;
    }
}
function parseActiveOnlyPreference(value) {
    return value === "true";
}
function readActiveOnlyPreference(storage = getBrowserStorage()) {
    if (!storage) return false;
    return parseActiveOnlyPreference(storage.getItem(ACTIVE_ONLY_STORAGE_KEY));
}
function writeActiveOnlyPreference(enabled, storage = getBrowserStorage()) {
    if (!storage) return;
    if (enabled) {
        storage.setItem(ACTIVE_ONLY_STORAGE_KEY, "true");
        return;
    }
    storage.removeItem(ACTIVE_ONLY_STORAGE_KEY);
}
}),
"[project]/src/shared/constants/selfServiceScopes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SELF_SERVICE_SCOPES",
    ()=>DEFAULT_SELF_SERVICE_SCOPES,
    "SELF_ACCOUNT_QUOTA_SCOPE",
    ()=>SELF_ACCOUNT_QUOTA_SCOPE,
    "SELF_USAGE_SCOPE",
    ()=>SELF_USAGE_SCOPE,
    "hasSelfAccountQuotaScope",
    ()=>hasSelfAccountQuotaScope,
    "hasSelfUsageScope",
    ()=>hasSelfUsageScope,
    "normalizeSelfServiceScopesForCreate",
    ()=>normalizeSelfServiceScopesForCreate
]);
const SELF_USAGE_SCOPE = "self:usage";
const SELF_ACCOUNT_QUOTA_SCOPE = "self:account-quota";
const DEFAULT_SELF_SERVICE_SCOPES = [
    SELF_USAGE_SCOPE
];
function hasSelfUsageScope(scopes) {
    return Array.isArray(scopes) && scopes.includes(SELF_USAGE_SCOPE);
}
function hasSelfAccountQuotaScope(scopes) {
    return Array.isArray(scopes) && scopes.includes(SELF_ACCOUNT_QUOTA_SCOPE);
}
function normalizeSelfServiceScopesForCreate(scopes) {
    const normalized = new Set((scopes ?? []).filter((scope)=>typeof scope === "string" && scope));
    normalized.add(SELF_USAGE_SCOPE);
    return [
        ...normalized
    ];
}
}),
"[project]/src/shared/constants/apiKeyPolicyScopes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE",
    ()=>API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE,
    "hasProviderQuotaBypassScope",
    ()=>hasProviderQuotaBypassScope
]);
const API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE = "policy:bypass-provider-quota";
function hasProviderQuotaBypassScope(scopes) {
    return Array.isArray(scopes) && scopes.includes(API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE);
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerScopes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildApiKeyCreateScopes",
    ()=>buildApiKeyCreateScopes,
    "mergeApiKeyPermissionScopes",
    ()=>mergeApiKeyPermissionScopes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/selfServiceScopes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/apiKeyPolicyScopes.ts [app-ssr] (ecmascript)");
;
;
const MANAGEMENT_SCOPE = "manage";
function buildApiKeyCreateScopes(options) {
    const scopes = [];
    const selfUsageEnabled = options.selfUsageEnabled ?? true;
    if (options.manageEnabled) scopes.push(MANAGEMENT_SCOPE);
    if (selfUsageEnabled) scopes.push(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_USAGE_SCOPE"]);
    if (selfUsageEnabled && options.selfAccountQuotaEnabled === true) {
        scopes.push(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_ACCOUNT_QUOTA_SCOPE"]);
    }
    if (options.bypassProviderQuotaPolicyEnabled === true) {
        scopes.push(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE"]);
    }
    return scopes;
}
function mergeApiKeyPermissionScopes(currentScopes, options) {
    const scopes = new Set((currentScopes ?? []).filter((scope)=>typeof scope === "string"));
    setScope(scopes, MANAGEMENT_SCOPE, options.manageEnabled);
    setScope(scopes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_USAGE_SCOPE"], options.selfUsageEnabled);
    setScope(scopes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_ACCOUNT_QUOTA_SCOPE"], options.selfUsageEnabled && options.selfAccountQuotaEnabled);
    setScope(scopes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_KEY_BYPASS_PROVIDER_QUOTA_SCOPE"], options.bypassProviderQuotaPolicyEnabled);
    return [
        ...scopes
    ];
}
function setScope(scopes, scope, enabled) {
    if (enabled) {
        scopes.add(scope);
    } else {
        scopes.delete(scope);
    }
}
}),
"[project]/src/shared/http/apiErrorMessage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "UsageLimitSettings",
    ()=>UsageLimitSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
function UsageLimitSettings({ enabled, dailyLimitUsd, weeklyLimitUsd, enabledLabel, disabledLabel, onEnabledChange, onDailyLimitUsdChange, onWeeklyLimitUsdChange }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("usageLimits");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-text-main",
                                children: t("usdUsageQuota")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                children: t("usdUsageQuotaDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        role: "switch",
                        "aria-checked": enabled,
                        onClick: ()=>onEnabledChange(!enabled),
                        className: `inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${enabled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "paid"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            enabled ? enabledLabel : disabledLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 grid grid-cols-2 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs text-text-muted mb-1 block",
                                children: t("dailyQuotaUsd")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                type: "number",
                                min: 0,
                                step: "0.01",
                                value: dailyLimitUsd,
                                onChange: (event)=>onDailyLimitUsdChange(event.target.value),
                                placeholder: "0.00"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs text-text-muted mb-1 block",
                                children: t("weeklyQuotaUsd")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                type: "number",
                                min: 0,
                                step: "0.01",
                                value: weeklyLimitUsd,
                                onChange: (event)=>onWeeklyLimitUsdChange(event.target.value),
                                placeholder: "0.00"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-[11px] text-text-muted",
                children: t("quotaWindowDescription")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChaosModeAccessToggle",
    ()=>ChaosModeAccessToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
function ChaosModeAccessToggle({ enabled, onToggle }) {
    const tChaos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("chaosConfig");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-text-main",
                        children: tChaos("keyPermission")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: tChaos("keyPermissionDesc")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                role: "switch",
                "aria-checked": enabled,
                onClick: onToggle,
                className: `inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${enabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: "blender"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    tChaos("pageTitle"),
                    " - ",
                    enabled ? tc("enabled") : tc("disabled")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BypassProviderQuotaToggle",
    ()=>BypassProviderQuotaToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
function BypassProviderQuotaToggle({ enabled, onToggle }) {
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("apiManager");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1 pr-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-text-main",
                        children: t("bypassProviderQuota")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: t("bypassProviderQuotaDescription")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                role: "switch",
                "aria-checked": enabled,
                onClick: onToggle,
                className: `inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${enabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: "alt_route"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    enabled ? tc("enabled") : tc("disabled")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ApiManagerPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useCopyToClipboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/display/names.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$endpointCategories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/endpointCategories.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/components/ApiKeyFilterBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerPageUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerPageStorage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/apiManagerScopes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/selfServiceScopes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/http/apiErrorMessage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/apiKeyPolicyScopes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$UsageLimitSettings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/components/UsageLimitSettings.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ChaosModeAccessToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/components/ChaosModeAccessToggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$BypassProviderQuotaToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/api-manager/components/BypassProviderQuotaToggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ReasoningRoutingRules$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ReasoningRoutingRules.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$UsageLimitSettings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ReasoningRoutingRules$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$UsageLimitSettings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ReasoningRoutingRules$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
// Constants for validation
const MAX_KEY_NAME_LENGTH = 200;
const MAX_SELECTED_MODELS = 500;
const CLAUDE_CODE_DEFAULT_MODEL_ID = "cc/*";
const CLAUDE_CODE_DEFAULT_MODEL_NAME = "Claude Code default";
const CLAUDE_CODE_DEFAULT_FAMILIES = [
    {
        id: "other",
        label: "other"
    },
    {
        id: "fable",
        label: "fable"
    },
    {
        id: "opus",
        label: "opus"
    },
    {
        id: "sonnet",
        label: "sonnet"
    },
    {
        id: "haiku",
        label: "haiku"
    }
];
const CLAUDE_CODE_FAMILY_BLOCK_PATTERNS = {
    fable: [
        "claude-fable*",
        "fable"
    ],
    opus: [
        "claude-opus*",
        "opus"
    ],
    sonnet: [
        "claude-sonnet*",
        "sonnet"
    ],
    haiku: [
        "claude-haiku*",
        "haiku"
    ]
};
const CLAUDE_CODE_BLOCK_PATTERN_SET = new Set(Object.values(CLAUDE_CODE_FAMILY_BLOCK_PATTERNS).flat());
// Debounce hook for search optimization
function useDebouncedValue(value, delay) {
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setTimeout(()=>setDebouncedValue(value), delay);
        return ()=>clearTimeout(timer);
    }, [
        value,
        delay
    ]);
    return debouncedValue;
}
// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    return input.replace(/[<>]/g, "").replace(/"/g, "").replace(/'/g, "").trim().slice(0, MAX_KEY_NAME_LENGTH);
}
// Validate key name
function validateKeyName(name, t) {
    if (!name || !name.trim()) {
        return {
            valid: false,
            error: t("keyNameRequired")
        };
    }
    if (name.length > MAX_KEY_NAME_LENGTH) {
        return {
            valid: false,
            error: t("keyNameTooLong", {
                max: MAX_KEY_NAME_LENGTH
            })
        };
    }
    // Allow Unicode letters (accented chars), numbers, spaces, hyphens, underscores
    if (!/^[\p{L}\p{N}_\-\s]+$/u.test(name)) {
        return {
            valid: false,
            error: t("keyNameInvalid")
        };
    }
    return {
        valid: true
    };
}
function isClaudeCodeModel(model) {
    return model.owned_by === "claude" || model.id.startsWith("cc/") || model.id.startsWith("claude/");
}
function withClaudeCodeDefaultModel(models) {
    if (!models.some(isClaudeCodeModel)) return models;
    if (models.some((model)=>model.id === CLAUDE_CODE_DEFAULT_MODEL_ID)) return models;
    return [
        {
            id: CLAUDE_CODE_DEFAULT_MODEL_ID,
            name: CLAUDE_CODE_DEFAULT_MODEL_NAME,
            owned_by: "claude"
        },
        ...models
    ];
}
function getBlockedClaudeCodeFamilies(blockedModels) {
    return Object.keys(CLAUDE_CODE_FAMILY_BLOCK_PATTERNS).filter((familyId)=>CLAUDE_CODE_FAMILY_BLOCK_PATTERNS[familyId].some((pattern)=>blockedModels.includes(pattern)));
}
function isClaudeCodeFamilyModel(modelId, familyId) {
    const normalized = modelId.toLowerCase();
    return normalized === familyId || normalized.includes(`/${familyId}`) || normalized.includes(`-${familyId}`);
}
function ApiManagerPageClient() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("apiManager");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocale"])();
    const newKeyNameInputId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const createKeyFormRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [keys, setKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [allModels, setAllModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [modelsLoaded, setModelsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [allCombos, setAllCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [allConnections, setAllConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showAddModal, setShowAddModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newKeyName, setNewKeyName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newKeyManageEnabled, setNewKeyManageEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newKeySelfUsageEnabled, setNewKeySelfUsageEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [newKeyAccountQuotaEnabled, setNewKeyAccountQuotaEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newKeyAllowUsageCommand, setNewKeyAllowUsageCommand] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [createdKey, setCreatedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingKey, setEditingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showPermissionsModal, setShowPermissionsModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchModel, setSearchModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pageError, setPageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [nameError, setNameError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [createError, setCreateError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [usageStats, setUsageStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [sessionCounts, setSessionCounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [deviceCounts, setDeviceCounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [allowKeyReveal, setAllowKeyReveal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Per-row API key visibility toggle (eye / eye-off). Keys default to masked.
    // Map id -> fully revealed key string fetched on demand from /api/keys/{id}/reveal.
    const [revealedKeys, setRevealedKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [visibleKeys, setVisibleKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const createKeyNameFieldRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeOnly, setActiveOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [typeFilter, setTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quotaPoolGroup, setQuotaPoolGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const { copied, copy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCopyToClipboard"])();
    const scrollCreateKeyFormToTop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const scrollContainer = createKeyFormRef.current?.parentElement;
        if (scrollContainer instanceof HTMLElement) {
            scrollContainer.scrollTop = 0;
        }
        const input = document.getElementById(newKeyNameInputId);
        input?.scrollIntoView({
            block: "nearest",
            inline: "nearest"
        });
        input?.focus({
            preventScroll: true
        });
    }, [
        newKeyNameInputId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchData();
        fetchModels();
        fetchCombos();
        fetchConnections();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial dashboard load only
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!showAddModal || !nameError) return;
        requestAnimationFrame(()=>{
            createKeyNameFieldRef.current?.scrollIntoView({
                block: "center",
                behavior: "instant"
            });
        });
    }, [
        nameError,
        showAddModal
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setActiveOnly((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readActiveOnlyPreference"])());
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeActiveOnlyPreference"])(activeOnly);
    }, [
        activeOnly
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const loadQuotaGroups = async ()=>{
            try {
                const [poolsRes, groupsRes] = await Promise.all([
                    fetch("/api/quota/pools"),
                    fetch("/api/quota/groups")
                ]);
                if (!poolsRes.ok || !groupsRes.ok) return;
                const poolsData = await poolsRes.json();
                const groupsData = await groupsRes.json();
                const pools = Array.isArray(poolsData.pools) ? poolsData.pools : [];
                const groups = Array.isArray(groupsData.groups) ? groupsData.groups : [];
                const groupNameById = {};
                for (const g of groups){
                    groupNameById[g.id] = g.name;
                }
                const map = {};
                for (const p of pools){
                    if (groupNameById[p.groupId]) {
                        map[p.id] = groupNameById[p.groupId];
                    }
                }
                if (!cancelled) setQuotaPoolGroup(map);
            } catch  {
            // fail open — quota group chips simply won't render
            }
        };
        loadQuotaGroups();
        return ()=>{
            cancelled = true;
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!showAddModal || !nameError) return;
        const timeout = window.setTimeout(()=>{
            scrollCreateKeyFormToTop();
        }, 0);
        return ()=>window.clearTimeout(timeout);
    }, [
        showAddModal,
        nameError,
        scrollCreateKeyFormToTop
    ]);
    const fetchModels = async ()=>{
        setModelsLoaded(false);
        try {
            const res = await fetch("/v1/models");
            if (res.ok) {
                const data = await res.json();
                setAllModels(Array.isArray(data.data) ? data.data : []);
                return;
            }
            // Fallback for dashboard API-key editing: /v1/models can be protected by
            // API-key catalog auth, but the dashboard still needs a stable catalog so
            // users can edit allowedModels. Preserve combo pseudo-models too: /v1/models
            // lists active combos as owned_by="combo", while /api/models?all=true only
            // returns the static provider model inventory.
            const [fallbackRes, combosRes] = await Promise.all([
                fetch("/api/models?all=true"),
                fetch("/api/combos")
            ]);
            if (fallbackRes.ok) {
                const [fallbackData, combosData] = await Promise.all([
                    fallbackRes.json(),
                    combosRes.ok ? combosRes.json() : Promise.resolve({
                        combos: []
                    })
                ]);
                const fallbackModels = Array.isArray(fallbackData.models) ? fallbackData.models : [];
                const comboModels = (Array.isArray(combosData.combos) ? combosData.combos : []).filter((combo)=>combo?.isActive !== false && combo?.isHidden !== true && typeof combo?.name === "string" && combo.name.trim().length > 0).map((combo)=>({
                        id: combo.name,
                        owned_by: "combo",
                        name: combo.name
                    }));
                const modelEntries = fallbackModels.map((m)=>({
                        id: typeof m.fullModel === "string" ? m.fullModel : `${m.provider}/${m.model}`,
                        owned_by: typeof m.provider === "string" ? m.provider : "unknown",
                        name: typeof m.alias === "string" ? m.alias : m.model || m.fullModel
                    })).filter((m)=>typeof m.id === "string" && m.id.length > 0);
                const seen = new Set();
                setAllModels([
                    ...comboModels,
                    ...modelEntries
                ].filter((m)=>{
                    if (seen.has(m.id)) return false;
                    seen.add(m.id);
                    return true;
                }));
            } else {
                setAllModels([]);
            }
        } catch (error) {
            console.log("Error fetching models:", error);
            setAllModels([]);
        } finally{
            setModelsLoaded(true);
        }
    };
    const fetchCombos = async ()=>{
        try {
            const res = await fetch("/api/combos");
            if (res.ok) {
                const data = await res.json();
                const combos = Array.isArray(data.combos) ? data.combos : [];
                setAllCombos(combos.filter((combo)=>typeof combo?.name === "string" && combo.name.trim()));
            }
        } catch (error) {
            console.log("Error fetching combos:", error);
        }
    };
    const fetchConnections = async ()=>{
        try {
            const res = await fetch("/api/providers");
            if (res.ok) {
                const data = await res.json();
                setAllConnections(data.connections || []);
            }
        } catch (error) {
            console.log("Error fetching connections:", error);
        }
    };
    const fetchData = async ()=>{
        try {
            const res = await fetch("/api/keys");
            if (res.ok) {
                const data = await res.json();
                setKeys(data.keys || []);
                setAllowKeyReveal(data.allowKeyReveal === true);
                // Fetch usage stats after keys are loaded
                fetchUsageStats(data.keys || []);
                fetchSessionCounts(data.keys || []);
                fetchDeviceCounts(data.keys || []);
            }
        } catch (error) {
            console.log("Error fetching keys:", error);
        } finally{
            setLoading(false);
        }
    };
    const fetchUsageStats = async (apiKeys)=>{
        if (apiKeys.length === 0) return;
        try {
            // Fetch analytics (accurate aggregated counts) and recent call-logs
            // (for lastUsed timestamps) in parallel.
            // The previous approach matched call-logs by key.id === log.apiKeyId,
            // but these use different ID schemes and never matched, yielding 0.
            const [analyticsRes, logsRes] = await Promise.all([
                fetch("/api/usage/analytics?range=all"),
                fetch("/api/usage/call-logs?limit=1000")
            ]);
            const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
            const byApiKey = analytics?.byApiKey || [];
            const logs = logsRes.ok ? await logsRes.json() : [];
            const stats = {};
            for (const key of apiKeys){
                // Match analytics entry by unique API Key ID (isolates usage to this specific key instance)
                const matches = byApiKey.filter((entry)=>entry.apiKeyId === key.id);
                const totalRequests = matches.reduce((sum, entry)=>sum + (Number(entry.requests) || 0), 0);
                const totalCost = matches.reduce((sum, entry)=>{
                    const cost = Number(entry.cost);
                    return sum + (Number.isFinite(cost) ? cost : 0);
                }, 0);
                // Match call logs by unique ID as well for the lastUsed timestamp
                // Prefer an exact apiKeyId match; fall back to name match for legacy
                // logs that predate per-key IDs (apiKeyId absent).
                const lastUsed = (logs || []).find((log)=>log.apiKeyId === key.id || !log.apiKeyId && log.apiKeyName === key.name)?.timestamp || null;
                stats[key.id] = {
                    totalRequests,
                    totalCost,
                    lastUsed
                };
            }
            setUsageStats(stats);
        } catch (e) {
            console.log("Error fetching usage stats:", e);
        }
    };
    const fetchSessionCounts = async (apiKeys)=>{
        if (apiKeys.length === 0) {
            setSessionCounts({});
            return;
        }
        try {
            const res = await fetch("/api/sessions");
            if (!res.ok) return;
            const data = await res.json();
            const byApiKeyRaw = data && typeof data.byApiKey === "object" && !Array.isArray(data.byApiKey) ? data.byApiKey : {};
            const normalized = {};
            for (const key of apiKeys){
                const value = byApiKeyRaw[key.id];
                normalized[key.id] = typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
            }
            setSessionCounts(normalized);
        } catch (error) {
            console.log("Error fetching session counts:", error);
        }
    };
    // Per-key device/connection counts (port of upstream 9router#931, thanks
    // @mugnimaestra). One lightweight GET per key against
    // /api/keys/[id]/devices — device counts are in-memory + TTL-evicted, so
    // this is a much smaller payload than session data.
    const fetchDeviceCounts = async (apiKeys)=>{
        if (apiKeys.length === 0) {
            setDeviceCounts({});
            return;
        }
        try {
            const results = await Promise.all(apiKeys.map(async (key)=>{
                try {
                    const res = await fetch(`/api/keys/${encodeURIComponent(key.id)}/devices`);
                    if (!res.ok) return [
                        key.id,
                        0
                    ];
                    const data = await res.json();
                    const count = typeof data?.count === "number" && Number.isFinite(data.count) ? data.count : 0;
                    return [
                        key.id,
                        count
                    ];
                } catch  {
                    return [
                        key.id,
                        0
                    ];
                }
            }));
            setDeviceCounts(Object.fromEntries(results));
        } catch (error) {
            console.log("Error fetching device counts:", error);
        }
    };
    const clearPageError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setPageError(null), []);
    const keyCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeApiKeyCounts"])(keys), [
        keys
    ]);
    const filteredKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let list = keys;
        // 1. activeOnly toggle (shortcut for the most common case)
        if (activeOnly) {
            list = list.filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyActive"]);
        }
        // 2. status chip filter
        if (statusFilter === "active") list = list.filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyActive"]);
        else if (statusFilter === "disabled") list = list.filter((k)=>k.isActive === false);
        else if (statusFilter === "banned") list = list.filter((k)=>k.isBanned === true);
        else if (statusFilter === "expired") list = list.filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isExpired"]);
        // 3. type chip filter
        if (typeFilter === "manage") list = list.filter((k)=>k.scopes?.includes("manage"));
        else if (typeFilter === "restricted") list = list.filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRestricted"]);
        else if (typeFilter === "standard") list = list.filter((k)=>!k.scopes?.includes("manage") && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRestricted"])(k));
        // 4. search query (case-insensitive substring on name and key)
        if (searchQuery.trim()) {
            list = list.filter((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(k.name, searchQuery) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(k.key, searchQuery));
        }
        return list;
    }, [
        keys,
        activeOnly,
        statusFilter,
        typeFilter,
        searchQuery
    ]);
    const isFiltered = activeOnly || statusFilter !== null || typeFilter !== null || searchQuery.trim() !== "";
    const isQuotaKey = (k)=>Array.isArray(k.allowedQuotas) && k.allowedQuotas.length > 0;
    const quotaKeys = filteredKeys.filter(isQuotaKey);
    const normalKeys = filteredKeys.filter((k)=>!isQuotaKey(k));
    const permissionModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>withClaudeCodeDefaultModel(allModels), [
        allModels
    ]);
    const quotaGroupsForKey = (k)=>{
        if (!Array.isArray(k.allowedQuotas)) return [];
        const seen = new Set();
        const result = [];
        for (const poolId of k.allowedQuotas){
            const groupName = quotaPoolGroup[poolId];
            if (groupName && !seen.has(groupName)) {
                seen.add(groupName);
                result.push(groupName);
            }
        }
        return result;
    };
    const handleClearFilters = ()=>{
        setSearchQuery("");
        setActiveOnly(false);
        setStatusFilter(null);
        setTypeFilter(null);
    };
    const handleCreateKey = async ()=>{
        // Validate raw input first, then sanitize
        const validation = validateKeyName(newKeyName, t);
        if (!validation.valid) {
            scrollCreateKeyFormToTop();
            setNameError(validation.error || t("invalidKeyName"));
            return;
        }
        const sanitizedName = sanitizeInput(newKeyName);
        setIsSubmitting(true);
        setNameError(null);
        setCreateError(null);
        try {
            const res = await fetch("/api/keys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: sanitizedName,
                    scopes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildApiKeyCreateScopes"])({
                        manageEnabled: newKeyManageEnabled,
                        selfUsageEnabled: newKeySelfUsageEnabled,
                        selfAccountQuotaEnabled: newKeyAccountQuotaEnabled
                    }),
                    allowUsageCommand: newKeyAllowUsageCommand
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCreatedKey(data.key);
                await fetchData();
                setNewKeyName("");
                setNewKeyManageEnabled(false);
                setNewKeySelfUsageEnabled(true);
                setNewKeyAccountQuotaEnabled(false);
                setNewKeyAllowUsageCommand(false);
                setShowAddModal(false);
            } else {
                setCreateError((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractApiErrorMessage"])(data, t("failedCreateKey")));
            }
        } catch (error) {
            console.error("Error creating key:", error);
            setCreateError(t("failedCreateKeyRetry"));
        } finally{
            setIsSubmitting(false);
        }
    };
    const handleDeleteKey = async (id)=>{
        if (!id || typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            setPageError(t("invalidKeyId"));
            return;
        }
        if (!confirm(t("deleteConfirm"))) return;
        setIsSubmitting(true);
        clearPageError();
        try {
            const res = await fetch(`/api/keys/${encodeURIComponent(id)}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setKeys((prev)=>prev.filter((k)=>k.id !== id));
                // Clean up any cached reveal/visibility state for this key.
                setRevealedKeys((prev)=>{
                    if (!prev.has(id)) return prev;
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
                setVisibleKeys((prev)=>prev.has(id) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleKeyVisibility"])(prev, id) : prev);
            } else {
                const data = await res.json();
                setPageError((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractApiErrorMessage"])(data, t("failedDeleteKey")));
            }
        } catch (error) {
            console.error("Error deleting key:", error);
            setPageError(t("failedDeleteKeyRetry"));
        } finally{
            setIsSubmitting(false);
        }
    };
    const handleRegenerateKey = async (id)=>{
        if (!id) return;
        if (!confirm(t("regenerateConfirm"))) return;
        setIsSubmitting(true);
        clearPageError();
        try {
            const res = await fetch(`/api/keys/${encodeURIComponent(id)}/regenerate`, {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                setCreatedKey(data.key);
                await fetchData();
            } else {
                setPageError((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractApiErrorMessage"])(data, t("failedRegenerateKey")));
            }
        } catch (error) {
            console.error("Error regenerating key:", error);
            setPageError(t("failedRegenerateKeyRetry"));
        } finally{
            setIsSubmitting(false);
        }
    };
    const handleOpenPermissions = (key)=>{
        if (!key || !key.id) return;
        setEditingKey(key);
        setShowPermissionsModal(true);
    };
    const handleCopyExistingKey = async (keyId)=>{
        if (!keyId) return;
        try {
            const res = await fetch(`/api/keys/${encodeURIComponent(keyId)}/reveal`);
            if (!res.ok) {
                console.log("Error revealing key:", await res.text());
                return;
            }
            const data = await res.json();
            if (typeof data?.key === "string") {
                // Cache the revealed value so a subsequent show-toggle does not refetch.
                setRevealedKeys((prev)=>{
                    const next = new Map(prev);
                    next.set(keyId, data.key);
                    return next;
                });
                await copy(data.key, `existing_key_${keyId}`);
            }
        } catch (error) {
            console.log("Error copying existing key:", error);
        }
    };
    /**
   * Toggle the visibility of one key inline (eye / eye-off button).
   * Lazy-fetches the full key from /api/keys/{id}/reveal on the FIRST show,
   * then caches it in `revealedKeys` so re-toggling is instant. Hiding only
   * flips the visibility set — the cached reveal stays so a re-show is free.
   */ const handleToggleKeyVisibility = async (keyId)=>{
        if (!keyId) return;
        const isCurrentlyVisible = visibleKeys.has(keyId);
        if (!isCurrentlyVisible && !revealedKeys.has(keyId)) {
            try {
                const res = await fetch(`/api/keys/${encodeURIComponent(keyId)}/reveal`);
                if (!res.ok) {
                    console.log("Error revealing key:", await res.text());
                    return;
                }
                const data = await res.json();
                if (typeof data?.key !== "string") return;
                setRevealedKeys((prev)=>{
                    const next = new Map(prev);
                    next.set(keyId, data.key);
                    return next;
                });
            } catch (error) {
                console.log("Error revealing key:", error);
                return;
            }
        }
        setVisibleKeys((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleKeyVisibility"])(prev, keyId));
    };
    const handleUpdatePermissions = async (name, allowedModels, allowedCombos, noLog, allowedConnections, autoResolve, isActive, throttleDelayMs, isBanned, expiresAt, maxSessions, accessSchedule, rateLimits, scopes, allowedEndpoints, streamDefaultMode, disableNonPublicModels, allowUsageCommand, usageLimitEnabled, dailyUsageLimitUsd, weeklyUsageLimitUsd, blockedModels, chaosModeEnabled)=>{
        if (!editingKey || !editingKey.id) return;
        const sanitizedName = sanitizeInput(name);
        // Validate models array
        if (!Array.isArray(allowedModels)) {
            return;
        }
        // Limit number of selected models to prevent abuse
        if (allowedModels.length > MAX_SELECTED_MODELS) {
            return;
        }
        // Validate each model ID
        const validModels = allowedModels.filter((id)=>typeof id === "string" && id.length > 0 && id.length < 200);
        const validBlockedModels = blockedModels.filter((id)=>typeof id === "string" && id.length > 0 && id.length < 200);
        const validCombos = allowedCombos.filter((name)=>typeof name === "string" && name.trim().length > 0 && name.length < 200);
        // Validate connections (must be UUIDs)
        const validConnections = allowedConnections.filter((id)=>typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id));
        const normalizedMaxSessions = typeof maxSessions === "number" && Number.isFinite(maxSessions) ? Math.max(0, Math.floor(maxSessions)) : 0;
        const normalizedThrottleDelayMs = typeof throttleDelayMs === "number" && Number.isFinite(throttleDelayMs) ? Math.max(0, Math.min(300000, Math.floor(throttleDelayMs))) : 0;
        setIsSubmitting(true);
        clearPageError();
        try {
            const res = await fetch(`/api/keys/${encodeURIComponent(editingKey.id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: sanitizedName,
                    allowedModels: validModels,
                    blockedModels: validBlockedModels,
                    allowedCombos: validCombos,
                    allowedConnections: validConnections,
                    noLog,
                    autoResolve,
                    isActive,
                    throttleDelayMs: normalizedThrottleDelayMs,
                    isBanned,
                    expiresAt,
                    maxSessions: normalizedMaxSessions,
                    accessSchedule,
                    rateLimits,
                    scopes,
                    allowedEndpoints,
                    streamDefaultMode,
                    disableNonPublicModels,
                    allowUsageCommand,
                    usageLimitEnabled,
                    dailyUsageLimitUsd,
                    weeklyUsageLimitUsd,
                    chaosModeEnabled
                })
            });
            if (res.ok) {
                await fetchData();
                setShowPermissionsModal(false);
                setEditingKey(null);
            } else {
                const data = await res.json();
                setPageError((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$http$2f$apiErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractApiErrorMessage"])(data, t("failedUpdatePermissions")));
            }
        } catch (error) {
            console.error("Error updating permissions:", error);
            setPageError(t("failedUpdatePermissionsRetry"));
        } finally{
            setIsSubmitting(false);
        }
    };
    // Debounced search for performance
    const debouncedSearchModel = useDebouncedValue(searchModel, 150);
    // Group models by provider (issue #2021 — use centralized display helper so
    // custom OpenAI-/Anthropic-compatible providers don't leak raw synthetic
    // ids like "openai-compatible-chat-<uuid>" into the grouping label)
    const modelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const grouped = {};
        for (const model of permissionModels){
            const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProviderDisplayName"])(model.owned_by) || model.owned_by || t("unknownProvider");
            if (!grouped[provider]) grouped[provider] = [];
            grouped[provider].push(model);
        }
        return Object.entries(grouped).sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compareTr"])(a[0], b[0]));
    }, [
        permissionModels,
        t
    ]);
    // Filter models based on debounced search
    const filteredModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!debouncedSearchModel.trim()) return modelsByProvider;
        return modelsByProvider.map(([provider, models])=>[
                provider,
                models.filter((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(m.id, debouncedSearchModel) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(m.name || "", debouncedSearchModel) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(provider, debouncedSearchModel))
            ]).filter(([, models])=>models.length > 0);
    }, [
        modelsByProvider,
        debouncedSearchModel
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 927,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 928,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
            lineNumber: 926,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-8",
        children: [
            pageError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-red-500",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 938,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-700 dark:text-red-300 flex-1",
                        children: pageError
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 939,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: clearPageError,
                        className: "text-red-500 hover:text-red-700 transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 944,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 940,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 937,
                columnNumber: 9
            }, this),
            keys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ApiKeyFilterBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                counts: keyCounts,
                searchQuery: searchQuery,
                onSearchChange: setSearchQuery,
                activeOnly: activeOnly,
                onActiveOnlyChange: setActiveOnly,
                statusFilter: statusFilter,
                onStatusChange: setStatusFilter,
                typeFilter: typeFilter,
                onTypeChange: setTypeFilter
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 951,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center size-10 rounded-lg bg-amber-500/10 shrink-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-xl text-amber-500",
                                            children: "vpn_key"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 969,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 968,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold",
                                                children: [
                                                    t("registeredKeys"),
                                                    isFiltered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-1.5 text-sm font-normal text-text-muted",
                                                        children: [
                                                            "(",
                                                            t("shownOf", {
                                                                shown: filteredKeys.length,
                                                                total: keys.length
                                                            }),
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 975,
                                                        columnNumber: 19
                                                    }, this),
                                                    !isFiltered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-1.5 text-sm font-normal text-text-muted",
                                                        children: [
                                                            "(",
                                                            keys.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 980,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 972,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted",
                                                children: keys.length === 1 ? t("keyRegistered", {
                                                    count: keys.length
                                                }) : t("keysRegistered", {
                                                    count: keys.length
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 985,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 971,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 967,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                icon: "add",
                                onClick: ()=>{
                                    setNameError(null);
                                    setCreateError(null);
                                    clearPageError();
                                    setShowAddModal(true);
                                },
                                children: t("createKey")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 992,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 966,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted mb-4",
                        children: t("keysSecurityNote")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 1005,
                        columnNumber: 9
                    }, this),
                    keys.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12 border border-dashed border-border rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[32px]",
                                    children: "vpn_key"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1010,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1009,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-text-main font-medium mb-2",
                                children: t("noKeys")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1012,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mb-4",
                                children: t("noKeysDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1013,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                icon: "add",
                                onClick: ()=>{
                                    setNameError(null);
                                    setCreateError(null);
                                    setShowAddModal(true);
                                },
                                children: t("createFirstKey")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1014,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 1008,
                        columnNumber: 11
                    }, this) : filteredKeys.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12 border border-dashed border-border rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[32px]",
                                    children: "search_off"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1028,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1027,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-text-main font-medium mb-2",
                                children: t("emptyFilterTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1030,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                onClick: handleClearFilters,
                                children: t("emptyFilterClear")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1031,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                        lineNumber: 1026,
                        columnNumber: 11
                    }, this) : (()=>{
                        const renderKeyRow = (key)=>{
                            const stats = usageStats[key.id];
                            const isRestricted = Array.isArray(key.allowedModels) && key.allowedModels.length > 0;
                            const hasComboRestrictions = Array.isArray(key.allowedCombos) && key.allowedCombos.length > 0;
                            const hasConnectionRestrictions = Array.isArray(key.allowedConnections) && key.allowedConnections.length > 0;
                            const noLogEnabled = key.noLog === true;
                            const keyIsActive = key.isActive !== false; // default true
                            const throttleDelayMs = typeof key.throttleDelayMs === "number" && key.throttleDelayMs > 0 ? key.throttleDelayMs : 0;
                            const hasThrottle = throttleDelayMs > 0;
                            const hasManageScope = Array.isArray(key.scopes) && key.scopes.includes("manage");
                            const hasProviderQuotaBypass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasProviderQuotaBypassScope"])(key.scopes);
                            const hasJsonStreamDefault = key.streamDefaultMode === "json";
                            const hasLocalUsageCommand = key.allowUsageCommand === true;
                            const maxSessions = typeof key.maxSessions === "number" ? key.maxSessions : 0;
                            const hasSessionLimit = maxSessions > 0;
                            const activeSessions = sessionCounts[key.id] || 0;
                            const deviceCount = deviceCounts[key.id] || 0;
                            const hasSchedule = key.accessSchedule?.enabled === true;
                            const keyIsQuota = isQuotaKey(key);
                            const groups = quotaGroupsForKey(key);
                            const visibleGroups = groups.slice(0, 3);
                            const extraGroupCount = groups.length - visibleGroups.length;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-12 gap-4 px-4 py-3 border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 hover:bg-surface/30 transition-colors group min-w-[760px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `material-symbols-outlined text-sm ${isRestricted ? "text-amber-500" : "text-emerald-500"}`,
                                                children: isRestricted ? "lock" : "lock_open"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1068,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium truncate",
                                                title: key.name,
                                                children: key.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1073,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1067,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-3 flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                className: "text-sm text-text-muted font-mono truncate",
                                                children: visibleKeys.has(key.id) ? revealedKeys.get(key.id) ?? key.key : key.key
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1078,
                                                columnNumber: 21
                                            }, this),
                                            allowKeyReveal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleToggleKeyVisibility(key.id),
                                                        className: "p-1 text-text-muted/60 hover:text-primary transition-colors shrink-0",
                                                        title: visibleKeys.has(key.id) ? t("hideKey") : t("showKey"),
                                                        "aria-label": visibleKeys.has(key.id) ? t("hideKey") : t("showKey"),
                                                        "aria-pressed": visibleKeys.has(key.id),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: visibleKeys.has(key.id) ? "visibility_off" : "visibility"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1090,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 1083,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleCopyExistingKey(key.id),
                                                        className: "p-1 text-text-muted/60 hover:text-primary transition-colors shrink-0",
                                                        title: tc("copy"),
                                                        "aria-label": tc("copy"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: copied === `existing_key_${key.id}` ? "check" : "content_copy"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1100,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 1094,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "p-1 text-text-muted/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 cursor-help",
                                                title: t("keyOnlyAvailableAtCreation"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "lock"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1110,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1106,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1077,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 flex items-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-start gap-1",
                                            children: [
                                                keyIsQuota && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-medium",
                                                    children: t("quotaModeOnly")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1118,
                                                    columnNumber: 25
                                                }, this),
                                                keyIsQuota && visibleGroups.map((groupName)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium truncate max-w-full",
                                                        children: groupName
                                                    }, groupName, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 1124,
                                                        columnNumber: 27
                                                    }, this)),
                                                keyIsQuota && extraGroupCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium",
                                                    children: [
                                                        "+",
                                                        extraGroupCount
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1132,
                                                    columnNumber: 25
                                                }, this),
                                                isRestricted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenPermissions(key),
                                                    className: "flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: "lock"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1142,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("modelsCount", {
                                                            count: key.allowedModels.length
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1138,
                                                    columnNumber: 25
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenPermissions(key),
                                                    className: "flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: "lock_open"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1150,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("allModels")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1146,
                                                    columnNumber: 25
                                                }, this),
                                                hasConnectionRestrictions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenPermissions(key),
                                                    className: "flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: "cable"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1159,
                                                            columnNumber: 27
                                                        }, this),
                                                        key.allowedConnections.length,
                                                        " conn"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1155,
                                                    columnNumber: 25
                                                }, this),
                                                hasComboRestrictions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenPermissions(key),
                                                    className: "flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium hover:bg-teal-500/20 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: "hub"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1168,
                                                            columnNumber: 27
                                                        }, this),
                                                        key.allowedCombos.length,
                                                        " combos"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1164,
                                                    columnNumber: 25
                                                }, this),
                                                noLogEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "visibility_off"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1174,
                                                            columnNumber: 27
                                                        }, this),
                                                        "No-Log"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1173,
                                                    columnNumber: 25
                                                }, this),
                                                key.autoResolve && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "auto_fix_high"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1182,
                                                            columnNumber: 27
                                                        }, this),
                                                        "Auto-Resolve"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1181,
                                                    columnNumber: 25
                                                }, this),
                                                hasJsonStreamDefault && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "data_object"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1190,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("streamDefaultBadge")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1189,
                                                    columnNumber: 25
                                                }, this),
                                                hasLocalUsageCommand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-300 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "terminal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1196,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("localUsageCommandBadge")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1195,
                                                    columnNumber: 25
                                                }, this),
                                                key.usageLimitEnabled === true && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "paid"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1202,
                                                            columnNumber: 27
                                                        }, this),
                                                        "USD quota"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1201,
                                                    columnNumber: 25
                                                }, this),
                                                hasProviderQuotaBypass && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "alt_route"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1208,
                                                            columnNumber: 27
                                                        }, this),
                                                        "Bypass quota policy"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1207,
                                                    columnNumber: 25
                                                }, this),
                                                hasSessionLimit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "group"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1214,
                                                            columnNumber: 27
                                                        }, this),
                                                        "Sessions: ",
                                                        activeSessions,
                                                        "/",
                                                        maxSessions
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1213,
                                                    columnNumber: 25
                                                }, this),
                                                deviceCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-medium",
                                                    title: t("devicesTooltip", {
                                                        count: deviceCount
                                                    }),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "devices"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1223,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("devicesCount", {
                                                            count: deviceCount
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1219,
                                                    columnNumber: 25
                                                }, this),
                                                hasThrottle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "speed"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1229,
                                                            columnNumber: 27
                                                        }, this),
                                                        "+",
                                                        throttleDelayMs,
                                                        "ms"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1228,
                                                    columnNumber: 25
                                                }, this),
                                                hasManageScope && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "admin_panel_settings"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1235,
                                                            columnNumber: 27
                                                        }, this),
                                                        "manage"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1234,
                                                    columnNumber: 25
                                                }, this),
                                                !keyIsActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "block"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1243,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("disabled")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1242,
                                                    columnNumber: 25
                                                }, this),
                                                hasSchedule && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "schedule"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1249,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("scheduleActive")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1248,
                                                    columnNumber: 25
                                                }, this),
                                                key.isBanned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/10 text-red-700 dark:text-red-400 text-[11px] font-bold animate-pulse",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "gavel"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1255,
                                                            columnNumber: 27
                                                        }, this),
                                                        "BANNED"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1254,
                                                    columnNumber: 25
                                                }, this),
                                                key.expiresAt && new Date(key.expiresAt).getTime() < Date.now() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[11px] font-medium",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "event_busy"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 1261,
                                                            columnNumber: 27
                                                        }, this),
                                                        "EXPIRED"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1260,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1115,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 flex flex-col justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium tabular-nums",
                                                children: [
                                                    stats?.totalRequests ?? 0,
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted font-normal text-xs",
                                                        children: t("reqs")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 1270,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1268,
                                                columnNumber: 21
                                            }, this),
                                            (stats?.totalRequests ?? 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-emerald-600 dark:text-emerald-400 tabular-nums",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatUsdCost"])(stats?.totalCost ?? 0, locale)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1273,
                                                columnNumber: 23
                                            }, this),
                                            stats?.lastUsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-text-muted",
                                                children: t("lastUsedOn", {
                                                    date: new Date(stats.lastUsed).toLocaleDateString()
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1278,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-text-muted italic",
                                                children: t("neverUsed")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1282,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1267,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-1 flex items-center text-sm text-text-muted",
                                        children: new Date(key.createdAt).toLocaleDateString()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1285,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 flex items-center justify-end gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `/dashboard/costs?range=all&apiKeyIds=${encodeURIComponent(key.id)}&groupBy=model`,
                                                className: "p-2 hover:bg-emerald-500/10 rounded text-text-muted hover:text-emerald-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all",
                                                title: `View costs for ${key.name}`,
                                                "aria-label": `View costs for ${key.name}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[18px]",
                                                    children: "payments"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1295,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1289,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleRegenerateKey(key.id),
                                                className: "p-2 hover:bg-amber-500/10 rounded text-text-muted hover:text-amber-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all",
                                                title: t("regenerateKey"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[18px]",
                                                    children: "refresh"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1302,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1297,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleOpenPermissions(key),
                                                className: "p-2 hover:bg-primary/10 rounded text-text-muted hover:text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all",
                                                title: t("editPermissions"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[18px]",
                                                    children: "tune"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1309,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1304,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDeleteKey(key.id),
                                                className: "p-2 hover:bg-red-500/10 rounded text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all",
                                                title: t("deleteKey"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[18px]",
                                                    children: "delete"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1316,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1311,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1288,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, key.id, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1063,
                                columnNumber: 17
                            }, this);
                        };
                        const tableHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-12 gap-4 px-4 py-3 bg-surface/50 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[760px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-2",
                                    children: t("name")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1325,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-3",
                                    children: t("key")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1326,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-2",
                                    children: t("permissions")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1327,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-2",
                                    children: t("usage")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1328,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-1",
                                    children: t("created")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1329,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-2 text-right",
                                    children: t("actions")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1330,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1324,
                            columnNumber: 15
                        }, this);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                normalKeys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-base text-text-muted",
                                                    children: "vpn_key"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1340,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-text-main",
                                                    children: t("normalKeysSection")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1343,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface/80 border border-border text-[11px] font-semibold text-text-muted",
                                                    children: normalKeys.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1346,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1339,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border border-border rounded-lg overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overflow-x-auto",
                                                children: [
                                                    tableHeader,
                                                    normalKeys.map(renderKeyRow)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1351,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1350,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1337,
                                    columnNumber: 19
                                }, this),
                                quotaKeys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-base text-violet-500",
                                                    children: "toll"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1362,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-text-main",
                                                    children: t("quotaKeysSection")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1365,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface/80 border border-border text-[11px] font-semibold text-text-muted",
                                                    children: quotaKeys.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1368,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-semibold",
                                                    children: t("quotaPill")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1371,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1361,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border border-border rounded-lg overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overflow-x-auto",
                                                children: [
                                                    tableHeader,
                                                    quotaKeys.map(renderKeyRow)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1376,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1375,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1359,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1335,
                            columnNumber: 15
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 965,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: showAddModal,
                title: t("createKey"),
                bodyClassName: "p-6 max-h-[calc(100vh-150px)] overflow-y-auto",
                onClose: ()=>{
                    setShowAddModal(false);
                    setNewKeyName("");
                    setNewKeyManageEnabled(false);
                    setNewKeySelfUsageEnabled(true);
                    setNewKeyAccountQuotaEnabled(false);
                    setNewKeyAllowUsageCommand(false);
                    setNameError(null);
                    setCreateError(null);
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: createKeyFormRef,
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: createKeyNameFieldRef,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium text-text-main mb-1.5 block",
                                    children: t("keyName")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1407,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    id: newKeyNameInputId,
                                    value: newKeyName,
                                    onChange: (e)=>{
                                        setNewKeyName(e.target.value);
                                        setNameError(null);
                                    },
                                    placeholder: t("keyNamePlaceholder"),
                                    maxLength: MAX_KEY_NAME_LENGTH,
                                    error: nameError,
                                    autoFocus: true
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1410,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted mt-1.5",
                                    children: t("keyNameDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1422,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1406,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("managementAccess")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1426,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("managementAccessDesc")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1427,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1425,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    role: "switch",
                                    "aria-checked": newKeyManageEnabled,
                                    onClick: ()=>setNewKeyManageEnabled((prev)=>!prev),
                                    className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${newKeyManageEnabled ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "admin_panel_settings"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1440,
                                            columnNumber: 15
                                        }, this),
                                        newKeyManageEnabled ? tc("enabled") : tc("disabled")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1429,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1424,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3 p-3 rounded-lg border border-border bg-surface/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("selfServiceVisibility")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1446,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("selfServiceVisibilityDesc")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1447,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1445,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-text-main",
                                                    children: t("ownUsageVisibility")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1451,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-muted",
                                                    children: t("ownUsageVisibilityDesc")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1452,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1450,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            role: "switch",
                                            "aria-checked": newKeySelfUsageEnabled,
                                            onClick: ()=>setNewKeySelfUsageEnabled((prev)=>{
                                                    if (prev) setNewKeyAccountQuotaEnabled(false);
                                                    return !prev;
                                                }),
                                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${newKeySelfUsageEnabled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "query_stats"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1470,
                                                    columnNumber: 17
                                                }, this),
                                                newKeySelfUsageEnabled ? tc("enabled") : tc("disabled")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1454,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1449,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-text-main",
                                                    children: t("sharedAccountQuotaVisibility")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1476,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-muted",
                                                    children: t("sharedAccountQuotaVisibilityDesc")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1477,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1475,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            role: "switch",
                                            "aria-checked": newKeyAccountQuotaEnabled,
                                            disabled: !newKeySelfUsageEnabled,
                                            onClick: ()=>setNewKeyAccountQuotaEnabled((prev)=>!prev),
                                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${newKeyAccountQuotaEnabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"} ${!newKeySelfUsageEnabled ? "opacity-50 cursor-not-allowed" : ""}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "account_balance"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1491,
                                                    columnNumber: 17
                                                }, this),
                                                newKeyAccountQuotaEnabled ? tc("enabled") : tc("disabled")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1479,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1474,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-text-main",
                                                    children: t("localUsageCommand")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1497,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-muted",
                                                    children: t("localUsageCommandDesc")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1498,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1496,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            role: "switch",
                                            "aria-checked": newKeyAllowUsageCommand,
                                            onClick: ()=>setNewKeyAllowUsageCommand((prev)=>!prev),
                                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${newKeyAllowUsageCommand ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "terminal"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 1511,
                                                    columnNumber: 17
                                                }, this),
                                                newKeyAllowUsageCommand ? tc("enabled") : tc("disabled")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 1500,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1495,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1444,
                            columnNumber: 11
                        }, this),
                        createError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-red-500 text-sm",
                                    children: "error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1518,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-red-700 dark:text-red-300 flex-1",
                                    children: createError
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1519,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1517,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: ()=>{
                                        setShowAddModal(false);
                                        setNewKeyName("");
                                        setNewKeyManageEnabled(false);
                                        setNewKeySelfUsageEnabled(true);
                                        setNewKeyAccountQuotaEnabled(false);
                                        setNewKeyAllowUsageCommand(false);
                                        setNameError(null);
                                        setCreateError(null);
                                    },
                                    variant: "ghost",
                                    fullWidth: true,
                                    children: tc("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1523,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    onClick: handleCreateKey,
                                    fullWidth: true,
                                    disabled: !newKeyName.trim(),
                                    loading: isSubmitting,
                                    children: t("createKey")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1539,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1522,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 1405,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 1390,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: !!createdKey,
                title: t("keyCreated"),
                onClose: ()=>setCreatedKey(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-green-600 dark:text-green-400",
                                        children: "check_circle"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1556,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-green-800 dark:text-green-200 font-medium mb-1",
                                                children: t("keyCreatedSuccess")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1560,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-green-700 dark:text-green-300",
                                                children: t("keyCreatedNote")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 1563,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 1559,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 1555,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1554,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    value: createdKey || "",
                                    readOnly: true,
                                    className: "flex-1 font-mono text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1568,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    variant: "secondary",
                                    icon: copied === "created_key" ? "check" : "content_copy",
                                    onClick: ()=>copy(createdKey, "created_key"),
                                    children: copied === "created_key" ? tc("copied") : tc("copy")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 1569,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1567,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            onClick: ()=>setCreatedKey(null),
                            fullWidth: true,
                            children: t("done")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 1577,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 1553,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 1552,
                columnNumber: 7
            }, this),
            editingKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PermissionsModal, {
                isOpen: showPermissionsModal,
                onClose: ()=>{
                    setShowPermissionsModal(false);
                    setEditingKey(null);
                },
                apiKey: editingKey,
                modelsByProvider: filteredModelsByProvider,
                allModels: permissionModels,
                modelsLoaded: modelsLoaded,
                allCombos: allCombos,
                allConnections: allConnections,
                searchModel: searchModel,
                onSearchChange: setSearchModel,
                onSave: handleUpdatePermissions
            }, editingKey.id, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                lineNumber: 1585,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
        lineNumber: 934,
        columnNumber: 5
    }, this);
}
// -- Permissions Modal Component (Memoized for Performance) ------------------------------------------
const PermissionsModal = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(function PermissionsModal({ isOpen, onClose, apiKey, modelsByProvider, allModels, modelsLoaded, allCombos, allConnections, searchModel, onSearchChange, onSave }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("apiManager");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    // Initialize state from props - component remounts when key prop changes
    const initialModels = Array.isArray(apiKey?.allowedModels) ? apiKey.allowedModels : [];
    const initialBlockedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Array.isArray(apiKey?.blockedModels) ? apiKey.blockedModels : [], [
        apiKey?.blockedModels
    ]);
    const initialCombos = Array.isArray(apiKey?.allowedCombos) ? apiKey.allowedCombos : [];
    const initialConnections = Array.isArray(apiKey?.allowedConnections) ? apiKey.allowedConnections : [];
    const [keyName, setKeyName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.name ?? "");
    const [selectedModels, setSelectedModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialModels);
    const [blockedClaudeCodeFamilies, setBlockedClaudeCodeFamilies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getBlockedClaudeCodeFamilies(initialBlockedModels));
    const [claudeCodeFamiliesExpanded, setClaudeCodeFamiliesExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCombos, setSelectedCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialCombos);
    const [allowAll, setAllowAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialModels.length === 0);
    const [allowAllCombos, setAllowAllCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialCombos.length === 0);
    const [noLogEnabled, setNoLogEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.noLog === true);
    const [autoResolveEnabled, setAutoResolveEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.autoResolve === true);
    const [keyIsActive, setKeyIsActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.isActive !== false);
    const [throttleDelayMs, setThrottleDelayMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(typeof apiKey?.throttleDelayMs === "number" && apiKey.throttleDelayMs > 0 ? apiKey.throttleDelayMs : 0);
    const [keyIsBanned, setKeyIsBanned] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.isBanned === true);
    const [expiresAt, setExpiresAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.expiresAt ?? "");
    const [manageEnabled, setManageEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Array.isArray(apiKey?.scopes) && apiKey.scopes.includes("manage"));
    const [selfUsageEnabled, setSelfUsageEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Array.isArray(apiKey?.scopes) && apiKey.scopes.includes(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_USAGE_SCOPE"]));
    const [selfAccountQuotaEnabled, setSelfAccountQuotaEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Array.isArray(apiKey?.scopes) && apiKey.scopes.includes(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$selfServiceScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SELF_ACCOUNT_QUOTA_SCOPE"]));
    const [bypassProviderQuotaPolicyEnabled, setBypassProviderQuotaPolicyEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$apiKeyPolicyScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasProviderQuotaBypassScope"])(apiKey?.scopes));
    const [maxSessions, setMaxSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(typeof apiKey?.maxSessions === "number" && apiKey.maxSessions > 0 ? apiKey.maxSessions : 0);
    const [scheduleEnabled, setScheduleEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.accessSchedule?.enabled === true);
    const [scheduleFrom, setScheduleFrom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.accessSchedule?.from ?? "08:00");
    const [scheduleUntil, setScheduleUntil] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.accessSchedule?.until ?? "18:00");
    const [scheduleDays, setScheduleDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.accessSchedule?.days ?? [
        1,
        2,
        3,
        4,
        5
    ]);
    const [scheduleTz, setScheduleTz] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.accessSchedule?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [rateLimits, setRateLimits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Array.isArray(apiKey?.rateLimits) ? apiKey.rateLimits : []);
    const [streamDefaultMode, setStreamDefaultMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.streamDefaultMode === "json" ? "json" : "legacy");
    const [nameError, setNameError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saveError, setSaveError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedConnections, setSelectedConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialConnections);
    const [allowAllConnections, setAllowAllConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialConnections.length === 0);
    const [expandedProviders, setExpandedProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        // Expand all providers by default when in restrict mode with existing selections
        if (initialModels.length > 0) {
            return new Set(modelsByProvider.map(([p])=>p));
        }
        return new Set();
    });
    const initialEndpoints = Array.isArray(apiKey?.allowedEndpoints) ? apiKey.allowedEndpoints : [];
    const [selectedEndpoints, setSelectedEndpoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialEndpoints);
    const [allowAllEndpoints, setAllowAllEndpoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialEndpoints.length === 0);
    const [disableNonPublicModels, setDisableNonPublicModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.disableNonPublicModels === true);
    const [usageCommandEnabled, setUsageCommandEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.allowUsageCommand === true);
    const [chaosModeEnabled, setChaosModeEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.chaosModeEnabled === true);
    const [usageLimitEnabled, setUsageLimitEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(apiKey?.usageLimitEnabled === true);
    const [dailyUsageLimitUsd, setDailyUsageLimitUsd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(typeof apiKey?.dailyUsageLimitUsd === "number" && apiKey.dailyUsageLimitUsd > 0 ? String(apiKey.dailyUsageLimitUsd) : "");
    const [weeklyUsageLimitUsd, setWeeklyUsageLimitUsd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(typeof apiKey?.weeklyUsageLimitUsd === "number" && apiKey.weeklyUsageLimitUsd > 0 ? String(apiKey.weeklyUsageLimitUsd) : "");
    const getModelDisplayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((modelId)=>modelId === CLAUDE_CODE_DEFAULT_MODEL_ID ? CLAUDE_CODE_DEFAULT_MODEL_NAME : modelId, []);
    // Memoize callbacks to prevent child re-renders
    const handleToggleModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((modelId)=>{
        if (allowAll) return;
        setSelectedModels((prev)=>{
            if (prev.includes(modelId)) {
                if (modelId === CLAUDE_CODE_DEFAULT_MODEL_ID) {
                    setClaudeCodeFamiliesExpanded(false);
                }
                return prev.filter((m)=>m !== modelId);
            }
            return [
                ...prev,
                modelId
            ];
        });
    }, [
        allowAll
    ]);
    const handleToggleProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((provider, models)=>{
        if (allowAll) return;
        const modelIds = models.map((m)=>m.id);
        setSelectedModels((prev)=>{
            const allSelected = modelIds.every((id)=>prev.includes(id));
            if (allSelected) {
                return prev.filter((m)=>!modelIds.includes(m));
            }
            return [
                ...new Set([
                    ...prev,
                    ...modelIds
                ])
            ];
        });
    }, [
        allowAll
    ]);
    const handleSelectAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setAllowAll(true);
        setSelectedModels([]);
        setBlockedClaudeCodeFamilies([]);
        setClaudeCodeFamiliesExpanded(false);
    }, []);
    const handleRestrictMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setAllowAll(false);
        // Expand all providers when entering restrict mode
        const allProviders = new Set(modelsByProvider.map(([p])=>p));
        setExpandedProviders(allProviders);
    }, [
        modelsByProvider
    ]);
    const handleToggleExpand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((provider)=>{
        setExpandedProviders((prev)=>{
            const next = new Set(prev);
            if (next.has(provider)) {
                next.delete(provider);
            } else {
                next.add(provider);
            }
            return next;
        });
    }, []);
    const handleSelectAllModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const allModelIds = allModels.map((m)=>m.id);
        setSelectedModels(allModelIds);
        setBlockedClaudeCodeFamilies([]);
        setClaudeCodeFamiliesExpanded(false);
    }, [
        allModels
    ]);
    const handleDeselectAllModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSelectedModels([]);
        setBlockedClaudeCodeFamilies([]);
        setClaudeCodeFamiliesExpanded(false);
    }, []);
    const handleBlockClaudeCodeFamily = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((familyId)=>{
        setBlockedClaudeCodeFamilies((prev)=>prev.includes(familyId) ? prev : [
                ...prev,
                familyId
            ]);
        setSelectedModels((prev)=>prev.filter((modelId)=>!isClaudeCodeFamilyModel(modelId, familyId)));
    }, []);
    const handleToggleCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((comboName)=>{
        if (allowAllCombos) return;
        setSelectedCombos((prev)=>prev.includes(comboName) ? prev.filter((name)=>name !== comboName) : [
                ...prev,
                comboName
            ]);
    }, [
        allowAllCombos
    ]);
    const handleToggleConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((connectionId)=>{
        if (allowAllConnections) return;
        setSelectedConnections((prev)=>prev.includes(connectionId) ? prev.filter((c)=>c !== connectionId) : [
                ...prev,
                connectionId
            ]);
    }, [
        allowAllConnections
    ]);
    const handleToggleEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((categoryId)=>{
        if (allowAllEndpoints) return;
        setSelectedEndpoints((prev)=>prev.includes(categoryId) ? prev.filter((e)=>e !== categoryId) : [
                ...prev,
                categoryId
            ]);
    }, [
        allowAllEndpoints
    ]);
    const parseUsdLimitInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((value)=>{
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, []);
    const handleSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        // Clear previous inline errors
        setNameError(null);
        setSaveError(null);
        // Validate name inline before calling onSave
        const validation = validateKeyName(keyName, t);
        if (!validation.valid) {
            setNameError(validation.error || t("invalidKeyName"));
            return;
        }
        // Validate models selection
        if (!allowAll && !Array.isArray(selectedModels)) {
            setSaveError(t("invalidModelsSelection"));
            return;
        }
        // Limit number of selected models to prevent abuse
        if (!allowAll && selectedModels.length > MAX_SELECTED_MODELS) {
            setSaveError(t("cannotSelectMoreThanModels", {
                max: MAX_SELECTED_MODELS
            }));
            return;
        }
        const schedule = scheduleEnabled ? {
            enabled: true,
            from: scheduleFrom,
            until: scheduleUntil,
            days: scheduleDays,
            tz: scheduleTz
        } : null;
        const hasClaudeCodeDefaultSelected = !allowAll && selectedModels.includes(CLAUDE_CODE_DEFAULT_MODEL_ID);
        const blockedModels = initialBlockedModels.filter((pattern)=>!CLAUDE_CODE_BLOCK_PATTERN_SET.has(pattern));
        if (hasClaudeCodeDefaultSelected) {
            for (const familyId of blockedClaudeCodeFamilies){
                blockedModels.push(...CLAUDE_CODE_FAMILY_BLOCK_PATTERNS[familyId]);
            }
        }
        onSave(keyName, allowAll ? [] : selectedModels, allowAllCombos ? [] : selectedCombos, noLogEnabled, allowAllConnections ? [] : selectedConnections, autoResolveEnabled, keyIsActive, throttleDelayMs, keyIsBanned, expiresAt || null, maxSessions, schedule, rateLimits.length > 0 ? rateLimits : null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerScopes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeApiKeyPermissionScopes"])(apiKey?.scopes, {
            manageEnabled,
            selfUsageEnabled,
            selfAccountQuotaEnabled,
            bypassProviderQuotaPolicyEnabled
        }), allowAllEndpoints ? [] : selectedEndpoints, streamDefaultMode, disableNonPublicModels, usageCommandEnabled, usageLimitEnabled, parseUsdLimitInput(dailyUsageLimitUsd), parseUsdLimitInput(weeklyUsageLimitUsd), blockedModels, chaosModeEnabled);
    }, [
        onSave,
        keyName,
        allowAll,
        selectedModels,
        allowAllCombos,
        selectedCombos,
        noLogEnabled,
        allowAllConnections,
        selectedConnections,
        autoResolveEnabled,
        keyIsActive,
        throttleDelayMs,
        keyIsBanned,
        expiresAt,
        maxSessions,
        manageEnabled,
        selfUsageEnabled,
        selfAccountQuotaEnabled,
        bypassProviderQuotaPolicyEnabled,
        scheduleEnabled,
        scheduleFrom,
        scheduleUntil,
        scheduleDays,
        scheduleTz,
        rateLimits,
        allowAllEndpoints,
        selectedEndpoints,
        streamDefaultMode,
        disableNonPublicModels,
        usageCommandEnabled,
        usageLimitEnabled,
        dailyUsageLimitUsd,
        weeklyUsageLimitUsd,
        parseUsdLimitInput,
        blockedClaudeCodeFamilies,
        initialBlockedModels,
        chaosModeEnabled,
        apiKey?.scopes,
        t
    ]);
    const selectedCount = selectedModels.length;
    const totalModels = allModels.length;
    const hasClaudeCodeDefaultSelected = !allowAll && selectedModels.includes(CLAUDE_CODE_DEFAULT_MODEL_ID);
    const orderedSelectedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!hasClaudeCodeDefaultSelected) return selectedModels;
        return [
            CLAUDE_CODE_DEFAULT_MODEL_ID,
            ...selectedModels.filter((modelId)=>modelId !== CLAUDE_CODE_DEFAULT_MODEL_ID)
        ];
    }, [
        hasClaudeCodeDefaultSelected,
        selectedModels
    ]);
    const visibleClaudeCodeFamilies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>CLAUDE_CODE_DEFAULT_FAMILIES.filter((family)=>family.id === "other" || !blockedClaudeCodeFamilies.includes(family.id)), [
        blockedClaudeCodeFamilies
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: onClose ? isOpen : false,
        title: t("permissionsTitle", {
            name: apiKey?.name || ""
        }),
        onClose: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("keyName")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2022,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("keyNameDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2023,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2021,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-48 shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                value: keyName,
                                onChange: (e)=>{
                                    setKeyName(e.target.value);
                                    setNameError(null);
                                },
                                placeholder: t("keyNamePlaceholder"),
                                maxLength: MAX_KEY_NAME_LENGTH,
                                error: nameError
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 2026,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2025,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2020,
                    columnNumber: 9
                }, this),
                saveError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-red-500 text-sm",
                            children: "error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2042,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-red-700 dark:text-red-300 flex-1",
                            children: saveError
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2043,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2041,
                    columnNumber: 11
                }, this),
                apiKey?.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ReasoningRoutingRules$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    apiKeyId: apiKey.id
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2047,
                    columnNumber: 24
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2 p-1 bg-surface rounded-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSelectAll,
                            className: `flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${allowAll ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: "lock_open"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2059,
                                    columnNumber: 13
                                }, this),
                                t("allowAll")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2051,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleRestrictMode,
                            className: `flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${!allowAll ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: "lock"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2070,
                                    columnNumber: 13
                                }, this),
                                t("restrict")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2062,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2050,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex items-start gap-2 p-3 rounded-lg ${allowAll ? "bg-green-500/10 border border-green-500/30" : "bg-amber-500/10 border border-amber-500/30"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-[18px] ${allowAll ? "text-green-500" : "text-amber-500"}`,
                            children: allowAll ? "info" : "warning"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2083,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: `text-xs ${allowAll ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`,
                            children: allowAll ? t("allowAllDesc") : !modelsLoaded ? t("restrictLoading") : totalModels === 0 ? t("restrictCatalogUnavailable", {
                                selectedCount
                            }) : t("restrictDesc", {
                                selectedCount,
                                totalModels
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2090,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2076,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("keyActive")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2108,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("keyActiveDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2109,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": keyIsActive,
                            onClick: ()=>setKeyIsActive((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${keyIsActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: keyIsActive ? "check_circle" : "block"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2122,
                                    columnNumber: 13
                                }, this),
                                keyIsActive ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2111,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("maxActiveSessions")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2132,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("maxActiveSessionsDescription")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2133,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-32",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                type: "number",
                                min: 0,
                                step: 1,
                                value: String(maxSessions),
                                onChange: (e)=>{
                                    const parsed = Number.parseInt(e.target.value || "0", 10);
                                    setMaxSessions(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 2136,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2135,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2130,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("throttleDelay")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("throttleDelayDescription")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2153,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2151,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-36",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    type: "number",
                                    min: 0,
                                    max: 300000,
                                    step: 100,
                                    value: String(throttleDelayMs),
                                    onChange: (e)=>{
                                        const parsed = Number.parseInt(e.target.value || "0", 10);
                                        setThrottleDelayMs(Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 300000) : 0);
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2156,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-text-muted mt-1",
                                    children: "milliseconds"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2169,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2155,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2150,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("apiManagerCustomRateLimits")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2177,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("apiManagerCustomRateLimitsDesc")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2180,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2176,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setRateLimits((prev)=>[
                                                ...prev,
                                                {
                                                    limit: 100,
                                                    window: 60
                                                }
                                            ]),
                                    className: "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "add"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2187,
                                            columnNumber: 15
                                        }, this),
                                        "Add Limit"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2182,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2175,
                            columnNumber: 11
                        }, this),
                        rateLimits.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 pt-2",
                            children: rateLimits.map((rl, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                            type: "number",
                                            min: 1,
                                            value: String(rl.limit),
                                            onChange: (e)=>{
                                                const val = parseInt(e.target.value) || 0;
                                                setRateLimits((prev)=>{
                                                    const next = [
                                                        ...prev
                                                    ];
                                                    next[index].limit = val;
                                                    return next;
                                                });
                                            },
                                            placeholder: t("apiManagerRateLimitRequestsPlaceholder")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2195,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-text-muted shrink-0",
                                            children: t("apiManagerRateLimitReqPer")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2209,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                            type: "number",
                                            min: 1,
                                            value: String(rl.window),
                                            onChange: (e)=>{
                                                const val = parseInt(e.target.value) || 0;
                                                setRateLimits((prev)=>{
                                                    const next = [
                                                        ...prev
                                                    ];
                                                    next[index].window = val;
                                                    return next;
                                                });
                                            },
                                            placeholder: t("apiManagerRateLimitSecondsPlaceholder")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2212,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-text-muted shrink-0",
                                            children: "sec"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2226,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setRateLimits((prev)=>prev.filter((_, i)=>i !== index)),
                                            className: "p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0",
                                            title: t("apiManagerRemoveLimitTitle"),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[18px]",
                                                children: "delete"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2233,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2227,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2194,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2192,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2174,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("accessSchedule")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2245,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("accessScheduleDesc")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2246,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2244,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    role: "switch",
                                    "aria-checked": scheduleEnabled,
                                    onClick: ()=>setScheduleEnabled((prev)=>!prev),
                                    className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${scheduleEnabled ? "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "schedule"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2259,
                                            columnNumber: 15
                                        }, this),
                                        scheduleEnabled ? tc("enabled") : tc("disabled")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2248,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2243,
                            columnNumber: 11
                        }, this),
                        scheduleEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3 pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-xs text-text-muted mb-1 block",
                                                    children: t("scheduleFrom")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2267,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "time",
                                                    value: scheduleFrom,
                                                    onChange: (e)=>setScheduleFrom(e.target.value),
                                                    className: "w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-text-main"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2268,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2266,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-xs text-text-muted mb-1 block",
                                                    children: t("scheduleUntil")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2276,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "time",
                                                    value: scheduleUntil,
                                                    onChange: (e)=>setScheduleUntil(e.target.value),
                                                    className: "w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-text-main"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2277,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2275,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2265,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs text-text-muted mb-1.5 block",
                                            children: t("scheduleDays")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2286,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1 flex-wrap",
                                            children: [
                                                [
                                                    0,
                                                    t("daySun")
                                                ],
                                                [
                                                    1,
                                                    t("dayMon")
                                                ],
                                                [
                                                    2,
                                                    t("dayTue")
                                                ],
                                                [
                                                    3,
                                                    t("dayWed")
                                                ],
                                                [
                                                    4,
                                                    t("dayThu")
                                                ],
                                                [
                                                    5,
                                                    t("dayFri")
                                                ],
                                                [
                                                    6,
                                                    t("daySat")
                                                ]
                                            ].map(([dayIdx, label])=>{
                                                const selected = scheduleDays.includes(dayIdx);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setScheduleDays((prev)=>prev.includes(dayIdx) ? prev.filter((d)=>d !== dayIdx) : [
                                                                ...prev,
                                                                dayIdx
                                                            ].sort((a, b)=>a - b)),
                                                    className: `px-2 py-1 text-[11px] font-medium rounded transition-all ${selected ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:border-primary/50"}`,
                                                    children: label
                                                }, dayIdx, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2301,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2287,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2285,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs text-text-muted mb-1 block",
                                            children: t("scheduleTimezone")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2324,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: scheduleTz,
                                            onChange: (e)=>setScheduleTz(e.target.value),
                                            placeholder: t("apiManagerTimezonePlaceholder"),
                                            className: "w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-text-main font-mono"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2327,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-1",
                                            children: t("scheduleTimezoneHint")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2334,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2323,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2264,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2242,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("noLogPayloadPrivacy")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2343,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: "Disable request/response payload persistence for this API key."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2344,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2342,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": noLogEnabled,
                            onClick: ()=>setNoLogEnabled((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${noLogEnabled ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: noLogEnabled ? "visibility_off" : "visibility"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2359,
                                    columnNumber: 13
                                }, this),
                                noLogEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2348,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2341,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("autoResolve")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2369,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("autoResolveDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2370,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2368,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": autoResolveEnabled,
                            onClick: ()=>setAutoResolveEnabled((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${autoResolveEnabled ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: autoResolveEnabled ? "auto_fix_high" : "auto_fix_normal"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2383,
                                    columnNumber: 13
                                }, this),
                                autoResolveEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2372,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2367,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("streamDefaultMode")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2393,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("streamDefaultModeDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2394,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2392,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 p-0.5 bg-surface rounded-md shrink-0 w-full sm:w-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setStreamDefaultMode("legacy"),
                                    className: `inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${streamDefaultMode === "legacy" ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "settings_backup_restore"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2406,
                                            columnNumber: 15
                                        }, this),
                                        t("streamDefaultLegacy")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2397,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setStreamDefaultMode("json"),
                                    className: `inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${streamDefaultMode === "json" ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: "data_object"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2418,
                                            columnNumber: 15
                                        }, this),
                                        t("streamDefaultJson")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2409,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2396,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2391,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-bold text-red-700 dark:text-red-400",
                                    children: t("bannedStatus")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2427,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-red-600 dark:text-red-300",
                                    children: "Immediately revoke all access. Used for suspected abuse or compromised keys."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2428,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2426,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            role: "switch",
                            "aria-checked": keyIsBanned,
                            onClick: ()=>setKeyIsBanned((prev)=>!prev),
                            className: `inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${keyIsBanned ? "bg-red-500 text-white shadow-sm" : "bg-black/5 dark:bg-white/5 text-text-muted hover:bg-black/10 dark:hover:bg-white/10"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: keyIsBanned ? "block" : "check_circle"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2442,
                                    columnNumber: 13
                                }, this),
                                keyIsBanned ? "Banned" : "Active"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2432,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2425,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("expirationDate")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2451,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: "Key will automatically stop working after this date."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2452,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2450,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "datetime-local",
                                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$apiManagerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalDateTimeInputValue"])(expiresAt),
                                    onChange: (e)=>{
                                        const val = e.target.value;
                                        if (!val) {
                                            setExpiresAt("");
                                            return;
                                        }
                                        const date = new Date(val);
                                        if (!Number.isNaN(date.getTime())) {
                                            setExpiresAt(date.toISOString());
                                        }
                                    },
                                    className: "min-w-0 flex-1 px-2 py-1.5 text-sm border border-border rounded-md bg-background text-text-main"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2457,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setExpiresAt(""),
                                    disabled: !expiresAt,
                                    className: "shrink-0 px-3 py-1.5 text-sm font-medium border border-border rounded-md text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                                    children: tc("clear")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2473,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2456,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2449,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("managementAccess")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2486,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("managementAccessDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2487,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2485,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": manageEnabled,
                            onClick: ()=>setManageEnabled((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${manageEnabled ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "admin_panel_settings"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2500,
                                    columnNumber: 13
                                }, this),
                                manageEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2489,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2484,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("selfServiceVisibility")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2507,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("selfServiceVisibilityDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2508,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2506,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": selfUsageEnabled,
                            onClick: ()=>setSelfUsageEnabled((prev)=>{
                                    if (prev) setSelfAccountQuotaEnabled(false);
                                    return !prev;
                                }),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${selfUsageEnabled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "query_stats"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2526,
                                    columnNumber: 13
                                }, this),
                                t("ownUsageVisibility"),
                                " - ",
                                selfUsageEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2510,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: t("ownUsageVisibilityDesc")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2529,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": selfAccountQuotaEnabled,
                            disabled: !selfUsageEnabled,
                            onClick: ()=>setSelfAccountQuotaEnabled((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${selfAccountQuotaEnabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"} ${!selfUsageEnabled ? "opacity-50 cursor-not-allowed" : ""}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "account_balance"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2542,
                                    columnNumber: 13
                                }, this),
                                t("sharedAccountQuotaVisibility"),
                                " -",
                                " ",
                                selfAccountQuotaEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2530,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: t("sharedAccountQuotaVisibilityDesc")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2546,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": usageCommandEnabled,
                            onClick: ()=>setUsageCommandEnabled((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${usageCommandEnabled ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "terminal"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2558,
                                    columnNumber: 13
                                }, this),
                                t("localUsageCommand"),
                                " - ",
                                usageCommandEnabled ? tc("enabled") : tc("disabled")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2547,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: t("localUsageCommandDesc")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2561,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$UsageLimitSettings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UsageLimitSettings"], {
                            enabled: usageLimitEnabled,
                            dailyLimitUsd: dailyUsageLimitUsd,
                            weeklyLimitUsd: weeklyUsageLimitUsd,
                            enabledLabel: tc("enabled"),
                            disabledLabel: tc("disabled"),
                            onEnabledChange: setUsageLimitEnabled,
                            onDailyLimitUsdChange: setDailyUsageLimitUsd,
                            onWeeklyLimitUsdChange: setWeeklyUsageLimitUsd
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2562,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2505,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$ChaosModeAccessToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChaosModeAccessToggle"], {
                    enabled: chaosModeEnabled,
                    onToggle: ()=>setChaosModeEnabled((prev)=>!prev)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2575,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$api$2d$manager$2f$components$2f$BypassProviderQuotaToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BypassProviderQuotaToggle"], {
                    enabled: bypassProviderQuotaPolicyEnabled,
                    onToggle: ()=>setBypassProviderQuotaPolicyEnabled((prev)=>!prev)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2581,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("disableNonPublicModels")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2589,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("disableNonPublicModelsDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2590,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2588,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": disableNonPublicModels,
                            onClick: ()=>setDisableNonPublicModels((prev)=>!prev),
                            className: `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${disableNonPublicModels ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-black/5 dark:bg-white/5 text-text-muted border border-border"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: disableNonPublicModels ? "shield_lock" : "shield"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2603,
                                    columnNumber: 13
                                }, this),
                                disableNonPublicModels ? tc("yes") : tc("no")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2592,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2587,
                    columnNumber: 9
                }, this),
                !allowAll && selectedCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1.5 p-2 bg-primary/5 rounded-lg border border-primary/20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium text-primary",
                                    children: t("selectedCount", {
                                        count: selectedCount
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2614,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSelectAllModels,
                                            className: "text-[10px] text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors",
                                            children: tc("all")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2618,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleDeselectAllModels,
                                            className: "text-[10px] text-red-500 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition-colors",
                                            children: t("clear")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2624,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2617,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2613,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1 max-h-28 overflow-y-auto content-start",
                            children: orderedSelectedModels.map((modelId)=>{
                                if (modelId === CLAUDE_CODE_DEFAULT_MODEL_ID) {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1 basis-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex w-fit items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-text-main text-[10px] rounded border border-primary/35",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setClaudeCodeFamiliesExpanded((prev)=>!prev),
                                                        className: "inline-flex items-center gap-1 font-mono text-text-main",
                                                        title: t("expandClaudeCodeFamilies"),
                                                        "aria-expanded": claudeCodeFamiliesExpanded,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "truncate max-w-[140px]",
                                                                title: modelId,
                                                                children: getModelDisplayName(modelId)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                lineNumber: 2645,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[12px] text-primary",
                                                                children: claudeCodeFamiliesExpanded ? "expand_less" : "expand_more"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                lineNumber: 2648,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2638,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleToggleModel(modelId),
                                                        className: "text-text-muted hover:text-red-500 transition-colors",
                                                        title: t("removeClaudeCodeDefault"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[12px]",
                                                            children: "close"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2658,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2652,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2637,
                                                columnNumber: 23
                                            }, this),
                                            claudeCodeFamiliesExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative ml-2 flex flex-wrap gap-1 pl-5 animate-in fade-in slide-in-from-top-1 duration-150",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        "aria-hidden": "true",
                                                        className: "pointer-events-none absolute left-1.5 top-0 bottom-1 w-px bg-primary/25"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2664,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        "aria-hidden": "true",
                                                        className: "pointer-events-none absolute left-1.5 top-3 h-px w-3 bg-primary/25"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2668,
                                                        columnNumber: 27
                                                    }, this),
                                                    visibleClaudeCodeFamilies.map((family)=>{
                                                        const canBlock = family.id !== "other";
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded border ${canBlock ? "bg-white dark:bg-surface text-text-main border-border" : "bg-black/5 dark:bg-white/5 text-text-muted border-border"}`,
                                                            title: canBlock ? `Allow ${family.label} family through Claude Code default` : "Catch-all for other Claude Code models",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-mono",
                                                                    children: family.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                    lineNumber: 2688,
                                                                    columnNumber: 33
                                                                }, this),
                                                                canBlock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>handleBlockClaudeCodeFamily(family.id),
                                                                    className: "text-text-muted hover:text-red-500 transition-colors",
                                                                    title: `Block ${family.label} family`,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-[12px]",
                                                                        children: "close"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                        lineNumber: 2700,
                                                                        columnNumber: 37
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                    lineNumber: 2690,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, family.id, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2675,
                                                            columnNumber: 31
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2663,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, modelId, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 2636,
                                        columnNumber: 21
                                    }, this);
                                }
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-surface text-text-main text-[10px] rounded border border-border",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-mono truncate max-w-[120px]",
                                            title: modelId,
                                            children: getModelDisplayName(modelId)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2719,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>handleToggleModel(modelId),
                                            className: "text-text-muted hover:text-red-500 transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[12px]",
                                                children: "close"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2727,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2722,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, modelId, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2715,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2632,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2612,
                    columnNumber: 11
                }, this),
                !allowAll && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    value: searchModel,
                                    onChange: (e)=>onSearchChange(e.target.value),
                                    placeholder: t("searchModels"),
                                    icon: "search"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2740,
                                    columnNumber: 15
                                }, this),
                                searchModel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onSearchChange(""),
                                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px]",
                                        children: "close"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 2751,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2747,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2739,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-[280px] overflow-y-auto border border-border rounded-lg divide-y divide-border",
                            children: modelsByProvider.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center justify-center py-6 text-text-muted",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-2xl mb-1",
                                        children: "search_off"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 2759,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs",
                                        children: t("noModelsFound")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                        lineNumber: 2760,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                lineNumber: 2758,
                                columnNumber: 17
                            }, this) : modelsByProvider.map(([provider, models])=>{
                                const selectedInProvider = selectedModels.filter((m)=>models.some((model)=>model.id === m)).length;
                                const allSelected = models.every((m)=>selectedModels.includes(m.id));
                                const someSelected = selectedInProvider > 0 && !allSelected;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleToggleExpand(provider),
                                            className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-surface/50 transition-colors text-left",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-base transition-transform duration-200 ${expandedProviders.has(provider) ? "rotate-90" : ""}`,
                                                    children: "chevron_right"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2776,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative flex items-center cursor-pointer shrink-0",
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                handleToggleProvider(provider, models);
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/20 border-primary" : "border-border hover:border-primary/50"}`,
                                                                children: [
                                                                    allSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-white text-[12px]",
                                                                        children: "check"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                        lineNumber: 2801,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    someSelected && !allSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-primary text-[12px]",
                                                                        children: "remove"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                        lineNumber: 2806,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                                lineNumber: 2791,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2784,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-semibold text-text-main truncate",
                                                            children: provider
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2812,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-text-muted bg-surface px-1 py-0.5 rounded shrink-0",
                                                            children: models.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2815,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2783,
                                                    columnNumber: 25
                                                }, this),
                                                selectedInProvider > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0",
                                                    children: selectedInProvider
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                    lineNumber: 2820,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2772,
                                            columnNumber: 23
                                        }, this),
                                        expandedProviders.has(provider) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "px-3 pb-2 pl-9",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1",
                                                children: models.map((model)=>{
                                                    const isSelected = selectedModels.includes(model.id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleToggleModel(model.id),
                                                        className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono transition-all ${isSelected ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:border-primary/50 hover:text-text-main"}`,
                                                        title: model.id,
                                                        children: getModelDisplayName(model.id)
                                                    }, model.id, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2833,
                                                        columnNumber: 33
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2829,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2828,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, provider, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2771,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2756,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                allConnections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("allowedConnections")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2862,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1 p-0.5 bg-surface rounded-md",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setAllowAllConnections(true);
                                                setSelectedConnections([]);
                                            },
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${allowAllConnections ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: "All"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2864,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setAllowAllConnections(false),
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${!allowAllConnections ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: "Restrict"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2877,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2863,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2861,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: allowAllConnections ? "This key can use any active connection." : `Restricted to ${selectedConnections.length} connection${selectedConnections.length !== 1 ? "s" : ""}.`
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2889,
                            columnNumber: 13
                        }, this),
                        !allowAllConnections && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 max-h-40 overflow-y-auto",
                            children: Object.entries(allConnections.reduce((acc, conn)=>{
                                const p = conn.provider || "Other";
                                if (!acc[p]) acc[p] = [];
                                acc[p].push(conn);
                                return acc;
                            }, {})).sort(([a], [b])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compareTr"])(a, b)).map(([provider, conns])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-semibold text-text-muted uppercase tracking-wider px-1 py-0.5",
                                            children: provider
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2907,
                                            columnNumber: 23
                                        }, this),
                                        conns.map((conn)=>{
                                            const isSelected = selectedConnections.includes(conn.id);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleToggleConnection(conn.id),
                                                className: `w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-all ${isSelected ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface/50 hover:text-text-main"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`,
                                                        children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-white text-[10px]",
                                                            children: "check"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                            lineNumber: 2928,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2922,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate flex-1",
                                                        children: conn.name || conn.id.slice(0, 8)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2933,
                                                        columnNumber: 29
                                                    }, this),
                                                    !conn.isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] text-red-400 shrink-0",
                                                        children: tc("inactive")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                        lineNumber: 2937,
                                                        columnNumber: 31
                                                    }, this)
                                                ]
                                            }, conn.id, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 2913,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    ]
                                }, provider, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2906,
                                    columnNumber: 21
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2895,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2860,
                    columnNumber: 11
                }, this),
                allCombos.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-text-main",
                                    children: t("allowedCombos")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2955,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1 p-0.5 bg-surface rounded-md",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setAllowAllCombos(true);
                                                setSelectedCombos([]);
                                            },
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${allowAllCombos ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: tc("all")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2957,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setAllowAllCombos(false),
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${!allowAllCombos ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: t("restrict")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 2970,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2956,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2954,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: allowAllCombos ? t("allCombosAllowed") : t("restrictedComboCount", {
                                count: selectedCombos.length
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2982,
                            columnNumber: 13
                        }, this),
                        !allowAllCombos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 max-h-40 overflow-y-auto",
                            children: allCombos.slice().sort((a, b)=>a.name.localeCompare(b.name)).map((combo)=>{
                                const isSelected = selectedCombos.includes(combo.name);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleToggleCombo(combo.name),
                                    className: `w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-all ${isSelected ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface/50 hover:text-text-main"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`,
                                            children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-white text-[10px]",
                                                children: "check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 3010,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3004,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate flex-1",
                                            children: combo.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3015,
                                            columnNumber: 25
                                        }, this),
                                        Array.isArray(combo.models) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted shrink-0",
                                            children: [
                                                combo.models.length,
                                                " models"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3017,
                                            columnNumber: 27
                                        }, this)
                                    ]
                                }, combo.id || combo.name, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 2995,
                                    columnNumber: 23
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 2988,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 2953,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 p-3 rounded-lg border border-border bg-surface/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("endpointRestrictions")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3033,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: allowAllEndpoints ? t("allEndpointsAllowed") : t("endpointsRestricted", {
                                                count: selectedEndpoints.length
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3034,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 3032,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1 p-0.5 bg-surface rounded-md",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setAllowAllEndpoints(true);
                                                setSelectedEndpoints([]);
                                            },
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${allowAllEndpoints ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: t("all")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3043,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setAllowAllEndpoints(false),
                                            className: `px-2 py-1 rounded text-xs font-medium transition-all ${!allowAllEndpoints ? "bg-primary text-white" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"}`,
                                            children: t("restrict")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3056,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 3042,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 3031,
                            columnNumber: 11
                        }, this),
                        !allowAllEndpoints && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 max-h-48 overflow-y-auto",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$endpointCategories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ENDPOINT_CATEGORIES"].map((cat)=>{
                                const isSelected = selectedEndpoints.includes(cat.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleToggleEndpoint(cat.id),
                                    className: `w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-all ${isSelected ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface/50 hover:text-text-main"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`,
                                            children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-white text-[10px]",
                                                children: "check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                                lineNumber: 3088,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3082,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate flex-1",
                                            children: cat.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3093,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted shrink-0 truncate max-w-[140px]",
                                            children: cat.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                            lineNumber: 3094,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, cat.id, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                                    lineNumber: 3073,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 3069,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 3030,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            onClick: handleSave,
                            fullWidth: true,
                            children: t("savePermissions")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 3106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            onClick: onClose,
                            variant: "ghost",
                            fullWidth: true,
                            children: tc("cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                            lineNumber: 3109,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
                    lineNumber: 3105,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
            lineNumber: 2018,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx",
        lineNumber: 2013,
        columnNumber: 5
    }, this);
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_02joomr._.js.map