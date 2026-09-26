module.exports = [
"[project]/open-sse/services/autoCombo/providerRegistryAccessor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProviderRegistry",
    ()=>getProviderRegistry
]);
/**
 * Provides access to the provider REGISTRY. Used to enable mocking in tests.
 * The REGISTRY contains provider configuration including models and costs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-route] (ecmascript)");
;
function getProviderRegistry() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"];
}
}),
"[project]/src/shared/providers/webSessionCredentials.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WEB_SESSION_CREDENTIAL_REQUIREMENTS",
    ()=>WEB_SESSION_CREDENTIAL_REQUIREMENTS,
    "getWebSessionCredentialRequirement",
    ()=>getWebSessionCredentialRequirement,
    "hasUsableWebSessionCredential",
    ()=>hasUsableWebSessionCredential,
    "requiresWebSessionCredential",
    ()=>requiresWebSessionCredential,
    "resolveWebSessionImportApiKey",
    ()=>resolveWebSessionImportApiKey
]);
const WEB_SESSION_CREDENTIAL_REQUIREMENTS = {
    "zenmux-free": {
        kind: "cookie",
        credentialName: "Cookie header (full)",
        placeholder: "paste the full Cookie header from zenmux.ai",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie"
        ]
    },
    "chatgpt-web": {
        kind: "cookie",
        credentialName: "__Secure-next-auth.session-token",
        placeholder: "__Secure-next-auth.session-token=...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionToken",
            "session-token",
            "__Secure-next-auth.session-token"
        ]
    },
    "grok-web": {
        kind: "cookie",
        credentialName: "sso + sso-rw",
        placeholder: "sso=...; sso-rw=...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sso",
            "sso-rw"
        ],
        // #7567 — grok.com's cf_clearance cookie is pinned to IP + User-Agent + TLS
        // fingerprint of the browser that earned it, so pasting it from a different
        // machine/IP causes a 403 that is actually correct Cloudflare behavior. Point
        // users at the Custom User-Agent field under Advanced Settings + same IP/proxy,
        // instead of the generic (and here misleading) single-cookie hint.
        hintKey: "grokWebCookieHint",
        hintFallback: "grok.com's cf_clearance cookie is pinned to the IP, User-Agent, and TLS fingerprint of the browser where you copied it — pasting it from a different machine/IP causes a 403. Paste sso and sso-rw here, then open Advanced Settings and fill Custom User-Agent with the EXACT User-Agent string of that same browser, and use the same IP/proxy for this connection."
    },
    "gemini-web": {
        kind: "cookie",
        credentialName: "__Secure-1PSID (optional: __Secure-1PSIDTS)",
        placeholder: "__Secure-1PSID=...; __Secure-1PSIDTS=...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "__Secure-1PSID",
            "__Secure-1PSIDTS"
        ]
    },
    "notion-web": {
        kind: "cookie",
        credentialName: "token_v2 (optional: space_id, notion_browser_id)",
        placeholder: "token_v2=...; space_id=...; notion_browser_id=...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "token_v2",
            "space_id",
            "notion_browser_id"
        ]
    },
    "gemini-business": {
        kind: "cookie",
        credentialName: "__Secure-1PSID (optional: __Secure-1PSIDTS)",
        placeholder: "__Secure-1PSID=...; __Secure-1PSIDTS=... (from business.gemini.google)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "__Secure-1PSID",
            "__Secure-1PSIDTS"
        ]
    },
    "perplexity-web": {
        kind: "cookie",
        credentialName: "__Secure-next-auth.session-token",
        placeholder: "__Secure-next-auth.session-token=...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionToken",
            "session-token",
            "__Secure-next-auth.session-token"
        ]
    },
    hyperagent: {
        kind: "cookie",
        credentialName: "Session Cookie",
        placeholder: "Paste full Cookie header from hyperagent.com",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionCookie",
            "authCookie"
        ]
    },
    "blackbox-web": {
        kind: "cookie",
        credentialName: "__Secure-authjs.session-token",
        placeholder: "__Secure-authjs.session-token=...; other=value",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionToken",
            "__Secure-authjs.session-token"
        ]
    },
    "muse-spark-web": {
        kind: "cookie",
        // #9502: the WS protocol (#7528) needs both the ecto_1_sess cookie (GraphQL
        // warmup/mode-switch) and a separate ecto1:... WS auth token (Authorization
        // query param on wss://gateway.meta.ai/ws/clippy). The executor extracts the
        // ecto1: token from the apiKey field via /ecto1:[^\s;]+/i.
        credentialName: "ecto_1_sess + ecto1: WS auth token",
        placeholder: "ecto_1_sess=...; ecto1:... (WS auth token from meta.ai DevTools → Network → WS → clippy)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "ecto_1_sess",
            "abra_sess"
        ]
    },
    "hailuo-web": {
        kind: "token",
        credentialName: "_token",
        placeholder: '_token=... (hailuo.ai → DevTools → Local Storage → "_token")',
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "_token"
        ]
    },
    "claude-web": {
        kind: "cookie",
        credentialName: "sessionKey",
        placeholder: "sessionKey=... or full Cookie header from claude.ai",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionKey"
        ]
    },
    "deepseek-web": {
        kind: "token",
        credentialName: "userToken",
        placeholder: "userToken=... or paste raw userToken",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "userToken"
        ]
    },
    "copilot-web": {
        kind: "token",
        credentialName: "access_token",
        placeholder: "access_token=... or a DevTools HAR export",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "access_token",
            "accessToken"
        ]
    },
    "microsoft-designer-web": {
        kind: "token",
        credentialName: "access_token",
        placeholder: "access_token=... (Authorization: Bearer header from the DallE.ashx request)",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "access_token",
            "accessToken"
        ]
    },
    "copilot-m365-web": {
        kind: "token",
        credentialName: "access_token + chathubPath",
        placeholder: "access_token=...; chathubPath=redacted",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "access_token",
            "accessToken",
            "chathubPath",
            "userTenant"
        ]
    },
    "t3-web": {
        kind: "cookie",
        credentialName: "convex-session-id + Cookie header",
        placeholder: "convex-session-id=abc123...; Cookie: ...",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "convex-session-id",
            "convexSessionId"
        ],
        // #5465 — the generic cookie hint reads circular for t3.chat (needs a
        // localStorage value AND the Cookie header); use the step-by-step DevTools
        // copy that already ships translated in every locale.
        hintKey: "t3ChatWebCookieHint"
    },
    "adapta-web": {
        kind: "cookie",
        credentialName: "__client",
        placeholder: "__client=... or full Cookie header from agent.adapta.one",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "__client"
        ]
    },
    "inner-ai": {
        kind: "cookie",
        credentialName: "token + email",
        placeholder: "token_value user@example.com",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "cookie",
            "email"
        ]
    },
    huggingchat: {
        kind: "cookie",
        credentialName: "full Cookie header (hf-chat + token)",
        placeholder: "hf-chat=...; token=...; aws-waf-token=... (full Cookie header from huggingface.co)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "hf-chat"
        ]
    },
    "yuanbao-web": {
        kind: "cookie",
        credentialName: "full Cookie header (hy_user + hy_token)",
        placeholder: "hy_user=...; hy_token=... (full Cookie header from yuanbao.tencent.com)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "hy_user",
            "hy_token"
        ]
    },
    "poe-web": {
        kind: "cookie",
        credentialName: "p-b",
        placeholder: "p-b=... or full Cookie header from poe.com",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "p-b"
        ]
    },
    "venice-web": {
        kind: "cookie",
        credentialName: "session",
        placeholder: "session=... or full Cookie header from venice.ai",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "session"
        ]
    },
    "v0-vercel-web": {
        kind: "cookie",
        credentialName: "__vercel_session",
        placeholder: "__vercel_session=... or full Cookie header from v0.dev",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "__vercel_session"
        ]
    },
    "kimi-web": {
        kind: "token",
        credentialName: "access_token",
        placeholder: "access_token from www.kimi.com localStorage",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "token",
            "access_token",
            "accessToken",
            "cookie",
            "kimi-auth"
        ]
    },
    "doubao-web": {
        kind: "cookie",
        credentialName: "full Cookie header (sessionid + ttwid + s_v_web_id)",
        placeholder: "sessionid=...; ttwid=...; s_v_web_id=... (or fp=verify_... fallback from www.dola.com)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "sessionid",
            "ttwid",
            "s_v_web_id",
            "fp"
        ]
    },
    "qwen-web": {
        kind: "cookie",
        credentialName: "full Cookie header (must include cna, ssxmod_itna, token)",
        placeholder: "cna=...; token=...; ssxmod_itna=...; ssxmod_itna2=... (full Cookie header from chat.qwen.ai)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "token",
            "ssxmod_itna",
            "ssxmod_itna2",
            "cna",
            "tongyi_sso_ticket"
        ]
    },
    "duckduckgo-web": {
        kind: "cookie",
        credentialName: "duckai",
        placeholder: "duckai=... or full Cookie header from duckduckgo.com",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "duckai"
        ]
    },
    "t3-chat-web": {
        kind: "token",
        credentialName: "token",
        placeholder: "Paste your T3 Chat token from t3.chat (Local Storage → token)",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token"
        ]
    },
    "chatglm-web": {
        kind: "cookie",
        credentialName: "chatglm_session",
        placeholder: "chatglm_session=... or full Cookie header from chatglm.cn",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "chatglm_session"
        ]
    },
    "xiaomimimo-web": {
        kind: "cookie",
        credentialName: "session",
        placeholder: "session=... or full Cookie header from aistudio.xiaomimimo.com",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "session"
        ]
    },
    "manus-web": {
        kind: "cookie",
        credentialName: "manus_session",
        placeholder: "manus_session=... or full Cookie header from manus.im",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "manus_session"
        ]
    },
    "zai-web": {
        kind: "cookie",
        credentialName: "token",
        placeholder: "token=... or full Cookie header from chat.z.ai",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "token"
        ]
    },
    lmarena: {
        kind: "cookie",
        // arena.ai's auth cookie is `arena-auth-prod-v1` (the legacy hint said `session`,
        // which never matched the real cookie name and confused users). #3810
        //
        // #4271: LMArena migrated to Supabase SSR chunked cookies — the single
        // `arena-auth-prod-v1` cookie is now empty and the session is split across
        // `arena-auth-prod-v1.0`, `arena-auth-prod-v1.1`, … Users must paste the FULL
        // Cookie header so the executor can reconstruct the single cookie from chunks.
        credentialName: "full Cookie header (arena-auth-prod-v1.0 + arena-auth-prod-v1.1)",
        placeholder: "arena-auth-prod-v1.0=...; arena-auth-prod-v1.1=...; other=value (full Cookie header from arena.ai)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "arena-auth-prod-v1",
            "arena-auth-prod-v1.0",
            "arena-auth-prod-v1.1",
            "session"
        ],
        hintKey: "lmarenaWebCookieHint",
        hintFallback: "Open arena.ai, sign in, then copy the full Cookie header from a Network request. Include arena-auth-prod-v1.0 and arena-auth-prod-v1.1 (and further chunks if present), preferably with cf_clearance. Do not paste only the empty arena-auth-prod-v1 cookie. Optional: providerSpecificData.recaptchaV3Token if create-evaluation still returns 403."
    },
    promptql: {
        kind: "token",
        credentialName: "Bearer JWT (optional: projectId, session Cookie)",
        placeholder: "eyJ...  (Authorization Bearer from prompt.ql.app)",
        acceptsFullCookieHeader: false,
        storageKeys: [
            "token",
            "jwt",
            "apiKey",
            "projectId",
            "project_id",
            "cookie"
        ]
    },
    "adobe-firefly": {
        // Prefer IMS access_token JWT (Bearer). Cookie from firefly.adobe.com alone
        // only mints a guest IMS token. Kind stays "cookie" for multi-account UX;
        // resolveAdobeAccessToken auto-detects JWT vs cookie and rejects guests.
        kind: "cookie",
        credentialName: "IMS access_token JWT (recommended) or multi-domain Cookie",
        placeholder: "Paste eyJ… JWT from Authorization: Bearer on firefly-3p generate request (not page Cookie alone)",
        acceptsFullCookieHeader: true,
        storageKeys: [
            "cookie",
            "token",
            "access_token",
            "accessToken"
        ]
    }
};
function getWebSessionCredentialRequirement(providerId) {
    if (typeof providerId !== "string") return null;
    return WEB_SESSION_CREDENTIAL_REQUIREMENTS[providerId] ?? null;
}
function requiresWebSessionCredential(providerId) {
    const requirement = getWebSessionCredentialRequirement(providerId);
    return !!requirement && requirement.kind !== "none";
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function hasUsableWebSessionCredential(providerId, providerSpecificData) {
    const requirement = getWebSessionCredentialRequirement(providerId);
    if (!requirement || requirement.kind === "none") return false;
    if (!providerSpecificData || typeof providerSpecificData !== "object") return false;
    const data = providerSpecificData;
    return requirement.storageKeys.some((key)=>hasNonEmptyString(data[key]));
}
function resolveWebSessionImportApiKey(requirement, credential) {
    if (!requirement || requirement.kind !== "token") return null;
    const trimmed = typeof credential === "string" ? credential.trim() : "";
    return trimmed.length > 0 ? trimmed : null;
}
}),
"[project]/open-sse/services/autoCombo/paidModelFilter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "filterPaidOnlyCandidates",
    ()=>filterPaidOnlyCandidates
]);
/**
 * #6512 (follow-up to #6328 / #6495) — exclude paid-only backends from `auto/*`
 * candidate pools when the operator opts into the `hidePaidModels` setting.
 *
 * PR #6495 added `hidePaidModels` to hide paid models from the `GET /v1/models`
 * listing, but `auto/*` combos could still pick a paid-only backend into their
 * candidate pool → a 402/403 at request time, exactly what #6328 wanted to avoid.
 * This applies the SAME free-model predicate #6495 uses in `catalog.ts` to every
 * virtual auto-combo candidate pool.
 *
 * Kept as a pure, dependency-light function so the filter is unit-testable in
 * isolation without seeding the DB-backed virtual factory.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/freeModels.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
/** A candidate is kept only when its provider has documented free models AND the
 * selected model itself qualifies as free — mirrors `shouldHidePaid` in
 * `src/app/api/v1/models/catalog.ts`. */ function isFreeCandidate(candidate) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerHasFreeModels"])(candidate.provider) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFreeModel"])(candidate.provider, {
        id: candidate.model
    });
}
function filterPaidOnlyCandidates(pool, hidePaidModels) {
    if (!hidePaidModels) return pool;
    return pool.filter(isFreeCandidate);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/candidateOverrides.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #7819 (Level 2) — per-API-key candidate exclusions for `auto/*` channels.
 *
 * Pure, dependency-light filter kept separate from `virtualFactory.ts` so it
 * is unit-testable in isolation, mirroring `paidModelFilter.ts` in this same
 * directory (`filterPaidOnlyCandidates`). Fail-open by design: an empty
 * exclusion set is the identity function (near-zero overhead on the
 * unconfigured hot path), and any caller-side lookup failure should pass the
 * candidate pool through unfiltered rather than break routing.
 */ __turbopack_context__.s([
    "filterExcludedCandidates",
    ()=>filterExcludedCandidates
]);
function filterExcludedCandidates(pool, excludedConnectionIds) {
    if (!excludedConnectionIds || excludedConnectionIds.size === 0) return pool;
    return pool.flatMap((candidate)=>{
        if (Array.isArray(candidate.allowedConnectionIds)) {
            const allowedConnectionIds = candidate.allowedConnectionIds.filter((connectionId)=>!excludedConnectionIds.has(connectionId));
            if (allowedConnectionIds.length === 0) return [];
            if (allowedConnectionIds.length === candidate.allowedConnectionIds.length) {
                return [
                    candidate
                ];
            }
            return [
                {
                    ...candidate,
                    allowedConnectionIds
                }
            ];
        }
        return candidate.connectionId && excludedConnectionIds.has(candidate.connectionId) ? [] : [
            candidate
        ];
    });
}
}),
"[project]/open-sse/services/autoCombo/resilienceCandidateFilter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SYNTHETIC_NOAUTH_CONNECTION_ID",
    ()=>SYNTHETIC_NOAUTH_CONNECTION_ID,
    "filterResilienceBlockedCandidates",
    ()=>filterResilienceBlockedCandidates
]);
/**
 * #7623 — exclude models/connections the existing resilience runtime already
 * marked unavailable from `auto/*` candidate pools.
 *
 * Uses the same reads as dispatch-time account selection and the #7819
 * candidate inspector (`isModelLocked`, connection cooldown / testStatus).
 * Pure filter kept separate from `virtualFactory.ts` for unit testing, mirroring
 * `paidModelFilter.ts` and `candidateOverrides.ts` in this directory.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const SYNTHETIC_NOAUTH_CONNECTION_ID = "noauth";
const TERMINAL_CONNECTION_STATUSES = new Set([
    "banned",
    "expired",
    "credits_exhausted",
    "deactivated"
]);
function isConnectionResilienceBlocked(connection) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(connection.rateLimitedUntil)) return true;
    const status = connection.testStatus;
    if (status === "unavailable") return true;
    if (typeof status === "string" && TERMINAL_CONNECTION_STATUSES.has(status)) return true;
    return false;
}
function isConnectionEligibleForModel(provider, connectionId, model, connectionsById) {
    const connection = connectionsById.get(connectionId);
    if (connection && isConnectionResilienceBlocked(connection)) return false;
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, connectionId, model);
}
function filterResilienceBlockedCandidates(pool, connectionsById) {
    if (!Array.isArray(pool) || pool.length === 0) return pool;
    let changed = false;
    const filtered = pool.flatMap((candidate)=>{
        if (candidate.connectionId === SYNTHETIC_NOAUTH_CONNECTION_ID) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(candidate.provider, SYNTHETIC_NOAUTH_CONNECTION_ID, candidate.model)) {
                changed = true;
                return [];
            }
            return [
                candidate
            ];
        }
        if (Array.isArray(candidate.allowedConnectionIds)) {
            const allowedConnectionIds = candidate.allowedConnectionIds.filter((connectionId)=>isConnectionEligibleForModel(candidate.provider, connectionId, candidate.model, connectionsById));
            if (allowedConnectionIds.length === 0) {
                changed = true;
                return [];
            }
            if (allowedConnectionIds.length === candidate.allowedConnectionIds.length) {
                return [
                    candidate
                ];
            }
            changed = true;
            return [
                {
                    ...candidate,
                    allowedConnectionIds
                }
            ];
        }
        if (candidate.connectionId) {
            if (!isConnectionEligibleForModel(candidate.provider, candidate.connectionId, candidate.model, connectionsById)) {
                changed = true;
                return [];
            }
        }
        return [
            candidate
        ];
    });
    return changed ? filtered : pool;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/virtualFactory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeAdvertisedLimits",
    ()=>computeAdvertisedLimits,
    "createVirtualAutoCombo",
    ()=>createVirtualAutoCombo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/providerRegistryAccessor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$providers$2f$webSessionCredentials$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/providers/webSessionCredentials.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/suffixComposition.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modelFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/models/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/paidModelFilter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$candidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/candidateOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/resilienceCandidateFilter.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function toExpiryMs(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed < 10_000_000_000 ? parsed * 1000 : parsed;
    }
    if (typeof value === "string") {
        const timestamp = new Date(value).getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
    }
    return null;
}
function hasUsableOAuthToken(conn) {
    if (typeof conn.accessToken !== "string" || conn.accessToken.trim().length === 0) return false;
    const expiryMs = toExpiryMs(conn.tokenExpiresAt) ?? toExpiryMs(conn.expiresAt);
    return expiryMs === null || expiryMs > Date.now();
}
function hasProviderSpecificSessionData(conn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$providers$2f$webSessionCredentials$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasUsableWebSessionCredential"])(conn.provider, conn.providerSpecificData);
}
function hasUsableConnectionCredential(conn) {
    const hasApiKey = typeof conn.apiKey === "string" && conn.apiKey.trim().length > 0;
    return hasApiKey || hasUsableOAuthToken(conn) || hasProviderSpecificSessionData(conn);
}
const SYNTHETIC_NOAUTH_CONNECTION_ID = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYNTHETIC_NOAUTH_CONNECTION_ID"];
// Allowlist of no-auth (keyless) providers permitted to enter the `auto`/`auto-*`
// candidate pool. Narrowed to the backends verified to answer without any
// configuration on our reference egress (VPS .15): `opencode` and `felo-web`
// both return 200 there, while duckduckgo-web (429/VQD rate limit), theoldllm
// (403 Vercel egress block), chipotle (502), aihorde (401, anon key rejected)
// and the others are unreliable. The excluded providers stay fully usable via
// direct `<alias>/<model>` calls — they are just kept OUT of auto-routing until
// re-verified. Re-add an id here to bring it back into every auto/* pool.
//
// Scope (operator decision 2026-07-24, refs #8183/#6453/#7032): this allowlist
// targets public-HTTP-egress reliability for the category/tier and flat-variant
// `auto/*` pools (auto/best-free, auto/coding:fast, ...). It does NOT apply to
// `auto/<family>` pools (auto/glm, auto/zai, ...) — a family combo is an
// identity selector ("whatever genuinely serves GLM"), not a reliability-curated
// pool, so it admits any no-auth backend that genuinely serves the family (e.g.
// auggie, a local CLI subprocess with zero HTTP egress, belongs in auto/glm
// regardless of this list). See the `bypassAllowlist` param below.
const AUTO_COMBO_NOAUTH_ALLOWLIST = new Set([
    "opencode",
    "felo-web"
]);
function isChatAutoComboNoAuthProvider(providerDef, bypassAllowlist) {
    if (providerDef.noAuth !== true) return false;
    if (!bypassAllowlist && !AUTO_COMBO_NOAUTH_ALLOWLIST.has(providerDef.id)) return false;
    if (!Array.isArray(providerDef.serviceKinds) || providerDef.serviceKinds.length === 0) return true;
    return providerDef.serviceKinds.includes("llm");
}
function getNoAuthCandidates(excludedProviders, blockedProviders, disabledNoAuthProviders, noAuthProviderSpecificData, hiddenModelsMap, bypassAllowlist) {
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderRegistry"])();
    const candidates = [];
    for (const providerDef of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
        if (!isChatAutoComboNoAuthProvider(providerDef, bypassAllowlist)) continue;
        const providerId = providerDef.id;
        if (!providerId || excludedProviders.has(providerId)) continue;
        if (blockedProviders.has(providerId) || typeof providerDef.alias === "string" && blockedProviders.has(providerDef.alias)) continue;
        // #6557: a no-auth provider with its OWN provider_connections row explicitly
        // disabled (isActive=false, the toggle on the main Providers grid card once an
        // Account/fingerprint exists) must not be routed to, even though it has no
        // entry in the separate `settings.blockedProviders` list.
        if (disabledNoAuthProviders.has(providerId) || typeof providerDef.alias === "string" && disabledNoAuthProviders.has(providerDef.alias)) continue;
        const providerInfo = registry[providerId];
        const registryModels = Array.isArray(providerInfo?.models) ? providerInfo.models : [];
        if (registryModels.length === 0) continue;
        // No-auth providers do not have provider_connections rows. Use the same
        // synthetic connection id returned by getProviderCredentials() so the
        // downstream combo path can still carry a stable target/account identity.
        // Prefer provider aliases because some canonical provider IDs are reserved
        // for credentialed tiers with different routing semantics.
        const registryAlias = typeof providerInfo?.alias === "string" && providerInfo.alias.trim().length > 0 ? providerInfo.alias : null;
        const routingPrefix = providerDef.alias || registryAlias || providerId;
        // #7622: honor the "Excluded Models" field (`providerSpecificData.excludedModels`)
        // already enforced at dispatch time (src/sse/services/auth.ts) for no-auth
        // providers' own provider_connections row (#6557), so an excluded model never
        // enters the auto-combo/fusion candidate pool in the first place.
        const providerSpecificData = noAuthProviderSpecificData.get(providerId) ?? (typeof providerDef.alias === "string" ? noAuthProviderSpecificData.get(providerDef.alias) : undefined);
        // #7620: honor the eye-icon "hidden" flag (isHidden, from the
        // modelCompatOverrides/customModels key_value namespaces) the same way the
        // credentialed-connection loop below does, so a hidden no-auth model never
        // enters the auto-combo/fusion candidate pool either.
        const hiddenModels = hiddenModelsMap.get(providerId) ?? (typeof providerDef.alias === "string" ? hiddenModelsMap.get(providerDef.alias) : undefined);
        for (const model of registryModels){
            const modelId = typeof model?.id === "string" && model.id.trim().length > 0 ? model.id : null;
            if (!modelId) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(modelId, providerSpecificData)) continue;
            if (hiddenModels?.has(modelId)) continue;
            candidates.push({
                provider: providerId,
                connectionId: SYNTHETIC_NOAUTH_CONNECTION_ID,
                model: modelId,
                modelStr: `${routingPrefix}/${modelId}`,
                costPer1MTokens: 0
            });
        }
    }
    return candidates;
}
/**
 * Creates a virtual AutoCombo configuration dynamically based on connected providers and a specified variant.
 * This combo is not persisted in the DB.
 */ /**
 * Aggregate the context window / max output to ADVERTISE for an auto combo.
 *
 * MAX across candidates (not min): the auto-combo context pre-filter
 * (combo.ts::filterTargetsByRequestCompatibility + the estimated-tokens
 * pre-filter) already routes oversized requests away from small-window
 * candidates, so advertising the largest window lets clients (e.g. opencode)
 * keep their smart auto-compaction calibrated to the best candidate instead
 * of compacting prematurely — or, worse, receiving 0 and disabling
 * compaction entirely (the "agent keeps forgetting things" bug).
 *
 * Unknown candidates resolve through getTokenLimit()'s fallback chain, so a
 * non-empty pool always yields a positive contextLength.
 *
 * maxOutputTokens has no such guaranteed fallback in getResolvedModelCapabilities()
 * — registry entries and models.dev sync data are both optional per model, so a
 * candidate pool whose members all lack that specific field (e.g. #6453's
 * provider-family combos, `auto/llama` and friends, over no-auth/free-tier
 * registry entries that were never annotated with maxOutputTokens) would
 * otherwise advertise `null`, which mirrors the `context: 0` bug this module's
 * docstring describes for contextLength (opencode disables smart auto-compaction
 * entirely when a limit is falsy). Fall back to a conservative generic default so
 * a non-empty pool always yields a positive maxOutputTokens too.
 */ const DEFAULT_ADVERTISED_MAX_OUTPUT_TOKENS = 8192;
