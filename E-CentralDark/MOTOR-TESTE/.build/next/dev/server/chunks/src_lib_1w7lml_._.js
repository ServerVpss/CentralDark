module.exports = [
"[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITLAB_DUO_DEFAULT_BASE_URL",
    ()=>GITLAB_DUO_DEFAULT_BASE_URL,
    "buildGitLabDirectGatewayUrl",
    ()=>buildGitLabDirectGatewayUrl,
    "buildGitLabOAuthEndpoints",
    ()=>buildGitLabOAuthEndpoints,
    "getCachedGitLabDirectAccess",
    ()=>getCachedGitLabDirectAccess,
    "isGitLabDirectAccessDisabled",
    ()=>isGitLabDirectAccessDisabled,
    "normalizeGitLabBaseUrl",
    ()=>normalizeGitLabBaseUrl,
    "parseGitLabDirectAccessDetails",
    ()=>parseGitLabDirectAccessDetails,
    "resolveGitLabOAuthBaseUrl",
    ()=>resolveGitLabOAuthBaseUrl
]);
const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`
    };
}
function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry)=>typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at) ? new Date(data.expires_at * 1000).toISOString() : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers
    };
}
function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
}),
"[project]/src/lib/oauth/utils/codexConnectionSelection.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickCodexConnectionForUser",
    ()=>pickCodexConnectionForUser
]);
function toRecord(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function nonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function readIdentity(connection) {
    const providerSpecificData = toRecord(connection.providerSpecificData ?? connection.provider_specific_data);
    return {
        workspaceId: nonEmptyString(providerSpecificData.workspaceId),
        userId: nonEmptyString(providerSpecificData.chatgptUserId),
        email: nonEmptyString(connection.email)
    };
}
function pickCodexConnectionForUser(workspaceMatches, userId, email) {
    const identities = workspaceMatches.map((connection)=>({
            connection,
            identity: readIdentity(connection)
        }));
    const exact = identities.find(({ identity })=>identity.userId === userId);
    if (exact) return exact.connection;
    if (identities.some(({ identity })=>identity.userId !== null)) return null;
    const normalizedEmail = nonEmptyString(email);
    const compatibleEmail = normalizedEmail ? identities.find(({ identity })=>identity.email === normalizedEmail) : null;
    return compatibleEmail?.connection || identities.find(({ identity })=>identity.email === null)?.connection || null;
}
}),
"[project]/src/lib/oauth/constants/oauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AGY_CONFIG",
    ()=>AGY_CONFIG,
    "ANTIGRAVITY_CONFIG",
    ()=>ANTIGRAVITY_CONFIG,
    "AWS_REGION_PATTERN",
    ()=>AWS_REGION_PATTERN,
    "CLAUDE_CONFIG",
    ()=>CLAUDE_CONFIG,
    "CLINE_CONFIG",
    ()=>CLINE_CONFIG,
    "CODEBUDDY_CN_CONFIG",
    ()=>CODEBUDDY_CN_CONFIG,
    "CODEX_CONFIG",
    ()=>CODEX_CONFIG,
    "CURSOR_CONFIG",
    ()=>CURSOR_CONFIG,
    "GHE_COPILOT_CONFIG",
    ()=>GHE_COPILOT_CONFIG,
    "GITHUB_CONFIG",
    ()=>GITHUB_CONFIG,
    "GITLAB_DUO_CONFIG",
    ()=>GITLAB_DUO_CONFIG,
    "GROK_BUILD_OAUTH_CONFIG",
    ()=>GROK_BUILD_OAUTH_CONFIG,
    "GROK_CLI_CONFIG",
    ()=>GROK_CLI_CONFIG,
    "KILOCODE_CONFIG",
    ()=>KILOCODE_CONFIG,
    "KIMI_CODING_CONFIG",
    ()=>KIMI_CODING_CONFIG,
    "KIRO_CONFIG",
    ()=>KIRO_CONFIG,
    "OAUTH_TIMEOUT",
    ()=>OAUTH_TIMEOUT,
    "OPENAI_CONFIG",
    ()=>OPENAI_CONFIG,
    "PROVIDERS",
    ()=>PROVIDERS,
    "QODER_CONFIG",
    ()=>QODER_CONFIG,
    "RAYCAST_CONFIG",
    ()=>RAYCAST_CONFIG,
    "TRAE_CONFIG",
    ()=>TRAE_CONFIG,
    "WINDSURF_CONFIG",
    ()=>WINDSURF_CONFIG,
    "XAI_OAUTH_CONFIG",
    ()=>XAI_OAUTH_CONFIG,
    "ZED_CONFIG",
    ()=>ZED_CONFIG,
    "ZED_HOSTED_CONFIG",
    ()=>ZED_HOSTED_CONFIG,
    "assertValidAwsRegion",
    ()=>assertValidAwsRegion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)");
;
;
;
;
;
const CLAUDE_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("claude_id", "CLAUDE_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://api.anthropic.com/v1/oauth/token",
    redirectUri: process.env.CLAUDE_CODE_REDIRECT_URI || "https://platform.claude.com/oauth/code/callback",
    scopes: [
        "org:create_api_key",
        "user:profile",
        "user:inference",
        "user:sessions:claude_code",
        "user:mcp_servers"
    ],
    codeChallengeMethod: "S256"
};
const CODEX_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("codex_id", "CODEX_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    // Additional OpenAI-specific params
    extraParams: {
        id_token_add_organizations: "true",
        codex_cli_simplified_flow: "true",
        originator: "codex_cli_rs",
        // prompt=login forces Auth0/OpenAI to RE-AUTHENTICATE the user instead of
        // silently reusing an existing browser session. This is THE KEY parameter
        // that enables multi-account OAuth on the same device + same client_id:
        // without it, OAuth flow #2 carries over session state from OAuth flow #1
        // and Auth0 invalidates the previous account's refresh_token family as a
        // "session takeover". With prompt=login, each OAuth flow creates an
        // isolated session that does not trample siblings.
        // Ported from ndycode/codex-multi-auth (auth.ts: forceNewLogin option) —
        // the only known tool that sustains multiple Codex OAuth accounts.
        prompt: "login"
    }
};
// Qoder OAuth Configuration (Authorization Code)
const QODER_OAUTH_AUTHORIZE_URL = process.env.QODER_OAUTH_AUTHORIZE_URL || "";
const QODER_OAUTH_TOKEN_URL = process.env.QODER_OAUTH_TOKEN_URL || "";
const QODER_OAUTH_USERINFO_URL = process.env.QODER_OAUTH_USERINFO_URL || "";
const QODER_OAUTH_CLIENT_ID = process.env.QODER_OAUTH_CLIENT_ID || "";
const QODER_OAUTH_CLIENT_SECRET = process.env.QODER_OAUTH_CLIENT_SECRET || "";
const QODER_OAUTH_ENABLED = !!QODER_OAUTH_AUTHORIZE_URL && !!QODER_OAUTH_TOKEN_URL && !!QODER_OAUTH_USERINFO_URL && !!QODER_OAUTH_CLIENT_ID && !!QODER_OAUTH_CLIENT_SECRET;
const QODER_CONFIG = {
    enabled: QODER_OAUTH_ENABLED,
    clientId: QODER_OAUTH_CLIENT_ID,
    clientSecret: QODER_OAUTH_CLIENT_SECRET,
    authorizeUrl: QODER_OAUTH_AUTHORIZE_URL,
    tokenUrl: QODER_OAUTH_TOKEN_URL,
    userInfoUrl: QODER_OAUTH_USERINFO_URL,
    extraParams: {
        loginMethod: "phone",
        type: "phone"
    }
};
const CODEBUDDY_CN_CONFIG = {
    baseUrl: "https://copilot.tencent.com",
    stateUrl: "https://copilot.tencent.com/v2/plugin/auth/state",
    tokenUrl: "https://copilot.tencent.com/v2/plugin/auth/token",
    refreshUrl: "https://copilot.tencent.com/v2/plugin/auth/token/refresh",
    userAgent: "CLI/2.63.2 CodeBuddy/2.63.2",
    platform: "CLI",
    pollInterval: 5000
};
const GROK_CLI_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    issuer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_ISSUER"],
    deviceCodeUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_DEVICE_CODE_URL"],
    tokenUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_TOKEN_URL"],
    scope: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_SCOPES"].join(" ")
};
const GROK_BUILD_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56122,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const XAI_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access api:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56121,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const KIMI_CODING_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("kimi_id", "KIMI_CODING_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://auth.kimi.com/api/oauth/device_authorization",
    tokenUrl: "https://auth.kimi.com/api/oauth/token"
};
const KILOCODE_CONFIG = {
    apiBaseUrl: "https://api.kilo.ai",
    initiateUrl: "https://api.kilo.ai/api/device-auth/codes",
    pollUrlBase: "https://api.kilo.ai/api/device-auth/codes"
};
const CLINE_CONFIG = {
    appBaseUrl: "https://app.cline.bot",
    apiBaseUrl: "https://api.cline.bot",
    authorizeUrl: "https://api.cline.bot/api/v1/auth/authorize",
    tokenExchangeUrl: "https://api.cline.bot/api/v1/auth/token",
    refreshUrl: "https://api.cline.bot/api/v1/auth/refresh"
};
const ANTIGRAVITY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    // No "openid" scope — the working 9router flow requests only the Cloud Code /
    // userinfo scopes below. "openid" (with PKCE) routed Google into the hanging
    // `firstparty/nativeapp` consent. Match 9router exactly (antigravity login fix).
    scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/cclog",
        "https://www.googleapis.com/auth/experimentsandconfigs"
    ],
    // Antigravity specific
    apiEndpoint: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"][0],
    apiVersion: "v1internal",
    loadCodeAssistEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:loadCodeAssist`),
    onboardUserEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:onboardUser`),
    fetchAvailableModelsEndpoints: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])(),
    loadCodeAssistEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:loadCodeAssist`,
    onboardUserEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:onboardUser`,
    fetchAvailableModelsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])()[0]
};
const AGY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    scopes: [
        ...ANTIGRAVITY_CONFIG.scopes
    ],
    // Reuse the antigravity Code Assist endpoints (identical backend).
    apiEndpoint: ANTIGRAVITY_CONFIG.apiEndpoint,
    apiVersion: ANTIGRAVITY_CONFIG.apiVersion,
    loadCodeAssistEndpoints: [
        ...ANTIGRAVITY_CONFIG.loadCodeAssistEndpoints
    ],
    onboardUserEndpoints: [
        ...ANTIGRAVITY_CONFIG.onboardUserEndpoints
    ],
    fetchAvailableModelsEndpoints: [
        ...ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoints
    ],
    loadCodeAssistEndpoint: ANTIGRAVITY_CONFIG.loadCodeAssistEndpoint,
    onboardUserEndpoint: ANTIGRAVITY_CONFIG.onboardUserEndpoint,
    fetchAvailableModelsEndpoint: ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoint
};
const OPENAI_CONFIG = {
    clientId: CODEX_CONFIG.clientId,
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    extraParams: {
        id_token_add_organizations: "true",
        originator: "openai_native",
        prompt: "login"
    }
};
const GITHUB_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://github.com/login/device/code",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "https://api.github.com/copilot_internal/v2/token",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GHE_COPILOT_CONFIG = {
    clientId: process.env.GHE_COPILOT_OAUTH_CLIENT_ID || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GITLAB_DUO_ENDPOINTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]);
const GITLAB_DUO_CONFIG = {
    baseUrl: GITLAB_DUO_ENDPOINTS.root,
    clientId: process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GITLAB_DUO_OAUTH_CLIENT_SECRET || process.env.GITLAB_OAUTH_CLIENT_SECRET || "",
    authorizeUrl: GITLAB_DUO_ENDPOINTS.authorizeUrl,
    tokenUrl: GITLAB_DUO_ENDPOINTS.tokenUrl,
    userInfoUrl: GITLAB_DUO_ENDPOINTS.userUrl,
    directAccessUrl: GITLAB_DUO_ENDPOINTS.directAccessUrl,
    scope: "ai_features read_user",
    codeChallengeMethod: "S256"
};
const AWS_REGION_PATTERN = /^[a-z]{2}-[a-z]+-\d{1,2}$/;
function assertValidAwsRegion(region) {
    if (typeof region !== "string" || !AWS_REGION_PATTERN.test(region)) {
        throw new Error("Invalid region");
    }
    return region;
}
const KIRO_CONFIG = {
    // AWS SSO OIDC endpoints for Builder ID/IDC (Device Code Flow)
    ssoOidcEndpoint: "https://oidc.us-east-1.amazonaws.com",
    registerClientUrl: "https://oidc.us-east-1.amazonaws.com/client/register",
    deviceAuthUrl: "https://oidc.us-east-1.amazonaws.com/device_authorization",
    tokenUrl: "https://oidc.us-east-1.amazonaws.com/token",
    // AWS Builder ID default start URL
    startUrl: "https://view.awsapps.com/start",
    // Client registration params
    clientName: "kiro-oauth-client",
    clientType: "public",
    scopes: [
        "codewhisperer:completions",
        "codewhisperer:analysis",
        "codewhisperer:conversations"
    ],
    grantTypes: [
        "urn:ietf:params:oauth:grant-type:device_code",
        "refresh_token"
    ],
    issuerUrl: "https://identitycenter.amazonaws.com/ssoins-722374e8c3c8e6c6",
    // Social auth endpoints (Google/GitHub via AWS Cognito)
    socialAuthEndpoint: "https://prod.us-east-1.auth.desktop.kiro.dev",
    socialLoginUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/login",
    socialTokenUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/token",
    socialRefreshUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken",
    // Social device-code flow (Google/GitHub).
    // `socialClientId` is a public CLI identifier — Kiro's device endpoint accepts
    // any non-empty string and behaves like a User-Agent rather than a secret.
    // The env override exists so operators on locked-down builds can pin a
    // custom value if AWS ever starts enforcing this field (Hard Rule #11 spirit).
    socialClientId: process.env.KIRO_OAUTH_CLIENT_ID || "kiro-cli",
    socialDeviceAuthorizeUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/authorization",
    socialDevicePollUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/poll",
    // Auth methods
    authMethods: [
        "builder-id",
        "idc",
        "google",
        "github",
        "import"
    ]
};
const CURSOR_CONFIG = {
    // API endpoints
    apiEndpoint: "https://api2.cursor.sh",
    chatEndpoint: "/aiserver.v1.ChatService/StreamUnifiedChatWithTools",
    modelsEndpoint: "/aiserver.v1.AiService/GetDefaultModelNudgeData",
    // Additional endpoints
    api3Endpoint: "https://api3.cursor.sh",
    agentEndpoint: "https://agent.api5.cursor.sh",
    agentNonPrivacyEndpoint: "https://agentn.api5.cursor.sh",
    // Client metadata
    clientVersion: "3.2.14",
    clientType: "ide",
    // Token storage locations (for user reference)
    tokenStoragePaths: {
        linux: "~/.config/Cursor/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Cursor/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Cursor\\User\\globalStorage\\state.vscdb"
    },
    // Database keys
    dbKeys: {
        accessToken: "[REDIGIDO-PRESERVACAO]",
        machineId: "storage.serviceMachineId"
    }
};
const TRAE_CONFIG = {
    apiEndpoint: "https://api.trae.ai",
    clientType: "ide",
    tokenStoragePaths: {
        linux: "~/.config/Trae/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Trae/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Trae\\User\\globalStorage\\state.vscdb"
    },
    // Chat completions path (mirrored from OpenAI-compatible providers)
    chatEndpoint: "/v1/chat/completions",
    // Trae website — users retrieve their token here after signing in
    webUrl: "https://trae.ai",
    // SOLO remote agent base — the executor's real upstream. Also set as the
    // provider registry baseUrl, which is the source of truth at request time.
    soloApiEndpoint: "https://core-normal.trae.ai/api/remote/v1",
    // SOLO model catalogue endpoint (relative to soloApiEndpoint).
    modelsEndpoint: "/models?functions=solo_agent_remote,solo_work_remote",
    // Authorization scheme: `Authorization: Cloud-IDE-JWT <token>` (RS256).
    authScheme: "Cloud-IDE-JWT",
    // Observed Cloud-IDE-JWT lifetime — drives default expiry hints.
    tokenLifetimeDays: 14,
    // Token storage note — solo.trae.ai exposes no public SQLite/keychain path,
    // so the token is captured via the /authorize flow or pasted manually.
    tokenNote: "Authorize via trae.ai in the popup, or sign in to solo.trae.ai and paste the Cloud-IDE-JWT from the Authorization header (~14-day lifetime)."
};
const RAYCAST_CONFIG = {
    apiEndpoint: "https://backend.raycast.com",
    chatEndpoint: "/api/v1/ai/chat_completions",
    modelsEndpoint: "/api/v1/ai/models",
    clientType: "macos-app",
    captureInstructions: "macOS only: use Auto-Import (Keychain + Raycast DB) or capture Bearer, X-Raycast-DeviceId, and optional X-Raycast-Signature JWT from backend.raycast.com traffic."
};
const WINDSURF_CONFIG = {
    // RETIRED 2026-05-29 — endpoint returns 404 post-rebrand. Phase 2 will replace.
    authorizeUrl: "https://app.devin.ai/editor/signin",
    // RETIRED 2026-05-29 — PKCE flow disabled, see header comment.
    codeChallengeMethod: "S256",
    // RETIRED 2026-05-29 — no callback server is started for windsurf/devin-cli.
    callbackPort: 0,
    // RETIRED 2026-05-29 — no callback path is registered for windsurf/devin-cli.
    callbackPath: "/auth/callback",
    // RETIRED 2026-05-29 — exchange endpoint no longer reached because PKCE is disabled.
    apiServerUrl: "https://server.codeium.com",
    // RETIRED 2026-05-29 — see apiServerUrl.
    exchangePath: "/exa.seat_management_pb.SeatManagementService/ExchangePKCEAuthorizationCode",
    // ── Active fields (still consumed by runtime) ─────────────────────────────
    // Inference server URL (gRPC-web requests go here)
    inferenceUrl: "https://server.self-serve.windsurf.com",
    // Primary login path: the user runs the "Windsurf: Provide Auth Token" command
    // inside the Windsurf/VS Code IDE (or clicks the Jupyter "Get Windsurf
    // Authentication Token" button), which opens this URL WITH an IDE-supplied
    // `?state=<xyz>` param and renders the token. Opening this bare URL directly
    // only shows a "Redirecting" page with no token (#3324).
    showAuthTokenUrl: "https://windsurf.com/show-auth-token",
    // Token refresh via Firebase Secure Token Service (reserved for Phase 2).
    // Default is the public Firebase Web client identifier embedded in the
    // Windsurf/Devin CLI binary; users may override via WINDSURF_FIREBASE_API_KEY.
    firebaseApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("windsurf_fb", "WINDSURF_FIREBASE_API_KEY"),
    firebaseTokenUrl: "https://securetoken.googleapis.com/v1/token",
    // IDE identity sent with every gRPC request
    ideName: "windsurf",
    ideVersion: "3.14.0",
    extensionVersion: "3.14.0"
};
const ZED_CONFIG = {
    importUrl: "/api/providers/zed/import",
    discoverUrl: "/api/providers/zed/discover",
    manualImportUrl: "/api/providers/zed/manual-import"
};
const ZED_HOSTED_CONFIG = {
    webBaseUrl: "https://zed.dev",
    cloudBaseUrl: "https://cloud.zed.dev",
    llmBaseUrl: "https://cloud.zed.dev",
    nativeSignInPath: "/native_app_signin",
    userInfoUrl: "https://cloud.zed.dev/client/users/me",
    llmTokenUrl: "https://cloud.zed.dev/client/llm_tokens",
    modelsUrl: "https://cloud.zed.dev/models",
    completionsUrl: "https://cloud.zed.dev/completions",
    defaultNativeAppPort: 58443
};
const OAUTH_TIMEOUT = 300000;
const PROVIDERS = {
    CLAUDE: "claude",
    CODEX: "codex",
    GEMINI: "gemini",
    QODER: "qoder",
    ANTIGRAVITY: "antigravity",
    AGY: "agy",
    KIMI_CODING: "kimi-coding",
    OPENAI: "openai",
    GITHUB: "github",
    GHE_COPILOT: "ghe-copilot",
    GITLAB_DUO: "gitlab-duo",
    KIRO: "kiro",
    AMAZON_Q: "amazon-q",
    CURSOR: "cursor",
    KILOCODE: "kilocode",
    CLINE: "cline",
    CLINEPASS: "clinepass",
    WINDSURF: "windsurf",
    DEVIN_CLI: "devin-cli",
    TRAE: "trae",
    CODEBUDDY_CN: "codebuddy-cn",
    GROK_CLI: "grok-cli",
    XAI_OAUTH: "xai-oauth",
    ZED: "zed",
    ZED_HOSTED: "zed-hosted"
};
}),
"[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)");
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
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
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
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
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
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
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
"[project]/src/lib/usage/accountIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveImportedUsageAccountIdentity",
    ()=>resolveImportedUsageAccountIdentity,
    "resolveOrphanedUsageAccountIdentity",
    ()=>resolveOrphanedUsageAccountIdentity,
    "resolveUsageAccountIdentity",
    ()=>resolveUsageAccountIdentity
]);
function identityString(value) {
    return typeof value === "string" && value ? value : null;
}
function displayString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function sanePriority(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 4 ? value : null;
}
function toProviderSpecificData(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function resolveUsageAccountIdentity(connection) {
    const provider = identityString(connection?.provider) || "unknown";
    const connectionId = identityString(connection?.id) || "unknown";
    const authType = identityString(connection?.authType ?? connection?.auth_type);
    const email = identityString(connection?.email);
    const providerSpecificData = toProviderSpecificData(connection?.providerSpecificData ?? connection?.provider_specific_data);
    const workspaceId = identityString(providerSpecificData.workspaceId);
    const chatgptUserId = identityString(providerSpecificData.chatgptUserId);
    const username = identityString(providerSpecificData.username);
    let identityParts;
    if (authType === "oauth" && provider === "codex" && workspaceId && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && workspaceId && email) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "email",
            email
        ];
    } else if (authType === "oauth" && provider !== "codex" && email) {
        identityParts = username ? [
            "oauth",
            provider,
            "email",
            email,
            "username",
            username
        ] : [
            "oauth",
            provider,
            "email",
            email
        ];
    } else {
        identityParts = [
            "connection",
            provider,
            connectionId
        ];
    }
    const displayName = displayString(connection?.displayName ?? connection?.display_name);
    const displayEmail = displayString(connection?.email);
    const name = displayString(connection?.name);
    const id = displayString(connection?.id);
    return {
        accountKey: JSON.stringify(identityParts),
        accountLabel: displayName || displayEmail || name || id || "unknown",
        accountLabelPriority: displayName ? 4 : displayEmail ? 3 : name ? 2 : id ? 1 : 0
    };
}
function resolveOrphanedUsageAccountIdentity(provider, connectionId) {
    return resolveUsageAccountIdentity({
        provider,
        id: connectionId
    });
}
function resolveImportedUsageAccountIdentity(row, fallback) {
    return {
        accountKey: identityString(row.account_key ?? row.accountKey) || fallback.accountKey,
        accountLabel: displayString(row.account_label ?? row.accountLabel) || fallback.accountLabel,
        accountLabelPriority: sanePriority(row.account_label_priority ?? row.accountLabelPriority) ?? fallback.accountLabelPriority
    };
}
}),
"[project]/src/lib/combos/invariants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboInvariantError",
    ()=>ComboInvariantError,
    "validateComboInvariant",
    ()=>validateComboInvariant
]);
class ComboInvariantError extends Error {
}
const FAMILY_PATTERNS = [
    [
        "gpt",
        /^gpt(?:-|$)/i
    ],
    [
        "claude",
        /^claude(?:-|$)/i
    ],
    [
        "gemini",
        /^gemini(?:-|$)/i
    ],
    [
        "glm",
        /^glm(?:-|$)/i
    ],
    [
        "kimi",
        /^kimi(?:-|$)/i
    ],
    [
        "llama",
        /^llama(?:-|$)/i
    ],
    [
        "minimax",
        /^minimax(?:-|$)/i
    ],
    [
        "mistral",
        /^(?:mistral|mixtral)(?:-|$)/i
    ]
];
function strings(value) {
    return Array.isArray(value) ? value.filter((item)=>typeof item === "string") : [];
}
function modelFamily(model) {
    const bare = model.slice(model.lastIndexOf("/") + 1);
    return FAMILY_PATTERNS.find(([, pattern])=>pattern.test(bare))?.[0] ?? null;
}
function validateComboInvariant(combo) {
    const invariant = combo.invariant && typeof combo.invariant === "object" && !Array.isArray(combo.invariant) ? combo.invariant : {};
    const providers = new Set([
        ...strings(combo.allowedProviders),
        ...strings(invariant.allowedProviders)
    ]);
    const families = new Set([
        ...strings(combo.allowedModelFamilies),
        ...strings(invariant.allowedModelFamilies)
    ]);
    if (providers.size === 0 && families.size === 0) return;
    const targets = Array.isArray(combo.models) ? combo.models : [];
    targets.forEach((value, index)=>{
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        const target = value;
        if (target.kind === "combo-ref") return;
        const model = typeof target.model === "string" ? target.model : "";
        const provider = typeof target.providerId === "string" ? target.providerId : typeof target.provider === "string" ? target.provider : model.includes("/") ? model.slice(0, model.indexOf("/")) : "";
        const family = modelFamily(model);
        if (providers.size > 0 && !providers.has(provider) || families.size > 0 && (!family || !families.has(family))) {
            const targetName = model.includes("/") ? model : `${provider}/${model}`;
            throw new ComboInvariantError(`Combo "${String(combo.name ?? "unnamed")}" target ${index + 1} (${targetName}) violates its invariant`);
        }
    });
}
}),
"[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNoLog",
    ()=>isNoLog,
    "setNoLog",
    ()=>setNoLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// #2650: extracted from compliance/index.ts to break the
// callLogs.ts → compliance/index.ts → callLogs.ts cycle that deadlocks
// the bundled MCP server under Node.js 24's stricter ESM evaluation.
function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    } catch  {
        return null;
    }
}
const noLogKeys = new Set();
const noLogDbCache = new Map();
let noLogColumnVerified = false;
let hasNoLogColumn = false;
const NO_LOG_CACHE_TTL_MS = 30_000;
const noLogIdsFromEnv = (process.env.NO_LOG_API_KEY_IDS || "").split(",").map((value)=>value.trim()).filter(Boolean);
for (const id of noLogIdsFromEnv){
    noLogKeys.add(id);
}
function setNoLog(apiKeyId, noLog) {
    if (noLog) {
        noLogKeys.add(apiKeyId);
    } else {
        noLogKeys.delete(apiKeyId);
    }
    noLogDbCache.set(apiKeyId, {
        value: noLog,
        timestamp: Date.now()
    });
}
function ensureNoLogColumn(db) {
    if (noLogColumnVerified) {
        return hasNoLogColumn;
    }
    try {
        const columns = db.prepare("PRAGMA table_info(api_keys)").all();
        hasNoLogColumn = columns.some((column)=>column.name === "no_log");
    } catch  {
        hasNoLogColumn = false;
    }
    noLogColumnVerified = true;
    return hasNoLogColumn;
}
function readNoLogFromDb(apiKeyId) {
    const db = getDb();
    if (!db || !apiKeyId) return false;
    if (!ensureNoLogColumn(db)) return false;
    const cached = noLogDbCache.get(apiKeyId);
    if (cached && Date.now() - cached.timestamp < NO_LOG_CACHE_TTL_MS) {
        return cached.value;
    }
    try {
        const row = db.prepare("SELECT no_log FROM api_keys WHERE id = ?").get(apiKeyId);
        const value = Boolean(row && Number(row.no_log) === 1);
        noLogDbCache.set(apiKeyId, {
            value,
            timestamp: Date.now()
        });
        return value;
    } catch  {
        return false;
    }
}
function isNoLog(apiKeyId) {
    if (!apiKeyId) return false;
    if (noLogKeys.has(apiKeyId)) return true;
    const persistedNoLog = readNoLogFromDb(apiKeyId);
    if (persistedNoLog) {
        noLogKeys.add(apiKeyId);
    }
    return persistedNoLog;
}
}),
"[project]/src/lib/pricingSync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSyncedPricing",
    ()=>clearSyncedPricing,
    "fetchLiteLLMPricing",
    ()=>fetchLiteLLMPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedPricing",
    ()=>getSyncedPricing,
    "initPricingSync",
    ()=>initPricingSync,
    "saveSyncedPricing",
    ()=>saveSyncedPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncPricingFromSources",
    ()=>syncPricingFromSources,
    "transformToOmniRoute",
    ()=>transformToOmniRoute
]);
/**
 * pricingSync.ts — External pricing sync engine.
 *
 * Fetches pricing data from external sources (LiteLLM) and stores it
 * in a separate namespace (`pricing_synced`) so user overrides are
 * never touched.
 *
 * Resolution order: user overrides > synced external > hardcoded defaults
 *
 * Opt-in via PRICING_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
;
;
;
// ─── Configuration ───────────────────────────────────────
const SUPPORTED_SOURCES = [
    "litellm"
];
const parsedInterval = parseInt(process.env.PRICING_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
const SYNC_SOURCES = (process.env.PRICING_SYNC_SOURCES || "litellm").split(",").map((s)=>s.trim()).filter((s)=>SUPPORTED_SOURCES.includes(s));
const LITELLM_PRICING_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
// ─── Provider mapping: LiteLLM provider → OmniRoute aliases ─────
const LITELLM_PROVIDER_MAP = {
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    vertex_ai: [
        "gemini"
    ],
    "vertex_ai-anthropic_models": [
        "anthropic"
    ],
    google: [
        "gemini"
    ],
    deepseek: [
        "if"
    ],
    groq: [
        "groq"
    ],
    together_ai: [
        "openrouter"
    ],
    bedrock: [
        "kiro"
    ],
    fireworks_ai: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    nvidia_nim: [
        "nvidia"
    ],
    siliconflow: [
        "siliconflow"
    ],
    "vertex_ai-language_models": [
        "gemini"
    ],
    "vertex_ai-mistral_models": [
        "mistral"
    ],
    gemini: [
        "gemini"
    ],
    bedrock_converse: [
        "kiro"
    ],
    cloudflare: [
        "cloudflare-ai"
    ],
    stability: [
        "stability-ai"
    ]
};
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
async function fetchLiteLLMPricing() {
    const response = await fetch(LITELLM_PRICING_URL, {
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`LiteLLM fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch  {
        throw new Error(`LiteLLM returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
function transformToOmniRoute(raw) {
    const result = {};
    for (const [modelKey, info] of Object.entries(raw)){
        const NON_TOKEN_FIELDS = [
            "input_cost_per_second",
            "output_cost_per_second",
            "input_cost_per_image",
            "output_cost_per_image",
            "input_cost_per_pixel",
            "output_cost_per_pixel",
            "input_cost_per_character",
            "output_cost_per_character",
            "input_cost_per_video_per_second",
            "output_cost_per_video_per_second",
            "search_unit_cost",
            "ocr_cost_per_page"
        ];
        const hasToken = info.input_cost_per_token != null || info.output_cost_per_token != null;
        const hasNonToken = NON_TOKEN_FIELDS.some((f)=>info[f] != null);
        if (!hasToken && !hasNonToken) continue;
        const inputCost = (info.input_cost_per_token || 0) * 1_000_000;
        const outputCost = (info.output_cost_per_token || 0) * 1_000_000;
        const entry = {
            input: Math.round(inputCost * 1000) / 1000,
            output: Math.round(outputCost * 1000) / 1000
        };
        if (info.mode) entry.mode = info.mode;
        if (info.cache_read_input_token_cost != null) {
            entry.cached = Math.round(info.cache_read_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        if (info.cache_creation_input_token_cost != null) {
            entry.cache_creation = Math.round(info.cache_creation_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        for (const f of NON_TOKEN_FIELDS){
            const v = info[f];
            if (typeof v === "number" && Number.isFinite(v)) entry[f] = v;
        }
        // Extract model name (strip provider prefix from key)
        // LiteLLM keys look like: "openai/gpt-4o", "anthropic/claude-3-opus"
        const slashIdx = modelKey.indexOf("/");
        const modelName = slashIdx >= 0 ? modelKey.slice(slashIdx + 1) : modelKey;
        // Map to OmniRoute providers
        const litellmProvider = info.litellm_provider || "";
        const omniRouteProviders = LITELLM_PROVIDER_MAP[litellmProvider];
        if (omniRouteProviders) {
            for (const provider of omniRouteProviders){
                if (!result[provider]) result[provider] = {};
                result[provider][modelName] = entry;
            }
        } else if (litellmProvider) {
            // Use litellm_provider as-is for unknown providers
            if (!result[litellmProvider]) result[litellmProvider] = {};
            result[litellmProvider][modelName] = entry;
        }
    }
    return result;
}
// ─── DB: Synced pricing namespace ────────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function getSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing_synced'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[PRICING_SYNC] Corrupted data for provider "${key}", skipping`);
        }
    }
    return synced;
}
function saveSyncedPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('pricing_synced', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
// ─── DB: Sync status namespace ───────────────────────────
//
// Persisted separately from `pricing_synced` because Next.js standalone
// builds load this module from independent webpack chunks (e.g. the
// instrumentation hook vs an API route handler) — each gets its OWN
// top-level module state. Module-level vars (`lastSyncTime`,
// `lastSyncModelCount`) are therefore invisible across those instances;
// persisting them to the DB lets any instance read the real status.
const SYNC_STATUS_NAMESPACE = "pricing_sync_status";
const SYNC_STATUS_KEY = "last_sync";
function readPersistedSyncStatus() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY);
    const record = toRecord(row);
    const rawValue = typeof record.value === "string" ? record.value : null;
    if (!rawValue) return null;
    try {
        const parsed = JSON.parse(rawValue);
        if (typeof parsed.lastSyncTime !== "string") return null;
        return {
            lastSyncTime: parsed.lastSyncTime,
            lastSyncModelCount: typeof parsed.lastSyncModelCount === "number" ? parsed.lastSyncModelCount : 0
        };
    } catch  {
        return null;
    }
}
function writePersistedSyncStatus(lastSync, modelCount) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT INTO key_value (namespace, key, value) VALUES (?, ?, ?) " + "ON CONFLICT(namespace, key) DO UPDATE SET value = excluded.value").run(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY, JSON.stringify({
        lastSyncTime: lastSync,
        lastSyncModelCount: modelCount
    }));
}
async function syncPricingFromSources(opts) {
    const requestedSources = opts?.sources || SYNC_SOURCES;
    const dryRun = opts?.dryRun ?? false;
    // Validate sources
    const validSources = requestedSources.filter((s)=>SUPPORTED_SOURCES.includes(s));
    const invalidSources = requestedSources.filter((s)=>!SUPPORTED_SOURCES.includes(s));
    if (validSources.length === 0) {
        const supported = SUPPORTED_SOURCES.join(", ");
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: `No valid sources provided. Supported: ${supported}. Invalid: ${invalidSources.join(", ")}`
        };
    }
    try {
        const aggregated = {};
        for (const source of validSources){
            if (source === "litellm") {
                const raw = await fetchLiteLLMPricing();
                const transformed = transformToOmniRoute(raw);
                for (const [provider, models] of Object.entries(transformed)){
                    if (!aggregated[provider]) aggregated[provider] = {};
                    Object.assign(aggregated[provider], models);
                }
            }
        }
        const modelCount = Object.values(aggregated).reduce((sum, models)=>sum + Object.keys(models).length, 0);
        const providerCount = Object.keys(aggregated).length;
        if (!dryRun) {
            saveSyncedPricing(aggregated);
            lastSyncTime = new Date().toISOString();
            lastSyncModelCount = modelCount;
            writePersistedSyncStatus(lastSyncTime, modelCount);
        }
        return {
            success: true,
            modelCount,
            providerCount,
            source: validSources.join(","),
            dryRun,
            ...invalidSources.length > 0 ? {
                warnings: [
                    `Unknown sources ignored: ${invalidSources.join(", ")}`
                ]
            } : {},
            ...dryRun ? {
                data: aggregated
            } : {}
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[PRICING_SYNC] Sync failed:", message);
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: message
        };
    }
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    console.log(`[PRICING_SYNC] Starting periodic sync every ${interval / 1000}s`);
    // Initial sync (non-blocking)
    syncPricingFromSources().then((result)=>{
        if (result.success) {
            console.log(`[PRICING_SYNC] Initial sync complete: ${result.modelCount} models from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[PRICING_SYNC] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        syncPricingFromSources().then((result)=>{
            if (result.success) {
                console.log(`[PRICING_SYNC] Periodic sync complete: ${result.modelCount} models`);
            }
        }).catch((err)=>{
            console.warn("[PRICING_SYNC] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[PRICING_SYNC] Periodic sync stopped");
    }
}
function getSyncStatus() {
    const enabled = process.env.PRICING_SYNC_ENABLED === "true";
    // `lastSyncTime`/`lastSyncModelCount` are only reliably populated on the
    // module instance that performed the sync (see note above
    // writePersistedSyncStatus) — fall back to the persisted DB record so
    // status reads from a different module instance still see it.
    const persisted = lastSyncTime === null ? readPersistedSyncStatus() : null;
    const effectiveLastSync = lastSyncTime ?? persisted?.lastSyncTime ?? null;
    const effectiveModelCount = lastSyncTime !== null ? lastSyncModelCount : persisted?.lastSyncModelCount ?? 0;
    return {
        enabled,
        lastSync: effectiveLastSync,
        lastSyncModelCount: effectiveModelCount,
        nextSync: enabled && effectiveLastSync ? new Date(new Date(effectiveLastSync).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs,
        sources: SYNC_SOURCES
    };
}
async function initPricingSync() {
    if (process.env.PRICING_SYNC_ENABLED !== "true") {
        console.log("[PRICING_SYNC] Disabled (set PRICING_SYNC_ENABLED=true to enable)");
        return;
    }
    startPeriodicSync();
}
}),
"[project]/src/lib/gamification/xp.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * XP/Level Engine for OmniRoute Gamification
 *
 * Pure functions for XP calculations, level progression, and reward definitions.
 * No side effects or DB calls — all stateful logic lives in the persistence layer.
 */ // ─── XP Curve ────────────────────────────────────────────────────────────────
/**
 * XP required for a specific level (delta, not cumulative).
 * Polynomial curve: `xp_for_level(n) = floor(100 * n^1.5)`
 *
 * @param level - Target level (must be >= 1)
 * @returns XP needed to gain this level (0 for level 1)
 *
 * @example
 * xpForLevel(1)  // 0
 * xpForLevel(10) // 3162
 * xpForLevel(50) // 35355
 */ __turbopack_context__.s([
    "XP_REWARDS",
    ()=>XP_REWARDS,
    "calculateLevel",
    ()=>calculateLevel,
    "cumulativeXpForLevel",
    ()=>cumulativeXpForLevel,
    "getLevelTier",
    ()=>getLevelTier,
    "getLevelTitle",
    ()=>getLevelTitle,
    "xpForLevel",
    ()=>xpForLevel,
    "xpToNextLevel",
    ()=>xpToNextLevel
]);
function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}
function cumulativeXpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for(let i = 2; i <= level; i++){
        total += xpForLevel(i);
    }
    return total;
}
function calculateLevel(totalXp) {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(Math.pow(totalXp * 2.5 / 100, 0.4)));
}
function xpToNextLevel(totalXp) {
    const currentLevel = calculateLevel(totalXp);
    const nextLevelXp = cumulativeXpForLevel(currentLevel + 1);
    return nextLevelXp - totalXp;
}
function getLevelTitle(level) {
    if (level >= 76) return "Legend";
    if (level >= 51) return "Master";
    if (level >= 26) return "Expert";
    if (level >= 11) return "Explorer";
    return "Beginner";
}
function getLevelTier(level) {
    if (level >= 76) return "diamond";
    if (level >= 51) return "platinum";
    if (level >= 26) return "gold";
    if (level >= 11) return "silver";
    return "bronze";
}
const XP_REWARDS = {
    /** Per API request routed through OmniRoute */ request: 1,
    /** Switching to a different provider */ provider_switch: 5,
    /** Switching to a different model */ model_switch: 3,
    /** Creating a new combo */ combo_create: 10,
    /** Using a combo for a request */ combo_use: 2,
    /** Per 1 000 tokens shared with another user */ token_share: 1,
    /** Redeeming an invite code */ invite_redeem: 50,
    /** Daily active usage (once per day) */ daily_login: 5,
    /** Per consecutive streak day (multiplied by streak length) */ streak_bonus: 2,
    /** Unlocking a badge */ badge_unlock: 10
};
}),
"[project]/src/lib/spend/batchWriter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SpendBatchWriter",
    ()=>SpendBatchWriter,
    "discardSpendBatchEntries",
    ()=>discardSpendBatchEntries,
    "flushSpendBatchWriter",
    ()=>flushSpendBatchWriter,
    "resetSpendBatchWriterForTests",
    ()=>resetSpendBatchWriterForTests,
    "spendBatchWriter",
    ()=>spendBatchWriter,
    "startSpendBatchWriter",
    ()=>startSpendBatchWriter,
    "stopSpendBatchWriter",
    ()=>stopSpendBatchWriter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [app-route] (ecmascript)");
;
const DEFAULT_FLUSH_INTERVAL_MS = 60_000;
const DEFAULT_MAX_BUFFER_SIZE = 1_000;
function getFlushIntervalMs() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_FLUSH_INTERVAL_MS || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FLUSH_INTERVAL_MS;
}
function getMaxBufferSize() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_MAX_BUFFER_SIZE || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BUFFER_SIZE;
}
function normalizeEntry(entry) {
    if (!entry?.apiKeyId || !Number.isFinite(entry.cost) || entry.cost <= 0) return null;
    return {
        apiKeyId: entry.apiKeyId,
        cost: entry.cost,
        timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now()
    };
}
class SpendBatchWriter {
    buffer = [];
    inFlightEntries = [];
    discardedApiKeyIds = new Set();
    timer = null;
    started = false;
    flushPromise = null;
    persistEntries;
    logger;
    flushIntervalMs;
    maxBufferSize;
    constructor(options = {}){
        this.persistEntries = options.persistEntries || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["batchSaveCostEntries"];
        this.logger = options.logger || console;
        this.flushIntervalMs = options.flushIntervalMs ?? getFlushIntervalMs();
        this.maxBufferSize = options.maxBufferSize ?? getMaxBufferSize();
    }
    start() {
        if (this.started) return;
        this.started = true;
        this.timer = setInterval(()=>{
            void this.flush();
        }, this.flushIntervalMs);
        this.timer.unref?.();
    }
    increment(apiKeyId, cost, timestamp = Date.now()) {
        const entry = normalizeEntry({
            apiKeyId,
            cost,
            timestamp
        });
        if (!entry) return;
        this.start();
        this.discardedApiKeyIds.delete(entry.apiKeyId);
        this.buffer.push(entry);
        if (this.buffer.length >= this.maxBufferSize) {
            void this.flush();
        }
    }
    getBufferedEntries(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        const matchesWindow = (entry)=>entry.apiKeyId === apiKeyId && entry.timestamp >= sinceTimestamp && entry.timestamp < untilTimestamp;
        return [
            ...this.inFlightEntries,
            ...this.buffer
        ].filter(matchesWindow);
    }
    getPendingCostTotal(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        return this.getBufferedEntries(apiKeyId, sinceTimestamp, untilTimestamp).reduce((sum, entry)=>sum + entry.cost, 0);
    }
    discardEntries(apiKeyId) {
        this.discardedApiKeyIds.add(apiKeyId);
        this.buffer = this.buffer.filter((entry)=>entry.apiKeyId !== apiKeyId);
        this.inFlightEntries = this.inFlightEntries.filter((entry)=>entry.apiKeyId !== apiKeyId);
    }
    async flush() {
        if (this.flushPromise) {
            return this.flushPromise;
        }
        if (this.buffer.length === 0) {
            return {
                flushedEntries: 0,
                uniqueKeys: 0,
                requeued: false
            };
        }
        const entriesToFlush = [
            ...this.buffer
        ];
        this.buffer = [];
        this.inFlightEntries = entriesToFlush;
        this.flushPromise = (async ()=>{
            const entriesToPersist = entriesToFlush.filter((entry)=>!this.discardedApiKeyIds.has(entry.apiKeyId));
            const uniqueKeys = new Set(entriesToPersist.map((entry)=>entry.apiKeyId)).size;
            try {
                if (entriesToPersist.length > 0) {
                    await this.persistEntries(entriesToPersist);
                }
                this.logger.log(`[SpendWriter] Flushed ${entriesToPersist.length} cost entr${entriesToPersist.length === 1 ? "y" : "ies"} across ${uniqueKeys} key(s)`);
                return {
                    flushedEntries: entriesToPersist.length,
                    uniqueKeys,
                    requeued: false
                };
            } catch (error) {
                this.buffer = [
                    ...entriesToPersist,
                    ...this.buffer
                ];
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`[SpendWriter] Flush error: ${message}`);
                return {
                    flushedEntries: 0,
                    uniqueKeys,
                    requeued: true
                };
            } finally{
                this.inFlightEntries = [];
                this.flushPromise = null;
            }
        })();
        return this.flushPromise;
    }
    async stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        return this.flush();
    }
    resetForTests() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        this.buffer = [];
        this.inFlightEntries = [];
        this.discardedApiKeyIds.clear();
        this.flushPromise = null;
    }
}
const spendBatchWriter = new SpendBatchWriter();
function startSpendBatchWriter() {
    spendBatchWriter.start();
}
async function flushSpendBatchWriter() {
    return spendBatchWriter.flush();
}
async function stopSpendBatchWriter() {
    return spendBatchWriter.stop();
}
function resetSpendBatchWriterForTests() {
    spendBatchWriter.resetForTests();
}
function discardSpendBatchEntries(apiKeyId) {
    spendBatchWriter.discardEntries(apiKeyId);
}
}),
"[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * localDb.js — Re-export layer for backward compatibility.
 *
 * All 27+ consumer files import from "@/lib/localDb".
 * This thin layer re-exports everything from the domain-specific DB modules,
 * so zero consumer changes are needed.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccrBlocks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCacheStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCombos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionContextBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionContextBudget.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionRunTelemetry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionRunTelemetry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$evals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/evals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricingSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricingSync.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$skills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/skills.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$registeredKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/registeredKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelComboMappings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelComboMappings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$files$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/files.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$batches$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/batches.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhooks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhookDeliveries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhookDeliveries.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$discoveryResults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/discoveryResults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$syncTokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/syncTokens.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/upstreamProxy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerLimits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/creditBalance.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionAnalytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$gamification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/gamification.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyGroups.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$relayProxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/relayProxies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$freeProxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/freeProxies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$playgroundPresets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/playgroundPresets.ts [app-route] (ecmascript)");
// Plan 21 — Memory Engine Redesign
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [app-route] (ecmascript)");
// T-A-F2: AgentBridge state/mappings/bypass + Inspector custom hosts/sessions
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeMappings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeMappings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeBypass.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorSessions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$omp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/omp.ts [app-route] (ecmascript)");
// Quota Sharing — Group B (planos 16+22)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
// Quota per-(key, model) caps — Group B Fase 3 #7
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaConsumption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$tokenLimits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/tokenLimits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyContextSources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyContextSources.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/localCorpus.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageSummary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageSummary.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelIntelligence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/callLogStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics.ts [app-route] (ecmascript) <locals>");
// ---------------------------------------------------------------------------
// usage_logs — auto-routing analytics (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageLogs.ts [app-route] (ecmascript)");
// ---------------------------------------------------------------------------
// semantic_cache — cache entries CRUD (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$semanticCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/semanticCache.ts [app-route] (ecmascript)");
// ---------------------------------------------------------------------------
// proxy_logs — export query (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxyLogs.ts [app-route] (ecmascript)");
// Provider param filters — denylist/allowlist config per provider/model (#6625)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [app-route] (ecmascript)"); // Per-model web-search/web-fetch interception rules (#3384)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [app-route] (ecmascript)"); // Claude Code discovery-alias gate (flag + per-provider/model overrides)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [app-route] (ecmascript)"); // Claude Code discovery-alias usage counters (alias requests + discovery hits)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/functionalGatewayMirrors.ts [app-route] (ecmascript)"); // Functional-gateway mirror gate (flag + per-provider/model overrides)
// Radar client — local feed cache + settings (opt-in, encrypted supporter key)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$radar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/radar.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/proxyHealth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setProxyHealthTcpCheckForTesting",
    ()=>__setProxyHealthTcpCheckForTesting,
    "getAllProxyHealthStatuses",
    ()=>getAllProxyHealthStatuses,
    "getCachedProxyHealth",
    ()=>getCachedProxyHealth,
    "invalidateProxyHealth",
    ()=>invalidateProxyHealth,
    "isProxyReachable",
    ()=>isProxyReachable
]);
/**
 * T14: Proxy Fast-Fail — TCP health check with in-memory cache.
 *
 * When a configured HTTP/SOCKS5 proxy is unreachable, every request
 * through OmniRoute used to wait for the full PROXY_TIMEOUT_MS (30s)
 * before failing. This module detects dead proxies in <2s via a quick
 * TCP connection check, caching the result to avoid overhead per request.
 *
 * Ref: sub2api PR #1167 (fix: proxy-fast-fail)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [app-route] (ecmascript)");
;
;
// Configurable via env vars
const FAST_FAIL_TIMEOUT_MS = parseInt(process.env.PROXY_FAST_FAIL_TIMEOUT_MS ?? "2000", 10);
const HEALTH_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_CACHE_TTL_MS ?? "30000", 10);
const UNHEALTHY_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_UNHEALTHY_CACHE_TTL_MS ?? "2000", 10);
// In-memory cache: proxyUrl → health entry
const proxyHealthCache = new Map();
const proxyHealthInflight = new Map();
let tcpCheckImpl = tcpCheck;
async function isProxyReachable(proxyUrl, timeoutMs = FAST_FAIL_TIMEOUT_MS, cacheTtlMs = HEALTH_CACHE_TTL_MS) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (cached && Date.now() - cached.checkedAt < cached.ttlMs) {
        return cached.healthy;
    }
    let url;
    try {
        url = new URL(proxyUrl);
    } catch  {
        // Malformed URL — treat as unreachable
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const host = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(url.hostname);
    const port = parseInt(url.port || defaultPortForScheme(url.protocol), 10);
    if (!host || isNaN(port)) {
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const existingProbe = proxyHealthInflight.get(proxyUrl);
    if (existingProbe) {
        return existingProbe;
    }
    const probe = tcpCheckImpl(host, port, timeoutMs).then((healthy)=>{
        proxyHealthCache.set(proxyUrl, {
            healthy,
            checkedAt: Date.now(),
            ttlMs: healthy ? cacheTtlMs : Math.min(cacheTtlMs, UNHEALTHY_CACHE_TTL_MS)
        });
        return healthy;
    });
    proxyHealthInflight.set(proxyUrl, probe);
    try {
        return await probe;
    } finally{
        if (proxyHealthInflight.get(proxyUrl) === probe) {
            proxyHealthInflight.delete(proxyUrl);
        }
    }
}
function getCachedProxyHealth(proxyUrl) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (!cached) return null;
    if (Date.now() - cached.checkedAt >= cached.ttlMs) return null; // stale
    return cached.healthy;
}
function invalidateProxyHealth(proxyUrl) {
    proxyHealthCache.delete(proxyUrl);
    proxyHealthInflight.delete(proxyUrl);
}
function getAllProxyHealthStatuses() {
    const now = Date.now();
    return [
        ...proxyHealthCache.entries()
    ].map(([proxyUrl, entry])=>({
            proxyUrl,
            healthy: entry.healthy,
            checkedAt: entry.checkedAt,
            stale: now - entry.checkedAt >= entry.ttlMs
        }));
}
// ─── Internals ────────────────────────────────────────────────────────────────
function defaultPortForScheme(protocol) {
    switch(protocol.replace(":", "").toLowerCase()){
        case "https":
            return "443";
        case "socks5":
        case "socks5h":
            return "1080";
        case "http":
        default:
            return "8080";
    }
}
function tcpCheck(host, port, timeoutMs) {
    return new Promise((resolve)=>{
        const socket = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["createConnection"])({
            host,
            port
        }, ()=>{
            socket.destroy();
            resolve(true);
        });
        socket.setTimeout(timeoutMs);
        socket.on("error", ()=>resolve(false));
        socket.on("timeout", ()=>{
            socket.destroy();
            resolve(false);
        });
    });
}
function __setProxyHealthTcpCheckForTesting(check) {
    tcpCheckImpl = check ?? tcpCheck;
}
}),
"[project]/src/lib/tokenHealthCheckCopilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGithubCopilotSubTokenIfNeeded",
    ()=>refreshGithubCopilotSubTokenIfNeeded
]);
// @ts-nocheck
/**
 * GitHub Copilot sub-token refresh helper for the proactive token health check.
 *
 * GitHub Copilot issues a short-lived (~30 min) API token separate from the
 * GitHub OAuth token. After a successful OAuth refresh, the health check must
 * also refresh this sub-token before it expires mid-session. The Copilot
 * token expiry is stored in providerSpecificData.copilotTokenExpiresAt (Unix
 * seconds). Extracted out of tokenHealthCheck.ts to keep that file under the
 * frozen file-size budget (see config/quality/file-size-baseline.json).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function refreshGithubCopilotSubTokenIfNeeded(params) {
    const { conn, result, proxyConfig, healthCheckLog, log, logWarn, logError, getConnectionLogLabel, logPrefix } = params;
    if (String(conn.provider || "").toLowerCase() !== "github") return;
    // Re-read the latest connection after the OAuth refresh (onPersist may have updated it).
    const latestConn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(conn.id).catch(()=>null) || conn;
    const accessTokenForCopilot = result.accessToken || latestConn.accessToken;
    if (!accessTokenForCopilot) return;
    const copilotExpiresAtRaw = latestConn.providerSpecificData?.copilotTokenExpiresAt ?? conn.providerSpecificData?.copilotTokenExpiresAt;
    const copilotExpiresAtMs = typeof copilotExpiresAtRaw === "number" && copilotExpiresAtRaw < 1e12 ? copilotExpiresAtRaw * 1000 // Unix seconds → ms
     : typeof copilotExpiresAtRaw === "string" ? new Date(copilotExpiresAtRaw).getTime() : typeof copilotExpiresAtRaw === "number" ? copilotExpiresAtRaw : 0;
    const copilotAboutToExpire = !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < 5 * 60 * 1000;
    if (!copilotAboutToExpire) return;
    log(`${logPrefix} Refreshing GitHub Copilot sub-token for ${getConnectionLogLabel(conn)}`);
    try {
        const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(accessTokenForCopilot, healthCheckLog, proxyConfig);
        if (copilotResult?.token) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                providerSpecificData: {
                    ...latestConn.providerSpecificData || {},
                    copilotToken: copilotResult.token,
                    copilotTokenExpiresAt: copilotResult.expiresAt
                }
            });
            log(`${logPrefix} ✓ GitHub Copilot sub-token refreshed for ${getConnectionLogLabel(conn)}`);
        } else {
            logWarn(`${logPrefix} ✗ GitHub Copilot sub-token refresh failed for ${getConnectionLogLabel(conn)}`);
        }
    } catch (copilotErr) {
        logError(`${logPrefix} Error refreshing Copilot sub-token:`, copilotErr?.message || copilotErr);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/tokenHealthCheck.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildRefreshFailureUpdate",
    ()=>buildRefreshFailureUpdate,
    "buildTransientRefreshRetryUpdate",
    ()=>buildTransientRefreshRetryUpdate,
    "checkConnection",
    ()=>checkConnection,
    "clearHealthCheckLogCache",
    ()=>clearHealthCheckLogCache,
    "clearRefreshCircuit",
    ()=>clearRefreshCircuit,
    "default",
    ()=>__TURBOPACK__default__export__,
    "extractResolvedProxyConfig",
    ()=>extractResolvedProxyConfig,
    "getRefreshBackoffUntil",
    ()=>getRefreshBackoffUntil,
    "initTokenHealthCheck",
    ()=>initTokenHealthCheck,
    "isInRefreshBackoff",
    ()=>isInRefreshBackoff,
    "shouldHideLogs",
    ()=>shouldHideLogs,
    "stopTokenHealthCheck",
    ()=>stopTokenHealthCheck,
    "sweep",
    ()=>sweep
]);
// @ts-nocheck
/**
 * Proactive Token Health Check Scheduler
 *
 * Background job that periodically refreshes OAuth tokens before they expire.
 * Each connection can configure its own `healthCheckInterval` (minutes).
 * Default: 60 minutes.  0 = disabled.
 *
 * The scheduler runs a lightweight sweep every TICK_MS (60 s).
 * For each eligible connection it calls the provider-specific refresh function,
 * updates the DB, and logs the result.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheckCopilot.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const LOG_PREFIX = "[HealthCheck]";
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
const TICK_MS = 60 * 1000; // sweep interval: every 60 seconds (restored — #7719 dropped the const but kept two call sites)
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_HEALTH_CHECK_INTERVAL_MIN = 60; // default per-connection interval
function isBuildProcess() {
    return typeof process !== "undefined" && process.env.NEXT_PHASE === "phase-production-build";
}
function getConnectionLogLabel(conn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickMaskedDisplayValue"])([
        conn.name,
        conn.email
    ], conn.id || "-");
}
function extractResolvedProxyConfig(resolvedProxy) {
    if (resolvedProxy && typeof resolvedProxy === "object" && !Array.isArray(resolvedProxy) && "proxy" in resolvedProxy) {
        return resolvedProxy.proxy ?? null;
    }
    return resolvedProxy ?? null;
}
function getEffectiveTokenExpiryIso(conn) {
    if (!conn || typeof conn !== "object") return null;
    return conn.tokenExpiresAt || conn.expiresAt || null;
}
function getEffectiveTokenExpiryMs(conn) {
    const effectiveExpiry = getEffectiveTokenExpiryIso(conn);
    if (!effectiveExpiry) return 0;
    const expiryMs = new Date(effectiveExpiry).getTime();
    return Number.isFinite(expiryMs) ? expiryMs : 0;
}
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
function getCopilotTokenExpiryMs(expiresAt) {
    if (typeof expiresAt === "number" && Number.isFinite(expiresAt)) {
        return expiresAt < 1e12 ? expiresAt * 1000 : expiresAt;
    }
    if (typeof expiresAt === "string" && expiresAt.trim()) {
        const parsed = new Date(expiresAt).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
// Providers whose OAuth flow yields only a GitHub-style access token (no
// refresh_token) plus a short-lived Copilot sub-token: github.com Copilot and
// GHE Copilot (device-code flow against the enterprise host) both fit this
// shape. Keep both in sync — adding a github-token-only provider elsewhere
// (e.g. new GHE-flavored Copilot variant) must also list it here.
const GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS = new Set([
    "github",
    "ghe-copilot"
]);
function isGitHubAccessTokenOnlyConnection(conn) {
    return GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS.has(String(conn?.provider || "").toLowerCase()) && typeof conn?.accessToken === "string" && conn.accessToken.trim().length > 0;
}
/**
 * Resolve the Copilot token endpoint base URL for a connection. github.com
 * Copilot always uses api.github.com; GHE Copilot uses its own per-enterprise
 * host stored in providerSpecificData.gheUrl at connect time.
 */ function getCopilotTokenBaseUrl(conn) {
    if (String(conn?.provider || "").toLowerCase() === "ghe-copilot") {
        const gheUrl = conn?.providerSpecificData?.gheUrl;
        if (typeof gheUrl === "string" && gheUrl.trim().length > 0) {
            return `${gheUrl.trim().replace(/\/+$/, "")}/api/v3`;
        }
    }
    return "https://api.github.com";
}
function canClearGitHubNoRefreshTokenState(conn) {
    return !conn?.testStatus || conn.testStatus === "active" || conn.testStatus === "expired" && conn.errorCode === "no_refresh_token";
}
// ── Refresh circuit breaker ───────────────────────────────────────────────
// A refresh that returns null (network blip, dead proxy, unclassified error)
// leaves the connection active, so the next 60s sweep retries immediately —
// the production refresh loop (claude/aa5dd5cf 1352×, kimi 270×). We track
// consecutive failures and back off exponentially so a stuck connection stops
// hammering the upstream (and stops flooding the logs) instead of looping.
const REFRESH_CIRCUIT_BASE_MIN = 5;
const REFRESH_CIRCUIT_MAX_MIN = 240; // cap at 4h
const TRANSIENT_REFRESH_RETRY_MIN = 2; // flat 2-minute retry for network/timeout errors
function getRefreshBackoffUntil(streak, now) {
    const steps = Math.max(0, streak - 1);
    const backoffMin = Math.min(REFRESH_CIRCUIT_BASE_MIN * 2 ** steps, REFRESH_CIRCUIT_MAX_MIN);
    return new Date(new Date(now).getTime() + backoffMin * 60 * 1000).toISOString();
}
function isInRefreshBackoff(conn, nowMs) {
    const until = conn?.providerSpecificData?.refreshCircuit?.until;
    if (typeof until !== "string") return false;
    const untilMs = new Date(until).getTime();
    return Number.isFinite(untilMs) && untilMs > nowMs;
}
function buildRefreshFailureUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Circuit breaker: increment the consecutive-failure streak and set an
    // exponential backoff window so the next sweep skips this connection instead
    // of retrying every 60s. Cleared by a successful refresh (clearRefreshCircuit).
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const prevStreak = psd.refreshCircuit?.streak ?? 0;
    const streak = prevStreak + 1;
    return {
        lastHealthCheckAt: now,
        // A failed background refresh should not evict otherwise healthy accounts
        // from request routing. Keep non-expired connections active and only persist
        // the refresh error metadata for observability.
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh failed",
        lastErrorAt: now,
        lastErrorType: "token_refresh_failed",
        lastErrorSource: "oauth",
        errorCode: "refresh_failed",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak,
                until: getRefreshBackoffUntil(streak, now),
                lastFailAt: now
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function buildTransientRefreshRetryUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Preserve existing streak from any prior permanent failures so a transient
    // error does not reset the exponential backoff ladder.
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const existingCircuit = psd.refreshCircuit;
    const existingStreak = existingCircuit?.streak ?? 0;
    const parsedExistingUntil = existingCircuit?.until ? new Date(existingCircuit.until).getTime() : 0;
    // Guard against NaN from malformed date strings - treat as no existing backoff.
    const existingUntil = Number.isFinite(parsedExistingUntil) ? parsedExistingUntil : 0;
    const transientUntil = new Date(now).getTime() + TRANSIENT_REFRESH_RETRY_MIN * 60 * 1000;
    // Use the longer of the two: preserve an existing permanent backoff
    // (e.g. 4h from exponential) or extend to the transient window.
    const useTransient = existingUntil <= transientUntil;
    const until = useTransient ? new Date(transientUntil).toISOString() : existingCircuit?.until ?? new Date(transientUntil).toISOString();
    return {
        lastHealthCheckAt: now,
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh transient error (network/timeout)",
        lastErrorAt: now,
        lastErrorType: "token_refresh_transient",
        lastErrorSource: "oauth",
        errorCode: "refresh_transient",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak: existingStreak,
                until,
                lastFailAt: now,
                // Always set the transient flag for observability. When the existing
                // backoff is longer (useTransient=false), the transient error occurred
                // but the permanent backoff was preserved - flag it as false so
                // observers can distinguish this from a pure transient retry.
                transient: useTransient
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function clearRefreshCircuit(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return undefined;
    if (!("refreshCircuit" in providerSpecificData)) return undefined;
    const next = {
        ...providerSpecificData
    };
    delete next.refreshCircuit;
    return next;
}
/**
 * Concurrent-check batch size for the sweep, read per-call (not at module
 * load) so tests — and operators — can override it via HEALTHCHECK_BATCH_SIZE
 * without restarting the process. #7719 hardcoded this to a module-level
 * `const BATCH_SIZE = 20`, silently dropping the configurability restored
 * here (#7875). Falls back to DEFAULT_BATCH_SIZE on a missing/invalid value.
 */ function getConfiguredBatchSize() {
    const configured = parseInt(process.env.HEALTHCHECK_BATCH_SIZE || "", 10);
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_BATCH_SIZE;
}
function isEnvFlagEnabled(name) {
    const value = process.env[name];
    if (!value) return false;
    return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}
function isHealthCheckDisabled() {
    return isEnvFlagEnabled("OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
/**
 * Providers excluded from the PROACTIVE sweep, comma-separated, case-insensitive
 * (e.g. "codex,openai"). Targeted alternative to OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK:
 * keeps rotating-token cascade providers (Codex/OpenAI share one Auth0 family) on the
 * reactive 401 path WITHOUT starving short-TTL providers (Kimi-coding) sweep-wide.
 */ function getHealthCheckSkipProviders() {
    const raw = process.env.OMNIROUTE_HEALTHCHECK_SKIP_PROVIDERS || "";
    return new Set(raw.split(",").map((s)=>s.trim().toLowerCase()).filter(Boolean));
}
// ── Logging helper ───────────────────────────────────────────────────────────
let cachedHideLogs = null;
let cacheTimestamp = 0;
let pendingHideLogs = null;
const CACHE_TTL = 30_000; // Cache settings for 30 seconds
async function shouldHideLogs() {
    if (isEnvFlagEnabled("OMNIROUTE_HIDE_HEALTHCHECK_LOGS") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) {
        return true;
    }
    const now = Date.now();
    // Return cached value if valid
    if (cachedHideLogs !== null && now - cacheTimestamp < CACHE_TTL) {
        return cachedHideLogs;
    }
    // Return pending promise if a query is already in progress (request coalescing)
    if (pendingHideLogs !== null) {
        return pendingHideLogs;
    }
    // Create new promise for DB query
    pendingHideLogs = (async ()=>{
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
            cachedHideLogs = settings.hideHealthCheckLogs === true;
            cacheTimestamp = now;
            return cachedHideLogs;
        } catch  {
            return false;
        } finally{
            pendingHideLogs = null;
        }
    })();
    return pendingHideLogs;
}
function log(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.log(message, ...args);
    });
}
function logWarn(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.warn(message, ...args);
    });
}
function logError(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.error(message, ...args);
    });
}
function clearHealthCheckLogCache() {
    cachedHideLogs = null;
    cacheTimestamp = 0;
}
function getHCState() {
    if (!globalThis.__omnirouteTokenHC) {
        globalThis.__omnirouteTokenHC = {
            initialized: false,
            interval: null,
            initTimeout: null,
            sweeping: false
        };
    }
    return globalThis.__omnirouteTokenHC;
}
function initTokenHealthCheck() {
    const state = getHCState();
    if (state.initialized || isHealthCheckDisabled()) return;
    state.initialized = true;
    log(`${LOG_PREFIX} Starting proactive token health-check (tick every ${TICK_MS / 1000}s)`);
    const timer = setTimeout(()=>{
        state.initTimeout = null;
        sweep();
        state.interval = setInterval(sweep, TICK_MS);
        if (state.interval && typeof state.interval === "object" && "unref" in state.interval) {
            state.interval.unref?.();
        }
    }, 10_000);
    state.initTimeout = timer;
    if (timer && typeof timer === "object" && "unref" in timer) {
        timer.unref?.();
    }
}
function stopTokenHealthCheck() {
    const state = getHCState();
    if (state.initTimeout) {
        clearTimeout(state.initTimeout);
        state.initTimeout = null;
    }
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }
    state.initialized = false;
}
async function sweep() {
    const state = getHCState();
    if (state.sweeping) {
        return log(`${LOG_PREFIX} Sweep skipped — previous sweep still in progress`);
    }
    state.sweeping = true;
    try {
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            authType: "oauth"
        });
        if (!connections || connections.length === 0) return;
        const staggerMs = parseInt(process.env.HEALTHCHECK_STAGGER_MS || "3000", 10);
        const total = connections.length;
        // Process connections in concurrent batches. Within a single batch
        // connections are checked concurrently (same-epoch start) so the array
        // is drained faster and the event loop can service requests between
        // batches. The inter-batch stagger preserves the original burst-
        // prevention intent (Issue #1220) while reducing total sweep time from
        // O(total × staggerMs) to O(total ÷ batchSize × staggerMs).
        const batchSize = Math.min(getConfiguredBatchSize(), total);
        for(let offset = 0; offset < total; offset += batchSize){
            const batchEnd = Math.min(offset + batchSize, total);
            const batch = [];
            for(let i = offset; i < batchEnd; i++){
                const conn = connections[i];
                batch.push(checkConnection(conn).catch((err)=>{
                    logError(`${LOG_PREFIX} Error checking ${conn.name || conn.id}:`, err.message);
                }));
            }
            await Promise.all(batch);
            // Stagger between batches (not between individual connections) to
            // prevent sustained bursting while reducing total sweep duration.
            if (batchEnd < total) {
                if (staggerMs > 0) {
                    const jitterMin = parseInt(process.env.HEALTHCHECK_JITTER_MIN_MS || "500", 10);
                    const jitterMax = parseInt(process.env.HEALTHCHECK_JITTER_MAX_MS || "5000", 10);
                    const jitter = jitterMin + Math.random() * Math.max(0, jitterMax - jitterMin);
                    await new Promise((resolve)=>setTimeout(resolve, staggerMs + jitter));
                }
                // Yield a microtask so the event loop can service pending I/O
                // (DB contention, network responses) before the next batch starts.
                await new Promise((resolve)=>setTimeout(resolve, 0));
            }
        }
    } catch (err) {
        logError(`${LOG_PREFIX} Sweep error:`, err.message);
    } finally{
        state.sweeping = false;
    }
}
async function checkConnection(conn) {
    if (!conn?.id) return;
    const latestConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id) || conn;
    conn = latestConnection;
    // Per-provider opt-out of proactive refresh (e.g. Codex/OpenAI cascade
    // providers) — their token stays on the reactive, serialized 401 path while
    // other providers keep being refreshed proactively.
    if (getHealthCheckSkipProviders().has(String(conn.provider || "").toLowerCase())) {
        return;
    }
    // Determine interval (0 = disabled)
    const intervalMin = conn.healthCheckInterval ?? DEFAULT_HEALTH_CHECK_INTERVAL_MIN;
    if (intervalMin <= 0) return;
    if (!conn.isActive) return;
    // #8182: skip terminal connections (credits_exhausted / banned / expired).
    // These can never self-heal via a token refresh — probing them wastes
    // CPU and network on every sweep cycle. Mirrors isTerminalConnectionStatus
    // in src/sse/services/auth.ts and TERMINAL_CONNECTION_STATUSES in
    // src/lib/quota/connectionRecovery.ts.
    //
    // #5326 exception: a GitHub Copilot access-token-only connection parked in
    // "expired" with errorCode "no_refresh_token" is NOT actually terminal — it's
    // the exact target of the self-heal below (canClearGitHubNoRefreshTokenState),
    // which clears that stale status back to "active" once the Copilot sub-token
    // proves usable. Treating it as terminal here made that self-heal unreachable,
    // leaving healthy Copilot connections stuck at "expired" forever.
    const isRecoverableGithubCopilotNoRefresh = conn.testStatus === "expired" && conn.errorCode === "no_refresh_token" && isGitHubAccessTokenOnlyConnection(conn);
    const terminalStatuses = new Set([
        "credits_exhausted",
        "banned",
        "expired"
    ]);
    if (typeof conn.testStatus === "string" && terminalStatuses.has(conn.testStatus.toLowerCase()) && !isRecoverableGithubCopilotNoRefresh) {
        return;
    }
    // Deprecated upstream (see DEPRECATED_PROVIDERS in tokenRefresh): the provider is not
    // routable, so refreshing kept a credential alive that could never answer a request.
    // Surface that as a terminal state naming the migration, instead of the silent
    // `Skipping … (refresh unsupported)` that dropping it from supportsTokenRefresh alone
    // would produce — which would leave the row at "active" forever, doing nothing.
    //
    // Placed AFTER the terminal-status guard above, which makes this idempotent for free:
    // once marked "expired" the connection is skipped on every later sweep, so this writes
    // exactly once instead of rewriting the same reason each cycle.
    const deprecation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDeprecationNotice"])(String(conn.provider || ""));
    if (deprecation) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            testStatus: "expired",
            lastHealthCheckAt: now,
            lastError: deprecation.reason,
            lastErrorAt: now,
            lastErrorType: "provider_deprecated",
            lastErrorSource: "oauth",
            errorCode: "provider_deprecated"
        });
        log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} is a deprecated provider; marking expired (migrate to ${deprecation.migrateTo})`);
        return;
    }
    if (!conn.refreshToken || typeof conn.refreshToken !== "string") {
        if (isGitHubAccessTokenOnlyConnection(conn)) {
            const now = new Date().toISOString();
            const providerSpecificData = conn.providerSpecificData || {};
            const hasCopilotToken = typeof providerSpecificData.copilotToken === "string" && providerSpecificData.copilotToken.trim().length > 0;
            const copilotExpiresAtMs = getCopilotTokenExpiryMs(providerSpecificData.copilotTokenExpiresAt);
            const copilotAboutToExpire = !hasCopilotToken || !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < TOKEN_EXPIRY_BUFFER;
            let refreshedProviderSpecificData = null;
            if (copilotAboutToExpire) {
                const hideLogs = await shouldHideLogs();
                const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
                const proxyConfig = extractResolvedProxyConfig(proxyResolution);
                const healthCheckLog = {
                    info: (tag, msg)=>{
                        if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    warn: (tag, msg)=>{
                        if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    error: (tag, msg, extra)=>{
                        if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
                    }
                };
                const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(conn.accessToken, healthCheckLog, proxyConfig, getCopilotTokenBaseUrl(conn));
                if (copilotResult?.token) {
                    refreshedProviderSpecificData = {
                        ...providerSpecificData,
                        copilotToken: copilotResult.token,
                        copilotTokenExpiresAt: copilotResult.expiresAt
                    };
                }
            }
            if (canClearGitHubNoRefreshTokenState(conn)) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    testStatus: "active",
                    lastError: copilotAboutToExpire && !refreshedProviderSpecificData ? "Health check: Copilot token refresh failed" : null,
                    lastErrorAt: copilotAboutToExpire && !refreshedProviderSpecificData ? now : null,
                    lastErrorType: copilotAboutToExpire && !refreshedProviderSpecificData ? "token_refresh_failed" : null,
                    lastErrorSource: copilotAboutToExpire && !refreshedProviderSpecificData ? "oauth" : null,
                    errorCode: copilotAboutToExpire && !refreshedProviderSpecificData ? "refresh_failed" : null,
                    expiredRetryCount: null,
                    expiredRetryAt: null,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            }
            // Steady-state ticks stay silent: this path runs once per TICK_MS (60s) for
            // EVERY github/ghe-copilot connection, so an unconditional line here emits
            // ~1440 entries/day per connection all saying the same nothing-changed thing.
            // Only report when the sweep actually did work — a Copilot sub-token refresh
            // attempt — so a genuine refresh failure still surfaces in the log.
            if (copilotAboutToExpire) {
                log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} Copilot token ${refreshedProviderSpecificData ? "refreshed" : "refresh FAILED"} (no refresh token; connection stays active)`);
            }
            return;
        }
        // #5326: a refresh-CAPABLE provider (e.g. antigravity/gemini) with no usable
        // refresh token can never self-heal via the sweep — it genuinely needs re-auth.
        // Silently skipping here left the row at testStatus="active" while the dashboard
        // badge (which derives expiry from tokenExpiresAt||expiresAt) showed a confusing
        // cosmetic "Token Expired". Surface reality as a terminal "expired" status instead.
        // Guard tightly so we do NOT clobber:
        //   - providers without refresh tokens (supportsTokenRefresh=false; #8407 devin-cli)
        //   - connections already in a terminal/specific state (expired/banned/credits_exhausted)
        //   - transient cooldown state (unavailable) owned by the request path
        const refreshCapableNeedsReauth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider) && (!conn.testStatus || conn.testStatus === "active") && !(conn.apiKey && conn.apiKey.length > 0); // API-key-only connections don't need refresh tokens
        if (refreshCapableNeedsReauth) {
            const now = new Date().toISOString();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                testStatus: "expired",
                lastHealthCheckAt: now,
                lastError: "No refresh token available — re-authenticate this account.",
                lastErrorAt: now,
                lastErrorType: "no_refresh_token",
                lastErrorSource: "oauth",
                errorCode: "no_refresh_token"
            });
            log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} has no refresh token; marking expired (needs re-auth)`);
        }
        return;
    }
    // Retry expired connections with exponential backoff up to EXPIRED_RETRY_MAX times.
    if (conn.testStatus === "expired") {
        const retryCount = conn.expiredRetryCount ?? 0;
        if (retryCount >= EXPIRED_RETRY_MAX) return;
        const lastRetry = conn.expiredRetryAt ? new Date(conn.expiredRetryAt).getTime() : 0;
        const backoffMs = EXPIRED_RETRY_BACKOFF_MIN * 60 * 1000 * Math.pow(2, retryCount);
        if (Date.now() - lastRetry < backoffMs) return;
        log(`${LOG_PREFIX} Retrying expired ${conn.provider}/${getConnectionLogLabel(conn)} (attempt ${retryCount + 1}/${EXPIRED_RETRY_MAX})`);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider)) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now
        });
        log(`${LOG_PREFIX} Skipping ${conn.provider}/${getConnectionLogLabel(conn)} (refresh unsupported)`);
        return;
    }
    const intervalMs = intervalMin * 60 * 1000;
    const lastCheck = conn.lastHealthCheckAt ? new Date(conn.lastHealthCheckAt).getTime() : 0;
    // Prefer expiry-driven refresh when the provider returns a concrete expiry timestamp.
    // Rotating-token providers such as Codex should not be refreshed on a fixed hourly
    // cadence while the access token is still valid for days.
    const tokenExpiresAt = getEffectiveTokenExpiryMs(conn);
    const hasKnownExpiry = tokenExpiresAt > 0;
    const isAboutToExpire = hasKnownExpiry && tokenExpiresAt - Date.now() < TOKEN_EXPIRY_BUFFER;
    // ROTATING_REFRESH_PROVIDERS — providers whose refresh_tokens are SINGLE-USE
    // (each refresh consumes the old one and returns a new one). For these, refreshing
    // on a fixed interval — instead of strictly on imminent expiry — burns rotations
    // unnecessarily AND can trigger Auth0's token family revocation (especially OpenAI
    // Codex). 9router did not have this background sweep; it was introduced in OmniRoute
    // and is the root cause of "adding account B invalidates account A" reports.
    // The interval path is kept ONLY for non-rotating providers where token state can
    // drift silently (e.g. cookie-based, opaque sessions without expires_at).
    const ROTATING_REFRESH_PROVIDERS = new Set([
        "codex",
        "openai",
        "kimi-coding",
        "cline",
        "kiro",
        "amazon-q",
        "gitlab-duo",
        "claude"
    ]);
    const isRotatingProvider = ROTATING_REFRESH_PROVIDERS.has(String(conn.provider || "").toLowerCase());
    const shouldRefreshByInterval = !hasKnownExpiry && !isRotatingProvider && Date.now() - lastCheck >= intervalMs;
    if (!isAboutToExpire && !shouldRefreshByInterval) return;
    // Circuit breaker: if recent refreshes for this connection failed, wait out
    // the exponential backoff window instead of retrying every 60s tick. This is
    // what stops the refresh loop when getAccessToken keeps returning null
    // (dead proxy / network blip / unclassified upstream error).
    if (isInRefreshBackoff(conn, Date.now())) {
        return;
    }
    const reason = isAboutToExpire ? "token expiring soon" : `interval: ${intervalMin}min`;
    log(`${LOG_PREFIX} Refreshing ${conn.provider}/${getConnectionLogLabel(conn)} (${reason})`);
    const attemptedRefreshToken = conn.refreshToken;
    const attemptedAccessToken = conn.accessToken || null;
    const credentials = {
        connectionId: conn.id,
        refreshToken: attemptedRefreshToken,
        accessToken: attemptedAccessToken,
        expiresAt: getEffectiveTokenExpiryIso(conn),
        providerSpecificData: conn.providerSpecificData
    };
    const hideLogs = await shouldHideLogs();
    const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
    const proxyConfig = extractResolvedProxyConfig(proxyResolution);
    const healthCheckLog = {
        info: (tag, msg)=>{
            if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
        },
        warn: (tag, msg)=>{
            if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
        },
        error: (tag, msg, extra)=>{
            if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
        }
    };
    let persistedResult = null;
    let result;
    try {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])(conn.provider, credentials, healthCheckLog, proxyConfig, async (refreshResult)=>{
            const now = new Date().toISOString();
            const updateData = {
                accessToken: refreshResult.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (refreshResult.refreshToken) {
                updateData.refreshToken = refreshResult.refreshToken;
            }
            if (refreshResult.expiresAt) {
                updateData.expiresAt = refreshResult.expiresAt;
                updateData.tokenExpiresAt = refreshResult.expiresAt;
            } else if (refreshResult.expiresIn) {
                const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            // Merge new providerSpecificData and ALWAYS clear the refresh circuit
            // breaker streak on a successful refresh.
            const mergedProviderData = {
                ...conn.providerSpecificData || {},
                ...refreshResult.providerSpecificData || {}
            };
            const clearedProviderData = clearRefreshCircuit(mergedProviderData);
            if (clearedProviderData !== undefined) {
                updateData.providerSpecificData = clearedProviderData;
            } else if (refreshResult.providerSpecificData) {
                updateData.providerSpecificData = mergedProviderData;
            }
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                // DB write failed after successful refresh - log but do not throw.
                // The outer catch would misclassify this as a network error.
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after successful refresh` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); token not persisted`);
                return;
            }
            // Mark as persisted AFTER the DB write succeeds.
            persistedResult = refreshResult;
        });
    } catch (err) {
        // If onPersist already wrote a successful result, do not overwrite it.
        if (persistedResult) {
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error after successful persist` + ` (${err instanceof Error ? err.message : String(err)}); ignoring`);
            return;
        }
        // Classify: only network/timeout errors are transient. Programming errors
        // and DB failures fall through to the exponential backoff path.
        const errObj = typeof err === "object" && err !== null ? err : {};
        const errName = err instanceof Error ? err.name : String(errObj.name ?? "");
        const errMsg = err instanceof Error ? err.message : String(err);
        const errCode = String(errObj.code ?? "");
        // Also check err.cause for wrapped fetch errors.
        const errCause = errObj.cause instanceof Error ? errObj.cause.message : "";
        const errCauseCode = String(errObj.cause?.code ?? "");
        const combinedMsg = `${errMsg} ${errCause}`;
        const combinedCode = `${errCode} ${errCauseCode}`;
        const isTransientNetworkError = errName === "AbortError" || errName === "TimeoutError" || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION|socket hang up|fetch failed/i.test(combinedMsg) || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION/i.test(combinedCode);
        if (isTransientNetworkError) {
            const transientNow = new Date().toISOString();
            const updateData = buildTransientRefreshRetryUpdate(conn, transientNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after transient error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh transient error` + ` (${err instanceof Error ? err.message : String(err)}); retry in ${TRANSIENT_REFRESH_RETRY_MIN}min`);
        } else {
            // Non-transient error: apply standard exponential backoff.
            const failNow = new Date().toISOString();
            const updateData = buildRefreshFailureUpdate(conn, failNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after permanent error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error` + ` (${err instanceof Error ? err.message : String(err)}); applying exponential backoff`);
        }
        return;
    }
    const now = new Date().toISOString();
    // ─── Handle unrecoverable errors (e.g. refresh_token_reused) ───────────
    // OpenAI Codex uses rotating one-time-use refresh tokens.
    // Once used, the old token is permanently invalidated.
    // Retrying will never succeed → deactivate and stop the loop.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(result)) {
        const currentConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id);
        const credentialsChangedSinceSweep = !!currentConnection && (currentConnection.refreshToken !== attemptedRefreshToken || (currentConnection.accessToken || null) !== attemptedAccessToken);
        if (credentialsChangedSinceSweep) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} changed during refresh; skipping stale deactivation`);
            return;
        }
        const accessTokenStillValid = getEffectiveTokenExpiryMs(currentConnection || conn) > Date.now() + TOKEN_EXPIRY_BUFFER;
        if (accessTokenStillValid) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: `Health check refresh failed (${result.error}). Re-authenticate before the current access token expires.`,
                lastErrorAt: now,
                lastErrorType: result.error,
                lastErrorSource: "oauth",
                errorCode: result.error
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} refresh token is invalid (${result.error}), but the current access token is still valid; keeping connection active`);
            return;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now,
            testStatus: "expired",
            lastError: isRotatingProvider ? `Refresh token consumed (${result.error}). Please re-authenticate this account.` : `Refresh token rejected (${result.error}). Please re-authenticate this account.`,
            lastErrorAt: now,
            lastErrorType: result.error,
            lastErrorSource: "oauth",
            errorCode: result.error,
            isActive: false,
            // Only rotating-token providers (Codex/OpenAI/etc.) have single-use refresh
            // tokens that are genuinely consumed and worthless after a failed refresh, so
            // clearing them is safe. For non-rotating providers (Google: antigravity /
            // gemini) the stored refresh_token is the user's only recovery
            // artifact — nulling it caused #3679 (the connection reports "No valid refresh
            // token available" and can never recover even after re-activation). Preserve it.
            ...isRotatingProvider ? {
                refreshToken: null
            } : {}
        });
        logError(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} — ` + `Refresh token is permanently invalid (${result.error}). ` + `Connection deactivated. Re-authenticate to restore.`);
        return;
    }
    if (result && result.accessToken) {
        // onPersist already wrote the core token fields atomically inside the mutex.
        // Only write the lastHealthCheckAt timestamp (and any fields onPersist may have
        // missed) here, to avoid a redundant full update that would race against another
        // concurrent refresh that already wrote fresh credentials.
        if (persistedResult) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
        } else {
            // No onPersist (e.g. no connectionId — token-hash dedup path). Write all fields.
            const updateData = {
                accessToken: result.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (result.refreshToken) {
                updateData.refreshToken = result.refreshToken;
            }
            if (result.expiresAt) {
                updateData.expiresAt = result.expiresAt;
                updateData.tokenExpiresAt = result.expiresAt;
            } else if (result.expiresIn) {
                const expiresAt = new Date(Date.now() + result.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            if (result.providerSpecificData) {
                updateData.providerSpecificData = {
                    ...conn.providerSpecificData || {},
                    ...result.providerSpecificData
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        }
        log(`${LOG_PREFIX} ✓ ${conn.provider}/${getConnectionLogLabel(conn)} refreshed`);
        // ── GitHub Copilot sub-token refresh ──────────────────────────────────────
        // Extracted to tokenHealthCheckCopilot.ts to keep this file under the
        // frozen file-size budget. See that file's header comment for context.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGithubCopilotSubTokenIfNeeded"])({
            conn,
            result,
            proxyConfig,
            healthCheckLog,
            log,
            logWarn,
            logError,
            getConnectionLogLabel,
            logPrefix: LOG_PREFIX
        });
    } else {
        const updateData = buildRefreshFailureUpdate(conn, now);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        logWarn(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} refresh failed` + (conn.testStatus === "expired" ? ` (${updateData.expiredRetryCount}/${EXPIRED_RETRY_MAX} expired retries used)` : ""));
    }
}
// Auto-start when imported
initTokenHealthCheck();
const __TURBOPACK__default__export__ = initTokenHealthCheck;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "normalizeComboCooldownWaitSettings",
    ()=>normalizeComboCooldownWaitSettings,
    "normalizeConnectionCooldownProfile",
    ()=>normalizeConnectionCooldownProfile,
    "normalizeLegacyConnectionCooldownProfile",
    ()=>normalizeLegacyConnectionCooldownProfile,
    "normalizeProviderBreakerProfile",
    ()=>normalizeProviderBreakerProfile,
    "normalizeProviderCooldownSettings",
    ()=>normalizeProviderCooldownSettings,
    "normalizeProviderQuotaOverrides",
    ()=>normalizeProviderQuotaOverrides,
    "normalizeProviderWindowDefaults",
    ()=>normalizeProviderWindowDefaults,
    "normalizeQuotaPreflightSettings",
    ()=>normalizeQuotaPreflightSettings,
    "normalizeQuotaShareConcurrencyLimitSettings",
    ()=>normalizeQuotaShareConcurrencyLimitSettings,
    "normalizeRequestQueueSettings",
    ()=>normalizeRequestQueueSettings,
    "normalizeStreamRecoverySettings",
    ()=>normalizeStreamRecoverySettings,
    "normalizeWaitForCooldownSettings",
    ()=>normalizeWaitForCooldownSettings,
    "parseFeatureFlagBoolean",
    ()=>parseFeatureFlagBoolean,
    "resolveBooleanFeatureFlag",
    ()=>resolveBooleanFeatureFlag,
    "resolveStreamRecoveryDefaults",
    ()=>resolveStreamRecoveryDefaults,
    "toBoolean",
    ()=>toBoolean,
    "toInteger",
    ()=>toInteger
]);
/**
 * resilience/settings/normalize — coercion + per-section normalizers (pure).
 *
 * Extracted verbatim from resilience/settings.ts. Pure functions: no DB, no
 * module state. Depends only on the feature-flag resolver and the settings
 * types. The host imports these for its resolve/merge/legacy orchestration.
 *
 * @module lib/resilience/settings/normalize
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
}
function toBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function parseFeatureFlagBoolean(value, fallback) {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
    }
    return fallback;
}
function resolveBooleanFeatureFlag(key, fallback) {
    try {
        return parseFeatureFlagBoolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(key), fallback);
    } catch (error) {
        const envValue = process.env[key];
        if (typeof envValue === "string" && envValue.trim() !== "") {
            return parseFeatureFlagBoolean(envValue, fallback);
        }
        console.error(`[resilience] Failed to resolve ${key}, falling back to ${String(fallback)}:`, error instanceof Error ? error.message : error);
        return fallback;
    }
}
function resolveStreamRecoveryDefaults() {
    return {
        enabled: resolveBooleanFeatureFlag("STREAM_RECOVERY_ENABLED", false),
        continueMidStream: resolveBooleanFeatureFlag("STREAM_RECOVERY_MIDSTREAM_ENABLED", false)
    };
}
function normalizeRequestQueueSettings(next, fallback) {
    const record = asRecord(next);
    const requestsPerMinute = toInteger(record.requestsPerMinute, fallback.requestsPerMinute, {
        min: 1,
        max: 1_000_000
    });
    const minTimeBetweenRequestsMs = toInteger(record.minTimeBetweenRequestsMs, fallback.minTimeBetweenRequestsMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const concurrentRequests = toInteger(record.concurrentRequests, fallback.concurrentRequests, {
        min: 1,
        max: 10_000
    });
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 1,
        max: 24 * 60 * 60 * 1000
    });
    const maxQueueDepth = toInteger(record.maxQueueDepth, fallback.maxQueueDepth, {
        min: 0,
        max: 100_000
    });
    return {
        autoEnableApiKeyProviders: toBoolean(record.autoEnableApiKeyProviders, fallback.autoEnableApiKeyProviders),
        requestsPerMinute,
        minTimeBetweenRequestsMs,
        concurrentRequests,
        maxWaitMs,
        maxQueueDepth
    };
}
function normalizeConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    // useUpstream429BreakerHints uses a 3-state input contract:
    //   - boolean  → user override, store as-is
    //   - null     → explicit unset sentinel, drop key so the per-provider
    //                default in `providerHints.ts` resolves at runtime
    //   - omitted  → leave existing fallback value unchanged (partial-merge)
    // Never coerce via `toBoolean(value, fallback)` because that would
    // collapse the unset state.
    const hasHintsKey = Object.prototype.hasOwnProperty.call(record, "useUpstream429BreakerHints");
    const rawHints = record.useUpstream429BreakerHints;
    let useUpstream429BreakerHints;
    if (!hasHintsKey) {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    } else if (rawHints === null) {
        useUpstream429BreakerHints = undefined;
    } else if (typeof rawHints === "boolean") {
        useUpstream429BreakerHints = rawHints;
    } else {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    }
    const out = {
        baseCooldownMs: toInteger(record.baseCooldownMs, fallback.baseCooldownMs, {
            min: 0,
            max: 24 * 60 * 60 * 1000
        }),
        useUpstreamRetryHints: toBoolean(record.useUpstreamRetryHints, fallback.useUpstreamRetryHints),
        maxBackoffSteps: toInteger(record.maxBackoffSteps, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
    // Only attach the key when defined — preserves omission across round-trips.
    if (useUpstream429BreakerHints !== undefined) {
        out.useUpstream429BreakerHints = useUpstream429BreakerHints;
    }
    return out;
}
function normalizeLegacyConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    const transientCooldown = toInteger(record.transientCooldown, fallback.baseCooldownMs, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const legacyRateLimitCooldown = toInteger(record.rateLimitCooldown, transientCooldown, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const useUpstreamRetryHints = typeof record.rateLimitCooldown === "number" ? record.rateLimitCooldown === 0 : fallback.useUpstreamRetryHints;
    return {
        baseCooldownMs: useUpstreamRetryHints ? transientCooldown : Math.max(transientCooldown, legacyRateLimitCooldown),
        useUpstreamRetryHints,
        maxBackoffSteps: toInteger(record.maxBackoffLevel, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
}
function normalizeProviderBreakerProfile(next, fallback) {
    const record = asRecord(next);
    const failureThreshold = toInteger(record.failureThreshold, fallback.failureThreshold, {
        min: 1,
        max: 1000
    });
    const degradationThreshold = Math.min(toInteger(record.degradationThreshold, fallback.degradationThreshold, {
        min: 1,
        max: 1000
    }), failureThreshold <= 1 ? 1 : failureThreshold - 1);
    return {
        failureThreshold,
        degradationThreshold,
        resetTimeoutMs: toInteger(record.resetTimeoutMs, fallback.resetTimeoutMs, {
            min: 1000,
            max: 24 * 60 * 60 * 1000
        })
    };
}
function normalizeProviderWindowDefaults(next, fallback) {
    // Accept either an explicit object or fall back. Drop providers/windows
    // whose values are not a valid 0-100 integer so a malformed setting can't
    // accidentally disable cutoffs entirely.
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, windows] of Object.entries(rawProviders)){
        if (!provider || typeof windows !== "object" || windows === null) continue;
        const windowMap = {};
        for (const [windowName, percent] of Object.entries(windows)){
            if (!windowName) continue;
            const parsed = typeof percent === "number" ? percent : typeof percent === "string" && percent.trim() !== "" ? Number(percent) : NaN;
            if (Number.isFinite(parsed)) {
                const clamped = Math.min(100, Math.max(0, Math.trunc(parsed)));
                windowMap[windowName] = clamped;
            }
        }
        if (Object.keys(windowMap).length > 0) {
            out[provider] = windowMap;
        }
    }
    return out;
}
function normalizeQuotaPreflightSettings(next, fallback) {
    const record = asRecord(next);
    // Remaining-% semantics: cutoff is the lowest acceptable remaining %, warn
    // is the higher "you're getting close" remaining %. So warn MUST be greater
    // than cutoff — otherwise the warn log would only fire after the request
    // is already blocked.
    const defaultThresholdPercent = toInteger(record.defaultThresholdPercent, fallback.defaultThresholdPercent, {
        min: 0,
        max: 99
    });
    const warnRaw = toInteger(record.warnThresholdPercent, fallback.warnThresholdPercent, {
        min: 0,
        max: 100
    });
    const warnThresholdPercent = warnRaw <= defaultThresholdPercent ? Math.min(100, defaultThresholdPercent + 1) : warnRaw;
    const providerWindowDefaults = normalizeProviderWindowDefaults(record.providerWindowDefaults, fallback.providerWindowDefaults);
    const enabled = typeof record.enabled === "boolean" ? record.enabled : fallback.enabled;
    return {
        enabled,
        defaultThresholdPercent,
        warnThresholdPercent,
        providerWindowDefaults
    };
}
function normalizeWaitForCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const maxRetryWaitSec = toInteger(record.maxRetryWaitSec, fallback.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const maxRetries = toInteger(record.maxRetries, fallback.maxRetries, {
        min: 0,
        max: 10
    });
    const maxRetryWaitMs = maxRetryWaitSec * 1000;
    // Cumulative cap across all waits for one request (#7360 follow-up) — mirrors
    // comboCooldownWait.budgetMs. Floored at maxRetryWaitMs so at least one wait
    // can always fire; ceiling matches the same 5-minute give-up point.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxRetryWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxRetries > 0 && maxRetryWaitSec > 0;
    return {
        enabled,
        maxRetries,
        maxRetryWaitSec,
        maxRetryWaitMs,
        budgetMs
    };
}
function normalizeComboCooldownWaitSettings(next, fallback) {
    const record = asRecord(next);
    // Hard ceiling of 5 minutes on a single wait (#7360 follow-up — raised from
    // 90s now that streaming clients get an immediate synthetic keep-alive
    // event via withEarlyStreamKeepalive, so a long wait no longer risks a
    // client-side first-byte timeout). This layer exists for transient cooldowns
    // (including Gemini-class TPM/RPM windows, which report ~60s retry-after
    // live); anything the upstream itself reports as longer than this should
    // fall through to the existing 429 crystallization (and the cross-request
    // cooldown layers).
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 0,
        max: 300000
    });
    const maxAttempts = toInteger(record.maxAttempts, fallback.maxAttempts, {
        min: 0,
        max: 10
    });
    // Budget can never be smaller than a single wait, otherwise no wait could
    // ever fire; floor it at maxWaitMs.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxWaitMs > 0 && maxAttempts > 0;
    return {
        enabled,
        maxWaitMs,
        maxAttempts,
        budgetMs
    };
}
function normalizeQuotaShareConcurrencyLimitSettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled)
    };
}
function normalizeProviderCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const enabled = toBoolean(record.enabled, fallback.enabled);
    const minRetryCooldownMs = toInteger(record.minRetryCooldownMs, fallback.minRetryCooldownMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const maxRetryCooldownMs = toInteger(record.maxRetryCooldownMs, fallback.maxRetryCooldownMs, {
        min: minRetryCooldownMs,
        max: 24 * 60 * 60 * 1000
    });
    return {
        enabled,
        minRetryCooldownMs,
        maxRetryCooldownMs
    };
}
function normalizeStreamRecoverySettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled),
        continueMidStream: toBoolean(record.continueMidStream, fallback.continueMidStream)
    };
}
// #6846 Phase 1: parse a single provider's { rpm?, concurrency? } override entry,
// dropping non-positive/non-finite fields so a malformed value falls back to that
// provider's static default rather than disabling its budget outright (0 would
// mean "no cap" for rpm, mirroring the resolveRpm/resolveMaxConcurrent convention
// elsewhere in this file).
function normalizeProviderQuotaOverrideEntry(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const record = raw;
    const out = {};
    const rpm = typeof record.rpm === "number" ? record.rpm : Number(record.rpm);
    if (Number.isFinite(rpm) && rpm > 0) out.rpm = Math.trunc(rpm);
    const concurrency = typeof record.concurrency === "number" ? record.concurrency : Number(record.concurrency);
    if (Number.isFinite(concurrency) && concurrency > 0) out.concurrency = Math.trunc(concurrency);
    return Object.keys(out).length > 0 ? out : null;
}
function normalizeProviderQuotaOverrides(next, fallback) {
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, entry] of Object.entries(rawProviders)){
        if (!provider) continue;
        const normalized = normalizeProviderQuotaOverrideEntry(entry);
        if (normalized) out[provider] = normalized;
    }
    return out;
}
}),
"[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_QUEUE_MAX_DEPTH",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_DEPTH,
    "DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
    "DEFAULT_RESILIENCE_SETTINGS",
    ()=>DEFAULT_RESILIENCE_SETTINGS,
    "buildLegacyResilienceCompat",
    ()=>buildLegacyResilienceCompat,
    "isStreamRecoveryExplicitlyConfigured",
    ()=>isStreamRecoveryExplicitlyConfigured,
    "mergeResilienceSettings",
    ()=>mergeResilienceSettings,
    "resolveResilienceSettings",
    ()=>resolveResilienceSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)");
;
;
const DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_WAIT_MS || "15000");
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 15000;
})();
const DEFAULT_REQUEST_QUEUE_MAX_DEPTH = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_QUEUE_DEPTH || "0");
    return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
})();
const DEFAULT_RESILIENCE_SETTINGS = {
    requestQueue: {
        autoEnableApiKeyProviders: true,
        requestsPerMinute: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].requestsPerMinute,
        minTimeBetweenRequestsMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].minTimeBetweenRequests,
        concurrentRequests: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].concurrentRequests,
        maxWaitMs: DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
        maxQueueDepth: DEFAULT_REQUEST_QUEUE_MAX_DEPTH
    },
    connectionCooldown: {
        oauth: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.maxBackoffLevel
        },
        apikey: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.maxBackoffLevel
        }
    },
    providerBreaker: {
        oauth: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerReset
        },
        apikey: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerReset
        }
    },
    // Wait at most 90s for a single connection cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live), at most 5 retry
    // cycles, never more than 300s (5 min) total (#7360 follow-up — raised now
    // that withEarlyStreamKeepalive gives streaming clients an immediate
    // synthetic keep-alive, eliminating the client-side first-byte-timeout risk
    // a long wait used to carry). Applies to direct (non-combo) model requests.
    waitForCooldown: {
        enabled: true,
        maxRetries: 5,
        maxRetryWaitSec: 90,
        maxRetryWaitMs: 90000,
        budgetMs: 300000
    },
    // Wait at most 90s for a single short transient cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live — #7360), at most 5
    // redispatch cycles, never more than 300s (5 min) total. Active for every
    // combo strategy when enabled, and only for transient (non quota_exhausted)
    // reasons.
    comboCooldownWait: {
        enabled: true,
        maxWaitMs: 90000,
        maxAttempts: 5,
        budgetMs: 300000
    },
    // FASE 2.1: serialize concurrent quota-share requests per connection when the
    // connection sets a max_concurrent cap, so a subscription account is not
    // flooded past its concurrency ceiling. Kill-switch only (default on); the cap
    // comes from each connection's max_concurrent.
    quotaShareConcurrencyLimit: {
        enabled: true
    },
    providerCooldown: {
        minRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MIN_MS || "5000"),
        maxRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MAX_MS || "300000"),
        // Opt-in (default OFF): this global cross-request cooldown overlaps the
        // existing Connection Cooldown / Provider Circuit Breaker layers, so it is
        // disabled by default and must be explicitly enabled by the operator until
        // its interaction with those layers is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.PROVIDER_COOLDOWN_ENABLED || "").trim().toLowerCase())
    },
    quotaPreflight: {
        // Opt-in (default OFF): the auto-routing hard cutoff drops low-quota candidates
        // before scoring, overlapping the existing soft quota penalty + connection
        // cooldown, so it must be explicitly enabled by the operator until its
        // interaction with the scorer is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.QUOTA_PREFLIGHT_CUTOFF_ENABLED || "").trim().toLowerCase()),
        // Remaining-% semantics. 2 = "stop when only 2% remaining" (= 98% used).
        // Uniform across all providers and windows; operators set per-window
        // overrides per connection via the Cutoff modal in Dashboard › Limits,
        // or per-(provider, window) globally via the providerWindowDefaults map
        // below (no factory seeds — keep behavior consistent across providers).
        defaultThresholdPercent: 2,
        warnThresholdPercent: 20,
        providerWindowDefaults: {}
    },
    streamRecovery: {
        // Opt-in (default OFF): the holdback that powers transparent early-retry adds
        // up to STREAM_RECOVERY.HOLDBACK_MS of time-to-first-token latency on every
        // streaming request, so it must be explicitly enabled by the operator.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_ENABLED || "").trim().toLowerCase()),
        // Opt-in (default OFF): mid-stream continuation re-requests after a post-commit cut.
        continueMidStream: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_MIDSTREAM_ENABLED || "").trim().toLowerCase())
    },
    // #6846 Phase 1: empty by default — nvidia (and any future header-less
    // provider registered in providerDefaultRateLimit.ts) uses its static
    // default until an operator adds an override here.
    providerQuotaOverrides: {}
};
function buildLegacyFallback(settings) {
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.providerProfiles);
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.rateLimitDefaults);
    const streamRecoveryDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveStreamRecoveryDefaults"])();
    const oauthLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.oauth);
    const apikeyLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.apikey);
    const waitMaxRetrySec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.maxRetryIntervalSec, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const waitMaxRetries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.requestRetry, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetries, {
        min: 0,
        max: 10
    });
    return {
        requestQueue: {
            autoEnableApiKeyProviders: DEFAULT_RESILIENCE_SETTINGS.requestQueue.autoEnableApiKeyProviders,
            requestsPerMinute: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.requestsPerMinute, DEFAULT_RESILIENCE_SETTINGS.requestQueue.requestsPerMinute, {
                min: 1,
                max: 1_000_000
            }),
            minTimeBetweenRequestsMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.minTimeBetweenRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.minTimeBetweenRequestsMs, {
                min: 0,
                max: 60 * 60 * 1000
            }),
            concurrentRequests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.concurrentRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.concurrentRequests, {
                min: 1,
                max: 10_000
            }),
            maxWaitMs: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxWaitMs,
            maxQueueDepth: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxQueueDepth
        },
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(oauthLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(apikeyLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            },
            apikey: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            }
        },
        waitForCooldown: {
            enabled: waitMaxRetries > 0 && waitMaxRetrySec > 0,
            maxRetries: waitMaxRetries,
            maxRetryWaitSec: waitMaxRetrySec,
            maxRetryWaitMs: waitMaxRetrySec * 1000,
            budgetMs: Math.max(waitMaxRetrySec * 1000, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.budgetMs)
        },
        comboCooldownWait: DEFAULT_RESILIENCE_SETTINGS.comboCooldownWait,
        quotaShareConcurrencyLimit: DEFAULT_RESILIENCE_SETTINGS.quotaShareConcurrencyLimit,
        providerCooldown: DEFAULT_RESILIENCE_SETTINGS.providerCooldown,
        quotaPreflight: DEFAULT_RESILIENCE_SETTINGS.quotaPreflight,
        streamRecovery: streamRecoveryDefaults,
        providerQuotaOverrides: DEFAULT_RESILIENCE_SETTINGS.providerQuotaOverrides
    };
}
function isStreamRecoveryExplicitlyConfigured(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const streamRecoveryRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.streamRecovery);
    if (typeof streamRecoveryRecord.enabled === "boolean") {
        return true;
    }
    return (process.env.STREAM_RECOVERY_ENABLED || "").trim().length > 0;
}
function resolveResilienceSettings(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const fallback = buildLegacyFallback(record);
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(current.requestQueue, fallback.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).oauth, fallback.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).apikey, fallback.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).oauth, fallback.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).apikey, fallback.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(current.waitForCooldown, fallback.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(current.comboCooldownWait, fallback.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(current.quotaShareConcurrencyLimit, fallback.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(current.providerCooldown, fallback.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(current.quotaPreflight, fallback.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(current.streamRecovery, fallback.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(current.providerQuotaOverrides, fallback.providerQuotaOverrides)
    };
}
function mergeResilienceSettings(current, updates) {
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(updates.requestQueue, current.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.oauth, current.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.apikey, current.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.oauth, current.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.apikey, current.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(updates.waitForCooldown, current.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(updates.comboCooldownWait, current.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(updates.quotaShareConcurrencyLimit, current.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(updates.providerCooldown, current.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(updates.quotaPreflight, current.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(updates.streamRecovery, current.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(updates.providerQuotaOverrides, current.providerQuotaOverrides)
    };
}
function buildLegacyResilienceCompat(settings) {
    return {
        profiles: {
            oauth: {
                transientCooldown: settings.connectionCooldown.oauth.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.oauth.useUpstreamRetryHints ? 0 : settings.connectionCooldown.oauth.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.oauth.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.oauth.failureThreshold,
                degradationThreshold: settings.providerBreaker.oauth.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.oauth.resetTimeoutMs
            },
            apikey: {
                transientCooldown: settings.connectionCooldown.apikey.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.apikey.useUpstreamRetryHints ? 0 : settings.connectionCooldown.apikey.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.apikey.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.apikey.failureThreshold,
                degradationThreshold: settings.providerBreaker.apikey.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.apikey.resetTimeoutMs
            }
        },
        defaults: {
            requestsPerMinute: settings.requestQueue.requestsPerMinute,
            minTimeBetweenRequests: settings.requestQueue.minTimeBetweenRequestsMs,
            concurrentRequests: settings.requestQueue.concurrentRequests
        }
    };
}
}),
"[project]/src/lib/resilience/modelLockoutSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MODEL_LOCKOUT_SETTINGS",
    ()=>DEFAULT_MODEL_LOCKOUT_SETTINGS,
    "resolveModelLockoutSettings",
    ()=>resolveModelLockoutSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
;
const DEFAULT_MODEL_LOCKOUT_SETTINGS = {
    enabled: false,
    errorCodes: [
        403,
        404,
        429,
        502,
        503,
        504
    ],
    baseCooldownMs: 120_000,
    maxCooldownMs: 1_800_000,
    maxBackoffSteps: 10,
    useExponentialBackoff: true
};
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.trunc(parsed))) : fallback;
}
function toBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value === "true" || value === "1";
    return fallback;
}
function toNumberArray(value, fallback) {
    if (Array.isArray(value)) {
        const nums = value.map((v)=>typeof v === "number" ? v : Number(v)).filter((n)=>Number.isFinite(n) && n >= 100 && n <= 599);
        return nums.length > 0 ? nums : fallback;
    }
    return fallback;
}
function resolveModelLockoutSettings(settings) {
    const record = asRecord(settings);
    const raw = asRecord(record.modelLockout);
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
    const baseCooldownMs = toInteger(raw.baseCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.baseCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 600_000
    });
    const maxCooldownMs = Math.max(toInteger(raw.maxCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 3_600_000
    }), baseCooldownMs // cap must be >= base or exponential backoff is meaningless
    );
    return {
        enabled: toBoolean(raw.enabled, DEFAULT_MODEL_LOCKOUT_SETTINGS.enabled),
        errorCodes: toNumberArray(raw.errorCodes, DEFAULT_MODEL_LOCKOUT_SETTINGS.errorCodes),
        baseCooldownMs,
        maxCooldownMs,
        maxBackoffSteps: toInteger(raw.maxBackoffSteps, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxBackoffSteps, {
            min: 0,
            max: 20
        }),
        useExponentialBackoff: toBoolean(raw.useExponentialBackoff, DEFAULT_MODEL_LOCKOUT_SETTINGS.useExponentialBackoff)
    };
}
}),
"[project]/src/lib/config/runtimeSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyRuntimeSettings",
    ()=>applyRuntimeSettings,
    "buildRuntimeSettingsSnapshot",
    ()=>buildRuntimeSettingsSnapshot,
    "getAuthzBypassSnapshot",
    ()=>getAuthzBypassSnapshot,
    "resetRuntimeSettingsStateForTests",
    ()=>resetRuntimeSettingsStateForTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheck.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Default bypass policy: kill-switch on, `/api/mcp/` bypassable. Mirrors the
// pre-T-011 compile-time constant so the route guard works identically before
// the first `applyRuntimeSettings` call (e.g. cold-boot requests).
const DEFAULT_AUTHZ_BYPASS_SNAPSHOT = {
    enabled: true,
    prefixes: [
        "/api/mcp/"
    ]
};
const DEFAULT_RUNTIME_SETTINGS_SNAPSHOT = {
    payloadRules: null,
    modelAliases: {},
    backgroundDegradation: null,
    cliCompatProviders: [],
    alwaysPreserveClientCache: "auto",
    antigravitySignatureCacheMode: "enabled",
    usageTokenBuffer: null,
    hideHealthCheckLogs: false,
    modelsDevSyncEnabled: false,
    modelsDevSyncInterval: null,
    corsOrigins: "",
    ccBridgeTransforms: null,
    systemTransforms: null,
    authzBypass: DEFAULT_AUTHZ_BYPASS_SNAPSHOT,
    customBannedSignals: []
};
let lastAppliedSnapshot = null;
// Module-local mirror of the current bypass policy. Read by the route guard
// on every non-loopback hit to a LOCAL_ONLY path via `getAuthzBypassSnapshot`.
// Initialised to the default so cold-boot requests (before any
// `applyRuntimeSettings` call) behave identically to PR #2473.
let currentAuthzBypass = DEFAULT_AUTHZ_BYPASS_SNAPSHOT;
function isTruthyEnvFlag(value) {
    if (typeof value !== "string") return false;
    return new Set([
        "1",
        "true",
        "yes",
        "on"
    ]).has(value.trim().toLowerCase());
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function stableSerialize(value) {
    return JSON.stringify(canonicalize(value));
}
function canonicalize(value) {
    if (Array.isArray(value)) {
        return value.map((entry)=>canonicalize(entry));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort((left, right)=>left.localeCompare(right)).map((key)=>[
                key,
                canonicalize(value[key])
            ]));
    }
    return value;
}
function parseStoredJson(value, field) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[HOT_RELOAD] Failed to parse persisted settings field "${field}":`, error instanceof Error ? error.message : error);
        return null;
    }
}
function normalizeStringArray(value) {
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.map((entry)=>typeof entry === "string" ? entry.trim() : "").filter((entry)=>entry.length > 0)));
}
function normalizeStringRecord(value) {
    const record = toRecord(parseStoredJson(value, "modelAliases"));
    const entries = Object.entries(record).map(([key, entryValue])=>[
            key.trim(),
            typeof entryValue === "string" ? entryValue.trim() : ""
        ]).filter(([key, entryValue])=>key.length > 0 && entryValue.length > 0);
    return Object.fromEntries(entries);
}
function normalizeBackgroundDegradation(value) {
    const record = toRecord(parseStoredJson(value, "backgroundDegradation"));
    if (Object.keys(record).length === 0) return null;
    const degradationMap = Object.fromEntries(Object.entries(toRecord(record.degradationMap)).map(([key, entryValue])=>[
            key.trim(),
            typeof entryValue === "string" ? entryValue.trim() : ""
        ]).filter(([key, entryValue])=>key.length > 0 && entryValue.length > 0));
    const detectionPatterns = normalizeStringArray(record.detectionPatterns);
    return {
        enabled: record.enabled === true,
        degradationMap,
        detectionPatterns
    };
}
function normalizeNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function normalizePayloadRules(value) {
    return parseStoredJson(value, "payloadRules");
}
function normalizeAuthzBypass(settings) {
    const enabled = settings.localOnlyManageScopeBypassEnabled === false ? false : settings.localOnlyManageScopeBypassEnabled === true ? true : DEFAULT_AUTHZ_BYPASS_SNAPSHOT.enabled;
    const rawPrefixes = settings.localOnlyManageScopeBypassPrefixes;
    const prefixes = Array.isArray(rawPrefixes) ? Array.from(new Set(rawPrefixes.map((entry)=>typeof entry === "string" ? entry.trim() : "").filter((entry)=>entry.length > 0 && entry.startsWith("/")))) : [
        ...DEFAULT_AUTHZ_BYPASS_SNAPSHOT.prefixes
    ];
    return {
        enabled,
        prefixes
    };
}
function getAuthzBypassSnapshot() {
    return currentAuthzBypass;
}
function buildRuntimeSettingsSnapshot(settings) {
    return {
        payloadRules: normalizePayloadRules(settings.payloadRules),
        modelAliases: normalizeStringRecord(settings.modelAliases),
        backgroundDegradation: normalizeBackgroundDegradation(settings.backgroundDegradation),
        cliCompatProviders: normalizeStringArray(settings.cliCompatProviders),
        alwaysPreserveClientCache: typeof settings.alwaysPreserveClientCache === "string" ? settings.alwaysPreserveClientCache : DEFAULT_RUNTIME_SETTINGS_SNAPSHOT.alwaysPreserveClientCache,
        antigravitySignatureCacheMode: typeof settings.antigravitySignatureCacheMode === "string" ? settings.antigravitySignatureCacheMode : DEFAULT_RUNTIME_SETTINGS_SNAPSHOT.antigravitySignatureCacheMode,
        usageTokenBuffer: settings.usageTokenBuffer ?? null,
        hideHealthCheckLogs: settings.hideHealthCheckLogs === true,
        modelsDevSyncEnabled: settings.modelsDevSyncEnabled === true,
        modelsDevSyncInterval: normalizeNumber(settings.modelsDevSyncInterval),
        corsOrigins: typeof settings.corsOrigins === "string" ? settings.corsOrigins : "",
        ccBridgeTransforms: parseStoredJson(settings.ccBridgeTransforms, "ccBridgeTransforms"),
        systemTransforms: parseStoredJson(settings.systemTransforms, "systemTransforms"),
        authzBypass: normalizeAuthzBypass(settings),
        customBannedSignals: normalizeStringArray(settings.customBannedSignals)
    };
}
function getPreviousSnapshot() {
    return lastAppliedSnapshot || DEFAULT_RUNTIME_SETTINGS_SNAPSHOT;
}
async function applyPayloadRulesSection(payloadRules) {
    const { clearPayloadRulesConfigOverride, setPayloadRulesConfig } = await __turbopack_context__.A("[project]/open-sse/services/payloadRules.ts [app-route] (ecmascript, async loader)");
    if (payloadRules === null || payloadRules === undefined) {
        clearPayloadRulesConfigOverride();
        return;
    }
    setPayloadRulesConfig(payloadRules);
}
async function applyModelAliasesSection(modelAliases) {
    const { setCustomAliases } = await __turbopack_context__.A("[project]/open-sse/services/modelDeprecation.ts [app-route] (ecmascript, async loader)");
    setCustomAliases(modelAliases);
}
async function applyBackgroundDegradationSection(backgroundDegradation) {
    const { getDefaultDegradationMap, getDefaultDetectionPatterns, setBackgroundDegradationConfig } = await __turbopack_context__.A("[project]/open-sse/services/backgroundTaskDetector.ts [app-route] (ecmascript, async loader)");
    if (!backgroundDegradation) {
        setBackgroundDegradationConfig({
            enabled: false,
            degradationMap: getDefaultDegradationMap(),
            detectionPatterns: getDefaultDetectionPatterns()
        });
        return;
    }
    setBackgroundDegradationConfig({
        enabled: backgroundDegradation.enabled === true,
        degradationMap: {
            ...getDefaultDegradationMap(),
            ...normalizeStringRecord(backgroundDegradation.degradationMap)
        },
        detectionPatterns: normalizeStringArray(backgroundDegradation.detectionPatterns).length > 0 ? normalizeStringArray(backgroundDegradation.detectionPatterns) : getDefaultDetectionPatterns()
    });
}
async function applyCliCompatProvidersSection(cliCompatProviders) {
    const { setCliCompatProviders } = await __turbopack_context__.A("[project]/open-sse/config/cliFingerprints.ts [app-route] (ecmascript, async loader)");
    setCliCompatProviders(cliCompatProviders);
}
async function applyCacheControlSection() {
    const { invalidateCacheControlSettingsCache } = await __turbopack_context__.A("[project]/src/lib/cacheControlSettings.ts [app-route] (ecmascript, async loader)");
    invalidateCacheControlSettingsCache();
}
async function applyUsageTrackingSection(newBuffer) {
    const { invalidateBufferTokensCache, setBufferTokensCache } = await __turbopack_context__.A("[project]/open-sse/utils/usageTracking.ts [app-route] (ecmascript, async loader)");
    if (typeof newBuffer === "number" && newBuffer >= 0) {
        // Set the value directly so the first request after a settings save gets the
        // correct count synchronously — no race window back to DEFAULT (2000).
        setBufferTokensCache(newBuffer);
    } else {
        invalidateBufferTokensCache();
    }
}
async function applyThoughtSignatureSection(mode) {
    const { setGeminiThoughtSignatureMode } = await __turbopack_context__.A("[project]/open-sse/services/geminiThoughtSignatureStore.ts [app-route] (ecmascript, async loader)");
    setGeminiThoughtSignatureMode(mode);
}
async function applyCorsOriginsSection(corsOrigins) {
    const { setRuntimeAllowedOrigins } = await __turbopack_context__.A("[project]/src/server/cors/origins.ts [app-route] (ecmascript, async loader)");
    setRuntimeAllowedOrigins(corsOrigins);
}
/**
 * Legacy alias for the v2 systemTransforms config. The `ccBridgeTransforms`
 * settings field carried the single-provider shape `{ enabled, pipeline }`
 * during Phase 2 (commit e3e962db, pre-release). v2 unifies everything under
 * `systemTransforms.providers[*]`. We migrate the legacy shape into the v2
 * registry on every reload so users with persisted Phase-2 data keep working.
 *
 * `setSystemTransformsConfig` accepts both shapes and routes legacy into
 * `providers[PROVIDER_CC_BRIDGE]`.
 */ async function applyCcBridgeTransformsSection(ccBridgeTransforms) {
    const { setSystemTransformsConfig } = await __turbopack_context__.A("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript, async loader)");
    if (ccBridgeTransforms && typeof ccBridgeTransforms === "object") {
        setSystemTransformsConfig(ccBridgeTransforms);
    }
}
/**
 * Swap the in-process bypass policy. Synchronous, O(1), no I/O — the SLA
 * (<50 ms hot-reload) is structurally satisfied by this shape.
 */ function applyAuthzBypassSection(snapshot) {
    currentAuthzBypass = {
        enabled: snapshot.enabled,
        prefixes: [
            ...snapshot.prefixes
        ]
    };
}
async function applySystemTransformsSection(systemTransforms) {
    const { setSystemTransformsConfig, resetSystemTransformsConfig } = await __turbopack_context__.A("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript, async loader)");
    if (systemTransforms === null || systemTransforms === undefined || typeof systemTransforms !== "object") {
        resetSystemTransformsConfig();
        return;
    }
    setSystemTransformsConfig(systemTransforms);
}
async function applyModelsDevSyncSection(previousSnapshot, currentSnapshot, force) {
    const { startPeriodicSync, stopPeriodicSync } = await __turbopack_context__.A("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript, async loader)");
    const skipBackgroundSyncInTests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])() && process.env.OMNIROUTE_ENABLE_RUNTIME_BACKGROUND_TASKS !== "1" || isTruthyEnvFlag(process.env.OMNIROUTE_DISABLE_BACKGROUND_SERVICES);
    if (skipBackgroundSyncInTests) {
        stopPeriodicSync();
        return;
    }
    const wasEnabled = previousSnapshot.modelsDevSyncEnabled === true;
    const isEnabled = currentSnapshot.modelsDevSyncEnabled === true;
    const intervalChanged = previousSnapshot.modelsDevSyncInterval !== currentSnapshot.modelsDevSyncInterval;
    if (!isEnabled) {
        if (wasEnabled || force) {
            stopPeriodicSync();
        }
        return;
    }
    if (force) {
        stopPeriodicSync();
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
        return;
    }
    if (!wasEnabled) {
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
        return;
    }
    if (intervalChanged) {
        stopPeriodicSync();
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
    }
}
async function applyRuntimeSettings(settings, options = {}) {
    const source = options.source || "runtime";
    const force = options.force === true;
    const hasBootstrappedSnapshot = lastAppliedSnapshot !== null;
    const currentSnapshot = buildRuntimeSettingsSnapshot(settings);
    const previousSnapshot = getPreviousSnapshot();
    const changes = [];
    const markChanged = (section)=>{
        changes.push({
            section,
            source
        });
    };
    const hasChanged = (currentValue, previousValue)=>stableSerialize(currentValue) !== stableSerialize(previousValue);
    if (force || hasChanged(currentSnapshot.payloadRules, previousSnapshot.payloadRules)) {
        await applyPayloadRulesSection(currentSnapshot.payloadRules);
        markChanged("payloadRules");
    }
    if (force || hasChanged(currentSnapshot.modelAliases, previousSnapshot.modelAliases)) {
        await applyModelAliasesSection(currentSnapshot.modelAliases);
        markChanged("modelAliases");
    }
    if (force || hasChanged(currentSnapshot.backgroundDegradation, previousSnapshot.backgroundDegradation)) {
        await applyBackgroundDegradationSection(currentSnapshot.backgroundDegradation);
        markChanged("backgroundDegradation");
    }
    if (force || hasChanged(currentSnapshot.cliCompatProviders, previousSnapshot.cliCompatProviders)) {
        await applyCliCompatProvidersSection(currentSnapshot.cliCompatProviders);
        markChanged("cliCompatProviders");
    }
    if (force || hasChanged(currentSnapshot.alwaysPreserveClientCache, previousSnapshot.alwaysPreserveClientCache)) {
        await applyCacheControlSection();
        markChanged("cacheControl");
    }
    if (force || hasChanged(currentSnapshot.usageTokenBuffer, previousSnapshot.usageTokenBuffer)) {
        const newBuffer = typeof currentSnapshot.usageTokenBuffer === "number" ? currentSnapshot.usageTokenBuffer : null;
        await applyUsageTrackingSection(newBuffer);
        markChanged("usageTracking");
    }
    if (force || currentSnapshot.hideHealthCheckLogs !== previousSnapshot.hideHealthCheckLogs) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearHealthCheckLogCache"])();
        markChanged("healthCheckLogs");
    }
    if (force || hasChanged(currentSnapshot.antigravitySignatureCacheMode, previousSnapshot.antigravitySignatureCacheMode)) {
        await applyThoughtSignatureSection(currentSnapshot.antigravitySignatureCacheMode);
        markChanged("thoughtSignature");
    }
    if (force || hasBootstrappedSnapshot && (currentSnapshot.modelsDevSyncEnabled !== previousSnapshot.modelsDevSyncEnabled || currentSnapshot.modelsDevSyncInterval !== previousSnapshot.modelsDevSyncInterval)) {
        await applyModelsDevSyncSection(previousSnapshot, currentSnapshot, force);
        markChanged("modelsDevSync");
    }
    if (force || hasChanged(currentSnapshot.corsOrigins, previousSnapshot.corsOrigins)) {
        await applyCorsOriginsSection(currentSnapshot.corsOrigins);
        markChanged("corsOrigins");
    }
    if (force || hasChanged(currentSnapshot.ccBridgeTransforms, previousSnapshot.ccBridgeTransforms)) {
        await applyCcBridgeTransformsSection(currentSnapshot.ccBridgeTransforms);
        markChanged("ccBridgeTransforms");
    }
    if (force || hasChanged(currentSnapshot.systemTransforms, previousSnapshot.systemTransforms)) {
        await applySystemTransformsSection(currentSnapshot.systemTransforms);
        markChanged("systemTransforms");
    }
    if (force || hasChanged(currentSnapshot.authzBypass, previousSnapshot.authzBypass)) {
        applyAuthzBypassSection(currentSnapshot.authzBypass);
        markChanged("authzBypass");
    }
    if (force || hasChanged(currentSnapshot.customBannedSignals, previousSnapshot.customBannedSignals)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setCustomBannedSignals"])(currentSnapshot.customBannedSignals);
        markChanged("bannedSignals");
    }
    lastAppliedSnapshot = currentSnapshot;
    return changes;
}
function resetRuntimeSettingsStateForTests() {
    lastAppliedSnapshot = null;
    currentAuthzBypass = DEFAULT_AUTHZ_BYPASS_SNAPSHOT;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_1w7lml_._.js.map