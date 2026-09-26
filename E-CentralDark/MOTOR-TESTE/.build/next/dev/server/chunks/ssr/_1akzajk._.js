module.exports = [
"[project]/src/shared/utils/noAuthProviders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isNoAuthProviderBlocked",
    ()=>isNoAuthProviderBlocked,
    "isNoAuthProviderKey",
    ()=>isNoAuthProviderKey,
    "isNoAuthRawProviderPrefix",
    ()=>isNoAuthRawProviderPrefix,
    "isProviderBlockedByIdOrAlias",
    ()=>isProviderBlockedByIdOrAlias,
    "normalizeBlockedProviderSet",
    ()=>normalizeBlockedProviderSet,
    "partitionNoAuthEntriesByBlocked",
    ()=>partitionNoAuthEntriesByBlocked
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const noAuthProviderEntries = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]);
function normalizeBlockedProviderSet(blockedProviders) {
    const entries = blockedProviders instanceof Set ? Array.from(blockedProviders) : blockedProviders;
    return new Set(Array.isArray(entries) ? entries.filter((provider)=>typeof provider === "string" && provider.length > 0) : []);
}
function isProviderBlockedByIdOrAlias(providerId, blockedProviders) {
    const blockedProviderSet = normalizeBlockedProviderSet(blockedProviders);
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(providerId);
    return blockedProviderSet.has(providerId) || typeof provider?.alias === "string" && blockedProviderSet.has(provider.alias);
}
function isNoAuthProviderKey(...keys) {
    return noAuthProviderEntries.some((provider)=>keys.some((key)=>key === provider.id || key === provider.alias));
}
function isNoAuthProviderBlocked(blockedProviders, ...keys) {
    const blockedProviderSet = normalizeBlockedProviderSet(blockedProviders);
    return noAuthProviderEntries.some((provider)=>keys.some((key)=>key === provider.id || key === provider.alias) && (blockedProviderSet.has(provider.id) || typeof provider.alias === "string" && blockedProviderSet.has(provider.alias)));
}
function partitionNoAuthEntriesByBlocked(entries, blockedProviders) {
    const blockedProviderSet = normalizeBlockedProviderSet(blockedProviders);
    const visible = [];
    const blocked = [];
    for (const entry of entries){
        const alias = typeof entry.provider.alias === "string" ? entry.provider.alias : null;
        const isBlocked = blockedProviderSet.has(entry.providerId) || alias !== null && blockedProviderSet.has(alias);
        (isBlocked ? blocked : visible).push(entry);
    }
    return {
        visible,
        blocked
    };
}
function isNoAuthRawProviderPrefix(providerId, prefix) {
    const provider = noAuthProviderEntries.find((entry)=>entry.id === providerId);
    return typeof provider?.alias === "string" && provider.alias !== providerId && prefix === providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/utils/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateId",
    ()=>generateId,
    "getErrorCode",
    ()=>getErrorCode,
    "getRelativeTime",
    ()=>getRelativeTime
]);
// Shared Utils - Export all
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-ssr] (ecmascript) <export default as v4>");
;
;
;
const generateId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"];
function getErrorCode(lastError) {
    if (!lastError) return null;
    const match = lastError.match(/\b([45]\d{2})\b/);
    return match ? match[1] : "ERR";
}
function getRelativeTime(isoDate) {
    if (!isoDate) return "";
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
}),
"[project]/src/shared/utils/providerConnectionStatus.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/app/(dashboard)/dashboard/providers/hooks/useSyncedModelsByProvider.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSyncedModelsByProvider",
    ()=>useSyncedModelsByProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useSyncedModelsByProvider() {
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        fetch("/api/synced-available-models").then((res)=>res.ok ? res.json() : null).then((data)=>{
            if (!cancelled && data && typeof data === "object") {
                setModels(data);
            }
        }).catch(()=>{});
        return ()=>{
            cancelled = true;
        };
    }, []);
    return models;
}
}),
"[project]/src/lib/providers/catalog.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "STATIC_PROVIDER_CATALOG_GROUPS",
    ()=>STATIC_PROVIDER_CATALOG_GROUPS,
    "STATIC_PROVIDER_CATALOG_RESOLUTION_ORDER",
    ()=>STATIC_PROVIDER_CATALOG_RESOLUTION_ORDER,
    "getStaticProviderCatalogGroup",
    ()=>getStaticProviderCatalogGroup,
    "isManagedProviderConnectionId",
    ()=>isManagedProviderConnectionId,
    "resolveCompatibleProviderCatalogEntry",
    ()=>resolveCompatibleProviderCatalogEntry,
    "resolveProviderCatalogEntry",
    ()=>resolveProviderCatalogEntry,
    "resolveStaticProviderCatalogEntry",
    ()=>resolveStaticProviderCatalogEntry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/audio.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/cloud-agent.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/local.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/oauth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/search.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/upstream-proxy.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const STATIC_PROVIDER_CATALOG_GROUPS = {
    "no-auth": {
        category: "no-auth",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"],
        displayAuthType: "no-auth",
        toggleAuthType: "no-auth"
    },
    oauth: {
        category: "oauth",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"],
        displayAuthType: "oauth",
        toggleAuthType: "oauth"
    },
    "web-cookie": {
        category: "web-cookie",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    local: {
        category: "local",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$local$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCAL_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    search: {
        category: "search",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$search$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    audio: {
        category: "audio",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$audio$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUDIO_ONLY_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    "upstream-proxy": {
        category: "upstream-proxy",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    apikey: {
        category: "apikey",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    },
    "cloud-agent": {
        category: "cloud-agent",
        providers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$cloud$2d$agent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLOUD_AGENT_PROVIDERS"],
        displayAuthType: "apikey",
        toggleAuthType: "apikey"
    }
};
const STATIC_PROVIDER_CATALOG_RESOLUTION_ORDER = [
    "no-auth",
    "oauth",
    "web-cookie",
    "local",
    "search",
    "audio",
    "upstream-proxy",
    "cloud-agent",
    "apikey"
];
const MANAGED_PROVIDER_CONNECTION_CATEGORIES = new Set([
    "apikey",
    "web-cookie",
    "local",
    "search",
    "audio",
    "cloud-agent"
]);
function getStaticProviderCatalogGroup(category) {
    return STATIC_PROVIDER_CATALOG_GROUPS[category];
}
function resolveStaticProviderCatalogEntry(providerId) {
    for (const category of STATIC_PROVIDER_CATALOG_RESOLUTION_ORDER){
        const group = STATIC_PROVIDER_CATALOG_GROUPS[category];
        const provider = group.providers[providerId];
        if (!provider) continue;
        return {
            ...provider,
            category,
            displayAuthType: group.displayAuthType,
            toggleAuthType: group.toggleAuthType,
            isCompatible: false
        };
    }
    return null;
}
/**
 * OAuth-primary providers that ALSO accept a direct BYOK API key (dual-auth),
 * admitted through the managed-connection API-key gate independent of the OAuth
 * catalog. These are deliberately kept OUT of `FREE_APIKEY_PROVIDER_IDS`: that
 * set flips `providerSupportsPat` true, which turns `isOAuth` false and would
 * make the dashboard's primary "Connect" button route to the API-key modal
 * instead of the OAuth flow. Admitting them here lets POST /api/providers
 * persist an `apikey` connection (the reliable BYOK path) while the provider
 * stays OAuth-primary (isOAuth=true). clinepass is the dual-auth case: sign in
 * with a Cline account OR paste a ClinePass API key.
 */ const DUAL_AUTH_APIKEY_PROVIDER_IDS = new Set([
    "clinepass"
]);
function isManagedProviderConnectionId(providerId) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsApiKeyOnFreeProvider"])(providerId)) return true;
    if (DUAL_AUTH_APIKEY_PROVIDER_IDS.has(providerId)) return true;
    const entry = resolveStaticProviderCatalogEntry(providerId);
    return !!(entry && MANAGED_PROVIDER_CONNECTION_CATEGORIES.has(entry.category));
}
function resolveCompatibleProviderCatalogEntry(providerNode, labels) {
    const isCcCompatible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerNode.id);
    const isAnthropicCompatible = providerNode.type === "anthropic-compatible" && !isCcCompatible;
    return {
        id: providerNode.id,
        name: providerNode.name || (isCcCompatible ? labels.ccCompatibleName : isAnthropicCompatible ? labels.anthropicCompatibleName : labels.openAiCompatibleName),
        color: isCcCompatible ? "#B45309" : isAnthropicCompatible ? "#D97757" : "#10A37F",
        textIcon: isCcCompatible ? "CC" : isAnthropicCompatible ? "AC" : "OC",
        apiType: providerNode.apiType || undefined,
        baseUrl: providerNode.baseUrl || undefined,
        iconUrl: providerNode.iconUrl || undefined,
        type: providerNode.type,
        category: "compatible",
        displayAuthType: "compatible",
        toggleAuthType: "apikey",
        isCompatible: true
    };
}
function resolveProviderCatalogEntry(providerId, options) {
    if (options?.providerNode && options.compatibleLabels) {
        return resolveCompatibleProviderCatalogEntry(options.providerNode, options.compatibleLabels);
    }
    return resolveStaticProviderCatalogEntry(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/config/audioRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Audio Provider Registry
 *
 * Defines providers that support audio endpoints:
 * - /v1/audio/transcriptions (Whisper API)
 * - /v1/audio/translations (Whisper translate-to-English API)
 * - /v1/audio/speech (TTS API)
 */ __turbopack_context__.s([
    "AUDIO_SPEECH_PROVIDERS",
    ()=>AUDIO_SPEECH_PROVIDERS,
    "AUDIO_TRANSCRIPTION_PROVIDERS",
    ()=>AUDIO_TRANSCRIPTION_PROVIDERS,
    "AUDIO_TRANSLATION_PROVIDERS",
    ()=>AUDIO_TRANSLATION_PROVIDERS,
    "buildDynamicAudioProvider",
    ()=>buildDynamicAudioProvider,
    "getAllAudioModels",
    ()=>getAllAudioModels,
    "getSpeechProvider",
    ()=>getSpeechProvider,
    "getTranscriptionProvider",
    ()=>getTranscriptionProvider,
    "getTranslationProvider",
    ()=>getTranslationProvider,
    "parseSpeechModel",
    ()=>parseSpeechModel,
    "parseTranscriptionModel",
    ()=>parseTranscriptionModel,
    "parseTranslationModel",
    ()=>parseTranslationModel
]);
const AUDIO_TRANSCRIPTION_PROVIDERS = {
    vertex: {
        id: "vertex",
        baseUrl: "https://us-central1-aiplatform.googleapis.com/v1",
        authType: "apikey",
        authHeader: "bearer",
        format: "vertex-gemini",
        models: [
            {
                id: "gemini-2.5-flash",
                name: "Gemini 2.5 Flash (Vertex Transcribe)"
            },
            {
                id: "gemini-2.5-pro",
                name: "Gemini 2.5 Pro (Vertex Transcribe)"
            },
            {
                id: "gemini-2.0-flash",
                name: "Gemini 2.0 Flash (Vertex Transcribe)"
            }
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "whisper-1",
                name: "Whisper 1"
            },
            {
                id: "gpt-4o-transcription",
                name: "GPT-4o Transcription"
            }
        ]
    },
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        format: "openrouter-stt",
        supportedFormats: [
            "wav",
            "mp3",
            "flac",
            "m4a",
            "ogg",
            "webm",
            "aac"
        ],
        models: [
            {
                id: "deepgram/nova-3",
                name: "Deepgram Nova-3"
            },
            {
                id: "microsoft/mai-transcribe-1.5",
                name: "Microsoft MAI-Transcribe 1.5"
            },
            {
                id: "nvidia/parakeet-tdt-0.6b-v3",
                name: "NVIDIA Parakeet TDT 0.6B v3"
            },
            {
                id: "mistralai/voxtral-mini-transcribe",
                name: "Mistral Voxtral Mini Transcribe"
            },
            {
                id: "qwen/qwen3-asr-flash-2026-02-10",
                name: "Qwen3 ASR Flash 2026-02-10"
            },
            {
                id: "google/chirp-3",
                name: "Google Chirp 3"
            },
            {
                id: "openai/gpt-4o-mini-transcribe",
                name: "OpenAI GPT-4o Mini Transcribe"
            },
            {
                id: "openai/whisper-large-v3",
                name: "OpenAI Whisper Large v3"
            },
            {
                id: "openai/whisper-large-v3-turbo",
                name: "OpenAI Whisper Large v3 Turbo"
            },
            {
                id: "openai/whisper-1",
                name: "OpenAI Whisper 1"
            },
            {
                id: "openai/gpt-4o-transcribe",
                name: "OpenAI GPT-4o Transcribe"
            }
        ]
    },
    cohere: {
        id: "cohere",
        baseUrl: "https://api.cohere.com/v2/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "cohere-transcribe-03-2026",
                name: "Cohere Transcribe 2026-03"
            }
        ]
    },
    groq: {
        id: "groq",
        baseUrl: "https://api.groq.com/openai/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "whisper-large-v3",
                name: "Whisper Large v3"
            },
            {
                id: "whisper-large-v3-turbo",
                name: "Whisper Large v3 Turbo"
            },
            {
                id: "distil-whisper-large-v3-en",
                name: "Distil Whisper Large v3 EN"
            }
        ]
    },
    deepgram: {
        id: "deepgram",
        baseUrl: "https://api.deepgram.com/v1/listen",
        authType: "apikey",
        authHeader: "token",
        format: "deepgram",
        models: [
            {
                id: "nova-3",
                name: "Nova 3"
            },
            {
                id: "nova-2",
                name: "Nova 2"
            },
            {
                id: "whisper-large",
                name: "Whisper Large"
            }
        ]
    },
    pollinations: {
        id: "pollinations",
        baseUrl: "https://gen.pollinations.ai/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "whisper",
                name: "Pollinations Whisper (Free)"
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "openai/whisper-large-v3",
                name: "Whisper Large v3"
            },
            {
                id: "openai/whisper-large-v3-turbo",
                name: "Whisper Large v3 Turbo"
            }
        ]
    },
    assemblyai: {
        id: "assemblyai",
        baseUrl: "https://api.assemblyai.com/v2/transcript",
        authType: "apikey",
        authHeader: "bearer",
        async: true,
        format: "assemblyai",
        models: [
            {
                id: "universal-3-pro",
                name: "Universal 3 Pro"
            },
            {
                id: "universal-2",
                name: "Universal 2"
            }
        ]
    },
    nvidia: {
        id: "nvidia",
        baseUrl: "https://integrate.api.nvidia.com/v1/audio/transcriptions",
        authType: "apikey",
        authHeader: "bearer",
        format: "nvidia-asr",
        models: [
            {
                id: "nvidia/parakeet-ctc-1.1b-asr",
                name: "Parakeet CTC 1.1B"
            },
            {
                id: "openai/whisper-large-v3",
                name: "Whisper Large v3 (NVIDIA)"
            }
        ]
    },
    huggingface: {
        id: "huggingface",
        baseUrl: "https://api-inference.huggingface.co/models",
        authType: "apikey",
        authHeader: "bearer",
        format: "huggingface-asr",
        models: [
            {
                id: "openai/whisper-large-v3-turbo",
                name: "Whisper Large v3 Turbo (HF)"
            },
            {
                id: "openai/whisper-large-v3",
                name: "Whisper Large v3 (HF)"
            }
        ]
    },
    qwen: {
        id: "qwen",
        baseUrl: "http://localhost:8000/v1/audio/transcriptions",
        authType: "none",
        authHeader: "none",
        format: "openai",
        models: [
            {
                id: "qwen3-asr",
                name: "Qwen3 ASR"
            }
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-audio",
        models: [
            {
                id: "elevenlabs/speech-to-text",
                name: "ElevenLabs STT"
            },
            {
                id: "elevenlabs/audio-isolation",
                name: "ElevenLabs Audio Isolation"
            }
        ]
    },
    gladia: {
        id: "gladia",
        // POST https://api.gladia.io/v2/pre-recorded — async workflow: upload → submit → poll
        // Auth: x-gladia-key: <API_KEY> (custom header, not a standard Bearer/Token scheme)
        // Free tier: 10 hours/month, no credit card required
        baseUrl: "https://api.gladia.io/v2/pre-recorded",
        authType: "apikey",
        authHeader: "x-gladia-key",
        async: true,
        format: "gladia",
        models: [
            {
                id: "solaria-1",
                name: "Solaria 1"
            },
            {
                id: "solaria-mini",
                name: "Solaria Mini"
            }
        ]
    },
    "rev-ai": {
        id: "rev-ai",
        baseUrl: "https://api.rev.ai/speechtotext/v1",
        authType: "apikey",
        authHeader: "bearer",
        async: true,
        format: "rev-ai",
        models: [
            {
                id: "machine",
                name: "Reverb ASR"
            },
            {
                id: "low_cost",
                name: "Low-Cost ASR"
            },
            {
                id: "fusion",
                name: "Fusion ASR"
            }
        ]
    },
    speechmatics: {
        id: "speechmatics",
        // POST https://asr.api.speechmatics.com/v2/jobs — async batch workflow:
        // submit multipart job (audio + JSON config) → poll → fetch transcript.
        // Auth: Authorization: Bearer <api-key>
        // Free tier: 8 hours/month, no credit card required.
        // Streaming (WebSocket real-time) mode is out of scope for v1 — batch only.
        baseUrl: "https://asr.api.speechmatics.com/v2/jobs",
        authType: "apikey",
        authHeader: "bearer",
        async: true,
        format: "speechmatics",
        models: [
            {
                id: "enhanced",
                name: "Enhanced"
            }
        ]
    }
};
const AUDIO_TRANSLATION_PROVIDERS = {
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/audio/translations",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "whisper-1",
                name: "Whisper 1"
            }
        ]
    },
    groq: {
        id: "groq",
        baseUrl: "https://api.groq.com/openai/v1/audio/translations",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "whisper-large-v3",
                name: "Whisper Large v3"
            }
        ]
    }
};
const AUDIO_SPEECH_PROVIDERS = {
    vertex: {
        id: "vertex",
        baseUrl: "https://us-central1-aiplatform.googleapis.com/v1",
        authType: "apikey",
        authHeader: "bearer",
        format: "vertex-gemini-tts",
        models: [
            {
                id: "gemini-3.1-flash-tts-preview",
                name: "Gemini 3.1 Flash TTS (Vertex)"
            },
            {
                id: "gemini-2.5-flash-preview-tts",
                name: "Gemini 2.5 Flash TTS (Vertex)"
            },
            {
                id: "gemini-2.5-pro-preview-tts",
                name: "Gemini 2.5 Pro TTS (Vertex)"
            }
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/audio/speech",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "tts-1-hd",
                name: "TTS 1 HD"
            },
            {
                id: "tts-1",
                name: "TTS 1"
            },
            {
                id: "gpt-4o-mini-tts",
                name: "GPT-4o Mini TTS"
            }
        ]
    },
    hyperbolic: {
        id: "hyperbolic",
        baseUrl: "https://api.hyperbolic.xyz/v1/audio/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "hyperbolic",
        models: [
            {
                id: "melo-tts",
                name: "Melo TTS"
            }
        ]
    },
    deepgram: {
        id: "deepgram",
        baseUrl: "https://api.deepgram.com/v1/speak",
        authType: "apikey",
        authHeader: "token",
        format: "deepgram",
        models: [
            {
                id: "aura-asteria-en",
                name: "Aura Asteria (EN)"
            },
            {
                id: "aura-luna-en",
                name: "Aura Luna (EN)"
            },
            {
                id: "aura-stella-en",
                name: "Aura Stella (EN)"
            }
        ]
    },
    nvidia: {
        id: "nvidia",
        baseUrl: "https://integrate.api.nvidia.com/v1/audio/speech",
        authType: "apikey",
        authHeader: "bearer",
        format: "nvidia-tts",
        models: [
            {
                id: "nvidia/fastpitch",
                name: "FastPitch"
            },
            {
                id: "nvidia/tacotron2",
                name: "Tacotron2"
            }
        ]
    },
    elevenlabs: {
        id: "elevenlabs",
        baseUrl: "https://api.elevenlabs.io/v1/text-to-speech",
        authType: "apikey",
        authHeader: "xi-api-key",
        format: "elevenlabs",
        models: [
            {
                id: "eleven_multilingual_v2",
                name: "Eleven Multilingual v2"
            },
            {
                id: "eleven_turbo_v2_5",
                name: "Eleven Turbo v2.5"
            }
        ]
    },
    huggingface: {
        id: "huggingface",
        baseUrl: "https://api-inference.huggingface.co/models",
        authType: "apikey",
        authHeader: "bearer",
        format: "huggingface-tts",
        models: [
            {
                id: "canopylabs/orpheus-3b-0.1-ft",
                name: "Orpheus 3B"
            },
            {
                id: "ResembleAI/chatterbox",
                name: "Chatterbox"
            },
            {
                id: "hexgrad/Kokoro-82M",
                name: "Kokoro TTS"
            }
        ]
    },
    coqui: {
        id: "coqui",
        baseUrl: "http://localhost:5002/api/tts",
        authType: "none",
        authHeader: "none",
        format: "coqui",
        models: [
            {
                id: "tts_models/en/ljspeech/tacotron2-DDC",
                name: "Tacotron2 DDC (LJSpeech)"
            }
        ]
    },
    tortoise: {
        id: "tortoise",
        baseUrl: "http://localhost:5000/api/tts",
        authType: "none",
        authHeader: "none",
        format: "tortoise",
        models: [
            {
                id: "tortoise-v2",
                name: "Tortoise v2"
            }
        ]
    },
    qwen: {
        id: "qwen",
        baseUrl: "http://localhost:8000/v1/audio/speech",
        authType: "none",
        authHeader: "none",
        format: "openai",
        models: [
            {
                id: "qwen3-tts",
                name: "Qwen3 TTS"
            }
        ]
    },
    // ── Cloud TTS Providers (#248) ────────────────────────────────────────────
    inworld: {
        id: "inworld",
        // POST https://api.inworld.ai/tts/v1/voice
        // Auth: Authorization: Basic <api-key>
        // Response: JSON { audioContent: "<base64>", contentType, sampleRateHertz }
        baseUrl: "https://api.inworld.ai/tts/v1/voice",
        authType: "apikey",
        authHeader: "basic",
        format: "inworld",
        supportedFormats: [
            "mp3",
            "wav",
            "opus",
            "pcm"
        ],
        models: [
            {
                id: "inworld-tts-2",
                name: "Inworld TTS 2"
            },
            {
                id: "inworld-tts-1.5-mini",
                name: "Inworld TTS 1.5 Mini"
            }
        ]
    },
    cartesia: {
        id: "cartesia",
        // POST https://api.cartesia.ai/tts/bytes
        // Auth: X-API-Key header, Cartesia-Version: 2024-06-10
        // Response: binary audio bytes
        baseUrl: "https://api.cartesia.ai/tts/bytes",
        authType: "apikey",
        authHeader: "x-api-key",
        format: "cartesia",
        models: [
            {
                id: "sonic-3",
                name: "Sonic 3"
            },
            {
                id: "sonic-2",
                name: "Sonic 2"
            }
        ]
    },
    fishaudio: {
        id: "fishaudio",
        // POST https://api.fish.audio/v1/tts
        // Auth: Authorization: Bearer <api-key>, model as an HTTP header
        // Response: binary audio bytes
        baseUrl: "https://api.fish.audio/v1/tts",
        authType: "apikey",
        authHeader: "bearer",
        format: "fishaudio",
        models: [
            {
                id: "s1",
                name: "Fish Speech S1"
            },
            {
                id: "speech-1.6",
                name: "Fish Speech 1.6"
            },
            {
                id: "speech-1.5",
                name: "Fish Speech 1.5"
            }
        ]
    },
    playht: {
        id: "playht",
        // POST https://api.play.ht/api/v2/tts/stream
        // Auth: X-USER-ID + Authorization: Bearer <api-key>
        // Response: audio stream (mp3/wav)
        baseUrl: "https://api.play.ht/api/v2/tts/stream",
        authType: "apikey",
        authHeader: "playht",
        format: "playht",
        models: [
            {
                id: "PlayDialog",
                name: "PlayDialog"
            },
            {
                id: "Play3.0-mini",
                name: "Play3.0 Mini"
            }
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-audio",
        models: [
            {
                id: "elevenlabs/text-to-speech-multilingual-v2",
                name: "ElevenLabs TTS v2"
            },
            {
                id: "elevenlabs/text-to-speech-turbo-2-5",
                name: "ElevenLabs TTS Turbo 2.5"
            },
            {
                id: "elevenlabs/text-to-dialogue-v3",
                name: "ElevenLabs Text to Dialogue v3"
            },
            {
                id: "elevenlabs/sound-effect-v2",
                name: "ElevenLabs Sound Effect v2"
            }
        ]
    },
    "aws-polly": {
        id: "aws-polly",
        // POST https://polly.{region}.amazonaws.com/v1/speech
        // Auth: AWS SigV4. The provider apiKey stores Secret Access Key; PSD stores accessKeyId/region.
        baseUrl: "https://polly.us-east-1.amazonaws.com",
        authType: "apikey",
        authHeader: "aws-sigv4",
        format: "aws-polly",
        models: [
            {
                id: "standard",
                name: "Polly Standard"
            },
            {
                id: "neural",
                name: "Polly Neural"
            },
            {
                id: "long-form",
                name: "Polly Long-Form"
            },
            {
                id: "generative",
                name: "Polly Generative"
            }
        ]
    },
    pollinations: {
        id: "pollinations",
        baseUrl: "https://gen.pollinations.ai/v1/audio/speech",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "default",
                name: "Pollinations TTS (Free)"
            }
        ]
    },
    minimax: {
        id: "minimax",
        baseUrl: "https://api.minimax.io/v1/t2a_v2",
        authType: "apikey",
        authHeader: "bearer",
        format: "minimax-tts",
        models: [
            {
                id: "speech-2.8-hd",
                name: "Speech 2.8 HD"
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/audio/speech",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "cartesia/sonic-2",
                name: "Cartesia Sonic 2"
            },
            {
                id: "hexgrad/Kokoro-82M",
                name: "Kokoro 82M"
            },
            {
                id: "canopylabs/orpheus-3b-0.1-ft",
                name: "Orpheus 3B"
            }
        ]
    },
    edgetts: {
        id: "edgetts",
        // Microsoft Edge "Read Aloud" — reverse-engineered, no API key required.
        // WebSocket transport (unlike every other entry here) — handled by
        // open-sse/executors/edgeTts.ts, dispatched via the "edgetts" format.
        baseUrl: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
        authType: "none",
        authHeader: "none",
        format: "edgetts",
        supportedFormats: [
            "mp3"
        ],
        models: [
            {
                id: "en-US-AriaNeural",
                name: "Aria (EN-US, Female)"
            },
            {
                id: "en-US-GuyNeural",
                name: "Guy (EN-US, Male)"
            },
            {
                id: "en-GB-SoniaNeural",
                name: "Sonia (EN-GB, Female)"
            },
            {
                id: "en-GB-RyanNeural",
                name: "Ryan (EN-GB, Male)"
            },
            {
                id: "es-ES-ElviraNeural",
                name: "Elvira (ES-ES, Female)"
            },
            {
                id: "pt-BR-FranciscaNeural",
                name: "Francisca (PT-BR, Female)"
            },
            {
                id: "pt-BR-AntonioNeural",
                name: "Antonio (PT-BR, Male)"
            },
            {
                id: "fr-FR-DeniseNeural",
                name: "Denise (FR-FR, Female)"
            },
            {
                id: "de-DE-KatjaNeural",
                name: "Katja (DE-DE, Female)"
            },
            {
                id: "ja-JP-NanamiNeural",
                name: "Nanami (JA-JP, Female)"
            },
            {
                id: "zh-CN-XiaoxiaoNeural",
                name: "Xiaoxiao (ZH-CN, Female)"
            }
        ]
    },
    gtts: {
        id: "gtts",
        // Google Translate TTS — reverse-engineered, no API key required.
        // POST batchexecute RPC (unlike the deprecated GET /translate_tts) —
        // handled by open-sse/executors/gtts.ts, dispatched via the "gtts" format.
        // No official SLA; per-IP rate-limited by Google without notice.
        baseUrl: "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute",
        authType: "none",
        authHeader: "none",
        format: "gtts",
        supportedFormats: [
            "mp3"
        ],
        models: [
            {
                id: "default",
                name: "Google Translate TTS (Free)"
            }
        ]
    },
    "xiaomi-mimo": {
        id: "xiaomi-mimo",
        baseUrl: "https://api.xiaomimimo.com/v1/chat/completions",
        authType: "apikey",
        authHeader: "bearer",
        format: "xiaomi-mimo-tts",
        supportedFormats: [
            "mp3",
            "wav"
        ],
        models: [
            {
                id: "mimo-v2.5-tts",
                name: "MiMo V2.5 TTS"
            },
            {
                id: "mimo-v2.5-tts-voicedesign",
                name: "MiMo V2.5 Voice Design"
            },
            {
                id: "mimo-v2.5-tts-voiceclone",
                name: "MiMo V2.5 Voice Clone"
            }
        ]
    }
};
function getTranscriptionProvider(providerId) {
    return AUDIO_TRANSCRIPTION_PROVIDERS[providerId] || null;
}
function getTranslationProvider(providerId) {
    return AUDIO_TRANSLATION_PROVIDERS[providerId] || null;
}
function getSpeechProvider(providerId) {
    return AUDIO_SPEECH_PROVIDERS[providerId] || null;
}
/** Hosts reachable only from the operator's machine/Docker network. */ function isLoopbackNodeHost(baseUrl) {
    try {
        const hostname = new URL(baseUrl).hostname;
        return hostname === "localhost" || hostname === "127.0.0.1" || /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);
    } catch  {
        return false;
    }
}
function buildDynamicAudioProvider(node, audioPath) {
    if (!node.prefix || !node.baseUrl) {
        throw new Error(`Invalid provider_node: missing prefix or baseUrl`);
    }
    const baseUrl = node.baseUrl.replace(/\/+$/, "");
    const isLocal = isLoopbackNodeHost(node.baseUrl);
    return {
        id: node.prefix,
        ...node.id ? {
            credentialProviderId: node.id
        } : {},
        baseUrl: `${baseUrl}${audioPath}`,
        authType: isLocal ? "none" : "apikey",
        authHeader: isLocal ? "none" : "bearer",
        models: []
    };
}
function parseAudioModel(modelStr, registry, dynamicProviders) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    // Phase 1: prefix match in hardcoded registry
    for (const [providerId] of Object.entries(registry)){
        if (modelStr.startsWith(providerId + "/")) {
            return {
                provider: providerId,
                model: modelStr.slice(providerId.length + 1)
            };
        }
    }
    // Phase 2: bare model lookup in hardcoded registry
    for (const [providerId, config] of Object.entries(registry)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    // Phase 3: prefix match in dynamic providers (provider_nodes)
    if (dynamicProviders) {
        for (const dp of dynamicProviders){
            if (modelStr.startsWith(dp.id + "/")) {
                return {
                    provider: dp.id,
                    model: modelStr.slice(dp.id.length + 1)
                };
            }
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
function parseTranscriptionModel(modelStr, dynamicProviders) {
    return parseAudioModel(modelStr, AUDIO_TRANSCRIPTION_PROVIDERS, dynamicProviders);
}
function parseSpeechModel(modelStr, dynamicProviders) {
    return parseAudioModel(modelStr, AUDIO_SPEECH_PROVIDERS, dynamicProviders);
}
function parseTranslationModel(modelStr, dynamicProviders) {
    return parseAudioModel(modelStr, AUDIO_TRANSLATION_PROVIDERS, dynamicProviders);
}
function getAllAudioModels() {
    const models = [];
    for (const [providerId, config] of Object.entries(AUDIO_TRANSCRIPTION_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: model.id.startsWith(`${providerId}/`) ? model.id : `${providerId}/${model.id}`,
                name: model.name,
                provider: providerId,
                subtype: "transcription"
            });
        }
    }
    for (const [providerId, config] of Object.entries(AUDIO_SPEECH_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: model.id.startsWith(`${providerId}/`) ? model.id : `${providerId}/${model.id}`,
                name: model.name,
                provider: providerId,
                subtype: "speech"
            });
        }
    }
    return models;
}
}),
"[project]/open-sse/config/registryUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAuthHeaders",
    ()=>buildAuthHeaders,
    "getAllModelsFromRegistry",
    ()=>getAllModelsFromRegistry,
    "parseModelFromRegistry",
    ()=>parseModelFromRegistry
]);
/**
 * Per-registry ``modelId → providerId`` index for the bare-model lookup below.
 * The media registries (image/video/audio/music) are static module-level objects, so the
 * index is built once per registry and reused. First-wins insertion preserves the original
 * Object.entries() iteration order (the same provider the linear scan would have returned).
 */ const registryModelIndexCache = new WeakMap();