function computeAdvertisedLimits(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return {
            contextLength: null,
            maxOutputTokens: null
        };
    }
    let contextLength = null;
    let maxOutputTokens = null;
    for (const candidate of candidates){
        const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokenLimit"])(candidate.provider, candidate.model);
        if (Number.isFinite(limit) && limit > 0) {
            contextLength = contextLength === null ? limit : Math.max(contextLength, limit);
        }
        const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
            provider: candidate.provider,
            model: candidate.model
        }).maxOutputTokens;
        if (typeof output === "number" && Number.isFinite(output) && output > 0) {
            maxOutputTokens = maxOutputTokens === null ? output : Math.max(maxOutputTokens, output);
        }
    }
    if (maxOutputTokens === null) {
        maxOutputTokens = DEFAULT_ADVERTISED_MAX_OUTPUT_TOKENS;
    }
    return {
        contextLength,
        maxOutputTokens
    };
}
async function createVirtualAutoCombo(variant, spec, apiKeyId, autoChannel) {
    const [connections, disabledNoAuthConnections, settings] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            isActive: true
        }),
        // #6557: no-auth providers (opencode/mimocode/etc.) don't get an isActive
        // filter applied above since their credential is synthetic, but a real
        // provider_connections row CAN exist for them (created via "Add Account")
        // and its own isActive=false must gate the auto-combo pool too — not just
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            isActive: false
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])().catch(()=>({}))
    ]);
    const blockedProviders = new Set(Array.isArray(settings.blockedProviders) ? settings.blockedProviders : []);
    const disabledNoAuthProviders = new Set(disabledNoAuthConnections.filter((conn)=>conn.provider in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]).map((conn)=>conn.provider));
    const hiddenModelsMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])();
    // #7622: a no-auth provider's own provider_connections row (#6557) can carry
    // `providerSpecificData.excludedModels` regardless of its isActive state (the
    // dispatch-time enforcement in auth.ts does not gate on isActive either), so
    // gather it from BOTH the active and disabled connection lists.
    const noAuthProviderSpecificData = new Map();
    for (const conn of [
        ...connections,
        ...disabledNoAuthConnections
    ]){
        if (conn.provider in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]) {
            noAuthProviderSpecificData.set(conn.provider, conn.providerSpecificData);
        }
    }
    const validConnections = connections.filter(hasUsableConnectionCredential);
    const candidatePool = [];
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderRegistry"])();
    const connectionsByProvider = new Map();
    for (const conn of validConnections){
        const providerConnections = connectionsByProvider.get(conn.provider) ?? [];
        providerConnections.push(conn);
        connectionsByProvider.set(conn.provider, providerConnections);
    }
    // Build one logical candidate per provider/model and keep account fallback as an
    // allowlist on that candidate. This avoids both the old "first registry model per
    // connection" blind spot and a connections × models Cartesian candidate pool.
    for (const [providerId, providerConnections] of connectionsByProvider){
        const providerInfo = registry[providerId];
        const registryModelIds = Array.isArray(providerInfo?.models) ? providerInfo.models.map((model)=>typeof model?.id === "string" ? model.id.trim() : "").filter(Boolean) : [];
        const registryModelIdSet = new Set(registryModelIds);
        const defaultModelIds = providerConnections.map((conn)=>typeof conn.defaultModel === "string" ? conn.defaultModel.trim() : "").filter(Boolean);
        const modelIds = Array.from(new Set([
            ...registryModelIds,
            ...defaultModelIds
        ]));
        const hiddenModels = hiddenModelsMap.get(providerId);
        for (const modelId of modelIds){
            if (hiddenModels?.has(modelId)) continue;
            const allowedConnectionIds = providerConnections.filter((conn)=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(modelId, conn.providerSpecificData)) return false;
                // Registry models are provider-wide. A non-registry default (for a custom
                // or passthrough model) is scoped only to connections that selected it.
                return registryModelIdSet.has(modelId) || conn.defaultModel?.trim() === modelId;
            }).map((conn)=>conn.id);
            if (allowedConnectionIds.length === 0) continue;
            candidatePool.push({
                provider: providerId,
                connectionId: null,
                allowedConnectionIds,
                model: modelId,
                modelStr: `${providerId}/${modelId}`,
                costPer1MTokens: 0
            });
        }
    }
    candidatePool.push(...getNoAuthCandidates(new Set(validConnections.map((conn)=>conn.provider)), blockedProviders, disabledNoAuthProviders, noAuthProviderSpecificData, hiddenModelsMap, // #6453/#8183 (operator decision 2026-07-24): auto/<family> combos are an
    // identity selector, not a reliability-curated pool — bypass the no-auth
    // allowlist gate so any backend that genuinely serves the family (e.g.
    // auggie for auto/glm) is admitted. Category/tier and flat-variant pools
    // (spec.family unset) keep the allowlist gate intact.
    Boolean(spec?.family)));
    // #7623: honor existing model lockouts + connection cooldown/terminal state so
    // auto/* never advertises models the dispatch path would immediately skip.
    const connectionsById = new Map();
    for (const conn of [
        ...connections,
        ...disabledNoAuthConnections
    ]){
        connectionsById.set(conn.id, conn);
    }
    const resilienceFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterResilienceBlockedCandidates"])(candidatePool, connectionsById);
    if (resilienceFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...resilienceFilteredPool);
    }
    // #6512 (follow-up to #6328/#6495): when the operator opts into `hidePaidModels`,
    // exclude paid-only backends from EVERY `auto/*` candidate pool — not just the
    // `/v1/models` listing — so auto-routing never picks a model that will 402/403.
    // If this empties the pool the existing graceful empty-pool path below handles it
    // (consistent with the opt-in intent). Default OFF → pool unchanged.
    const paidFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterPaidOnlyCandidates"])(candidatePool, settings.hidePaidModels === true);
    if (paidFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...paidFilteredPool);
    }
    // #7819 (Level 2): per-API-key candidate exclusions. Fail-open — an absent
    // apiKeyId/autoChannel (every caller before #7819) or a DB lookup failure
    // both leave the pool untouched, so default (unconfigured) routing stays
    // byte-identical to pre-#7819 behavior.
    let excludedConnectionIds = new Set();
    if (apiKeyId && autoChannel) {
        try {
            excludedConnectionIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExcludedConnectionIds"])(apiKeyId, autoChannel);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", "Failed to load auto-candidate overrides; routing unfiltered", {
                err
            });
        }
    }
    const overrideFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$candidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterExcludedCandidates"])(candidatePool, excludedConnectionIds);
    if (overrideFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...overrideFilteredPool);
    }
    if (candidatePool.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", "No connected providers with valid credentials for virtual auto-combo");
        const emptyPool = [];
        const autoConfig = {
            candidatePool: emptyPool,
            weights: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_WEIGHTS"]
            },
            explorationRate: 0.05,
            routerStrategy: "lkgp"
        };
        return {
            id: `virtual-auto-${variant || "default"}`,
            name: `Auto ${variant || "Default"}`,
            type: "auto",
            strategy: "auto",
            models: [],
            candidatePool: emptyPool,
            weights: autoConfig.weights,
            explorationRate: autoConfig.explorationRate,
            routerStrategy: autoConfig.routerStrategy,
            autoConfig,
            config: {
                auto: autoConfig
            },
            advertisedContextLength: null,
            advertisedMaxOutputTokens: null
        };
    }
    // #4235 Phase B: narrow the pool by the `auto/<category>:<tier>` overlay
    // (vision/reasoning capability, free/premium model tier).
    //
    // Default behavior: when the filter yields zero candidates, return an EMPTY
    // pool — never silently fall back to the full pool. This makes
    // `auto/coding:free` actually mean "free tier only" and prevents a paid
    // expensive model from being picked just because no free provider is
    // connected. Operators who want the old "never break routing, lose the bias"
    // behavior can opt back in via the env var below.
    let effectivePool = candidatePool;
    // #6453: `auto/<family>` narrows by model family instead of category/tier. The
    // two overlays are mutually exclusive on the spec (family takes precedence when
    // both are somehow present, which callers never do in practice).
    const candidateFilter = spec?.family ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFamilyCandidateFilter"])(spec.family) : spec ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAutoCandidateFilter"])(spec.category, spec.tier) : null;
    if (candidateFilter) {
        const narrowed = candidatePool.filter((c)=>candidateFilter({
                provider: c.provider,
                model: c.model
            }));
        const label = spec?.family ? `auto/${spec.family}` : `auto/${spec?.category ?? ""}${spec?.tier ? `:${spec.tier}` : ""}`;
        if (narrowed.length > 0) {
            effectivePool = narrowed;
        } else if (!spec?.family && (process.env.OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL === "true" || process.env.OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL === "1")) {
            // Opt-in legacy behavior (category/tier only): warn loudly, then keep the full pool.
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", `${label} matched no connected models; falling back to the full pool (OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL=true)`);
        } else {
            // Family combos always degrade to an empty pool when unavailable — a family
            // is a hard identity constraint, not a soft optimization bias, so there is
            // no sensible "fall back to the full pool" behavior for it.
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", `${label} matched no connected models; returning an empty pool.${spec?.family ? "" : ' Set OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL=true to restore the legacy "use full pool" behavior.'}`);
            effectivePool = [];
        }
    }
    let weights = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_WEIGHTS"]
    };
    let explorationRate = 0.05; // Default exploration rate
    let routerStrategy = "lkgp"; // All auto variants use LKGP
    switch(variant){
        case "coding":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
            break;
        case "fast":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["ship-fast"]
            };
            break;
        case "cheap":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["cost-saver"]
            };
            break;
        case "offline":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["offline-friendly"]
            };
            break;
        case "smart":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
            explorationRate = 0.1; // Override default exploration rate
            break;
        case "lkgp":
            break;
        case "chaos":
            // Chaos mode: select top-N most stable models and fan them out in parallel
            // (strategy "fusion"). Prioritize health + stability via the chaos-mode pack.
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["chaos-mode"]
            };
            explorationRate = 0; // no exploration — only the proven-stable set
            break;
        case undefined:
            break;
    }
    // #4235 Phase B: category/tier weight overlay. A non-chat category leans
    // quality-first; the tier then refines toward latency (fast), cost (cheap/floor)
    // or availability (reliable). free/pro keep the base weights — their bias is the
    // candidate filter above (free → free-tier models, pro → premium models).
    if (spec) {
        if (spec.category && spec.category !== "chat") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
        }
        const weightVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tierToWeightVariant"])(spec.tier);
        if (weightVariant === "fast") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["ship-fast"]
            };
        } else if (weightVariant === "cheap") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["cost-saver"]
            };
        } else if (weightVariant === "reliability") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODE_PACKS"]["reliability-first"]
            };
        }
    }
    const providerPool = [
        ...new Set(effectivePool.map((c)=>c.provider))
    ];
    const models = effectivePool.map((candidate, index)=>({
            id: `virtual-auto-${variant || "default"}-${index + 1}-${candidate.provider}`,
            kind: "model",
            model: candidate.modelStr,
            providerId: candidate.provider,
            connectionId: candidate.connectionId,
            ...candidate.allowedConnectionIds ? {
                allowedConnectionIds: candidate.allowedConnectionIds
            } : {},
            weight: 1,
            label: candidate.provider
        }));
    const autoConfig = {
        candidatePool: providerPool,
        weights,
        explorationRate,
        routerStrategy
    };
    // Chaos mode fans out to the top-N most stable models in parallel. Panel size
    // is capped to keep a single IDE request from fanning out to dozens of providers;
    // operators can override via env var OMNIROUTE_CHAOS_MAX_PANEL (default 5).
    //
    // Provider diversity: when multiple candidates from the same provider exist, only
    // the highest-scored model per provider is included. This prevents a single
    // provider from monopolizing the panel and gives the IDE truly diverse answers.
    const isChaos = variant === "chaos";
    const CHAOS_MAX_PANEL = (()=>{
        const env = process.env.OMNIROUTE_CHAOS_MAX_PANEL;
        const parsed = env ? parseInt(env, 10) : 5;
        return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10) : 5;
    })();
    let chaosModels;
    if (isChaos) {
        // Deduplicate by provider: keep first occurrence per provider (models are
        // already scored/sorted by health + stability from scoring).
        const seenProviders = new Set();
        const diverse = [];
        for (const m of models){
            if (seenProviders.has(m.providerId)) continue;
            seenProviders.add(m.providerId);
            diverse.push(m);
            if (diverse.length >= CHAOS_MAX_PANEL) break;
        }
        chaosModels = diverse.length > 0 ? diverse : models.slice(0, CHAOS_MAX_PANEL);
    } else {
        chaosModels = models;
    }
    const advertisedLimits = computeAdvertisedLimits(effectivePool);
    return {
        id: `virtual-auto-${variant || "default"}`,
        name: `Auto ${variant || "Default"}`,
        type: "auto",
        strategy: "auto",
        models: chaosModels,
        candidatePool: providerPool,
        weights,
        explorationRate,
        routerStrategy,
        autoConfig,
        // For chaos, stash the panel size + a flag so downstream handlers can detect
        // the broadcast mode and stream each panel model back to IDEs that opt in.
        config: {
            auto: autoConfig,
            ...isChaos ? {
                chaos: {
                    enabled: true,
                    panelSize: chaosModels.length,
                    judgeModel: chaosModels[0]?.model,
                    tuning: {
                        panelHardTimeoutMs: Number(process.env.OMNIROUTE_CHAOS_PANEL_TIMEOUT_MS) || undefined,
                        minPanel: Number(process.env.OMNIROUTE_CHAOS_MIN_PANEL) || undefined
                    }
                }
            } : {}
        },
        advertisedContextLength: advertisedLimits.contextLength,
        advertisedMaxOutputTokens: advertisedLimits.maxOutputTokens
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_0806nnd._.js.map