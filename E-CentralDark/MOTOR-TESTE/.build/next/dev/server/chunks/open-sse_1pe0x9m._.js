module.exports = [
"[project]/open-sse/shared/zedAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZED_CLOUD_BASE_URL",
    ()=>ZED_CLOUD_BASE_URL,
    "ZED_HEADERS",
    ()=>ZED_HEADERS,
    "ZED_LLM_BASE_URL",
    ()=>ZED_LLM_BASE_URL,
    "ZED_WEB_BASE_URL",
    ()=>ZED_WEB_BASE_URL,
    "buildZedUserAuthHeader",
    ()=>buildZedUserAuthHeader,
    "clearZedCaches",
    ()=>clearZedCaches,
    "createZedNativeAuthData",
    ()=>createZedNativeAuthData,
    "decodeZedPrivateKeyVerifier",
    ()=>decodeZedPrivateKeyVerifier,
    "decryptZedAccessToken",
    ()=>decryptZedAccessToken,
    "encodeZedPrivateKeyVerifier",
    ()=>encodeZedPrivateKeyVerifier,
    "fetchZedAuthenticatedUser",
    ()=>fetchZedAuthenticatedUser,
    "fetchZedLlmToken",
    ()=>fetchZedLlmToken,
    "mapZedModel",
    ()=>mapZedModel,
    "parseZedCallbackPayload",
    ()=>parseZedCallbackPayload,
    "resolveZedModels",
    ()=>resolveZedModels,
    "resolveZedOrganizationId",
    ()=>resolveZedOrganizationId,
    "shouldRefreshZedLlmToken",
    ()=>shouldRefreshZedLlmToken,
    "zedLlmFetch",
    ()=>zedLlmFetch
]);
/**
 * Zed Hosted Models — auth + model-catalog helpers.
 *
 * Zed's cloud aggregator (cloud.zed.dev) authenticates native apps with a
 * self-generated RSA keypair instead of a registered OAuth client_id/secret:
 *
 *   1. The client (OmniRoute) generates an ephemeral RSA keypair.
 *   2. It sends the public key to zed.dev/native_app_signin (as a URL param).
 *   3. The user signs in inside their browser (Zed itself brokers GitHub/Google).
 *   4. Zed's browser flow redirects to a local "native app" callback
 *      (`http://127.0.0.1:<port>/?user_id=...&access_token=...`) with the
 *      access token RSA-encrypted against the public key we sent in step 2.
 *   5. OmniRoute decrypts the access token locally with the private key that
 *      never left the server (or the operator's browser/paste flow).
 *
 * No client_id/client_secret/Firebase key is embedded anywhere in this file —
 * the "credential" is a keypair generated fresh per login attempt, so
 * CLAUDE.md Hard Rule #11 (resolvePublicCred for embedded upstream secrets)
 * does not apply here.
 *
 * Ported from decolua/9router PR #2328 (open-sse/shared/zedAuth.js),
 * adapted to TypeScript + OmniRoute conventions. `fetch` is intentionally the
 * global one — open-sse/utils/proxyFetch.ts monkey-patches `globalThis.fetch`
 * with the proxy-aware dispatcher at module load, so every plain `fetch()`
 * call in this codebase already goes through it.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const ZED_WEB_BASE_URL = "https://zed.dev";
const ZED_CLOUD_BASE_URL = "https://cloud.zed.dev";
const ZED_LLM_BASE_URL = "https://cloud.zed.dev";
const ZED_HEADERS = {
    expiredToken: "x-zed-expired-token",
    outdatedToken: "[REDIGIDO-PRESERVACAO]",
    clientSupportsStatus: "x-zed-client-supports-status-messages",
    clientSupportsStreamEnded: "x-zed-client-supports-stream-ended-request-completion-status",
    serverSupportsStatus: "x-zed-server-supports-status-messages",
    clientSupportsXai: "x-zed-client-supports-x-ai",
    systemId: "x-zed-system-id"
};
const PRIVATE_KEY_PREFIX = "zed-rsa-pkcs1:";
const LLM_TOKEN_TTL_MS = 50 * 60 * 1000;
const MODEL_CACHE_TTL_MS = 60 * 60 * 1000;
const llmTokenCache = new Map();
const modelCache = new Map();
const modelInflight = new Map();
function b64url(value) {
    return Buffer.from(value).toString("base64url");
}
function b64urlPadded(value) {
    return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value) {
    return Buffer.from(String(value || ""), "base64url").toString("utf8");
}
function normalizeBaseUrl(baseUrl, fallback) {
    return String(baseUrl || fallback).replace(/\/+$/, "");
}
function zedUrl(config, key, path, fallbackBase) {
    const base = normalizeBaseUrl(config?.[key], fallbackBase);
    return `${base}${path}`;
}
function encodeZedPrivateKeyVerifier(privateKeyPem) {
    return `${PRIVATE_KEY_PREFIX}${b64url(privateKeyPem)}`;
}
function decodeZedPrivateKeyVerifier(verifier) {
    const value = String(verifier || "");
    if (!value.startsWith(PRIVATE_KEY_PREFIX)) {
        throw new Error("Missing Zed private key verifier; restart the login flow");
    }
    return fromB64url(value.slice(PRIVATE_KEY_PREFIX.length));
}
function createZedNativeAuthData(config = {}, options = {}) {
    const { publicKey, privateKey } = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "der"
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        }
    });
    const nativeAppPort = Number(options.nativeAppPort || config.defaultNativeAppPort || 58443);
    const systemId = options.systemId || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
    const publicKeyString = b64urlPadded(publicKey);
    const signInUrl = new URL(`${normalizeBaseUrl(config.webBaseUrl, ZED_WEB_BASE_URL)}/native_app_signin`);
    signInUrl.searchParams.set("native_app_port", String(nativeAppPort));
    signInUrl.searchParams.set("native_app_public_key", publicKeyString);
    if (systemId) signInUrl.searchParams.set("system_id", systemId);
    return {
        authUrl: signInUrl.toString(),
        privateKeyVerifier: encodeZedPrivateKeyVerifier(privateKey),
        nativeAppPort,
        systemId,
        publicKey: publicKeyString
    };
}
function parseZedCallbackPayload(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error("Missing Zed callback URL");
    let data = {};
    try {
        data = JSON.parse(raw);
    } catch  {
        let url;
        try {
            url = new URL(raw);
        } catch  {
            try {
                url = new URL(`http://127.0.0.1/?${raw.replace(/^\?/, "")}`);
            } catch  {
                throw new Error("Invalid Zed callback URL");
            }
        }
        url.searchParams.forEach((value, key)=>{
            data[key] = value;
        });
    }
    const userId = data.user_id || data.userId;
    const encryptedAccessToken = data.access_token || data.accessToken || data.token;
    if (!userId || !encryptedAccessToken) {
        throw new Error("Zed callback must include user_id and access_token");
    }
    return {
        userId: String(userId),
        encryptedAccessToken: String(encryptedAccessToken)
    };
}
function decryptZedAccessToken(encryptedAccessToken, privateKeyVerifier) {
    const privateKey = decodeZedPrivateKeyVerifier(privateKeyVerifier);
    const encrypted = Buffer.from(String(encryptedAccessToken), "base64url");
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].privateDecrypt({
            key: privateKey,
            padding: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        }, encrypted).toString("utf8");
    } catch (oaepError) {
        try {
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].privateDecrypt({
                key: privateKey,
                padding: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].constants.RSA_PKCS1_PADDING
            }, encrypted).toString("utf8");
        } catch  {
            const message = oaepError instanceof Error ? oaepError.message : String(oaepError);
            throw new Error(`Failed to decrypt Zed access token: ${message}`);
        }
    }
}
function buildZedUserAuthHeader(credentials) {
    const psd = credentials?.providerSpecificData || {};
    const userId = psd.userId || credentials?.userId;
    const accessToken = credentials?.accessToken || credentials?.apiKey;
    if (!userId || !accessToken) {
        throw new Error("Zed credential is missing userId or accessToken");
    }
    return `${userId} ${accessToken}`;
}
function getSystemId(credentials) {
    return String(credentials?.providerSpecificData?.systemId || credentials?.systemId || "");
}
async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch  {
            data = {
                raw: text
            };
        }
    }
    if (!res.ok) {
        const message = data?.message || data?.error?.message || data?.error || text || `HTTP ${res.status}`;
        const err = new Error(String(message));
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
}
async function fetchZedAuthenticatedUser(credentials, options = {}) {
    const config = options.config || {};
    const headers = {
        Accept: "application/json",
        Authorization: buildZedUserAuthHeader(credentials)
    };
    const systemId = getSystemId(credentials);
    if (systemId) headers[ZED_HEADERS.systemId] = systemId;
    return fetchJson(zedUrl(config, "cloudBaseUrl", "/client/users/me", ZED_CLOUD_BASE_URL), {
        method: "GET",
        headers,
        signal: options.signal ?? undefined
    });
}
function normalizeOrganizationId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
        const rec = value;
        if (typeof rec[0] === "string") return rec[0];
        if (typeof rec.id === "string") return rec.id;
    }
    return String(value);
}
function resolveZedOrganizationId(credentials, userInfo = null) {
    const psd = credentials?.providerSpecificData || {};
    const explicit = normalizeOrganizationId(psd.organizationId || psd.defaultOrganizationId);
    if (explicit) return explicit;
    const fromUser = normalizeOrganizationId(userInfo?.default_organization_id || userInfo?.defaultOrganizationId);
    if (fromUser) return fromUser;
    const org = (userInfo?.organizations || []).find((item)=>item?.is_personal) || userInfo?.organizations?.[0];
    return normalizeOrganizationId(org?.id);
}
function zedUserCacheKey(credentials, organizationId) {
    const psd = credentials?.providerSpecificData || {};
    const userId = psd.userId || credentials.userId || "unknown";
    const token = credentials?.accessToken || credentials?.apiKey || "";
    return `${userId}:${organizationId || "default"}:${token.slice(-16)}`;
}
function zedModelCacheKey(credentials) {
    const psd = credentials?.providerSpecificData || {};
    const org = psd.organizationId || psd.defaultOrganizationId || "default";
    const token = credentials?.accessToken || credentials?.apiKey || "";
    return `${psd.userId || "unknown"}:${org}:${token.slice(-16)}`;
}
async function fetchZedLlmToken(credentials, options = {}) {
    const config = options.config || {};
    let organizationId = options.organizationId || resolveZedOrganizationId(credentials);
    if (!organizationId) {
        const userInfo = await fetchZedAuthenticatedUser(credentials, options);
        organizationId = resolveZedOrganizationId(credentials, userInfo);
    }
    if (!organizationId) throw new Error("No Zed organization selected");
    const cacheKey = zedUserCacheKey(credentials, organizationId);
    const cached = llmTokenCache.get(cacheKey);
    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) return cached.token;
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: buildZedUserAuthHeader(credentials)
    };
    const systemId = getSystemId(credentials);
    if (systemId) headers[ZED_HEADERS.systemId] = systemId;
    const data = await fetchJson(zedUrl(config, "cloudBaseUrl", "/client/llm_tokens", ZED_CLOUD_BASE_URL), {
        method: "POST",
        headers,
        body: JSON.stringify({
            organization_id: organizationId
        }),
        signal: options.signal ?? undefined
    });
    const token = typeof data?.token === "string" ? data.token : data?.token?.[0] || data?.token?.value;
    if (!token) throw new Error("Zed did not return an LLM token");
    llmTokenCache.set(cacheKey, {
        token,
        expiresAt: Date.now() + LLM_TOKEN_TTL_MS
    });
    return token;
}
function shouldRefreshZedLlmToken(response) {
    return response?.status === 401 || !!response?.headers?.has?.(ZED_HEADERS.expiredToken) || !!response?.headers?.has?.(ZED_HEADERS.outdatedToken);
}
async function zedLlmFetch(credentials, path, options = {}) {
    const config = options.config || {};
    const url = zedUrl(config, "llmBaseUrl", path, ZED_LLM_BASE_URL);
    const buildRequest = async (forceRefresh)=>{
        const token = await fetchZedLlmToken(credentials, {
            ...options,
            forceRefresh
        });
        return fetch(url, {
            ...options.fetchOptions,
            headers: {
                ...options.fetchOptions?.headers || {},
                Authorization: `Bearer ${token}`
            },
            signal: options.signal ?? undefined
        });
    };
    let response = await buildRequest(false);
    if (shouldRefreshZedLlmToken(response)) {
        response = await buildRequest(true);
    }
    return response;
}
function normalizeZedModelId(id) {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id !== null) {
        const rec = id;
        if (typeof rec[0] === "string") return rec[0];
        if (typeof rec.id === "string") return rec.id;
    }
    return String(id);
}
function mapZedModel(model) {
    const id = normalizeZedModelId(model?.id);
    if (!id) return null;
    return {
        id,
        name: model.display_name || model.displayName || id,
        provider: model.provider,
        isLatest: !!model.is_latest,
        contextLength: model.max_token_count ?? model.maxTokenCount,
        contextLengthInMaxMode: model.max_token_count_in_max_mode ?? model.maxTokenCountInMaxMode,
        maxOutputTokens: model.max_output_tokens ?? model.maxOutputTokens,
        supportsTools: !!model.supports_tools,
        supportsImages: !!model.supports_images,
        supportsThinking: !!model.supports_thinking,
        supportsDisablingThinking: !!model.supports_disabling_thinking,
        supportsFastMode: !!model.supports_fast_mode,
        supportsServerSideCompaction: !!model.supports_server_side_compaction,
        supportedEffortLevels: model.supported_effort_levels ?? model.supportedEffortLevels ?? [],
        supportsStreamingTools: !!model.supports_streaming_tools,
        supportsParallelToolCalls: !!model.supports_parallel_tool_calls,
        isDisabled: !!model.is_disabled,
        disabledReason: model.disabled_reason ?? null
    };
}
async function resolveZedModels(credentials, options = {}) {
    if (!credentials?.accessToken) return null;
    const key = zedModelCacheKey(credentials);
    const cached = modelCache.get(key);
    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) return cached;
    const existing = modelInflight.get(key);
    if (existing && !options.forceRefresh) return existing;
    const promise = (async ()=>{
        const response = await zedLlmFetch(credentials, "/models", {
            ...options,
            fetchOptions: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    [ZED_HEADERS.clientSupportsXai]: "true"
                }
            }
        });
        if (!response.ok) {
            const text = await response.text().catch(()=>"");
            throw new Error(`Zed models failed: ${response.status} ${text}`);
        }
        const data = await response.json();
        const rawModels = Array.isArray(data?.models) ? data.models : [];
        const models = rawModels.map(mapZedModel).filter((m)=>!!m).filter((model)=>!model.isDisabled);
        const rawById = new Map();
        for (const raw of rawModels){
            const id = normalizeZedModelId(raw?.id);
            if (id) rawById.set(id, raw);
        }
        const entry = {
            expiresAt: Date.now() + MODEL_CACHE_TTL_MS,
            models,
            rawModels,
            rawById,
            defaultModel: normalizeZedModelId(data?.default_model ?? data?.defaultModel),
            defaultFastModel: normalizeZedModelId(data?.default_fast_model ?? data?.defaultFastModel),
            recommendedModels: (data?.recommended_models || data?.recommendedModels || []).map(normalizeZedModelId).filter(Boolean)
        };
        modelCache.set(key, entry);
        return entry;
    })();
    modelInflight.set(key, promise);
    try {
        return await promise;
    } finally{
        if (modelInflight.get(key) === promise) modelInflight.delete(key);
    }
}
function clearZedCaches() {
    llmTokenCache.clear();
    modelCache.clear();
    modelInflight.clear();
}
}),
"[project]/open-sse/lib/deepseek-pow-solver.cjs [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {

const r = (id)=>{
    if (id === 46743) return {
        Buffer
    };
    return {};
};
const t = {}, e = {};
"use strict";
let n, i;
r(42551), r(40966), r(70968), r(76966), r(35399), r(36279), r(87801), r(16389), r(36073), r(27448), r(10681), r(32014), r(46596), r(39008), r(71), r(85540);
var o = r(46743), f = Object.create, u = Object.defineProperty, s = Object.getOwnPropertyDescriptor, a = Object.getOwnPropertyNames, c = Object.getPrototypeOf, h = Object.prototype.hasOwnProperty, l = (t, e, r)=>(r = null != t ? f(c(t)) : {}, ((t, e, r, n)=>{
        if (e && "object" == typeof e || "function" == typeof e) for (let i of a(e))h.call(t, i) || i === r || u(t, i, {
            get: ()=>e[i],
            enumerable: !(n = s(e, i)) || n.enumerable
        });
        return t;
    })(!e && t && t.__esModule ? r : u(r, "default", {
        value: t,
        enumerable: !0
    }), t)), p = (n = (t, e)=>{
    e.exports = (t, e)=>(r, n)=>{
            let i = 2 * n, o = 2 * e;
            r[i] = t[o], r[i + 1] = t[o + 1];
        };
}, ()=>(i || n((i = {
        exports: {}
    }).exports, i), i.exports)), g = l(p()), y = (t)=>{
    let { A: e, C: r } = t;
    for(let t = 0; t < 25; t += 5){
        for(let n = 0; n < 5; n++)(0, g.default)(e, t + n)(r, n);
        for(let n = 0; n < 5; n++){
            let i = (t + n) * 2, o = (n + 1) % 5 * 2, f = (n + 2) % 5 * 2;
            e[i] ^= ~r[o] & r[f], e[i + 1] ^= ~r[o + 1] & r[f + 1];
        }
    }
}, d = new Uint32Array([
    0,
    1,
    0,
    32898,
    0x80000000,
    32906,
    0x80000000,
    0x80008000,
    0,
    32907,
    0,
    0x80000001,
    0x80000000,
    0x80008081,
    0x80000000,
    32777,
    0,
    138,
    0,
    136,
    0,
    0x80008009,
    0,
    0x8000000a,
    0,
    0x8000808b,
    0x80000000,
    139,
    0x80000000,
    32905,
    0x80000000,
    32771,
    0x80000000,
    32770,
    0x80000000,
    128,
    0,
    32778,
    0x80000000,
    0x8000000a,
    0x80000000,
    0x80008081,
    0x80000000,
    32896,
    0,
    0x80000001,
    0x80000000,
    0x80008008
]), b = (t)=>{
    let { A: e, I: r } = t, n = 2 * r;
    e[0] ^= d[n], e[1] ^= d[n + 1];
}, v = [
    10,
    7,
    11,
    17,
    18,
    3,
    5,
    16,
    8,
    21,
    24,
    4,
    15,
    23,
    19,
    13,
    12,
    2,
    20,
    14,
    22,
    9,
    6,
    1
], w = [
    1,
    3,
    6,
    10,
    15,
    21,
    28,
    36,
    45,
    55,
    2,
    14,
    27,
    41,
    56,
    8,
    25,
    43,
    62,
    18,
    39,
    61,
    20,
    44
], x = l(p()), E = (t)=>{
    let { A: e, C: r, W: n } = t, i = 0;
    (0, x.default)(e, i + 1)(n, i);
    let o = 0, f = 0, u = 0, s = 32;
    for(; i < 24; i++){
        let t = v[i], a = w[i];
        (0, x.default)(e, t)(r, 0), o = n[0], f = n[1], s = 32 - a, n[u = a < 32 ? 0 : 1] = o << a | f >>> s, n[(u + 1) % 2] = f << a | o >>> s, (0, x.default)(n, 0)(e, t), (0, x.default)(r, 0)(n, 0);
    }
}, m = l(p()), B = (t)=>{
    let { A: e, C: r, D: n, W: i } = t, o = 0, f = 0;
    for(let t = 0; t < 5; t++){
        let n = 2 * t, i = (t + 5) * 2, o = (t + 10) * 2, f = (t + 15) * 2, u = (t + 20) * 2;
        r[n] = e[n] ^ e[i] ^ e[o] ^ e[f] ^ e[u], r[n + 1] = e[n + 1] ^ e[i + 1] ^ e[o + 1] ^ e[f + 1] ^ e[u + 1];
    }
    for(let t = 0; t < 5; t++){
        (0, m.default)(r, (t + 1) % 5)(i, 0), o = i[0], f = i[1], i[0] = o << 1 | f >>> 31, i[1] = f << 1 | o >>> 31, n[2 * t] = r[(t + 4) % 5 * 2] ^ i[0], n[2 * t + 1] = r[(t + 4) % 5 * 2 + 1] ^ i[1];
        for(let r = 0; r < 25; r += 5)e[(r + t) * 2] ^= n[2 * t], e[(r + t) * 2 + 1] ^= n[2 * t + 1];
    }
}, I = (t, e)=>{
    for(let r = 0; r < t.length; r += 8){
        let n = r / 4;
        e[n] ^= t[r + 7] << 24 | t[r + 6] << 16 | t[r + 5] << 8 | t[r + 4], e[n + 1] ^= t[r + 3] << 24 | t[r + 2] << 16 | t[r + 1] << 8 | t[r];
    }
    return e;
}, A = (t, e)=>{
    for(let r = 0; r < e.length; r += 8){
        let n = r / 4;
        e[r] = t[n + 1], e[r + 1] = t[n + 1] >>> 8, e[r + 2] = t[n + 1] >>> 16, e[r + 3] = t[n + 1] >>> 24, e[r + 4] = t[n], e[r + 5] = t[n] >>> 8, e[r + 6] = t[n] >>> 16, e[r + 7] = t[n] >>> 24;
    }
    return e;
}, U = function(t) {
    let e, r, n, { capacity: i, padding: f } = t, u = i / 8, s = 200 - i / 4, a = {
        keccak: (e = new Uint32Array(10), r = new Uint32Array(10), n = new Uint32Array(2), (t)=>{
            for(let i = 1; i < 24; i++)B({
                A: t,
                C: e,
                D: r,
                W: n
            }), E({
                A: t,
                C: e,
                W: n
            }), y({
                A: t,
                C: e
            }), b({
                A: t,
                I: i
            });
            e.fill(0), r.fill(0), n.fill(0);
        }),
        state: new Uint32Array(50),
        queue: o.Buffer.allocUnsafe(s),
        queueOffset: 0
    };
    return this.getState = ()=>a, this.setState = (t)=>{
        a.keccak = t.keccak, a.state.set(t.state.slice()), t.queue.copy(a.queue), a.queueOffset = t.queueOffset;
    }, this.absorb = (t)=>{
        for(let e = 0; e < t.length; e++)a.queue[a.queueOffset] = t[e], a.queueOffset += 1, a.queueOffset >= s && (I(a.queue, a.state), a.keccak(a.state), a.queueOffset = 0);
        return this;
    }, this.squeeze = (t)=>{
        let e = {
            buffer: o.Buffer.allocUnsafe(u),
            padding: t,
            queue: o.Buffer.allocUnsafe(a.queue.length),
            state: new Uint32Array(a.state.length)
        };
        a.queue.copy(e.queue);
        for(let t = 0; t < a.state.length; t++)e.state[t] = a.state[t];
        e.queue.fill(0, a.queueOffset), e.queue[a.queueOffset] |= e.padding, e.queue[s - 1] |= 128, I(e.queue, e.state);
        for(let t = 0; t < e.buffer.length; t += s)a.keccak(e.state), A(e.state, e.buffer.slice(t, t + s));
        return e.buffer;
    }, this.reset = ()=>(a.queue.fill(0), a.state.fill(0), a.queueOffset = 0, this), this.copy = ()=>{
        let t = new U({
            capacity: i,
            padding: f
        });
        return t.setState(this.getState()), t;
    }, this;
}; /* #2724: guard Web Worker handler — Node.js require() loads this CJS in strict mode where bare `onmessage = ...` throws ReferenceError */ 
typeof self !== "undefined" && typeof postMessage !== "undefined" && (globalThis.onmessage = (t)=>{
    if ("pow-challenge" !== t.data.type) return;
    let { algorithm: e, challenge: r, salt: n, difficulty: i, signature: f, expireAt: u } = t.data.challenge;
    try {
        let t = ((t, e, r, n, i)=>{
            if ("DeepSeekHashV1" !== t) throw Error("Unsupported algorithm: " + t);
            let f = "".concat(r, "_").concat(i, "_"), u = function(t, e, r) {
                if (t.length % 2 != 0) throw RangeError("c.length");
                if (r <= 0 || !Number.isSafeInteger(r)) throw RangeError("d");
                for(var n = (function t() {
                    var e = this;
                    return this && this.constructor === t ? (this._sponge = new U({
                        capacity: 256
                    }), this.update = (t)=>{
                        if ("string" == typeof t) return this._sponge.absorb(o.Buffer.from(t, "utf8")), this;
                        throw TypeError("input not a string");
                    }, this.digest = function() {
                        let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "hex";
                        return e._sponge.squeeze(6).toString(t);
                    }, this.copy = ()=>{
                        let e = new t;
                        return e._sponge = this._sponge.copy(), e;
                    }, this) : new t;
                })(256).update(e), i = 0; i < r; i++)if (n.copy().update(String(i)).digest("hex") === t) return i;
                return null;
            }(e, f, n);
            if ("number" != typeof u) throw Error("No solution found: " + "algorithm: ".concat(t, ", ") + "challenge: ".concat(e, ", ") + "difficulty: ".concat(n, ", ") + "prefix: ".concat(f));
            return u;
        })(e, r, n, i, u);
        postMessage({
            type: "pow-answer",
            answer: {
                algorithm: e,
                challenge: r,
                salt: n,
                answer: t,
                signature: f
            }
        });
    } catch (t) {
        t instanceof Error ? postMessage({
            type: "pow-error",
            error: t
        }) : postMessage({
            type: "pow-error",
            error: Error("Unknown error", {
                cause: t
            })
        });
    }
});
module.exports = {
    U
};
}),
"[project]/open-sse/lib/deepseek-pow.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "solveDeepSeekPow",
    ()=>solveDeepSeekPow,
    "solveDeepSeekPowAsync",
    ()=>solveDeepSeekPowAsync
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/lib/deepseek-pow.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
// ── WASM solver (fast — ~50-100ms at difficulty 144000) ──────────────────
class DeepSeekHashWasm {
    wasmInstance;
    offset = 0;
    cachedUint8Memory = null;
    cachedTextEncoder = new TextEncoder();
    getCachedUint8Memory() {
        if (!this.cachedUint8Memory?.byteLength) {
            this.cachedUint8Memory = new Uint8Array(this.wasmInstance.memory.buffer);
        }
        return this.cachedUint8Memory;
    }
    encodeString(text, allocate, reallocate) {
        const strLength = text.length;
        let ptr = allocate(strLength, 1) >>> 0;
        const memory = this.getCachedUint8Memory();
        let asciiLength = 0;
        for(; asciiLength < strLength; asciiLength++){
            if (text.charCodeAt(asciiLength) > 127) break;
            memory[ptr + asciiLength] = text.charCodeAt(asciiLength);
        }
        if (asciiLength !== strLength) {
            if (asciiLength > 0) text = text.slice(asciiLength);
            ptr = reallocate(ptr, strLength, asciiLength + text.length * 3, 1) >>> 0;
            const result = this.cachedTextEncoder.encodeInto(text, this.getCachedUint8Memory().subarray(ptr + asciiLength, ptr + asciiLength + text.length * 3));
            asciiLength += result.written;
            ptr = reallocate(ptr, asciiLength + text.length * 3, asciiLength, 1) >>> 0;
        }
        this.offset = asciiLength;
        return ptr;
    }
    calculateHash(challenge, prefix, difficulty) {
        try {
            const retptr = this.wasmInstance.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = this.encodeString(challenge, this.wasmInstance.__wbindgen_export_0, this.wasmInstance.__wbindgen_export_1);
            const len0 = this.offset;
            const ptr1 = this.encodeString(prefix, this.wasmInstance.__wbindgen_export_0, this.wasmInstance.__wbindgen_export_1);
            const len1 = this.offset;
            this.wasmInstance.wasm_solve(retptr, ptr0, len0, ptr1, len1, difficulty);
            const dv = new DataView(this.wasmInstance.memory.buffer);
            const status = dv.getInt32(retptr + 0, true);
            const value = dv.getFloat64(retptr + 8, true);
            return status === 0 ? undefined : value;
        } finally{
            this.wasmInstance.__wbindgen_add_to_stack_pointer(16);
        }
    }
    async init(wasmPath) {
        const wasmBuffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].promises.readFile(wasmPath);
        const { instance } = await WebAssembly.instantiate(wasmBuffer, {
            wbg: {}
        });
        this.wasmInstance = instance.exports;
    }
}
let _wasmSolver = null;
let _wasmInitFailed = false;
async function getWasmSolver() {
    if (_wasmInitFailed) return null;
    if (_wasmSolver) return _wasmSolver;
    try {
        const solver = new DeepSeekHashWasm();
        const wasmPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url)), "sha3_wasm_bg.wasm");
        await solver.init(wasmPath);
        _wasmSolver = solver;
        return solver;
    } catch  {
        _wasmInitFailed = true;
        return null;
    }
}
// ── JS fallback solver (slow — ~5-6s at difficulty 144000) ───────────────
const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
let _U;
function loadU() {
    if (_U === undefined) {
        _U = __turbopack_context__.r("[project]/open-sse/lib/deepseek-pow-solver.cjs [instrumentation] (ecmascript)").U;
    }
    return _U;
}
function solveWithJS(challenge, prefix, difficulty) {
    const U = loadU();
    const createHash = ()=>{
        const self = {};
        self._sponge = new U({
            capacity: 256,
            padding: 6
        });
        self.update = (s)=>{
            self._sponge.absorb(Buffer.from(s, "utf8"));
            return self;
        };
        self.digest = (fmt)=>{
            return self._sponge.squeeze(6).toString(fmt || "hex");
        };
        self.copy = ()=>{
            const c = {};
            c._sponge = self._sponge.copy();
            c.update = (s)=>{
                c._sponge.absorb(Buffer.from(s, "utf8"));
                return c;
            };
            c.digest = (fmt)=>{
                return c._sponge.squeeze(6).toString(fmt || "hex");
            };
            return c;
        };
        return self;
    };
    const h = createHash();
    h.update(prefix);
    for(let nonce = 0; nonce < difficulty; nonce++){
        if (h.copy().update(String(nonce)).digest("hex") === challenge) {
            return nonce;
        }
    }
    return -1;
}
async function solveDeepSeekPowAsync(algorithm, challenge, salt, difficulty, expireAt) {
    if (algorithm !== "DeepSeekHashV1") throw new Error(`Unsupported: ${algorithm}`);
    const prefix = `${salt}_${expireAt}_`;
    const wasm = await getWasmSolver();
    if (wasm) {
        const answer = wasm.calculateHash(challenge, prefix, difficulty);
        if (answer === undefined) return -1;
        return answer;
    }
    return solveWithJS(challenge, prefix, difficulty);
}
function solveDeepSeekPow(algorithm, challenge, salt, difficulty, expireAt) {
    if (algorithm !== "DeepSeekHashV1") throw new Error(`Unsupported: ${algorithm}`);
    const prefix = `${salt}_${expireAt}_`;
    return solveWithJS(challenge, prefix, difficulty);
}
}),
];

//# sourceMappingURL=open-sse_1pe0x9m._.js.map