function getRegistryModelIndex(registry) {
    let index = registryModelIndexCache.get(registry);
    if (!index) {
        index = new Map();
        for (const [providerId, config] of Object.entries(registry)){
            for (const model of config.models){
                if (!index.has(model.id)) index.set(model.id, providerId);
            }
        }
        registryModelIndexCache.set(registry, index);
    }
    return index;
}
function parseModelFromRegistry(modelStr, registry) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    // Try each provider prefix
    for (const [providerId, config] of Object.entries(registry)){
        if (modelStr.startsWith(providerId + "/")) {
            return {
                provider: providerId,
                model: modelStr.slice(providerId.length + 1)
            };
        }
        if (config.alias && modelStr.startsWith(config.alias + "/")) {
            return {
                provider: providerId,
                model: modelStr.slice(config.alias.length + 1)
            };
        }
    }
    // No provider prefix — find the model via the precomputed index (was an O(providers × models)
    // scan on every call).
    const providerId = getRegistryModelIndex(registry).get(modelStr);
    if (providerId) {
        return {
            provider: providerId,
            model: modelStr
        };
    }
    return {
        provider: null,
        model: modelStr
    };
}
function getAllModelsFromRegistry(registry, extra) {
    const models = [];
    for (const [providerId, config] of Object.entries(registry)){
        const extraFields = extra ? extra(providerId, config) : {};
        for (const model of config.models){
            const entries = [
                providerId,
                config.alias
            ].filter((prefix)=>typeof prefix === "string" && prefix.length > 0);
            for (const prefix of entries){
                models.push({
                    id: `${prefix}/${model.id}`,
                    name: model.name,
                    provider: providerId,
                    ...extraFields
                });
            }
        }
    }
    return models;
}
function buildAuthHeaders(provider, token) {
    if (provider.authType === "none" || provider.authHeader === "none" || !token) {
        return {};
    }
    switch(provider.authHeader){
        case "key":
            return {
                Authorization: `Key ${token}`
            };
        case "token":
            return {
                Authorization: `Token ${token}`
            };
        case "xi-api-key":
            return {
                "xi-api-key": token
            };
        case "x-api-key":
            return {
                "x-api-key": token
            };
        case "x-gladia-key":
            return {
                "x-gladia-key": token
            };
        case "bearer":
        default:
            return {
                Authorization: `Bearer ${token}`
            };
    }
}
}),
"[project]/open-sse/config/runway.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RUNWAYML_API_VERSION",
    ()=>RUNWAYML_API_VERSION,
    "RUNWAYML_DEFAULT_BASE_URL",
    ()=>RUNWAYML_DEFAULT_BASE_URL,
    "RUNWAYML_IMAGE_REQUIRED_MODELS",
    ()=>RUNWAYML_IMAGE_REQUIRED_MODELS,
    "RUNWAYML_SUPPORTED_VIDEO_MODELS",
    ()=>RUNWAYML_SUPPORTED_VIDEO_MODELS,
    "buildRunwayApiUrl",
    ()=>buildRunwayApiUrl,
    "buildRunwayHeaders",
    ()=>buildRunwayHeaders,
    "normalizeRunwayBaseUrl",
    ()=>normalizeRunwayBaseUrl
]);
const RUNWAYML_DEFAULT_BASE_URL = "https://api.dev.runwayml.com/v1";
const RUNWAYML_API_VERSION = "2024-11-06";
const RUNWAYML_SUPPORTED_VIDEO_MODELS = [
    {
        id: "gen4.5",
        name: "Gen-4.5"
    },
    {
        id: "gen4_turbo",
        name: "Gen-4 Turbo"
    },
    {
        id: "gen3a_turbo",
        name: "Gen-3 Alpha Turbo"
    },
    {
        id: "veo3.1",
        name: "Veo 3.1"
    },
    {
        id: "veo3.1_fast",
        name: "Veo 3.1 Fast"
    }
];
const RUNWAYML_IMAGE_REQUIRED_MODELS = new Set([
    "gen4_turbo"
]);
function normalizeRunwayBaseUrl(baseUrl) {
    const normalized = String(baseUrl || "").trim().replace(/\/$/, "");
    if (!normalized) return RUNWAYML_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/organization$/i, "").replace(/\/tasks\/[^/]+$/i, "").replace(/\/(?:image_to_video|text_to_video)$/i, "");
    return stripped.endsWith("/v1") ? stripped : `${stripped}/v1`;
}
function buildRunwayApiUrl(path, baseUrl) {
    const normalizedBaseUrl = normalizeRunwayBaseUrl(baseUrl);
    return `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
function buildRunwayHeaders(apiKey) {
    return {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": RUNWAYML_API_VERSION
    };
}
}),
"[project]/open-sse/config/providers/registry/segmind/videoModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Segmind video-generation starter model list (#6656).
 *
 * Same `POST /v1/{model}` REST shape as the image models (imageModels.ts) —
 * Segmind's video-capable models (Wan, Hunyuan, LTX, Kling) live under the
 * same host/auth. Slugs verified against
 * https://www.segmind.com/models/wan2.1-t2v/api and
 * https://www.segmind.com/models/wan2.7-i2v/api (2026-07-09); the remaining
 * Hunyuan/LTX/Kling slugs follow the same documented naming convention.
 */ __turbopack_context__.s([
    "SEGMIND_VIDEO_MODELS",
    ()=>SEGMIND_VIDEO_MODELS
]);
const SEGMIND_VIDEO_MODELS = [
    {
        id: "wan2.1-t2v",
        name: "Wan 2.1 Text-to-Video"
    },
    {
        id: "wan2.7-i2v",
        name: "Wan 2.7 Image-to-Video"
    },
    {
        id: "hunyuan-video-t2v",
        name: "Hunyuan Video Text-to-Video"
    },
    {
        id: "ltx-video-t2v",
        name: "LTX Video Text-to-Video"
    },
    {
        id: "kling-video-t2v",
        name: "Kling Video Text-to-Video"
    }
];
}),
"[project]/open-sse/config/videoRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VIDEO_PROVIDERS",
    ()=>VIDEO_PROVIDERS,
    "getAllVideoModels",
    ()=>getAllVideoModels,
    "getVideoProvider",
    ()=>getVideoProvider,
    "parseVideoModel",
    ()=>parseVideoModel
]);
/**
 * Video Generation Provider Registry
 *
 * Defines providers that support the /v1/videos/generations endpoint.
 * Supports local providers plus hosted task-based APIs such as Runway.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/registryUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/runway.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$videoModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/segmind/videoModels.ts [app-ssr] (ecmascript)");
;
;
;
const VIDEO_PROVIDERS = {
    "qwen-cloud-token-plan": {
        id: "qwen-cloud-token-plan",
        alias: "qct",
        baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/api/v1",
        statusUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/api/v1/tasks",
        authType: "apikey",
        authHeader: "bearer",
        format: "dashscope-video",
        models: [
            {
                id: "happyhorse-1.1-i2v",
                name: "HappyHorse 1.1 I2V"
            },
            {
                id: "happyhorse-1.1-t2v",
                name: "HappyHorse 1.1 T2V"
            },
            {
                id: "happyhorse-1.1-r2v",
                name: "HappyHorse 1.1 R2V"
            }
        ]
    },
    "bailian-coding-plan": {
        id: "bailian-coding-plan",
        alias: "bcp",
        baseUrl: "https://coding-intl.dashscope.aliyuncs.com/api/v1",
        statusUrl: "https://coding-intl.dashscope.aliyuncs.com/api/v1/tasks",
        authType: "apikey",
        authHeader: "bearer",
        format: "dashscope-video",
        models: [
            {
                id: "happyhorse-1.1-i2v",
                name: "HappyHorse 1.1 I2V"
            },
            {
                id: "happyhorse-1.1-t2v",
                name: "HappyHorse 1.1 T2V"
            },
            {
                id: "happyhorse-1.1-r2v",
                name: "HappyHorse 1.1 R2V"
            }
        ]
    },
    vertex: {
        id: "vertex",
        baseUrl: "https://us-central1-aiplatform.googleapis.com/v1",
        authType: "apikey",
        authHeader: "bearer",
        format: "vertex-veo",
        models: [
            {
                id: "veo-3.0-generate-001",
                name: "Veo 3.0 (Vertex)"
            },
            {
                id: "veo-3.0-fast-generate-001",
                name: "Veo 3.0 Fast (Vertex)"
            },
            {
                id: "veo-2.0-generate-001",
                name: "Veo 2.0 (Vertex)"
            }
        ]
    },
    googleflow: {
        id: "googleflow",
        alias: "flow",
        // ⚠️ Wire host isolated for live HAR validation (Rule #18). The handler reuses
        // the Google account OAuth credential (accessToken + Cloud Code projectId) that
        // the Antigravity provider already establishes; no separate OAuth flow is added.
        baseUrl: "https://aisandbox-pa.googleapis.com",
        authType: "oauth",
        authHeader: "bearer",
        format: "google-flow",
        models: [
            {
                id: "veo-3.1-generate",
                name: "Veo 3.1 (Google Flow)"
            },
            {
                id: "veo-3.1-fast-generate",
                name: "Veo 3.1 Fast (Google Flow)"
            },
            {
                id: "veo-3.0-generate",
                name: "Veo 3.0 (Google Flow)"
            }
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-video",
        models: [
            {
                id: "veo/veo-3-1",
                name: "Veo 3.1",
                isMarket: true
            },
            {
                id: "veo/veo-3-1-fast",
                name: "Veo 3.1 Fast",
                isMarket: true
            },
            {
                id: "kling-3.0/video",
                name: "Kling 3.0",
                isMarket: true
            },
            {
                id: "bytedance/seedance-2",
                name: "Seedance v2.0",
                isMarket: true
            },
            {
                id: "wan/2-7-text-to-video",
                name: "Wan 2.7 T2V",
                isMarket: true
            },
            {
                id: "wan/2-7-image-to-video",
                name: "Wan 2.7 I2V",
                isMarket: true
            },
            {
                id: "hailuo/02-text-to-video-pro",
                name: "Hailuo Pro T2V",
                isMarket: true
            },
            {
                id: "hailuo/2-3-image-to-video-pro",
                name: "Hailuo 2.3 Pro I2V",
                isMarket: true
            },
            {
                id: "grok-imagine/text-to-video",
                name: "Grok Imagine T2V",
                isMarket: true
            },
            {
                id: "grok-imagine/image-to-video",
                name: "Grok Imagine I2V",
                isMarket: true
            },
            {
                id: "happyhorse/text-to-video",
                name: "HappyHorse T2V",
                isMarket: true
            },
            {
                id: "happyhorse/image-to-video",
                name: "HappyHorse I2V",
                isMarket: true
            },
            {
                id: "sora-2-text-to-video",
                name: "Sora 2 T2V",
                isMarket: true
            },
            {
                id: "sora-2-image-to-video",
                name: "Sora 2 I2V",
                isMarket: true
            },
            {
                id: "sora-2-pro-text-to-video",
                name: "Sora 2 Pro T2V",
                isMarket: true
            },
            {
                id: "sora-2-pro-image-to-video",
                name: "Sora 2 Pro I2V",
                isMarket: true
            }
        ]
    },
    haiper: {
        id: "haiper",
        baseUrl: "https://api.haiper.ai/v1/jobs/gen2/text2video",
        statusUrl: "https://api.haiper.ai/v1/jobs",
        authType: "apikey",
        authHeader: "HAIPER_KEY",
        format: "haiper-video",
        models: [
            {
                id: "gen2",
                name: "Gen 2"
            }
        ]
    },
    leonardo: {
        id: "leonardo",
        baseUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
        statusUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "leonardo-video",
        models: [
            {
                id: "phoenix",
                name: "Phoenix Video"
            }
        ]
    },
    pollinations: {
        id: "pollinations",
        baseUrl: "https://gen.pollinations.ai/video",
        authType: "apikey",
        authHeader: "bearer",
        format: "pollinations-video",
        models: [
            {
                id: "default",
                name: "Pollinations Video (Free)"
            }
        ]
    },
    minimax: {
        id: "minimax",
        baseUrl: "https://api.minimax.io/v1/video_generation",
        statusUrl: "https://api.minimax.io/v1/query/video_generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "minimax-video",
        models: [
            {
                id: "MiniMax-Hailuo-2.3",
                name: "Hailuo 2.3"
            },
            {
                id: "MiniMax-Hailuo-02",
                name: "Hailuo 02"
            },
            {
                id: "T2V-01-Director",
                name: "T2V 01 Director"
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/videos",
        statusUrl: "https://api.together.xyz/videos",
        authType: "apikey",
        authHeader: "bearer",
        format: "together-video",
        models: [
            {
                id: "wan-ai/wan2.1-t2v-480p",
                name: "Wan 2.1 T2V 480p"
            },
            {
                id: "wan-ai/wan2.7-t2v",
                name: "Wan 2.7 T2V"
            }
        ]
    },
    replicate: {
        id: "replicate",
        baseUrl: "https://api.replicate.com/v1/predictions",
        statusUrl: "https://api.replicate.com/v1/predictions",
        authType: "apikey",
        authHeader: "bearer",
        format: "replicate-video",
        models: [
            {
                id: "minimax/video-01",
                name: "MiniMax Video 01"
            },
            {
                id: "wan-ai/wan2.1-t2v-480p",
                name: "Wan 2.1 T2V"
            },
            {
                id: "tencent/hunyuan-video",
                name: "Hunyuan Video"
            }
        ]
    },
    comfyui: {
        id: "comfyui",
        baseUrl: "http://localhost:8188",
        authType: "none",
        authHeader: "none",
        format: "comfyui",
        models: [
            {
                id: "animatediff",
                name: "AnimateDiff"
            },
            {
                id: "svd-xt",
                name: "Stable Video Diffusion XT"
            }
        ]
    },
    sdwebui: {
        id: "sdwebui",
        baseUrl: "http://localhost:7860",
        authType: "none",
        authHeader: "none",
        format: "sdwebui-video",
        models: [
            {
                id: "animatediff-webui",
                name: "AnimateDiff (WebUI)"
            }
        ]
    },
    "veoaifree-web": {
        id: "veoaifree-web",
        alias: "veo-free",
        baseUrl: "https://veoaifree.com/wp-admin/admin-ajax.php",
        authType: "none",
        authHeader: "none",
        format: "veoaifree-web",
        models: [
            {
                id: "veo",
                name: "VEO 3.1"
            },
            {
                id: "seedance",
                name: "Seedance"
            }
        ]
    },
    runwayml: {
        id: "runwayml",
        baseUrl: "https://api.dev.runwayml.com/v1",
        authType: "bearer",
        authHeader: "Authorization",
        format: "runwayml",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RUNWAYML_SUPPORTED_VIDEO_MODELS"]
    },
    deepinfra: {
        id: "deepinfra",
        // Native DeepInfra inference endpoint — same host/auth already proven for reranking
        // (open-sse/config/rerankRegistry.ts). Reuses the stored deepinfra provider Bearer
        // apiKey (already registered for chat) — no separate credential flow.
        baseUrl: "https://api.deepinfra.com/v1/inference",
        authType: "apikey",
        authHeader: "bearer",
        format: "deepinfra-video",
        models: [
            {
                id: "Wan-AI/Wan2.2-T2V-A14B",
                name: "Wan 2.2 T2V A14B"
            },
            {
                id: "Wan-AI/Wan2.2-TI2V-5B",
                name: "Wan 2.2 TI2V 5B"
            },
            {
                id: "Wan-AI/Wan2.7-T2V",
                name: "Wan 2.7 T2V"
            },
            {
                id: "Lightricks/LTX-2.3-Distilled",
                name: "LTX 2.3 Distilled"
            }
        ]
    },
    alibaba: {
        id: "alibaba",
        alias: "ali",
        // DashScope (Alibaba Cloud Model Studio) async video-synthesis API. Reuses
        // the stored alibaba provider Bearer apiKey — no separate credential flow.
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1",
        statusUrl: "https://dashscope-intl.aliyuncs.com/api/v1/tasks",
        authType: "apikey",
        authHeader: "bearer",
        format: "dashscope-video",
        models: [
            {
                id: "happyhorse-1.1-i2v",
                name: "HappyHorse 1.1 I2V"
            },
            {
                id: "happyhorse-1.1-t2v",
                name: "HappyHorse 1.1 T2V"
            },
            {
                id: "happyhorse-1.1-r2v",
                name: "HappyHorse 1.1 R2V"
            },
            {
                id: "happyhorse-1.0-video-edit",
                name: "HappyHorse 1.0 Video Edit"
            },
            {
                id: "wan2.7-i2v-2026-04-25",
                name: "Wan 2.7 I2V (2026-04-25)"
            },
            {
                id: "wan2.6-i2v-flash",
                name: "Wan 2.6 I2V Flash"
            },
            {
                id: "wan2.7-t2v-2026-06-12",
                name: "Wan 2.7 T2V (2026-06-12)"
            },
            {
                id: "wan2.7-r2v-2026-06-12",
                name: "Wan 2.7 R2V (2026-06-12)"
            },
            {
                id: "wan2.7-videoedit",
                name: "Wan 2.7 Video Edit"
            }
        ]
    },
    "qwen-cloud": {
        id: "qwen-cloud",
        alias: "qwc",
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1",
        statusUrl: "https://dashscope-intl.aliyuncs.com/api/v1/tasks",
        authType: "apikey",
        authHeader: "bearer",
        format: "dashscope-video",
        models: [
            {
                id: "happyhorse-1.1-i2v",
                name: "HappyHorse 1.1 I2V"
            },
            {
                id: "happyhorse-1.1-t2v",
                name: "HappyHorse 1.1 T2V"
            },
            {
                id: "happyhorse-1.1-r2v",
                name: "HappyHorse 1.1 R2V"
            },
            {
                id: "happyhorse-1.0-video-edit",
                name: "HappyHorse 1.0 Video Edit"
            },
            {
                id: "wan2.7-t2v",
                name: "Wan 2.7 T2V"
            },
            {
                id: "wan2.7-i2v",
                name: "Wan 2.7 I2V"
            },
            {
                id: "wan2.7-r2v-2026-06-12",
                name: "Wan 2.7 R2V (2026-06-12)"
            },
            {
                id: "wan2.7-videoedit",
                name: "Wan 2.7 Video Edit"
            }
        ]
    },
    // Segmind video generation (#6656). Same `POST /v1/{model}` REST shape as
    // the image registry entry (imageRegistry.ts) — x-api-key auth, raw video
    // bytes response — routed through the dedicated "segmind" format handler.
    segmind: {
        id: "segmind",
        baseUrl: "https://api.segmind.com/v1",
        authType: "apikey",
        authHeader: "x-api-key",
        format: "segmind",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$videoModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEGMIND_VIDEO_MODELS"]
    },
    novita: {
        id: "novita",
        // Novita's async video APIs are per-model: the model id IS the submit path
        // segment (`/v3/async/<model>`), all sharing one task-result poll endpoint.
        // Reuses the stored novita provider Bearer apiKey — no separate credential flow.
        baseUrl: "https://api.novita.ai/v3/async",
        statusUrl: "https://api.novita.ai/v3/async/task-result",
        authType: "apikey",
        authHeader: "bearer",
        format: "novita-video",
        models: [
            {
                id: "wan-t2v",
                name: "Wan 2.1 Text-to-Video"
            },
            {
                id: "kling-v1.6-t2v",
                name: "Kling V1.6 Text-to-Video"
            }
        ]
    },
    xai: {
        id: "xai",
        // xAI Grok Imagine async video-generation API. Reuses the stored xai
        // provider Bearer apiKey (same credential the image-generation "xai"
        // entry in imageRegistry.ts already uses) — no separate credential flow.
        baseUrl: "https://api.x.ai/v1/videos",
        statusUrl: "https://api.x.ai/v1/videos",
        authType: "apikey",
        authHeader: "bearer",
        format: "xai-video",
        models: [
            {
                id: "grok-imagine-video",
                name: "Grok Imagine Video"
            }
        ]
    },
    // Adobe Firefly (unofficial) — same IMS/cookie credential as the image entry.
    // Async 3P video generate + poll (Sora 2, Veo 3.1, Kling …). Fallback list
    // from models/discovery capture (adobe/get_models.txt).
    "adobe-firefly": {
        id: "adobe-firefly",
        alias: "firefly",
        baseUrl: "https://firefly-3p.ff.adobe.io/v2/3p-videos/generate-async",
        authType: "apikey",
        authHeader: "bearer",
        format: "adobe-firefly-video",
        models: [
            {
                id: "sora-2",
                name: "Firefly Sora 2"
            },
            {
                id: "sora-2-pro",
                name: "Firefly Sora 2 Pro"
            },
            {
                id: "veo-3.1",
                name: "Firefly Veo 3.1"
            },
            {
                id: "veo-3.1-fast",
                name: "Firefly Veo 3.1 Fast"
            },
            {
                id: "veo-3.1-ref",
                name: "Firefly Veo 3.1 Reference"
            },
            {
                id: "kling-3",
                name: "Firefly Kling v3 Standard I2V"
            },
            {
                id: "kling-v3-t2v",
                name: "Firefly Kling v3 Standard T2V"
            },
            {
                id: "kling-v3-pro-i2v",
                name: "Firefly Kling v3 Pro I2V"
            },
            {
                id: "luma-ray3",
                name: "Firefly Ray3"
            },
            {
                id: "runway-gen4-turbo",
                name: "Firefly Runway Gen-4 Video"
            }
        ]
    }
};
function getVideoProvider(providerId) {
    return VIDEO_PROVIDERS[providerId] || null;
}
function parseVideoModel(modelStr) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseModelFromRegistry"])(modelStr, VIDEO_PROVIDERS);
}
function getAllVideoModels() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllModelsFromRegistry"])(VIDEO_PROVIDERS);
}
}),
"[project]/open-sse/config/musicRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MUSIC_PROVIDERS",
    ()=>MUSIC_PROVIDERS,
    "getAllMusicModels",
    ()=>getAllMusicModels,
    "getMusicProvider",
    ()=>getMusicProvider,
    "parseMusicModel",
    ()=>parseMusicModel
]);
/**
 * Music Generation Provider Registry
 *
 * Defines providers that support the /v1/music/generations endpoint.
 * Currently supports local providers (ComfyUI with audio models).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/registryUtils.ts [app-ssr] (ecmascript)");
;
const MUSIC_PROVIDERS = {
    vertex: {
        id: "vertex",
        baseUrl: "https://us-central1-aiplatform.googleapis.com/v1",
        authType: "apikey",
        authHeader: "bearer",
        format: "vertex-lyria",
        models: [
            {
                id: "lyria-002",
                name: "Lyria 2 (Vertex)"
            }
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-music",
        models: [
            {
                id: "suno-v4.0",
                name: "Suno V4.0"
            },
            {
                id: "suno-v3.5",
                name: "Suno V3.5"
            }
        ]
    },
    suno: {
        id: "suno",
        baseUrl: "https://studio-api.suno.ai/api/generate/v2/",
        statusUrl: "https://studio-api.suno.ai/api/feed/",
        authType: "cookie",
        authHeader: "cookie",
        format: "suno-music",
        models: [
            {
                id: "chirp-v3-5",
                name: "Chirp V3.5"
            },
            {
                id: "chirp-v4",
                name: "Chirp V4"
            }
        ]
    },
    udio: {
        id: "udio",
        baseUrl: "https://www.udio.com/api/generate-proxy",
        statusUrl: "https://www.udio.com/api/songs",
        authType: "cookie",
        authHeader: "cookie",
        format: "udio-music",
        models: [
            {
                id: "udio-default",
                name: "Udio Default"
            }
        ]
    },
    minimax: {
        id: "minimax",
        baseUrl: "https://api.minimax.io/v1/music_generation",
        statusUrl: "https://api.minimax.io/v1/query/music_generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "minimax-music",
        models: [
            {
                id: "music-2.6",
                name: "Music 2.6"
            },
            {
                id: "music-2.6-free",
                name: "Music 2.6 Free"
            },
            {
                id: "music-cover",
                name: "Music Cover"
            }
        ]
    },
    comfyui: {
        id: "comfyui",
        baseUrl: "http://localhost:8188",
        authType: "none",
        authHeader: "none",
        format: "comfyui",
        models: [
            {
                id: "stable-audio-open",
                name: "Stable Audio Open"
            },
            {
                id: "musicgen-medium",
                name: "MusicGen Medium"
            }
        ]
    }
};
function getMusicProvider(providerId) {
    return MUSIC_PROVIDERS[providerId] || null;
}
function parseMusicModel(modelStr) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseModelFromRegistry"])(modelStr, MUSIC_PROVIDERS);
}
function getAllMusicModels() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$registryUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllModelsFromRegistry"])(MUSIC_PROVIDERS);
}
}),
"[project]/open-sse/config/providers/registry/segmind/imageModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Segmind image-generation provider entry (#6656).
 *
 * Segmind exposes 200+ hosted models via a single `POST /v1/{model}` REST
 * shape (https://docs.segmind.com/, confirmed live 2026-07-09): x-api-key
 * auth, JSON request body, raw image bytes response (no JSON envelope).
 * Kept as a full config object (not just the model list) so imageRegistry.ts
 * only needs a single-line reference — that file sits right at its size cap.
 *
 * Model slugs below are a curated starter subset. flux-schnell and
 * sdxl1.0-txt2img are verified against
 * https://www.segmind.com/models/<slug>/api; the remaining Flux/SD3/Kandinsky
 * slugs follow the same documented naming convention.
 */ __turbopack_context__.s([
    "SEGMIND_IMAGE_MODELS",
    ()=>SEGMIND_IMAGE_MODELS,
    "SEGMIND_IMAGE_PROVIDER",
    ()=>SEGMIND_IMAGE_PROVIDER
]);
const SEGMIND_IMAGE_MODELS = [
    {
        id: "flux-schnell",
        name: "FLUX.1 Schnell"
    },
    {
        id: "flux-dev",
        name: "FLUX.1 Dev"
    },
    {
        id: "flux-1.1-pro",
        name: "FLUX 1.1 Pro"
    },
    {
        id: "sdxl1.0-txt2img",
        name: "Stable Diffusion XL 1.0"
    },
    {
        id: "sd3.5-large-txt2img",
        name: "Stable Diffusion 3.5 Large"
    },
    {
        id: "kandinsky2.2-txt2img",
        name: "Kandinsky 2.2"
    }
];
const SEGMIND_IMAGE_PROVIDER = {
    id: "segmind",
    baseUrl: "https://api.segmind.com/v1",
    authType: "apikey",
    authHeader: "x-api-key",
    format: "segmind",
    models: SEGMIND_IMAGE_MODELS,
    supportedSizes: [
        "512x512",
        "1024x1024",
        "1024x1792",
        "1792x1024"
    ]
};
}),
"[project]/open-sse/config/providers/registry/kie/imageModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * KIE image-generation model catalog.
 *
 * Extracted out of imageRegistry.ts (which hit the 800-line file-size cap) so the
 * catalog lives in its own semantic family module, following the same pattern as
 * `providers/registry/lmarena/directModels.ts`. KIE aggregates many third-party
 * image models (Seedream, Z-Image, Imagen, Flux, Grok Imagine, GPT Image, Ideogram,
 * Qwen, Wan) behind a single `kie-image` format/handler — see `imageRegistry.ts`'s
 * `kie` entry for baseUrl/auth/format wiring.
 */ __turbopack_context__.s([
    "KIE_IMAGE_MODELS",
    ()=>KIE_IMAGE_MODELS
]);
const KIE_IMAGE_MODELS = [
    {
        id: "gpt4o-image",
        name: "KIE 4o Image"
    },
    {
        id: "seedream/4.5-text-to-image",
        name: "Seedream 4.5",
        isMarket: true
    },
    {
        id: "seedream/4.5-edit",
        name: "Seedream 4.5 Edit",
        isMarket: true
    },
    {
        id: "seedream/5.0-lite-text-to-image",
        name: "Seedream 5.0 Lite",
        isMarket: true
    },
    {
        id: "seedream/5.0-lite-image-to-image",
        name: "Seedream 5.0 Lite I2I",
        isMarket: true
    },
    {
        id: "z-image/4.0-text-to-image",
        name: "Z-Image v4.0",
        isMarket: true
    },
    {
        id: "z-image/4.5-text-to-image",
        name: "Z-Image v4.5",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4-fast",
        name: "Imagen 4 Fast",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4-ultra",
        name: "Imagen 4 Ultra",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4",
        name: "Imagen 4",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-2",
        name: "Nano Banana 2",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana",
        name: "Nano Banana",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-pro",
        name: "Nano Banana Pro",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-edit",
        name: "Nano Banana Edit",
        isMarket: true
    },
    {
        id: "flux/2-pro-image-to-image",
        name: "Flux 2 Pro I2I",
        isMarket: true
    },
    {
        id: "flux/2-pro-text-to-image",
        name: "Flux 2 Pro T2I",
        isMarket: true
    },
    {
        id: "flux/2-image-to-image",
        name: "Flux 2 I2I",
        isMarket: true
    },
    {
        id: "flux/2-text-to-image",
        name: "Flux 2 T2I",
        isMarket: true
    },
    {
        id: "flux/kontext",
        name: "Flux Kontext",
        isMarket: true
    },
    {
        id: "grok-imagine/text-to-image",
        name: "Grok Imagine T2I",
        isMarket: true
    },
    {
        id: "grok-imagine/image-to-image",
        name: "Grok Imagine I2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-1.5-text-to-image",
        name: "GPT Image 1.5 T2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-1.5-image-to-image",
        name: "GPT Image 1.5 I2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-2-text-to-image",
        name: "GPT Image 2 T2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-2-image-to-image",
        name: "GPT Image 2 I2I",
        isMarket: true
    },
    {
        id: "ideogram/v3-text-to-image",
        name: "Ideogram v3",
        isMarket: true
    },
    {
        id: "ideogram/v3-edit",
        name: "Ideogram v3 Edit",
        isMarket: true
    },
    {
        id: "ideogram/v3-remix",
        name: "Ideogram v3 Remix",
        isMarket: true
    },
    {
        id: "ideogram/v3-reframe",
        name: "Ideogram v3 Reframe",
        isMarket: true
    },
    {
        id: "qwen/text-to-image",
        name: "Qwen T2I",
        isMarket: true
    },
    {
        id: "qwen/image-to-image",
        name: "Qwen I2I",
        isMarket: true
    },
    {
        id: "qwen/image-edit",
        name: "Qwen Edit",
        isMarket: true
    },
    {
        id: "qwen2/image-edit",
        name: "Qwen2 Edit",
        isMarket: true
    },
    {
        id: "qwen2/text-to-image",
        name: "Qwen2 T2I",
        isMarket: true
    },
    {
        id: "wan/2.7-image",
        name: "Wan 2.7 Image",
        isMarket: true
    },
    {
        id: "wan/2.7-image-pro",
        name: "Wan 2.7 Image Pro",
        isMarket: true
    }
];
}),
"[project]/open-sse/config/providers/registry/freepik/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Freepik (Magnific Mystic) image provider registry entry.
 * Extracted into its own module to keep open-sse/config/imageRegistry.ts
 * under the file-size cap (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "FREEPIK_IMAGE_PROVIDER",
    ()=>FREEPIK_IMAGE_PROVIDER
]);
const FREEPIK_IMAGE_PROVIDER = {
    id: "freepik",
    // Freepik rebranded its API docs to Magnific in April 2026; the Mystic
    // endpoint itself still lives under api.freepik.com as of this writing
    // (docs.freepik.com redirects to docs.magnific.com, but the API host
    // has not moved). Re-verify against live docs if this ever 404s.
    baseUrl: "https://api.freepik.com/v1/ai/mystic",
    statusUrl: "https://api.freepik.com/v1/ai/mystic",
    authType: "apikey",
    authHeader: "x-freepik-api-key",
    format: "freepik-image",
    models: [
        {
            id: "realism",
            name: "Mystic Realism"
        },
        {
            id: "fluid",
            name: "Mystic Fluid (Imagen 3)"
        },
        {
            id: "zen",
            name: "Mystic Zen"
        },
        {
            id: "flexible",
            name: "Mystic Flexible"
        },
        {
            id: "super_real",
            name: "Mystic Super Real"
        },
        {
            id: "editorial_portraits",
            name: "Mystic Editorial Portraits"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "1024x1792",
        "1792x1024"
    ]
};
}),
"[project]/open-sse/config/providers/registry/stability-ai/imageModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Stability AI image-generation model catalog.
 *
 * Extracted out of imageRegistry.ts (which sits right at the 800-line file-size
 * cap) so the catalog lives in its own semantic family module, following the same
 * pattern as `providers/registry/kie/imageModels.ts` and
 * `providers/registry/segmind/imageModels.ts`. See `imageRegistry.ts`'s
 * `stability-ai` entry for baseUrl/auth/format wiring.
 *
 * `imageRequired: true` marks the dedicated edit/control/upscale endpoints
 * (STABILITY_EDIT_ENDPOINTS in open-sse/handlers/imageGeneration.ts) that accept a
 * text prompt but mechanically require an input image regardless —
 * modalitiesRequireImageInput() alone can't tell them apart from flexible
 * dual-modality generation models (BFL Kontext, Together, NVIDIA, LMArena,
 * NanoGPT), which correctly allow pure text-to-image.
 */ __turbopack_context__.s([
    "STABILITY_AI_IMAGE_MODELS",
    ()=>STABILITY_AI_IMAGE_MODELS
]);
const STABILITY_AI_IMAGE_MODELS = [
    {
        id: "stable-image-ultra",
        name: "Stable Image Ultra"
    },
    {
        id: "stable-image-core",
        name: "Stable Image Core"
    },
    {
        id: "sd3.5-large-turbo",
        name: "sd3.5-large-turbo"
    },
    {
        id: "sd3.5-large",
        name: "sd3.5-large"
    },
    {
        id: "sd3.5-medium",
        name: "sd3.5-medium"
    },
    {
        id: "sd3.5-flash",
        name: "sd3.5-flash"
    },
    {
        id: "erase",
        name: "Erase",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "inpaint",
        name: "Inpaint",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "outpaint",
        name: "Outpaint",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "remove-background",
        name: "Remove Background",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "search-and-replace",
        name: "Search and Replace",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "search-and-recolor",
        name: "Search and Recolor",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "replace-background-and-relight",
        name: "Replace Background and Relight",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "creative",
        name: "Creative Upscale",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "fast",
        name: "Fast Upscale",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "conservative",
        name: "Conservative Upscale",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "sketch",
        name: "Sketch Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "structure",
        name: "Structure Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "style",
        name: "Style Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "style-transfer",
        name: "Style Transfer",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    }
];
}),
"[project]/open-sse/config/providers/registry/gemini/imageModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google AI Studio (Gemini API) Imagen family image-generation provider entry.
 *
 * Uses the dedicated `:predict` endpoint (handled by format "google-imagen"), NOT
 * generateContent — so only imagen-* models belong here; gemini flash-image /
 * nano-banana route through /v1/chat/completions instead. The models are also
 * surfaced live via ListModels; this seed makes them addressable on
 * /v1/images/generations. Note: Imagen requires a billing-enabled Google project —
 * free-tier keys get 403 / quota 0. The handler builds `{baseUrl}/{model}:predict`.
 *
 * Extracted out of imageRegistry.ts (which sits right at the 800-line file-size
 * cap) so the catalog lives in its own semantic family module, following the same
 * pattern as `providers/registry/stability-ai/imageModels.ts` and
 * `providers/registry/segmind/imageModels.ts`. Co-located with the existing
 * `gemini/index.ts` chat-provider entry — same provider id, different
 * modality/consumer (chat registry vs image registry), mirroring the
 * `kie/index.ts` + `kie/imageModels.ts` split.
 */ __turbopack_context__.s([
    "GEMINI_IMAGEN_PROVIDER",
    ()=>GEMINI_IMAGEN_PROVIDER
]);
const GEMINI_IMAGEN_PROVIDER = {
    id: "gemini",
    alias: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    authType: "apikey",
    authHeader: "x-goog-api-key",
    format: "google-imagen",
    models: [
        {
            id: "imagen-4.0-generate-001",
            name: "Imagen 4"
        },
        {
            id: "imagen-4.0-ultra-generate-001",
            name: "Imagen 4 Ultra"
        },
        {
            id: "imagen-4.0-fast-generate-001",
            name: "Imagen 4 Fast"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "1792x1024",
        "1024x1792"
    ]
};
}),
"[project]/open-sse/config/providers/registry/cheaperinference/imageModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cheaper Inference image provider registry entry.
 * Extracted into its own module to keep open-sse/config/imageRegistry.ts
 * under the file-size cap (god-file decomposition; semantic split) — same
 * pattern as FREEPIK_IMAGE_PROVIDER / SEGMIND_IMAGE_PROVIDER.
 *
 * 3 image models measured from GET /v1/models?type=image on 2026-07-31.
 *
 * COLLISION NOTE: nano-banana-pro and nano-banana-2 are ALSO adobe-firefly model
 * ids. parseImageModel() resolves a bare id by first-match over IMAGE_PROVIDERS
 * iteration order, so this entry is spread into that object AFTER adobe-firefly:
 * bare `nano-banana-2` keeps routing to Firefly (pre-existing behaviour) and these
 * models are reachable only as `cheaperinference/<id>` / `cinf/<id>`. Do NOT add
 * IMAGE_MODEL_ALIASES entries for them — that would silently re-route Firefly
 * users. Guarded by tests/unit/cheaperinference-image-models.test.ts.
 *
 * The endpoint ignores `response_format:"url"` and always returns `b64_json`
 * (measured twice). The OpenAI image path already handles b64_json; this is not a
 * bug to "fix". /v1/images/edits returns 404 upstream, so no edit support.
 */ __turbopack_context__.s([
    "CHEAPERINFERENCE_IMAGE_PROVIDER",
    ()=>CHEAPERINFERENCE_IMAGE_PROVIDER
]);
const CHEAPERINFERENCE_IMAGE_PROVIDER = {
    id: "cheaperinference",
    alias: "cinf",
    baseUrl: "https://api.cheaperinference.com/v1/images/generations",
    authType: "apikey",
    authHeader: "bearer",
    format: "openai",
    models: [
        {
            id: "grok-imagine",
            name: "Grok Imagine (Cheaper Inference)"
        },
        {
            id: "nano-banana-pro",
            name: "Nano Banana Pro (Cheaper Inference)"
        },
        {
            id: "nano-banana-2",
            name: "Nano Banana 2 (Cheaper Inference)"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "2048x2048",
        "4096x4096"
    ]
};
}),
"[project]/open-sse/config/imageRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IMAGE_PROVIDERS",
    ()=>IMAGE_PROVIDERS,
    "getAllImageModels",
    ()=>getAllImageModels,
    "getImageModelAliases",
    ()=>getImageModelAliases,
    "getImageModelEntry",
    ()=>getImageModelEntry,
    "getImageProvider",
    ()=>getImageProvider,
    "isRegisteredImageModel",
    ()=>isRegisteredImageModel,
    "modalitiesRequireImageInput",
    ()=>modalitiesRequireImageInput,
    "parseImageModel",
    ()=>parseImageModel
]);
/**
 * Image Generation Provider Registry
 *
 * Defines providers that support the /v1/images/generations endpoint.
 * Each provider has its own request format and endpoint.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/lmarena/directModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/segmind/imageModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kie/imageModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freepik$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/freepik/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stability$2d$ai$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/stability-ai/imageModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gemini/imageModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cheaperinference/imageModels.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
const IMAGE_MODEL_ALIASES = {
    "gemini-3.1-flash-image-preview": {
        provider: "antigravity",
        model: "gemini-3.1-flash-image",
        name: "Gemini 3.1 Flash Image",
        listInCatalog: false
    },
    "flux-kontext": {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-kontext-max": {
        provider: "black-forest-labs",
        model: "flux-kontext-max",
        name: "FLUX Kontext Max",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-max": {
        provider: "black-forest-labs",
        model: "flux-2-max",
        name: "FLUX.2 Max",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-pro": {
        provider: "black-forest-labs",
        model: "flux-2-pro",
        name: "FLUX.2 Pro",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-flex": {
        provider: "black-forest-labs",
        model: "flux-2-flex",
        name: "FLUX.2 Flex",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-dev": {
        provider: "together",
        model: "black-forest-labs/FLUX.2-dev",
        name: "FLUX.2 Dev",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    kontext: {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: false,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "pollinations/kontext": {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: false,
        inputModalities: [
            "text",
            "image"
        ]
    }
};
function resolveImageModelAlias(modelStr) {
    const alias = IMAGE_MODEL_ALIASES[modelStr];
    return alias ? {
        provider: alias.provider,
        model: alias.model
    } : null;
}
function findImageModelConfig(providerId, modelId) {
    const provider = IMAGE_PROVIDERS[providerId];
    if (!provider) return null;
    return provider.models.find((model)=>model.id === modelId) || null;
}
// Kept out of getImageModelEntry() (which sits at the complexity-ratchet cap) — an
// alias can override imageRequired directly, else it falls back to its target
// model's own flag. Consumers coerce the result with Boolean(), so no `?? false`.
function resolveAliasImageRequired(alias, modelConfig) {
    return alias.imageRequired ?? modelConfig?.imageRequired;
}
const IMAGE_PROVIDERS = {
    "qwen-cloud-token-plan": {
        id: "qwen-cloud-token-plan",
        alias: "qct",
        baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "qwen-token-plan-image",
        models: [
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        // Both models share 1K/2K support. The Pro model also accepts explicit 4K
        // dimensions, which callers can still pass through the permissive request schema.
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "gpt-image-2",
                name: "GPT Image 2"
            },
            {
                id: "gpt-image-1.5",
                name: "GPT Image 1.5"
            },
            {
                id: "gpt-image-1-mini",
                name: "GPT Image 1 Mini"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    // Codex exposes image generation only as a Responses-API hosted tool under
    // ChatGPT OAuth. Incoming GPT-Image-style `/v1/images/generations` requests are
    // translated to /responses calls with `tools: [{ type: "image_generation" }]`
    // by handleCodexImageGeneration.
    codex: {
        id: "codex",
        alias: "cx",
        baseUrl: "https://chatgpt.com/backend-api/codex/responses",
        authType: "oauth",
        authHeader: "bearer",
        format: "codex-responses",
        models: [
            {
                id: "gpt-5.6-sol",
                name: "GPT 5.6 Sol (Codex Image)"
            },
            {
                id: "gpt-5.6-terra",
                name: "GPT 5.6 Terra (Codex Image)"
            },
            {
                id: "gpt-5.6-luna",
                name: "GPT 5.6 Luna (Codex Image)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1536",
            "1536x1024"
        ]
    },
    "chatgpt-web": {
        id: "chatgpt-web",
        alias: "cgpt-web",
        baseUrl: "https://chatgpt.com/backend-api/f/conversation",
        authType: "apikey",
        authHeader: "cookie",
        format: "chatgpt-web",
        models: [
            {
                id: "gpt-5.5",
                name: "GPT-5.5 Instant (ChatGPT Web Image)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1536",
            "1536x1024"
        ]
    },
    "microsoft-designer-web": {
        id: "microsoft-designer-web",
        alias: "msdesigner",
        baseUrl: "https://designerapp.officeapps.live.com/designerapp/DallE.ashx?action=GetDallEImagesCogSci",
        authType: "apikey",
        authHeader: "bearer",
        format: "designer-web",
        models: [
            {
                id: "dall-e-3",
                name: "DALL-E 3 (Microsoft Designer Web)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1792x1024",
            "1024x1792"
        ]
    },
    xai: {
        id: "xai",
        baseUrl: "https://api.x.ai/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "grok-imagine-image-quality",
                name: "Grok Imagine Image Quality"
            },
            {
                id: "grok-imagine-image",
                name: "Grok Imagine Image"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    "vercel-ai-gateway": {
        id: "vercel-ai-gateway",
        alias: "vag",
        baseUrl: "https://ai-gateway.vercel.sh/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "gpt-image-1",
                name: "GPT Image 1"
            },
            {
                id: "black-forest-labs/flux-1.1-pro",
                name: "FLUX 1.1 Pro"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "black-forest-labs/FLUX.2-max",
                name: "FLUX.2 Max",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-pro",
                name: "FLUX.2 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-flex",
                name: "FLUX.2 Flex",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-dev",
                name: "FLUX.2 Dev",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "openai/gpt-image-1.5",
                name: "GPT Image 1.5",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Wan-AI/Wan2.6-image",
                name: "Wan 2.6 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Qwen/Qwen-Image-2.0-Pro",
                name: "Qwen Image 2.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Qwen/Qwen-Image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "google/flash-image-3.1",
                name: "NanoBanana 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "google/gemini-3-pro-image",
                name: "NanoBanana Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    fireworks: {
        id: "fireworks",
        baseUrl: "https://api.fireworks.ai/inference/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "accounts/fireworks/flux-kontext-max",
                name: "FLUX Kontext Max"
            },
            {
                id: "accounts/fireworks/flux-kontext-pro",
                name: "FLUX Kontext Pro"
            },
            {
                id: "accounts/fireworks/flux-1-schnell-fp8",
                name: "FLUX.1 schnell"
            },
            {
                id: "accounts/fireworks/models/flux-1-dev-fp8",
                name: "FLUX 1 Dev FP8"
            },
            {
                id: "accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
                name: "SDXL 1024 v1.0"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    antigravity: {
        id: "antigravity",
        baseUrl: "https://daily-cloudcode-pa.googleapis.com/v1internal:generateContent",
        authType: "oauth",
        authHeader: "bearer",
        format: "gemini-image",
        models: [
            {
                id: "gemini-3.1-flash-image",
                name: "Gemini 3.1 Flash Image"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Google AI Studio Imagen family — dedicated :predict endpoint, not generateContent.
    // See providers/registry/gemini/imageModels.ts for the full rationale.
    gemini: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GEMINI_IMAGEN_PROVIDER"],
    //Curruntly no models serving
    nebius: {
        id: "nebius",
        baseUrl: "https://api.tokenfactory.nebius.com/v1/images/generations",
        fallbackUrl: "https://api.studio.nebius.com/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "black-forest-labs/flux-schnell",
                name: "No Model yet"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    hyperbolic: {
        id: "hyperbolic",
        baseUrl: "https://api.hyperbolic.xyz/v1/image/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "hyperbolic",
        models: [
            {
                id: "SDXL1.0-base",
                name: "No Model yet"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    //Curruntly no models serving
    nanobanana: {
        id: "nanobanana",
        baseUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/generate",
        proUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/generate-pro",
        statusUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/record-info",
        authType: "apikey",
        authHeader: "bearer",
        format: "nanobanana",
        models: [
            {
                id: "nanobanana-flash",
                name: "NanoBanana Flash (Gemini 2.5 Flash)"
            },
            {
                id: "nanobanana-pro",
                name: "NanoBanana Pro (Gemini 3 Pro)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1024x1536",
            "1536x1024",
            "1280x1024"
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-image",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KIE_IMAGE_MODELS"],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4"
        ]
    },
    haiper: {
        id: "haiper",
        baseUrl: "https://api.haiper.ai/v1/jobs/gen2/text2image",
        statusUrl: "https://api.haiper.ai/v1/jobs",
        authType: "apikey",
        authHeader: "HAIPER_KEY",
        format: "haiper-image",
        models: [
            {
                id: "gen2",
                name: "Gen 2 Image"
            }
        ],
        supportedSizes: [
            "16:9",
            "9:16",
            "1:1",
            "4:3",
            "3:4"
        ]
    },
    // #2482: MiniMax already has entries in musicRegistry/audioRegistry/videoRegistry,
    // but was missing an image provider entirely, so MiniMax image-model requests
    // fell through the format dispatch below to a 400/unmatched-format response.
    minimax: {
        id: "minimax",
        baseUrl: "https://api.minimax.io/v1/image_generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "minimax-image",
        models: [
            {
                id: "image-01",
                name: "MiniMax Image-01"
            },
            {
                id: "image-01-live",
                name: "MiniMax Image-01 Live"
            }
        ],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4",
            "3:2",
            "2:3",
            "1024x1024"
        ]
    },
    leonardo: {
        id: "leonardo",
        baseUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "leonardo-image",
        models: [
            {
                id: "phoenix",
                name: "Phoenix"
            },
            {
                id: "sdxl",
                name: "SDXL"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x576",
            "576x1024"
        ]
    },
    ideogram: {
        id: "ideogram",
        baseUrl: "https://api.ideogram.ai/generate",
        authType: "apikey",
        authHeader: "Api-Key",
        format: "ideogram-image",
        models: [
            {
                id: "V_3",
                name: "Ideogram V3"
            },
            {
                id: "V_2A",
                name: "Ideogram V2A"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    freepik: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freepik$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FREEPIK_IMAGE_PROVIDER"],
    sdwebui: {
        id: "sdwebui",
        baseUrl: "http://localhost:7860/sdapi/v1/txt2img",
        authType: "none",
        authHeader: "none",
        format: "sdwebui",
        models: [
            {
                id: "stable-diffusion-v1-5",
                name: "Stable Diffusion v1.5"
            },
            {
                id: "sdxl-base-1.0",
                name: "SDXL Base 1.0"
            }
        ],
        supportedSizes: [
            "512x512",
            "768x768",
            "1024x1024"
        ]
    },
    comfyui: {
        id: "comfyui",
        baseUrl: "http://localhost:8188",
        authType: "none",
        authHeader: "none",
        format: "comfyui",
        models: [
            {
                id: "flux-dev",
                name: "FLUX Dev"
            },
            {
                id: "sdxl",
                name: "SDXL"
            }
        ],
        supportedSizes: [
            "512x512",
            "768x768",
            "1024x1024"
        ]
    },
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "openai/gpt-5.4-image-2",
                name: "GPT Image 2 (via OpenRouter)"
            },
            {
                id: "openai/gpt-5-image-mini",
                name: "GPT Image 1 Mini (via OpenRouter)"
            },
            {
                id: "google/gemini-3.1-flash-image-preview",
                name: "Nano Banana 2 (via OpenRouter)"
            },
            {
                id: "google/gemini-3-pro-image-preview",
                name: "Nano Banana Pro (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-max",
                name: "FLUX.2 Max (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-pro",
                name: "FLUX.2 Pro (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-flex",
                name: "FLUX.2 Flex (via OpenRouter)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    pollinations: {
        id: "pollinations",
        alias: "pol",
        baseUrl: "https://gen.pollinations.ai/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "klein",
                name: "FLUX.2 Klein 4B"
            },
            {
                id: "flux",
                name: "Flux Schnell"
            },
            {
                id: "zimage",
                name: "Z-Image Turbo"
            },
            {
                id: "qwen-image",
                name: "Qwen Image Plus"
            },
            {
                id: "wan-image",
                name: "Wan 2.7 Image"
            },
            {
                id: "gpt-image-2",
                name: "GPT Image 2"
            },
            {
                id: "gptimage-large",
                name: "GPT Image 1.5"
            },
            {
                id: "gptimage",
                name: "GPT Image 1 Mini"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    "fal-ai": {
        id: "fal-ai",
        baseUrl: "https://fal.run",
        authType: "apikey",
        authHeader: "key",
        format: "fal-ai",
        models: [
            {
                id: "fal-ai/flux-2-max",
                name: "FLUX.2 Max"
            },
            {
                id: "fal-ai/flux-2-pro",
                name: "FLUX.2 Pro"
            },
            {
                id: "fal-ai/flux-2-flex",
                name: "FLUX.2 Flex"
            },
            {
                id: "bria/text-to-image/3.2",
                name: "Bria 3.2"
            },
            {
                id: "fal-ai/bytedance/seedream/v4.5/text-to-image",
                name: "SeeDream V4.5"
            },
            {
                id: "fal-ai/bytedance/dreamina/v3.1/text-to-image",
                name: "Dreamina V3.1"
            },
            {
                id: "fal-ai/ideogram/v3",
                name: "Ideogram V3"
            },
            {
                id: "fal-ai/nano-banana-pro",
                name: "Nano Banana Pro"
            },
            {
                id: "fal-ai/nano-banana-2",
                name: "Nano Banana 2"
            },
            {
                id: "fal-ai/recraft/v4/pro/text-to-image",
                name: "Recraft V4 Pro via Fal"
            },
            {
                id: "fal-ai/recraft/v4/text-to-image",
                name: "Recraft V4 via Fal"
            },
            {
                id: "fal-ai/stable-diffusion-v35-medium",
                name: "Stable Diffusion v3.5 Medium"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    "stability-ai": {
        id: "stability-ai",
        baseUrl: "https://api.stability.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "stability-ai",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stability$2d$ai$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STABILITY_AI_IMAGE_MODELS"],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    "black-forest-labs": {
        id: "black-forest-labs",
        baseUrl: "https://api.bfl.ai",
        authType: "apikey",
        authHeader: "x-key",
        format: "black-forest-labs",
        models: [
            {
                id: "flux-2-max",
                name: "FLUX.2 Max"
            },
            {
                id: "flux-2-pro",
                name: "FLUX.2 Pro"
            },
            {
                id: "flux-2-flex",
                name: "FLUX.2 Flex"
            },
            {
                id: "flux-pro-1.1-ultra",
                name: "flux-pro-1.1-ultra"
            },
            {
                id: "flux-pro-1.1",
                name: "flux-pro-1.1"
            },
            {
                id: "flux-2-klein-9b",
                name: "flux 2 Klein 9B"
            },
            {
                id: "flux-2-klein-4b",
                name: "flux 2 Klein 4B"
            },
            {
                id: "flux-kontext-max",
                name: "flux-kontext-max",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-kontext-pro",
                name: "flux-kontext-pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-dev",
                name: "flux-dev"
            },
            {
                id: "flux-pro",
                name: "flux-pro"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    recraft: {
        id: "recraft",
        baseUrl: "https://external.api.recraft.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "recraft",
        models: [
            {
                id: "recraftv4_pro",
                name: "Recraft V4 Pro"
            },
            {
                id: "recraftv4",
                name: "Recraft V4"
            },
            {
                id: "recraftv3",
                name: "Recraft V3"
            },
            {
                id: "recraftv2",
                name: "Recraft V2"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    topaz: {
        id: "topaz",
        baseUrl: "https://api.topazlabs.com",
        authType: "apikey",
        authHeader: "x-api-key",
        format: "topaz",
        models: [
            {
                id: "topaz-enhance",
                name: "topaz-enhance",
                inputModalities: [
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Segmind (#6656): 200+ models, `POST /v1/{model}`, x-api-key, raw image bytes.
    segmind: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEGMIND_IMAGE_PROVIDER"],
    nanogpt: {
        id: "nanogpt",
        baseUrl: "https://nano-gpt.com/api/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "qwen-image",
                name: "Qwen Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z Image Turbo"
            },
            {
                id: "chroma",
                name: "Chroma"
            },
            {
                id: "hidream",
                name: "Hidream I1 Full"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    // NVIDIA NIM image generation (FLUX models). Distinct from the NVIDIA *chat* entry
    // (open-sse/config/providers/registry/nvidia/index.ts, host integrate.api.nvidia.com,
    // OpenAI-compatible) — image generation lives on ai.api.nvidia.com/v1/genai/<model>
    // with a native NIM body per model, so it gets a dedicated `nvidia-nim` format/handler
    // (handleNvidiaNimImageGeneration) rather than reusing the OpenAI image path.
    // Ported from upstream 9router#1195.
    nvidia: {
        id: "nvidia",
        baseUrl: "https://ai.api.nvidia.com/v1/genai",
        authType: "apikey",
        authHeader: "bearer",
        format: "nvidia-nim",
        models: [
            {
                id: "black-forest-labs/flux.1-dev",
                name: "FLUX.1 Dev",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/flux.1-schnell",
                name: "FLUX.1 Schnell"
            },
            {
                id: "black-forest-labs/flux.1-kontext-dev",
                name: "FLUX.1 Kontext Dev (Edit)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/flux.2-klein-4b",
                name: "FLUX.2 Klein 4B",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "768x1344",
            "512x512"
        ]
    },
    // SenseNova (商汤日日新) Text-to-Image on the free Token Plan. OpenAI-compatible
    // `/v1/images/generations`, so the generic OpenAI image handler routes it — same
    // SenseNova api-key/connection as the chat provider. (9router#2233)
    sensenova: {
        id: "sensenova",
        baseUrl: "https://api.sensenova.cn/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "sensenova-u1-fast",
                name: "SenseNova U1 Fast"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // HuggingFace Hub Inference API text-to-image task. Returns raw image bytes
    // (not JSON), so it uses a dedicated "huggingface-image" format handled by
    // handleHuggingFaceImageGeneration. Same base URL convention as the HF
    // STT/TTS entries in audioRegistry.ts. Model list is deliberately small —
    // the dashboard's "suggested models" chip row (GET
    // /api/v1/providers/suggested-models) surfaces additional HF Hub models
    // beyond this seed list.
    huggingface: {
        id: "huggingface",
        // HF retired api-inference.huggingface.co; text-to-image now routes through
        // router.huggingface.co with the hf-inference provider pinned in the path.
        baseUrl: "https://router.huggingface.co/hf-inference/models",
        authType: "apikey",
        authHeader: "bearer",
        format: "huggingface-image",
        models: [
            {
                id: "black-forest-labs/FLUX.1-dev",
                name: "FLUX.1 Dev (HF)"
            },
            {
                id: "black-forest-labs/FLUX.1-schnell",
                name: "FLUX.1 Schnell (HF)"
            },
            {
                id: "stabilityai/stable-diffusion-xl-base-1.0",
                name: "Stable Diffusion XL (HF)"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Arena (formerly LMArena) Direct-chat Image category (static scrape 2026-07-09).
    // Not listed in the chat registry — image catalog only. Generation path still
    // uses cookie session auth via the lmarena provider connection (stable wire id).
    lmarena: {
        id: "lmarena",
        alias: "lma",
        baseUrl: "https://arena.ai/nextjs-api/stream/create-evaluation",
        authType: "apikey",
        authHeader: "cookie",
        format: "openai",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LMARENA_DIRECT_IMAGE_MODELS"],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    // Adobe Firefly (unofficial) — IMS access_token (clio-playground-web) or browser
    // Cookie from firefly.adobe.com. Async 3P image generate + poll.
    // Model list = static fallback from models/discovery capture; live discovery
    // refreshes via resolveAdobeFireflyCatalog when credentials work.
    "adobe-firefly": {
        id: "adobe-firefly",
        alias: "firefly",
        baseUrl: "https://firefly-3p.ff.adobe.io/v2/3p-images/generate-async",
        authType: "apikey",
        authHeader: "bearer",
        format: "adobe-firefly-image",
        models: [
            {
                id: "nano-banana-pro",
                name: "Firefly Gemini 3.0 (Nano Banana Pro)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "nano-banana",
                name: "Firefly Gemini 2.5 (Nano Banana)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "nano-banana-2",
                name: "Firefly Gemini 3.1 (Nano Banana 2)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image-2",
                name: "Firefly GPT Image 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image",
                name: "Firefly GPT Image 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image-1.5",
                name: "Firefly GPT Image 1.5",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-2",
                name: "Firefly Flux 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-pro",
                name: "Firefly Flux 1.1 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-ultra",
                name: "Firefly Flux 1.1 Ultra",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "seedream-4",
                name: "Firefly Seedream 4.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "seedream-5-lite",
                name: "Firefly Seedream 5.0 Lite",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "runway-gen4-image",
                name: "Firefly Runway Gen-4 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            // Topaz Labs upscalers (inputMediaUseCase: ["upscaling"]).
            // Served by firefly-3p /v2/3p-images/upsample — see config/upscaleRegistry.ts.
            {
                id: "topaz-standard",
                name: "Firefly Topaz Upscale (Standard)",
                inputModalities: [
                    "image"
                ],
                imageRequired: true
            },
            {
                id: "topaz-bloom",
                name: "Firefly Topaz Bloom (Creative Upscale)",
                inputModalities: [
                    "image"
                ],
                imageRequired: true
            }
        ],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4",
            "1024x1024",
            "1792x1024",
            "1024x1792"
        ]
    },
    // Cheaper Inference (OSS-sponsor gateway). Declared AFTER adobe-firefly on
    // purpose: it shares the nano-banana-pro / nano-banana-2 ids, and parseImageModel
    // resolves a bare id by first-match over this object's iteration order, so
    // Firefly keeps the bare ids and these are prefix-only. See the module for the
    // full collision note.
    cheaperinference: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$imageModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHEAPERINFERENCE_IMAGE_PROVIDER"],
    // Keep Bailian Coding Plan after existing duplicate model owners so adding
    // explicit `bailian-coding-plan/` and `bcp/` routes does not change
    // historical bare-model routing.
    "bailian-coding-plan": {
        id: "bailian-coding-plan",
        alias: "bcp",
        baseUrl: "https://coding-intl.dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "bailian-coding-plan-image",
        models: [
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro",
                name: "Qwen Image 2.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    // Keep Alibaba after existing duplicate model owners so adding explicit
    // `alibaba/` and `ali/` routes does not change historical bare-model routing.
    alibaba: {
        id: "alibaba",
        alias: "ali",
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "alibaba-image",
        models: [
            {
                id: "qwen-image-3.0-pro",
                name: "Qwen Image 3.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro-2026-06-22",
                name: "Qwen Image 2.0 Pro (2026-06-22)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z-Image Turbo"
            },
            {
                id: "wan2.6-t2i",
                name: "Wan 2.6 T2I"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1280x1280",
            "2048x2048"
        ]
    },
    // Keep regular Qwen Cloud isolated from Alibaba, Bailian Coding Plan, and
    // Qwen Cloud Token Plan. Explicit `qwen-cloud/` or `qwc/` routes use only
    // the regular Qwen Cloud connection and its regional DashScope endpoint.
    "qwen-cloud": {
        id: "qwen-cloud",
        alias: "qwc",
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "qwen-cloud-image",
        models: [
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-3.0-pro",
                name: "Qwen Image 3.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro-2026-06-22",
                name: "Qwen Image 2.0 Pro (2026-06-22)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-2026-03-03",
                name: "Qwen Image 2.0 (2026-03-03)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z-Image Turbo"
            }
        ],
        // 1K/2K are shared by the whole catalog. Wan 2.7 Image Pro callers can
        // still pass supported 4K dimensions through the permissive request schema.
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    }
};
function getImageProvider(providerId) {
    return IMAGE_PROVIDERS[providerId] || null;
}
function parseImageModel(modelStr) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    const directAlias = resolveImageModelAlias(modelStr);
    if (directAlias) {
        return directAlias;
    }
    // Try each provider prefix
    for (const [providerId, config] of Object.entries(IMAGE_PROVIDERS)){
        if (modelStr.startsWith(providerId + "/")) {
            const model = modelStr.slice(providerId.length + 1);
            const aliased = resolveImageModelAlias(`${providerId}/${model}`) || resolveImageModelAlias(model);
            return aliased || {
                provider: providerId,
                model
            };
        }
        // Check alias if available
        if (config.alias && modelStr.startsWith(config.alias + "/")) {
            const model = modelStr.slice(config.alias.length + 1);
            const aliased = resolveImageModelAlias(`${providerId}/${model}`) || resolveImageModelAlias(model);
            return aliased || {
                provider: providerId,
                model
            };
        }
    }
    // No provider prefix — try to find the model in every provider
    for (const [providerId, config] of Object.entries(IMAGE_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
/**
 * Get all image models as a flat list
 */ function imageProviderCatalogEntries(providerId, config) {
    return config.models.map((model)=>({
            id: `${providerId}/${model.id}`,
            name: model.name,
            provider: providerId,
            supportedSizes: config.supportedSizes,
            inputModalities: model.inputModalities || [
                "text"
            ],
            description: model.description || undefined
        }));
}
function imageAliasCatalogEntry(alias, target) {
    if (!target.listInCatalog) return null;
    const providerConfig = IMAGE_PROVIDERS[target.provider];
    const modelConfig = findImageModelConfig(target.provider, target.model);
    return {
        id: alias,
        name: target.name || modelConfig?.name || alias,
        provider: target.provider,
        supportedSizes: providerConfig?.supportedSizes || [],
        inputModalities: target.inputModalities || modelConfig?.inputModalities || [
            "text"
        ],
        description: target.description || modelConfig?.description || undefined
    };
}
function getAllImageModels() {
    const providerModels = Object.entries(IMAGE_PROVIDERS).flatMap(([providerId, config])=>imageProviderCatalogEntries(providerId, config));
    const aliasModels = Object.entries(IMAGE_MODEL_ALIASES).flatMap(([alias, target])=>{
        const entry = imageAliasCatalogEntry(alias, target);
        return entry ? [
            entry
        ] : [];
    });
    return [
        ...providerModels,
        ...aliasModels
    ];
}
function getImageModelAliases() {
    return IMAGE_MODEL_ALIASES;
}
function isRegisteredImageModel(providerId, modelId) {
    return Boolean(findImageModelConfig(providerId, modelId));
}
function getImageModelEntry(modelStr) {
    if (!modelStr) return null;
    const alias = IMAGE_MODEL_ALIASES[modelStr];
    if (alias) {
        const modelConfig = findImageModelConfig(alias.provider, alias.model);
        return {
            provider: alias.provider,
            model: alias.model,
            inputModalities: alias.inputModalities || modelConfig?.inputModalities || [
                "text"
            ],
            imageRequired: resolveAliasImageRequired(alias, modelConfig),
            description: alias.description || modelConfig?.description || undefined
        };
    }
    const { provider, model } = parseImageModel(modelStr);
    if (!provider || !model) return null;
    const modelConfig = findImageModelConfig(provider, model);
    if (!modelConfig) return null;
    return {
        provider,
        model,
        inputModalities: modelConfig.inputModalities || [
            "text"
        ],
        imageRequired: modelConfig.imageRequired,
        description: modelConfig.description || undefined
    };
}
function modalitiesRequireImageInput(inputModalities) {
    const list = Array.isArray(inputModalities) ? inputModalities : [
        "text"
    ];
    return list.includes("image") && !list.includes("text");
}
}),
"[project]/open-sse/config/embeddingRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Embedding Provider Registry
 *
 * Defines providers that support the /v1/embeddings endpoint.
 * All providers use the OpenAI-compatible format.
 *
 * API keys are stored in the same provider credentials system,
 * keyed by provider ID (e.g. "nebius", "openai").
 */ __turbopack_context__.s([
    "EMBEDDING_PROVIDERS",
    ()=>EMBEDDING_PROVIDERS,
    "buildDynamicEmbeddingProvider",
    ()=>buildDynamicEmbeddingProvider,
    "detectEmbeddingDimensionConflict",
    ()=>detectEmbeddingDimensionConflict,
    "getAllEmbeddingModels",
    ()=>getAllEmbeddingModels,
    "getEmbeddingDimension",
    ()=>getEmbeddingDimension,
    "getEmbeddingModelDefaultParams",
    ()=>getEmbeddingModelDefaultParams,
    "getEmbeddingModelModalities",
    ()=>getEmbeddingModelModalities,
    "getEmbeddingProvider",
    ()=>getEmbeddingProvider,
    "parseEmbeddingModel",
    ()=>parseEmbeddingModel
]);
function buildDynamicEmbeddingProvider(node) {
    if (!node.prefix || !node.baseUrl) {
        throw new Error(`Invalid provider_node: missing prefix or baseUrl`);
    }
    if (node.prefix.includes("/") || node.prefix.includes(" ")) {
        throw new Error(`Invalid provider_node prefix "${node.prefix}": must not contain / or spaces`);
    }
    const baseUrl = node.baseUrl.replace(/\/+$/, "");
    return {
        id: node.prefix,
        baseUrl: `${baseUrl}/embeddings`,
        authType: "none",
        authHeader: "none",
        models: []
    };
}
const EMBEDDING_PROVIDERS = {
    cohere: {
        id: "cohere",
        baseUrl: "https://api.cohere.com/v2/embed",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "embed-v4.0",
                name: "Embed v4.0"
            },
            {
                id: "embed-multilingual-v3.0",
                name: "Embed Multilingual v3.0"
            },
            {
                id: "embed-multilingual-v3.0-images",
                name: "Embed Multilingual v3.0 Image"
            },
            {
                id: "embed-multilingual-light-v3.0",
                name: "Embed Multilingual Light v3.0"
            },
            {
                id: "embed-multilingual-light-v3.0-images",
                name: "Embed Multilingual Light v3.0 Image"
            }
        ]
    },
    nebius: {
        id: "nebius",
        baseUrl: "https://api.tokenfactory.nebius.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Qwen/Qwen3-Embedding-8B",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            }
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large",
                dimensions: 3072
            },
            {
                id: "text-embedding-ada-002",
                name: "Text Embedding Ada 002",
                dimensions: 1536
            }
        ]
    },
    "vercel-ai-gateway": {
        id: "vercel-ai-gateway",
        baseUrl: "https://ai-gateway.vercel.sh/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large",
                dimensions: 3072
            }
        ]
    },
    upstage: {
        id: "upstage",
        baseUrl: "https://api.upstage.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "embedding-query",
                name: "Embedding Query",
                dimensions: 4096
            },
            {
                id: "embedding-passage",
                name: "Embedding Passage",
                dimensions: 4096
            }
        ]
    },
    mistral: {
        id: "mistral",
        baseUrl: "https://api.mistral.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "mistral-embed",
                name: "Mistral Embed",
                dimensions: 1024
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "BAAI/bge-large-en-v1.5",
                name: "BGE Large EN v1.5",
                dimensions: 1024
            },
            {
                id: "togethercomputer/m2-bert-80M-8k-retrieval",
                name: "M2 BERT 80M 8K",
                dimensions: 768
            }
        ]
    },
    fireworks: {
        id: "fireworks",
        baseUrl: "https://api.fireworks.ai/inference/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "nomic-ai/nomic-embed-text-v1.5",
                name: "Nomic Embed Text v1.5",
                dimensions: 768
            },
            {
                id: "accounts/fireworks/models/qwen3-embedding-8b",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            }
        ]
    },
    nvidia: {
        id: "nvidia",
        baseUrl: "https://integrate.api.nvidia.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        // nv-embedqa-* are asymmetric models: NVIDIA NIM rejects requests without an
        // `input_type` ("query" | "passage") with 400 "'input_type' parameter is
        // required". Default to "query" when the client omits it (issue #1378).
        models: [
            {
                id: "nvidia/nv-embedqa-e5-v5",
                name: "NV EmbedQA E5 v5",
                dimensions: 1024,
                defaultParams: {
                    input_type: "query"
                }
            }
        ]
    },
    // Issue #2298: Adding DeepInfra to the embedding registry so custom
    // embedding models on the DeepInfra provider don't fail with "Unknown
    // embedding provider" when the user adds them via the dashboard.
    deepinfra: {
        id: "deepinfra",
        baseUrl: "https://api.deepinfra.com/v1/openai/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Qwen/Qwen3-Embedding-8B",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            },
            {
                id: "Qwen/Qwen3-Embedding-4B",
                name: "Qwen3 Embedding 4B",
                dimensions: 2560
            },
            {
                id: "Qwen/Qwen3-Embedding-0.6B",
                name: "Qwen3 Embedding 0.6B",
                dimensions: 1024
            },
            {
                id: "BAAI/bge-large-en-v1.5",
                name: "BGE Large EN v1.5",
                dimensions: 1024
            },
            {
                id: "BAAI/bge-base-en-v1.5",
                name: "BGE Base EN v1.5",
                dimensions: 768
            },
            {
                id: "BAAI/bge-m3",
                name: "BGE-M3",
                dimensions: 1024
            },
            {
                id: "intfloat/e5-large-v2",
                name: "E5 Large v2",
                dimensions: 1024
            },
            {
                id: "thenlper/gte-large",
                name: "GTE Large",
                dimensions: 1024
            }
        ]
    },
    // #6976 — OpenRouter serves embeddings via a dedicated OpenAI-compatible
    // /api/v1/embeddings endpoint (omitted from /v1/models, so this catalog is
    // curated rather than live-discovered). Ids verified against the API
    // reference (not the display-name collections page) at refresh time:
    // https://openrouter.ai/docs/api/reference/embeddings and
    // https://openrouter.ai/collections/embedding-models
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "openai/text-embedding-3-small",
                name: "Text Embedding 3 Small (OpenRouter)",
                dimensions: 1536
            },
            {
                id: "openai/text-embedding-3-large",
                name: "Text Embedding 3 Large (OpenRouter)",
                dimensions: 3072
            },
            {
                id: "qwen/qwen3-embedding-8b",
                name: "Qwen3 Embedding 8B (OpenRouter)",
                dimensions: 4096
            },
            {
                id: "qwen/qwen3-embedding-4b",
                name: "Qwen3 Embedding 4B (OpenRouter)",
                dimensions: 2560
            },
            {
                id: "baai/bge-m3",
                name: "BGE-M3 (OpenRouter)",
                dimensions: 1024
            },
            {
                id: "mistralai/mistral-embed-2312",
                name: "Mistral Embed (OpenRouter)",
                dimensions: 1024
            },
            {
                id: "google/gemini-embedding-001",
                name: "Gemini Embedding 001 (OpenRouter)",
                dimensions: 768
            }
        ]
    },
    gemini: {
        id: "gemini",
        structuredInputProtocol: "gemini-embed-content",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "gemini-embedding-2",
                name: "Gemini Embedding 2",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "gemini-embedding-2-preview",
                name: "Gemini Embedding 2 Preview",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "gemini-embedding-001",
                name: "Gemini Embedding 001",
                dimensions: 768
            }
        ]
    },
    "voyage-ai": {
        id: "voyage-ai",
        baseUrl: "https://api.voyageai.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "voyage-4-large",
                name: "Voyage 4 Large",
                dimensions: 1024
            },
            {
                id: "voyage-4",
                name: "Voyage 4",
                dimensions: 1024
            },
            {
                id: "voyage-4-lite",
                name: "Voyage 4 Lite",
                dimensions: 1024
            },
            {
                id: "voyage-3-large",
                name: "Voyage 3 Large",
                dimensions: 1024
            },
            {
                id: "voyage-3.5",
                name: "Voyage 3.5",
                dimensions: 1024
            },
            {
                id: "voyage-3.5-lite",
                name: "Voyage 3.5 Lite",
                dimensions: 512
            },
            {
                id: "voyage-multilingual-2",
                name: "Voyage Multilingual 2",
                dimensions: 1024
            },
            {
                id: "voyage-code-3",
                name: "Voyage Code 3",
                dimensions: 1024
            },
            {
                id: "voyage-code-2",
                name: "Voyage Code 2",
                dimensions: 1536
            },
            {
                id: "voyage-finance-2",
                name: "Voyage Finance 2",
                dimensions: 1024
            },
            {
                id: "voyage-law-2",
                name: "Voyage Law 2",
                dimensions: 1024
            }
        ]
    },
    "github-models": {
        id: "github-models",
        baseUrl: "https://models.github.ai/inference/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "openai/text-embedding-3-large",
                name: "OpenAI Text Embedding 3 (large)",
                dimensions: 3_072
            },
            {
                id: "openai/text-embedding-3-small",
                name: "OpenAI Text Embedding 3 (small)",
                dimensions: 1_536
            }
        ]
    },
    github: {
        id: "github",
        baseUrl: "https://models.inference.ai.azure.com/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small (GitHub)",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large (GitHub)",
                dimensions: 3072
            }
        ]
    },
    "jina-ai": {
        id: "jina-ai",
        structuredInputProtocol: "jina-v1",
        baseUrl: "https://api.jina.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "jina-embeddings-v5-text-small",
                name: "Jina Embeddings v5 Text Small",
                dimensions: 1024
            },
            {
                id: "jina-embeddings-v5-text-nano",
                name: "Jina Embeddings v5 Text Nano",
                dimensions: 768
            },
            {
                id: "jina-embeddings-v5-omni-small",
                name: "Jina Embeddings v5 Omni Small",
                dimensions: 1024,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "jina-embeddings-v5-omni-nano",
                name: "Jina Embeddings v5 Omni Nano",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "jina-code-embeddings-1.5b",
                name: "Jina Code Embeddings 1.5B",
                dimensions: 1536
            },
            {
                id: "jina-code-embeddings-0.5b",
                name: "Jina Code Embeddings 0.5B",
                dimensions: 896
            },
            {
                id: "jina-embeddings-v4",
                name: "Jina Embeddings v4",
                dimensions: 2048,
                modalities: [
                    "text",
                    "image",
                    "document"
                ]
            },
            {
                id: "jina-clip-v2",
                name: "Jina CLIP v2",
                dimensions: 1024,
                modalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "jina-colbert-v2",
                name: "Jina ColBERT v2",
                dimensions: 128
            }
        ]
    },
    // LM Studio — local OpenAI-compatible server. No auth required.
    // Models are passthrough (LM Studio exposes its own model list), so the
    // models array is empty. The baseUrl is the default LM Studio endpoint;
    // users with a configured provider_node will use that URL instead.
    lmstudio: {
        id: "lmstudio",
        baseUrl: "http://localhost:1234/v1/embeddings",
        authType: "none",
        authHeader: "none",
        models: []
    },
    // Ollama Local — OpenAI-compatible embeddings endpoint. Ollama exposes its
    // own model catalog, but these common embedding models are useful defaults
    // for model selection and validation.
    "ollama-local": {
        id: "ollama-local",
        baseUrl: "http://localhost:11434/v1/embeddings",
        authType: "none",
        authHeader: "none",
        models: [
            {
                id: "embeddinggemma",
                name: "EmbeddingGemma"
            },
            {
                id: "nomic-embed-text",
                name: "Nomic Embed Text"
            },
            {
                id: "bge-m3",
                name: "BGE M3"
            }
        ]
    },
    // Issue #6660: Mixedbread AI — OpenAI-compatible /v1/embeddings, free tier
    // available (API key via signup, no card required). Model ids are the
    // upstream-qualified "mixedbread-ai/<model>" form, mirroring how `together`/
    // `fireworks` register fully-qualified upstream model ids above.
    mixedbread: {
        id: "mixedbread",
        baseUrl: "https://api.mixedbread.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "mixedbread-ai/mxbai-embed-large-v1",
                name: "Mixedbread Embed Large v1",
                dimensions: 1024
            },
            {
                id: "mixedbread-ai/mxbai-embed-2d-large-v1",
                name: "Mixedbread Embed 2D Large v1",
                dimensions: 1024
            }
        ]
    }
};
const EMBEDDING_PROVIDER_ALIASES = {
    jina: "jina-ai",
    voyage: "voyage-ai"
};
function resolveEmbeddingProviderId(providerId) {
    return EMBEDDING_PROVIDER_ALIASES[providerId] || providerId;
}
function normalizeProviderScopedModelId(providerId, modelId) {
    const resolvedProvider = resolveEmbeddingProviderId(providerId);
    const provider = EMBEDDING_PROVIDERS[resolvedProvider];
    if (provider?.models.some((model)=>model.id === modelId)) return modelId;
    const providerScopedModelId = `${resolvedProvider}/${modelId}`;
    if (provider?.models.some((model)=>model.id === providerScopedModelId)) {
        return providerScopedModelId;
    }
    return modelId.startsWith(`${providerId}/`) ? modelId.slice(providerId.length + 1) : modelId;
}
function toProviderScopedModelId(providerId, modelId) {
    return modelId.startsWith(`${providerId}/`) ? modelId : `${providerId}/${modelId}`;
}
function getEmbeddingProvider(providerId) {
    return EMBEDDING_PROVIDERS[resolveEmbeddingProviderId(providerId)] || null;
}
function parseEmbeddingModel(modelStr, dynamicProviders) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    // Check for "provider/model" format
    const slashIdx = modelStr.indexOf("/");
    if (slashIdx > 0) {
        const rawProvider = modelStr.slice(0, slashIdx);
        const resolvedProvider = resolveEmbeddingProviderId(rawProvider);
        if (EMBEDDING_PROVIDERS[resolvedProvider]) {
            return {
                provider: resolvedProvider,
                model: normalizeProviderScopedModelId(resolvedProvider, modelStr.slice(slashIdx + 1))
            };
        }
        // Phase 1: Try each hardcoded provider prefix
        for (const [providerId] of Object.entries(EMBEDDING_PROVIDERS)){
            if (modelStr.startsWith(providerId + "/")) {
                return {
                    provider: providerId,
                    model: normalizeProviderScopedModelId(providerId, modelStr.slice(providerId.length + 1))
                };
            }
        }
        // Phase 2: Try dynamic provider_nodes prefix
        if (dynamicProviders) {
            for (const dp of dynamicProviders){
                if (modelStr.startsWith(dp.id + "/")) {
                    return {
                        provider: dp.id,
                        model: modelStr.slice(dp.id.length + 1)
                    };
                }
            }
        }
        // Phase 3: Fallback — first segment is provider
        const provider = modelStr.slice(0, slashIdx);
        const model = modelStr.slice(slashIdx + 1);
        return {
            provider,
            model
        };
    }
    // No provider prefix — search hardcoded providers for the model
    for (const [providerId, config] of Object.entries(EMBEDDING_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
function getEmbeddingDimension(modelStr) {
    const { provider, model } = parseEmbeddingModel(modelStr);
    if (!provider || !model) return undefined;
    const config = getEmbeddingProvider(provider);
    if (!config) return undefined;
    return config.models.find((m)=>m.id === model)?.dimensions;
}
function detectEmbeddingDimensionConflict(modelStrs) {
    const dimensions = {};
    for (const modelStr of modelStrs){
        const dim = getEmbeddingDimension(modelStr);
        if (typeof dim === "number") dimensions[modelStr] = dim;
    }
    const distinct = [
        ...new Set(Object.values(dimensions))
    ].sort((a, b)=>a - b);
    return {
        conflict: distinct.length > 1,
        dimensions,
        distinct
    };
}
function getEmbeddingModelDefaultParams(providerConfig, modelId) {
    if (!providerConfig || !modelId) return undefined;
    return providerConfig.models.find((m)=>m.id === modelId)?.defaultParams;
}
function getEmbeddingModelModalities(providerConfig, modelId) {
    if (!providerConfig || !modelId) return undefined;
    return providerConfig.models.find((model)=>model.id === modelId)?.modalities;
}
function getAllEmbeddingModels() {
    const models = [];
    for (const [providerId, config] of Object.entries(EMBEDDING_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: toProviderScopedModelId(providerId, model.id),
                name: model.name,
                provider: providerId,
                dimensions: model.dimensions
            });
        }
    }
    return models;
}
}),
"[project]/open-sse/config/ocrRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * OCR Provider Registry
 *
 * Defines providers that support the /v1/ocr endpoint.
 * Follows Mistral's OCR API format.
 */ __turbopack_context__.s([
    "OCR_PROVIDERS",
    ()=>OCR_PROVIDERS,
    "getAllOcrModels",
    ()=>getAllOcrModels,
    "getOcrProvider",
    ()=>getOcrProvider,
    "parseOcrModel",
    ()=>parseOcrModel
]);
const OCR_PROVIDERS = {
    mistral: {
        id: "mistral",
        baseUrl: "https://api.mistral.ai/v1/ocr",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "mistral-ocr-latest",
                name: "Mistral OCR"
            }
        ]
    }
};
function getOcrProvider(providerId) {
    return OCR_PROVIDERS[providerId] || null;
}
function parseOcrModel(modelStr) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    for (const providerId of Object.keys(OCR_PROVIDERS)){
        if (modelStr.startsWith(providerId + "/")) {
            return {
                provider: providerId,
                model: modelStr.slice(providerId.length + 1)
            };
        }
    }
    for (const [providerId, config] of Object.entries(OCR_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
function getAllOcrModels() {
    const models = [];
    for (const [providerId, config] of Object.entries(OCR_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: `${providerId}/${model.id}`,
                name: model.name,
                provider: providerId
            });
        }
    }
    return models;
}
}),
"[project]/open-sse/config/mediaServiceKinds.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MEDIA_KIND_REGISTRIES",
    ()=>MEDIA_KIND_REGISTRIES,
    "REGISTRY_MEDIA_KINDS",
    ()=>REGISTRY_MEDIA_KINDS,
    "getRegistryMediaKinds",
    ()=>getRegistryMediaKinds,
    "resolveProviderServiceKinds",
    ()=>resolveProviderServiceKinds
]);
/**
 * Media serviceKinds — derived from the backend registries.
 *
 * The dashboard's `/dashboard/media-providers/[kind]` pages list a provider
 * under a media kind when the provider supports it. Historically this relied on
 * a hand-maintained `serviceKinds` array on every provider in providers.ts,
 * which had drifted badly: ~48 providers were wired into the audio/video/music/
 * image/embedding registries (backend works) but declared no `serviceKinds`, so
 * they never appeared in the UI.
 *
 * This module makes the registries the single source of truth: a provider that
 * appears as a key in a media registry supports that kind, full stop. The UI
 * derives membership from here instead of duplicating it by hand, so adding a
 * provider to a registry automatically surfaces it — no second edit, no drift.
 *
 * Kinds without a backing registry (imageToText, webSearch, webFetch, llm) are
 * still declared explicitly via `serviceKinds` on the provider entry; callers
 * union the two sources.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/audioRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/videoRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/musicRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$ocrRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/ocrRegistry.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
const MEDIA_KIND_REGISTRIES = {
    stt: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUDIO_TRANSCRIPTION_PROVIDERS"],
    tts: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUDIO_SPEECH_PROVIDERS"],
    video: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VIDEO_PROVIDERS"],
    music: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MUSIC_PROVIDERS"],
    image: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IMAGE_PROVIDERS"],
    embedding: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EMBEDDING_PROVIDERS"],
    ocr: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$ocrRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OCR_PROVIDERS"]
};
const REGISTRY_MEDIA_KINDS = Object.freeze(Object.keys(MEDIA_KIND_REGISTRIES));
function getRegistryMediaKinds(providerId) {
    const kinds = [];
    for (const kind of REGISTRY_MEDIA_KINDS){
        if (Object.prototype.hasOwnProperty.call(MEDIA_KIND_REGISTRIES[kind], providerId)) {
            kinds.push(kind);
        }
    }
    return kinds;
}
function resolveProviderServiceKinds(providerId, declared) {
    const set = new Set(declared ?? []);
    for (const kind of getRegistryMediaKinds(providerId))set.add(kind);
    return [
        ...set
    ];
}
}),
"[project]/src/lib/providers/serviceKindIndex.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProviderServiceKinds",
    ()=>getProviderServiceKinds,
    "providerHasServiceKind",
    ()=>providerHasServiceKind
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$mediaServiceKinds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/mediaServiceKinds.ts [app-ssr] (ecmascript)");
;
/**
 * Full serviceKinds for a provider — the declared ones (llm, web*, imageToText)
 * unioned with the registry-derived media kinds (image / video / music / tts /
 * stt / embedding). This is the single client-side source of truth for the
 * `/dashboard/providers` category (serviceKind) filter (#4240).
 *
 * Client-safe: `mediaServiceKinds` only pulls in the pure-data media registries
 * (no server-only deps). Results are memoised per providerId+declared signature
 * because the filter calls this once per provider on every keystroke/render.
 */ const _cache = new Map();
function getProviderServiceKinds(providerId, declared) {
    const key = `${providerId} ${(declared ?? []).join(",")}`;
    const cached = _cache.get(key);
    if (cached) return cached;
    const kinds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$mediaServiceKinds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveProviderServiceKinds"])(providerId, declared ?? undefined);
    _cache.set(key, kinds);
    return kinds;
}
function providerHasServiceKind(providerId, declared, kind) {
    return getProviderServiceKinds(providerId, declared).includes(kind);
}
}),
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
"[project]/src/shared/utils/fetchTimeout.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FetchTimeoutError",
    ()=>FetchTimeoutError,
    "fetchWithTimeout",
    ()=>fetchWithTimeout,
    "getConfiguredTimeout",
    ()=>getConfiguredTimeout
]);
/**
 * Fetch Timeout — T-25
 *
 * Wraps fetch() with an AbortController-based timeout.
 * Default timeout is 120 seconds (FETCH_TIMEOUT_MS env var).
 *
 * @module shared/utils/fetchTimeout
 */ const DEFAULT_TIMEOUT_MS = parseInt(process.env.OMNIROUTE_DEFAULT_FETCH_TIMEOUT_MS || "", 10) || 120000; // 2 minutes
const FETCH_TIMEOUT_MS = parseInt(process.env.FETCH_TIMEOUT_MS || "", 10) || DEFAULT_TIMEOUT_MS;
async function fetchWithTimeout(url, options = {}) {
    const { timeoutMs = FETCH_TIMEOUT_MS, signal: externalSignal, fetchFn, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    // If an external signal was provided, wire it to abort our controller too
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", ()=>controller.abort(), {
                once: true
            });
        }
    }
    try {
        const doFetch = fetchFn || globalThis.fetch;
        const response = await doFetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        return response;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new FetchTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`, timeoutMs, String(url));
        }
        throw error;
    } finally{
        clearTimeout(timeoutId);
    }
}
class FetchTimeoutError extends Error {
    timeoutMs;
    url;
    constructor(message, timeoutMs, url){
        super(message);
        this.name = "FetchTimeoutError";
        this.timeoutMs = timeoutMs;
        this.url = url;
    }
}
function getConfiguredTimeout() {
    return FETCH_TIMEOUT_MS;
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/providerPageStorage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_DISPLAY_MODE_STORAGE_KEY",
    ()=>PROVIDER_DISPLAY_MODE_STORAGE_KEY,
    "SHOW_CONFIGURED_ONLY_STORAGE_KEY",
    ()=>SHOW_CONFIGURED_ONLY_STORAGE_KEY,
    "parseConfiguredOnlyPreference",
    ()=>parseConfiguredOnlyPreference,
    "parseProviderDisplayModePreference",
    ()=>parseProviderDisplayModePreference,
    "readConfiguredOnlyPreference",
    ()=>readConfiguredOnlyPreference,
    "readProviderDisplayModePreference",
    ()=>readProviderDisplayModePreference,
    "shouldSyncProviderDisplayMode",
    ()=>shouldSyncProviderDisplayMode,
    "writeConfiguredOnlyPreference",
    ()=>writeConfiguredOnlyPreference,
    "writeProviderDisplayModePreference",
    ()=>writeProviderDisplayModePreference
]);
const SHOW_CONFIGURED_ONLY_STORAGE_KEY = "omniroute-providers-show-configured-only";
const PROVIDER_DISPLAY_MODE_STORAGE_KEY = "omniroute-providers-display-mode";
function parseConfiguredOnlyPreference(value) {
    return value === "true";
}
function parseProviderDisplayModePreference(value) {
    if (value === "all" || value === "configured" || value === "compact") return value;
    return null;
}
function getBrowserStorage() {
    try {
        return globalThis.localStorage ?? null;
    } catch  {
        return null;
    }
}
function readConfiguredOnlyPreference(storage = getBrowserStorage()) {
    if (!storage) return false;
    return parseConfiguredOnlyPreference(storage.getItem(SHOW_CONFIGURED_ONLY_STORAGE_KEY));
}
function writeConfiguredOnlyPreference(enabled, storage = getBrowserStorage()) {
    if (!storage) return;
    if (enabled) {
        storage.setItem(SHOW_CONFIGURED_ONLY_STORAGE_KEY, "true");
        return;
    }
    storage.removeItem(SHOW_CONFIGURED_ONLY_STORAGE_KEY);
}
function readProviderDisplayModePreference(storage = getBrowserStorage()) {
    if (!storage) return "all";
    const storedMode = parseProviderDisplayModePreference(storage.getItem(PROVIDER_DISPLAY_MODE_STORAGE_KEY));
    if (storedMode) return storedMode;
    if (!readConfiguredOnlyPreference(storage)) return "all";
    storage.setItem?.(PROVIDER_DISPLAY_MODE_STORAGE_KEY, "configured");
    storage.removeItem?.(SHOW_CONFIGURED_ONLY_STORAGE_KEY);
    return "configured";
}
function writeProviderDisplayModePreference(mode, storage = getBrowserStorage()) {
    if (!storage) return;
    storage.removeItem(SHOW_CONFIGURED_ONLY_STORAGE_KEY);
    if (mode === "all") {
        storage.removeItem(PROVIDER_DISPLAY_MODE_STORAGE_KEY);
        return;
    }
    storage.setItem(PROVIDER_DISPLAY_MODE_STORAGE_KEY, mode);
}
function shouldSyncProviderDisplayMode(ready, loading) {
    return ready && !loading;
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/featuredProviders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * "Featured" provider pinning + brand accent — presentation-only concern for the
 * providers dashboard grid.
 *
 * Powers the Open Source Friend highlights: Kimi (Moonshot AI, rank 1) and
 * Cheaper Inference (rank 2). Ranked providers are pinned — in rank order —
 * within whichever category/group they render in on `/dashboard/providers`, and
 * their `ProviderCard` renders a brand accent + supporter badge.
 *
 * Scope guard: this is a UI ordering/branding concern ONLY. It must never be
 * imported by routing/fallback code (`open-sse/config/providerRegistry.ts`,
 * `open-sse/config/providers/*`) — the order defined here has zero effect on
 * combo routing, Auto-Combo scoring, or fallback/account selection. See
 * `providerPageUtils.ts::sortProviderEntriesFeaturedFirst`, the sole consumer
 * of `FEATURED_PROVIDER_IDS`, and `ProviderCard.tsx`, the sole consumer of
 * `KIMI_BRAND_COLOR`/`isKimiPartnerProviderId`.
 */ /**
 * Official Kimi (Moonshot AI) brand blue — matches the Kimi app icon
 * (#1783FF on white). Card accent classes in `ProviderCard.tsx` use this exact
 * hex as Tailwind arbitrary values (Tailwind's JIT scanner requires a static
 * literal in the className string, so it cannot reference this constant
 * directly) — keep them in sync with this value if it ever changes.
 */ __turbopack_context__.s([
    "CHEAPERINFERENCE_BRAND_COLOR",
    ()=>CHEAPERINFERENCE_BRAND_COLOR,
    "FEATURED_PROVIDER_IDS",
    ()=>FEATURED_PROVIDER_IDS,
    "KIMI_BRAND_COLOR",
    ()=>KIMI_BRAND_COLOR,
    "SPONSOR_BRAND_COLORS",
    ()=>SPONSOR_BRAND_COLORS,
    "getFeaturedProviderRank",
    ()=>getFeaturedProviderRank,
    "isCheaperInferenceProviderId",
    ()=>isCheaperInferenceProviderId,
    "isFeaturedProviderId",
    ()=>isFeaturedProviderId,
    "isKimiPartnerProviderId",
    ()=>isKimiPartnerProviderId,
    "isSponsorProviderId",
    ()=>isSponsorProviderId
]);
const KIMI_BRAND_COLOR = "#1783FF";
const CHEAPERINFERENCE_BRAND_COLOR = "#31f889";
/**
 * Every Kimi/Moonshot dashboard-catalog provider id (`src/shared/constants/providers/`),
 * including the two `hiddenFromDashboard` aliases that never render their own
 * card today — kept here so the set stays correct if that ever changes.
 *
 *  - "kimi"               legacy Moonshot API alias — apikey category, hiddenFromDashboard
 *  - "kimi-coding"        Kimi Code CLI — oauth category (visible card)
 *  - "kimi-coding-apikey" Kimi Code API Key — apikey category, hiddenFromDashboard
 *                         (its connections fold into the kimi-coding card, see
 *                         PROVIDER_CONNECTION_ALIASES in providerPageUtils.ts)
 *  - "kimi-web"           Kimi Web — web-cookie category (visible card)
 *  - "moonshot"           Moonshot AI — apikey category (visible card)
 */ const KIMI_PROVIDER_IDS = [
    "kimi",
    "kimi-coding",
    "kimi-coding-apikey",
    "kimi-web",
    "moonshot"
];
/** Cheaper Inference (api.cheaperinference.com) — apikey category, single id. */ const CHEAPERINFERENCE_PROVIDER_IDS = [
    "cheaperinference"
];
/**
 * Explicit sponsor ordering for the dashboard provider grids.
 *
 * A plain Set is NOT enough: `sortProviderEntriesFeaturedFirst` pins featured
 * entries while preserving alphabetical order among them, and "Cheaper Inference"
 * sorts before "Kimi". The operator requires Kimi 1st and Cheaper Inference 2nd
 * (2026-07-31), so rank is stated here rather than derived from the display name.
 * Lower number = higher on the page; equal ranks fall back to alphabetical.
 *
 * Scope guard (see file header): presentation only — never import this from
 * routing/fallback code.
 */ const FEATURED_PROVIDER_RANKS = new Map([
    ...KIMI_PROVIDER_IDS.map((id)=>[
            id,
            1
        ]),
    ...CHEAPERINFERENCE_PROVIDER_IDS.map((id)=>[
            id,
            2
        ])
]);
const SPONSOR_BRAND_COLORS = Object.freeze({
    ...Object.fromEntries(KIMI_PROVIDER_IDS.map((id)=>[
            id,
            KIMI_BRAND_COLOR
        ])),
    ...Object.fromEntries(CHEAPERINFERENCE_PROVIDER_IDS.map((id)=>[
            id,
            CHEAPERINFERENCE_BRAND_COLOR
        ]))
});
function getFeaturedProviderRank(providerId) {
    if (typeof providerId !== "string") return null;
    return FEATURED_PROVIDER_RANKS.get(providerId) ?? null;
}
const FEATURED_PROVIDER_IDS = new Set(FEATURED_PROVIDER_RANKS.keys());
function isFeaturedProviderId(providerId) {
    return getFeaturedProviderRank(providerId) !== null;
}
function isKimiPartnerProviderId(providerId) {
    return typeof providerId === "string" && KIMI_PROVIDER_IDS.includes(providerId);
}
function isCheaperInferenceProviderId(providerId) {
    return typeof providerId === "string" && CHEAPERINFERENCE_PROVIDER_IDS.includes(providerId);
}
function isSponsorProviderId(providerId) {
    return isFeaturedProviderId(providerId);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/providerPageUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildCompactProviderEntries",
    ()=>buildCompactProviderEntries,
    "buildCompatibleProviderGroups",
    ()=>buildCompatibleProviderGroups,
    "buildMergedOAuthProviderEntries",
    ()=>buildMergedOAuthProviderEntries,
    "buildProviderEntries",
    ()=>buildProviderEntries,
    "buildStaticProviderEntries",
    ()=>buildStaticProviderEntries,
    "connectionBelongsToProviderPage",
    ()=>connectionBelongsToProviderPage,
    "connectionMatchesProviderCard",
    ()=>connectionMatchesProviderCard,
    "filterConfiguredProviderEntries",
    ()=>filterConfiguredProviderEntries,
    "getProviderConnectionsRequestUrl",
    ()=>getProviderConnectionsRequestUrl,
    "loadProviderPageData",
    ()=>loadProviderPageData,
    "readProviderFiltersFromUrl",
    ()=>readProviderFiltersFromUrl,
    "resolveDashboardProviderInfo",
    ()=>resolveDashboardProviderInfo,
    "shouldApplyConfiguredOnlyFilter",
    ()=>shouldApplyConfiguredOnlyFilter,
    "shouldFilterProviderEntriesForDisplayMode",
    ()=>shouldFilterProviderEntriesForDisplayMode,
    "shouldShowFirstProviderHint",
    ()=>shouldShowFirstProviderHint,
    "shouldShowProviderSection",
    ()=>shouldShowProviderSection,
    "sortProviderEntriesByName",
    ()=>sortProviderEntriesByName,
    "sortProviderEntriesFeaturedFirst",
    ()=>sortProviderEntriesFeaturedFirst,
    "syncProviderFiltersToUrl",
    ()=>syncProviderFiltersToUrl,
    "syncSearchToUrl",
    ()=>syncSearchToUrl,
    "upsertProviderNodeById",
    ()=>upsertProviderNodeById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/catalog.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/models.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$serviceKindIndex$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/serviceKindIndex.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchTimeout.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageStorage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/featuredProviders.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function shouldApplyConfiguredOnlyFilter(showConfiguredOnly, connectionCount) {
    return showConfiguredOnly && connectionCount > 0;
}
function shouldFilterProviderEntriesForDisplayMode(displayMode, connectionCount) {
    if (displayMode === "compact") return true;
    return shouldApplyConfiguredOnlyFilter(displayMode === "configured", connectionCount);
}
function shouldShowFirstProviderHint(connectionCount, searchQuery) {
    return connectionCount === 0 && !searchQuery?.trim();
}
function syncSearchToUrl(searchQuery) {
    syncProviderFiltersToUrl({
        searchQuery
    });
}
/** All dashboard summary-chip category keys that are valid in `?cat=`. */ const PROVIDER_CATEGORY_URL_VALUES = new Set([
    "oauth",
    "ide",
    "free",
    "no-auth",
    "upstream-proxy",
    "apikey",
    "compatible",
    "webcookie",
    "search",
    "webfetch",
    "audio",
    "local",
    "cloudagent"
]);
/** Media/service-kind chip keys that are valid in `?media=`. */ const PROVIDER_SERVICE_KIND_URL_VALUES = new Set([
    "image",
    "video",
    "music",
    "tts",
    "stt",
    "embedding"
]);
function syncProviderFiltersToUrl(state) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const url = undefined;
    const params = undefined;
    let changed;
    const setOrRemove = undefined;
}
function readProviderFiltersFromUrl(params) {
    const state = {};
    const search = params.get("search");
    if (search) state.searchQuery = search;
    const model = params.get("model");
    if (model) state.modelSearchQuery = model;
    const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseProviderDisplayModePreference"])(params.get("mode"));
    if (mode) state.displayMode = mode;
    const category = params.get("cat");
    if (category && PROVIDER_CATEGORY_URL_VALUES.has(category)) {
        if (category === "free") {
            state.showFreeOnly = true;
            state.category = null;
        } else {
            state.showFreeOnly = false;
            state.category = category;
        }
    }
    const media = params.get("media");
    if (media && PROVIDER_SERVICE_KIND_URL_VALUES.has(media)) {
        state.mediaKind = media;
    }
    return state;
}
function shouldShowProviderSection(category, activeCategory, showFreeOnly) {
    if (showFreeOnly) return category === "free";
    if (activeCategory) return activeCategory === category;
    // Free and Web Fetch are cross-cutting views assembled from providers that
    // already belong to a primary section. Rendering them in the default view
    // duplicates cards; they remain available through their summary filters.
    return category !== "free" && category !== "webfetch";
}
const OAUTH_CARD_API_KEY_CONNECTION_PROVIDER_IDS = new Set([
    "kiro",
    "amazon-q",
    "kimi-coding"
]);
const PROVIDER_CONNECTION_ALIASES = {
    alibaba: [
        "alibaba-cn"
    ],
    "kimi-coding": [
        "kimi-coding-apikey"
    ]
};
function getProviderConnectionsRequestUrl(providerId) {
    const hasAliases = (PROVIDER_CONNECTION_ALIASES[providerId]?.length ?? 0) > 0;
    return hasAliases ? "/api/providers" : `/api/providers?provider=${encodeURIComponent(providerId)}`;
}
function connectionBelongsToProviderPage(connectionProvider, providerId) {
    if (!connectionProvider) return false;
    if (connectionProvider === providerId) return true;
    return PROVIDER_CONNECTION_ALIASES[providerId]?.includes(connectionProvider) === true;
}
function connectionMatchesProviderCard(conn, providerId, cardAuthType) {
    if (!conn || !connectionBelongsToProviderPage(conn.provider, providerId)) return false;
    if (cardAuthType === "free") return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsApiKeyOnFreeProvider"])(providerId) || OAUTH_CARD_API_KEY_CONNECTION_PROVIDER_IDS.has(providerId)) {
        return conn.authType === "oauth" || conn.authType === "apikey" || conn.authType === "api_key";
    }
    return conn.authType === cardAuthType;
}
function getProviderSortLabel(entry) {
    const provider = entry.provider;
    const name = typeof provider.name === "string" ? provider.name : "";
    return (name || entry.providerId).toLowerCase();
}
function sortProviderEntriesByName(entries) {
    return [
        ...entries
    ].sort((a, b)=>{
        const nameCompare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compareTr"])(getProviderSortLabel(a), getProviderSortLabel(b));
        if (nameCompare !== 0) return nameCompare;
        return a.providerId.localeCompare(b.providerId); // teknik sıralama: ASCII kasıtlı
    });
}
function sortProviderEntriesFeaturedFirst(entries) {
    const sorted = sortProviderEntriesByName(entries);
    // A plain "featured first" pin would order Cheaper Inference above Kimi (the
    // alphabet), which is exactly what the explicit ranks prevent.
    const ranked = [];
    const rest = [];
    for (const entry of sorted){
        ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeaturedProviderRank"])(entry.providerId) === null ? rest : ranked).push(entry);
    }
    // Array.prototype.sort is stable in ES2019+, so equal-rank entries keep the
    // alphabetical order established above.
    ranked.sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeaturedProviderRank"])(a.providerId) - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFeaturedProviderRank"])(b.providerId));
    return [
        ...ranked,
        ...rest
    ];
}
function buildProviderEntries(providers, displayAuthType, toggleAuthType, getProviderStats) {
    return Object.entries(providers).filter(([, provider])=>!provider.hiddenFromDashboard).map(([providerId, provider])=>({
            providerId,
            provider,
            stats: getProviderStats(providerId, toggleAuthType),
            displayAuthType,
            toggleAuthType
        }));
}
function buildMergedOAuthProviderEntries(oauthProviders, freeProviders, getProviderStats) {
    return [
        ...buildProviderEntries(oauthProviders, "oauth", "oauth", getProviderStats),
        ...buildProviderEntries(freeProviders, "oauth", "free", getProviderStats)
    ];
}
function buildStaticProviderEntries(category, getProviderStats) {
    const group = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStaticProviderCatalogGroup"])(category);
    return buildProviderEntries(group.providers, group.displayAuthType, group.toggleAuthType, getProviderStats);
}
function buildCompatibleProviderGroups(providerNodes, labels) {
    const openai = [];
    const anthropic = [];
    const claudeCode = [];
    for (const node of providerNodes){
        if (node.type === "openai-compatible") {
            openai.push({
                id: node.id,
                name: node.name || labels.openaiCompatibleName,
                color: "#10A37F",
                textIcon: "OC",
                apiType: node.apiType,
                iconUrl: node.iconUrl || undefined
            });
            continue;
        }
        if (node.type !== "anthropic-compatible") continue;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(node.id)) {
            claudeCode.push({
                id: node.id,
                name: node.name || labels.claudeCodeCompatibleName,
                color: "#B45309",
                textIcon: "CC",
                iconUrl: node.iconUrl || undefined
            });
            continue;
        }
        anthropic.push({
            id: node.id,
            name: node.name || labels.anthropicCompatibleName,
            color: "#D97757",
            textIcon: "AC",
            iconUrl: node.iconUrl || undefined
        });
    }
    return {
        openai,
        anthropic,
        claudeCode
    };
}
/**
 * Models to match against for the model-name filter: the static curated
 * registry PLUS any live/synced catalog for that provider connection (#7250).
 * Aggregator providers (openrouter, kilocode, theoldllm...) declare a
 * single-entry static placeholder — matching only that entry means a search
 * for any real upstream model name can never match, silently hiding the
 * provider. When the live catalog is empty/unavailable we fall back to the
 * static-only list so already-correct static providers are unaffected.
 */ function getFilterableModelsForEntry(providerId, liveModelsByProviderId) {
    const staticModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getModelsByProviderId"])(providerId);
    const liveModels = liveModelsByProviderId?.[providerId];
    if (!liveModels || liveModels.length === 0) return staticModels;
    return [
        ...staticModels,
        ...liveModels
    ];
}
function filterConfiguredProviderEntries(entries, showConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, serviceKindFilter, liveModelsByProviderId) {
    let filtered = entries;
    // #4240: category (serviceKind) filter — keep providers whose declared OR
    // registry-derived serviceKinds include the selected kind. Composes with the
    // configured-only / free / search predicates below.
    if (serviceKindFilter) {
        filtered = filtered.filter((entry)=>{
            const declared = entry.provider.serviceKinds;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$serviceKindIndex$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["providerHasServiceKind"])(entry.providerId, declared, serviceKindFilter);
        });
    }
    if (showConfiguredOnly) {
        // no-auth providers never create a DB connection row (stats.total === 0) but
        // are always usable and appear unconditionally in the /v1/models catalog, so
        // they must not be hidden by the configured-only filter (#3290).
        filtered = filtered.filter((entry)=>entry.displayAuthType === "no-auth" || Number(entry.stats?.total || 0) > 0);
    }
    if (showFreeOnly) {
        filtered = filtered.filter((entry)=>{
            const provider = entry.provider;
            return provider.hasFree === true;
        });
    }
    if (searchQuery && searchQuery.trim()) {
        filtered = filtered.filter((entry)=>{
            const provider = entry.provider;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesAnyToken"])(String(provider.name || ""), searchQuery) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesAnyToken"])(entry.providerId, searchQuery);
        });
    }
    if (modelSearchQuery && modelSearchQuery.trim()) {
        const q = modelSearchQuery.trim();
        filtered = filtered.filter((entry)=>{
            const models = getFilterableModelsForEntry(entry.providerId, liveModelsByProviderId);
            return models.some((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(m.id, q) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matchesSearch"])(m.name || "", q));
        });
    }
    return sortProviderEntriesFeaturedFirst(filtered);
}
function pushUniqueProviderEntry(entries, seenProviderIds, entry) {
    if (seenProviderIds.has(entry.providerId)) return;
    seenProviderIds.add(entry.providerId);
    entries.push(entry);
}
function buildCompactProviderEntries(groups, options = {}) {
    const seenProviderIds = new Set();
    const visibleEntries = [];
    const deferredNoAuthEntries = [];
    const seenDeferredNoAuthProviderIds = new Set();
    for (const group of groups){
        for (const entry of group){
            if (options.deferNoAuth && entry.displayAuthType === "no-auth") {
                pushUniqueProviderEntry(deferredNoAuthEntries, seenDeferredNoAuthProviderIds, entry);
                continue;
            }
            pushUniqueProviderEntry(visibleEntries, seenProviderIds, entry);
        }
    }
    for (const entry of deferredNoAuthEntries){
        pushUniqueProviderEntry(visibleEntries, seenProviderIds, entry);
    }
    return visibleEntries;
}
function resolveDashboardProviderInfo(providerId, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveProviderCatalogEntry"])(providerId, options);
}
function upsertProviderNodeById(prev, node) {
    if (!node || node.id == null) return [
        ...prev,
        node
    ];
    const idx = prev.findIndex((p)=>p?.id === node.id);
    if (idx === -1) return [
        ...prev,
        node
    ];
    if (JSON.stringify(prev[idx]) === JSON.stringify(node)) return prev;
    const next = prev.slice();
    next[idx] = node;
    return next;
}
// Bound each first-paint request so a single stalled connection cannot freeze
// the page on its skeleton. 20s is generous for a loopback dashboard API while
// still guaranteeing the skeleton clears in bounded time.
const PROVIDER_PAGE_FETCH_TIMEOUT_MS = 20_000;
async function loadProviderPageData(fetchImpl = globalThis.fetch, timeoutMs = PROVIDER_PAGE_FETCH_TIMEOUT_MS) {
    const safeJson = async (url, init)=>{
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchWithTimeout"])(url, {
                ...init,
                timeoutMs,
                fetchFn: fetchImpl
            });
            if (!res.ok) return null;
            return await res.json();
        } catch  {
            // Timeout/abort/network error → degrade to the default; never hang.
            return null;
        }
    };
    const [connectionsData, nodesData, expirationsData, settingsData, openRouterStatsData] = await Promise.all([
        safeJson("/api/providers"),
        safeJson("/api/provider-nodes"),
        safeJson("/api/providers/expiration"),
        safeJson("/api/settings", {
            cache: "no-store"
        }),
        safeJson("/api/providers/openrouter-stats")
    ]);
    return {
        connections: Array.isArray(connectionsData?.connections) ? connectionsData.connections : [],
        providerNodes: Array.isArray(nodesData?.nodes) ? nodesData.nodes : [],
        ccCompatibleProviderEnabled: nodesData?.ccCompatibleProviderEnabled === true,
        expirations: expirationsData ?? null,
        blockedProviders: Array.isArray(settingsData?.blockedProviders) ? settingsData.blockedProviders : null,
        settings: settingsData ?? null,
        openRouterProviderStats: Array.isArray(openRouterStatsData?.data) ? openRouterStatsData.data : []
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/hooks/useProviderUrlFilters.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "useProviderUrlFilters",
    ()=>useProviderUrlFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageStorage.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
function useProviderUrlFilters({ searchParams, providerDisplayMode, setProviderDisplayMode, searchQuery, setSearchQuery, modelSearchQuery, setModelSearchQuery, activeCategory, setActiveCategory, showFreeOnly, setShowFreeOnly, activeServiceKind, setActiveServiceKind }) {
    const [displayModePreferenceReady, setDisplayModePreferenceReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filtersHydrated, setFiltersHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const urlMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readProviderFiltersFromUrl"])(searchParams).displayMode;
        setProviderDisplayMode(urlMode ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readProviderDisplayModePreference"])());
        setDisplayModePreferenceReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const urlFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readProviderFiltersFromUrl"])(searchParams);
        setSearchQuery(urlFilters.searchQuery ?? "");
        setModelSearchQuery(urlFilters.modelSearchQuery ?? "");
        setActiveCategory(urlFilters.category ?? null);
        setShowFreeOnly(urlFilters.showFreeOnly ?? false);
        setActiveServiceKind(urlFilters.mediaKind ?? null);
        setFiltersHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!filtersHydrated || !displayModePreferenceReady) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncProviderFiltersToUrl"])({
            searchQuery,
            modelSearchQuery,
            displayMode: providerDisplayMode,
            category: activeCategory,
            showFreeOnly,
            mediaKind: activeServiceKind
        });
    }, [
        filtersHydrated,
        displayModePreferenceReady,
        searchQuery,
        modelSearchQuery,
        providerDisplayMode,
        activeCategory,
        showFreeOnly,
        activeServiceKind
    ]);
    return {
        displayModePreferenceReady
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/context/openRouterProviderStatsContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpenRouterProviderStatsProvider",
    ()=>OpenRouterProviderStatsProvider,
    "useOpenRouterProviderStat",
    ()=>useOpenRouterProviderStat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
/**
 * Makes OpenRouter provider popularity/identity enrichment available to every
 * ProviderCard without prop-drilling it through the ~15 render sites in
 * page.tsx (one per auth-type section). Looked up by provider slug — cards
 * for providers OpenRouter doesn't know about simply get `undefined`.
 */ const EMPTY_STATS_MAP = new Map();
const Context = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(EMPTY_STATS_MAP);
function OpenRouterProviderStatsProvider({ entries, children }) {
    const bySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Map(entries.map((entry)=>[
                entry.slug,
                entry
            ])), [
        entries
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Context.Provider, {
        value: bySlug,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/context/openRouterProviderStatsContext.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
function useOpenRouterProviderStat(providerId) {
    const bySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(Context);
    return providerId ? bySlug.get(providerId) : undefined;
}
}),
"[project]/src/domain/tagRouter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionRoutingTags",
    ()=>getConnectionRoutingTags,
    "matchesRoutingTags",
    ()=>matchesRoutingTags,
    "normalizeRoutingTagMatchMode",
    ()=>normalizeRoutingTagMatchMode,
    "normalizeRoutingTags",
    ()=>normalizeRoutingTags,
    "resolveRequestRoutingTags",
    ()=>resolveRequestRoutingTags
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeSingleRoutingTag(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function normalizeRoutingTags(value) {
    const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const deduped = new Set();
    for (const rawValue of rawValues){
        const normalized = normalizeSingleRoutingTag(rawValue);
        if (normalized) deduped.add(normalized);
    }
    return Array.from(deduped);
}
function normalizeRoutingTagMatchMode(value) {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : typeof value === "number" ? "" : "";
    return normalized === "all" ? "all" : "any";
}
function getConnectionRoutingTags(providerSpecificData) {
    return normalizeRoutingTags(asRecord(providerSpecificData).tags);
}
function matchesRoutingTags(connectionTags, requestTags, matchMode = "any") {
    if (requestTags.length === 0) return true;
    if (connectionTags.length === 0) return false;
    const tagSet = new Set(connectionTags);
    if (matchMode === "all") {
        return requestTags.every((tag)=>tagSet.has(tag));
    }
    return requestTags.some((tag)=>tagSet.has(tag));
}
function resolveRequestRoutingTags(body) {
    const metadata = asRecord(body?.metadata);
    return {
        tags: normalizeRoutingTags(metadata.tags),
        matchMode: normalizeRoutingTagMatchMode(metadata.tag_match_mode ?? metadata.tagMatchMode)
    };
}
}),
"[project]/src/shared/constants/openRouterPreset.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPENROUTER_PRESET_MAX_LENGTH",
    ()=>OPENROUTER_PRESET_MAX_LENGTH,
    "isOpenRouterPresetValue",
    ()=>isOpenRouterPresetValue,
    "normalizeOpenRouterPreset",
    ()=>normalizeOpenRouterPreset
]);
const OPENROUTER_PRESET_MAX_LENGTH = 200;
function isOpenRouterPresetValue(value) {
    return typeof value === "string" && value.trim().length <= OPENROUTER_PRESET_MAX_LENGTH;
}
function normalizeOpenRouterPreset(value) {
    if (!isOpenRouterPresetValue(value)) return undefined;
    const normalized = value.trim();
    return normalized || undefined;
}
}),
"[project]/src/shared/constants/upstreamHeaders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isForbiddenCustomHeaderName",
    ()=>isForbiddenCustomHeaderName,
    "isForbiddenUpstreamHeaderName",
    ()=>isForbiddenUpstreamHeaderName
]);
/**
 * User-supplied upstream extra headers: names we never forward (Host / hop-by-hop / framing).
 * Changing this list requires syncing: `sanitizeUpstreamHeadersMap` (models.ts), Zod
 * `upstreamHeaderNameSchema` / record refine (schemas.ts), and `upstream-headers-sanitize` tests.
 */ const FORBIDDEN = new Set([
    "host",
    "connection",
    "content-length",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "te",
    "trailer",
    "upgrade"
].map((s)=>s.toLowerCase()));
function isForbiddenUpstreamHeaderName(name) {
    return FORBIDDEN.has(String(name).trim().toLowerCase());
}
/**
 * Auth headers that must come from the connection's credentials, never from
 * operator-set per-provider custom headers. Kept here as the single source of
 * truth so the Zod `customHeadersSchema` (schemas.ts) and the executor's
 * apply-loop (open-sse/executors/default.ts) cannot drift apart.
 */ const FORBIDDEN_AUTH = new Set([
    "authorization",
    "x-api-key",
    "x-goog-api-key",
    "api-key",
    "cookie"
].map((s)=>s.toLowerCase()));
function isForbiddenCustomHeaderName(name) {
    const n = String(name).trim().toLowerCase();
    return isForbiddenUpstreamHeaderName(n) || FORBIDDEN_AUTH.has(n);
}
}),
"[project]/src/lib/providers/requestDefaults.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_REASONING_EFFORT_VALUES",
    ()=>CODEX_REASONING_EFFORT_VALUES,
    "buildOpenAIStoreSessionId",
    ()=>buildOpenAIStoreSessionId,
    "ensureOpenAIStoreSessionFallback",
    ()=>ensureOpenAIStoreSessionFallback,
    "getClaudeCodeCompatibleRequestDefaults",
    ()=>getClaudeCodeCompatibleRequestDefaults,
    "getCodexRequestDefaults",
    ()=>getCodexRequestDefaults,
    "getProviderRequestDefaults",
    ()=>getProviderRequestDefaults,
    "isOpenAIResponsesStoreEnabled",
    ()=>isOpenAIResponsesStoreEnabled,
    "normalizeCacheOverride",
    ()=>normalizeCacheOverride,
    "normalizeClaudeCodeCompatibleContext1m",
    ()=>normalizeClaudeCodeCompatibleContext1m,
    "normalizeClaudeCodeCompatibleRedactThinking",
    ()=>normalizeClaudeCodeCompatibleRedactThinking,
    "normalizeClaudeCodeCompatibleSummarizeThinking",
    ()=>normalizeClaudeCodeCompatibleSummarizeThinking,
    "normalizeCodexReasoningEffort",
    ()=>normalizeCodexReasoningEffort,
    "normalizeCodexServiceTier",
    ()=>normalizeCodexServiceTier,
    "normalizeProviderSpecificData",
    ()=>normalizeProviderSpecificData,
    "normalizeRequestDefaults",
    ()=>normalizeRequestDefaults,
    "sanitizeProviderSpecificDataForResponse",
    ()=>sanitizeProviderSpecificDataForResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-ssr] (ecmascript)");
const CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX = "anthropic-compatible-cc-";
;
;
;
;
const CODEX_REASONING_EFFORT_VALUES = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
const CODEX_REASONING_EFFORT_SET = new Set(CODEX_REASONING_EFFORT_VALUES);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeString(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
}
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeAwsRegion(value) {
    const normalized = normalizeString(value);
    if (!normalized || !BEDROCK_REGION_PATTERN.test(normalized)) return undefined;
    return normalized;
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX);
}
function normalizeCodexReasoningEffort(value) {
    const normalized = normalizeString(value);
    if (!normalized || !CODEX_REASONING_EFFORT_SET.has(normalized)) {
        return undefined;
    }
    return normalized;
}
function normalizeCodexServiceTier(value) {
    const normalized = normalizeString(value);
    if (!normalized) return undefined;
    if (normalized === "fast" || normalized === "priority") return "priority";
    if (normalized === "default" || normalized === "flex") return normalized;
    return undefined;
}
function normalizeClaudeCodeCompatibleContext1m(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleRedactThinking(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleSummarizeThinking(value) {
    return value === true ? true : undefined;
}
function normalizeRequestDefaults(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    if (provider === "codex") {
        const reasoningEffort = normalizeCodexReasoningEffort(record.reasoningEffort);
        if (reasoningEffort) {
            normalized.reasoningEffort = reasoningEffort;
        } else {
            delete normalized.reasoningEffort;
        }
        const serviceTier = normalizeCodexServiceTier(record.serviceTier);
        if (serviceTier) {
            normalized.serviceTier = serviceTier;
        } else {
            delete normalized.serviceTier;
        }
    }
    if (isClaudeCodeCompatibleProvider(provider)) {
        const context1m = normalizeClaudeCodeCompatibleContext1m(record.context1m);
        if (context1m) {
            normalized.context1m = true;
        } else {
            delete normalized.context1m;
        }
        const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(record.redactThinking);
        if (redactThinking) {
            normalized.redactThinking = true;
        } else {
            delete normalized.redactThinking;
        }
        const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(record.summarizeThinking);
        if (summarizeThinking) {
            normalized.summarizeThinking = true;
        } else {
            delete normalized.summarizeThinking;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
const CACHE_PASSTHROUGH_VALUES = new Set([
    "strip",
    "openai-format",
    "claude-format"
]);
function normalizeCacheOverride(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        normalized.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (typeof record.cacheControlPassthrough === "string" && CACHE_PASSTHROUGH_VALUES.has(record.cacheControlPassthrough)) {
        normalized.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
// #6880 — extracted so normalizeProviderSpecificData() stays under the
// max-lines-per-function gate: normalizes the two nested-object sub-fields
// (requestDefaults, cache) in one pass.
function normalizeNestedSubObjects(provider, normalized) {
    if ("requestDefaults" in normalized) {
        const requestDefaults = normalizeRequestDefaults(provider, normalized.requestDefaults);
        if (requestDefaults) {
            normalized.requestDefaults = requestDefaults;
        } else {
            delete normalized.requestDefaults;
        }
    }
    if ("cache" in normalized) {
        const cache = normalizeCacheOverride(normalized.cache);
        if (cache) {
            normalized.cache = cache;
        } else {
            delete normalized.cache;
        }
    }
}
function normalizeProviderSpecificData(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    normalizeNestedSubObjects(provider, normalized);
    if ("openaiStoreEnabled" in normalized && typeof normalized.openaiStoreEnabled !== "boolean") {
        delete normalized.openaiStoreEnabled;
    }
    if ("blockExtraUsage" in normalized && typeof normalized.blockExtraUsage !== "boolean") {
        delete normalized.blockExtraUsage;
    }
    // #2997: per-connection transient-cooldown opt-out — only persist a real boolean.
    if ("disableCooling" in normalized && typeof normalized.disableCooling !== "boolean") {
        delete normalized.disableCooling;
    }
    if ("autoFetchModels" in normalized && typeof normalized.autoFetchModels !== "boolean") {
        delete normalized.autoFetchModels;
    }
    if ("preset" in normalized) {
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
        if (preset) {
            normalized.preset = preset;
        } else {
            delete normalized.preset;
        }
    }
    if (provider === "bedrock" && "region" in normalized) {
        const region = normalizeAwsRegion(normalized.region);
        if (region) {
            normalized.region = region;
        } else {
            delete normalized.region;
        }
    }
    if ("tag" in normalized) {
        if (typeof normalized.tag === "string") {
            const trimmedTag = normalized.tag.trim();
            if (trimmedTag) {
                normalized.tag = trimmedTag;
            } else {
                delete normalized.tag;
            }
        } else {
            delete normalized.tag;
        }
    }
    if ("tags" in normalized) {
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
        if (excludedModels.length > 0) {
            normalized.excludedModels = excludedModels;
        } else {
            delete normalized.excludedModels;
        }
        delete normalized.excluded_models;
    }
    // #8369: connection-level custom upstream headers — sanitize each key against the
    // forbidden-header denylist and drop entries with non-string or empty values.
    if ("customHeaders" in normalized) {
        const raw = normalized.customHeaders;
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const cleaned = {};
            for (const [key, value] of Object.entries(raw)){
                const trimmedKey = key.trim();
                if (!trimmedKey) continue;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
                if (typeof value === "string" && value.trim().length > 0) {
                    cleaned[trimmedKey] = value.trim();
                }
            }
            if (Object.keys(cleaned).length > 0) {
                normalized.customHeaders = cleaned;
            } else {
                delete normalized.customHeaders;
            }
        } else {
            delete normalized.customHeaders;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
function sanitizeProviderSpecificDataForResponse(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const sanitized = {
        ...record
    };
    delete sanitized.consoleApiKey;
    delete sanitized.secretAccessKey;
    delete sanitized.awsSecretAccessKey;
    delete sanitized.sessionToken;
    delete sanitized.awsSessionToken;
    delete sanitized.openCodeGoAuthCookie;
    delete sanitized.opencodeGoAuthCookie;
    delete sanitized.authCookie;
    delete sanitized.ollamaUsageCookie;
    delete sanitized.ollamaCloudUsageCookie;
    delete sanitized.ollamaCloudCookie;
    delete sanitized.usageCookie;
    return sanitized;
}
function isOpenAIResponsesStoreEnabled(providerSpecificData) {
    return asRecord(providerSpecificData).openaiStoreEnabled === true;
}
function buildOpenAIStoreSessionId(sessionId) {
    if (!hasNonEmptyString(sessionId)) return undefined;
    const normalized = String(sessionId).trim().replace(/^ext:/i, "").replace(/[^a-zA-Z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
    if (!normalized) return undefined;
    return `omniroute-session-${normalized}`;
}
function ensureOpenAIStoreSessionFallback(body, sessionId) {
    const explicitSessionId = body.session_id;
    const explicitConversationId = body.conversation_id;
    const promptCacheKey = body.prompt_cache_key ?? body.promptCacheKey;
    if (hasNonEmptyString(explicitSessionId) || hasNonEmptyString(explicitConversationId) || hasNonEmptyString(promptCacheKey)) {
        return body;
    }
    const fallbackSessionId = buildOpenAIStoreSessionId(sessionId);
    if (!fallbackSessionId) return body;
    return {
        ...body,
        session_id: fallbackSessionId
    };
}
function getProviderRequestDefaults(provider, providerSpecificData) {
    return normalizeRequestDefaults(provider, asRecord(providerSpecificData).requestDefaults) || {};
}
function getCodexRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("codex", providerSpecificData);
    const reasoningEffort = normalizeCodexReasoningEffort(defaults.reasoningEffort);
    const serviceTier = normalizeCodexServiceTier(defaults.serviceTier);
    return {
        ...reasoningEffort ? {
            reasoningEffort
        } : {},
        ...serviceTier ? {
            serviceTier
        } : {}
    };
}
function getClaudeCodeCompatibleRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("anthropic-compatible-cc-default", providerSpecificData);
    const context1m = normalizeClaudeCodeCompatibleContext1m(defaults.context1m);
    const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(defaults.redactThinking);
    const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(defaults.summarizeThinking);
    return {
        ...context1m ? {
            context1m
        } : {},
        ...redactThinking ? {
            redactThinking
        } : {},
        ...summarizeThinking ? {
            summarizeThinking
        } : {}
    };
}
}),
"[project]/src/lib/providers/codexFastTier.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS",
    ()=>CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS,
    "applyCodexGlobalFastServiceTier",
    ()=>applyCodexGlobalFastServiceTier,
    "getCodexConnectionServiceTier",
    ()=>getCodexConnectionServiceTier,
    "getCodexEffectiveFastServiceTier",
    ()=>getCodexEffectiveFastServiceTier,
    "getCodexEffectiveServiceTier",
    ()=>getCodexEffectiveServiceTier,
    "getCodexGlobalServiceMode",
    ()=>getCodexGlobalServiceMode,
    "isCodexGlobalFastServiceTierEnabled",
    ()=>isCodexGlobalFastServiceTierEnabled,
    "resolveCodexGlobalFastServiceTier",
    ()=>resolveCodexGlobalFastServiceTier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-ssr] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
const CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS = [
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
    "gpt-5.5"
];
function resolveCodexGlobalFastServiceTier(settings) {
    const record = asRecord(settings);
    const raw = record.codexServiceTier;
    let enabled = false;
    let tier = "priority";
    let supportedModels = CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS;
    if (typeof raw === "boolean") {
        enabled = raw;
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const obj = raw;
        if (obj.enabled === true) enabled = true;
        if (typeof obj.tier === "string") {
            const t = obj.tier.trim().toLowerCase();
            if (t === "default" || t === "priority" || t === "flex") {
                tier = t;
            }
        }
        if (Array.isArray(obj.supportedModels)) {
            const list = obj.supportedModels.filter((m)=>typeof m === "string").map((m)=>m.trim()).filter((m)=>m.length > 0);
            if (list.length > 0) supportedModels = list;
        }
    } else if (record.codexFastServiceTier === true) {
        enabled = true;
    }
    return {
        enabled,
        tier,
        supportedModels
    };
}
function isCodexGlobalFastServiceTierEnabled(settings) {
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    return resolved.enabled && resolved.tier !== "default";
}
function getCodexGlobalServiceMode(settings) {
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    return resolved.enabled ? resolved.tier : "none";
}
function getCodexConnectionServiceTier(providerSpecificData) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCodexRequestDefaults"])(providerSpecificData).serviceTier ?? "default";
}
function getCodexEffectiveServiceTier(providerSpecificData, globalServiceMode) {
    // Dashboard global modes are explicit overrides; use "none" to preserve the
    // per-connection requestDefaults.serviceTier value.
    if (globalServiceMode === true) return "priority";
    if (globalServiceMode && globalServiceMode !== "none") {
        return globalServiceMode;
    }
    return getCodexConnectionServiceTier(providerSpecificData);
}
function getCodexEffectiveFastServiceTier(providerSpecificData, globalFastServiceTierEnabled) {
    return getCodexEffectiveServiceTier(providerSpecificData, globalFastServiceTierEnabled) !== "default";
}
function modelMatchesSupportedList(model, supportedModels) {
    if (typeof model !== "string" || model.length === 0) return false;
    const normalizedModel = model.trim().toLowerCase().split("/").pop() || "";
    if (!normalizedModel) return false;
    for (const supported of supportedModels){
        const candidate = supported.trim().toLowerCase();
        if (!candidate) continue;
        if (normalizedModel === candidate || normalizedModel.startsWith(candidate)) {
            return true;
        }
    }
    return false;
}
function applyCodexGlobalFastServiceTier(provider, credentials, settings, options = {}) {
    if (provider !== "codex") return credentials;
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    if (!resolved.enabled) return credentials;
    // Per-model gate for paid fast/flex modes. A global "default" mode intentionally
    // disables account-level overrides for every Codex model.
    if (resolved.tier !== "default" && options.model !== undefined) {
        if (!modelMatchesSupportedList(options.model, resolved.supportedModels)) {
            return credentials;
        }
    }
    if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)) {
        return credentials;
    }
    const providerSpecificData = asRecord(credentials.providerSpecificData);
    const requestDefaults = asRecord(providerSpecificData.requestDefaults);
    const body = options.body;
    const rawBodyTier = body && typeof body === "object" ? body.service_tier : null;
    const normalizedBodyTier = typeof rawBodyTier === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCodexServiceTier"])(rawBodyTier) : null;
    if (normalizedBodyTier) {
        if (body && typeof body === "object" && !Array.isArray(body)) {
            body.service_tier = normalizedBodyTier;
        }
        return credentials;
    }
    if (resolved.tier === "default") {
        const nextRequestDefaults = {
            ...requestDefaults
        };
        delete nextRequestDefaults.serviceTier;
        const nextProviderSpecificData = {
            ...providerSpecificData
        };
        if (Object.keys(nextRequestDefaults).length > 0) {
            nextProviderSpecificData.requestDefaults = nextRequestDefaults;
        } else {
            delete nextProviderSpecificData.requestDefaults;
        }
        return {
            ...credentials,
            providerSpecificData: nextProviderSpecificData
        };
    }
    if (body && typeof body === "object" && !Array.isArray(body)) {
        // Write the wire value directly to the outbound body when possible, so combo
        // request previews and logs show the same effective tier that the executor sends.
        // The executor also accepts requestDefaults.serviceTier for downstream accounting.
        body.service_tier = resolved.tier;
    }
    // Intentional precedence: body service_tier > global mode > connection defaults.
    // Use "none" globally if each account should keep its individual service-tier setting.
    return {
        ...credentials,
        providerSpecificData: {
            ...providerSpecificData,
            requestDefaults: {
                ...requestDefaults,
                serviceTier: resolved.tier
            }
        }
    };
}
}),
"[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/shared/constants/clientIdentityProfiles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLIENT_IDENTITY_PROFILES",
    ()=>CLIENT_IDENTITY_PROFILES,
    "CLIENT_IDENTITY_PROFILE_IDS",
    ()=>CLIENT_IDENTITY_PROFILE_IDS,
    "CLIENT_IDENTITY_PROFILE_OPTIONS",
    ()=>CLIENT_IDENTITY_PROFILE_OPTIONS,
    "getClientIdentityProfileHeaders",
    ()=>getClientIdentityProfileHeaders,
    "isClientIdentityProfileId",
    ()=>isClientIdentityProfileId
]);
/**
 * Named "client identity" header presets for OpenAI-/Anthropic-compatible
 * provider nodes (e.g. mimicking a known CLI's `User-Agent`).
 *
 * This module is intentionally dumb: it only supplies preset header
 * VALUES. It introduces NO new header-merge path — selecting a profile in
 * the compatible-provider UI merges its headers into the SAME
 * `providerSpecificData.customHeaders` field already wired end-to-end
 * (node -> connection -> `DefaultExecutor.buildHeaders()` ->
 * `applyCustomHeaders()` in `open-sse/executors/default.ts`), which already
 * sanitizes via `isForbiddenCustomHeaderName` (`upstreamHeaders.ts`) and is
 * applied AFTER the credential-auth headers are set. Auth/cookie headers
 * therefore always win over anything a profile (or a hand-edited custom
 * header) tries to set — no new precedence logic is needed here.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$codexClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/codexClient.ts [app-ssr] (ecmascript)");
;
;
const DEFAULT_PROFILE = Object.freeze({
    id: "default",
    label: "Default",
    headers: Object.freeze({})
});
const CLAUDE_CLI_PROFILE = Object.freeze({
    id: "claude-cli",
    label: "Claude CLI",
    headers: Object.freeze({
        "User-Agent": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getClaudeCodeUserAgent"])("cli"),
        "X-App": "cli"
    })
});
const CODEX_CLI_PROFILE = Object.freeze({
    id: "codex-cli",
    label: "Codex CLI",
    headers: Object.freeze((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$codexClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCodexCliRsHeaders"])())
});
const GEMINI_CLI_PROFILE = Object.freeze({
    id: "gemini-cli",
    label: "Gemini CLI",
    headers: Object.freeze({
        "User-Agent": "GeminiCLI/0.1.0 (linux; x64)"
    })
});
const CLIENT_IDENTITY_PROFILES = Object.freeze({
    default: DEFAULT_PROFILE,
    "claude-cli": CLAUDE_CLI_PROFILE,
    "codex-cli": CODEX_CLI_PROFILE,
    "gemini-cli": GEMINI_CLI_PROFILE
});
const CLIENT_IDENTITY_PROFILE_IDS = Object.keys(CLIENT_IDENTITY_PROFILES);
const CLIENT_IDENTITY_PROFILE_OPTIONS = CLIENT_IDENTITY_PROFILE_IDS.map((id)=>({
        value: id,
        label: CLIENT_IDENTITY_PROFILES[id].label
    }));
function isClientIdentityProfileId(value) {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(CLIENT_IDENTITY_PROFILES, value);
}
function getClientIdentityProfileHeaders(profileId) {
    if (!isClientIdentityProfileId(profileId)) return {};
    return {
        ...CLIENT_IDENTITY_PROFILES[profileId].headers
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/[id]/components/modals/NewApiAggregatorFields.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>NewApiAggregatorFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
function NewApiAggregatorFields({ enabled, values, onChange, t }) {
    if (!enabled) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                label: t("consoleApiKeyOracleLabel"),
                value: values.consoleApiKey,
                onChange: (e)=>onChange({
                        consoleApiKey: e.target.value
                    }),
                placeholder: t("consoleApiKeyOraclePlaceholder"),
                hint: t("newApiAggregatorConsoleApiKeyHint"),
                type: "password"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/[id]/components/modals/NewApiAggregatorFields.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                label: t("newApiUserIdLabel"),
                value: values.newApiUserId,
                onChange: (e)=>onChange({
                        newApiUserId: e.target.value
                    }),
                placeholder: t("newApiUserIdPlaceholder"),
                hint: t("newApiAggregatorUserIdHint")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/[id]/components/modals/NewApiAggregatorFields.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                label: t("newApiAggregatorQuotaPerUnitLabel"),
                value: values.quotaPerUnit,
                onChange: (e)=>onChange({
                        quotaPerUnit: e.target.value
                    }),
                placeholder: "500000",
                hint: t("newApiAggregatorQuotaPerUnitHint"),
                type: "number"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/[id]/components/modals/NewApiAggregatorFields.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>AddCompatibleProviderModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Select.tsx [app-ssr] (ecmascript) <export default as Select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$clientIdentityProfiles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/clientIdentityProfiles.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f5b$id$5d2f$components$2f$modals$2f$NewApiAggregatorFields$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/[id]/components/modals/NewApiAggregatorFields.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f5b$id$5d2f$components$2f$modals$2f$NewApiAggregatorFields$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f5b$id$5d2f$components$2f$modals$2f$NewApiAggregatorFields$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
const CC_DEFAULT_CHAT_PATH = "/v1/messages?beta=true";
const MODE_DEFAULTS = {
    openai: {
        baseUrl: "https://api.openai.com/v1",
        type: "openai-compatible",
        chatPath: "",
        hasApiType: true,
        hasModelsPath: true,
        hasWarning: false
    },
    anthropic: {
        baseUrl: "https://api.anthropic.com/v1",
        type: "anthropic-compatible",
        chatPath: "",
        hasApiType: false,
        hasModelsPath: true,
        hasWarning: false
    },
    cc: {
        baseUrl: "",
        type: "anthropic-compatible",
        compatMode: "cc",
        chatPath: CC_DEFAULT_CHAT_PATH,
        hasApiType: false,
        hasModelsPath: false,
        hasWarning: true
    }
};
function createInitialForm(mode) {
    const defaults = MODE_DEFAULTS[mode];
    return {
        name: "",
        prefix: "",
        apiType: "chat",
        baseUrl: defaults.baseUrl,
        chatPath: defaults.chatPath,
        modelsPath: "",
        iconUrl: "",
        clientIdentityProfile: "default",
        newApiAggregatorBalance: false,
        consoleApiKey: "",
        newApiUserId: "",
        quotaPerUnit: ""
    };
}
function AddCompatibleProviderModal({ isOpen, mode, title, onClose, onCreated }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const defaults = MODE_DEFAULTS[mode];
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>createInitialForm(mode));
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [checkKey, setCheckKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [checkModelId, setCheckModelId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [validating, setValidating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [validationResult, setValidationResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showAdvanced, setShowAdvanced] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const apiTypeOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            {
                value: "chat",
                label: t("chatCompletions")
            },
            {
                value: "responses",
                label: t("responsesApi")
            },
            {
                value: "embeddings",
                label: t("embeddings")
            },
            {
                value: "audio-transcriptions",
                label: t("audioTranscriptions")
            },
            {
                value: "audio-speech",
                label: t("audioSpeech")
            },
            {
                value: "images-generations",
                label: t("imagesGenerations")
            }
        ], [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        setFormData(createInitialForm(mode));
        setValidationResult(null);
        setCheckKey("");
        setShowAdvanced(false);
    }, [
        isOpen,
        mode
    ]);
    const modalTitle = title || (mode === "openai" ? t("addOpenAICompatible") : mode === "anthropic" ? t("addAnthropicCompatible") : t("addCcCompatible"));
    const namePlaceholder = mode === "cc" ? t("ccCompatibleNamePlaceholder") : t("compatibleProdPlaceholder", {
        type: mode === "openai" ? t("openai") : t("anthropic")
    });
    const nameHint = mode === "cc" ? t("ccCompatibleNameHint") : t("nameHint");
    const prefixPlaceholder = mode === "openai" ? t("openaiPrefixPlaceholder") : mode === "cc" ? t("ccCompatiblePrefixPlaceholder") : t("anthropicPrefixPlaceholder");
    const prefixHint = mode === "cc" ? t("ccCompatiblePrefixHint") : t("prefixHint");
    const baseUrlPlaceholder = mode === "openai" ? t("openaiBaseUrlPlaceholder") : mode === "cc" ? t("ccCompatibleBaseUrlPlaceholder") : t("anthropicBaseUrlPlaceholder");
    const baseUrlHint = mode === "cc" ? t("ccCompatibleBaseUrlHint") : t("compatibleBaseUrlHint", {
        type: mode === "openai" ? t("openai") : t("anthropic")
    });
    const chatPathPlaceholder = mode === "openai" ? "/v1/chat/completions" : mode === "cc" ? CC_DEFAULT_CHAT_PATH : "/messages";
    const chatPathHint = mode === "cc" ? t("ccCompatibleChatPathHint") : t("chatPathHint");
    const advancedId = `advanced-settings-${mode}`;
    const hasRequiredFields = Boolean(formData.name.trim() && formData.prefix.trim() && formData.baseUrl.trim());
    const canValidate = Boolean(checkKey.trim() && formData.baseUrl.trim());
    const resetAfterCreate = ()=>{
        setFormData(createInitialForm(mode));
        setCheckKey("");
        setValidationResult(null);
        setShowAdvanced(false);
    };
    const handleSubmit = async ()=>{
        if (!hasRequiredFields) return;
        setSubmitting(true);
        try {
            const body = {
                name: formData.name,
                prefix: formData.prefix,
                baseUrl: formData.baseUrl,
                type: defaults.type,
                chatPath: formData.chatPath || (mode === "cc" ? CC_DEFAULT_CHAT_PATH : "")
            };
            if (defaults.hasApiType) body.apiType = formData.apiType;
            if (defaults.hasModelsPath) body.modelsPath = formData.modelsPath || "";
            if (defaults.compatMode) body.compatMode = defaults.compatMode;
            body.iconUrl = formData.iconUrl.trim();
            // Merge the selected identity profile's preset headers into the SAME
            // `customHeaders` field the node already persists (see
            // src/lib/db/providers/nodes.ts + open-sse/executors/default.ts
            // `applyCustomHeaders`) — no separate profile field, no new pipeline.
            const identityHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$clientIdentityProfiles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getClientIdentityProfileHeaders"])(formData.clientIdentityProfile);
            if (Object.keys(identityHeaders).length > 0) body.customHeaders = identityHeaders;
            // Aggregator gateway fields (#9415)
            if (formData.newApiAggregatorBalance) {
                body.providerSpecificData = {
                    ...body.providerSpecificData,
                    newApiAggregatorBalance: true
                };
                if (formData.consoleApiKey.trim()) {
                    body.providerSpecificData.consoleApiKey = formData.consoleApiKey.trim();
                }
                if (formData.newApiUserId.trim()) {
                    body.providerSpecificData.newApiUserId = formData.newApiUserId.trim();
                }
                const parsedQuotaPerUnit = parseInt(formData.quotaPerUnit, 10);
                if (Number.isFinite(parsedQuotaPerUnit) && parsedQuotaPerUnit > 0) {
                    body.providerSpecificData.quotaPerUnit = parsedQuotaPerUnit;
                }
            }
            const res = await fetch("/api/provider-nodes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                onCreated(data.node);
                resetAfterCreate();
            }
        } catch (error) {
            console.log(`Error creating ${mode} compatible node:`, error);
        } finally{
            setSubmitting(false);
        }
    };
    const handleValidate = async ()=>{
        setValidating(true);
        try {
            const body = {
                baseUrl: formData.baseUrl,
                apiKey: checkKey,
                type: defaults.type
            };
            if (defaults.hasApiType) body.apiType = formData.apiType;
            if (defaults.hasModelsPath) body.modelsPath = formData.modelsPath || "";
            if (defaults.compatMode) {
                body.compatMode = defaults.compatMode;
                body.chatPath = formData.chatPath || CC_DEFAULT_CHAT_PATH;
            }
            const trimmedModelId = checkModelId.trim();
            if (trimmedModelId) body.modelId = trimmedModelId;
            const res = await fetch("/api/provider-nodes/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            setValidationResult({
                valid: !!data.valid,
                error: data.error ?? null,
                method: data.method ?? null
            });
        } catch  {
            setValidationResult({
                valid: false,
                error: "Network error"
            });
        } finally{
            setValidating(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: isOpen,
        title: modalTitle,
        onClose: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                defaults.hasWarning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-text-muted",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined mt-0.5 text-[18px] text-amber-500",
                                children: "warning"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                                lineNumber: 289,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: t("ccCompatibleValidationHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                                lineNumber: 292,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                        lineNumber: 288,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 287,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    label: t("nameLabel"),
                    value: formData.name,
                    onChange: (e)=>setFormData({
                            ...formData,
                            name: e.target.value
                        }),
                    placeholder: namePlaceholder,
                    hint: nameHint
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    label: t("prefixLabel"),
                    value: formData.prefix,
                    onChange: (e)=>setFormData({
                            ...formData,
                            prefix: e.target.value
                        }),
                    placeholder: prefixPlaceholder,
                    hint: prefixHint
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 304,
                    columnNumber: 9
                }, this),
                defaults.hasApiType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                    label: t("apiTypeLabel"),
                    options: apiTypeOptions,
                    value: formData.apiType,
                    onChange: (e)=>setFormData({
                            ...formData,
                            apiType: e.target.value
                        })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 312,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    label: t("baseUrlLabel"),
                    value: formData.baseUrl,
                    onChange: (e)=>setFormData({
                            ...formData,
                            baseUrl: e.target.value
                        }),
                    placeholder: baseUrlPlaceholder,
                    hint: baseUrlHint
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 319,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    label: t("iconUrlLabel"),
                    value: formData.iconUrl,
                    onChange: (e)=>setFormData({
                            ...formData,
                            iconUrl: e.target.value
                        }),
                    placeholder: "https://example.com/logo.png",
                    hint: t("iconUrlHint")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 326,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                    label: t("newApiAggregatorToggleLabel"),
                    description: t("newApiAggregatorToggleHint"),
                    checked: formData.newApiAggregatorBalance,
                    onChange: (checked)=>setFormData({
                            ...formData,
                            newApiAggregatorBalance: checked
                        })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f5b$id$5d2f$components$2f$modals$2f$NewApiAggregatorFields$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    enabled: formData.newApiAggregatorBalance,
                    values: {
                        consoleApiKey: formData.consoleApiKey,
                        newApiUserId: formData.newApiUserId,
                        quotaPerUnit: formData.quotaPerUnit
                    },
                    onChange: (patch)=>setFormData({
                            ...formData,
                            ...patch
                        }),
                    t: t
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 342,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: "text-sm text-text-muted hover:text-text-primary flex items-center gap-1",
                    onClick: ()=>setShowAdvanced(!showAdvanced),
                    "aria-expanded": showAdvanced,
                    "aria-controls": advancedId,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `transition-transform ${showAdvanced ? "rotate-90" : ""}`,
                            "aria-hidden": "true",
                            children: ">"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 360,
                            columnNumber: 11
                        }, this),
                        t("advancedSettings")
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 353,
                    columnNumber: 9
                }, this),
                showAdvanced && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    id: advancedId,
                    className: "flex flex-col gap-3 pl-2 border-l-2 border-border",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            label: t("chatPathLabel"),
                            value: formData.chatPath,
                            onChange: (e)=>setFormData({
                                    ...formData,
                                    chatPath: e.target.value
                                }),
                            placeholder: chatPathPlaceholder,
                            hint: chatPathHint
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 370,
                            columnNumber: 13
                        }, this),
                        defaults.hasModelsPath && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            label: t("modelsPathLabel"),
                            value: formData.modelsPath,
                            onChange: (e)=>setFormData({
                                    ...formData,
                                    modelsPath: e.target.value
                                }),
                            placeholder: t("modelsPathPlaceholder"),
                            hint: t("modelsPathHint")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 378,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                            label: t("clientIdentityLabel"),
                            options: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$clientIdentityProfiles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLIENT_IDENTITY_PROFILE_OPTIONS"].map((option)=>({
                                    ...option
                                })),
                            value: formData.clientIdentityProfile,
                            onChange: (e)=>setFormData({
                                    ...formData,
                                    clientIdentityProfile: e.target.value
                                }),
                            hint: t("clientIdentityHint")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 386,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 369,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            label: t("apiKeyForCheck"),
                            type: "password",
                            value: checkKey,
                            onChange: (e)=>setCheckKey(e.target.value),
                            className: "flex-1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 397,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                onClick: handleValidate,
                                disabled: !canValidate || validating,
                                variant: "secondary",
                                children: validating ? t("checking") : t("check")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                                lineNumber: 405,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 404,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 396,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    label: t("testModelIdLabel"),
                    value: checkModelId,
                    onChange: (e)=>setCheckModelId(e.target.value),
                    placeholder: t("testModelIdPlaceholder"),
                    hint: t("testModelIdHint")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 414,
                    columnNumber: 9
                }, this),
                validationResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                            variant: validationResult.valid ? "success" : "error",
                            children: validationResult.valid ? t("valid") : t("invalid")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 423,
                            columnNumber: 13
                        }, this),
                        validationResult.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-sm ${validationResult.valid ? "text-text-muted" : "text-red-500"}`,
                            children: validationResult.error
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 427,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 422,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            onClick: handleSubmit,
                            fullWidth: true,
                            disabled: !hasRequiredFields || submitting,
                            children: submitting ? t("creating") : t("add")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 437,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            onClick: onClose,
                            variant: "ghost",
                            fullWidth: true,
                            children: t("cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                            lineNumber: 440,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
                    lineNumber: 436,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
            lineNumber: 285,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx",
        lineNumber: 284,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CategoryDot",
    ()=>CategoryDot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/utils/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-ssr] (ecmascript)");
;
;
function CategoryDot({ color, hasFree = false, label, freeLabel, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-0.5 shrink-0", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("size-2 rounded-full shrink-0", color),
                title: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            hasFree && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "size-2 rounded-full shrink-0 bg-green-500",
                title: freeLabel
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx",
                lineNumber: 21,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/parseProviderImportFile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure parser for the "Import providers from file" wizard step (#6836).
 *
 * Supported inputs, one heterogeneous provider list per file:
 *   - CSV: `provider,name,apiKey,baseUrl(optional),priority(optional)` — one row per
 *     provider connection. A header row (first non-blank/non-comment line whose first
 *     column is literally "provider", case-insensitive) is detected and skipped.
 *   - JSON: an array of `{ provider, name, apiKey, baseUrl?, priority? }` objects.
 *
 * Modeled directly on `parseBulkProxyImport.ts` (same shape: entries + per-row errors +
 * skipped count, comment/blank-line skipping for CSV), swapping the row shape for
 * provider connections. Deliberately does NOT validate the `provider` id against the
 * provider catalog — that check belongs server-side in `bulkImportProviderSchema`
 * (`src/shared/validation/schemas/provider.ts`) so the parser stays a pure, dependency-free
 * client-side utility.
 */ __turbopack_context__.s([
    "parseProviderImportFile",
    ()=>parseProviderImportFile
]);
const CSV_HEADER_FIRST_COLUMN = "provider";
/**
 * Parse+validate the optional `priority` field in isolation — split out of
 * `pushParsedEntry` purely to keep that function's cyclomatic complexity under the
 * repo's ratchet (each branch here would otherwise count toward the caller).
 */ function parseOptionalPriority(raw) {
    if (raw === undefined || raw === null || raw === "") return {
        ok: true,
        priority: undefined
    };
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n) || n < 1 || n > 100) return {
        ok: false
    };
    return {
        ok: true,
        priority: n
    };
}
/**
 * Validate + normalize one already-split row of raw string fields into an entry,
 * pushing to `entries` on success or `errors` on failure. Shared by the CSV and
 * JSON code paths so both apply identical field rules.
 */ function pushParsedEntry(entries, errors, lineNum, raw) {
    const provider = typeof raw.provider === "string" ? raw.provider.trim() : "";
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const apiKey = typeof raw.apiKey === "string" ? raw.apiKey.trim() : "";
    if (!provider) {
        errors.push({
            line: lineNum,
            reason: "importErrorMissingProvider"
        });
        return;
    }
    if (!name) {
        errors.push({
            line: lineNum,
            reason: "importErrorMissingName"
        });
        return;
    }
    if (!apiKey) {
        errors.push({
            line: lineNum,
            reason: "importErrorMissingApiKey"
        });
        return;
    }
    const priorityResult = parseOptionalPriority(raw.priority);
    if (!priorityResult.ok) {
        errors.push({
            line: lineNum,
            reason: "importErrorInvalidPriority"
        });
        return;
    }
    const priority = priorityResult.priority;
    const baseUrl = typeof raw.baseUrl === "string" ? raw.baseUrl.trim() : "";
    entries.push({
        provider,
        name,
        apiKey,
        ...baseUrl ? {
            baseUrl
        } : {},
        ...priority !== undefined ? {
            priority
        } : {}
    });
}
function parseCsv(text) {
    const lines = text.split("\n");
    const entries = [];
    const errors = [];
    let skipped = 0;
    let headerSkipped = false;
    for(let i = 0; i < lines.length; i++){
        const raw = lines[i].trim();
        if (!raw || raw.startsWith("#")) {
            skipped++;
            continue;
        }
        const lineNum = i + 1;
        const parts = raw.split(",").map((p)=>p.trim());
        if (!headerSkipped) {
            headerSkipped = true;
            if ((parts[0] || "").toLowerCase() === CSV_HEADER_FIRST_COLUMN) {
                skipped++;
                continue;
            }
        }
        if (parts.length < 3) {
            errors.push({
                line: lineNum,
                reason: "importErrorMalformedRow"
            });
            continue;
        }
        const [provider, name, apiKey, baseUrl, priority] = parts;
        pushParsedEntry(entries, errors, lineNum, {
            provider,
            name,
            apiKey,
            baseUrl,
            priority
        });
    }
    return {
        entries,
        errors,
        skipped
    };
}
function parseJson(text) {
    const entries = [];
    const errors = [];
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch  {
        return {
            entries,
            errors: [
                {
                    line: 1,
                    reason: "importErrorMalformedRow"
                }
            ],
            skipped: 0
        };
    }
    if (!Array.isArray(parsed)) {
        return {
            entries,
            errors: [
                {
                    line: 1,
                    reason: "importErrorNotArray"
                }
            ],
            skipped: 0
        };
    }
    parsed.forEach((row, idx)=>{
        const lineNum = idx + 1;
        if (!row || typeof row !== "object") {
            errors.push({
                line: lineNum,
                reason: "importErrorMalformedRow"
            });
            return;
        }
        const r = row;
        pushParsedEntry(entries, errors, lineNum, {
            provider: r.provider,
            name: r.name,
            apiKey: r.apiKey,
            baseUrl: r.baseUrl,
            priority: r.priority
        });
    });
    return {
        entries,
        errors,
        skipped: 0
    };
}
function parseProviderImportFile(text, format) {
    return format === "json" ? parseJson(text) : parseCsv(text);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/useImportProvidersFromFile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useImportProvidersFromFile",
    ()=>useImportProvidersFromFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$parseProviderImportFile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/parseProviderImportFile.ts [app-ssr] (ecmascript)");
;
;
function useImportProvidersFromFile(onImported) {
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [importing, setImporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const resetParsed = ()=>{
        setEntries([]);
        setErrors([]);
        setSelected(new Set());
        setResult(null);
    };
    const handleFile = async (file)=>{
        setFileName(file.name);
        resetParsed();
        const format = file.name.toLowerCase().endsWith(".json") ? "json" : "csv";
        const text = await file.text();
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$parseProviderImportFile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseProviderImportFile"])(text, format);
        setEntries(parsed.entries);
        setErrors(parsed.errors);
        setSelected(new Set(parsed.entries.map((_, idx)=>idx)));
    };
    const toggleRow = (idx)=>{
        setSelected((prev)=>{
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };
    const toggleAll = (checked)=>{
        setSelected(checked ? new Set(entries.map((_, i)=>i)) : new Set());
    };
    const handleClose = (onClose)=>{
        if (importing) return;
        setFileName("");
        resetParsed();
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };
    const handleExecute = async ()=>{
        const toImport = entries.filter((_, idx)=>selected.has(idx));
        if (toImport.length === 0) return;
        setImporting(true);
        try {
            const res = await fetch("/api/providers/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    entries: toImport
                })
            });
            const data = await res.json().catch(()=>({}));
            if (res.ok) {
                setResult({
                    success: data.success ?? 0,
                    failed: data.failed ?? 0,
                    total: data.total ?? 0
                });
                await onImported();
            }
        } finally{
            setImporting(false);
        }
    };
    return {
        fileInputRef,
        fileName,
        entries,
        errors,
        selected,
        importing,
        result,
        handleFile,
        toggleRow,
        toggleAll,
        handleClose,
        handleExecute
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ImportProvidersFromFileModal",
    ()=>ImportProvidersFromFileModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$useImportProvidersFromFile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/useImportProvidersFromFile.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
const PARSE_ERROR_REASON_KEYS = [
    "importErrorMissingProvider",
    "importErrorMissingName",
    "importErrorMissingApiKey",
    "importErrorInvalidPriority",
    "importErrorMalformedRow",
    "importErrorNotArray"
];
/** Per-row parse error list. Split out of the modal to keep it under the LOC ratchet. */ function ParseErrorsList({ errors, t }) {
    if (errors.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-h-28 overflow-y-auto rounded border border-red-500/30 bg-red-500/10 p-2",
        children: errors.map((err, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-red-400",
                children: t("importFromFileErrorLine", {
                    line: err.line,
                    reason: t(PARSE_ERROR_REASON_KEYS.includes(err.reason) ? err.reason : "importErrorMalformedRow")
                })
            }, idx, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
/** Parsed-rows selection checklist (acceptance criterion #3 of #6836). */ function EntriesTable({ entries, selected, onToggleRow, onToggleAll, t }) {
    if (entries.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-text-muted",
                children: t("importFromFileSelectHint", {
                    count: selected.size,
                    total: entries.length
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto max-h-64 overflow-y-auto rounded border border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-xs",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "text-left text-text-muted border-b border-border bg-bg-subtle sticky top-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "py-1.5 px-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: selected.size === entries.length,
                                            onChange: (e)=>onToggleAll(e.target.checked)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                            lineNumber: 67,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                        lineNumber: 66,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "py-1.5 px-2",
                                        children: t("importFromFileColProvider")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "py-1.5 px-2",
                                        children: t("importFromFileColName")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "py-1.5 px-2",
                                        children: t("importFromFileColBaseUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: entries.map((entry, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-border/40",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "py-1 px-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: selected.has(idx),
                                                onChange: ()=>onToggleRow(idx)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                                lineNumber: 82,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                            lineNumber: 81,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "py-1 px-2 font-mono text-text-muted",
                                            children: entry.provider
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                            lineNumber: 84,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "py-1 px-2 font-medium text-text-main",
                                            children: entry.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                            lineNumber: 85,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "py-1 px-2 text-text-muted",
                                            children: entry.baseUrl || "—"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                            lineNumber: 86,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                                    lineNumber: 80,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
/** File-input trigger + chosen filename display. */ function FilePickerRow({ fileInputRef, fileName, onFile, t }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: fileInputRef,
                type: "file",
                accept: ".csv,.json,text/csv,application/json",
                className: "hidden",
                onChange: (e)=>{
                    const file = e.target.files?.[0];
                    if (file) onFile(file);
                }
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                size: "sm",
                variant: "secondary",
                icon: "upload_file",
                onClick: ()=>fileInputRef.current?.click(),
                children: t("importFromFileChoose")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            fileName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-text-muted font-mono",
                children: fileName
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                lineNumber: 120,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
function ImportProvidersFromFileModal({ isOpen, onClose, onImported }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$useImportProvidersFromFile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImportProvidersFromFile"])(onImported);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: isOpen,
        onClose: ()=>s.handleClose(onClose),
        title: t("importFromFileTitle"),
        maxWidth: "xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-text-muted",
                    children: t("importFromFileDescription")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 143,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilePickerRow, {
                    fileInputRef: s.fileInputRef,
                    fileName: s.fileName,
                    onFile: s.handleFile,
                    t: t
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ParseErrorsList, {
                    errors: s.errors,
                    t: t
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EntriesTable, {
                    entries: s.entries,
                    selected: s.selected,
                    onToggleRow: s.toggleRow,
                    onToggleAll: s.toggleAll,
                    t: t
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                s.result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-3 py-2 rounded border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400",
                    children: t("importFromFileResult", {
                        success: s.result.success,
                        failed: s.result.failed
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 150,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-end gap-2 pt-2 border-t border-border",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            variant: "secondary",
                            onClick: ()=>s.handleClose(onClose),
                            children: t("cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            icon: "upload",
                            onClick: s.handleExecute,
                            loading: s.importing,
                            disabled: s.selected.size === 0 || s.importing,
                            children: s.importing ? t("importFromFileImporting") : t("importFromFileImport", {
                                count: s.selected.size
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                            lineNumber: 159,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
            lineNumber: 142,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/hooks/useApiKey.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useApiKey",
    ()=>useApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useApiKey(opts) {
    const [apiKey, setApiKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [keys, setKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const preferredId = opts?.preferredId;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const load = async ()=>{
            try {
                const res = await fetch("/api/keys");
                if (!res.ok) return;
                const data = await res.json();
                const list = data.keys ?? [];
                if (cancelled) return;
                setKeys(list);
                const active = preferredId ? list.find((k)=>k.id === preferredId) : list.find((k)=>k.isActive !== false);
                setApiKey(active?.key ?? "");
            } catch  {
            // silently ignore — the playground is non-critical
            } finally{
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return ()=>{
            cancelled = true;
        };
    }, [
        preferredId
    ]);
    return {
        apiKey,
        setApiKey,
        keys,
        loading
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/hooks/useProviderModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProviderModels",
    ()=>useProviderModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useProviderModels(providerId) {
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!providerId) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        const load = async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/v1/providers/${encodeURIComponent(providerId)}/models`);
                if (!res.ok) {
                    const body = await res.json().catch(()=>null);
                    const msg = body?.error?.message ?? `HTTP ${res.status}`;
                    if (!cancelled) setError(msg);
                    return;
                }
                const data = await res.json();
                if (cancelled) return;
                let list = data.data ?? [];
                // Auto-sync from upstream if local catalog is empty
                if (list.length === 0) {
                    setTimeout(async ()=>{
                        try {
                            if (cancelled) return;
                            const connRes = await fetch("/api/providers");
                            if (!connRes.ok || cancelled) return;
                            const connData = await connRes.json();
                            if (cancelled) return;
                            const providerConn = connData.connections?.find((c)=>(c.provider === providerId || c.id === providerId) && c.isActive !== false);
                            if (providerConn && !cancelled) {
                                const syncRes = await fetch(`/api/providers/${encodeURIComponent(providerConn.id)}/sync-models?mode=sync`, {
                                    method: "POST"
                                });
                                if (syncRes.ok && !cancelled) {
                                    const refetchRes = await fetch(`/api/v1/providers/${encodeURIComponent(providerId)}/models`);
                                    if (refetchRes.ok && !cancelled) {
                                        const refetchData = await refetchRes.json();
                                        if (!cancelled) {
                                            setModels(refetchData.data ?? []);
                                        }
                                    }
                                }
                            }
                        } catch (syncErr) {
                            if (!cancelled) {
                                console.log("Auto-fetch models failed:", syncErr);
                            }
                        }
                    }, 0);
                }
                if (cancelled) return;
                setModels(list);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load models");
                }
            } finally{
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return ()=>{
            cancelled = true;
        };
    }, [
        providerId
    ]);
    return {
        models,
        loading,
        error
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "LlmChatCard",
    ()=>LlmChatCard,
    "qualifyPlaygroundModel",
    ()=>qualifyPlaygroundModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useApiKey$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useApiKey.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useProviderModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
;
const ENDPOINT = "/api/v1/chat/completions";
/** Header used to test a specific API key's policy from the dashboard playground
 *  without exposing the key secret to the browser — the gateway resolves the key
 *  by id server-side (see enforceApiKeyPolicy). */ const PLAYGROUND_KEY_ID_HEADER = "x-omniroute-playground-key-id";
/**
 * Map the playground's masked key selection (sk-xxxx****yyyy, as returned by
 * `/api/keys`) back to its key id. The id — never the secret — is sent to the
 * gateway so it can apply that key's policy (allowed_models, etc.) server-side.
 * Returns null for "(default)", which falls through to the dashboard session.
 */ function resolvePlaygroundKeyId(selectedMaskedKey, keys) {
    if (!selectedMaskedKey) return null;
    return keys.find((k)=>k.key === selectedMaskedKey)?.id ?? null;
}
function qualifyPlaygroundModel(model, routingPrefix) {
    const m = (model ?? "").trim();
    if (!m || !routingPrefix) return m;
    return m === routingPrefix || m.startsWith(`${routingPrefix}/`) ? m : `${routingPrefix}/${m}`;
}
function extractDeltaContent(line) {
    if (!line.startsWith("data: ")) return "";
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") return "";
    try {
        const json = JSON.parse(payload);
        const choices = Array.isArray(json.choices) ? json.choices : [];
        const first = choices[0];
        const delta = first?.delta;
        const content = delta?.content;
        return typeof content === "string" ? content : "";
    } catch  {
        return "";
    }
}
function extractUsage(line) {
    if (!line.startsWith("data: ")) return null;
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") return null;
    try {
        const json = JSON.parse(payload);
        const usage = json.usage;
        if (!usage) return null;
        return {
            prompt_tokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
            completion_tokens: typeof usage.completion_tokens === "number" ? usage.completion_tokens : undefined
        };
    } catch  {
        return null;
    }
}
function LlmChatCard({ providerId, initialModel, embedded = false, hideToolbar = false, model: modelProp, onModelChange, selectedKey: selectedKeyProp, onSelectedKeyChange, controlsRef, onControlsChange }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("miniPlayground");
    const { keys } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useApiKey$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApiKey"])();
    const { models } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProviderModels"])(providerId);
    const [internalSelectedKey, setInternalSelectedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [internalModel, setInternalModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialModel ?? "");
    const selectedKey = selectedKeyProp ?? internalSelectedKey;
    const setSelectedKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((k)=>{
        if (onSelectedKeyChange) onSelectedKeyChange(k);
        else setInternalSelectedKey(k);
    }, [
        onSelectedKeyChange
    ]);
    const model = modelProp ?? internalModel;
    const setModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((m)=>{
        if (onModelChange) onModelChange(m);
        else setInternalModel(m);
    }, [
        onModelChange
    ]);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [streaming, setStreaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const firstModel = models[0]?.id ?? "";
    const effectiveModel = model || firstModel || initialModel || "";
    const routingPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(providerId);
    // Auto-prefix model with the provider's routing alias to avoid OmniRoute "Ambiguous model"
    // rejection when the same id is registered under multiple providers. This
    // also covers vendor-namespaced ids (e.g. `moonshotai/kimi-k2.6`) that already
    // contain a slash but still need the provider prefix (#3050).
    const qualifiedModel = qualifyPlaygroundModel(effectiveModel, routingPrefix);
    // Autofocus textarea in embedded mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (embedded) textareaRef.current?.focus();
    }, [
        embedded
    ]);
    // Auto-scroll to bottom when messages update
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [
        messages
    ]);
    // Cleanup abort on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            abortRef.current?.abort();
        };
    }, []);
    const handleSend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const trimmed = input.trim();
        if (!trimmed || streaming) return;
        const userMsg = {
            role: "user",
            content: trimmed
        };
        const assistantMsg = {
            role: "assistant",
            content: "",
            model: qualifiedModel
        };
        setMessages((prev)=>[
                ...prev,
                userMsg,
                assistantMsg
            ]);
        setInput("");
        setStreaming(true);
        setStats(null);
        const controller = new AbortController();
        abortRef.current = controller;
        const t0 = performance.now();
        try {
            // The playground authenticates via the dashboard session cookie — we never
            // put an API key secret on the wire. `/api/keys` only exposes MASKED values
            // (sk-xxxx****yyyy), which are invalid as bearer tokens and would 401 under
            // REQUIRE_API_KEY. When a specific key is selected we send only its id so the
            // gateway can apply that key's policy (allowed_models, etc.) server-side.
            // "(default)" sends no key id → full session access (any model).
            const headers = {
                "Content-Type": "application/json",
                "x-connection-id": providerId
            };
            const playgroundKeyId = resolvePlaygroundKeyId(selectedKey, keys);
            if (playgroundKeyId) headers[PLAYGROUND_KEY_ID_HEADER] = playgroundKeyId;
            const res = await fetch(ENDPOINT, {
                method: "POST",
                signal: controller.signal,
                credentials: "same-origin",
                headers,
                body: JSON.stringify({
                    model: qualifiedModel,
                    messages: [
                        // Include history (all except the last assistant placeholder)
                        ...messages,
                        userMsg
                    ],
                    stream: true,
                    stream_options: {
                        include_usage: true
                    }
                })
            });
            if (!res.ok || !res.body) {
                const errData = await res.json().catch(()=>null);
                const errMsg = errData && typeof errData === "object" && errData.error ? String(errData.error?.message ?? `HTTP ${res.status}`) : `HTTP ${res.status}`;
                setMessages((prev)=>{
                    const next = [
                        ...prev
                    ];
                    const last = next[next.length - 1];
                    next[next.length - 1] = {
                        ...last,
                        role: "assistant",
                        content: `[${t("errorLabel")}: ${errMsg}]`
                    };
                    return next;
                });
                return;
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let acc = "";
            let tokenUsage = {
                tokensIn: 0,
                tokensOut: 0
            };
            let buffer = "";
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split("\n");
                // Keep last partial line in buffer
                buffer = lines.pop() ?? "";
                for (const line of lines){
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;
                    const delta = extractDeltaContent(trimmedLine);
                    if (delta) {
                        acc += delta;
                        setMessages((prev)=>{
                            const next = [
                                ...prev
                            ];
                            const last = next[next.length - 1];
                            next[next.length - 1] = {
                                ...last,
                                role: "assistant",
                                content: acc
                            };
                            return next;
                        });
                    }
                    const usage = extractUsage(trimmedLine);
                    if (usage) {
                        tokenUsage = {
                            tokensIn: usage.prompt_tokens ?? tokenUsage.tokensIn,
                            tokensOut: usage.completion_tokens ?? tokenUsage.tokensOut
                        };
                    }
                }
            }
            // Flush remaining buffer
            if (buffer.trim()) {
                const delta = extractDeltaContent(buffer.trim());
                if (delta) {
                    acc += delta;
                    setMessages((prev)=>{
                        const next = [
                            ...prev
                        ];
                        const last = next[next.length - 1];
                        next[next.length - 1] = {
                            ...last,
                            role: "assistant",
                            content: acc
                        };
                        return next;
                    });
                }
            }
            setStats({
                latencyMs: performance.now() - t0,
                tokensIn: tokenUsage.tokensIn,
                tokensOut: tokenUsage.tokensOut
            });
        } catch (err) {
            if (err.name === "AbortError") {
                // Cancelled by user — leave partial message
                return;
            }
            const msg = err instanceof Error ? err.message : t("requestFailed");
            setMessages((prev)=>{
                const next = [
                    ...prev
                ];
                const last = next[next.length - 1];
                next[next.length - 1] = {
                    ...last,
                    role: "assistant",
                    content: `[${t("errorLabel")}: ${msg}]`
                };
                return next;
            });
        } finally{
            setStreaming(false);
            abortRef.current = null;
            // Refocus textarea so user can keep typing
            requestAnimationFrame(()=>textareaRef.current?.focus());
        }
    }, [
        input,
        streaming,
        selectedKey,
        keys,
        providerId,
        qualifiedModel,
        messages,
        t
    ]);
    const handleKeyDown = (e)=>{
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };
    const handleStop = ()=>{
        abortRef.current?.abort();
    };
    const handleClear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (streaming) abortRef.current?.abort();
        setMessages([]);
        setStats(null);
    }, [
        streaming
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(controlsRef, ()=>({
            clear: handleClear,
            hasMessages: messages.length > 0,
            streaming
        }), [
        handleClear,
        messages.length,
        streaming
    ]);
    // Notify parent of control state changes (for external toolbar)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onControlsChange?.({
            clear: handleClear,
            hasMessages: messages.length > 0,
            streaming
        });
    }, [
        onControlsChange,
        handleClear,
        messages.length,
        streaming
    ]);
    const modelOptions = models.length > 0 ? models : initialModel ? [
        {
            id: initialModel
        }
    ] : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-3", embedded ? "flex-1 min-h-0" : "rounded-lg border border-border bg-bg-card p-4"),
        children: [
            !hideToolbar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs text-text-muted shrink-0",
                                children: [
                                    t("model"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                lineNumber: 391,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: model || firstModel,
                                onChange: (e)=>setModel(e.target.value),
                                className: "min-w-0 flex-1 rounded-md border border-border bg-bg-subtle text-xs px-2 py-1 text-text-main focus:outline-none focus:ring-1 focus:ring-primary",
                                children: [
                                    modelOptions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: initialModel || "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                        lineNumber: 397,
                                        columnNumber: 45
                                    }, this),
                                    modelOptions.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: m.id,
                                            children: m.id
                                        }, m.id, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                            lineNumber: 399,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                lineNumber: 392,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 390,
                        columnNumber: 11
                    }, this),
                    keys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs text-text-muted shrink-0",
                                children: [
                                    t("selectKey"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                lineNumber: 408,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: selectedKey,
                                onChange: (e)=>setSelectedKey(e.target.value),
                                className: "rounded-md border border-border bg-bg-subtle text-xs px-2 py-1 text-text-main focus:outline-none focus:ring-1 focus:ring-primary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: t("defaultKey")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                        lineNumber: 414,
                                        columnNumber: 17
                                    }, this),
                                    keys.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: k.key,
                                            children: k.name ?? k.id
                                        }, k.id, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                            lineNumber: 416,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                lineNumber: 409,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 407,
                        columnNumber: 13
                    }, this),
                    messages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleClear,
                        className: "text-xs text-text-muted hover:text-text-primary transition-colors",
                        children: t("clear")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 425,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                lineNumber: 388,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-md border border-border bg-bg-subtle overflow-y-auto", embedded ? "flex-1 min-h-0" : messages.length === 0 ? "min-h-[60px]" : "min-h-[80px] max-h-64"),
                children: messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full min-h-[180px] flex-col items-center justify-center gap-3 p-6 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "size-10 rounded-full bg-accent/10 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-accent text-[22px]",
                                children: "forum"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                lineNumber: 451,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 450,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted",
                            children: t("emptyConversation")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 453,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-text-muted/70",
                            children: t("sendHint")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 454,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                    lineNumber: 449,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-3xl flex-col divide-y divide-border/60",
                    children: messages.map((msg, i)=>{
                        const isUser = msg.role === "user";
                        const isError = !isUser && typeof msg.content === "string" && msg.content.startsWith(`[${t("errorLabel")}`);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex gap-3 px-4 py-4", isUser ? "bg-transparent" : "bg-bg-card/40"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("size-7 rounded-md flex items-center justify-center shrink-0 text-[14px] font-semibold", isUser ? "bg-primary/15 text-primary" : isError ? "bg-red-500/15 text-red-400" : "bg-accent/15 text-accent"),
                                    "aria-hidden": "true",
                                    children: isUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "person"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                        lineNumber: 484,
                                        columnNumber: 23
                                    }, this) : isError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "error"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                        lineNumber: 486,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "smart_toy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                        lineNumber: 488,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                    lineNumber: 472,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1 min-w-0 flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-baseline gap-2 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] uppercase tracking-wider text-text-muted font-medium shrink-0",
                                                    children: isUser ? t("you") : isError ? t("errorLabel") : t("assistant")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 23
                                                }, this),
                                                !isUser && !isError && msg.model && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-mono text-text-muted/60 truncate",
                                                    title: msg.model,
                                                    children: [
                                                        "· ",
                                                        msg.model
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                                    lineNumber: 497,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                            lineNumber: 492,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm whitespace-pre-wrap break-words leading-relaxed", isError ? "text-red-400" : "text-text-main"),
                                            children: [
                                                msg.content,
                                                !isUser && streaming && i === messages.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-block w-1.5 h-3.5 bg-text-main ml-0.5 align-text-bottom animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                                    lineNumber: 513,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                            lineNumber: 505,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                                    lineNumber: 491,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 465,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                    lineNumber: 457,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                lineNumber: 437,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex items-end gap-2 rounded-lg border border-border bg-bg-subtle px-3 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary/50 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        ref: textareaRef,
                        value: input,
                        onChange: (e)=>setInput(e.target.value),
                        onKeyDown: handleKeyDown,
                        rows: 1,
                        placeholder: `${t("send")}…`,
                        className: "flex-1 bg-transparent text-sm py-1.5 text-text-main placeholder:text-text-muted focus:outline-none resize-none max-h-32"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 526,
                        columnNumber: 9
                    }, this),
                    streaming ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleStop,
                        title: t("stop"),
                        className: "size-8 flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "stop"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 542,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 536,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void handleSend(),
                        disabled: !input.trim(),
                        title: t("send"),
                        className: "size-8 flex items-center justify-center rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "arrow_upward"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                            lineNumber: 552,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 545,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                lineNumber: 525,
                columnNumber: 7
            }, this),
            stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 text-[11px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[13px]",
                        children: "bolt"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 560,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t("statsLine", {
                            ms: Math.round(stats.latencyMs),
                            tokensIn: stats.tokensIn,
                            tokensOut: stats.tokensOut
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                        lineNumber: 561,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
                lineNumber: 559,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx",
        lineNumber: 380,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/components/ProviderTestSlideOver.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ProviderTestSlideOver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$media$2d$providers$2f$components$2f$LlmChatCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/media-providers/components/LlmChatCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useApiKey$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useApiKey.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useProviderModels.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$media$2d$providers$2f$components$2f$LlmChatCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$media$2d$providers$2f$components$2f$LlmChatCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
;
const TABS = [
    {
        key: "test",
        label: "Test",
        icon: "play_arrow"
    },
    {
        key: "logs",
        label: "Logs",
        icon: "receipt_long"
    }
];
function ProviderTestSlideOver(props) {
    if (!props.isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderTestSlideOverPanel, {
        ...props
    }, void 0, false, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 43,
        columnNumber: 10
    }, this);
}
function ProviderTestSlideOverPanel({ onClose, providerId, provider, staticIconPath, initialTab = "test" }) {
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialTab);
    const [model, setModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedKey, setSelectedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [controls, setControls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const onControlsChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((c)=>setControls(c), []);
    const { keys } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useApiKey$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApiKey"])();
    const { models } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProviderModels"])(providerId);
    const firstModel = models[0]?.id ?? "";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return ()=>document.removeEventListener("keydown", onKey);
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return ()=>{
            document.body.style.overflow = prev;
        };
    }, []);
    const color = provider.color || "#64748b";
    const modelOptions = models.length > 0 ? models : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[60] flex justify-end",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200",
                onClick: onClose,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "dialog",
                "aria-label": `Test ${provider.name}`,
                className: "relative w-full sm:w-[640px] md:w-[720px] lg:w-[820px] max-w-full bg-surface border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SlideOverHeader, {
                        provider: provider,
                        providerId: providerId,
                        staticIconPath: staticIconPath,
                        color: color,
                        onClose: onClose
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    tab === "test" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TestToolbar, {
                        model: model || firstModel,
                        onModelChange: setModel,
                        modelOptions: modelOptions,
                        selectedKey: selectedKey,
                        onSelectedKeyChange: setSelectedKey,
                        keys: keys,
                        controls: controls
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SlideOverTabs, {
                        tab: tab,
                        onChange: setTab
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-h-0 overflow-hidden flex flex-col",
                        children: [
                            tab === "test" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-h-0 flex flex-col pl-4 pr-2 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$media$2d$providers$2f$components$2f$LlmChatCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LlmChatCard"], {
                                    providerId: providerId,
                                    embedded: true,
                                    hideToolbar: true,
                                    model: model,
                                    onModelChange: setModel,
                                    selectedKey: selectedKey,
                                    onSelectedKeyChange: setSelectedKey,
                                    onControlsChange: onControlsChange
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                    lineNumber: 116,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, this),
                            tab === "logs" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LogsTab, {
                                providerId: providerId
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 128,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
function SlideOverHeader({ provider, providerId, staticIconPath, color, onClose }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5 shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-9 rounded-lg flex items-center justify-center shrink-0",
                style: {
                    backgroundColor: `${color}15`
                },
                children: staticIconPath ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: staticIconPath,
                    alt: provider.name,
                    width: 22,
                    height: 22
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 155,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    providerId: provider.id || providerId,
                    size: 22,
                    type: "color"
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 157,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-text-main truncate",
                        title: provider.name,
                        children: provider.name
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 text-[11px] text-text-muted",
                        children: [
                            provider.apiType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono",
                                children: provider.apiType
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 165,
                                columnNumber: 32
                            }, this),
                            provider.deprecated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-0.5 text-text-muted/70",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[12px]",
                                                children: "block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 170,
                                                columnNumber: 17
                                            }, this),
                                            "deprecated"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            provider.subscriptionRisk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-0.5 text-amber-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[12px]",
                                                children: "info"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 179,
                                                columnNumber: 17
                                            }, this),
                                            "risk"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onClose,
                "aria-label": "Close",
                className: "p-1.5 rounded-lg text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[20px]",
                    children: "close"
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 192,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
function TestToolbar({ model, onModelChange, modelOptions, selectedKey, onSelectedKeyChange, keys, controls }) {
    const hasMessages = controls?.hasMessages ?? false;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-2 px-4 py-2 border-b border-black/5 dark:border-white/5 bg-bg-subtle/30 shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 min-w-0 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-[11px] text-text-muted shrink-0",
                        children: "Model:"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: model,
                        onChange: (e)=>onModelChange(e.target.value),
                        className: "min-w-0 flex-1 rounded-md border border-border bg-bg-subtle text-xs px-2 py-1 text-text-main focus:outline-none focus:ring-1 focus:ring-primary",
                        children: [
                            modelOptions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "—"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 225,
                                columnNumber: 41
                            }, this),
                            modelOptions.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: m.id,
                                    children: m.id
                                }, m.id, false, {
                                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                    lineNumber: 227,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 220,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            keys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-[11px] text-text-muted shrink-0",
                        children: "Key:"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 235,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedKey,
                        onChange: (e)=>onSelectedKeyChange(e.target.value),
                        className: "rounded-md border border-border bg-bg-subtle text-xs px-2 py-1 text-text-main focus:outline-none focus:ring-1 focus:ring-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "(default)"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this),
                            keys.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: k.key,
                                    children: k.name ?? k.id
                                }, k.id, false, {
                                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                    lineNumber: 243,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 234,
                columnNumber: 9
            }, this),
            hasMessages && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>controls?.clear(),
                className: "text-[11px] text-text-muted hover:text-text-main transition-colors flex items-center gap-1",
                title: "Clear conversation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: "delete_sweep"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 257,
                        columnNumber: 11
                    }, this),
                    "Clear"
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 251,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 217,
        columnNumber: 5
    }, this);
}
function SlideOverTabs({ tab, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "tablist",
        className: "flex items-center gap-1 px-4 pt-2 border-b border-black/5 dark:border-white/5 shrink-0",
        children: TABS.map((t)=>{
            const active = t.key === tab;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                role: "tab",
                type: "button",
                "aria-selected": active,
                onClick: ()=>onChange(t.key),
                className: `relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${active ? "text-accent" : "text-text-muted hover:text-text-main"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px]",
                        children: t.icon
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 284,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t.label
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 285,
                        columnNumber: 13
                    }, this),
                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "absolute left-0 right-0 -bottom-px h-0.5 bg-accent rounded-t"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 287,
                        columnNumber: 15
                    }, this)
                ]
            }, t.key, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 274,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 267,
        columnNumber: 5
    }, this);
}
function TabPlaceholder({ icon, title, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center gap-3 p-10 text-center flex-1 min-h-0 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-12 rounded-full bg-accent/10 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-accent text-[24px]",
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-text-main",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-text-muted max-w-sm",
                children: body
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 306,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 301,
        columnNumber: 5
    }, this);
}
function formatRequester(log) {
    const name = log.apiKeyName || log.account;
    const keyHint = log.apiKey || log.apiKeyId;
    const masked = typeof keyHint === "string" && keyHint.length > 8 ? `${keyHint.slice(0, 4)}…${keyHint.slice(-4)}` : keyHint || "";
    if (name && masked) return {
        label: name,
        title: `${name} (${masked})`
    };
    if (name) return {
        label: name,
        title: name
    };
    if (masked) return {
        label: masked,
        title: keyHint || masked
    };
    return {
        label: "—",
        title: "unknown requester"
    };
}
function LogsTab({ providerId }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        status: "loading"
    });
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [refreshTick, setRefreshTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const ctrl = new AbortController();
        async function load() {
            try {
                const url = `/api/usage/call-logs?provider=${encodeURIComponent(providerId)}&limit=20`;
                const res = await fetch(url, {
                    signal: ctrl.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (cancelled) return;
                const logs = Array.isArray(data) ? data : data?.logs ?? [];
                setState({
                    status: "ready",
                    logs
                });
            } catch (err) {
                if (cancelled || err?.name === "AbortError") return;
                setState({
                    status: "error",
                    message: err.message || "Failed to load logs"
                });
            }
        }
        void load();
        const interval = setInterval(load, 2000);
        return ()=>{
            cancelled = true;
            ctrl.abort();
            clearInterval(interval);
        };
    }, [
        providerId,
        refreshTick
    ]);
    const handleRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setRefreshTick((n)=>n + 1), []);
    if (state.status === "loading") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 min-h-0 flex items-center justify-center text-xs text-text-muted gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[18px] animate-spin",
                    children: "progress_activity"
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 384,
                    columnNumber: 9
                }, this),
                "Loading logs…"
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
            lineNumber: 383,
            columnNumber: 7
        }, this);
    }
    if (state.status === "error") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TabPlaceholder, {
            icon: "error",
            title: "Failed to load logs",
            body: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: state.message
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 394,
                columnNumber: 70
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
            lineNumber: 394,
            columnNumber: 7
        }, this);
    }
    if (state.logs.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TabPlaceholder, {
            icon: "receipt_long",
            title: "No logs yet",
            body: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Send a test message from the Test tab — logs for this provider will appear here."
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 405,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `/dashboard/logs?connection=${encodeURIComponent(providerId)}`,
                        className: "mt-2 inline-flex items-center gap-1 text-accent hover:underline",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: [
                            "Open full logs page",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "open_in_new"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 406,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
            lineNumber: 400,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 min-h-0 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-4 py-2 border-b border-black/5 dark:border-white/5 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-muted font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "relative inline-flex h-2 w-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 427,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 428,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 426,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-emerald-500",
                                        children: "Live"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 430,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 425,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                children: "·"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 432,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "tailing last ",
                                    state.logs.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 433,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 424,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleRefresh,
                        className: "text-[10px] text-text-muted hover:text-text-main inline-flex items-center gap-1",
                        title: "Refresh now",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 441,
                                columnNumber: 11
                            }, this),
                            "Refresh"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 435,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 423,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "flex-1 min-h-0 overflow-y-auto divide-y divide-border/40",
                children: state.logs.map((log)=>{
                    const key = String(log.id);
                    const isExpanded = expanded === key;
                    const statusOk = typeof log.status === "number" && log.status >= 200 && log.status < 400;
                    const statusColor = statusOk ? "text-emerald-600 dark:text-emerald-400" : typeof log.status === "number" ? "text-red-500" : "text-text-muted";
                    const requester = formatRequester(log);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setExpanded(isExpanded ? null : key),
                                className: "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[11px] font-mono shrink-0 w-10 ${statusColor}`,
                                        children: log.status ?? "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 463,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-text-muted shrink-0 w-20 font-mono",
                                        children: formatRelativeTs(log.timestamp)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 466,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0 flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs truncate text-text-main",
                                                title: log.model || log.requestedModel,
                                                children: log.model || log.requestedModel || "—"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 470,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-text-muted truncate font-mono",
                                                title: requester.title,
                                                children: requester.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                                lineNumber: 476,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 469,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-text-muted shrink-0 font-mono w-14 text-right",
                                        children: formatDurationMs(log.duration)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 483,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-text-muted text-[16px] shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`,
                                        children: "chevron_right"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                        lineNumber: 486,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 458,
                                columnNumber: 15
                            }, this),
                            isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LogDetail, {
                                log: log
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                                lineNumber: 492,
                                columnNumber: 30
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 457,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 445,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2 border-t border-black/5 dark:border-white/5 text-[10px] text-text-muted text-center shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: `/dashboard/logs?connection=${encodeURIComponent(providerId)}`,
                    className: "inline-flex items-center gap-1 hover:text-text-main hover:underline",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: [
                        "Open full logs page",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[12px]",
                            children: "open_in_new"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                            lineNumber: 505,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                    lineNumber: 498,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 497,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 422,
        columnNumber: 5
    }, this);
}
function LogDetail({ log }) {
    const requester = formatRequester(log);
    const tokensIn = log.tokens?.in;
    const tokensOut = log.tokens?.out;
    const rows = [
        {
            label: "Timestamp",
            value: new Date(log.timestamp).toLocaleString(),
            mono: true
        },
        {
            label: "Status",
            value: String(log.status ?? "—")
        },
        {
            label: "Duration",
            value: formatDurationMs(log.duration)
        },
        {
            label: "Model",
            value: log.model || "—",
            mono: true
        },
        {
            label: "Requested model",
            value: log.requestedModel || "—",
            mono: true
        },
        {
            label: "Provider",
            value: log.providerDisplay || log.provider || "—",
            mono: true
        },
        {
            label: "Requester",
            value: requester.title,
            mono: true
        },
        {
            label: "Tokens",
            value: tokensIn != null || tokensOut != null ? `in ${tokensIn ?? 0} · out ${tokensOut ?? 0}` : "—"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
        className: "px-4 py-3 bg-bg-subtle/40 border-t border-black/5 dark:border-white/5 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-[11px]",
        children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "contents",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                        className: "text-text-muted uppercase tracking-wider text-[10px] font-medium",
                        children: row.label
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 534,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                        className: `text-text-main min-w-0 break-words ${row.mono ? "font-mono" : ""}`,
                        children: row.value
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                        lineNumber: 537,
                        columnNumber: 11
                    }, this)
                ]
            }, row.label, true, {
                fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
                lineNumber: 533,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/shared/components/ProviderTestSlideOver.tsx",
        lineNumber: 531,
        columnNumber: 5
    }, this);
}
function formatRelativeTs(ts) {
    if (!ts) return "—";
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "—";
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.max(0, Math.floor(diff))}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}
function formatDurationMs(ms) {
    if (ms == null) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-ssr] (ecmascript) <export default as Badge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript) <export default as Toggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderTestSlideOver$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderTestSlideOver.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/featuredProviders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$context$2f$openRouterProviderStatsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/context/openRouterProviderStatsContext.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderTestSlideOver$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderTestSlideOver$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const KIND_LABEL = {
    llm: "Chat",
    embedding: "Embed",
    image: "Image",
    imageToText: "I→T",
    tts: "TTS",
    stt: "STT",
    webSearch: "Search",
    webFetch: "Fetch",
    video: "Video",
    music: "Music"
};
/** Maps a compatible-provider `apiType` to its `KIND_LABEL` key (#6936: non-chat
 * apiTypes — audio/embeddings/image — were falling through to the "Chat" badge). */ const COMPATIBLE_API_TYPE_KIND = {
    "audio-transcriptions": "stt",
    "audio-speech": "tts",
    "images-generations": "image",
    embeddings: "embedding"
};
const DOT_COLORS = {
    free: "bg-green-500",
    "no-auth": "bg-stone-500",
    oauth: "bg-blue-500",
    apikey: "bg-amber-500",
    compatible: "bg-orange-500",
    "web-cookie": "bg-purple-500",
    search: "bg-teal-500",
    audio: "bg-rose-500",
    local: "bg-emerald-500",
    "upstream-proxy": "bg-indigo-500",
    "cloud-agent": "bg-violet-500"
};
function providerText(t, key, fallback, values) {
    if (typeof t.has === "function" && t.has(key)) {
        return t(key, values);
    }
    if (values) {
        return Object.entries(values).reduce((acc, [name, value])=>acc.replaceAll(`{${name}}`, String(value)), fallback);
    }
    return fallback;
}
function getStatusDisplay(connected, error, warning, errorCode, t, afterConnected) {
    const parts = [];
    if (connected > 0) {
        parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
            variant: "success",
            size: "sm",
            dot: true,
            children: t("connected", {
                count: connected
            })
        }, "connected", false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
            lineNumber: 128,
            columnNumber: 7
        }, this));
        if (afterConnected) parts.push(afterConnected);
    }
    if (warning > 0) {
        parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
            variant: "warning",
            size: "sm",
            dot: true,
            children: t("warningCount", {
                count: warning
            })
        }, "warning", false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
            lineNumber: 136,
            columnNumber: 7
        }, this));
    }
    if (error > 0) {
        const errText = errorCode ? t("errorCount", {
            count: error,
            code: errorCode
        }) : t("errorCountNoCode", {
            count: error
        });
        parts.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
            variant: "error",
            size: "sm",
            dot: true,
            children: errText
        }, "error", false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
            lineNumber: 146,
            columnNumber: 7
        }, this));
    }
    if (parts.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-text-muted",
            children: t("noConnections")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
            lineNumber: 152,
            columnNumber: 12
        }, this);
    }
    return parts;
}
const ProviderCard = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function ProviderCard({ providerId, provider, stats, authType = "apikey", onToggle, onCardClick }, ref) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const tp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("miniPlayground");
    const [testExpanded, setTestExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const innerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const linkElementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>({
            getProviderId () {
                return providerId;
            },
            highlight () {
                const el = innerRef.current;
                if (!el) return;
                linkElementRef.current?.focus();
                const surface = linkElementRef.current?.firstElementChild;
                surface?.animate([
                    {
                        backgroundColor: "rgba(59,130,246,0.22)"
                    },
                    {
                        backgroundColor: "rgba(59,130,246,0.08)"
                    },
                    {
                        backgroundColor: "transparent"
                    }
                ], {
                    duration: 3000,
                    easing: "ease-in-out"
                });
            },
            scrollIntoView () {
                const el = innerRef.current;
                if (!el) return;
                el.scrollIntoView({
                    behavior: "auto",
                    block: "center"
                });
            }
        }), [
        providerId,
        innerRef,
        linkElementRef
    ]);
    // Show the Test button for LLM providers (when serviceKinds includes "llm"
    // OR when the provider has no explicit serviceKinds but is a regular LLM provider
    // i.e. not a search/audio/cloud-agent type).
    const serviceKinds = provider.serviceKinds ?? [];
    const isLlmProvider = serviceKinds.includes("llm") || serviceKinds.length === 0 && authType !== "search" && authType !== "audio" && authType !== "cloud-agent" && authType !== "upstream-proxy" && authType !== "no-auth";
    const handleTestClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setTestExpanded((v)=>!v);
    };
    const connected = Number(stats.connected || 0);
    const error = Number(stats.error || 0);
    const allDisabled = Boolean(stats.allDisabled);
    const isCompatible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId);
    const isCcCompatible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId);
    const isAnthropicCompatible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId) && !isCcCompatible;
    // Open Source Friend highlights (Kimi 2026-07, Cheaper Inference 2026-07): UI-only
    // accents, see featuredProviders.ts — never affect routing/fallback order.
    const isKimiPartner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKimiPartnerProviderId"])(provider.id || providerId);
    const isCheaperInferencePartner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$featuredProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isCheaperInferenceProviderId"])(provider.id || providerId);
    const isSponsorPartner = isKimiPartner || isCheaperInferencePartner;
    const openRouterStat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$context$2f$openRouterProviderStatsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOpenRouterProviderStat"])(provider.id || providerId);
    const codexServiceTierLabel = stats.codexServiceTier === "flex" ? providerText(t, "codexTierFlexLabel", "Flex") : providerText(t, "codexTierFastLabel", "Fast");
    const codexServiceTierChip = providerId === "codex" && stats.codexServiceTier && stats.codexServiceTier !== "default" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide ${stats.codexServiceTier === "flex" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"}`,
        title: providerText(t, "codexServiceTierActive", "Codex {tier} service tier is active", {
            tier: codexServiceTierLabel
        }),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[10px] leading-none",
                children: stats.codexServiceTier === "flex" ? "speed" : "bolt"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 250,
                columnNumber: 9
            }, this),
            codexServiceTierLabel
        ]
    }, "codex-service-tier", true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
        lineNumber: 239,
        columnNumber: 7
    }, this) : null;
    // Kimi (Moonshot AI) official-partnership badge — literal brand-blue Tailwind
    // arbitrary values must stay in sync with KIMI_BRAND_COLOR (featuredProviders.ts).
    const kimiOfficialSupporterChip = isKimiPartner ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-0.5 rounded-full border border-[#1783FF]/30 bg-[#1783FF]/10 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide leading-none text-[#1067CC] dark:text-[#7CB8FF]",
        title: providerText(t, "kimiOfficialSupporterTooltip", "Kimi (Moonshot AI) is OmniRoute's founding Open Source Friend"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[10px] leading-none",
                children: "verified"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 269,
                columnNumber: 7
            }, this),
            providerText(t, "kimiOfficialSupporterBadge", "Founding Friend")
        ]
    }, "kimi-official-supporter", true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
        lineNumber: 260,
        columnNumber: 5
    }, this) : null;
    // Cheaper Inference Open Source Friend badge — brand green (#31f889) with a dark
    // foreground (the green is too bright for white text). Literal Tailwind arbitrary
    // values must stay in sync with CHEAPERINFERENCE_BRAND_COLOR (featuredProviders.ts).
    const cheaperInferenceSupporterChip = isCheaperInferencePartner ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-0.5 rounded-full border border-[#31f889]/40 bg-[#31f889]/15 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide leading-none text-[#0b7a45] dark:text-[#5CF0A6]",
        title: providerText(t, "cheaperInferenceSupporterTooltip", "Cheaper Inference backs OmniRoute as an Open Source Friend"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[10px] leading-none",
                children: "verified"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            providerText(t, "cheaperInferenceSupporterBadge", "Open Source Friend")
        ]
    }, "cheaperinference-supporter", true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
        lineNumber: 278,
        columnNumber: 5
    }, this) : null;
    const openRouterTooltipBits = [];
    if (openRouterStat?.headquarters) openRouterTooltipBits.push(`HQ: ${openRouterStat.headquarters}`);
    if (openRouterStat?.dataPolicy?.training === false) {
        openRouterTooltipBits.push(providerText(t, "openRouterNoTraining", "Does not train on prompts"));
    }
    if (openRouterStat?.dataPolicy?.retainsPrompts === false) {
        openRouterTooltipBits.push(providerText(t, "openRouterNoRetention", "Does not retain prompts"));
    }
    const openRouterTooltip = openRouterStat ? providerText(t, "openRouterPopularityTooltip", "OpenRouter usage rank #{rank}", {
        rank: openRouterStat.popularityRank
    }) + (openRouterTooltipBits.length ? ` — ${openRouterTooltipBits.join(" · ")}` : "") : "";
    // OpenRouter popularity badge — data refreshed daily from OpenRouter's
    // provider directory + usage rankings (see src/lib/catalog/openrouterProviderStats.ts).
    // Absent entirely for providers OpenRouter doesn't track; never affects routing.
    const openRouterPopularityChip = openRouterStat ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-0.5 rounded-full border border-border bg-bg-subtle px-1.5 py-0 text-[9px] font-semibold leading-none text-text-muted",
        title: openRouterTooltip,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[10px] leading-none",
                children: "trending_up"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 318,
                columnNumber: 7
            }, this),
            providerText(t, "openRouterPopularityBadge", "OR #{rank}", {
                rank: openRouterStat.popularityRank
            })
        ]
    }, "openrouter-popularity", true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
        lineNumber: 313,
        columnNumber: 5
    }, this) : null;
    const dotLabels = {
        free: tc("free"),
        "no-auth": t("noAuthLabel"),
        oauth: t("oauthLabel"),
        apikey: t("apiKeyLabel"),
        compatible: t("compatibleLabel"),
        "web-cookie": t("webCookieProviders"),
        search: t("searchProvidersHeading"),
        audio: t("audioProvidersHeading"),
        local: t("localProviders"),
        "upstream-proxy": t("upstreamProxyProviders"),
        "cloud-agent": t("cloudAgentProviders")
    };
    const staticIconPath = (()=>{
        if (isCompatible) {
            return provider.apiType === "responses" ? "/providers/oai-r.png" : "/providers/oai-cc.png";
        }
        if (isAnthropicCompatible || isCcCompatible) return "/providers/anthropic-m.png";
        return null;
    })();
    const handleToggle = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        onToggle(allDisabled);
    };
    const handleCardClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        onCardClick?.(providerId);
    }, [
        onCardClick,
        providerId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: innerRef,
        id: `provider-${providerId}`,
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                ref: linkElementRef,
                href: `/dashboard/providers/${providerId}`,
                className: "group flex-1 flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
                onClick: handleCardClick,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                    padding: "xs",
                    className: `h-full flex flex-col hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${isKimiPartner ? // (#1783FF) border (2px, clearly legible) + a subtle whole-card tint
                    // (inset shadow — avoids clobbering Card's own bg-surface via
                    // twMerge) + soft outer glow. Kept identical in light/dark since it
                    // is a raw (non-token) brand hex, not a theme color. Keep the hex in
                    // sync with KIMI_BRAND_COLOR (featuredProviders.ts).
                    "border-2 border-[#1783FF]/70 hover:border-[#1783FF]/90 shadow-[inset_0_0_0_100px_rgba(23,131,255,0.035),0_4px_16px_-4px_rgba(23,131,255,0.45)]" : isCheaperInferencePartner ? // its brand green (#31f889 = rgb(49,248,137)). Keep in sync with
                    // CHEAPERINFERENCE_BRAND_COLOR (featuredProviders.ts).
                    "border-2 border-[#31f889]/70 hover:border-[#31f889]/90 shadow-[inset_0_0_0_100px_rgba(49,248,137,0.035),0_4px_16px_-4px_rgba(49,248,137,0.45)]" : "hover:border-primary/40"} ${allDisabled ? "opacity-50" : ""} ${provider.deprecated ? "opacity-60" : ""}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2 h-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "size-9 rounded-lg flex items-center justify-center shrink-0",
                                        style: {
                                            backgroundColor: `${provider.color || "#64748b"}15`
                                        },
                                        children: provider.iconUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: provider.id || providerId,
                                            src: provider.iconUrl,
                                            alt: provider.name,
                                            size: 26,
                                            className: "max-h-[26px] max-w-[26px] rounded-lg object-contain",
                                            fallbackText: provider.textIcon,
                                            fallbackColor: provider.color
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 392,
                                            columnNumber: 19
                                        }, this) : staticIconPath ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            src: staticIconPath,
                                            alt: provider.name,
                                            width: 26,
                                            height: 26,
                                            className: "object-contain rounded-lg max-w-[26px] max-h-[26px]",
                                            sizes: "26px"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 402,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: provider.id || providerId,
                                            size: 24,
                                            type: "color"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 411,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 387,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold leading-snug flex-1 min-w-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `block break-words ${provider.deprecated ? "line-through opacity-60" : ""}`,
                                            title: provider.name,
                                            children: provider.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 415,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 414,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 shrink-0 pt-0.5",
                                        children: [
                                            provider.deprecated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[16px] leading-none text-text-muted",
                                                title: provider.deprecationReason || t("deprecatedProvider"),
                                                "aria-label": t("deprecated"),
                                                children: "block"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 424,
                                                columnNumber: 19
                                            }, this),
                                            provider.subscriptionRisk === true && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[16px] leading-none text-amber-500",
                                                title: t("riskNotice.tooltip"),
                                                "aria-label": t("riskNotice.tooltip"),
                                                children: "info"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 433,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CategoryDot"], {
                                                color: DOT_COLORS[authType] || DOT_COLORS.apikey,
                                                hasFree: provider.hasFree === true,
                                                label: dotLabels[authType] || t("apiKeyLabel"),
                                                freeLabel: t("hasFreeTooltip")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 441,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 422,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                lineNumber: 386,
                                columnNumber: 13
                            }, this),
                            (provider.serviceKinds && provider.serviceKinds.length > 0 || isCompatible || isCcCompatible || isAnthropicCompatible || isSponsorPartner || Boolean(openRouterStat)) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-center gap-1",
                                children: [
                                    kimiOfficialSupporterChip,
                                    cheaperInferenceSupporterChip,
                                    openRouterPopularityChip,
                                    provider.serviceKinds?.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-muted leading-none",
                                            children: KIND_LABEL[k] ?? k
                                        }, k, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 462,
                                            columnNumber: 19
                                        }, this)),
                                    isCompatible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                        variant: "default",
                                        size: "sm",
                                        children: provider.apiType === "responses" ? t("responses") : KIND_LABEL[COMPATIBLE_API_TYPE_KIND[provider.apiType ?? ""] ?? ""] ?? t("chat")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 470,
                                        columnNumber: 19
                                    }, this),
                                    isCcCompatible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                        variant: "default",
                                        size: "sm",
                                        children: "CC"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 478,
                                        columnNumber: 19
                                    }, this),
                                    isAnthropicCompatible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                        variant: "default",
                                        size: "sm",
                                        children: t("messages")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 483,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                lineNumber: 457,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2 mt-auto pt-1.5 border-t border-border/40",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 text-xs flex-nowrap min-w-0 overflow-hidden",
                                        children: allDisabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                            variant: "default",
                                            size: "sm",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[12px]",
                                                        children: "pause_circle"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                        lineNumber: 496,
                                                        columnNumber: 23
                                                    }, this),
                                                    t("disabled")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 495,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                            lineNumber: 494,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                getStatusDisplay(connected, error, Number(stats.warning || 0), stats.errorCode, t, codexServiceTierChip),
                                                stats.expiryStatus === "expired" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                                    variant: "error",
                                                    size: "sm",
                                                    dot: true,
                                                    children: t("expiredBadge")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 23
                                                }, this),
                                                stats.expiryStatus === "expiring_soon" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
                                                    variant: "warning",
                                                    size: "sm",
                                                    dot: true,
                                                    children: t("expiringSoonBadge")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 23
                                                }, this),
                                                stats.errorTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-text-muted truncate min-w-0",
                                                    children: [
                                                        "* ",
                                                        stats.errorTime
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 492,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 shrink-0",
                                        children: [
                                            Number(stats.total || 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: handleToggle,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                                                    size: "xs",
                                                    checked: !allDisabled,
                                                    onChange: undefined,
                                                    title: allDisabled ? t("enableProvider") : t("disableProvider")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                    lineNumber: 529,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 528,
                                                columnNumber: 19
                                            }, this),
                                            isLlmProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleTestClick,
                                                title: tp("expandTest"),
                                                className: "inline-flex items-center gap-0.5 rounded-md border border-border bg-bg-subtle px-2 py-0.5 text-[11px] text-text-muted hover:text-text-primary hover:border-primary/30 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[11px] leading-none",
                                                        children: "play_arrow"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 21
                                                    }, this),
                                                    tp("testLabel")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 538,
                                                columnNumber: 19
                                            }, this),
                                            !isLlmProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-text-muted opacity-0 group-hover:opacity-100 transition-opacity",
                                                children: "chevron_right"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                                lineNumber: 551,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                                lineNumber: 491,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                        lineNumber: 384,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                    lineNumber: 365,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this),
            isLlmProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderTestSlideOver$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: testExpanded,
                onClose: ()=>setTestExpanded(false),
                providerId: providerId,
                provider: provider,
                staticIconPath: staticIconPath
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
                lineNumber: 561,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx",
        lineNumber: 358,
        columnNumber: 5
    }, this);
});
const __TURBOPACK__default__export__ = ProviderCard;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCountBadge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProviderCountBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
function ProviderCountBadge({ configured, total }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    if (total === 0) return null;
    const colorClass = configured === 0 ? "text-text-muted" : configured === total ? "text-green-500" : "text-amber-500";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `text-xs font-medium ${colorClass}`,
        title: t("configuredCount", {
            configured,
            total
        }),
        children: [
            configured,
            "/",
            total
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCountBadge.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>NoAuthProvidersSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCountBadge.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
function NoAuthProvidersSection({ visibleEntries, count, blockedEntries, blockedProviders, onBlockedChange, onError, testingMode, onBatchTest, onToggleProvider }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const handleUnblock = async (providerId)=>{
        const alias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(providerId);
        const keysToRemove = new Set([
            providerId,
            alias
        ].filter(Boolean));
        const previous = blockedProviders;
        const next = previous.filter((p)=>!keysToRemove.has(p));
        onBlockedChange(next);
        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    blockedProviders: next
                })
            });
            const data = await response.json().catch(()=>({}));
            if (!response.ok) {
                throw new Error(data?.error?.message || data?.error || "Failed to update provider");
            }
            onBlockedChange(Array.isArray(data.blockedProviders) ? data.blockedProviders : next);
        } catch (error) {
            onBlockedChange(previous);
            onError(error instanceof Error ? error.message : t("repairEnvFailed"));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                        children: [
                            t("noAuthProviders"),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "size-2.5 rounded-full bg-stone-500",
                                title: t("noAuthLabel")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                ...count
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onBatchTest("no-auth"),
                        disabled: !!testingMode,
                        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "no-auth" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                        title: t("testAll"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `material-symbols-outlined text-[14px]${testingMode === "no-auth" ? " animate-spin" : ""}`,
                                children: "play_arrow"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            testingMode === "no-auth" ? t("testing") : t("testAll")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-muted -mt-2",
                children: t("noAuthProvidersDesc")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                children: visibleEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        providerId: providerId,
                        provider: provider,
                        stats: stats,
                        authType: "no-auth",
                        onToggle: (active)=>onToggleProvider(providerId, toggleAuthType, active)
                    }, providerId, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            blockedEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium uppercase tracking-wide text-text-muted",
                        children: t("disabled")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                        children: blockedEntries.map(({ providerId, provider })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2 rounded-xl border border-border bg-bg-subtle px-3 py-2.5 opacity-80",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex min-w-0 flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "truncate text-sm font-medium text-text-main",
                                                children: provider.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                                lineNumber: 136,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "size-1.5 rounded-full bg-red-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                                        lineNumber: 140,
                                                        columnNumber: 21
                                                    }, this),
                                                    t("disabled")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                                lineNumber: 139,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                        lineNumber: 135,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleUnblock(providerId),
                                        className: "shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:border-primary/40 hover:text-text-primary",
                                        title: t("enableProvider"),
                                        children: t("enableProvider")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, providerId, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                                lineNumber: 131,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
                lineNumber: 125,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/providerPageHighlightUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recordProviderNavigation",
    ()=>recordProviderNavigation,
    "resolveHighlightedCard",
    ()=>resolveHighlightedCard
]);
function recordProviderNavigation(id) {
    window.history.replaceState({
        providerId: id
    }, "");
}
function resolveHighlightedCard(handle, highlightedProviderId, onAfterHighlight) {
    if (handle?.getProviderId() === highlightedProviderId) {
        handle.scrollIntoView({
            behavior: "auto",
            block: "center"
        });
        handle.highlight();
    }
    onAfterHighlight();
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/HighlightableProviderCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>HighlightableProviderCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageHighlightUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageHighlightUtils.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
function HighlightableProviderCard(props) {
    const [highlightedProviderId, setHighlightedProviderId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>window.history.state?.providerId ?? null);
    const handleCardClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageHighlightUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recordProviderNavigation"])(id);
    }, []);
    const highlightedCardRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((handle)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageHighlightUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveHighlightedCard"])(handle, highlightedProviderId, ()=>setHighlightedProviderId(null));
    }, [
        highlightedProviderId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        ...props,
        onCardClick: handleCardClick,
        ref: highlightedCardRef
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/HighlightableProviderCard.tsx",
        lineNumber: 35,
        columnNumber: 10
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProviderDisplayModeControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function providerText(t, key, fallback, values) {
    if (typeof t.has === "function" && t.has(key)) {
        return t(key, values);
    }
    if (values) {
        return Object.entries(values).reduce((acc, [name, value])=>acc.replaceAll(`{${name}}`, String(value)), fallback);
    }
    return fallback;
}
function ProviderDisplayModeControl({ disabledConfigured, mode, onChange, t }) {
    const options = [
        {
            mode: "all",
            label: providerText(t, "providerDisplayModeAll", "All"),
            icon: "view_module",
            title: providerText(t, "providerDisplayModeAllDesc", "Show every provider in grouped sections.")
        },
        {
            mode: "configured",
            label: providerText(t, "providerDisplayModeConfigured", "Configured"),
            icon: "check_circle",
            disabled: disabledConfigured,
            title: providerText(t, "providerDisplayModeConfiguredDesc", "Show providers with saved connections.")
        },
        {
            mode: "compact",
            label: providerText(t, "providerDisplayModeCompact", "Compact"),
            icon: "view_agenda",
            title: providerText(t, "providerDisplayModeCompactDesc", "Show configured and no-auth providers once in a single flat list.")
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center rounded-lg border border-border bg-bg-subtle p-0.5",
        role: "radiogroup",
        "aria-label": providerText(t, "providerDisplayMode", "Provider display mode"),
        "data-testid": "provider-display-mode-control",
        children: options.map((option)=>{
            const isActive = mode === option.mode;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                title: option.title,
                "data-testid": `provider-display-mode-${option.mode}`,
                "data-active": isActive ? "true" : "false",
                className: `inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${isActive ? "bg-bg-primary text-text-main shadow-sm" : "text-text-muted hover:bg-bg-primary/70 hover:text-text-main"} ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "radio",
                        name: "provider-display-mode",
                        value: option.mode,
                        checked: isActive,
                        disabled: option.disabled,
                        onChange: ()=>onChange(option.mode),
                        className: "sr-only",
                        "aria-label": option.title
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx",
                        lineNumber: 101,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        "aria-hidden": "true",
                        children: option.icon
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx",
                        lineNumber: 111,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: option.label
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx",
                        lineNumber: 114,
                        columnNumber: 13
                    }, this)
                ]
            }, option.mode, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx",
                lineNumber: 90,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ProviderSummaryCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderDisplayModeControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderDisplayModeControl.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
function providerText(t, key, fallback, values) {
    if (typeof t.has === "function" && t.has(key)) {
        return t(key, values);
    }
    if (values) {
        return Object.entries(values).reduce((acc, [name, value])=>acc.replaceAll(`{${name}}`, String(value)), fallback);
    }
    return fallback;
}
const SERVICE_KIND_CHIPS = [
    {
        key: "image",
        icon: "image",
        labelKey: "serviceKindImage",
        fallback: "Image"
    },
    {
        key: "video",
        icon: "videocam",
        labelKey: "serviceKindVideo",
        fallback: "Video"
    },
    {
        key: "music",
        icon: "music_note",
        labelKey: "serviceKindMusic",
        fallback: "Music"
    },
    {
        key: "tts",
        icon: "record_voice_over",
        labelKey: "serviceKindTts",
        fallback: "Text→Speech"
    },
    {
        key: "stt",
        icon: "hearing",
        labelKey: "serviceKindStt",
        fallback: "Speech→Text"
    },
    {
        key: "embedding",
        icon: "scatter_plot",
        labelKey: "serviceKindEmbedding",
        fallback: "Embedding"
    }
];
function ProviderSummaryCard({ activeCategory, activeServiceKind, onServiceKindChange, disabledConfigured, displayMode, modelSearchQuery, onBatchTest, onCategoryChange, onDisplayModeChange, onNewProvider, onImportFromFile, searchQuery, setModelSearchQuery, setSearchQuery, showFreeOnly, summaryStats, t, tc, testingMode }) {
    const categories = [
        {
            key: null,
            color: null,
            label: t("providerSummaryAll"),
            stat: summaryStats.all
        },
        {
            key: "oauth",
            color: "bg-blue-500",
            label: t("oauthLabel"),
            stat: summaryStats.oauth
        },
        {
            key: "ide",
            color: "bg-cyan-500",
            label: "IDE",
            stat: summaryStats.ide
        },
        {
            key: "free",
            color: "bg-green-500",
            label: t("freeTier"),
            stat: summaryStats.free,
            title: t("freeAggregated")
        },
        {
            key: "no-auth",
            color: "bg-stone-500",
            label: t("noAuthLabel"),
            stat: summaryStats.noauth
        },
        {
            key: "upstream-proxy",
            color: "bg-indigo-500",
            label: t("upstreamProxyLabel"),
            stat: summaryStats.upstreamproxy
        },
        {
            key: "apikey",
            color: "bg-amber-500",
            label: t("apiKeyLabel"),
            stat: summaryStats.apikey
        },
        {
            key: "compatible",
            color: "bg-orange-500",
            label: t("compatibleLabel"),
            stat: summaryStats.compatible
        },
        {
            key: "webcookie",
            color: "bg-purple-500",
            label: "Web Cookie",
            stat: summaryStats.webcookie
        },
        {
            key: "search",
            color: "bg-teal-500",
            label: "Search",
            stat: summaryStats.search
        },
        {
            key: "webfetch",
            color: "bg-orange-500",
            label: t("webFetch"),
            stat: summaryStats.webfetch,
            title: t("webFetchTooltip")
        },
        {
            key: "audio",
            color: "bg-rose-500",
            label: "Audio",
            stat: summaryStats.audio
        },
        {
            key: "local",
            color: "bg-emerald-500",
            label: "Local",
            stat: summaryStats.local
        },
        {
            key: "cloudagent",
            color: "bg-violet-500",
            label: "Cloud Agent",
            stat: summaryStats.cloudagent
        }
    ].filter((category)=>category.key !== "no-auth" || category.stat.total > 0);
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
                                    onChange: (e)=>setSearchQuery(e.target.value),
                                    placeholder: t("searchProviders"),
                                    "aria-label": t("searchProviders"),
                                    icon: "search",
                                    inputClassName: searchQuery ? "pr-9" : ""
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 159,
                                    columnNumber: 13
                                }, this),
                                searchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSearchQuery(""),
                                    className: "absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text-primary transition-colors",
                                    "aria-label": tc("clear"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px]",
                                        children: "close"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                        lineNumber: 173,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 158,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex-1 min-w-[160px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                    value: modelSearchQuery,
                                    onChange: (e)=>setModelSearchQuery(e.target.value),
                                    placeholder: t("searchByModel") || "Search by model…",
                                    "aria-label": t("searchByModel") || "Search by model",
                                    icon: "psychology",
                                    inputClassName: modelSearchQuery ? "pr-9" : ""
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 178,
                                    columnNumber: 13
                                }, this),
                                modelSearchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setModelSearchQuery(""),
                                    className: "absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text-primary transition-colors",
                                    "aria-label": tc("clear"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px]",
                                        children: "close"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                        lineNumber: 192,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 187,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderDisplayModeControl$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            disabledConfigured: disabledConfigured,
                            mode: displayMode,
                            onChange: onDisplayModeChange,
                            t: t
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            icon: "add",
                            onClick: onNewProvider,
                            children: providerText(t, "onboardingWizardShort", "Onboarding Wizard")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            variant: "secondary",
                            icon: "upload_file",
                            onClick: onImportFromFile,
                            children: providerText(t, "importFromFile", "Import from file")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onBatchTest("all"),
                            disabled: !!testingMode,
                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "all" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                            title: t("testAll"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: testingMode === "all" ? "sync" : "play_arrow"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 218,
                                    columnNumber: 13
                                }, this),
                                testingMode === "all" ? t("testing") : t("testAll")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 208,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                    lineNumber: 157,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t border-border pt-3 flex flex-wrap items-center gap-2",
                    children: categories.map((cat)=>{
                        const isActive = cat.key === null && !activeCategory && !showFreeOnly || cat.key === "free" && showFreeOnly || cat.key !== "free" && cat.key !== null && !showFreeOnly && activeCategory === cat.key;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onCategoryChange(cat.key, cat.key === "free"),
                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isActive ? "bg-primary text-white border-primary" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/30"}`,
                            title: cat.title || cat.label,
                            children: [
                                cat.color && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CategoryDot"], {
                                    color: cat.color,
                                    label: cat.label
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 245,
                                    columnNumber: 31
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: cat.label
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 246,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-[11px] ${isActive ? "text-white/80" : "text-text-muted"}`,
                                    children: [
                                        cat.stat.configured,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "opacity-70",
                                            children: [
                                                "/",
                                                cat.stat.total
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                            lineNumber: 249,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                    lineNumber: 247,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, cat.key ?? "all", true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 235,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                    lineNumber: 225,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t border-border pt-3 flex flex-wrap items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] font-medium uppercase tracking-wide text-text-muted mr-1",
                            children: providerText(t, "filterByMedia", "Media")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 257,
                            columnNumber: 11
                        }, this),
                        SERVICE_KIND_CHIPS.map((chip)=>{
                            const isActive = activeServiceKind === chip.key;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onServiceKindChange(isActive ? null : chip.key),
                                "aria-pressed": isActive,
                                className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isActive ? "bg-primary text-white border-primary" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/30"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: chip.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                        lineNumber: 273,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: providerText(t, chip.labelKey, chip.fallback)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                        lineNumber: 274,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, chip.key, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                                lineNumber: 263,
                                columnNumber: 15
                            }, this);
                        }),
                        activeServiceKind && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onServiceKindChange(null),
                            className: "text-[11px] text-text-muted hover:text-text-primary underline-offset-2 hover:underline",
                            children: providerText(t, "clearMediaFilter", "Clear")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                            lineNumber: 279,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
                    lineNumber: 256,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
            lineNumber: 156,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/providerCompactMode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildCompactProviderEntriesForPage",
    ()=>buildCompactProviderEntriesForPage,
    "getCompactProviderAuthType",
    ()=>getCompactProviderAuthType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageUtils.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getCompactProviderEntryGroups({ activeCategory, showFreeOnly, freeSectionEntries, compatibleProviderEntries, oauthProviderEntries, ideProviderEntries, noAuthEntries, upstreamProxyEntries, llmProviderEntries, aggregatorProviderEntries, enterpriseProviderEntries, embeddingRerankProviderEntries, imageProviderEntries, videoProviderEntries, webCookieProviderEntries, searchProviderEntries, webFetchEntries, audioProviderEntries, localProviderEntries, cloudAgentProviderEntries }) {
    const oauthEntries = oauthProviderEntries.filter((entry)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IDE_PROVIDER_IDS"].has(entry.providerId));
    const apiKeyEntries = [
        llmProviderEntries,
        aggregatorProviderEntries,
        enterpriseProviderEntries,
        embeddingRerankProviderEntries,
        imageProviderEntries,
        videoProviderEntries
    ];
    if (showFreeOnly) return [
        freeSectionEntries
    ];
    if (activeCategory === "compatible") return [
        compatibleProviderEntries
    ];
    if (activeCategory === "oauth") return [
        oauthEntries
    ];
    if (activeCategory === "ide") return [
        ideProviderEntries
    ];
    if (activeCategory === "no-auth") return [
        noAuthEntries
    ];
    if (activeCategory === "upstream-proxy") return [
        upstreamProxyEntries
    ];
    if (activeCategory === "apikey") return apiKeyEntries;
    if (activeCategory === "webcookie") return [
        webCookieProviderEntries
    ];
    if (activeCategory === "search") return [
        searchProviderEntries
    ];
    if (activeCategory === "webfetch") return [
        webFetchEntries
    ];
    if (activeCategory === "audio") return [
        audioProviderEntries
    ];
    if (activeCategory === "local") return [
        localProviderEntries
    ];
    if (activeCategory === "cloudagent") return [
        cloudAgentProviderEntries
    ];
    return [
        compatibleProviderEntries,
        oauthEntries,
        ideProviderEntries,
        webCookieProviderEntries,
        llmProviderEntries,
        upstreamProxyEntries,
        aggregatorProviderEntries,
        enterpriseProviderEntries,
        cloudAgentProviderEntries,
        localProviderEntries,
        searchProviderEntries,
        embeddingRerankProviderEntries,
        imageProviderEntries,
        audioProviderEntries,
        videoProviderEntries,
        noAuthEntries
    ];
}
function buildCompactProviderEntriesForPage(options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildCompactProviderEntries"])(getCompactProviderEntryGroups(options), {
        deferNoAuth: options.activeCategory !== "no-auth"
    });
}
const CATEGORY_AUTH_TYPES = {
    "cloud-agent": "cloud-agent",
    "no-auth": "no-auth",
    "upstream-proxy": "upstream-proxy",
    "web-cookie": "web-cookie",
    audio: "audio",
    local: "local",
    search: "search"
};
function getCompactProviderAuthType(entry, showFreeOnly) {
    if (showFreeOnly && entry.toggleAuthType === "free") return "free";
    if (entry.displayAuthType === "compatible") return "compatible";
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDashboardProviderInfo"])(entry.providerId);
    if (!info) return entry.displayAuthType;
    return CATEGORY_AUTH_TYPES[info.category] ?? entry.displayAuthType;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/providers/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ProvidersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/noAuthProviders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/utils/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerConnectionStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useSyncedModelsByProvider$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useSyncedModelsByProvider.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderUrlFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/hooks/useProviderUrlFilters.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$context$2f$openRouterProviderStatsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/context/openRouterProviderStatsContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerPageStorage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$codexFastTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/codexFastTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/AddCompatibleProviderModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/CategoryDot.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ImportProvidersFromFileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ImportProvidersFromFileModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$NoAuthProvidersSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/NoAuthProvidersSection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/HighlightableProviderCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderCountBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/components/ProviderSummaryCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/providers/providerCompactMode.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderUrlFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ImportProvidersFromFileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$NoAuthProvidersSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderUrlFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ImportProvidersFromFileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$NoAuthProvidersSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
;
;
;
;
function countConfigured(entries) {
    return {
        configured: entries.filter((entry)=>Number(entry.stats?.total || 0) > 0).length,
        total: entries.length
    };
}
function dedupeProviderEntries(entries) {
    const seen = new Set();
    return entries.filter((entry)=>{
        if (seen.has(entry.providerId)) return false;
        seen.add(entry.providerId);
        return true;
    });
}
function providerEntryHasFree(entry) {
    return entry.provider.hasFree === true;
}
function providerText(t, key, fallback, values) {
    if (typeof t.has === "function" && t.has(key)) {
        return t(key, values);
    }
    if (values) {
        return Object.entries(values).reduce((acc, [name, value])=>acc.replaceAll(`{${name}}`, String(value)), fallback);
    }
    return fallback;
}
function getConnectionErrorTag(connection) {
    if (!connection) return null;
    const explicitType = connection.lastErrorType;
    if (explicitType === "runtime_error") return "Runtime";
    if (explicitType === "upstream_auth_error" || explicitType === "auth_missing" || explicitType === "token_refresh_failed" || explicitType === "token_expired") {
        return "Auth";
    }
    if (explicitType === "upstream_rate_limited") return "Rate limited";
    if (explicitType === "upstream_unavailable") return "Server error";
    if (explicitType === "network_error") return "Network";
    const numericCode = Number(connection.errorCode);
    if (Number.isFinite(numericCode) && numericCode >= 400) {
        return String(numericCode);
    }
    const fromMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getErrorCode"])(connection.lastError);
    if (fromMessage === "401" || fromMessage === "403") return "Auth";
    if (fromMessage && fromMessage !== "ERR") return fromMessage;
    const msg = (connection.lastError || "").toLowerCase();
    if (msg.includes("runtime") || msg.includes("not runnable") || msg.includes("not installed")) return "Runtime";
    if (msg.includes("invalid api key") || msg.includes("token invalid") || msg.includes("revoked") || msg.includes("unauthorized")) return "Auth";
    return "ERR";
}
function ProvidersPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [connections, setConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [providerNodes, setProviderNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ccCompatibleProviderEnabled, setCcCompatibleProviderEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [blockedProviders, setBlockedProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [expirations, setExpirations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [codexGlobalServiceMode, setCodexGlobalServiceMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("none");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showAllProviders, setShowAllProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddCompatibleModal, setShowAddCompatibleModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddAnthropicCompatibleModal, setShowAddAnthropicCompatibleModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddCcCompatibleModal, setShowAddCcCompatibleModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showImportFromFileModal, setShowImportFromFileModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [testingMode, setTestingMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [testResults, setTestResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [providerDisplayMode, setProviderDisplayMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [oauthEnvRepairStatus, setOauthEnvRepairStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [repairingEnv, setRepairingEnv] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [modelSearchQuery, setModelSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const liveModelsByProviderId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useSyncedModelsByProvider$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncedModelsByProvider"])();
    const [showFreeOnly, setShowFreeOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [openRouterProviderStats, setOpenRouterProviderStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeCategory, setActiveCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // #4240: media-category (serviceKind) filter — composes with activeCategory,
    // search and configured-only. null = no serviceKind filter.
    const [activeServiceKind, setActiveServiceKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const sectionCategoryAliases = {
        cloud: "cloudagent",
        noauth: "no-auth",
        proxy: "upstream-proxy",
        web: "webcookie"
    };
    const showSection = (category)=>{
        const normalizedCategory = sectionCategoryAliases[category] ?? category;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldShowProviderSection"])(normalizedCategory, activeCategory, showFreeOnly);
    };
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const webCookieProvidersDesc = providerText(t, "webCookieProvidersDesc", "These providers use browser web sessions, cookies, or web tokens instead of API keys. Open a provider to add the required session credential.");
    const ccCompatibleLabel = t("ccCompatibleLabel");
    const addCcCompatibleLabel = t("addCcCompatible");
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { displayModePreferenceReady } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$hooks$2f$useProviderUrlFilters$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProviderUrlFilters"])({
        searchParams,
        providerDisplayMode,
        setProviderDisplayMode,
        searchQuery,
        setSearchQuery,
        modelSearchQuery,
        setModelSearchQuery,
        activeCategory,
        setActiveCategory,
        showFreeOnly,
        setShowFreeOnly,
        activeServiceKind,
        setActiveServiceKind
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchData = async ()=>{
            try {
                // Each request is time-bounded (see loadProviderPageData); a single
                // stalled connection can no longer wedge `loading` on `true` and freeze
                // the page on its skeleton forever.
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadProviderPageData"])();
                setConnections(data.connections);
                setProviderNodes(data.providerNodes);
                setCcCompatibleProviderEnabled(data.ccCompatibleProviderEnabled);
                if (data.expirations) setExpirations(data.expirations);
                if (data.blockedProviders) setBlockedProviders(data.blockedProviders);
                setCodexGlobalServiceMode((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$codexFastTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCodexGlobalServiceMode"])(data.settings));
                setOpenRouterProviderStats(data.openRouterProviderStats);
            } catch (error) {
                console.log("Error fetching data:", error);
            } finally{
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldSyncProviderDisplayMode"])(displayModePreferenceReady, loading)) return;
        const storedDisplayMode = connections.length === 0 && providerDisplayMode === "configured" ? "all" : providerDisplayMode;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeProviderDisplayModePreference"])(storedDisplayMode);
    }, [
        connections.length,
        displayModePreferenceReady,
        providerDisplayMode,
        loading
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageStorage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldSyncProviderDisplayMode"])(displayModePreferenceReady, loading)) return;
        if (connections.length === 0 && providerDisplayMode === "configured") {
            setProviderDisplayMode("all");
        }
    }, [
        connections.length,
        displayModePreferenceReady,
        providerDisplayMode,
        loading
    ]);
    const fetchOauthEnvRepairStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const res = await fetch("/api/system/env/repair", {
                cache: "no-store"
            });
            const data = await res.json();
            if (res.ok) {
                setOauthEnvRepairStatus({
                    available: Boolean(data.available),
                    missingCount: Number(data.missingCount || 0)
                });
            } else {
                setOauthEnvRepairStatus(null);
            }
        } catch  {
            setOauthEnvRepairStatus(null);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void fetchOauthEnvRepairStatus();
    }, [
        fetchOauthEnvRepairStatus
    ]);
    const handleRepairEnv = async ()=>{
        if (!oauthEnvRepairStatus?.available || repairingEnv) return;
        setRepairingEnv(true);
        try {
            const res = await fetch("/api/system/env/repair", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || t("repairEnvFailed"));
            }
            notify.success(data.backupPath ? `${t("repairEnvSuccess")} (${data.backupPath})` : t("repairEnvSuccess"));
            await fetchOauthEnvRepairStatus();
        } catch (error) {
            notify.error(error instanceof Error ? error.message : t("repairEnvFailed"));
        } finally{
            setRepairingEnv(false);
        }
    };
    const getProviderStats = (providerId, authType)=>{
        const providerConnections = connections.filter((c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectionMatchesProviderCard"])(c, providerId, authType));
        const connected = providerConnections.filter((connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isProviderConnectionConnected"])(connection)).length;
        const errorConns = providerConnections.filter((connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerConnectionStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isProviderConnectionErrored"])(connection));
        const error = errorConns.length;
        const total = providerConnections.length;
        // Check if all connections are manually disabled
        const allDisabled = total > 0 && providerConnections.every((c)=>c.isActive === false);
        // Get latest error info
        const latestError = errorConns.sort((a, b)=>new Date(b.lastErrorAt || 0) - new Date(a.lastErrorAt || 0))[0];
        const errorCode = latestError ? getConnectionErrorTag(latestError) : null;
        const errorTime = latestError?.lastErrorAt ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRelativeTime"])(latestError.lastErrorAt) : null;
        // Check expirations
        const providerExpirations = expirations?.list?.filter((e)=>e.provider === providerId) || [];
        const hasExpired = providerExpirations.some((e)=>e.status === "expired");
        const hasExpiringSoon = providerExpirations.some((e)=>e.status === "expiring_soon");
        let expiryStatus = null;
        if (hasExpired) expiryStatus = "expired";
        else if (hasExpiringSoon) expiryStatus = "expiring_soon";
        const codexConnectionServiceTiers = [
            ...new Set(providerConnections.map((connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$codexFastTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCodexEffectiveServiceTier"])(connection.providerSpecificData, "none")).filter((tier)=>tier !== "default"))
        ];
        const codexServiceTier = providerId === "codex" ? codexGlobalServiceMode !== "none" ? codexGlobalServiceMode : codexConnectionServiceTiers.length === 1 ? codexConnectionServiceTiers[0] : null : null;
        // Count API keys in "warning" state across all connections
        const warning = providerConnections.reduce((warnCount, conn)=>{
            const health = conn.providerSpecificData?.apiKeyHealth;
            if (!health) return warnCount;
            return warnCount + Object.values(health).filter((h)=>h.status === "warning").length;
        }, 0);
        return {
            connected,
            error,
            warning,
            total,
            errorCode,
            errorTime,
            allDisabled,
            expiryStatus,
            codexServiceTier
        };
    };
    // Toggle all connections for a provider on/off
    const handleToggleProvider = async (providerId, authType, newActive)=>{
        // Mirror getProviderStats: dual-auth providers (qoder, …) toggle BOTH their
        // oauth and apikey/PAT connections from the single OAuth card.
        const matchesToggle = (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectionMatchesProviderCard"])(c, providerId, authType);
        const providerConns = connections.filter(matchesToggle);
        // Optimistically update UI
        setConnections((prev)=>prev.map((c)=>matchesToggle(c) ? {
                    ...c,
                    isActive: newActive
                } : c));
        // Fire API calls in parallel
        await Promise.allSettled(providerConns.map((c)=>fetch(`/api/providers/${c.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    isActive: newActive
                })
            })));
    };
    const handleBatchTest = async (mode, providerId = null)=>{
        if (testingMode) return;
        setTestingMode(mode === "provider" ? providerId : mode);
        setTestResults(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 90_000); // 90s max
        try {
            const res = await fetch("/api/providers/test-batch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mode,
                    providerId
                }),
                signal: controller.signal
            });
            let data;
            try {
                data = await res.json();
            } catch  {
                // Response body is not valid JSON (e.g. truncated due to timeout)
                data = {
                    error: t("providerTestFailed"),
                    results: [],
                    summary: null
                };
            }
            setTestResults({
                ...data,
                // Normalize error: if API returns an error object { message, details }, extract the string
                error: data.error ? typeof data.error === "object" ? data.error.message || data.error.error || JSON.stringify(data.error) : String(data.error) : null
            });
            if (data?.summary) {
                const { passed, failed, total } = data.summary;
                if (failed === 0) notify.success(t("allTestsPassed", {
                    total
                }));
                else notify.warning(t("testSummary", {
                    passed,
                    failed,
                    total
                }));
            }
        } catch (error) {
            const isAbort = error?.name === "AbortError";
            const msg = isAbort ? t("providerTestTimeout") : t("providerTestFailed");
            setTestResults({
                error: msg,
                results: [],
                summary: null
            });
            notify.error(msg);
        } finally{
            clearTimeout(timeoutId);
            setTestingMode(null);
        }
    };
    const compatibleProviderGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildCompatibleProviderGroups"])(providerNodes, {
            openaiCompatibleName: t("openaiCompatibleName"),
            anthropicCompatibleName: t("anthropicCompatibleName"),
            claudeCodeCompatibleName: ccCompatibleLabel
        }), [
        ccCompatibleLabel,
        providerNodes,
        t
    ]);
    const compatibleProviders = compatibleProviderGroups.openai;
    const anthropicCompatibleProviders = compatibleProviderGroups.anthropic;
    const ccCompatibleProviders = compatibleProviderGroups.claudeCode;
    const effectiveProviderDisplayMode = providerDisplayMode === "configured" && connections.length === 0 ? "all" : providerDisplayMode;
    const effectiveShowConfiguredOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldFilterProviderEntriesForDisplayMode"])(effectiveProviderDisplayMode, connections.length);
    const isCompactProviderDisplay = effectiveProviderDisplayMode === "compact";
    const oauthProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("oauth", getProviderStats);
    const oauthProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(oauthProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const rawNoAuthEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("no-auth", getProviderStats);
    // Partition rather than drop: blocked no-auth providers stay surfaced on the page
    // (rendered with a "Disabled" badge + Enable button) instead of silently vanishing,
    // which left users unable to find/restore a disabled no-auth provider (#5166/#5183).
    // `noAuthEntriesAll` keeps only the visible (non-blocked) entries, so every downstream
    // aggregate/count/model list that consumes it is unchanged.
    const { visible: noAuthEntriesAll, blocked: blockedNoAuthEntries } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partitionNoAuthEntriesByBlocked"])(rawNoAuthEntriesAll, blockedProviders);
    const noAuthEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(noAuthEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const apiKeyProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("apikey", getProviderStats);
    const llmProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IMAGE_ONLY_PROVIDER_IDS"].has(entry.providerId) && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AGGREGATOR_PROVIDER_IDS"].has(entry.providerId) && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ENTERPRISE_CLOUD_PROVIDER_IDS"].has(entry.providerId) && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["VIDEO_PROVIDER_IDS"].has(entry.providerId) && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EMBEDDING_RERANK_PROVIDER_IDS"].has(entry.providerId));
    const llmProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(llmProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const aggregatorProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AGGREGATOR_PROVIDER_IDS"].has(entry.providerId));
    const aggregatorProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(aggregatorProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const imageProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IMAGE_ONLY_PROVIDER_IDS"].has(entry.providerId));
    const imageProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(imageProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const enterpriseProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ENTERPRISE_CLOUD_PROVIDER_IDS"].has(entry.providerId));
    const enterpriseProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(enterpriseProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const videoProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["VIDEO_PROVIDER_IDS"].has(entry.providerId));
    const videoProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(videoProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const embeddingRerankProviderEntriesAll = apiKeyProviderEntriesAll.filter((entry)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EMBEDDING_RERANK_PROVIDER_IDS"].has(entry.providerId));
    const embeddingRerankProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(embeddingRerankProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const webCookieProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("web-cookie", getProviderStats);
    const webCookieProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(webCookieProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const localProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("local", getProviderStats);
    const localProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(localProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const searchProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("search", getProviderStats);
    const searchProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(searchProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const audioProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("audio", getProviderStats);
    const audioProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(audioProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const cloudAgentProviderEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("cloud-agent", getProviderStats);
    const cloudAgentProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(cloudAgentProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const upstreamProxyEntriesAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildStaticProviderEntries"])("upstream-proxy", getProviderStats);
    const upstreamProxyEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(upstreamProxyEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const compatibleProviderEntriesAll = [
        ...compatibleProviders.map((provider)=>({
                providerId: provider.id,
                provider,
                stats: getProviderStats(provider.id, "apikey"),
                displayAuthType: "compatible",
                toggleAuthType: "apikey"
            })),
        ...anthropicCompatibleProviders.map((provider)=>({
                providerId: provider.id,
                provider,
                stats: getProviderStats(provider.id, "apikey"),
                displayAuthType: "compatible",
                toggleAuthType: "apikey"
            })),
        ...ccCompatibleProviders.map((provider)=>({
                providerId: provider.id,
                provider,
                stats: getProviderStats(provider.id, "apikey"),
                displayAuthType: "compatible",
                toggleAuthType: "apikey"
            }))
    ];
    const compatibleProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(compatibleProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const staticProviderEntriesAll = dedupeProviderEntries([
        ...oauthProviderEntriesAll,
        ...noAuthEntriesAll,
        ...apiKeyProviderEntriesAll,
        ...webCookieProviderEntriesAll,
        ...localProviderEntriesAll,
        ...searchProviderEntriesAll,
        ...audioProviderEntriesAll,
        ...cloudAgentProviderEntriesAll,
        ...upstreamProxyEntriesAll
    ]);
    const dashboardProviderEntriesAll = dedupeProviderEntries([
        ...staticProviderEntriesAll,
        ...compatibleProviderEntriesAll
    ]);
    const freeSectionEntriesAll = dashboardProviderEntriesAll.filter(providerEntryHasFree);
    const freeSectionEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(freeSectionEntriesAll, effectiveShowConfiguredOnly, searchQuery, undefined, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    // IDE providers: subset of oauth/apikey providers that are editors/IDEs with
    // built-in AI subscription. Rendered in a dedicated "IDE Providers" section
    // and excluded from the regular OAuth/API Key sections to avoid duplication.
    const ideProviderEntriesAll = [
        ...oauthProviderEntriesAll,
        ...apiKeyProviderEntriesAll
    ].filter((e)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IDE_PROVIDER_IDS"].has(e.providerId));
    const ideProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(ideProviderEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const oauthOnlyEntriesAll = oauthProviderEntriesAll.filter((e)=>e.toggleAuthType === "oauth").filter((e)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IDE_PROVIDER_IDS"].has(e.providerId));
    // Web Fetch providers: filter across all entries by serviceKinds
    const webFetchEntriesAll = dedupeProviderEntries([
        ...staticProviderEntriesAll,
        ...compatibleProviderEntriesAll
    ].filter((e)=>{
        const p = e.provider;
        return p.serviceKinds?.includes("webFetch") === true;
    }));
    const webFetchEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterConfiguredProviderEntries"])(webFetchEntriesAll, effectiveShowConfiguredOnly, searchQuery, showFreeOnly, modelSearchQuery, activeServiceKind, liveModelsByProviderId);
    const compactProviderEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildCompactProviderEntriesForPage"])({
        activeCategory,
        showFreeOnly,
        freeSectionEntries,
        compatibleProviderEntries,
        oauthProviderEntries,
        ideProviderEntries,
        noAuthEntries,
        upstreamProxyEntries,
        llmProviderEntries,
        aggregatorProviderEntries,
        enterpriseProviderEntries,
        embeddingRerankProviderEntries,
        imageProviderEntries,
        videoProviderEntries,
        webCookieProviderEntries,
        searchProviderEntries,
        webFetchEntries,
        audioProviderEntries,
        localProviderEntries,
        cloudAgentProviderEntries
    });
    const summaryStats = {
        all: countConfigured(dashboardProviderEntriesAll),
        free: countConfigured(freeSectionEntriesAll),
        noauth: countConfigured(noAuthEntriesAll),
        oauth: countConfigured(oauthOnlyEntriesAll),
        apikey: countConfigured(apiKeyProviderEntriesAll),
        compatible: countConfigured(compatibleProviderEntriesAll),
        webcookie: countConfigured(webCookieProviderEntriesAll),
        search: countConfigured(searchProviderEntriesAll),
        audio: countConfigured(audioProviderEntriesAll),
        local: countConfigured(localProviderEntriesAll),
        upstreamproxy: countConfigured(upstreamProxyEntriesAll),
        cloudagent: countConfigured(cloudAgentProviderEntriesAll),
        ide: countConfigured(ideProviderEntriesAll),
        webfetch: countConfigured(webFetchEntriesAll)
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 810,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 811,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
            lineNumber: 809,
            columnNumber: 7
        }, this);
    }
    const showFirstProviderHint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldShowFirstProviderHint"])(connections.length, searchQuery) && !showAllProviders;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$context$2f$openRouterProviderStatsContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OpenRouterProviderStatsProvider"], {
        entries: openRouterProviderStats,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-6",
            children: [
                showFirstProviderHint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                    padding: "lg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center justify-center text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[32px] text-primary",
                                    children: "dns"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 826,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                lineNumber: 825,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold text-text-main",
                                children: t("addFirstProvider") || "Add your first provider"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                lineNumber: 828,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mt-2 max-w-md",
                                children: t("addFirstProviderDesc") || "Connect an AI provider to start routing requests through OmniRoute. You can use free providers, API keys, or OAuth accounts."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                lineNumber: 831,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex flex-wrap items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        icon: "add",
                                        onClick: ()=>router.push("/dashboard/providers/new"),
                                        children: providerText(t, "onboardingWizard", "Provider Onboarding Wizard")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 836,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "https://github.com/diegosouzapw/OmniRoute#-documentation",
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-bg-subtle transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[16px]",
                                                children: "help"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 845,
                                                columnNumber: 19
                                            }, this),
                                            t("learnMore") || "Learn more"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 839,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                lineNumber: 835,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                        lineNumber: 824,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 823,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderSummaryCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    activeCategory: activeCategory,
                    activeServiceKind: activeServiceKind,
                    onServiceKindChange: setActiveServiceKind,
                    disabledConfigured: connections.length === 0,
                    displayMode: effectiveProviderDisplayMode,
                    modelSearchQuery: modelSearchQuery,
                    onBatchTest: handleBatchTest,
                    onCategoryChange: (category, freeOnly)=>{
                        setShowFreeOnly(freeOnly);
                        setActiveCategory(freeOnly ? null : category);
                    },
                    onDisplayModeChange: setProviderDisplayMode,
                    onNewProvider: ()=>router.push("/dashboard/providers/new"),
                    onImportFromFile: ()=>setShowImportFromFileModal(true),
                    searchQuery: searchQuery,
                    setModelSearchQuery: setModelSearchQuery,
                    setSearchQuery: setSearchQuery,
                    showFreeOnly: showFreeOnly,
                    summaryStats: summaryStats,
                    t: t,
                    tc: tc,
                    testingMode: testingMode
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 853,
                    columnNumber: 9
                }, this),
                expirations?.summary && (expirations.summary.expired > 0 || expirations.summary.expiringSoon > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `p-4 rounded-xl flex items-start gap-3 border ${expirations.summary.expired > 0 ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-[24px] ${expirations.summary.expired > 0 ? "text-red-500" : "text-amber-500"}`,
                            children: expirations.summary.expired > 0 ? "error" : "warning"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 888,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: `font-semibold ${expirations.summary.expired > 0 ? "text-red-500" : "text-amber-500"}`,
                                    children: expirations.summary.expired > 0 ? t("expirationBannerExpired", {
                                        count: expirations.summary.expired
                                    }) : t("expirationBannerExpiringSoon", {
                                        count: expirations.summary.expiringSoon
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 896,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm mt-1 opacity-80 text-text-main",
                                    children: expirations.summary.expired > 0 ? t("expirationBannerExpiredDesc") : t("expirationBannerExpiringSoonDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 905,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 895,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 881,
                    columnNumber: 13
                }, this),
                isCompactProviderDisplay ? compactProviderEntries.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                    "data-testid": "provider-compact-grid",
                    children: compactProviderEntries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            providerId: entry.providerId,
                            provider: entry.provider,
                            stats: entry.stats,
                            authType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerCompactMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCompactProviderAuthType"])(entry, showFreeOnly),
                            onToggle: (active)=>handleToggleProvider(entry.providerId, entry.toggleAuthType, active)
                        }, `compact-${entry.providerId}`, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 921,
                            columnNumber: 17
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 916,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 py-8 border border-dashed border-border rounded-xl text-text-muted text-sm",
                    "data-testid": "provider-compact-empty",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "search_off"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 938,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: providerText(t, "noProvidersMatch", "No providers match your search.")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 939,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 934,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        showSection("compatible") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("compatibleProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-orange-500",
                                                    title: t("compatibleLabel")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 950,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(compatibleProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 954,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 948,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: [
                                                (compatibleProviders.length > 0 || anthropicCompatibleProviders.length > 0 || ccCompatibleProviders.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleBatchTest("compatible"),
                                                    disabled: !!testingMode,
                                                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "compatible" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                                    title: t("testAllCompatible"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `material-symbols-outlined text-[14px]${testingMode === "compatible" ? " animate-spin" : ""}`,
                                                            children: "play_arrow"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                            lineNumber: 970,
                                                            columnNumber: 25
                                                        }, this),
                                                        testingMode === "compatible" ? t("testing") : t("testAll")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 960,
                                                    columnNumber: 23
                                                }, this),
                                                ccCompatibleProviderEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    size: "sm",
                                                    icon: "add",
                                                    onClick: ()=>setShowAddCcCompatibleModal(true),
                                                    children: addCcCompatibleLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 979,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    size: "sm",
                                                    icon: "add",
                                                    onClick: ()=>setShowAddAnthropicCompatibleModal(true),
                                                    children: t("addAnthropicCompatible")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 987,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    size: "sm",
                                                    icon: "add",
                                                    onClick: ()=>setShowAddCompatibleModal(true),
                                                    children: t("addOpenAICompatible")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 994,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 956,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 947,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("compatibleProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 999,
                                    columnNumber: 17
                                }, this),
                                compatibleProviders.length === 0 && anthropicCompatibleProviders.length === 0 && ccCompatibleProviders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-xl text-text-muted text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[18px]",
                                            children: "extension"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1004,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: t("noCompatibleYet")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1005,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1003,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: compatibleProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1011,
                                            columnNumber: 25
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1008,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 946,
                            columnNumber: 15
                        }, this),
                        showSection("oauth") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("oauthProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-blue-500",
                                                    title: t("oauthLabel")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1034,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(oauthProviderEntriesAll.filter((e)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IDE_PROVIDER_IDS"].has(e.providerId)))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1035,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1032,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                oauthEnvRepairStatus?.available && oauthEnvRepairStatus.missingCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleRepairEnv,
                                                    disabled: repairingEnv,
                                                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${repairingEnv ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                                    title: t("repairEnvHint"),
                                                    "aria-label": t("repairEnv"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: repairingEnv ? "sync" : "settings_backup_restore"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                            lineNumber: 1054,
                                                            columnNumber: 25
                                                        }, this),
                                                        repairingEnv ? t("repairEnvWorking") : t("repairEnv")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1043,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleBatchTest("oauth"),
                                                    disabled: !!testingMode,
                                                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "oauth" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                                    title: t("testAllOAuth"),
                                                    "aria-label": t("testAllOAuth"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `material-symbols-outlined text-[14px]${testingMode === "oauth" ? " animate-spin" : ""}`,
                                                            children: "play_arrow"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                            lineNumber: 1071,
                                                            columnNumber: 23
                                                        }, this),
                                                        testingMode === "oauth" ? t("testing") : t("testAll")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1060,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1041,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1031,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("oauthProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1080,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: oauthProviderEntries.filter((e)=>!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["IDE_PROVIDER_IDS"].has(e.providerId)).map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1085,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1081,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1030,
                            columnNumber: 15
                        }, this),
                        showSection("ide") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("ideProviders") || "IDE Providers",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-cyan-500",
                                                    title: t("ideProviders") || "IDE Providers"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1106,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(ideProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1110,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1104,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("ide"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "ide" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            "aria-label": t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "ide" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1123,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "ide" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1112,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1103,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("ideProvidersDesc") || "Editors with built-in AI subscription. Use the provider page to import credentials directly from the IDE's keychain."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1131,
                                    columnNumber: 17
                                }, this),
                                ideProviderEntries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-dashed border-border bg-bg-subtle p-6 text-center text-sm text-text-muted",
                                    children: t("noIdeProviders") || "No IDE providers match the current filters."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1136,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: ideProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, `ide-${providerId}`, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1143,
                                            columnNumber: 25
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1140,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1102,
                            columnNumber: 15
                        }, this),
                        showSection("web") && webCookieProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("webCookieProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-purple-500",
                                                    title: t("webCookieProviders")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1166,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(webCookieProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1170,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1164,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("web-cookie"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "web-cookie" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "web-cookie" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1182,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "web-cookie" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1172,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1163,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("webCookieProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1190,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: webCookieProviderEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "web-cookie",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1194,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1191,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1162,
                            columnNumber: 15
                        }, this),
                        showSection("free") && freeSectionEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-start gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-xl font-semibold flex items-center gap-2",
                                                    children: [
                                                        t("freeTierProviders"),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$CategoryDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CategoryDot"], {
                                                            color: "bg-green-500",
                                                            label: t("freeTierLabel")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                            lineNumber: 1217,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            ...countConfigured(freeSectionEntriesAll)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                            lineNumber: 1218,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1215,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-text-muted mt-1",
                                                    children: t("freeAggregated")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1220,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1214,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("free"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "free" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "free" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1232,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "free" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1222,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1213,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: freeSectionEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: toggleAuthType === "free" ? "free" : displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, `free-section-${providerId}`, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1243,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1240,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1212,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("apiKeyProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-amber-500",
                                                    title: t("apiKeyLabel")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1265,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(apiKeyProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1266,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1263,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("apikey"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "apikey" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAllApiKey"),
                                            "aria-label": t("testAllApiKey"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "apikey" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1279,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "apikey" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1268,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1262,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("apiKeyProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1287,
                                    columnNumber: 17
                                }, this),
                                llmProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xs font-semibold uppercase tracking-wider text-text-muted",
                                            children: t("llmProviders")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1290,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                            children: llmProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    providerId: providerId,
                                                    provider: provider,
                                                    stats: stats,
                                                    authType: displayAuthType,
                                                    onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                                }, providerId, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1296,
                                                    columnNumber: 27
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1293,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1289,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1261,
                            columnNumber: 15
                        }, this),
                        showSection("noauth") && !showFreeOnly && (noAuthEntriesAll.length > 0 || blockedNoAuthEntries.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$NoAuthProvidersSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            visibleEntries: noAuthEntries,
                            count: countConfigured(noAuthEntriesAll),
                            blockedEntries: blockedNoAuthEntries,
                            blockedProviders: blockedProviders,
                            onBlockedChange: setBlockedProviders,
                            onError: (msg)=>notify.error(msg),
                            testingMode: testingMode,
                            onBatchTest: handleBatchTest,
                            onToggleProvider: handleToggleProvider
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1318,
                            columnNumber: 17
                        }, this),
                        showSection("proxy") && upstreamProxyEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("upstreamProxyProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-indigo-500",
                                                    title: t("upstreamProxyProviders")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1337,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(upstreamProxyEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1341,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1335,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("upstream-proxy"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "upstream-proxy" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "upstream-proxy" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1353,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "upstream-proxy" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1343,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1334,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("upstreamProxyProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1361,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: upstreamProxyEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "upstream-proxy",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1364,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1362,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1333,
                            columnNumber: 15
                        }, this),
                        showSection("webfetch") && webFetchEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("webFetchProvidersHeading"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-orange-500",
                                                title: t("webFetchTooltip")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1385,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(webFetchEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1389,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1383,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1382,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("webFetchProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1392,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: webFetchEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, `webfetch-${providerId}`, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1396,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1393,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1381,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && aggregatorProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("aggregatorsGateways"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-amber-500",
                                                title: t("aggregatorsGateways")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1418,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(aggregatorProviderEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1422,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1416,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1415,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("aggregatorsGatewaysDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1425,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: aggregatorProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1429,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1426,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1414,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && enterpriseProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("enterpriseCloud"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-amber-500",
                                                title: t("enterpriseCloud")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1451,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(enterpriseProviderEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1455,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1449,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1448,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("enterpriseCloudDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1458,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: enterpriseProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1462,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1459,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1447,
                            columnNumber: 15
                        }, this),
                        showSection("cloud") && cloudAgentProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("cloudAgentProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-violet-500",
                                                    title: t("cloudAgentProviders")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1484,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(cloudAgentProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1488,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1482,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("cloud-agent"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "cloud-agent" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "cloud-agent" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1500,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "cloud-agent" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1490,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1481,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("cloudAgentProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1508,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: cloudAgentProviderEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "cloud-agent",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1512,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1509,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1480,
                            columnNumber: 15
                        }, this),
                        showSection("local") && localProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("localProviders"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-emerald-500",
                                                    title: t("localProviders")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1534,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(localProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1538,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1532,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("local"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "local" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "local" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1550,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "local" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1540,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1531,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("localProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1558,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: localProviderEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "local",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1561,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1559,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1530,
                            columnNumber: 15
                        }, this),
                        showSection("search") && searchProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("searchProvidersHeading"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-teal-500",
                                                    title: t("searchProvidersHeading")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1582,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(searchProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1586,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1580,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("search"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "search" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "search" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1598,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "search" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1588,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1579,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("searchProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1606,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: searchProviderEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "search",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1609,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1607,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1578,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && embeddingRerankProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("embeddingRerankProviders"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-amber-500",
                                                title: t("embeddingRerankProviders")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1630,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(embeddingRerankProviderEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1634,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1628,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1627,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("embeddingRerankProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1637,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: embeddingRerankProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1641,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1638,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1626,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && imageProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("imageProviders"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-amber-500",
                                                title: t("imageProviders")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1663,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(imageProviderEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1667,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1661,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1660,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("imageProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1670,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: imageProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1674,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1671,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1659,
                            columnNumber: 15
                        }, this),
                        showSection("audio") && audioProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                            children: [
                                                t("audioProvidersHeading"),
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "size-2.5 rounded-full bg-rose-500",
                                                    title: t("audioProvidersHeading")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1696,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    ...countConfigured(audioProviderEntriesAll)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1700,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1694,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleBatchTest("audio"),
                                            disabled: !!testingMode,
                                            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${testingMode === "audio" ? "bg-primary/20 border-primary/40 text-primary animate-pulse" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary hover:border-primary/40"}`,
                                            title: t("testAll"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[14px]${testingMode === "audio" ? " animate-spin" : ""}`,
                                                    children: "play_arrow"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                    lineNumber: 1712,
                                                    columnNumber: 21
                                                }, this),
                                                testingMode === "audio" ? t("testing") : t("testAll")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1702,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1693,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("audioProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1720,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: audioProviderEntries.map(({ providerId, provider, stats, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: "audio",
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1723,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1721,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1692,
                            columnNumber: 15
                        }, this),
                        showSection("apikey") && videoProviderEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold flex items-center gap-2 flex-1 min-w-0",
                                        children: [
                                            t("videoProviders"),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "size-2.5 rounded-full bg-amber-500",
                                                title: t("videoProviders")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1744,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ProviderCountBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                ...countConfigured(videoProviderEntriesAll)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1748,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1742,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1741,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted -mt-2",
                                    children: t("videoProvidersDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1751,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3",
                                    children: videoProviderEntries.map(({ providerId, provider, stats, displayAuthType, toggleAuthType })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$HighlightableProviderCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            providerId: providerId,
                                            provider: provider,
                                            stats: stats,
                                            authType: displayAuthType,
                                            onToggle: (active)=>handleToggleProvider(providerId, toggleAuthType, active)
                                        }, providerId, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1755,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1752,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1740,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    isOpen: showAddCompatibleModal,
                    mode: "openai",
                    onClose: ()=>setShowAddCompatibleModal(false),
                    onCreated: (node)=>{
                        setProviderNodes((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["upsertProviderNodeById"])(prev, node));
                        setShowAddCompatibleModal(false);
                        router.push(`/dashboard/providers/${node.id}`);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1773,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    isOpen: showAddAnthropicCompatibleModal,
                    mode: "anthropic",
                    onClose: ()=>setShowAddAnthropicCompatibleModal(false),
                    onCreated: (node)=>{
                        setProviderNodes((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["upsertProviderNodeById"])(prev, node));
                        setShowAddAnthropicCompatibleModal(false);
                        router.push(`/dashboard/providers/${node.id}`);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1783,
                    columnNumber: 9
                }, this),
                ccCompatibleProviderEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$AddCompatibleProviderModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    isOpen: showAddCcCompatibleModal,
                    mode: "cc",
                    title: addCcCompatibleLabel,
                    onClose: ()=>setShowAddCcCompatibleModal(false),
                    onCreated: (node)=>{
                        setProviderNodes((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["upsertProviderNodeById"])(prev, node));
                        setShowAddCcCompatibleModal(false);
                        router.push(`/dashboard/providers/${node.id}`);
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1794,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$components$2f$ImportProvidersFromFileModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ImportProvidersFromFileModal"], {
                    isOpen: showImportFromFileModal,
                    onClose: ()=>setShowImportFromFileModal(false),
                    onImported: async ()=>setConnections((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$providers$2f$providerPageUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadProviderPageData"])()).connections)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1806,
                    columnNumber: 9
                }, this),
                testResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed inset-0 z-50 flex items-start justify-center pt-[10vh]",
                    onClick: ()=>setTestResults(null),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1817,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative bg-bg-primary border border-border rounded-xl w-full max-w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl",
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-border bg-bg-primary/95 backdrop-blur-sm rounded-t-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold",
                                            children: t("testResults")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1823,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setTestResults(null),
                                            className: "p-1 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors",
                                            "aria-label": tc("close"),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-lg",
                                                children: "close"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                                lineNumber: 1829,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                            lineNumber: 1824,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1822,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderTestResultsView, {
                                        results: testResults
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                        lineNumber: 1833,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1832,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1818,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1813,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
            lineNumber: 821,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
        lineNumber: 820,
        columnNumber: 5
    }, this);
}
// ─── Provider Test Results View (mirrors combo TestResultsView) ──────────────
function ProviderTestResultsView({ results }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("providers");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    // Guard: never crash on malformed/null results (would trigger error boundary)
    if (!results || typeof results !== "object") {
        return null;
    }
    if (results.error && (!results.results || results.results.length === 0)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-red-500 text-[32px] mb-2 block",
                    children: "error"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1858,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-red-400",
                    children: typeof results.error === "object" ? results.error?.message || JSON.stringify(results.error) : String(results.error)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1859,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
            lineNumber: 1857,
            columnNumber: 7
        }, this);
    }
    const summary = results.summary ?? null;
    const mode = results.mode ?? "";
    const items = Array.isArray(results.results) ? results.results : [];
    const modeLabel = {
        oauth: t("oauthLabel"),
        free: tc("free"),
        apikey: t("apiKeyLabel"),
        compatible: t("compatibleLabel"),
        provider: t("providerLabel"),
        all: tc("all")
    }[mode] || mode;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 text-xs mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-text-muted",
                        children: t("modeTest", {
                            mode: modeLabel
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                        lineNumber: 1887,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium",
                        children: t("passedCount", {
                            count: summary.passed
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                        lineNumber: 1888,
                        columnNumber: 11
                    }, this),
                    summary.failed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-medium",
                        children: t("failedCount", {
                            count: summary.failed
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                        lineNumber: 1892,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-text-muted ml-auto",
                        children: t("testedCount", {
                            count: summary.total
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                        lineNumber: 1896,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                lineNumber: 1886,
                columnNumber: 9
            }, this),
            items.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-[16px] ${r.valid ? "text-emerald-500" : "text-red-500"}`,
                            children: r.valid ? "check_circle" : "error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1908,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                                        r.connectionName
                                    ], emailsVisible, r.connectionName)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1916,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-text-muted ml-1.5",
                                    children: [
                                        "(",
                                        r.provider,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                                    lineNumber: 1919,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1915,
                            columnNumber: 11
                        }, this),
                        r.latencyMs !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-text-muted font-mono tabular-nums",
                            children: t("millisecondsAbbr", {
                                value: r.latencyMs
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1922,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${r.valid ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`,
                            children: r.valid ? t("okShort") : r.diagnosis?.type || t("errorShort")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                            lineNumber: 1926,
                            columnNumber: 11
                        }, this)
                    ]
                }, r.connectionId || i, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                    lineNumber: 1904,
                    columnNumber: 9
                }, this)),
            items.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-4 text-text-muted text-sm",
                children: t("noActiveConnectionsInGroup")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
                lineNumber: 1937,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/providers/page.tsx",
        lineNumber: 1883,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_1akzajk._.js.map